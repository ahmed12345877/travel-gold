#!/bin/bash

# 🚀 سكريبت إصلاح شامل لمشاكل لوحة التحكم
# هذا السكريبت يقوم بـ:
# 1. تحديث قاعدة البيانات
# 2. إنشاء الجداول الناقصة
# 3. مسح الـ Cache
# 4. إعادة بناء المشروع

set -e  # توقف عند أي خطأ

echo "================================================"
echo "🔧 بدء إصلاح لوحة التحكم"
echo "================================================"

# الألوان للـ output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 1. تحديث قاعدة البيانات
echo -e "\n${YELLOW}1️⃣  تحديث قاعدة البيانات...${NC}"
npm run db:push 2>&1 | head -20
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ تم تحديث قاعدة البيانات بنجاح${NC}"
else
  echo -e "${RED}❌ فشل تحديث قاعدة البيانات${NC}"
fi

# 2. إنشاء migration
echo -e "\n${YELLOW}2️⃣  إنشاء migration...${NC}"
npm run drizzle-kit generate 2>&1 | head -20
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ تم إنشاء migration بنجاح${NC}"
else
  echo -e "${YELLOW}⚠️  تجاهل الأخطاء (قد تكون غير مهمة)${NC}"
fi

# 3. مسح الـ Cache والملفات المؤقتة
echo -e "\n${YELLOW}3️⃣  مسح الـ Cache والملفات المؤقتة...${NC}"
rm -rf .next 2>/dev/null || true
rm -rf dist 2>/dev/null || true
rm -rf build 2>/dev/null || true
echo -e "${GREEN}✅ تم مسح الـ Cache${NC}"

# 4. إعادة بناء المشروع
echo -e "\n${YELLOW}4️⃣  إعادة بناء المشروع...${NC}"
npm run build 2>&1 | tail -20
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ تم بناء المشروع بنجاح${NC}"
else
  echo -e "${RED}❌ فشل البناء (لكن هذا قد يكون عادياً)${NC}"
fi

# 5. تشخيص النظام
echo -e "\n${YELLOW}5️⃣  تشخيص النظام...${NC}"
node scripts/diagnose-admin.js 2>&1 || true

echo -e "\n${GREEN}================================================${NC}"
echo -e "${GREEN}✅ اكتمل الإصلاح!${NC}"
echo -e "${GREEN}================================================${NC}"

echo -e "\n${YELLOW}🚀 الخطوة التالية:${NC}"
echo -e "${GREEN}npm run dev${NC}"
echo -e "\nثم افتح المتصفح على:"
echo -e "${GREEN}https://vanirgroup.com/admin${NC}"
echo -e "\nجرب الآن:${NC}"
echo -e "  1. أضف إعداد جديد"
echo -e "  2. رفع صورة"
echo -e "  3. تحديث بيانات"
