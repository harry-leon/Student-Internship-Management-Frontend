import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import {
  Role,
  NavPage,
  Assignment,
  InternshipPhase,
  Student,
  AssessmentRound,
  EvaluationCriterion,
  AssignmentStatus,
} from './types';

import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LoginModal } from './components/LoginModal';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './views/DashboardView';
import { AssignmentsView } from './views/AssignmentsView';
import { StudentsView } from './views/StudentsView';
import { MentorsView } from './views/MentorsView';
import { MentorGroupsView } from './views/MentorGroupsView';
import { PhasesView } from './views/PhasesView';
import { EvaluationCriteriaView } from './views/EvaluationCriteriaView';
import { AssessmentRoundsView } from './views/AssessmentRoundsView';
import { AssessmentResultsView } from './views/AssessmentResultsView';
import { UsersView } from './views/UsersView';
import { CompaniesView } from './views/CompaniesView';
import { InternshipApplicationsView } from './views/InternshipApplicationsView';
import { WeeklyReportsView } from './views/WeeklyReportsView';
import { SubmissionsView } from './views/SubmissionsView';
import { ProfileView } from './views/ProfileView';
import { RolePermissionsView } from './views/RolePermissionsView';
import { LoginView } from './views/LoginView';
import { PublicLandingView } from './views/PublicLandingView';
import { MentorGroupRoomView } from './views/MentorGroupRoomView';
import { AdminGroupRoomsView } from './views/AdminGroupRoomsView';

import { CommandPaletteModal } from './components/CommandPaletteModal';
import { QuickActionModal } from './components/QuickActionModal';
import { ExportReportModal } from './components/ExportReportModal';
import { ConfigurePhaseModal } from './components/ConfigurePhaseModal';
import { AssignmentDetailModal } from './components/AssignmentDetailModal';
import { PermissionGuard } from './components/PermissionGuard';

import {
  studentService,
  phaseService,
  assignmentService,
  criterionService,
} from './api/services';
import { ROLE_PAGES, canAccessPage } from './auth/roleAccess';
import { PermissionCode } from './config/permissions.config';
import { layoutConfig } from './config/layout.config';

const PAGE_ROUTE_MAP: Partial<Record<NavPage, string>> = {
  dashboard: '/dashboard',
  users: '/users',
  students: '/students',
  mentors: '/mentors',
  companies: '/companies',
  groups: '/groups',
  'mentor-groups': '/groups',
  tasks: '/tasks',
  submissions: '/submissions',
  'assessment-results': '/assessment-results',
  'settings-roles': '/settings/roles',
  'settings-permissions': '/settings/permissions',
  'role-permissions': '/settings/roles',
  'weekly-reports': '/weekly-reports',
  applications: '/applications',
  assignments: '/assignments',
  'internship-phases': '/internship-phases',
  'evaluation-criteria': '/evaluation-criteria',
  'assessment-rounds': '/assessment-rounds',
  'my-profile': '/profile',
  profile: '/profile',
};

