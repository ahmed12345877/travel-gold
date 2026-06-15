/**
 * Data access layer — now backed entirely by Firestore.
 *
 * All admin tools use these helpers (or the generic firestore-db layer). The
 * function signatures are unchanged from the previous Postgres implementation,
 * so every router that imports them keeps working without edits.
 *
 * Types are still imported (type-only) from drizzle/schema for shape parity.
 *
 * The `users` collection is keyed by Firebase UID and managed by the auth layer
 * (sdk.ts / authExpressRouter.ts). It may not carry a numeric `id`, so the user
 * helpers below back-fill one lazily for admin UI compatibility.
 */
import type {
  InsertUser,
  InsertBooking,
  InsertReview,
  InsertOffer,
  InsertContactMessage,
  InsertFileUpload,
  InsertGalleryItem,
  InsertGalleryVideo,
  InsertAISubscription,
  InsertAICredit,
  InsertAIUsage,
  InsertAITransaction,
  AISubscription,
  AICredit,
  AIUsage,
  AITransaction,
  InsertBlogPost,
} from "../drizzle/schema";
import { ENV } from "./_core/env.js";
import { db as firestore } from "./_core/firebaseAdmin";
import {
  insert,
  getById,
  update,
  remove,
  list,
  count,
  findOne,
} from "./_core/firestore-db";

// Collection names. Gallery uses the same collections as the (already working)
// gallery router so there is a single source of truth.
const COL = {
  users: "users",
  bookings: "bookings",
  reviews: "reviews",
  offers: "offers",
  contactMessages: "contactMessages",
  fileUploads: "fileUploads",
  galleryItems: "gallery_items",
  galleryVideos: "gallery_videos",
  aiSubscriptions: "aiSubscriptions",
  aiCredits: "aiCredits",
  aiUsage: "aiUsage",
  aiTransactions: "aiTransactions",
  blogPosts: "blogPosts",
} as const;

/**
 * Kept for backward compatibility. The Firestore layer doesn't need a
 * connection handle, so this simply resolves to the Firestore instance.
 */
export async function getDb() {
  return firestore;
}

// ============ USER HELPERS ============
// Users live in a UID-keyed collection managed by auth. These helpers operate
// on that collection and ensure a numeric `id` exists for admin UI use.

async function ensureNumericUserId(
  docRef: FirebaseFirestore.DocumentReference,
  data: FirebaseFirestore.DocumentData,
): Promise<number> {
  if (typeof data.id === "number") return data.id;
  // Allocate a numeric id from the shared counter and persist it.
  const counterRef = firestore.collection("_counters").doc(COL.users);
  const id = await firestore.runTransaction(async (tx) => {
    const snap = await tx.get(counterRef);
    const current = (snap.exists ? (snap.data()?.value as number) : 0) || 0;
    const value = current + 1;
    tx.set(counterRef, { value }, { merge: true });
    return value;
  });
  await docRef.set({ id }, { merge: true });
  return id;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }
  // Find an existing user doc by openId.
  const existingSnap = await firestore
    .collection(COL.users)
    .where("openId", "==", user.openId)
    .limit(1)
    .get();

  const now = new Date();
  const data: Record<string, unknown> = { openId: user.openId, lastSignedIn: now };
  if (user.name !== undefined) data.name = user.name ?? null;
  if (user.email !== undefined) data.email = user.email ?? null;
  if (user.loginMethod !== undefined) data.loginMethod = user.loginMethod ?? null;
  if (user.lastSignedIn !== undefined) data.lastSignedIn = user.lastSignedIn;
  if (user.role !== undefined) data.role = user.role;
  else if (user.openId === ENV.ownerOpenId) data.role = "admin";

  if (!existingSnap.empty) {
    await existingSnap.docs[0].ref.set(data, { merge: true });
  } else {
    const counterRef = firestore.collection("_counters").doc(COL.users);
    const id = await firestore.runTransaction(async (tx) => {
      const snap = await tx.get(counterRef);
      const current = (snap.exists ? (snap.data()?.value as number) : 0) || 0;
      const value = current + 1;
      tx.set(counterRef, { value }, { merge: true });
      return value;
    });
    await firestore.collection(COL.users).doc(user.openId).set({
      ...data,
      id,
      role: data.role ?? "user",
      createdAt: now,
    });
  }
}

