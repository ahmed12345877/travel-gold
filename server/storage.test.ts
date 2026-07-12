import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../lib/firebase-storage", () => ({
  storagePut: vi.fn(),
  storageDelete: vi.fn(),
  getStorageUrl: vi.fn(),
}));

import { storagePut, storageGet, storageDelete } from "./storage";

const firebaseMock = await import("../lib/firebase-storage");
const mockStoragePut = firebaseMock.storagePut as ReturnType<typeof vi.fn>;
const mockStorageDelete = firebaseMock.storageDelete as ReturnType<typeof vi.fn>;

describe("storage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("storagePut", () => {
    it("normalizes leading slashes from key", async () => {
      mockStoragePut.mockResolvedValue({ url: "https://storage.example.com/file.txt" });
      await storagePut("///uploads/file.txt", Buffer.from("data"), "text/plain");
      expect(mockStoragePut).toHaveBeenCalledWith(
        "uploads/file.txt",
        expect.any(Buffer),
        "text/plain"
      );
    });

    it("converts string data to Buffer", async () => {
      mockStoragePut.mockResolvedValue({ url: "https://storage.example.com/file.txt" });
      const result = await storagePut("file.txt", "hello", "text/plain");
      expect(result).toEqual({ key: "file.txt", url: "https://storage.example.com/file.txt" });
    });

    it("converts Uint8Array data to Buffer", async () => {
      mockStoragePut.mockResolvedValue({ url: "https://storage.example.com/file.bin" });
      const data = new Uint8Array([1, 2, 3]);
      const result = await storagePut("file.bin", data, "application/octet-stream");
      expect(result.key).toBe("file.bin");
    });

    it("passes Buffer data directly", async () => {
      mockStoragePut.mockResolvedValue({ url: "https://storage.example.com/img.png" });
      const data = Buffer.from([0x89, 0x50, 0x4e, 0x47]);
      const result = await storagePut("img.png", data, "image/png");
      expect(result.key).toBe("img.png");
    });

    it("throws descriptive error when Firebase upload fails", async () => {
      mockStoragePut.mockRejectedValue(new Error("Permission denied"));
      await expect(storagePut("file.txt", "data")).rejects.toThrow(
        "Failed to upload file to Firebase Storage: Permission denied"
      );
    });

    it("uses default content type when not specified", async () => {
      mockStoragePut.mockResolvedValue({ url: "https://storage.example.com/data.bin" });
      await storagePut("data.bin", Buffer.from("x"));
      expect(mockStoragePut).toHaveBeenCalledWith(
        "data.bin",
        expect.any(Buffer),
        "application/octet-stream"
      );
    });
  });

  describe("storageDelete", () => {
    it("normalizes key and returns true on success", async () => {
      mockStorageDelete.mockResolvedValue(undefined);
      const result = await storageDelete("///uploads/file.txt");
      expect(result).toBe(true);
      expect(mockStorageDelete).toHaveBeenCalledWith("uploads/file.txt");
    });

    it("throws descriptive error when Firebase delete fails", async () => {
      mockStorageDelete.mockRejectedValue(new Error("Not found"));
      await expect(storageDelete("file.txt")).rejects.toThrow(
        "Failed to delete file from Firebase Storage: Not found"
      );
    });
  });
});
