import React from 'react';

interface UploadProgressProps {
  progress: number;
  statusText?: string;
  isError?: boolean;
}

export const UploadProgress: React.FC<UploadProgressProps> = ({
  progress,
  statusText,
  isError = false,
}) => {
  return (
    <div className="w-full space-y-1.5 py-1">
      <div className="flex justify-between text-xs text-slate-600 font-medium">
        <span>{statusText || (isError ? 'Tải lên thất bại' : 'Đang tải lên...')}</span>
        <span>{progress}%</span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
        <div
          className={`h-full transition-all duration-300 rounded-full ${
            isError ? 'bg-rose-500' : progress === 100 ? 'bg-emerald-500' : 'bg-[#004ac6]'
          }`}
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
    </div>
  );
};
