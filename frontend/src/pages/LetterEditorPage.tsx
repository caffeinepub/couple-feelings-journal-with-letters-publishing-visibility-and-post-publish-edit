import React, { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import {
  useGetDraft,
  useGetPublishedLetter,
  useSaveDraft,
  usePublishLetter,
  useUpdatePublishedLetter,
} from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { Save, Send, Loader2, Eye, EyeOff, Heart } from 'lucide-react';
import { Variant_privateVisibility_publicVisibility } from '../backend';

export default function LetterEditorPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const { data: draft, isLoading: draftLoading } = useGetDraft();
  const { data: publishedLetter, isLoading: publishedLoading } = useGetPublishedLetter();
  const saveDraft = useSaveDraft();
  const publishLetter = usePublishLetter();
  const updatePublished = useUpdatePublishedLetter();

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [visibility, setVisibility] = useState<Variant_privateVisibility_publicVisibility>(
    Variant_privateVisibility_publicVisibility.publicVisibility
  );

  const isEditingPublished = !!publishedLetter;
  const isLoading = draftLoading || publishedLoading;

  useEffect(() => {
    if (publishedLetter) {
      setTitle(publishedLetter.title);
      setBody(publishedLetter.body);
      setVisibility(publishedLetter.visibility);
    } else if (draft) {
      setTitle(draft.title);
      setBody(draft.body);
    }
  }, [draft, publishedLetter]);

  const handleSaveDraft = async () => {
    if (!title.trim() || !body.trim()) {
      toast.error('Please fill in both title and body');
      return;
    }

    try {
      await saveDraft.mutateAsync({ title: title.trim(), body: body.trim() });
      toast.success('Draft saved ✨');
    } catch (error) {
      console.error('Save draft error:', error);
      toast.error('Failed to save draft. Please try again.');
    }
  };

  const handlePublish = async () => {
    if (!title.trim() || !body.trim()) {
      toast.error('Please fill in both title and body');
      return;
    }

    try {
      await publishLetter.mutateAsync({
        title: title.trim(),
        body: body.trim(),
        visibility,
      });
      toast.success('Letter published 💌');
      if (isAuthenticated) {
        navigate({ to: '/my-letters' });
      } else {
        navigate({ to: '/' });
      }
    } catch (error) {
      console.error('Publish error:', error);
      toast.error('Failed to publish letter. Please try again.');
    }
  };

  const handleUpdate = async () => {
    if (!title.trim() || !body.trim()) {
      toast.error('Please fill in both title and body');
      return;
    }

    try {
      await updatePublished.mutateAsync({
        title: title.trim(),
        body: body.trim(),
        visibility,
      });
      toast.success('Letter updated 💌');
      navigate({ to: '/my-letters' });
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to update letter. Please try again.');
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
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-4">
          <Heart className="h-7 w-7 text-primary fill-primary/30" />
        </div>
        <h1 className="text-4xl font-serif font-bold mb-2">
          {isEditingPublished ? 'Edit Your Letter' : 'Write a Letter'}
        </h1>
        <p className="text-muted-foreground font-serif italic">
          {isEditingPublished
            ? 'Update your published letter and change its visibility'
            : 'Pour your heart out — every word matters'}
        </p>
        {!isAuthenticated && (
          <p className="mt-3 text-sm text-primary/80 bg-primary/8 border border-primary/20 rounded-lg px-4 py-2 inline-block">
            You're writing as a guest — your letter will be published publicly
          </p>
        )}
      </div>

      <Card className="border-primary/20 shadow-romantic">
        <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-primary/40 to-transparent rounded-t-lg" />
        <CardHeader>
          <CardTitle className="font-serif flex items-center gap-2">
            <Heart className="h-4 w-4 text-primary fill-primary/30" />
            Your Letter
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Give your letter a title…"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="font-serif text-lg border-primary/25 focus-visible:ring-primary/40"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="body">Your Message</Label>
            <Textarea
              id="body"
              placeholder="Write your heartfelt message here…"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={12}
              className="font-serif resize-none border-primary/25 focus-visible:ring-primary/40 leading-relaxed"
            />
          </div>

          {/* Visibility — only show for authenticated users */}
          {isAuthenticated && (
            <div className="space-y-3">
              <Label>Visibility</Label>
              <RadioGroup
                value={visibility}
                onValueChange={(value) =>
                  setVisibility(value as Variant_privateVisibility_publicVisibility)
                }
              >
                <div className="flex items-center space-x-2 p-3 rounded-lg border border-primary/20 hover:bg-primary/5 transition-colors">
                  <RadioGroupItem
                    value={Variant_privateVisibility_publicVisibility.publicVisibility}
                    id="public"
                  />
                  <Label htmlFor="public" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2 font-medium">
                      <Eye className="h-4 w-4 text-primary" />
                      Public
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      Everyone can read this letter
                    </p>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 rounded-lg border border-primary/20 hover:bg-primary/5 transition-colors">
                  <RadioGroupItem
                    value={Variant_privateVisibility_publicVisibility.privateVisibility}
                    id="private"
                  />
                  <Label htmlFor="private" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2 font-medium">
                      <EyeOff className="h-4 w-4" />
                      Private
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      Only you and your partner can read this
                    </p>
                  </Label>
                </div>
              </RadioGroup>
            </div>
          )}

          <div className="flex flex-wrap gap-3 pt-4 border-t border-primary/10">
            {isEditingPublished ? (
              <Button
                onClick={handleUpdate}
                disabled={updatePublished.isPending}
                size="lg"
                className="gap-2 bg-primary hover:bg-primary/90"
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
                    disabled={saveDraft.isPending}
                    variant="outline"
                    size="lg"
                    className="gap-2 border-primary/30 text-primary hover:bg-primary/10"
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
                  disabled={publishLetter.isPending}
                  size="lg"
                  className="gap-2 bg-primary hover:bg-primary/90"
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
              onClick={() => navigate({ to: '/' })}
              variant="ghost"
              size="lg"
              className="text-muted-foreground hover:text-foreground"
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
