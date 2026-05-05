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
import type { Application, ApplicationStatus } from "@/lib/types";
import { requireClientDb } from "./firestoreAccess";
import { toApplication, toProposal } from "./mappers";
import { notifyFromFirebase } from "./notificationHelper.firebase";
import { approveApplicationAndStartProject } from "./projectService.firebase";

export async function listApplications(): Promise<Application[]> {
  const db = requireClientDb();
  const snap = await getDocs(collection(db, COL.applications));
  return snap.docs.map((d) => toApplication(d.id, d.data() as Record<string, unknown>));
}

export async function listApplicationsForStudent(studentId: string): Promise<Application[]> {
  const db = requireClientDb();
  const snap = await getDocs(
    query(collection(db, COL.applications), where("studentId", "==", studentId)),
  );
  return snap.docs.map((d) => toApplication(d.id, d.data() as Record<string, unknown>));
}

export async function listApplicationsForSupervisor(supervisorId: string): Promise<Application[]> {
  const db = requireClientDb();
  const props = await getDocs(
    query(collection(db, COL.projectProposals), where("supervisorId", "==", supervisorId)),
  );
  const ids = props.docs.map((d) => d.id);
  if (ids.length === 0) return [];
  const apps = await getDocs(collection(db, COL.applications));
  return apps.docs
    .map((d) => toApplication(d.id, d.data() as Record<string, unknown>))
    .filter((a) => ids.includes(a.proposalId));
}

export async function submitApplication(input: {
  proposalId: string;
  studentId: string;
  cvUrl: string;
  gradesSummary: string;
}): Promise<string> {
  const db = requireClientDb();
  const propSnap = await getDoc(doc(db, COL.projectProposals, input.proposalId));
  if (!propSnap.exists()) throw new Error("Proposal not found");
  const proposal = toProposal(propSnap.id, propSnap.data() as Record<string, unknown>);
  if (proposal.status !== "open") throw new Error("Proposal not open");

  const ref = await addDoc(collection(db, COL.applications), {
    proposalId: input.proposalId,
    studentId: input.studentId,
    cvUrl: input.cvUrl,
    gradesSummary: input.gradesSummary,
    status: "pending",
    createdAt: new Date().toISOString(),
  });

  await notifyFromFirebase({
    userIds: [proposal.supervisorId],
    title: "הגשת מועמדות חדשה",
    body: `התקבלה מועמדות לפרויקט: ${proposal.title}`,
    type: "application",
    ruleKey: "on_application",
  });

  return ref.id;
}

export async function updateApplicationStatus(
  applicationId: string,
  status: ApplicationStatus,
  notes?: string,
) {
  const db = requireClientDb();
  const patch: Record<string, unknown> = { status };
  if (notes !== undefined) patch.notes = notes;
  await updateDoc(doc(db, COL.applications, applicationId), patch);

  const appSnap = await getDoc(doc(db, COL.applications, applicationId));
  if (!appSnap.exists()) return;
  const app = toApplication(appSnap.id, appSnap.data() as Record<string, unknown>);
  const propSnap = await getDoc(doc(db, COL.projectProposals, app.proposalId));
  if (!propSnap.exists()) return;
  const proposal = toProposal(propSnap.id, propSnap.data() as Record<string, unknown>);

  await notifyFromFirebase({
    userIds: [app.studentId, proposal.supervisorId],
    title: "עדכון מועמדות",
    body: `סטטוס מועמדות: ${status}`,
    type: "application_status",
    ruleKey: "on_review",
  });

  if (status === "approved") {
    await approveApplicationAndStartProject(applicationId);
  }
}
