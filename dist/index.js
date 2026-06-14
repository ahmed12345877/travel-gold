var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// lib/firebase-admin.ts
import admin from "firebase-admin";
function validateServiceAccount(serviceAccount) {
  const requiredFields = ["project_id", "client_email", "private_key"];
  const missingFields = requiredFields.filter((field) => !serviceAccount[field]);
  if (missingFields.length > 0) {
    throw new Error(
      `Invalid Firebase service account: missing required fields [${missingFields.join(", ")}]. Ensure your FIREBASE_SERVICE_ACCOUNT_JSON contains all required fields.`
    );
  }
}
function getStorageBucketName(serviceAccount) {
  if (process.env.FIREBASE_STORAGE_BUCKET) {
    console.log("[Firebase Admin] Using FIREBASE_STORAGE_BUCKET from environment (recommended)");
    return process.env.FIREBASE_STORAGE_BUCKET;
  }
  const projectId = serviceAccount["project_id"];
  if (typeof projectId === "string") {
    const bucket = `${projectId}.appspot.com`;
    console.log(`[Firebase Admin] WARNING: Derived storage bucket from service account (not recommended). Set FIREBASE_STORAGE_BUCKET environment variable explicitly for production.`);
    return bucket;
  }
  throw new Error(
    "Could not determine Firebase Storage bucket. CRITICAL: Either explicitly set FIREBASE_STORAGE_BUCKET environment variable (RECOMMENDED) or ensure FIREBASE_SERVICE_ACCOUNT_JSON contains valid project_id field."
  );
}
function initializeFirebaseAdmin() {
  if (firebaseAppInstance) {
    return firebaseAppInstance;
  }
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!serviceAccountJson) {
    throw new Error(
      "CRITICAL: Environment variable FIREBASE_SERVICE_ACCOUNT_JSON is not set. Please add your Firebase service account JSON (downloaded from Firebase Console) to your environment variables."
    );
  }
  let serviceAccount;
  try {
    serviceAccount = JSON.parse(serviceAccountJson);
  } catch (parseError) {
    const error = parseError instanceof Error ? parseError.message : String(parseError);
    throw new Error(
      `FIREBASE_SERVICE_ACCOUNT_JSON is not valid JSON. Parse error: ${error}. Please ensure it is properly formatted (no trailing commas, valid strings, etc.).`
    );
  }
  validateServiceAccount(serviceAccount);
  const storageBucket = getStorageBucketName(serviceAccount);
  cachedStorageBucket = storageBucket;
  firebaseAppInstance = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket
  });
  console.log(`[Firebase Admin] Successfully initialized Firebase Admin SDK with bucket: ${storageBucket}`);
  return firebaseAppInstance;
}
function getFirebaseApp() {
  if (firebaseAppInstance) {
    return firebaseAppInstance;
  }
  return initializeFirebaseAdmin();
}
function getFirebaseStorage() {
  const app = getFirebaseApp();
  if (cachedStorageBucket) {
    console.log(`[Firebase Admin] Using cached storage bucket: ${cachedStorageBucket}`);
    return admin.storage(app).bucket(cachedStorageBucket);
  }
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!serviceAccountJson) {
    throw new Error(
      "CRITICAL: FIREBASE_SERVICE_ACCOUNT_JSON not set. Cannot determine Firebase Storage bucket."
    );
  }
  let serviceAccount;
  try {
    serviceAccount = JSON.parse(serviceAccountJson);
  } catch (parseError) {
    const error = parseError instanceof Error ? parseError.message : String(parseError);
    throw new Error(
      `Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON in fallback path. Parse error: ${error}. This should not occur in normal operation; please check your environment variables.`
    );
  }
  validateServiceAccount(serviceAccount);
  const bucketName = getStorageBucketName(serviceAccount);
  cachedStorageBucket = bucketName;
  console.log(`[Firebase Admin] Caching and using storage bucket: ${bucketName}`);
  return admin.storage(app).bucket(bucketName);
}
var firebaseAppInstance, cachedStorageBucket;
var init_firebase_admin = __esm({
  "lib/firebase-admin.ts"() {
    "use strict";
    firebaseAppInstance = null;
    cachedStorageBucket = null;
  }
});

