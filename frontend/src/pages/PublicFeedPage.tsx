import React from 'react';
import { useGetPublicFeed } from '../hooks/useQueries';
import LetterCard from '../components/letters/LetterCard';
import { Heart, Loader2, PenLine } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';

export default function PublicFeedPage() {
  const { data: letters, isLoading } = useGetPublicFeed();

  return (
    <div>
      {/* Hero Section */}
      <section className="relative w-full overflow-hidden" style={{ minHeight: '380px' }}>
        <img
          src="/assets/generated/romantic-hero.dim_1440x600.png"
          alt="Romantic background"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Overlay */}
        <div className="absolute inset-0 hero-overlay" />

        <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 py-20 min-h-[380px]">
          {/* Decorative hearts */}
          <div className="flex items-center gap-3 mb-4">
            <Heart className="h-5 w-5 text-white/70 fill-white/50" />
            <Heart className="h-7 w-7 text-white/90 fill-white/70" />
            <Heart className="h-5 w-5 text-white/70 fill-white/50" />
          </div>

          <h1 className="font-script text-5xl md:text-6xl text-white drop-shadow-lg mb-3">
            Love Letters
          </h1>
          <p className="font-serif text-lg md:text-xl text-white/90 max-w-lg drop-shadow mb-8 italic">
            Words written from the heart, shared with the world
          </p>

          <Link to="/editor">
            <Button
              size="lg"
              className="gap-2 bg-white/20 hover:bg-white/30 text-white border border-white/40 backdrop-blur-sm font-serif text-base px-8"
            >
              <PenLine className="h-5 w-5" />
              Write a Letter
            </Button>
          </Link>
        </div>
      </section>

      {/* Letters Feed */}
      <div className="container mx-auto px-4 py-10 max-w-3xl">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="flex-1 h-px bg-primary/20" />
          <div className="flex items-center gap-2 text-primary/60">
            <Heart className="h-4 w-4 fill-primary/30" />
            <span className="font-script text-xl text-primary">Public Letters</span>
            <Heart className="h-4 w-4 fill-primary/30" />
          </div>
          <div className="flex-1 h-px bg-primary/20" />
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground font-serif italic">Loading letters…</p>
          </div>
        ) : letters && letters.length > 0 ? (
          <div className="space-y-6">
            {letters.map((letter, index) => (
              <LetterCard
                key={`${letter.author.toString()}-${index}`}
                letter={letter}
                enableReadMore={true}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-5">
              <Heart className="h-10 w-10 text-primary fill-primary/30" />
            </div>
            <h2 className="font-serif text-2xl font-semibold mb-3">No letters yet</h2>
            <p className="text-muted-foreground mb-6 font-serif italic max-w-sm mx-auto">
              Be the first to share your heart. Write a letter and let the world feel your love.
            </p>
            <Link to="/editor">
              <Button className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
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
