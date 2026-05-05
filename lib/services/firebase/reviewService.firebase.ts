import { addDoc, collection, doc, getDoc, getDocs, updateDoc } from "firebase/firestore";
import { COL } from "@/lib/firebase/collections";
import type { Review, ReviewDecision, SubmissionStatus } from "@/lib/types";
import { requireClientDb } from "./firestoreAccess";
import { toReview } from "./mappers";
import { notifyFromFirebase } from "./notificationHelper.firebase";

export async function listReviews(): Promise<Review[]> {
  const db = requireClientDb();
  const snap = await getDocs(collection(db, COL.reviews));
  return snap.docs.map((d) => toReview(d.id, d.data() as Record<string, unknown>));
}

export async function addReview(input: Omit<Review, "id" | "createdAt">): Promise<string> {
  const db = requireClientDb();
  const ref = await addDoc(collection(db, COL.reviews), {
    ...input,
    createdAt: new Date().toISOString(),
  });

  const map: Record<ReviewDecision, SubmissionStatus> = {
    approve: "approved",
    reject: "rejected",
    needs_changes: "needs_changes",
  };
  await updateDoc(doc(db, COL.submissions, input.submissionId), {
    status: map[input.decision],
  });

  const subSnap = await getDoc(doc(db, COL.submissions, input.submissionId));
  if (subSnap.exists()) {
    const sub = subSnap.data() as { milestoneId?: string; projectId?: string };
    if (sub.milestoneId) {
      let mStatus: "pending" | "submitted" | "approved" | "rejected" = "submitted";
      if (input.decision === "approve") mStatus = "approved";
      else if (input.decision === "reject") mStatus = "rejected";
      await updateDoc(doc(db, COL.milestones, sub.milestoneId), { status: mStatus });
    }
    if (sub.projectId) {
      const projSnap = await getDoc(doc(db, COL.activeProjects, sub.projectId));
      if (projSnap.exists()) {
        const p = projSnap.data() as { studentId?: string; supervisorId?: string };
        await notifyFromFirebase({
          userIds: [...(p.studentId ? [p.studentId] : []), ...(p.supervisorId ? [p.supervisorId] : [])],
          title: "סקירת הגשה",
          body: `החלטה: ${input.decision}`,
          type: "review",
          ruleKey: "on_review",
        });
      }
    }
  }

  return ref.id;
}
