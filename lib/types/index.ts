export type UserRole = "student" | "supervisor" | "examiner" | "admin";

export type User = {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  facultyId?: string;
};

export type DegreeType = "bachelor" | "master";

export type Faculty = {
  id: string;
  nameHe: string;
  nameEn: string;
  degreeTypes: DegreeType[];
};

export type ProposalStatus = "open" | "closed";

export type ProjectProposal = {
  id: string;
  facultyId: string;
  title: string;
  summary: string;
  supervisorId: string;
  degreeType: DegreeType;
  status: ProposalStatus;
  capacity: number;
  tags: string[];
};

export type ApplicationStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "meeting_requested";

export type Application = {
  id: string;
  proposalId: string;
  studentId: string;
  cvUrl: string;
  gradesSummary: string;
  status: ApplicationStatus;
  notes?: string;
  createdAt: string;
};

export type ActiveProjectStatus = "active" | "completed" | "archived";

export type ActiveProject = {
  id: string;
  proposalId: string;
  studentId: string;
  supervisorId: string;
  facultyId: string;
  title: string;
  status: ActiveProjectStatus;
  currentMilestoneOrder: number;
  examinerIds: string[];
  finalGrade?: number;
};

/** Milestone pipeline: pending → submitted → approved | rejected */
export type MilestoneStatus = "pending" | "submitted" | "approved" | "rejected";

export type Milestone = {
  id: string;
  projectId: string;
  templateKey: string;
  titleHe: string;
  titleEn: string;
  order: number;
  dueDate: string;
  status: MilestoneStatus;
};

export type SubmissionStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "needs_changes";

export type Submission = {
  id: string;
  projectId: string;
  milestoneId: string;
  type: string;
  fileUrl?: string;
  submittedAt: string;
  status: SubmissionStatus;
};

export type ReviewDecision = "approve" | "reject" | "needs_changes";

export type Review = {
  id: string;
  submissionId: string;
  reviewerId: string;
  role: UserRole;
  scores: Record<string, number>;
  comment: string;
  decision: ReviewDecision;
  createdAt: string;
};

export type DefenseExamStatus = "scheduled" | "completed" | "cancelled";

export type DefenseExam = {
  id: string;
  projectId: string;
  scheduledAt: string;
  roomOrLink: string;
  examinerIds: string[];
  status: DefenseExamStatus;
};

export type GradingWeights = {
  id: string;
  facultyId: string;
  degreeType: DegreeType;
  weights: Record<string, number>;
};

export type Notification = {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: string;
  read: boolean;
  createdAt: string;
  emailPlaceholderSent: boolean;
};

export type MilestoneTemplateStep = {
  key: string;
  titleHe: string;
  titleEn: string;
  defaultOffsetDays: number;
};

export type MilestoneTemplate = {
  id: string;
  facultyId: string;
  degreeType: DegreeType;
  steps: MilestoneTemplateStep[];
};

export type NotificationRuleKey =
  | "on_application"
  | "on_submission"
  | "on_review"
  | "on_defense_scheduled";

export type NotificationRules = Record<NotificationRuleKey, boolean>;

export type EmailLogEntry = {
  id: string;
  to: string;
  subject: string;
  body: string;
  createdAt: string;
};

export type NotifyPayload = {
  userIds: string[];
  title: string;
  body: string;
  type: string;
  ruleKey?: NotificationRuleKey;
};
