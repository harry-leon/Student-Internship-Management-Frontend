import React, { useRef, useState } from 'react';
import { fileService } from '../../api/services';
import { UploadProgress } from './UploadProgress';

interface AvatarUploadProps {
  currentAvatarUrl?: string | null;
  onSuccess?: (newAvatarUrl: string) => void;
  size?: number; // size in px, default 80
}

export const AvatarUpload: React.FC<AvatarUploadProps> = ({
  currentAvatarUrl,
  onSuccess,
  size = 80,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
  const MAX_SIZE = 2 * 1024 * 1024; // 2MB

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];

    // Validate type
    if (!ALLOWED_TYPES.includes(file.type.toLowerCase())) {
      setErrorMessage('Chỉ chấp nhận định dạng ảnh: JPG, JPEG, PNG, WEBP');
      return;
    }

    // Validate size
    if (file.size > MAX_SIZE) {
      setErrorMessage('Kích thước ảnh vượt quá giới hạn 2MB');
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgress(20);
    setErrorMessage(null);

    try {
      const interval = setInterval(() => {
        setUploadProgress((prev) => (prev < 90 ? prev + 20 : prev));
      }, 100);

      const res = await fileService.uploadAvatar(selectedFile);
      clearInterval(interval);
      setUploadProgress(100);

      const downloadUrl = res.downloadUrl || `/api/files/${res.fileId}/download`;
      setSuccessMessage('Cập nhật ảnh đại diện thành công!');
      setSelectedFile(null);

      if (onSuccess) {
        onSuccess(downloadUrl);
      }

      setTimeout(() => {
        setSuccessMessage(null);
        setUploadProgress(0);
      }, 3000);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || err.message || 'Lỗi khi tải ảnh đại diện lên');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancelPreview = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setSelectedFile(null);
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const displayImage = previewUrl || currentAvatarUrl;

  return (
    <div className="flex flex-col items-center space-y-3">
      {/* Avatar Display with Upload Overlay */}
      <div className="relative group">
        <div
          style={{ width: `${size}px`, height: `${size}px` }}
          className="rounded-full overflow-hidden border-2 border-slate-200 shadow-xs bg-slate-100 flex items-center justify-center"
        >
          {displayImage ? (
            <img
              src={displayImage}
              alt="Avatar"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          ) : (
            <span className="material-symbols-outlined text-slate-400 text-[40px]">person</span>
          )}
        </div>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white cursor-pointer disabled:opacity-0"
          title="Đổi ảnh đại diện"
        >
          <span className="material-symbols-outlined text-[24px]">photo_camera</span>
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* Actions when file is selected for preview */}
      {selectedFile && (
        <div className="flex flex-col items-center space-y-2">
          <p className="text-[11px] text-slate-500 font-medium truncate max-w-[200px]">
            {selectedFile.name}
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleUpload}
              disabled={isUploading}
              className="px-3 py-1 text-xs font-semibold text-white bg-[#004ac6] hover:bg-[#003eb3] rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            >
              {isUploading ? 'Đang tải...' : 'Lưu ảnh'}
            </button>
            <button
              type="button"
              onClick={handleCancelPreview}
              disabled={isUploading}
              className="px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Hủy
            </button>
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {isUploading && (
        <div className="w-48">
          <UploadProgress progress={uploadProgress} />
        </div>
      )}

      {/* Status Messages */}
      {errorMessage && (
        <p className="text-xs text-rose-600 font-medium text-center">{errorMessage}</p>
      )}
      {successMessage && (
        <p className="text-xs text-emerald-600 font-medium text-center">{successMessage}</p>
      )}
    </div>
  );
};
