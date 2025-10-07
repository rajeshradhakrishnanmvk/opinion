'use client';

import {useState, useEffect} from 'react';
import {firestore} from '@/lib/firebase';
import {collection, onSnapshot, addDoc, doc, updateDoc, getDocs} from 'firebase/firestore';
import type {Concern, User} from '@/lib/types';
import {initialConcerns} from '@/lib/data';
import {toast} from 'sonner';

export function useConcerns() {
  const [concerns, setConcerns] = useState<Concern[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const concernsRef = collection(firestore, 'concerns');

    const seedDatabase = async () => {
        const snapshot = await getDocs(concernsRef);
        if (snapshot.empty) {
            console.log("No concerns found in database, seeding with initial data.");
            for (const concern of initialConcerns) {
                await addDoc(concernsRef, {
                    ...concern,
                    isDeleted: false,
                });
            }
        }
    };

    seedDatabase().then(() => {
        const unsubscribe = onSnapshot(concernsRef, (snapshot) => {
            if (!snapshot.empty) {
                const concernsList: Concern[] = snapshot.docs.map(docSnapshot => ({
                    ...docSnapshot.data() as Omit<Concern, 'id'>,
                    id: docSnapshot.id,
                }));
                setConcerns(concernsList);
            } else {
                setConcerns([]);
            }
            setLoading(false);
        }, (error) => {
            console.error("Firestore read failed:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }).catch(err => {
        console.error("Firestore seeding check failed:", err);
        setLoading(false);
    });
}, []);

  const createConcern = async (title: string, description: string, user: User) => {
    const concernsRef = collection(firestore, 'concerns');
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
    try {
      await addDoc(concernsRef, newConcern);
      toast.success("Concern submitted successfully!");
    } catch (error) {
      toast.error("Failed to submit concern. Please try again.");
      console.error("Firestore write failed:", error);
    }
  };

  const upvoteConcern = async (concernId: string, user: User) => {
    if (!user) return;
  
    const concern = concerns.find(c => c.id === concernId);
    if (!concern) return;
  
    const upvotedBy = concern.upvotedBy || [];
  
    if (!upvotedBy.includes(user.apartmentNumber)) {
      const concernRef = doc(firestore, 'concerns', concernId);
      const newUpvotedBy = [...upvotedBy, user.apartmentNumber];
      
      try {
        await updateDoc(concernRef, {
          upvotes: (concern.upvotes || 0) + 1,
          upvotedBy: newUpvotedBy,
        });
      } catch (error) {
        console.error("Firestore upvote failed:", error);
      }
    }
  };

  return {concerns, loading, createConcern, upvoteConcern};
}
