import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { Heart, Loader2, PenLine } from "lucide-react";
import React from "react";
import LetterCard from "../components/letters/LetterCard";
import { useGetPublicFeed } from "../hooks/useQueries";

export default function PublicFeedPage() {
  const { data: letters, isLoading } = useGetPublicFeed();

  return (
    <div>
      {/* Hero Section */}
      <section
        className="relative w-full overflow-hidden"
        style={{ minHeight: "420px" }}
      >
        <img
          src="/assets/generated/romantic-hero.dim_1440x600.png"
          alt="Romantic background"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Romantic overlay — deeper, warmer */}
        <div className="absolute inset-0 hero-overlay" />
        {/* Extra vignette for text legibility */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 70% at 50% 50%, transparent 30%, oklch(0.1 0.04 14 / 0.4) 100%)",
          }}
        />

        <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 py-24 min-h-[420px]">
          {/* Decorative hearts row */}
          <div className="flex items-center gap-3 mb-5">
            <Heart className="h-4 w-4 text-white/60 fill-white/40" />
            <Heart className="h-6 w-6 text-white/80 fill-white/55" />
            <Heart className="h-4 w-4 text-white/60 fill-white/40" />
          </div>

          <h1
            className="font-script italic text-5xl md:text-7xl text-white mb-3 leading-tight"
            style={{
              textShadow:
                "0 2px 20px oklch(0.1 0.04 14 / 0.6), 0 1px 4px oklch(0.1 0.04 14 / 0.4)",
            }}
          >
            Love Letters
          </h1>
          <p
            className="font-body italic text-lg md:text-xl text-white/85 max-w-md mb-10 leading-relaxed"
            style={{ textShadow: "0 1px 8px oklch(0.1 0.04 14 / 0.5)" }}
          >
            Words written from the heart, shared with the world
          </p>

          <Link to="/editor" data-ocid="hero.primary_button">
            <Button
              size="lg"
              className="gap-2.5 rounded-full px-9 text-base font-body font-semibold tracking-wide"
              style={{
                background: "oklch(0.99 0.01 45 / 0.18)",
                border: "1.5px solid oklch(0.99 0.01 45 / 0.5)",
                color: "white",
                backdropFilter: "blur(8px)",
                boxShadow: "0 4px 24px oklch(0.1 0.04 14 / 0.3)",
              }}
            >
              <PenLine className="h-4 w-4" />
              Write a Letter
            </Button>
          </Link>
        </div>
      </section>

      {/* Letters Feed */}
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        {/* Section heading */}
        <div className="flex items-center justify-center gap-4 mb-10">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent to-primary/25" />
          <div className="flex items-center gap-2.5">
            <Heart className="h-3.5 w-3.5 text-primary/50 fill-primary/25" />
            <span className="font-script italic text-2xl text-primary/80 leading-none tracking-wide">
              Public Letters
            </span>
            <Heart className="h-3.5 w-3.5 text-primary/50 fill-primary/25" />
          </div>
          <div className="flex-1 h-px bg-gradient-to-l from-transparent to-primary/25" />
        </div>

        {isLoading ? (
          <div
            className="flex flex-col items-center justify-center py-20 gap-4"
            data-ocid="feed.loading_state"
          >
            <Loader2 className="h-8 w-8 animate-spin text-primary/60" />
            <p className="text-muted-foreground font-body italic text-base">
              Gathering letters…
            </p>
          </div>
        ) : letters && letters.length > 0 ? (
          <div className="space-y-7" data-ocid="feed.list">
            {letters.map((letter, index) => (
              <LetterCard
                key={`${letter.author.toString()}-${index}`}
                letter={letter}
                enableReadMore={true}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20" data-ocid="feed.empty_state">
            {/* Decorative rose ring */}
            <div
              className="inline-flex items-center justify-center w-24 h-24 rounded-full mb-6"
              style={{
                background:
                  "radial-gradient(circle, oklch(0.92 0.07 18 / 0.35) 0%, oklch(0.96 0.04 22 / 0.15) 70%)",
                border: "1.5px solid oklch(0.48 0.22 12 / 0.2)",
              }}
            >
              <Heart className="h-11 w-11 text-primary fill-primary/22" />
            </div>
            <h2 className="font-serif text-3xl font-semibold mb-3 text-foreground">
              No letters yet
            </h2>
            <p className="text-muted-foreground mb-8 font-body italic text-lg max-w-sm mx-auto leading-relaxed">
              Be the first to share your heart. Write a letter and let the world
              feel your love.
            </p>
            <Link to="/editor">
              <Button
                className="gap-2 bg-primary hover:bg-primary/85 text-primary-foreground rounded-full px-8 text-base shadow-romantic"
                data-ocid="feed.primary_button"
              >
                <PenLine className="h-4 w-4" />
                Write the First Letter
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
