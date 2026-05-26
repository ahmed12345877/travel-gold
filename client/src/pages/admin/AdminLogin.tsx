import PageMeta from "@/components/PageMeta";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { supabase } from "@/lib/supabase";
import { trpc } from "@/lib/trpc";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";

const LOGO_URL =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663477605010/hMv7CdB7RdAWDPc2Ku9pP8/ss_c5f7e7e2.png";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [magicEmail, setMagicEmail] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [, navigate] = useLocation();

  const hasSupabase = Boolean(supabase);
  const fallbackLoginUrl = getLoginUrl();
  const isNoopFallback = fallbackLoginUrl.startsWith("/admin");

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: () => {
      navigate("/admin");
    },
    onError: (err) => {
      setStatus(err.message || "Login failed. Check your credentials.");
      setLoading(false);
    },
  });

  const supabaseLoginMutation = trpc.auth.supabaseLogin.useMutation({
    onSuccess: () => {
      navigate("/admin");
    },
    onError: (err) => {
      setStatus(err.message || "Admin access denied.");
      setLoading(false);
    },
  });

  // On mount: check if Supabase redirected back with a session (Google OAuth or Magic Link)
  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      const token = data?.session?.access_token;
      if (token) {
        setLoading(true);
        supabaseLoginMutation.mutate({ accessToken: token });
      }
    });
    // Only run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setStatus("Please enter your email and password.");
      return;
    }
    setLoading(true);
    setStatus(null);
    loginMutation.mutate({ email, password });
  };

  /**
   * After any Supabase sign-in (Google redirect or magic link), exchange the
   * Supabase access token for a session cookie via the server bridge mutation.
   */
  const exchangeSupabaseSession = async () => {
    if (!supabase) return false;
    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData?.session?.access_token;
    if (!accessToken) return false;
    await supabaseLoginMutation.mutateAsync({ accessToken });
    return true;
  };

  const signInWithGoogle = async () => {
    if (!supabase) return;
    setLoading(true);
    setStatus(null);
    try {
      // Check if we're returning from a Google redirect with an existing session
      const exchanged = await exchangeSupabaseSession();
      if (exchanged) return;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/admin/login` },
      });
      if (error) throw error;
    } catch (e: any) {
      setStatus(e?.message || "Failed to start Google sign-in");
      setLoading(false);
    }
  };

  const sendMagicLink = async () => {
    if (!supabase) return;
    if (!magicEmail) {
      setStatus("Please enter your email");
      return;
    }
    setLoading(true);
    setStatus(null);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: magicEmail,
        options: { emailRedirectTo: `${window.location.origin}/admin/login` },
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

          {/* Email + Password login (always available when ADMIN_EMAIL & ADMIN_PASSWORD_HASH are set) */}
          <form onSubmit={handlePasswordLogin} className="space-y-3 text-left mb-6">
            <div>
              <label className="block text-white/70 text-sm mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                autoComplete="username"
                className="w-full rounded-lg bg-black/30 border border-white/10 px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)]"
              />
            </div>
            <div>
              <label className="block text-white/70 text-sm mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                className="w-full rounded-lg bg-black/30 border border-white/10 px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)]"
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[var(--theme-primary)] text-black font-semibold py-6 rounded-xl disabled:opacity-60"
            >
              {loading ? "Signing in…" : "Sign In"}
            </Button>
          </form>

          {status && (
            <p className="text-xs text-white/60 text-center pb-4">{status}</p>
          )}

          {/* Supabase options (only when configured) */}
          {hasSupabase && (
            <div className="border-t border-white/10 pt-5 space-y-4 text-left">
              <p className="text-white/40 text-xs text-center uppercase tracking-wider">or continue with</p>
              <Button
                onClick={signInWithGoogle}
                disabled={loading}
                className="w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-5 rounded-xl"
              >
                Continue with Google
              </Button>

              <div>
                <label className="block text-white/70 text-sm mb-2">Email Magic Link</label>
                <input
                  type="email"
                  value={magicEmail}
                  onChange={(e) => setMagicEmail(e.target.value)}
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
            </div>
          )}

          {/* Fallback when neither Supabase nor password login is configured */}
          {!hasSupabase && isNoopFallback && (
            <p className="text-xs text-white/40 text-center pt-2">
              Set <code className="font-mono">ADMIN_EMAIL</code> and <code className="font-mono">ADMIN_PASSWORD_HASH</code> environment variables to enable login.
            </p>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
