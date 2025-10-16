# GitHub Secrets Setup Guide

## Problem
The GitHub Actions CI/CD pipeline needs access to Firebase configuration values during the build process. These values must be stored as GitHub Secrets and exposed as environment variables.

## Required GitHub Secrets

You need to add the following secrets to your GitHub repository:

1. Go to your GitHub repository: https://github.com/rajeshradhakrishnanmvk/opinion
2. Navigate to: **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret** for each of the following:

### Secrets to Add

| Secret Name | Value (from .env.local) |
|------------|-------------------------|
| `FIREBASE_API_KEY` | `AIzaSyADlCXVhX9-uZIBxGOFDiSaPMFErzGmMCM` |
| `FIREBASE_AUTH_DOMAIN` | `nammal-e6351.firebaseapp.com` |
| `FIREBASE_PROJECT_ID` | `nammal-e6351` |
| `FIREBASE_STORAGE_BUCKET` | `nammal-e6351.firebasestorage.app` |
| `MESSAGING_SENDER_ID` | `936974821441` |
| `APP_ID` | `1:936974821441:web:241025bd02b66236a4fec0` |
| `MEASUREMENT_ID` | `G-CREDJB71CB` |
| `FIREBASE_TOKEN` | *(Your existing Firebase CI token)* |

## Step-by-Step Instructions

### 1. Navigate to Secrets Settings
```
https://github.com/rajeshradhakrishnanmvk/opinion/settings/secrets/actions
```

### 2. Add Each Secret

For each secret listed above:

1. Click **"New repository secret"**
2. Enter the **Name** (e.g., `FIREBASE_API_KEY`)
3. Enter the **Secret** value (e.g., `AIzaSyADlCXVhX9-uZIBxGOFDiSaPMFErzGmMCM`)
4. Click **"Add secret"**

### 3. Verify Secrets

After adding all secrets, you should see them listed (values will be hidden):

```
✓ FIREBASE_API_KEY
✓ FIREBASE_AUTH_DOMAIN
✓ FIREBASE_PROJECT_ID
✓ FIREBASE_STORAGE_BUCKET
✓ MESSAGING_SENDER_ID
✓ APP_ID
✓ MEASUREMENT_ID
✓ FIREBASE_TOKEN
```

## Quick Copy-Paste Commands

If you prefer, you can use GitHub CLI to add secrets:

```bash
# Make sure you have GitHub CLI installed and authenticated
gh auth login

# Add all secrets at once
gh secret set FIREBASE_API_KEY -b "AIzaSyADlCXVhX9-uZIBxGOFDiSaPMFErzGmMCM"
gh secret set FIREBASE_AUTH_DOMAIN -b "nammal-e6351.firebaseapp.com"
gh secret set FIREBASE_PROJECT_ID -b "nammal-e6351"
gh secret set FIREBASE_STORAGE_BUCKET -b "nammal-e6351.firebasestorage.app"
gh secret set MESSAGING_SENDER_ID -b "936974821441"
gh secret set APP_ID -b "1:936974821441:web:241025bd02b66236a4fec0"
gh secret set MEASUREMENT_ID -b "G-CREDJB71CB"
```

## Why This Is Needed

### The Build-Time Problem

Next.js performs **Static Site Generation (SSG)** during `npm run build`. When this happens:

1. Next.js bundles and processes client components
2. It tries to inline `process.env.NEXT_PUBLIC_*` values into the JavaScript bundle
3. If these values are not available during build, they become `undefined`
4. The Firebase SDK initialization fails
5. The app crashes at runtime

### The Solution

By setting these values as GitHub Secrets and exposing them as environment variables in the GitHub Actions workflow:

1. The build process has access to all Firebase config values
2. Next.js successfully inlines them into the production bundle
3. The Firebase SDK initializes correctly
4. The app works properly in production

## Testing the Fix

After adding all secrets:

1. Commit and push any change to trigger the workflow
2. Watch the GitHub Actions build succeed
3. The deployed app should now work correctly

```bash
git add .
git commit -m "Update GitHub Actions workflow with all Firebase env vars"
git push
```

## Firebase App Hosting vs GitHub Actions

Note the difference:

- **Firebase App Hosting**: Uses Firebase secrets (already configured ✓)
- **GitHub Actions**: Uses GitHub repository secrets (needs to be configured)

Both need the same values, but they're stored in different places!

## Troubleshooting

### Build Still Fails?

Check the GitHub Actions logs for:
```
Firebase config is invalid on the client
```

If you still see this, verify:
1. All secrets are added to GitHub
2. Secret names match exactly (case-sensitive)
3. The workflow file references the secrets correctly

### How to Verify Secrets Are Set

Run this in your repository:

```bash
gh secret list
```

You should see all 7-8 secrets listed.
