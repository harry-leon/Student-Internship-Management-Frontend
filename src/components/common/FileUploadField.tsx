import React, { useRef, useState } from 'react';

interface FileUploadFieldProps {
  onFileSelect: (file: File | null) => void;
  selectedFile: File | null;
  accept?: string;
  maxSizeBytes?: number;
  label?: string;
  helperText?: string;
  disabled?: boolean;
}

export const FileUploadField: React.FC<FileUploadFieldProps> = ({
  onFileSelect,
  selectedFile,
  accept,
  maxSizeBytes = 20 * 1024 * 1024, // 20MB default
  label = 'Tải tệp lên',
  helperText,
  disabled = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleValidateAndSelect = (file: File) => {
    setValidationError(null);
    if (file.size > maxSizeBytes) {
      setValidationError(`Kích thước tệp (${formatBytes(file.size)}) vượt quá giới hạn cho phép (${formatBytes(maxSizeBytes)})`);
      return;
    }
    onFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleValidateAndSelect(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleValidateAndSelect(e.target.files[0]);
    }
  };

  const handleClear = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setValidationError(null);
    onFileSelect(null);
  };

  return (
    <div className="w-full space-y-1.5">
      {label && <label className="block text-xs font-semibold text-slate-700">{label}</label>}

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors ${
          disabled
            ? 'border-slate-200 bg-slate-50 cursor-not-allowed'
            : isDragging
            ? 'border-[#004ac6] bg-blue-50/50'
            : selectedFile
            ? 'border-emerald-300 bg-emerald-50/20'
            : 'border-slate-300 hover:border-[#004ac6] bg-white'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          disabled={disabled}
          onChange={handleChange}
          className="hidden"
        />

        {selectedFile ? (
          <div className="flex items-center justify-between gap-3 text-left">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <span className="material-symbols-outlined text-emerald-600 text-[26px]">
                check_circle
              </span>
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-slate-800 truncate">{selectedFile.name}</p>
                <p className="text-[11px] text-slate-400">{formatBytes(selectedFile.size)}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
              className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              title="Xóa tệp đã chọn"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        ) : (
          <div className="space-y-1">
            <span className="material-symbols-outlined text-slate-400 text-[32px]">
              cloud_upload
            </span>
            <p className="text-xs text-slate-600 font-medium">
              Kéo thả tệp vào đây hoặc <span className="text-[#004ac6] font-semibold underline">duyệt từ máy</span>
            </p>
            <p className="text-[11px] text-slate-400">
              {helperText || `Hỗ trợ tệp dung lượng tối đa ${formatBytes(maxSizeBytes)}`}
            </p>
          </div>
        )}
      </div>

      {validationError && (
        <div className="flex items-center gap-1.5 text-xs text-rose-600 bg-rose-50 px-2.5 py-1.5 rounded-lg border border-rose-200">
          <span className="material-symbols-outlined text-[16px]">error</span>
          <span>{validationError}</span>
        </div>
      )}
    </div>
  );
};
