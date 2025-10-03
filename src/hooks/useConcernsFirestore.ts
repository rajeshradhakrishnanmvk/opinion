'use client';

import { useState, useEffect, useCallback } from 'react';
import { firestore } from '@/lib/firebase';
import { collection, onSnapshot, addDoc, doc, updateDoc, serverTimestamp, getDocs } from 'firebase/firestore';
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
          // store upvotedBy as array directly
        });
      }
    }
  }, []);

  useEffect(() => {
    let unsub: () => void | undefined;
    (async () => {
      try {
        await seedIfEmpty();
        unsub = onSnapshot(collection(firestore, CONCERNS_COLLECTION), (snap) => {
          const list: Concern[] = snap.docs.map(d => ({
            id: d.id,
            ...(d.data() as Omit<Concern, 'id'>)
          }));
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

  return { concerns, loading, createConcern, upvoteConcern };
}
