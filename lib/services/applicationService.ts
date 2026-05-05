import { getDataSource } from "./dataSource";
import { getDb, patchDb, uid } from "@/lib/mock/store";
import type { Application, ApplicationStatus } from "@/lib/types";
import { notify } from "./notificationService";
import { approveApplicationAndStartProject } from "./projectService";
import * as firebaseApplication from "./firebase/applicationService.firebase";

export async function listApplications() {
  if (getDataSource() === "firebase") {
    return firebaseApplication.listApplications();
  }
  return getDb().applications;
}

export async function listApplicationsForStudent(studentId: string) {
  if (getDataSource() === "firebase") {
    return firebaseApplication.listApplicationsForStudent(studentId);
  }
  return getDb().applications.filter((a) => a.studentId === studentId);
}

export async function listApplicationsForSupervisor(supervisorId: string) {
  if (getDataSource() === "firebase") {
    return firebaseApplication.listApplicationsForSupervisor(supervisorId);
  }
  const props = getDb().projectProposals.filter((p) => p.supervisorId === supervisorId);
  const ids = new Set(props.map((p) => p.id));
  return getDb().applications.filter((a) => ids.has(a.proposalId));
}

export async function submitApplication(input: {
  proposalId: string;
  studentId: string;
  cvUrl: string;
  gradesSummary: string;
}) {
  if (getDataSource() === "firebase") {
    return firebaseApplication.submitApplication(input);
  }
  const proposal = getDb().projectProposals.find((p) => p.id === input.proposalId);
  if (!proposal || proposal.status !== "open") {
    throw new Error("Proposal not open");
  }
  const id = uid("app");
  const row: Application = {
    id,
    proposalId: input.proposalId,
    studentId: input.studentId,
    cvUrl: input.cvUrl,
    gradesSummary: input.gradesSummary,
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  patchDb((d) => {
    d.applications.unshift(row);
  });
  await notify({
    userIds: [proposal.supervisorId],
    title: "הגשת מועמדות חדשה",
    body: `התקבלה מועמדות לפרויקט: ${proposal.title}`,
    type: "application",
    ruleKey: "on_application",
  });
  return id;
}

export async function updateApplicationStatus(
  applicationId: string,
  status: ApplicationStatus,
  notes?: string,
) {
  if (getDataSource() === "firebase") {
    return firebaseApplication.updateApplicationStatus(applicationId, status, notes);
  }
  patchDb((d) => {
    const a = d.applications.find((x) => x.id === applicationId);
    if (!a) return;
    a.status = status;
    if (notes !== undefined) a.notes = notes;
  });
  const app = getDb().applications.find((a) => a.id === applicationId);
  const proposal = app ? getDb().projectProposals.find((p) => p.id === app.proposalId) : null;
  if (app && proposal) {
    await notify({
      userIds: [app.studentId, proposal.supervisorId],
      title: "עדכון מועמדות",
      body: `סטטוס מועמדות: ${status}`,
      type: "application_status",
      ruleKey: "on_review",
    });
  }
  if (status === "approved" && app) {
    await approveApplicationAndStartProject(applicationId);
  }
}
