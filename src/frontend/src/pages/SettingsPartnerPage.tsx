import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Heart, Info, Loader2, UserPlus } from "lucide-react";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { useGetPartner, useSetPartner } from "../hooks/useQueries";
import { parsePrincipal } from "../utils/principal";

export default function SettingsPartnerPage() {
  const { data: partner, isLoading } = useGetPartner();
  const setPartner = useSetPartner();
  const [principalText, setPrincipalText] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (partner) {
      setPrincipalText(partner.toString());
    }
  }, [partner]);

  const handleSave = async () => {
    setError("");

    if (!principalText.trim()) {
      setError("Please enter a Principal ID");
      return;
    }

    const result = parsePrincipal(principalText.trim());
    if (!result.success) {
      setError(result.error || "Invalid Principal ID");
      return;
    }

    if (!result.principal) {
      setError("Failed to parse Principal ID");
      return;
    }

    try {
      await setPartner.mutateAsync(result.principal);
      toast.success("Partner connected 💕");
    } catch (error: any) {
      console.error("Set partner error:", error);
      const errorMessage = error.message || "Failed to set partner";
      if (errorMessage.includes("Cannot set yourself")) {
        setError("You cannot set yourself as your partner");
      } else if (errorMessage.includes("must be a registered user")) {
        setError("The Principal ID must belong to a registered user");
      } else {
        toast.error("Failed to set partner. Please try again.");
      }
    }
  };

  const handleClear = () => {
    setPrincipalText("");
    setError("");
  };

  return (
    <div className="container mx-auto px-4 py-10 max-w-2xl">
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
        <h1 className="text-4xl md:text-5xl font-serif font-bold mb-3">
          Partner Settings
        </h1>
        <p className="text-muted-foreground font-body italic text-lg">
          Connect with your special someone to share private letters
        </p>
      </div>

      {isLoading ? (
        <div
          className="flex items-center justify-center py-14"
          data-ocid="settings.loading_state"
        >
          <Loader2 className="h-8 w-8 animate-spin text-primary/60" />
        </div>
      ) : (
        <Card
          className="border-primary/18 shadow-romantic overflow-hidden"
          style={{ background: "oklch(0.995 0.008 45)" }}
        >
          <div className="h-px w-full gold-shimmer" />
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-serif">
              <UserPlus className="h-5 w-5 text-primary" />
              Set Your Partner
            </CardTitle>
            <CardDescription className="italic font-body">
              Enter your partner's Principal ID to connect your accounts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert
              className="border-primary/18 rounded-xl"
              style={{ background: "oklch(0.96 0.04 22 / 0.5)" }}
            >
              <Info className="h-4 w-4 text-primary" />
              <AlertDescription className="font-body">
                Your partner must be a registered user. They can find their
                Principal ID by logging in and checking their profile settings.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label
                htmlFor="partner"
                className="font-body font-semibold tracking-wide text-xs uppercase text-muted-foreground"
              >
                Partner's Principal ID
              </Label>
              <Input
                id="partner"
                placeholder="Enter Principal ID (e.g., xxxxx-xxxxx-xxxxx-xxxxx-xxx)"
                value={principalText}
                onChange={(e) => {
                  setPrincipalText(e.target.value);
                  setError("");
                }}
                className={`border-primary/22 focus-visible:ring-primary/35 bg-background/60 font-body ${error ? "border-destructive" : ""}`}
                data-ocid="settings.input"
              />
              {error && (
                <p
                  className="text-sm text-destructive font-body"
                  data-ocid="settings.error_state"
                >
                  {error}
                </p>
              )}
            </div>

            {partner && (
              <div
                className="p-4 rounded-xl border border-primary/18"
                style={{ background: "oklch(0.96 0.04 22 / 0.5)" }}
              >
                <p className="text-sm font-body font-semibold mb-1.5 text-primary">
                  Current Partner 💕
                </p>
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
                className="gap-2 bg-primary hover:bg-primary/85 text-primary-foreground rounded-full px-8 shadow-romantic font-body font-semibold"
                data-ocid="settings.primary_button"
              >
                {setPartner.isPending ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Saving…
                  </>
                ) : (
                  <>
                    <Heart className="h-5 w-5" />
                    {partner ? "Update Partner" : "Set Partner"}
                  </>
                )}
              </Button>
              {principalText && (
                <Button
                  onClick={handleClear}
                  variant="outline"
                  size="lg"
                  className="border-primary/28 text-primary hover:bg-primary/8 rounded-full font-body font-semibold"
                  data-ocid="settings.cancel_button"
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
