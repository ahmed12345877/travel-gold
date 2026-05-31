import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { storagePut } from "../storage";
import { createFileUpload, getUserFiles } from "../db";
import { nanoid } from "nanoid";

export const uploadsRouter = router({
  /** Upload a file (authenticated users only) */
  upload: protectedProcedure
    .input(
      z.object({
        /** Base64 encoded file data */
        fileData: z.string(),
        filename: z.string(),
        mimeType: z.string(),
        purpose: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const buffer = Buffer.from(input.fileData, "base64");
      const fileSize = buffer.length;

      // Max 10MB
      if (fileSize > 10 * 1024 * 1024) {
        throw new Error("حجم الملف يتجاوز الحد المسموح (10 ميجابايت)");
      }

      const ext = input.filename.split(".").pop() || "bin";
      const randomSuffix = nanoid(8);
      const fileKey = `user-${ctx.user.id}/${input.purpose || "general"}/${randomSuffix}.${ext}`;

      const { url } = await storagePut(fileKey, buffer, input.mimeType);

      const fileRecord = await createFileUpload({
        userId: ctx.user.id,
        fileKey,
        url,
        filename: input.filename,
        mimeType: input.mimeType,
        fileSize,
        purpose: input.purpose,
      });

      return fileRecord;
    }),

  /** List user's uploaded files */
  myFiles: protectedProcedure.query(async ({ ctx }) => {
    return getUserFiles(ctx.user.id);
  }),
});
