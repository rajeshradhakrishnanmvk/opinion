# Firebase App Hosting Build Fix

## Problem

The Next.js application was failing to build and deploy with two main issues:

1. **Build Error**: Firebase App Hosting build failing with missing `routes-manifest.json`
2. **GitHub Actions Error**: `Directory 'out' for Hosting does not exist`

```
Error: ENOENT: no such file or directory, open '/workspace/out/standalone/out/routes-manifest.json'
Error: Directory 'out' for Hosting does not exist.
```

## Root Cause

The issues were caused by confusion between **Firebase Hosting** and **Firebase App Hosting**:

1. **Static Export Configuration**: The `next.config.ts` had `output: 'export'` which creates a static export build
2. **Custom Directory**: Using `distDir: 'out'` was conflicting with Firebase App Hosting's build management
3. **Mixed Deployment Services**: GitHub Actions was trying to deploy to Firebase Hosting while using App Hosting
4. **Missing Routes Manifest**: Static exports don't generate the `routes-manifest.json` file that Firebase App Hosting requires

## Solution

### 1. Updated `next.config.ts` - Fixed App Hosting Compatibility

**Before:**
```typescript
const nextConfig: NextConfig = {
  output: 'export',           // ❌ Not compatible with App Hosting
  distDir: 'out',            // ❌ Conflicts with App Hosting build management
  // ... other config
};
```

**After:**
```typescript
const nextConfig: NextConfig = {
  // Removed output: 'export' for Firebase App Hosting compatibility
  // Removed distDir: 'out' as App Hosting manages this
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  // ... other config
};
```

### 2. Updated `firebase.json` - Removed Hosting Configuration

**Before:**
```json
{
  "hosting": {
    "public": "out",           // ❌ Conflicted with App Hosting
    "ignore": [...],
    "rewrites": [...]
  },
  "firestore": {...}
}
```

**After:**
```json
{
  "firestore": {
    "database": "(default)",
    "location": "asia-south1",
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  }
}
```

### 3. Updated GitHub Actions - App Hosting Compatible

**Before:**
```yaml
- name: Deploy to Firebase Hosting
  uses: w9jds/firebase-action@master
  with:
    args: deploy --only hosting --project ${{ env.FIREBASE_PROJECT_ID }}  # ❌ Wrong service
```

**After:**
```yaml
- name: Deploy Firestore Rules
  uses: w9jds/firebase-action@master
  with:
    args: deploy --only firestore:rules --project ${{ env.FIREBASE_PROJECT_ID }}  # ✅ Config only

- name: App Hosting Info
  run: |
    echo "✅ Firestore configuration deployed"
    echo "🚀 Firebase App Hosting will automatically deploy the application"  # ✅ Auto-deployment
```

### 4. Enhanced `apphosting.yaml`

```yaml
# Settings to manage and configure a Firebase App Hosting backend.
runConfig:
  maxInstances: 1

# Explicitly specify Node.js version to match package.json
env:
  NODE_VERSION: "20"

# Build configuration for Next.js App Router
buildConfig:
  packageManager: "npm"
```

## Key Differences: Firebase Hosting vs Firebase App Hosting

| Feature | Firebase Hosting | Firebase App Hosting |
|---------|------------------|---------------------|
| **Purpose** | Static file hosting | Full-stack app hosting |
| **Deployment** | `firebase deploy --only hosting` | Automatic from GitHub |
| **Build Process** | Manual build → upload | Automatic build in cloud |
| **File Structure** | Requires `out/` directory | Uses source code directly |
| **Configuration** | `firebase.json` hosting section | `apphosting.yaml` |
| **URL Format** | `project-id.web.app` | `backend--project-id.region.hosted.app` |

## Architecture After Fix

```
GitHub Repository (main branch)
    ↓ (automatic trigger)
Firebase App Hosting
    ↓ (builds automatically)
Next.js Application with SSR
    ↓ (serves at)
https://opinion--nammal-e6351.asia-southeast1.hosted.app
https://nammal.in (custom domain)
```

## GitHub Actions Workflow

```yaml
1. test: Build & validate application
2. deploy: Deploy only Firestore rules/indexes  
3. Firebase App Hosting: Automatically deploys app from GitHub
4. release: Create release notes
5. notify: Send deployment notifications
```

## Verification

The fix was verified by:

1. **Local Build Test**: Successfully ran `NODE_ENV=production npm run build`
2. **Routes Manifest Check**: Confirmed `routes-manifest.json` is generated at `.next/routes-manifest.json`
3. **GitHub Actions**: Workflow now deploys without errors
4. **App Hosting**: Automatic deployment from GitHub works correctly

## Build Output After Fix

```
Route (app)                                 Size  First Load JS    
┌ ○ /                                     204 kB         313 kB
├ ○ /_not-found                            977 B         102 kB
└ ƒ /api/verify-identity                   135 B         101 kB

○  (Static)   prerendered as static content
ƒ  (Dynamic)  server-rendered on demand
```

## Deployment URLs

- **Primary App**: https://opinion--nammal-e6351.asia-southeast1.hosted.app
- **Custom Domain**: https://nammal.in
- **Firebase Console**: https://console.firebase.google.com/project/nammal-e6351

## What This Enables

- **Automatic Deployment**: Firebase App Hosting deploys directly from GitHub
- **Server-Side Rendering**: Full Next.js SSR capabilities
- **API Routes**: Dynamic API endpoints work properly
- **Firebase Integration**: Full compatibility with Firebase services
- **Automatic Scaling**: Firebase App Hosting manages instances automatically
- **Optimized Performance**: Better caching and optimization strategies
- **Simplified CI/CD**: No manual deployment steps required

## Important Notes

- **Firebase App Hosting ≠ Firebase Hosting**: They are completely different services
- **Automatic Deployment**: App Hosting builds and deploys automatically from GitHub
- **No Manual Deploy Commands**: Don't use `firebase deploy --only hosting` with App Hosting
- **Configuration**: Use `apphosting.yaml` instead of `firebase.json` hosting section
- **Build Management**: Firebase App Hosting manages the entire build process

## Next Steps

1. ✅ **Monitor App Hosting**: Check deployment in Firebase Console
2. ✅ **Verify Functionality**: Test all features in deployed environment  
3. ✅ **Check Custom Domain**: Ensure https://nammal.in works properly
4. ✅ **Configure Environment Variables**: Use Firebase Console if needed