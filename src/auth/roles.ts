import { Role } from '../types';

export const normalizeRole = (role?: string): Role => {
  if (!role) return 'Student';

  const upperRole = role.toUpperCase();
  if (upperRole === 'ADMIN') return 'Admin';
  if (upperRole === 'MENTOR') return 'Mentor';
  return 'Student';
};
