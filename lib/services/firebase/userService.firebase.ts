import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { COL } from "@/lib/firebase/collections";
import { requireClientDb } from "./firestoreAccess";
import { toUser } from "./mappers";
import type { User } from "@/lib/types";

export async function getUserById(id: string): Promise<User | null> {
  const db = requireClientDb();
  const snap = await getDoc(doc(db, COL.users, id));
  if (!snap.exists()) return null;
  return toUser(snap.id, snap.data() as Record<string, unknown>);
}

export async function listUsers(): Promise<User[]> {
  const db = requireClientDb();
  const snap = await getDocs(collection(db, COL.users));
  return snap.docs.map((d) => toUser(d.id, d.data() as Record<string, unknown>));
}
