"use client";

import { MessageSquareText } from "lucide-react";

export function Header() {
  return (
    <header className="flex h-16 items-center border-b bg-card px-4 md:px-6">
      <div className="flex items-center gap-2 font-semibold">
        <MessageSquareText className="h-6 w-6 text-primary" />
        <span className="text-lg font-headline">Opinion</span>
      </div>
    </header>
  );
}
