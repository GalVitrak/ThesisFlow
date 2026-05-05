import type { UserRole } from "@/lib/types";

/** Default demo password for seeded Firebase users; matches `SEED_USER_PASSWORD` fallback in `scripts/seed-firestore.mjs`. */
export const DEMO_SEED_PASSWORD = "DemoPass123!";

/** Same four accounts as `scripts/seed-firestore.mjs` — shown on the login page even if Firestore `listUsers` fails. */
export type SeededDemoAccount = {
  email: string;
  displayName: string;
  role: UserRole;
};

export const SEEDED_DEMO_ACCOUNTS: SeededDemoAccount[] = [
  { email: "student@test.com", displayName: "Student Demo", role: "student" },
  { email: "supervisor@test.com", displayName: "Supervisor Demo", role: "supervisor" },
  { email: "examiner@test.com", displayName: "Examiner Demo", role: "examiner" },
  { email: "admin@test.com", displayName: "Admin Demo", role: "admin" },
];

export const SEEDED_DEMO_EMAILS = new Set(SEEDED_DEMO_ACCOUNTS.map((a) => a.email.toLowerCase()));
