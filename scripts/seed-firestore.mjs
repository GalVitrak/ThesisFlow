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
  { email: "supervisor2@test.com", displayName: "ד״ר מיכל כהן", role: "supervisor", facultyId: "fac-cs" },
  { email: "supervisor3@test.com", displayName: "פרופ׳ דנה לוי", role: "supervisor", facultyId: "fac-edtech" },
  { email: "student2@test.com", displayName: "רוני לוי", role: "student", facultyId: "fac-edtech" },
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
    { id: "fac-cs", nameHe: "הפקולטה למדעי המחשב", nameEn: "Computer Science", degreeTypes: ["bachelor", "master"] },
    { id: "fac-eng", nameHe: "הפקולטה להנדסה", nameEn: "Engineering", degreeTypes: ["bachelor", "master"] },
    { id: "fac-edtech", nameHe: "הפקולטה לטכנולוגיות למידה", nameEn: "Learning Technologies", degreeTypes: ["bachelor"] },
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
  const sup2Uid = uids["supervisor2@test.com"];
  const sup3Uid = uids["supervisor3@test.com"];
  const studUid = uids["student@test.com"];
  const stud2Uid = uids["student2@test.com"];
  const examUid = uids["examiner@test.com"];

  const seedDate = (y, m, d, h = 9, min = 0) => new Date(Date.UTC(y, m, d, h, min)).toISOString();

  const writeBatch = db.batch();
  writeBatch.set(db.collection("milestoneTemplates").doc("tpl-cs-bsc"), {
    facultyId: "fac-cs",
    degreeType: "bachelor",
    steps: [
      { key: "research_proposal", titleHe: "הצעת מחקר", titleEn: "Research proposal", defaultOffsetDays: 21 },
      { key: "progress_report", titleHe: "דו״ח התקדמות", titleEn: "Progress report", defaultOffsetDays: 60 },
      { key: "final_report", titleHe: "דו״ח מסכם", titleEn: "Final report", defaultOffsetDays: 120 },
      { key: "defense", titleHe: "בחינת הגנה", titleEn: "Defense exam", defaultOffsetDays: 150 },
    ],
  });

  writeBatch.set(db.collection("gradingWeights").doc("gw-cs-bsc"), {
    facultyId: "fac-cs",
    degreeType: "bachelor",
    weights: { researchProposal: 0.2, progressReport: 0.2, finalReport: 0.35, defense: 0.25 },
  });

  writeBatch.set(db.collection("projectProposals").doc("prop-1"), {
    facultyId: "fac-cs",
    title: "מערכת לניהול פרויקטי גמר ותזות",
    summary: "מערכת לניהול הצעות, מועמדויות, אבני דרך, הגשות וציונים.",
    supervisorId: supUid,
    degreeType: "bachelor",
    status: "open",
    capacity: 2,
    tags: ["React", "Firebase", "AI"],
  });
  writeBatch.set(db.collection("projectProposals").doc("prop-2"), {
    facultyId: "fac-cs",
    title: "ניתוח מסמכים רפואיים בעזרת AI",
    summary: "מערכת OCR ו-NLP לסיכום מסמכים רפואיים והפקת תובנות.",
    supervisorId: sup2Uid,
    degreeType: "master",
    status: "open",
    capacity: 1,
    tags: ["AI", "OCR", "Healthcare"],
  });
  writeBatch.set(db.collection("projectProposals").doc("prop-3"), {
    facultyId: "fac-edtech",
    title: "מערכת המלצות לקורסים",
    summary: "מערכת המלצות מותאמות אישית לבחירת קורסים.",
    supervisorId: sup3Uid,
    degreeType: "bachelor",
    status: "closed",
    capacity: 1,
    tags: ["Recommendation System", "Data"],
  });

  writeBatch.set(db.collection("applications").doc("app-1"), {
    proposalId: "prop-1",
    studentId: studUid,
    cvUrl: "https://example.com/cv/student-demo",
    gradesSummary: "ממוצע 89, קורסים רלוונטיים: הנדסת תוכנה 95, בסיסי נתונים 90",
    status: "approved",
    notes: "אושר לאחר ראיון קצר.",
    createdAt: seedDate(2026, 4, 20),
  });
  writeBatch.set(db.collection("applications").doc("app-2"), {
    proposalId: "prop-2",
    studentId: studUid,
    cvUrl: "https://example.com/cv/student-demo-2",
    gradesSummary: "ממוצע 89, ניסיון עם Python ו-OCR",
    status: "pending",
    createdAt: seedDate(2026, 4, 28),
  });
  writeBatch.set(db.collection("applications").doc("app-3"), {
    proposalId: "prop-3",
    studentId: stud2Uid,
    cvUrl: "https://example.com/cv/student-2",
    gradesSummary: "ממוצע 84, ניסיון ב-Data Analysis",
    status: "meeting_requested",
    notes: "נדרשת פגישת התאמה לפני החלטה.",
    createdAt: seedDate(2026, 4, 25),
  });

  writeBatch.set(db.collection("activeProjects").doc("proj-1"), {
    proposalId: "prop-1",
    studentId: studUid,
    supervisorId: supUid,
    facultyId: "fac-cs",
    title: "מערכת לניהול פרויקטי גמר ותזות",
    status: "active",
    currentMilestoneOrder: 2,
    examinerIds: [examUid],
  });

  writeBatch.set(db.collection("milestones").doc("mil-1"), {
    projectId: "proj-1",
    templateKey: "research_proposal",
    titleHe: "הצעת מחקר",
    titleEn: "Research proposal",
    order: 1,
    dueDate: seedDate(2026, 4, 20),
    status: "approved",
  });
  writeBatch.set(db.collection("milestones").doc("mil-2"), {
    projectId: "proj-1",
    templateKey: "progress_report",
    titleHe: "דו״ח התקדמות",
    titleEn: "Progress report",
    order: 2,
    dueDate: seedDate(2026, 5, 15),
    status: "pending",
  });
  writeBatch.set(db.collection("milestones").doc("mil-3"), {
    projectId: "proj-1",
    templateKey: "final_report",
    titleHe: "דו״ח מסכם",
    titleEn: "Final report",
    order: 3,
    dueDate: seedDate(2026, 7, 31),
    status: "pending",
  });
  writeBatch.set(db.collection("milestones").doc("mil-4"), {
    projectId: "proj-1",
    templateKey: "defense",
    titleHe: "בחינת הגנה",
    titleEn: "Defense exam",
    order: 4,
    dueDate: seedDate(2026, 8, 20),
    status: "pending",
  });

  writeBatch.set(db.collection("submissions").doc("sub-1"), {
    projectId: "proj-1",
    milestoneId: "mil-1",
    type: "research_proposal",
    fileUrl: "https://example.com/submissions/research-proposal.pdf",
    submittedAt: seedDate(2026, 4, 19),
    status: "approved",
  });

  writeBatch.set(db.collection("reviews").doc("rev-1"), {
    submissionId: "sub-1",
    reviewerId: supUid,
    role: "supervisor",
    scores: { quality: 90, methodology: 88 },
    comment: "הצעת המחקר אושרה. אפשר להתקדם לדו״ח התקדמות.",
    decision: "approve",
    createdAt: seedDate(2026, 4, 20),
  });

  writeBatch.set(db.collection("defenseExams").doc("def-1"), {
    projectId: "proj-1",
    scheduledAt: seedDate(2026, 8, 20, 10, 0),
    roomOrLink: "בניין 3, חדר 205",
    examinerIds: [examUid],
    status: "scheduled",
  });
  writeBatch.set(db.collection("defenseExams").doc("def-2"), {
    projectId: "proj-1",
    scheduledAt: seedDate(2026, 8, 30, 14, 0),
    roomOrLink: "טרם נקבע",
    examinerIds: [examUid],
    status: "cancelled",
  });

  writeBatch.set(db.collection("notifications").doc("notif-1"), {
    userId: studUid,
    title: "הצעת המחקר אושרה על ידי המנחה",
    body: "הצעת המחקר אושרה על ידי המנחה.",
    type: "review",
    read: false,
    createdAt: seedDate(2026, 4, 21),
    emailPlaceholderSent: true,
  });
  writeBatch.set(db.collection("notifications").doc("notif-2"), {
    userId: studUid,
    title: "יש להגיש דו״ח התקדמות עד 15/06/2026",
    body: "יש להגיש דו״ח התקדמות עד 15/06/2026.",
    type: "milestone",
    read: false,
    createdAt: seedDate(2026, 5, 1),
    emailPlaceholderSent: true,
  });
  writeBatch.set(db.collection("notifications").doc("notif-3"), {
    userId: studUid,
    title: "המנחה ביקש עדכון לגבי סטטוס הפרויקט",
    body: "המנחה ביקש עדכון לגבי סטטוס הפרויקט.",
    type: "project",
    read: false,
    createdAt: seedDate(2026, 5, 5),
    emailPlaceholderSent: true,
  });
  writeBatch.set(db.collection("notifications").doc("notif-4"), {
    userId: supUid,
    title: "ממתינות מועמדויות חדשות לסקירה",
    body: "יש 2 מועמדויות שממתינות לסקירה.",
    type: "application",
    read: false,
    createdAt: seedDate(2026, 5, 5),
    emailPlaceholderSent: true,
  });

  writeBatch.set(db.collection("emailLog").doc("em-1"), {
    to: "student@test.com",
    subject: "אישור הצעת מחקר",
    body: "הצעת המחקר אושרה על ידי המנחה.",
    createdAt: seedDate(2026, 4, 21),
  });

  await writeBatch.commit();

  console.log("Seeded full demo dataset: faculties/users/proposals/applications/project/milestones/submissions/reviews/defense/notifications.");
  console.log("Demo password for all:", pw);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
