import { addDoc, collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { COL, SETTINGS_DOC } from "@/lib/firebase/collections";
import type { NotifyPayload } from "@/lib/types";
import { requireClientDb } from "./firestoreAccess";
import { toNotificationRules } from "./mappers";

/** Write in-app + email-log entries in Firestore (used by Firebase service implementations). */
export async function notifyFromFirebase(payload: NotifyPayload) {
  const db = requireClientDb();
  const settingsSnap = await getDoc(doc(db, COL.settings, SETTINGS_DOC));
  const rules = toNotificationRules(settingsSnap.data() as Record<string, unknown> | undefined);
  if (payload.ruleKey && rules[payload.ruleKey] === false) return;

  const targets = new Set(payload.userIds);
  const admins = await getDocs(
    query(collection(db, COL.users), where("role", "in", ["admin", "coordinator"])),
  );
  admins.forEach((d) => targets.add(d.id));

  const createdAt = new Date().toISOString();
  for (const userId of targets) {
    await addDoc(collection(db, COL.notifications), {
      userId,
      title: payload.title,
      body: payload.body,
      type: payload.type,
      read: false,
      createdAt,
      emailPlaceholderSent: true,
    });
    const uSnap = await getDoc(doc(db, COL.users, userId));
    const email = uSnap.exists() ? String((uSnap.data() as { email?: string }).email ?? "") : "";
    if (email) {
      await addDoc(collection(db, COL.emailLog), {
        to: email,
        subject: payload.title,
        body: payload.body,
        createdAt,
      });
    }
  }
}
