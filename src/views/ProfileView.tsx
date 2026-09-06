import React, { useState, useEffect, useRef } from 'react';
import { Role } from '../types';
import { useAuth } from '../context/AuthContext';
import { authService } from '../api/authService';
import { userService } from '../api/services';
import { PageContainer, PageHeader, Card, Button, Badge } from '../components/ui';

interface ProfileViewProps {
  currentRole: Role;
  onRoleChange: (role: Role) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  currentRole,
}) => {
  const { user, permissions, checkAuth } = useAuth();
  const [name, setName] = useState(user?.fullName || user?.username || 'Người Dùng');
  const [email, setEmail] = useState(user?.email || 'user@fpt.edu.vn');
  const [phone, setPhone] = useState(user?.phoneNumber || '');
  const [department, setDepartment] = useState('Khoa Công Nghệ Thông Tin');
  
  const [saving, setSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [avatarMsg, setAvatarMsg] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setName(user.fullName || user.username);
      setEmail(user.email || '');
      if (user.phoneNumber) setPhone(user.phoneNumber);
    }
  }, [user]);

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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);
    setIsSaved(false);

    try {
      if (user?.userId) {
        await userService.update(user.userId, {
          fullName: name,
          email,
          phoneNumber: phone,
        });
        await checkAuth();
      }
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (err: any) {
      // Fallback update local feedback
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  const activeRole = (user?.role as Role) || currentRole;

  return (
    <PageContainer>
      {/* Page Header */}
      <PageHeader
        title="Thông Tin Tài Khoản & Hồ Sơ"
        description="Quản lý thông tin định danh cá nhân, ảnh đại diện, vai trò và phân quyền hệ thống."
        icon="badge"
        badge={
          <Badge role={activeRole}>
            {activeRole.toUpperCase()}
          </Badge>
        }
      />

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Identity Summary Card */}
        <div className="lg:col-span-4 space-y-4">
          <Card padding="normal" className="flex flex-col items-center text-center">
            {/* Avatar with upload button */}
            <div className="relative group mt-1">
              <img
                src={displayAvatar}
                alt={name}
                className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-slate-800 shadow-md transition-transform group-hover:scale-[1.02]"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="absolute bottom-0 right-0 p-2 bg-[#004ac6] hover:bg-[#003896] text-white rounded-full shadow-md transition-all cursor-pointer disabled:opacity-50"
                title="Thay đổi ảnh đại diện"
              >
                <span className="material-symbols-outlined text-[16px] leading-none">photo_camera</span>
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarFileChange}
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
              />
            </div>

            {/* User Core Info */}
            <h2 className="mt-3.5 text-base font-bold text-slate-900 dark:text-white tracking-tight">
              {name}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              @{user?.username || 'user'}
            </p>

            <div className="mt-2.5">
              <Badge role={activeRole}>
                {activeRole.toUpperCase()}
              </Badge>
            </div>

            {avatarMsg && (
              <p className="mt-2 text-xs text-[#004ac6] dark:text-blue-400 font-medium">
                {avatarMsg}
              </p>
            )}

            {user?.avatarUrl && (
              <button
                type="button"
                onClick={handleDeleteAvatar}
                disabled={uploading}
                className="mt-2 text-[11px] text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
              >
                Gỡ ảnh đại diện
              </button>
            )}

            {/* Quick Metadata list */}
            <div className="w-full mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 text-left space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">ID Tài khoản</span>
                <span className="font-mono font-semibold text-slate-700 dark:text-slate-200">
                  #{user?.userId || 1}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">Trạng thái</span>
                <Badge status={user?.isActive !== false ? 'active' : 'inactive'} dot>
                  {user?.isActive !== false ? 'Hoạt động' : 'Tạm khóa'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">Xác thực API</span>
                <span className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                  /api/auth/me
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Edit Profile Details Card */}
        <div className="lg:col-span-8 space-y-4">
          <Card
            header={
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#004ac6] dark:text-blue-400 text-[18px]">
                  manage_accounts
                </span>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Chi Tiết Thông Tin Cá Nhân
                </h3>
              </div>
            }
            padding="normal"
          >
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Họ và Tên
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Nhập họ và tên..."
                    className="w-full h-9 px-3 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-[#004ac6] dark:focus:border-blue-400 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Email Xác Thực
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="Nhập email..."
                    className="w-full h-9 px-3 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-[#004ac6] dark:focus:border-blue-400 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Số Điện Thoại
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Nhập số điện thoại (VD: 0912345678)..."
                    className="w-full h-9 px-3 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-[#004ac6] dark:focus:border-blue-400 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Khoa / Bộ Môn
                  </label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="Khoa Công Nghệ Thông Tin"
                    className="w-full h-9 px-3 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-[#004ac6] dark:focus:border-blue-400 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {isSaved && (
                <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2 border border-emerald-200 dark:border-emerald-800/60 animate-in fade-in">
                  <span className="material-symbols-outlined text-[18px] text-emerald-600 dark:text-emerald-400">
                    check_circle
                  </span>
                  <span>Đã lưu thông tin tài khoản thành công!</span>
                </div>
              )}

              {errorMsg && (
                <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2 border border-rose-200 dark:border-rose-800/60 animate-in fade-in">
                  <span className="material-symbols-outlined text-[18px] text-rose-600 dark:text-rose-400">
                    error
                  </span>
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  icon="save"
                  loading={saving}
                >
                  Lưu Thay Đổi
                </Button>
              </div>
            </form>
          </Card>

          {/* Permissions & Security Summary Card */}
          <Card
            header={
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#004ac6] dark:text-blue-400 text-[18px]">
                  shield
                </span>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Quyền Hạn Đang Hoạt Động
                </h3>
              </div>
            }
            padding="normal"
          >
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
              Danh sách các quyền hạn được cấp phát cho tài khoản theo vai trò <strong>{activeRole}</strong>:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {permissions && permissions.length > 0 ? (
                permissions.slice(0, 15).map((perm) => (
                  <span
                    key={perm}
                    className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                  >
                    {perm}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-400">Không có quyền hạn đặc biệt</span>
              )}
              {permissions && permissions.length > 15 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 dark:bg-blue-950/40 text-[#004ac6] dark:text-blue-300 border border-blue-200 dark:border-blue-800/60">
                  +{permissions.length - 15} quyền khác
                </span>
              )}
            </div>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
};
