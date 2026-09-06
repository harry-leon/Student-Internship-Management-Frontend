import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  groupRoomService,
  fileService,
  GroupRoomOverviewDTO,
  GroupMessageDTO,
  GroupAnnouncementDTO,
  GroupTaskDTO,
  GroupSubmissionDTO,
  GroupMemberDTO,
  GroupMemberRole,
  GroupTaskStatus,
  GroupTaskPriority,
  GroupRoomSettingsDTO,
} from '../api/services';
import {
  MessageSquare,
  Users,
  CheckSquare,
  Upload,
  Settings,
  Shield,
  Clock,
  Pin,
  Send,
  Paperclip,
  Trash2,
  Edit2,
  VolumeX,
  Volume2,
  UserCheck,
  UserX,
  Plus,
  ExternalLink,
  Download,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  Calendar,
  Award,
  RefreshCw,
  Copy,
  Check,
} from 'lucide-react';

export const MentorGroupRoomView: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const numericGroupId = Number(groupId);

  const isTasksRoute = location.pathname.endsWith('/tasks');

  // Core Room State
  const [overview, setOverview] = useState<GroupRoomOverviewDTO | null>(null);
  const [messages, setMessages] = useState<GroupMessageDTO[]>([]);
  const [announcements, setAnnouncements] = useState<GroupAnnouncementDTO[]>([]);
  const [tasks, setTasks] = useState<GroupTaskDTO[]>([]);
  const [submissions, setSubmissions] = useState<GroupSubmissionDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Active Tab on Desktop Right Column / Mobile
  const [rightTab, setRightTab] = useState<'tasks' | 'submissions' | 'announcements' | 'settings'>('tasks');
  const [mobileTab, setMobileTab] = useState<'chat' | 'tasks' | 'submissions' | 'members'>('chat');

  useEffect(() => {
    if (isTasksRoute) {
      setRightTab('tasks');
      setMobileTab('tasks');
      setIsRightCollapsed(false);
    }
  }, [isTasksRoute]);

  // Section Collapse State
  const [isLeftCollapsed, setIsLeftCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('group_room_left_collapsed') === 'true';
  });
  const [isRightCollapsed, setIsRightCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('group_room_right_collapsed') === 'true';
  });
  const [isPinnedCollapsed, setIsPinnedCollapsed] = useState<boolean>(false);

  const toggleLeftCollapse = () => {
    setIsLeftCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('group_room_left_collapsed', String(next));
      return next;
    });
  };

  const toggleRightCollapse = () => {
    setIsRightCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('group_room_right_collapsed', String(next));
      return next;
    });
  };

  // Chat State
  const [chatInput, setChatInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Task Creation Modal
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskPriority, setTaskPriority] = useState<GroupTaskPriority>('MEDIUM');
  const [taskDeadline, setTaskDeadline] = useState('');
  const [taskAssignees, setTaskAssignees] = useState<number[]>([]);
  const [assignAllMembers, setAssignAllMembers] = useState(true);
  const [isSavingTask, setIsSavingTask] = useState(false);

  // Task Comments
  const [expandedTaskId, setExpandedTaskId] = useState<number | null>(null);
  const [taskCommentInput, setTaskCommentInput] = useState('');
  const [isSendingComment, setIsSendingComment] = useState(false);

  // Submission Modals
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [submissionType, setSubmissionType] = useState<'GITHUB_LINK' | 'ZIP_FILE'>('GITHUB_LINK');
  const [githubUrl, setGithubUrl] = useState('');
  const [submissionZipFile, setSubmissionZipFile] = useState<File | null>(null);
  const [submissionTaskId, setSubmissionTaskId] = useState<number | undefined>();
  const [submissionNote, setSubmissionNote] = useState('');
  const [isSubmittingWork, setIsSubmittingWork] = useState(false);

  // Review Modal
  const [reviewSubmissionId, setReviewSubmissionId] = useState<number | null>(null);
  const [reviewScore, setReviewScore] = useState<number>(8.5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Announcement Modal
  const [isCreateAnnounceOpen, setIsCreateAnnounceOpen] = useState(false);
  const [announceTitle, setAnnounceTitle] = useState('');
  const [announceContent, setAnnounceContent] = useState('');
  const [announcePriority, setAnnouncePriority] = useState<'NORMAL' | 'IMPORTANT' | 'URGENT'>('NORMAL');
  const [announcePinned, setAnnouncePinned] = useState(false);

  // Mute Modal
  const [muteStudentId, setMuteStudentId] = useState<number | null>(null);
  const [muteMinutes, setMuteMinutes] = useState<number>(30);

  // Settings State
  const [settingsForm, setSettingsForm] = useState<Partial<GroupRoomSettingsDTO>>({});
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  // Feedback State
  const [copiedCode, setCopiedCode] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  const isMentor = user?.role === 'Mentor';
  const isAdmin = user?.role === 'Admin';
  const myRole = overview?.currentUserRoomRole;
  const isOwnerOrAdmin = isMentor || isAdmin || myRole === 'OWNER';
  const isLeader = myRole === 'LEADER';
  const canManageRoom = isOwnerOrAdmin;
  const canCreateTask = isOwnerOrAdmin || (isLeader && overview?.settings.taskCreateMode === 'MENTOR_AND_LEADER');
  const canSubmit = isOwnerOrAdmin || overview?.settings.submissionMode === 'ANY_MEMBER' || (isLeader && overview?.settings.submissionMode === 'LEADER_ONLY');

  // Load Room Data
  const loadRoom = useCallback(async () => {
    if (!numericGroupId) return;
    try {
      const res = await groupRoomService.getRoomOverview(numericGroupId);
      setOverview(res);
      setSettingsForm(res.settings);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Không thể tải phòng làm việc nhóm');
    }
  }, [numericGroupId]);

  // Load Messages
  const loadMessages = useCallback(async () => {
    if (!numericGroupId) return;
    try {
      const res = await groupRoomService.getMessages(numericGroupId, 0, 50);
      const content = res?.content || (Array.isArray(res) ? res : []);
      // Reverse to display oldest to newest
      setMessages([...content].reverse());
    } catch (err) {
      console.error('Error fetching messages', err);
    }
  }, [numericGroupId]);

  // Load Announcements
  const loadAnnouncements = useCallback(async () => {
    if (!numericGroupId) return;
    try {
      const res = await groupRoomService.getAnnouncements(numericGroupId);
      setAnnouncements(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error('Error fetching announcements', err);
    }
  }, [numericGroupId]);

  // Load Tasks
  const loadTasks = useCallback(async () => {
    if (!numericGroupId) return;
    try {
      const res = await groupRoomService.getTasks(numericGroupId);
      setTasks(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error('Error fetching tasks', err);
    }
  }, [numericGroupId]);

  // Load Submissions
  const loadSubmissions = useCallback(async () => {
    if (!numericGroupId) return;
    try {
      const res = await groupRoomService.getSubmissions(numericGroupId);
      setSubmissions(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error('Error fetching submissions', err);
    }
  }, [numericGroupId]);

  // Initial load
  useEffect(() => {
    setIsLoading(true);
    Promise.all([loadRoom(), loadMessages(), loadAnnouncements(), loadTasks(), loadSubmissions()])
      .finally(() => setIsLoading(false));
  }, [loadRoom, loadMessages, loadAnnouncements, loadTasks, loadSubmissions]);

  // Polling for messages every 6 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      loadMessages();
    }, 6000);
    return () => clearInterval(interval);
  }, [loadMessages]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send Message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!chatInput.trim() && !selectedFile) || isSending) return;
    setIsSending(true);
    try {
      let attachmentIds: number[] = [];
      if (selectedFile) {
        const uploadRes = await fileService.uploadGeneric(selectedFile, 'GROUP_CHAT_ATTACHMENT', numericGroupId);
        if (uploadRes?.fileId) {
          attachmentIds.push(uploadRes.fileId);
        }
      }
      await groupRoomService.sendMessage(numericGroupId, {
        content: chatInput.trim() || (selectedFile ? `Đã đính kèm tệp: ${selectedFile.name}` : ''),
        attachmentFileIds: attachmentIds,
      });
      setChatInput('');
      setSelectedFile(null);
      await loadMessages();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Không thể gửi tin nhắn');
    } finally {
      setIsSending(false);
    }
  };

  // Edit Message
  const handleEditMessage = async (msgId: number) => {
    if (!editingContent.trim()) return;
    try {
      await groupRoomService.editMessage(numericGroupId, msgId, editingContent.trim());
      setEditingMessageId(null);
      await loadMessages();
      showToast('Đã sửa tin nhắn');
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Không thể sửa tin nhắn');
    }
  };

  // Delete Message
  const handleDeleteMessage = async (msgId: number) => {
    if (!window.confirm('Bạn có chắc muốn xóa tin nhắn này?')) return;
    try {
      await groupRoomService.deleteMessage(numericGroupId, msgId);
      await loadMessages();
      showToast('Đã xóa tin nhắn');
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Không thể xóa tin nhắn');
    }
  };

  // Pin Message
  const handlePinMessage = async (msgId: number, currentPinned: boolean) => {
    try {
      await groupRoomService.pinMessage(numericGroupId, msgId, !currentPinned);
      await loadMessages();
      showToast(!currentPinned ? 'Đã ghim tin nhắn' : 'Đã bỏ ghim');
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Không thể ghim tin nhắn');
    }
  };

  // Open Create Task modal with all active members selected by default
  const openCreateTaskModal = () => {
    if (overview?.members) {
      const activeIds = overview.members
        .filter((m) => m.status === 'ACTIVE' || !m.status)
        .map((m) => m.studentId);
      setTaskAssignees(activeIds);
      setAssignAllMembers(true);
    } else {
      setTaskAssignees([]);
      setAssignAllMembers(true);
    }
    setTaskTitle('');
    setTaskDesc('');
    setTaskPriority('MEDIUM');
    setTaskDeadline('');
    setIsCreateTaskOpen(true);
  };

  // Create Task
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim() || isSavingTask) return;
    setIsSavingTask(true);
    try {
      await groupRoomService.createTask(numericGroupId, {
        title: taskTitle.trim(),
        description: taskDesc.trim() || undefined,
        priority: taskPriority,
        deadlineAt: taskDeadline ? `${taskDeadline}:00` : undefined,
        assignAllMembers: assignAllMembers,
        assigneeStudentIds: assignAllMembers ? undefined : taskAssignees,
      });
      setIsCreateTaskOpen(false);
      setTaskTitle('');
      setTaskDesc('');
      setTaskDeadline('');
      setTaskAssignees([]);
      setAssignAllMembers(true);
      await loadTasks();
      showToast('Đã tạo nhiệm vụ mới');
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Không thể tạo task');
    } finally {
      setIsSavingTask(false);
    }
  };

  // Update Task Status
  const handleUpdateTaskStatus = async (taskId: number, status: GroupTaskStatus) => {
    try {
      await groupRoomService.updateTaskStatus(numericGroupId, taskId, status);
      await loadTasks();
      showToast('Đã cập nhật trạng thái nhiệm vụ');
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Không thể cập nhật trạng thái');
    }
  };

  // Add Task Comment
  const handleAddTaskComment = async (taskId: number) => {
    if (!taskCommentInput.trim() || isSendingComment) return;
    setIsSendingComment(true);
    try {
      await groupRoomService.addTaskComment(numericGroupId, taskId, taskCommentInput.trim());
      setTaskCommentInput('');
      await loadTasks();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Không thể gửi bình luận');
    } finally {
      setIsSendingComment(false);
    }
  };

  // Submit Group Work
  const handleSubmitWork = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingWork) return;
    setIsSubmittingWork(true);
    try {
      if (submissionType === 'GITHUB_LINK') {
        if (!githubUrl.trim()) {
          alert('Vui lòng nhập link GitHub repository');
          setIsSubmittingWork(false);
          return;
        }
        await groupRoomService.submitGithub(numericGroupId, {
          taskId: submissionTaskId,
          githubUrl: githubUrl.trim(),
          note: submissionNote.trim() || undefined,
        });
      } else {
        if (!submissionZipFile) {
          alert('Vui lòng chọn file ZIP bài nộp');
          setIsSubmittingWork(false);
          return;
        }
        await groupRoomService.submitZip(
          numericGroupId,
          submissionZipFile,
          submissionTaskId,
          submissionNote.trim() || undefined
        );
      }
      setIsSubmitModalOpen(false);
      setGithubUrl('');
      setSubmissionZipFile(null);
      setSubmissionNote('');
      await loadSubmissions();
      showToast('Đã nộp bài nhóm thành công!');
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Nộp bài thất bại');
    } finally {
      setIsSubmittingWork(false);
    }
  };

  // Review Submission
  const handleReviewSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewSubmissionId || isSubmittingReview) return;
    setIsSubmittingReview(true);
    try {
      await groupRoomService.reviewSubmission(numericGroupId, reviewSubmissionId, {
        score: reviewScore,
        comment: reviewComment.trim(),
        status: 'PUBLISHED',
      });
      setReviewSubmissionId(null);
      setReviewComment('');
      await loadSubmissions();
      showToast('Đã lưu đánh giá và chấm điểm');
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Không thể lưu đánh giá');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Create Announcement
  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!announceTitle.trim() || !announceContent.trim()) return;
    try {
      await groupRoomService.createAnnouncement(numericGroupId, {
        title: announceTitle.trim(),
        content: announceContent.trim(),
        priority: announcePriority,
        pinned: announcePinned,
      });
      setIsCreateAnnounceOpen(false);
      setAnnounceTitle('');
      setAnnounceContent('');
      await loadAnnouncements();
      await loadRoom();
      showToast('Đã đăng thông báo');
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Không thể tạo thông báo');
    }
  };

  // Member Management Actions
  const handleUpdateRole = async (studentId: number, role: GroupMemberRole) => {
    try {
      await groupRoomService.updateMemberRole(numericGroupId, studentId, role);
      await loadRoom();
      showToast(`Đã đổi vai trò thành ${role}`);
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Không thể đổi vai trò');
    }
  };

  const handleMuteMember = async () => {
    if (!muteStudentId) return;
    try {
      await groupRoomService.muteMember(numericGroupId, muteStudentId, true, muteMinutes);
      setMuteStudentId(null);
      await loadRoom();
      showToast(`Đã khóa chat thành viên ${muteMinutes} phút`);
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Không thể khóa chat');
    }
  };

  const handleUnmuteMember = async (studentId: number) => {
    try {
      await groupRoomService.muteMember(numericGroupId, studentId, false);
      await loadRoom();
      showToast('Đã mở khóa chat thành viên');
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Không thể mở khóa chat');
    }
  };

  const handleRemoveMember = async (studentId: number, studentName: string) => {
    if (!window.confirm(`Bạn có chắc muốn xóa sinh viên ${studentName} khỏi nhóm?`)) return;
    try {
      await groupRoomService.removeMember(numericGroupId, studentId);
      await loadRoom();
      showToast('Đã xóa thành viên khỏi nhóm');
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Không thể xóa thành viên');
    }
  };

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      await groupRoomService.updateSettings(numericGroupId, settingsForm);
      await loadRoom();
      setSettingsSuccess(true);
      setTimeout(() => setSettingsSuccess(false), 3000);
      showToast('Đã lưu cấu hình phòng');
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Không thể lưu cài đặt');
    } finally {
      setIsSavingSettings(false);
    }
  };

  const copyCode = () => {
    if (!overview?.groupCode) return;
    navigator.clipboard.writeText(overview.groupCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
          <p className="text-slate-600 font-medium">Đang tải phòng làm việc nhóm...</p>
        </div>
      </div>
    );
  }

  if (error || !overview) {
    return (
      <div className="p-8 max-w-xl mx-auto text-center">
        <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-6 rounded-2xl border border-red-200 dark:border-red-800">
          <AlertCircle className="w-12 h-12 mx-auto mb-3" />
          <h2 className="text-xl font-bold mb-2">Không thể truy cập phòng nhóm</h2>
          <p className="text-sm mb-6">{error || 'Bạn không có quyền truy cập nhóm này hoặc nhóm không tồn tại.'}</p>
          <button
            onClick={() => navigate('/groups')}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Quay lại danh sách nhóm
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] max-h-[calc(100vh-80px)] overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-xl shadow-lg animate-bounce">
          <CheckCircle2 className="w-5 h-5" />
          <span className="text-sm font-medium">{successToast}</span>
        </div>
      )}

      {/* TOP HEADER BAR */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/groups')}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg transition"
            title="Quay lại danh sách nhóm"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                {overview.groupName}
              </h1>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                {overview.phaseName}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                myRole === 'OWNER'
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                  : myRole === 'LEADER'
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
                  : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
              }`}>
                {myRole === 'OWNER' ? 'Mentor (Owner)' : myRole === 'LEADER' ? 'Trưởng nhóm' : 'Thành viên'}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              <span>Mentor: <strong className="text-slate-700 dark:text-slate-300">{overview.mentorName}</strong></span>
              <span>•</span>
              <button
                onClick={copyCode}
                className="inline-flex items-center gap-1 hover:text-indigo-600 transition"
                title="Sao chép mã nhóm"
              >
                Mã: <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded font-mono font-bold text-slate-700 dark:text-slate-300">{overview.groupCode}</code>
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <span>•</span>
              <span>{overview.memberCount} thành viên</span>
            </div>
          </div>
        </div>

        {/* Header Right Action Tools */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Toggle Left Column (Members) */}
          <button
            onClick={toggleLeftCollapse}
            className={`p-2 rounded-xl transition cursor-pointer ${
              !isLeftCollapsed
                ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400'
                : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400'
            }`}
            title={isLeftCollapsed ? 'Hiện danh sách thành viên' : 'Thu gọn danh sách thành viên'}
          >
            <Users className="w-5 h-5" />
          </button>

          {/* Toggle Right Column (Tasks & Submissions) */}
          <button
            onClick={toggleRightCollapse}
            className={`p-2 rounded-xl transition cursor-pointer ${
              !isRightCollapsed
                ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400'
                : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400'
            }`}
            title={isRightCollapsed ? 'Hiện bảng công việc & nộp bài' : 'Thu gọn bảng công việc & nộp bài'}
          >
            <CheckSquare className="w-5 h-5" />
          </button>

          {canManageRoom && (
            <button
              onClick={() => {
                setRightTab('settings');
                setIsRightCollapsed(false);
              }}
              className={`p-2 rounded-xl transition cursor-pointer ${
                rightTab === 'settings' && !isRightCollapsed
                  ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
              title="Cài đặt phòng"
            >
              <Settings className="w-5 h-5" />
            </button>
          )}
          <button
            onClick={() => {
              loadRoom();
              loadMessages();
              loadTasks();
              loadSubmissions();
              showToast('Đã làm mới dữ liệu');
            }}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl transition cursor-pointer"
            title="Làm mới"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* MOBILE TABS (sm only) */}
      <div className="flex md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0">
        <button
          onClick={() => setMobileTab('chat')}
          className={`flex-1 py-2.5 text-xs font-semibold text-center border-b-2 transition ${
            mobileTab === 'chat'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500'
          }`}
        >
          Chat ({messages.length})
        </button>
        <button
          onClick={() => setMobileTab('tasks')}
          className={`flex-1 py-2.5 text-xs font-semibold text-center border-b-2 transition ${
            mobileTab === 'tasks'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500'
          }`}
        >
          Tasks ({tasks.length})
        </button>
        <button
          onClick={() => setMobileTab('submissions')}
          className={`flex-1 py-2.5 text-xs font-semibold text-center border-b-2 transition ${
            mobileTab === 'submissions'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500'
          }`}
        >
          Nộp bài ({submissions.length})
        </button>
        <button
          onClick={() => setMobileTab('members')}
          className={`flex-1 py-2.5 text-xs font-semibold text-center border-b-2 transition ${
            mobileTab === 'members'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500'
          }`}
        >
          Thành viên ({overview.memberCount})
        </button>
      </div>

      {/* MAIN 3-COLUMN WORKSPACE */}
      <div className="flex-1 flex overflow-hidden">
        {/* ========================================================
            LEFT COLUMN: MEMBERS & ROLES (Hidden on mobile if not active tab)
        ======================================================== */}
        {isLeftCollapsed ? (
          <div className={`w-14 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col shrink-0 items-center py-3 transition-all duration-200 ${
            mobileTab !== 'members' ? 'hidden md:flex' : 'flex w-full'
          }`}>
            <button
              onClick={toggleLeftCollapse}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-indigo-600 rounded-xl transition mb-2 cursor-pointer"
              title="Mở rộng danh sách thành viên"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <div className="flex flex-col items-center gap-1 pt-2 border-t border-slate-100 dark:border-slate-800 w-full px-2">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter">TV</span>
              <span className="w-7 h-7 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-bold shadow-xs">
                {overview.memberCount}
              </span>
            </div>
            <div className="flex-1 overflow-y-auto w-full flex flex-col items-center gap-2 py-3">
              {/* Mentor Avatar */}
              <div
                onClick={toggleLeftCollapse}
                className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-orange-400 text-white flex items-center justify-center font-bold text-xs shadow-xs ring-2 ring-amber-300 dark:ring-amber-800 cursor-pointer"
                title={`Mentor: ${overview.mentorName} (Bấm để mở rộng)`}
              >
                {overview.mentorName.charAt(0)}
              </div>
              {/* Student Avatars */}
              {overview.members.slice(0, 8).map((m: GroupMemberDTO) => (
                <div
                  key={m.memberId}
                  onClick={toggleLeftCollapse}
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-xs cursor-pointer ${
                    m.groupRole === 'LEADER'
                      ? 'bg-blue-600 text-white ring-2 ring-blue-300'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                  }`}
                  title={`${m.studentName} (${m.groupRole === 'LEADER' ? 'Trưởng nhóm' : 'Thành viên'}) - Bấm để mở rộng`}
                >
                  {m.studentName.charAt(0)}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className={`w-72 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col shrink-0 overflow-hidden transition-all duration-200 ${
            mobileTab !== 'members' ? 'hidden md:flex' : 'flex w-full'
          }`}>
            <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-slate-500" />
                <span className="font-bold text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Thành viên ({overview.memberCount})
                </span>
              </div>
              <button
                onClick={toggleLeftCollapse}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg transition cursor-pointer"
                title="Thu gọn danh sách thành viên"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {/* Mentor Card */}
              <div className="p-2.5 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-900/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-500 to-orange-400 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                    {overview.mentorName.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {overview.mentorName}
                      </p>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-200 text-amber-900 dark:bg-amber-900/60 dark:text-amber-200">
                        OWNER
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate">{overview.mentorEmail}</p>
                  </div>
                </div>
              </div>

              {/* Students List */}
              {overview.members.map((m: GroupMemberDTO) => {
                const isMuted = Boolean(m.isMuted);
                const isStudentLeader = m.groupRole === 'LEADER';
                return (
                  <div
                    key={m.memberId}
                    className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 bg-white dark:bg-slate-900/80 transition"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                          {m.studentName.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                              {m.studentName}
                            </p>
                            {isStudentLeader && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                                LEADER
                              </span>
                            )}
                            {isMuted && (
                              <VolumeX className="w-3.5 h-3.5 text-rose-500 shrink-0" title="Bị khóa chat" />
                            )}
                          </div>
                          <p className="text-[10px] text-slate-500 truncate">
                            {m.studentCode} • {m.studentMajor || 'IT'}
                          </p>
                        </div>
                      </div>

                      {/* Mentor moderation dropdown/buttons */}
                      {canManageRoom && (
                        <div className="flex items-center gap-1 shrink-0">
                          {isStudentLeader ? (
                            <button
                              onClick={() => handleUpdateRole(m.studentId, 'MEMBER')}
                              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-blue-600 rounded transition"
                              title="Hạ quyền xuống Member"
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleUpdateRole(m.studentId, 'LEADER')}
                              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-blue-600 rounded transition"
                              title="Bổ nhiệm làm Leader"
                            >
                              <Shield className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {isMuted ? (
                            <button
                              onClick={() => handleUnmuteMember(m.studentId)}
                              className="p-1 hover:bg-emerald-50 text-emerald-600 rounded transition"
                              title="Mở khóa chat"
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button
                              onClick={() => setMuteStudentId(m.studentId)}
                              className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded transition"
                              title="Khóa chat"
                            >
                              <VolumeX className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            onClick={() => handleRemoveMember(m.studentId, m.studentName)}
                            className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded transition"
                            title="Xóa khỏi nhóm"
                          >
                            <UserX className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================
            CENTER COLUMN: CHAT FEED & ANNOUNCEMENT BANNER
        ======================================================== */}
        <div className={`flex-1 flex flex-col bg-slate-50 dark:bg-slate-950 overflow-hidden ${
          mobileTab !== 'chat' ? 'hidden md:flex' : 'flex w-full'
        }`}>
          {/* Pinned Announcements Top Banner */}
          {overview.pinnedAnnouncements && overview.pinnedAnnouncements.length > 0 && (
            <div className="bg-indigo-50/80 dark:bg-indigo-950/40 border-b border-indigo-100 dark:border-indigo-900/50 p-2.5 px-4 shrink-0 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                  <Pin className="w-3.5 h-3.5 text-indigo-600" /> Thông báo ghim ({overview.pinnedAnnouncements.length})
                </span>
                <button
                  type="button"
                  onClick={() => setIsPinnedCollapsed(!isPinnedCollapsed)}
                  className="flex items-center gap-1 text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                  title={isPinnedCollapsed ? 'Mở rộng thông báo ghim' : 'Thu gọn thông báo ghim'}
                >
                  <span>{isPinnedCollapsed ? 'Mở rộng' : 'Thu gọn'}</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isPinnedCollapsed ? '-rotate-90' : ''}`} />
                </button>
              </div>
              {!isPinnedCollapsed && (
                <div className="space-y-1.5 max-h-24 overflow-y-auto mt-1.5">
                  {overview.pinnedAnnouncements.map((ann) => (
                    <div
                      key={ann.announcementId}
                      className="text-xs bg-white dark:bg-slate-900 p-2 rounded-lg border border-indigo-100 dark:border-indigo-900 flex items-start justify-between gap-2 shadow-xs"
                    >
                      <div>
                        <span className="font-semibold text-slate-900 dark:text-white mr-1.5">
                          {ann.title}:
                        </span>
                        <span className="text-slate-600 dark:text-slate-300">{ann.content}</span>
                      </div>
                      {ann.priority === 'URGENT' && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700 shrink-0">
                          Khẩn cấp
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-600">
                <MessageSquare className="w-12 h-12 stroke-[1.5] mb-2" />
                <p className="text-sm font-medium">Chưa có tin nhắn nào trong phòng nhóm.</p>
                <p className="text-xs">Hãy bắt đầu cuộc trò chuyện với mentor và các thành viên!</p>
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = msg.senderUserId === user?.userId;
                const isDeleted = Boolean(msg.deleted);
                const isPinned = Boolean(msg.pinned);
                const canEdit = isMe && !isDeleted;
                const canDelete = (isMe || canManageRoom) && !isDeleted;

                return (
                  <div
                    key={msg.messageId}
                    className={`flex items-start gap-2.5 group ${isMe ? 'flex-row-reverse' : ''}`}
                  >
                    {/* Sender Avatar */}
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-600 to-slate-800 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                      {msg.senderName.charAt(0)}
                    </div>

                    <div className={`max-w-[75%] sm:max-w-[65%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                      {/* Name & Role */}
                      <div className="flex items-center gap-1.5 mb-1 px-1">
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                          {isMe ? 'Bạn' : msg.senderName}
                        </span>
                        {msg.senderRole && (
                          <span className="text-[10px] px-1 py-0.2 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                            {msg.senderRole}
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {isPinned && (
                          <Pin className="w-3 h-3 text-indigo-600 fill-indigo-600 shrink-0" title="Tin nhắn đã ghim" />
                        )}
                      </div>

                      {/* Message Bubble */}
                      <div
                        className={`p-3 rounded-2xl text-xs relative ${
                          isDeleted
                            ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 italic'
                            : isMe
                            ? 'bg-indigo-600 text-white rounded-tr-xs shadow-xs'
                            : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-xs shadow-xs'
                        }`}
                      >
                        {editingMessageId === msg.messageId ? (
                          <div className="flex flex-col gap-2">
                            <input
                              type="text"
                              value={editingContent}
                              onChange={(e) => setEditingContent(e.target.value)}
                              className="px-2 py-1 bg-white dark:bg-slate-800 border rounded text-xs text-slate-900 dark:text-white"
                              autoFocus
                            />
                            <div className="flex items-center gap-2 justify-end">
                              <button
                                onClick={() => setEditingMessageId(null)}
                                className="px-2 py-0.5 text-[10px] bg-slate-200 text-slate-700 rounded"
                              >
                                Hủy
                              </button>
                              <button
                                onClick={() => handleEditMessage(msg.messageId)}
                                className="px-2 py-0.5 text-[10px] bg-emerald-600 text-white rounded"
                              >
                                Lưu
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <p className="whitespace-pre-wrap break-words leading-relaxed">{msg.content}</p>
                            {msg.edited && !isDeleted && (
                              <span className={`text-[9px] block mt-1 ${isMe ? 'text-indigo-200' : 'text-slate-400'}`}>
                                (đã chỉnh sửa)
                              </span>
                            )}
                          </>
                        )}

                        {/* Attachments */}
                        {msg.attachments && msg.attachments.length > 0 && !isDeleted && (
                          <div className="mt-2 pt-2 border-t border-indigo-400/30 dark:border-slate-700 space-y-1.5">
                            {msg.attachments.map((att) => (
                              <button
                                key={att.id}
                                onClick={() => fileService.downloadFile(att.fileId, att.originalFileName)}
                                className={`flex items-center gap-2 p-1.5 rounded-lg text-left w-full transition ${
                                  isMe
                                    ? 'bg-indigo-700/50 hover:bg-indigo-700 text-white'
                                    : 'bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-300'
                                }`}
                              >
                                <Paperclip className="w-3.5 h-3.5 shrink-0" />
                                <span className="truncate flex-1 text-[11px] font-medium">{att.originalFileName}</span>
                                <Download className="w-3.5 h-3.5 shrink-0" />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Message Hover Actions */}
                      {!isDeleted && (
                        <div className="flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition px-1">
                          {canManageRoom && (
                            <button
                              onClick={() => handlePinMessage(msg.messageId, isPinned)}
                              className="p-1 text-slate-400 hover:text-indigo-600 transition"
                              title={isPinned ? 'Bỏ ghim' : 'Ghim tin nhắn'}
                            >
                              <Pin className="w-3 h-3" />
                            </button>
                          )}
                          {canEdit && (
                            <button
                              onClick={() => {
                                setEditingMessageId(msg.messageId);
                                setEditingContent(msg.content);
                              }}
                              className="p-1 text-slate-400 hover:text-blue-600 transition"
                              title="Chỉnh sửa tin nhắn"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                          )}
                          {canDelete && (
                            <button
                              onClick={() => handleDeleteMessage(msg.messageId)}
                              className="p-1 text-slate-400 hover:text-rose-600 transition"
                              title="Xóa tin nhắn"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
          <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shrink-0">
            {overview.isMuted ? (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-center text-xs text-rose-700 dark:text-rose-300 font-medium">
                <VolumeX className="w-4 h-4 inline mr-1" />
                Bạn đang bị tạm khóa quyền gửi tin nhắn trong nhóm này.
              </div>
            ) : overview.settings.chatMode === 'MUTED' && !canManageRoom ? (
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-center text-xs text-slate-500 font-medium">
                Phòng chat hiện đang bị khóa tạm thời bởi mentor.
              </div>
            ) : overview.settings.chatMode === 'LEADER_ONLY' && !isOwnerOrAdmin && !isLeader ? (
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 text-center text-xs text-amber-800 dark:text-amber-300 font-medium">
                Chỉ Leader và Mentor được gửi tin nhắn trong chế độ này.
              </div>
            ) : (
              <form onSubmit={handleSendMessage} className="flex flex-col gap-2">
                {selectedFile && (
                  <div className="flex items-center justify-between p-1.5 px-3 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-xs text-indigo-700 dark:text-indigo-300">
                    <span className="truncate flex items-center gap-1.5">
                      <Paperclip className="w-3.5 h-3.5" />
                      {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedFile(null)}
                      className="hover:text-rose-600 transition"
                    >
                      ×
                    </button>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  {overview.settings.allowAttachments && (
                    <label className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 rounded-xl cursor-pointer transition">
                      <Paperclip className="w-4 h-4" />
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setSelectedFile(e.target.files[0]);
                          }
                        }}
                      />
                    </label>
                  )}
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Nhập tin nhắn..."
                    className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
                  />
                  <button
                    type="submit"
                    disabled={(!chatInput.trim() && !selectedFile) || isSending}
                    className="p-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl transition shadow-xs"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* ========================================================
            RIGHT COLUMN: TASKS / SUBMISSIONS / SETTINGS
        ======================================================== */}
        {isRightCollapsed ? (
          <div className={`w-14 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col shrink-0 items-center py-3 transition-all duration-200 ${
            mobileTab === 'chat' || mobileTab === 'members' ? 'hidden md:flex' : 'flex w-full'
          }`}>
            <button
              onClick={toggleRightCollapse}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-indigo-600 rounded-xl transition mb-2 cursor-pointer"
              title="Mở rộng bảng công việc & nộp bài"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex flex-col items-center gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 w-full px-1">
              <button
                onClick={() => {
                  setRightTab('tasks');
                  setIsRightCollapsed(false);
                }}
                className={`p-2 rounded-xl transition relative cursor-pointer ${
                  rightTab === 'tasks' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                title={`Công việc (${tasks.length}) - Bấm để mở rộng`}
              >
                <CheckSquare className="w-5 h-5" />
                {tasks.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-indigo-600 text-white text-[9px] font-bold flex items-center justify-center">
                    {tasks.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => {
                  setRightTab('submissions');
                  setIsRightCollapsed(false);
                }}
                className={`p-2 rounded-xl transition relative cursor-pointer ${
                  rightTab === 'submissions' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                title={`Bài nộp (${submissions.length}) - Bấm để mở rộng`}
              >
                <Upload className="w-5 h-5" />
                {submissions.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-600 text-white text-[9px] font-bold flex items-center justify-center">
                    {submissions.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => {
                  setRightTab('announcements');
                  setIsRightCollapsed(false);
                }}
                className={`p-2 rounded-xl transition relative cursor-pointer ${
                  rightTab === 'announcements' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                title={`Thông báo (${announcements.length}) - Bấm để mở rộng`}
              >
                <Pin className="w-5 h-5" />
                {announcements.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-600 text-white text-[9px] font-bold flex items-center justify-center">
                    {announcements.length}
                  </span>
                )}
              </button>
              {canManageRoom && (
                <button
                  onClick={() => {
                    setRightTab('settings');
                    setIsRightCollapsed(false);
                  }}
                  className={`p-2 rounded-xl transition cursor-pointer ${
                    rightTab === 'settings' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                  title="Cài đặt phòng - Bấm để mở rộng"
                >
                  <Settings className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className={`w-88 lg:w-96 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col shrink-0 overflow-hidden transition-all duration-200 ${
            mobileTab === 'chat' || mobileTab === 'members' ? 'hidden md:flex' : 'flex w-full'
          }`}>
            {/* Sub-tabs header */}
            <div className="flex items-center border-b border-slate-200 dark:border-slate-800 p-1.5 bg-slate-50 dark:bg-slate-900/50 shrink-0 gap-1">
              <button
                onClick={() => setRightTab('tasks')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                  rightTab === 'tasks'
                    ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Tasks ({tasks.length})
              </button>
              <button
                onClick={() => setRightTab('submissions')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                  rightTab === 'submissions'
                    ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Nộp bài ({submissions.length})
              </button>
              <button
                onClick={() => setRightTab('announcements')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                  rightTab === 'announcements'
                    ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Tin ({announcements.length})
              </button>
              <button
                onClick={toggleRightCollapse}
                className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg transition cursor-pointer"
                title="Thu gọn bảng công việc"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* ==================== TASKS SUBTAB ==================== */}
            {rightTab === 'tasks' && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Nhiệm vụ nhóm
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      {overview.activeTaskCount} đang mở • {overview.overdueTaskCount} quá hạn
                    </p>
                  </div>
                  {canCreateTask && (
                    <button
                      onClick={openCreateTaskModal}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition"
                    >
                      <Plus className="w-3.5 h-3.5" /> Tạo Task
                    </button>
                  )}
                </div>

                {tasks.length === 0 ? (
                  <div className="p-8 text-center text-slate-400">
                    <CheckSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-xs">Chưa có nhiệm vụ nào được giao.</p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {tasks.map((task) => {
                      const isExpanded = expandedTaskId === task.taskId;
                      const isDone = task.status === 'DONE';
                      return (
                        <div
                          key={task.taskId}
                          className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 mb-1">
                                <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                                  task.priority === 'URGENT'
                                    ? 'bg-rose-100 text-rose-700'
                                    : task.priority === 'HIGH'
                                    ? 'bg-amber-100 text-amber-700'
                                    : 'bg-slate-100 text-slate-700'
                                }`}>
                                  {task.priority}
                                </span>
                                {task.isOverdue && (
                                  <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-200">
                                    Quá hạn
                                  </span>
                                )}
                              </div>
                              <p className={`text-xs font-bold ${isDone ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                                {task.title}
                              </p>
                              {task.description && (
                                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{task.description}</p>
                              )}
                              {task.deadlineAt && (
                                <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  Hạn: {new Date(task.deadlineAt).toLocaleDateString('vi-VN')}
                                </p>
                              )}
                            </div>

                            {/* Status selector */}
                            <select
                              value={task.status}
                              onChange={(e) => handleUpdateTaskStatus(task.taskId, e.target.value as GroupTaskStatus)}
                              className="text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 border-none rounded-lg px-2 py-1 outline-none text-slate-700 dark:text-slate-300"
                            >
                              <option value="TODO">TODO</option>
                              <option value="IN_PROGRESS">IN PROGRESS</option>
                              <option value="REVIEW">REVIEW</option>
                              <option value="DONE">DONE</option>
                              <option value="BLOCKED">BLOCKED</option>
                            </select>
                          </div>

                          {/* Task Assignees */}
                          {task.assignees && task.assignees.length > 0 && (
                            <div className="flex items-center gap-1 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-500">
                              <span>Phụ trách:</span>
                              {task.assignees.map((a) => (
                                <span key={a.studentId} className="font-semibold text-slate-700 dark:text-slate-300">
                                  {a.studentName}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Comments toggle */}
                          <div className="mt-2 pt-1.5 flex items-center justify-between text-[11px] text-indigo-600 dark:text-indigo-400">
                            <button
                              onClick={() => setExpandedTaskId(isExpanded ? null : task.taskId)}
                              className="inline-flex items-center gap-1 hover:underline"
                            >
                              Bình luận ({task.commentCount || 0})
                              {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                            </button>
                          </div>

                          {/* Expanded Comments Thread */}
                          {isExpanded && (
                            <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                              {task.comments && task.comments.map((c) => (
                                <div key={c.commentId} className="text-[11px] bg-slate-50 dark:bg-slate-800/60 p-2 rounded-lg">
                                  <div className="flex items-center justify-between font-semibold text-slate-700 dark:text-slate-300 mb-0.5">
                                    <span>{c.authorName}</span>
                                    <span className="text-[9px] text-slate-400">
                                      {new Date(c.createdAt).toLocaleDateString('vi-VN')}
                                    </span>
                                  </div>
                                  <p className="text-slate-600 dark:text-slate-300">{c.content}</p>
                                </div>
                              ))}
                              <div className="flex gap-1.5 mt-2">
                                <input
                                  type="text"
                                  value={taskCommentInput}
                                  onChange={(e) => setTaskCommentInput(e.target.value)}
                                  placeholder="Thêm ý kiến..."
                                  className="flex-1 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs outline-none"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleAddTaskComment(task.taskId)}
                                  disabled={!taskCommentInput.trim() || isSendingComment}
                                  className="px-2.5 py-1 bg-indigo-600 text-white rounded-lg text-xs font-semibold disabled:opacity-50"
                                >
                                  Gửi
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ==================== SUBMISSIONS SUBTAB ==================== */}
            {rightTab === 'submissions' && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Bài nộp của nhóm
                    </h3>
                    <p className="text-[11px] text-slate-400">Nộp qua GitHub repository hoặc file ZIP</p>
                  </div>
                  {canSubmit && (
                    <button
                      onClick={() => setIsSubmitModalOpen(true)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition"
                    >
                      <Upload className="w-3.5 h-3.5" /> Nộp bài
                    </button>
                  )}
                </div>

                {submissions.length === 0 ? (
                  <div className="p-8 text-center text-slate-400">
                    <Upload className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-xs">Chưa có bài nộp nào từ nhóm.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {submissions.map((sub) => {
                      const isReviewed = sub.status === 'REVIEWED';
                      const latestReview = sub.reviews && sub.reviews[0];

                      return (
                        <div
                          key={sub.submissionId}
                          className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 border border-indigo-200">
                              Phiên bản v{sub.versionNumber}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              isReviewed
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}>
                              {sub.status}
                            </span>
                          </div>

                          <div>
                            <p className="text-xs font-bold text-slate-900 dark:text-white">
                              {sub.taskTitle ? `Task: ${sub.taskTitle}` : 'Nộp bài giai đoạn'}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              Nộp bởi: {sub.submittedByName} • {new Date(sub.submittedAt).toLocaleString('vi-VN')}
                            </p>
                            {sub.note && <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 italic">"{sub.note}"</p>}
                          </div>

                          {/* Link / Download Button */}
                          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                            {sub.submissionType === 'GITHUB_LINK' ? (
                              <a
                                href={sub.githubUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                              >
                                <ExternalLink className="w-3.5 h-3.5" /> Mở GitHub Repository
                              </a>
                            ) : (
                              <button
                                onClick={() => groupRoomService.downloadSubmissionZip(numericGroupId, sub.submissionId, sub.fileName)}
                                className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                              >
                                <Download className="w-3.5 h-3.5" /> Tải file ZIP bài làm
                              </button>
                            )}

                            {/* Mentor Scoring Action */}
                            {canManageRoom && (
                              <button
                                onClick={() => {
                                  setReviewSubmissionId(sub.submissionId);
                                  setReviewScore(latestReview?.score || 8.5);
                                  setReviewComment(latestReview?.comment || '');
                                }}
                                className="inline-flex items-center gap-1 px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-xs font-semibold transition"
                              >
                                <Award className="w-3 h-3" />
                                {isReviewed ? 'Chấm lại' : 'Chấm điểm'}
                              </button>
                            )}
                          </div>

                          {/* Reviews score and rubric comment display */}
                          {latestReview && (
                            <div className="mt-2 p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-xs">
                              <div className="flex items-center justify-between font-bold text-emerald-800 dark:text-emerald-300">
                                <span>Điểm số: {latestReview.score}/10</span>
                                <span className="text-[10px] font-normal text-emerald-600">{latestReview.reviewerName}</span>
                              </div>
                              {latestReview.comment && (
                                <p className="text-emerald-700 dark:text-emerald-400 mt-1 text-[11px]">
                                  {latestReview.comment}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ==================== ANNOUNCEMENTS SUBTAB ==================== */}
            {rightTab === 'announcements' && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Thông báo nhóm
                  </h3>
                  {canManageRoom && (
                    <button
                      onClick={() => setIsCreateAnnounceOpen(true)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition"
                    >
                      <Plus className="w-3.5 h-3.5" /> Đăng tin
                    </button>
                  )}
                </div>

                {announcements.length === 0 ? (
                  <div className="p-8 text-center text-slate-400">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-xs">Chưa có thông báo nào.</p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {announcements.map((ann) => (
                      <div
                        key={ann.announcementId}
                        className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-900 dark:text-white">{ann.title}</span>
                          {ann.pinned && <Pin className="w-3 h-3 text-indigo-600 fill-indigo-600" />}
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{ann.content}</p>
                        <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800 flex justify-between">
                          <span>{ann.authorName}</span>
                          <span>{new Date(ann.createdAt).toLocaleDateString('vi-VN')}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ==================== SETTINGS SUBTAB ==================== */}
            {rightTab === 'settings' && canManageRoom && (
              <form onSubmit={handleSaveSettings} className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Cài đặt phòng làm việc
                </h3>

                {settingsSuccess && (
                  <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-medium">
                    Đã lưu cài đặt thành công!
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Chế độ Chat</label>
                  <select
                    value={settingsForm.chatMode || 'ALL_MEMBERS'}
                    onChange={(e) => setSettingsForm({ ...settingsForm, chatMode: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-xs"
                  >
                    <option value="ALL_MEMBERS">Mọi thành viên đều được nhắn tin</option>
                    <option value="LEADER_ONLY">Chỉ Leader và Mentor được nhắn tin</option>
                    <option value="MENTOR_ONLY">Chỉ Mentor được thông báo</option>
                    <option value="MUTED">Tạm khóa chat cả nhóm</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Chế độ Nộp bài</label>
                  <select
                    value={settingsForm.submissionMode || 'ANY_MEMBER'}
                    onChange={(e) => setSettingsForm({ ...settingsForm, submissionMode: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-xs"
                  >
                    <option value="ANY_MEMBER">Bất kỳ thành viên nào cũng có thể nộp bài</option>
                    <option value="LEADER_ONLY">Chỉ Leader mới được nộp bài</option>
                    <option value="MENTOR_ONLY">Chỉ Mentor tải bài nộp lên</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Chế độ Tạo Task</label>
                  <select
                    value={settingsForm.taskCreateMode || 'MENTOR_AND_LEADER'}
                    onChange={(e) => setSettingsForm({ ...settingsForm, taskCreateMode: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-xs"
                  >
                    <option value="MENTOR_AND_LEADER">Mentor và Leader được tạo task</option>
                    <option value="MENTOR_ONLY">Chỉ Mentor được tạo task</option>
                  </select>
                </div>

                <div className="flex items-center justify-between py-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Cho phép gửi file đính kèm</span>
                  <input
                    type="checkbox"
                    checked={Boolean(settingsForm.allowAttachments)}
                    onChange={(e) => setSettingsForm({ ...settingsForm, allowAttachments: e.target.checked })}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSavingSettings}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition shadow-xs"
                >
                  {isSavingSettings ? 'Đang lưu...' : 'Lưu cài đặt'}
                </button>
              </form>
            )}
          </div>
        </div>
        )}
      </div>

      {/* ==================== MODALS ==================== */}

      {/* CREATE TASK MODAL */}
      {isCreateTaskOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl p-6 shadow-xl border border-slate-200 dark:border-slate-800">
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">Giao nhiệm vụ mới cho nhóm</h2>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Tiêu đề task *</label>
                <input
                  type="text"
                  required
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="Ví dụ: Thiết kế Database schema cho Phase 1"
                  className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Mô tả chi tiết</label>
                <textarea
                  rows={3}
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  placeholder="Chi tiết yêu cầu, link tham khảo, tiêu chí hoàn thành..."
                  className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Độ ưu tiên</label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value as GroupTaskPriority)}
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs outline-none"
                  >
                    <option value="LOW">Thấp</option>
                    <option value="MEDIUM">Trung bình</option>
                    <option value="HIGH">Cao</option>
                    <option value="URGENT">Khẩn cấp</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Hạn hoàn thành</label>
                  <input
                    type="datetime-local"
                    value={taskDeadline}
                    onChange={(e) => setTaskDeadline(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Phân công sinh viên ({taskAssignees.length} / {overview.members?.length || 0} thành viên)
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const allIds = overview.members.map((m) => m.studentId);
                        setTaskAssignees(allIds);
                        setAssignAllMembers(true);
                      }}
                      className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline font-medium cursor-pointer"
                    >
                      Chọn tất cả
                    </button>
                    <span className="text-slate-300 dark:text-slate-700">•</span>
                    <button
                      type="button"
                      onClick={() => {
                        setTaskAssignees([]);
                        setAssignAllMembers(false);
                      }}
                      className="text-[11px] text-slate-500 hover:underline font-medium cursor-pointer"
                    >
                      Bỏ chọn tất cả
                    </button>
                  </div>
                </div>

                <div className="mb-2">
                  <label className="flex items-center gap-2 text-xs text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/40 p-2 rounded-xl border border-indigo-200 dark:border-indigo-800/60 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={assignAllMembers}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setAssignAllMembers(checked);
                        if (checked) {
                          setTaskAssignees(overview.members.map((m) => m.studentId));
                        }
                      }}
                      className="rounded text-indigo-600"
                    />
                    <span className="font-semibold">Mặc định giao cho tất cả thành viên trong nhóm</span>
                  </label>
                </div>

                <div className="max-h-36 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-xl p-2 space-y-1.5 bg-slate-50/50 dark:bg-slate-900/50">
                  {overview.members.map((m) => {
                    const isSelected = taskAssignees.includes(m.studentId);
                    return (
                      <label
                        key={m.studentId}
                        className={`flex items-center justify-between p-1.5 rounded-lg text-xs cursor-pointer transition ${
                          isSelected
                            ? 'bg-indigo-50/80 dark:bg-indigo-950/50 text-indigo-900 dark:text-indigo-200 font-medium'
                            : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                const next = [...taskAssignees, m.studentId];
                                setTaskAssignees(next);
                                if (next.length === overview.members.length) setAssignAllMembers(true);
                              } else {
                                setTaskAssignees(taskAssignees.filter((id) => id !== m.studentId));
                                setAssignAllMembers(false);
                              }
                            }}
                            className="rounded text-indigo-600"
                          />
                          <span>{m.studentName}</span>
                          <span className="text-[10px] text-slate-400 font-mono">({m.studentCode})</span>
                        </div>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">
                          {m.groupRole}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateTaskOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSavingTask}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold"
                >
                  {isSavingTask ? 'Đang tạo...' : 'Tạo nhiệm vụ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUBMIT WORK MODAL */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl p-6 shadow-xl border border-slate-200 dark:border-slate-800">
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">Nộp bài tập / đồ án nhóm</h2>
            <form onSubmit={handleSubmitWork} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Hình thức nộp</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSubmissionType('GITHUB_LINK')}
                    className={`py-2 text-xs font-semibold rounded-xl border transition ${
                      submissionType === 'GITHUB_LINK'
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    GitHub Link
                  </button>
                  <button
                    type="button"
                    onClick={() => setSubmissionType('ZIP_FILE')}
                    className={`py-2 text-xs font-semibold rounded-xl border transition ${
                      submissionType === 'ZIP_FILE'
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    Tải file ZIP
                  </button>
                </div>
              </div>

              {submissionType === 'GITHUB_LINK' ? (
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">GitHub Repository URL *</label>
                  <input
                    type="url"
                    required
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    placeholder="https://github.com/org/repo"
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs outline-none"
                  />
                </div>
              ) : (
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">File nộp bài (.ZIP) *</label>
                  <input
                    type="file"
                    accept=".zip"
                    required
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setSubmissionZipFile(e.target.files[0]);
                      }
                    }}
                    className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Hỗ trợ định dạng .zip, tối đa 100MB</p>
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Gắn với nhiệm vụ (Tùy chọn)</label>
                <select
                  value={submissionTaskId || ''}
                  onChange={(e) => setSubmissionTaskId(e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs outline-none"
                >
                  <option value="">-- Nộp bài chung cho nhóm --</option>
                  {tasks.map((t) => (
                    <option key={t.taskId} value={t.taskId}>{t.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Ghi chú bài nộp</label>
                <textarea
                  rows={2}
                  value={submissionNote}
                  onChange={(e) => setSubmissionNote(e.target.value)}
                  placeholder="Ghi chú về tính năng, thành viên đóng góp..."
                  className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSubmitModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingWork}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold"
                >
                  {isSubmittingWork ? 'Đang nộp...' : 'Xác nhận nộp bài'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REVIEW & SCORE MODAL (MENTOR) */}
      {reviewSubmissionId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl p-6 shadow-xl border border-slate-200 dark:border-slate-800">
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">Chấm điểm & Nhận xét bài nộp nhóm</h2>
            <form onSubmit={handleReviewSubmission} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Điểm số (Thang điểm 10) *</label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  required
                  value={reviewScore}
                  onChange={(e) => setReviewScore(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs outline-none font-bold text-indigo-600"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Nhận xét chi tiết</label>
                <textarea
                  rows={4}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Đánh giá chất lượng code, giao diện, hoàn thành đúng hạn..."
                  className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewSubmissionId(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold"
                >
                  {isSubmittingReview ? 'Đang lưu...' : 'Lưu đánh giá'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE ANNOUNCEMENT MODAL */}
      {isCreateAnnounceOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl p-6 shadow-xl border border-slate-200 dark:border-slate-800">
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">Đăng thông báo phòng</h2>
            <form onSubmit={handleCreateAnnouncement} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Tiêu đề *</label>
                <input
                  type="text"
                  required
                  value={announceTitle}
                  onChange={(e) => setAnnounceTitle(e.target.value)}
                  placeholder="Ví dụ: Lịch họp Sprint Review thứ Sáu"
                  className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Nội dung *</label>
                <textarea
                  rows={4}
                  required
                  value={announceContent}
                  onChange={(e) => setAnnounceContent(e.target.value)}
                  placeholder="Nội dung thông báo..."
                  className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs outline-none"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Mức độ</label>
                  <select
                    value={announcePriority}
                    onChange={(e) => setAnnouncePriority(e.target.value as any)}
                    className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs outline-none"
                  >
                    <option value="NORMAL">Bình thường</option>
                    <option value="IMPORTANT">Quan trọng</option>
                    <option value="URGENT">Khẩn cấp</option>
                  </select>
                </div>
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer pt-4">
                  <input
                    type="checkbox"
                    checked={announcePinned}
                    onChange={(e) => setAnnouncePinned(e.target.checked)}
                    className="rounded text-indigo-600"
                  />
                  <span>Ghim lên đầu phòng</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateAnnounceOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold"
                >
                  Đăng thông báo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MUTE MEMBER MODAL */}
      {muteStudentId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-xs rounded-2xl p-6 shadow-xl border border-slate-200 dark:border-slate-800">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Khóa chat thành viên</h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Thời gian khóa (phút)</label>
                <select
                  value={muteMinutes}
                  onChange={(e) => setMuteMinutes(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs"
                >
                  <option value={15}>15 phút</option>
                  <option value={30}>30 phút</option>
                  <option value={60}>1 giờ</option>
                  <option value={1440}>24 giờ</option>
                  <option value={0}>Vĩnh viễn đến khi mở lại</option>
                </select>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setMuteStudentId(null)}
                  className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold"
                >
                  Hủy
                </button>
                <button
                  onClick={handleMuteMember}
                  className="px-4 py-1.5 bg-rose-600 text-white rounded-xl text-xs font-semibold"
                >
                  Khóa chat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
