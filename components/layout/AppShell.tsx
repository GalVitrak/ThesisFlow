"use client";

import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import styles from "./AppShell.module.css";
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
  return (
    <div className={styles.shell}>
      <Sidebar role={role} />
      <div className={styles.main}>
        <TopBar role={role} />
        <main className={styles.content}>
          <h1 className={styles.pageTitle}>{title}</h1>
          {children}
        </main>
      </div>
    </div>
  );
}
