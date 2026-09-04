import React from 'react';
import { Assignment, InternshipPhase, AssessmentRound, Student, Mentor, Role } from '../types';
import { useAuth } from '../context/AuthContext';
import { AdminDashboard } from '../components/dashboard/AdminDashboard';
import { MentorDashboard } from '../components/dashboard/MentorDashboard';
import { StudentDashboard } from '../components/dashboard/StudentDashboard';

interface DashboardViewProps {
  phase: InternshipPhase;
  assignments: Assignment[];
  rounds: AssessmentRound[];
  students?: Student[];
  mentors?: Mentor[];
  currentRole?: Role;
  onOpenConfigurePhase: () => void;
  onOpenExportReport: () => void;
  onOpenQuickAction: () => void;
  onSelectAssignment: (assignment: Assignment) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  phase,
  assignments,
  rounds,
  currentRole = 'Admin',
  onOpenConfigurePhase,
  onOpenExportReport,
  onOpenQuickAction,
  onSelectAssignment,
}) => {
  const { user } = useAuth();
  const effectiveRole = user?.role ? (user.role as Role) : currentRole;

  if (effectiveRole === 'Mentor') {
    return <MentorDashboard />;
  }

  if (effectiveRole === 'Student') {
    return <StudentDashboard />;
  }

  return (
    <AdminDashboard
      phase={phase}
      assignments={assignments}
      rounds={rounds}
      onOpenConfigurePhase={onOpenConfigurePhase}
      onOpenExportReport={onOpenExportReport}
      onOpenQuickAction={onOpenQuickAction}
      onSelectAssignment={onSelectAssignment}
    />
  );
};
