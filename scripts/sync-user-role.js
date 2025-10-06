const admin = require('firebase-admin');

// Initialize Firebase Admin if not already done
if (!admin.apps.length) {
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
}

async function syncUserRoleToCustomClaims(uid, role) {
  try {
    await admin.auth().setCustomUserClaims(uid, { role });
    console.log(`Custom claims updated for user ${uid}: role = ${role}`);
  } catch (error) {
    console.error('Error updating custom claims:', error);
    throw error;
  }
}

// If called directly from command line
if (require.main === module) {
  const [uid, role] = process.argv.slice(2);
  
  if (!uid || !role) {
    console.error('Usage: node sync-user-role.js <uid> <role>');
    process.exit(1);
  }
  
  syncUserRoleToCustomClaims(uid, role)
    .then(() => {
      console.log('Role sync completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Role sync failed:', error);
      process.exit(1);
    });
}

module.exports = { syncUserRoleToCustomClaims };