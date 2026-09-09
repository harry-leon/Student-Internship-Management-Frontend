import React, { useCallback, useEffect, useRef } from 'react';
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
  refreshKey?: number;
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
  refreshKey,
  onOpenConfigurePhase,
  onOpenExportReport,
  onOpenQuickAction,
  onSelectAssignment,
}) => {
  const { user } = useAuth();
  const effectiveRole = user?.role ? (user.role as Role) : currentRole;

  // Ref to the refetch function provided by child dashboard
  const refetchRef = useRef<(() => void) | null>(null);

  const triggerRefetch = useCallback(() => {
    refetchRef.current?.();
  }, []);

  // Re-fetch when refreshKey changes (post-mutation invalidation from parent)
  useEffect(() => {
    if (refreshKey !== undefined && refreshKey > 0) {
      triggerRefetch();
    }
  }, [refreshKey, triggerRefetch]);

  // Refetch on tab visibility change (user returns to dashboard tab)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        triggerRefetch();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [triggerRefetch]);

  if (effectiveRole === 'Mentor') {
    return <MentorDashboard onRegisterRefetch={(fn) => { refetchRef.current = fn; }} />;
  }

  if (effectiveRole === 'Student') {
    return <StudentDashboard onRegisterRefetch={(fn) => { refetchRef.current = fn; }} />;
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
      onRegisterRefetch={(fn) => { refetchRef.current = fn; }}
    />
  );
};
