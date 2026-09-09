import { NavPage } from '../types';
import { PermissionCode, PermissionCodeType } from './permissions.config';

export interface RouteItemConfig {
  path: string;
  page: NavPage;
  title: string;
  requiredPermission?: PermissionCodeType;
  requiredPermissions?: PermissionCodeType[];
}

export const routeConfigs: RouteItemConfig[] = [
  {
    path: '/dashboard',
    page: 'dashboard',
    title: 'Bảng điều khiển',
    requiredPermission: PermissionCode.DASHBOARD_VIEW,
  },
  {
    path: '/users',
    page: 'users',
    title: 'Quản lý tài khoản',
    requiredPermission: PermissionCode.USER_VIEW,
  },
  {
    path: '/students',
    page: 'students',
    title: 'Danh sách sinh viên',
    requiredPermission: PermissionCode.STUDENT_VIEW,
  },
  {
    path: '/mentors',
    page: 'mentors',
    title: 'Giảng viên hướng dẫn',
    requiredPermission: PermissionCode.MENTOR_VIEW,
  },
  {
    path: '/companies',
    page: 'companies',
    title: 'Doanh nghiệp thực tập',
    requiredPermission: PermissionCode.COMPANY_VIEW,
  },
  {
    path: '/groups',
    page: 'groups',
    title: 'Nhóm thực tập',
    requiredPermission: PermissionCode.GROUP_VIEW,
  },
  {
    path: '/groups/:groupId',
    page: 'groups',
    title: 'Phòng làm việc nhóm',
    requiredPermission: PermissionCode.GROUP_ROOM_VIEW,
  },
  {
    path: '/groups/:groupId/tasks',
    page: 'groups',
    title: 'Công việc nhóm',
    requiredPermission: PermissionCode.GROUP_ROOM_VIEW,
  },
  {
    path: '/tasks',
    page: 'tasks',
    title: 'Nhiệm vụ',
    requiredPermissions: [PermissionCode.GROUP_TASK_VIEW, PermissionCode.SUBMISSION_VIEW],
  },
  {
    path: '/submissions',
    page: 'submissions',
    title: 'Bài nộp & Báo cáo',
    requiredPermission: PermissionCode.SUBMISSION_VIEW,
  },
  {
    path: '/assessment-results',
    page: 'assessment-results',
    title: 'Kết quả đánh giá',
    requiredPermission: PermissionCode.ASSESSMENT_VIEW,
  },
  {
    path: '/settings/roles',
    page: 'settings-roles',
    title: 'Cấu hình Vai trò',
    requiredPermissions: [PermissionCode.ROLE_VIEW, PermissionCode.ROLE_PERMISSION_VIEW],
  },
  {
    path: '/settings/permissions',
    page: 'settings-permissions',
    title: 'Phân quyền hệ thống',
    requiredPermissions: [PermissionCode.PERMISSION_VIEW, PermissionCode.ROLE_PERMISSION_VIEW],
  },
  {
    path: '/weekly-reports',
    page: 'weekly-reports',
    title: 'Báo cáo định kỳ',
    requiredPermission: PermissionCode.PHASE_VIEW,
  },
  {
    path: '/applications',
    page: 'applications',
    title: 'Đơn đăng ký',
    requiredPermission: PermissionCode.PHASE_VIEW,
  },
  {
    path: '/assignments',
    page: 'assignments',
    title: 'Phân công hướng dẫn',
    requiredPermission: PermissionCode.ASSIGNMENT_VIEW,
  },
  {
    path: '/internship-phases',
    page: 'internship-phases',
    title: 'Đợt thực tập',
    requiredPermission: PermissionCode.PHASE_VIEW,
  },
  {
    path: '/evaluation-criteria',
    page: 'evaluation-criteria',
    title: 'Tiêu chí đánh giá',
    requiredPermission: PermissionCode.ASSESSMENT_VIEW,
  },
  {
    path: '/assessment-rounds',
    page: 'assessment-rounds',
    title: 'Vòng đánh giá',
    requiredPermission: PermissionCode.ASSESSMENT_VIEW,
  },
  {
    path: '/admin-group-rooms',
    page: 'admin-group-rooms',
    title: 'Quản lý phòng nhóm',
    requiredPermission: PermissionCode.ADMIN_GROUP_ROOM_VIEW_ALL,
  },
  {
    path: '/profile',
    page: 'profile',
    title: 'Hồ sơ cá nhân',
  },
];
