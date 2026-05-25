import PageMeta from "@/components/PageMeta";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { supabase } from "@/lib/supabase";
import { useState } from "react";

const LOGO_URL =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663477605010/hMv7CdB7RdAWDPc2Ku9pP8/ss_c5f7e7e2.png";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const hasSupabase = Boolean(supabase);
  const fallbackLoginUrl = getLoginUrl();
  const isNoopFallback = fallbackLoginUrl.startsWith("/admin");

  const signInWithGoogle = async () => {
    if (!supabase) return;
    setLoading(true);
    setStatus(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: window.location.origin },
      });
      if (error) throw error;
    } catch (e: any) {
      setStatus(e?.message || "Failed to start Google sign-in");
    } finally {
      setLoading(false);
    }
  };

  const sendMagicLink = async () => {
    if (!supabase) return;
    if (!email) {
      setStatus("Please enter your email");
      return;
    }
    setLoading(true);
    setStatus(null);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: window.location.origin },
      });
      if (error) throw error;
      setStatus("Check your email for a sign-in link.");
    } catch (e: any) {
      setStatus(e?.message || "Failed to send magic link");
    } finally {
      setLoading(false);
    }
  };

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

          {hasSupabase ? (
            <div className="space-y-4 text-left">
              <Button
                onClick={signInWithGoogle}
                disabled={loading}
                className="w-full bg-[var(--theme-primary)] text-black font-semibold py-6 rounded-xl"
              >
                Continue with Google
              </Button>

              <div className="pt-4">
                <label className="block text-white/70 text-sm mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-lg bg-black/30 border border-white/10 px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)]"
                />
                <Button
                  onClick={sendMagicLink}
                  disabled={loading}
                  className="mt-3 w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-3 rounded-lg"
                >
                  Send Magic Link
                </Button>
              </div>

              {status && (
                <p className="text-xs text-white/60 text-center pt-2">{status}</p>
              )}
            </div>
          ) : (
            <div>
              <Button
                onClick={() => (window.location.href = fallbackLoginUrl)}
                disabled={isNoopFallback}
                className="w-full bg-[var(--theme-primary)] text-black font-semibold py-6 rounded-xl disabled:opacity-60"
              >
                Sign in with VANIR Account
              </Button>
              {isNoopFallback && (
                <p className="text-xs text-white/60 text-center pt-3">
                  Login is not configured. Set Supabase public keys or a valid OAuth portal URL.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
