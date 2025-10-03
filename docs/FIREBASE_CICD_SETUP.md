# Firebase CI/CD Setup Guide

This guide walks you through setting up automated deployment to Firebase using GitHub Actions.

## Prerequisites

1. **Firebase Project**: You already have the Firebase project `nammal-e6351` set up
2. **GitHub Repository**: Your code should be in a GitHub repository
3. **Firebase CLI**: Install locally for initial setup

## Step-by-Step Setup Instructions

### Step 1: Install Firebase CLI (if not already installed)

```bash
npm install -g firebase-tools
```

### Step 2: Generate Firebase Token

1. Login to Firebase CLI:
   ```bash
   firebase login
   ```

2. Generate a CI token:
   ```bash
   firebase login:ci
   ```
   
   This will output a token that looks like: `1//0abcdef...`
   
   **Save this token** - you'll need it for GitHub Secrets.

### Step 3: Get Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com/project/nammal-e6351)
2. Click on **Project Settings** (gear icon)
3. Go to **Service Accounts** tab
4. Click **Generate new private key**
5. Download the JSON file
6. **Important**: Keep this file secure and never commit it to version control

### Step 4: Set up GitHub Repository Secrets

Go to your GitHub repository → **Settings** → **Secrets and variables** → **Actions**

#### Add the following Repository Secrets:

1. **FIREBASE_TOKEN**
   - Name: `FIREBASE_TOKEN`
   - Value: The token from Step 2 (`1//0abcdef...`)

2. **GOOGLE_APPLICATION_CREDENTIALS_JSON**
   - Name: `GOOGLE_APPLICATION_CREDENTIALS_JSON`
   - Value: The entire contents of the service account JSON file from Step 3
   - **Format**: Copy and paste the entire JSON content (it should start with `{` and end with `}`)

#### Secret Setup Screenshots Guide:

1. **Navigate to Secrets**:
   ```
   GitHub Repository → Settings → Secrets and variables → Actions → New repository secret
   ```

2. **Add FIREBASE_TOKEN**:
   ```
   Name: FIREBASE_TOKEN
   Secret: 1//0abcdef... (your actual token)
   ```

3. **Add GOOGLE_APPLICATION_CREDENTIALS_JSON**:
   ```
   Name: GOOGLE_APPLICATION_CREDENTIALS_JSON
   Secret: {
     "type": "service_account",
     "project_id": "nammal-e6351",
     "private_key_id": "...",
     "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
     "client_email": "...",
     "client_id": "...",
     "auth_uri": "...",
     "token_uri": "...",
     "auth_provider_x509_cert_url": "...",
     "client_x509_cert_url": "..."
   }
   ```

### Step 5: Enable Firebase Services

1. **Enable Firebase Hosting**:
   ```bash
   firebase init hosting
   ```
   
   Or manually via console:
   - Go to [Firebase Console](https://console.firebase.google.com/project/nammal-e6351)
   - Click **Hosting** in the sidebar
   - Click **Get started**

2. **Firestore** (already configured):
   - Rules file: `firestore.rules`
   - Indexes file: `firestore.indexes.json`

### Step 6: Verify Configuration Files

Ensure these files are properly configured in your repository:

1. **firebase.json** ✅ (Already configured)
2. **next.config.ts** ✅ (Already configured for static export)
3. **GitHub workflow** ✅ (Already created)

### Step 7: Test the Deployment

1. **Manual Test** (optional):
   ```bash
   npm run build
   firebase deploy --project nammal-e6351
   ```

2. **Trigger CI/CD**:
   - Push to `main` branch, or
   - Merge a Pull Request to `main`

## Workflow Behavior

### Triggers
- **Push to main branch**: Immediate deployment
- **PR merge to main**: Deployment after merge

### Pipeline Steps
1. **Test & Lint**: TypeScript check, linting, build verification
2. **Deploy**: 
   - Firebase Hosting (Next.js app)
   - Firestore Rules
   - Firestore Indexes
3. **Release Notes**: Auto-generated release documentation
4. **Notifications**: Success/failure status

### Generated Assets
- **Release Notes**: `docs/releases/latest.md` and timestamped files
- **GitHub Releases**: Tagged releases with deployment info
- **Deployment URLs**: Automatically available at `https://nammal-e6351.web.app`

## Environment Variables

The workflow uses these environment variables:

- `NODE_VERSION`: '20' (Node.js version)
- `FIREBASE_PROJECT_ID`: 'nammal-e6351'

## Troubleshooting

### Common Issues

1. **Firebase Token Invalid**:
   ```
   Error: Invalid token
   ```
   **Solution**: Regenerate token with `firebase login:ci`

2. **Permission Denied**:
   ```
   Error: Permission denied
   ```
   **Solution**: Check service account permissions in Firebase Console

3. **Build Failures**:
   ```
   Error: Build failed
   ```
   **Solution**: Test build locally: `npm run build`

4. **Deployment URL Issues**:
   - Check Firebase Hosting is enabled
   - Verify `firebase.json` hosting configuration

### Debug Steps

1. **Check GitHub Actions Logs**:
   - Go to repository → Actions tab
   - Click on failed workflow run
   - Expand each step to see detailed logs

2. **Local Testing**:
   ```bash
   # Test build
   npm run build
   
   # Test Firebase deployment
   firebase deploy --project nammal-e6351 --debug
   ```

3. **Verify Secrets**:
   - Ensure secrets are set correctly in GitHub
   - Check for extra spaces or formatting issues

## Security Best Practices

1. **Never commit** Firebase service account keys to version control
2. **Rotate tokens** periodically
3. **Use least privilege** principle for service accounts
4. **Monitor deployment logs** for any security issues

## Additional Configuration

### For App Hosting (Advanced)

If you want to use Firebase App Hosting instead of Hosting:

1. Enable App Hosting in Firebase Console
2. Update workflow to use App Hosting deployment commands
3. Modify `firebase.json` for App Hosting configuration

### Custom Domains

1. Add custom domain in Firebase Console
2. Update DNS records as instructed
3. SSL certificates are automatically managed

---

## Quick Checklist

- [ ] Firebase CLI installed and logged in
- [ ] Firebase token generated (`firebase login:ci`)
- [ ] Service account key downloaded
- [ ] GitHub secrets configured:
  - [ ] `FIREBASE_TOKEN`
  - [ ] `GOOGLE_APPLICATION_CREDENTIALS_JSON`
- [ ] Firebase Hosting enabled
- [ ] Configuration files committed to repository
- [ ] First deployment tested

Once all steps are complete, your CI/CD pipeline will automatically deploy to Firebase whenever you push to the main branch!

## Support

For issues:
1. Check GitHub Actions logs
2. Review Firebase Console for project status
3. Test local deployment with Firebase CLI
4. Check this documentation for troubleshooting steps