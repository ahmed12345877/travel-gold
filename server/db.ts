import { eq, desc, asc, and, gte, lte, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import {
  InsertUser, users,
  InsertBooking, bookings,
  InsertReview, reviews,
  InsertOffer, offers,
  InsertContactMessage, contactMessages,
  InsertFileUpload, fileUploads,
  InsertGalleryItem, galleryItems,
  InsertGalleryVideo, galleryVideos,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      const client = postgres(process.env.DATABASE_URL);
      _db = drizzle(client);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============ USER HELPERS ============

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onConflictDoUpdate({
      target: users.openId,
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ============ BOOKING HELPERS ============

export async function createBooking(booking: InsertBooking) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(bookings).values(booking).returning();
  return result[0];
}

export async function getBookingById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.select().from(bookings).where(eq(bookings.id, id)).limit(1);
  return result[0] ?? null;
}

export async function getBookingByConfirmationCode(code: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.select().from(bookings).where(eq(bookings.confirmationCode, code)).limit(1);
  return result[0] ?? null;
}

export async function getUserBookings(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.select().from(bookings).where(eq(bookings.userId, userId)).orderBy(desc(bookings.createdAt));
}

export async function updateBookingStatus(id: number, status: "pending" | "confirmed" | "cancelled" | "completed") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(bookings).set({ status }).where(eq(bookings.id, id));
  return getBookingById(id);
}

export async function updateBookingPaymentStatus(id: number, paymentStatus: "pending" | "paid" | "failed" | "refunded") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(bookings).set({ paymentStatus }).where(eq(bookings.id, id));
  return getBookingById(id);
}

export async function getAllBookings(limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.select().from(bookings).orderBy(desc(bookings.createdAt)).limit(limit).offset(offset);
}

// ============ REVIEW HELPERS ============

export async function createReview(review: InsertReview) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(reviews).values(review).returning();
  return result[0];
}

export async function getApprovedReviews(limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.select().from(reviews)
    .where(eq(reviews.isApproved, "approved"))
    .orderBy(desc(reviews.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function getAllReviews(limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.select().from(reviews)
    .orderBy(desc(reviews.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function getReviewById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.select().from(reviews).where(eq(reviews.id, id)).limit(1);
  return result[0] ?? null;
}

export async function updateReviewApproval(id: number, isApproved: "pending" | "approved" | "rejected") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(reviews).set({ isApproved }).where(eq(reviews.id, id));
  return getReviewById(id);
}

export async function addAdminReply(id: number, adminReply: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(reviews).set({ adminReply, adminReplyAt: new Date() }).where(eq(reviews.id, id));
  return getReviewById(id);
}

export async function incrementHelpfulCount(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(reviews).set({ helpfulCount: sql`${reviews.helpfulCount} + 1` }).where(eq(reviews.id, id));
  return getReviewById(id);
}

export async function getReviewStats() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const allApproved = await db.select().from(reviews).where(eq(reviews.isApproved, "approved"));
  const total = allApproved.length;
  if (total === 0) return { total: 0, average: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };

  const sum = allApproved.reduce((acc, r) => acc + r.rating, 0);
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  allApproved.forEach(r => {
    if (r.rating >= 1 && r.rating <= 5) distribution[r.rating as 1|2|3|4|5]++;
  });

  return { total, average: Math.round((sum / total) * 10) / 10, distribution };
}

// ============ OFFER HELPERS ============

export async function createOffer(offer: InsertOffer) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(offers).values(offer).returning();
  return result[0];
}

export async function getActiveOffers() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const now = Date.now();
  return db.select().from(offers)
    .where(and(
      eq(offers.isActive, "active"),
      lte(offers.startDate, now),
      gte(offers.endDate, now),
    ))
    .orderBy(asc(offers.endDate));
}

export async function getAllOffers(limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.select().from(offers).orderBy(desc(offers.createdAt)).limit(limit).offset(offset);
}

export async function getOfferByPromoCode(promoCode: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.select().from(offers).where(eq(offers.promoCode, promoCode)).limit(1);
  return result[0] ?? null;
}

export async function updateOffer(id: number, data: Partial<InsertOffer>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(offers).set(data).where(eq(offers.id, id));
  const rows = await db.select().from(offers).where(eq(offers.id, id)).limit(1);
  return rows[0];
}

// ============ CONTACT MESSAGE HELPERS ============

export async function createContactMessage(message: InsertContactMessage) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(contactMessages).values(message).returning();
  return result[0];
}

export async function getAllContactMessages(limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt)).limit(limit).offset(offset);
}

export async function updateContactMessageStatus(id: number, status: "new" | "read" | "replied" | "archived") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(contactMessages).set({ status }).where(eq(contactMessages.id, id));
}

// ============ FILE UPLOAD HELPERS ============

export async function createFileUpload(file: InsertFileUpload) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(fileUploads).values(file).returning();
  return result[0];
}

export async function getUserFiles(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.select().from(fileUploads).where(eq(fileUploads.userId, userId)).orderBy(desc(fileUploads.createdAt));
}

// ============ GALLERY ITEM HELPERS ============

