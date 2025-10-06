"use client";

import * as React from "react";
import { useState } from "react";
import type { Concern } from "@/lib/types";
import { UserProvider, useUser } from "@/contexts/UserContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Header } from "@/components/Header";
import { ConcernCard } from "@/components/ConcernCard";
import { NewConcernDialog } from "@/components/NewConcernDialog";
import { IdentityVerificationDialog } from "@/components/IdentityVerificationDialog";
import { useConcernsFirestore as useConcerns } from "@/hooks/useConcernsFirestore";
import { Skeleton } from "@/components/ui/skeleton";

function OpinionApp() {
  const { concerns, loading, createConcern, upvoteConcern, softDeleteConcern, restoreConcern } = useConcerns();
  const { user, setIdentityDialogOpen, setPendingAction } = useUser();
  const { firebaseUser, profile } = useAuth();
  const [isNewConcernDialogOpen, setNewConcernDialogOpen] = useState(false);

  const handleCreateNewConcern = () => {
    // Only allow owners and admins to submit concerns
    if (!firebaseUser || !profile || !profile.verified) {
      setPendingAction(() => () => setNewConcernDialogOpen(true));
      setIdentityDialogOpen(true);
      return;
    }

    // Check role permissions - only owners and admins can submit
    if (profile.role !== 'owner' && profile.role !== 'admin') {
      return; // Silently ignore for tenants
    }

    setNewConcernDialogOpen(true);
  };

  const handleUpvote = (concernId: string) => {
    if (!firebaseUser || !profile || !profile.verified) return;
    upvoteConcern(concernId, { name: profile.fullName, apartmentNumber: profile.apartmentNumber });
  };

  const handleCreateConcern = (title: string, description: string) => {
    if (!firebaseUser || !profile || !profile.verified) return;
    createConcern(title, description, { name: profile.fullName, apartmentNumber: profile.apartmentNumber });
    setNewConcernDialogOpen(false);
  };

  const handleDeleteConcern = (concernId: string) => {
    if (!firebaseUser || profile?.role !== 'admin') return;
    softDeleteConcern(concernId, firebaseUser.uid);
  };

  const handleRestoreConcern = (concernId: string) => {
    if (!firebaseUser || profile?.role !== 'admin') return;
    restoreConcern(concernId);
  };

  const sortedConcerns = [...concerns].sort((a, b) => b.upvotes - a.upvotes);
  const canSubmitConcerns = profile?.role === 'owner' || profile?.role === 'admin';

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex-1 p-4 md:p-6 lg:p-8">
        <div className="mx-auto w-full max-w-4xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold font-headline">Community Board</h1>
              <p className="text-muted-foreground">
                {profile?.role === 'tenant' 
                  ? "Browse and upvote resident concerns." 
                  : "Browse, upvote, and submit resident concerns."
                }
              </p>
            </div>
            {canSubmitConcerns && (
              <Button onClick={handleCreateNewConcern}>
                <Plus className="mr-2 h-4 w-4" />
                Submit a Concern
              </Button>
            )}
          </div>

          <div className="grid gap-6">
            {loading ? (
              <>
                <Skeleton className="w-full h-[150px] rounded-lg" />
                <Skeleton className="w-full h-[150px] rounded-lg" />
                <Skeleton className="w-full h-[150px] rounded-lg" />
              </>
            ) : (
              sortedConcerns.map((concern) => (
                <ConcernCard
                  key={concern.id}
                  concern={concern}
                  onUpvote={() => handleUpvote(concern.id)}
                  onDelete={handleDeleteConcern}
                  onRestore={handleRestoreConcern}
                />
              ))
            )}
          </div>
        </div>
      </main>
      <NewConcernDialog
        open={isNewConcernDialogOpen}
        onOpenChange={setNewConcernDialogOpen}
        onCreateConcern={handleCreateConcern}
      />
      <IdentityVerificationDialog />
    </div>
  );
}

export default function Home() {
  return (
    <UserProvider>
      <OpinionApp />
    </UserProvider>
  );
}
