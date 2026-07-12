import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { storagePut } from "../storage";
import { createFileUpload, getUserFiles } from "../db";
import { decodeAndValidateUpload } from "../utils/uploadHelper";

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
      const keyPrefix = `user-${ctx.user.id}/${input.purpose || "general"}`;
      const { buffer, fileSize, fileKey } = decodeAndValidateUpload(
        input.fileData,
        input.filename,
        keyPrefix,
      );

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
