import type { ButtonHTMLAttributes } from "react";
import styles from "./Button.module.css";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "md" | "sm";

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  const classes = [
    styles.button,
    variant === "primary" && styles.primary,
    variant === "secondary" && styles.secondary,
    variant === "ghost" && styles.ghost,
    variant === "danger" && styles.danger,
    size === "sm" && styles.sm,
    className,
  ]
    .filter(Boolean)
    .join(" ");
  return <button type={type} className={classes} {...props} />;
}