// lib/firebase-storage.ts
async function storagePut(filePath, fileBuffer, contentType = "application/octet-stream", metadata) {
  try {
    const bucket = getFirebaseStorage();
    const file = bucket.file(filePath);
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;
    const options = {
      metadata: {
        contentType,
        cacheControl: "public, max-age=31536000",
        // Cache for 1 year (files are immutable)
        ...metadata
      }
    };
    await file.save(fileBuffer, options);
    console.log(`[Firebase Storage] Successfully uploaded: ${filePath}`);
    return {
      url: publicUrl,
      path: filePath,
      bucket: bucket.name
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    console.error(`[Firebase Storage] Upload failed for ${filePath}:`, errorMessage);
    throw new Error(`Failed to upload file to Firebase Storage: ${errorMessage}`);
  }
}
var init_firebase_storage = __esm({
  "lib/firebase-storage.ts"() {
    "use strict";
    init_firebase_admin();
  }
});

// vite.config.ts
var vite_config_exports = {};
__export(vite_config_exports, {
  default: () => vite_config_default
});
import { jsxLocPlugin } from "@builder.io/vite-plugin-jsx-loc";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path3 from "node:path";
import { defineConfig } from "vite";
var PROJECT_ROOT, plugins, vite_config_default;
var init_vite_config = __esm({
  "vite.config.ts"() {
    "use strict";
    PROJECT_ROOT = import.meta.dirname;
    plugins = [react(), tailwindcss(), jsxLocPlugin()];
    vite_config_default = defineConfig({
      base: "/",
      plugins,
      resolve: {
        alias: {
          "@": path3.resolve(import.meta.dirname, "client", "src"),
          "@shared": path3.resolve(import.meta.dirname, "shared"),
          "@assets": path3.resolve(import.meta.dirname, "attached_assets")
        }
      },
      envDir: path3.resolve(import.meta.dirname),
      root: path3.resolve(import.meta.dirname, "client"),
      publicDir: path3.resolve(import.meta.dirname, "client", "public"),
      build: {
        outDir: path3.resolve(import.meta.dirname, "dist/public"),
        emptyOutDir: true,
        rollupOptions: {
          output: {
            // ضمان وجود بصمة (hash) فريدة في أسماء الملفات لكسر الكاش عند كل تحديث
            entryFileNames: "assets/[name]-[hash].js",
            chunkFileNames: "assets/[name]-[hash].js",
            assetFileNames: "assets/[name]-[hash].[ext]"
          }
        }
      },
      server: {
        host: true,
        allowedHosts: ["localhost", "127.0.0.1"],
        fs: {
          strict: true,
          deny: ["**/.*"]
        }
      }
    });
  }
});

// server/_core/index.ts
import "dotenv/config";
import express2 from "express";
import { createServer } from "http";
import net from "net";
import path5 from "path";
import cors from "cors";
import { createExpressMiddleware } from "@trpc/server/adapters/express";

// shared/const.ts
var COOKIE_NAME = "app_session_id";
var ONE_YEAR_MS = 1e3 * 60 * 60 * 24 * 365;
var UNAUTHED_ERR_MSG = "Please login (10001)";
var NOT_ADMIN_ERR_MSG = "You do not have required permission (10002)";

// server/db.ts
import { eq, desc, asc, and, gte, lte, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

// drizzle/schema.ts
import { serial, pgTable, text, timestamp, varchar, bigint, decimal, json, integer } from "drizzle-orm/pg-core";
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 32 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  avatarUrl: text("avatarUrl"),
  role: text("role").$type().default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull()
});
var bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  userId: integer("userId").references(() => users.id),
  guestName: varchar("guestName", { length: 255 }),
  guestEmail: varchar("guestEmail", { length: 320 }),
  guestPhone: varchar("guestPhone", { length: 32 }),
  packageName: varchar("packageName", { length: 255 }).notNull(),
  packageCategory: varchar("packageCategory", { length: 100 }),
  destination: varchar("destination", { length: 255 }),
  checkInDate: bigint("checkInDate", { mode: "number" }),
  checkOutDate: bigint("checkOutDate", { mode: "number" }),
  adults: integer("adults").default(1),
  children: integer("children").default(0),
  roomType: varchar("roomType", { length: 100 }),
  totalPrice: decimal("totalPrice", { precision: 10, scale: 2 }),
  currency: varchar("currency", { length: 10 }).default("USD"),
  paymentMethod: text("paymentMethod").$type(),
  paymentStatus: text("paymentStatus").$type().default("pending").notNull(),
  promoCode: varchar("promoCode", { length: 50 }),
  discountAmount: decimal("discountAmount", { precision: 10, scale: 2 }),
  specialRequests: text("specialRequests"),
  billingAddress: json("billingAddress"),
  status: text("status").$type().default("pending").notNull(),
  confirmationCode: varchar("confirmationCode", { length: 20 }).unique(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull()
});
var reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  userId: integer("userId").references(() => users.id),
  guestName: varchar("guestName", { length: 255 }),
  guestAvatarUrl: text("guestAvatarUrl"),
  tripName: varchar("tripName", { length: 255 }).notNull(),
  destination: varchar("destination", { length: 255 }),
  rating: integer("rating").notNull(),
  title: varchar("title", { length: 500 }),
  content: text("content").notNull(),
  photoUrls: json("photoUrls"),
  travelDate: bigint("travelDate", { mode: "number" }),
  adminReply: text("adminReply"),
  adminReplyAt: timestamp("adminReplyAt"),
  isApproved: text("isApproved").$type().default("pending").notNull(),
  helpfulCount: integer("helpfulCount").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull()
});
var offers = pgTable("offers", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  discountType: text("discountType").$type().notNull(),
  discountValue: decimal("discountValue", { precision: 10, scale: 2 }).notNull(),
  promoCode: varchar("promoCode", { length: 50 }).unique(),
  startDate: bigint("startDate", { mode: "number" }).notNull(),
  endDate: bigint("endDate", { mode: "number" }).notNull(),
  category: varchar("category", { length: 100 }),
  destination: varchar("destination", { length: 255 }),
  imageUrl: text("imageUrl"),
  totalSpots: integer("totalSpots"),
  bookedSpots: integer("bookedSpots").default(0),
  isActive: text("isActive").$type().default("active").notNull(),
  badgeText: varchar("badgeText", { length: 50 }),
  badgeColor: varchar("badgeColor", { length: 20 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull()
});
var contactMessages = pgTable("contact_messages", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 32 }),
  subject: varchar("subject", { length: 500 }),
  message: text("message").notNull(),
  status: text("status").$type().default("new").notNull(),
  adminNotes: text("adminNotes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull()
});
var fileUploads = pgTable("file_uploads", {
  id: serial("id").primaryKey(),
  userId: integer("userId").references(() => users.id),
  fileKey: varchar("fileKey", { length: 500 }).notNull(),
  url: text("url").notNull(),
  filename: varchar("filename", { length: 255 }).notNull(),
  mimeType: varchar("mimeType", { length: 100 }),
  fileSize: integer("fileSize"),
  purpose: varchar("purpose", { length: 50 }),
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
var galleryItems = pgTable("gallery_items", {
  id: serial("id").primaryKey(),
  imageUrl: text("imageUrl").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  titleAr: varchar("titleAr", { length: 255 }),
  description: text("description"),
  descriptionAr: text("descriptionAr"),
  category: varchar("category", { length: 100 }).notNull(),
  categoryAr: varchar("categoryAr", { length: 100 }),
  location: varchar("location", { length: 255 }),
  locationAr: varchar("locationAr", { length: 255 }),
  featured: text("featured").$type().default("no").notNull(),
  aspect: text("aspect").$type().default("landscape").notNull(),
  sortOrder: integer("sortOrder").default(0),
  isvisible: text("isvisible").$type().default("visible").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull()
});
var galleryVideos = pgTable("gallery_videos", {
  id: serial("id").primaryKey(),
  thumbnailUrl: text("thumbnailUrl").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  titleAr: varchar("titleAr", { length: 255 }),
  youtubeId: varchar("youtubeId", { length: 20 }).notNull(),
  duration: varchar("duration", { length: 20 }),
  views: varchar("views", { length: 20 }),
  sortOrder: integer("sortOrder").default(0),
  isVisible: text("isVisible").$type().default("visible").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull()
});
var aiSubscriptions = pgTable("ai_subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("userId").references(() => users.id).notNull(),
  plan: text("plan").$type().default("free").notNull(),
  monthlyPrice: decimal("monthlyPrice", { precision: 10, scale: 2 }).default("0"),
  status: text("status").$type().default("active").notNull(),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 255 }),
  startDate: bigint("startDate", { mode: "number" }).notNull(),
  renewalDate: bigint("renewalDate", { mode: "number" }),
  cancelledAt: timestamp("cancelledAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull()
});
var aiCredits = pgTable("ai_credits", {
  id: serial("id").primaryKey(),
  userId: integer("userId").references(() => users.id).notNull().unique(),
  balance: decimal("balance", { precision: 12, scale: 2 }).default("0").notNull(),
  totalUsed: decimal("totalUsed", { precision: 12, scale: 2 }).default("0").notNull(),
  lastResetDate: bigint("lastResetDate", { mode: "number" }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull()
});
var aiUsage = pgTable("ai_usage", {
  id: serial("id").primaryKey(),
  userId: integer("userId").references(() => users.id).notNull(),
  type: text("type").$type().notNull(),
  model: varchar("model", { length: 100 }).notNull(),
  prompt: text("prompt").notNull(),
  resultUrl: text("resultUrl"),
  resultKey: varchar("resultKey", { length: 500 }),
  creditsCost: decimal("creditsCost", { precision: 10, scale: 2 }).notNull(),
  imageSize: varchar("imageSize", { length: 50 }),
  videoDuration: integer("videoDuration"),
  status: text("status").$type().default("pending").notNull(),
  errorMessage: text("errorMessage"),
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
var aiTransactions = pgTable("ai_transactions", {
  id: serial("id").primaryKey(),
  userId: integer("userId").references(() => users.id).notNull(),
  type: text("type").$type().notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  stripePaymentId: varchar("stripePaymentId", { length: 255 }),
  paymentMethod: varchar("paymentMethod", { length: 50 }),
  status: text("status").$type().default("pending").notNull(),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
var blogPosts = pgTable("blog_posts", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  title: varchar("title", { length: 500 }).notNull(),
  excerpt: text("excerpt").notNull(),
  content: text("content").notNull(),
  metaTitle: varchar("metaTitle", { length: 70 }),
  metaDescription: varchar("metaDescription", { length: 160 }),
  metaKeywords: varchar("metaKeywords", { length: 500 }),
  coverImageUrl: text("coverImageUrl"),
  category: varchar("category", { length: 100 }),
  tags: json("tags"),
  authorId: integer("authorId").references(() => users.id),
  authorName: varchar("authorName", { length: 255 }).default("VANIR GROUP"),
  status: text("status").$type().default("draft").notNull(),
  publishedAt: timestamp("publishedAt"),
  viewCount: integer("viewCount").default(0),
  readingTime: integer("readingTime").default(5),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull()
});
var marketingContent = pgTable("marketing_content", {
  id: serial("id").primaryKey(),
  userId: integer("userId").references(() => users.id).notNull(),
  type: text("type").$type().notNull(),
  platform: varchar("platform", { length: 50 }),
  title: varchar("title", { length: 500 }),
  content: text("content").notNull(),
  prompt: text("prompt").notNull(),
  language: varchar("language", { length: 10 }).default("en"),
  tone: varchar("tone", { length: 50 }),
  destination: varchar("destination", { length: 255 }),
  hashtags: json("hashtags"),
  creditsCost: decimal("creditsCost", { precision: 10, scale: 2 }).default("1"),
  isFavorite: text("isFavorite").$type().default("no").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
var marketingCalendar = pgTable("marketing_calendar", {
  id: serial("id").primaryKey(),
  userId: integer("userId").references(() => users.id).notNull(),
  contentId: integer("contentId").references(() => marketingContent.id),
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description"),
  platform: varchar("platform", { length: 50 }),
  scheduledDate: bigint("scheduledDate", { mode: "number" }).notNull(),
  status: text("status").$type().default("draft").notNull(),
  colorTag: varchar("colorTag", { length: 20 }).default("#D4A853"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull()
});
var marketingTemplates = pgTable("marketing_templates", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  type: text("type").$type().notNull(),
  platform: varchar("platform", { length: 50 }),
  templateContent: text("templateContent").notNull(),
  systemPrompt: text("systemPrompt"),
  category: varchar("category", { length: 100 }),
  icon: varchar("icon", { length: 50 }),
  isBuiltIn: text("isBuiltIn").$type().default("no").notNull(),
  sortOrder: integer("sortOrder").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
var destinations = pgTable("destinations", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  location: varchar("location", { length: 255 }).notNull(),
  pricePerPerson: decimal("pricePerPerson", { precision: 10, scale: 2 }).default("0"),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("5"),
  imageUrl: text("imageUrl"),
  highlights: text("highlights"),
  bestTimeToVisit: varchar("bestTimeToVisit", { length: 255 }),
  duration: varchar("duration", { length: 100 }),
  difficulty: text("difficulty").$type(),
  groupSize: varchar("groupSize", { length: 100 }),
  inclusions: text("inclusions"),
  exclusions: text("exclusions"),
  isActive: text("isActive").$type().default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull()
});
var siteSettings = pgTable("site_settings", {
  id: serial("id").primaryKey(),
  category: varchar("category", { length: 50 }).notNull(),
  settingKey: varchar("setting_key", { length: 100 }).notNull(),
  settingValue: text("setting_value"),
  updatedBy: integer("updated_by").references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull()
});

// server/_core/env.ts
var ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  openaiApiKey: process.env.OPENAI_API_KEY ?? "",
  geminiApiKey: process.env.GEMINI_API_KEY ?? "",
  /** Admin email for direct password login (no OAuth required) */
  adminEmail: process.env.ADMIN_EMAIL ?? "",
  /** SHA-256 hex hash of the admin password */
  adminPasswordHash: process.env.ADMIN_PASSWORD_HASH ?? ""
};

// server/db.ts
var _db = null;
var _client = null;
function getConnectionString() {
  return process.env.POSTGRES_URL || process.env.DATABASE_URL || process.env.POSTGRES_URL_NON_POOLING;
}
async function getDb() {
  if (!_db) {
    const connectionString = getConnectionString();
    if (!connectionString) return null;
    try {
      _client = postgres(connectionString, {
        prepare: false,
        max: 5,
        idle_timeout: 20,
        connect_timeout: 15
      });
      _db = drizzle(_client);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}
async function upsertUser(user) {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }
  const db2 = await getDb();
  if (!db2) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }
  try {
    const values = {
      openId: user.openId
    };
    const updateSet = {};
    const textFields = ["name", "email", "loginMethod"];
    const assignNullable = (field) => {
      const value = user[field];
      if (value === void 0) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== void 0) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== void 0) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }
    if (!values.lastSignedIn) {
      values.lastSignedIn = /* @__PURE__ */ new Date();
    }
    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = /* @__PURE__ */ new Date();
    }
    await db2.insert(users).values(values).onConflictDoUpdate({
      target: users.openId,
      set: updateSet
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}
async function getUserByOpenId(openId) {
  const db2 = await getDb();
  if (!db2) {
    console.warn("[Database] Cannot get user: database not available");
    return void 0;
  }
  const result = await db2.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function createBooking(booking) {
  const db2 = await getDb();
  if (!db2) throw new Error("Database not available");
  const result = await db2.insert(bookings).values(booking).returning();
  return result[0];
}
async function getBookingById(id) {
  const db2 = await getDb();
  if (!db2) throw new Error("Database not available");
  const result = await db2.select().from(bookings).where(eq(bookings.id, id)).limit(1);
  return result[0] ?? null;
}
async function getBookingByConfirmationCode(code) {
  const db2 = await getDb();
  if (!db2) throw new Error("Database not available");
  const result = await db2.select().from(bookings).where(eq(bookings.confirmationCode, code)).limit(1);
  return result[0] ?? null;
}
async function getUserBookings(userId) {
  const db2 = await getDb();
  if (!db2) throw new Error("Database not available");
  return db2.select().from(bookings).where(eq(bookings.userId, userId)).orderBy(desc(bookings.createdAt));
}
async function updateBookingStatus(id, status) {
  const db2 = await getDb();
  if (!db2) throw new Error("Database not available");
  await db2.update(bookings).set({ status }).where(eq(bookings.id, id));
  return getBookingById(id);
}
async function updateBookingPaymentStatus(id, paymentStatus) {
  const db2 = await getDb();
  if (!db2) throw new Error("Database not available");
  await db2.update(bookings).set({ paymentStatus }).where(eq(bookings.id, id));
  return getBookingById(id);
}
async function getAllBookings(limit = 50, offset = 0) {
  const db2 = await getDb();
  if (!db2) throw new Error("Database not available");
  return db2.select().from(bookings).orderBy(desc(bookings.createdAt)).limit(limit).offset(offset);
}
async function createReview(review) {
  const db2 = await getDb();
  if (!db2) throw new Error("Database not available");
  const result = await db2.insert(reviews).values(review).returning();
  return result[0];
}
async function getApprovedReviews(limit = 50, offset = 0) {
  const db2 = await getDb();
  if (!db2) throw new Error("Database not available");
  return db2.select().from(reviews).where(eq(reviews.isApproved, "approved")).orderBy(desc(reviews.createdAt)).limit(limit).offset(offset);
}
async function getAllReviews(limit = 50, offset = 0) {
  const db2 = await getDb();
  if (!db2) throw new Error("Database not available");
  return db2.select().from(reviews).orderBy(desc(reviews.createdAt)).limit(limit).offset(offset);
}
async function getReviewById(id) {
  const db2 = await getDb();
  if (!db2) throw new Error("Database not available");
  const result = await db2.select().from(reviews).where(eq(reviews.id, id)).limit(1);
  return result[0] ?? null;
}
async function updateReviewApproval(id, isApproved) {
  const db2 = await getDb();
  if (!db2) throw new Error("Database not available");
  await db2.update(reviews).set({ isApproved }).where(eq(reviews.id, id));
  return getReviewById(id);
}
async function addAdminReply(id, adminReply) {
  const db2 = await getDb();
  if (!db2) throw new Error("Database not available");
  await db2.update(reviews).set({ adminReply, adminReplyAt: /* @__PURE__ */ new Date() }).where(eq(reviews.id, id));
  return getReviewById(id);
}
async function incrementHelpfulCount(id) {
  const db2 = await getDb();
  if (!db2) throw new Error("Database not available");
  await db2.update(reviews).set({ helpfulCount: sql`${reviews.helpfulCount} + 1` }).where(eq(reviews.id, id));
  return getReviewById(id);
}
async function getReviewStats() {
  const db2 = await getDb();
  if (!db2) throw new Error("Database not available");
  const allApproved = await db2.select().from(reviews).where(eq(reviews.isApproved, "approved"));
  const total = allApproved.length;
  if (total === 0) return { total: 0, average: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };
  const sum = allApproved.reduce((acc, r) => acc + r.rating, 0);
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  allApproved.forEach((r) => {
    if (r.rating >= 1 && r.rating <= 5) distribution[r.rating]++;
  });
  return { total, average: Math.round(sum / total * 10) / 10, distribution };
}
async function createOffer(offer) {
  const db2 = await getDb();
  if (!db2) throw new Error("Database not available");
  const result = await db2.insert(offers).values(offer).returning();
  return result[0];
}
async function getActiveOffers() {
  const db2 = await getDb();
  if (!db2) throw new Error("Database not available");
  const now = Date.now();
  return db2.select().from(offers).where(and(
    eq(offers.isActive, "active"),
    lte(offers.startDate, now),
    gte(offers.endDate, now)
  )).orderBy(asc(offers.endDate));
}
async function getAllOffers(limit = 50, offset = 0) {
  const db2 = await getDb();
  if (!db2) throw new Error("Database not available");
  return db2.select().from(offers).orderBy(desc(offers.createdAt)).limit(limit).offset(offset);
}
async function getOfferByPromoCode(promoCode) {
  const db2 = await getDb();
  if (!db2) throw new Error("Database not available");
  const result = await db2.select().from(offers).where(eq(offers.promoCode, promoCode)).limit(1);
  return result[0] ?? null;
}
async function updateOffer(id, data) {
  const db2 = await getDb();
  if (!db2) throw new Error("Database not available");
  await db2.update(offers).set(data).where(eq(offers.id, id));
  const rows = await db2.select().from(offers).where(eq(offers.id, id)).limit(1);
  return rows[0];
}
async function createContactMessage(message) {
  const db2 = await getDb();
  if (!db2) throw new Error("Database not available");
  const result = await db2.insert(contactMessages).values(message).returning();
  return result[0];
}
async function getAllContactMessages(limit = 50, offset = 0) {
  const db2 = await getDb();
  if (!db2) throw new Error("Database not available");
  return db2.select().from(contactMessages).orderBy(desc(contactMessages.createdAt)).limit(limit).offset(offset);
}
async function updateContactMessageStatus(id, status) {
  const db2 = await getDb();
  if (!db2) throw new Error("Database not available");
  await db2.update(contactMessages).set({ status }).where(eq(contactMessages.id, id));
}
async function createFileUpload(file) {
  const db2 = await getDb();
  if (!db2) throw new Error("Database not available");
  const result = await db2.insert(fileUploads).values(file).returning();
  return result[0];
}
async function getUserFiles(userId) {
  const db2 = await getDb();
  if (!db2) throw new Error("Database not available");
  return db2.select().from(fileUploads).where(eq(fileUploads.userId, userId)).orderBy(desc(fileUploads.createdAt));
}
async function getOrCreateAISubscription(userId) {
  const db2 = await getDb();
  if (!db2) throw new Error("Database not available");
  let subscription = await db2.select().from(aiSubscriptions).where(eq(aiSubscriptions.userId, userId)).limit(1);
  if (subscription.length === 0) {
    const result = await db2.insert(aiSubscriptions).values({
      userId,
      plan: "free",
      status: "active",
      startDate: Date.now()
    }).returning();
    subscription = result;
  }
  return subscription[0];
}
async function updateAISubscription(userId, plan, stripeSubscriptionId) {
  const db2 = await getDb();
  if (!db2) throw new Error("Database not available");
  await db2.update(aiSubscriptions).set({
    plan,
    status: "active",
    renewalDate: Date.now() + 30 * 24 * 60 * 60 * 1e3,
    ...stripeSubscriptionId && { stripeSubscriptionId }
  }).where(eq(aiSubscriptions.userId, userId));
  return getOrCreateAISubscription(userId);
}
async function getOrCreateAICredits(userId) {
  const db2 = await getDb();
  if (!db2) throw new Error("Database not available");
  let credits = await db2.select().from(aiCredits).where(eq(aiCredits.userId, userId)).limit(1);
  if (credits.length === 0) {
    const result = await db2.insert(aiCredits).values({
      userId,
      balance: "5",
      totalUsed: "0"
    }).returning();
    credits = result;
  }
  return credits[0];
}
async function addAICredits(userId, amount, reason) {
  const db2 = await getDb();
  if (!db2) throw new Error("Database not available");
  const credits = await getOrCreateAICredits(userId);
  const newBalance = parseFloat(credits.balance.toString()) + amount;
  await db2.update(aiCredits).set({ balance: newBalance.toString() }).where(eq(aiCredits.userId, userId));
  await db2.insert(aiTransactions).values({
    userId,
    type: reason === "purchase" ? "purchase" : reason === "monthly_allowance" ? "monthly_allowance" : "bonus",
    amount: amount.toString(),
    status: "completed"
  });
  return getOrCreateAICredits(userId);
}
async function deductAICredits(userId, amount) {
  const db2 = await getDb();
  if (!db2) throw new Error("Database not available");
  const credits = await getOrCreateAICredits(userId);
  const currentBalance = parseFloat(credits.balance.toString());
  if (currentBalance < amount) {
    throw new Error("Insufficient credits");
  }
  const newBalance = currentBalance - amount;
  const newTotalUsed = parseFloat(credits.totalUsed.toString()) + amount;
  await db2.update(aiCredits).set({
    balance: newBalance.toString(),
    totalUsed: newTotalUsed.toString()
  }).where(eq(aiCredits.userId, userId));
  return getOrCreateAICredits(userId);
}
async function createAIUsage(usage) {
  const db2 = await getDb();
  if (!db2) throw new Error("Database not available");
  const result = await db2.insert(aiUsage).values(usage).returning();
  return result[0];
}
async function getUserAIUsage(userId, limit = 50, offset = 0) {
  const db2 = await getDb();
  if (!db2) throw new Error("Database not available");
  return db2.select().from(aiUsage).where(eq(aiUsage.userId, userId)).orderBy(desc(aiUsage.createdAt)).limit(limit).offset(offset);
}
async function updateAIUsageStatus(id, status, resultUrl, errorMessage) {
  const db2 = await getDb();
  if (!db2) throw new Error("Database not available");
  await db2.update(aiUsage).set({
    status,
    ...resultUrl && { resultUrl },
    ...errorMessage && { errorMessage }
  }).where(eq(aiUsage.id, id));
  const rows = await db2.select().from(aiUsage).where(eq(aiUsage.id, id)).limit(1);
  return rows[0];
}
async function getAIUsageStats(userId) {
  const db2 = await getDb();
  if (!db2) throw new Error("Database not available");
  const usage = await db2.select().from(aiUsage).where(eq(aiUsage.userId, userId));
  return {
    totalGenerations: usage.length,
    byType: {
      image: usage.filter((u) => u.type === "image").length,
      video: usage.filter((u) => u.type === "video").length,
      edit: usage.filter((u) => u.type === "edit").length
    },
    totalCost: usage.reduce((sum, u) => sum + parseFloat(u.creditsCost.toString()), 0)
  };
}
async function getAllUsers(limit = 50, offset = 0) {
  const db2 = await getDb();
  if (!db2) throw new Error("Database not available");
  const result = await db2.select().from(users).orderBy(desc(users.createdAt)).limit(limit).offset(offset);
  return result;
}
async function getUsersCount() {
  const db2 = await getDb();
  if (!db2) throw new Error("Database not available");
  const result = await db2.select({ count: sql`count(*)` }).from(users);
  return result[0]?.count ?? 0;
}
async function getUserById(id) {
  const db2 = await getDb();
  if (!db2) throw new Error("Database not available");
  const result = await db2.select().from(users).where(eq(users.id, id)).limit(1);
  return result[0] ?? null;
}
async function updateUserRole(id, role) {
  const db2 = await getDb();
  if (!db2) throw new Error("Database not available");
  await db2.update(users).set({ role }).where(eq(users.id, id));
  return getUserById(id);
}
async function searchUsers(query, limit = 20) {
  const db2 = await getDb();
  if (!db2) throw new Error("Database not available");
  const result = await db2.select().from(users).where(
    sql`${users.name} ILIKE ${`%${query}%`} OR ${users.email} ILIKE ${`%${query}%`} OR ${users.openId} ILIKE ${`%${query}%`}`
  ).orderBy(desc(users.createdAt)).limit(limit);
  return result;
}
async function getUserStats() {
  const db2 = await getDb();
  if (!db2) throw new Error("Database not available");
  const totalUsers = await db2.select({ count: sql`count(*)` }).from(users);
  const adminUsers = await db2.select({ count: sql`count(*)` }).from(users).where(eq(users.role, "admin"));
  const recentUsers = await db2.select({ count: sql`count(*)` }).from(users).where(gte(users.createdAt, sql`NOW() - INTERVAL '30 days'`));
  const todayUsers = await db2.select({ count: sql`count(*)` }).from(users).where(gte(users.createdAt, sql`CURRENT_DATE`));
  return {
    total: totalUsers[0]?.count ?? 0,
    admins: adminUsers[0]?.count ?? 0,
    recentSignups: recentUsers[0]?.count ?? 0,
    todaySignups: todayUsers[0]?.count ?? 0
  };
}
async function updateUserProfile(id, data) {
  const db2 = await getDb();
  if (!db2) throw new Error("Database not available");
  const updateSet = {};
  if (data.name !== void 0) updateSet.name = data.name;
  if (data.phone !== void 0) updateSet.phone = data.phone;
  if (data.avatarUrl !== void 0) updateSet.avatarUrl = data.avatarUrl;
  if (Object.keys(updateSet).length === 0) {
    return getUserById(id);
  }
  await db2.update(users).set(updateSet).where(eq(users.id, id));
  return getUserById(id);
}
async function getPublishedBlogPosts(limit = 10, offset = 0) {
  const db2 = await getDb();
  if (!db2) throw new Error("Database not available");
  return db2.select().from(blogPosts).where(eq(blogPosts.status, "published")).orderBy(desc(blogPosts.publishedAt)).limit(limit).offset(offset);
}
async function getBlogPostBySlug(slug) {
  const db2 = await getDb();
  if (!db2) throw new Error("Database not available");
  const result = await db2.select().from(blogPosts).where(eq(blogPosts.slug, slug)).limit(1);
  return result[0] ?? null;
}
async function getBlogPostsByCategory(category, limit = 10, offset = 0) {
  const db2 = await getDb();
  if (!db2) throw new Error("Database not available");
  return db2.select().from(blogPosts).where(and(eq(blogPosts.status, "published"), eq(blogPosts.category, category))).orderBy(desc(blogPosts.publishedAt)).limit(limit).offset(offset);
}
async function createBlogPost(post) {
  const db2 = await getDb();
  if (!db2) throw new Error("Database not available");
  const result = await db2.insert(blogPosts).values(post).returning();
  return result[0];
}
async function updateBlogPost(id, data) {
  const db2 = await getDb();
  if (!db2) throw new Error("Database not available");
  await db2.update(blogPosts).set(data).where(eq(blogPosts.id, id));
  const rows = await db2.select().from(blogPosts).where(eq(blogPosts.id, id)).limit(1);
  return rows[0] ?? null;
}
async function getAllBlogPosts(limit = 50, offset = 0) {
  const db2 = await getDb();
  if (!db2) throw new Error("Database not available");
  return db2.select().from(blogPosts).orderBy(desc(blogPosts.createdAt)).limit(limit).offset(offset);
}
async function incrementBlogViewCount(id) {
  const db2 = await getDb();
  if (!db2) return;
  await db2.update(blogPosts).set({ viewCount: sql`${blogPosts.viewCount} + 1` }).where(eq(blogPosts.id, id));
}

// server/_core/cookies.ts
function isSecureRequest(req) {
  if (req.protocol === "https") return true;
  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;
  const protoList = Array.isArray(forwardedProto) ? forwardedProto : forwardedProto.split(",");
  return protoList.some((proto) => proto.trim().toLowerCase() === "https");
}
function getSessionCookieOptions(req) {
  const secure = isSecureRequest(req);
  return {
    httpOnly: true,
    path: "/",
    // SameSite=None requires Secure=true; fall back to Lax on plain HTTP (local dev)
    sameSite: secure ? "none" : "lax",
    secure
  };
}

// shared/_core/errors.ts
var HttpError = class extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = "HttpError";
  }
};
var ForbiddenError = (msg) => new HttpError(403, msg);

// server/_core/sdk.ts
import axios from "axios";
import { parse as parseCookieHeader } from "cookie";
import { SignJWT, jwtVerify } from "jose";

// server/_core/firebaseAdmin.ts
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
var __filename = fileURLToPath(import.meta.url);
var __dirname2 = path.dirname(__filename);
var isCloudRun = Boolean(
  process.env.K_SERVICE || process.env.GOOGLE_CLOUD_PROJECT || process.env.FIREBASE_CONFIG
);
var storageBucketName = process.env.FIREBASE_STORAGE_BUCKET || process.env.VITE_FIREBASE_STORAGE_BUCKET || `${process.env.VITE_FIREBASE_PROJECT_ID ?? "gen-lang-client-0364375301"}.firebasestorage.app`;
if (!getApps().length) {
  if (isCloudRun) {
    initializeApp({ storageBucket: storageBucketName });
    console.log("[Firebase] Initialized with ADC (Cloud Run / Firebase App Hosting)");
  } else {
    let credentialApp;
    const envJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (envJson) {
      try {
        const rawJson = envJson.trim().startsWith("{") ? envJson : Buffer.from(envJson, "base64").toString("utf8");
        credentialApp = cert(JSON.parse(rawJson));
      } catch (e) {
        console.error("[Firebase] Failed to parse credentials from env:", e);
      }
    }
    if (!credentialApp) {
      const primaryKeyPath = path.resolve(__dirname2, "../../firebase-key.json");
      const fallbackKeyPath = path.resolve(__dirname2, "firebase-key.json");
      const serviceAccountPath = fs.existsSync(primaryKeyPath) ? primaryKeyPath : fallbackKeyPath;
      if (fs.existsSync(serviceAccountPath)) {
        try {
          credentialApp = cert(JSON.parse(fs.readFileSync(serviceAccountPath, "utf-8")));
        } catch (e) {
          console.error("[Firebase] Failed to read local service account:", e);
        }
      }
    }
    if (!credentialApp) {
      throw new Error(
        "CRITICAL: Firebase credentials not found. Set FIREBASE_SERVICE_ACCOUNT_JSON or place firebase-key.json in the project root."
      );
    }
    initializeApp({ credential: credentialApp, storageBucket: storageBucketName });
    console.log("[Firebase] Initialized with explicit credentials (development)");
  }
}
var db = getFirestore();

// server/_core/sdk.ts
var isNonEmptyString = (value) => typeof value === "string" && value.length > 0;
var EXCHANGE_TOKEN_PATH = `/webdev.v1.WebDevAuthPublicService/ExchangeToken`;
var GET_USER_INFO_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfo`;
var GET_USER_INFO_WITH_JWT_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfoWithJwt`;
var OAuthService = class {
  constructor(client) {
    this.client = client;
    console.log("[OAuth] Initialized with baseURL:", ENV.oAuthServerUrl);
    if (!ENV.oAuthServerUrl) {
      console.error(
        "[OAuth] ERROR: OAUTH_SERVER_URL is not configured! Set OAUTH_SERVER_URL environment variable."
      );
    }
  }
  decodeState(state) {
    const redirectUri = atob(state);
    return redirectUri;
  }
  async getTokenByCode(code, state) {
    const payload = {
      clientId: ENV.appId,
      grantType: "authorization_code",
      code,
      redirectUri: this.decodeState(state)
    };
    const { data } = await this.client.post(
      EXCHANGE_TOKEN_PATH,
      payload
    );
    return data;
  }
  async getUserInfoByToken(token) {
    const { data } = await this.client.post(
      GET_USER_INFO_PATH,
      {
        accessToken: token.accessToken
      }
    );
    return data;
  }
};
var createOAuthHttpClient = () => axios.create({
  baseURL: ENV.oAuthServerUrl,
  // 5 s keeps us well inside Vercel's 10 s default timeout.
  // The old 30 s value caused Vercel to kill the function with a plain-text
  // "A server error occurred" before any try/catch could intercept.
  timeout: 5e3
});
var SDKServer = class {
  client;
  oauthService;
  constructor(client = createOAuthHttpClient()) {
    this.client = client;
    this.oauthService = new OAuthService(this.client);
  }
  deriveLoginMethod(platforms, fallback) {
    if (fallback && fallback.length > 0) return fallback;
    if (!Array.isArray(platforms) || platforms.length === 0) return null;
    const set = new Set(
      platforms.filter((p) => typeof p === "string")
    );
    if (set.has("REGISTERED_PLATFORM_EMAIL")) return "email";
    if (set.has("REGISTERED_PLATFORM_GOOGLE")) return "google";
    if (set.has("REGISTERED_PLATFORM_APPLE")) return "apple";
    if (set.has("REGISTERED_PLATFORM_MICROSOFT") || set.has("REGISTERED_PLATFORM_AZURE"))
      return "microsoft";
    if (set.has("REGISTERED_PLATFORM_GITHUB")) return "github";
    const first = Array.from(set)[0];
    return first ? first.toLowerCase() : null;
  }
  /**
   * Exchange OAuth authorization code for access token
   * @example
   * const tokenResponse = await sdk.exchangeCodeForToken(code, state);
   */
  async exchangeCodeForToken(code, state) {
    return this.oauthService.getTokenByCode(code, state);
  }
  /**
   * Get user information using access token
   * @example
   * const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
   */
  async getUserInfo(accessToken) {
    const data = await this.oauthService.getUserInfoByToken({
      accessToken
    });
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  parseCookies(cookieHeader) {
    if (!cookieHeader) {
      return /* @__PURE__ */ new Map();
    }
    const parsed = parseCookieHeader(cookieHeader);
    return new Map(Object.entries(parsed));
  }
  getSessionSecret() {
    const secret = ENV.cookieSecret;
    if (secret) {
      return new TextEncoder().encode(secret);
    }
    const fallback = (process.env.VITE_FIREBASE_APP_ID ?? "") + "|" + (process.env.VITE_FIREBASE_PROJECT_ID ?? "");
    if (!fallback || fallback === "|") {
      throw new Error(
        "JWT_SECRET is not configured and no Firebase fallback is available. Add JWT_SECRET to apphosting.yaml secrets."
      );
    }
    console.warn(
      "[Auth] JWT_SECRET is not set \u2014 using derived fallback secret. Create a JWT_SECRET secret in Firebase App Hosting for production."
    );
    return new TextEncoder().encode(fallback);
  }
  /**
   * Create a session token for a Manus user openId
   * @example
   * const sessionToken = await sdk.createSessionToken(userInfo.openId);
   */
  async createSessionToken(openId, options = {}) {
    return this.signSession(
      {
        openId,
        appId: ENV.appId,
        name: options.name || ""
      },
      options
    );
  }
  async signSession(payload, options = {}) {
    const issuedAt = Date.now();
    const expiresInMs = options.expiresInMs ?? ONE_YEAR_MS;
    const expirationSeconds = Math.floor((issuedAt + expiresInMs) / 1e3);
    const secretKey = this.getSessionSecret();
    return new SignJWT({
      openId: payload.openId,
      appId: payload.appId,
      name: payload.name
    }).setProtectedHeader({ alg: "HS256", typ: "JWT" }).setExpirationTime(expirationSeconds).sign(secretKey);
  }
  async verifySession(cookieValue) {
    if (!cookieValue) {
      console.warn("[Auth] Missing session cookie");
      return null;
    }
    try {
      const secretKey = this.getSessionSecret();
      const { payload } = await jwtVerify(cookieValue, secretKey, {
        algorithms: ["HS256"]
      });
      const { openId, appId, name } = payload;
      if (!isNonEmptyString(openId) || !isNonEmptyString(appId) || !isNonEmptyString(name)) {
        console.warn("[Auth] Session payload missing required fields");
        return null;
      }
      return {
        openId,
        appId,
        name
      };
    } catch (error) {
      console.warn("[Auth] Session verification failed", String(error));
      return null;
    }
  }
  async getUserInfoWithJwt(jwtToken) {
    const payload = {
      jwtToken,
      projectId: ENV.appId
    };
    const { data } = await this.client.post(
      GET_USER_INFO_WITH_JWT_PATH,
      payload
    );
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  async authenticateRequest(req) {
    const cookies = this.parseCookies(req.headers.cookie);
    const sessionCookie = cookies.get(COOKIE_NAME);
    const session = await this.verifySession(sessionCookie);
    if (!session) {
      throw ForbiddenError("Invalid session cookie");
    }
    const sessionUserId = session.openId;
    const now = /* @__PURE__ */ new Date();
    if (sessionUserId.startsWith("admin:")) {
      const email = sessionUserId.slice("admin:".length) || null;
      return {
        id: 0,
        openId: sessionUserId,
        name: session.name || "Admin",
        email,
        phone: null,
        loginMethod: "password",
        avatarUrl: null,
        role: "admin",
        createdAt: now,
        updatedAt: now,
        lastSignedIn: now
      };
    }
    if (sessionUserId.startsWith("firebase:")) {
      const uid = sessionUserId.slice("firebase:".length);
      const userDoc = await db.collection("users").doc(uid).get();
      if (!userDoc.exists) {
        throw ForbiddenError("Firebase user not found");
      }
      const userData = userDoc.data();
      if (userData.role !== "admin") {
        throw ForbiddenError("Admin access denied");
      }
      await db.collection("users").doc(uid).set({ lastSignedIn: now }, { merge: true });
      return {
        id: 0,
        openId: sessionUserId,
        name: session.name || userData.name || "Admin",
        email: userData.email ?? null,
        phone: null,
        loginMethod: "firebase",
        avatarUrl: null,
        role: "admin",
        createdAt: now,
        updatedAt: now,
        lastSignedIn: now
      };
    }
    let user = await getUserByOpenId(sessionUserId);
    if (!user) {
      if (sessionUserId.startsWith("admin:")) {
        try {
          await upsertUser({
            openId: sessionUserId,
            name: session.name || "Admin",
            role: "admin",
            loginMethod: "password",
            lastSignedIn: now
          });
          user = await getUserByOpenId(sessionUserId);
        } catch {
        }
        if (!user) {
          return {
            id: -1,
            openId: sessionUserId,
            name: session.name || "Admin",
            email: null,
            phone: null,
            loginMethod: "password",
            avatarUrl: null,
            role: "admin",
            createdAt: now,
            updatedAt: now,
            lastSignedIn: now
          };
        }
      } else {
        try {
          const userInfo = await this.getUserInfoWithJwt(sessionCookie ?? "");
          await upsertUser({
            openId: userInfo.openId,
            name: userInfo.name || null,
            email: userInfo.email ?? null,
            loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
            lastSignedIn: now
          });
          user = await getUserByOpenId(userInfo.openId);
        } catch (error) {
          console.error("[Auth] Failed to sync user from OAuth:", error);
          throw ForbiddenError("Failed to sync user info");
        }
      }
    }
    if (!user) {
      throw ForbiddenError("User not found");
    }
    await upsertUser({
      openId: user.openId,
      lastSignedIn: now
    });
    return user;
  }
};
var sdk = new SDKServer();

// server/_core/oauth.ts
function getQueryParam(req, key) {
  const value = req.query[key];
  return typeof value === "string" ? value : void 0;
}
function registerOAuthRoutes(app) {
  app.get("/api/oauth/callback", async (req, res) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");
    const next = getQueryParam(req, "next");
    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }
    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }
      await upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: /* @__PURE__ */ new Date()
      });
      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS
      });
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      const safeNext = next && next.startsWith("/") && !next.startsWith("//") ? next : "/";
      res.redirect(302, safeNext);
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}

// server/_core/supabase.ts
import { createClient as createServerClient } from "@supabase/supabase-js";
function loadServerConfig() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!url || !serviceKey) return null;
  return { url, serviceKey };
}
var serverClient = null;
function getServerSupabase() {
  if (serverClient) return serverClient;
  const cfg = loadServerConfig();
  if (!cfg) return null;
  serverClient = createServerClient(cfg.url, cfg.serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
  return serverClient;
}

// server/_core/storageProxy.ts
function registerStorageProxy(app) {
  app.get("/manus-storage/*", async (req, res) => {
    const key = req.params[0];
    if (!key) return void res.status(400).send("Missing storage key");
    const supabase = getServerSupabase();
    const bucket = process.env.SUPABASE_STORAGE_BUCKET;
    if (!supabase || !bucket) {
      return void res.status(404).send("Storage not configured");
    }
    try {
      const ttl = Number(process.env.SUPABASE_STORAGE_SIGNED_URL_TTL || 60);
      const { data, error } = await supabase.storage.from(bucket).createSignedUrl(key, ttl);
      if (!error && data?.signedUrl) {
        res.set("Cache-Control", "no-store");
        return void res.redirect(307, data.signedUrl);
      }
      const { data: pub } = supabase.storage.from(bucket).getPublicUrl(key);
      if (pub.publicUrl) {
        res.set("Cache-Control", "no-store");
        return void res.redirect(307, pub.publicUrl);
      }
      return void res.status(404).send("Image not found");
    } catch (err) {
      console.error("[StorageProxy] supabase error:", err);
      return void res.status(502).send("Storage proxy error");
    }
  });
}

// server/downloadProxy.ts
import sharp from "sharp";
var ALLOWED_FORMATS = ["png", "jpg", "jpeg", "webp"];
var FORMAT_MIME = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp"
};
function registerDownloadProxy(app) {
  app.get("/api/download-image", async (req, res) => {
    try {
      const imageUrl = req.query.url;
      const requestedFormat = req.query.format?.toLowerCase();
      if (!imageUrl) {
        res.status(400).json({ error: "Missing 'url' query parameter" });
        return;
      }
      if (requestedFormat && !ALLOWED_FORMATS.includes(requestedFormat)) {
        res.status(400).json({
          error: `Invalid format '${requestedFormat}'. Allowed: ${ALLOWED_FORMATS.join(", ")}`
        });
        return;
      }
      const allowedDomains = [
        "s3.amazonaws.com",
        "s3.us-east-1.amazonaws.com",
        ".s3.amazonaws.com",
        "cloudfront.net",
        "manus-storage"
      ];
      let isAllowed = false;
      try {
        const parsedUrl = new URL(imageUrl);
        isAllowed = allowedDomains.some(
          (domain) => parsedUrl.hostname.endsWith(domain) || parsedUrl.hostname.includes(domain)
        );
      } catch {
        res.status(400).json({ error: "Invalid URL format" });
        return;
      }
      if (!isAllowed) {
        const s3Patterns = ["vanir", "ai-generated", "manus"];
        isAllowed = s3Patterns.some(
          (pattern) => imageUrl.toLowerCase().includes(pattern)
        );
      }
      if (!isAllowed) {
        res.status(403).json({ error: "URL domain not allowed for download" });
        return;
      }
      const response = await fetch(imageUrl);
      if (!response.ok) {
        res.status(response.status).json({
          error: `Failed to fetch image: ${response.statusText}`
        });
        return;
      }
      const arrayBuffer = await response.arrayBuffer();
      let outputBuffer = Buffer.from(arrayBuffer);
      let outputMime = response.headers.get("content-type") || "image/png";
      let outputExt = "png";
      if (requestedFormat) {
        const normalizedFormat = requestedFormat === "jpg" ? "jpeg" : requestedFormat;
        const sharpInstance = sharp(outputBuffer);
        if (normalizedFormat === "jpeg") {
          outputBuffer = await sharpInstance.jpeg({ quality: 92 }).toBuffer();
        } else if (normalizedFormat === "webp") {
          outputBuffer = await sharpInstance.webp({ quality: 90 }).toBuffer();
        } else {
          outputBuffer = await sharpInstance.png().toBuffer();
        }
        outputMime = FORMAT_MIME[requestedFormat] || "image/png";
        outputExt = requestedFormat === "jpeg" ? "jpg" : requestedFormat;
      }
      const baseFilename = req.query.filename || `vanir-ai-${Date.now()}`;
      const cleanBase = baseFilename.replace(/\.(png|jpg|jpeg|webp)$/i, "");
      const filename = `${cleanBase}.${outputExt}`;
      res.setHeader("Content-Type", outputMime);
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}"`
      );
      res.setHeader("Content-Length", outputBuffer.length);
      res.setHeader("Cache-Control", "no-cache");
      res.send(outputBuffer);
    } catch (error) {
      console.error("[Download Proxy] Error:", error);
      res.status(500).json({ error: "Internal server error during download" });
    }
  });
}

