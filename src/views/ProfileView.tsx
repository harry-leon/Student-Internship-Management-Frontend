import React, { useState, useEffect } from 'react';
import { Role } from '../types';
import { useAuth } from '../context/AuthContext';

interface ProfileViewProps {
  currentRole: Role;
  onRoleChange: (role: Role) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  currentRole,
  onRoleChange,
}) => {
  const { user, checkAuth } = useAuth();
  const [name, setName] = useState(user?.fullName || user?.username || 'Người Dùng Backend');
  const [email, setEmail] = useState(user?.email || 'user@fpt.edu.vn');
  const [phone, setPhone] = useState(user?.phoneNumber || '');
  const [department, setDepartment] = useState('Khoa Công Nghệ Thông Tin');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.fullName || user.username);
      setEmail(user.email || '');
      if (user.phoneNumber) setPhone(user.phoneNumber);
    }
  }, [user]);

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [avatarMsg, setAvatarMsg] = useState<string | null>(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
  const displayAvatar = user?.avatarUrl
    ? (user.avatarUrl.startsWith('http') ? user.avatarUrl : `${API_BASE_URL}${user.avatarUrl}`)
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=004AC6&color=fff`;

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setAvatarMsg(null);
    try {
      await authService.uploadMyAvatar(file);
      await checkAuth();
      setAvatarMsg('Cập nhật avatar thành công!');
    } catch (err: any) {
      setAvatarMsg(err.message || 'Lỗi khi upload avatar');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteAvatar = async () => {
    setUploading(true);
    setAvatarMsg(null);
    try {
      await authService.deleteMyAvatar();
      await checkAuth();
      setAvatarMsg('Đã xóa avatar!');
    } catch (err: any) {
      setAvatarMsg(err.message || 'Lỗi khi xóa avatar');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="flex flex-col w-full max-w-4xl animate-in fade-in duration-200">
      {/* Title */}
      <div className="mb-6">
        <h1 className="text-[24px] font-semibold text-[#0b1c30] tracking-tight">
          Thông Tin Tài Khoản Hợp Lệ Từ API
        </h1>
        <p className="text-[13px] text-[#64748b] mt-0.5">
          Thông tin xác thực từ hệ thống Spring Boot Backend (`/api/auth/me`).
        </p>
      </div>

      <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-xs overflow-hidden">
        {/* Profile Card Header */}
        <div className="p-6 bg-gradient-to-r from-[#eff4ff] to-[#f8f9ff] border-b border-[#e2e8f0] flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="relative group">
            <img
              src={displayAvatar}
              alt={name}
              className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-sm"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute bottom-0 right-0 p-1.5 bg-[#004ac6] text-white rounded-full shadow-md hover:bg-[#003ea8] transition-all cursor-pointer"
              title="Đổi avatar"
            >
              <span className="material-symbols-outlined text-[14px]">photo_camera</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarFileChange}
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
            />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h2 className="text-[20px] font-bold text-[#0b1c30]">{name}</h2>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#f3e8ff] text-[#6b21a8] border border-[#e9d5ff]">
                {(user?.role || currentRole).toUpperCase()}
              </span>
            </div>
            <p className="text-[13px] text-[#64748b] mt-0.5">
              Tên đăng nhập: <strong className="text-[#0b1c30]">{user?.username || 'GUEST'}</strong>
            </p>
            <div className="flex items-center gap-4 mt-2 text-[12px] text-[#434655]">
              <span>ID Tài khoản: #{user?.userId || 1}</span>
              <span>•</span>
              <span>Trạng thái: <strong className="text-emerald-600">{user?.isActive ? 'Hoạt động' : 'Tắt'}</strong></span>
              {user?.avatarUrl && (
                <>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={handleDeleteAvatar}
                    className="text-red-600 hover:underline cursor-pointer"
                  >
                    Xóa avatar
                  </button>
                </>
              )}
            </div>
            {avatarMsg && (
              <p className="text-[12px] text-[#004ac6] font-medium mt-1">{avatarMsg}</p>
            )}
          </div>
        </div>

        {/* Form Details */}
        <form onSubmit={handleSave} className="p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-medium text-[#434655] mb-1">
                Họ và Tên
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-[13px] rounded-lg border border-[#e2e8f0] focus:border-[#2563eb] outline-none"
              />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-[#434655] mb-1">
                Email Xác Thực
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-[13px] rounded-lg border border-[#e2e8f0] focus:border-[#2563eb] outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-medium text-[#434655] mb-1">
                Số Điện Thoại
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Nhập số điện thoại..."
                className="w-full px-3 py-2 text-[13px] rounded-lg border border-[#e2e8f0] focus:border-[#2563eb] outline-none"
              />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-[#434655] mb-1">
                Khoa / Bộ Môn
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 text-[13px] rounded-lg border border-[#e2e8f0] focus:border-[#2563eb] outline-none"
              />
            </div>
          </div>

          {isSaved && (
            <div className="p-3 rounded-lg bg-emerald-50 text-emerald-800 text-[13px] flex items-center gap-2 border border-emerald-200">
              <span className="material-symbols-outlined text-[18px] text-emerald-600">
                check_circle
              </span>
              <span>Đã lưu thông tin tài khoản thành công.</span>
            </div>
          )}

          <div className="pt-3 border-t border-[#f1f5f9] flex items-center justify-end">
            <button
              type="submit"
              className="px-4 py-2 text-[13px] font-medium bg-[#004ac6] hover:bg-[#003ea8] text-white rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">save</span>
              <span>Lưu Thay Đổi</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
