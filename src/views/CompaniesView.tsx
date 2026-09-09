import React, { useState, useEffect } from 'react';
import { Role } from '../types';
import { companyService, Company, CompanyCreateDTO } from '../api/companyService';
import { Building2, Plus, Search, Filter, Mail, Phone, Globe, Edit2, Power, CheckCircle, AlertCircle, X, ShieldAlert, Trash2 } from 'lucide-react';
import { Can } from '../components/Can';
import { PageContainer, PageHeader, Card, Button, Badge } from '../components/ui';
import { PermissionCode } from '../config/permissions.config';
import { uiConfig } from '../config/ui.config';

interface CompaniesViewProps {
  currentRole: Role;
}

export const CompaniesView: React.FC<CompaniesViewProps> = ({ currentRole }) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [deletingCompany, setDeletingCompany] = useState<Company | null>(null);
  const [formData, setFormData] = useState<CompanyCreateDTO>({
    companyName: '',
    taxCode: '',
    industry: '',
    address: '',
    contactPerson: '',
    contactEmail: '',
    contactPhone: '',
    website: '',
    maxInterns: 10,
  });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchCompanies = async () => {
    setLoading(true);
    setError(null);
    try {
      const activeParam = activeFilter === 'active' ? true : activeFilter === 'inactive' ? false : undefined;
      const data = await companyService.getCompanies({
        search: search.trim() || undefined,
        active: activeParam,
      });
      setCompanies(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || 'Lỗi khi tải danh sách công ty đối tác');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, [search, activeFilter]);

  const handleOpenCreateModal = () => {
    setEditingCompany(null);
    setFormData({
      companyName: '',
      taxCode: '',
      industry: 'Công nghệ thông tin',
      address: '',
      contactPerson: '',
      contactEmail: '',
      contactPhone: '',
      website: '',
      maxInterns: 10,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (comp: Company) => {
    setEditingCompany(comp);
    setFormData({
      companyName: comp.companyName,
      taxCode: comp.taxCode || '',
      industry: comp.industry || '',
      address: comp.address || '',
      contactPerson: comp.contactPerson || '',
      contactEmail: comp.contactEmail || '',
      contactPhone: comp.contactPhone || '',
      website: comp.website || '',
      maxInterns: comp.maxInterns || 0,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSaveCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.companyName.trim()) {
      setFormError('Tên công ty không được để trống');
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      if (editingCompany) {
        await companyService.updateCompany(editingCompany.companyId, formData);
      } else {
        await companyService.createCompany(formData);
      }
      setIsModalOpen(false);
      fetchCompanies();
    } catch (err: any) {
      setFormError(err.message || 'Không thể lưu thông tin công ty');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (comp: Company) => {
    try {
      await companyService.updateStatus(comp.companyId, !comp.isActive);
      fetchCompanies();
    } catch (err: any) {
      alert(err.message || 'Lỗi cập nhật trạng thái');
    }
  };

  const handleConfirmDeleteCompany = async () => {
    if (!deletingCompany) return;
    try {
      await companyService.deleteCompany(deletingCompany.companyId);
      setDeletingCompany(null);
      fetchCompanies();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi xóa công ty');
    }
  };

  const activeCount = companies.filter((c) => c.isActive).length;
  const totalSlots = companies.reduce((acc, c) => acc + (c.maxInterns || 0), 0);

  return (
    <PageContainer>
      {/* Header Banner */}
      <PageHeader
        title="Quản Lý Công Ty Đối Tác Thực Tập"
        description="Danh sách doanh nghiệp nhận sinh viên thực tập, liên hệ và chỉ tiêu tiếp nhận."
        icon="domain"
        actions={
          <Can permission={PermissionCode.COMPANY_CREATE}>
            <Button
              variant="primary"
              icon="add"
              onClick={handleOpenCreateModal}
            >
              Thêm Công Ty Mới
            </Button>
          </Can>
        }
      />

      {/* Stats Quick View */}
      <div className={uiConfig.grid.cards3Col}>
        <Card padding="compact">
          <div className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">Tổng Công Ty Đối Tác</div>
          <div className="text-[20px] font-bold text-[#0b1c30] dark:text-white mt-1">{companies.length}</div>
        </Card>
        <Card padding="compact">
          <div className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">Công Ty Đang Hoạt Động</div>
          <div className="text-[20px] font-bold text-emerald-600 mt-1">{activeCount}</div>
        </Card>
        <Card padding="compact">
          <div className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">Tổng Chỉ Tiêu Tiếp Nhận</div>
          <div className="text-[20px] font-bold text-[#004ac6] dark:text-blue-400 mt-1">{totalSlots} SV</div>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-2.5 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-2.5">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên công ty..."
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:border-[#004ac6] outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-500" />
          <select
            value={activeFilter}
            onChange={(e) => setActiveFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:border-[#004ac6] outline-none bg-white text-[#0b1c30]"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Đang hoạt động</option>
            <option value="inactive">Tạm ngưng</option>
          </select>
        </div>
      </div>

      {/* Content Table / Error / Loading */}
      {loading ? (
        <div className="bg-white p-12 rounded-xl border border-slate-200 text-center text-xs text-slate-500">
          Đang tải dữ liệu công ty từ API backend...
        </div>
      ) : error ? (
        <div className="bg-red-50 p-4 rounded-xl border border-red-200 text-red-700 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-red-500" />
          <span>{error}</span>
        </div>
      ) : companies.length === 0 ? (
        <div className="bg-white p-10 rounded-xl border border-slate-200 text-center shadow-2xs">
          <Building2 className="w-10 h-10 text-slate-400 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-[#0b1c30]">Chưa có dữ liệu công ty</h3>
          <p className="text-xs text-slate-500 mt-0.5">Chưa có công ty nào khớp với bộ lọc tìm kiếm.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px] tracking-wider">
                  <th className="py-2.5 px-3.5">Tên Công Ty</th>
                  <th className="py-2.5 px-3">Ngành Nghề</th>
                  <th className="py-2.5 px-3">Người Liên Hệ</th>
                  <th className="py-2.5 px-3">Email / ĐT</th>
                  <th className="py-2.5 px-3 text-center">Chỉ Tiêu (Slot)</th>
                  <th className="py-2.5 px-3 text-center">Trạng Thái</th>
                  <Can any={['COMPANY_UPDATE', 'COMPANY_DELETE']}>
                    <th className="py-2.5 px-3.5 text-right">Thao Tác</th>
                  </Can>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {companies.map((comp) => (
                  <tr key={comp.companyId} className="hover:bg-blue-50/40 transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-[#0b1c30]">
                      <div className="flex items-center gap-2">
                        <span>{comp.companyName}</span>
                        {comp.website && (
                          <a
                            href={comp.website.startsWith('http') ? comp.website : `https://${comp.website}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[#004ac6] hover:underline"
                            title="Truy cập website"
                          >
                            <Globe className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                      {comp.taxCode && <div className="text-[10.5px] text-slate-400">MST: {comp.taxCode}</div>}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">{comp.industry || '—'}</td>
                    <td className="py-2.5 px-3 text-slate-600">{comp.contactPerson || '—'}</td>
                    <td className="py-2.5 px-3 text-slate-600">
                      {comp.contactEmail && (
                        <div className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span>{comp.contactEmail}</span>
                        </div>
                      )}
                      {comp.contactPhone && (
                        <div className="flex items-center gap-1 text-[11px] text-slate-500">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{comp.contactPhone}</span>
                        </div>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="font-bold text-slate-800 text-xs">{comp.maxInterns || 10} Chỉ tiêu</span>
                        <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden border border-slate-200">
                          <div className="h-full bg-[#004ac6] rounded-full" style={{ width: '60%' }}></div>
                        </div>
                        <span className="text-[9.5px] text-emerald-600 font-semibold">Còn chỗ nhận</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <Badge status={comp.isActive ? 'active' : 'inactive'}>
                        {comp.isActive ? 'Hoạt động' : 'Tạm ngưng'}
                      </Badge>
                    </td>
                    <Can any={['COMPANY_UPDATE', 'COMPANY_DELETE']}>
                      <td className="py-2.5 px-3.5 text-right space-x-1 whitespace-nowrap">
                        <Can permission="COMPANY_UPDATE">
                          <button
                            onClick={() => handleOpenEditModal(comp)}
                            className="p-1 hover:bg-slate-100 rounded-md text-slate-600 hover:text-[#004ac6] transition-colors cursor-pointer"
                            title="Sửa công ty"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(comp)}
                            className={`p-1 hover:bg-slate-100 rounded-md transition-colors cursor-pointer ${
                              comp.isActive ? 'text-emerald-600 hover:text-red-600' : 'text-slate-400 hover:text-emerald-600'
                            }`}
                            title={comp.isActive ? 'Tắt hoạt động' : 'Bật hoạt động'}
                          >
                            <Power className="w-3.5 h-3.5" />
                          </button>
                        </Can>
                        <Can permission="COMPANY_DELETE">
                          <button
                            onClick={() => setDeletingCompany(comp)}
                            className="p-1 hover:bg-rose-50 rounded-md text-rose-600 transition-colors cursor-pointer"
                            title="Xóa công ty"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </Can>
                      </td>
                    </Can>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Admin Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-2xl border border-[#e2e8f0] shadow-xl overflow-hidden">
            <div className="p-5 bg-gradient-to-r from-[#eff4ff] to-[#f8f9ff] border-b border-[#e2e8f0] flex items-center justify-between">
              <h3 className="text-base font-bold text-[#0b1c30]">
                {editingCompany ? 'Cập Nhật Công Ty Đối Tác' : 'Thêm Công Ty Đối Tác Mới'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-[#64748b] hover:bg-slate-200/50 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCompany} className="p-5 space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs border border-red-200">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-[#434655] mb-1">
                  Tên Công Ty <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  placeholder="VD: Công ty TNHH FPT Software..."
                  className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-xl focus:border-[#004ac6] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#434655] mb-1">Mã Số Thống / MST</label>
                  <input
                    type="text"
                    value={formData.taxCode}
                    onChange={(e) => setFormData({ ...formData, taxCode: e.target.value })}
                    placeholder="0312345678"
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-xl focus:border-[#004ac6] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#434655] mb-1">Ngành Nghề</label>
                  <input
                    type="text"
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    placeholder="Công nghệ thông tin..."
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-xl focus:border-[#004ac6] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#434655] mb-1">Địa Chỉ Doanh Nghiệp</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Địa chỉ trụ sở / văn phòng..."
                  className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-xl focus:border-[#004ac6] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#434655] mb-1">Người Liên Hệ</label>
                  <input
                    type="text"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    placeholder="Họ tên HR / Trưởng phòng..."
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-xl focus:border-[#004ac6] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#434655] mb-1">Email Liên Hệ</label>
                  <input
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    placeholder="hr@company.com"
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-xl focus:border-[#004ac6] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#434655] mb-1">Số Điện Thoại</label>
                  <input
                    type="text"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    placeholder="0901234567"
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-xl focus:border-[#004ac6] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#434655] mb-1">Chỉ Tiêu (Max Interns)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.maxInterns}
                    onChange={(e) => setFormData({ ...formData, maxInterns: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-xl focus:border-[#004ac6] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#434655] mb-1">Website</label>
                <input
                  type="text"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://company.com"
                  className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-xl focus:border-[#004ac6] outline-none"
                />
              </div>

              <div className="pt-3 border-t border-[#f1f5f9] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs text-[#64748b] hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 text-xs font-semibold bg-[#004ac6] hover:bg-[#003ea8] text-white rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {saving ? 'Đang Lưu...' : 'Lưu Thay Đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {deletingCompany && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white w-full max-w-sm rounded-2xl border border-[#e2e8f0] shadow-xl p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-50 text-rose-600">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#0b1c30]">Xóa Công Ty Đối Tác</h3>
                <p className="text-xs text-slate-500">Xác nhận gỡ bỏ doanh nghiệp</p>
              </div>
            </div>

            <p className="text-xs text-[#434655]">
              Bạn có chắc chắn muốn xóa đối tác <strong>{deletingCompany.companyName}</strong>?
            </p>

            <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => setDeletingCompany(null)}
                className="px-3 py-1.5 text-xs text-[#64748b] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteCompany}
                className="px-3.5 py-1.5 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                Xóa Công Ty
              </button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
};
