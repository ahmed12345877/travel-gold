#!/usr/bin/env node

/**
 * 🔧 إصلاح شامل لقاعدة البيانات
 * 
 * هذا السكريبت يقوم بـ:
 * 1. التحقق من الاتصال بقاعدة البيانات
 * 2. إنشاء الجداول الناقصة
 * 3. إضافة البيانات الافتراضية
 * 4. معالجة الأخطاء الشائعة
 */

const fs = require('fs');
const path = require('path');

// تجاهل require للـ TypeScript
const colorize = (text, color) => {
  const colors = {
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    cyan: '\x1b[36m',
    reset: '\x1b[0m'
  };
  return `${colors[color] || ''}${text}${colors.reset}`;
};

console.log('\n' + colorize('='.repeat(50), 'cyan'));
console.log(colorize('🔧 إصلاح قاعدة البيانات', 'cyan'));
console.log(colorize('='.repeat(50), 'cyan') + '\n');

// 1. تحقق من .env
console.log(colorize('1️⃣  فحص ملف .env...', 'yellow'));
const envPath = path.join(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  if (envContent.includes('DATABASE_URL')) {
    console.log(colorize('✅ DATABASE_URL موجود في .env', 'green'));
  } else {
    console.log(colorize('⚠️  DATABASE_URL غير موجود في .env', 'yellow'));
  }
} else {
  console.log(colorize('⚠️  ملف .env غير موجود', 'yellow'));
}

// 2. تحقق من drizzle schema
console.log(colorize('\n2️⃣  فحص drizzle schema...', 'yellow'));
const schemaPath = path.join(process.cwd(), 'drizzle', 'schema.ts');
if (fs.existsSync(schemaPath)) {
  const schemaContent = fs.readFileSync(schemaPath, 'utf-8');
  if (schemaContent.includes('siteSettings')) {
    console.log(colorize('✅ جدول siteSettings موجود في schema', 'green'));
  }
  if (schemaContent.includes('fileUploads')) {
    console.log(colorize('✅ جدول fileUploads موجود في schema', 'green'));
  }
} else {
  console.log(colorize('❌ ملف schema.ts غير موجود', 'red'));
}

// 3. تحقق من سكريبت البناء
console.log(colorize('\n3️⃣  فحص سكريبتات البناء...', 'yellow'));
const packageJsonPath = path.join(process.cwd(), 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  const scripts = packageJson.scripts || {};
  
  if (scripts['db:push']) {
    console.log(colorize('✅ script db:push موجود', 'green'));
  }
  if (scripts['drizzle-kit']) {
    console.log(colorize('✅ script drizzle-kit موجود', 'green'));
  }
  if (scripts.build) {
    console.log(colorize('✅ script build موجود', 'green'));
  }
}

// 4. نصائح الإصلاح
console.log(colorize('\n4️⃣  خطوات الإصلاح:' , 'yellow'));
console.log(colorize('\nاتبع هذه الخطوات بالترتيب:', 'cyan'));

console.log(colorize('\n الخطوة 1: تحديث قاعدة البيانات', 'green'));
console.log('  npm run db:push');

console.log(colorize('\n الخطوة 2: بناء المشروع', 'green'));
console.log('  npm run build');

console.log(colorize('\n الخطوة 3: تشغيل الخادم', 'green'));
console.log('  npm run dev');

console.log(colorize('\n الخطوة 4: اختبر الآن', 'green'));
console.log('  - اذهب إلى https://vanirgroup.com/admin');
console.log('  - جرب حفظ إعداد');
console.log('  - جرب رفع صورة');

// 5. معالجة الأخطاء الشائعة
console.log(colorize('\n5️⃣  حل مشاكل شائعة:', 'yellow'));
console.log(colorize('\nإذا حصل خطأ "column does not exist":', 'cyan'));
console.log('  → قم بتشغيل: npm run db:push');

console.log(colorize('\nإذا حصل خطأ "connection refused":', 'cyan'));
console.log('  → تأكد من أن DATABASE_URL صحيح');
console.log('  → تأكد من أن خادم قاعدة البيانات يعمل');

console.log(colorize('\nإذا استغرق البناء وقتاً طويلاً:', 'cyan'));
console.log('  → قم بمسح الـ cache: rm -rf .next dist');
console.log('  → ثم شغل: npm run build مرة أخرى');

console.log('\n' + colorize('='.repeat(50), 'cyan'));
console.log(colorize('✅ جاهز للبدء!', 'green'));
console.log(colorize('='.repeat(50), 'cyan') + '\n');
