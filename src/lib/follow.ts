import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";
import type { Firestore } from "firebase/firestore";

export function followDocId(followerId: string, followingId: string) {
  return `${followerId}_${followingId}`;
}

export async function isFollowing(
  db: Firestore,
  followerId: string,
  followingId: string,
): Promise<boolean> {
  const snap = await getDoc(doc(db, "follows", followDocId(followerId, followingId)));
  return snap.exists();
}

export async function getFollowingList(
  db: Firestore,
  followerId: string,
): Promise<{ id: string; displayName: string }[]> {
  const q = query(collection(db, "follows"), where("followerId", "==", followerId));
  const snap = await getDocs(q);
  const results: { id: string; displayName: string }[] = [];
  for (const followDoc of snap.docs) {
    const followingId = followDoc.data().followingId as string;
    if (!followingId) continue;
    const profileSnap = await getDoc(doc(db, "publicProfiles", followingId));
    const name =
      profileSnap.exists() && typeof profileSnap.data().displayName === "string"
        ? (profileSnap.data().displayName as string)
        : "Guild member";
    results.push({ id: followingId, displayName: name });
  }
  return results.sort((a, b) => a.displayName.localeCompare(b.displayName));
}

export async function getFollowerCount(db: Firestore, userId: string): Promise<number> {
  const q = query(collection(db, "follows"), where("followingId", "==", userId));
  const snap = await getDocs(q);
  return snap.size;
}

export async function getFollowingCount(db: Firestore, userId: string): Promise<number> {
  const q = query(collection(db, "follows"), where("followerId", "==", userId));
  const snap = await getDocs(q);
  return snap.size;
}

/** Toggle follow. Self-follow is allowed when requested by product. */
export async function toggleFollow(
  db: Firestore,
  followerId: string,
  followingId: string,
): Promise<"followed" | "unfollowed"> {
  const ref = doc(db, "follows", followDocId(followerId, followingId));
  const existing = await getDoc(ref);

  if (existing.exists()) {
    await deleteDoc(ref);
    return "unfollowed";
  }

  await setDoc(ref, {
    followerId,
    followingId,
    createdAt: serverTimestamp(),
  });
  return "followed";
}
