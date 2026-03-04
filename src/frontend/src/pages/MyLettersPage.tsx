import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useNavigate } from "@tanstack/react-router";
import { Edit, FileText, Heart, Loader2, PenLine } from "lucide-react";
import React from "react";
import VisibilityBadge from "../components/letters/VisibilityBadge";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useGetDraft, useGetPublishedLetter } from "../hooks/useQueries";

export default function MyLettersPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: draft, isLoading: draftLoading } = useGetDraft();
  const { data: publishedLetter, isLoading: publishedLoading } =
    useGetPublishedLetter();

  const isLoading = draftLoading || publishedLoading;

  const handleNewLetter = () => {
    navigate({ to: "/editor" });
  };

  const handleEditDraft = () => {
    navigate({ to: "/editor" });
  };

  const handleEditPublished = () => {
    navigate({ to: "/editor" });
  };

  if (!identity) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl">
      <div className="mb-10 text-center">
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
        <div className="flex items-center justify-center gap-4 mb-3">
          <h1 className="text-4xl md:text-5xl font-serif font-bold">
            My Letters
          </h1>
        </div>
        <p className="text-muted-foreground font-body italic text-lg">
          Manage your drafts and published letters
        </p>
      </div>

      <div className="flex justify-end mb-7">
        <Button
          onClick={handleNewLetter}
          size="lg"
          className="gap-2 bg-primary hover:bg-primary/85 text-primary-foreground rounded-full px-8 shadow-romantic font-body font-semibold"
          data-ocid="myletters.primary_button"
        >
          <PenLine className="h-5 w-5" />
          New Letter
        </Button>
      </div>

      {isLoading ? (
        <div
          className="flex items-center justify-center py-14"
          data-ocid="myletters.loading_state"
        >
          <Loader2 className="h-8 w-8 animate-spin text-primary/60" />
        </div>
      ) : (
        <div className="space-y-7">
          {/* Draft Section */}
          <Card
            className="border-primary/18 shadow-paper overflow-hidden"
            style={{ background: "oklch(0.995 0.008 45)" }}
          >
            <div className="h-px w-full gold-shimmer" />
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 font-serif">
                    <FileText className="h-5 w-5 text-primary" />
                    Draft
                  </CardTitle>
                  <CardDescription className="italic font-body">
                    Your work in progress
                  </CardDescription>
                </div>
                <Badge
                  variant="secondary"
                  className="border border-border font-body text-xs"
                >
                  Draft
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {draft ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-serif text-lg font-semibold mb-2">
                      {draft.title || "Untitled"}
                    </h3>
                    <p className="text-muted-foreground line-clamp-3 whitespace-pre-wrap font-body italic">
                      {draft.body || "No content yet…"}
                    </p>
                  </div>
                  <Button
                    onClick={handleEditDraft}
                    variant="outline"
                    className="gap-2 border-primary/28 text-primary hover:bg-primary/8 rounded-full font-body font-semibold"
                    data-ocid="myletters.edit_button"
                  >
                    <Edit className="h-4 w-4" />
                    Continue Editing
                  </Button>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground mb-4 font-body italic">
                    No draft in progress
                  </p>
                  <Button
                    onClick={handleNewLetter}
                    variant="outline"
                    className="gap-2 border-primary/28 text-primary hover:bg-primary/8 rounded-full font-body font-semibold"
                    data-ocid="myletters.secondary_button"
                  >
                    <PenLine className="h-4 w-4" />
                    Start Writing
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Published Section */}
          <Card
            className="border-primary/18 shadow-paper overflow-hidden"
            style={{ background: "oklch(0.995 0.008 45)" }}
          >
            <div className="h-px w-full gold-shimmer" />
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 font-serif">
                    <Heart className="h-5 w-5 text-primary fill-primary/28" />
                    Published Letter
                  </CardTitle>
                  <CardDescription className="italic font-body">
                    Your shared feelings
                  </CardDescription>
                </div>
                {publishedLetter && (
                  <VisibilityBadge visibility={publishedLetter.visibility} />
                )}
              </div>
            </CardHeader>
            <CardContent>
              {publishedLetter ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-serif text-lg font-semibold mb-2">
                      {publishedLetter.title}
                    </h3>
                    <p className="text-muted-foreground line-clamp-3 whitespace-pre-wrap font-body italic">
                      {publishedLetter.body}
                    </p>
                  </div>
                  <Button
                    onClick={handleEditPublished}
                    variant="outline"
                    className="gap-2 border-primary/28 text-primary hover:bg-primary/8 rounded-full font-body font-semibold"
                    data-ocid="myletters.edit_button"
                  >
                    <Edit className="h-4 w-4" />
                    Edit Published Letter
                  </Button>
                </div>
              ) : (
                <div
                  className="text-center py-8"
                  data-ocid="myletters.empty_state"
                >
                  <p className="text-muted-foreground font-body italic">
                    No published letter yet
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
