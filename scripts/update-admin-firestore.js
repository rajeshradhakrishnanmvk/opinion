// Simple script to update admin role in Firestore
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, updateDoc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'nammal-e6351',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function updateAdminRole() {
  try {
    const userRef = doc(db, 'profiles', '4aKf3r5doRewP6GT3G7K5XTPjEN2');
    
    await updateDoc(userRef, {
      role: 'admin',
      assignedBy: 'system',
      assignedAt: new Date()
    });
    
    console.log('Admin role updated in Firestore successfully!');
  } catch (error) {
    console.error('Error updating admin role:', error);
  }
}

updateAdminRole();