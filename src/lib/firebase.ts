'use client';

import {initializeApp, getApp, getApps} from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getPublicFirebaseConfig, isPublicConfigValid } from './firebaseConfig';

const firebaseConfig = getPublicFirebaseConfig();

// Only initialize Firebase on the client side
let app: any = null;
let firestore: any = null;
let auth: any = null;
let storage: any = null;

if (typeof window !== 'undefined') {
  // Client-side initialization
  if (!isPublicConfigValid(firebaseConfig)) {
    // Help debug missing build-time env propagation
    // eslint-disable-next-line no-console
    console.error(
      'Firebase config is invalid on the client. Check NEXT_PUBLIC_* env vars. Values:',
      {
        hasApiKey: !!firebaseConfig.apiKey,
        hasAuthDomain: !!firebaseConfig.authDomain,
        hasProjectId: !!firebaseConfig.projectId,
        hasStorageBucket: !!firebaseConfig.storageBucket,
        hasMessagingSenderId: !!firebaseConfig.messagingSenderId,
        hasAppId: !!firebaseConfig.appId,
        hasMeasurementId: !!firebaseConfig.measurementId,
      }
    );
  } else {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    firestore = getFirestore(app);
    auth = getAuth(app);
    storage = getStorage(app);
  }
}

export {app, firestore, auth, storage};
