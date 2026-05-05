/**
 * Seed Firestore + Auth for ThesisFlow demo.
 *
 * Prerequisites:
 *   npm install firebase-admin --save-dev
 *
 * Run (PowerShell):
 *   $env:GOOGLE_APPLICATION_CREDENTIALS="C:\path\to\serviceAccount.json"
 *   node scripts/seed-firestore.mjs
 *
 * Or place serviceAccount.json in project root and:
 *   set GOOGLE_APPLICATION_CREDENTIALS=serviceAccount.json && node scripts/seed-firestore.mjs
 *
 * Default password for all demo users: DemoPass123!
 */
import { createRequire } from "module";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

const require = createRequire(import.meta.url);
let admin;
try {
  admin = require("firebase-admin");
} catch {
  console.error("Install firebase-admin: npm install firebase-admin --save-dev");
  process.exit(1);
}

const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || resolve("serviceAccount.json");
if (!existsSync(credPath)) {
  console.error("Set GOOGLE_APPLICATION_CREDENTIALS to your Firebase service account JSON path.");
  process.exit(1);
}

const serviceAccount = JSON.parse(readFileSync(credPath, "utf8"));
if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}

const auth = admin.auth();
const db = admin.firestore();
const pw = process.env.SEED_USER_PASSWORD || "DemoPass123!";

const accounts = [
  { email: "student@test.com", displayName: "Student Demo", role: "student", facultyId: "fac-cs" },
  { email: "supervisor@test.com", displayName: "Supervisor Demo", role: "supervisor", facultyId: "fac-cs" },
  { email: "examiner@test.com", displayName: "Examiner Demo", role: "examiner", facultyId: "fac-cs" },
  { email: "admin@test.com", displayName: "Admin Demo", role: "admin" },
];

async function ensureUser(email, displayName, password) {
  try {
    const u = await auth.getUserByEmail(email);
    return u.uid;
  } catch {
    const u = await auth.createUser({ email, password, displayName, emailVerified: true });
    return u.uid;
  }
}

async function main() {
  const uids = {};
  for (const a of accounts) {
    uids[a.email] = await ensureUser(a.email, a.displayName, pw);
    await db.collection("users").doc(uids[a.email]).set({
      email: a.email,
      displayName: a.displayName,
      role: a.role,
      ...(a.facultyId ? { facultyId: a.facultyId } : {}),
    });
    console.log("User OK:", a.email, uids[a.email]);
  }

  const batch = db.batch();
  const facs = [
    { id: "fac-cs", nameHe: "מדעי המחשב", nameEn: "Computer Science", degreeTypes: ["bachelor", "master"] },
    { id: "fac-ee", nameHe: "הנדסת חשמל", nameEn: "Electrical Engineering", degreeTypes: ["bachelor", "master"] },
    { id: "fac-design", nameHe: "עיצוב", nameEn: "Design", degreeTypes: ["bachelor"] },
  ];
  for (const f of facs) {
    batch.set(db.collection("faculties").doc(f.id), f);
  }

  batch.set(db.collection("settings").doc("global"), {
    on_application: true,
    on_submission: true,
    on_review: true,
    on_defense_scheduled: true,
  });

  await batch.commit();

  const supUid = uids["supervisor@test.com"];
  const studUid = uids["student@test.com"];
  const ex1 = uids["examiner@test.com"];

  await db.collection("milestoneTemplates").doc("tpl-cs-bsc").set({
    facultyId: "fac-cs",
    degreeType: "bachelor",
    steps: [
      { key: "research_proposal", titleHe: "הצעת מחקר", titleEn: "Research proposal", defaultOffsetDays: 30 },
      { key: "progress_report", titleHe: "דוח התקדמות", titleEn: "Progress report", defaultOffsetDays: 120 },
      { key: "final_report", titleHe: "דוח מסכם", titleEn: "Final report", defaultOffsetDays: 200 },
      { key: "defense", titleHe: "בחינת הגנה", titleEn: "Defense exam", defaultOffsetDays: 240 },
    ],
  });

  await db.collection("gradingWeights").doc("gw-cs-bsc").set({
    facultyId: "fac-cs",
    degreeType: "bachelor",
    weights: { supervisor: 0.25, coordinator: 0.15, examiner1: 0.25, examiner2: 0.25, milestones: 0.1 },
  });

  await db.collection("projectProposals").doc("prop-seed-1").set({
    facultyId: "fac-cs",
    title: "פרויקט הדגמה — ניתוח נתונים",
    summary: "תיאור קצר לפרויקט הדגמה במערכת.",
    supervisorId: supUid,
    degreeType: "bachelor",
    status: "open",
    capacity: 2,
    tags: ["demo"],
  });

  await db.collection("activeProjects").doc("proj-seed-1").set({
    proposalId: "prop-seed-1",
    studentId: studUid,
    supervisorId: supUid,
    facultyId: "fac-cs",
    title: "פרויקט פעיל להדגמה",
    status: "active",
    currentMilestoneOrder: 1,
    examinerIds: ex1 ? [ex1] : [],
  });

  console.log("Seeded faculties, settings, template, weights, sample proposal + active project.");
  console.log("Demo password for all:", pw);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
