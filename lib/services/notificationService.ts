import { getDataSource } from "./dataSource";
import { getDb, patchDb, uid } from "@/lib/mock/store";
import type { NotifyPayload } from "@/lib/types";
import * as firebaseNotification from "./firebase/notificationService.firebase";

function appendEmailLog(to: string, subject: string, body: string) {
  patchDb((d) => {
    d.emailLog.unshift({
      id: uid("em"),
      to,
      subject,
      body,
      createdAt: new Date().toISOString(),
    });
  });
}

function mockNotify({ userIds, title, body, type, ruleKey }: NotifyPayload) {
  const rules = getDb().notificationRules;
  if (ruleKey && rules[ruleKey] === false) return;

  const admin = getDb().users.find((u) => u.role === "admin");

  const targets = new Set(userIds);
  if (admin) targets.add(admin.id);

  patchDb((d) => {
    for (const userId of targets) {
      const user = d.users.find((u) => u.id === userId);
      d.notifications.unshift({
        id: uid("notif"),
        userId,
        title,
        body,
        type,
        read: false,
        createdAt: new Date().toISOString(),
        emailPlaceholderSent: true,
      });
      if (user) {
        d.emailLog.unshift({
          id: uid("em"),
          to: user.email,
          subject: title,
          body,
          createdAt: new Date().toISOString(),
        });
      }
    }
  });
}

export async function notify(payload: NotifyPayload) {
  if (getDataSource() === "firebase") {
    return firebaseNotification.notify(payload);
  }
  mockNotify(payload);
}

export async function listNotificationsForUser(userId: string) {
  if (getDataSource() === "firebase") {
    return firebaseNotification.listNotificationsForUser(userId);
  }
  return getDb().notifications.filter((n) => n.userId === userId);
}

export async function markNotificationRead(id: string, userId: string) {
  if (getDataSource() === "firebase") {
    return firebaseNotification.markNotificationRead(id, userId);
  }
  patchDb((d) => {
    const n = d.notifications.find((x) => x.id === id && x.userId === userId);
    if (n) n.read = true;
  });
}

export async function countUnreadNotifications(userId: string): Promise<number> {
  if (getDataSource() === "firebase") {
    return firebaseNotification.countUnreadNotifications(userId);
  }
  return getDb().notifications.filter((n) => n.userId === userId && !n.read).length;
}

export async function getEmailLog() {
  if (getDataSource() === "firebase") {
    return firebaseNotification.getEmailLog();
  }
  return getDb().emailLog;
}

export { appendEmailLog };
