import { NavPage, Role } from '../types';
import { PermissionCode, PermissionCodeType } from './permissions.config';

export interface NavItemConfig {
  id: NavPage;
  path: string;
  label: string | ((role: Role) => string);
  icon: string;
  requiredPermissions?: PermissionCodeType[];
  featureFlag?: string;
  allowedRoles?: Role[];
}

export interface NavSectionConfig {
  title: string;
  items: NavItemConfig[];
}

export const navigationSections: NavSectionConfig[] = [
  {
    title: 'OVERVIEW',
    items: [
      {
        id: 'dashboard',
        path: '/dashboard',
        label: 'Dashboard',
        icon: 'home',
        requiredPermissions: [PermissionCode.DASHBOARD_VIEW],
      },
    ],
  },
  {
    title: 'PEOPLE',
    items: [
      {
        id: 'users',
        path: '/users',
        label: 'Users',
        icon: 'group',
        requiredPermissions: [PermissionCode.USER_VIEW],
      },
      {
        id: 'students',
        path: '/students',
        label: 'Students',
        icon: 'school',
        requiredPermissions: [PermissionCode.STUDENT_VIEW],
      },
      {
        id: 'mentors',
        path: '/mentors',
        label: 'Mentors',
        icon: 'supervisor_account',
        requiredPermissions: [PermissionCode.MENTOR_VIEW],
      },
      {
        id: 'groups',
        path: '/groups',
        label: 'Groups',
        icon: 'groups',
        requiredPermissions: [PermissionCode.GROUP_VIEW],
      },
    ],
  },
  {
    title: 'INTERNSHIP',
    items: [
      {
        id: 'companies',
        path: '/companies',
        label: 'Companies',
        icon: 'domain',
        requiredPermissions: [PermissionCode.COMPANY_VIEW],
      },
      {
        id: 'tasks',
        path: '/tasks',
        label: (role: Role) => (role === 'Student' ? 'My Tasks' : 'Group Tasks'),
        icon: 'task',
        requiredPermissions: [PermissionCode.GROUP_TASK_VIEW, PermissionCode.SUBMISSION_VIEW],
      },
      {
        id: 'submissions',
        path: '/submissions',
        label: 'Submissions',
        icon: 'assignment_turned_in',
        requiredPermissions: [PermissionCode.SUBMISSION_VIEW],
      },
      {
        id: 'weekly-reports',
        path: '/weekly-reports',
        label: 'Weekly Reports',
        icon: 'description',
        requiredPermissions: [PermissionCode.PHASE_VIEW],
        featureFlag: 'WEEKLY_REPORT_SUBMISSION_ENABLED',
      },
      {
        id: 'applications',
        path: '/applications',
        label: 'Applications',
        icon: 'post_add',
        requiredPermissions: [PermissionCode.PHASE_VIEW],
        featureFlag: 'APPLICATION_REGISTRATION_ENABLED',
      },
      {
        id: 'internship-phases',
        path: '/internship-phases',
        label: 'Internship Phases',
        icon: 'timeline',
        requiredPermissions: [PermissionCode.PHASE_VIEW],
      },
      {
        id: 'assignments',
        path: '/assignments',
        label: 'Assignments',
        icon: 'assignment',
        requiredPermissions: [PermissionCode.ASSIGNMENT_VIEW],
      },
    ],
  },
  {
    title: 'EVALUATION',
    items: [
      {
        id: 'evaluation-criteria',
        path: '/evaluation-criteria',
        label: 'Evaluation Criteria',
        icon: 'rule',
        requiredPermissions: [PermissionCode.ASSESSMENT_CREATE],
      },
      {
        id: 'assessment-rounds',
        path: '/assessment-rounds',
        label: 'Assessment Rounds',
        icon: 'event_repeat',
        requiredPermissions: [PermissionCode.ASSESSMENT_CREATE],
      },
      {
        id: 'assessment-results',
        path: '/assessment-results',
        label: 'Assessment Results',
        icon: 'insights',
        requiredPermissions: [PermissionCode.ASSESSMENT_VIEW],
      },
    ],
  },
  {
    title: 'SETTINGS',
    items: [
      {
        id: 'settings-roles',
        path: '/settings/roles',
        label: 'Roles',
        icon: 'shield_person',
        requiredPermissions: [PermissionCode.ROLE_VIEW, PermissionCode.ROLE_PERMISSION_VIEW],
      },
      {
        id: 'settings-permissions',
        path: '/settings/permissions',
        label: 'Permissions',
        icon: 'security',
        requiredPermissions: [PermissionCode.PERMISSION_VIEW, PermissionCode.ROLE_PERMISSION_VIEW],
      },
    ],
  },
];
