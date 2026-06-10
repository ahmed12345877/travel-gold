import { trpc } from "@/lib/trpc";
import { UNAUTHED_ERR_MSG } from '@shared/const';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, TRPCClientError } from "@trpc/client";
import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import superjson from "superjson";
import App from "./App";
import { getAuth } from "firebase/auth"; // 1. استيراد مكتبة الفيربيز الرسمية
import { GlobalThemeStyleInjector } from "./contexts/GlobalThemeStyleInjector";
import { ThemeColorsApplier } from "./contexts/ThemeColorsApplier";
import { ThemeColorsProvider } from "./contexts/ThemeColorsProvider";
import { ThemeModeProvider } from "./contexts/ThemeModeProvider";
import "./index.css";

const queryClient = new QueryClient();

// دالة لإعادة توجيه المستخدم لصفحة الدخول إذا انتهت صلاحية جلسته
const redirectToLoginIfUnauthorized = (error: unknown) => {
  if (!(error instanceof TRPCClientError)) return;
  if (typeof window === "undefined") return;

  const isUnauthorized = error.message === UNAUTHED_ERR_MSG;
  if (!isUnauthorized) return;

  window.location.href = "/admin/login";
};

// مراقبة الأخطاء العامة في جلب البيانات
queryClient.getQueryCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    redirectToLoginIfUnauthorized(event.query.state.error);
    console.error("[API Query Error]", event.query.state.error);
  }
});

queryClient.getMutationCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    redirectToLoginIfUnauthorized(event.mutation.state.error);
    console.error("[API Mutation Error]", event.mutation.state.error);
  }
});

// تحديد رابط الـ API بشكل صحيح للنطاق الفرعي والسيرفر
function getApiUrl(): string {
  return "https://vanirgroup.com/api/trpc";
}

// إنشاء عميل tRPC وتمرير الـ Token الخاص بـ Firebase تلقائياً مع كل طلب
const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: getApiUrl(),
      transformer: superjson,
      async fetch(input, init) {
        let token: string | null = null;
        try {
          // 2. جلب المستخدم الحالي النشط من Firebase وتوليد رمز أمان جديد له
          const auth = getAuth();
          const currentUser = auth.currentUser;
          if (currentUser) {
            token = await currentUser.getIdToken();
          }
        } catch (err) {
          console.error("فشل جلب الـ Token من Firebase:", err);
          token = null;
        }

        const headers = new Headers(init?.headers || {});
        // إذا كان للأدمن جلسة نشطة، نرسل الرمز للسيرفر ليفحصه ويسمح بالدخول
        if (token) {
          headers.set("Authorization", `Bearer ${token}`);
        }

        return globalThis.fetch(input, {
          ...(init ?? {}),
          headers,
          credentials: "include",
        });
      },
    }),
  ],
});

// تشغيل الواجهة الأمامية للموقع
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
