"use client";

import { MessageSquareText, Files } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { canViewFiles } from "@/lib/fileUtils";

export function Header() {
  const { firebaseUser, profile, logout, isAdmin } = useAuth();
  
  const getRoleBadgeVariant = (role?: string) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'owner': return 'default';
      case 'tenant': return 'secondary';
      default: return 'outline';
    }
  };

  const canAccessFiles = canViewFiles(profile?.role);

  return (
    <header className="flex h-16 items-center border-b bg-card px-4 md:px-6">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 font-semibold">
          <MessageSquareText className="h-6 w-6 text-primary" />
          <Link href="/" className="text-lg font-headline">Opinion</Link>
        </div>
        
        {firebaseUser && (
          <nav className="flex items-center gap-4">
            <Link href="/" className="text-sm hover:text-primary transition-colors">
              Community
            </Link>
            {canAccessFiles && (
              <Link href="/files" className="text-sm hover:text-primary transition-colors flex items-center gap-1">
                <Files className="h-4 w-4" />
                Files
              </Link>
            )}
          </nav>
        )}
      </div>
      
      <div className="ml-auto flex items-center gap-3">
        {!firebaseUser && (
          <Link href="/signin">
            <Button variant="outline" size="sm">Sign in</Button>
          </Link>
        )}
        {firebaseUser && (
          <>
            <div className="flex items-center gap-2">
              {profile?.role && (
                <Badge variant={getRoleBadgeVariant(profile.role)} className="text-xs">
                  {profile.role}
                </Badge>
              )}
              {profile?.verified && !profile?.role && (
                <Badge variant="outline" className="text-xs">Verified</Badge>
              )}
            </div>
            <Link href="/profile">
              <Button variant="ghost" size="sm">
                {isAdmin ? "Admin Panel" : profile?.verified ? "Profile" : "Verify Profile"}
              </Button>
            </Link>
            <Button size="sm" onClick={() => logout()}>Logout</Button>
          </>
        )}
      </div>
    </header>
  );
}
