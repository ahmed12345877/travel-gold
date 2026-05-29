import PageMeta from "@/components/PageMeta";
import { supabase, fetchSupabaseAuthSettings } from "@/lib/supabase";
import { trpc } from "@/lib/trpc";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";

const LOGO_URL =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663477605010/hMv7CdB7RdAWDPc2Ku9pP8/ss_c5f7e7e2.png";

// Pharaonic SVG decorations
const HieroglyphBorder = () => (
  <svg
    viewBox="0 0 400 20"
    className="w-full opacity-40"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <pattern id="hiero" x="0" y="0" width="40" height="20" patternUnits="userSpaceOnUse">
      <rect x="0" y="8" width="6" height="4" fill="#c9a84c" opacity="0.8" />
      <rect x="10" y="4" width="4" height="12" fill="#c9a84c" opacity="0.6" />
      <circle cx="20" cy="10" r="4" fill="none" stroke="#c9a84c" strokeWidth="1.5" opacity="0.7" />
      <rect x="28" y="6" width="3" height="8" fill="#c9a84c" opacity="0.6" />
      <rect x="34" y="8" width="6" height="4" fill="#c9a84c" opacity="0.8" />
    </pattern>
    <rect width="400" height="20" fill="url(#hiero)" />
  </svg>
);

const EyeOfRa = () => (
  <svg
    viewBox="0 0 60 40"
    className="w-10 h-7 opacity-60"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path d="M2 20 Q30 2 58 20 Q30 38 2 20Z" fill="none" stroke="#c9a84c" strokeWidth="1.5" />
    <circle cx="30" cy="20" r="7" fill="none" stroke="#c9a84c" strokeWidth="1.5" />
    <circle cx="30" cy="20" r="3" fill="#c9a84c" />
    <path d="M37 20 Q44 28 40 34" fill="none" stroke="#c9a84c" strokeWidth="1.5" />
    <path d="M40 34 Q36 36 33 32" fill="none" stroke="#c9a84c" strokeWidth="1.2" />
  </svg>
);

