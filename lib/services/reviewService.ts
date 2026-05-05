import { getDataSource } from "./dataSource";
import { getDb, patchDb, uid } from "@/lib/mock/store";
import type { Review, ReviewDecision, SubmissionStatus } from "@/lib/types";
import { notify } from "./notificationService";
import * as firebaseReview from "./firebase/reviewService.firebase";

export async function listReviews() {
  if (getDataSource() === "firebase") {
    return firebaseReview.listReviews();
  }
  return getDb().reviews;
}

export async function addReview(input: Omit<Review, "id" | "createdAt">) {
  if (getDataSource() === "firebase") {
    return firebaseReview.addReview(input);
  }
  const id = uid("rev");
  patchDb((d) => {
    d.reviews.unshift({
      ...input,
      id,
      createdAt: new Date().toISOString(),
    });
    const sub = d.submissions.find((s) => s.id === input.submissionId);
    if (sub) {
      const map: Record<ReviewDecision, SubmissionStatus> = {
        approve: "approved",
        reject: "rejected",
        needs_changes: "needs_changes",
      };
      sub.status = map[input.decision];
    }
    const m = d.milestones.find((x) => x.id === sub?.milestoneId);
    if (m) {
      if (input.decision === "approve") m.status = "approved";
      else if (input.decision === "reject") m.status = "rejected";
    }
  });
  const sub = getDb().submissions.find((s) => s.id === input.submissionId);
  const project = sub ? getDb().activeProjects.find((p) => p.id === sub.projectId) : null;
  if (project) {
    await notify({
      userIds: [project.studentId, project.supervisorId],
      title: "סקירת הגשה",
      body: `החלטה: ${input.decision}`,
      type: "review",
      ruleKey: "on_review",
    });
  }
  return id;
}
