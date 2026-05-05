import { getDataSource } from "./dataSource";
import { getDb, patchDb, uid } from "@/lib/mock/store";
import type { Submission, SubmissionStatus } from "@/lib/types";
import { listReviews, addReview } from "./reviewService";
import { notify } from "./notificationService";
import * as firebaseMilestone from "./firebase/milestoneService.firebase";

export async function listMilestones(projectId: string) {
  if (getDataSource() === "firebase") {
    return firebaseMilestone.listMilestones(projectId);
  }
  return getDb()
    .milestones.filter((m) => m.projectId === projectId)
    .sort((a, b) => a.order - b.order);
}

export async function listSubmissions(projectId?: string) {
  if (getDataSource() === "firebase") {
    return firebaseMilestone.listSubmissions(projectId);
  }
  const all = getDb().submissions;
  if (!projectId) return all;
  return all.filter((s) => s.projectId === projectId);
}

export { listReviews };

export async function addSubmission(input: Omit<Submission, "id" | "submittedAt" | "status">) {
  if (getDataSource() === "firebase") {
    return firebaseMilestone.addSubmission(input);
  }
  const id = uid("sub");
  patchDb((d) => {
    d.submissions.unshift({
      ...input,
      id,
      submittedAt: new Date().toISOString(),
      status: "pending",
    });
    const mil = d.milestones.find((m) => m.id === input.milestoneId);
    if (mil) mil.status = "submitted";
  });
  const project = getDb().activeProjects.find((p) => p.id === input.projectId);
  if (project) {
    await notify({
      userIds: [project.supervisorId],
      title: "הגשה חדשה",
      body: "הוגש מסמך לאבן דרך",
      type: "submission",
      ruleKey: "on_submission",
    });
  }
  return id;
}

export async function updateSubmissionStatus(id: string, status: SubmissionStatus) {
  if (getDataSource() === "firebase") {
    return firebaseMilestone.updateSubmissionStatus(id, status);
  }
  patchDb((d) => {
    const s = d.submissions.find((x) => x.id === id);
    if (s) s.status = status;
  });
}

export { addReview };

export async function scheduleDefense(input: {
  projectId: string;
  scheduledAt: string;
  roomOrLink: string;
  examinerIds: string[];
}) {
  if (getDataSource() === "firebase") {
    return firebaseMilestone.scheduleDefense(input);
  }
  const id = uid("def");
  patchDb((d) => {
    d.defenseExams.unshift({
      id,
      projectId: input.projectId,
      scheduledAt: input.scheduledAt,
      roomOrLink: input.roomOrLink,
      examinerIds: input.examinerIds,
      status: "scheduled",
    });
  });
  const project = getDb().activeProjects.find((p) => p.id === input.projectId);
  const targets = [
    ...(project ? [project.studentId, project.supervisorId] : []),
    ...input.examinerIds,
  ];
  await notify({
    userIds: targets,
    title: "הגנה נקבעה",
    body: `מועד: ${input.scheduledAt}`,
    type: "defense",
    ruleKey: "on_defense_scheduled",
  });
  return id;
}

export async function listDefenseExams() {
  if (getDataSource() === "firebase") {
    return firebaseMilestone.listDefenseExams();
  }
  return getDb().defenseExams;
}
