"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import styles from "./AppShell.module.css";
import { useIsMobileLayout } from "@/lib/useMediaQuery";
import type { UserRole } from "@/lib/types";

export function AppShell({
  title,
  role,
  children,
}: {
  title: string;
  role: UserRole | undefined;
  children: React.ReactNode;
}) {
  const isMobile = useIsMobileLayout();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  function handleMenuButtonClick() {
    if (isMobile) {
      setMobileNavOpen((open) => !open);
    } else {
      setSidebarCollapsed((c) => !c);
    }
  }

  return (
    <div className={styles.shell}>
      <Sidebar
        role={role}
        collapsed={!isMobile && sidebarCollapsed}
        mobileOpen={isMobile && mobileNavOpen}
        onMobileClose={() => setMobileNavOpen(false)}
        isMobile={isMobile}
      />
      <div className={styles.main}>
        <TopBar
          isMobile={isMobile}
          sidebarCollapsed={sidebarCollapsed}
          mobileNavOpen={mobileNavOpen}
          onMenuButtonClick={handleMenuButtonClick}
        />
        <main className={styles.content}>
          <h1 className={styles.pageTitle}>{title}</h1>
          {children}
        </main>
      </div>
    </div>
  );
}
