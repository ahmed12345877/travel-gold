/*
 * Design: Art Deco Luxe - Black & Gold
 * Privacy Policy Page: Bilingual (Arabic / English)
 */
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";
import SEO from "@/components/SEO";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.55, ease: "easeOut" as const },
  }),
};

const sections = [
  {
    ar: {
      title: "١. المعلومات التي نجمعها",
      body: "عند تسجيل الدخول باستخدام حساب جوجل، قد نجمع بعض المعلومات الأساسية مثل: الاسم الكامل، البريد الإلكتروني، والصورة الشخصية للحساب.",
    },
    en: {
      title: "1. Information We Collect",
      body: "When you log in via Google, we may access basic profile information such as your name, email address, and profile picture.",
    },
  },
  {
    ar: {
      title: "٢. كيف نستخدم معلوماتك",
      body: "نستخدم هذه البيانات فقط من أجل: إنشاء وإدارة حسابك على منصتنا، تقديم الدعم الفني وتخصيص تجربتك، وإرسال التحديثات الهامة المتعلقة بحسابك.",
    },
    en: {
      title: "2. How We Use Your Information",
      body: "We use this data to create and manage your account on our platform, provide technical support and personalize your experience, and send important updates related to your account.",
    },
  },
  {
    ar: {
      title: "٣. حماية البيانات ومشاركتها",
      body: "نحن لا نبيع ولا نشارك بياناتك الشخصية مع أي أطراف ثالثة لأغراض تسويقية. نستخدم تقنيات أمان متطورة لحماية بياناتك من الوصول غير المصرح به.",
    },
    en: {
      title: "3. Data Protection & Sharing",
      body: "We do not sell or share your personal data with third parties for marketing purposes. We implement advanced security technologies to protect your data from unauthorized access.",
    },
  },
  {
    ar: {
      title: "٤. حقوقك",
      body: "يحق لك في أي وقت طلب تعديل بياناتك أو حذف حسابك ومعلوماتك تماماً من خوادمنا عبر مراسلتنا على البريد الإلكتروني المخصص للدعم.",
    },
    en: {
      title: "4. Your Rights",
      body: "You have the right at any time to request modification of your data or complete deletion of your account and information from our servers by contacting our support email.",
    },
  },
  {
    ar: {
      title: "٥. التواصل معنا",
      body: "إذا كان لديك أي استفسار حول سياسة الخصوصية، يمكنك التواصل معنا عبر:\nالبريد الإلكتروني: info@vanirgroup.com\nالموقع الإلكتروني: https://vanirgroup.com",
    },
    en: {
      title: "5. Contact Us",
      body: "For any questions regarding your privacy, contact us at:\nEmail: info@vanirgroup.com\nWebsite: https://vanirgroup.com",
    },
  },
];

export default function PrivacyPolicy() {
  return (
    <>
      <SEO
        title="Privacy Policy | Vanir Group"
        description="Privacy Policy for Vanir Group — how we collect, use, and protect your personal data."
      />
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-16 bg-[#0a0a0a] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a1200] to-[#0a0a0a]" />
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 39px,rgba(212,175,55,0.3) 39px,rgba(212,175,55,0.3) 40px),repeating-linear-gradient(90deg,transparent,transparent 39px,rgba(212,175,55,0.3) 39px,rgba(212,175,55,0.3) 40px)",
          }}
        />
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <motion.div initial="hidden" animate="visible" custom={0} variants={fadeUp}>
            <span className="inline-block text-xs tracking-[0.3em] text-[#d4af37] uppercase mb-4 font-medium">
              Vanir Group
            </span>
          </motion.div>
          <motion.h1
            initial="hidden" animate="visible" custom={1} variants={fadeUp}
            className="text-4xl md:text-5xl font-bold text-white mb-4"
            style={{ fontFamily: "Playfair Display, serif" }}
          >
            سياسة الخصوصية
          </motion.h1>
          <motion.p
            initial="hidden" animate="visible" custom={2} variants={fadeUp}
            className="text-xl text-[#d4af37]/80 mb-2"
            style={{ fontFamily: "Playfair Display, serif" }}
          >
            Privacy Policy
          </motion.p>
          <motion.p
            initial="hidden" animate="visible" custom={3} variants={fadeUp}
            className="text-sm text-gray-400 mt-4"
          >
            آخر تحديث: يونيو ٢٠٢٦ &nbsp;|&nbsp; Last updated: June 2026
          </motion.p>
        </div>
      </section>

      {/* Intro */}
      <section className="bg-[#0d0d0d] py-10 border-b border-[#d4af37]/10">
        <div className="max-w-4xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-8">
            <div dir="rtl" className="text-gray-300 leading-relaxed text-sm">
              في <span className="text-[#d4af37] font-semibold">Vanir Group</span>، نلتزم بحماية خصوصيتك وأمان بياناتك الشخصية. توضح هذه السياسة كيفية جمع معلوماتك واستخدامها وحمايتها عندما تستخدم موقعنا أو خدمات تسجيل الدخول الخاصة بنا.
            </div>
            <div className="text-gray-300 leading-relaxed text-sm">
              At <span className="text-[#d4af37] font-semibold">Vanir Group</span>, we are committed to protecting your privacy and the security of your personal data. This policy explains how we collect, use, and protect your information when you use our website or login services.
            </div>
          </div>
        </div>
      </section>

      {/* Sections */}
      <section className="bg-[#0d0d0d] py-16">
        <div className="max-w-4xl mx-auto px-6 space-y-12">
          {sections.map((sec, i) => (
            <motion.div
              key={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={i}
              variants={fadeUp}
              className="border border-[#d4af37]/15 rounded-lg overflow-hidden"
            >
              <div className="grid md:grid-cols-2">
                {/* Arabic */}
                <div dir="rtl" className="p-6 bg-[#111] border-b md:border-b-0 md:border-l border-[#d4af37]/15">
                  <h2 className="text-[#d4af37] font-semibold text-base mb-3" style={{ fontFamily: "Playfair Display, serif" }}>
                    {sec.ar.title}
                  </h2>
                  <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">{sec.ar.body}</p>
                </div>
                {/* English */}
                <div className="p-6 bg-[#0f0f0f]">
                  <h2 className="text-[#d4af37] font-semibold text-base mb-3" style={{ fontFamily: "Playfair Display, serif" }}>
                    {sec.en.title}
                  </h2>
                  <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">{sec.en.body}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer strip */}
      <section className="bg-[#0a0a0a] py-8 border-t border-[#d4af37]/10">
        <div className="max-w-4xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <span>© 2026 Vanir Group. All rights reserved.</span>
          <a href="/terms-of-service" className="text-[#d4af37]/70 hover:text-[#d4af37] transition-colors">
            Terms of Service →
          </a>
        </div>
      </section>

      <Footer />
      <BackToTop />
    </>
  );
}