// server/authExpressRouter.ts
import { getAuth } from "firebase-admin/auth";
async function resolveAdminUser(uid, email, displayName) {
  const bootstrapEmails = (process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
  const isBootstrapAdmin = Boolean(email && bootstrapEmails.includes(email.toLowerCase()));
  console.log("[v0] resolveAdminUser:", {
    uid,
    email,
    displayName,
    bootstrapEmails: bootstrapEmails.slice(0, 1).map((e) => e.substring(0, 3) + "***"),
    isBootstrapAdmin
  });
  const baseData = {
    uid,
    email: email ?? null,
    name: displayName || email?.split("@")[0] || null,
    loginMethod: "firebase",
    lastSignedIn: /* @__PURE__ */ new Date()
  };
  if (isBootstrapAdmin) {
    baseData.role = "admin";
    console.log("[v0] Bootstrap admin detected, setting role to admin");
  }
  await db.collection("users").doc(uid).set(baseData, { merge: true });
  const userDoc = await db.collection("users").doc(uid).get();
  const userData = userDoc.data();
  console.log("[v0] Admin user resolved:", { uid, role: userData?.role, email });
  if (!userData || userData.role !== "admin") {
    console.error("[v0] Access denied - user not admin. Role:", userData?.role);
    throw new Error("Admin access denied");
  }
  return {
    uid,
    email: email ?? userData.email ?? null,
    name: displayName || userData.name || null,
    role: userData.role
  };
}
async function issueSessionForAdmin(req, res, uid, email, displayName) {
  const user = await resolveAdminUser(uid, email, displayName);
  const openId = `firebase:${uid}`;
  const sessionToken = await sdk.createSessionToken(openId, {
    name: user.name || "Admin",
    expiresInMs: ONE_YEAR_MS
  });
  const cookieOptions = getSessionCookieOptions(req);
  res.cookie(COOKIE_NAME, sessionToken, {
    ...cookieOptions,
    maxAge: ONE_YEAR_MS
  });
  return { success: true, email: user.email, name: user.name };
}
async function issueSessionForUser(req, res, uid, email, displayName) {
  const openId = `firebase:${uid}`;
  const sessionToken = await sdk.createSessionToken(openId, {
    name: displayName || email?.split("@")[0] || "User",
    expiresInMs: ONE_YEAR_MS
  });
  const cookieOptions = getSessionCookieOptions(req);
  res.cookie(COOKIE_NAME, sessionToken, {
    ...cookieOptions,
    maxAge: ONE_YEAR_MS
  });
  await db.collection("users").doc(uid).set(
    {
      uid,
      email: email ?? null,
      name: displayName || email?.split("@")[0] || null,
      loginMethod: "firebase",
      lastSignedIn: /* @__PURE__ */ new Date()
    },
    { merge: true }
  );
  return { success: true, email: email || null, name: displayName || null };
}
function registerFirebaseAuthRoutes(app) {
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { idToken } = req.body;
      if (!idToken) {
        console.log("[v0] /api/auth/login: Missing idToken");
        return res.status(400).json({ error: "idToken is required" });
      }
      console.log("[v0] /api/auth/login: Verifying admin ID token");
      const decoded = await getAuth().verifyIdToken(idToken, true);
      console.log("[v0] /api/auth/login: Token verified for email:", decoded.email);
      const result = await issueSessionForAdmin(req, res, decoded.uid, decoded.email, decoded.name);
      console.log("[v0] /api/auth/login: Admin session issued successfully");
      return res.json(result);
    } catch (err) {
      if (err?.code === "auth/id-token-revoked") {
        console.error("[v0] /api/auth/login: Token revoked");
        return res.status(401).json({ error: "Session revoked. Please sign in again." });
      }
      const msg = err?.message || "Authentication failed";
      console.error("[v0] /api/auth/login: Error:", msg);
      const status = msg === "Admin access denied" ? 403 : 401;
      return res.status(status).json({ error: msg });
    }
  });
  app.post("/api/auth/user-login", async (req, res) => {
    try {
      const { idToken } = req.body;
      if (!idToken) {
        return res.status(400).json({ error: "idToken is required" });
      }
      const decoded = await getAuth().verifyIdToken(idToken);
      const result = await issueSessionForUser(req, res, decoded.uid, decoded.email, decoded.name);
      return res.json(result);
    } catch (err) {
      const msg = err?.message || "Authentication failed";
      return res.status(401).json({ error: msg });
    }
  });
  app.post("/api/auth/admin-google", async (req, res) => {
    try {
      const { idToken } = req.body;
      if (!idToken) {
        return res.status(400).json({ error: "idToken is required" });
      }
      const decoded = await getAuth().verifyIdToken(idToken, true);
      const result = await issueSessionForAdmin(req, res, decoded.uid, decoded.email, decoded.name);
      return res.json(result);
    } catch (err) {
      if (err?.code === "auth/id-token-revoked") {
        return res.status(401).json({ error: "Session revoked. Please sign in again." });
      }
      const msg = err?.message || "Google authentication failed";
      const status = msg === "Admin access denied" ? 403 : 401;
      return res.status(status).json({ error: msg });
    }
  });
}

// server/_core/systemRouter.ts
import { z } from "zod";

// server/_core/notification.ts
import { TRPCError } from "@trpc/server";
var TITLE_MAX_LENGTH = 1200;
var CONTENT_MAX_LENGTH = 2e4;
var trimValue = (value) => value.trim();
var isNonEmptyString2 = (value) => typeof value === "string" && value.trim().length > 0;
var buildEndpointUrl = (baseUrl) => {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return new URL(
    "webdevtoken.v1.WebDevService/SendNotification",
    normalizedBase
  ).toString();
};
var validatePayload = (input) => {
  if (!isNonEmptyString2(input.title)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification title is required."
    });
  }
  if (!isNonEmptyString2(input.content)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification content is required."
    });
  }
  const title = trimValue(input.title);
  const content = trimValue(input.content);
  if (title.length > TITLE_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification title must be at most ${TITLE_MAX_LENGTH} characters.`
    });
  }
  if (content.length > CONTENT_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification content must be at most ${CONTENT_MAX_LENGTH} characters.`
    });
  }
  return { title, content };
};
async function notifyOwner(payload) {
  const { title, content } = validatePayload(payload);
  if (!ENV.forgeApiUrl) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service URL is not configured."
    });
  }
  if (!ENV.forgeApiKey) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service API key is not configured."
    });
  }
  const endpoint = buildEndpointUrl(ENV.forgeApiUrl);
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${ENV.forgeApiKey}`,
        "content-type": "application/json",
        "connect-protocol-version": "1"
      },
      body: JSON.stringify({ title, content })
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.warn(
        `[Notification] Failed to notify owner (${response.status} ${response.statusText})${detail ? `: ${detail}` : ""}`
      );
      return false;
    }
    return true;
  } catch (error) {
    console.warn("[Notification] Error calling notification service:", error);
    return false;
  }
}

// server/_core/trpc.ts
import { initTRPC, TRPCError as TRPCError2 } from "@trpc/server";
import superjson from "superjson";
var t = initTRPC.context().create({
  transformer: superjson
});
var router = t.router;
var publicProcedure = t.procedure;
var requireUser = t.middleware(async (opts) => {
  const { ctx, next } = opts;
  if (!ctx.user) {
    throw new TRPCError2({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user
    }
  });
});
var protectedProcedure = t.procedure.use(requireUser);
var adminProcedure = t.procedure.use(
  t.middleware(async (opts) => {
    const { ctx, next } = opts;
    if (!ctx.user || ctx.user.role !== "admin") {
      throw new TRPCError2({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }
    return next({
      ctx: {
        ...ctx,
        user: ctx.user
      }
    });
  })
);

// server/_core/systemRouter.ts
var systemRouter = router({
  health: publicProcedure.input(
    z.object({
      timestamp: z.number().min(0).optional()
    }).optional()
  ).query(() => ({
    status: "ok",
    healthy: true
  })),
  notifyOwner: adminProcedure.input(
    z.object({
      title: z.string().min(1, "title is required"),
      content: z.string().min(1, "content is required")
    })
  ).mutation(async ({ input }) => {
    const delivered = await notifyOwner(input);
    return {
      success: delivered
    };
  })
});

// server/routers/bookings.ts
import { z as z2 } from "zod";
import { nanoid } from "nanoid";
var bookingsRouter = router({
  /** Create a new booking (public - guests can book too) */
  create: publicProcedure.input(
    z2.object({
      packageName: z2.string().min(1),
      packageCategory: z2.string().optional(),
      destination: z2.string().optional(),
      checkInDate: z2.number().optional(),
      checkOutDate: z2.number().optional(),
      adults: z2.number().min(1).default(1),
      children: z2.number().min(0).default(0),
      roomType: z2.string().optional(),
      totalPrice: z2.string().optional(),
      currency: z2.string().default("USD"),
      paymentMethod: z2.enum(["credit_card", "paypal", "bank_transfer"]).optional(),
      promoCode: z2.string().optional(),
      discountAmount: z2.string().optional(),
      specialRequests: z2.string().optional(),
      billingAddress: z2.any().optional(),
      guestName: z2.string().optional(),
      guestEmail: z2.string().email().optional(),
      guestPhone: z2.string().optional()
    })
  ).mutation(async ({ ctx, input }) => {
    const confirmationCode = `VNR-${nanoid(8).toUpperCase()}`;
    const booking = await createBooking({
      ...input,
      userId: ctx.user?.id ?? null,
      confirmationCode,
      status: "pending",
      paymentStatus: "pending"
    });
    await notifyOwner({
      title: "\u062D\u062C\u0632 \u062C\u062F\u064A\u062F - New Booking",
      content: `\u062D\u062C\u0632 \u062C\u062F\u064A\u062F: ${input.packageName}
\u0627\u0644\u0639\u0645\u064A\u0644: ${input.guestName || ctx.user?.name || "\u0645\u062C\u0647\u0648\u0644"}
\u0631\u0645\u0632 \u0627\u0644\u062A\u0623\u0643\u064A\u062F: ${confirmationCode}`
    });
    return booking;
  }),
  /** Get booking by ID */
  getById: publicProcedure.input(z2.object({ id: z2.number() })).query(async ({ input }) => {
    return getBookingById(input.id);
  }),
  /** Get booking by confirmation code */
  getByCode: publicProcedure.input(z2.object({ code: z2.string() })).query(async ({ input }) => {
    return getBookingByConfirmationCode(input.code);
  }),
  /** Get current user's bookings */
  myBookings: protectedProcedure.query(async ({ ctx }) => {
    return getUserBookings(ctx.user.id);
  }),
  /** Update booking status (admin only) */
  updateStatus: adminProcedure.input(
    z2.object({
      id: z2.number(),
      status: z2.enum(["pending", "confirmed", "cancelled", "completed"])
    })
  ).mutation(async ({ input }) => {
    return updateBookingStatus(input.id, input.status);
  }),
  /** Update payment status (admin only) */
  updatePaymentStatus: adminProcedure.input(
    z2.object({
      id: z2.number(),
      paymentStatus: z2.enum(["pending", "paid", "failed", "refunded"])
    })
  ).mutation(async ({ input }) => {
    return updateBookingPaymentStatus(input.id, input.paymentStatus);
  }),
  /** List all bookings (admin only) */
  listAll: adminProcedure.input(
    z2.object({
      limit: z2.number().min(1).max(100).default(50),
      offset: z2.number().min(0).default(0)
    }).optional()
  ).query(async ({ input }) => {
    const { limit = 50, offset = 0 } = input ?? {};
    return getAllBookings(limit, offset);
  })
});

// server/routers/reviews.ts
import { z as z3 } from "zod";
import { eq as eq2, desc as desc2 } from "drizzle-orm";
var reviewsRouter = router({
  /** List approved reviews (public) */
  list: publicProcedure.input(
    z3.object({
      limit: z3.number().min(1).max(100).default(50),
      offset: z3.number().min(0).default(0)
    }).optional()
  ).query(async ({ input }) => {
    const { limit = 50, offset = 0 } = input ?? {};
    return getApprovedReviews(limit, offset);
  }),
  /** Get review stats (public) */
  stats: publicProcedure.query(async () => {
    return getReviewStats();
  }),
  /** Get single review by ID (public) */
  getById: publicProcedure.input(z3.object({ id: z3.number() })).query(async ({ input }) => {
    return getReviewById(input.id);
  }),
  /** Create a new review (public - guests can review too) */
  create: publicProcedure.input(
    z3.object({
      tripName: z3.string().min(1),
      destination: z3.string().optional(),
      rating: z3.number().min(1).max(5),
      title: z3.string().optional(),
      content: z3.string().min(10),
      photoUrls: z3.array(z3.string()).optional(),
      travelDate: z3.number().optional(),
      guestName: z3.string().optional(),
      guestAvatarUrl: z3.string().optional()
    })
  ).mutation(async ({ ctx, input }) => {
    return createReview({
      ...input,
      userId: ctx.user?.id ?? null,
      isApproved: "pending",
      helpfulCount: 0
    });
  }),
  /** Get current user's reviews */
  myReviews: protectedProcedure.query(async ({ ctx }) => {
    const db2 = await getDb();
    if (!db2) return [];
    return db2.select().from(reviews).where(eq2(reviews.userId, ctx.user.id)).orderBy(desc2(reviews.createdAt));
  }),
  /** Mark review as helpful (public) */
  markHelpful: publicProcedure.input(z3.object({ id: z3.number() })).mutation(async ({ input }) => {
    return incrementHelpfulCount(input.id);
  }),
  /** List all reviews including pending (admin only) */
  listAll: adminProcedure.input(
    z3.object({
      limit: z3.number().min(1).max(100).default(50),
      offset: z3.number().min(0).default(0)
    }).optional()
  ).query(async ({ input }) => {
    const { limit = 50, offset = 0 } = input ?? {};
    return getAllReviews(limit, offset);
  }),
  /** Approve or reject a review (admin only) */
  moderate: adminProcedure.input(
    z3.object({
      id: z3.number(),
      isApproved: z3.enum(["pending", "approved", "rejected"])
    })
  ).mutation(async ({ input }) => {
    return updateReviewApproval(input.id, input.isApproved);
  }),
  /** Add admin reply to a review (admin only) */
  reply: adminProcedure.input(
    z3.object({
      id: z3.number(),
      adminReply: z3.string().min(1)
    })
  ).mutation(async ({ input }) => {
    return addAdminReply(input.id, input.adminReply);
  })
});

// server/routers/offers.ts
import { z as z4 } from "zod";
var offersRouter = router({
  /** List active offers (public) */
  listActive: publicProcedure.query(async () => {
    return getActiveOffers();
  }),
  /** Validate a promo code (public) */
  validatePromo: publicProcedure.input(z4.object({ promoCode: z4.string().min(1) })).query(async ({ input }) => {
    const offer = await getOfferByPromoCode(input.promoCode);
    if (!offer) return { valid: false, message: "\u0631\u0645\u0632 \u0627\u0644\u062E\u0635\u0645 \u063A\u064A\u0631 \u0635\u0627\u0644\u062D" };
    const now = Date.now();
    if (offer.isActive !== "active") return { valid: false, message: "\u0647\u0630\u0627 \u0627\u0644\u0639\u0631\u0636 \u063A\u064A\u0631 \u0646\u0634\u0637" };
    if (now < offer.startDate) return { valid: false, message: "\u0647\u0630\u0627 \u0627\u0644\u0639\u0631\u0636 \u0644\u0645 \u064A\u0628\u062F\u0623 \u0628\u0639\u062F" };
    if (now > offer.endDate) return { valid: false, message: "\u0627\u0646\u062A\u0647\u062A \u0635\u0644\u0627\u062D\u064A\u0629 \u0647\u0630\u0627 \u0627\u0644\u0639\u0631\u0636" };
    if (offer.totalSpots && offer.bookedSpots && offer.bookedSpots >= offer.totalSpots) {
      return { valid: false, message: "\u0646\u0641\u062F\u062A \u062C\u0645\u064A\u0639 \u0627\u0644\u0623\u0645\u0627\u0643\u0646 \u0627\u0644\u0645\u062A\u0627\u062D\u0629" };
    }
    return {
      valid: true,
      discountType: offer.discountType,
      discountValue: offer.discountValue,
      title: offer.title,
      message: "\u062A\u0645 \u062A\u0637\u0628\u064A\u0642 \u0631\u0645\u0632 \u0627\u0644\u062E\u0635\u0645 \u0628\u0646\u062C\u0627\u062D"
    };
  }),
  /** List all offers (admin only) */
  listAll: adminProcedure.input(
    z4.object({
      limit: z4.number().min(1).max(100).default(50),
      offset: z4.number().min(0).default(0)
    }).optional()
  ).query(async ({ input }) => {
    const { limit = 50, offset = 0 } = input ?? {};
    return getAllOffers(limit, offset);
  }),
  /** Create a new offer (admin only) */
  create: adminProcedure.input(
    z4.object({
      title: z4.string().min(1),
      description: z4.string().optional(),
      discountType: z4.enum(["percentage", "fixed"]),
      discountValue: z4.string(),
      promoCode: z4.string().optional(),
      startDate: z4.number(),
      endDate: z4.number(),
      category: z4.string().optional(),
      destination: z4.string().optional(),
      imageUrl: z4.string().optional(),
      totalSpots: z4.number().optional(),
      badgeText: z4.string().optional(),
      badgeColor: z4.string().optional()
    })
  ).mutation(async ({ input }) => {
    return createOffer({
      ...input,
      isActive: "active",
      bookedSpots: 0
    });
  }),
  /** Update an offer (admin only) */
  update: adminProcedure.input(
    z4.object({
      id: z4.number(),
      title: z4.string().optional(),
      description: z4.string().optional(),
      discountType: z4.enum(["percentage", "fixed"]).optional(),
      discountValue: z4.string().optional(),
      startDate: z4.number().optional(),
      endDate: z4.number().optional(),
      isActive: z4.enum(["active", "inactive", "expired"]).optional(),
      totalSpots: z4.number().optional(),
      badgeText: z4.string().optional()
    })
  ).mutation(async ({ input }) => {
    const { id, ...data } = input;
    return updateOffer(id, data);
  })
});

// server/routers/contact.ts
import { z as z5 } from "zod";
var contactRouter = router({
  /** Submit a contact form message (public) */
  submit: publicProcedure.input(
    z5.object({
      name: z5.string().min(1),
      email: z5.string().email(),
      phone: z5.string().optional(),
      subject: z5.string().optional(),
      message: z5.string().min(10)
    })
  ).mutation(async ({ input }) => {
    const msg = await createContactMessage({
      ...input,
      status: "new"
    });
    await notifyOwner({
      title: "\u0631\u0633\u0627\u0644\u0629 \u0627\u062A\u0635\u0627\u0644 \u062C\u062F\u064A\u062F\u0629 - New Contact Message",
      content: `\u0645\u0646: ${input.name} (${input.email})
\u0627\u0644\u0645\u0648\u0636\u0648\u0639: ${input.subject || "\u0628\u062F\u0648\u0646 \u0645\u0648\u0636\u0648\u0639"}

