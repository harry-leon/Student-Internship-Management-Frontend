import React from 'react';
import { themeConfig, ThemeButtonVariant } from '../../config/theme.config';
import { uiConfig } from '../../config/ui.config';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ThemeButtonVariant;
  size?: 'sm' | 'md';
  icon?: string;
  loading?: boolean;
  children?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon,
  loading = false,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const variantClass = themeConfig.buttons[variant] || themeConfig.buttons.primary;
  const sizeClass = size === 'sm' ? uiConfig.density.buttonSm : uiConfig.density.buttonMd;

  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-1.5 font-semibold transition-all cursor-pointer ${uiConfig.radius.button} ${variantClass} ${sizeClass} ${(disabled || loading) ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      {...props}
    >
      {loading ? (
        <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : icon ? (
        <span className="material-symbols-outlined text-[16px] leading-none">{icon}</span>
      ) : null}
      {children && <span>{children}</span>}
    </button>
  );
};
