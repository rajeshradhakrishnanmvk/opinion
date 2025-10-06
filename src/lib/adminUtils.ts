import { firestore } from './firebase';
import { collection, getDocs, doc, updateDoc, getDoc } from 'firebase/firestore';
import { Profile, UserRole } from './types';

export interface UserWithId extends Profile {
  id: string;
  email?: string;
}

export async function getAllUsers(): Promise<UserWithId[]> {
  const profilesRef = collection(firestore, 'profiles');
  const snapshot = await getDocs(profilesRef);
  
  const users: UserWithId[] = [];
  snapshot.forEach((doc) => {
    const data = doc.data() as Profile;
    users.push({
      id: doc.id,
      ...data
    });
  });
  
  return users;
}

export async function assignRole(
  userId: string, 
  role: UserRole, 
  assignedByUserId: string
): Promise<void> {
  const userRef = doc(firestore, 'profiles', userId);
  
  await updateDoc(userRef, {
    role: role,
    assignedBy: assignedByUserId,
    assignedAt: new Date()
  });
}

export async function isUserAdmin(userId: string): Promise<boolean> {
  const userRef = doc(firestore, 'profiles', userId);
  const userDoc = await getDoc(userRef);
  
  if (!userDoc.exists()) {
    return false;
  }
  
  const userData = userDoc.data() as Profile;
  return userData.role === 'admin';
}

export async function removeRole(userId: string): Promise<void> {
  const userRef = doc(firestore, 'profiles', userId);
  
  await updateDoc(userRef, {
    role: null,
    assignedBy: null,
    assignedAt: null
  });
}