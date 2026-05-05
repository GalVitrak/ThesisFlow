import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { getFirebase } from "@/lib/firebase/client";
import { COL } from "@/lib/firebase/collections";
import type { User } from "@/lib/types";
import { toUser } from "./mappers";

export async function signIn(email: string, password: string): Promise<User | null> {
  const fb = getFirebase();
  if (!fb) return null;
  const cred = await signInWithEmailAndPassword(fb.auth, email, password);
  const ref = doc(fb.db, COL.users, cred.user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return toUser(snap.id, snap.data() as Record<string, unknown>);
}

export async function signOut() {
  const fb = getFirebase();
  if (!fb) return;
  await fbSignOut(fb.auth);
}

export async function getCurrentUser(): Promise<User | null> {
  const fb = getFirebase();
  if (!fb || !fb.auth.currentUser) return null;
  const ref = doc(fb.db, COL.users, fb.auth.currentUser.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return toUser(snap.id, snap.data() as Record<string, unknown>);
}

export function subscribeAuth(callback: (user: User | null) => void) {
  const fb = getFirebase();
  if (!fb) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(fb.auth, async (u) => {
    if (!u) {
      callback(null);
      return;
    }
    const ref = doc(fb.db, COL.users, u.uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      callback(null);
      return;
    }
    callback(toUser(snap.id, snap.data() as Record<string, unknown>));
  });
}