export async function getUserByOpenId(openId: string) {
  const snap = await firestore
    .collection(COL.users)
    .where("openId", "==", openId)
    .limit(1)
    .get();
  if (snap.empty) return undefined;
  const data = snap.data ? snap.docs[0].data() : snap.docs[0].data();
  await ensureNumericUserId(snap.docs[0].ref, data);
  return snap.docs[0].data();
}

// ============ BOOKING HELPERS ============

export async function createBooking(booking: InsertBooking) {
  return insert(COL.bookings, booking as Record<string, any>);
}

export async function getBookingById(id: number) {
  return getById(COL.bookings, id);
}

export async function getBookingByConfirmationCode(code: string) {
  return findOne(COL.bookings, [["confirmationCode", "==", code]]);
}

export async function getUserBookings(userId: number) {
  return list(COL.bookings, {
    where: [["userId", "==", userId]],
    orderBy: [["createdAt", "desc"]],
  });
}

export async function updateBookingStatus(
  id: number,
  status: "pending" | "confirmed" | "cancelled" | "completed",
) {
  await update(COL.bookings, id, { status });
  return getBookingById(id);
}

export async function updateBookingPaymentStatus(
  id: number,
  paymentStatus: "pending" | "paid" | "failed" | "refunded",
) {
  await update(COL.bookings, id, { paymentStatus });
  return getBookingById(id);
}

export async function getAllBookings(limit = 50, offset = 0) {
  return list(COL.bookings, {
    orderBy: [["createdAt", "desc"]],
    limit,
    offset,
  });
}

// ============ REVIEW HELPERS ============

export async function createReview(review: InsertReview) {
  return insert(COL.reviews, review as Record<string, any>);
}

export async function getApprovedReviews(limit = 50, offset = 0) {
  return list(COL.reviews, {
    where: [["isApproved", "==", "approved"]],
    orderBy: [["createdAt", "desc"]],
    limit,
    offset,
  });
}

export async function getAllReviews(limit = 50, offset = 0) {
  return list(COL.reviews, {
    orderBy: [["createdAt", "desc"]],
    limit,
    offset,
  });
}

export async function getReviewById(id: number) {
  return getById(COL.reviews, id);
}

export async function updateReviewApproval(
  id: number,
  isApproved: "pending" | "approved" | "rejected",
) {
  await update(COL.reviews, id, { isApproved });
  return getReviewById(id);
}

export async function addAdminReply(id: number, adminReply: string) {
  await update(COL.reviews, id, { adminReply, adminReplyAt: new Date() });
  return getReviewById(id);
}

export async function incrementHelpfulCount(id: number) {
  const review = (await getReviewById(id)) as any;
  const current = Number(review?.helpfulCount ?? 0);
  await update(COL.reviews, id, { helpfulCount: current + 1 });
  return getReviewById(id);
}

export async function getReviewStats() {
  const allApproved = (await list(COL.reviews, {
    where: [["isApproved", "==", "approved"]],
  })) as any[];
  const total = allApproved.length;
  if (total === 0) {
    return { total: 0, average: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };
  }
  const sum = allApproved.reduce((acc, r) => acc + (r.rating ?? 0), 0);
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  allApproved.forEach((r) => {
    if (r.rating >= 1 && r.rating <= 5) distribution[r.rating as 1 | 2 | 3 | 4 | 5]++;
  });
  return { total, average: Math.round((sum / total) * 10) / 10, distribution };
}

// ============ OFFER HELPERS ============

export async function createOffer(offer: InsertOffer) {
  return insert(COL.offers, offer as Record<string, any>);
}

export async function getActiveOffers() {
  // Firestore allows range filters on only one field, so filter by isActive in
  // the query and apply the date window in memory.
  const now = Date.now();
  const active = (await list(COL.offers, {
    where: [["isActive", "==", "active"]],
  })) as any[];
  return active
    .filter((o) => Number(o.startDate ?? 0) <= now && Number(o.endDate ?? 0) >= now)
    .sort((a, b) => Number(a.endDate ?? 0) - Number(b.endDate ?? 0));
}

