import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { COL, SETTINGS_DOC } from "@/lib/firebase/collections";
import type {
  Faculty,
  GradingWeights,
  MilestoneTemplate,
  NotificationRules,
} from "@/lib/types";
import { requireClientDb } from "./firestoreAccess";
import {
  toFaculty,
  toGradingWeights,
  toMilestoneTemplate,
  toNotificationRules,
} from "./mappers";

export async function getAdminSnapshotFirebase() {
  const db = requireClientDb();
  const [facSnap, tplSnap, gwSnap, settingsSnap] = await Promise.all([
    getDocs(collection(db, COL.faculties)),
    getDocs(collection(db, COL.milestoneTemplates)),
    getDocs(collection(db, COL.gradingWeights)),
    getDoc(doc(db, COL.settings, SETTINGS_DOC)),
  ]);
  const rulesData = settingsSnap.exists()
    ? (settingsSnap.data() as Record<string, unknown>)
    : undefined;
  return {
    faculties: facSnap.docs.map((d) => toFaculty(d.id, d.data() as Record<string, unknown>)),
    milestoneTemplates: tplSnap.docs.map((d) =>
      toMilestoneTemplate(d.id, d.data() as Record<string, unknown>),
    ),
    gradingWeights: gwSnap.docs.map((d) =>
      toGradingWeights(d.id, d.data() as Record<string, unknown>),
    ),
    notificationRules: toNotificationRules(rulesData),
  };
}

export async function createFacultyFirebase(input: Omit<Faculty, "id">) {
  const db = requireClientDb();
  const ref = await addDoc(collection(db, COL.faculties), { ...input });
  return ref.id;
}

export async function updateFacultyFirebase(id: string, patch: Partial<Faculty>) {
  const db = requireClientDb();
  await updateDoc(doc(db, COL.faculties, id), patch as Record<string, unknown>);
}

export async function updateMilestoneTemplateFirebase(template: MilestoneTemplate) {
  const db = requireClientDb();
  await setDoc(doc(db, COL.milestoneTemplates, template.id), { ...template });
}

export async function updateGradingWeightsFirebase(weights: GradingWeights) {
  const db = requireClientDb();
  await setDoc(doc(db, COL.gradingWeights, weights.id), { ...weights });
}

export async function updateNotificationRulesFirebase(rules: NotificationRules) {
  const db = requireClientDb();
  await setDoc(
    doc(db, COL.settings, SETTINGS_DOC),
    {
      on_application: rules.on_application,
      on_submission: rules.on_submission,
      on_review: rules.on_review,
      on_defense_scheduled: rules.on_defense_scheduled,
    },
    { merge: true },
  );
}
