import { useEffect } from "react";
import { useLocation } from "wouter";
import PageMeta from "@/components/PageMeta";

// Firebase uses popup-based sign-in, so OAuth redirect callbacks are not needed.
// This page handles any residual redirect URLs by reading the `next` param
// and routing the user to the intended destination.
export default function AuthCallback() {
  const [, navigate] = useLocation();

  useEffect(() => {
    const url = new URL(window.location.href);
    const next = url.searchParams.get("next") || "/";
    const error = url.searchParams.get("error");

    if (error) {
      const dest = next.startsWith("/admin") ? "/admin/login" : "/login";
      const timer = setTimeout(() => navigate(dest), 1500);
      return () => clearTimeout(timer);
    }

    navigate(next);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#0a0a14] flex items-center justify-center px-4">
      <PageMeta title="Signing In…" description="Completing authentication" canonicalPath="/auth/callback" />
      <div className="flex items-center gap-3 text-white/80 text-sm">
        <span
          className="inline-block w-5 h-5 border-2 rounded-full animate-spin"
          style={{ borderColor: "var(--theme-primary) transparent var(--theme-primary) transparent" }}
        />
        <span>Completing sign-in…</span>
      </div>
    </div>
  );
}
