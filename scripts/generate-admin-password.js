#!/usr/bin/env node

/**
 * 🔐 Password Hash Generator للـ Admin
 * 
 * استخدام:
 * node scripts/generate-admin-password.js "your-password-here"
 * 
 * أو بدون arguments لكتابة كلمة المرور:
 * node scripts/generate-admin-password.js
 */

const crypto = require('crypto');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function generateHash(password) {
  const hash = crypto.createHash('sha256').update(password).digest('hex');
  return hash;
}

function main() {
  const args = process.argv.slice(2);

  if (args.length > 0) {
    // كلمة المرور من command line
    const password = args.join(' ');
    const hash = generateHash(password);

    console.log('\n');
    console.log('╔════════════════════════════════════════════════════════════════╗');
    console.log('║           🔐 ADMIN PASSWORD HASH GENERATOR 🔐                   ║');
    console.log('╚════════════════════════════════════════════════════════════════╝');
    console.log('\n');
    console.log('📝 كلمة المرور المدخلة:');
    console.log(`   ${password}`);
    console.log('\n');
    console.log('🔗 SHA-256 Hash:');
    console.log(`   ${hash}`);
    console.log('\n');
    console.log('✅ انسخ هذا الـ Hash وضعه في متغير ADMIN_PASSWORD_HASH في Render');
    console.log('\n');
  } else {
    // طلب كلمة المرور من المستخدم
    rl.question('🔐 أدخل كلمة المرور الجديدة (لن تظهر): ', (password) => {
      if (!password) {
        console.log('❌ كلمة المرور فارغة. حاول مرة أخرى.');
        rl.close();
        return;
      }

      rl.question('🔐 تأكيد كلمة المرور: ', (confirmPassword) => {
        if (password !== confirmPassword) {
          console.log('❌ كلمات المرور غير متطابقة. حاول مرة أخرى.');
          rl.close();
          return;
        }

        const hash = generateHash(password);

        console.log('\n');
        console.log('╔════════════════════════════════════════════════════════════════╗');
        console.log('║           🔐 ADMIN PASSWORD HASH GENERATED ✅                   ║');
        console.log('╚════════════════════════════════════════════════════════════════╝');
        console.log('\n');
        console.log('✅ Hash جاهز:');
        console.log(`\n${hash}\n`);
        console.log('📋 خطوات الاستخدام:');
        console.log('   1. اذهب إلى: https://dashboard.render.com');
        console.log('   2. اختر مشروعك: travel-gold');
        console.log('   3. اذهب إلى: Environment');
        console.log('   4. أضف أو عدّل المتغير:');
        console.log('      Key: ADMIN_PASSWORD_HASH');
        console.log(`      Value: ${hash}`);
        console.log('   5. اضغط Deploy أو Manual Deploy');
        console.log('\n');
        console.log('🔑 بيانات الدخول:');
        console.log('   البريد الإلكتروني: admin@vanirgroup.com');
        console.log(`   كلمة المرور: ${password}`);
        console.log('\n');

        rl.close();
      });
    });
  }
}

main();
