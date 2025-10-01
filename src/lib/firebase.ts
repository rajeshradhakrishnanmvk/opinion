'use client';

import {initializeApp, getApp, getApps} from 'firebase/app';
import {getDatabase} from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyCk7_1jtouKGdp0CH1-9u8povL3OBVr-KA",
  authDomain: "opinion-8675.firebaseapp.com",
  projectId: "opinion-8675",
  storageBucket: "opinion-8675.firebasestorage.app",
  messagingSenderId: "480541249077",
  appId: "1:480541249077:web:aba10977641fc0c7b1eb7c"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getDatabase(app);

export {app, db};
