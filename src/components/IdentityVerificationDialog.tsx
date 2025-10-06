"use client";

import { useState, useEffect, useMemo } from "react";
import { useUser } from "@/contexts/UserContext";
import { useAuth } from "@/contexts/AuthContext";
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
import { useToast } from "@/hooks/use-toast";
import { Loader2, Sparkles } from "lucide-react";
import Link from "next/link";
import { doc, setDoc } from "firebase/firestore";
import { firestore } from "@/lib/firebase";

function parseResidence(input: string): { tower?: string; apartmentNumber?: string } {
  // Accept formats like "A-12B", "Tower A 12B", "A 12B", "12B in A" (simple heuristics)
  const trimmed = input.trim();
  const matchHyphen = trimmed.match(/^([A-Za-z])[\-\s]?([0-9A-Za-z]+)$/);
  if (matchHyphen) return { tower: matchHyphen[1].toUpperCase(), apartmentNumber: matchHyphen[2].toUpperCase() };
  const matchWords = trimmed.match(/tower\s*([A-Za-z])/i);
  const apt = trimmed.match(/([0-9]+[A-Za-z]*)/);
  const t = matchWords?.[1]?.toUpperCase();
  const a = apt?.[1]?.toUpperCase();
  return { tower: t, apartmentNumber: a };
}

export function IdentityVerificationDialog() {
  const { isIdentityDialogOpen, setIdentityDialogOpen, pendingAction, setPendingAction } = useUser();
  const { firebaseUser, profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [residence, setResidence] = useState("");

  const displayName = useMemo(() => firebaseUser?.displayName || "", [firebaseUser]);
  const phoneNumber = useMemo(() => {
    const phone = firebaseUser?.phoneNumber || "";
    if (phone.length > 4) {
      // Mask phone number, show last 4 digits
      return phone.slice(0, -4).replace(/\d/g, '*') + phone.slice(-4);
    }
    return phone;
  }, [firebaseUser]);

  useEffect(() => {
    if (profile?.verified) {
      // Already verified: close dialog if open and execute pending action
      if (isIdentityDialogOpen) {
        setIdentityDialogOpen(false);
        if (pendingAction) {
          pendingAction();
          setPendingAction(null);
        }
      }
    }
  }, [profile?.verified, isIdentityDialogOpen, setIdentityDialogOpen, pendingAction, setPendingAction]);

  const quickVerify = async () => {
    if (!firebaseUser) {
      toast({ title: "Please sign in", description: "Sign in to verify and continue." });
      return;
    }
    setIsLoading(true);
    try {
      const parsed = parseResidence(residence);
      if (!displayName || !parsed.apartmentNumber) {
        toast({ variant: "destructive", title: "We need a bit more", description: "Tell us your apartment like 'A-12B'." });
        setIsLoading(false);
        return;
      }
      const tower = parsed.tower || (parsed.apartmentNumber?.match(/^[A-Za-z]/)?.[0] || "").toUpperCase();
      const ref = doc(firestore, "profiles", firebaseUser.uid);
      await setDoc(ref, {
        fullName: displayName || (firebaseUser.email?.split("@")[0] ?? "Resident"),
        tower,
        apartmentNumber: parsed.apartmentNumber,
        phone: firebaseUser.phoneNumber || phoneNumber,
        verified: true,
      }, { merge: true });
      await refreshProfile();
      toast({ title: "Verified", description: "You're all set!" });
      setIdentityDialogOpen(false);
      if (pendingAction) {
        pendingAction();
        setPendingAction(null);
      }
    } catch (e) {
      console.error(e);
      toast({ variant: "destructive", title: "Verification failed", description: "Please try again or open your Profile." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (isLoading) return;
    setIdentityDialogOpen(open);
    if (!open) {
      setPendingAction(null);
      setResidence("");
    }
  };

  return (
    <Dialog open={isIdentityDialogOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary" /> Quick Verify</DialogTitle>
          <DialogDescription>
            You’re one line away from posting. We’ll use your sign-in name and phone. Just tell us your apartment.
          </DialogDescription>
        </DialogHeader>

        {!firebaseUser ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">We need to know it's you. Sign in to continue.</p>
            <div className="flex gap-2">
              <Link href="/signin"><Button>Sign in</Button></Link>
              <Link href="/"><Button variant="ghost">Not now</Button></Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-sm">
              <div><span className="text-muted-foreground">Name:</span> {displayName || "(from your account)"}</div>
              {phoneNumber && <div><span className="text-muted-foreground">Phone:</span> {phoneNumber}</div>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Your apartment</label>
              <Input
                placeholder="e.g., A-12B or 'Tower A 12B'"
                value={residence}
                onChange={(e) => setResidence(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">We’ll parse tower and flat automatically.</p>
            </div>

            <DialogFooter className="flex gap-2">
              <Link href="/profile"><Button variant="secondary">Open full profile</Button></Link>
              <Button onClick={quickVerify} disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Verify now
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
