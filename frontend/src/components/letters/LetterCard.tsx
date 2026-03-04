import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { PublishedLetter } from '../../backend';
import { Calendar, User, Heart, ChevronDown, ChevronUp } from 'lucide-react';
import VisibilityBadge from './VisibilityBadge';
import { Button } from '@/components/ui/button';

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

  const formattedDate = new Date(Number(letter.timestamp)).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const isLong = letter.body.length > PREVIEW_LENGTH;
  const previewText = isLong ? letter.body.slice(0, PREVIEW_LENGTH).trimEnd() + '…' : letter.body;

  const handleCardClick = () => {
    if (!enableReadMore && onClick) {
      onClick();
    }
  };

  return (
    <Card
      className={`transition-all duration-200 border-primary/20 shadow-paper hover:shadow-romantic bg-card ${
        !enableReadMore && onClick ? 'cursor-pointer' : ''
      }`}
      onClick={handleCardClick}
    >
      {/* Decorative top accent */}
      <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-primary/40 to-transparent rounded-t-lg" />

      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-4">
          <CardTitle className="text-xl font-serif text-foreground leading-snug">
            {letter.title}
          </CardTitle>
          <div className="flex items-center gap-2 shrink-0">
            {showVisibility && <VisibilityBadge visibility={letter.visibility} />}
            <Heart className="h-4 w-4 text-primary/50 fill-primary/20" />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mt-1">
          {authorName && (
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              <span className="font-script text-base">{authorName}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{formattedDate}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Decorative divider */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1 h-px bg-primary/10" />
          <Heart className="h-3 w-3 text-primary/30 fill-primary/20" />
          <div className="flex-1 h-px bg-primary/10" />
        </div>

        {enableReadMore ? (
          <>
            <div
              className={`overflow-hidden transition-all duration-500 ease-in-out`}
              style={{
                maxHeight: isExpanded ? '2000px' : '120px',
              }}
            >
              <p className="text-foreground/85 whitespace-pre-wrap font-serif leading-relaxed text-[0.95rem]">
                {isExpanded ? letter.body : previewText}
              </p>
            </div>

            {isLong && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded((prev) => !prev);
                }}
                className="mt-3 gap-1.5 text-primary hover:text-primary hover:bg-primary/10 font-medium px-2 h-8"
              >
                {isExpanded ? (
                  <>
                    <ChevronUp className="h-4 w-4" />
                    Read Less
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4" />
                    Read More
                  </>
                )}
              </Button>
            )}
          </>
        ) : (
          <p className="text-foreground/85 whitespace-pre-wrap line-clamp-4 font-serif leading-relaxed text-[0.95rem]">
            {letter.body}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
