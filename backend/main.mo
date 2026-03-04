import Array "mo:core/Array";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Map "mo:core/Map";
import Option "mo:core/Option";
import Order "mo:core/Order";
import Int "mo:core/Int";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";

actor {
  include MixinStorage();

  type Draft = {
    title : Text;
    body : Text;
  };

  type PublishedLetter = {
    author : Principal;
    title : Text;
    body : Text;
    visibility : { #publicVisibility; #privateVisibility };
    timestamp : Int;
  };

  type LetterData = {
    title : Text;
    body : Text;
    visibility : { #publicVisibility; #privateVisibility };
  };

  type UserProfile = {
    name : Text;
  };

  // State
  let drafts = Map.empty<Principal, Draft>();
  let publishedLetters = Map.empty<Principal, PublishedLetter>();
  let partnerPairs = Map.empty<Principal, Principal>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  // Initialize the user system state
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User profile management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Helper function to get partner
  private func getPartnerInternal(user : Principal) : ?Principal {
    partnerPairs.get(user);
  };

  // Partner pairing
  public shared ({ caller }) func setPartner(partner : Principal) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can set a partner");
    };

    // Validate partner is not the caller
    if (caller == partner) {
      Runtime.trap("Cannot set yourself as partner");
    };

    // Validate partner is a registered user
    if (not AccessControl.hasPermission(accessControlState, partner, #user)) {
      Runtime.trap("Partner must be a registered user");
    };

    // Remove existing partner if present
    if (partnerPairs.containsKey(caller)) {
      partnerPairs.remove(caller);
    };

    // Add new pair
    partnerPairs.add(caller, partner);
  };

  public query ({ caller }) func getPartner() : async ?Principal {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can get a partner");
    };
    getPartnerInternal(caller);
  };

  // Letter operations - no authentication required for public letter functionality
  // Any visitor (authenticated or unauthenticated) can save drafts, get drafts,
  // publish letters, and update their own published letters for the public letters flow.

  public shared ({ caller }) func saveDraft(title : Text, body : Text) : async () {
    // No auth check: any visitor including guests can save a draft for public letters
    let draft : Draft = {
      title;
      body;
    };
    drafts.add(caller, draft);
  };

  public query ({ caller }) func getDraft() : async ?Draft {
    // No auth check: any visitor including guests can retrieve their draft
    drafts.get(caller);
  };

  public shared ({ caller }) func publishLetter(data : LetterData, _timestamp : Int) : async () {
    // No auth check: any visitor including guests can publish a public letter
    let letter : PublishedLetter = {
      author = caller;
      title = data.title;
      body = data.body;
      visibility = data.visibility;
      timestamp = 0;
    };
    publishedLetters.add(caller, letter);
    drafts.remove(caller);
  };

  public shared ({ caller }) func updatePublishedLetter(data : LetterData) : async () {
    // No auth check beyond ownership: any visitor can update their own published letter
    // Verify the letter exists and caller is the author
    let oldLetter = switch (publishedLetters.get(caller)) {
      case (?letter) { letter };
      case (null) { Runtime.trap("Letter not found") };
    };

    if (oldLetter.author != caller) {
      Runtime.trap("Unauthorized: Can only update your own letters");
    };

    let updatedLetter : PublishedLetter = {
      oldLetter with title = data.title; body = data.body; visibility = data.visibility
    };
    publishedLetters.add(caller, updatedLetter);
  };

  public query ({ caller }) func getPublishedLetter(author : Principal) : async ?PublishedLetter {
    let letter = switch (publishedLetters.get(author)) {
      case (?l) { l };
      case (null) { return null };
    };

    // Public letters are visible to everyone (no auth required)
    if (letter.visibility == #publicVisibility) {
      return ?letter;
    };

    // Private letters are only visible to:
    // 1. The author themselves
    // 2. The author's partner
    // 3. Admins
    if (caller == author) {
      return ?letter;
    };

    if (AccessControl.isAdmin(accessControlState, caller)) {
      return ?letter;
    };

    // Check if caller is the author's partner
    let authorPartner = getPartnerInternal(author);
    switch (authorPartner) {
      case (?partner) {
        if (caller == partner) {
          return ?letter;
        };
      };
      case (null) {};
    };

    // Private letter and caller is not authorized
    null;
  };

  public query ({ caller }) func getPublicFeed() : async [PublishedLetter] {
    // No auth check: public feed is visible to everyone including guests
    let publicLetters = publishedLetters.values().toArray().filter(func(letter) { letter.visibility == #publicVisibility });
    publicLetters.sort(func(l1, l2) { Int.compare(l2.timestamp, l1.timestamp) });
  };

  public query ({ caller }) func getRelationshipLetters() : async [PublishedLetter] {
    // Relationship letters are private and require authenticated user access
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can get relationship letters");
    };

    let partner = switch (getPartnerInternal(caller)) {
      case (?p) { p };
      case (null) {
        // No partner set, return only caller's own letters
        let callerLetter = switch (publishedLetters.get(caller)) {
          case (?letter) { [letter] };
          case (null) { [] };
        };
        return callerLetter;
      };
    };

    let relationshipLetters = publishedLetters.values().toArray().filter(
      func(letter) { letter.author == partner or letter.author == caller }
    );
    relationshipLetters.sort(func(l1, l2) { Int.compare(l2.timestamp, l1.timestamp) });
  };
};
