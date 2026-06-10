// استيراد الأدوات المطلوبة من مكتبة Firebase التي قمنا بتثبيتها
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; // أداة التحكم بتسجيل الدخول

// إعدادات مشروعك الحقيقية والخاصة بك
const firebaseConfig = {
  apiKey: "AIzaSyAszyNw2a7_bv02cf0FBXiPXwt3E2-CXdY",
  authDomain: "gen-lang-client-0364375301.firebaseapp.com",
  projectId: "gen-lang-client-0364375301",
  storageBucket: "gen-lang-client-0364375301.firebasestorage.app",
  messagingSenderId: "1001729880037",
  appId: "1:1001729880037:web:0cf4200a2a48e96547090c",
  measurementId: "G-5ETHDXPS4L"
};

// تشغيل نظام Firebase في مشروعك
const app = initializeApp(firebaseConfig);

// تفعيل وتصدير أداة الـ Auth لاستدعائها في صفحة تسجيل الدخول والإدارة
export const auth = getAuth(app); 
export default app;
