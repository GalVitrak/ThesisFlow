"use client";

import { usePathname, useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n/config";
import { locales } from "@/lib/i18n/config";
import styles from "./TopBar.module.css";

export function LocaleSwitcher({ active }: { active: Locale }) {
  const pathname = usePathname();
  const router = useRouter();

  function switchLocale(next: Locale) {
    const parts = pathname.split("/").filter(Boolean);
    if (parts.length === 0) {
      router.push(`/${next}/dashboard`);
      return;
    }
    parts[0] = next;
    router.push(`/${parts.join("/")}`);
  }

  return (
    <div className={styles.lang} role="group" aria-label="Language">
      {locales.map((l) => (
        <button
          key={l}
          type="button"
          className={l === active ? styles.langActive : undefined}
          onClick={() => switchLocale(l)}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
