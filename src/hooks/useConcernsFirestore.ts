'use client';

import { useState, useEffect, useCallback } from 'react';
import { firestore } from '@/lib/firebase';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  doc, 
  updateDoc, 
  getDocs, 
  query, 
  orderBy 
} from 'firebase/firestore';
import type { Concern, User } from '@/lib/types';
import { initialConcerns } from '@/lib/data';
import { toast } from 'sonner';

// Firestore collection name
const CONCERNS_COLLECTION = 'concerns';

export function useConcernsFirestore() {
  const [concerns, setConcerns] = useState<Concern[]>([]);
  const [loading, setLoading] = useState(true);

  // Seed if empty (one-time)
  const seedIfEmpty = useCallback(async () => {
    const snapshot = await getDocs(collection(firestore, CONCERNS_COLLECTION));
    if (snapshot.empty) {
      for (const concern of initialConcerns) {
        await addDoc(collection(firestore, CONCERNS_COLLECTION), {
          ...concern,
          createdAt: concern.createdAt, // already ISO string
          isDeleted: false, // Add soft delete flag
          // store upvotedBy as array directly
        });
      }
    }
  }, []);

  const loadConcerns = useCallback(async (includeDeleted = false) => {
    try {
      setLoading(true);
      const concernsRef = collection(firestore, CONCERNS_COLLECTION);
      
      // Use simple query without complex filtering
      const q = query(concernsRef, orderBy("createdAt", "desc"));
      
      const snapshot = await getDocs(q);
      const allConcerns: Concern[] = snapshot.docs.map(d => ({
        id: d.id,
        ...(d.data() as Omit<Concern, 'id'>)
      }));
      
      // Filter client-side based on includeDeleted parameter
      const filteredConcerns = includeDeleted 
        ? allConcerns 
        : allConcerns.filter(concern => !concern.isDeleted);
      
      setConcerns(filteredConcerns);
      setLoading(false);
    } catch (e) {
      console.error('Firestore concerns load failed', e);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let unsub: () => void | undefined;
    (async () => {
      try {
        await seedIfEmpty();
        // Use simpler listener without complex query to avoid index issues
        const concernsRef = collection(firestore, CONCERNS_COLLECTION);
        
        unsub = onSnapshot(concernsRef, (snap) => {
          const list: Concern[] = snap.docs
            .map(d => ({
              id: d.id,
              ...(d.data() as Omit<Concern, 'id'>)
            }))
            .filter(concern => !concern.isDeleted) // Filter client-side to avoid index requirement
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); // Sort client-side
          
          setConcerns(list);
          setLoading(false);
        }, (err) => {
          console.error('Firestore listener error', err);
          setLoading(false);
        });
      } catch (e) {
        console.error('Firestore concerns init failed', e);
        setLoading(false);
      }
    })();
    return () => { if (unsub) unsub(); };
  }, [seedIfEmpty]);

  const createConcern = async (title: string, description: string, user: User) => {
    try {
      const newConcern: Omit<Concern, 'id'> = {
        title,
        description,
        authorName: user.name,
        apartmentNumber: user.apartmentNumber,
        upvotes: 1,
        upvotedBy: [user.apartmentNumber],
        createdAt: new Date().toISOString(),
        isDeleted: false,
      };
      await addDoc(collection(firestore, CONCERNS_COLLECTION), newConcern);
      toast.success('Concern submitted successfully!');
    } catch (e) {
      console.error('Firestore create concern failed', e);
      toast.error('Failed to submit concern. Please try again.');
    }
  };

  const upvoteConcern = async (concernId: string, user: User) => {
    const existing = concerns.find(c => c.id === concernId);
    if (!existing) return;
    if (existing.upvotedBy.includes(user.apartmentNumber)) return; // already upvoted
    try {
      const ref = doc(firestore, CONCERNS_COLLECTION, concernId);
      const updatedUpvotedBy = [...existing.upvotedBy, user.apartmentNumber];
      await updateDoc(ref, {
        upvotes: updatedUpvotedBy.length,
        upvotedBy: updatedUpvotedBy,
      });
    } catch (e) {
      console.error('Firestore upvote failed', e);
    }
  };

  const softDeleteConcern = async (concernId: string, deletedBy: string) => {
    try {
      const ref = doc(firestore, CONCERNS_COLLECTION, concernId);
      await updateDoc(ref, {
        isDeleted: true,
        deletedAt: new Date().toISOString(),
        deletedBy: deletedBy,
      });
      toast.success('Concern deleted successfully');
    } catch (e) {
      console.error('Firestore soft delete failed', e);
      toast.error('Failed to delete concern');
    }
  };

  const restoreConcern = async (concernId: string) => {
    try {
      const ref = doc(firestore, CONCERNS_COLLECTION, concernId);
      await updateDoc(ref, {
        isDeleted: false,
        deletedAt: null,
        deletedBy: null,
      });
      toast.success('Concern restored successfully');
    } catch (e) {
      console.error('Firestore restore failed', e);
      toast.error('Failed to restore concern');
    }
  };

  return { 
    concerns, 
    loading, 
    createConcern, 
    upvoteConcern, 
    softDeleteConcern, 
    restoreConcern, 
    loadConcerns 
  };
}
