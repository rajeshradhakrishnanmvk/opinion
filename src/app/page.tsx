"use client";

import * as React from "react";
import { useState } from "react";
import type { Concern, User } from "@/lib/types";
import { initialConcerns } from "@/lib/data";
import { UserProvider, useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Header } from "@/components/Header";
import { ConcernCard } from "@/components/ConcernCard";
import { NewConcernDialog } from "@/components/NewConcernDialog";
import { IdentityVerificationDialog } from "@/components/IdentityVerificationDialog";

function OpinionApp() {
  const [concerns, setConcerns] = useState<Concern[]>(initialConcerns);
  const { user, setIdentityDialogOpen, setPendingAction } = useUser();
  const [isNewConcernDialogOpen, setNewConcernDialogOpen] = useState(false);

  const handleCreateNewConcern = () => {
    if (!user) {
      setPendingAction(() => () => setNewConcernDialogOpen(true));
      setIdentityDialogOpen(true);
    } else {
      setNewConcernDialogOpen(true);
    }
  };

  const handleUpvote = (concernId: string) => {
    if (!user) return;

    setConcerns((prevConcerns) =>
      prevConcerns.map((c) => {
        if (c.id === concernId && !c.upvotedBy.includes(user.apartmentNumber)) {
          return {
            ...c,
            upvotes: c.upvotes + 1,
            upvotedBy: [...c.upvotedBy, user.apartmentNumber],
          };
        }
        return c;
      })
    );
  };

  const handleCreateConcern = (title: string, description: string) => {
    if (!user) return;
    const newConcern: Concern = {
      id: crypto.randomUUID(),
      title,
      description,
      authorName: user.name,
      apartmentNumber: user.apartmentNumber,
      upvotes: 1,
      upvotedBy: [user.apartmentNumber],
      createdAt: new Date(),
    };
    setConcerns((prev) => [newConcern, ...prev]);
    setNewConcernDialogOpen(false);
  };

  const sortedConcerns = [...concerns].sort((a, b) => b.upvotes - a.upvotes);

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex-1 p-4 md:p-6 lg:p-8">
        <div className="mx-auto w-full max-w-4xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold font-headline">Community Board</h1>
              <p className="text-muted-foreground">Browse and upvote resident concerns.</p>
            </div>
            <Button onClick={handleCreateNewConcern}>
              <Plus className="mr-2 h-4 w-4" />
              Submit a Concern
            </Button>
          </div>

          <div className="grid gap-6">
            {sortedConcerns.map((concern) => (
              <ConcernCard
                key={concern.id}
                concern={concern}
                onUpvote={() => handleUpvote(concern.id)}
              />
            ))}
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
