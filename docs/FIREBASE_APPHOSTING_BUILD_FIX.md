# Firebase App Hosting Build Fix

## Problem

The Next.js application was failing to build on Firebase App Hosting with the following error:

```
Error: ENOENT: no such file or directory, open '/workspace/out/standalone/out/routes-manifest.json'
```

## Root Cause

The issue was caused by a Next.js configuration that was incompatible with Firebase App Hosting:

1. **Static Export Configuration**: The `next.config.ts` had `output: 'export'` which creates a static export build
2. **Custom Directory**: Using `distDir: 'out'` was conflicting with Firebase App Hosting's build management
3. **Missing Routes Manifest**: Static exports don't generate the `routes-manifest.json` file that Firebase App Hosting requires

## Solution

### 1. Updated `next.config.ts`

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

### 2. Enhanced `apphosting.yaml`

Added explicit Node.js version and package manager configuration:

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

## Key Changes Made

1. **Removed Static Export**: Commented out `output: 'export'` to enable server-side rendering
2. **Removed Custom Build Directory**: Let Firebase App Hosting manage the build output
3. **Added Runtime Configuration**: Specified Node.js version and package manager
4. **Preserved Required Settings**: Kept image optimization and routing configurations

## Verification

The fix was verified by:

1. **Local Build Test**: Successfully ran `NODE_ENV=production npm run build`
2. **Routes Manifest Check**: Confirmed `routes-manifest.json` is now generated at `.next/routes-manifest.json`
3. **Build Output Analysis**: Verified both static and dynamic routes are properly configured

## Build Output After Fix

```
Route (app)                                 Size  First Load JS    
┌ ○ /                                     204 kB         313 kB
├ ○ /_not-found                            977 B         102 kB
└ ƒ /api/verify-identity                   135 B         101 kB

○  (Static)   prerendered as static content
ƒ  (Dynamic)  server-rendered on demand
```

## What This Enables

- **Server-Side Rendering**: Full Next.js SSR capabilities
- **API Routes**: Dynamic API endpoints work properly
- **Firebase Integration**: Full compatibility with Firebase services
- **Automatic Scaling**: Firebase App Hosting can manage instances
- **Optimized Performance**: Better caching and optimization strategies

## Important Notes

- Firebase App Hosting is different from Firebase Hosting
- App Hosting expects a full Next.js application, not a static export
- The build process is managed by Firebase, not by custom configurations
- Environment variables should be configured through Firebase console if needed

## Next Steps

1. Monitor the deployment in Firebase Console
2. Verify all functionality works in the deployed environment
3. Test dynamic routes and API endpoints
4. Configure any necessary environment variables through Firebase Console