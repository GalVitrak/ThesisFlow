import type { UserRole } from "@/lib/types";

export type NavItem = {
  href: string;
  labelKey: string;
  roles: UserRole[];
};

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", labelKey: "nav.dashboard", roles: ["student", "supervisor", "examiner", "admin"] },
  { href: "/proposals", labelKey: "nav.proposals", roles: ["student", "supervisor", "admin"] },
  { href: "/submissions", labelKey: "nav.submissions", roles: ["student", "supervisor", "examiner", "admin"] },
  { href: "/reviews", labelKey: "nav.reviews", roles: ["supervisor", "examiner", "admin"] },
  { href: "/defense", labelKey: "nav.defense", roles: ["student", "supervisor", "examiner", "admin"] },
  { href: "/admin", labelKey: "nav.admin", roles: ["admin"] },
];

export function navForRole(role: UserRole | undefined) {
  if (!role) return [];
  return NAV_ITEMS.filter((i) => i.roles.includes(role));
}
