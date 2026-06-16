#!/bin/bash

# Firebase Storage Setup Verification Script
# هذا الـ script يتحقق من أن كل الإعدادات صحيحة

set -e

echo "╔════════════════════════════════════════════════════════════╗"
echo "║     Firebase Storage Setup Verification Script           ║"
echo "║     فحص إعدادات Firebase Storage                         ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
CHECKS_PASSED=0
CHECKS_FAILED=0
CHECKS_WARNING=0

# Helper functions
check_pass() {
    echo -e "${GREEN}✅ $1${NC}"
    ((CHECKS_PASSED++))
}

check_fail() {
    echo -e "${RED}❌ $1${NC}"
    ((CHECKS_FAILED++))
}

check_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
    ((CHECKS_WARNING++))
}

check_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1️⃣  فحص متغيرات البيئة (Environment Variables Check)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check for .env files
if [ -f ".env.local" ]; then
    check_pass ".env.local file exists"
    if grep -q "FIREBASE_SERVICE_ACCOUNT_JSON" .env.local; then
        check_pass "FIREBASE_SERVICE_ACCOUNT_JSON is set in .env.local"
    else
        check_warning "FIREBASE_SERVICE_ACCOUNT_JSON not found in .env.local"
    fi
else
    check_warning ".env.local file not found (might be set in Firebase Console)"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "2️⃣  فحص الملفات المطلوبة (Required Files Check)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check for Firebase configuration files
FILES_TO_CHECK=(
    "lib/firebase-admin.ts"
    "server/storage.ts"
    "lib/firebase-storage.ts"
    "server/routers/gallery.ts"
)

for file in "${FILES_TO_CHECK[@]}"; do
    if [ -f "$file" ]; then
        check_pass "Found: $file"
    else
        check_fail "Missing: $file"
    fi
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "3️⃣  فحص الـ Dependencies (Dependencies Check)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check package.json for required dependencies
REQUIRED_PACKAGES=(
    "firebase-admin"
    "firebase"
)

for package in "${REQUIRED_PACKAGES[@]}"; do
    if grep -q "\"$package\"" package.json; then
        check_pass "Found: $package in package.json"
    else
        check_fail "Missing: $package in package.json"
    fi
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "4️⃣  فحص الكود (Code Check)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check for Firebase upload functions
if grep -r "firebaseStoragePut\|uploadBytes" --include="*.ts" --include="*.tsx" > /dev/null 2>&1; then
    check_pass "Firebase upload functions are implemented"
else
    check_fail "Firebase upload functions not found"
fi

# Check for error handling
if grep -r "catch\|error" server/storage.ts > /dev/null 2>&1; then
    check_pass "Error handling is in place"
else
    check_warning "Error handling might be missing"
fi

# Check for fallback
if grep -r "fs.writeFile\|localStorage\|/uploads" server/storage.ts > /dev/null 2>&1; then
    check_warning "Local file fallback detected - ensure Firebase is properly configured to avoid using this"
else
    check_pass "No local file fallback found (good!)"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "5️⃣  فحص الـ Admin SDK (Admin SDK Check)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if grep -q "admin.initializeApp\|getAuth\|getStorage" lib/firebase-admin.ts > /dev/null 2>&1; then
    check_pass "Firebase Admin SDK is initialized"
else
    check_fail "Firebase Admin SDK initialization not found"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 التقرير النهائي (Final Report)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

TOTAL=$((CHECKS_PASSED + CHECKS_FAILED + CHECKS_WARNING))

echo -e "${GREEN}✅ Passed: $CHECKS_PASSED${NC}"
echo -e "${RED}❌ Failed: $CHECKS_FAILED${NC}"
echo -e "${YELLOW}⚠️  Warnings: $CHECKS_WARNING${NC}"
echo ""

if [ $CHECKS_FAILED -eq 0 ]; then
    if [ $CHECKS_WARNING -eq 0 ]; then
        echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
        echo -e "${GREEN}║           كل الفحوصات نجحت! ✅                           ║${NC}"
        echo -e "${GREEN}║        All checks passed! Ready for deployment!          ║${NC}"
        echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
    else
        echo -e "${YELLOW}╔════════════════════════════════════════════════════════════╗${NC}"
        echo -e "${YELLOW}║         بعض التحذيرات موجودة - يرجى المراجعة            ║${NC}"
        echo -e "${YELLOW}║         Some warnings present - please review             ║${NC}"
        echo -e "${YELLOW}╚════════════════════════════════════════════════════════════╝${NC}"
    fi
else
    echo -e "${RED}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║        بعض الفحوصات فشلت - يرجى إصلاحها أولاً          ║${NC}"
    echo -e "${RED}║         Some checks failed - please fix them first        ║${NC}"
    echo -e "${RED}╚════════════════════════════════════════════════════════════╝${NC}"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 الخطوات التالية (Next Steps)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ $CHECKS_FAILED -gt 0 ]; then
    check_info "1. اقرأ الملفات المرفقة: FIREBASE_SETUP_STEP_BY_STEP.md"
    check_info "2. تأكد من تثبيت جميع المتغيرات في Firebase Console"
    check_info "3. تأكد من تفعيل Cloud Storage API"
    check_info "4. أضف IAM roles للـ service account"
    check_info "5. شغّل هذا الـ script مرة أخرى بعد الإصلاح"
else
    check_info "✅ الكود جاهز للاستخدام!"
    check_info "📤 الآن يمكنك اختبار upload الصور"
    check_info "🔍 تحقق من Firebase Console Storage"
    check_info "♻️  أعد تشغيل التطبيق للتأكد من Persistence"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
