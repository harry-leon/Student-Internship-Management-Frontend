import React from 'react';
import { uiConfig } from '../../config/ui.config';
import { layoutConfig } from '../../config/layout.config';

export interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: string;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  icon,
  badge,
  actions,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col justify-between gap-3 sm:flex-row sm:items-center bg-white dark:bg-slate-900 ${layoutConfig.page.headerPadding} ${uiConfig.radius.card} border border-slate-200/90 dark:border-slate-800 shadow-2xs ${className}`}
    >
      <div>
        <div className="flex items-center gap-2">
          {icon && (
            <span className="material-symbols-outlined text-[#004ac6] dark:text-blue-400 text-[20px]">
              {icon}
            </span>
          )}
          <h1 className={layoutConfig.page.titleSize}>{title}</h1>
          {badge && <div className="ml-1">{badge}</div>}
        </div>
        {description && <p className={layoutConfig.page.subtitleSize}>{description}</p>}
      </div>

      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
};
