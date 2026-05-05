"use client";

import Image from "next/image";
import styles from "./HitLogo.module.css";

type Props = {
  className?: string;
  /** onDark: white plate so the JPG (white background) fits the navy sidebar. */
  variant?: "onDark" | "onLight";
};

/** Official-style HIT mark from `public/branding/hit-logo-50.jpg` (Commons). Links to HIT. */
export function HitLogo({ className = "", variant = "onDark" }: Props) {
  return (
    <a
      href="https://www.hit.ac.il/"
      target="_blank"
      rel="noopener noreferrer"
      className={`${styles.wrap} ${variant === "onLight" ? styles.onLight : styles.onDark} ${className}`}
      aria-label="HIT — Holon Institute of Technology / מכון טכנולוגי חולון"
    >
      <span className={styles.plate}>
        <Image
          src="/branding/hit-logo-50.jpg"
          alt=""
          width={640}
          height={220}
          sizes="(max-width: 480px) 200px, (max-width: 900px) 240px, 260px"
          className={styles.img}
          priority
        />
      </span>
    </a>
  );
}