export async function createGalleryItem(item: InsertGalleryItem) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(galleryItems).values(item).returning();
  return result[0];
}

export async function getVisibleGalleryItems() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.select().from(galleryItems)
    .where(eq(galleryItems.isVisible, "visible"))
    .orderBy(asc(galleryItems.sortOrder), desc(galleryItems.createdAt));
}

export async function getAllGalleryItems(limit = 100, offset = 0) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.select().from(galleryItems)
    .orderBy(asc(galleryItems.sortOrder), desc(galleryItems.createdAt))
    .limit(limit).offset(offset);
}

export async function getGalleryItemById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.select().from(galleryItems).where(eq(galleryItems.id, id)).limit(1);
  return result[0] ?? null;
}

export async function updateGalleryItem(id: number, data: Partial<InsertGalleryItem>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(galleryItems).set(data).where(eq(galleryItems.id, id));
  return getGalleryItemById(id);
}

export async function deleteGalleryItem(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(galleryItems).where(eq(galleryItems.id, id));
}

// ============ GALLERY VIDEO HELPERS ============

export async function createGalleryVideo(video: InsertGalleryVideo) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(galleryVideos).values(video).returning();
  return result[0];
}

export async function getVisibleGalleryVideos() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.select().from(galleryVideos)
    .where(eq(galleryVideos.isVisible, "visible"))
    .orderBy(asc(galleryVideos.sortOrder), desc(galleryVideos.createdAt));
}

export async function getAllGalleryVideos(limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.select().from(galleryVideos)
    .orderBy(asc(galleryVideos.sortOrder), desc(galleryVideos.createdAt))
    .limit(limit).offset(offset);
}

export async function getGalleryVideoById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.select().from(galleryVideos).where(eq(galleryVideos.id, id)).limit(1);
  return result[0] ?? null;
}

export async function updateGalleryVideo(id: number, data: Partial<InsertGalleryVideo>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(galleryVideos).set(data).where(eq(galleryVideos.id, id));
  return getGalleryVideoById(id);
}

export async function deleteGalleryVideo(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(galleryVideos).where(eq(galleryVideos.id, id));
}


// ============ AI STUDIO HELPERS ============

import {
  InsertAISubscription, aiSubscriptions,
  InsertAICredit, aiCredits,
  InsertAIUsage, aiUsage,
  InsertAITransaction, aiTransactions,
  AISubscription, AICredit, AIUsage, AITransaction,
} from "../drizzle/schema";

export async function getOrCreateAISubscription(userId: number): Promise<AISubscription> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  let subscription = await db.select().from(aiSubscriptions).where(eq(aiSubscriptions.userId, userId)).limit(1);

  if (subscription.length === 0) {
    const result = await db.insert(aiSubscriptions).values({
      userId,
      plan: "free",
      status: "active",
      startDate: Date.now(),
    } as InsertAISubscription).returning();

    subscription = result;
  }

  return subscription[0];
}

export async function updateAISubscription(userId: number, plan: "free" | "pro" | "enterprise", stripeSubscriptionId?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(aiSubscriptions)
    .set({
      plan,
      status: "active",
      renewalDate: Date.now() + 30 * 24 * 60 * 60 * 1000,
      ...(stripeSubscriptionId && { stripeSubscriptionId }),
    })
    .where(eq(aiSubscriptions.userId, userId));

  return getOrCreateAISubscription(userId);
}

export async function getOrCreateAICredits(userId: number): Promise<AICredit> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  let credits = await db.select().from(aiCredits).where(eq(aiCredits.userId, userId)).limit(1);

  if (credits.length === 0) {
    const result = await db.insert(aiCredits).values({
      userId,
      balance: "5",
      totalUsed: "0",
    } as InsertAICredit).returning();

    credits = result;
  }

  return credits[0];
}

export async function addAICredits(userId: number, amount: number, reason: "purchase" | "monthly_allowance" | "bonus") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const credits = await getOrCreateAICredits(userId);
  const newBalance = parseFloat(credits.balance.toString()) + amount;

  await db.update(aiCredits)
    .set({ balance: newBalance.toString() })
    .where(eq(aiCredits.userId, userId));

  await db.insert(aiTransactions).values({
    userId,
    type: reason === "purchase" ? "purchase" : reason === "monthly_allowance" ? "monthly_allowance" : "bonus",
    amount: amount.toString(),
    status: "completed",
  } as InsertAITransaction);

  return getOrCreateAICredits(userId);
}

export async function deductAICredits(userId: number, amount: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const credits = await getOrCreateAICredits(userId);
  const currentBalance = parseFloat(credits.balance.toString());

  if (currentBalance < amount) {
    throw new Error("Insufficient credits");
  }

  const newBalance = currentBalance - amount;
  const newTotalUsed = parseFloat(credits.totalUsed.toString()) + amount;

  await db.update(aiCredits)
    .set({
      balance: newBalance.toString(),
      totalUsed: newTotalUsed.toString(),
    })
    .where(eq(aiCredits.userId, userId));

  return getOrCreateAICredits(userId);
}

