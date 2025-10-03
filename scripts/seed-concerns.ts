// Seed script to add sample concerns with upvotedBy field
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
const serviceAccount = require('../nammal-e6351-firebase-adminsdk-fbsvc-0862413ed0.json');

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

const concerns = [
  {
    title: 'Sample Concern 1',
    description: 'This is a sample concern.',
    status: 'open',
    upvotedBy: [],
    createdAt: new Date().toISOString()
  },
  {
    title: 'Sample Concern 2',
    description: 'Another example concern.',
    status: 'closed',
    upvotedBy: [],
    createdAt: new Date().toISOString()
  }
];

async function seedConcerns() {
  for (const concern of concerns) {
    await db.collection('concerns').add(concern);
    console.log(`Seeded concern: ${concern.title}`);
  }
}

seedConcerns().then(() => {
  console.log('Seeding complete.');
  process.exit(0);
});
