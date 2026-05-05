import { getDataSource } from "./dataSource";
import { getDb, patchDb, uid } from "@/lib/mock/store";
import type { ActiveProject, DegreeType, ProjectProposal } from "@/lib/types";
import { notify } from "./notificationService";
import * as firebaseProject from "./firebase/projectService.firebase";

export type ProposalFilters = {
  facultyId?: string;
  degreeType?: DegreeType;
  status?: ProjectProposal["status"];
};

export async function listProposals(filters: ProposalFilters = {}) {
  if (getDataSource() === "firebase") {
    return firebaseProject.listProposals(filters);
  }
  return getDb().projectProposals.filter((p) => {
    if (filters.facultyId && p.facultyId !== filters.facultyId) return false;
    if (filters.degreeType && p.degreeType !== filters.degreeType) return false;
    if (filters.status && p.status !== filters.status) return false;
    return true;
  });
}

export async function getProposal(id: string) {
  if (getDataSource() === "firebase") {
    return firebaseProject.getProposal(id);
  }
  return getDb().projectProposals.find((p) => p.id === id) ?? null;
}

export async function createProposal(input: Omit<ProjectProposal, "id">) {
  if (getDataSource() === "firebase") {
    return firebaseProject.createProposal(input);
  }
  const id = uid("prop");
  patchDb((d) => {
    d.projectProposals.unshift({ ...input, id });
  });
  return id;
}

export async function listActiveProjects() {
  if (getDataSource() === "firebase") {
    return firebaseProject.listActiveProjects();
  }
  return getDb().activeProjects;
}

export async function getActiveProject(id: string): Promise<ActiveProject | null> {
  if (getDataSource() === "firebase") {
    return firebaseProject.getActiveProject(id);
  }
  return getDb().activeProjects.find((p) => p.id === id) ?? null;
}

export async function updateActiveProjectFields(
  id: string,
  patch: Partial<Pick<ActiveProject, "examinerIds" | "status" | "finalGrade" | "currentMilestoneOrder">>,
) {
  if (getDataSource() === "firebase") {
    return firebaseProject.updateActiveProject(id, patch);
  }
  patchDb((d) => {
    const p = d.activeProjects.find((x) => x.id === id);
    if (!p) return;
    Object.assign(p, patch);
  });
}

export async function spawnMilestonesForProject(project: ActiveProject) {
  if (getDataSource() === "firebase") {
    return firebaseProject.spawnMilestonesForProject(project);
  }
  const tpl = getDb().milestoneTemplates.find(
    (t) => t.facultyId === project.facultyId && t.degreeType === getProposalDegree(project),
  );
  if (!tpl) return;
  const base = new Date();
  patchDb((d) => {
    tpl.steps.forEach((step, i) => {
      const due = new Date(base.getTime() + step.defaultOffsetDays * 86400000);
      d.milestones.push({
        id: uid("mil"),
        projectId: project.id,
        templateKey: step.key,
        titleHe: step.titleHe,
        titleEn: step.titleEn,
        order: i + 1,
        dueDate: due.toISOString(),
        status: "pending",
      });
    });
  });
}

function getProposalDegree(project: ActiveProject): DegreeType {
  const prop = getDb().projectProposals.find((p) => p.id === project.proposalId);
  return prop?.degreeType ?? "bachelor";
}

export async function approveApplicationAndStartProject(
  applicationId: string,
): Promise<ActiveProject | null> {
  if (getDataSource() === "firebase") {
    return firebaseProject.approveApplicationAndStartProject(applicationId);
  }
  const app = getDb().applications.find((a) => a.id === applicationId);
  if (!app || app.status !== "approved") return null;
  const existing = getDb().activeProjects.find(
    (p) => p.proposalId === app.proposalId && p.studentId === app.studentId,
  );
  if (existing) return existing;
  const proposal = getDb().projectProposals.find((p) => p.id === app.proposalId);
  if (!proposal) return null;
  const project: ActiveProject = {
    id: uid("proj"),
    proposalId: proposal.id,
    studentId: app.studentId,
    supervisorId: proposal.supervisorId,
    facultyId: proposal.facultyId,
    title: proposal.title,
    status: "active",
    currentMilestoneOrder: 1,
    examinerIds: [],
  };
  patchDb((d) => {
    d.activeProjects.unshift(project);
    proposal.status = "closed";
  });
  await spawnMilestonesForProject(project);
  await notify({
    userIds: [app.studentId, proposal.supervisorId],
    title: "פרויקט אושר",
    body: `הפרויקט "${proposal.title}" יצא לדרך`,
    type: "project_started",
    ruleKey: "on_review",
  });
  return project;
}
