import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { adminProcedure } from "../_core/trpc";
import {
  createBooking,
  getBookingById,
  getBookingByConfirmationCode,
  getUserBookings,
  updateBookingStatus,
  updateBookingPaymentStatus,
  getAllBookings,
} from "../db";
import { nanoid } from "nanoid";
import { notifyOwner } from "../_core/notification";

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
        paymentMethod: z
          .enum(["credit_card", "paypal", "bank_transfer"])
          .optional(),
        promoCode: z.string().optional(),
        discountAmount: z.string().optional(),
        specialRequests: z.string().optional(),
        billingAddress: z.any().optional(),
        guestName: z.string().optional(),
        guestEmail: z.string().email().optional(),
        guestPhone: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const confirmationCode = `VNR-${nanoid(8).toUpperCase()}`;
      const booking = await createBooking({
        ...input,
        userId: ctx.user?.id ?? null,
        confirmationCode,
        status: "pending",
        paymentStatus: "pending",
      });

      // Notify owner about new booking
      await notifyOwner({
        title: "حجز جديد - New Booking",
        content: `حجز جديد: ${input.packageName}\nالعميل: ${input.guestName || ctx.user?.name || "مجهول"}\nرمز التأكيد: ${confirmationCode}`,
      });

      return booking;
    }),

  /** Get booking by ID */
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return getBookingById(input.id);
    }),

  /** Get booking by confirmation code */
  getByCode: publicProcedure
    .input(z.object({ code: z.string() }))
    .query(async ({ input }) => {
      return getBookingByConfirmationCode(input.code);
    }),

  /** Get current user's bookings */
  myBookings: protectedProcedure.query(async ({ ctx }) => {
    return getUserBookings(ctx.user.id);
  }),

  /** Update booking status (admin only) */
  updateStatus: adminProcedure
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["pending", "confirmed", "cancelled", "completed"]),
      }),
    )
    .mutation(async ({ input }) => {
      return updateBookingStatus(input.id, input.status);
    }),

  /** Update payment status (admin only) */
  updatePaymentStatus: adminProcedure
    .input(
      z.object({
        id: z.number(),
        paymentStatus: z.enum(["pending", "paid", "failed", "refunded"]),
      }),
    )
    .mutation(async ({ input }) => {
      return updateBookingPaymentStatus(input.id, input.paymentStatus);
    }),

  /** List all bookings (admin only) */
  listAll: adminProcedure
    .input(
      z
        .object({
          limit: z.number().min(1).max(100).default(50),
          offset: z.number().min(0).default(0),
        })
        .optional(),
    )
    .query(async ({ input }) => {
      const { limit = 50, offset = 0 } = input ?? {};
      return getAllBookings(limit, offset);
    }),
});
