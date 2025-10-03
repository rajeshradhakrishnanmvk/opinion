# 🚀 Firebase CI/CD Pipeline - Complete Setup

This repository now includes a fully automated CI/CD pipeline for deploying to Firebase. Here's what was created and configured:

## 📁 Created Files

### GitHub Actions Workflows
- **`.github/workflows/firebase-deploy.yml`** - Main CI/CD pipeline for Firebase Hosting
- **`.github/workflows/firebase-apphosting.yml.example`** - Alternative for Firebase App Hosting (SSR)

### Documentation
- **`docs/FIREBASE_CICD_SETUP.md`** - Complete setup instructions
- **`docs/releases/README.md`** - Release notes documentation

### Scripts
- **`scripts/deploy.sh`** - Local deployment and testing script (executable)

### Modified Files
- **`firebase.json`** - Added hosting configuration
- **`next.config.ts`** - Configured for static export
- **`package.json`** - Added deployment scripts

## 🔧 Quick Setup Steps

### 1. Generate Firebase Token
```bash
firebase login:ci
```
Copy the generated token (starts with `1//`)

### 2. Get Service Account Key
1. Go to [Firebase Console](https://console.firebase.google.com/project/nammal-e6351/settings/serviceaccounts/adminsdk)
2. Generate new private key
3. Download the JSON file

### 3. Add GitHub Secrets
Go to: **Repository Settings → Secrets and variables → Actions**

Add these secrets:
- **`FIREBASE_TOKEN`**: The token from step 1
- **`GOOGLE_APPLICATION_CREDENTIALS_JSON`**: Contents of JSON file from step 2

### 4. Enable Firebase Hosting
```bash
firebase init hosting
# Or enable via Firebase Console
```

## 🚀 Deployment Options

### Automatic Deployment (CI/CD)
- **Trigger**: Push to `main` branch or merge PR to `main`
- **Process**: Test → Build → Deploy → Release Notes
- **URL**: https://nammal-e6351.web.app

### Manual Deployment
```bash
# Full pipeline
npm run deploy

# Individual steps
npm run deploy:check    # Check dependencies
npm run deploy:build    # Build only
npm run deploy:preview  # Local preview
```

## 📋 Pipeline Features

### ✅ Automated Testing
- TypeScript type checking
- ESLint code quality checks
- Build verification

### 🚀 Deployment
- Firebase Hosting (Next.js static export)
- Firestore Security Rules
- Firestore Indexes

### 📝 Release Management
- Auto-generated release notes
- GitHub releases with tags
- Deployment history tracking
- Change logs since last deployment

### 🔔 Notifications
- Deployment success/failure status
- Live URL information
- Error reporting

## 📊 Monitoring

### Release Notes Location
- **Latest**: `docs/releases/latest.md`
- **Historical**: `docs/releases/release_YYYY-MM-DD_HH-MM-SS.md`
- **GitHub Releases**: Repository releases page

### Deployment URLs
- **Live Site**: https://nammal-e6351.web.app
- **Firebase Console**: https://console.firebase.google.com/project/nammal-e6351

## 🛠 Local Development

### Development Server
```bash
npm run dev  # Runs on http://localhost:9002
```

### Build Testing
```bash
npm run build          # Build for production
npm run deploy:preview # Preview build locally
```

### Firebase Emulation
```bash
firebase emulators:start  # Start all emulators
firebase serve           # Serve hosting locally
```

## 🔄 Workflow Behavior

### Triggers
- **Push to main**: Immediate deployment
- **PR merge**: Deployment after successful merge
- **Manual**: Can be triggered from GitHub Actions tab

### Pipeline Steps
1. **Checkout** code from repository
2. **Setup** Node.js environment
3. **Install** dependencies with `npm ci`
4. **Test** with TypeScript check and linting
5. **Build** application for production
6. **Deploy** to Firebase services
7. **Generate** release notes and documentation
8. **Create** GitHub release
9. **Notify** of deployment status

## 📁 Project Structure Updates

```
opinion/
├── .github/workflows/          # CI/CD workflows
│   ├── firebase-deploy.yml     # Main deployment pipeline
│   └── firebase-apphosting.yml.example
├── docs/                       # Documentation
│   ├── FIREBASE_CICD_SETUP.md  # Setup guide
│   └── releases/               # Auto-generated release notes
├── scripts/                    # Deployment scripts
│   └── deploy.sh              # Local deployment tool
├── firebase.json              # Firebase configuration (updated)
├── next.config.ts            # Next.js config (updated for static export)
└── package.json             # Added deployment scripts
```

## 🔒 Security

- Service account keys stored securely in GitHub Secrets
- No sensitive data in repository
- Least privilege access configuration
- Automated security rule deployment

## 📞 Support

For issues:
1. Check [Setup Guide](docs/FIREBASE_CICD_SETUP.md) troubleshooting section
2. Review GitHub Actions workflow logs
3. Test local deployment: `npm run deploy:build`
4. Verify Firebase Console project status

---

## 🎯 Next Steps

1. **Follow the setup guide** in `docs/FIREBASE_CICD_SETUP.md`
2. **Configure GitHub Secrets** with Firebase credentials
3. **Push to main branch** to trigger first deployment
4. **Monitor the deployment** in GitHub Actions tab
5. **Visit your live site** at https://nammal-e6351.web.app

Your CI/CD pipeline is ready! 🎉