function AppRoutes() {
  const { isAuthenticated, user, can, hasFeature, hasPermission } = useAuth();
  const [currentRole, setCurrentRole] = useState<Role>('Admin');
  const location = useLocation();
  const navigate = useNavigate();

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);
  const [isExportReportOpen, setIsExportReportOpen] = useState(false);
  const [isConfigurePhaseOpen, setIsConfigurePhaseOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);

  const [phases, setPhases] = useState<InternshipPhase[]>([]);
  const [rounds, setRounds] = useState<AssessmentRound[]>([]);

  useEffect(() => {
    if (user?.role) {
      setCurrentRole(user.role);
    }
  }, [user]);

  const activeRole = (user?.role as Role) || currentRole;
  const canManage =
    activeRole === 'Admin' ||
    (activeRole as string) === 'Manager' ||
    can(PermissionCode.PHASE_UPDATE) ||
    can(PermissionCode.STUDENT_CREATE);

  const activePhase = phases[0] || {
    id: '0',
    name: 'Chưa có đợt thực tập',
    term: 'Spring 2026',
    status: 'ACTIVE',
    startDate: '2026-01-01',
    endDate: '2026-05-30',
    weeksRemaining: 0,
    progressPercent: 0,
    targetMilestone: 'Tạo đợt thực tập mới trong hệ thống',
    totalStudents: 0,
    totalMentors: 0,
    scheduledRounds: 0,
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleAddAssignment = async (newAsg: Assignment) => {
    if (isAuthenticated && hasPermission('ASSIGNMENT_CREATE')) {
      try {
        await assignmentService.create({
          studentId: Number(newAsg.id) || 1,
          mentorId: 1,
          phaseId: Number(activePhase.id) || 1,
        });
      } catch (err) {
        console.warn('API error creating assignment:', err);
      }
    }
  };

  const handleAddStudent = async (newStd: Student) => {
    if (isAuthenticated && hasPermission('STUDENT_CREATE')) {
      try {
        await studentService.create({
          userId: 1,
          studentCode: newStd.code,
          major: newStd.department,
        });
      } catch (err) {
        console.warn('API error creating student:', err);
      }
    }
  };

  const handleUpdatePhase = async (updated: InternshipPhase) => {
    if (isAuthenticated && hasPermission('PHASE_UPDATE') && updated.id && updated.id !== '0') {
      try {
        await phaseService.update(Number(updated.id), {
          phaseName: updated.name,
          startDate: updated.startDate,
          endDate: updated.endDate,
        });
      } catch (err) {
        console.warn('API error updating phase:', err);
      }
    }
  };

  const handleUpdateAssignmentStatus = async (id: string, newStatus: AssignmentStatus) => {
    if (isAuthenticated && (hasPermission('ASSIGNMENT_UPDATE') || hasPermission('ASSIGNMENT_CHANGE_STATUS')) && !isNaN(Number(id))) {
      try {
        await assignmentService.updateStatus(Number(id), newStatus);
      } catch (err) {
        console.warn('API error updating assignment status:', err);
      }
    }
    if (selectedAssignment && selectedAssignment.id === id) {
      setSelectedAssignment((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
  };

  const handleDeleteAssignment = async (id: string) => {
    if (isAuthenticated && hasPermission('ASSIGNMENT_DELETE') && !isNaN(Number(id))) {
      try {
        await assignmentService.delete(Number(id));
      } catch (err) {
        console.warn('API error deleting assignment:', err);
      }
    }
    if (selectedAssignment && selectedAssignment.id === id) {
      setSelectedAssignment(null);
    }
  };

  const handleAddCriterion = async (newCrit: EvaluationCriterion) => {
    if (isAuthenticated && hasPermission('ASSESSMENT_CREATE')) {
      try {
        await criterionService.create({
          criterionName: newCrit.name,
          description: newCrit.description,
          maxScore: newCrit.maxScore,
        });
      } catch (err) {
        console.warn('API error creating criterion:', err);
      }
    }
  };

  if (location.pathname === '/login') {
    return <LoginView onSuccessNavigate={() => navigate('/dashboard')} />;
  }

  if (location.pathname === '/landing' || !isAuthenticated) {
    return (
      <>
        <PublicLandingView
          onNavigate={() => {}}
          onOpenLogin={() => setIsLoginModalOpen(true)}
        />
        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9ff] dark:bg-[#0b1329] text-[#0b1c30] dark:text-slate-100 transition-colors duration-200">
      <Sidebar
        currentRole={activeRole}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      <div className={`${layoutConfig.sidebar.contentOffsetClass} flex flex-col min-h-screen`}>
        <Header
          currentRole={activeRole}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
          onOpenLoginModal={() => setIsLoginModalOpen(true)}
        />

        <main className={`flex-1 ${layoutConfig.header.contentOffsetClass}`}>
          <div className={layoutConfig.content.wrapperClass}>
            <Routes>
              {/* Primary Resource-Based Routes */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route
                path="/dashboard"
                element={
                  <PermissionGuard page="dashboard" requiredPermission={PermissionCode.DASHBOARD_VIEW}>
                    <DashboardView
                      phase={activePhase}
                      assignments={[]}
                      rounds={rounds}
                      students={[]}
                      mentors={[]}
                      currentRole={activeRole}
                      onOpenConfigurePhase={() => canManage && setIsConfigurePhaseOpen(true)}
                      onOpenExportReport={() => canManage && setIsExportReportOpen(true)}
                      onOpenQuickAction={() => canManage && setIsQuickActionOpen(true)}
                      onSelectAssignment={setSelectedAssignment}
                    />
                  </PermissionGuard>
                }
              />
              <Route
                path="/users"
                element={
                  <PermissionGuard page="users" requiredPermission={PermissionCode.USER_VIEW}>
                    <UsersView users={[]} onRefreshData={() => {}} />
                  </PermissionGuard>
                }
              />
              <Route
                path="/students"
                element={
                  <PermissionGuard page="students" requiredPermission={PermissionCode.STUDENT_VIEW}>
                    <StudentsView
                      currentRole={activeRole}
                      onOpenAddStudent={() => canManage && setIsQuickActionOpen(true)}
                    />
                  </PermissionGuard>
                }
              />
              <Route
                path="/mentors"
                element={
                  <PermissionGuard page="mentors" requiredPermission={PermissionCode.MENTOR_VIEW}>
                    <MentorsView currentRole={activeRole} />
                  </PermissionGuard>
                }
              />
              <Route
                path="/companies"
                element={
                  <PermissionGuard page="companies" requiredPermission={PermissionCode.COMPANY_VIEW}>
                    <CompaniesView currentRole={activeRole} />
                  </PermissionGuard>
                }
              />
              <Route
                path="/groups"
                element={
                  <PermissionGuard page="groups" requiredPermission={PermissionCode.GROUP_VIEW}>
                    <MentorGroupsView currentRole={activeRole} />
                  </PermissionGuard>
                }
              />
              <Route
                path="/groups/:groupId"
                element={
                  <PermissionGuard page="groups" requiredPermission={PermissionCode.GROUP_ROOM_VIEW}>
                    <MentorGroupRoomView />
                  </PermissionGuard>
                }
              />
              <Route
                path="/groups/:groupId/tasks"
                element={
                  <PermissionGuard page="groups" requiredPermission={PermissionCode.GROUP_ROOM_VIEW}>
                    <MentorGroupRoomView />
                  </PermissionGuard>
                }
              />
              <Route
                path="/tasks"
                element={
                  <PermissionGuard page="tasks" requiredPermissions={[PermissionCode.GROUP_TASK_VIEW, PermissionCode.SUBMISSION_VIEW]}>
                    <SubmissionsView currentRole={activeRole} defaultTab="TASKS" />
                  </PermissionGuard>
                }
              />
              <Route
                path="/submissions"
                element={
                  <PermissionGuard page="submissions" requiredPermission={PermissionCode.SUBMISSION_VIEW}>
                    <SubmissionsView currentRole={activeRole} defaultTab="SUBMISSIONS" />
                  </PermissionGuard>
                }
              />
              <Route
                path="/assessment-results"
                element={
                  <PermissionGuard page="assessment-results" requiredPermission={PermissionCode.ASSESSMENT_VIEW}>
                    <AssessmentResultsView students={[]} currentRole={activeRole} />
                  </PermissionGuard>
                }
              />
              <Route
                path="/settings/roles"
                element={
                  <PermissionGuard page="settings-roles" requiredPermissions={[PermissionCode.ROLE_VIEW, PermissionCode.ROLE_PERMISSION_VIEW]}>
                    <RolePermissionsView currentRole={activeRole} defaultTab="roles" />
                  </PermissionGuard>
                }
              />
              <Route
                path="/settings/permissions"
                element={
                  <PermissionGuard page="settings-permissions" requiredPermissions={[PermissionCode.PERMISSION_VIEW, PermissionCode.ROLE_PERMISSION_VIEW]}>
                    <RolePermissionsView currentRole={activeRole} defaultTab="permissions" />
                  </PermissionGuard>
                }
              />

              {/* Auxiliary System Routes */}
              <Route
                path="/weekly-reports"
                element={
                  <PermissionGuard page="weekly-reports" requiredPermission={PermissionCode.PHASE_VIEW}>
                    <WeeklyReportsView currentRole={activeRole} />
                  </PermissionGuard>
                }
              />
              <Route
                path="/applications"
                element={
                  <PermissionGuard page="applications" requiredPermission={PermissionCode.PHASE_VIEW}>
                    <InternshipApplicationsView currentRole={activeRole} />
                  </PermissionGuard>
                }
              />
              <Route
                path="/assignments"
                element={
                  <PermissionGuard page="assignments" requiredPermission={PermissionCode.ASSIGNMENT_VIEW}>
                    <AssignmentsView
                      currentRole={activeRole}
                      onSelectAssignment={setSelectedAssignment}
                      onOpenQuickAction={() => canManage && setIsQuickActionOpen(true)}
                    />
                  </PermissionGuard>
                }
              />
              <Route
                path="/internship-phases"
                element={
                  <PermissionGuard page="internship-phases" requiredPermission={PermissionCode.PHASE_VIEW}>
                    <PhasesView
                      phases={phases}
                      currentRole={activeRole}
                      onConfigurePhase={() => {
                        if (canManage) setIsConfigurePhaseOpen(true);
                      }}
                    />
                  </PermissionGuard>
                }
              />
              <Route
                path="/evaluation-criteria"
                element={
                  <PermissionGuard page="evaluation-criteria" requiredPermission={PermissionCode.ASSESSMENT_VIEW}>
                    <EvaluationCriteriaView
                      criteria={[]}
                      currentRole={activeRole}
                      onAddCriterion={handleAddCriterion}
                    />
                  </PermissionGuard>
                }
              />
              <Route
                path="/assessment-rounds"
                element={
                  <PermissionGuard page="assessment-rounds" requiredPermission={PermissionCode.ASSESSMENT_VIEW}>
                    <AssessmentRoundsView rounds={rounds} />
                  </PermissionGuard>
                }
              />
              <Route
                path="/admin-group-rooms"
                element={
                  <PermissionGuard page="admin-group-rooms" requiredPermission={PermissionCode.ADMIN_GROUP_ROOM_VIEW_ALL}>
                    <AdminGroupRoomsView />
                  </PermissionGuard>
                }
              />
              <Route
                path="/profile"
                element={
                  <PermissionGuard page="profile">
                    <ProfileView currentRole={activeRole} onRoleChange={setCurrentRole} />
                  </PermissionGuard>
                }
              />
              <Route path="/my-profile" element={<Navigate to="/profile" replace />} />

              {/* Backward Compatibility Redirects from old /admin/* URLs */}
              <Route path="/admin/dashboard" element={<Navigate to="/dashboard" replace />} />
              <Route path="/admin/users" element={<Navigate to="/users" replace />} />
              <Route path="/admin/students" element={<Navigate to="/students" replace />} />
              <Route path="/admin/mentors" element={<Navigate to="/mentors" replace />} />
              <Route path="/admin/companies" element={<Navigate to="/companies" replace />} />
              <Route path="/admin/mentor-groups" element={<Navigate to="/groups" replace />} />
              <Route path="/admin/groups" element={<Navigate to="/groups" replace />} />
              <Route path="/admin/group-rooms/:groupId" element={<Navigate to="/groups/:groupId" replace />} />
              <Route path="/admin/admin-group-rooms" element={<Navigate to="/groups" replace />} />
              <Route path="/admin/tasks" element={<Navigate to="/tasks" replace />} />
              <Route path="/admin/submissions" element={<Navigate to="/submissions" replace />} />
              <Route path="/admin/assessment-results" element={<Navigate to="/assessment-results" replace />} />
              <Route path="/admin/role-permissions" element={<Navigate to="/settings/roles" replace />} />
              <Route path="/admin/weekly-reports" element={<Navigate to="/weekly-reports" replace />} />
              <Route path="/admin/applications" element={<Navigate to="/applications" replace />} />
              <Route path="/admin/assignments" element={<Navigate to="/assignments" replace />} />
              <Route path="/admin/internship-phases" element={<Navigate to="/internship-phases" replace />} />
              <Route path="/admin/evaluation-criteria" element={<Navigate to="/evaluation-criteria" replace />} />
              <Route path="/admin/assessment-rounds" element={<Navigate to="/assessment-rounds" replace />} />
              <Route path="/admin/my-profile" element={<Navigate to="/profile" replace />} />
              <Route path="/admin/*" element={<Navigate to="/dashboard" replace />} />

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
        </main>
      </div>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />

      <CommandPaletteModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        currentRole={activeRole}
        onNavigate={(page) => {
          const target = PAGE_ROUTE_MAP[page] || '/dashboard';
          navigate(target);
        }}
        students={[]}
        mentors={[]}
        phases={phases}
      />

      <QuickActionModal
        isOpen={isQuickActionOpen}
        onClose={() => setIsQuickActionOpen(false)}
        phases={phases}
        mentors={[]}
        onAddAssignment={handleAddAssignment}
        onAddStudent={handleAddStudent}
      />

      <ExportReportModal
        isOpen={isExportReportOpen}
        onClose={() => setIsExportReportOpen(false)}
        phases={phases}
      />

      <ConfigurePhaseModal
        isOpen={isConfigurePhaseOpen}
        onClose={() => setIsConfigurePhaseOpen(false)}
        phase={activePhase}
        onUpdatePhase={handleUpdatePhase}
      />

      <AssignmentDetailModal
        isOpen={!!selectedAssignment}
        onClose={() => setSelectedAssignment(null)}
        assignment={selectedAssignment}
        currentRole={activeRole}
        onUpdateStatus={handleUpdateAssignmentStatus}
        onDeleteAssignment={handleDeleteAssignment}
      />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

