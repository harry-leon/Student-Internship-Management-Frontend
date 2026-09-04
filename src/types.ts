export type Role = 'Admin' | 'Mentor' | 'Student';

export type AssignmentStatus = 'IN PROGRESS' | 'PENDING' | 'COMPLETED' | 'CANCELLED';

export interface Student {
  id: string;
  name: string;
  code: string;
  email: string;
  department: string;
  avatar: string;
  phase: string;
  mentor: string;
  company: string;
  status: AssignmentStatus;
  progress: number;
  score?: number;
}

export interface Mentor {
  id: string;
  name: string;
  title: string;
  department: string;
  email: string;
  avatar: string;
  activeStudents: number;
  maxCapacity: number;
  specialization: string;
  rating: number;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: 'Active' | 'Invited' | 'Suspended';
  department: string;
  lastActive: string;
  avatar?: string;
}

export interface InternshipPhase {
  id: string;
  name: string;
  term: string;
  status: 'ACTIVE' | 'UPCOMING' | 'COMPLETED';
  startDate: string;
  endDate: string;
  weeksRemaining: number;
  progressPercent: number;
  targetMilestone: string;
  totalStudents: number;
  totalMentors: number;
  scheduledRounds: number;
}

export interface Assignment {
  id: string;
  studentName: string;
  studentCode: string;
  studentAvatar: string;
  mentorName: string;
  mentorDept: string;
  phase: string;
  date: string;
  status: AssignmentStatus;
  companyName?: string;
  projectTopic?: string;
  grade?: string;
}

export interface AssessmentRound {
  id: string;
  name: string;
  phase: string;
  status: 'ACTIVE' | 'UPCOMING' | 'COMPLETED';
  dateRange: string;
  timeRemainingText: string;
  completionRate: number;
  totalSubmissions: number;
  evaluatedSubmissions: number;
}

export interface EvaluationCriterion {
  id: string;
  name: string;
  category: string;
  weight: number;
  maxScore: number;
  description: string;
}

export type WeeklyReportStatus = 'DRAFT' | 'SUBMITTED' | 'REVIEWED' | 'NEEDS_REVISION' | 'LATE';

export interface WeeklyReport {
  reportId: number;
  assignmentId: number;
  studentId: number;
  studentName?: string;
  studentCode?: string;
  mentorId?: number;
  mentorName?: string;
  phaseId?: number;
  phaseName?: string;
  weekNumber: number;
  reportTitle?: string;
  completedTasks: string;
  difficulties?: string;
  nextPlan?: string;
  workingHours?: number;
  attachmentUrl?: string;
  status: WeeklyReportStatus;
  submittedAt?: string;
  reviewedById?: number;
  reviewedByName?: string;
  reviewedAt?: string;
  mentorComment?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type NavPage =
  | 'dashboard'
  | 'companies'
  | 'applications'
  | 'weekly-reports'
  | 'users'
  | 'students'
  | 'mentors'
  | 'internship-phases'
  | 'assignments'
  | 'evaluation-criteria'
  | 'assessment-rounds'
  | 'assessment-results'
  | 'my-profile'
  | 'login'
  | 'landing';
