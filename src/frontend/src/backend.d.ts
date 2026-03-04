import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface PublishedLetter {
    title: string;
    body: string;
    author: Principal;
    timestamp: bigint;
    visibility: Variant_privateVisibility_publicVisibility;
}
export interface LetterData {
    title: string;
    body: string;
    visibility: Variant_privateVisibility_publicVisibility;
}
export interface Draft {
    title: string;
    body: string;
}
export interface UserProfile {
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum Variant_privateVisibility_publicVisibility {
    privateVisibility = "privateVisibility",
    publicVisibility = "publicVisibility"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getDraft(): Promise<Draft | null>;
    getPartner(): Promise<Principal | null>;
    getPublicFeed(): Promise<Array<PublishedLetter>>;
    getPublishedLetter(author: Principal): Promise<PublishedLetter | null>;
    getRelationshipLetters(): Promise<Array<PublishedLetter>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    publishLetter(data: LetterData, _timestamp: bigint): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    saveDraft(title: string, body: string): Promise<void>;
    setPartner(partner: Principal): Promise<void>;
    updatePublishedLetter(data: LetterData): Promise<void>;
}
