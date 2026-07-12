/*
 * Design: Art Deco Luxe - Black & Gold
 * Terms of Service Page: Bilingual (Arabic / English)
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
      title: "١. قبول الشروط",
      body: "باستخدامك لموقعنا وخدماتنا، فإنك تقر بأنك قرأت هذه الشروط وفهمتها وتوافق على الالتزام بها كاملة.",
    },
    en: {
      title: "1. Acceptance of Terms",
      body: "By creating an account or using our services, you acknowledge that you have read, understood, and agree to be bound by these terms and conditions in full.",
    },
  },
  {
    ar: {
      title: "٢. الحساب والأمان",
      body: "أنت مسؤول عن الحفاظ على سرية معلومات حسابك وكلمة المرور. يجب أن تكون جميع المعلومات التي تقدمها لنا دقيقة ومحدثة.",
    },
    en: {
      title: "2. User Accounts & Security",
      body: "You are responsible for maintaining the confidentiality of your account credentials and password. All information you provide must be accurate and kept up to date.",
    },
  },
  {
    ar: {
      title: "٣. الاستخدام المقبول",
      body: "تتعهد بعدم استخدام خدماتنا في أي أنشطة غير قانونية، أو محاولة إلحاق الضرر بالمنصة، أو اختراق أمن النظام.",
    },
    en: {
      title: "3. Acceptable Use",
      body: "You agree not to use our services for any unlawful activities, attempt to damage the platform, or breach system security.",
    },
  },
  {
    ar: {
      title: "٤. حقوق الملكية الفكرية",
      body: "جميع المحتويات، الشعارات، والتصاميم الموجودة على الموقع هي ملك حصري لـ Vanir Group ولا يجوز نسخها أو استخدامها دون إذن مسبق.",
    },
    en: {
      title: "4. Intellectual Property",
      body: "All content, logos, and designs on this site are the exclusive property of Vanir Group and may not be copied or used without prior written permission.",
    },
  },
  {
    ar: {
      title: "٥. إنهاء الخدمة",
      body: "نحتفظ بالحق في تعليق أو إنهاء وصولك إلى الخدمات في حال مخالفة هذه الشروط والأحكام.",
    },
    en: {
      title: "5. Termination",
      body: "We reserve the right to suspend or terminate your access to the services if you violate any of these terms and conditions.",
    },
  },
  {
    ar: {
      title: "٦. التعديلات على الشروط",
      body: "قد نقوم بتحديث هذه الشروط من وقت لآخر، وسيتم نشر التعديلات مباشرة على هذه الصفحة.",
    },
    en: {
      title: "6. Modifications",
      body: "We may update these terms from time to time. Any changes will be published directly on this page and take effect immediately upon posting.",
    },
  },
];

export default function TermsOfService() {
  return (
    <>
      <SEO
        title="Terms of Service | Vanir Group"
        description="Terms of Service for Vanir Group — the rules and conditions governing use of our platform."
      />
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-16 bg-[#0a0a0a] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0d1a00] to-[#0a0a0a]" />
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg,transparent,transparent 39px,rgba(212,175,55,0.3) 39px,rgba(212,175,55,0.3) 40px),repeating-linear-gradient(90deg,transparent,transparent 39px,rgba(212,175,55,0.3) 39px,rgba(212,175,55,0.3) 40px)",
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
            شروط الخدمة
          </motion.h1>
          <motion.p
            initial="hidden" animate="visible" custom={2} variants={fadeUp}
            className="text-xl text-[#d4af37]/80 mb-2"
            style={{ fontFamily: "Playfair Display, serif" }}
          >
            Terms of Service
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
              مرحباً بكم في <span className="text-[#d4af37] font-semibold">Vanir Group</span>. باستخدامك لموقعنا وخدماتنا، فإنك توافق على الالتزام بالشروط والأحكام التالية.
            </div>
            <div className="text-gray-300 leading-relaxed text-sm">
              Welcome to <span className="text-[#d4af37] font-semibold">Vanir Group</span>. By accessing or using our website and services, you agree to comply with and be bound by the following terms and conditions.
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
                  <p className="text-gray-300 text-sm leading-relaxed">{sec.ar.body}</p>
                </div>
                {/* English */}
                <div className="p-6 bg-[#0f0f0f]">
                  <h2 className="text-[#d4af37] font-semibold text-base mb-3" style={{ fontFamily: "Playfair Display, serif" }}>
                    {sec.en.title}
                  </h2>
                  <p className="text-gray-300 text-sm leading-relaxed">{sec.en.body}</p>
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
          <a href="/privacy-policy" className="text-[#d4af37]/70 hover:text-[#d4af37] transition-colors">
            ← Privacy Policy
          </a>
        </div>
      </section>

      <Footer />
      <BackToTop />
    </>
  );
}
