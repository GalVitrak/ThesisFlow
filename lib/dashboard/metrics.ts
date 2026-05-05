import { listApplications, listApplicationsForSupervisor, listApplicationsForStudent } from "@/lib/services/applicationService";
import { listActiveProjects, listProposals } from "@/lib/services/projectService";
import { listDefenseExams, listSubmissions } from "@/lib/services/milestoneService";

export async function loadStudentMetrics(userId: string) {
  const [openProposals, applications, activeProjects, submissions, defenses] = await Promise.all([
    listProposals({ status: "open" }),
    listApplicationsForStudent(userId),
    listActiveProjects(),
    listSubmissions(),
    listDefenseExams(),
  ]);
  const myProjects = activeProjects.filter((p) => p.studentId === userId);
  const mySubs = submissions.filter((s) => myProjects.some((p) => p.id === s.projectId));
  const myDefs = defenses.filter((d) => myProjects.some((p) => p.id === d.projectId));
  return {
    openProposalsCount: openProposals.length,
    applications,
    myProjects,
    mySubmissions: mySubs,
    myDefenses: myDefs,
  };
}

export async function loadSupervisorMetrics(supervisorId: string) {
  const [openProposals, applications, activeProjects, submissions, defenses] = await Promise.all([
    listProposals({ status: "open" }),
    listApplicationsForSupervisor(supervisorId),
    listActiveProjects(),
    listSubmissions(),
    listDefenseExams(),
  ]);
  const mine = activeProjects.filter((p) => p.supervisorId === supervisorId);
  const pendingReviews = submissions.filter(
    (s) => mine.some((p) => p.id === s.projectId) && s.status === "pending",
  );
  return {
    openProposalsCount: openProposals.length,
    applications,
    activeProjects: mine,
    pendingReviewsCount: pendingReviews.length,
    defensesScheduled: defenses.filter((d) => d.status === "scheduled").length,
  };
}

export async function loadExaminerMetrics(examinerId: string) {
  const [defenses, submissions, projects] = await Promise.all([
    listDefenseExams(),
    listSubmissions(),
    listActiveProjects(),
  ]);
  const assignedDefs = defenses.filter((d) => d.examinerIds.includes(examinerId));
  const myProjects = projects.filter((p) => p.examinerIds.includes(examinerId));
  const pendingSubs = submissions.filter(
    (s) => myProjects.some((p) => p.id === s.projectId) && s.status === "pending",
  );
  return {
    assignedDefenses: assignedDefs,
    pendingReviewsCount: pendingSubs.length,
  };
}

export async function loadAdminMetrics() {
  const [proposals, applications, projects, defenses] = await Promise.all([
    listProposals(),
    listApplications(),
    listActiveProjects(),
    listDefenseExams(),
  ]);
  return {
    facultiesCount: new Set(proposals.map((p) => p.facultyId)).size,
    proposalsCount: proposals.length,
    applicationsCount: applications.length,
    activeProjectsCount: projects.length,
    defensesScheduled: defenses.filter((d) => d.status === "scheduled").length,
  };
}
