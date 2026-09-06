import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Role } from '../types';
import {
  mentorGroupService,
  phaseService,
  MentorGroupDTO,
  MentorGroupDetailDTO,
  MentorGroupSearchDTO,
  GroupMemberDTO,
  InternshipPhaseDTO,
} from '../api/services';

interface MentorGroupsViewProps {
  currentRole?: Role;
}

export const MentorGroupsView: React.FC<MentorGroupsViewProps> = ({ currentRole = 'Mentor' }) => {
  const isMentor = currentRole === 'Mentor';
  const isStudent = currentRole === 'Student';
  const isAdmin = currentRole === 'Admin';
  const navigate = useNavigate();

  // Data state
  const [myGroups, setMyGroups] = useState<MentorGroupDTO[]>([]);
  const [adminGroups, setAdminGroups] = useState<MentorGroupDTO[]>([]);
  const [studentEnrolledGroups, setStudentEnrolledGroups] = useState<MentorGroupDTO[]>([]);
  const [phases, setPhases] = useState<InternshipPhaseDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Student Search & Join state
  const [searchMentorName, setSearchMentorName] = useState('');
  const [searchGroupCode, setSearchGroupCode] = useState('');
  const [searchResults, setSearchResults] = useState<MentorGroupSearchDTO[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [joinModalGroup, setJoinModalGroup] = useState<MentorGroupSearchDTO | null>(null);
  const [joinPassword, setJoinPassword] = useState('');
  const [joinError, setJoinError] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);

  // Detail / Members modal
  const [selectedGroupDetail, setSelectedGroupDetail] = useState<MentorGroupDetailDTO | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  // Create Group modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formGroupName, setFormGroupName] = useState('');
  const [formGroupCode, setFormGroupCode] = useState('');
  const [formPhaseId, setFormPhaseId] = useState<number>(0);
  const [formJoinPassword, setFormJoinPassword] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formMaxStudents, setFormMaxStudents] = useState(30);
  const [formAllowSelfJoin, setFormAllowSelfJoin] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit Group modal
  const [editingGroup, setEditingGroup] = useState<MentorGroupDTO | null>(null);
  const [editGroupName, setEditGroupName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editMaxStudents, setEditMaxStudents] = useState(30);
  const [editAllowSelfJoin, setEditAllowSelfJoin] = useState(true);

  // Change Password modal
  const [passwordModalGroup, setPasswordModalGroup] = useState<MentorGroupDTO | null>(null);
  const [newGroupPassword, setNewGroupPassword] = useState('');

  // Add Member modal
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [memberIdentifier, setMemberIdentifier] = useState('');
  const [addMemberError, setAddMemberError] = useState<string | null>(null);
  const [isAddingMember, setIsAddingMember] = useState(false);

  // Feedback toast / alert
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Load Initial Data
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const phasesRes = await phaseService.getAll();
      const phasesList = Array.isArray(phasesRes) ? phasesRes : [];
      setPhases(phasesList);
      if (phasesList.length > 0) {
        setFormPhaseId(phasesList[0].phaseId);
      }

      if (isMentor) {
        const groupsRes = await mentorGroupService.getMyGroups();
        setMyGroups(Array.isArray(groupsRes) ? groupsRes : []);
      } else if (isStudent) {
        const enrolledRes = await mentorGroupService.getMyStudentGroups();
        setStudentEnrolledGroups(Array.isArray(enrolledRes) ? enrolledRes : []);
        // Trigger default search to show available groups
        handleSearch();
      } else if (isAdmin) {
        const res = await mentorGroupService.getAll({ size: 100 });
        let list: MentorGroupDTO[] = [];
        if (Array.isArray(res)) list = res;
        else if (res && Array.isArray(res.content)) list = res.content;
        else if (res && Array.isArray(res.data)) list = res.data;
        setAdminGroups(list);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Không thể tải dữ liệu nhóm hướng dẫn');
    } finally {
      setIsLoading(false);
    }
  }, [isMentor, isStudent, isAdmin]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Copy Group Code Helper
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  // Student Search
  const handleSearch = async () => {
    setIsSearching(true);
    try {
      const res = await mentorGroupService.search({
        mentorName: searchMentorName.trim() || undefined,
        groupCode: searchGroupCode.trim() || undefined,
      });
      setSearchResults(Array.isArray(res) ? res : []);
    } catch (err: any) {
      console.error('Error searching groups:', err);
    } finally {
      setIsSearching(false);
    }
  };

  // Student Join Group
  const handleConfirmJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinModalGroup) return;
    if (!joinPassword.trim()) {
      setJoinError('Vui lòng nhập mật khẩu tham gia');
      return;
    }

    setIsJoining(true);
    setJoinError(null);
    try {
      await mentorGroupService.joinByCode({
        groupCode: joinModalGroup.groupCode,
        joinPassword: joinPassword.trim(),
      });
      setJoinModalGroup(null);
      setJoinPassword('');
      setActionSuccess(`Đã tham gia thành công nhóm ${joinModalGroup.groupName}!`);
      setTimeout(() => setActionSuccess(null), 4000);
      loadData();
    } catch (err: any) {
      setJoinError(err.response?.data?.message || 'Mật khẩu hoặc mã nhóm không chính xác');
    } finally {
      setIsJoining(false);
    }
  };

  // View Group Detail
  const handleOpenDetail = async (groupId: number) => {
    setIsLoadingDetail(true);
    try {
      const detail = await mentorGroupService.getDetail(groupId);
      setSelectedGroupDetail(detail);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Không thể tải chi tiết nhóm');
    } finally {
      setIsLoadingDetail(false);
    }
  };

  // Create Group
  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formGroupName.trim()) {
      setFormError('Tên nhóm không được để trống');
      return;
    }
    if (!formPhaseId) {
      setFormError('Vui lòng chọn đợt thực tập');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);
    try {
      await mentorGroupService.create({
        groupName: formGroupName.trim(),
        groupCode: formGroupCode.trim() || undefined,
        phaseId: formPhaseId,
        joinPassword: formJoinPassword.trim() || undefined,
        description: formDescription.trim() || undefined,
        maxStudents: formMaxStudents,
        allowSelfJoin: formAllowSelfJoin,
      });

      setIsCreateModalOpen(false);
      setFormGroupName('');
      setFormGroupCode('');
      setFormJoinPassword('');
      setFormDescription('');
      setFormMaxStudents(30);
      setActionSuccess('Tạo nhóm hướng dẫn thành công!');
      setTimeout(() => setActionSuccess(null), 3000);
      loadData();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Lỗi khi tạo nhóm hướng dẫn');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Edit Group
  const handleOpenEdit = (group: MentorGroupDTO) => {
    setEditingGroup(group);
    setEditGroupName(group.groupName);
    setEditDescription(group.description || '');
    setEditMaxStudents(group.maxStudents);
    setEditAllowSelfJoin(group.allowSelfJoin);
    setFormError(null);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGroup) return;
    if (!editGroupName.trim()) {
      setFormError('Tên nhóm không được để trống');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);
    try {
      await mentorGroupService.update(editingGroup.groupId, {
        groupName: editGroupName.trim(),
        description: editDescription.trim() || undefined,
        maxStudents: editMaxStudents,
        allowSelfJoin: editAllowSelfJoin,
      });
      setEditingGroup(null);
      setActionSuccess('Cập nhật thông tin nhóm thành công!');
      setTimeout(() => setActionSuccess(null), 3000);
      loadData();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Lỗi khi cập nhật nhóm');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle Active Status
  const handleToggleStatus = async (group: MentorGroupDTO) => {
    const nextStatus = !group.isActive;
    const confirmMsg = nextStatus
      ? `Kích hoạt nhóm ${group.groupName}?`
      : `Đóng nhóm ${group.groupName}? Sinh viên sẽ không thể tìm thấy hoặc tham gia.`;
    if (!window.confirm(confirmMsg)) return;

    try {
      await mentorGroupService.updateStatus(group.groupId, nextStatus);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Không thể đổi trạng thái nhóm');
    }
  };

  // Update Password
  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordModalGroup) return;
    if (!newGroupPassword.trim()) {
      alert('Vui lòng nhập mật khẩu mới');
      return;
    }

    try {
      await mentorGroupService.updatePassword(passwordModalGroup.groupId, newGroupPassword.trim());
      setPasswordModalGroup(null);
      setNewGroupPassword('');
      setActionSuccess('Đổi mật khẩu tham gia nhóm thành công!');
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Không thể đổi mật khẩu tham gia');
    }
  };

  // Add Member Manually
  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroupDetail) return;
    if (!memberIdentifier.trim()) {
      setAddMemberError('Vui lòng nhập email, username hoặc mã sinh viên');
      return;
    }

    setIsAddingMember(true);
    setAddMemberError(null);
    try {
      await mentorGroupService.addMember(selectedGroupDetail.groupId, memberIdentifier.trim());
      setMemberIdentifier('');
      setIsAddMemberOpen(false);
      handleOpenDetail(selectedGroupDetail.groupId);
      loadData();
      setActionSuccess('Thêm sinh viên vào nhóm thành công!');
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      setAddMemberError(err.response?.data?.message || 'Không thể thêm sinh viên vào nhóm');
    } finally {
      setIsAddingMember(false);
    }
  };

  // Remove Member
  const handleRemoveMember = async (studentId: number, studentName: string) => {
    if (!selectedGroupDetail) return;
    if (!window.confirm(`Bạn có chắc muốn xóa sinh viên ${studentName} khỏi nhóm?`)) return;

    try {
      await mentorGroupService.removeMember(selectedGroupDetail.groupId, studentId);
      handleOpenDetail(selectedGroupDetail.groupId);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Không thể xóa thành viên khỏi nhóm');
    }
  };

  return (
    <div className="flex flex-col w-full animate-in fade-in duration-200 space-y-3.5">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#004ac6] text-[20px]">groups</span>
            <h1 className="text-[19px] font-bold text-[#0b1c30] tracking-tight">
              {isStudent ? 'Nhóm Thực Tập Của Tôi & Tìm Nhóm' : 'Quản Lý Nhóm Hướng Dẫn (Mentor Groups)'}
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {isStudent
              ? 'Xem các nhóm thực tập bạn đang tham gia hoặc tìm kiếm nhóm theo mã/tên giảng viên để tham gia.'
              : 'Tạo mã lớp, phân nhóm sinh viên hướng dẫn, quản lý mật khẩu tham gia và thành viên.'}
          </p>
        </div>

        {(isMentor || isAdmin) && (
          <button
            type="button"
            onClick={() => {
              setFormError(null);
              setIsCreateModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#004ac6] px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-[#003eb3] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">add_circle</span>
            <span>Tạo Nhóm Mới</span>
          </button>
        )}
      </div>

      {/* Success Banner */}
      {actionSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
          <span className="material-symbols-outlined text-emerald-600 text-[18px]">check_circle</span>
          <span className="font-medium">{actionSuccess}</span>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-rose-600 text-[18px]">error</span>
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={loadData}
            className="text-[11px] font-semibold text-rose-700 underline hover:text-rose-900 cursor-pointer"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="p-12 text-center bg-white rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="inline-block animate-spin w-6 h-6 border-2 border-[#004ac6] border-t-transparent rounded-full mb-2" />
          <div className="text-xs text-slate-500 font-medium">Đang tải danh sách nhóm...</div>
        </div>
      )}

      {/* ========================================================= */}
      {/* STUDENT VIEW                                              */}
      {/* ========================================================= */}
      {!isLoading && isStudent && (
        <div className="space-y-4">
          {/* Section 1: Enrolled Groups */}
          <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
            <div className="px-3.5 py-2.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-600 text-[18px]">verified_user</span>
                <h3 className="text-xs font-bold text-[#0b1c30]">Nhóm Bạn Đang Tham Gia</h3>
              </div>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                {studentEnrolledGroups.length} Nhóm
              </span>
            </div>

            {studentEnrolledGroups.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <span className="material-symbols-outlined text-[36px] text-slate-300 mb-1">group_off</span>
                <p className="text-xs font-medium text-slate-500">Bạn chưa tham gia nhóm hướng dẫn nào.</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Hãy tìm kiếm nhóm ở bên dưới và nhập mật khẩu để tham gia.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3.5">
                {studentEnrolledGroups.map((g) => (
                  <div
                    key={g.groupId}
                    className="p-3.5 rounded-xl border border-emerald-200/80 bg-emerald-50/30 hover:border-emerald-300 transition-all flex flex-col justify-between space-y-2"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-bold text-[#0b1c30]">{g.groupName}</h4>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                          {g.groupCode}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">
                        {g.description || 'Không có mô tả'}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-emerald-100 text-[11px] text-slate-600 grid grid-cols-2 gap-1.5">
                      <div>
                        <span className="text-slate-400">Giảng viên: </span>
                        <span className="font-semibold text-slate-800">{g.mentorName}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Đợt: </span>
                        <span className="font-medium text-slate-700">{g.phaseName}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Thành viên: </span>
                        <span className="font-bold text-emerald-700">
                          {g.memberCount} / {g.maxStudents}
                        </span>
                      </div>
                      <div className="text-right flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenDetail(g.groupId)}
                          className="text-[11px] font-semibold text-slate-500 hover:text-[#004ac6] cursor-pointer"
                        >
                          DS Nhóm
                        </button>
                        <button
                          type="button"
                          onClick={() => navigate(`/admin/group-rooms/${g.groupId}`)}
                          className="px-2 py-0.5 rounded bg-emerald-600 text-white hover:bg-emerald-700 text-[11px] font-semibold transition-colors cursor-pointer flex items-center gap-1"
                          title="Vào phòng làm việc nhóm"
                        >
                          <span className="material-symbols-outlined text-[13px]">forum</span>
                          <span>Vào Phòng</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 2: Search & Join Available Groups */}
          <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
            <div className="px-3.5 py-2.5 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#004ac6] text-[18px]">search</span>
                <h3 className="text-xs font-bold text-[#0b1c30]">Tìm Kiếm & Tham Gia Nhóm Mới</h3>
              </div>
            </div>

            {/* Filter inputs */}
            <div className="p-3.5 border-b border-slate-100 bg-white grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <input
                type="text"
                placeholder="Tên giảng viên (vd: Le Thi B)..."
                value={searchMentorName}
                onChange={(e) => setSearchMentorName(e.target.value)}
                className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-[#004ac6]"
              />
              <input
                type="text"
                placeholder="Mã nhóm / Tên nhóm (vd: GRP-...)..."
                value={searchGroupCode}
                onChange={(e) => setSearchGroupCode(e.target.value)}
                className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-[#004ac6]"
              />
              <button
                type="button"
                onClick={handleSearch}
                disabled={isSearching}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#004ac6] hover:bg-[#003eb3] rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[15px]">search</span>
                <span>{isSearching ? 'Đang tìm...' : 'Tìm Kiếm'}</span>
              </button>
            </div>

            {/* Search Results List */}
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 text-[11px] font-semibold uppercase text-slate-600 tracking-wider border-b border-slate-200">
                    <th className="py-2.5 px-3.5">Mã Nhóm</th>
                    <th className="py-2.5 px-3">Tên Nhóm</th>
                    <th className="py-2.5 px-3">Giảng Viên Phụ Trách</th>
                    <th className="py-2.5 px-3">Đợt Thực Tập</th>
                    <th className="py-2.5 px-3">Sĩ Số</th>
                    <th className="py-2.5 px-3">Tự Do Join</th>
                    <th className="py-2.5 px-3.5 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {searchResults.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        Không tìm thấy nhóm phù hợp với điều kiện tìm kiếm.
                      </td>
                    </tr>
                  ) : (
                    searchResults.map((item) => {
                      const isFull = item.memberCount >= item.maxStudents;
                      const canJoin = item.allowSelfJoin && !isFull;

                      return (
                        <tr key={item.groupId} className="hover:bg-blue-50/40 transition-colors">
                          <td className="py-2.5 px-3.5 font-mono font-bold text-slate-900">
                            {item.groupCode}
                          </td>
                          <td className="py-2.5 px-3 font-semibold text-[#0b1c30]">
                            {item.groupName}
                          </td>
                          <td className="py-2.5 px-3 text-slate-700">{item.mentorName}</td>
                          <td className="py-2.5 px-3 text-slate-600">{item.phaseName}</td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`font-semibold ${
                                isFull ? 'text-rose-600' : 'text-emerald-700'
                              }`}
                            >
                              {item.memberCount} / {item.maxStudents}
                            </span>
                          </td>
                          <td className="py-2.5 px-3">
                            {item.allowSelfJoin ? (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                                BẬT
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">
                                TẮT
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3.5 text-right">
                            <button
                              type="button"
                              disabled={!canJoin}
                              onClick={() => {
                                setJoinError(null);
                                setJoinPassword('');
                                setJoinModalGroup(item);
                              }}
                              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer ${
                                canJoin
                                  ? 'bg-[#004ac6] text-white hover:bg-[#003eb3]'
                                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                              }`}
                            >
                              {isFull ? 'Đã Đầy' : !item.allowSelfJoin ? 'Khóa Join' : 'Tham Gia'}
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MENTOR & ADMIN TABLE VIEW                                 */}
      {/* ========================================================= */}
      {!isLoading && (isMentor || isAdmin) && (
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="px-3.5 py-2.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#004ac6] text-[18px]">list_alt</span>
              <h3 className="text-xs font-bold text-[#0b1c30]">
                {isMentor ? 'Danh Sách Nhóm Của Bạn' : 'Tất Cả Nhóm Hướng Dẫn Hệ Thống'}
              </h3>
            </div>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-800">
              {isMentor ? myGroups.length : adminGroups.length} Nhóm
            </span>
          </div>

          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 text-[11px] font-semibold uppercase text-slate-600 tracking-wider border-b border-slate-200">
                  <th className="py-2.5 px-3.5">Mã Nhóm</th>
                  <th className="py-2.5 px-3">Tên Nhóm</th>
                  {isAdmin && <th className="py-2.5 px-3">Giảng Viên</th>}
                  <th className="py-2.5 px-3">Đợt Thực Tập</th>
                  <th className="py-2.5 px-3">Thành Viên</th>
                  <th className="py-2.5 px-3">Trạng Thái</th>
                  <th className="py-2.5 px-3">Self-Join</th>
                  <th className="py-2.5 px-3.5 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {(isMentor ? myGroups : adminGroups).length === 0 ? (
                  <tr>
                    <td colSpan={isAdmin ? 8 : 7} className="py-8 text-center text-slate-400">
                      Chưa có nhóm hướng dẫn nào. Hãy bấm "Tạo Nhóm Mới" để bắt đầu!
                    </td>
                  </tr>
                ) : (
                  (isMentor ? myGroups : adminGroups).map((g) => (
                    <tr key={g.groupId} className="hover:bg-blue-50/40 transition-colors">
                      <td className="py-2.5 px-3.5">
                        <div className="flex items-center gap-1.5 font-mono font-bold text-slate-900">
                          <span>{g.groupCode}</span>
                          <button
                            type="button"
                            title="Copy mã nhóm"
                            onClick={() => handleCopyCode(g.groupCode)}
                            className="text-slate-400 hover:text-[#004ac6] cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[14px]">
                              {copiedCode === g.groupCode ? 'done' : 'content_copy'}
                            </span>
                          </button>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-[#0b1c30]">
                        <div>{g.groupName}</div>
                        {g.description && (
                          <div className="text-[11px] text-slate-500 font-normal truncate max-w-xs">
                            {g.description}
                          </div>
                        )}
                      </td>
                      {isAdmin && (
                        <td className="py-2.5 px-3 text-slate-700">
                          <div>{g.mentorName}</div>
                          <div className="text-[10.5px] text-slate-400">{g.mentorEmail}</div>
                        </td>
                      )}
                      <td className="py-2.5 px-3 text-slate-600">{g.phaseName}</td>
                      <td className="py-2.5 px-3 font-medium">
                        <span className="text-[#004ac6] font-bold">{g.memberCount}</span> /{' '}
                        {g.maxStudents}
                      </td>
                      <td className="py-2.5 px-3">
                        {g.isActive ? (
                          <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                            HOẠT ĐỘNG
                          </span>
                        ) : (
                          <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 border border-slate-200">
                            ĐÃ ĐÓNG
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        {g.allowSelfJoin ? (
                          <span className="text-[10.5px] font-semibold text-emerald-600 flex items-center gap-0.5">
                            <span className="material-symbols-outlined text-[14px]">check</span>
                            <span>Mở</span>
                          </span>
                        ) : (
                          <span className="text-[10.5px] font-semibold text-slate-400 flex items-center gap-0.5">
                            <span className="material-symbols-outlined text-[14px]">block</span>
                            <span>Khóa</span>
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => navigate(`/admin/group-rooms/${g.groupId}`)}
                            className="px-2.5 py-1 rounded bg-[#004ac6] text-white hover:bg-[#003eb3] text-[11px] font-semibold transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                            title="Vào phòng làm việc nhóm"
                          >
                            <span className="material-symbols-outlined text-[14px]">forum</span>
                            <span>Vào Phòng</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenDetail(g.groupId)}
                            className="px-2 py-1 rounded bg-blue-50 text-[#004ac6] hover:bg-blue-100 text-[11px] font-semibold transition-colors cursor-pointer"
                          >
                            Chi Tiết ({g.memberCount})
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(g)}
                            className="p-1 rounded text-slate-600 hover:bg-slate-100 cursor-pointer"
                            title="Chỉnh sửa nhóm"
                          >
                            <span className="material-symbols-outlined text-[16px]">edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setPasswordModalGroup(g);
                              setNewGroupPassword('');
                            }}
                            className="p-1 rounded text-amber-600 hover:bg-amber-50 cursor-pointer"
                            title="Đổi mật khẩu tham gia"
                          >
                            <span className="material-symbols-outlined text-[16px]">key</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(g)}
                            className={`p-1 rounded cursor-pointer ${
                              g.isActive
                                ? 'text-rose-600 hover:bg-rose-50'
                                : 'text-emerald-600 hover:bg-emerald-50'
                            }`}
                            title={g.isActive ? 'Đóng nhóm' : 'Mở lại nhóm'}
                          >
                            <span className="material-symbols-outlined text-[16px]">
                              {g.isActive ? 'lock' : 'lock_open'}
                            </span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: DETAIL & MEMBERS MANAGEMENT                       */}
      {/* ========================================================= */}
      {selectedGroupDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-[#e2e8f0] overflow-hidden flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#e2e8f0] bg-slate-50/60">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#004ac6] text-[20px]">
                  group_work
                </span>
                <div>
                  <h3 className="text-[15px] font-bold text-[#0b1c30]">
                    {selectedGroupDetail.groupName}
                  </h3>
                  <div className="text-[11px] font-mono text-slate-500">
                    Mã Nhóm: <strong className="text-slate-800">{selectedGroupDetail.groupCode}</strong> |
                    Sĩ số: {selectedGroupDetail.memberCount}/{selectedGroupDetail.maxStudents}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => navigate(`/admin/group-rooms/${selectedGroupDetail.groupId}`)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors cursor-pointer shadow-xs"
                >
                  <span className="material-symbols-outlined text-[16px]">forum</span>
                  <span>Vào Phòng Làm Việc</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedGroupDetail(null)}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>
            </div>

            <div className="p-4 overflow-y-auto space-y-3 flex-1">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-[#0b1c30] uppercase tracking-wider">
                  Danh Sách Sinh Viên Trong Nhóm ({selectedGroupDetail.members.length})
                </h4>

                {(isMentor || isAdmin) && (
                  <button
                    type="button"
                    onClick={() => {
                      setAddMemberError(null);
                      setMemberIdentifier('');
                      setIsAddMemberOpen(true);
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#004ac6] text-white text-[11px] font-semibold hover:bg-[#003eb3] transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[14px]">person_add</span>
                    <span>Thêm Sinh Viên</span>
                  </button>
                )}
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-[10.5px] font-semibold uppercase text-slate-600 border-b border-slate-200">
                      <th className="py-2 px-3">Mã SV</th>
                      <th className="py-2 px-3">Họ Tên</th>
                      <th className="py-2 px-3">Email</th>
                      <th className="py-2 px-3">Chuyên Ngành</th>
                      <th className="py-2 px-3">Hình Thức</th>
                      {(isMentor || isAdmin) && <th className="py-2 px-3 text-right">Xóa</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedGroupDetail.members.length === 0 ? (
                      <tr>
                        <td
                          colSpan={isMentor || isAdmin ? 6 : 5}
                          className="py-6 text-center text-slate-400 text-xs"
                        >
                          Chưa có sinh viên nào trong nhóm này.
                        </td>
                      </tr>
                    ) : (
                      selectedGroupDetail.members.map((m: GroupMemberDTO) => (
                        <tr key={m.memberId} className="hover:bg-slate-50/60">
                          <td className="py-2 px-3 font-mono font-semibold text-slate-900">
                            {m.studentCode}
                          </td>
                          <td className="py-2 px-3 font-medium text-slate-800">
                            {m.studentName}
                          </td>
                          <td className="py-2 px-3 text-slate-500 text-[11px]">{m.studentEmail}</td>
                          <td className="py-2 px-3 text-slate-600 text-[11px]">
                            {m.studentMajor || 'N/A'}
                          </td>
                          <td className="py-2 px-3">
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700">
                              {m.joinMethod}
                            </span>
                          </td>
                          {(isMentor || isAdmin) && (
                            <td className="py-2 px-3 text-right">
                              <button
                                type="button"
                                onClick={() => handleRemoveMember(m.studentId, m.studentName)}
                                className="text-rose-600 hover:text-rose-800 p-1 rounded hover:bg-rose-50 cursor-pointer"
                                title="Xóa khỏi nhóm"
                              >
                                <span className="material-symbols-outlined text-[15px]">delete</span>
                              </button>
                            </td>
                          )}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-3 border-t border-slate-200 bg-slate-50/50 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedGroupDetail(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-xs font-semibold text-slate-700 cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: ADD MEMBER                                         */}
      {/* ========================================================= */}
      {isAddMemberOpen && selectedGroupDetail && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
              <h3 className="text-xs font-bold text-[#0b1c30]">
                Thêm Sinh Viên Vào Nhóm
              </h3>
              <button
                type="button"
                onClick={() => setIsAddMemberOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>

            <form onSubmit={handleAddMember} className="p-4 space-y-3">
              {addMemberError && (
                <div className="p-2 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-[11px]">
                  {addMemberError}
                </div>
              )}

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Email, Username hoặc Mã Sinh Viên <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="student1@fpt.edu.vn hoặc SE190001"
                  value={memberIdentifier}
                  onChange={(e) => setMemberIdentifier(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-[#004ac6]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddMemberOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isAddingMember}
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#004ac6] hover:bg-[#003eb3] cursor-pointer disabled:opacity-50"
                >
                  {isAddingMember ? 'Đang thêm...' : 'Thêm Sinh Viên'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: STUDENT JOIN GROUP BY PASSWORD                     */}
      {/* ========================================================= */}
      {joinModalGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
              <h3 className="text-xs font-bold text-[#0b1c30]">
                Tham Gia Nhóm {joinModalGroup.groupCode}
              </h3>
              <button
                type="button"
                onClick={() => setJoinModalGroup(null)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>

            <form onSubmit={handleConfirmJoin} className="p-4 space-y-3">
              {joinError && (
                <div className="p-2 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-[11px]">
                  {joinError}
                </div>
              )}

              <div className="text-xs text-slate-600 bg-blue-50 p-2.5 rounded-lg border border-blue-100">
                <div>Nhóm: <strong>{joinModalGroup.groupName}</strong></div>
                <div>Giảng viên: <strong>{joinModalGroup.mentorName}</strong></div>
                <div>Đợt: <strong>{joinModalGroup.phaseName}</strong></div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Mật Khẩu Tham Gia <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  placeholder="Nhập mật khẩu do giảng viên cung cấp"
                  value={joinPassword}
                  onChange={(e) => setJoinPassword(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-[#004ac6]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setJoinModalGroup(null)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isJoining}
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#004ac6] hover:bg-[#003eb3] cursor-pointer disabled:opacity-50"
                >
                  {isJoining ? 'Đang vào nhóm...' : 'Xác Nhận Tham Gia'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: CREATE GROUP                                       */}
      {/* ========================================================= */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
              <h3 className="text-xs font-bold text-[#0b1c30]">Tạo Nhóm Hướng Dẫn Mới</h3>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateGroup} className="p-4 space-y-3">
              {formError && (
                <div className="p-2 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-[11px]">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Tên Nhóm <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Vd: Lớp SE Thực Tập FPT Software - Nhóm A"
                  value={formGroupName}
                  onChange={(e) => setFormGroupName(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-[#004ac6]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Đợt Thực Tập <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formPhaseId}
                    onChange={(e) => setFormPhaseId(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-[#004ac6]"
                  >
                    {phases.map((p) => (
                      <option key={p.phaseId} value={p.phaseId}>
                        {p.phaseName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Mã Nhóm (Tùy chọn)
                  </label>
                  <input
                    type="text"
                    placeholder="Vd: GRP-SE2026A"
                    value={formGroupCode}
                    onChange={(e) => setFormGroupCode(e.target.value.toUpperCase())}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-[#004ac6] font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Mật Khẩu Tham Gia
                  </label>
                  <input
                    type="text"
                    placeholder="Vd: pass123"
                    value={formJoinPassword}
                    onChange={(e) => setFormJoinPassword(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-[#004ac6]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Sĩ Số Tối Đa
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={formMaxStudents}
                    onChange={(e) => setFormMaxStudents(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-[#004ac6]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Mô Tả Nhóm
                </label>
                <textarea
                  rows={2}
                  placeholder="Ghi chú về yêu cầu dự án, lịch họp hàng tuần..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-[#004ac6]"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="selfJoinCheck"
                  checked={formAllowSelfJoin}
                  onChange={(e) => setFormAllowSelfJoin(e.target.checked)}
                  className="rounded border-slate-300 text-[#004ac6]"
                />
                <label htmlFor="selfJoinCheck" className="text-xs text-slate-700 font-medium">
                  Cho phép sinh viên tự tìm & nhập mật khẩu để tham gia
                </label>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#004ac6] hover:bg-[#003eb3] cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Đang tạo...' : 'Tạo Nhóm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: EDIT GROUP                                         */}
      {/* ========================================================= */}
      {editingGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
              <h3 className="text-xs font-bold text-[#0b1c30]">
                Chỉnh Sửa Nhóm {editingGroup.groupCode}
              </h3>
              <button
                type="button"
                onClick={() => setEditingGroup(null)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-4 space-y-3">
              {formError && (
                <div className="p-2 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-[11px]">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Tên Nhóm <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editGroupName}
                  onChange={(e) => setEditGroupName(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-[#004ac6]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Sĩ Số Tối Đa
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={editMaxStudents}
                  onChange={(e) => setEditMaxStudents(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-[#004ac6]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Mô Tả
                </label>
                <textarea
                  rows={2}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-[#004ac6]"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="editSelfJoinCheck"
                  checked={editAllowSelfJoin}
                  onChange={(e) => setEditAllowSelfJoin(e.target.checked)}
                  className="rounded border-slate-300 text-[#004ac6]"
                />
                <label htmlFor="editSelfJoinCheck" className="text-xs text-slate-700 font-medium">
                  Cho phép sinh viên tự tìm & tham gia nhóm
                </label>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingGroup(null)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#004ac6] hover:bg-[#003eb3] cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: CHANGE PASSWORD                                    */}
      {/* ========================================================= */}
      {passwordModalGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
              <h3 className="text-xs font-bold text-[#0b1c30]">
                Đổi Mật Khẩu Tham Gia ({passwordModalGroup.groupCode})
              </h3>
              <button
                type="button"
                onClick={() => setPasswordModalGroup(null)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSavePassword} className="p-4 space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Mật Khẩu Mới <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nhập mật khẩu mới cho sinh viên"
                  value={newGroupPassword}
                  onChange={(e) => setNewGroupPassword(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-[#004ac6]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPasswordModalGroup(null)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#004ac6] hover:bg-[#003eb3] cursor-pointer"
                >
                  Cập Nhật Mật Khẩu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
