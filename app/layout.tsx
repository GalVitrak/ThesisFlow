import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ThesisFlow — ניהול פרויקטי גמר",
  description: "מערכת לניהול פרויקטי גמר ותזות",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning lang="he">
      <body className="bodyRoot">{children}</body>
    </html>
  );
}
