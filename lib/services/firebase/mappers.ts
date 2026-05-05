import type {
  ActiveProject,
  Application,
  DefenseExam,
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
  UserRole,
} from "@/lib/types";

export function normalizeRole(raw: unknown): UserRole {
  const r = String(raw ?? "student");
  if (r === "coordinator") return "admin";
  if (r === "student" || r === "supervisor" || r === "examiner" || r === "admin") return r;
  return "student";
}

export function toUser(id: string, data: Record<string, unknown>): User {
  return {
    id,
    email: String(data.email ?? ""),
    displayName: String(data.displayName ?? ""),
    role: normalizeRole(data.role),
    facultyId: data.facultyId ? String(data.facultyId) : undefined,
  };
}

export function toFaculty(id: string, data: Record<string, unknown>): Faculty {
  return {
    id,
    nameHe: String(data.nameHe ?? ""),
    nameEn: String(data.nameEn ?? ""),
    degreeTypes: (data.degreeTypes as Faculty["degreeTypes"]) ?? ["bachelor"],
  };
}

export function toProposal(id: string, data: Record<string, unknown>): ProjectProposal {
  return {
    id,
    facultyId: String(data.facultyId ?? ""),
    title: String(data.title ?? ""),
    summary: String(data.summary ?? ""),
    supervisorId: String(data.supervisorId ?? ""),
    degreeType: (data.degreeType as ProjectProposal["degreeType"]) ?? "bachelor",
    status: (data.status as ProjectProposal["status"]) ?? "open",
    capacity: Number(data.capacity ?? 1),
    tags: Array.isArray(data.tags) ? (data.tags as string[]) : [],
  };
}

export function toApplication(id: string, data: Record<string, unknown>): Application {
  return {
    id,
    proposalId: String(data.proposalId ?? ""),
    studentId: String(data.studentId ?? ""),
    cvUrl: String(data.cvUrl ?? ""),
    gradesSummary: String(data.gradesSummary ?? ""),
    status: (data.status as Application["status"]) ?? "pending",
    notes: data.notes ? String(data.notes) : undefined,
    createdAt: String(data.createdAt ?? new Date().toISOString()),
  };
}

export function toActiveProject(id: string, data: Record<string, unknown>): ActiveProject {
  return {
    id,
    proposalId: String(data.proposalId ?? ""),
    studentId: String(data.studentId ?? ""),
    supervisorId: String(data.supervisorId ?? ""),
    facultyId: String(data.facultyId ?? ""),
    title: String(data.title ?? ""),
    status: (data.status as ActiveProject["status"]) ?? "active",
    currentMilestoneOrder: Number(data.currentMilestoneOrder ?? 1),
    examinerIds: Array.isArray(data.examinerIds) ? (data.examinerIds as string[]) : [],
    finalGrade: data.finalGrade != null ? Number(data.finalGrade) : undefined,
  };
}

export function toMilestone(id: string, data: Record<string, unknown>): Milestone {
  return {
    id,
    projectId: String(data.projectId ?? ""),
    templateKey: String(data.templateKey ?? ""),
    titleHe: String(data.titleHe ?? ""),
    titleEn: String(data.titleEn ?? ""),
    order: Number(data.order ?? 0),
    dueDate: String(data.dueDate ?? ""),
    status: (data.status as Milestone["status"]) ?? "pending",
  };
}

export function toSubmission(id: string, data: Record<string, unknown>): Submission {
  return {
    id,
    projectId: String(data.projectId ?? ""),
    milestoneId: String(data.milestoneId ?? ""),
    type: String(data.type ?? ""),
    fileUrl: data.fileUrl ? String(data.fileUrl) : undefined,
    submittedAt: String(data.submittedAt ?? ""),
    status: (data.status as Submission["status"]) ?? "pending",
  };
}

export function toReview(id: string, data: Record<string, unknown>): Review {
  return {
    id,
    submissionId: String(data.submissionId ?? ""),
    reviewerId: String(data.reviewerId ?? ""),
    role: normalizeRole(data.role) as Review["role"],
    scores: (data.scores as Record<string, number>) ?? {},
    comment: String(data.comment ?? ""),
    decision: (data.decision as Review["decision"]) ?? "approve",
    createdAt: String(data.createdAt ?? ""),
  };
}

export function toDefense(id: string, data: Record<string, unknown>): DefenseExam {
  return {
    id,
    projectId: String(data.projectId ?? ""),
    scheduledAt: String(data.scheduledAt ?? ""),
    roomOrLink: String(data.roomOrLink ?? ""),
    examinerIds: Array.isArray(data.examinerIds) ? (data.examinerIds as string[]) : [],
    status: (data.status as DefenseExam["status"]) ?? "scheduled",
  };
}

export function toGradingWeights(id: string, data: Record<string, unknown>): GradingWeights {
  return {
    id,
    facultyId: String(data.facultyId ?? ""),
    degreeType: (data.degreeType as GradingWeights["degreeType"]) ?? "bachelor",
    weights: (data.weights as Record<string, number>) ?? {},
  };
}

export function toNotification(id: string, data: Record<string, unknown>): Notification {
  return {
    id,
    userId: String(data.userId ?? ""),
    title: String(data.title ?? ""),
    body: String(data.body ?? ""),
    type: String(data.type ?? ""),
    read: Boolean(data.read),
    createdAt: String(data.createdAt ?? ""),
    emailPlaceholderSent: Boolean(data.emailPlaceholderSent),
  };
}

export function toMilestoneTemplate(id: string, data: Record<string, unknown>): MilestoneTemplate {
  return {
    id,
    facultyId: String(data.facultyId ?? ""),
    degreeType: (data.degreeType as MilestoneTemplate["degreeType"]) ?? "bachelor",
    steps: Array.isArray(data.steps) ? (data.steps as MilestoneTemplate["steps"]) : [],
  };
}

export function toNotificationRules(data: Record<string, unknown> | undefined): NotificationRules {
  const d = data ?? {};
  return {
    on_application: d.on_application !== false,
    on_submission: d.on_submission !== false,
    on_review: d.on_review !== false,
    on_defense_scheduled: d.on_defense_scheduled !== false,
  };
}
