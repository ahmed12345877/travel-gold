import PageMeta from "@/components/PageMeta";
import { supabase, fetchSupabaseAuthSettings } from "@/lib/supabase";
import {
  firebaseEmailLogin,
  firebaseGoogleLogin,
  isFirebaseConfigured,
} from "@/lib/firebase-api";
import { trpc } from "@/lib/trpc";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Mail, Lock, ArrowRight, Shield } from "lucide-react";

const LOGO_URL =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663477605010/hMv7CdB7RdAWDPc2Ku9pP8/ss_c5f7e7e2.png";

const EGYPT_IMAGE =
  "https://images.unsplash.com/photo-1568322445389-f64ac2515020?auto=format&fit=crop&w=1200&q=80";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [magicEmail, setMagicEmail] = useState("");
  const [status, setStatus] = useState<{ type: "error" | "success"; msg: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"password" | "magic">("password");
  const [logoLoaded, setLogoLoaded] = useState(false);
  const [, navigate] = useLocation();

  const hasSupabase = Boolean(supabase);

  const [providerState, setProviderState] = useState({
    googleEnabled: false,
    emailEnabled: false,
    emailSignupsEnabled: false,
    checked: false,
  });

  const supabaseLoginMutation = trpc.auth.supabaseLogin.useMutation({
    onSuccess: () => {
      navigate("/admin");
    },
    onError: (err) => {
      const raw = err.message || "";
      const msg =
        raw.startsWith("Unexpected token") || raw.includes("not valid JSON") || raw.includes("Failed to fetch")
          ? "Cannot reach the server. Please check your connection and try again."
          : raw || "Admin access denied.";
      setStatus({ type: "error", msg });
      setLoading(false);
    },
  });

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      const token = data?.session?.access_token;
      if (token) {
        setLoading(true);
        supabaseLoginMutation.mutate({ accessToken: token });
      }
    });

    void (async () => {
      const settings = await fetchSupabaseAuthSettings();
      const googleEnabled = Boolean(settings?.external?.google?.enabled);
      const emailEnabled = Boolean(settings?.email?.enabled);
      const emailSignupsEnabled = Boolean(settings?.email?.enable_signup);
      setProviderState({ googleEnabled, emailEnabled, emailSignupsEnabled, checked: true });
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setStatus({ type: "error", msg: "Please enter your email and password." });
      return;
    }
    setLoading(true);
    setStatus(null);

    try {
      await firebaseEmailLogin(email, password);
      navigate("/admin");
    } catch (err: any) {
      const msg: string = err?.message || "Authentication failed.";
      const displayMsg = msg.includes("Admin access denied")
        ? "Admin access denied."
        : msg.includes("not configured") || msg.includes("VITE_FIREBASE_API_KEY")
        ? "Firebase is not configured. Contact your administrator."
        : "Invalid email or password.";
      setStatus({ type: "error", msg: displayMsg });
      setLoading(false);
    }
  };

  const handleFirebaseGoogleLogin = async () => {
    setLoading(true);
    setStatus(null);
    try {
      await firebaseGoogleLogin();
      navigate("/admin");
    } catch (err: any) {
      setStatus({ type: "error", msg: err?.message || "Google sign-in failed." });
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    // Prefer Firebase Google sign-in when configured
    if (isFirebaseConfigured) {
      await handleFirebaseGoogleLogin();
      return;
    }

    if (!supabase) return;
    setLoading(true);
    setStatus(null);
    try {
      if (providerState.checked && !providerState.googleEnabled) {
        throw new Error(
          "Google login is not enabled. Enable it in Supabase Dashboard → Authentication → Providers → Google."
        );
      }
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (token) {
        supabaseLoginMutation.mutate({ accessToken: token });
        return;
      }
      const next = encodeURIComponent("/admin");
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/auth/callback?next=${next}` },
      });
      if (error) {
        if (error.message?.toLowerCase().includes("provider") || error.message?.toLowerCase().includes("not enabled")) {
          throw new Error("Google login is not enabled yet. Please enable the Google provider in your Supabase Dashboard → Authentication → Providers.");
        }
        throw error;
      }
    } catch (e: any) {
      setStatus({ type: "error", msg: e?.message || "Failed to start Google sign-in." });
      setLoading(false);
    }
  };

  const sendMagicLink = async () => {
    if (!supabase) return;
    if (!magicEmail) {
      setStatus({ type: "error", msg: "Please enter your email." });
      return;
    }
    setLoading(true);
    setStatus(null);
    try {
      if (providerState.checked && (!providerState.emailEnabled || !providerState.emailSignupsEnabled)) {
        throw new Error(
          "Email-based sign-in/up is disabled. Enable Email provider (and Signups) in Supabase Dashboard → Authentication → Providers."
        );
      }
      const next = encodeURIComponent("/admin");
      const { error } = await supabase.auth.signInWithOtp({
        email: magicEmail,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=${next}` },
      });
      if (error) throw error;
      setStatus({ type: "success", msg: "Magic link sent! Check your inbox." });
    } catch (e: any) {
      setStatus({ type: "error", msg: e?.message || "Failed to send magic link." });
    } finally {
      setLoading(false);
    }
  };

  const showGoogleButton = isFirebaseConfigured || (hasSupabase && (!providerState.checked || providerState.googleEnabled));

  return (
    <div className="min-h-screen bg-[#080810] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <PageMeta
        title="Admin Login | VANIR GROUP"
        description="Sign in to the VANIR GROUP admin panel."
        canonicalPath="/admin/login"
      />

      <div className="w-full max-w-[960px] bg-[#0d0d1a] rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/5">
        <div className="grid lg:grid-cols-2" style={{ minHeight: "600px" }}>

          {/* Left side – Admin form */}
          <div className="flex flex-col justify-center p-8 lg:p-12">
            <div className="w-full max-w-[380px] mx-auto space-y-5">

              {/* Logo + Brand */}
              <div className="flex items-center gap-3 mb-1">
                {logoLoaded ? (
                  <img
                    src={LOGO_URL}
                    alt="VANIR GROUP"
                    className="w-10 h-10 object-contain"
                    onError={() => setLogoLoaded(false)}
                    style={{ filter: "drop-shadow(0 0 8px rgba(201,168,76,0.3))" }}
                  />
                ) : (
                  <div className="w-10 h-10 bg-gradient-to-br from-[#c9a84c] to-[#a0842d] rounded-lg flex items-center justify-center text-white font-bold text-lg">
                    V
                  </div>
                )}
                {/* Preload image */}
                <img
                  src={LOGO_URL}
                  alt=""
                  className="hidden"
                  onLoad={() => setLogoLoaded(true)}
                  onError={() => setLogoLoaded(false)}
                />
                <div>
                  <span className="text-white font-bold text-xl">
                    VANIR <span style={{ color: "#c9a84c" }}>GROUP</span>
                  </span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Shield className="w-3 h-3" style={{ color: "#c9a84c" }} />
                    <span className="text-xs tracking-widest uppercase" style={{ color: "rgba(201,168,76,0.6)" }}>
                      Admin Portal
                    </span>
                  </div>
                </div>
              </div>

              {/* Heading */}
              <div>
                <h1 className="text-[26px] font-semibold text-white leading-tight">
                  Admin Sign In
                </h1>
                <p className="text-sm text-gray-500 mt-1.5">
                  Authorized access only. All sessions are logged.
                </p>
              </div>

              {/* Tab switcher – show only if Supabase or magic link is relevant */}
              {hasSupabase && !isFirebaseConfigured && (
                <div className="flex gap-1 bg-white/5 rounded-xl p-1">
                  <button
                    onClick={() => setActiveTab("password")}
                    className="flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all"
                    style={{
                      background: activeTab === "password" ? "rgba(201,168,76,0.18)" : "transparent",
                      color: activeTab === "password" ? "#c9a84c" : "rgba(255,255,255,0.4)",
                    }}
                  >
                    Password
                  </button>
                  <button
                    onClick={() => setActiveTab("magic")}
                    className="flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all"
                    style={{
                      background: activeTab === "magic" ? "rgba(201,168,76,0.18)" : "transparent",
                      color: activeTab === "magic" ? "#c9a84c" : "rgba(255,255,255,0.4)",
                    }}
                  >
                    Magic Link
                  </button>
                </div>
              )}

              {/* Email + Password form */}
              {(!hasSupabase || isFirebaseConfigured || activeTab === "password") && (
                <form onSubmit={handlePasswordLogin} className="space-y-3">
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@vanirgroup.com"
                      autoComplete="username"
                      className="w-full h-[50px] bg-white/4 border border-white/10 rounded-xl pl-11 pr-4 text-white text-sm placeholder:text-gray-600 focus:outline-none transition-all"
                      style={{ caretColor: "#c9a84c" }}
                      onFocus={(e) => {
                        e.target.style.borderColor = "rgba(201,168,76,0.5)";
                        e.target.style.boxShadow = "0 0 0 2px rgba(201,168,76,0.08)";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = "rgba(255,255,255,0.1)";
                        e.target.style.boxShadow = "none";
                      }}
                    />
                  </div>

                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      autoComplete="current-password"
                      className="w-full h-[50px] bg-white/4 border border-white/10 rounded-xl pl-11 pr-11 text-white text-sm placeholder:text-gray-600 focus:outline-none transition-all"
                      style={{ caretColor: "#c9a84c" }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = "rgba(201,168,76,0.5)";
                        e.currentTarget.style.boxShadow = "0 0 0 2px rgba(201,168,76,0.08)";
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-300 transition-colors"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-4.803m5.596-3.856a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-[50px] rounded-xl text-sm font-bold uppercase tracking-widest transition-all"
                    style={{
                      background: loading
                        ? "rgba(201,168,76,0.3)"
                        : "linear-gradient(135deg, #c9a84c 0%, #e8c96a 50%, #c9a84c 100%)",
                      color: "#0d0a06",
                      boxShadow: loading ? "none" : "0 4px 20px rgba(201,168,76,0.25)",
                      cursor: loading ? "not-allowed" : "pointer",
                    }}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span
                          className="inline-block w-4 h-4 border-2 rounded-full animate-spin"
                          style={{ borderColor: "#0d0a06 #0d0a06 transparent #0d0a06" }}
                        />
                        Verifying…
                      </span>
                    ) : (
                      "Enter Admin Panel"
                    )}
                  </button>
                </form>
              )}

              {/* Magic Link – only if Supabase is configured and Firebase is not */}
              {hasSupabase && !isFirebaseConfigured && activeTab === "magic" && (
                <div className="space-y-3">
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                    <input
                      type="email"
                      value={magicEmail}
                      onChange={(e) => setMagicEmail(e.target.value)}
                      placeholder="you@vanirgroup.com"
                      className="w-full h-[50px] bg-white/4 border border-white/10 rounded-xl pl-11 pr-4 text-white text-sm placeholder:text-gray-600 focus:outline-none transition-all"
                      style={{ caretColor: "#c9a84c" }}
                      onFocus={(e) => {
                        e.target.style.borderColor = "rgba(201,168,76,0.5)";
                        e.target.style.boxShadow = "0 0 0 2px rgba(201,168,76,0.08)";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = "rgba(255,255,255,0.1)";
                        e.target.style.boxShadow = "none";
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={sendMagicLink}
                    disabled={loading}
                    className="w-full h-[50px] rounded-xl text-sm font-bold uppercase tracking-widest transition-all"
                    style={{
                      background: loading
                        ? "rgba(201,168,76,0.3)"
                        : "linear-gradient(135deg, #c9a84c 0%, #e8c96a 50%, #c9a84c 100%)",
                      color: "#0d0a06",
                      boxShadow: loading ? "none" : "0 4px 20px rgba(201,168,76,0.25)",
                      cursor: loading ? "not-allowed" : "pointer",
                    }}
                  >
                    {loading ? "Sending…" : "Send Magic Link"}
                  </button>
                </div>
              )}

              {/* Google sign-in */}
              {showGoogleButton && (
                <div>
                  <div className="flex items-center gap-3 my-1">
                    <div className="flex-1 h-px bg-white/8" />
                    <span className="text-xs text-gray-600">or</span>
                    <div className="flex-1 h-px bg-white/8" />
                  </div>
                  <button
                    type="button"
                    onClick={signInWithGoogle}
                    disabled={loading || (!isFirebaseConfigured && providerState.checked && !providerState.googleEnabled)}
                    className="w-full h-[50px] flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl text-sm text-white font-normal transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Continue with Google
                  </button>
                  {!isFirebaseConfigured && providerState.checked && !providerState.googleEnabled && (
                    <p className="mt-2 text-[11px] text-amber-300/70">
                      Google provider is disabled. Enable it in Firebase Console → Authentication → Sign-in method, or Supabase Dashboard → Authentication → Providers.
                    </p>
                  )}
                </div>
              )}

              {/* Status message */}
              {status && (
                <div
                  className="px-4 py-3 text-sm text-center rounded-xl"
                  style={{
                    background: status.type === "success" ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
                    border: `1px solid ${status.type === "success" ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)"}`,
                    color: status.type === "success" ? "rgba(134,239,172,0.9)" : "rgba(252,165,165,0.9)",
                  }}
                >
                  {status.msg}
                </div>
              )}

              <p className="text-center text-xs" style={{ color: "rgba(201,168,76,0.25)" }}>
                ✦ VANIR GROUP — Admin Control Center ✦
              </p>
            </div>
          </div>

          {/* Right side – Egypt image pane */}
          <div className="relative rounded-[1.8rem] m-3 overflow-hidden hidden lg:block">
            <img
              src={EGYPT_IMAGE}
              alt="Egypt – Cairo"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

            {/* Top badge */}
            <div className="absolute top-5 left-5">
              <div
                className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
                style={{
                  background: "rgba(13,10,6,0.75)",
                  border: "1px solid rgba(201,168,76,0.3)",
                  color: "#c9a84c",
                  backdropFilter: "blur(8px)",
                }}
              >
                <Shield className="w-3 h-3" />
                Secure Admin Area
              </div>
            </div>

            {/* Caption card */}
            <div
              className="absolute bottom-5 left-5 right-5 rounded-2xl shadow-xl p-4"
              style={{
                background: "rgba(13,10,6,0.82)",
                border: "1px solid rgba(201,168,76,0.15)",
                backdropFilter: "blur(12px)",
              }}
            >
              <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.75)" }}>
                Egypt&apos;s ancient capital — where history meets modern luxury travel. Manage your VANIR GROUP operations here.
              </p>
              <div className="flex items-center gap-2 mt-3">
                <div
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
                  style={{ background: "rgba(201,168,76,0.1)" }}
                >
                  <div className="w-2 h-2 rounded-full" style={{ background: "#c9a84c" }} />
                  <span className="text-xs font-medium" style={{ color: "#c9a84c" }}>Cairo, Egypt</span>
                </div>
                <div
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
                  style={{ background: "rgba(255,255,255,0.05)" }}
                >
                  <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>VANIR GROUP</span>
                </div>
                <button
                  className="ml-auto w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                  style={{ background: "linear-gradient(135deg, #c9a84c, #e8c96a)" }}
                >
                  <ArrowRight className="w-4 h-4" style={{ color: "#0d0a06" }} />
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
