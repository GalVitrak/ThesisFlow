"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navForRole } from "@/lib/nav";
import { useI18n } from "@/components/i18n/I18nProvider";
import { useAuth } from "@/components/auth/AuthProvider";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { Button } from "@/components/ui/Button";
import type { UserRole } from "@/lib/types";
import type { Notification } from "@/lib/types";
import {
  countUnreadNotifications,
  listNotificationsForUser,
  markNotificationRead,
} from "@/lib/services/notificationService";
import styles from "./TopBar.module.css";

export function TopBar({ role }: { role: UserRole | undefined }) {
  const { locale, t } = useI18n();
  const { user, signOut } = useAuth();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);

  const items = useMemo(() => navForRole(role), [role]);

  async function refreshNotifs() {
    if (!user) return;
    setNotifs(await listNotificationsForUser(user.id));
    setUnread(await countUnreadNotifications(user.id));
  }

  useEffect(() => {
    if (!user) {
      setUnread(0);
      return;
    }
    void countUnreadNotifications(user.id).then(setUnread);
  }, [user, pathname]);

  return (
    <header className={styles.bar}>
      <div className={styles.left}>
        <Button
          variant="secondary"
          size="sm"
          className={styles.burger}
          onClick={() => setMenuOpen(true)}
        >
          ☰
        </Button>
        <span className={styles.user}>
          {user ? (
            <>
              {user.displayName} · {t(`roles.${user.role}`)}
            </>
          ) : (
            t("nav.login")
          )}
        </span>
      </div>
      <div className={styles.right}>
        <LocaleSwitcher active={locale} />
        {user ? (
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={async () => {
                setNotifOpen((v) => !v);
                await refreshNotifs();
              }}
              aria-label="Notifications"
            >
              🔔{unread > 0 ? ` (${unread})` : ""}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => void signOut()}
            >
              {t("nav.logout")}
            </Button>
          </>
        ) : (
          <Link href={`/${locale}/login`}>{t("nav.login")}</Link>
        )}
      </div>

      {notifOpen && user ? (
        <div className={styles.notifPanel}>
          {notifs.length === 0 ? (
            <div className={styles.notifItem}>{t("common.empty")}</div>
          ) : (
            notifs.slice(0, 12).map((n) => (
              <div
                key={n.id}
                className={`${styles.notifItem} ${n.read ? "" : styles.notifItemUnread}`}
              >
                <div>
                  <strong>{n.title}</strong>
                </div>
                <div>{n.body}</div>
                {!n.read ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={async () => {
                      await markNotificationRead(n.id, user.id);
                      await refreshNotifs();
                    }}
                  >
                    {t("common.markRead")}
                  </Button>
                ) : null}
              </div>
            ))
          )}
        </div>
      ) : null}

      {menuOpen ? (
        <>
          <div
            className={styles.menuBackdrop}
            role="presentation"
            onMouseDown={() => setMenuOpen(false)}
          />
          <div className={styles.drawer}>
            <div className={styles.drawerNav}>
              {items.map((item) => {
                const href = `/${locale}${item.href}`;
                const active = pathname === href;
                return (
                  <Link
                    key={item.href}
                    href={href}
                    className={styles.drawerLink}
                    onClick={() => setMenuOpen(false)}
                    style={{ opacity: active ? 1 : 0.9 }}
                  >
                    {t(item.labelKey)}
                  </Link>
                );
              })}
            </div>
            <Button variant="secondary" onClick={() => setMenuOpen(false)}>
              {t("common.cancel")}
            </Button>
          </div>
        </>
      ) : null}
    </header>
  );
}
