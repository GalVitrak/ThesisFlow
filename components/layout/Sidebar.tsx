"use client";

import Link from "next/link";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { navForRole } from "@/lib/nav";
import { useI18n } from "@/components/i18n/I18nProvider";
import { BrandBlock } from "@/components/branding/BrandBlock";
import { Button } from "@/components/ui/Button";
import type { UserRole } from "@/lib/types";
import styles from "./Sidebar.module.css";

const NAV_ICONS: Record<string, string> = {
  "nav.dashboard": "🏠",
  "nav.proposals": "📚",
  "nav.submissions": "📤",
  "nav.reviews": "📝",
  "nav.defense": "🎓",
  "nav.admin": "⚙️",
};

function NavLinks({
  role,
  onNavigate,
}: {
  role: UserRole | undefined;
  onNavigate?: () => void;
}) {
  const { locale, t } = useI18n();
  const pathname = usePathname();
  const items = navForRole(role);

  return (
    <nav className={styles.nav} aria-label="Main">
      {items.map((item) => {
        const href = `/${locale}${item.href}`;
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={item.href}
            href={href}
            className={`${styles.link} ${active ? styles.linkActive : ""}`}
            onClick={onNavigate}
          >
            <span className={styles.linkInner}>
              <span className={styles.linkIcon} aria-hidden>
                {NAV_ICONS[item.labelKey] ?? "•"}
              </span>
              <span>{t(item.labelKey)}</span>
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

export function Sidebar({
  role,
  collapsed,
  mobileOpen,
  onMobileClose,
  isMobile,
}: {
  role: UserRole | undefined;
  collapsed: boolean;
  mobileOpen: boolean;
  onMobileClose: () => void;
  isMobile: boolean;
}) {
  const { t, locale } = useI18n();
  const hitUrl = locale === "he" ? "https://www.hit.ac.il/" : "https://www.hit.ac.il/en";

  useEffect(() => {
    if (!isMobile || !mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isMobile, mobileOpen]);

  return (
    <>
      <aside
        className={`${styles.aside} ${collapsed ? styles.asideCollapsed : ""} ${isMobile ? styles.asideHiddenMobile : ""}`}
        aria-hidden={collapsed && !isMobile}
      >
        <BrandBlock variant="onDark" />
        <NavLinks role={role} />
        <div className={styles.footer}>
          <p className={styles.footerText}>{t("app.footerNote")}</p>
          <Link href={hitUrl} className={styles.footerLink} target="_blank" rel="noopener noreferrer">
            {t("app.hitWebsite")}
          </Link>
          <span className={styles.footerMvp}> · {t("app.mvpBadge")}</span>
        </div>
      </aside>

      {isMobile && mobileOpen ? (
        <>
          <div
            className={styles.backdrop}
            role="presentation"
            aria-hidden
            onClick={onMobileClose}
          />
          <div className={styles.mobileDrawer} role="dialog" aria-modal="true" aria-label={t("nav.navigationMenu")}>
            <div className={styles.mobileDrawerHeader}>
              <BrandBlock variant="onDark" />
              <Button variant="ghost" size="sm" type="button" onClick={onMobileClose} aria-label={t("nav.closeMenu")}>
                ✕
              </Button>
            </div>
            <NavLinks role={role} onNavigate={onMobileClose} />
            <div className={styles.footer}>
              <p className={styles.footerText}>{t("app.footerNote")}</p>
              <Link
                href={hitUrl}
                className={styles.footerLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onMobileClose}
              >
                {t("app.hitWebsite")}
              </Link>
              <span className={styles.footerMvp}> · {t("app.mvpBadge")}</span>
            </div>
          </div>
        </>
      ) : null}
    </>
  );
}
