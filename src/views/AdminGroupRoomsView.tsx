import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  groupRoomService,
  phaseService,
  mentorService,
  GroupRoomAdminDTO,
  GroupAuditLogDTO,
  InternshipPhaseDTO,
  MentorDTO,
} from '../api/services';
import {
  ShieldAlert,
  Search,
  Users,
  MessageSquare,
  CheckSquare,
  Upload,
  Clock,
  Archive,
  UserCheck,
  FileText,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Filter,
} from 'lucide-react';

export const AdminGroupRoomsView: React.FC = () => {
  const navigate = useNavigate();

  const [rooms, setRooms] = useState<GroupRoomAdminDTO[]>([]);
  const [phases, setPhases] = useState<InternshipPhaseDTO[]>([]);
  const [mentors, setMentors] = useState<MentorDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPhaseId, setSelectedPhaseId] = useState<number | undefined>();
  const [selectedActive, setSelectedActive] = useState<boolean | undefined>();

  // Detail Modal
  const [selectedRoom, setSelectedRoom] = useState<GroupRoomAdminDTO | null>(null);
  const [auditLogs, setAuditLogs] = useState<GroupAuditLogDTO[]>([]);
  const [isLoadingAudit, setIsLoadingAudit] = useState(false);

  // Reassign Modal
  const [reassignRoomId, setReassignRoomId] = useState<number | null>(null);
  const [selectedNewMentorId, setSelectedNewMentorId] = useState<number | null>(null);
  const [isReassigning, setIsReassigning] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [roomsRes, phasesRes, mentorsRes] = await Promise.all([
        groupRoomService.getAllAdminRooms({
          search: searchTerm || undefined,
          phaseId: selectedPhaseId,
          active: selectedActive,
          size: 100,
        }),
        phaseService.getAll(),
        mentorService.getAll(),
      ]);

      const roomList = roomsRes?.content || (Array.isArray(roomsRes) ? roomsRes : []);
      setRooms(roomList);
      setPhases(Array.isArray(phasesRes) ? phasesRes : []);
      setMentors(Array.isArray(mentorsRes) ? mentorsRes : []);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Không thể tải danh sách phòng làm việc');
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, selectedPhaseId, selectedActive]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleArchive = async (groupId: number, groupName: string) => {
    if (!window.confirm(`Bạn có chắc muốn lưu trữ phòng "${groupName}"?`)) return;
    try {
      await groupRoomService.archiveRoom(groupId);
      await loadData();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Lưu trữ phòng thất bại');
    }
  };

  const handleOpenAudit = async (groupId: number) => {
    setIsLoadingAudit(true);
    try {
      const logs = await groupRoomService.getAdminRoomAuditLogs(groupId);
      setAuditLogs(Array.isArray(logs) ? logs : []);
    } catch (err) {
      console.error('Failed to load audit logs', err);
    } finally {
      setIsLoadingAudit(false);
    }
  };

  const handleReassignMentor = async () => {
    if (!reassignRoomId || !selectedNewMentorId || isReassigning) return;
    setIsReassigning(true);
    try {
      await groupRoomService.reassignMentor(reassignRoomId, selectedNewMentorId);
      setReassignRoomId(null);
      await loadData();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Chuyển mentor thất bại');
    } finally {
      setIsReassigning(false);
    }
  };

  // Stats calculation
  const totalRooms = rooms.length;
  const activeRooms = rooms.filter((r) => r.isActive).length;
  const totalMessages = rooms.reduce((acc, r) => acc + (r.totalMessages || 0), 0);
  const totalTasks = rooms.reduce((acc, r) => acc + (r.totalTasks || 0), 0);
  const totalSubmissions = rooms.reduce((acc, r) => acc + (r.totalSubmissions || 0), 0);
  const totalOverdue = rooms.reduce((acc, r) => acc + (r.overdueTasks || 0), 0);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400">
              <ShieldAlert className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Giám sát Phòng làm việc Nhóm (Admin Oversight)
            </h1>
          </div>
          <p className="text-xs text-slate-500">
            Theo dõi toàn bộ hoạt động, tin nhắn, nhiệm vụ, bài nộp và nhật ký audit của tất cả nhóm thực tập.
          </p>
        </div>
        <button
          onClick={loadData}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold hover:bg-slate-50 transition shadow-xs"
        >
          <RefreshCw className="w-4 h-4" /> Làm mới
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-[11px] font-semibold text-slate-500 mb-1">Tổng số phòng</p>
          <p className="text-xl font-bold text-slate-900 dark:text-white">{totalRooms}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-[11px] font-semibold text-slate-500 mb-1">Đang hoạt động</p>
          <p className="text-xl font-bold text-emerald-600">{activeRooms}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-[11px] font-semibold text-slate-500 mb-1">Tổng tin nhắn</p>
          <p className="text-xl font-bold text-indigo-600">{totalMessages}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-[11px] font-semibold text-slate-500 mb-1">Nhiệm vụ (Tasks)</p>
          <p className="text-xl font-bold text-blue-600">{totalTasks}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-[11px] font-semibold text-slate-500 mb-1">Bài nộp nhóm</p>
          <p className="text-xl font-bold text-purple-600">{totalSubmissions}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-[11px] font-semibold text-slate-500 mb-1">Task quá hạn</p>
          <p className="text-xl font-bold text-rose-600">{totalOverdue}</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tên nhóm, mã nhóm, mentor..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <select
          value={selectedPhaseId || ''}
          onChange={(e) => setSelectedPhaseId(e.target.value ? Number(e.target.value) : undefined)}
          className="px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs outline-none text-slate-700 dark:text-slate-300"
        >
          <option value="">-- Tất cả đợt thực tập --</option>
          {phases.map((p) => (
            <option key={p.phaseId} value={p.phaseId}>{p.phaseName}</option>
          ))}
        </select>
        <select
          value={selectedActive === undefined ? '' : String(selectedActive)}
          onChange={(e) => setSelectedActive(e.target.value === '' ? undefined : e.target.value === 'true')}
          className="px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs outline-none text-slate-700 dark:text-slate-300"
        >
          <option value="">-- Trạng thái phòng --</option>
          <option value="true">Đang hoạt động</option>
          <option value="false">Đã lưu trữ</option>
        </select>
      </div>

      {/* Rooms Table */}
      {isLoading ? (
        <div className="flex items-center justify-center p-12">
          <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
        </div>
      ) : error ? (
        <div className="p-6 bg-red-50 text-red-700 rounded-2xl text-center text-xs font-semibold">
          {error}
        </div>
      ) : rooms.length === 0 ? (
        <div className="p-12 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <Users className="w-12 h-12 mx-auto mb-2 opacity-40" />
          <p className="text-sm font-medium">Không tìm thấy phòng nhóm nào phù hợp.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Tên nhóm / Mã</th>
                  <th className="py-3.5 px-4">Mentor phụ trách</th>
                  <th className="py-3.5 px-4">Đợt</th>
                  <th className="py-3.5 px-4">Thành viên</th>
                  <th className="py-3.5 px-4">Hoạt động (Msg / Task / Sub)</th>
                  <th className="py-3.5 px-4">Trạng thái</th>
                  <th className="py-3.5 px-4 text-right">Thao tác giám sát</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {rooms.map((room) => (
                  <tr key={room.groupId} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-900 dark:text-white">{room.groupName}</p>
                      <code className="text-[10px] text-slate-400 font-mono">{room.groupCode}</code>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{room.mentorName}</p>
                      <p className="text-[10px] text-slate-400">{room.mentorEmail}</p>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                      {room.phaseName}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{room.memberCount} sinh viên</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                        <span className="flex items-center gap-1" title="Tin nhắn">
                          <MessageSquare className="w-3.5 h-3.5 text-indigo-500" /> {room.totalMessages}
                        </span>
                        <span className="flex items-center gap-1" title="Tasks">
                          <CheckSquare className="w-3.5 h-3.5 text-blue-500" /> {room.totalTasks}
                        </span>
                        <span className="flex items-center gap-1" title="Bài nộp">
                          <Upload className="w-3.5 h-3.5 text-purple-500" /> {room.totalSubmissions}
                        </span>
                        {room.overdueTasks > 0 && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-rose-100 text-rose-700">
                            {room.overdueTasks} trễ
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        room.isActive
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}>
                        {room.isActive ? 'Đang chạy' : 'Đã lưu trữ'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => navigate(`/groups/${room.groupId}`)}
                          className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 rounded-lg text-xs font-semibold transition"
                          title="Vào phòng trực tiếp"
                        >
                          Vào phòng
                        </button>
                        <button
                          onClick={() => {
                            setSelectedRoom(room);
                            handleOpenAudit(room.groupId);
                          }}
                          className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 rounded-lg transition"
                          title="Xem chi tiết giám sát & Audit Log"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setReassignRoomId(room.groupId);
                            setSelectedNewMentorId(room.mentorId);
                          }}
                          className="p-1.5 hover:bg-blue-50 text-slate-500 hover:text-blue-600 rounded-lg transition"
                          title="Chuyển Mentor"
                        >
                          <UserCheck className="w-4 h-4" />
                        </button>
                        {room.isActive && (
                          <button
                            onClick={() => handleArchive(room.groupId, room.groupName)}
                            className="p-1.5 hover:bg-rose-50 text-slate-500 hover:text-rose-600 rounded-lg transition"
                            title="Lưu trữ phòng"
                          >
                            <Archive className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DEEP DETAIL & AUDIT MODAL */}
      {selectedRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Chi tiết giám sát: {selectedRoom.groupName}
                </h2>
                <p className="text-xs text-slate-400">
                  Mã: {selectedRoom.groupCode} • Mentor: {selectedRoom.mentorName} • Đợt: {selectedRoom.phaseName}
                </p>
              </div>
              <button
                onClick={() => setSelectedRoom(null)}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-4">
              {/* Settings breakdown */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <span className="text-slate-400 block text-[10px]">Chat Mode</span>
                  <strong className="text-slate-800 dark:text-slate-200">{selectedRoom.settings.chatMode}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Submission Mode</span>
                  <strong className="text-slate-800 dark:text-slate-200">{selectedRoom.settings.submissionMode}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Task Create Mode</span>
                  <strong className="text-slate-800 dark:text-slate-200">{selectedRoom.settings.taskCreateMode}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Cho phép file đính kèm</span>
                  <strong className="text-slate-800 dark:text-slate-200">{selectedRoom.settings.allowAttachments ? 'Có' : 'Không'}</strong>
                </div>
              </div>

              {/* Members breakdown */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                  Danh sách thành viên ({selectedRoom.members.length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                  {selectedRoom.members.map((m) => (
                    <div key={m.memberId} className="p-2 rounded-lg border border-slate-100 dark:border-slate-800 text-xs flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">{m.studentName}</p>
                        <p className="text-[10px] text-slate-400">{m.studentCode} • {m.studentEmail}</p>
                      </div>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                        {m.groupRole || 'MEMBER'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Audit Logs */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                  Nhật ký thao tác (Audit Logs)
                </h3>
                {isLoadingAudit ? (
                  <p className="text-xs text-slate-400">Đang tải nhật ký...</p>
                ) : auditLogs.length === 0 ? (
                  <p className="text-xs text-slate-400">Chưa có bản ghi nhật ký nào.</p>
                ) : (
                  <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 text-[10px]">
                        <tr>
                          <th className="py-2 px-3">Thời gian</th>
                          <th className="py-2 px-3">Người thực hiện</th>
                          <th className="py-2 px-3">Hành động</th>
                          <th className="py-2 px-3">Chi tiết</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {auditLogs.map((log) => (
                          <tr key={log.auditId}>
                            <td className="py-2 px-3 text-[10px] text-slate-400 whitespace-nowrap">
                              {new Date(log.createdAt).toLocaleString('vi-VN')}
                            </td>
                            <td className="py-2 px-3 font-semibold text-slate-700 dark:text-slate-300">
                              {log.actorName} ({log.actorRole})
                            </td>
                            <td className="py-2 px-3">
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-indigo-600 font-bold">
                                {log.action}
                              </span>
                            </td>
                            <td className="py-2 px-3 text-slate-600 dark:text-slate-400 truncate max-w-[200px]">
                              {log.metadataJson}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedRoom(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REASSIGN MENTOR MODAL */}
      {reassignRoomId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-2xl p-6 shadow-xl border border-slate-200 dark:border-slate-800">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Chuyển Mentor quản lý nhóm</h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Chọn Mentor mới
                </label>
                <select
                  value={selectedNewMentorId || ''}
                  onChange={(e) => setSelectedNewMentorId(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs outline-none"
                >
                  <option value="">-- Chọn Mentor --</option>
                  {mentors.map((m) => (
                    <option key={m.mentorId} value={m.mentorId}>
                      {m.fullName} ({m.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReassignRoomId(null)}
                  className="px-3.5 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  disabled={!selectedNewMentorId || isReassigning}
                  onClick={handleReassignMentor}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold disabled:opacity-50"
                >
                  {isReassigning ? 'Đang chuyển...' : 'Xác nhận chuyển'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
