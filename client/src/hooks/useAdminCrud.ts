/**
 * Shared hook for admin CRUD mutation wiring.
 *
 * Every admin page (BlogAdmin, OffersAdmin, GalleryAdmin) was duplicating
 * the same pattern: create/update/delete mutations that call `refetch()` on
 * success, show an alert/toast on error, and close a dialog. This hook
 * encapsulates that boilerplate.
 */

import { toast } from "sonner";

export type NotifyFn = (msg: string) => void;

const defaultSuccess: NotifyFn = (msg) => toast.success(msg);
const defaultError: NotifyFn = (msg) => toast.error(msg);

export interface AdminMutationOptions {
  successMessage: string;
  errorMessage: string;
  refetch: () => void;
  onSuccess?: () => void;
  notify?: { success?: NotifyFn; error?: NotifyFn };
}

/**
 * Build the `onSuccess` / `onError` callbacks expected by tRPC's
 * `useMutation`.
 */
export function buildMutationCallbacks(opts: AdminMutationOptions) {
  const notifySuccess = opts.notify?.success ?? defaultSuccess;
  const notifyError = opts.notify?.error ?? defaultError;

  return {
    onSuccess: () => {
      notifySuccess(opts.successMessage);
      opts.refetch();
      opts.onSuccess?.();
    },
    onError: (error: unknown) => {
      const msg =
        error instanceof Error ? error.message : opts.errorMessage;
      console.error(`[mutation] Error:`, error);
      notifyError("خطأ: " + msg);
    },
  };
}

/**
 * Extract a user-facing error message from an unknown error value.
 * Replaces the per-page `handleErrorMessage` helpers.
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "حدث خطأ أثناء العملية. يرجى المحاولة مجددًا.";
}
