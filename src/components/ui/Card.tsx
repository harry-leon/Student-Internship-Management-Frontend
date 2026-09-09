import React from 'react';
import { uiConfig } from '../../config/ui.config';

export interface CardProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  padding?: 'normal' | 'compact' | 'none';
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  header,
  footer,
  padding = 'normal',
  className = '',
  onClick,
}) => {
  const paddingClass =
    padding === 'normal'
      ? uiConfig.spacing.cardPadding
      : padding === 'compact'
      ? uiConfig.spacing.compactCardPadding
      : '';

  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 ${uiConfig.radius.card} shadow-2xs transition-colors ${onClick ? 'cursor-pointer hover:border-blue-400 dark:hover:border-blue-500/50' : ''} ${className}`}
    >
      {header && (
        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          {header}
        </div>
      )}
      <div className={paddingClass}>{children}</div>
      {footer && (
        <div className="px-4 py-2.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
          {footer}
        </div>
      )}
    </div>
  );
};
