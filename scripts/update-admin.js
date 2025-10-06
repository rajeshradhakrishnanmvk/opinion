const admin = require('firebase-admin');
const serviceAccount = require('../nammal-e6351-firebase-adminsdk-fbsvc-0862413ed0.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'nammal-e6351'
});

const db = admin.firestore();

async function updateAdmin() {
  try {
    await db.collection('profiles').doc('4aKf3r5doRewP6GT3G7K5XTPjEN2').update({
      role: 'admin',
      assignedBy: 'system',
      assignedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log('Admin role updated successfully in Firestore!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

updateAdmin();