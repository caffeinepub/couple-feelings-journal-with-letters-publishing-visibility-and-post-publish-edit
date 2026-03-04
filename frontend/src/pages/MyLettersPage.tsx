import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useGetDraft, useGetPublishedLetter } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import VisibilityBadge from '../components/letters/VisibilityBadge';
import { FileText, Edit, PenLine, Loader2, Heart } from 'lucide-react';

export default function MyLettersPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: draft, isLoading: draftLoading } = useGetDraft();
  const { data: publishedLetter, isLoading: publishedLoading } = useGetPublishedLetter();

  const isLoading = draftLoading || publishedLoading;

  const handleNewLetter = () => {
    navigate({ to: '/editor' });
  };

  const handleEditDraft = () => {
    navigate({ to: '/editor' });
  };

  const handleEditPublished = () => {
    navigate({ to: '/editor' });
  };

  if (!identity) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl">
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-4">
          <Heart className="h-7 w-7 text-primary fill-primary/30" />
        </div>
        <div className="flex items-center justify-center gap-4 mb-2">
          <h1 className="text-4xl font-serif font-bold">My Letters</h1>
        </div>
        <p className="text-muted-foreground font-serif italic">Manage your drafts and published letters</p>
      </div>

      <div className="flex justify-end mb-6">
        <Button onClick={handleNewLetter} size="lg" className="gap-2 bg-primary hover:bg-primary/90">
          <PenLine className="h-5 w-5" />
          New Letter
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Draft Section */}
          <Card className="border-primary/20 shadow-paper">
            <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-primary/30 to-transparent rounded-t-lg" />
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 font-serif">
                    <FileText className="h-5 w-5 text-primary" />
                    Draft
                  </CardTitle>
                  <CardDescription className="italic">Your work in progress</CardDescription>
                </div>
                <Badge variant="secondary" className="border border-border">Draft</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {draft ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-serif text-lg font-semibold mb-2">
                      {draft.title || 'Untitled'}
                    </h3>
                    <p className="text-muted-foreground line-clamp-3 whitespace-pre-wrap font-serif italic">
                      {draft.body || 'No content yet…'}
                    </p>
                  </div>
                  <Button
                    onClick={handleEditDraft}
                    variant="outline"
                    className="gap-2 border-primary/30 text-primary hover:bg-primary/10"
                  >
                    <Edit className="h-4 w-4" />
                    Continue Editing
                  </Button>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground mb-4 font-serif italic">No draft in progress</p>
                  <Button
                    onClick={handleNewLetter}
                    variant="outline"
                    className="gap-2 border-primary/30 text-primary hover:bg-primary/10"
                  >
                    <PenLine className="h-4 w-4" />
                    Start Writing
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Published Section */}
          <Card className="border-primary/20 shadow-paper">
            <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-primary/30 to-transparent rounded-t-lg" />
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 font-serif">
                    <Heart className="h-5 w-5 text-primary fill-primary/30" />
                    Published Letter
                  </CardTitle>
                  <CardDescription className="italic">Your shared feelings</CardDescription>
                </div>
                {publishedLetter && <VisibilityBadge visibility={publishedLetter.visibility} />}
              </div>
            </CardHeader>
            <CardContent>
              {publishedLetter ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-serif text-lg font-semibold mb-2">
                      {publishedLetter.title}
                    </h3>
                    <p className="text-muted-foreground line-clamp-3 whitespace-pre-wrap font-serif italic">
                      {publishedLetter.body}
                    </p>
                  </div>
                  <Button
                    onClick={handleEditPublished}
                    variant="outline"
                    className="gap-2 border-primary/30 text-primary hover:bg-primary/10"
                  >
                    <Edit className="h-4 w-4" />
                    Edit Published Letter
                  </Button>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground font-serif italic">No published letter yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