export async function createAIUsage(usage: InsertAIUsage) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(aiUsage).values(usage).returning();
  return result[0];
}

export async function getUserAIUsage(userId: number, limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.select().from(aiUsage)
    .where(eq(aiUsage.userId, userId))
    .orderBy(desc(aiUsage.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function updateAIUsageStatus(id: number, status: "pending" | "completed" | "failed", resultUrl?: string, errorMessage?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(aiUsage)
    .set({
      status,
      ...(resultUrl && { resultUrl }),
      ...(errorMessage && { errorMessage }),
    })
    .where(eq(aiUsage.id, id));

  const rows = await db.select().from(aiUsage).where(eq(aiUsage.id, id)).limit(1);
  return rows[0];
}

export async function getAIUsageStats(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const usage = await db.select().from(aiUsage).where(eq(aiUsage.userId, userId));

  return {
    totalGenerations: usage.length,
    byType: {
      image: usage.filter(u => u.type === "image").length,
      video: usage.filter(u => u.type === "video").length,
      edit: usage.filter(u => u.type === "edit").length,
    },
    totalCost: usage.reduce((sum, u) => sum + parseFloat(u.creditsCost.toString()), 0),
  };
}


// ============ USER MANAGEMENT HELPERS (Admin) ============

export async function getAllUsers(limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select()
    .from(users)
    .orderBy(desc(users.createdAt))
    .limit(limit)
    .offset(offset);
  return result;
}

export async function getUsersCount() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(users);
  return result[0]?.count ?? 0;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select()
    .from(users)
    .where(eq(users.id, id))
    .limit(1);
  return result[0] ?? null;
}

export async function updateUserRole(id: number, role: "user" | "admin") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(users)
    .set({ role })
    .where(eq(users.id, id));

  return getUserById(id);
}

export async function searchUsers(query: string, limit = 20) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select()
    .from(users)
    .where(
      sql`${users.name} ILIKE ${`%${query}%`} OR ${users.email} ILIKE ${`%${query}%`} OR ${users.openId} ILIKE ${`%${query}%`}`
    )
    .orderBy(desc(users.createdAt))
    .limit(limit);
  return result;
}

export async function getUserStats() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const totalUsers = await db
    .select({ count: sql<number>`count(*)` })
    .from(users);

  const adminUsers = await db
    .select({ count: sql<number>`count(*)` })
    .from(users)
    .where(eq(users.role, "admin"));

  const recentUsers = await db
    .select({ count: sql<number>`count(*)` })
    .from(users)
    .where(gte(users.createdAt, sql`NOW() - INTERVAL '30 days'`));

  const todayUsers = await db
    .select({ count: sql<number>`count(*)` })
    .from(users)
    .where(gte(users.createdAt, sql`CURRENT_DATE`));

  return {
    total: totalUsers[0]?.count ?? 0,
    admins: adminUsers[0]?.count ?? 0,
    recentSignups: recentUsers[0]?.count ?? 0,
    todaySignups: todayUsers[0]?.count ?? 0,
  };
}

// ============ USER PROFILE UPDATE HELPER ============

export async function updateUserProfile(
  id: number,
  data: { name?: string; phone?: string | null; avatarUrl?: string | null }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const updateSet: Record<string, unknown> = {};
  if (data.name !== undefined) updateSet.name = data.name;
  if (data.phone !== undefined) updateSet.phone = data.phone;
  if (data.avatarUrl !== undefined) updateSet.avatarUrl = data.avatarUrl;

  if (Object.keys(updateSet).length === 0) {
    return getUserById(id);
  }

  await db.update(users).set(updateSet).where(eq(users.id, id));
  return getUserById(id);
}


// ============ BLOG POST HELPERS ============

import { blogPosts, InsertBlogPost } from "../drizzle/schema";

export async function getPublishedBlogPosts(limit = 10, offset = 0) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.select().from(blogPosts)
    .where(eq(blogPosts.status, "published"))
    .orderBy(desc(blogPosts.publishedAt))
    .limit(limit)
    .offset(offset);
}

export async function getBlogPostBySlug(slug: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug)).limit(1);
  return result[0] ?? null;
}

export async function getBlogPostsByCategory(category: string, limit = 10, offset = 0) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.select().from(blogPosts)
    .where(and(eq(blogPosts.status, "published"), eq(blogPosts.category, category)))
    .orderBy(desc(blogPosts.publishedAt))
    .limit(limit)
    .offset(offset);
}

export async function createBlogPost(post: InsertBlogPost) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(blogPosts).values(post).returning();
  return result[0];
}

export async function updateBlogPost(id: number, data: Partial<InsertBlogPost>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(blogPosts).set(data).where(eq(blogPosts.id, id));
  const rows = await db.select().from(blogPosts).where(eq(blogPosts.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function getAllBlogPosts(limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.select().from(blogPosts)
    .orderBy(desc(blogPosts.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function incrementBlogViewCount(id: number) {
  const db = await getDb();
  if (!db) return;

  await db.update(blogPosts)
    .set({ viewCount: sql`${blogPosts.viewCount} + 1` })
    .where(eq(blogPosts.id, id));
}
