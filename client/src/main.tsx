import { trpc } from "@/lib/trpc";
import { UNAUTHED_ERR_MSG } from '@shared/const';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, TRPCClientError } from "@trpc/client";
import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import superjson from "superjson";
import App from "./App";
import { getLoginUrl } from "./const";
import { supabase } from "./lib/supabase";
import { GlobalThemeStyleInjector } from "./contexts/GlobalThemeStyleInjector";
import { ThemeColorsApplier } from "./contexts/ThemeColorsApplier";
import { ThemeColorsProvider } from "./contexts/ThemeColorsProvider";
import { ThemeModeProvider } from "./contexts/ThemeModeProvider";
import "./index.css";

const queryClient = new QueryClient();

const redirectToLoginIfUnauthorized = (error: unknown) => {
  if (!(error instanceof TRPCClientError)) return;
  if (typeof window === "undefined") return;

  const isUnauthorized = error.message === UNAUTHED_ERR_MSG;

  if (!isUnauthorized) return;

  // Route unauthorized users to the internal admin login to avoid external NXDOMAINs
  window.location.href = "/admin/login";
};

queryClient.getQueryCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.query.state.error;
    redirectToLoginIfUnauthorized(error);
    console.error("[API Query Error]", error);
  }
});

queryClient.getMutationCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.mutation.state.error;
    redirectToLoginIfUnauthorized(error);
    console.error("[API Mutation Error]", error);
  }
});

const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: "https://vanirgroup.com",
      transformer: superjson,
      async fetch(input, init) {
        let token: string | null = null;
        try {
          const session = await supabase?.auth.getSession();
          token = session?.data.session?.access_token ?? null;
        } catch {
          token = null;
        }

        const headers = new Headers(init?.headers || {});
        if (token) headers.set("Authorization", `Bearer ${token}`);

        return globalThis.fetch(input, {
          ...(init ?? {}),
          headers,
          credentials: "include",
        });
      },
    }),
  ],
});

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <ThemeModeProvider>
          <GlobalThemeStyleInjector />
          <ThemeColorsApplier />
          <ThemeColorsProvider>
            <App />
          </ThemeColorsProvider>
        </ThemeModeProvider>
      </QueryClientProvider>
    </trpc.Provider>
  </HelmetProvider>
);
