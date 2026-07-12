# Firebase Hosting Setup Guide

## Project Configuration

- **Firebase Project ID**: `vanir-f4260`
- **Hosting URL**: `https://vanir-f4260.web.app`

## Files Created

1. **firebase.json** - Firebase hosting configuration
2. **.firebaserc** - Firebase project reference
3. **.github/workflows/firebase-deploy.yml** - Automated deployment workflow

## Setup Steps

### 1. Add GitHub Secret

You need to add the Firebase Service Account as a secret in GitHub:

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Name: `FIREBASE_SERVICE_ACCOUNT_VANIR_F4260`
5. Value: Paste the complete Firebase Service Account JSON

### 2. Enable Firebase Hosting

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project `vanir-f4260`
3. Navigate to **Hosting**
4. Click **Get started** (if not already set up)

### 3. GitHub Actions Deployment

The workflow automatically deploys when you:
- Push to `main` branch
- Push to `develop` branch

You can also manually trigger from GitHub Actions tab.

## Deployment Status

View deployment logs at:
- GitHub: **Actions** tab in your repository
- Firebase: **Hosting** section in Firebase Console

## Local Testing (Optional)

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Test local build
pnpm build

# Deploy locally
firebase deploy --only hosting
```

## Troubleshooting

- **403 Forbidden error**: Check that the Firebase Service Account secret is correctly added
- **Build fails**: Run `pnpm build` locally to identify issues
- **Deployment stuck**: Check GitHub Actions logs for details

## Next Steps

1. Add the GitHub Secret (most important!)
2. Push a commit to trigger the deployment
3. Monitor the deployment in GitHub Actions and Firebase Console