${input.message.substring(0, 200)}`
    });
    return { success: true, id: msg.id };
  }),
  /** List all contact messages (admin only) */
  listAll: adminProcedure.input(
    z5.object({
      limit: z5.number().min(1).max(100).default(50),
      offset: z5.number().min(0).default(0)
    }).optional()
  ).query(async ({ input }) => {
    const { limit = 50, offset = 0 } = input ?? {};
    return getAllContactMessages(limit, offset);
  }),
  /** Update message status (admin only) */
  updateStatus: adminProcedure.input(
    z5.object({
      id: z5.number(),
      status: z5.enum(["new", "read", "replied", "archived"])
    })
  ).mutation(async ({ input }) => {
    await updateContactMessageStatus(input.id, input.status);
    return { success: true };
  })
});

// server/routers/uploads.ts
import { z as z6 } from "zod";

// server/storage.ts
init_firebase_storage();
import fs2 from "fs";
import path2 from "path";
var DIRNAME = typeof __dirname !== "undefined" ? __dirname : new URL(".", import.meta.url).pathname;
var LOCAL_UPLOADS_DIR = path2.resolve(DIRNAME, "..", "public", "uploads");
function ensureLocalDir(filePath) {
  const dir = path2.dirname(filePath);
  if (!fs2.existsSync(dir)) {
    fs2.mkdirSync(dir, { recursive: true });
  }
}
function normalizeKey(relKey) {
  return relKey.replace(/^\/+/, "");
}
async function storagePut2(relKey, data, contentType = "application/octet-stream") {
  const key = normalizeKey(relKey);
  let fileBuffer;
  if (typeof data === "string") {
    fileBuffer = Buffer.from(data, "utf-8");
  } else if (ArrayBuffer.isView(data) || data instanceof Uint8Array) {
    fileBuffer = Buffer.from(data);
  } else {
    fileBuffer = data;
  }
  try {
    console.log(`[Storage] Attempting Firebase Storage upload for: ${key}`);
    const result = await storagePut(key, fileBuffer, contentType);
    console.log(`[Storage] Firebase Storage upload successful for: ${key}`);
    return { key, url: result.url };
  } catch (firebaseErr) {
    console.warn(`[Storage] Firebase Storage failed for ${key}, falling back to local filesystem:`, firebaseErr);
  }
  console.log(`[Storage] Using local filesystem fallback for: ${key}`);
  const localPath = path2.join(LOCAL_UPLOADS_DIR, key);
  ensureLocalDir(localPath);
  fs2.writeFileSync(localPath, fileBuffer);
  return { key, url: `/uploads/${key}` };
}

// server/routers/uploads.ts
import { nanoid as nanoid2 } from "nanoid";
var uploadsRouter = router({
  /** Upload a file (authenticated users only) */
  upload: protectedProcedure.input(
    z6.object({
      /** Base64 encoded file data */
      fileData: z6.string(),
      filename: z6.string(),
      mimeType: z6.string(),
      purpose: z6.string().optional()
    })
  ).mutation(async ({ ctx, input }) => {
    const buffer = Buffer.from(input.fileData, "base64");
    const fileSize = buffer.length;
    if (fileSize > 10 * 1024 * 1024) {
      throw new Error("\u062D\u062C\u0645 \u0627\u0644\u0645\u0644\u0641 \u064A\u062A\u062C\u0627\u0648\u0632 \u0627\u0644\u062D\u062F \u0627\u0644\u0645\u0633\u0645\u0648\u062D (10 \u0645\u064A\u062C\u0627\u0628\u0627\u064A\u062A)");
    }
    const ext = input.filename.split(".").pop() || "bin";
    const randomSuffix = nanoid2(8);
    const fileKey = `user-${ctx.user.id}/${input.purpose || "general"}/${randomSuffix}.${ext}`;
    const { url } = await storagePut2(fileKey, buffer, input.mimeType);
    const fileRecord = await createFileUpload({
      userId: ctx.user.id,
      fileKey,
      url,
      filename: input.filename,
      mimeType: input.mimeType,
      fileSize,
      purpose: input.purpose
    });
    return fileRecord;
  }),
  /** List user's uploaded files */
  myFiles: protectedProcedure.query(async ({ ctx }) => {
    return getUserFiles(ctx.user.id);
  })
});

// server/routers/gallery.ts
import { z as z7 } from "zod";
import { nanoid as nanoid3 } from "nanoid";
var ITEMS_COL = "gallery_items";
var VIDEOS_COL = "gallery_videos";
var galleryRouter = router({
  // ─── Public Endpoints ───
  listVisible: publicProcedure.query(async () => {
    const snap = await db.collection(ITEMS_COL).where("isVisible", "==", "visible").orderBy("sortOrder", "asc").get();
    return snap.docs.map((d) => d.data());
  }),
  listVisibleVideos: publicProcedure.query(async () => {
    const snap = await db.collection(VIDEOS_COL).where("isVisible", "==", "visible").orderBy("sortOrder", "asc").get();
    return snap.docs.map((d) => d.data());
  }),
  // ─── Admin Endpoints: Gallery Items ───
  listAll: adminProcedure.input(
    z7.object({
      limit: z7.number().min(1).max(200).default(100),
      offset: z7.number().min(0).default(0)
    }).optional()
  ).query(async ({ input }) => {
    const { limit = 100, offset = 0 } = input ?? {};
    const snap = await db.collection(ITEMS_COL).orderBy("createdAt", "desc").offset(offset).limit(limit).get();
    return snap.docs.map((d) => d.data());
  }),
  create: adminProcedure.input(
    z7.object({
      imageUrl: z7.string().min(1),
      title: z7.string().min(1),
      titleAr: z7.string().optional(),
      description: z7.string().optional(),
      descriptionAr: z7.string().optional(),
      category: z7.string().min(1),
      categoryAr: z7.string().optional(),
      location: z7.string().optional(),
      locationAr: z7.string().optional(),
      featured: z7.enum(["yes", "no"]).default("no"),
      aspect: z7.enum(["landscape", "portrait", "square"]).default("landscape"),
      sortOrder: z7.number().default(0)
    })
  ).mutation(async ({ input }) => {
    const id = Date.now();
    const item = {
      ...input,
      id,
      isVisible: "visible",
      createdAt: /* @__PURE__ */ new Date()
    };
    await db.collection(ITEMS_COL).add(item);
    return item;
  }),
  update: adminProcedure.input(
    z7.object({
      id: z7.number(),
      imageUrl: z7.string().optional(),
      title: z7.string().optional(),
      titleAr: z7.string().optional(),
      description: z7.string().optional(),
      descriptionAr: z7.string().optional(),
      category: z7.string().optional(),
      categoryAr: z7.string().optional(),
      location: z7.string().optional(),
      locationAr: z7.string().optional(),
      featured: z7.enum(["yes", "no"]).optional(),
      aspect: z7.enum(["landscape", "portrait", "square"]).optional(),
      sortOrder: z7.number().optional(),
      isVisible: z7.enum(["visible", "hidden"]).optional()
    })
  ).mutation(async ({ input }) => {
    const { id, ...data } = input;
    const snap = await db.collection(ITEMS_COL).where("id", "==", id).limit(1).get();
    if (snap.empty) throw new Error("Gallery item not found");
    await snap.docs[0].ref.set(data, { merge: true });
    const updated = (await snap.docs[0].ref.get()).data();
    return updated;
  }),
  delete: adminProcedure.input(z7.object({ id: z7.number() })).mutation(async ({ input }) => {
    const snap = await db.collection(ITEMS_COL).where("id", "==", input.id).limit(1).get();
    if (!snap.empty) await snap.docs[0].ref.delete();
    return { success: true };
  }),
  uploadImage: adminProcedure.input(
    z7.object({
      fileData: z7.string(),
      filename: z7.string(),
      mimeType: z7.string()
    })
  ).mutation(async ({ input }) => {
    const buffer = Buffer.from(input.fileData, "base64");
    if (buffer.length > 10 * 1024 * 1024) {
      throw new Error("\u062D\u062C\u0645 \u0627\u0644\u0645\u0644\u0641 \u064A\u062A\u062C\u0627\u0648\u0632 \u0627\u0644\u062D\u062F \u0627\u0644\u0645\u0633\u0645\u0648\u062D (10 \u0645\u064A\u062C\u0627\u0628\u0627\u064A\u062A)");
    }
    const ext = input.filename.split(".").pop() || "jpg";
    const randomSuffix = nanoid3(8);
    const fileKey = `gallery/${randomSuffix}.${ext}`;
    const { url } = await storagePut2(fileKey, buffer, input.mimeType);
    return { url, fileKey };
  }),
  // ─── Admin Endpoints: Gallery Videos ───
  listAllVideos: adminProcedure.input(
    z7.object({
      limit: z7.number().min(1).max(100).default(50),
      offset: z7.number().min(0).default(0)
    }).optional()
  ).query(async ({ input }) => {
    const { limit = 50, offset = 0 } = input ?? {};
    const snap = await db.collection(VIDEOS_COL).orderBy("createdAt", "desc").offset(offset).limit(limit).get();
    return snap.docs.map((d) => d.data());
  }),
  createVideo: adminProcedure.input(
    z7.object({
      thumbnailUrl: z7.string().min(1),
      title: z7.string().min(1),
      titleAr: z7.string().optional(),
      youtubeId: z7.string().min(1),
      duration: z7.string().optional(),
      views: z7.string().optional(),
      sortOrder: z7.number().default(0)
    })
  ).mutation(async ({ input }) => {
    const id = Date.now();
    const video = {
      ...input,
      id,
      isVisible: "visible",
      createdAt: /* @__PURE__ */ new Date()
    };
    await db.collection(VIDEOS_COL).add(video);
    return video;
  }),
  updateVideo: adminProcedure.input(
    z7.object({
      id: z7.number(),
      thumbnailUrl: z7.string().optional(),
      title: z7.string().optional(),
      titleAr: z7.string().optional(),
      youtubeId: z7.string().optional(),
      duration: z7.string().optional(),
      views: z7.string().optional(),
      sortOrder: z7.number().optional(),
      isVisible: z7.enum(["visible", "hidden"]).optional()
    })
  ).mutation(async ({ input }) => {
    const { id, ...data } = input;
    const snap = await db.collection(VIDEOS_COL).where("id", "==", id).limit(1).get();
    if (snap.empty) throw new Error("Gallery video not found");
    await snap.docs[0].ref.set(data, { merge: true });
    const updated = (await snap.docs[0].ref.get()).data();
    return updated;
  }),
  deleteVideo: adminProcedure.input(z7.object({ id: z7.number() })).mutation(async ({ input }) => {
    const snap = await db.collection(VIDEOS_COL).where("id", "==", input.id).limit(1).get();
    if (!snap.empty) await snap.docs[0].ref.delete();
    return { success: true };
  })
});

// server/routers/aiStudio.ts
import { z as z8 } from "zod";

// server/openaiImageGen.ts
import OpenAI from "openai";
async function generateImageWithDALLE(options) {
  const apiKey = ENV.openaiApiKey;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured. Please add your OpenAI API key.");
  }
  const openai = new OpenAI({ apiKey });
  let dalleSize = "1024x1024";
  if (options.size === "1792x1024") {
    dalleSize = "1792x1024";
  } else if (options.size === "1024x1792") {
    dalleSize = "1024x1792";
  }
  const response = await openai.images.generate({
    model: "dall-e-3",
    prompt: options.prompt,
    n: 1,
    size: dalleSize,
    style: options.style || "vivid",
    quality: options.quality || "standard",
    response_format: "b64_json"
  });
  if (!response.data || response.data.length === 0) {
    throw new Error("No image data returned from OpenAI API");
  }
  const imageData = response.data[0];
  if (!imageData?.b64_json) {
    throw new Error("No image data returned from OpenAI API");
  }
  const buffer = Buffer.from(imageData.b64_json, "base64");
  const timestamp2 = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const s3Key = `ai-generated/${timestamp2}-${randomSuffix}.png`;
  const { url } = await storagePut2(s3Key, buffer, "image/png");
  return {
    url,
    s3Key,
    revisedPrompt: imageData.revised_prompt || void 0
  };
}

// server/geminiImageGen.ts
import { GoogleGenAI } from "@google/genai";
var GEMINI_IMAGE_MODELS = {
  "nano-banana": {
    modelCode: "gemini-2.5-flash-image",
    name: "Nano Banana",
    description: "Fast, creative workflows with state-of-the-art speed",
    aspectRatios: ["1:1", "16:9", "9:16", "4:3", "3:4"],
    creditCost: 1
  },
  "nano-banana-pro": {
    modelCode: "gemini-3-pro-image-preview",
    name: "Nano Banana Pro",
    description: "Studio-quality 4K visuals, complex layouts, precise text rendering",
    aspectRatios: ["1:1", "16:9", "9:16", "4:3", "3:4"],
    creditCost: 3
  },
  "nano-banana-2": {
    modelCode: "gemini-3.1-flash-image-preview",
    name: "Nano Banana 2",
    description: "High-efficiency production-scale, supports 0.5K-4K and extra aspect ratios",
    aspectRatios: ["1:1", "16:9", "9:16", "4:3", "3:4", "1:4", "4:1"],
    creditCost: 2
  }
};
async function generateImageWithGemini(options) {
  const apiKey = ENV.geminiApiKey;
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is not configured. Please add your Gemini API key."
    );
  }
  const ai = new GoogleGenAI({ apiKey });
  const modelId = options.model || "nano-banana";
  const modelConfig = GEMINI_IMAGE_MODELS[modelId];
  if (!modelConfig) {
    throw new Error(`Unknown Gemini model: ${modelId}`);
  }
  let fullPrompt = options.prompt;
  if (options.style && options.style !== "vivid") {
    fullPrompt = `${options.style} style: ${options.prompt}`;
  }
  if (options.aspectRatio && options.aspectRatio !== "1:1") {
    fullPrompt += ` (aspect ratio: ${options.aspectRatio})`;
  }
  const response = await ai.models.generateContent({
    model: modelConfig.modelCode,
    contents: fullPrompt,
    config: {
      responseModalities: ["TEXT", "IMAGE"]
    }
  });
  const candidates = response.candidates;
  if (!candidates || candidates.length === 0) {
    throw new Error("No response candidates from Gemini API");
  }
  const parts = candidates[0].content?.parts;
  if (!parts || parts.length === 0) {
    throw new Error("No content parts in Gemini API response");
  }
  let imageBuffer = null;
  let mimeType = "image/png";
  let textResponse;
  for (const part of parts) {
    if (part.inlineData) {
      imageBuffer = Buffer.from(part.inlineData.data, "base64");
      mimeType = part.inlineData.mimeType || "image/png";
    } else if (part.text) {
      textResponse = part.text;
    }
  }
  if (!imageBuffer) {
    throw new Error(
      "No image data returned from Gemini API. The model may have declined to generate this image."
    );
  }
  const ext = mimeType.includes("jpeg") || mimeType.includes("jpg") ? "jpg" : "png";
  const timestamp2 = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const modelPrefix = modelId.replace(/-/g, "");
  const s3Key = `ai-generated/${modelPrefix}-${timestamp2}-${randomSuffix}.${ext}`;
  const { url } = await storagePut2(s3Key, imageBuffer, mimeType);
  return {
    url,
    s3Key,
    revisedPrompt: textResponse || void 0
  };
}

// server/routers/aiStudio.ts
var aiStudioRouter = router({
  /** Get or create AI subscription for current user */
  getSubscription: protectedProcedure.query(async ({ ctx }) => {
    return getOrCreateAISubscription(ctx.user.id);
  }),
  /** Upgrade subscription plan */
  upgradePlan: protectedProcedure.input(
    z8.object({
      plan: z8.enum(["free", "pro", "enterprise"]),
      stripePaymentIntentId: z8.string().optional()
    })
  ).mutation(async ({ ctx, input }) => {
    const subscription = await updateAISubscription(ctx.user.id, input.plan, input.stripePaymentIntentId);
    return subscription;
  }),
  /** Get current user's AI credits */
  getCredits: protectedProcedure.query(async ({ ctx }) => {
    return getOrCreateAICredits(ctx.user.id);
  }),
  /** Add credits to user account (admin/webhook only) */
  addCredits: protectedProcedure.input(
    z8.object({
      amount: z8.number().min(1),
      reason: z8.enum(["purchase", "monthly_allowance", "bonus"]).optional()
    })
  ).mutation(async ({ ctx, input }) => {
    return addAICredits(ctx.user.id, input.amount, input.reason || "bonus");
  }),
  /** Generate image with DALL-E 3 or Nano Banana models - Real API call */
  generateImage: protectedProcedure.input(
    z8.object({
      prompt: z8.string().min(1).max(4e3),
      model: z8.enum(["dall-e-3", "nano-banana", "nano-banana-pro", "nano-banana-2"]).default("dall-e-3"),
      // DALL-E specific options
      size: z8.enum(["1024x1024", "1792x1024", "1024x1792"]).default("1024x1024"),
      style: z8.enum(["vivid", "natural"]).default("vivid"),
      quality: z8.enum(["standard", "hd"]).default("standard"),
      // Nano Banana specific options
      aspectRatio: z8.enum(["1:1", "16:9", "9:16", "4:3", "3:4", "1:4", "4:1"]).default("1:1"),
      creditCost: z8.number().min(1).default(2)
    })
  ).mutation(async ({ ctx, input }) => {
    const credits = await getOrCreateAICredits(ctx.user.id);
    const currentBalance = parseFloat(credits.balance.toString());
    if (currentBalance < input.creditCost) {
      throw new Error("Insufficient credits. Please upgrade your plan or purchase more credits.");
    }
    await deductAICredits(ctx.user.id, input.creditCost);
    const isGeminiModel = input.model.startsWith("nano-banana");
    const modelName = input.model;
    const usageRecord = await createAIUsage({
      userId: ctx.user.id,
      type: "image",
      model: modelName,
      prompt: input.prompt,
      creditsCost: input.creditCost.toString(),
      imageSize: isGeminiModel ? input.aspectRatio : input.size,
      status: "pending"
    });
    try {
      let result;
      if (isGeminiModel) {
        result = await generateImageWithGemini({
          prompt: input.prompt,
          model: input.model,
          aspectRatio: input.aspectRatio,
          style: input.style
        });
      } else {
        result = await generateImageWithDALLE({
          prompt: input.prompt,
          size: input.size,
          style: input.style,
          quality: input.quality
        });
      }
      await updateAIUsageStatus(usageRecord.id, "completed", result.url);
      return {
        success: true,
        imageUrl: result.url,
        s3Key: result.s3Key,
        revisedPrompt: result.revisedPrompt,
        model: modelName,
        usageId: usageRecord.id
      };
    } catch (error) {
      await addAICredits(ctx.user.id, input.creditCost, "bonus");
      const errorMsg = error instanceof Error ? error.message : "Unknown error during image generation";
      await updateAIUsageStatus(usageRecord.id, "failed", void 0, errorMsg);
      throw new Error(`Image generation failed (${modelName}): ${errorMsg}`);
    }
  }),
  /** Deduct credits for image generation (legacy - kept for backward compatibility) */
  deductCreditsForImage: protectedProcedure.input(
    z8.object({
      amount: z8.number().min(1),
      imageModel: z8.string().default("dall-e-3"),
      prompt: z8.string().min(1),
      imageSize: z8.string().optional()
    })
  ).mutation(async ({ ctx, input }) => {
    const credits = await getOrCreateAICredits(ctx.user.id);
    const currentBalance = parseFloat(credits.balance.toString());
    if (currentBalance < input.amount) {
      throw new Error("Insufficient credits for this operation");
    }
    const updated = await deductAICredits(ctx.user.id, input.amount);
    await createAIUsage({
      userId: ctx.user.id,
      type: "image",
      model: input.imageModel,
      prompt: input.prompt,
      creditsCost: input.amount.toString(),
      imageSize: input.imageSize,
      status: "pending"
    });
    return updated;
  }),
  /** Deduct credits for video generation */
  deductCreditsForVideo: protectedProcedure.input(
    z8.object({
      amount: z8.number().min(1),
      videoModel: z8.string().default("runway-ml"),
      prompt: z8.string().min(1),
      videoDuration: z8.number().optional()
    })
  ).mutation(async ({ ctx, input }) => {
    const credits = await getOrCreateAICredits(ctx.user.id);
    const currentBalance = parseFloat(credits.balance.toString());
    if (currentBalance < input.amount) {
      throw new Error("Insufficient credits for this operation");
    }
    const updated = await deductAICredits(ctx.user.id, input.amount);
    await createAIUsage({
      userId: ctx.user.id,
      type: "video",
      model: input.videoModel,
      prompt: input.prompt,
      creditsCost: input.amount.toString(),
      videoDuration: input.videoDuration,
      status: "pending"
    });
    return updated;
  }),
  /** Get user's AI usage history */
  getUsageHistory: protectedProcedure.input(
    z8.object({
      limit: z8.number().min(1).max(100).default(50),
      offset: z8.number().min(0).default(0)
    }).optional()
  ).query(async ({ ctx, input }) => {
    const { limit = 50, offset = 0 } = input ?? {};
    return getUserAIUsage(ctx.user.id, limit, offset);
  }),
  /** Get AI usage statistics */
  getStats: protectedProcedure.query(async ({ ctx }) => {
    return getAIUsageStats(ctx.user.id);
  }),
  /** Get available AI models (public) */
  getModels: publicProcedure.query(async () => {
    return [
      {
        id: "dall-e-3",
        name: "DALL-E 3",
        provider: "OpenAI",
        description: "High-quality image generation with excellent prompt following",
        creditCost: 2,
        badge: "Premium",
        sizes: ["1024x1024", "1792x1024", "1024x1792"],
        styles: ["vivid", "natural"],
        qualities: ["standard", "hd"],
        features: ["Revised prompt", "HD quality", "Multiple sizes"]
      },
      {
        id: "nano-banana",
        name: "Nano Banana",
        provider: "Google Gemini 2.5 Flash",
        description: GEMINI_IMAGE_MODELS["nano-banana"].description,
        creditCost: GEMINI_IMAGE_MODELS["nano-banana"].creditCost,
        badge: "Fast",
        aspectRatios: [...GEMINI_IMAGE_MODELS["nano-banana"].aspectRatios],
        features: ["Text in images", "Multi-language", "Lowest cost"]
      },
      {
        id: "nano-banana-pro",
        name: "Nano Banana Pro",
        provider: "Google Gemini 3 Pro",
        description: GEMINI_IMAGE_MODELS["nano-banana-pro"].description,
        creditCost: GEMINI_IMAGE_MODELS["nano-banana-pro"].creditCost,
        badge: "4K Studio",
        aspectRatios: [...GEMINI_IMAGE_MODELS["nano-banana-pro"].aspectRatios],
        features: ["4K resolution", "Complex layouts", "Precise text rendering", "Google Search grounding"]
      },
      {
        id: "nano-banana-2",
        name: "Nano Banana 2",
        provider: "Google Gemini 3.1 Flash",
        description: GEMINI_IMAGE_MODELS["nano-banana-2"].description,
        creditCost: GEMINI_IMAGE_MODELS["nano-banana-2"].creditCost,
        badge: "New",
        aspectRatios: [...GEMINI_IMAGE_MODELS["nano-banana-2"].aspectRatios],
        features: ["0.5K-4K resolution", "Extra aspect ratios", "Image Search grounding", "Production-scale"]
      }
    ];
  }),
  /** Get subscription plans (public) */
  getPlans: publicProcedure.query(async () => {
    return [
      {
        id: "free",
        name: "Free",
        monthlyCredits: 10,
        price: 0,
        features: [
          "10 \u0635\u0648\u0631 \u0634\u0647\u0631\u064A\u0627\u064B",
          "\u062C\u0648\u062F\u0629 \u0645\u0639\u064A\u0627\u0631\u064A\u0629",
          "\u062F\u0639\u0645 \u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A"
        ]
      },
      {
        id: "pro",
        name: "Pro",
        monthlyCredits: 100,
        price: 29,
        features: [
          "100 \u0635\u0648\u0631\u0629 \u0634\u0647\u0631\u064A\u0627\u064B",
          "\u062C\u0648\u062F\u0629 \u0639\u0627\u0644\u064A\u0629",
          "\u062F\u0639\u0645 \u0627\u0644\u0641\u064A\u062F\u064A\u0648",
          "\u0623\u0648\u0644\u0648\u064A\u0629 \u0641\u064A \u0627\u0644\u0645\u0639\u0627\u0644\u062C\u0629",
          "\u062F\u0639\u0645 \u0627\u0644\u0623\u0648\u0644\u0648\u064A\u0627\u062A"
        ]
      },
      {
        id: "enterprise",
        name: "Enterprise",
        monthlyCredits: 1e3,
        price: 99,
        features: [
          "1000 \u0635\u0648\u0631\u0629 \u0634\u0647\u0631\u064A\u0627\u064B",
          "\u062C\u0648\u062F\u0629 \u0627\u062D\u062A\u0631\u0627\u0641\u064A\u0629",
          "\u0641\u064A\u062F\u064A\u0648\u0647\u0627\u062A \u063A\u064A\u0631 \u0645\u062D\u062F\u0648\u062F\u0629",
          "\u0645\u0639\u0627\u0644\u062C\u0629 \u0641\u0648\u0631\u064A\u0629",
          "\u062F\u0639\u0645 \u0645\u062E\u0635\u0635 24/7",
          "\u0648\u0627\u062C\u0647\u0629 \u0628\u0631\u0645\u062C\u064A\u0629 (API)"
        ]
      }
    ];
  })
});

// server/routers/users.ts
import { z as z9 } from "zod";
import { TRPCError as TRPCError3 } from "@trpc/server";
import { eq as eq3, sql as sql2 } from "drizzle-orm";
var adminProcedure2 = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError3({
      code: "FORBIDDEN",
      message: "Admin access required"
    });
  }
  return next({ ctx });
});
var usersRouter = router({
  // Get all users (admin only)
  list: adminProcedure2.input(
    z9.object({
      limit: z9.number().min(1).max(100).default(50),
      offset: z9.number().min(0).default(0)
    }).optional()
  ).query(async ({ input }) => {
    const { limit = 50, offset = 0 } = input ?? {};
    const [usersList, total] = await Promise.all([
      getAllUsers(limit, offset),
      getUsersCount()
    ]);
    return {
      users: usersList,
      total,
      limit,
      offset
    };
  }),
  // Get single user by ID (admin only)
  getById: adminProcedure2.input(z9.object({ id: z9.number() })).query(async ({ input }) => {
    const user = await getUserById(input.id);
    if (!user) {
      throw new TRPCError3({
        code: "NOT_FOUND",
        message: "User not found"
      });
    }
    return user;
  }),
  // Update user role (admin only)
  updateRole: adminProcedure2.input(
    z9.object({
      id: z9.number(),
      role: z9.enum(["user", "admin"])
    })
  ).mutation(async ({ input }) => {
    const user = await updateUserRole(input.id, input.role);
    if (!user) {
      throw new TRPCError3({
        code: "NOT_FOUND",
        message: "User not found"
      });
    }
    return user;
  }),
  // Search users (admin only)
  search: adminProcedure2.input(
    z9.object({
      query: z9.string().min(1),
      limit: z9.number().min(1).max(50).default(20)
    })
  ).query(async ({ input }) => {
    return searchUsers(input.query, input.limit);
  }),
  // Get user statistics (admin only)
  stats: adminProcedure2.query(async () => {
    return getUserStats();
  }),
  // Get current user profile
  profile: protectedProcedure.query(async ({ ctx }) => {
    return ctx.user;
  }),
  // Update current user profile
  updateProfile: protectedProcedure.input(
    z9.object({
      name: z9.string().min(1).max(100).optional(),
      phone: z9.string().max(32).nullable().optional(),
      avatarUrl: z9.string().url().nullable().optional()
    })
  ).mutation(async ({ ctx, input }) => {
    const updated = await updateUserProfile(ctx.user.id, input);
    if (!updated) {
      throw new TRPCError3({
        code: "NOT_FOUND",
        message: "User not found"
      });
    }
    return updated;
  }),
  // Get profile stats for current user (bookings count, reviews count, AI credits)
  profileStats: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;
    let bookingsCount = 0;
    let reviewsCount = 0;
    let aiCreditsBalance = 0;
    try {
      const userBookings = await getUserBookings(userId);
      bookingsCount = userBookings.length;
    } catch {
    }
    try {
      const db2 = await getDb();
      if (db2) {
        const userReviews = await db2.select({ count: sql2`count(*)` }).from(reviews).where(eq3(reviews.userId, userId));
        reviewsCount = userReviews[0]?.count ?? 0;
      }
    } catch {
    }
    try {
      const credits = await getOrCreateAICredits(userId);
      aiCreditsBalance = parseFloat(credits.balance.toString());
    } catch {
    }
    return {
      bookings: bookingsCount,
      reviews: reviewsCount,
      aiCredits: aiCreditsBalance
    };
  })
});

// server/routers/blog.ts
import { z as z10 } from "zod";
import { TRPCError as TRPCError4 } from "@trpc/server";
var adminProcedure3 = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError4({
      code: "FORBIDDEN",
      message: "Admin access required"
    });
  }
  return next({ ctx });
});
var blogRouter = router({
  // Public: List published blog posts
  list: publicProcedure.input(
    z10.object({
      limit: z10.number().min(1).max(50).default(10),
      offset: z10.number().min(0).default(0),
      category: z10.string().optional()
    }).optional()
  ).query(async ({ input }) => {
    const { limit = 10, offset = 0, category } = input ?? {};
    try {
      if (category) {
        return await getBlogPostsByCategory(category, limit, offset);
      }
      return await getPublishedBlogPosts(limit, offset);
    } catch (err) {
      console.error("[blog.list] database error:", err);
      throw new TRPCError4({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch blog posts"
      });
    }
  }),
  // Public: Get single post by slug
  getBySlug: publicProcedure.input(z10.object({ slug: z10.string() })).query(async ({ input }) => {
    const post = await getBlogPostBySlug(input.slug);
    if (!post) {
      throw new TRPCError4({
        code: "NOT_FOUND",
        message: "Blog post not found"
      });
    }
    incrementBlogViewCount(post.id).catch(() => {
    });
    return post;
  }),
  // Admin: List all posts (including drafts)
  adminList: adminProcedure3.input(
    z10.object({
      limit: z10.number().min(1).max(100).default(50),
      offset: z10.number().min(0).default(0)
    }).optional()
  ).query(async ({ input }) => {
    const { limit = 50, offset = 0 } = input ?? {};
    return getAllBlogPosts(limit, offset);
  }),
  // Admin: Create blog post
  create: adminProcedure3.input(
    z10.object({
      slug: z10.string().min(1).max(255),
      title: z10.string().min(1).max(500),
      excerpt: z10.string().min(1),
      content: z10.string().min(1),
      metaTitle: z10.string().max(70).optional(),
      metaDescription: z10.string().max(160).optional(),
      metaKeywords: z10.string().max(500).optional(),
      coverImageUrl: z10.string().url().optional(),
      category: z10.string().max(100).optional(),
      tags: z10.array(z10.string()).optional(),
      status: z10.enum(["draft", "published"]).default("draft"),
      readingTime: z10.number().min(1).max(60).optional()
    })
  ).mutation(async ({ ctx, input }) => {
    return createBlogPost({
      ...input,
      authorId: ctx.user.id,
      authorName: ctx.user.name || "VANIR GROUP",
      publishedAt: input.status === "published" ? /* @__PURE__ */ new Date() : void 0
    });
  }),
  // Admin: Update blog post
  update: adminProcedure3.input(
    z10.object({
      id: z10.number(),
      slug: z10.string().min(1).max(255).optional(),
      title: z10.string().min(1).max(500).optional(),
      excerpt: z10.string().min(1).optional(),
      content: z10.string().min(1).optional(),
      metaTitle: z10.string().max(70).optional(),
      metaDescription: z10.string().max(160).optional(),
      metaKeywords: z10.string().max(500).optional(),
      coverImageUrl: z10.string().url().optional(),
      category: z10.string().max(100).optional(),
      tags: z10.array(z10.string()).optional(),
      status: z10.enum(["draft", "published", "archived"]).optional(),
      readingTime: z10.number().min(1).max(60).optional()
    })
  ).mutation(async ({ input }) => {
    const { id, ...data } = input;
    const updated = await updateBlogPost(id, {
      ...data,
      publishedAt: data.status === "published" ? /* @__PURE__ */ new Date() : void 0
    });
    if (!updated) {
      throw new TRPCError4({
        code: "NOT_FOUND",
        message: "Blog post not found"
      });
    }
    return updated;
  })
});

// server/routers/marketing.ts
import { z as z11 } from "zod";
import { TRPCError as TRPCError5 } from "@trpc/server";

// server/_core/llm.ts
var ensureArray = (value) => Array.isArray(value) ? value : [value];
var normalizeContentPart = (part) => {
  if (typeof part === "string") {
    return { type: "text", text: part };
  }
  if (part.type === "text") {
    return part;
  }
  if (part.type === "image_url") {
    return part;
  }
  if (part.type === "file_url") {
    return part;
  }
  throw new Error("Unsupported message content part");
};
var normalizeMessage = (message) => {
  const { role, name, tool_call_id } = message;
  if (role === "tool" || role === "function") {
    const content = ensureArray(message.content).map((part) => typeof part === "string" ? part : JSON.stringify(part)).join("\n");
    return {
      role,
      name,
      tool_call_id,
      content
    };
  }
  const contentParts = ensureArray(message.content).map(normalizeContentPart);
  if (contentParts.length === 1 && contentParts[0].type === "text") {
    return {
      role,
      name,
      content: contentParts[0].text
    };
  }
  return {
    role,
    name,
    content: contentParts
  };
};
var normalizeToolChoice = (toolChoice, tools) => {
  if (!toolChoice) return void 0;
  if (toolChoice === "none" || toolChoice === "auto") {
    return toolChoice;
  }
  if (toolChoice === "required") {
    if (!tools || tools.length === 0) {
      throw new Error(
        "tool_choice 'required' was provided but no tools were configured"
      );
    }
    if (tools.length > 1) {
      throw new Error(
        "tool_choice 'required' needs a single tool or specify the tool name explicitly"
      );
    }
    return {
      type: "function",
      function: { name: tools[0].function.name }
    };
  }
  if ("name" in toolChoice) {
    return {
      type: "function",
      function: { name: toolChoice.name }
    };
  }
  return toolChoice;
};
var resolveApiUrl = () => ENV.forgeApiUrl && ENV.forgeApiUrl.trim().length > 0 ? `${ENV.forgeApiUrl.replace(/\/$/, "")}/v1/chat/completions` : "https://forge.manus.im/v1/chat/completions";
var assertApiKey = () => {
  if (!ENV.forgeApiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }
};
var normalizeResponseFormat = ({
  responseFormat,
  response_format,
  outputSchema,
  output_schema
}) => {
  const explicitFormat = responseFormat || response_format;
  if (explicitFormat) {
    if (explicitFormat.type === "json_schema" && !explicitFormat.json_schema?.schema) {
      throw new Error(
        "responseFormat json_schema requires a defined schema object"
      );
    }
    return explicitFormat;
  }
  const schema = outputSchema || output_schema;
  if (!schema) return void 0;
  if (!schema.name || !schema.schema) {
    throw new Error("outputSchema requires both name and schema");
  }
  return {
    type: "json_schema",
    json_schema: {
      name: schema.name,
      schema: schema.schema,
      ...typeof schema.strict === "boolean" ? { strict: schema.strict } : {}
    }
  };
};
async function invokeLLM(params) {
  assertApiKey();
  const {
    messages,
    tools,
    toolChoice,
    tool_choice,
    outputSchema,
    output_schema,
    responseFormat,
    response_format
  } = params;
  const payload = {
    model: "gemini-2.5-flash",
    messages: messages.map(normalizeMessage)
  };
  if (tools && tools.length > 0) {
    payload.tools = tools;
  }
  const normalizedToolChoice = normalizeToolChoice(
    toolChoice || tool_choice,
    tools
  );
  if (normalizedToolChoice) {
    payload.tool_choice = normalizedToolChoice;
  }
  payload.max_tokens = 32768;
  payload.thinking = {
    "budget_tokens": 128
  };
  const normalizedResponseFormat = normalizeResponseFormat({
    responseFormat,
    response_format,
    outputSchema,
    output_schema
  });
  if (normalizedResponseFormat) {
    payload.response_format = normalizedResponseFormat;
  }
  const response = await fetch(resolveApiUrl(), {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${ENV.forgeApiKey}`
    },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `LLM invoke failed: ${response.status} ${response.statusText} \u2013 ${errorText}`
    );
  }
  return await response.json();
}

