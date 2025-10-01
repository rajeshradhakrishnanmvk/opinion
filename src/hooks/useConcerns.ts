'use client';

import {useState, useEffect} from 'react';
import {db} from '@/lib/firebase';
import {ref, onValue, set, push, serverTimestamp} from 'firebase/database';
import type {Concern, User} from '@/lib/types';
import {initialConcerns} from '@/lib/data';

export function useConcerns() {
  const [concerns, setConcerns] = useState<Concern[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const concernsRef = ref(db, 'concerns');
    const unsubscribe = onValue(concernsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const concernsList: Concern[] = Object.keys(data).map(key => ({
          ...data[key],
          id: key,
          // Ensure upvotedBy is always an array
          upvotedBy: data[key].upvotedBy ? Object.values(data[key].upvotedBy) : [],
        }));
        setConcerns(concernsList);
      } else {
        // Seed the database if it's empty
        initialConcerns.forEach(concern => {
          const newConcernRef = push(concernsRef);
          set(newConcernRef, concern);
        });
      }
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
      
      set(concernRef, {
        ...concern,
        upvotes: concern.upvotes + 1,
        upvotedBy: newUpvotedBy,
      });
    }
  };

  return {concerns, loading, createConcern, upvoteConcern};
}