export async function getAllOffers(limit = 50, offset = 0) {
  return list(COL.offers, {
    orderBy: [["createdAt", "desc"]],
    limit,
    offset,
  });
}

export async function getOfferByPromoCode(promoCode: string) {
  return findOne(COL.offers, [["promoCode", "==", promoCode]]);
}

export async function updateOffer(id: number, data: Partial<InsertOffer>) {
  return update(COL.offers, id, data as Record<string, any>);
}

// ============ CONTACT MESSAGE HELPERS ============

export async function createContactMessage(message: InsertContactMessage) {
  return insert(COL.contactMessages, message as Record<string, any>);
}

export async function getAllContactMessages(limit = 50, offset = 0) {
  return list(COL.contactMessages, {
    orderBy: [["createdAt", "desc"]],
    limit,
    offset,
  });
}

export async function updateContactMessageStatus(
  id: number,
  status: "new" | "read" | "replied" | "archived",
) {
  await update(COL.contactMessages, id, { status });
}

// ============ FILE UPLOAD HELPERS ============

export async function createFileUpload(file: InsertFileUpload) {
  return insert(COL.fileUploads, file as Record<string, any>);
}

export async function getUserFiles(userId: number) {
  return list(COL.fileUploads, {
    where: [["userId", "==", userId]],
    orderBy: [["createdAt", "desc"]],
  });
}

// ============ GALLERY ITEM HELPERS ============

export async function createGalleryItem(item: InsertGalleryItem) {
  return insert(COL.galleryItems, item as Record<string, any>);
}

export async function getVisibleGalleryItems() {
  const items = (await list(COL.galleryItems, {
    where: [["isVisible", "==", "visible"]],
  })) as any[];
  return items.sort(
    (a, b) =>
      Number(a.sortOrder ?? 0) - Number(b.sortOrder ?? 0) ||
      Number(b.createdAt ?? 0) - Number(a.createdAt ?? 0),
  );
}

export async function getAllGalleryItems(limit = 100, offset = 0) {
  const items = (await list(COL.galleryItems, {})) as any[];
  return items
    .sort((a, b) => Number(a.sortOrder ?? 0) - Number(b.sortOrder ?? 0))
    .slice(offset, offset + limit);
}

export async function getGalleryItemById(id: number) {
  return getById(COL.galleryItems, id);
}

export async function updateGalleryItem(id: number, data: Partial<InsertGalleryItem>) {
  return update(COL.galleryItems, id, data as Record<string, any>);
}

export async function deleteGalleryItem(id: number) {
  await remove(COL.galleryItems, id);
}

// ============ GALLERY VIDEO HELPERS ============

export async function createGalleryVideo(video: InsertGalleryVideo) {
  return insert(COL.galleryVideos, video as Record<string, any>);
}

export async function getVisibleGalleryVideos() {
  const videos = (await list(COL.galleryVideos, {
    where: [["isVisible", "==", "visible"]],
  })) as any[];
  return videos.sort(
    (a, b) =>
      Number(a.sortOrder ?? 0) - Number(b.sortOrder ?? 0) ||
      Number(b.createdAt ?? 0) - Number(a.createdAt ?? 0),
  );
}

export async function getAllGalleryVideos(limit = 50, offset = 0) {
  const videos = (await list(COL.galleryVideos, {})) as any[];
  return videos
    .sort((a, b) => Number(a.sortOrder ?? 0) - Number(b.sortOrder ?? 0))
    .slice(offset, offset + limit);
}

export async function getGalleryVideoById(id: number) {
  return getById(COL.galleryVideos, id);
}

export async function updateGalleryVideo(id: number, data: Partial<InsertGalleryVideo>) {
  return update(COL.galleryVideos, id, data as Record<string, any>);
}

export async function deleteGalleryVideo(id: number) {
  await remove(COL.galleryVideos, id);
}

// ============ AI STUDIO HELPERS ============

export async function getOrCreateAISubscription(userId: number): Promise<AISubscription> {
  const existing = (await findOne(COL.aiSubscriptions, [["userId", "==", userId]])) as
    | AISubscription
    | null;
  if (existing) return existing;
  const created = await insert(COL.aiSubscriptions, {
    userId,
    plan: "free",
    status: "active",
    startDate: Date.now(),
  } as unknown as Record<string, any>);
  return created as unknown as AISubscription;
}

