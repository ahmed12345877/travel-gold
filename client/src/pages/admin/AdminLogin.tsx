import PageMeta from "@/components/PageMeta";
import {
  firebaseAdminEmailLogin,
  firebaseAdminGoogleLogin,
  firebaseSignOut,
  isFirebaseConfigured,
} from "@/lib/firebase-api";
import { useState } from "react";
import { useLocation } from "wouter";
import { Mail, Lock, ArrowRight, Shield } from "lucide-react";
import { ASSETS } from "@/config/assets";

const EGYPT_IMAGE = "/images/egypt-cairo.png";

// Poll /api/auth/me to verify session was set on server.
// Tries immediately first, then retries with increasing delays.
async function waitForServerSession(maxRetries = 5): Promise<boolean> {
  const delays = [0, 150, 300, 500, 800];
  for (let i = 0; i < maxRetries; i++) {
    const delayMs = delays[i] ?? 800;
    if (delayMs > 0) {
      await new Promise(r => setTimeout(r, delayMs));
    }
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json().catch(() => null);
        if (data) return true;
      }
    } catch {
      // Network error — keep retrying
    }
  }
  return false;
}

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<{ type: "error" | "success"; msg: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [logoLoaded, setLogoLoaded] = useState(false);
  const [, navigate] = useLocation();

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return; // Prevent duplicate requests
    if (!email || !password) {
      setStatus({ type: "error", msg: "Please enter your email and password." });
      return;
    }
    if (!isFirebaseConfigured) {
      setStatus({ type: "error", msg: "Firebase is not configured. Contact your administrator." });
      return;
    }
    setLoading(true);
    setStatus(null);
    try {
      console.log("[v0] Admin login attempting with email:", email);
      await firebaseAdminEmailLogin(email, password);
      console.log("[v0] Firebase login successful, waiting for server session...");
      const sessionReady = await waitForServerSession();
      if (sessionReady) {
        window.location.href = "/admin";
      } else {
        await firebaseSignOut().catch(() => {});
        setStatus({ type: "error", msg: "Login succeeded but session could not be confirmed. Please try again." });
      }
    } catch (err: any) {
      // امسح جلسة Firebase حتى لا تبقى معلّقة عند رفض الصلاحية
      await firebaseSignOut().catch(() => {});
      const msg: string = err?.message || "Authentication failed.";
      console.error("[v0] Admin login error:", { message: msg, email });
      setStatus({
        type: "error",
        msg: msg.includes("Admin access denied")
          ? "Admin access denied. This account does not have admin privileges."
          : msg.includes("not configured") || msg.includes("VITE_FIREBASE_API_KEY")
          ? "Firebase is not configured. Contact your administrator."
          : msg.includes("wrong-password") || msg.includes("invalid-credential") || msg.includes("user-not-found")
          ? "Invalid email or password."
          : msg.includes("Network error")
          ? "Cannot connect to the authentication server. Please try again."
          : "Invalid email or password.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (loading) return;
    if (!isFirebaseConfigured) {
      setStatus({ type: "error", msg: "Firebase is not configured. Contact your administrator." });
      return;
    }
    setLoading(true);
    setStatus(null);
    try {
      console.log("[v0] Admin Google login attempting...");
      await firebaseAdminGoogleLogin();
      console.log("[v0] Google login successful, waiting for server session...");
      const sessionReady = await waitForServerSession();
      if (sessionReady) {
        window.location.href = "/admin";
      } else {
        await firebaseSignOut().catch(() => {});
        setStatus({ type: "error", msg: "Login succeeded but session could not be confirmed. Please try again." });
      }
    } catch (err: any) {
      await firebaseSignOut().catch(() => {});
      const msg: string = err?.message || "Google sign-in failed.";
      console.error("[v0] Google login error:", { message: msg });
      setStatus({
        type: "error",
        msg: msg.includes("Admin access denied")
          ? "Admin access denied. This account does not have admin privileges."
          : msg,
      });
    } finally {
      setLoading(false);
    }
  };

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
                <img
                  src={ASSETS.LOGO_MAIN}
                  alt="VANIR GROUP"
                  className={`w-10 h-10 object-contain rounded-lg transition-opacity duration-300 ${
                    logoLoaded ? "opacity-100" : "opacity-0"
                  }`}
                  onLoad={() => setLogoLoaded(true)}
                  onError={() => setLogoLoaded(false)}
                  style={{ filter: logoLoaded ? "drop-shadow(0 0 8px rgba(201,168,76,0.3))" : "" }}
                />
                {!logoLoaded && (
                  <div className="w-10 h-10 bg-gradient-to-br from-[#c9a84c] to-[#a0842d] rounded-lg flex items-center justify-center text-white font-bold text-lg absolute">
                    V
                  </div>
                )}
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

              {/* Email + Password form */}
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

              {/* Google sign-in */}
              {isFirebaseConfigured && (
                <div>
                  <div className="flex items-center gap-3 my-1">
                    <div className="flex-1 h-px bg-white/8" />
                    <span className="text-xs text-gray-600">or</span>
                    <div className="flex-1 h-px bg-white/8" />
                  </div>
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={loading}
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
          <div className="relative rounded-[1.8rem] m-3 overflow-hidden hidden lg:block bg-gradient-to-br from-[#1a1208] to-[#0d0d1a]">
            <img
              src={EGYPT_IMAGE}
              alt="Egypt – Cairo"
              className="absolute inset-0 w-full h-full object-cover"
              loading="eager"
              onError={(e) => { e.currentTarget.style.display = "none"; }}
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
                <div
                  className="ml-auto w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, #c9a84c, #e8c96a)" }}
                >
                  <ArrowRight className="w-4 h-4" style={{ color: "#0d0a06" }} />
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
