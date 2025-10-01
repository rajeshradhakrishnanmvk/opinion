'use client';

import {initializeApp, getApp, getApps} from 'firebase/app';
import {getDatabase} from 'firebase/database';

const firebaseConfig = {
  projectId: 'studio-5115947685-97557',
  appId: '1:804290117937:web:d61a0bdecccea26a4c3010',
  apiKey: 'AIzaSyCVMlDLH-bXFIuUlLdzItZ2BEbIupEgm-o',
  authDomain: 'studio-5115947685-97557.firebaseapp.com',
  databaseURL: 'https://studio-5115947685-97557-default-rtdb.firebaseio.com',
  measurementId: '',
  messagingSenderId: '804290117937',
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getDatabase(app);

export {app, db};