export async function updateAISubscription(
  userId: number,
  plan: "free" | "pro" | "enterprise",
  stripeSubscriptionId?: string,
) {
  const sub = (await getOrCreateAISubscription(userId)) as any;
  await update(COL.aiSubscriptions, sub.id, {
    plan,
    status: "active",
    renewalDate: Date.now() + 30 * 24 * 60 * 60 * 1000,
    ...(stripeSubscriptionId && { stripeSubscriptionId }),
  });
  return getOrCreateAISubscription(userId);
}

export async function getOrCreateAICredits(userId: number): Promise<AICredit> {
  const existing = (await findOne(COL.aiCredits, [["userId", "==", userId]])) as
    | AICredit
    | null;
  if (existing) return existing;
  const created = await insert(COL.aiCredits, {
    userId,
    balance: "5",
    totalUsed: "0",
  } as unknown as Record<string, any>);
  return created as unknown as AICredit;
}

export async function addAICredits(
  userId: number,
  amount: number,
  reason: "purchase" | "monthly_allowance" | "bonus",
) {
  const credits = (await getOrCreateAICredits(userId)) as any;
  const newBalance = parseFloat(credits.balance.toString()) + amount;
  await update(COL.aiCredits, credits.id, { balance: newBalance.toString() });
  await insert(COL.aiTransactions, {
    userId,
    type:
      reason === "purchase"
        ? "purchase"
        : reason === "monthly_allowance"
        ? "monthly_allowance"
        : "bonus",
    amount: amount.toString(),
    status: "completed",
  } as unknown as Record<string, any>);
  return getOrCreateAICredits(userId);
}

export async function deductAICredits(userId: number, amount: number) {
  const credits = (await getOrCreateAICredits(userId)) as any;
  const currentBalance = parseFloat(credits.balance.toString());
  if (currentBalance < amount) {
    throw new Error("Insufficient credits");
  }
  const newBalance = currentBalance - amount;
  const newTotalUsed = parseFloat(credits.totalUsed.toString()) + amount;
  await update(COL.aiCredits, credits.id, {
    balance: newBalance.toString(),
    totalUsed: newTotalUsed.toString(),
  });
  return getOrCreateAICredits(userId);
}

export async function createAIUsage(usage: InsertAIUsage) {
  return insert(COL.aiUsage, usage as Record<string, any>);
}

export async function getUserAIUsage(userId: number, limit = 50, offset = 0) {
  return list(COL.aiUsage, {
    where: [["userId", "==", userId]],
    orderBy: [["createdAt", "desc"]],
    limit,
    offset,
  });
}

export async function updateAIUsageStatus(
  id: number,
  status: "pending" | "completed" | "failed",
  resultUrl?: string,
  errorMessage?: string,
) {
  return update(COL.aiUsage, id, {
    status,
    ...(resultUrl && { resultUrl }),
    ...(errorMessage && { errorMessage }),
  });
}

export async function getAIUsageStats(userId: number) {
  const usage = (await list(COL.aiUsage, {
    where: [["userId", "==", userId]],
  })) as any[];
  return {
    totalGenerations: usage.length,
    byType: {
      image: usage.filter((u) => u.type === "image").length,
      video: usage.filter((u) => u.type === "video").length,
      edit: usage.filter((u) => u.type === "edit").length,
    },
    totalCost: usage.reduce((sum, u) => sum + parseFloat((u.creditsCost ?? 0).toString()), 0),
  };
}

// ============ USER MANAGEMENT HELPERS (Admin) ============

/** Fetch all users, back-filling a numeric id for any doc that lacks one. */
async function listUsersRaw(): Promise<any[]> {
  const snap = await firestore.collection(COL.users).get();
  const out: any[] = [];
  for (const doc of snap.docs) {
    const data = doc.data();
    if (typeof data.id !== "number") {
      data.id = await ensureNumericUserId(doc.ref, data);
    }
    out.push(data);
  }
  return out;
}

export async function getAllUsers(limit = 50, offset = 0) {
  const all = await listUsersRaw();
  all.sort((a, b) => Number(b.createdAt ?? 0) - Number(a.createdAt ?? 0));
  return all.slice(offset, offset + limit);
}

