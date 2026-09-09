import React, { useState, useEffect } from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

export const ErrorBoundary: React.FC<ErrorBoundaryProps> = ({ children }) => {
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const errorHandler = (event: ErrorEvent) => {
      console.error('Captured window error:', event.error);
      setHasError(true);
      setErrorMessage(event.error?.message || event.message || 'Lỗi giao diện xảy ra');
    };

    window.addEventListener('error', errorHandler);
    return () => {
      window.removeEventListener('error', errorHandler);
    };
  }, []);

  if (hasError) {
    return (
      <div className="min-h-screen bg-[#070d19] text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-center mb-4">
          <span className="material-symbols-outlined text-[32px]">warning</span>
        </div>
        <h2 className="text-2xl font-bold mb-2">Đã xảy ra lỗi giao diện!</h2>
        <p className="text-sm text-slate-400 max-w-md mb-6">{errorMessage}</p>
        <button
          type="button"
          onClick={() => {
            setHasError(false);
            window.location.reload();
          }}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg transition-colors cursor-pointer"
        >
          Tải Lại Trang
        </button>
      </div>
    );
  }

  return <>{children}</>;
};
