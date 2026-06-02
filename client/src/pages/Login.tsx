import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { supabase, fetchSupabaseAuthSettings } from "@/lib/supabase";
import { trpc } from "@/lib/trpc";
import PageMeta from "@/components/PageMeta";
import { LogIn, UserPlus, Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const LOGO_URL =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663477605010/hMv7CdB7RdAWDPc2Ku9pP8/ss_c5f7e7e2.png";

const EGYPT_IMAGE =
  "https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?auto=format&fit=crop&w=1200&q=80";

export default function Login() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [providerState, setProviderState] = useState({
    checked: false,
    googleEnabled: false,
    emailEnabled: false,
    emailSignupsEnabled: false,
  });

  const [authError, setAuthError] = useState<string | null>(null);
  const supabaseLoginMutation = trpc.auth.supabaseLogin.useMutation();

  const searchParams = new URLSearchParams(globalThis.location?.search || "");
  const nextPath = searchParams.get("next") || "/";

  useEffect(() => {
    if (isAuthenticated && user) {
      setLocation(nextPath.startsWith("/admin") ? nextPath : "/");
    }
  }, [isAuthenticated, user, setLocation, nextPath]);

  useEffect(() => {
    if (!supabase) return;
    void (async () => {
      const settings = await fetchSupabaseAuthSettings();
      const googleEnabled = Boolean(settings?.external?.google?.enabled);
      const emailEnabled = Boolean(settings?.email?.enabled);
      const emailSignupsEnabled = Boolean(settings?.email?.enable_signup);
      setProviderState({ checked: true, googleEnabled, emailEnabled, emailSignupsEnabled });
    })();
  }, []);

  const handleOAuthLogin = async () => {
    try {
      if (supabase && (!providerState.checked || providerState.googleEnabled)) {
        const next = encodeURIComponent(nextPath);
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: { redirectTo: `${window.location.origin}/auth/callback?next=${next}` },
        });
        if (!error && data?.url) {
          window.location.href = data.url;
          return;
        }
      }
    } catch {}
    window.location.href = getLoginUrl();
  };

  const handleEmailAuth = async () => {
    if (!supabase) return handleOAuthLogin();
    if (providerState.checked && (!providerState.emailEnabled || (activeTab === "signup" && !providerState.emailSignupsEnabled))) {
      return handleOAuthLogin();
    }
    if (!email || !password) return handleOAuthLogin();
    setAuthError(null);
    if (activeTab === "signin") {
      const { data: authData, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setAuthError(error.message);
        return;
      }
      // أضف هذا الكود بعد السطر 87 مباشرة:
if (authData?.session) {
  // قراءة الـ role من الـ user_metadata الخاصة بالحساب المسجل
  const userRole = authData.session.user.user_metadata?.role;

  if (userRole === "admin") {
    setLocation("/admin"); // توجيه المسؤول لصفحة الإدارة
  } else {
    setLocation("/home"); // توجيه العميل العادي للصفحة الرئيسية (أو /dashboard حسب رغبتك)
  }
}

      if (nextPath.startsWith("/admin")) {
        const accessToken = authData?.session?.access_token;
        if (!accessToken) {
          setAuthError("Could not retrieve session token.");
          return;
        }
        try {
          await supabaseLoginMutation.mutateAsync({ accessToken });
          setLocation(nextPath);
        } catch (err: any) {
          await supabase.auth.signOut();
          setAuthError(err?.message || "This account does not have admin privileges.");
        }
        return;
      }
      setLocation(nextPath);
      return;
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } },
      });
      if (!error) {
        setLocation(nextPath);
        return;
      }
    }
    handleOAuthLogin();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080810] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-[var(--theme-primary)] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080810]">
      <PageMeta
        title="Login | VANIR GROUP"
        description="Sign in to your VANIR GROUP account to access exclusive travel packages, manage bookings, and enjoy personalized travel experiences."
        keywords="login, sign in, VANIR GROUP account, travel booking"
        canonicalPath="/login"
      />
      <Navbar />

      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-[960px] bg-[#0d0d1a] rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/5">
          <div className="grid lg:grid-cols-2" style={{ minHeight: "600px" }}>

            {/* Left side – Form */}
            <div className="flex flex-col justify-center p-8 lg:p-12">
              <div className="w-full max-w-[380px] mx-auto space-y-5">

                {/* Logo + Brand */}
                <div className="flex items-center gap-3 mb-1">
                  <img src={LOGO_URL} alt="VANIR GROUP" className="w-10 h-10 object-contain" />
                  <span className="text-white font-bold text-xl">
                    VANIR <span className="text-[var(--theme-primary)]">GROUP</span>
                  </span>
                </div>

                {/* Heading */}
                <div>
                  <h1 className="text-[26px] font-semibold text-white leading-tight">
                    {activeTab === "signin" ? "Welcome back" : "Create your account"}
                  </h1>
                  <p className="text-sm text-gray-500 mt-1.5">
                    {activeTab === "signin"
                      ? "Sign in to your account to continue."
                      : "Start your luxury Egypt travel journey today."}
                  </p>
                </div>

                {/* Tab switcher */}
                <div className="flex gap-1 bg-white/5 rounded-xl p-1">
                  <button
                    onClick={() => setActiveTab("signin")}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                      activeTab === "signin"
                        ? "bg-[var(--theme-primary)] text-black shadow-lg"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    Sign In
                  </button>
                  <button
                    onClick={() => setActiveTab("signup")}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                      activeTab === "signup"
                        ? "bg-[var(--theme-primary)] text-black shadow-lg"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    Sign Up
                  </button>
                </div>

                {/* Google button */}
                <button
                  type="button"
                  onClick={handleOAuthLogin}
                  className="w-full h-[50px] flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl text-sm text-white font-normal transition-all"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  {activeTab === "signin" ? "Continue with Google" : "Sign up with Google"}
                </button>

                {/* Social: Facebook + Apple */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => toast.info("Facebook Sign In coming soon!")}
                    className="flex items-center justify-center gap-2 h-[44px] bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#1877F2]/30 rounded-xl text-sm text-gray-400 hover:text-white transition-all"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#1877F2">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                    Facebook
                  </button>
                  <button
                    type="button"
                    onClick={() => toast.info("Apple Sign In coming soon!")}
                    className="flex items-center justify-center gap-2 h-[44px] bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl text-sm text-gray-400 hover:text-white transition-all"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="white">
                      <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                    </svg>
                    Apple
                  </button>
                </div>

                {/* Divider */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-white/8" />
                  <span className="text-gray-600 text-xs">or continue with email</span>
                  <div className="flex-1 h-px bg-white/8" />
                </div>

                {/* Email/Password form */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    void handleEmailAuth();
                  }}
                  className="space-y-3"
                >
                  {activeTab === "signup" && (
                    <div className="relative">
                      <UserPlus className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                      <input
                        type="text"
                        placeholder="Full Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full h-[50px] bg-white/4 border border-white/10 rounded-xl pl-11 pr-4 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-[var(--theme-primary)]/50 focus:ring-1 focus:ring-[var(--theme-primary)]/20 transition-all"
                      />
                    </div>
                  )}

                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                    <input
                      type="email"
                      placeholder="name@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-[50px] bg-white/4 border border-white/10 rounded-xl pl-11 pr-4 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-[var(--theme-primary)]/50 focus:ring-1 focus:ring-[var(--theme-primary)]/20 transition-all"
                    />
                  </div>

                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full h-[50px] bg-white/4 border border-white/10 rounded-xl pl-11 pr-11 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-[var(--theme-primary)]/50 focus:ring-1 focus:ring-[var(--theme-primary)]/20 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-300 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {activeTab === "signin" && (
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          className="w-3.5 h-3.5 rounded border-white/10 bg-white/5 text-[var(--theme-primary)]"
                        />
                        <span className="text-gray-500 text-xs">Remember me</span>
                      </label>
                      <button type="button" className="text-[var(--theme-primary)] text-xs hover:text-[#c49a48] transition-colors">
                        Forgot password?
                      </button>
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full h-[50px] bg-[var(--theme-primary)] hover:bg-[#c49a48] text-black font-semibold rounded-xl text-sm shadow-lg shadow-[var(--theme-primary)]/20 transition-all"
                  >
                    {activeTab === "signin" ? (
                      <>
                        <LogIn className="w-4 h-4 mr-2" />
                        Sign In
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Create Account
                      </>
                    )}
                  </Button>
                </form>

                {authError && (
                  <div className="px-4 py-3 rounded-xl border border-red-500/20 bg-red-500/10 text-red-300 text-sm text-center">
                    {authError}
                  </div>
                )}

                <p className="text-center text-gray-600 text-xs">
                  {activeTab === "signin" ? (
                    <>
                      Don&apos;t have an account?{" "}
                      <button
                        onClick={() => setActiveTab("signup")}
                        className="text-[var(--theme-primary)] hover:text-[#c49a48] font-medium transition-colors"
                      >
                        Sign up
                      </button>
                    </>
                  ) : (
                    <>
                      Already have an account?{" "}
                      <button
                        onClick={() => setActiveTab("signin")}
                        className="text-[var(--theme-primary)] hover:text-[#c49a48] font-medium transition-colors"
                      >
                        Sign in
                      </button>
                    </>
                  )}
                </p>

                <p className="text-center text-gray-700 text-[10px] leading-relaxed">
                  By continuing, you agree to VANIR GROUP&apos;s{" "}
                  <span className="text-gray-500 hover:text-[var(--theme-primary)] cursor-pointer transition-colors">
                    Terms of Service
                  </span>{" "}
                  and{" "}
                  <span className="text-gray-500 hover:text-[var(--theme-primary)] cursor-pointer transition-colors">
                    Privacy Policy
                  </span>
                </p>
              </div>
            </div>

            {/* Right side – Egypt image pane */}
            <div className="relative rounded-[1.8rem] m-3 overflow-hidden hidden lg:block">
              <img
                src={EGYPT_IMAGE}
                alt="Egypt – Pyramids of Giza"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />

              {/* Caption card */}
              <div className="absolute bottom-5 left-5 right-5 bg-[#0d0d1a]/80 backdrop-blur-md rounded-2xl shadow-xl p-4 border border-white/8">
                <p className="text-sm text-white/80 leading-relaxed">
                  Discover Egypt&apos;s timeless wonders — from the majestic Pyramids of Giza to the sacred temples of Luxor.
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-white/6 rounded-lg">
                    <div className="w-2 h-2 bg-[var(--theme-primary)] rounded-full" />
                    <span className="text-xs text-[var(--theme-primary)] font-medium">Explore Egypt</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-white/6 rounded-lg">
                    <span className="text-xs text-gray-400">VANIR GROUP</span>
                  </div>
                  <button
                    onClick={() => setLocation("/")}
                    className="ml-auto w-8 h-8 rounded-full bg-[var(--theme-primary)] hover:bg-[#c49a48] flex items-center justify-center transition-colors"
                  >
                    <ArrowRight className="w-4 h-4 text-black" />
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
