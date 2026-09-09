import React from 'react';
import { themeConfig, ThemeStatusKey, ThemeRoleKey } from '../../config/theme.config';
import { uiConfig } from '../../config/ui.config';

export interface BadgeProps {
  children: React.ReactNode;
  status?: ThemeStatusKey | string;
  role?: ThemeRoleKey | string;
  dot?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  status,
  role,
  dot = false,
  className = '',
}) => {
  let styleClass = 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';

  if (status) {
    const key = (status in themeConfig.status)
      ? (status as ThemeStatusKey)
      : (status.toLowerCase() as ThemeStatusKey);
    if (themeConfig.status[key]) {
      styleClass = themeConfig.status[key];
    }
  } else if (role && themeConfig.roles[role as ThemeRoleKey]) {
    styleClass = themeConfig.roles[role as ThemeRoleKey];
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-semibold border ${uiConfig.radius.badge} ${styleClass} ${className}`}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />}
      {children}
    </span>
  );
};
