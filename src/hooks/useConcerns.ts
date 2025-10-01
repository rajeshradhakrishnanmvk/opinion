'use client';

import {useState, useEffect} from 'react';
import {db} from '@/lib/firebase';
import {ref, onValue, set, push, update} from 'firebase/database';
import type {Concern, User} from '@/lib/types';
import {initialConcerns} from '@/lib/data';

export function useConcerns() {
  const [concerns, setConcerns] = useState<Concern[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const concernsRef = ref(db, 'concerns');
    const unsubscribe = onValue(concernsRef, (snapshot) => {
      const data = snapshot.val();
      if (snapshot.exists()) {
        const concernsList: Concern[] = Object.keys(data).map(key => ({
          ...data[key],
          id: key,
          upvotedBy: data[key].upvotedBy ? Object.values(data[key].upvotedBy) : [],
        }));
        setConcerns(concernsList);
      } else {
        // If the 'concerns' node does not exist or is empty, seed it.
        const initialData: {[key: string]: Omit<Concern, 'id'>} = {};
        initialConcerns.forEach((concern) => {
          const newConcernRef = push(concernsRef);
          if (newConcernRef.key) {
            initialData[newConcernRef.key] = concern;
          }
        });
        update(ref(db), { concerns: initialData });
      }
      setLoading(false);
    }, (error) => {
        console.error("Firebase read failed: " + error.message);
        setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const createConcern = (title: string, description: string, user: User) => {
    const concernsRef = ref(db, 'concerns');
    const newConcernRef = push(concernsRef);
    const newConcern: Omit<Concern, 'id'> = {
      title,
      description,
      authorName: user.name,
      apartmentNumber: user.apartmentNumber,
      upvotes: 1,
      upvotedBy: [user.apartmentNumber],
      createdAt: new Date().toISOString(),
    };
    set(newConcernRef, newConcern);
  };

  const upvoteConcern = (concernId: string, user: User) => {
    if (!user) return;
  
    const concern = concerns.find(c => c.id === concernId);
    if (!concern) return;
  
    const upvotedBy = concern.upvotedBy || [];
  
    if (!upvotedBy.includes(user.apartmentNumber)) {
      const concernRef = ref(db, `concerns/${concernId}`);
      const newUpvotedBy = [...upvotedBy, user.apartmentNumber];
      
      const updates: Partial<Concern> = {
          upvotes: (concern.upvotes || 0) + 1,
          upvotedBy: newUpvotedBy,
      }

      update(concernRef, updates);
    }
  };

  return {concerns, loading, createConcern, upvoteConcern};
}
