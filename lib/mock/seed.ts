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

const now = new Date();
const iso = (d: Date) => d.toISOString();

export function buildSeed(): MockDb {
  const faculties: Faculty[] = [
    {
      id: "fac-cs",
      nameHe: "מדעי המחשב",
      nameEn: "Computer Science",
      degreeTypes: ["bachelor", "master"],
    },
    {
      id: "fac-ee",
      nameHe: "הנדסת חשמל",
      nameEn: "Electrical Engineering",
      degreeTypes: ["bachelor", "master"],
    },
    {
      id: "fac-design",
      nameHe: "עיצוב",
      nameEn: "Design",
      degreeTypes: ["bachelor"],
    },
  ];

  const users: User[] = [
    {
      id: "admin-1",
      email: "admin@test.com",
      displayName: "ד\"ר רונית כהן (רכז)",
      role: "admin",
    },
    {
      id: "sup-1",
      email: "supervisor@test.com",
      displayName: "פרופ' אלון לוי",
      role: "supervisor",
      facultyId: "fac-cs",
    },
    {
      id: "sup-2",
      email: "supervisor2@hit.ac.il",
      displayName: "ד\"ר מיה גרין",
      role: "supervisor",
      facultyId: "fac-ee",
    },
    {
      id: "exam-1",
      email: "examiner@test.com",
      displayName: "ד\"ר יוסי מזרחי",
      role: "examiner",
      facultyId: "fac-cs",
    },
    {
      id: "exam-2",
      email: "examiner2@hit.ac.il",
      displayName: "ד\"ר נועה שפירא",
      role: "examiner",
      facultyId: "fac-ee",
    },
    ...["stud-1", "stud-2", "stud-3", "stud-4"].map((id, i) => ({
      id,
      email: i === 0 ? "student@test.com" : `student${i + 1}@hit.ac.il`,
      displayName: ["נועם כהן", "שירה לביא", "איתי מרקו", "תמר דוד"][i],
      role: "student" as const,
      facultyId: i % 2 === 0 ? "fac-cs" : "fac-ee",
    })),
  ];

  const milestoneTemplates: MilestoneTemplate[] = [
    {
      id: "tpl-cs-bsc",
      facultyId: "fac-cs",
      degreeType: "bachelor",
      steps: [
        {
          key: "research_proposal",
          titleHe: "הצעת מחקר",
          titleEn: "Research proposal",
          defaultOffsetDays: 30,
        },
        {
          key: "progress_report",
          titleHe: "דוח התקדמות",
          titleEn: "Progress report",
          defaultOffsetDays: 120,
        },
        {
          key: "final_report",
          titleHe: "דוח מסכם",
          titleEn: "Final report",
          defaultOffsetDays: 200,
        },
        {
          key: "defense",
          titleHe: "בחינת הגנה",
          titleEn: "Defense exam",
          defaultOffsetDays: 240,
        },
        {
          key: "grading",
          titleHe: "ציון סופי",
          titleEn: "Final grade",
          defaultOffsetDays: 250,
        },
      ],
    },
    {
      id: "tpl-ee-msc",
      facultyId: "fac-ee",
      degreeType: "master",
      steps: [
        {
          key: "research_proposal",
          titleHe: "הצעת מחקר",
          titleEn: "Research proposal",
          defaultOffsetDays: 45,
        },
        {
          key: "progress_report",
          titleHe: "דוח ביניים",
          titleEn: "Mid-term report",
          defaultOffsetDays: 150,
        },
        {
          key: "final_report",
          titleHe: "תיזה / דוח מסכם",
          titleEn: "Thesis / final report",
          defaultOffsetDays: 300,
        },
        {
          key: "defense",
          titleHe: "הגנה",
          titleEn: "Defense",
          defaultOffsetDays: 330,
        },
      ],
    },
  ];

  const projectProposals: ProjectProposal[] = [
    {
      id: "prop-1",
      facultyId: "fac-cs",
      title: "זיהוי אנומליות בזרימת רשת עם למידת עומק",
      summary:
        "פיתוח מודל לזיהוי חריגות בזמן אמת בתעבורה גבוהה, כולל הערכה על סט נתונים אקדמיים.",
      supervisorId: "sup-1",
      degreeType: "bachelor",
      status: "open",
      capacity: 2,
      tags: ["ML", "Networks"],
    },
    {
      id: "prop-2",
      facultyId: "fac-cs",
      title: "כלי ניטור לשירותי מיקרו-שירותים",
      summary: "דשבורד תצוגה ואיסוף מדדים לשירותים מבוזרים.",
      supervisorId: "sup-1",
      degreeType: "master",
      status: "open",
      capacity: 1,
      tags: ["DevOps", "Observability"],
    },
    {
      id: "prop-3",
      facultyId: "fac-ee",
      title: "בקרת מנועים לרחפן עם חיסכון באנרגיה",
      summary: "מימוש אלגוריתם בקרה חסכוני ובדיקות סימולציה.",
      supervisorId: "sup-2",
      degreeType: "bachelor",
      status: "open",
      capacity: 2,
      tags: ["Control", "Robotics"],
    },
    {
      id: "prop-4",
      facultyId: "fac-ee",
      title: "עיבוד אותות RF לתקשורת 5G",
      summary: "ניתוח מדדי BER ויישום בסימולטור.",
      supervisorId: "sup-2",
      degreeType: "master",
      status: "closed",
      capacity: 1,
      tags: ["5G", "DSP"],
    },
    {
      id: "prop-5",
      facultyId: "fac-design",
      title: "חווית משתמש באפליקציית בריאות דיגיטלית",
      summary: "מחקר משתמשים, אב טיפוס ומדדי שימושיות.",
      supervisorId: "sup-1",
      degreeType: "bachelor",
      status: "open",
      capacity: 3,
      tags: ["UX", "Health"],
    },
  ];

  const applications: Application[] = [
    {
      id: "app-1",
      proposalId: "prop-1",
      studentId: "stud-1",
      cvUrl: "/mock/cv-stud-1.pdf",
      gradesSummary: "ממוצע 88 — קורסי ליבה: מבני נתונים 92, למידת מכונה 85",
      status: "pending",
      createdAt: iso(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 5)),
    },
    {
      id: "app-2",
      proposalId: "prop-3",
      studentId: "stud-2",
      cvUrl: "/mock/cv-stud-2.pdf",
      gradesSummary: "ממוצע 91",
      status: "meeting_requested",
      notes: "נקבעה פגישה לשבוע הבא",
      createdAt: iso(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 8)),
    },
    {
      id: "app-3",
      proposalId: "prop-2",
      studentId: "stud-3",
      cvUrl: "/mock/cv-stud-3.pdf",
      gradesSummary: "ממוצע 86",
      status: "rejected",
      createdAt: iso(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 20)),
    },
  ];

  const activeProjects: ActiveProject[] = [
    {
      id: "proj-1",
      proposalId: "prop-1",
      studentId: "stud-4",
      supervisorId: "sup-1",
      facultyId: "fac-cs",
      title: "זיהוי אנומליות בזרימת רשת — פרויקט פעיל",
      status: "active",
      currentMilestoneOrder: 2,
      examinerIds: ["exam-1", "exam-2"],
    },
    {
      id: "proj-2",
      proposalId: "prop-3",
      studentId: "stud-1",
      supervisorId: "sup-2",
      facultyId: "fac-ee",
      title: "בקרת מנועים לרחפן — פרויקט פעיל",
      status: "active",
      currentMilestoneOrder: 3,
      examinerIds: ["exam-2"],
      finalGrade: undefined,
    },
  ];

  const start1 = new Date(now.getFullYear(), now.getMonth() - 2, 10);
  const milestones: Milestone[] = [
    {
      id: "mil-1a",
      projectId: "proj-1",
      templateKey: "research_proposal",
      titleHe: "הצעת מחקר",
      titleEn: "Research proposal",
      order: 1,
      dueDate: iso(new Date(start1.getTime() + 30 * 86400000)),
      status: "approved",
    },
    {
      id: "mil-1b",
      projectId: "proj-1",
      templateKey: "progress_report",
      titleHe: "דוח התקדמות",
      titleEn: "Progress report",
      order: 2,
      dueDate: iso(new Date(start1.getTime() + 90 * 86400000)),
      status: "submitted",
    },
    {
      id: "mil-1c",
      projectId: "proj-1",
      templateKey: "final_report",
      titleHe: "דוח מסכם",
      titleEn: "Final report",
      order: 3,
      dueDate: iso(new Date(start1.getTime() + 150 * 86400000)),
      status: "pending",
    },
    {
      id: "mil-2a",
      projectId: "proj-2",
      templateKey: "research_proposal",
      titleHe: "הצעת מחקר",
      titleEn: "Research proposal",
      order: 1,
      dueDate: iso(new Date(start1.getTime() + 40 * 86400000)),
      status: "approved",
    },
    {
      id: "mil-2b",
      projectId: "proj-2",
      templateKey: "progress_report",
      titleHe: "דוח ביניים",
      titleEn: "Mid-term report",
      order: 2,
      dueDate: iso(new Date(start1.getTime() + 100 * 86400000)),
      status: "approved",
    },
    {
      id: "mil-2c",
      projectId: "proj-2",
      templateKey: "final_report",
      titleHe: "דוח מסכם",
      titleEn: "Final report",
      order: 3,
      dueDate: iso(new Date(start1.getTime() + 160 * 86400000)),
      status: "submitted",
    },
  ];

  const submissions: Submission[] = [
    {
      id: "sub-1",
      projectId: "proj-1",
      milestoneId: "mil-1a",
      type: "research_proposal",
      fileUrl: "/mock/submissions/prop1-research.pdf",
      submittedAt: iso(new Date(start1.getTime() + 28 * 86400000)),
      status: "approved",
    },
    {
      id: "sub-2",
      projectId: "proj-1",
      milestoneId: "mil-1b",
      type: "progress_report",
      fileUrl: "/mock/submissions/prop1-progress.pdf",
      submittedAt: iso(new Date(start1.getTime() + 88 * 86400000)),
      status: "pending",
    },
    {
      id: "sub-3",
      projectId: "proj-2",
      milestoneId: "mil-2c",
      type: "final_report",
      fileUrl: "/mock/submissions/prop2-final.pdf",
      submittedAt: iso(new Date(start1.getTime() + 155 * 86400000)),
      status: "needs_changes",
    },
  ];

  const reviews: Review[] = [
    {
      id: "rev-1",
      submissionId: "sub-1",
      reviewerId: "sup-1",
      role: "supervisor",
      scores: { quality: 90, methodology: 88 },
      comment: "הצעה מצוינת, להמשיך לפי התכנון.",
      decision: "approve",
      createdAt: iso(new Date(start1.getTime() + 29 * 86400000)),
    },
  ];

  const defenseExams: DefenseExam[] = [
    {
      id: "def-1",
      projectId: "proj-1",
      scheduledAt: iso(new Date(now.getFullYear(), now.getMonth() + 1, 12, 10, 0)),
      roomOrLink: "היברידי — זום + חדר 305",
      examinerIds: ["exam-1", "exam-2"],
      status: "scheduled",
    },
    {
      id: "def-2",
      projectId: "proj-2",
      scheduledAt: iso(new Date(now.getFullYear(), now.getMonth() - 1, 5, 14, 0)),
      roomOrLink: "מעבדה 12",
      examinerIds: ["exam-2", "exam-1"],
      status: "completed",
    },
  ];

  const gradingWeights: GradingWeights[] = [
    {
      id: "gw-cs-bsc",
      facultyId: "fac-cs",
      degreeType: "bachelor",
      weights: {
        supervisor: 0.25,
        coordinator: 0.15,
        examiner1: 0.25,
        examiner2: 0.25,
        milestones: 0.1,
      },
    },
    {
      id: "gw-ee-msc",
      facultyId: "fac-ee",
      degreeType: "master",
      weights: {
        supervisor: 0.3,
        coordinator: 0.1,
        examiner1: 0.28,
        examiner2: 0.27,
        milestones: 0.05,
      },
    },
  ];

  const notifications: Notification[] = [
    {
      id: "notif-1",
      userId: "sup-1",
      title: "הגשת מועמדות חדשה",
      body: "סטודנט הגיש מועמדות לפרויקט prop-1",
      type: "application",
      read: false,
      createdAt: iso(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1)),
      emailPlaceholderSent: true,
    },
    {
      id: "notif-2",
      userId: "admin-1",
      title: "נדרש אישור רכז",
      body: "אישור דוח התקדמות ממתין לרכז",
      type: "review",
      read: true,
      createdAt: iso(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 2)),
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
      to: "supervisor1@hit.ac.il",
      subject: "מועמדות חדשה לפרויקט",
      body: "התקבלה מועמדות מסטודנט stud-1",
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
