import { z } from "zod";
import { router, publicProcedure } from "../_core/trpc";
import { adminProcedure } from "../_core/trpc";
import { db } from "../_core/firebaseAdmin";
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

function docToMessage(docId: string, data: DocumentData) {
  return {
    id: docId,
    name: data.name ?? "",
    email: data.email ?? "",
    phone: data.phone ?? null,
    subject: data.subject ?? null,
    message: data.message ?? "",
    status: data.status ?? "new",
    createdAt: toDateValue(data.createdAt),
    updatedAt: toDateValue(data.updatedAt),
  };
}

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
      const now = new Date();
      const docData = {
        ...input,
        status: "new",
        createdAt: now,
        updatedAt: now,
      };

      const ref = await db.collection("contacts").add(docData);

      await notifyOwner({
        title: "رسالة اتصال جديدة - New Contact Message",
        content: `من: ${input.name} (${input.email})\nالموضوع: ${input.subject || "بدون موضوع"}\n\n${input.message.substring(0, 200)}`,
      });

      return { success: true, id: ref.id };
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
      const { limit = 50 } = input ?? {};
      const snap = await db
        .collection("contacts")
        .orderBy("createdAt", "desc")
        .limit(limit)
        .get();
      return snap.docs.map((d) => docToMessage(d.id, d.data()));
    }),

  /** Update message status (admin only) */
  updateStatus: adminProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum(["new", "read", "replied", "archived"]),
      })
    )
    .mutation(async ({ input }) => {
      await db
        .collection("contacts")
        .doc(input.id)
        .update({ status: input.status, updatedAt: new Date() });
      return { success: true };
    }),
});