export async function getUsersCount() {
  return count(COL.users);
}

export async function getUserById(id: number) {
  const all = await listUsersRaw();
  return all.find((u) => u.id === id) ?? null;
}

export async function updateUserRole(id: number, role: "user" | "admin") {
  const snap = await firestore.collection(COL.users).where("id", "==", id).limit(1).get();
  if (snap.empty) {
    // id may not be back-filled yet; resolve via full scan.
    const all = await listUsersRaw();
    const target = all.find((u) => u.id === id);
    if (!target) return null;
    await firestore.collection(COL.users).doc(target.openId).set({ role }, { merge: true });
    return getUserById(id);
  }
  await snap.docs[0].ref.set({ role }, { merge: true });
  return getUserById(id);
}

export async function searchUsers(query: string, limit = 20) {
  const q = query.toLowerCase();
  const all = await listUsersRaw();
  return all
    .filter(
      (u) =>
        (u.name ?? "").toLowerCase().includes(q) ||
        (u.email ?? "").toLowerCase().includes(q) ||
        (u.openId ?? "").toLowerCase().includes(q),
    )
    .sort((a, b) => Number(b.createdAt ?? 0) - Number(a.createdAt ?? 0))
    .slice(0, limit);
}

export async function getUserStats() {
  const all = await listUsersRaw();
  const now = Date.now();
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const todayMs = startOfToday.getTime();
  const toMs = (v: any) => (v ? new Date(v).getTime() : 0);
  return {
    total: all.length,
    admins: all.filter((u) => u.role === "admin").length,
    recentSignups: all.filter((u) => toMs(u.createdAt) >= thirtyDaysAgo).length,
    todaySignups: all.filter((u) => toMs(u.createdAt) >= todayMs).length,
  };
}

// ============ USER PROFILE UPDATE HELPER ============

export async function updateUserProfile(
  id: number,
  data: { name?: string; phone?: string | null; avatarUrl?: string | null },
) {
  const updateSet: Record<string, unknown> = {};
  if (data.name !== undefined) updateSet.name = data.name;
  if (data.phone !== undefined) updateSet.phone = data.phone;
  if (data.avatarUrl !== undefined) updateSet.avatarUrl = data.avatarUrl;
  if (Object.keys(updateSet).length === 0) {
    return getUserById(id);
  }
  const snap = await firestore.collection(COL.users).where("id", "==", id).limit(1).get();
  if (!snap.empty) {
    await snap.docs[0].ref.set(updateSet, { merge: true });
  }
  return getUserById(id);
}

// ============ BLOG POST HELPERS ============

export async function getPublishedBlogPosts(limit = 10, offset = 0) {
  return list(COL.blogPosts, {
    where: [["status", "==", "published"]],
    orderBy: [["publishedAt", "desc"]],
    limit,
    offset,
  });
}

export async function getBlogPostBySlug(slug: string) {
  return findOne(COL.blogPosts, [["slug", "==", slug]]);
}

export async function getBlogPostsByCategory(category: string, limit = 10, offset = 0) {
  const posts = (await list(COL.blogPosts, {
    where: [
      ["status", "==", "published"],
      ["category", "==", category],
    ],
    limit: limit + offset + 50,
  })) as any[];
  return posts
    .sort((a, b) => Number(b.publishedAt ?? 0) - Number(a.publishedAt ?? 0))
    .slice(offset, offset + limit);
}

export async function createBlogPost(post: InsertBlogPost) {
  return insert(COL.blogPosts, post as Record<string, any>);
}

export async function updateBlogPost(id: number, data: Partial<InsertBlogPost>) {
  return update(COL.blogPosts, id, data as Record<string, any>);
}

export async function getAllBlogPosts(limit = 50, offset = 0) {
  return list(COL.blogPosts, {
    orderBy: [["createdAt", "desc"]],
    limit,
    offset,
  });
}

export async function incrementBlogViewCount(id: number) {
  const post = (await getById(COL.blogPosts, id)) as any;
  if (!post) return;
  const current = Number(post.viewCount ?? 0);
  await update(COL.blogPosts, id, { viewCount: current + 1 });
}
