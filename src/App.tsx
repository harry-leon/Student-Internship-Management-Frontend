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
import { LoginView } from './views/LoginView';
import { PublicLandingView } from './views/PublicLandingView';

import { CommandPaletteModal } from './components/CommandPaletteModal';
import { QuickActionModal } from './components/QuickActionModal';
import { ExportReportModal } from './components/ExportReportModal';
import { ConfigurePhaseModal } from './components/ConfigurePhaseModal';
import { AssignmentDetailModal } from './components/AssignmentDetailModal';

import {
  studentService,
  phaseService,
  assignmentService,
  criterionService,
} from './api/services';
import { ROLE_PAGES, canManageSystemData, canUpdateAssignmentStatus } from './auth/roleAccess';

function AppRoutes() {
  const { isAuthenticated, user } = useAuth();
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

  const pathParts = location.pathname.split('/').filter(Boolean);
  const currentPagePath = pathParts[1] ?? (pathParts[0] === 'login' ? 'login' : 'dashboard');
  const currentPage = (currentPagePath as NavPage) || 'dashboard';
  const activeRole = user?.role ? (user.role as Role) : currentRole;
  const allowedPages = ROLE_PAGES[activeRole] || ROLE_PAGES.Admin;
  const isCurrentPageAllowed = allowedPages.includes(currentPage);
  const canManage = canManageSystemData(activeRole);

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
    if (isAuthenticated && canManage) {
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
    if (isAuthenticated && canManage) {
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
    if (isAuthenticated && canManage && updated.id && updated.id !== '0') {
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
    if (isAuthenticated && canUpdateAssignmentStatus(activeRole) && !isNaN(Number(id))) {
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
    if (isAuthenticated && canManage && !isNaN(Number(id))) {
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
    if (isAuthenticated && canManage) {
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

  useEffect(() => {
    if (isAuthenticated && !allowedPages.includes(currentPage)) {
      // Route-level guards handle redirection/fallback rendering.
    }
  }, [currentRole, user?.role, isAuthenticated, currentPage, allowedPages]);

  if (currentPage === 'login') {
    return <LoginView onSuccessNavigate={() => {}} />;
  }

  if (currentPage === 'landing' || !isAuthenticated) {
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
    <div className="min-h-screen bg-[#f8f9ff] text-[#0b1c30]">
      <Sidebar
        currentRole={activeRole}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      <div className="lg:pl-[228px] flex flex-col min-h-screen">
        <Header
          currentRole={activeRole}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
          onOpenLoginModal={() => setIsLoginModalOpen(true)}
        />

        <main className="flex-1 pt-[56px]">
          <div className="w-full max-w-[1480px] mx-auto p-3 sm:p-4 lg:p-4.5">
            {!isCurrentPageAllowed && (
              <div className="bg-white rounded-3xl border border-red-200 p-8 sm:p-12 text-center max-w-xl mx-auto my-8 shadow-xs">
                <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 border border-red-200 flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-outlined text-[32px]">block</span>
                </div>
                <h3 className="text-2xl font-bold text-slate-900">Không Có Quyền Truy Cập (403)</h3>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                  Màn hình <strong className="text-slate-900 font-bold">[{currentPage}]</strong> không thuộc phạm vi truy cập của tài khoản vai trò <strong className="text-indigo-600 font-bold">[{activeRole}]</strong>.
                </p>
                <div className="mt-6 pt-6 border-t border-slate-100 flex justify-center">
                  <button
                    type="button"
                    onClick={() => {
                      window.location.href = '/admin/dashboard';
                    }}
                    className="px-6 py-3 bg-[#004ac6] hover:bg-[#003ea8] text-white font-semibold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[18px]">home</span>
                    <span>Quay về trang Dashboard được phép</span>
                  </button>
                </div>
              </div>
            )}

            {isCurrentPageAllowed && (
              <Routes>
                <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="/admin/dashboard" element={
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
                } />
                <Route path="/admin/companies" element={<CompaniesView currentRole={activeRole} />} />
                <Route path="/admin/applications" element={<InternshipApplicationsView currentRole={activeRole} />} />
                <Route path="/admin/weekly-reports" element={<WeeklyReportsView currentRole={activeRole} />} />
                <Route path="/admin/submissions" element={<SubmissionsView currentRole={activeRole} />} />
                <Route path="/admin/assignments" element={
                  <AssignmentsView
                    currentRole={activeRole}
                    onSelectAssignment={setSelectedAssignment}
                    onOpenQuickAction={() => canManage && setIsQuickActionOpen(true)}
                  />
                } />
                <Route path="/admin/students" element={
                  <StudentsView
                    currentRole={activeRole}
                    onOpenAddStudent={() => canManage && setIsQuickActionOpen(true)}
                  />
                } />
                <Route path="/admin/mentors" element={<MentorsView currentRole={activeRole} />} />
                <Route path="/admin/mentor-groups" element={<MentorGroupsView currentRole={activeRole} />} />
                <Route path="/admin/internship-phases" element={
                  <PhasesView
                    phases={phases}
                    currentRole={activeRole}
                    onConfigurePhase={() => {
                      if (canManage) setIsConfigurePhaseOpen(true);
                    }}
                  />
                } />
                <Route path="/admin/evaluation-criteria" element={
                  <EvaluationCriteriaView
                    criteria={[]}
                    currentRole={activeRole}
                    onAddCriterion={handleAddCriterion}
                  />
                } />
                <Route path="/admin/assessment-rounds" element={<AssessmentRoundsView rounds={rounds} />} />
                <Route path="/admin/assessment-results" element={<AssessmentResultsView students={[]} />} />
                <Route path="/admin/users" element={<UsersView users={[]} onRefreshData={() => {}} />} />
                <Route path="/admin/my-profile" element={<ProfileView currentRole={activeRole} onRoleChange={setCurrentRole} />} />
                <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
              </Routes>
            )}
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
          if (allowedPages.includes(page)) {
            navigate(`/admin/${page}`);
          }
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
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}

