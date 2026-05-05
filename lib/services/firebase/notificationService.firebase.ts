import { collection, doc, getDoc, getDocs, query, updateDoc, where } from "firebase/firestore";
import { COL } from "@/lib/firebase/collections";
import type { EmailLogEntry, Notification, NotifyPayload } from "@/lib/types";
import { requireClientDb } from "./firestoreAccess";
import { toNotification } from "./mappers";
import { notifyFromFirebase } from "./notificationHelper.firebase";

export async function notify(payload: NotifyPayload) {
  await notifyFromFirebase(payload);
}

export async function listNotificationsForUser(userId: string): Promise<Notification[]> {
  const db = requireClientDb();
  const snap = await getDocs(
    query(collection(db, COL.notifications), where("userId", "==", userId)),
  );
  return snap.docs
    .map((d) => toNotification(d.id, d.data() as Record<string, unknown>))
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export async function countUnreadNotifications(userId: string): Promise<number> {
  const list = await listNotificationsForUser(userId);
  return list.filter((n) => !n.read).length;
}

export async function markNotificationRead(id: string, userId: string) {
  const db = requireClientDb();
  const ref = doc(db, COL.notifications, id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;
  const data = snap.data() as { userId?: string };
  if (data.userId !== userId) return;
  await updateDoc(ref, { read: true });
}

export async function getEmailLog(): Promise<EmailLogEntry[]> {
  const db = requireClientDb();
  const snap = await getDocs(collection(db, COL.emailLog));
  return snap.docs
    .map((d) => ({
      id: d.id,
      ...(d.data() as Omit<EmailLogEntry, "id">),
    }))
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}
