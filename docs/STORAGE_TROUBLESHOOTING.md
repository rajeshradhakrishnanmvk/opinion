# Firebase Storage Access Troubleshooting

## Common Issues and Solutions

### Issue 1: "Firebase Storage has not been set up on project"

**Error**: Firebase Storage needs to be enabled in the Firebase Console.

**Solution**: 
1. Go to [Firebase Console - Storage](https://console.firebase.google.com/project/nammal-e6351/storage)
2. Click "Get Started"
3. Choose "Start in test mode" (we'll deploy custom rules after)
4. Select location: `asia-south1` (same as Firestore)

### Issue 2: "Permission denied" when uploading files

**Error**: User doesn't have the correct role or custom claims.

**Solutions**:
1. Verify user has `admin` or `owner` role in custom claims
2. Check Firebase Auth custom claims: `request.auth.token.role`
3. Ensure user is authenticated before attempting upload

**Debug Custom Claims**:
```javascript
// In browser console after login
auth.currentUser.getIdTokenResult().then(token => {
  console.log('Custom claims:', token.claims);
});
```

### Issue 3: "File size too large" error

**Error**: File exceeds 5MB limit.

**Solution**: 
- Ensure PDF files are under 5MB
- Client-side validation is in place
- Server-side Storage rules enforce the limit

### Issue 4: "Invalid file type" error

**Error**: Only PDF files are allowed.

**Solution**:
- Only upload files with MIME type `application/pdf`
- File extension should be `.pdf`
- Storage rules enforce PDF-only uploads

## Verification Steps

### 1. Check User Role
```javascript
// In browser console
firebase.auth().currentUser.getIdTokenResult().then(result => {
  console.log('User role:', result.claims.role);
});
```

### 2. Test File Upload
1. Login as admin user (`+918157933567`)
2. Navigate to Files page
3. Try uploading a small PDF file
4. Check browser console for any errors

### 3. Verify Storage Rules
- Storage rules should allow read/write for admin/owner roles
- Rules should enforce 5MB limit and PDF-only uploads

## Environment Configuration

### Required Environment Variables
```
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=nammal-e6351.appspot.com
```

### Firebase Configuration
```javascript
// In src/lib/firebase.ts
import { getStorage } from 'firebase/storage';
const storage = getStorage(app);
```

## Manual Steps Required

1. **Enable Firebase Storage** (REQUIRED):
   - Visit: https://console.firebase.google.com/project/nammal-e6351/storage
   - Click "Get Started"
   - Choose location: `asia-south1`

2. **Deploy Storage Rules** (after enabling):
   ```bash
   cd /workspaces/opinion
   firebase deploy --only storage
   ```

3. **Test Upload** (after deployment):
   - Login as admin
   - Upload test PDF file
   - Verify file appears in Storage console

## Current Status

- ✅ Firebase Auth with custom claims configured
- ✅ Firestore rules updated for role-based access
- ✅ Storage rules created locally
- ❌ Firebase Storage not yet enabled (manual step required)
- ❌ Storage rules not yet deployed (depends on enabling)

## Next Steps

1. Enable Firebase Storage in console (manual)
2. Deploy storage rules (`firebase deploy --only storage`)
3. Test file upload functionality
4. Verify role-based access control