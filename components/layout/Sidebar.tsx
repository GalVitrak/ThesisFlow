"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navForRole } from "@/lib/nav";
import { useI18n } from "@/components/i18n/I18nProvider";
import type { UserRole } from "@/lib/types";
import styles from "./Sidebar.module.css";

export function Sidebar({ role }: { role: UserRole | undefined }) {
  const { locale, t } = useI18n();
  const pathname = usePathname();
  const items = navForRole(role);

  return (
    <aside className={styles.aside}>
      <div className={styles.brand}>
        <strong>{t("app.name")}</strong>
        <span>{t("app.tagline")}</span>
      </div>
      <nav className={styles.nav} aria-label="Main">
        {items.map((item) => {
          const href = `/${locale}${item.href}`;
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={item.href}
              href={href}
              className={`${styles.link} ${active ? styles.linkActive : ""}`}
            >
              {t(item.labelKey)}
            </Link>
          );
        })}
      </nav>
      <div className={styles.footer}>HIT · MVP</div>
    </aside>
  );
}
