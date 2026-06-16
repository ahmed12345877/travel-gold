#!/bin/bash
# 🛠️ Firebase Storage Setup Checklist
# استخدم هذا الملف للتحقق من إعدادات Firebase Storage

echo "🔍 Checking Firebase Storage Configuration..."
echo ""

# 1. التحقق من وجود Service Account JSON
echo "1️⃣  Checking FIREBASE_SERVICE_ACCOUNT_JSON..."
if [ -z "$FIREBASE_SERVICE_ACCOUNT_JSON" ]; then
    echo "❌ FIREBASE_SERVICE_ACCOUNT_JSON is NOT set"
    echo "   Add this to your Firebase App Hosting environment variables:"
    echo "   → Go to Firebase Console > Project Settings > Environment Variables"
    echo "   → Add FIREBASE_SERVICE_ACCOUNT_JSON with your service account JSON"
else
    # Check if it's valid JSON
    echo "$FIREBASE_SERVICE_ACCOUNT_JSON" | jq '.' > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        PROJECT_ID=$(echo "$FIREBASE_SERVICE_ACCOUNT_JSON" | jq -r '.project_id')
        echo "✅ FIREBASE_SERVICE_ACCOUNT_JSON is configured"
        echo "   Project ID: $PROJECT_ID"
    else
        echo "❌ FIREBASE_SERVICE_ACCOUNT_JSON is NOT valid JSON"
    fi
fi

echo ""

# 2. التحقق من Storage Bucket
echo "2️⃣  Checking FIREBASE_STORAGE_BUCKET..."
if [ -z "$FIREBASE_STORAGE_BUCKET" ]; then
    echo "❌ FIREBASE_STORAGE_BUCKET is NOT set (optional, but recommended)"
    echo "   If not set, it will be derived from project_id:"
    if [ ! -z "$FIREBASE_SERVICE_ACCOUNT_JSON" ]; then
        DERIVED_BUCKET=$(echo "$FIREBASE_SERVICE_ACCOUNT_JSON" | jq -r '.project_id').appspot.com
        echo "   Derived bucket: $DERIVED_BUCKET"
    fi
else
    echo "✅ FIREBASE_STORAGE_BUCKET is configured: $FIREBASE_STORAGE_BUCKET"
fi

echo ""

# 3. التحقق من أن المشروع في الإنتاج
echo "3️⃣  Checking NODE_ENV..."
if [ "$NODE_ENV" = "production" ]; then
    echo "✅ Running in production mode"
else
    echo "⚠️  Running in development mode (NODE_ENV=$NODE_ENV)"
    echo "   Firebase will be used as primary, fallback to local /uploads/"
fi

echo ""

# 4. التحقق من أن Storage API مفعّلة
echo "4️⃣  Checking if Google Cloud Storage API is enabled..."
if [ ! -z "$FIREBASE_SERVICE_ACCOUNT_JSON" ]; then
    PROJECT_ID=$(echo "$FIREBASE_SERVICE_ACCOUNT_JSON" | jq -r '.project_id')
    echo "   To enable, visit:"
    echo "   https://console.cloud.google.com/apis/library/storage-api.googleapis.com?project=$PROJECT_ID"
fi

echo ""

# 5. التحقق من صلاحيات IAM
echo "5️⃣  Checking IAM Permissions..."
if [ ! -z "$FIREBASE_SERVICE_ACCOUNT_JSON" ]; then
    SERVICE_ACCOUNT=$(echo "$FIREBASE_SERVICE_ACCOUNT_JSON" | jq -r '.client_email')
    PROJECT_ID=$(echo "$FIREBASE_SERVICE_ACCOUNT_JSON" | jq -r '.project_id')
    echo "   Service Account: $SERVICE_ACCOUNT"
    echo "   To grant permissions, visit:"
    echo "   https://console.cloud.google.com/iam-admin/iam?project=$PROJECT_ID"
    echo "   Required roles for $SERVICE_ACCOUNT:"
    echo "   - Storage Object Creator"
    echo "   - Storage Object Viewer"
fi

echo ""
echo "✅ Checklist complete!"
echo ""
echo "📚 See FIREBASE_STORAGE_FIX.md for more details"
