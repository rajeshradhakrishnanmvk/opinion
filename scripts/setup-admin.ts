// Script to set up initial admin user using Firebase Admin SDK
// Run with: npx ts-node scripts/setup-admin.ts

const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const serviceAccount = require('../nammal-e6351-firebase-adminsdk-fbsvc-0862413ed0.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'nammal-e6351'
});

const db = admin.firestore();

async function setupInitialAdmin() {
  // The UID of the user who should be made admin
  const adminUserId = '4aKf3r5doRewP6GT3G7K5XTPjEN2';
  
  try {
    const userRef = db.collection('profiles').doc(adminUserId);
    const userDoc = await userRef.get();
    
    if (userDoc.exists) {
      // Update existing profile with admin role
      await userRef.update({
        role: 'admin',
        assignedBy: 'system',
        assignedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      console.log(`Admin role assigned to existing user ${adminUserId}`);
    } else {
      // Create new profile with admin role
      await userRef.set({
        fullName: 'System Admin',
        tower: 'A',
        apartmentNumber: '001',
        phone: '+918157933567',
        verified: true,
        role: 'admin',
        assignedBy: 'system',
        assignedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      console.log(`New admin profile created for user ${adminUserId}`);
    }
    
    // Also set custom claims for the user
    await admin.auth().setCustomUserClaims(adminUserId, { role: 'admin' });
    console.log('Custom claims set for admin user');
    
    console.log('Initial admin setup completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error setting up initial admin:', error);
    process.exit(1);
  }
}

setupInitialAdmin();