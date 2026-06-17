import { db } from "./firebaseAdmin";
import type {
  Query,
  CollectionReference,
} from "firebase-admin/firestore";

// Ensure Firebase is initialized before using the db
if (!db) {
  throw new Error("[firestore-db] Firebase Firestore was not initialized. Check firebaseAdmin.ts initialization.");
}

/**
 * Generic Firestore data access layer.
 *
 * All admin tools share this layer so every collection behaves consistently:
 * - Documents carry a numeric, auto-incrementing `id` (kept for UI/back-compat
 *   with the old SQL ids). Ids are allocated atomically from a `_counters`
 *   collection.
 * - The Firestore document id is the stringified numeric id, so lookups by id
 *   are direct `doc(id)` reads (no extra query needed).
 * - `createdAt` / `updatedAt` are stored as JS Date values.
 *
 * The `users` collection is the one exception: it is keyed by Firebase UID and
 * managed by the auth layer, so it is NOT routed through these helpers.
 */

export type WhereTuple = [string, FirebaseFirestore.WhereFilterOp, unknown];
export type OrderTuple = [string, "asc" | "desc"];

export interface ListOptions {
  where?: WhereTuple[];
  orderBy?: OrderTuple[];
  limit?: number;
  offset?: number;
}

/** Atomically allocate the next numeric id for a collection. */
async function nextId(collection: string): Promise<number> {
  const counterRef = db.collection("_counters").doc(collection);
  const next = await db.runTransaction(async (tx) => {
    const snap = await tx.get(counterRef);
    const current = (snap.exists ? (snap.data()?.value as number) : 0) || 0;
    const value = current + 1;
    tx.set(counterRef, { value }, { merge: true });
    return value;
  });
  return next;
}

/** Strip Firestore-internal artifacts; return a plain record. */
function clean<T extends Record<string, any>>(data: T | undefined): T | null {
  if (!data) return null;
  return data;
}

/** Insert a new document with an auto-allocated numeric id. */
export async function insert<T extends Record<string, any>>(
  collection: string,
  data: T,
): Promise<T & { id: number }> {
  try {
    const id = typeof data.id === "number" ? data.id : await nextId(collection);
    const now = new Date();
    const record = {
      ...data,
      id,
      createdAt: data.createdAt ?? now,
      updatedAt: now,
    } as T & { id: number };
    await db.collection(collection).doc(String(id)).set(record);
    return record;
  } catch (error) {
    console.error(`[firestore] insert() failed for collection="${collection}":`, {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    throw error;
  }
}

/** Get a single document by numeric id. */
export async function getById<T = Record<string, any>>(
  collection: string,
  id: number,
): Promise<T | null> {
  try {
    const snap = await db.collection(collection).doc(String(id)).get();
    return snap.exists ? (snap.data() as T) : null;
  } catch (error) {
    console.error(`[firestore] getById() failed for collection="${collection}" id="${id}":`, {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    throw error;
  }
}

/** Update a document by numeric id (merge). Returns the updated doc. */
export async function update<T = Record<string, any>>(
  collection: string,
  id: number,
  data: Record<string, any>,
): Promise<T | null> {
  try {
    const ref = db.collection(collection).doc(String(id));
    const existing = await ref.get();
    if (!existing.exists) return null;
    await ref.set({ ...data, updatedAt: new Date() }, { merge: true });
    const updated = await ref.get();
    return (updated.data() as T) ?? null;
  } catch (error) {
    console.error(`[firestore] update() failed for collection="${collection}" id="${id}":`, {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    throw error;
  }
}

/** Delete a document by numeric id. */
export async function remove(collection: string, id: number): Promise<void> {
  try {
    await db.collection(collection).doc(String(id)).delete();
  } catch (error) {
    console.error(`[firestore] remove() failed for collection="${collection}" id="${id}":`, {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    throw error;
  }
}

/** Delete every document in a collection (used by backup "replace" restore). */
export async function removeAll(collection: string): Promise<void> {
  const snap = await db.collection(collection).get();
  const batchSize = 400;
  for (let i = 0; i < snap.docs.length; i += batchSize) {
    const batch = db.batch();
    for (const doc of snap.docs.slice(i, i + batchSize)) {
      batch.delete(doc.ref);
    }
    await batch.commit();
  }
}

/** List documents with optional filtering, ordering, and pagination. */
export async function list<T = Record<string, any>>(
  collection: string,
  options: ListOptions = {},
): Promise<T[]> {
  try {
    let query: Query | CollectionReference = db.collection(collection);

    if (options.where) {
      for (const [field, op, value] of options.where) {
        query = query.where(field, op, value);
      }
    }
    if (options.orderBy) {
      for (const [field, dir] of options.orderBy) {
        query = query.orderBy(field, dir);
      }
    }
    if (typeof options.offset === "number") {
      query = query.offset(options.offset);
    }
    if (typeof options.limit === "number") {
      query = query.limit(options.limit);
    }

    const snap = await query.get();
    return snap.docs.map((d) => d.data() as T);
  } catch (error) {
    console.error(`[firestore] list() failed for collection="${collection}":`, {
      error: error instanceof Error ? error.message : String(error),
      options,
      stack: error instanceof Error ? error.stack : undefined,
    });
    throw error;
  }
}

/** Count documents in a collection (optionally filtered). */
export async function count(
  collection: string,
  where?: WhereTuple[],
): Promise<number> {
  try {
    let query: Query | CollectionReference = db.collection(collection);
    if (where) {
      for (const [field, op, value] of where) {
        query = query.where(field, op, value);
      }
    }
    const snap = await query.count().get();
    return snap.data().count;
  } catch (error) {
    console.error(`[firestore] count() failed for collection="${collection}":`, {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    throw error;
  }
}

/** Find the first document matching a set of equality/where conditions. */
export async function findOne<T = Record<string, any>>(
  collection: string,
  where: WhereTuple[],
): Promise<T | null> {
  try {
    let query: Query | CollectionReference = db.collection(collection);
    for (const [field, op, value] of where) {
      query = query.where(field, op, value);
    }
    const snap = await query.limit(1).get();
    return snap.empty ? null : (snap.docs[0].data() as T);
  } catch (error) {
    console.error(`[firestore] findOne() failed for collection="${collection}":`, {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    throw error;
  }
}

/* ── Settings helpers (category + key composite identity) ── */

const SETTINGS_COL = "siteSettings";

/** Read a single setting value, or null if unset. */
export async function getSettingValue(
  category: string,
  key: string,
): Promise<string | null> {
  const docId = `${category}__${key}`;
  const snap = await db.collection(SETTINGS_COL).doc(docId).get();
  return snap.exists ? ((snap.data()?.settingValue as string) ?? null) : null;
}

/** Create or update a single setting value. */
export async function setSettingValue(
  category: string,
  key: string,
  value: string,
  updatedBy?: number | string | null,
): Promise<void> {
  const docId = `${category}__${key}`;
  const ref = db.collection(SETTINGS_COL).doc(docId);
  const existing = await ref.get();
  if (!existing.exists) {
    const id = await nextId(SETTINGS_COL);
    await ref.set({
      id,
      category,
      settingKey: key,
      settingValue: value,
      updatedBy: updatedBy ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  } else {
    await ref.set(
      { settingValue: value, updatedBy: updatedBy ?? null, updatedAt: new Date() },
      { merge: true },
    );
  }
}

export { db as firestore };
