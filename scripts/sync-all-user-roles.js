const admin = require('firebase-admin');

// Initialize Firebase Admin
if (!admin.apps.length) {
  try {
    // Use environment variables for configuration
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'your-project-id';
    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || './firebase-service-account.json';
    
    let credential;
    try {
      credential = admin.credential.cert(require(serviceAccountPath));
    } catch {
      // Fallback for development - this file should be in .gitignore
      credential = admin.credential.cert(require('../firebase-service-account.json'));
    }
    
    admin.initializeApp({
      credential,
      projectId
    });
    console.log('Firebase Admin initialized successfully');
  } catch (error) {
    console.error('Error initializing Firebase Admin:', error);
    process.exit(1);
  }
}

async function syncAllUserRoles() {
  try {
    console.log('Starting user role synchronization...');
    
    // Get all profiles from Firestore
    const firestore = admin.firestore();
    const profilesSnapshot = await firestore.collection('profiles').get();
    
    const syncPromises = [];
    
    profilesSnapshot.forEach((doc) => {
      const profile = doc.data();
      const uid = doc.id;
      const role = profile.role || 'tenant'; // Default to tenant if no role
      
      console.log(`Syncing user ${uid} with role: ${role}`);
      
      // Update custom claims
      const syncPromise = admin.auth().setCustomUserClaims(uid, { role })
        .then(() => {
          console.log(`✓ Custom claims updated for ${uid}: ${role}`);
        })
        .catch((error) => {
          console.error(`✗ Failed to update claims for ${uid}:`, error.message);
        });
      
      syncPromises.push(syncPromise);
    });
    
    await Promise.all(syncPromises);
    console.log('User role synchronization completed!');
    
  } catch (error) {
    console.error('Error during synchronization:', error);
  }
}

// Run the sync
syncAllUserRoles()
  .then(() => {
    console.log('All done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Sync failed:', error);
    process.exit(1);
  });