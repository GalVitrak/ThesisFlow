import { getFirebase } from "@/lib/firebase/client";
import type { Firestore } from "firebase/firestore";

export function requireClientDb(): Firestore {
  const fb = getFirebase();
  if (!fb) throw new Error("Firebase is not configured. Set NEXT_PUBLIC_USE_FIREBASE=true and env vars.");
  return fb.db;
}
