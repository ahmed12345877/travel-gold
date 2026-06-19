/**
 * Shared helpers for gallery collection operations.
 *
 * `gallery.ts` had near-identical code for images vs videos:
 * - listVisible / listVisibleVideos
 * - update / updateVideo
 * - delete / deleteVideo
 *
 * This module provides parameterised versions that accept the collection name.
 */

import { db } from "../_core/firebaseAdmin";

/**
 * List visible items from a Firestore collection with index-query fallback.
 */
export async function listVisibleFromCollection(collection: string, label: string) {
  try {
    const snap = await db
      .collection(collection)
      .where("isVisible", "==", "visible")
      .orderBy("sortOrder", "asc")
      .get();
    console.log(`[Gallery] ${label}: Found ${snap.docs.length} items (with index)`);
    return snap.docs.map((d) => ({ ...d.data(), _docId: d.id }));
  } catch (indexErr) {
    console.warn(
      `[Gallery] ${label}: Index query failed, falling back to client-side filter`,
      (indexErr as Error).message,
    );
    const snap = await db
      .collection(collection)
      .orderBy("createdAt", "desc")
      .get();
    const filtered = snap.docs
      .map((d) => ({ ...d.data(), _docId: d.id }))
      .filter((item: any) => item.isVisible === "visible")
      .sort((a: any, b: any) => (a.sortOrder || 0) - (b.sortOrder || 0));
    console.log(`[Gallery] ${label}: Found ${filtered.length} items (fallback)`);
    return filtered;
  }
}

/**
 * Find a Firestore document by numeric id (checks `_docId` field and doc ID).
 * Returns the DocumentReference or null.
 */
export async function findDocById(collection: string, id: number) {
  const snap = await db.collection(collection).limit(1000).get();
  for (const doc of snap.docs) {
    const docData = doc.data();
    if (docData._docId === id || doc.id === String(id)) {
      return doc.ref;
    }
  }
  return null;
}

/**
 * Update a document found by id in a gallery collection.
 */
export async function updateDocById(
  collection: string,
  label: string,
  id: number,
  data: Record<string, unknown>,
) {
  const docRef = await findDocById(collection, id);
  if (!docRef) {
    throw new Error(`Gallery ${label} not found: ${id}`);
  }
  await docRef.set(data, { merge: true });
  const updated = (await docRef.get()).data();
  console.log(`[Gallery] Updated ${label}: docId=${docRef.id}`);
  return { ...updated, _docId: docRef.id };
}

/**
 * Delete a document found by id in a gallery collection.
 */
export async function deleteDocById(
  collection: string,
  label: string,
  id: number,
) {
  const snap = await db.collection(collection).limit(1000).get();
  for (const doc of snap.docs) {
    const docData = doc.data();
    if (docData._docId === id || doc.id === String(id)) {
      await doc.ref.delete();
      console.log(`[Gallery] Deleted ${label}: docId=${doc.id}`);
      return { success: true };
    }
  }
  throw new Error(`Gallery ${label} not found: ${id}`);
}
