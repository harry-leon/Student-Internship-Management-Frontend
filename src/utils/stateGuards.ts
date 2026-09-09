// State transition guards for workflow entities
// Mirrors backend StateTransitionValidator logic

export type WeeklyReportStatus = 'DRAFT' | 'SUBMITTED' | 'REVIEWED' | 'NEEDS_REVISION' | 'LATE';
export type InternshipApplicationStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
export type GroupTaskStatus = 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE' | 'BLOCKED' | 'CANCELLED';
export type AssessmentSubmissionStatus = 'DRAFT' | 'SUBMITTED' | 'PUBLISHED';

// Weekly Report Guards
export const weeklyReportGuards = {
  canUpdate: (status: WeeklyReportStatus): boolean => {
    return status === 'DRAFT' || status === 'NEEDS_REVISION';
  },

  canSubmit: (status: WeeklyReportStatus): boolean => {
    return status === 'DRAFT' || status === 'NEEDS_REVISION' || status === 'LATE';
  },

  canReview: (status: WeeklyReportStatus): boolean => {
    return status === 'SUBMITTED';
  },

  isEditable: (status: WeeklyReportStatus): boolean => {
    return status === 'DRAFT' || status === 'NEEDS_REVISION';
  },

  isTerminal: (status: WeeklyReportStatus): boolean => {
    return status === 'REVIEWED';
  }
};

// Internship Application Guards
export const applicationGuards = {
  canUpdate: (status: InternshipApplicationStatus): boolean => {
    return status === 'DRAFT' || status === 'REJECTED';
  },

  canSubmit: (status: InternshipApplicationStatus): boolean => {
    return status === 'DRAFT';
  },

  canApproveOrReject: (status: InternshipApplicationStatus): boolean => {
    return status === 'SUBMITTED';
  },

  canCancel: (status: InternshipApplicationStatus): boolean => {
    return status === 'DRAFT' || status === 'SUBMITTED';
  },

  isEditable: (status: InternshipApplicationStatus): boolean => {
    return status === 'DRAFT' || status === 'REJECTED';
  },

  isTerminal: (status: InternshipApplicationStatus): boolean => {
    return status === 'APPROVED' || status === 'CANCELLED';
  }
};

// Group Task Guards
export const groupTaskGuards = {
  canUpdate: (status: GroupTaskStatus): boolean => {
    return status !== 'DONE' && status !== 'CANCELLED';
  },

  canChangeStatus: (status: GroupTaskStatus): boolean => {
    return status !== 'DONE' && status !== 'CANCELLED';
  },

  canComplete: (status: GroupTaskStatus): boolean => {
    return status === 'REVIEW';
  },

  canStartReview: (status: GroupTaskStatus): boolean => {
    return status === 'IN_PROGRESS';
  },

  isEditable: (status: GroupTaskStatus): boolean => {
    return status !== 'DONE' && status !== 'CANCELLED';
  },

  isTerminal: (status: GroupTaskStatus): boolean => {
    return status === 'DONE' || status === 'CANCELLED';
  }
};

// Assessment Submission Guards
export const assessmentGuards = {
  canUpdate: (status: AssessmentSubmissionStatus): boolean => {
    return status === 'DRAFT' || status === 'SUBMITTED';
  },

  canSubmit: (status: AssessmentSubmissionStatus): boolean => {
    return status === 'DRAFT';
  },

  canPublish: (status: AssessmentSubmissionStatus): boolean => {
    return status === 'SUBMITTED';
  },

  isEditable: (status: AssessmentSubmissionStatus): boolean => {
    return status === 'DRAFT' || status === 'SUBMITTED';
  },

  isTerminal: (status: AssessmentSubmissionStatus): boolean => {
    return status === 'PUBLISHED';
  }
};

// Helper to get reason why action is blocked
export const getBlockedReason = (
  entityType: 'report' | 'application' | 'task' | 'assessment',
  action: string,
  status: string
): string | null => {
  switch (entityType) {
    case 'report':
      if (action === 'update' && !weeklyReportGuards.canUpdate(status as WeeklyReportStatus)) {
        return `Cannot edit report in ${status} status. Only DRAFT or NEEDS_REVISION reports can be edited.`;
      }
      if (action === 'submit' && !weeklyReportGuards.canSubmit(status as WeeklyReportStatus)) {
        return `Cannot submit report in ${status} status.`;
      }
      if (action === 'review' && !weeklyReportGuards.canReview(status as WeeklyReportStatus)) {
        return `Cannot review report in ${status} status. Only SUBMITTED reports can be reviewed.`;
      }
      break;

    case 'application':
      if (action === 'update' && !applicationGuards.canUpdate(status as InternshipApplicationStatus)) {
        return `Cannot edit application in ${status} status. Only DRAFT or REJECTED applications can be edited.`;
      }
      if (action === 'submit' && !applicationGuards.canSubmit(status as InternshipApplicationStatus)) {
        return `Cannot submit application in ${status} status. Only DRAFT applications can be submitted.`;
      }
      if (action === 'approve' && !applicationGuards.canApproveOrReject(status as InternshipApplicationStatus)) {
        return `Cannot approve application in ${status} status. Only SUBMITTED applications can be approved.`;
      }
      break;

    case 'task':
      if (action === 'update' && !groupTaskGuards.canUpdate(status as GroupTaskStatus)) {
        return `Cannot edit task in ${status} status. Completed or cancelled tasks cannot be edited.`;
      }
      if (action === 'complete' && !groupTaskGuards.canComplete(status as GroupTaskStatus)) {
        return `Cannot complete task in ${status} status. Only tasks in REVIEW can be completed.`;
      }
      break;

    case 'assessment':
      if (action === 'update' && !assessmentGuards.canUpdate(status as AssessmentSubmissionStatus)) {
        return `Cannot edit assessment in ${status} status.`;
      }
      if (action === 'publish' && !assessmentGuards.canPublish(status as AssessmentSubmissionStatus)) {
        return `Cannot publish assessment in ${status} status. Only SUBMITTED assessments can be published.`;
      }
      break;
  }

  return null;
};
