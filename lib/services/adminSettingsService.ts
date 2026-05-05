import { collection, getDocs } from "firebase/firestore";
import { COL } from "@/lib/firebase/collections";
import { getDataSource } from "./dataSource";
import { getDb, patchDb, uid } from "@/lib/mock/store";
import type {
  Faculty,
  GradingWeights,
  MilestoneTemplate,
  NotificationRules,
} from "@/lib/types";
import * as firebaseAdmin from "./firebase/adminSettings.firebase";
import { requireClientDb } from "./firebase/firestoreAccess";
import { toFaculty } from "./firebase/mappers";

export async function listFaculties(): Promise<Faculty[]> {
  if (getDataSource() === "firebase") {
    const db = requireClientDb();
    const snap = await getDocs(collection(db, COL.faculties));
    return snap.docs.map((d) => toFaculty(d.id, d.data() as Record<string, unknown>));
  }
  return getDb().faculties;
}

export async function getAdminSnapshot() {
  if (getDataSource() === "firebase") {
    return firebaseAdmin.getAdminSnapshotFirebase();
  }
  const d = getDb();
  return {
    faculties: d.faculties,
    milestoneTemplates: d.milestoneTemplates,
    gradingWeights: d.gradingWeights,
    notificationRules: d.notificationRules,
  };
}

export async function createFaculty(input: Omit<Faculty, "id">) {
  if (getDataSource() === "firebase") {
    return firebaseAdmin.createFacultyFirebase(input);
  }
  const id = uid("fac");
  patchDb((d) => {
    d.faculties.push({ ...input, id });
  });
  return id;
}

export async function updateNotificationRules(rules: NotificationRules) {
  if (getDataSource() === "firebase") {
    return firebaseAdmin.updateNotificationRulesFirebase(rules);
  }
  patchDb((d) => {
    d.notificationRules = { ...rules };
  });
}

export async function updateGradingWeights(weights: GradingWeights) {
  if (getDataSource() === "firebase") {
    return firebaseAdmin.updateGradingWeightsFirebase(weights);
  }
  patchDb((d) => {
    const i = d.gradingWeights.findIndex((g) => g.id === weights.id);
    if (i >= 0) d.gradingWeights[i] = weights;
    else d.gradingWeights.push(weights);
  });
}

export async function updateMilestoneTemplate(template: MilestoneTemplate) {
  if (getDataSource() === "firebase") {
    return firebaseAdmin.updateMilestoneTemplateFirebase(template);
  }
  patchDb((d) => {
    const i = d.milestoneTemplates.findIndex((t) => t.id === template.id);
    if (i >= 0) d.milestoneTemplates[i] = template;
    else d.milestoneTemplates.push(template);
  });
}

export async function updateFacultyName(input: {
  id: string;
  nameHe: string;
  nameEn: string;
}) {
  if (getDataSource() === "firebase") {
    return firebaseAdmin.updateFacultyFirebase(input.id, {
      nameHe: input.nameHe,
      nameEn: input.nameEn,
    });
  }
  patchDb((d) => {
    const f = d.faculties.find((x) => x.id === input.id);
    if (f) {
      f.nameHe = input.nameHe;
      f.nameEn = input.nameEn;
    }
  });
}
