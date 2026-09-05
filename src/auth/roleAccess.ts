import { NavPage, Role } from '../types';

export const ROLE_PAGES: Record<Role, NavPage[]> = {
  Admin: [
    'landing',
    'dashboard',
    'companies',
    'applications',
    'weekly-reports',
    'submissions',
    'users',
    'students',
    'mentors',
    'mentor-groups',
    'internship-phases',
    'assignments',
    'evaluation-criteria',
    'assessment-rounds',
    'assessment-results',
    'role-permissions',
    'my-profile',
  ],
  Mentor: [
    'landing',
    'dashboard',
    'companies',
    'applications',
    'weekly-reports',
    'submissions',
    'students',
    'mentor-groups',
    'assessment-results',
    'my-profile',
  ],
  Student: [
    'landing',
    'dashboard',
    'companies',
    'applications',
    'weekly-reports',
    'submissions',
    'mentor-groups',
    'assessment-results',
    'my-profile',
  ],
};

export const PAGE_PERMISSIONS: Partial<Record<NavPage, string>> = {
  'users': 'USER_VIEW',
  'students': 'STUDENT_VIEW',
  'mentors': 'MENTOR_VIEW',
  'companies': 'COMPANY_VIEW',
  'internship-phases': 'PHASE_VIEW',
  'assignments': 'ASSIGNMENT_VIEW',
  'submissions': 'SUBMISSION_VIEW',
  'evaluation-criteria': 'ASSESSMENT_VIEW',
  'assessment-rounds': 'ASSESSMENT_VIEW',
  'assessment-results': 'ASSESSMENT_VIEW',
  'mentor-groups': 'GROUP_VIEW',
  'role-permissions': 'ROLE_PERMISSION_VIEW',
};

export const canAccessPage = (
  role: Role,
  page: NavPage,
  hasPermission?: (perm: string) => boolean
): boolean => {
  const allowed = ROLE_PAGES[role]?.includes(page) ?? false;
  if (!allowed) return false;

  const requiredPermission = PAGE_PERMISSIONS[page];
  if (requiredPermission && hasPermission) {
    return hasPermission(requiredPermission);
  }
  return true;
};

export const canManageSystemData = (role: Role): boolean => role === 'Admin';

export const canUpdateAssignmentStatus = (role: Role): boolean => role === 'Admin';
