import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "@tanstack/react-router";
import {
  Eye,
  EyeOff,
  Heart,
  ImagePlus,
  Loader2,
  Save,
  Send,
  X,
} from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Variant_privateVisibility_publicVisibility } from "../backend";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useGetDraft,
  useGetPublishedLetter,
  usePublishLetter,
  useSaveDraft,
  useUpdatePublishedLetter,
} from "../hooks/useQueries";
import { useStorageClient } from "../hooks/useStorageClient";
import { decodeLetterBody, encodeLetterBody } from "../utils/letterImage";

export default function LetterEditorPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const { storageClient } = useStorageClient();

  const { data: draft, isLoading: draftLoading } = useGetDraft();
  const { data: publishedLetter, isLoading: publishedLoading } =
    useGetPublishedLetter();
  const saveDraft = useSaveDraft();
  const publishLetter = usePublishLetter();
  const updatePublished = useUpdatePublishedLetter();

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [visibility, setVisibility] =
    useState<Variant_privateVisibility_publicVisibility>(
      Variant_privateVisibility_publicVisibility.publicVisibility,
    );

  // Image state
  const [imageHash, setImageHash] = useState<string | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEditingPublished = !!publishedLetter;
  const isLoading = draftLoading || publishedLoading;

  // Populate form from saved letter / draft
  useEffect(() => {
    if (publishedLetter) {
      const { text, imageHash: hash } = decodeLetterBody(publishedLetter.body);
      setTitle(publishedLetter.title);
      setBody(text);
      setVisibility(publishedLetter.visibility);
      if (hash) {
        setImageHash(hash);
      }
    } else if (draft) {
      const { text, imageHash: hash } = decodeLetterBody(draft.body);
      setTitle(draft.title);
      setBody(text);
      if (hash) {
        setImageHash(hash);
      }
    }
  }, [draft, publishedLetter]);

  // Fetch image preview URL when imageHash changes and storageClient is ready
  useEffect(() => {
    if (!imageHash || !storageClient) {
      return;
    }

    let cancelled = false;
    storageClient
      .getDirectURL(imageHash)
      .then((url) => {
        if (!cancelled) setImagePreviewUrl(url);
      })
      .catch((err) => {
        console.error("[LetterEditor] Failed to load image preview:", err);
      });

    return () => {
      cancelled = true;
    };
  }, [imageHash, storageClient]);

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isAuthenticated) {
      toast.error("Please log in to attach a photo to your letter.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if (!storageClient) {
      toast.error("Storage is not ready yet — please try again in a moment.");
      return;
    }

    // Show a local preview immediately
    const localUrl = URL.createObjectURL(file);
    setImagePreviewUrl(localUrl);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const { hash } = await storageClient.putFile(bytes, (pct) =>
        setUploadProgress(pct),
      );
      setImageHash(hash);
      // Replace the blob URL with the permanent storage URL
      const permanentUrl = await storageClient.getDirectURL(hash);
      URL.revokeObjectURL(localUrl);
      setImagePreviewUrl(permanentUrl);
      toast.success("Photo added to your letter 📷");
    } catch (err) {
      console.error("[LetterEditor] Image upload failed:", err);
      URL.revokeObjectURL(localUrl);
      setImagePreviewUrl(null);
      setImageHash(null);
      toast.error("Failed to upload photo. Please try again.");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      // Reset input so the same file can be reselected if needed
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveImage = () => {
    if (imagePreviewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreviewUrl);
    }
    setImagePreviewUrl(null);
    setImageHash(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSaveDraft = async () => {
    if (!title.trim() || !body.trim()) {
      toast.error("Please fill in both title and body");
      return;
    }

    try {
      const encodedBody = encodeLetterBody(body.trim(), imageHash);
      await saveDraft.mutateAsync({ title: title.trim(), body: encodedBody });
      toast.success("Draft saved ✨");
    } catch (error) {
      console.error("Save draft error:", error);
      toast.error("Failed to save draft. Please try again.");
    }
  };

  const handlePublish = async () => {
    if (!title.trim() || !body.trim()) {
      toast.error("Please fill in both title and body");
      return;
    }

    try {
      const encodedBody = encodeLetterBody(body.trim(), imageHash);
      await publishLetter.mutateAsync({
        title: title.trim(),
        body: encodedBody,
        visibility,
      });
      toast.success("Letter published 💌");
      if (isAuthenticated) {
        navigate({ to: "/my-letters" });
      } else {
        navigate({ to: "/" });
      }
    } catch (error) {
      console.error("Publish error:", error);
      toast.error("Failed to publish letter. Please try again.");
    }
  };

  const handleUpdate = async () => {
    if (!title.trim() || !body.trim()) {
      toast.error("Please fill in both title and body");
      return;
    }

    try {
      const encodedBody = encodeLetterBody(body.trim(), imageHash);
      await updatePublished.mutateAsync({
        title: title.trim(),
        body: encodedBody,
        visibility,
      });
      toast.success("Letter updated 💌");
      navigate({ to: "/my-letters" });
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Failed to update letter. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl">
      <div className="mb-10 text-center">
        {/* Decorative rose circle */}
        <div
          className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-5"
          style={{
            background:
              "radial-gradient(circle, oklch(0.92 0.07 18 / 0.4) 0%, oklch(0.97 0.03 22 / 0.2) 70%)",
            border: "1.5px solid oklch(0.48 0.22 12 / 0.22)",
          }}
        >
          <Heart className="h-8 w-8 text-primary fill-primary/25" />
        </div>
        <h1 className="text-4xl md:text-5xl font-serif font-bold mb-3 text-foreground">
          {isEditingPublished ? "Edit Your Letter" : "Write a Letter"}
        </h1>
        <p className="text-muted-foreground font-body italic text-lg">
          {isEditingPublished
            ? "Update your published letter and change its visibility"
            : "Pour your heart out — every word matters"}
        </p>
        {!isAuthenticated && (
          <p className="mt-4 text-sm text-primary/80 bg-primary/6 border border-primary/18 rounded-full px-5 py-2 inline-block font-body">
            You're writing as a guest — your letter will be published publicly
          </p>
        )}
      </div>

      <Card
        className="border-primary/18 shadow-romantic overflow-hidden"
        style={{ background: "oklch(0.995 0.008 45)" }}
      >
        <div className="h-px w-full gold-shimmer" />
        <CardHeader className="pb-4">
          <CardTitle className="font-serif flex items-center gap-2 text-xl">
            <Heart className="h-4 w-4 text-primary fill-primary/28" />
            Your Letter
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label
              htmlFor="title"
              className="font-body font-semibold tracking-wide text-xs uppercase text-muted-foreground"
            >
              Title
            </Label>
            <Input
              id="title"
              placeholder="Give your letter a title…"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="font-serif text-lg border-primary/22 focus-visible:ring-primary/35 bg-background/60"
              data-ocid="letter.input"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="body"
              className="font-body font-semibold tracking-wide text-xs uppercase text-muted-foreground"
            >
              Your Message
            </Label>
            <Textarea
              id="body"
              placeholder="Write your heartfelt message here…"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={12}
              className="font-body resize-none border-primary/22 focus-visible:ring-primary/35 leading-relaxed text-base bg-background/60"
              data-ocid="letter.textarea"
            />
          </div>

          {/* ── Image Upload Section ── */}
          <div className="space-y-3">
            <Label className="font-body font-semibold tracking-wide text-xs uppercase text-muted-foreground">
              Photo (optional)
            </Label>

            {!isAuthenticated ? (
              /* Guest — photos require login */
              <div className="flex flex-col items-center justify-center gap-3 w-full rounded-xl border-2 border-dashed border-primary/15 bg-primary/2 p-8 text-center">
                <div
                  className="flex items-center justify-center w-12 h-12 rounded-full"
                  style={{ background: "oklch(0.92 0.06 18 / 0.15)" }}
                >
                  <ImagePlus className="h-6 w-6 text-primary/40" />
                </div>
                <div>
                  <p className="text-sm font-body font-medium text-foreground/55">
                    Log in to attach a photo
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 font-body">
                    Image attachments are available for logged-in users
                  </p>
                </div>
              </div>
            ) : imagePreviewUrl ? (
              /* Preview card */
              <div className="relative rounded-xl overflow-hidden border border-primary/18 shadow-paper group">
                <img
                  src={imagePreviewUrl}
                  alt={title || "Letter attachment"}
                  className="w-full max-h-[400px] object-contain bg-muted"
                />
                {/* Upload progress overlay */}
                {isUploading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/70 gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm font-body font-medium text-foreground">
                      Uploading… {uploadProgress}%
                    </p>
                  </div>
                )}
                {/* Remove button */}
                {!isUploading && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                    aria-label="Remove attached image"
                    data-ocid="letter.delete_button"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ) : (
              /* Upload trigger */
              <label
                data-ocid="letter.dropzone"
                className={`flex flex-col items-center justify-center gap-3 w-full rounded-xl border-2 border-dashed border-primary/22 bg-primary/3 hover:bg-primary/6 hover:border-primary/38 transition-colors cursor-pointer p-8 ${
                  isUploading ? "opacity-60 pointer-events-none" : ""
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={handleImageSelect}
                  data-ocid="letter.upload_button"
                />
                <div
                  className="flex items-center justify-center w-12 h-12 rounded-full"
                  style={{ background: "oklch(0.92 0.06 18 / 0.25)" }}
                >
                  <ImagePlus className="h-6 w-6 text-primary" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-body font-medium text-foreground/75">
                    Add a photo to your letter
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 font-body">
                    Click to browse — JPG, PNG, GIF, WEBP
                  </p>
                </div>
              </label>
            )}
          </div>

          {/* Visibility — only show for authenticated users */}
          {isAuthenticated && (
            <div className="space-y-3">
              <Label className="font-body font-semibold tracking-wide text-xs uppercase text-muted-foreground">
                Visibility
              </Label>
              <RadioGroup
                value={visibility}
                onValueChange={(value) =>
                  setVisibility(
                    value as Variant_privateVisibility_publicVisibility,
                  )
                }
              >
                <div className="flex items-center space-x-2 p-3.5 rounded-xl border border-primary/18 hover:bg-primary/4 transition-colors">
                  <RadioGroupItem
                    value={
                      Variant_privateVisibility_publicVisibility.publicVisibility
                    }
                    id="public"
                    data-ocid="letter.radio"
                  />
                  <Label htmlFor="public" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2 font-body font-semibold">
                      <Eye className="h-4 w-4 text-primary" />
                      Public
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5 font-body">
                      Everyone can read this letter
                    </p>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3.5 rounded-xl border border-primary/18 hover:bg-primary/4 transition-colors">
                  <RadioGroupItem
                    value={
                      Variant_privateVisibility_publicVisibility.privateVisibility
                    }
                    id="private"
                    data-ocid="letter.radio"
                  />
                  <Label htmlFor="private" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2 font-body font-semibold">
                      <EyeOff className="h-4 w-4 text-primary/70" />
                      Private
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5 font-body">
                      Only you and your partner can read this
                    </p>
                  </Label>
                </div>
              </RadioGroup>
            </div>
          )}

          <div className="flex flex-wrap gap-3 pt-5 border-t border-primary/10">
            {isEditingPublished ? (
              <Button
                onClick={handleUpdate}
                disabled={updatePublished.isPending || isUploading}
                size="lg"
                className="gap-2 bg-primary hover:bg-primary/85 text-primary-foreground rounded-full px-8 shadow-romantic font-body font-semibold"
                data-ocid="letter.save_button"
              >
                {updatePublished.isPending ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Updating…
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5" />
                    Update Letter
                  </>
                )}
              </Button>
            ) : (
              <>
                {isAuthenticated && (
                  <Button
                    onClick={handleSaveDraft}
                    disabled={saveDraft.isPending || isUploading}
                    variant="outline"
                    size="lg"
                    className="gap-2 border-primary/28 text-primary hover:bg-primary/8 rounded-full px-7 font-body font-semibold"
                    data-ocid="letter.secondary_button"
                  >
                    {saveDraft.isPending ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Saving…
                      </>
                    ) : (
                      <>
                        <Save className="h-5 w-5" />
                        Save Draft
                      </>
                    )}
                  </Button>
                )}
                <Button
                  onClick={handlePublish}
                  disabled={publishLetter.isPending || isUploading}
                  size="lg"
                  className="gap-2 bg-primary hover:bg-primary/85 text-primary-foreground rounded-full px-8 shadow-romantic font-body font-semibold"
                  data-ocid="letter.primary_button"
                >
                  {publishLetter.isPending ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Publishing…
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5" />
                      Publish Letter
                    </>
                  )}
                </Button>
              </>
            )}
            <Button
              onClick={() => navigate({ to: "/" })}
              variant="ghost"
              size="lg"
              className="text-muted-foreground hover:text-foreground rounded-full font-body"
              data-ocid="letter.cancel_button"
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
