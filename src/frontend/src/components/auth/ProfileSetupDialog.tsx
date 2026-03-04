import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Heart } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";
import { useSaveCallerUserProfile } from "../../hooks/useQueries";

export default function ProfileSetupDialog() {
  const [name, setName] = useState("");
  const saveProfile = useSaveCallerUserProfile();

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }

    try {
      await saveProfile.mutateAsync({ name: name.trim() });
      toast.success("Welcome! Your profile is ready 💌");
    } catch (error) {
      console.error("Profile save error:", error);
      toast.error("Failed to save profile. Please try again.");
    }
  };

  return (
    <Dialog open={true}>
      <DialogContent
        className="sm:max-w-md border-primary/18 overflow-hidden"
        style={{ background: "oklch(0.995 0.008 45)" }}
        onPointerDownOutside={(e) => e.preventDefault()}
        data-ocid="profile.dialog"
      >
        <div className="h-px w-full gold-shimmer" />
        <DialogHeader className="pt-4">
          <div className="flex items-center justify-center mb-3">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{
                background:
                  "radial-gradient(circle, oklch(0.92 0.07 18 / 0.4) 0%, oklch(0.97 0.03 22 / 0.2) 70%)",
                border: "1.5px solid oklch(0.48 0.22 12 / 0.22)",
              }}
            >
              <Heart className="h-7 w-7 text-primary fill-primary/25" />
            </div>
          </div>
          <DialogTitle className="font-serif text-2xl text-center">
            Welcome, dear
          </DialogTitle>
          <DialogDescription className="text-center font-body">
            What shall we call you? Your name will appear on your letters.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label
              htmlFor="name"
              className="font-body font-semibold tracking-wide text-xs uppercase text-muted-foreground"
            >
              Your Name
            </Label>
            <Input
              id="name"
              placeholder="Enter your name…"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSave();
                }
              }}
              className="border-primary/22 focus-visible:ring-primary/35 font-body bg-background/60"
              autoFocus
              data-ocid="profile.input"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={handleSave}
            disabled={saveProfile.isPending || !name.trim()}
            className="w-full gap-2 bg-primary hover:bg-primary/85 text-primary-foreground rounded-full shadow-romantic font-body font-semibold"
            data-ocid="profile.submit_button"
          >
            <Heart className="h-4 w-4" />
            {saveProfile.isPending ? "Saving…" : "Begin"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
