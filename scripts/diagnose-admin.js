#!/usr/bin/env node

/**
 * 🔧 تشخيص مشاكل لوحة التحكم
 * 
 * هذا الـ script يتحقق من:
 * 1. اتصال قاعدة البيانات
 * 2. جداول قاعدة البيانات
 * 3. صلاحيات الملفات
 * 4. متغيرات البيئة المهمة
 * 5. تحميل الصور
 * 6. حفظ الإعدادات
 */

const chalk = require('chalk');
const fs = require('fs');
const path = require('path');

console.log('\n' + chalk.bold.cyan('🔧 تشخيص مشاكل لوحة التحكم\n'));

// 1. تحقق من متغيرات البيئة
console.log(chalk.bold.yellow('1️⃣  فحص متغيرات البيئة...'));
const requiredEnvVars = [
  'DATABASE_URL',
  'JWT_SECRET',
  'VITE_APP_ID',
  'VITE_SUPABASE_URL',
];

let envOk = true;
for (const env of requiredEnvVars) {
  if (process.env[env]) {
    console.log(chalk.green(`✅ ${env} موجود`));
  } else {
    console.log(chalk.red(`❌ ${env} مفقود!`));
    envOk = false;
  }
}

if (!envOk) {
  console.log(chalk.red.bold('\n⚠️  متغيرات بيئة مفقودة! أضفها في:'));
  console.log(chalk.cyan('   Render Dashboard → Environment Variables\n'));
}

// 2. تحقق من قاعدة البيانات
console.log(chalk.bold.yellow('\n2️⃣  فحص قاعدة البيانات...'));

(async () => {
  try {
    // نحاول الاتصال
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      console.log(chalk.red('❌ DATABASE_URL غير موجود'));
      return;
    }

    console.log(chalk.green('✅ DATABASE_URL موجود'));
    console.log(chalk.cyan(`   ${dbUrl.split('@')[1] || 'محجوب'}`));

    // محاولة الاتصال
    try {
      const mysql = require('mysql2/promise');
      const urlParts = new URL(dbUrl);
      
      const connection = await mysql.createConnection({
        host: urlParts.hostname,
        user: urlParts.username,
        password: urlParts.password,
        database: urlParts.pathname.slice(1),
        waitForConnections: true,
        connectionLimit: 1,
        queueLimit: 0,
        connectTimeout: 5000,
      });

      console.log(chalk.green('✅ اتصال قاعدة البيانات نجح!'));

      // تحقق من جداول قاعدة البيانات
      const [tables] = await connection.execute(`
        SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_SCHEMA = DATABASE()
      `);

      if (tables.length === 0) {
        console.log(chalk.red('❌ لا توجد جداول في قاعدة البيانات!'));
        console.log(chalk.yellow('⚠️  قم بتشغيل: npm run db:push'));
      } else {
        console.log(chalk.green(`✅ عدد الجداول: ${tables.length}`));
        
        // تحقق من جدول site_settings
        const hasSiteSettings = tables.some(t => t.TABLE_NAME === 'site_settings');
        if (hasSiteSettings) {
          console.log(chalk.green('✅ جدول site_settings موجود'));
          
          // عد الإعدادات
          const [[row]] = await connection.execute(
            'SELECT COUNT(*) as count FROM site_settings'
          );
          console.log(chalk.cyan(`   عدد الإعدادات المحفوظة: ${row.count}`));
        } else {
          console.log(chalk.red('❌ جدول site_settings غير موجود!'));
        }
      }

      await connection.end();
    } catch (err) {
      console.log(chalk.red(`❌ فشل الاتصال بقاعدة البيانات:`));
      console.log(chalk.yellow(`   ${err.message}`));
    }
  } catch (err) {
    console.log(chalk.red(`خطأ: ${err.message}`));
  }

  // 3. تحقق من ملفات المشروع
  console.log(chalk.bold.yellow('\n3️⃣  فحص ملفات المشروع...'));

  const filesToCheck = [
    'server/routers/siteSettings.ts',
    'server/db.ts',
    'drizzle/schema.ts',
  ];

  for (const file of filesToCheck) {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      console.log(chalk.green(`✅ ${file} موجود`));
    } else {
      console.log(chalk.red(`❌ ${file} مفقود!`));
    }
  }

  // 4. تحقق من الصلاحيات
  console.log(chalk.bold.yellow('\n4️⃣  فحص صلاحيات المجلدات...'));

  const dirsToCheck = ['uploads', 'public', 'dist'];
  for (const dir of dirsToCheck) {
    const dirPath = path.join(process.cwd(), dir);
    try {
      if (fs.existsSync(dirPath)) {
        fs.accessSync(dirPath, fs.constants.W_OK);
        console.log(chalk.green(`✅ ${dir} يمكن الكتابة عليه`));
      } else {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(chalk.yellow(`⚠️  تم إنشاء مجلد ${dir}`));
      }
    } catch (err) {
      console.log(chalk.red(`❌ لا يمكن الكتابة على ${dir}`));
    }
  }

  // 5. النصائح
  console.log(chalk.bold.cyan('\n5️⃣  النصائح لحل المشاكل:\n'));

  console.log(chalk.bold.yellow('إذا كانت البيانات لا تُحفظ:'));
  console.log(chalk.green('1. تأكد من أن DATABASE_URL صحيح'));
  console.log(chalk.green('2. شغل: npm run db:push'));
  console.log(chalk.green('3. أعد تشغيل الخادم'));

  console.log(chalk.bold.yellow('\nإذا كانت الصور لا تُرفع:'));
  console.log(chalk.green('1. تأكد من صلاحيات مجلد uploads'));
  console.log(chalk.green('2. تأكد من AWS S3 أو مخزن سحابي آخر'));
  console.log(chalk.green('3. تحقق من CORS settings'));

  console.log(chalk.bold.yellow('\nلرؤية أخطاء أكثر تفصيلاً:'));
  console.log(chalk.green('1. افتح F12 في المتصفح'));
  console.log(chalk.green('2. اذهب إلى Network tab'));
  console.log(chalk.green('3. جرب عملية (مثل حفظ إعداد)'));
  console.log(chalk.green('4. انظر إلى الخطأ في Response'));

  console.log(chalk.bold.cyan('\n✅ انتهى التشخيص\n'));
})();
