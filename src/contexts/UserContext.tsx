"use client";

import { createContext, useContext, useState, ReactNode, Dispatch, SetStateAction } from "react";
import type { User } from "@/lib/types";

type PendingAction = (() => void) | null;

type UserContextType = {
  user: User | null;
  setUser: Dispatch<SetStateAction<User | null>>;
  isIdentityDialogOpen: boolean;
  setIdentityDialogOpen: Dispatch<SetStateAction<boolean>>;
  pendingAction: PendingAction;
  setPendingAction: Dispatch<SetStateAction<PendingAction>>;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isIdentityDialogOpen, setIdentityDialogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);

  const value = {
    user,
    setUser,
    isIdentityDialogOpen,
    setIdentityDialogOpen,
    pendingAction,
    setPendingAction,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
