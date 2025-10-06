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

async function createTestUser() {
  try {
    const firestore = admin.firestore();
    
    // Create a test user profile with default tenant role
    const testUserId = 'test-user-' + Date.now();
    const testProfile = {
      uid: testUserId,
      fullName: 'Test Tenant User',
      tower: 'A',
      apartmentNumber: '101',
      phone: '+911234567890',
      verified: false,
      role: 'tenant', // Default role
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    // Add to Firestore
    await firestore.collection('profiles').doc(testUserId).set(testProfile);
    console.log(`✓ Test user profile created: ${testUserId}`);
    
    // Set custom claims to tenant
    await admin.auth().setCustomUserClaims(testUserId, { role: 'tenant' });
    console.log(`✓ Custom claims set for test user: role = tenant`);
    
    console.log('Test user created successfully!');
    console.log('This demonstrates that new users default to "tenant" role.');
    
  } catch (error) {
    console.error('Error creating test user:', error);
  }
}

// Run the test
createTestUser()
  .then(() => {
    console.log('Test completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Test failed:', error);
    process.exit(1);
  });