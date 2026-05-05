/** Firestore collection names (aligned with product spec). */
export const COL = {
  users: "users",
  faculties: "faculties",
  projectProposals: "projectProposals",
  applications: "applications",
  activeProjects: "activeProjects",
  milestones: "milestones",
  submissions: "submissions",
  reviews: "reviews",
  defenseExams: "defenseExams",
  gradingWeights: "gradingWeights",
  notifications: "notifications",
  milestoneTemplates: "milestoneTemplates",
  settings: "settings",
  emailLog: "emailLog",
} as const;

export const SETTINGS_DOC = "global";
