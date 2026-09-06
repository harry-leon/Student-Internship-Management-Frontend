import { NavPage, Role } from '../types';

export const ROLE_PAGES: Record<Role, NavPage[]> = {
  Admin: [
    'landing',
    'dashboard',
    'companies',
    'applications',
    'weekly-reports',
    'submissions',
    'tasks',
    'users',
    'students',
    'mentors',
    'groups',
    'mentor-groups',
    'internship-phases',
    'assignments',
    'evaluation-criteria',
    'assessment-rounds',
    'assessment-results',
    'settings-roles',
    'settings-permissions',
    'role-permissions',
    'admin-group-rooms',
    'group-rooms',
    'group-room',
    'profile',
    'my-profile',
  ],
  Mentor: [
    'landing',
    'dashboard',
    'companies',
    'applications',
    'weekly-reports',
    'submissions',
    'tasks',
    'students',
    'groups',
    'mentor-groups',
    'group-rooms',
    'group-room',
    'assessment-results',
    'profile',
    'my-profile',
  ],
  Student: [
    'landing',
    'dashboard',
    'companies',
    'weekly-reports',
    'submissions',
    'tasks',
    'groups',
    'mentor-groups',
    'group-rooms',
    'group-room',
    'assessment-results',
    'profile',
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
  'tasks': 'SUBMISSION_VIEW',
  'evaluation-criteria': 'ASSESSMENT_VIEW',
  'assessment-rounds': 'ASSESSMENT_VIEW',
  'assessment-results': 'ASSESSMENT_VIEW',
  'groups': 'GROUP_VIEW',
  'mentor-groups': 'GROUP_VIEW',
  'settings-roles': 'ROLE_PERMISSION_VIEW',
  'settings-permissions': 'ROLE_PERMISSION_VIEW',
  'role-permissions': 'ROLE_PERMISSION_VIEW',
  'admin-group-rooms': 'ADMIN_GROUP_ROOM_VIEW_ALL',
  'group-rooms': 'GROUP_ROOM_VIEW',
  'group-room': 'GROUP_ROOM_VIEW',
};

export const canAccessPage = (
  role: Role,
  page: NavPage,
  hasPermission?: (perm: string) => boolean,
  hasFeature?: (feature: string) => boolean
): boolean => {
  const allowed = ROLE_PAGES[role]?.includes(page) ?? false;
  if (!allowed) return false;

  // Student can only access assessment-results if STUDENT_VIEW_SCORE_ENABLED is on
  if (role === 'Student' && page === 'assessment-results') {
    if (hasFeature && !hasFeature('STUDENT_VIEW_SCORE_ENABLED')) {
      return false;
    }
  }

  const requiredPermission = PAGE_PERMISSIONS[page];
  if (requiredPermission && hasPermission) {
    return hasPermission(requiredPermission);
  }
  return true;
};

export const canManageSystemData = (role: Role): boolean => role === 'Admin';

export const canUpdateAssignmentStatus = (role: Role): boolean => role === 'Admin';

// Action permission checkers
export const canCreate = (role: Role, module: string, can?: (perm: string) => boolean): boolean => {
  if (role === 'Admin') return true;
  return can ? can(`${module}_CREATE`) : false;
};

export const canEdit = (role: Role, module: string, can?: (perm: string) => boolean): boolean => {
  if (role === 'Admin') return true;
  return can ? can(`${module}_UPDATE`) : false;
};

export const canDelete = (role: Role, module: string, can?: (perm: string) => boolean): boolean => {
  if (role === 'Admin') return true;
  return can ? can(`${module}_DELETE`) : false;
};

export const canDownload = (role: Role, module: string, can?: (perm: string) => boolean): boolean => {
  if (role === 'Admin') return true;
  return can ? can(`${module}_DOWNLOAD`) : false;
};

export const canGrade = (role: Role, can?: (perm: string) => boolean, hasFeature?: (feature: string) => boolean): boolean => {
  if (role === 'Student') return false; // Students can NEVER grade
  if (role === 'Admin') return true;
  const hasPerm = can ? can('ASSESSMENT_SCORE') : true;
  const isEnabled = hasFeature ? hasFeature('MENTOR_SCORING_ENABLED') : true;
  return hasPerm && isEnabled;
};

export const canPublish = (role: Role, can?: (perm: string) => boolean): boolean => {
  if (role !== 'Admin') return false; // Only Admin can publish
  return can ? can('ASSESSMENT_PUBLISH') : true;
};

export const canExport = (role: Role): boolean => {
  return role === 'Admin';
};
