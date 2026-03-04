import React, { useState, useEffect } from 'react';
import { useGetPartner, useSetPartner } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { Heart, Loader2, UserPlus, Info } from 'lucide-react';
import { parsePrincipal } from '../utils/principal';

export default function SettingsPartnerPage() {
  const { data: partner, isLoading } = useGetPartner();
  const setPartner = useSetPartner();
  const [principalText, setPrincipalText] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (partner) {
      setPrincipalText(partner.toString());
    }
  }, [partner]);

  const handleSave = async () => {
    setError('');

    if (!principalText.trim()) {
      setError('Please enter a Principal ID');
      return;
    }

    const result = parsePrincipal(principalText.trim());
    if (!result.success) {
      setError(result.error || 'Invalid Principal ID');
      return;
    }

    if (!result.principal) {
      setError('Failed to parse Principal ID');
      return;
    }

    try {
      await setPartner.mutateAsync(result.principal);
      toast.success('Partner connected 💕');
    } catch (error: any) {
      console.error('Set partner error:', error);
      const errorMessage = error.message || 'Failed to set partner';
      if (errorMessage.includes('Cannot set yourself')) {
        setError('You cannot set yourself as your partner');
      } else if (errorMessage.includes('must be a registered user')) {
        setError('The Principal ID must belong to a registered user');
      } else {
        toast.error('Failed to set partner. Please try again.');
      }
    }
  };

  const handleClear = () => {
    setPrincipalText('');
    setError('');
  };

  return (
    <div className="container mx-auto px-4 py-10 max-w-2xl">
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-4">
          <Heart className="h-7 w-7 text-primary fill-primary/30" />
        </div>
        <h1 className="text-4xl font-serif font-bold mb-2">Partner Settings</h1>
        <p className="text-muted-foreground font-serif italic">
          Connect with your special someone to share private letters
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <Card className="border-primary/20 shadow-romantic">
          <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-primary/40 to-transparent rounded-t-lg" />
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-serif">
              <UserPlus className="h-5 w-5 text-primary" />
              Set Your Partner
            </CardTitle>
            <CardDescription className="italic">
              Enter your partner's Principal ID to connect your accounts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert className="border-primary/20 bg-primary/5">
              <Info className="h-4 w-4 text-primary" />
              <AlertDescription>
                Your partner must be a registered user. They can find their Principal ID by logging
                in and checking their profile settings.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="partner">Partner's Principal ID</Label>
              <Input
                id="partner"
                placeholder="Enter Principal ID (e.g., xxxxx-xxxxx-xxxxx-xxxxx-xxx)"
                value={principalText}
                onChange={(e) => {
                  setPrincipalText(e.target.value);
                  setError('');
                }}
                className={`border-primary/25 focus-visible:ring-primary/40 ${error ? 'border-destructive' : ''}`}
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>

            {partner && (
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <p className="text-sm font-medium mb-1 text-primary">Current Partner 💕</p>
                <p className="text-sm text-muted-foreground font-mono break-all">
                  {partner.toString()}
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                onClick={handleSave}
                disabled={setPartner.isPending}
                size="lg"
                className="gap-2 bg-primary hover:bg-primary/90"
              >
                {setPartner.isPending ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Saving…
                  </>
                ) : (
                  <>
                    <Heart className="h-5 w-5" />
                    {partner ? 'Update Partner' : 'Set Partner'}
                  </>
                )}
              </Button>
              {principalText && (
                <Button
                  onClick={handleClear}
                  variant="outline"
                  size="lg"
                  className="border-primary/30 text-primary hover:bg-primary/10"
                >
                  Clear
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
