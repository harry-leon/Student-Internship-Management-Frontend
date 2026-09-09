import React from 'react';
import { layoutConfig } from '../../config/layout.config';

export interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const PageContainer: React.FC<PageContainerProps> = ({ children, className = '' }) => {
  return (
    <div className={`flex flex-col w-full ${layoutConfig.content.gap} animate-in fade-in duration-200 ${className}`}>
      {children}
    </div>
  );
};
