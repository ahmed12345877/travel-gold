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
      try {
        const confirmationCode = `VNR-${nanoid(8).toUpperCase()}`;
        const booking = await createBooking({
          ...input,
          userId: ctx.user?.id ?? null,
          confirmationCode,
          status: "pending",
          paymentStatus: "pending",
        });

        console.log(`[bookings.create] created booking: confirmationCode=${confirmationCode}, packageName=${input.packageName}`);

        // Notify owner about new booking
        await notifyOwner({
          title: "حجز جديد - New Booking",
          content: `حجز جديد: ${input.packageName}\nالعميل: ${input.guestName || ctx.user?.name || "مجهول"}\nرمز التأكيد: ${confirmationCode}`,
        });

        return booking;
      } catch (error) {
        console.error("[bookings.create] mutation error:", {
          error: error instanceof Error ? error.message : String(error),
          packageName: input.packageName,
        });
        throw error;
      }
    }),

  /** Get booking by ID */
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      try {
        const booking = await getBookingById(input.id);
        console.log(`[bookings.getById] retrieved booking: id=${input.id}`);
        return booking;
      } catch (error) {
        console.error("[bookings.getById] query error:", {
          error: error instanceof Error ? error.message : String(error),
          id: input.id,
        });
        throw error;
      }
    }),

  /** Get booking by confirmation code */
  getByCode: publicProcedure
    .input(z.object({ code: z.string() }))
    .query(async ({ input }) => {
      try {
        const booking = await getBookingByConfirmationCode(input.code);
        console.log(`[bookings.getByCode] retrieved booking: code=${input.code}`);
        return booking;
      } catch (error) {
        console.error("[bookings.getByCode] query error:", {
          error: error instanceof Error ? error.message : String(error),
          code: input.code,
        });
        throw error;
      }
    }),

  /** Get current user's bookings */
  myBookings: protectedProcedure.query(async ({ ctx }) => {
    try {
      const bookings = await getUserBookings(ctx.user.id);
      console.log(`[bookings.myBookings] retrieved ${bookings.length} bookings for user: ${ctx.user.id}`);
      return bookings;
    } catch (error) {
      console.error("[bookings.myBookings] query error:", {
        error: error instanceof Error ? error.message : String(error),
        userId: ctx.user.id,
      });
      throw error;
    }
  }),

  /** Update booking status (admin only) */
  updateStatus: adminProcedure
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["pending", "confirmed", "cancelled", "completed"]),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const result = await updateBookingStatus(input.id, input.status);
        console.log(`[bookings.updateStatus] updated booking: id=${input.id}, status=${input.status}`);
        return result;
      } catch (error) {
        console.error("[bookings.updateStatus] mutation error:", {
          error: error instanceof Error ? error.message : String(error),
          id: input.id,
          status: input.status,
        });
        throw error;
      }
    }),

  /** Update payment status (admin only) */
  updatePaymentStatus: adminProcedure
    .input(
      z.object({
        id: z.number(),
        paymentStatus: z.enum(["pending", "paid", "failed", "refunded"]),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const result = await updateBookingPaymentStatus(input.id, input.paymentStatus);
        console.log(`[bookings.updatePaymentStatus] updated booking: id=${input.id}, paymentStatus=${input.paymentStatus}`);
        return result;
      } catch (error) {
        console.error("[bookings.updatePaymentStatus] mutation error:", {
          error: error instanceof Error ? error.message : String(error),
          id: input.id,
          paymentStatus: input.paymentStatus,
        });
        throw error;
      }
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
      try {
        const { limit = 50, offset = 0 } = input ?? {};
        const bookings = await getAllBookings(limit, offset);
        console.log(`[bookings.listAll] retrieved ${bookings.length} bookings`);
        return bookings;
      } catch (error) {
        console.error("[bookings.listAll] query error:", {
          error: error instanceof Error ? error.message : String(error),
        });
        throw error;
      }
    }),
});