const AnkhIcon = () => (
  <svg
    viewBox="0 0 24 32"
    className="w-5 h-7 opacity-50"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <circle cx="12" cy="9" r="6" fill="none" stroke="#c9a84c" strokeWidth="2" />
    <line x1="12" y1="15" x2="12" y2="32" stroke="#c9a84c" strokeWidth="2" />
    <line x1="4" y1="20" x2="20" y2="20" stroke="#c9a84c" strokeWidth="2" />
  </svg>
);

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [magicEmail, setMagicEmail] = useState("");
  const [status, setStatus] = useState<{ type: "error" | "success"; msg: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"password" | "magic">("password");
  const [, navigate] = useLocation();

  const hasSupabase = Boolean(supabase);

  // Preflight: read Supabase auth settings so we can disable unsupported providers
  const [providerState, setProviderState] = useState({
    googleEnabled: false,
    emailEnabled: false,
    emailSignupsEnabled: false,
    checked: false,
  });

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: () => {
      navigate("/admin");
    },
    onError: (err) => {
      const raw = err.message || "";
      const msg =
        raw.startsWith("Unexpected token") || raw.includes("not valid JSON") || raw.includes("Failed to fetch")
          ? "Cannot reach the server. Please check your connection and try again."
          : raw || "Invalid credentials. Please try again.";
      setStatus({ type: "error", msg });
      setLoading(false);
    },
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
    // Attempt session bridge
    supabase.auth.getSession().then(({ data }) => {
      const token = data?.session?.access_token;
      if (token) {
        setLoading(true);
        supabaseLoginMutation.mutate({ accessToken: token });
      }
    });

    // Preflight provider configuration to avoid redirecting to GoTrue JSON errors
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
    loginMutation.mutate({ email, password });
  };

  const signInWithGoogle = async () => {
    if (!supabase) return;
    setLoading(true);
    setStatus(null);
    try {
      // Guard before redirecting
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
      // Guard if email-based auth is not enabled
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

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden"
      style={{
        background: "linear-gradient(160deg, #0d0a06 0%, #1a1106 40%, #0d0a06 100%)",
      }}
    >
      <PageMeta
        title="Admin Login | VANIR GROUP"
        description="Sign in to the VANIR GROUP admin panel."
        canonicalPath="/admin/login"
      />

      {/* Background decorative elements */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          backgroundImage: `
            radial-gradient(ellipse 80% 50% at 50% -10%, rgba(201,168,76,0.12) 0%, transparent 60%),
            radial-gradient(ellipse 60% 40% at 50% 110%, rgba(201,168,76,0.08) 0%, transparent 60%)
          `,
        }}
      />

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        aria-hidden="true"
        style={{
          backgroundImage: `
            linear-gradient(rgba(201,168,76,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(201,168,76,0.5) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Corner decorations */}
      <div className="absolute top-6 left-6 opacity-20 hidden md:block" aria-hidden="true">
        <AnkhIcon />
      </div>
      <div className="absolute top-6 right-6 opacity-20 hidden md:block" aria-hidden="true">
        <AnkhIcon />
      </div>
      <div className="absolute bottom-6 left-6 opacity-20 hidden md:block" aria-hidden="true">
        <AnkhIcon />
      </div>
      <div className="absolute bottom-6 right-6 opacity-20 hidden md:block" aria-hidden="true">
        <AnkhIcon />
      </div>

      {/* Main card */}
      <div
        className="w-full max-w-md relative z-10"
        style={{
          background: "linear-gradient(160deg, rgba(26,17,6,0.95) 0%, rgba(13,10,6,0.98) 100%)",
          border: "1px solid rgba(201,168,76,0.25)",
          borderRadius: "4px",
          boxShadow: `
            0 0 0 1px rgba(201,168,76,0.1),
            0 25px 50px rgba(0,0,0,0.6),
            0 0 80px rgba(201,168,76,0.05) inset
          `,
        }}
      >
        {/* Top hieroglyph border */}
        <div className="px-4 pt-4">
          <HieroglyphBorder />
        </div>

        {/* Header */}
        <div className="px-8 pt-6 pb-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-5">
            <EyeOfRa />
            <img
              src={LOGO_URL}
              alt="VANIR GROUP"
              className="w-12 h-12 object-contain"
              style={{ filter: "drop-shadow(0 0 12px rgba(201,168,76,0.4))" }}
            />
            <EyeOfRa />
          </div>

          <h1
            className="text-2xl font-bold tracking-[0.15em] uppercase mb-1"
            style={{ color: "#c9a84c" }}
          >
            VANIR GROUP
          </h1>
          <p
            className="text-xs tracking-[0.3em] uppercase mb-1"
            style={{ color: "rgba(201,168,76,0.5)" }}
          >
            ✦ Admin Portal ✦
          </p>
          <p className="text-sm mt-3" style={{ color: "rgba(255,255,255,0.4)" }}>
            Authorized access only
          </p>
        </div>

        {/* Divider */}
        <div className="px-8">
          <div
            className="h-px w-full"
            style={{
              background: "linear-gradient(90deg, transparent, rgba(201,168,76,0.4), transparent)",
            }}
          />
        </div>

        {/* Tab switcher (only show if Supabase is configured) */}
        {hasSupabase && (
          <div className="px-8 pt-5">
            <div
              className="flex rounded-sm overflow-hidden"
              style={{ border: "1px solid rgba(201,168,76,0.2)" }}
            >
              <button
                onClick={() => setActiveTab("password")}
                className="flex-1 py-2 text-xs font-semibold uppercase tracking-wider transition-all duration-200"
                style={{
                  background: activeTab === "password" ? "rgba(201,168,76,0.15)" : "transparent",
                  color: activeTab === "password" ? "#c9a84c" : "rgba(255,255,255,0.35)",
                  borderRight: "1px solid rgba(201,168,76,0.2)",
                }}
              >
                Password
              </button>
              <button
                onClick={() => setActiveTab("magic")}
                className="flex-1 py-2 text-xs font-semibold uppercase tracking-wider transition-all duration-200"
                style={{
                  background: activeTab === "magic" ? "rgba(201,168,76,0.15)" : "transparent",
                  color: activeTab === "magic" ? "#c9a84c" : "rgba(255,255,255,0.35)",
                }}
              >
                Magic Link
              </button>
            </div>
          </div>
        )}

        {/* Form area */}
        <div className="px-8 py-6 space-y-4">
          {/* Email + Password */}
          {(!hasSupabase || activeTab === "password") && (
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              <div>
                <label
                  className="block text-xs font-semibold uppercase tracking-widest mb-2"
                  style={{ color: "rgba(201,168,76,0.7)" }}
                >
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@vanirgroup.com"
                  autoComplete="username"
                  className="w-full px-4 py-3 text-sm transition-all duration-200 focus:outline-none"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(201,168,76,0.2)",
                    borderRadius: "2px",
                    color: "rgba(255,255,255,0.9)",
                    caretColor: "#c9a84c",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "rgba(201,168,76,0.6)";
                    e.target.style.boxShadow = "0 0 0 2px rgba(201,168,76,0.08)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "rgba(201,168,76,0.2)";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>

              <div>
                <label
                  className="block text-xs font-semibold uppercase tracking-widest mb-2"
                  style={{ color: "rgba(201,168,76,0.7)" }}
                >
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  className="w-full px-4 py-3 text-sm transition-all duration-200 focus:outline-none"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(201,168,76,0.2)",
                    borderRadius: "2px",
                    color: "rgba(255,255,255,0.9)",
                    caretColor: "#c9a84c",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "rgba(201,168,76,0.6)";
                    e.target.style.boxShadow = "0 0 0 2px rgba(201,168,76,0.08)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "rgba(201,168,76,0.2)";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 text-sm font-bold uppercase tracking-widest transition-all duration-200 relative overflow-hidden"
                style={{
                  background: loading
                    ? "rgba(201,168,76,0.3)"
                    : "linear-gradient(135deg, #c9a84c 0%, #e8c96a 50%, #c9a84c 100%)",
                  color: "#0d0a06",
                  borderRadius: "2px",
                  border: "1px solid rgba(201,168,76,0.4)",
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
                  "Enter the Chamber"
                )}
              </button>
            </form>
          )}

          {/* Magic Link (Supabase only) */}
          {hasSupabase && activeTab === "magic" && (
            <div className="space-y-4">
              <div>
                <label
                  className="block text-xs font-semibold uppercase tracking-widest mb-2"
                  style={{ color: "rgba(201,168,76,0.7)" }}
                >
                  Email Address
                </label>
                <input
                  type="email"
                  value={magicEmail}
                  onChange={(e) => setMagicEmail(e.target.value)}
                  placeholder="you@vanirgroup.com"
                  className="w-full px-4 py-3 text-sm transition-all duration-200 focus:outline-none"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(201,168,76,0.2)",
                    borderRadius: "2px",
                    color: "rgba(255,255,255,0.9)",
                    caretColor: "#c9a84c",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "rgba(201,168,76,0.6)";
                    e.target.style.boxShadow = "0 0 0 2px rgba(201,168,76,0.08)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "rgba(201,168,76,0.2)";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>
              <button
                type="button"
                onClick={sendMagicLink}
                disabled={loading}
                className="w-full py-3 text-sm font-bold uppercase tracking-widest transition-all duration-200"
                style={{
                  background: loading
                    ? "rgba(201,168,76,0.3)"
                    : "linear-gradient(135deg, #c9a84c 0%, #e8c96a 50%, #c9a84c 100%)",
                  color: "#0d0a06",
                  borderRadius: "2px",
                  border: "1px solid rgba(201,168,76,0.4)",
                  boxShadow: loading ? "none" : "0 4px 20px rgba(201,168,76,0.25)",
                  cursor: loading ? "not-allowed" : "pointer",
                }}
              >
                {loading ? "Sending…" : "Send Magic Link"}
              </button>
            </div>
          )}

          {/* Google sign-in (Supabase only) */}
          {hasSupabase && (
            <div>
              <div className="flex items-center gap-3 my-2">
                <div className="flex-1 h-px" style={{ background: "rgba(201,168,76,0.15)" }} />
                <span
                  className="text-xs uppercase tracking-widest"
                  style={{ color: "rgba(201,168,76,0.4)" }}
                >
                  or
                </span>
                <div className="flex-1 h-px" style={{ background: "rgba(201,168,76,0.15)" }} />
              </div>
              <button
                type="button"
                onClick={signInWithGoogle}
                disabled={loading || (providerState.checked && !providerState.googleEnabled)}
                className="w-full py-3 text-sm font-semibold uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-3"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(201,168,76,0.2)",
                  borderRadius: "2px",
                  color: "rgba(255,255,255,0.7)",
                  cursor: loading || (providerState.checked && !providerState.googleEnabled) ? "not-allowed" : "pointer",
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    (e.currentTarget as HTMLButtonElement).style.background = "rgba(201,168,76,0.1)";
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(201,168,76,0.35)";
                    (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.9)";
                  }
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.05)";
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(201,168,76,0.2)";
                  (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.7)";
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </button>
              {providerState.checked && !providerState.googleEnabled && (
                <div className="mt-2 text-[11px] text-amber-300/80">
                  Google provider is disabled in Supabase. Enable it in Dashboard → Authentication → Providers.
                </div>
              )}
            </div>
          )}

          {/* Status message */}
          {status && (
            <div
              className="px-4 py-3 text-sm text-center rounded-sm"
              style={{
                background:
                  status.type === "success"
                    ? "rgba(34,197,94,0.1)"
                    : "rgba(239,68,68,0.1)",
                border: `1px solid ${status.type === "success" ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)"}`,
                color:
                  status.type === "success"
                    ? "rgba(134,239,172,0.9)"
                    : "rgba(252,165,165,0.9)",
              }}
            >
              {status.msg}
            </div>
          )}
        </div>

        {/* Bottom hieroglyph border */}
        <div className="px-4 pb-4">
          <HieroglyphBorder />
        </div>

        {/* Footer */}
        <div
          className="px-8 py-4 text-center"
          style={{ borderTop: "1px solid rgba(201,168,76,0.1)" }}
        >
          <p className="text-xs" style={{ color: "rgba(201,168,76,0.3)" }}>
            ✦ VANIR GROUP — Admin Control Center ✦
          </p>
        </div>
      </div>
    </div>
  );
}
