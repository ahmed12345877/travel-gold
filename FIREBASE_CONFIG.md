## Firebase Configuration Requirements

### Required Environment Variables

#### 1. **FIREBASE_SERVICE_ACCOUNT_JSON** (CRITICAL)
- **Description**: Complete Firebase service account JSON downloaded from Firebase Console
- **Format**: Valid JSON string with all required fields
- **Required Fields**:
  - `project_id` - Your Firebase project ID (e.g., "my-project-123456")
  - `client_email` - Service account email
  - `private_key` - Private key (multi-line string)
  - `type` - "service_account"
  - And other fields from the service account JSON

**Example (after downloading from Firebase Console)**:
```json
{
  "type": "service_account",
  "project_id": "my-project-123456",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-abc123@my-project-123456.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "..."
}
```

**How to set it**:
```bash
# Paste entire JSON as single-line string (escape quotes and newlines)
export FIREBASE_SERVICE_ACCOUNT_JSON='{"type":"service_account","project_id":"my-project-123456",...}'
```

#### 2. **FIREBASE_STORAGE_BUCKET** (STRONGLY RECOMMENDED)
- **Description**: Firebase Storage bucket name for file uploads
- **Format**: `project-id.appspot.com` (NOT `.firebasestorage.app`)
- **Default Behavior**: 
  - If not set, bucket name is derived from `project_id` in service account
  - This works but logging warns it's not recommended for production
- **Recommended**: Set explicitly for production reliability

**Example**:
```bash
export FIREBASE_STORAGE_BUCKET="my-project-123456.appspot.com"
```

#### 3. **VITE_FIREBASE_API_KEY** (For Client-side Auth)
- **Description**: Firebase API key for client-side authentication (different from service account key)
- **Where to find**: Firebase Console → Project Settings → Web API Key
- **Format**: Public API key string

**Example**:
```bash
export VITE_FIREBASE_API_KEY="AIzaSyD..."
```

#### 4. **VITE_FIREBASE_AUTH_DOMAIN** (For Client-side Auth)
- **Description**: Firebase authentication domain
- **Format**: `project-id.firebaseapp.com`
- **Where to find**: Firebase Console → Project Settings

**Example**:
```bash
export VITE_FIREBASE_AUTH_DOMAIN="my-project-123456.firebaseapp.com"
```

#### 5. **VITE_FIREBASE_PROJECT_ID** (For Client-side Auth)
- **Description**: Firebase project ID (same as in service account)
- **Format**: Project ID string
- **Where to find**: Firebase Console → Project Settings

**Example**:
```bash
export VITE_FIREBASE_PROJECT_ID="my-project-123456"
```

### Complete .env Example

```bash
# Server-side Firebase Admin SDK
FIREBASE_SERVICE_ACCOUNT_JSON='{"type":"service_account","project_id":"my-project-123456",...}'
FIREBASE_STORAGE_BUCKET="my-project-123456.appspot.com"

# Client-side Firebase SDK
VITE_FIREBASE_API_KEY="AIzaSyD..."
VITE_FIREBASE_AUTH_DOMAIN="my-project-123456.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="my-project-123456"
```

### Troubleshooting

#### ❌ "FIREBASE_SERVICE_ACCOUNT_JSON is not set"
- **Solution**: Download service account JSON from Firebase Console → Service Accounts → Generate new private key

#### ❌ "FIREBASE_SERVICE_ACCOUNT_JSON is not valid JSON"
- **Solution**: Ensure JSON is properly escaped when set as environment variable
- Check for: unescaped quotes, invalid newlines, trailing commas

#### ❌ "Storage bucket not set" or 404 errors on file upload
- **Solution**: Set `FIREBASE_STORAGE_BUCKET` environment variable explicitly
- Format must be: `project-id.appspot.com` (NOT `.firebasestorage.app`)

#### ❌ "Firebase Storage operations failing with permission errors"
- **Solution**: Ensure service account has Storage Admin role in Firebase Console
- Check Firestore Security Rules allow admin operations

### Security Notes

- **Never commit** FIREBASE_SERVICE_ACCOUNT_JSON to version control
- Use `.env.local` or secure environment variable management
- In production, use CI/CD secrets or cloud provider secret management (AWS Secrets Manager, Google Secret Manager, etc.)
- Rotate service account keys regularly
- Use least-privilege principle for service account roles
