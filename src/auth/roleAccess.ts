import { NavPage, Role } from '../types';

export const ROLE_PAGES: Record<Role, NavPage[]> = {
  Admin: [
    'landing',
    'dashboard',
    'users',
    'students',
    'mentors',
    'internship-phases',
    'assignments',
    'evaluation-criteria',
    'assessment-rounds',
    'assessment-results',
    'my-profile',
  ],
  Mentor: [
    'landing',
    'dashboard',
    'students',
    'internship-phases',
    'assignments',
    'evaluation-criteria',
    'assessment-rounds',
    'assessment-results',
    'my-profile',
  ],
  Student: [
    'landing',
    'dashboard',
    'mentors',
    'internship-phases',
    'assignments',
    'evaluation-criteria',
    'assessment-rounds',
    'assessment-results',
    'my-profile',
  ],
};

export const canAccessPage = (role: Role, page: NavPage): boolean => {
  return ROLE_PAGES[role]?.includes(page) ?? false;
};

export const canManageSystemData = (role: Role): boolean => role === 'Admin';

export const canUpdateAssignmentStatus = (role: Role): boolean => role === 'Admin';