// server/routers/marketing.ts
import { eq as eq4, desc as desc3, and as and2, sql as sql3 } from "drizzle-orm";
var SYSTEM_PROMPTS = {
  social_media: `You are an expert tourism social media content creator for VANIR GROUP, a luxury Egyptian travel company. 
Create engaging, platform-optimized social media posts that highlight Egypt's ancient wonders, luxury experiences, and cultural richness.
Always include relevant hashtags. Adapt tone and length to the specified platform.
For Instagram: visual storytelling, 2200 char max, 20-30 hashtags.
For Facebook: longer narrative, engagement questions, 1-5 hashtags.
For Twitter/X: concise, punchy, 280 char max, 3-5 hashtags.
For LinkedIn: professional, industry insights, 3-5 hashtags.
For TikTok: trendy, casual, hook-first, 5-10 hashtags.`,
  email: `You are an expert email marketing specialist for VANIR GROUP, a luxury Egyptian travel company.
Create compelling email campaigns that drive bookings and engagement.
Structure emails with: Subject line, Preview text, Header, Body (with sections), CTA button text, and Footer.
Use persuasive copywriting techniques while maintaining a luxurious, trustworthy tone.
Include personalization placeholders like {{first_name}}, {{destination}}.`,
  trip_description: `You are a luxury travel copywriter for VANIR GROUP, specializing in Egyptian tourism.
Create vivid, immersive trip descriptions that transport readers to the destination.
Include: Overview, Highlights, Itinerary outline, What's included, Pricing hint, and Booking CTA.
Write in a way that appeals to discerning travelers seeking authentic, premium experiences.
Support multiple languages when requested.`,
  blog_seo: `You are an SEO content specialist for VANIR GROUP, a luxury Egyptian travel company.
Create SEO-optimized blog articles about Egyptian travel, culture, and tourism.
Include: Title (with primary keyword), Meta description (155 chars), Introduction, 3-5 H2 sections with detailed content, Conclusion with CTA.
Naturally incorporate keywords without stuffing. Write engaging, informative content that ranks well.
Target word count: 1500-2500 words.`,
  ad_copy: `You are an advertising copywriter for VANIR GROUP, a luxury Egyptian travel company.
Create compelling ad copy for various platforms (Google Ads, Facebook Ads, Display Ads).
For Google Ads: Headlines (30 chars each), Descriptions (90 chars each).
For Facebook/Instagram Ads: Primary text, Headline, Description, CTA.
For Display Ads: Headline, Subheadline, Body, CTA.
Focus on unique selling points, urgency, and luxury appeal.`
};
var TONE_INSTRUCTIONS = {
  luxurious: "Use elegant, sophisticated language that conveys exclusivity and premium quality.",
  adventurous: "Use exciting, dynamic language that inspires exploration and discovery.",
  professional: "Use formal, authoritative language suitable for business communications.",
  casual: "Use friendly, conversational language that feels approachable and warm.",
  romantic: "Use poetic, evocative language that appeals to couples and honeymoon travelers.",
  cultural: "Use educational, respectful language that highlights heritage and traditions."
};
var marketingRouter = router({
  /**
   * Generate marketing content using AI
   */
  generate: protectedProcedure.input(
    z11.object({
      type: z11.enum(["social_media", "email", "trip_description", "blog_seo", "ad_copy"]),
      platform: z11.string().optional(),
      prompt: z11.string().min(5, "Prompt must be at least 5 characters"),
      language: z11.string().default("en"),
      tone: z11.string().default("luxurious"),
      destination: z11.string().optional(),
      templateId: z11.number().optional()
    })
  ).mutation(async ({ ctx, input }) => {
    const db2 = await getDb();
    if (!db2) throw new TRPCError5({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
    let systemPrompt = SYSTEM_PROMPTS[input.type] || SYSTEM_PROMPTS.social_media;
    const toneInstruction = TONE_INSTRUCTIONS[input.tone] || TONE_INSTRUCTIONS.luxurious;
    systemPrompt += `

Tone: ${toneInstruction}`;
    if (input.language !== "en") {
      const langMap = {
        ar: "Arabic",
        fr: "French",
        de: "German",
        es: "Spanish",
        it: "Italian",
        pt: "Portuguese",
        zh: "Chinese",
        ja: "Japanese",
        ko: "Korean",
        ru: "Russian"
      };
      const langName = langMap[input.language] || input.language;
      systemPrompt += `

IMPORTANT: Write the entire content in ${langName}.`;
    }
    if (input.platform) {
      systemPrompt += `

Target platform: ${input.platform}. Optimize content format and length for this platform.`;
    }
    if (input.destination) {
      systemPrompt += `

Focus destination: ${input.destination}. Include specific details about this destination.`;
    }
    if (input.templateId) {
      const [template] = await db2.select().from(marketingTemplates).where(eq4(marketingTemplates.id, input.templateId)).limit(1);
      if (template?.systemPrompt) {
        systemPrompt += `

Template context: ${template.systemPrompt}`;
      }
      if (template?.templateContent) {
        systemPrompt += `

Follow this template structure:
${template.templateContent}`;
      }
    }
    const response = await invokeLLM({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: input.prompt }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "marketing_content",
          strict: true,
          schema: {
            type: "object",
            properties: {
              title: { type: "string", description: "Content title or subject line" },
              content: { type: "string", description: "The main generated content" },
              hashtags: {
                type: "array",
                items: { type: "string" },
                description: "Relevant hashtags (without # prefix)"
              },
              metadata: {
                type: "object",
                properties: {
                  wordCount: { type: "number", description: "Approximate word count" },
                  readingTime: { type: "number", description: "Estimated reading time in minutes" },
                  seoScore: { type: "number", description: "Estimated SEO score 1-100 (for blog/SEO content)" }
                },
                required: ["wordCount", "readingTime", "seoScore"],
                additionalProperties: false
              }
            },
            required: ["title", "content", "hashtags", "metadata"],
            additionalProperties: false
          }
        }
      }
    });
    const rawContent = response.choices[0]?.message?.content;
    const contentStr = typeof rawContent === "string" ? rawContent : "";
    let parsed;
    try {
      parsed = JSON.parse(contentStr);
    } catch {
      parsed = {
        title: input.prompt.slice(0, 100),
        content: contentStr,
        hashtags: [],
        metadata: { wordCount: 0, readingTime: 0, seoScore: 0 }
      };
    }
    const [saved] = await db2.insert(marketingContent).values({
      userId: ctx.user.id,
      type: input.type,
      platform: input.platform || null,
      title: parsed.title,
      content: parsed.content,
      prompt: input.prompt,
      language: input.language,
      tone: input.tone,
      destination: input.destination || null,
      hashtags: parsed.hashtags,
      creditsCost: "1"
    }).returning({ id: marketingContent.id });
    return {
      id: saved.id,
      title: parsed.title,
      content: parsed.content,
      hashtags: parsed.hashtags,
      metadata: parsed.metadata,
      type: input.type,
      platform: input.platform
    };
  }),
  /**
   * List user's generated content
   */
  listContent: protectedProcedure.input(
    z11.object({
      type: z11.enum(["social_media", "email", "trip_description", "blog_seo", "ad_copy"]).optional(),
      limit: z11.number().min(1).max(50).default(20),
      offset: z11.number().min(0).default(0)
    })
  ).query(async ({ ctx, input }) => {
    const db2 = await getDb();
    if (!db2) throw new TRPCError5({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
    const conditions = [eq4(marketingContent.userId, ctx.user.id)];
    if (input.type) {
      conditions.push(eq4(marketingContent.type, input.type));
    }
    const items = await db2.select().from(marketingContent).where(and2(...conditions)).orderBy(desc3(marketingContent.createdAt)).limit(input.limit).offset(input.offset);
    const [countResult] = await db2.select({ count: sql3`count(*)` }).from(marketingContent).where(and2(...conditions));
    return {
      items,
      total: countResult?.count || 0
    };
  }),
  /**
   * Toggle favorite status
   */
  toggleFavorite: protectedProcedure.input(z11.object({ id: z11.number() })).mutation(async ({ ctx, input }) => {
    const db2 = await getDb();
    if (!db2) throw new TRPCError5({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
    const [item] = await db2.select().from(marketingContent).where(and2(eq4(marketingContent.id, input.id), eq4(marketingContent.userId, ctx.user.id))).limit(1);
    if (!item) throw new TRPCError5({ code: "NOT_FOUND" });
    const newStatus = item.isFavorite === "yes" ? "no" : "yes";
    await db2.update(marketingContent).set({ isFavorite: newStatus }).where(eq4(marketingContent.id, input.id));
    return { isFavorite: newStatus };
  }),
  /**
   * Delete content
   */
  deleteContent: protectedProcedure.input(z11.object({ id: z11.number() })).mutation(async ({ ctx, input }) => {
    const db2 = await getDb();
    if (!db2) throw new TRPCError5({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
    const [item] = await db2.select().from(marketingContent).where(and2(eq4(marketingContent.id, input.id), eq4(marketingContent.userId, ctx.user.id))).limit(1);
    if (!item) throw new TRPCError5({ code: "NOT_FOUND" });
    await db2.delete(marketingContent).where(eq4(marketingContent.id, input.id));
    return { success: true };
  }),
  // ─── Calendar ───
  /**
   * List calendar entries
   */
  listCalendar: protectedProcedure.input(
    z11.object({
      startDate: z11.number().optional(),
      endDate: z11.number().optional()
    })
  ).query(async ({ ctx, input }) => {
    const db2 = await getDb();
    if (!db2) throw new TRPCError5({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
    const conditions = [eq4(marketingCalendar.userId, ctx.user.id)];
    if (input.startDate) {
      conditions.push(sql3`${marketingCalendar.scheduledDate} >= ${input.startDate}`);
    }
    if (input.endDate) {
      conditions.push(sql3`${marketingCalendar.scheduledDate} <= ${input.endDate}`);
    }
    return db2.select().from(marketingCalendar).where(and2(...conditions)).orderBy(marketingCalendar.scheduledDate);
  }),
  /**
   * Add calendar entry
   */
  addCalendarEntry: protectedProcedure.input(
    z11.object({
      contentId: z11.number().optional(),
      title: z11.string().min(1),
      description: z11.string().optional(),
      platform: z11.string().optional(),
      scheduledDate: z11.number(),
      status: z11.enum(["draft", "scheduled", "published", "cancelled"]).default("draft"),
      colorTag: z11.string().default("#D4A853")
    })
  ).mutation(async ({ ctx, input }) => {
    const db2 = await getDb();
    if (!db2) throw new TRPCError5({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
    const [entry] = await db2.insert(marketingCalendar).values({
      userId: ctx.user.id,
      contentId: input.contentId || null,
      title: input.title,
      description: input.description || null,
      platform: input.platform || null,
      scheduledDate: input.scheduledDate,
      status: input.status,
      colorTag: input.colorTag
    }).returning({ id: marketingCalendar.id });
    return { id: entry.id };
  }),
  /**
   * Update calendar entry status
   */
  updateCalendarEntry: protectedProcedure.input(
    z11.object({
      id: z11.number(),
      title: z11.string().optional(),
      description: z11.string().optional(),
      scheduledDate: z11.number().optional(),
      status: z11.enum(["draft", "scheduled", "published", "cancelled"]).optional(),
      colorTag: z11.string().optional()
    })
  ).mutation(async ({ ctx, input }) => {
    const db2 = await getDb();
    if (!db2) throw new TRPCError5({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
    const { id, ...updates } = input;
    const [item] = await db2.select().from(marketingCalendar).where(and2(eq4(marketingCalendar.id, id), eq4(marketingCalendar.userId, ctx.user.id))).limit(1);
    if (!item) throw new TRPCError5({ code: "NOT_FOUND" });
    const cleanUpdates = {};
    if (updates.title !== void 0) cleanUpdates.title = updates.title;
    if (updates.description !== void 0) cleanUpdates.description = updates.description;
    if (updates.scheduledDate !== void 0) cleanUpdates.scheduledDate = updates.scheduledDate;
    if (updates.status !== void 0) cleanUpdates.status = updates.status;
    if (updates.colorTag !== void 0) cleanUpdates.colorTag = updates.colorTag;
    if (Object.keys(cleanUpdates).length > 0) {
      await db2.update(marketingCalendar).set(cleanUpdates).where(eq4(marketingCalendar.id, id));
    }
    return { success: true };
  }),
  /**
   * Delete calendar entry
   */
  deleteCalendarEntry: protectedProcedure.input(z11.object({ id: z11.number() })).mutation(async ({ ctx, input }) => {
    const db2 = await getDb();
    if (!db2) throw new TRPCError5({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
    const [item] = await db2.select().from(marketingCalendar).where(and2(eq4(marketingCalendar.id, input.id), eq4(marketingCalendar.userId, ctx.user.id))).limit(1);
    if (!item) throw new TRPCError5({ code: "NOT_FOUND" });
    await db2.delete(marketingCalendar).where(eq4(marketingCalendar.id, input.id));
    return { success: true };
  }),
  // ─── Templates ───
  /**
   * List available templates
   */
  listTemplates: publicProcedure.input(
    z11.object({
      type: z11.enum(["social_media", "email", "trip_description", "blog_seo", "ad_copy"]).optional()
    })
  ).query(async ({ input }) => {
    const db2 = await getDb();
    if (!db2) throw new TRPCError5({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
    const conditions = [];
    if (input.type) {
      conditions.push(eq4(marketingTemplates.type, input.type));
    }
    return db2.select().from(marketingTemplates).where(conditions.length > 0 ? and2(...conditions) : void 0).orderBy(marketingTemplates.sortOrder);
  }),
  /**
   * Get content generation stats
   */
  getStats: protectedProcedure.query(async ({ ctx }) => {
    const db2 = await getDb();
    if (!db2) throw new TRPCError5({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
    if (!db2) throw new TRPCError5({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
    const [totalContent] = await db2.select({ count: sql3`count(*)` }).from(marketingContent).where(eq4(marketingContent.userId, ctx.user.id));
    const [socialCount] = await db2.select({ count: sql3`count(*)` }).from(marketingContent).where(and2(eq4(marketingContent.userId, ctx.user.id), eq4(marketingContent.type, "social_media")));
    const [emailCount] = await db2.select({ count: sql3`count(*)` }).from(marketingContent).where(and2(eq4(marketingContent.userId, ctx.user.id), eq4(marketingContent.type, "email")));
    const [blogCount] = await db2.select({ count: sql3`count(*)` }).from(marketingContent).where(and2(eq4(marketingContent.userId, ctx.user.id), eq4(marketingContent.type, "blog_seo")));
    const [calendarCount] = await db2.select({ count: sql3`count(*)` }).from(marketingCalendar).where(eq4(marketingCalendar.userId, ctx.user.id));
    return {
      totalContent: totalContent?.count || 0,
      socialMedia: socialCount?.count || 0,
      emails: emailCount?.count || 0,
      blogPosts: blogCount?.count || 0,
      calendarEntries: calendarCount?.count || 0
    };
  })
});

// server/routers/admin.destinations.ts
import { z as z12 } from "zod";
import { eq as eq5, like, desc as desc4, asc as asc2, inArray } from "drizzle-orm";
var adminDestinationsRouter = router({
  /** List all destinations with pagination and filtering */
  list: adminProcedure.input(
    z12.object({
      limit: z12.number().min(1).max(100).default(20),
      offset: z12.number().min(0).default(0),
      search: z12.string().optional(),
      sortBy: z12.enum(["name", "rating", "price", "createdAt"]).default("name"),
      sortOrder: z12.enum(["asc", "desc"]).default("asc")
    }).optional()
  ).query(async ({ input }) => {
    const db2 = await getDb();
    if (!db2) throw new Error("Database not available");
    const { limit = 20, offset = 0, search = "", sortBy = "name", sortOrder = "asc" } = input ?? {};
    let query = db2.select().from(destinations);
    if (search) {
      query = query.where(like(destinations.name, `%${search}%`));
    }
    const orderColumn = sortBy === "name" ? destinations.name : sortBy === "rating" ? destinations.rating : sortBy === "price" ? destinations.pricePerPerson : destinations.createdAt;
    query = query.orderBy(sortOrder === "desc" ? desc4(orderColumn) : asc2(orderColumn));
    query = query.limit(limit).offset(offset);
    return await query;
  }),
  /** Get single destination by ID */
  getById: adminProcedure.input(z12.object({ id: z12.number() })).query(async ({ input }) => {
    const db2 = await getDb();
    if (!db2) throw new Error("Database not available");
    const result = await db2.select().from(destinations).where(eq5(destinations.id, input.id));
    return result[0] || null;
  }),
  /** Create new destination */
  create: adminProcedure.input(
    z12.object({
      name: z12.string().min(1, "\u0627\u0633\u0645 \u0627\u0644\u0648\u062C\u0647\u0629 \u0645\u0637\u0644\u0648\u0628"),
      description: z12.string().optional(),
      location: z12.string().min(1, "\u0627\u0644\u0645\u0648\u0642\u0639 \u0645\u0637\u0644\u0648\u0628"),
      pricePerPerson: z12.string().optional(),
      rating: z12.string().optional(),
      imageUrl: z12.string().optional(),
      highlights: z12.string().optional(),
      bestTimeToVisit: z12.string().optional(),
      duration: z12.string().optional(),
      difficulty: z12.enum(["easy", "moderate", "hard"]).optional(),
      groupSize: z12.string().optional(),
      inclusions: z12.string().optional(),
      exclusions: z12.string().optional()
    })
  ).mutation(async ({ input }) => {
    const db2 = await getDb();
    if (!db2) throw new Error("Database not available");
    const result = await db2.insert(destinations).values({
      ...input,
      isActive: "active"
    });
    return { success: true };
  }),
  /** Update destination */
  update: adminProcedure.input(
    z12.object({
      id: z12.number(),
      name: z12.string().optional(),
      description: z12.string().optional(),
      location: z12.string().optional(),
      pricePerPerson: z12.string().optional(),
      rating: z12.string().optional(),
      imageUrl: z12.string().optional(),
      highlights: z12.string().optional(),
      bestTimeToVisit: z12.string().optional(),
      duration: z12.string().optional(),
      difficulty: z12.enum(["easy", "moderate", "hard"]).optional(),
      groupSize: z12.string().optional(),
      inclusions: z12.string().optional(),
      exclusions: z12.string().optional(),
      isActive: z12.enum(["active", "inactive"]).optional()
    })
  ).mutation(async ({ input }) => {
    const db2 = await getDb();
    if (!db2) throw new Error("Database not available");
    const { id, ...data } = input;
    await db2.update(destinations).set({ ...data, updatedAt: /* @__PURE__ */ new Date() }).where(eq5(destinations.id, id));
    return { success: true };
  }),
  /** Delete destination */
  delete: adminProcedure.input(z12.object({ id: z12.number() })).mutation(async ({ input }) => {
    const db2 = await getDb();
    if (!db2) throw new Error("Database not available");
    await db2.delete(destinations).where(eq5(destinations.id, input.id));
    return { success: true };
  }),
  /** Bulk delete destinations */
  bulkDelete: adminProcedure.input(z12.object({ ids: z12.array(z12.number()) })).mutation(async ({ input }) => {
    const db2 = await getDb();
    if (!db2) throw new Error("Database not available");
    await db2.delete(destinations).where(inArray(destinations.id, input.ids));
    return { success: true, deleted: input.ids.length };
  }),
  /** Update destination status (active/inactive) */
  updateStatus: adminProcedure.input(z12.object({ id: z12.number(), isActive: z12.enum(["active", "inactive"]) })).mutation(async ({ input }) => {
    const db2 = await getDb();
    if (!db2) throw new Error("Database not available");
    await db2.update(destinations).set({
      isActive: input.isActive,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq5(destinations.id, input.id));
    return { success: true };
  }),
  /** Get statistics */
  getStats: adminProcedure.query(async () => {
    const db2 = await getDb();
    if (!db2) throw new Error("Database not available");
    const allDestinations = await db2.select().from(destinations);
    const activeCount = allDestinations.filter((d) => d.isActive === "active").length;
    const avgRating = allDestinations.length > 0 ? (allDestinations.reduce((sum, d) => sum + (parseFloat(d.rating) || 0), 0) / allDestinations.length).toFixed(2) : 0;
    const avgPrice = allDestinations.length > 0 ? (allDestinations.reduce((sum, d) => sum + (parseFloat(d.pricePerPerson) || 0), 0) / allDestinations.length).toFixed(2) : 0;
    return {
      total: allDestinations.length,
      active: activeCount,
      inactive: allDestinations.length - activeCount,
      avgRating: parseFloat(avgRating),
      avgPrice: parseFloat(avgPrice)
    };
  })
});

// server/routers/admin.offers.ts
import { z as z13 } from "zod";
import { eq as eq6, like as like2, desc as desc5, asc as asc3, inArray as inArray2 } from "drizzle-orm";
var adminOffersRouter = router({
  /** List all offers with pagination and filtering */
  list: adminProcedure.input(
    z13.object({
      limit: z13.number().min(1).max(100).default(20),
      offset: z13.number().min(0).default(0),
      search: z13.string().optional(),
      status: z13.enum(["active", "inactive", "expired"]).optional(),
      sortBy: z13.enum(["title", "discount", "createdAt", "startDate"]).default("createdAt"),
      sortOrder: z13.enum(["asc", "desc"]).default("desc")
    }).optional()
  ).query(async ({ input }) => {
    const db2 = await getDb();
    if (!db2) throw new Error("Database not available");
    const { limit = 20, offset = 0, search = "", status, sortBy = "createdAt", sortOrder = "desc" } = input ?? {};
    let query = db2.select().from(offers);
    if (search) {
      query = query.where(like2(offers.title, `%${search}%`));
    }
    if (status) {
      query = query.where(eq6(offers.isActive, status));
    }
    const orderColumn = sortBy === "title" ? offers.title : sortBy === "discount" ? offers.discountValue : sortBy === "startDate" ? offers.startDate : offers.createdAt;
    query = query.orderBy(sortOrder === "desc" ? desc5(orderColumn) : asc3(orderColumn));
    query = query.limit(limit).offset(offset);
    return await query;
  }),
  /** Get single offer by ID */
  getById: adminProcedure.input(z13.object({ id: z13.number() })).query(async ({ input }) => {
    const db2 = await getDb();
    if (!db2) throw new Error("Database not available");
    const result = await db2.select().from(offers).where(eq6(offers.id, input.id));
    return result[0] || null;
  }),
  /** Create new offer */
  create: adminProcedure.input(
    z13.object({
      title: z13.string().min(1, "\u0639\u0646\u0648\u0627\u0646 \u0627\u0644\u0639\u0631\u0636 \u0645\u0637\u0644\u0648\u0628"),
      description: z13.string().optional(),
      discountType: z13.enum(["percentage", "fixed"]),
      discountValue: z13.string(),
      promoCode: z13.string().optional(),
      startDate: z13.number(),
      endDate: z13.number(),
      category: z13.string().optional(),
      destination: z13.string().optional(),
      imageUrl: z13.string().optional(),
      totalSpots: z13.number().optional(),
      badgeText: z13.string().optional(),
      badgeColor: z13.string().optional()
    })
  ).mutation(async ({ input }) => {
    const db2 = await getDb();
    if (!db2) throw new Error("Database not available");
    const result = await db2.insert(offers).values({
      ...input,
      isActive: "active",
      bookedSpots: 0
    });
    return { success: true };
  }),
  /** Update offer */
  update: adminProcedure.input(
    z13.object({
      id: z13.number(),
      title: z13.string().optional(),
      description: z13.string().optional(),
      discountType: z13.enum(["percentage", "fixed"]).optional(),
      discountValue: z13.string().optional(),
      promoCode: z13.string().optional(),
      startDate: z13.number().optional(),
      endDate: z13.number().optional(),
      category: z13.string().optional(),
      destination: z13.string().optional(),
      imageUrl: z13.string().optional(),
      totalSpots: z13.number().optional(),
      badgeText: z13.string().optional(),
      badgeColor: z13.string().optional(),
      isActive: z13.enum(["active", "inactive", "expired"]).optional()
    })
  ).mutation(async ({ input }) => {
    const db2 = await getDb();
    if (!db2) throw new Error("Database not available");
    const { id, ...data } = input;
    await db2.update(offers).set({ ...data, updatedAt: /* @__PURE__ */ new Date() }).where(eq6(offers.id, id));
    return { success: true };
  }),
  /** Delete offer */
  delete: adminProcedure.input(z13.object({ id: z13.number() })).mutation(async ({ input }) => {
    const db2 = await getDb();
    if (!db2) throw new Error("Database not available");
    await db2.delete(offers).where(eq6(offers.id, input.id));
    return { success: true };
  }),
  /** Bulk delete offers */
  bulkDelete: adminProcedure.input(z13.object({ ids: z13.array(z13.number()) })).mutation(async ({ input }) => {
    const db2 = await getDb();
    if (!db2) throw new Error("Database not available");
    await db2.delete(offers).where(inArray2(offers.id, input.ids));
    return { success: true, deleted: input.ids.length };
  }),
  /** Update offer status */
  updateStatus: adminProcedure.input(z13.object({ id: z13.number(), isActive: z13.enum(["active", "inactive", "expired"]) })).mutation(async ({ input }) => {
    const db2 = await getDb();
    if (!db2) throw new Error("Database not available");
    await db2.update(offers).set({
      isActive: input.isActive,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq6(offers.id, input.id));
    return { success: true };
  }),
  /** Get statistics */
  getStats: adminProcedure.query(async () => {
    const db2 = await getDb();
    if (!db2) throw new Error("Database not available");
    const allOffers = await db2.select().from(offers);
    const activeCount = allOffers.filter((o) => o.isActive === "active").length;
    const totalDiscount = allOffers.reduce((sum, o) => sum + (parseFloat(o.discountValue) || 0), 0);
    const avgDiscount = allOffers.length > 0 ? (totalDiscount / allOffers.length).toFixed(2) : 0;
    return {
      total: allOffers.length,
      active: activeCount,
      inactive: allOffers.length - activeCount,
      avgDiscount: parseFloat(avgDiscount)
    };
  })
});

// server/routers/admin.blog.ts
import { z as z14 } from "zod";
import { eq as eq7, like as like3, desc as desc6, asc as asc4, inArray as inArray3 } from "drizzle-orm";
var adminBlogRouter = router({
  /** List all blog posts with pagination and filtering */
  list: adminProcedure.input(
    z14.object({
      limit: z14.number().min(1).max(100).default(20),
      offset: z14.number().min(0).default(0),
      search: z14.string().optional(),
      status: z14.enum(["draft", "published", "archived"]).optional(),
      category: z14.string().optional(),
      sortBy: z14.enum(["title", "publishedAt", "createdAt", "viewCount"]).default("createdAt"),
      sortOrder: z14.enum(["asc", "desc"]).default("desc")
    }).optional()
  ).query(async ({ input }) => {
    const db2 = await getDb();
    if (!db2) throw new Error("Database not available");
    const { limit = 20, offset = 0, search = "", status, category, sortBy = "createdAt", sortOrder = "desc" } = input ?? {};
    let query = db2.select().from(blogPosts);
    if (search) {
      query = query.where(like3(blogPosts.title, `%${search}%`));
    }
    if (status) {
      query = query.where(eq7(blogPosts.status, status));
    }
    if (category) {
      query = query.where(eq7(blogPosts.category, category));
    }
    const orderColumn = sortBy === "title" ? blogPosts.title : sortBy === "publishedAt" ? blogPosts.publishedAt : sortBy === "viewCount" ? blogPosts.viewCount : blogPosts.createdAt;
    query = query.orderBy(sortOrder === "desc" ? desc6(orderColumn) : asc4(orderColumn));
    query = query.limit(limit).offset(offset);
    return await query;
  }),
  /** Get single blog post by ID */
  getById: adminProcedure.input(z14.object({ id: z14.number() })).query(async ({ input }) => {
    const db2 = await getDb();
    if (!db2) throw new Error("Database not available");
    const result = await db2.select().from(blogPosts).where(eq7(blogPosts.id, input.id));
    return result[0] || null;
  }),
  /** Get blog post by slug */
  getBySlug: adminProcedure.input(z14.object({ slug: z14.string() })).query(async ({ input }) => {
    const db2 = await getDb();
    if (!db2) throw new Error("Database not available");
    const result = await db2.select().from(blogPosts).where(eq7(blogPosts.slug, input.slug));
    return result[0] || null;
  }),
  /** Create new blog post */
  create: adminProcedure.input(
    z14.object({
      slug: z14.string().min(1, "\u0627\u0644\u0631\u0627\u0628\u0637 \u0627\u0644\u0648\u062F\u0648\u062F \u0645\u0637\u0644\u0648\u0628"),
      title: z14.string().min(1, "\u0639\u0646\u0648\u0627\u0646 \u0627\u0644\u0645\u0642\u0627\u0644\u0629 \u0645\u0637\u0644\u0648\u0628"),
      excerpt: z14.string().min(1, "\u0627\u0644\u0645\u0644\u062E\u0635 \u0645\u0637\u0644\u0648\u0628"),
      content: z14.string().min(1, "\u0645\u062D\u062A\u0648\u0649 \u0627\u0644\u0645\u0642\u0627\u0644\u0629 \u0645\u0637\u0644\u0648\u0628"),
      metaTitle: z14.string().optional(),
      metaDescription: z14.string().optional(),
      metaKeywords: z14.string().optional(),
      coverImageUrl: z14.string().optional(),
      category: z14.string().optional(),
      tags: z14.array(z14.string()).optional(),
      authorName: z14.string().optional(),
      readingTime: z14.number().optional()
    })
  ).mutation(async ({ input }) => {
    const db2 = await getDb();
    if (!db2) throw new Error("Database not available");
    const result = await db2.insert(blogPosts).values({
      ...input,
      status: "draft",
      viewCount: 0
    });
    return { success: true };
  }),
  /** Update blog post */
  update: adminProcedure.input(
    z14.object({
      id: z14.number(),
      slug: z14.string().optional(),
      title: z14.string().optional(),
      excerpt: z14.string().optional(),
      content: z14.string().optional(),
      metaTitle: z14.string().optional(),
      metaDescription: z14.string().optional(),
      metaKeywords: z14.string().optional(),
      coverImageUrl: z14.string().optional(),
      category: z14.string().optional(),
      tags: z14.array(z14.string()).optional(),
      authorName: z14.string().optional(),
      readingTime: z14.number().optional(),
      status: z14.enum(["draft", "published", "archived"]).optional()
    })
  ).mutation(async ({ input }) => {
    const db2 = await getDb();
    if (!db2) throw new Error("Database not available");
    const { id, ...data } = input;
    await db2.update(blogPosts).set({ ...data, updatedAt: /* @__PURE__ */ new Date() }).where(eq7(blogPosts.id, id));
    return { success: true };
  }),
  /** Delete blog post */
  delete: adminProcedure.input(z14.object({ id: z14.number() })).mutation(async ({ input }) => {
    const db2 = await getDb();
    if (!db2) throw new Error("Database not available");
    await db2.delete(blogPosts).where(eq7(blogPosts.id, input.id));
    return { success: true };
  }),
  /** Bulk delete blog posts */
  bulkDelete: adminProcedure.input(z14.object({ ids: z14.array(z14.number()) })).mutation(async ({ input }) => {
    const db2 = await getDb();
    if (!db2) throw new Error("Database not available");
    await db2.delete(blogPosts).where(inArray3(blogPosts.id, input.ids));
    return { success: true, deleted: input.ids.length };
  }),
  /** Publish blog post */
  publish: adminProcedure.input(z14.object({ id: z14.number() })).mutation(async ({ input }) => {
    const db2 = await getDb();
    if (!db2) throw new Error("Database not available");
    await db2.update(blogPosts).set({
      status: "published",
      publishedAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq7(blogPosts.id, input.id));
    return { success: true };
  }),
  /** Archive blog post */
  archive: adminProcedure.input(z14.object({ id: z14.number() })).mutation(async ({ input }) => {
    const db2 = await getDb();
    if (!db2) throw new Error("Database not available");
    await db2.update(blogPosts).set({
      status: "archived",
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq7(blogPosts.id, input.id));
    return { success: true };
  }),
  /** Get statistics */
  getStats: adminProcedure.query(async () => {
    const db2 = await getDb();
    if (!db2) throw new Error("Database not available");
    const allPosts = await db2.select().from(blogPosts);
    const publishedCount = allPosts.filter((p) => p.status === "published").length;
    const draftCount = allPosts.filter((p) => p.status === "draft").length;
    const totalViews = allPosts.reduce((sum, p) => sum + (p.viewCount || 0), 0);
    const avgViews = allPosts.length > 0 ? (totalViews / allPosts.length).toFixed(0) : 0;
    return {
      total: allPosts.length,
      published: publishedCount,
      draft: draftCount,
      archived: allPosts.length - publishedCount - draftCount,
      totalViews,
      avgViews: parseInt(avgViews)
    };
  })
});

// server/routers/aiCommand.ts
import { z as z15 } from "zod";
import { nanoid as nanoid4 } from "nanoid";
var VANIR_SYSTEM_PROMPT = `You are the AI Command Center assistant for Vanir Travel Group \u2014 a luxury travel company specializing in Egyptian heritage and premium travel experiences. You combine ancient Egyptian elegance with modern luxury.

Brand voice: Sophisticated, knowledgeable, warm yet professional. Use rich descriptive language that evokes luxury and wonder.

Company details:
- Name: Vanir Travel Group (Vanir Group)
- Specialty: Luxury travel, Egyptian heritage tours, premium experiences
- Style: Art Deco, Black & Gold aesthetic
- Target audience: High-net-worth travelers, culture enthusiasts, luxury seekers

You are fluent in both Arabic and English. Respond in the same language the user writes in.
Always provide actionable, specific, and professional responses.`;
var TASK_PROMPTS = {
  content_writer: `${VANIR_SYSTEM_PROMPT}

You are a premium content writer for Vanir Travel Group. Your task is to create compelling, luxury-oriented travel content.

Guidelines:
- Write in an elegant, evocative style that captures the magic of travel
- Highlight unique experiences, cultural richness, and luxury amenities
- Use sensory language that transports the reader
- Include relevant keywords naturally for SEO
- Maintain the brand's sophisticated tone
- Format output in clean Markdown with headers, paragraphs, and lists where appropriate`,
  seo_analyst: `${VANIR_SYSTEM_PROMPT}

You are an expert SEO analyst for Vanir Travel Group. Analyze and optimize content for search engines.

Your capabilities:
- Audit page titles, meta descriptions, and keywords
- Suggest improvements for search rankings
- Analyze keyword density and relevance
- Recommend internal/external linking strategies
- Provide structured SEO reports with scores
- Suggest schema markup improvements
- Analyze competitor keywords in the luxury travel space

Format your analysis with clear sections, scores (1-100), and actionable recommendations.`,
  offer_generator: `${VANIR_SYSTEM_PROMPT}

You are a luxury travel offer creator for Vanir Travel Group. Design irresistible travel packages.

When creating offers:
- Include a compelling title and tagline
- Detail the itinerary day by day
- List included amenities and experiences
- Set pricing tiers (Standard, Premium, Royal)
- Add urgency elements (limited availability, seasonal)
- Highlight unique selling points
- Include terms and conditions summary

Format as a structured offer document in Markdown.`,
  data_analyst: `${VANIR_SYSTEM_PROMPT}

You are a data analyst for Vanir Travel Group. Analyze business metrics and provide insights.

Your capabilities:
- Analyze booking trends and patterns
- Revenue analysis and forecasting
- Customer segmentation insights
- Seasonal demand analysis
- Performance benchmarking
- ROI calculations for marketing campaigns
- Conversion funnel analysis

Provide data-driven insights with specific numbers, percentages, and actionable recommendations.
Use tables and structured formats for clarity.`,
  customer_support: `${VANIR_SYSTEM_PROMPT}

You are a premium customer support specialist for Vanir Travel Group. Handle customer inquiries with grace and professionalism.

Guidelines:
- Respond with warmth and empathy
- Provide detailed, helpful solutions
- Maintain the luxury brand experience in every interaction
- Offer alternatives when the requested option isn't available
- Use professional yet friendly language
- Include relevant policies when needed
- Escalate appropriately when necessary

Draft professional email responses that maintain the Vanir luxury standard.`,
  translator: `${VANIR_SYSTEM_PROMPT}

You are a professional translator for Vanir Travel Group. Translate content between Arabic and English while maintaining the luxury brand voice.

Guidelines:
- Preserve the tone and style of the original text
- Adapt cultural references appropriately
- Maintain marketing appeal in translations
- Keep technical terms accurate
- Preserve formatting and structure
- Add cultural context notes when helpful`,
  social_media: `${VANIR_SYSTEM_PROMPT}

You are a social media strategist for Vanir Travel Group. Create engaging social media content.

Capabilities:
- Write posts for Instagram, Facebook, Twitter/X, LinkedIn
- Create hashtag strategies
- Design content calendars
- Write engaging captions with CTAs
- Create story/reel scripts
- Suggest visual content ideas
- Plan influencer collaboration briefs

Adapt tone for each platform while maintaining brand consistency.`,
  itinerary_planner: `${VANIR_SYSTEM_PROMPT}

You are an expert luxury itinerary planner for Vanir Travel Group. Design detailed, day-by-day travel itineraries.

When creating itineraries:
- Structure each day with morning, afternoon, and evening activities
- Include luxury hotel recommendations with room categories
- Add restaurant suggestions with cuisine types
- Include private transportation arrangements
- Suggest optional VIP experiences and upgrades
- Add practical tips (best time to visit, dress code, local customs)
- Include estimated timing for each activity
- Factor in rest periods and leisure time for luxury travelers

Format as a beautifully structured day-by-day itinerary in Markdown.`,
  review_responder: `${VANIR_SYSTEM_PROMPT}

You are a guest relations specialist for Vanir Travel Group. Craft thoughtful, personalized responses to guest reviews.

Guidelines:
- Always thank the guest by name when available
- Address specific points mentioned in their review
- For positive reviews: express genuine gratitude, highlight what made their experience special
- For negative reviews: apologize sincerely, acknowledge the issue, explain corrective actions, offer resolution
- Maintain professional warmth without being defensive
- Invite them to return and mention upcoming experiences
- Keep responses concise but heartfelt (150-250 words)

Provide responses ready to post on TripAdvisor, Google, and Booking.com.`,
  pricing_advisor: `${VANIR_SYSTEM_PROMPT}

You are a revenue management and pricing strategist for Vanir Travel Group.

Your capabilities:
- Analyze competitive pricing in the luxury travel market
- Suggest dynamic pricing strategies based on seasonality
- Calculate profit margins and break-even points
- Design tiered pricing structures (Standard, Premium, Royal, Ultra-Luxury)
- Recommend upselling and cross-selling strategies
- Analyze price elasticity for different market segments
- Create promotional pricing calendars

Provide specific numbers, percentages, and comparison tables in your analysis.`,
  brand_voice: `${VANIR_SYSTEM_PROMPT}

You are a brand strategist and copywriter for Vanir Travel Group. Ensure all content aligns with the brand identity.

Your capabilities:
- Review and refine content to match brand voice
- Create brand-consistent taglines and slogans
- Develop brand messaging frameworks
- Write brand guidelines and style notes
- Adapt content for different audiences while maintaining brand identity
- Create brand stories that connect Egyptian heritage with modern luxury
- Design email signatures, bio texts, and boilerplate copy

Always maintain the Art Deco, Black & Gold aesthetic in your writing suggestions.`,
  competitor_analysis: `${VANIR_SYSTEM_PROMPT}

You are a competitive intelligence analyst for Vanir Travel Group.

Your capabilities:
- Analyze competitor offerings, pricing, and positioning
- Identify market gaps and opportunities
- Compare service features and unique selling points
- Assess competitor marketing strategies
- Provide SWOT analysis for competitive positioning
- Suggest differentiation strategies
- Monitor industry trends and emerging competitors

Provide structured analysis with comparison tables and actionable recommendations.`,
  report_generator: `${VANIR_SYSTEM_PROMPT}

You are a professional report writer for Vanir Travel Group. Create comprehensive business reports.

Report types you can generate:
- Monthly/quarterly performance reports
- Marketing campaign analysis reports
- Customer satisfaction summaries
- Destination performance reports
- Financial overview reports
- Market research summaries
- Operational efficiency reports

Format reports with executive summary, key findings, detailed analysis, charts descriptions, and recommendations.
Use professional formatting with headers, tables, and bullet points.`,
  email_composer: `${VANIR_SYSTEM_PROMPT}

You are an email communication specialist for Vanir Travel Group. Craft professional emails for various purposes.

Email types:
- Welcome emails for new clients
- Booking confirmations with luxury touches
- Pre-trip preparation guides
- Post-trip thank you and feedback requests
- Partnership and B2B proposals
- Newsletter content
- VIP client communications
- Event invitations
- Seasonal promotions

Maintain the luxury brand voice while being warm and personal. Include subject lines.`,
  general: VANIR_SYSTEM_PROMPT
};
var ALL_TASK_TYPES = [
  {
    id: "content_writer",
    name: "Content Writer",
    nameAr: "\u0643\u0627\u062A\u0628 \u0627\u0644\u0645\u062D\u062A\u0648\u0649",
    description: "Write compelling travel content, blog posts, and descriptions",
    descriptionAr: "\u0643\u062A\u0627\u0628\u0629 \u0645\u062D\u062A\u0648\u0649 \u0633\u064A\u0627\u062D\u064A \u062C\u0630\u0627\u0628 \u0648\u0645\u0642\u0627\u0644\u0627\u062A \u0648\u0648\u0635\u0641 \u0627\u0644\u0631\u062D\u0644\u0627\u062A",
    icon: "pen-tool",
    color: "blue",
    category: "content",
    suggestedPrompts: [
      "Write a luxury blog post about Luxor temples",
      "Create a destination description for Sharm El Sheikh",
      "Write an email newsletter about summer offers"
    ]
  },
  {
    id: "seo_analyst",
    name: "SEO Analyst",
    nameAr: "\u0645\u062D\u0644\u0644 SEO",
    description: "Analyze and optimize content for search engines",
    descriptionAr: "\u062A\u062D\u0644\u064A\u0644 \u0648\u062A\u062D\u0633\u064A\u0646 \u0627\u0644\u0645\u062D\u062A\u0648\u0649 \u0644\u0645\u062D\u0631\u0643\u0627\u062A \u0627\u0644\u0628\u062D\u062B",
    icon: "search",
    color: "green",
    category: "marketing",
    suggestedPrompts: [
      "Audit the SEO for our Egypt tours page",
      "Suggest keywords for luxury Nile cruise packages",
      "Analyze meta tags for our homepage"
    ]
  },
  {
    id: "offer_generator",
    name: "Offer Generator",
    nameAr: "\u0645\u0648\u0644\u062F \u0627\u0644\u0639\u0631\u0648\u0636",
    description: "Design irresistible travel packages and offers",
    descriptionAr: "\u062A\u0635\u0645\u064A\u0645 \u0639\u0631\u0648\u0636 \u0648\u0628\u0627\u0642\u0627\u062A \u0633\u0641\u0631 \u0644\u0627 \u062A\u0642\u0627\u0648\u0645",
    icon: "gift",
    color: "gold",
    category: "operations",
    suggestedPrompts: [
      "Create a 7-day luxury Egypt tour package",
      "Design a honeymoon package for Red Sea resorts",
      "Generate a group discount offer for Aswan"
    ]
  },
  {
    id: "data_analyst",
    name: "Data Analyst",
    nameAr: "\u0645\u062D\u0644\u0644 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A",
    description: "Analyze business metrics and provide insights",
    descriptionAr: "\u062A\u062D\u0644\u064A\u0644 \u0645\u0642\u0627\u064A\u064A\u0633 \u0627\u0644\u0623\u0639\u0645\u0627\u0644 \u0648\u062A\u0642\u062F\u064A\u0645 \u0631\u0624\u0649",
    icon: "bar-chart",
    color: "purple",
    category: "analysis",
    suggestedPrompts: [
      "Analyze booking trends for Q1 2026",
      "Suggest strategies to increase conversion rates",
      "Create a revenue forecast for summer season"
    ]
  },
  {
    id: "customer_support",
    name: "Customer Support",
    nameAr: "\u062F\u0639\u0645 \u0627\u0644\u0639\u0645\u0644\u0627\u0621",
    description: "Draft professional customer responses",
    descriptionAr: "\u0635\u064A\u0627\u063A\u0629 \u0631\u062F\u0648\u062F \u0627\u062D\u062A\u0631\u0627\u0641\u064A\u0629 \u0644\u0644\u0639\u0645\u0644\u0627\u0621",
    icon: "headphones",
    color: "teal",
    category: "operations",
    suggestedPrompts: [
      "Draft a response to a booking cancellation request",
      "Write a follow-up email after a completed trip",
      "Handle a complaint about hotel quality"
    ]
  },
  {
    id: "translator",
    name: "Translator",
    nameAr: "\u0627\u0644\u0645\u062A\u0631\u062C\u0645",
    description: "Translate content between Arabic and English",
    descriptionAr: "\u062A\u0631\u062C\u0645\u0629 \u0627\u0644\u0645\u062D\u062A\u0648\u0649 \u0628\u064A\u0646 \u0627\u0644\u0639\u0631\u0628\u064A\u0629 \u0648\u0627\u0644\u0625\u0646\u062C\u0644\u064A\u0632\u064A\u0629",
    icon: "languages",
    color: "orange",
    category: "content",
    suggestedPrompts: [
      "Translate our about page to Arabic",
      "Translate this offer description to English",
      "Localize marketing copy for Arabic audience"
    ]
  },
  {
    id: "social_media",
    name: "Social Media",
    nameAr: "\u0648\u0633\u0627\u0626\u0644 \u0627\u0644\u062A\u0648\u0627\u0635\u0644",
    description: "Create engaging social media content",
    descriptionAr: "\u0625\u0646\u0634\u0627\u0621 \u0645\u062D\u062A\u0648\u0649 \u062C\u0630\u0627\u0628 \u0644\u0648\u0633\u0627\u0626\u0644 \u0627\u0644\u062A\u0648\u0627\u0635\u0644 \u0627\u0644\u0627\u062C\u062A\u0645\u0627\u0639\u064A",
    icon: "share-2",
    color: "pink",
    category: "marketing",
    suggestedPrompts: [
      "Write 5 Instagram captions for pyramid photos",
      "Create a weekly content calendar for Facebook",
      "Draft a LinkedIn post about our new luxury service"
    ]
  },
  {
    id: "itinerary_planner",
    name: "Itinerary Planner",
    nameAr: "\u0645\u062E\u0637\u0637 \u0627\u0644\u0631\u062D\u0644\u0627\u062A",
    description: "Design detailed day-by-day luxury travel itineraries",
    descriptionAr: "\u062A\u0635\u0645\u064A\u0645 \u062C\u062F\u0627\u0648\u0644 \u0631\u062D\u0644\u0627\u062A \u0641\u0627\u062E\u0631\u0629 \u0645\u0641\u0635\u0644\u0629 \u064A\u0648\u0645\u0627\u064B \u0628\u064A\u0648\u0645",
    icon: "map-pin",
    color: "emerald",
    category: "operations",
    suggestedPrompts: [
      "Plan a 5-day luxury Cairo & Luxor itinerary",
      "Design a 10-day all-Egypt premium tour",
      "Create a 3-day Red Sea diving & relaxation itinerary"
    ]
  },
  {
    id: "review_responder",
    name: "Review Responder",
    nameAr: "\u0627\u0644\u0631\u062F \u0639\u0644\u0649 \u0627\u0644\u062A\u0642\u064A\u064A\u0645\u0627\u062A",
    description: "Craft thoughtful responses to guest reviews",
    descriptionAr: "\u0635\u064A\u0627\u063A\u0629 \u0631\u062F\u0648\u062F \u0645\u062F\u0631\u0648\u0633\u0629 \u0639\u0644\u0649 \u062A\u0642\u064A\u064A\u0645\u0627\u062A \u0627\u0644\u0636\u064A\u0648\u0641",
    icon: "star",
    color: "amber",
    category: "operations",
    suggestedPrompts: [
      "Respond to a 5-star review praising our Nile cruise",
      "Draft a professional response to a negative hotel review",
      "Write a thank-you response to a returning guest"
    ]
  },
  {
    id: "pricing_advisor",
    name: "Pricing Advisor",
    nameAr: "\u0645\u0633\u062A\u0634\u0627\u0631 \u0627\u0644\u062A\u0633\u0639\u064A\u0631",
    description: "Revenue management and pricing strategy analysis",
    descriptionAr: "\u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0625\u064A\u0631\u0627\u062F\u0627\u062A \u0648\u062A\u062D\u0644\u064A\u0644 \u0627\u0633\u062A\u0631\u0627\u062A\u064A\u062C\u064A\u0627\u062A \u0627\u0644\u062A\u0633\u0639\u064A\u0631",
    icon: "dollar-sign",
    color: "lime",
    category: "analysis",
    suggestedPrompts: [
      "Suggest pricing for a new premium Aswan package",
      "Analyze our pricing vs competitors for Nile cruises",
      "Create a seasonal pricing calendar for 2026"
    ]
  },
  {
    id: "brand_voice",
    name: "Brand Voice",
    nameAr: "\u0635\u0648\u062A \u0627\u0644\u0639\u0644\u0627\u0645\u0629",
    description: "Ensure content aligns with Vanir brand identity",
    descriptionAr: "\u0636\u0645\u0627\u0646 \u062A\u0648\u0627\u0641\u0642 \u0627\u0644\u0645\u062D\u062A\u0648\u0649 \u0645\u0639 \u0647\u0648\u064A\u0629 \u0639\u0644\u0627\u0645\u0629 \u0641\u0627\u0646\u064A\u0631",
    icon: "crown",
    color: "yellow",
    category: "content",
    suggestedPrompts: [
      "Review and refine this page copy for brand consistency",
      "Create 5 brand-aligned taglines for our summer campaign",
      "Write brand guidelines for social media posts"
    ]
  },
  {
    id: "competitor_analysis",
    name: "Competitor Analysis",
    nameAr: "\u062A\u062D\u0644\u064A\u0644 \u0627\u0644\u0645\u0646\u0627\u0641\u0633\u064A\u0646",
    description: "Competitive intelligence and market positioning",
    descriptionAr: "\u0627\u0644\u0627\u0633\u062A\u062E\u0628\u0627\u0631\u0627\u062A \u0627\u0644\u062A\u0646\u0627\u0641\u0633\u064A\u0629 \u0648\u062A\u062D\u062F\u064A\u062F \u0627\u0644\u0645\u0648\u0627\u0642\u0639 \u0641\u064A \u0627\u0644\u0633\u0648\u0642",
    icon: "target",
    color: "red",
    category: "analysis",
    suggestedPrompts: [
      "Compare our luxury Egypt tours with top 3 competitors",
      "Identify gaps in the luxury Nile cruise market",
      "SWOT analysis for Vanir Travel Group"
    ]
  },
  {
    id: "report_generator",
    name: "Report Generator",
    nameAr: "\u0645\u0648\u0644\u062F \u0627\u0644\u062A\u0642\u0627\u0631\u064A\u0631",
    description: "Create comprehensive business and performance reports",
    descriptionAr: "\u0625\u0646\u0634\u0627\u0621 \u062A\u0642\u0627\u0631\u064A\u0631 \u0623\u0639\u0645\u0627\u0644 \u0648\u0623\u062F\u0627\u0621 \u0634\u0627\u0645\u0644\u0629",
    icon: "file-text",
    color: "slate",
    category: "analysis",
    suggestedPrompts: [
      "Generate a monthly performance report template",
      "Create a marketing campaign analysis report",
      "Write a customer satisfaction summary report"
    ]
  },
  {
    id: "email_composer",
    name: "Email Composer",
    nameAr: "\u0645\u062D\u0631\u0631 \u0627\u0644\u0625\u064A\u0645\u064A\u0644\u0627\u062A",
    description: "Craft professional emails for all occasions",
    descriptionAr: "\u0635\u064A\u0627\u063A\u0629 \u0625\u064A\u0645\u064A\u0644\u0627\u062A \u0627\u062D\u062A\u0631\u0627\u0641\u064A\u0629 \u0644\u062C\u0645\u064A\u0639 \u0627\u0644\u0645\u0646\u0627\u0633\u0628\u0627\u062A",
    icon: "mail",
    color: "cyan",
    category: "content",
    suggestedPrompts: [
      "Write a welcome email for new VIP clients",
      "Draft a partnership proposal email to a luxury hotel",
      "Create a pre-trip preparation guide email"
    ]
  }
];
function buildMessageContent(text2, attachments) {
  if (!attachments || attachments.length === 0) return text2;
  const parts = [];
  if (text2) {
    parts.push({ type: "text", text: text2 });
  }
  for (const att of attachments) {
    if (att.mimeType.startsWith("image/")) {
      parts.push({
        type: "image_url",
        image_url: { url: att.url, detail: "auto" }
      });
    } else if (["application/pdf", "audio/mpeg", "audio/wav", "audio/mp4", "video/mp4"].includes(att.mimeType)) {
      parts.push({
        type: "file_url",
        file_url: { url: att.url, mime_type: att.mimeType }
      });
    } else {
      parts.push({
        type: "text",
        text: `[Attached file: ${att.url} (${att.mimeType})]`
      });
    }
  }
  return parts.length === 1 && parts[0].type === "text" ? text2 : parts;
}
var allTaskTypeIds = ALL_TASK_TYPES.map((t2) => t2.id);
var taskTypeEnum = z15.enum([
  "general",
  ...allTaskTypeIds
]);
var attachmentSchema = z15.object({
  url: z15.string().url(),
  mimeType: z15.string(),
  filename: z15.string().optional()
});
var aiCommandRouter = router({
  /**
   * Upload a file for AI chat (admin only)
   */
  uploadFile: adminProcedure.input(
    z15.object({
      fileData: z15.string(),
      // base64
      filename: z15.string(),
      mimeType: z15.string()
    })
  ).mutation(async ({ ctx, input }) => {
    const buffer = Buffer.from(input.fileData, "base64");
    const fileSize = buffer.length;
    if (fileSize > 10 * 1024 * 1024) {
      throw new Error("File size exceeds 10MB limit");
    }
    const ext = input.filename.split(".").pop() || "bin";
    const randomSuffix = nanoid4(8);
    const fileKey = `ai-command/${ctx.user.id}/${randomSuffix}.${ext}`;
    const { url } = await storagePut2(fileKey, buffer, input.mimeType);
    return {
      url,
      fileKey,
      filename: input.filename,
      mimeType: input.mimeType,
      fileSize
    };
  }),
  /**
   * Main AI chat - send a message with optional file attachments
   */
  chat: adminProcedure.input(
    z15.object({
      messages: z15.array(
        z15.object({
          role: z15.enum(["system", "user", "assistant"]),
          content: z15.string(),
          attachments: z15.array(attachmentSchema).optional()
        })
      ),
      taskType: taskTypeEnum.default("general")
    })
  ).mutation(async ({ input }) => {
    const systemPrompt = TASK_PROMPTS[input.taskType] || TASK_PROMPTS.general;
    const llmMessages = [
      { role: "system", content: systemPrompt },
      ...input.messages.map((m) => ({
        role: m.role,
        content: buildMessageContent(m.content, m.attachments)
      }))
    ];
    const result = await invokeLLM({ messages: llmMessages });
    const content = result.choices?.[0]?.message?.content;
    const responseText = typeof content === "string" ? content : Array.isArray(content) ? content.filter((c) => c.type === "text").map((c) => c.text).join("\n") : "No response generated.";
    return {
      response: responseText,
      usage: result.usage || null,
      model: result.model || "unknown"
    };
  }),
  /**
   * Quick task execution - one-shot tasks with structured output
   * Now supports file attachments
   */
  executeTask: adminProcedure.input(
    z15.object({
      taskType: z15.enum(allTaskTypeIds),
      prompt: z15.string().min(1),
      context: z15.string().optional(),
      language: z15.enum(["ar", "en", "auto"]).default("auto"),
      attachments: z15.array(attachmentSchema).optional()
    })
  ).mutation(async ({ input }) => {
    const systemPrompt = TASK_PROMPTS[input.taskType];
    let userPrompt = input.prompt;
    if (input.context) {
      userPrompt += `

Additional context:
${input.context}`;
    }
    if (input.language !== "auto") {
      userPrompt += `

Please respond in ${input.language === "ar" ? "Arabic" : "English"}.`;
    }
    const messageContent = buildMessageContent(userPrompt, input.attachments);
    const result = await invokeLLM({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: messageContent }
      ]
    });
    const content = result.choices?.[0]?.message?.content;
    const responseText = typeof content === "string" ? content : Array.isArray(content) ? content.filter((c) => c.type === "text").map((c) => c.text).join("\n") : "No response generated.";
    return {
      result: responseText,
      taskType: input.taskType,
      usage: result.usage || null,
      model: result.model || "unknown",
      executedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
  }),
  /**
   * Get available task types and their descriptions
   */
  getTaskTypes: adminProcedure.query(() => {
    return ALL_TASK_TYPES;
  })
});

// server/routers/siteSettings.ts
import { z as z16 } from "zod";
import { eq as eq8, and as and3 } from "drizzle-orm";
var siteSettingsRouter = router({
  /**
   * Get theme settings (public - no auth required for visitors)
   */
  getTheme: publicProcedure.query(async () => {
    const db2 = await getDb();
    if (!db2) return null;
    const results = await db2.select().from(siteSettings).where(eq8(siteSettings.category, "theme"));
    if (!results.length) return null;
    const settings = {};
    for (const row of results) {
      settings[row.settingKey] = row.settingValue ?? "";
    }
    return settings;
  }),
  /**
   * Get a single setting by category + key
   */
  get: protectedProcedure.input(z16.object({
    category: z16.string(),
    key: z16.string()
  })).query(async ({ input }) => {
    const db2 = await getDb();
    if (!db2) return null;
    const [result] = await db2.select().from(siteSettings).where(
      and3(
        eq8(siteSettings.category, input.category),
        eq8(siteSettings.settingKey, input.key)
      )
    ).limit(1);
    return result?.settingValue ?? null;
  }),
  /**
   * Get all settings for a category
   */
  getByCategory: protectedProcedure.input(z16.object({
    category: z16.string()
  })).query(async ({ input }) => {
    const db2 = await getDb();
    if (!db2) return {};
    const results = await db2.select().from(siteSettings).where(eq8(siteSettings.category, input.category));
    const settings = {};
    for (const row of results) {
      settings[row.settingKey] = row.settingValue ?? "";
    }
    return settings;
  }),
  /**
   * Get all settings across all categories
   */
  getAll: protectedProcedure.query(async () => {
    const db2 = await getDb();
    if (!db2) return {};
    const results = await db2.select().from(siteSettings);
    const grouped = {};
    for (const row of results) {
      if (!grouped[row.category]) grouped[row.category] = {};
      grouped[row.category][row.settingKey] = row.settingValue ?? "";
    }
    return grouped;
  }),
  /**
   * Set a single setting (upsert)
   */
  set: protectedProcedure.input(z16.object({
    category: z16.string(),
    key: z16.string(),
    value: z16.string()
  })).mutation(async ({ input, ctx }) => {
    const db2 = await getDb();
    if (!db2) throw new Error("Database not available");
    const [existing] = await db2.select().from(siteSettings).where(
      and3(
        eq8(siteSettings.category, input.category),
        eq8(siteSettings.settingKey, input.key)
      )
    ).limit(1);
    if (existing) {
      await db2.update(siteSettings).set({ settingValue: input.value, updatedBy: ctx.user.id }).where(eq8(siteSettings.id, existing.id));
    } else {
      await db2.insert(siteSettings).values({
        category: input.category,
        settingKey: input.key,
        settingValue: input.value,
        updatedBy: ctx.user.id
      });
    }
    return { success: true };
  }),
  /**
   * Set multiple settings at once (batch upsert)
   */
  setMany: protectedProcedure.input(z16.object({
    category: z16.string(),
    settings: z16.record(z16.string(), z16.string())
  })).mutation(async ({ input, ctx }) => {
    const db2 = await getDb();
    if (!db2) throw new Error("Database not available");
    const entries = Object.entries(input.settings);
    for (const [key, value] of entries) {
      const [existing] = await db2.select().from(siteSettings).where(
        and3(
          eq8(siteSettings.category, input.category),
          eq8(siteSettings.settingKey, key)
        )
      ).limit(1);
      if (existing) {
        await db2.update(siteSettings).set({ settingValue: value, updatedBy: ctx.user.id }).where(eq8(siteSettings.id, existing.id));
      } else {
        await db2.insert(siteSettings).values({
          category: input.category,
          settingKey: key,
          settingValue: value,
          updatedBy: ctx.user.id
        });
      }
    }
    return { success: true, count: entries.length };
  }),
  /**
   * Delete a setting
   */
  delete: protectedProcedure.input(z16.object({
    category: z16.string(),
    key: z16.string()
  })).mutation(async ({ input }) => {
    const db2 = await getDb();
    if (!db2) throw new Error("Database not available");
    await db2.delete(siteSettings).where(
      and3(
        eq8(siteSettings.category, input.category),
        eq8(siteSettings.settingKey, input.key)
      )
    );
    return { success: true };
  })
});

// server/routers/backup.ts
import { z as z17 } from "zod";
import { sql as sql4 } from "drizzle-orm";
var TABLE_MAP = {
  destinations: { table: destinations, label: "Destinations" },
  offers: { table: offers, label: "Offers & Packages" },
  blog: { table: blogPosts, label: "Blog Articles" },
  bookings: { table: bookings, label: "Bookings" },
  users: { table: users, label: "Users" },
  gallery: { table: galleryItems, label: "Gallery" },
  reviews: { table: reviews, label: "Reviews" },
  settings: { table: siteSettings, label: "Settings" },
  contacts: { table: contactMessages, label: "Contact Messages" },
  marketing: { table: marketingContent, label: "Marketing Content" }
};
var backupRouter = router({
  /**
   * Get record counts for all exportable tables
   */
  getExportSections: protectedProcedure.query(async () => {
    const db2 = await getDb();
    if (!db2) return [];
    const sections = [];
    for (const [id, { table, label }] of Object.entries(TABLE_MAP)) {
      try {
        const [result] = await db2.select({ count: sql4`count(*)` }).from(table);
        sections.push({
          id,
          label,
          recordCount: Number(result?.count ?? 0)
        });
      } catch {
        sections.push({ id, label, recordCount: 0 });
      }
    }
    return sections;
  }),
  /**
   * Export selected sections as JSON data
   */
  exportData: protectedProcedure.input(z17.object({
    sections: z17.array(z17.string()),
    format: z17.enum(["json", "csv"]).default("json")
  })).mutation(async ({ input }) => {
    const db2 = await getDb();
    if (!db2) throw new Error("Database not available");
    const exportResult = {};
    for (const sectionId of input.sections) {
      const mapping = TABLE_MAP[sectionId];
      if (!mapping) continue;
      try {
        const rows = await db2.select().from(mapping.table);
        exportResult[sectionId] = {
          label: mapping.label,
          recordCount: rows.length,
          data: rows
        };
      } catch {
        exportResult[sectionId] = {
          label: mapping.label,
          recordCount: 0,
          data: []
        };
      }
    }
    return {
      exportedAt: (/* @__PURE__ */ new Date()).toISOString(),
      format: input.format,
      totalRecords: Object.values(exportResult).reduce((sum, s) => sum + s.recordCount, 0),
      sections: exportResult
    };
  }),
  /**
   * Get backup settings from DB
   */
  getSettings: protectedProcedure.query(async () => {
    const db2 = await getDb();
    if (!db2) return {};
    const results = await db2.select().from(siteSettings).where(
      sql4`${siteSettings.category} = 'backup'`
    );
    const settings = {};
    for (const row of results) {
      settings[row.settingKey] = row.settingValue ?? "";
    }
    return settings;
  }),
  /**
   * Restore data from backup file
   */
  restoreData: protectedProcedure.input(z17.object({
    sections: z17.record(z17.string(), z17.object({
      label: z17.string(),
      recordCount: z17.number(),
      data: z17.array(z17.any())
    })),
    mode: z17.enum(["merge", "replace"]).default("merge")
  })).mutation(async ({ input }) => {
    const db2 = await getDb();
    if (!db2) throw new Error("Database not available");
    const results = {};
    for (const [sectionId, section] of Object.entries(input.sections)) {
      const mapping = TABLE_MAP[sectionId];
      if (!mapping || !section.data || section.data.length === 0) {
        results[sectionId] = { restored: 0, skipped: 0, errors: 0 };
        continue;
      }
      let restored = 0;
      let skipped = 0;
      let errors = 0;
      try {
        if (input.mode === "replace") {
          await db2.delete(mapping.table);
        }
        for (const row of section.data) {
          try {
            const cleanRow = { ...row };
            delete cleanRow.id;
            await db2.insert(mapping.table).values(cleanRow);
            restored++;
          } catch (e) {
            if (e?.code === "ER_DUP_ENTRY" || e?.message?.includes("Duplicate")) {
              skipped++;
            } else {
              errors++;
            }
          }
        }
      } catch {
        errors = section.data.length;
      }
      results[sectionId] = { restored, skipped, errors };
    }
    const totalRestored = Object.values(results).reduce((s, r) => s + r.restored, 0);
    const totalSkipped = Object.values(results).reduce((s, r) => s + r.skipped, 0);
    const totalErrors = Object.values(results).reduce((s, r) => s + r.errors, 0);
    return {
      success: true,
      restoredAt: (/* @__PURE__ */ new Date()).toISOString(),
      totalRestored,
      totalSkipped,
      totalErrors,
      details: results
    };
  }),
  /**
   * Save backup settings
   */
  saveSettings: protectedProcedure.input(z17.object({
    settings: z17.record(z17.string(), z17.string())
  })).mutation(async ({ input, ctx }) => {
    const db2 = await getDb();
    if (!db2) throw new Error("Database not available");
    for (const [key, value] of Object.entries(input.settings)) {
      const existing = await db2.select().from(siteSettings).where(
        sql4`${siteSettings.category} = 'backup' AND ${siteSettings.settingKey} = ${key}`
      ).limit(1);
      if (existing.length > 0) {
        await db2.update(siteSettings).set({ settingValue: value, updatedBy: ctx.user.id }).where(sql4`${siteSettings.id} = ${existing[0].id}`);
      } else {
        await db2.insert(siteSettings).values({
          category: "backup",
          settingKey: key,
          settingValue: value,
          updatedBy: ctx.user.id
        });
      }
    }
    return { success: true };
  })
});

// server/routers/dataImport.ts
import { z as z18 } from "zod";
var IMPORT_TABLES = [
  {
    id: "destinations",
    label: "Destinations",
    description: "Travel destinations and tour packages",
    table: destinations,
    fields: [
      { key: "name", label: "Name", type: "string", required: true },
      { key: "location", label: "Location", type: "string", required: true },
      { key: "description", label: "Description", type: "string" },
      { key: "pricePerPerson", label: "Price Per Person", type: "decimal" },
      { key: "rating", label: "Rating", type: "decimal", hint: "0\u20135" },
      { key: "imageUrl", label: "Image URL", type: "string" },
      { key: "highlights", label: "Highlights", type: "string" },
      { key: "bestTimeToVisit", label: "Best Time To Visit", type: "string" },
      { key: "duration", label: "Duration", type: "string" },
      { key: "difficulty", label: "Difficulty", type: "enum", options: ["easy", "moderate", "hard"] },
      { key: "groupSize", label: "Group Size", type: "string" },
      { key: "inclusions", label: "Inclusions", type: "string" },
      { key: "exclusions", label: "Exclusions", type: "string" },
      { key: "isActive", label: "Status", type: "enum", options: ["active", "inactive"] }
    ]
  },
  {
    id: "offers",
    label: "Offers & Packages",
    description: "Promotional offers and discounts",
    table: offers,
    fields: [
      { key: "title", label: "Title", type: "string", required: true },
      { key: "description", label: "Description", type: "string" },
      { key: "discountType", label: "Discount Type", type: "enum", required: true, options: ["percentage", "fixed"] },
      { key: "discountValue", label: "Discount Value", type: "decimal", required: true },
      { key: "promoCode", label: "Promo Code", type: "string" },
      { key: "startDate", label: "Start Date", type: "date", required: true },
      { key: "endDate", label: "End Date", type: "date", required: true },
      { key: "category", label: "Category", type: "string" },
      { key: "destination", label: "Destination", type: "string" },
      { key: "imageUrl", label: "Image URL", type: "string" },
      { key: "totalSpots", label: "Total Spots", type: "number" },
      { key: "isActive", label: "Status", type: "enum", options: ["active", "inactive", "expired"] },
      { key: "badgeText", label: "Badge Text", type: "string" }
    ]
  },
  {
    id: "blog",
    label: "Blog Articles",
    description: "Blog posts and articles",
    table: blogPosts,
    fields: [
      { key: "slug", label: "Slug", type: "string", required: true, hint: "Unique URL slug" },
      { key: "title", label: "Title", type: "string", required: true },
      { key: "excerpt", label: "Excerpt", type: "string", required: true },
      { key: "content", label: "Content", type: "string", required: true },
      { key: "metaTitle", label: "Meta Title", type: "string" },
      { key: "metaDescription", label: "Meta Description", type: "string" },
      { key: "metaKeywords", label: "Meta Keywords", type: "string" },
      { key: "coverImageUrl", label: "Cover Image URL", type: "string" },
      { key: "category", label: "Category", type: "string" },
      { key: "authorName", label: "Author Name", type: "string" },
      { key: "status", label: "Status", type: "enum", options: ["draft", "published", "archived"] }
    ]
  },
  {
    id: "reviews",
    label: "Reviews",
    description: "Customer reviews and ratings",
    table: reviews,
    fields: [
      { key: "guestName", label: "Guest Name", type: "string" },
      { key: "tripName", label: "Trip Name", type: "string", required: true },
      { key: "destination", label: "Destination", type: "string" },
      { key: "rating", label: "Rating", type: "number", required: true, hint: "1\u20135" },
      { key: "title", label: "Title", type: "string" },
      { key: "content", label: "Content", type: "string", required: true },
      { key: "isApproved", label: "Moderation", type: "enum", options: ["pending", "approved", "rejected"] }
    ]
  },
  {
    id: "gallery",
    label: "Gallery",
    description: "Gallery images",
    table: galleryItems,
    fields: [
      { key: "imageUrl", label: "Image URL", type: "string", required: true },
      { key: "title", label: "Title", type: "string", required: true },
      { key: "description", label: "Description", type: "string" },
      { key: "category", label: "Category", type: "string", required: true },
      { key: "location", label: "Location", type: "string" },
      { key: "featured", label: "Featured", type: "enum", options: ["no", "yes"] },
      { key: "aspect", label: "Aspect", type: "enum", options: ["landscape", "portrait", "square"] },
      { key: "isVisible", label: "Visibility", type: "enum", options: ["visible", "hidden"] }
    ]
  },
  {
    id: "contacts",
    label: "Contact Messages",
    description: "Contact form submissions / leads",
    table: contactMessages,
    fields: [
      { key: "name", label: "Name", type: "string", required: true },
      { key: "email", label: "Email", type: "string", required: true },
      { key: "phone", label: "Phone", type: "string" },
      { key: "subject", label: "Subject", type: "string" },
      { key: "message", label: "Message", type: "string", required: true },
      { key: "status", label: "Status", type: "enum", options: ["new", "read", "replied", "archived"] }
    ]
  }
];
function getTable(id) {
  return IMPORT_TABLES.find((t2) => t2.id === id);
}
function coerceValue(field, raw) {
  if (raw === null || raw === void 0 || typeof raw === "string" && raw.trim() === "") {
    if (field.required) return { ok: false, error: `${field.label} is required` };
    return { ok: true, value: void 0 };
  }
  const str = String(raw).trim();
  switch (field.type) {
    case "string":
      return { ok: true, value: str };
    case "number": {
      const n = Number(str.replace(/,/g, ""));
      if (!Number.isFinite(n)) return { ok: false, error: `${field.label} "${str}" is not a number` };
      return { ok: true, value: Math.trunc(n) };
    }
    case "decimal": {
      const n = Number(str.replace(/[$,]/g, ""));
      if (!Number.isFinite(n)) return { ok: false, error: `${field.label} "${str}" is not a number` };
      return { ok: true, value: String(n) };
    }
    case "date": {
      let ms;
      if (/^\d{10}$/.test(str)) ms = Number(str) * 1e3;
      else if (/^\d{13}$/.test(str)) ms = Number(str);
      else {
        const parsed = Date.parse(str);
        if (Number.isNaN(parsed)) return { ok: false, error: `${field.label} "${str}" is not a valid date` };
        ms = parsed;
      }
      return { ok: true, value: ms };
    }
    case "boolean": {
      const truthy = ["true", "1", "yes", "y", "active", "on"];
      return { ok: true, value: truthy.includes(str.toLowerCase()) };
    }
    case "enum": {
      const opts = field.options ?? [];
      const match = opts.find((o) => o.toLowerCase() === str.toLowerCase());
      if (!match) {
        return { ok: false, error: `${field.label} "${str}" must be one of: ${opts.join(", ")}` };
      }
      return { ok: true, value: match };
    }
    default:
      return { ok: true, value: str };
  }
}
var dataImportRouter = router({
  /**
   * Return the list of importable tables with their field definitions so the
   * client can render a column-mapping UI.
   */
  getImportableTables: protectedProcedure.query(() => {
    return IMPORT_TABLES.map((t2) => ({
      id: t2.id,
      label: t2.label,
      description: t2.description,
      fields: t2.fields.map((f) => ({
        key: f.key,
        label: f.label,
        type: f.type,
        required: !!f.required,
        options: f.options ?? null,
        hint: f.hint ?? null
      }))
    }));
  }),
  /**
   * Validate (dry run) a batch of mapped rows without writing to the DB.
   * Returns per-row errors so the admin can fix the source file first.
   */
  validateImport: protectedProcedure.input(z18.object({
    tableId: z18.string(),
    rows: z18.array(z18.record(z18.string(), z18.any()))
  })).mutation(({ input }) => {
    const target = getTable(input.tableId);
    if (!target) throw new Error(`Unknown import table: ${input.tableId}`);
    const rowErrors = [];
    input.rows.forEach((row, idx) => {
      const errors = [];
      for (const field of target.fields) {
        const result = coerceValue(field, row[field.key]);
        if (!result.ok) errors.push(result.error);
      }
      if (errors.length) rowErrors.push({ row: idx + 1, errors });
    });
    return {
      totalRows: input.rows.length,
      validRows: input.rows.length - rowErrors.length,
      invalidRows: rowErrors.length,
      rowErrors: rowErrors.slice(0, 100)
    };
  }),
  /**
   * Import mapped rows into the target table. Each row is coerced/validated;
   * invalid rows are skipped (with reasons) and valid rows inserted.
   */
  importRecords: protectedProcedure.input(z18.object({
    tableId: z18.string(),
    rows: z18.array(z18.record(z18.string(), z18.any())),
    skipInvalid: z18.boolean().default(true)
  })).mutation(async ({ input }) => {
    const db2 = await getDb();
    if (!db2) throw new Error("Database not available");
    const target = getTable(input.tableId);
    if (!target) throw new Error(`Unknown import table: ${input.tableId}`);
    let imported = 0;
    let skipped = 0;
    let failed = 0;
    const errors = [];
    for (let i = 0; i < input.rows.length; i++) {
      const row = input.rows[i];
      const record = {};
      const rowIssues = [];
      for (const field of target.fields) {
        const result = coerceValue(field, row[field.key]);
        if (!result.ok) {
          rowIssues.push(result.error);
        } else if (result.value !== void 0) {
          record[field.key] = result.value;
        }
      }
      if (rowIssues.length) {
        if (input.skipInvalid) {
          skipped++;
          errors.push({ row: i + 1, message: rowIssues.join("; ") });
          continue;
        } else {
          failed++;
          errors.push({ row: i + 1, message: rowIssues.join("; ") });
          continue;
        }
      }
      try {
        await db2.insert(target.table).values(record);
        imported++;
      } catch (e) {
        if (e?.code === "ER_DUP_ENTRY" || e?.message?.toLowerCase().includes("duplicate")) {
          skipped++;
          errors.push({ row: i + 1, message: "Duplicate record skipped" });
        } else {
          failed++;
          errors.push({ row: i + 1, message: e?.message || "Insert failed" });
        }
      }
    }
    return {
      success: failed === 0,
      importedAt: (/* @__PURE__ */ new Date()).toISOString(),
      tableId: input.tableId,
      totalRows: input.rows.length,
      imported,
      skipped,
      failed,
      errors: errors.slice(0, 100)
    };
  })
});

// server/routers.ts
import { z as z19 } from "zod";
import { TRPCError as TRPCError6 } from "@trpc/server";
import { createHash, timingSafeEqual } from "crypto";
var appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true
      };
    }),
    login: publicProcedure.input(z19.object({ email: z19.string().email(), password: z19.string().min(1) })).mutation(async ({ ctx, input }) => {
      try {
        const adminEmail = ENV.adminEmail;
        const adminPasswordHash = ENV.adminPasswordHash;
        if (!adminEmail || !adminPasswordHash) {
          throw new TRPCError6({
            code: "PRECONDITION_FAILED",
            message: "Admin login is not configured on this server. Set ADMIN_EMAIL and ADMIN_PASSWORD_HASH environment variables."
          });
        }
        if (input.email.toLowerCase() !== adminEmail.toLowerCase()) {
          throw new TRPCError6({ code: "UNAUTHORIZED", message: "Invalid email or password." });
        }
        const storedHash = adminPasswordHash.trim();
        const isHashFormat = /^[a-f0-9]{64}$/.test(storedHash.toLowerCase());
        let match = false;
        if (isHashFormat) {
          const submittedHash = createHash("sha256").update(input.password).digest("hex");
          try {
            match = timingSafeEqual(
              Buffer.from(submittedHash, "utf8"),
              Buffer.from(storedHash.toLowerCase(), "utf8")
            );
          } catch {
            match = false;
          }
        } else {
          try {
            match = timingSafeEqual(
              Buffer.from(input.password, "utf8"),
              Buffer.from(storedHash, "utf8")
            );
          } catch {
            match = false;
          }
        }
        if (!match) {
          throw new TRPCError6({ code: "UNAUTHORIZED", message: "Invalid email or password." });
        }
        const openId = `admin:${adminEmail.toLowerCase()}`;
        await upsertUser({
          openId,
          email: adminEmail,
          name: "Admin",
          loginMethod: "password",
          role: "admin",
          lastSignedIn: /* @__PURE__ */ new Date()
        }).catch((err) => {
          console.warn("[Auth] Could not persist admin user to DB (non-fatal):", err);
        });
        const sessionToken = await sdk.createSessionToken(openId, {
          expiresInMs: ONE_YEAR_MS,
          name: "Admin"
        });
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, {
          ...cookieOptions,
          maxAge: ONE_YEAR_MS
        });
        return { success: true };
      } catch (err) {
        if (err instanceof TRPCError6) throw err;
        throw new TRPCError6({
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred during login. Please try again."
        });
      }
    })
  }),
  // Feature routers
  bookings: bookingsRouter,
  reviews: reviewsRouter,
  offers: offersRouter,
  contact: contactRouter,
  uploads: uploadsRouter,
  gallery: galleryRouter,
  aiStudio: aiStudioRouter,
  users: usersRouter,
  blog: blogRouter,
  marketing: marketingRouter,
  // Admin routers
  admin: router({
    destinations: adminDestinationsRouter,
    offers: adminOffersRouter,
    blog: adminBlogRouter
  }),
  // AI Command Center
  aiCommand: aiCommandRouter,
  // Site Settings (real DB-backed)
  siteSettings: siteSettingsRouter,
  // Backup & Export (real DB export)
  backup: backupRouter,
  // Data Import (import records from external tools via CSV/JSON)
  dataImport: dataImportRouter
});

// server/_core/context.ts
import { getAuth as getAuth2 } from "firebase-admin/auth";
function getBearerToken(req) {
  const auth = req.headers["authorization"];
  if (!auth || Array.isArray(auth)) return null;
  const match = auth.match(/^Bearer\s+(.+)$/i);
  return match ? match[1] : null;
}
async function createContext(opts) {
  let user = null;
  const bearer = getBearerToken(opts.req);
  if (bearer) {
    try {
      const decoded = await getAuth2().verifyIdToken(bearer);
      const openId = `firebase:${decoded.uid}`;
      const name = decoded.name || (decoded.email ? decoded.email.split("@")[0] : null) || null;
      await upsertUser({
        openId,
        name,
        email: decoded.email ?? null,
        loginMethod: "firebase",
        lastSignedIn: /* @__PURE__ */ new Date()
      }).catch(() => {
      });
      const found = await getUserByOpenId(openId);
      if (found) user = found;
    } catch {
    }
  }
  if (!user) {
    try {
      user = await sdk.authenticateRequest(opts.req);
    } catch {
      user = null;
    }
  }
  if (user?.openId && !user.openId.startsWith("firebase:") && !user.openId.startsWith("admin:")) {
    const fresh = await getUserByOpenId(user.openId);
    if (fresh) user = fresh;
  }
  return {
    req: opts.req,
    res: opts.res,
    user,
    contextData: {
      role: user?.role ?? null,
      userId: user?.openId ?? null,
      email: user?.email ?? null
    }
  };
}

// server/_core/vite.ts
import express from "express";
import fs3 from "fs";
import { nanoid as nanoid5 } from "nanoid";
import path4 from "path";
var DIRNAME2 = typeof __dirname !== "undefined" ? __dirname : new URL(".", import.meta.url).pathname;
async function setupVite(app, server) {
  const { createServer: createViteServer } = await import("vite");
  const viteConfig = (await Promise.resolve().then(() => (init_vite_config(), vite_config_exports))).default;
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    server: serverOptions,
    appType: "custom"
  });
  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path4.resolve(DIRNAME2, "../..", "client", "index.html");
      let template = await fs3.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid5()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app) {
  const distPath = process.env.NODE_ENV === "development" ? path4.resolve(DIRNAME2, "../..", "dist", "public") : path4.resolve(DIRNAME2, "public");
  if (!fs3.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app.use(
    express.static(distPath, {
      setHeaders: (res, filePath) => {
        if (filePath.endsWith(".html")) {
          res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
          res.setHeader("Pragma", "no-cache");
          res.setHeader("Expires", "0");
        } else if (filePath.includes(`${path4.sep}assets${path4.sep}`)) {
          res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        }
      }
    })
  );
  app.use("*", (_req, res) => {
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    res.sendFile(path4.resolve(distPath, "index.html"));
  });
}

// server/_core/index.ts
var DIRNAME3 = typeof __dirname !== "undefined" ? __dirname : new URL(".", import.meta.url).pathname;
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}
async function findAvailablePort(startPort = 3e3) {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}
function createApp() {
  const app = express2();
  let allowedOrigins;
  if (process.env.NODE_ENV === "production") {
    const extra = (process.env.CORS_ORIGINS || "").split(",").map((s) => s.trim()).filter(Boolean);
    allowedOrigins = [
      "https://vanirgroup.com",
      "https://www.vanirgroup.com",
      ...extra
    ];
  } else {
    allowedOrigins = true;
  }
  app.use(cors({
    origin: allowedOrigins,
    credentials: true
  }));
  app.use((_req, res, next) => {
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
    next();
  });
  app.use(express2.json({ limit: "50mb" }));
  app.use(express2.urlencoded({ limit: "50mb", extended: true }));
  app.use("/uploads", express2.static(path5.resolve(DIRNAME3, "..", "public", "uploads")));
  registerStorageProxy(app);
  registerDownloadProxy(app);
  registerOAuthRoutes(app);
  registerFirebaseAuthRoutes(app);
  app.use(
    "/api/trpc",
    createExpressMiddleware({ router: appRouter, createContext })
  );
  return app;
}
async function startServer() {
  const app = createApp();
  const server = createServer(app);
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  if (process.env.VERCEL !== "1") {
    const preferredPort = parseInt(process.env.PORT || "3000");
    const port = await findAvailablePort(preferredPort);
    if (port !== preferredPort) {
      console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
    }
    server.listen(port, () => {
      console.log(`Server running on http://localhost:${port}/`);
    });
  }
  return app;
}
startServer().catch(console.error);
export {
  createApp,
  startServer
};
