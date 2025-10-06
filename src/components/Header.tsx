"use client";

import { MessageSquareText } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

export function Header() {
  const { firebaseUser, profile, logout } = useAuth();
  return (
    <header className="flex h-16 items-center border-b bg-card px-4 md:px-6">
      <div className="flex items-center gap-2 font-semibold">
        <MessageSquareText className="h-6 w-6 text-primary" />
        <Link href="/" className="text-lg font-headline">Opinion</Link>
      </div>
      <div className="ml-auto flex items-center gap-3">
        {!firebaseUser && (
          <Link href="/signin">
            <Button variant="outline" size="sm">Sign in</Button>
          </Link>
        )}
        {firebaseUser && (
          <>
            <Link href="/profile">
              <Button variant="ghost" size="sm">
                {profile?.verified ? "Profile" : "Verify Profile"}
              </Button>
            </Link>
            <Button size="sm" onClick={() => logout()}>Logout</Button>
          </>
        )}
      </div>
    </header>
  );
}
