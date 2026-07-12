import { trpc } from "@/lib/trpc";
import { UNAUTHED_ERR_MSG } from '@shared/const';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, TRPCClientError } from "@trpc/client";
import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import superjson from "superjson";
import App from "./App";
// 1. استيراد دالة Auth الآمنة التي تضمن تهيئة Firebase أولاً
import { getFirebaseAuth } from "@/lib/firebase-api";
import { installGlobalImageErrorHandler } from "@/lib/imageFallback";
import { ThemeColorsProvider } from "./contexts/ThemeColorsProvider";
import "./index.css";

// Ensure dark theme is always applied
if (typeof document !== 'undefined') {
  document.documentElement.classList.add('dark');
  installGlobalImageErrorHandler();
}

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

// تحديد رابط الـ API بشكل صحيح حسب النطاق الذي يعمل عليه الموقع.
// نستخدم VITE_API_URL إن وُجد، وإلا نعتمد على نفس نطاق الواجهة الأمامية
// (يدعم التطوير المحلي والإنتاج على Render أو أي استضافة أخرى).
function getApiUrl(): string {
  const env = import.meta.env as Record<string, string | undefined>;
  const configured = env.VITE_API_URL?.replace(/\/$/, "");
  if (configured) return `${configured}/api/trpc`;

  if (typeof window !== "undefined") {
    return `${window.location.origin}/api/trpc`;
  }

  return "/api/trpc";
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
          // 2. جلب نسخة Auth بشكل آمن (تهيّئ Firebase تلقائياً إن لم يكن مهيأ بعد)
          const auth = getFirebaseAuth();
          const currentUser = auth?.currentUser;
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
        <ThemeColorsProvider>
          <App />
        </ThemeColorsProvider>
      </QueryClientProvider>
    </trpc.Provider>
  </HelmetProvider>
);
