import PageMeta from "@/components/PageMeta";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";

const LOGO_URL =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663477605010/hMv7CdB7RdAWDPc2Ku9pP8/ss_c5f7e7e2.png";

export default function AdminLogin() {
  return (
    <div className="min-h-screen bg-[#0a0a14]">
      <PageMeta
        title="Admin Login | VANIR GROUP"
        description="Sign in to the VANIR GROUP admin panel."
        canonicalPath="/admin/login"
      />
      <Navbar />
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-[var(--card)]/60 backdrop-blur rounded-2xl border border-white/10 p-8 text-center">
          <img src={LOGO_URL} alt="VANIR GROUP" className="w-14 h-14 mx-auto mb-4 object-contain" />
          <h1 className="text-white text-2xl font-semibold mb-2">Admin Access</h1>
          <p className="text-white/50 text-sm mb-6">Sign in with your admin account to continue.</p>
          <Button
            onClick={() => (window.location.href = getLoginUrl('/admin'))}
            className="w-full bg-[var(--theme-primary)] text-black font-semibold py-6 rounded-xl"
          >
            Sign in with VANIR Account
          </Button>
        </div>
      </div>
      <Footer />
    </div>
  );
}
