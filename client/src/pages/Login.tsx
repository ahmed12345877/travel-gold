import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import PageMeta from "@/components/PageMeta";
import {
  LogIn,
  UserPlus,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  Globe,
  Shield,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const LOGO_URL =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663477605010/hMv7CdB7RdAWDPc2Ku9pP8/ss_c5f7e7e2.png";

export default function Login() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      setLocation("/");
    }
  }, [isAuthenticated, user, setLocation]);

  const handleOAuthLogin = () => {
    window.location.href = getLoginUrl();
  };

  const features = [
    {
      icon: Globe,
      title: "Explore Egypt",
      desc: "Access exclusive travel packages and destinations",
    },
    {
      icon: Sparkles,
      title: "AI Studio",
      desc: "Generate stunning travel content with AI",
    },
    {
      icon: Shield,
      title: "Secure Booking",
      desc: "Safe and encrypted payment processing",
    },
    {
      icon: Zap,
      title: "Instant Access",
      desc: "Quick sign-in with your VANIR account",
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a14] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-[var(--theme-primary)] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a14]">
      <PageMeta
        title="Login | VANIR GROUP"
        description="Sign in to your VANIR GROUP account to access exclusive travel packages, manage bookings, and enjoy personalized travel experiences."
        keywords="login, sign in, VANIR GROUP account, travel booking"
        canonicalPath="/login"
      />
      <Navbar />

      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-12 sm:py-20">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-0 overflow-hidden rounded-2xl border border-[var(--theme-primary)]/20 shadow-2xl shadow-[var(--theme-primary)]/5">
          {/* Left side - Branding */}
          <div className="relative hidden lg:flex flex-col justify-between p-10 bg-gradient-to-br from-[#0d0d1a] via-[#111128] to-[#0a0a14] overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-5">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23D4A853' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }}
              />
            </div>

            {/* Gold accent line */}
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[var(--theme-primary)] via-[var(--theme-primary)]/50 to-transparent" />

            <div className="relative z-10">
              <img
                src={LOGO_URL}
                alt="VANIR GROUP"
                className="w-16 h-16 mb-8 object-contain"
              />
              <h2 className="text-3xl font-bold text-white mb-3">
                Welcome to{" "}
                <span className="text-[var(--theme-primary)]">VANIR GROUP</span>
              </h2>
              <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
                Your gateway to luxury travel experiences in Egypt. Sign in to
                access exclusive destinations, AI-powered content creation, and
                personalized travel packages.
              </p>
            </div>

            <div className="relative z-10 space-y-4 mt-8">
              {features.map((feature, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 group"
                >
                  <div className="w-9 h-9 rounded-lg bg-[var(--theme-primary)]/10 border border-[var(--theme-primary)]/20 flex items-center justify-center shrink-0 group-hover:bg-[var(--theme-primary)]/20 transition-colors">
                    <feature.icon className="w-4 h-4 text-[var(--theme-primary)]" />
                  </div>
                  <div>
                    <h4 className="text-white text-sm font-medium">
                      {feature.title}
                    </h4>
                    <p className="text-gray-500 text-xs">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <p className="relative z-10 text-gray-600 text-xs mt-8">
              &copy; {new Date().getFullYear()} VANIR GROUP. All rights reserved.
            </p>
          </div>

          {/* Right side - Auth Form */}
          <div className="p-8 sm:p-10 bg-[#0f0f1f]">
            {/* Mobile logo */}
            <div className="lg:hidden flex items-center gap-3 mb-8">
              <img
                src={LOGO_URL}
                alt="VANIR GROUP"
                className="w-10 h-10 object-contain"
              />
              <span className="text-white font-bold text-lg">
                VANIR <span className="text-[var(--theme-primary)]">GROUP</span>
              </span>
            </div>

            {/* Tab switcher */}
            <div className="flex bg-[var(--card)] rounded-xl p-1 mb-8">
              <button
                onClick={() => setActiveTab("signin")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                  activeTab === "signin"
                    ? "bg-[var(--theme-primary)] text-black shadow-lg shadow-[var(--theme-primary)]/20"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <LogIn className="w-4 h-4" />
                Sign In
              </button>
              <button
                onClick={() => setActiveTab("signup")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                  activeTab === "signup"
                    ? "bg-[var(--theme-primary)] text-black shadow-lg shadow-[var(--theme-primary)]/20"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <UserPlus className="w-4 h-4" />
                Sign Up
              </button>
            </div>

            {/* Form header */}
            <div className="mb-6">
              <h3 className="text-xl font-bold text-white">
                {activeTab === "signin"
                  ? "Sign in to your account"
                  : "Create your account"}
              </h3>
              <p className="text-gray-500 text-sm mt-1">
                {activeTab === "signin"
                  ? "Welcome back! Please enter your details."
                  : "Start your luxury travel journey today."}
              </p>
            </div>

            {/* OAuth Button - Primary */}
            <Button
              onClick={handleOAuthLogin}
              className="w-full bg-[var(--theme-primary)] hover:bg-[#c49a48] text-black font-semibold py-6 rounded-xl text-sm shadow-lg shadow-[var(--theme-primary)]/20 hover:shadow-[var(--theme-primary)]/30 transition-all group"
            >
              <img
                src={LOGO_URL}
                alt=""
                className="w-5 h-5 mr-2 object-contain"
              />
              {activeTab === "signin"
                ? "Sign in with VANIR Account"
                : "Sign up with VANIR Account"}
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>

            {/* Social OAuth Buttons */}
            <div className="grid grid-cols-3 gap-3 mt-4">
              {/* Google */}
              <button
                type="button"
                onClick={() => toast.info("Google Sign In coming soon!", { description: "This feature will be available shortly." })}
                className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl border border-[#2a2a3e] bg-[var(--card)] hover:bg-[#2a2a3e] hover:border-[var(--theme-primary)]/30 transition-all group"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span className="text-gray-400 text-xs font-medium hidden sm:inline group-hover:text-white transition-colors">Google</span>
              </button>

              {/* Facebook */}
              <button
                type="button"
                onClick={() => toast.info("Facebook Sign In coming soon!", { description: "This feature will be available shortly." })}
                className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl border border-[#2a2a3e] bg-[var(--card)] hover:bg-[#2a2a3e] hover:border-[#1877F2]/30 transition-all group"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1877F2">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span className="text-gray-400 text-xs font-medium hidden sm:inline group-hover:text-white transition-colors">Facebook</span>
              </button>

              {/* Apple */}
              <button
                type="button"
                onClick={() => toast.info("Apple Sign In coming soon!", { description: "This feature will be available shortly." })}
                className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl border border-[#2a2a3e] bg-[var(--card)] hover:bg-[#2a2a3e] hover:border-white/20 transition-all group"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="white">
                  <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
                <span className="text-gray-400 text-xs font-medium hidden sm:inline group-hover:text-white transition-colors">Apple</span>
              </button>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[var(--theme-primary)]/20 to-transparent" />
              <span className="text-gray-600 text-xs uppercase tracking-wider">
                or continue with email
              </span>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[var(--theme-primary)]/20 to-transparent" />
            </div>

            {/* Email/Password Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                // Redirect to OAuth for now
                handleOAuthLogin();
              }}
              className="space-y-4"
            >
              {activeTab === "signup" && (
                <div className="relative">
                  <UserPlus className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[var(--card)] border border-[#2a2a3e] rounded-xl py-3 pl-11 pr-4 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-[var(--theme-primary)]/50 focus:ring-1 focus:ring-[var(--theme-primary)]/20 transition-all"
                  />
                </div>
              )}

              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[var(--card)] border border-[#2a2a3e] rounded-xl py-3 pl-11 pr-4 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-[var(--theme-primary)]/50 focus:ring-1 focus:ring-[var(--theme-primary)]/20 transition-all"
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[var(--card)] border border-[#2a2a3e] rounded-xl py-3 pl-11 pr-11 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-[var(--theme-primary)]/50 focus:ring-1 focus:ring-[var(--theme-primary)]/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>

              {activeTab === "signin" && (
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-3.5 h-3.5 rounded border-[#2a2a3e] bg-[var(--card)] text-[var(--theme-primary)] focus:ring-[var(--theme-primary)]/20"
                    />
                    <span className="text-gray-500 text-xs">Remember me</span>
                  </label>
                  <button
                    type="button"
                    className="text-[var(--theme-primary)] text-xs hover:text-[#c49a48] transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-[var(--card)] hover:bg-[#2a2a3e] text-white border border-[#2a2a3e] hover:border-[var(--theme-primary)]/30 py-5 rounded-xl text-sm transition-all"
              >
                {activeTab === "signin" ? (
                  <>
                    <LogIn className="w-4 h-4 mr-2" />
                    Sign In with Email
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Create Account
                  </>
                )}
              </Button>
            </form>

            {/* Footer text */}
            <p className="text-center text-gray-600 text-xs mt-6">
              {activeTab === "signin" ? (
                <>
                  Don't have an account?{" "}
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

            {/* Terms */}
            <p className="text-center text-gray-700 text-[10px] mt-4 leading-relaxed">
              By continuing, you agree to VANIR GROUP's{" "}
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
      </div>

      <Footer />
    </div>
  );
}
