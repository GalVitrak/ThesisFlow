"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/components/i18n/I18nProvider";
import { useAuth } from "@/components/auth/AuthProvider";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { Button } from "@/components/ui/Button";
import type { Notification } from "@/lib/types";
import {
  countUnreadNotifications,
  listNotificationsForUser,
  markNotificationRead,
} from "@/lib/services/notificationService";
import styles from "./TopBar.module.css";

export function TopBar({
  isMobile,
  sidebarCollapsed,
  mobileNavOpen,
  onMenuButtonClick,
}: {
  isMobile: boolean;
  sidebarCollapsed: boolean;
  mobileNavOpen: boolean;
  onMenuButtonClick: () => void;
}) {
  const { locale, t } = useI18n();
  const { user, signOut } = useAuth();
  const pathname = usePathname();
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);

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

  const sidebarExpanded = isMobile ? mobileNavOpen : !sidebarCollapsed;
  const menuAriaLabel = isMobile
    ? mobileNavOpen
      ? t("nav.closeMenu")
      : t("nav.openNavigation")
    : sidebarCollapsed
      ? t("nav.expandSidebar")
      : t("nav.collapseSidebar");

  const notifAriaLabel =
    unread > 0
      ? `${t("nav.notifications")}, ${unread} ${t("nav.unreadLabel")}`
      : t("nav.notifications");

  const badgeText = unread > 99 ? "99+" : String(unread);

  return (
    <header className={styles.bar}>
      <div className={styles.left}>
        <Button
          variant="secondary"
          size="sm"
          type="button"
          className={styles.burger}
          onClick={onMenuButtonClick}
          aria-label={menuAriaLabel}
          aria-expanded={sidebarExpanded}
        >
          <span className={styles.burgerIcon} aria-hidden>
            <span />
            <span />
            <span />
          </span>
        </Button>
        <span className={styles.user}>
          {user ? (
            <>
              <span className={styles.userName}>{user.displayName}</span>
              <span className={styles.userRole}>{t(`roles.${user.role}`)}</span>
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
              type="button"
              className={styles.notifBtn}
              onClick={async () => {
                setNotifOpen((v) => !v);
                await refreshNotifs();
              }}
              aria-label={notifAriaLabel}
              aria-expanded={notifOpen}
            >
              <span className={styles.notifBtnInner} aria-hidden>
                <span className={styles.notifBell}>🔔</span>
                {unread > 0 ? (
                  <span className={styles.notifBadge}>{badgeText}</span>
                ) : null}
              </span>
            </Button>
            <Button variant="ghost" size="sm" type="button" onClick={() => void signOut()}>
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
                    type="button"
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
    </header>
  );
}
