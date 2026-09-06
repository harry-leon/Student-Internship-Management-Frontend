import React, { useEffect, useState } from 'react';
import {
  capabilityService,
  RoleDTO,
  PermissionDTO,
  SystemFeatureDTO,
  RoleFeatureDTO,
} from '../api/capabilityService';
import { Role } from '../types';
import { useAuth } from '../context/AuthContext';

interface RolePermissionsViewProps {
  currentRole: Role;
  defaultTab?: 'roles' | 'permissions' | 'features';
}

export const RolePermissionsView: React.FC<RolePermissionsViewProps> = ({ currentRole, defaultTab = 'permissions' }) => {
  const { reloadCapabilities } = useAuth();
  const [activeTab, setActiveTab] = useState<'roles' | 'permissions' | 'features'>(defaultTab);

  useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab]);

  // Permissions state
  const [roles, setRoles] = useState<RoleDTO[]>([]);
  const [permissions, setPermissions] = useState<PermissionDTO[]>([]);
  // roleCode -> Set of granted permissionCodes
  const [rolePermsMap, setRolePermsMap] = useState<Record<string, Set<string>>>({});
  const [permSearch, setPermSearch] = useState('');
  const [selectedModule, setSelectedModule] = useState<string>('ALL');

  // Feature flags state
  const [features, setFeatures] = useState<SystemFeatureDTO[]>([]);
  // roleCode -> Map of featureCode -> enabled
  const [roleFeaturesMap, setRoleFeaturesMap] = useState<Record<string, Record<string, boolean>>>({});
  const [featureSearch, setFeatureSearch] = useState('');

  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    setStatusMessage(null);
    try {
      const [allRoles, allPerms, allFeats] = await Promise.all([
        capabilityService.fetchRoles(),
        capabilityService.fetchPermissions(),
        capabilityService.fetchFeatures(),
      ]);

      setRoles(allRoles);
      setPermissions(allPerms);
      setFeatures(allFeats);

      // Load permissions for each role
      const permMap: Record<string, Set<string>> = {};
      const featMap: Record<string, Record<string, boolean>> = {};

      await Promise.all(
        allRoles.map(async (r) => {
          const [rolePerms, roleFeats] = await Promise.all([
            capabilityService.fetchRolePermissions(r.roleCode),
            capabilityService.fetchRoleFeatures(r.roleCode),
          ]);
          permMap[r.roleCode] = new Set(rolePerms);

          const rFeatRecord: Record<string, boolean> = {};
          roleFeats.forEach((rf: RoleFeatureDTO) => {
            rFeatRecord[rf.featureCode] = rf.enabled;
          });
          featMap[r.roleCode] = rFeatRecord;
        })
      );

      setRolePermsMap(permMap);
      setRoleFeaturesMap(featMap);
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err?.message || 'Không thể tải dữ liệu phân quyền hệ thống.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleTogglePermission = (roleCode: string, permCode: string) => {
    const essentialAdmin = [
      'ROLE_PERMISSION_VIEW',
      'ROLE_PERMISSION_UPDATE',
      'PERMISSION_VIEW',
      'PERMISSION_UPDATE',
      'ROLE_VIEW',
      'ROLE_UPDATE',
      'USER_VIEW',
    ];
    if (roleCode === 'ADMIN' && essentialAdmin.includes(permCode)) {
      alert(`Không thể tắt quyền quản trị cốt lõi [${permCode}] của vai trò ADMIN!`);
      return;
    }

    setRolePermsMap((prev) => {
      const currentSet = new Set(prev[roleCode] || []);
      if (currentSet.has(permCode)) {
        currentSet.delete(permCode);
      } else {
        currentSet.add(permCode);
      }
      return { ...prev, [roleCode]: currentSet };
    });
  };

  const handleToggleFeature = (roleCode: string, featureCode: string) => {
    setRoleFeaturesMap((prev) => {
      const currentMap = { ...(prev[roleCode] || {}) };
      currentMap[featureCode] = !currentMap[featureCode];
      return { ...prev, [roleCode]: currentMap };
    });
  };

  const handleSavePermissions = async () => {
    setIsSaving(true);
    setStatusMessage(null);
    try {
      await Promise.all(
        roles.map((r) => {
          const grantedList: string[] = Array.from(rolePermsMap[r.roleCode] || []);
          return capabilityService.updateRolePermissions(r.roleCode, grantedList);
        })
      );
      await reloadCapabilities();
      window.dispatchEvent(new CustomEvent('permissions:updated'));
      setStatusMessage({
        type: 'success',
        text: 'Cập nhật ma trận phân quyền vai trò (Role Permissions) thành công! Giao diện đã đồng bộ tức thì.',
      });
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err?.message || 'Lỗi khi lưu phân quyền.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveFeatures = async () => {
    setIsSaving(true);
    setStatusMessage(null);
    try {
      await Promise.all(
        roles.map((r) => {
          const featuresList = Object.entries(roleFeaturesMap[r.roleCode] || {}).map(
            ([featureCode, enabled]) => ({ featureCode, enabled: Boolean(enabled) })
          );
          return capabilityService.updateRoleFeatures(r.roleCode, featuresList);
        })
      );
      await reloadCapabilities();
      window.dispatchEvent(new CustomEvent('permissions:updated'));
      setStatusMessage({
        type: 'success',
        text: 'Cập nhật cờ tính năng (Feature Flags) thành công! Toàn bộ tính năng đã được đồng bộ.',
      });
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err?.message || 'Lỗi khi lưu cấu hình tính năng.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Modules list
  const modules = Array.from(new Set(permissions.map((p) => p.moduleCode))).sort();

  // Filtered permissions
  const filteredPermissions = permissions.filter((p) => {
    const matchSearch =
      permSearch === '' ||
      p.permissionCode.toLowerCase().includes(permSearch.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(permSearch.toLowerCase()));
    const matchModule = selectedModule === 'ALL' || p.moduleCode === selectedModule;
    return matchSearch && matchModule;
  });

  // Filtered features
  const filteredFeatures = features.filter((f) => {
    return (
      featureSearch === '' ||
      f.featureCode.toLowerCase().includes(featureSearch.toLowerCase()) ||
      f.featureName.toLowerCase().includes(featureSearch.toLowerCase()) ||
      (f.description && f.description.toLowerCase().includes(featureSearch.toLowerCase()))
    );
  });

  if (currentRole !== 'Admin') {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700">
        Bạn không có quyền truy cập trang quản trị vai trò & quyền hạn (403 Forbidden).
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <span className="material-symbols-outlined text-[24px] text-blue-600">security</span>
            Phân Quyền Động & Cờ Tính Năng (Dynamic RBAC)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Quản trị ma trận phân quyền (Role x Permission) và bật/tắt tính năng theo vai trò runtime không cần build lại.
          </p>
        </div>

        {/* Action button */}
        <div className="flex items-center gap-2">
          {activeTab === 'permissions' ? (
            <button
              type="button"
              disabled={isSaving || isLoading}
              onClick={handleSavePermissions}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">
                {isSaving ? 'sync' : 'save'}
              </span>
              {isSaving ? 'Đang lưu...' : 'Lưu Phân Quyền'}
            </button>
          ) : activeTab === 'features' ? (
            <button
              type="button"
              disabled={isSaving || isLoading}
              onClick={handleSaveFeatures}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">
                {isSaving ? 'sync' : 'save'}
              </span>
              {isSaving ? 'Đang lưu...' : 'Lưu Cờ Tính Năng'}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setActiveTab('permissions')}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">tune</span>
              <span>Chỉnh Sửa Quyền Hạn</span>
            </button>
          )}

          <button
            type="button"
            disabled={isLoading}
            onClick={loadData}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-xs hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
            title="Tải lại dữ liệu"
          >
            <span className="material-symbols-outlined text-[16px]">refresh</span>
          </button>
        </div>
      </div>

      {/* Status banner */}
      {statusMessage && (
        <div
          className={`flex items-center justify-between rounded-lg p-3 text-xs ${
            statusMessage.type === 'success'
              ? 'border border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border border-red-200 bg-red-50 text-red-800'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">
              {statusMessage.type === 'success' ? 'check_circle' : 'error'}
            </span>
            <span>{statusMessage.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setStatusMessage(null)}
            className="text-slate-400 hover:text-slate-700"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('roles')}
          className={`flex items-center gap-2 border-b-2 px-4 py-2 text-xs font-semibold transition-colors cursor-pointer ${
            activeTab === 'roles'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">shield_person</span>
          <span>Vai Trò Hệ Thống ({roles.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('permissions')}
          className={`flex items-center gap-2 border-b-2 px-4 py-2 text-xs font-semibold transition-colors cursor-pointer ${
            activeTab === 'permissions'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">shield</span>
          <span>Ma Trận Quyền Hạn ({permissions.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('features')}
          className={`flex items-center gap-2 border-b-2 px-4 py-2 text-xs font-semibold transition-colors cursor-pointer ${
            activeTab === 'features'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">toggle_on</span>
          <span>Cờ Tính Năng (Feature Flags - {features.length})</span>
        </button>
      </div>

      {/* Loading state */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16 text-xs text-slate-500">
          <span className="material-symbols-outlined animate-spin text-[24px] mr-2 text-blue-600">
            progress_activity
          </span>
          Đang tải cấu hình phân quyền hệ thống...
        </div>
      ) : activeTab === 'roles' ? (
        /* Roles Tab */
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {roles.map((r) => {
              const permCount = rolePermsMap[r.roleCode]?.size ?? 0;
              const featCount = Object.values(roleFeaturesMap[r.roleCode] || {}).filter(Boolean).length;
              return (
                <div
                  key={r.roleCode}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs hover:border-blue-300 dark:hover:border-blue-700 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        r.roleCode === 'ADMIN'
                          ? 'bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                          : r.roleCode === 'MENTOR'
                          ? 'bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                          : 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                      }`}>
                        {r.roleCode}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                        <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                        Đang hoạt động
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                      {r.roleName}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
                      {r.description || `Vai trò ${r.roleName} trong hệ thống quản lý thực tập.`}
                    </p>

                    <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 mb-4">
                      <div>
                        <div className="text-[10.5px] font-medium text-slate-400 dark:text-slate-500">Quyền hạn cấp</div>
                        <div className="text-base font-bold text-slate-800 dark:text-slate-200 mt-0.5">{permCount} permissions</div>
                      </div>
                      <div>
                        <div className="text-[10.5px] font-medium text-slate-400 dark:text-slate-500">Feature Flags</div>
                        <div className="text-base font-bold text-slate-800 dark:text-slate-200 mt-0.5">{featCount} enabled</div>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveTab('permissions')}
                    className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">settings</span>
                    <span>Cấu hình quyền vai trò</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ) : activeTab === 'permissions' ? (
        /* Permissions Tab */
        <div className="space-y-3">
          {/* Filters */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[16px]">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Tìm theo mã quyền, mô tả..."
                  value={permSearch}
                  onChange={(e) => setPermSearch(e.target.value)}
                  className="w-56 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-1.5 pl-8 pr-3 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <select
                value={selectedModule}
                onChange={(e) => setSelectedModule(e.target.value)}
                className="rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-1.5 px-2.5 text-xs text-slate-700 dark:text-slate-200 focus:border-blue-500 focus:outline-hidden"
              >
                <option value="ALL">Tất cả Module ({modules.length})</option>
                {modules.map((m) => (
                  <option key={m} value={m}>
                    Module: {m}
                  </option>
                ))}
              </select>
            </div>

            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              Hiển thị <strong className="text-slate-700 dark:text-slate-200">{filteredPermissions.length}</strong> / {permissions.length} quyền
            </div>
          </div>

          {/* Matrix Table */}
          <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-[11px] font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-2.5 px-3 min-w-[120px]">Module</th>
                  <th className="py-2.5 px-3 min-w-[200px]">Mã Quyền (Permission)</th>
                  <th className="py-2.5 px-3 min-w-[220px]">Mô Tả Chức Năng</th>
                  {roles.map((r) => (
                    <th key={r.roleCode} className="py-2.5 px-3 text-center min-w-[90px]">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        r.roleCode === 'ADMIN'
                          ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300'
                          : r.roleCode === 'MENTOR'
                          ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300'
                          : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                      }`}>
                        {r.roleName}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredPermissions.length === 0 ? (
                  <tr>
                    <td colSpan={3 + roles.length} className="py-8 text-center text-slate-500 dark:text-slate-400">
                      Không tìm thấy quyền nào khớp với bộ lọc.
                    </td>
                  </tr>
                ) : (
                  filteredPermissions.map((perm) => (
                    <tr key={perm.permissionCode} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-2 px-3 font-medium text-slate-600 dark:text-slate-400">
                        <span className="inline-block px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-mono font-semibold text-slate-700 dark:text-slate-300">
                          {perm.moduleCode}
                        </span>
                      </td>
                      <td className="py-2 px-3 font-mono font-semibold text-slate-900 dark:text-slate-100 text-[11.5px]">
                        {perm.permissionCode}
                      </td>
                      <td className="py-2 px-3 text-slate-600 dark:text-slate-400">
                        {perm.description || 'Chức năng hệ thống'}
                      </td>
                      {roles.map((r) => {
                        const isGranted = rolePermsMap[r.roleCode]?.has(perm.permissionCode) ?? false;
                        const isLockedAdmin =
                          r.roleCode === 'ADMIN' &&
                          (perm.permissionCode === 'ROLE_PERMISSION_VIEW' ||
                            perm.permissionCode === 'ROLE_PERMISSION_UPDATE');

                        return (
                          <td key={r.roleCode} className="py-2 px-3 text-center">
                            <input
                              type="checkbox"
                              checked={isGranted}
                              disabled={isLockedAdmin}
                              onChange={() => handleTogglePermission(r.roleCode, perm.permissionCode)}
                              className="h-4 w-4 rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500 cursor-pointer disabled:cursor-not-allowed"
                              title={isLockedAdmin ? 'Quyền quản trị bắt buộc' : `Gán quyền cho ${r.roleName}`}
                            />
                          </td>
                        );
                      })}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Feature Flags Tab */
        <div className="space-y-3">
          {/* Search */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[16px]">
                search
              </span>
              <input
                type="text"
                placeholder="Tìm cờ tính năng theo mã, tên..."
                value={featureSearch}
                onChange={(e) => setFeatureSearch(e.target.value)}
                className="w-72 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-1.5 pl-8 pr-3 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-500 focus:outline-hidden"
              />
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              Tổng số <strong className="text-slate-700 dark:text-slate-200">{filteredFeatures.length}</strong> cờ tính năng
            </div>
          </div>

          {/* Features Table */}
          <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-[11px] font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-2.5 px-3 min-w-[100px]">Module</th>
                  <th className="py-2.5 px-3 min-w-[180px]">Mã Feature Flag</th>
                  <th className="py-2.5 px-3 min-w-[180px]">Tên Tính Năng</th>
                  <th className="py-2.5 px-3 min-w-[220px]">Mô Tả Nghiệp Vụ</th>
                  {roles.map((r) => (
                    <th key={r.roleCode} className="py-2.5 px-3 text-center min-w-[90px]">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        r.roleCode === 'ADMIN'
                          ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300'
                          : r.roleCode === 'MENTOR'
                          ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300'
                          : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                      }`}>
                        {r.roleName}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredFeatures.length === 0 ? (
                  <tr>
                    <td colSpan={4 + roles.length} className="py-8 text-center text-slate-500">
                      Không tìm thấy cờ tính năng nào.
                    </td>
                  </tr>
                ) : (
                  filteredFeatures.map((feat) => (
                    <tr key={feat.featureCode} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2 px-3 font-medium text-slate-600">
                        <span className="inline-block px-1.5 py-0.5 rounded bg-slate-100 text-[10px] font-mono font-semibold text-slate-700">
                          {feat.moduleCode}
                        </span>
                      </td>
                      <td className="py-2 px-3 font-mono font-semibold text-slate-900 text-[11.5px]">
                        {feat.featureCode}
                      </td>
                      <td className="py-2 px-3 font-medium text-slate-900">
                        {feat.featureName}
                      </td>
                      <td className="py-2 px-3 text-slate-600">
                        {feat.description}
                      </td>
                      {roles.map((r) => {
                        const isEnabled = roleFeaturesMap[r.roleCode]?.[feat.featureCode] ?? feat.enabled;

                        return (
                          <td key={r.roleCode} className="py-2 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleToggleFeature(r.roleCode, feat.featureCode)}
                              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                                isEnabled ? 'bg-blue-600' : 'bg-slate-300'
                              }`}
                              title={isEnabled ? 'Tính năng đang BẬT' : 'Tính năng đang TẮT'}
                            >
                              <span
                                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                                  isEnabled ? 'translate-x-4' : 'translate-x-0'
                                }`}
                              />
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
