import React, { useState } from 'react';
import { StoredFileDTO, fileService } from '../../api/services';

interface FilePreviewListProps {
  files: StoredFileDTO[];
  canDownload?: boolean;
  canDelete?: boolean;
  onDelete?: (fileId: number) => void;
}

export const FilePreviewList: React.FC<FilePreviewListProps> = ({
  files,
  canDownload = true,
  canDelete = false,
  onDelete,
}) => {
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  const getFileIcon = (ext: string) => {
    const e = ext.toLowerCase();
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(e)) return 'folder_zip';
    if (['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'].includes(e)) return 'image';
    if (['pdf'].includes(e)) return 'picture_as_pdf';
    if (['doc', 'docx'].includes(e)) return 'description';
    if (['xls', 'xlsx'].includes(e)) return 'table_view';
    return 'attach_file';
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleDownload = async (file: StoredFileDTO) => {
    setDownloadingId(file.fileId);
    try {
      await fileService.downloadFile(file.fileId, file.originalFileName);
    } catch (err: any) {
      alert(err.message || 'Lỗi khi tải tệp xuống');
    } finally {
      setDownloadingId(null);
    }
  };

  if (!files || files.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      {files.map((file) => (
        <div
          key={file.fileId}
          className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all text-xs"
        >
          <div className="flex items-center gap-2.5 overflow-hidden">
            <span className="material-symbols-outlined text-[#004ac6] text-[22px] shrink-0">
              {getFileIcon(file.fileExtension)}
            </span>
            <div className="overflow-hidden">
              <p className="font-semibold text-slate-800 truncate" title={file.originalFileName}>
                {file.originalFileName}
              </p>
              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <span>{formatBytes(file.fileSize)}</span>
                <span>•</span>
                <span className="uppercase">{file.fileExtension}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {canDownload && (
              <button
                type="button"
                onClick={() => handleDownload(file)}
                disabled={downloadingId === file.fileId}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[#004ac6] hover:bg-blue-50 transition-colors font-semibold cursor-pointer disabled:opacity-50"
                title="Tải tệp xuống"
              >
                <span className="material-symbols-outlined text-[16px]">
                  {downloadingId === file.fileId ? 'sync' : 'download'}
                </span>
                <span>{downloadingId === file.fileId ? 'Đang tải...' : 'Tải về'}</span>
              </button>
            )}

            {canDelete && onDelete && (
              <button
                type="button"
                onClick={() => onDelete(file.fileId)}
                className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                title="Xóa tệp"
              >
                <span className="material-symbols-outlined text-[16px]">delete</span>
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
