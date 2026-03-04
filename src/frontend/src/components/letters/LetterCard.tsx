import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, ChevronDown, ChevronUp, Heart, User } from "lucide-react";
import React, { useState, useEffect } from "react";
import type { PublishedLetter } from "../../backend";
import { useStorageClient } from "../../hooks/useStorageClient";
import { decodeLetterBody } from "../../utils/letterImage";
import VisibilityBadge from "./VisibilityBadge";

interface LetterCardProps {
  letter: PublishedLetter;
  authorName?: string;
  showVisibility?: boolean;
  onClick?: () => void;
  enableReadMore?: boolean;
}

const PREVIEW_LENGTH = 180;

export default function LetterCard({
  letter,
  authorName,
  showVisibility = false,
  onClick,
  enableReadMore = false,
}: LetterCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { storageClient } = useStorageClient();
  const [letterImageUrl, setLetterImageUrl] = useState<string | null>(null);

  const { text: bodyText, imageHash } = decodeLetterBody(letter.body);

  const formattedDate = new Date(Number(letter.timestamp)).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    },
  );

  const isLong = bodyText.length > PREVIEW_LENGTH;
  const previewText = isLong
    ? `${bodyText.slice(0, PREVIEW_LENGTH).trimEnd()}…`
    : bodyText;

  // Load image URL when hash and storageClient are available
  useEffect(() => {
    if (!imageHash || !storageClient) {
      setLetterImageUrl(null);
      return;
    }

    let cancelled = false;
    storageClient
      .getDirectURL(imageHash)
      .then((url) => {
        if (!cancelled) setLetterImageUrl(url);
      })
      .catch((err) => {
        console.error("[LetterCard] Failed to load image:", err);
      });

    return () => {
      cancelled = true;
    };
  }, [imageHash, storageClient]);

  const handleCardClick = () => {
    if (!enableReadMore && onClick) {
      onClick();
    }
  };

  return (
    <Card
      className={`relative transition-all duration-300 border-primary/18 shadow-paper hover:shadow-romantic overflow-hidden ${
        !enableReadMore && onClick
          ? "cursor-pointer hover:-translate-y-0.5"
          : ""
      }`}
      style={{ background: "oklch(0.995 0.008 45)" }}
      onClick={handleCardClick}
    >
      {/* Gold shimmer top accent */}
      <div className="h-px w-full gold-shimmer" />

      {/* Subtle inner parchment warmth */}
      <div
        className="absolute inset-0 pointer-events-none rounded-lg"
        style={{
          background:
            "radial-gradient(ellipse 70% 40% at 50% 0%, oklch(0.92 0.06 22 / 0.12) 0%, transparent 70%)",
        }}
      />

      <CardHeader className="relative pb-2">
        <div className="flex items-start justify-between gap-4">
          <CardTitle className="text-xl font-serif text-foreground leading-snug">
            {letter.title}
          </CardTitle>
          <div className="flex items-center gap-2 shrink-0">
            {showVisibility && (
              <VisibilityBadge visibility={letter.visibility} />
            )}
            <Heart className="h-4 w-4 text-primary/45 fill-primary/18" />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mt-1.5">
          {authorName && (
            <div className="flex items-center gap-1.5">
              <User className="h-3 w-3 text-primary/50" />
              <span className="font-script italic text-[1rem] text-primary/75 leading-none">
                {authorName}
              </span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3 w-3" />
            <span className="font-body text-xs tracking-wide">
              {formattedDate}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative pt-0">
        {/* Decorative heart divider */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent to-primary/15" />
          <Heart className="h-3 w-3 text-primary/35 fill-primary/18" />
          <div className="flex-1 h-px bg-gradient-to-l from-transparent to-primary/15" />
        </div>

        {enableReadMore ? (
          <>
            <div
              className="overflow-hidden transition-all duration-500 ease-in-out"
              style={{
                maxHeight: isExpanded ? "4000px" : "120px",
              }}
            >
              <p className="text-foreground/88 whitespace-pre-wrap font-body leading-relaxed text-[1rem]">
                {isExpanded ? bodyText : previewText}
              </p>

              {/* Inline image — shown when expanded or when the body is short enough */}
              {letterImageUrl && (isExpanded || !isLong) && (
                <div className="mt-4 rounded-xl overflow-hidden border border-primary/18 shadow-paper ring-1 ring-primary/10">
                  <img
                    src={letterImageUrl}
                    alt={letter.title}
                    className="w-full max-h-[400px] object-contain bg-muted"
                    loading="lazy"
                  />
                </div>
              )}
            </div>

            {(isLong || (imageHash && !isExpanded)) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded((prev) => !prev);
                }}
                className="mt-3 gap-1.5 text-primary hover:text-primary hover:bg-primary/8 font-body font-semibold px-3 h-8 rounded-full border border-primary/20 text-xs tracking-wide"
              >
                {isExpanded ? (
                  <>
                    <ChevronUp className="h-3.5 w-3.5" />
                    Read Less
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-3.5 w-3.5" />
                    Read More
                  </>
                )}
              </Button>
            )}
          </>
        ) : (
          <>
            <p className="text-foreground/88 whitespace-pre-wrap line-clamp-4 font-body leading-relaxed text-[1rem]">
              {bodyText}
            </p>
            {letterImageUrl && (
              <div className="mt-4 rounded-xl overflow-hidden border border-primary/18 shadow-paper ring-1 ring-primary/10">
                <img
                  src={letterImageUrl}
                  alt={letter.title}
                  className="w-full max-h-[400px] object-contain bg-muted"
                  loading="lazy"
                />
              </div>
            )}
          </>
        )}
      </CardContent>

      {/* Subtle bottom shimmer */}
      <div className="h-px w-full gold-shimmer opacity-40" />
    </Card>
  );
}
