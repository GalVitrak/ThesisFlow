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
import type { DefenseExam, Milestone, Submission, SubmissionStatus } from "@/lib/types";
import { requireClientDb } from "./firestoreAccess";
import { toDefense, toMilestone, toSubmission } from "./mappers";
import { notifyFromFirebase } from "./notificationHelper.firebase";

export async function listMilestones(projectId: string): Promise<Milestone[]> {
  const db = requireClientDb();
  const snap = await getDocs(
    query(collection(db, COL.milestones), where("projectId", "==", projectId)),
  );
  return snap.docs
    .map((d) => toMilestone(d.id, d.data() as Record<string, unknown>))
    .sort((a, b) => a.order - b.order);
}

export async function listSubmissions(projectId?: string): Promise<Submission[]> {
  const db = requireClientDb();
  if (!projectId) {
    const snap = await getDocs(collection(db, COL.submissions));
    return snap.docs.map((d) => toSubmission(d.id, d.data() as Record<string, unknown>));
  }
  const snap = await getDocs(
    query(collection(db, COL.submissions), where("projectId", "==", projectId)),
  );
  return snap.docs.map((d) => toSubmission(d.id, d.data() as Record<string, unknown>));
}

export async function addSubmission(input: Omit<Submission, "id" | "submittedAt" | "status">) {
  const db = requireClientDb();
  const ref = await addDoc(collection(db, COL.submissions), {
    ...input,
    submittedAt: new Date().toISOString(),
    status: "pending",
  });
  await updateDoc(doc(db, COL.milestones, input.milestoneId), { status: "submitted" });

  const projSnap = await getDoc(doc(db, COL.activeProjects, input.projectId));
  if (projSnap.exists()) {
    const supId = String((projSnap.data() as { supervisorId?: string }).supervisorId ?? "");
    await notifyFromFirebase({
      userIds: [supId],
      title: "הגשה חדשה",
      body: "הוגש מסמך לאבן דרך",
      type: "submission",
      ruleKey: "on_submission",
    });
  }
  return ref.id;
}

export async function updateSubmissionStatus(id: string, status: SubmissionStatus) {
  const db = requireClientDb();
  await updateDoc(doc(db, COL.submissions, id), { status });
}

export async function scheduleDefense(input: {
  projectId: string;
  scheduledAt: string;
  roomOrLink: string;
  examinerIds: string[];
}) {
  const db = requireClientDb();
  const ref = await addDoc(collection(db, COL.defenseExams), {
    projectId: input.projectId,
    scheduledAt: input.scheduledAt,
    roomOrLink: input.roomOrLink,
    examinerIds: input.examinerIds,
    status: "scheduled",
  });

  const projSnap = await getDoc(doc(db, COL.activeProjects, input.projectId));
  if (projSnap.exists()) {
    const p = projSnap.data() as { studentId?: string; supervisorId?: string };
    const targets = [...(p.studentId ? [p.studentId] : []), ...(p.supervisorId ? [p.supervisorId] : []), ...input.examinerIds];
    await notifyFromFirebase({
      userIds: targets,
      title: "הגנה נקבעה",
      body: `מועד: ${input.scheduledAt}`,
      type: "defense",
      ruleKey: "on_defense_scheduled",
    });
  }
  return ref.id;
}

export async function listDefenseExams(): Promise<DefenseExam[]> {
  const db = requireClientDb();
  const snap = await getDocs(collection(db, COL.defenseExams));
  return snap.docs.map((d) => toDefense(d.id, d.data() as Record<string, unknown>));
}
