import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import PageMeta from "@/components/PageMeta";

export default function AuthCallback() {
  const [, navigate] = useLocation();
  const [message, setMessage] = useState<string>("Completing sign-in…");

  useEffect(() => {
    // Parse URL params once on mount
    const url = new URL(window.location.href);
    const params = url.searchParams;

    const next = params.get("next") || "/";
    const error = params.get("error");
    const errorCode = params.get("error_code");
    const errorDescription = params.get("error_description");

    // If Supabase (GoTrue) surfaced an error, show it plainly and stop.
    if (error || errorCode) {
      // Common case reported: bad_oauth_state (state not found/expired)
      const desc = decodeURIComponent(errorDescription || error || "Authentication failed.");
      setMessage(`Sign-in error: ${desc}`);
      // Keep the user on this page so they can retry from the normal login screen.
      // After a brief pause, send them back to the login page or the intended next path.
      const backTo = next.startsWith("/admin") ? "/admin/login" : "/login";
      const timer = setTimeout(() => navigate(backTo), 2500);
      return () => clearTimeout(timer);
    }

    // Finalize the PKCE OAuth flow by exchanging the code for a session
    (async () => {
      if (!supabase) {
        setMessage("Auth is not configured.");
        const timer = setTimeout(() => navigate("/login"), 1500);
        return () => clearTimeout(timer);
      }

      try {
        await supabase.auth.exchangeCodeForSession(window.location.href);
        // Session is now established in the client; continue to the intended destination
        navigate(next);
      } catch (err: any) {
        // Fallback for magic-link style callbacks that deliver access_token in hash
        try {
          const { data } = await supabase.auth.getSession();
          if (data.session) {
            navigate(next);
            return;
          }
        } catch {}
        setMessage(err?.message || "Failed to complete sign-in.");
        const backTo = next.startsWith("/admin") ? "/admin/login" : "/login";
        const timer = setTimeout(() => navigate(backTo), 2000);
        return () => clearTimeout(timer);
      }
    })();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#0a0a14] flex items-center justify-center px-4">
      <PageMeta title="Signing In…" description="Completing authentication" canonicalPath="/auth/callback" />
      <div className="flex items-center gap-3 text-white/80 text-sm">
        <span className="inline-block w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: "var(--theme-primary) transparent var(--theme-primary) transparent" }} />
        <span>{message}</span>
      </div>
    </div>
  );
}
