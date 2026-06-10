import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { adminProcedure } from "../_core/trpc";
import { db } from "../_core/firebaseAdmin";
import { nanoid } from "nanoid";
import { notifyOwner } from "../_core/notification";
import type { Timestamp, DocumentData } from "firebase-admin/firestore";

function toDateValue(v: unknown): Date | null {
  if (!v) return null;
  if (v instanceof Date) return v;
  if (typeof (v as Timestamp).toDate === "function") return (v as Timestamp).toDate();
  if (typeof v === "number") return new Date(v);
  if (typeof v === "string") return new Date(v);
  return null;
}

function docToBooking(docId: string, data: DocumentData) {
  return {
    id: docId,
    confirmationCode: data.confirmationCode ?? null,
    packageName: data.packageName ?? "",
    packageCategory: data.packageCategory ?? null,
    destination: data.destination ?? null,
    checkInDate: data.checkInDate ?? null,
    checkOutDate: data.checkOutDate ?? null,
    adults: data.adults ?? 1,
    children: data.children ?? 0,
    roomType: data.roomType ?? null,
    totalPrice: data.totalPrice ?? null,
    currency: data.currency ?? "USD",
    paymentMethod: data.paymentMethod ?? null,
    promoCode: data.promoCode ?? null,
    discountAmount: data.discountAmount ?? null,
    specialRequests: data.specialRequests ?? null,
    billingAddress: data.billingAddress ?? null,
    guestName: data.guestName ?? null,
    guestEmail: data.guestEmail ?? null,
    guestPhone: data.guestPhone ?? null,
    userId: data.userId ?? null,
    status: data.status ?? "pending",
    paymentStatus: data.paymentStatus ?? "pending",
    createdAt: toDateValue(data.createdAt),
    updatedAt: toDateValue(data.updatedAt),
  };
}

export const bookingsRouter = router({
  /** Create a new booking (public - guests can book too) */
  create: publicProcedure
    .input(
      z.object({
        packageName: z.string().min(1),
        packageCategory: z.string().optional(),
        destination: z.string().optional(),
        checkInDate: z.number().optional(),
        checkOutDate: z.number().optional(),
        adults: z.number().min(1).default(1),
        children: z.number().min(0).default(0),
        roomType: z.string().optional(),
        totalPrice: z.string().optional(),
        currency: z.string().default("USD"),
        paymentMethod: z.enum(["credit_card", "paypal", "bank_transfer"]).optional(),
        promoCode: z.string().optional(),
        discountAmount: z.string().optional(),
        specialRequests: z.string().optional(),
        billingAddress: z.any().optional(),
        guestName: z.string().optional(),
        guestEmail: z.string().email().optional(),
        guestPhone: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const confirmationCode = `VNR-${nanoid(8).toUpperCase()}`;
      const now = new Date();
      const docData = {
        ...input,
        userId: ctx.user?.openId ?? null,
        confirmationCode,
        status: "pending",
        paymentStatus: "pending",
        createdAt: now,
        updatedAt: now,
      };

      const ref = await db.collection("bookings").add(docData);

      await notifyOwner({
        title: "حجز جديد - New Booking",
        content: `حجز جديد: ${input.packageName}\nالعميل: ${input.guestName || ctx.user?.name || "مجهول"}\nرمز التأكيد: ${confirmationCode}`,
      });

      return docToBooking(ref.id, docData);
    }),

  /** Get booking by ID */
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const snap = await db.collection("bookings").doc(input.id).get();
      if (!snap.exists) return null;
      return docToBooking(snap.id, snap.data()!);
    }),

  /** Get booking by confirmation code */
  getByCode: publicProcedure
    .input(z.object({ code: z.string() }))
    .query(async ({ input }) => {
      const snap = await db
        .collection("bookings")
        .where("confirmationCode", "==", input.code)
        .limit(1)
        .get();
      if (snap.empty) return null;
      const doc = snap.docs[0];
      return docToBooking(doc.id, doc.data());
    }),

  /** Get current user's bookings */
  myBookings: protectedProcedure.query(async ({ ctx }) => {
    const snap = await db
      .collection("bookings")
      .where("userId", "==", ctx.user.openId)
      .orderBy("createdAt", "desc")
      .get();
    return snap.docs.map((d) => docToBooking(d.id, d.data()));
  }),

  /** Update booking status (admin only) */
  updateStatus: adminProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum(["pending", "confirmed", "cancelled", "completed"]),
      })
    )
    .mutation(async ({ input }) => {
      const ref = db.collection("bookings").doc(input.id);
      await ref.update({ status: input.status, updatedAt: new Date() });
      const snap = await ref.get();
      if (!snap.exists) return null;
      return docToBooking(snap.id, snap.data()!);
    }),

  /** Update payment status (admin only) */
  updatePaymentStatus: adminProcedure
    .input(
      z.object({
        id: z.string(),
        paymentStatus: z.enum(["pending", "paid", "failed", "refunded"]),
      })
    )
    .mutation(async ({ input }) => {
      const ref = db.collection("bookings").doc(input.id);
      await ref.update({ paymentStatus: input.paymentStatus, updatedAt: new Date() });
      const snap = await ref.get();
      if (!snap.exists) return null;
      return docToBooking(snap.id, snap.data()!);
    }),

  /** List all bookings (admin only) */
  listAll: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      }).optional()
    )
    .query(async ({ input }) => {
      const { limit = 50 } = input ?? {};
      const snap = await db
        .collection("bookings")
        .orderBy("createdAt", "desc")
        .limit(limit)
        .get();
      return snap.docs.map((d) => docToBooking(d.id, d.data()));
    }),
});
