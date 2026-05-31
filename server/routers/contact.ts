import { z } from "zod";
import { router, publicProcedure } from "../_core/trpc";
import { adminProcedure } from "../_core/trpc";
import {
  createContactMessage,
  getAllContactMessages,
  updateContactMessageStatus,
} from "../db";
import { notifyOwner } from "../_core/notification";

export const contactRouter = router({
  /** Submit a contact form message (public) */
  submit: publicProcedure
    .input(
      z.object({
        name: z.string().min(1),
        email: z.string().email(),
        phone: z.string().optional(),
        subject: z.string().optional(),
        message: z.string().min(10),
      })
    )
    .mutation(async ({ input }) => {
      const msg = await createContactMessage({
        ...input,
        status: "new",
      });

      // Notify owner about new contact message
      await notifyOwner({
        title: "رسالة اتصال جديدة - New Contact Message",
        content: `من: ${input.name} (${input.email})\nالموضوع: ${input.subject || "بدون موضوع"}\n\n${input.message.substring(0, 200)}`,
      });

      return { success: true, id: msg.id };
    }),

  /** List all contact messages (admin only) */
  listAll: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      }).optional()
    )
    .query(async ({ input }) => {
      const { limit = 50, offset = 0 } = input ?? {};
      return getAllContactMessages(limit, offset);
    }),

  /** Update message status (admin only) */
  updateStatus: adminProcedure
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["new", "read", "replied", "archived"]),
      })
    )
    .mutation(async ({ input }) => {
      await updateContactMessageStatus(input.id, input.status);
      return { success: true };
    }),
});
