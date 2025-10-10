"use client";

import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { auth, firestore } from "@/lib/firebase";
import { onAuthStateChanged, signOut, User as FUser } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { Profile } from "@/lib/types";

type AuthContextValue = {
  firebaseUser: FUser | null;
  loading: boolean;
  profile: Profile | null;
  refreshProfile: () => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (uid: string) => {
    // Only run on client side
    if (typeof window === 'undefined' || !firestore) return;
    
    const ref = doc(firestore, "profiles", uid);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      setProfile(snap.data() as Profile);
    } else {
      // Create default tenant profile for new users
      const defaultProfile: Profile = {
        uid,
        fullName: '',
        tower: '',
        apartmentNumber: '',
        phone: firebaseUser?.phoneNumber || '',
        verified: false,
        role: 'tenant', // Default to tenant role
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      try {
        await setDoc(ref, defaultProfile);
        setProfile(defaultProfile);
      } catch (error) {
        console.error('Error creating default profile:', error);
        setProfile(null);
      }
    }
  }, [firebaseUser]);

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined' || !auth) {
      setLoading(false);
      return;
    }

    const unsub = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        await loadProfile(user.uid);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, [loadProfile]);

  const refreshProfile = useCallback(async () => {
    if (firebaseUser) await loadProfile(firebaseUser.uid);
  }, [firebaseUser, loadProfile]);

  const logout = async () => {
    if (typeof window !== 'undefined' && auth) {
      await signOut(auth);
    }
  };

  const isAdmin = profile?.role === 'admin';

  const value = useMemo(
    () => ({ firebaseUser, loading, profile, refreshProfile, logout, isAdmin }),
    [firebaseUser, loading, profile, refreshProfile, isAdmin]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
