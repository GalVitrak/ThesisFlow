import type {
  ActiveProject,
  Application,
  DefenseExam,
  EmailLogEntry,
  Faculty,
  GradingWeights,
  Milestone,
  MilestoneTemplate,
  Notification,
  NotificationRules,
  ProjectProposal,
  Review,
  Submission,
  User,
} from "@/lib/types";

export type MockDb = {
  users: User[];
  faculties: Faculty[];
  projectProposals: ProjectProposal[];
  applications: Application[];
  activeProjects: ActiveProject[];
  milestones: Milestone[];
  submissions: Submission[];
  reviews: Review[];
  defenseExams: DefenseExam[];
  gradingWeights: GradingWeights[];
  notifications: Notification[];
  milestoneTemplates: MilestoneTemplate[];
  notificationRules: NotificationRules;
  emailLog: EmailLogEntry[];
};

const iso = (d: Date) => d.toISOString();

export function buildSeed(): MockDb {
  const faculties: Faculty[] = [
    { id: "fac-cs", nameHe: "הפקולטה למדעי המחשב", nameEn: "Computer Science", degreeTypes: ["bachelor", "master"] },
    { id: "fac-eng", nameHe: "הפקולטה להנדסה", nameEn: "Engineering", degreeTypes: ["bachelor", "master"] },
    { id: "fac-edtech", nameHe: "הפקולטה לטכנולוגיות למידה", nameEn: "Learning Technologies", degreeTypes: ["bachelor"] },
  ];

  const users: User[] = [
    { id: "stud-1", email: "student@test.com", displayName: "Student Demo", role: "student", facultyId: "fac-cs" },
    { id: "sup-1", email: "supervisor@test.com", displayName: "Supervisor Demo", role: "supervisor", facultyId: "fac-cs" },
    { id: "admin-1", email: "admin@test.com", displayName: "Admin Demo", role: "admin" },
    { id: "exam-1", email: "examiner@test.com", displayName: "Examiner Demo", role: "examiner", facultyId: "fac-cs" },
    { id: "sup-2", email: "supervisor2@test.com", displayName: "ד״ר מיכל כהן", role: "supervisor", facultyId: "fac-cs" },
    { id: "sup-3", email: "supervisor3@test.com", displayName: "פרופ׳ דנה לוי", role: "supervisor", facultyId: "fac-edtech" },
    { id: "stud-2", email: "student2@test.com", displayName: "רוני לוי", role: "student", facultyId: "fac-edtech" },
  ];

  const milestoneTemplates: MilestoneTemplate[] = [
    {
      id: "tpl-cs-bsc",
      facultyId: "fac-cs",
      degreeType: "bachelor",
      steps: [
        { key: "research_proposal", titleHe: "הצעת מחקר", titleEn: "Research proposal", defaultOffsetDays: 21 },
        { key: "progress_report", titleHe: "דו״ח התקדמות", titleEn: "Progress report", defaultOffsetDays: 60 },
        { key: "final_report", titleHe: "דו״ח מסכם", titleEn: "Final report", defaultOffsetDays: 120 },
        { key: "defense", titleHe: "בחינת הגנה", titleEn: "Defense exam", defaultOffsetDays: 150 },
      ],
    },
  ];

  const projectProposals: ProjectProposal[] = [
    {
      id: "prop-1",
      facultyId: "fac-cs",
      title: "מערכת לניהול פרויקטי גמר ותזות",
      summary: "מערכת לניהול הצעות, מועמדויות, אבני דרך, הגשות וציונים.",
      supervisorId: "sup-1",
      degreeType: "bachelor",
      status: "open",
      capacity: 2,
      tags: ["React", "Firebase", "AI"],
    },
    {
      id: "prop-2",
      facultyId: "fac-cs",
      title: "ניתוח מסמכים רפואיים בעזרת AI",
      summary: "מערכת OCR ו-NLP לסיכום מסמכים רפואיים והפקת תובנות.",
      supervisorId: "sup-2",
      degreeType: "master",
      status: "open",
      capacity: 1,
      tags: ["AI", "OCR", "Healthcare"],
    },
    {
      id: "prop-3",
      facultyId: "fac-edtech",
      title: "מערכת המלצות לקורסים",
      summary: "מערכת המלצות מותאמות אישית לבחירת קורסים.",
      supervisorId: "sup-3",
      degreeType: "bachelor",
      status: "closed",
      capacity: 1,
      tags: ["Recommendation System", "Data"],
    },
  ];

  const applications: Application[] = [
    {
      id: "app-1",
      proposalId: "prop-1",
      studentId: "stud-1",
      cvUrl: "https://example.com/cv/student-demo",
      gradesSummary: "ממוצע 89, קורסים רלוונטיים: הנדסת תוכנה 95, בסיסי נתונים 90",
      status: "approved",
      notes: "אושר לאחר ראיון קצר.",
      createdAt: iso(new Date(2026, 4, 20)),
    },
    {
      id: "app-2",
      proposalId: "prop-2",
      studentId: "stud-1",
      cvUrl: "https://example.com/cv/student-demo-2",
      gradesSummary: "ממוצע 89, ניסיון עם Python ו-OCR",
      status: "pending",
      createdAt: iso(new Date(2026, 4, 28)),
    },
    {
      id: "app-3",
      proposalId: "prop-3",
      studentId: "stud-2",
      cvUrl: "https://example.com/cv/student-2",
      gradesSummary: "ממוצע 84, ניסיון ב-Data Analysis",
      status: "meeting_requested",
      notes: "נדרשת פגישת התאמה לפני החלטה.",
      createdAt: iso(new Date(2026, 4, 25)),
    },
  ];

  const activeProjects: ActiveProject[] = [
    {
      id: "proj-1",
      proposalId: "prop-1",
      studentId: "stud-1",
      supervisorId: "sup-1",
      facultyId: "fac-cs",
      title: "מערכת לניהול פרויקטי גמר ותזות",
      status: "active",
      currentMilestoneOrder: 2,
      examinerIds: ["exam-1"],
    },
  ];

  const milestones: Milestone[] = [
    { id: "mil-1", projectId: "proj-1", templateKey: "research_proposal", titleHe: "הצעת מחקר", titleEn: "Research proposal", order: 1, dueDate: iso(new Date(2026, 4, 20)), status: "approved" },
    { id: "mil-2", projectId: "proj-1", templateKey: "progress_report", titleHe: "דו״ח התקדמות", titleEn: "Progress report", order: 2, dueDate: iso(new Date(2026, 5, 15)), status: "pending" },
    { id: "mil-3", projectId: "proj-1", templateKey: "final_report", titleHe: "דו״ח מסכם", titleEn: "Final report", order: 3, dueDate: iso(new Date(2026, 7, 31)), status: "pending" },
    { id: "mil-4", projectId: "proj-1", templateKey: "defense", titleHe: "בחינת הגנה", titleEn: "Defense exam", order: 4, dueDate: iso(new Date(2026, 8, 20)), status: "pending" },
  ];

  const submissions: Submission[] = [
    {
      id: "sub-1",
      projectId: "proj-1",
      milestoneId: "mil-1",
      type: "research_proposal",
      fileUrl: "https://example.com/submissions/research-proposal.pdf",
      submittedAt: iso(new Date(2026, 4, 19)),
      status: "approved",
    },
  ];

  const reviews: Review[] = [
    {
      id: "rev-1",
      submissionId: "sub-1",
      reviewerId: "sup-1",
      role: "supervisor",
      scores: { quality: 90, methodology: 88 },
      comment: "הצעת המחקר אושרה. אפשר להתקדם לדו״ח התקדמות.",
      decision: "approve",
      createdAt: iso(new Date(2026, 4, 20)),
    },
  ];

  const defenseExams: DefenseExam[] = [
    {
      id: "def-1",
      projectId: "proj-1",
      scheduledAt: iso(new Date(2026, 8, 20, 10, 0)),
      roomOrLink: "בניין 3, חדר 205",
      examinerIds: ["exam-1"],
      status: "scheduled",
    },
    {
      id: "def-2",
      projectId: "proj-1",
      scheduledAt: iso(new Date(2026, 8, 30, 14, 0)),
      roomOrLink: "טרם נקבע",
      examinerIds: ["exam-1"],
      status: "cancelled",
    },
  ];

  const gradingWeights: GradingWeights[] = [
    {
      id: "gw-cs-bsc",
      facultyId: "fac-cs",
      degreeType: "bachelor",
      weights: { researchProposal: 0.2, progressReport: 0.2, finalReport: 0.35, defense: 0.25 },
    },
  ];

  const notifications: Notification[] = [
    {
      id: "notif-1",
      userId: "stud-1",
      title: "הצעת המחקר אושרה על ידי המנחה",
      body: "הצעת המחקר אושרה על ידי המנחה.",
      type: "review",
      read: false,
      createdAt: iso(new Date(2026, 4, 21)),
      emailPlaceholderSent: true,
    },
    {
      id: "notif-2",
      userId: "stud-1",
      title: "יש להגיש דו״ח התקדמות עד 15/06/2026",
      body: "יש להגיש דו״ח התקדמות עד 15/06/2026.",
      type: "milestone",
      read: false,
      createdAt: iso(new Date(2026, 5, 1)),
      emailPlaceholderSent: true,
    },
    {
      id: "notif-3",
      userId: "stud-1",
      title: "המנחה ביקש עדכון לגבי סטטוס הפרויקט",
      body: "המנחה ביקש עדכון לגבי סטטוס הפרויקט.",
      type: "project",
      read: false,
      createdAt: iso(new Date(2026, 5, 5)),
      emailPlaceholderSent: true,
    },
    {
      id: "notif-4",
      userId: "sup-1",
      title: "ממתינות מועמדויות חדשות לסקירה",
      body: "יש 2 מועמדויות שממתינות לסקירה.",
      type: "application",
      read: false,
      createdAt: iso(new Date(2026, 5, 5)),
      emailPlaceholderSent: true,
    },
  ];

  const notificationRules: NotificationRules = {
    on_application: true,
    on_submission: true,
    on_review: true,
    on_defense_scheduled: true,
  };

  const emailLog: EmailLogEntry[] = [
    {
      id: "em-1",
      to: "student@test.com",
      subject: "אישור הצעת מחקר",
      body: "הצעת המחקר אושרה על ידי המנחה.",
      createdAt: notifications[0].createdAt,
    },
  ];

  return {
    users,
    faculties,
    projectProposals,
    applications,
    activeProjects,
    milestones,
    submissions,
    reviews,
    defenseExams,
    gradingWeights,
    notifications,
    milestoneTemplates,
    notificationRules,
    emailLog,
  };
}
