'use client';

import {initializeApp, getApp, getApps} from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || '',
};

// Only initialize Firebase on the client side
let app: any = null;
let firestore: any = null;
let auth: any = null;
let storage: any = null;

if (typeof window !== 'undefined') {
  // Client-side initialization
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  firestore = getFirestore(app);
  auth = getAuth(app);
  storage = getStorage(app);
}

export {app, firestore, auth, storage};
