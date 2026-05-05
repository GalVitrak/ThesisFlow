import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { COL } from "@/lib/firebase/collections";
import type { ActiveProject, DegreeType, ProjectProposal } from "@/lib/types";
import { requireClientDb } from "./firestoreAccess";
import { toActiveProject, toProposal } from "./mappers";
import { notifyFromFirebase } from "./notificationHelper.firebase";

export type ProposalFilters = {
  facultyId?: string;
  degreeType?: DegreeType;
  status?: ProjectProposal["status"];
};

function matchesProposal(p: ProjectProposal, filters: ProposalFilters) {
  if (filters.facultyId && p.facultyId !== filters.facultyId) return false;
  if (filters.degreeType && p.degreeType !== filters.degreeType) return false;
  if (filters.status && p.status !== filters.status) return false;
  return true;
}

export async function listProposals(filters: ProposalFilters = {}): Promise<ProjectProposal[]> {
  const db = requireClientDb();
  const snap = await getDocs(collection(db, COL.projectProposals));
  return snap.docs
    .map((d) => toProposal(d.id, d.data() as Record<string, unknown>))
    .filter((p) => matchesProposal(p, filters));
}

export async function getProposal(id: string): Promise<ProjectProposal | null> {
  const db = requireClientDb();
  const snap = await getDoc(doc(db, COL.projectProposals, id));
  if (!snap.exists()) return null;
  return toProposal(snap.id, snap.data() as Record<string, unknown>);
}

export async function createProposal(input: Omit<ProjectProposal, "id">): Promise<string> {
  const db = requireClientDb();
  const ref = await addDoc(collection(db, COL.projectProposals), {
    ...input,
  });
  return ref.id;
}

export async function listActiveProjects(): Promise<ActiveProject[]> {
  const db = requireClientDb();
  const snap = await getDocs(collection(db, COL.activeProjects));
  return snap.docs.map((d) => toActiveProject(d.id, d.data() as Record<string, unknown>));
}

export async function getActiveProject(id: string): Promise<ActiveProject | null> {
  const db = requireClientDb();
  const snap = await getDoc(doc(db, COL.activeProjects, id));
  if (!snap.exists()) return null;
  return toActiveProject(snap.id, snap.data() as Record<string, unknown>);
}

export async function updateActiveProject(
  id: string,
  patch: Partial<Pick<ActiveProject, "examinerIds" | "status" | "finalGrade" | "currentMilestoneOrder">>,
) {
  const db = requireClientDb();
  await updateDoc(doc(db, COL.activeProjects, id), patch as Record<string, unknown>);
}

export async function spawnMilestonesForProject(project: ActiveProject): Promise<void> {
  const db = requireClientDb();
  const proposal = await getProposal(project.proposalId);
  const degree = proposal?.degreeType ?? "bachelor";
  const qy = query(
    collection(db, COL.milestoneTemplates),
    where("facultyId", "==", project.facultyId),
    where("degreeType", "==", degree),
  );
  const tplSnap = await getDocs(qy);
  const tpl = tplSnap.docs[0];
  if (!tpl) return;
  const data = tpl.data() as { steps?: Array<{ key: string; titleHe: string; titleEn: string; defaultOffsetDays: number }> };
  const steps = data.steps ?? [];
  const base = new Date();
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    const due = new Date(base.getTime() + (step.defaultOffsetDays ?? 30) * 86400000);
    await addDoc(collection(db, COL.milestones), {
      projectId: project.id,
      templateKey: step.key,
      titleHe: step.titleHe,
      titleEn: step.titleEn,
      order: i + 1,
      dueDate: due.toISOString(),
      status: "pending",
    });
  }
}

export async function approveApplicationAndStartProject(
  applicationId: string,
): Promise<ActiveProject | null> {
  const db = requireClientDb();
  const appSnap = await getDoc(doc(db, COL.applications, applicationId));
  if (!appSnap.exists()) return null;
  const app = appSnap.data() as { proposalId: string; studentId: string; status: string };
  if (app.status !== "approved") return null;

  const existingQ = query(
    collection(db, COL.activeProjects),
    where("proposalId", "==", app.proposalId),
    where("studentId", "==", app.studentId),
  );
  const existingSnap = await getDocs(existingQ);
  if (!existingSnap.empty) {
    const d = existingSnap.docs[0];
    return toActiveProject(d.id, d.data() as Record<string, unknown>);
  }

  const propSnap = await getDoc(doc(db, COL.projectProposals, app.proposalId));
  if (!propSnap.exists()) return null;
  const proposal = toProposal(propSnap.id, propSnap.data() as Record<string, unknown>);

  const projectRef = await addDoc(collection(db, COL.activeProjects), {
    proposalId: proposal.id,
    studentId: app.studentId,
    supervisorId: proposal.supervisorId,
    facultyId: proposal.facultyId,
    title: proposal.title,
    status: "active",
    currentMilestoneOrder: 1,
    examinerIds: [],
  });

  await updateDoc(doc(db, COL.projectProposals, proposal.id), { status: "closed" });

  const project = await getActiveProject(projectRef.id);
  if (project) await spawnMilestonesForProject(project);

  await notifyFromFirebase({
    userIds: [app.studentId, proposal.supervisorId],
    title: "פרויקט אושר",
    body: `הפרויקט "${proposal.title}" יצא לדרך`,
    type: "project_started",
    ruleKey: "on_review",
  });

  return getActiveProject(projectRef.id);
}
