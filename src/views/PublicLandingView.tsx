import React from 'react';
import { NavPage } from '../types';
import {
  ArrowRight,
  Award,
  BadgeCheck,
  BookOpenCheck,
  Building2,
  CalendarRange,
  CheckCircle2,
  ClipboardList,
  Layers3,
  LogIn,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface PublicLandingViewProps {
  onNavigate: (page: NavPage) => void;
  onOpenLogin: () => void;
}

const highlights = [
  {
    value: '01',
    title: 'Một nơi cho toàn bộ quy trình',
    description:
      'Tập trung đợt thực tập, mentor, sinh viên, tiến độ và đánh giá trong cùng một màn hình vận hành.',
  },
  {
    value: '02',
    title: 'Theo dõi rõ từng tuần',
    description:
      'Giao việc, cập nhật báo cáo, chốt nhận xét và phát hiện điểm nghẽn trước khi tiến độ bị trễ.',
  },
  {
    value: '03',
    title: 'Đánh giá nhất quán',
    description:
      'Chuẩn hóa rubric, vòng đánh giá và kết quả cuối kỳ để giảm cảm tính khi chấm thực tập.',
  },
];

const capabilities = [
  {
    icon: ClipboardList,
    title: 'Điều phối đợt thực tập',
    description:
      'Mở đợt, đặt mốc thời gian, quản lý chỉ tiêu và gắn mentor theo từng nhóm sinh viên.',
  },
  {
    icon: BookOpenCheck,
    title: 'Quản lý công việc hằng tuần',
    description:
      'Theo dõi đầu việc, báo cáo, phản hồi và trạng thái hoàn thành trong suốt chương trình.',
  },
  {
    icon: Award,
    title: 'Đánh giá và tổng hợp kết quả',
    description:
      'Thiết lập tiêu chí, tổ chức vòng chấm và xuất kết quả theo quy trình minh bạch.',
  },
];

const workflow = [
  {
    step: 'Bước 1',
    title: 'Khởi tạo đợt',
    description: 'Cấu hình mốc thời gian, mục tiêu và danh sách thực tập sinh cần tiếp nhận.',
  },
  {
    step: 'Bước 2',
    title: 'Phân công mentor',
    description: 'Giao người hướng dẫn, đề tài và phạm vi công việc theo từng nhóm phù hợp.',
  },
  {
    step: 'Bước 3',
    title: 'Theo dõi tiến độ',
    description: 'Thu báo cáo tuần, nhận xét trực tiếp và xử lý sớm các trường hợp chậm tiến độ.',
  },
  {
    step: 'Bước 4',
    title: 'Đánh giá cuối kỳ',
    description: 'Tổng hợp rubric, nhận xét, kết quả vòng chấm và dữ liệu phục vụ quyết định tuyển dụng.',
  },
];

const trustPoints = [
  'Theo dõi tiến độ theo tuần',
  'Chuẩn hóa tiêu chí đánh giá',
  'Phân quyền theo vai trò',
  'Sẵn sàng mở rộng cho nhiều đợt thực tập',
];

export const PublicLandingView: React.FC<PublicLandingViewProps> = ({
  onNavigate,
  onOpenLogin,
}) => {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[var(--landing-ink)] text-[var(--landing-paper)]">
      <div className="landing-radial landing-radial-left" />
      <div className="landing-radial landing-radial-right" />
      <div className="landing-grid pointer-events-none absolute inset-0 opacity-60" />

      <header className="sticky top-0 z-50 border-b border-white/10 bg-[rgba(8,17,28,0.72)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-8">
          <button
            type="button"
            onClick={() => onNavigate('landing')}
            className="flex items-center gap-3 text-left"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/15 bg-white/8 shadow-[0_18px_45px_rgba(24,144,255,0.18)]">
              <Building2 className="h-6 w-6 text-[var(--landing-accent)]" />
            </div>
            <div>
              <p className="font-display text-lg font-semibold tracking-[0.08em] text-white">
                IMS PLATFORM
              </p>
              <p className="text-xs uppercase tracking-[0.24em] text-white/55">
                Internship Operations
              </p>
            </div>
          </button>

          <nav className="hidden items-center gap-8 text-sm text-white/72 md:flex">
            <a href="#overview" className="transition hover:text-white">
              Tổng quan
            </a>
            <a href="#capabilities" className="transition hover:text-white">
              Năng lực hệ thống
            </a>
            <a href="#workflow" className="transition hover:text-white">
              Quy trình
            </a>
            <a href="#security" className="transition hover:text-white">
              Bảo mật
            </a>
          </nav>

          {isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => onNavigate('dashboard')}
                className="inline-flex items-center gap-2 rounded-full bg-[var(--landing-accent)] px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-[var(--landing-accent-soft)]"
              >
                Vào hệ thống
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={logout}
                className="rounded-full border border-white/14 px-4 py-3 text-sm font-medium text-white/72 transition hover:border-white/24 hover:text-white"
              >
                Đăng xuất
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenLogin}
              className="inline-flex items-center gap-2 rounded-full border border-[var(--landing-accent)]/30 bg-[var(--landing-accent)] px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-[var(--landing-accent-soft)]"
            >
              <LogIn className="h-4 w-4" />
              Đăng nhập
            </button>
          )}
        </div>
      </header>

      <main>
        <section
          id="overview"
          className="mx-auto grid max-w-7xl gap-12 px-4 pb-18 pt-10 sm:px-8 sm:pb-24 sm:pt-16 lg:grid-cols-[1.15fr_0.85fr] lg:items-end"
        >
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/6 px-4 py-2 text-sm text-[var(--landing-accent)] backdrop-blur">
              <Sparkles className="h-4 w-4" />
              Nền tảng quản lý thực tập dành cho doanh nghiệp và mentor
            </div>

            <div className="space-y-5">
              <h1 className="font-display max-w-4xl text-4xl font-semibold leading-[1.02] text-white sm:text-6xl lg:text-7xl">
                Biến public page từ phần giới thiệu thành một màn chào có chủ đích.
              </h1>
              <p className="max-w-2xl text-base leading-8 text-white/72 sm:text-lg">
                Trang này giới thiệu rõ hệ thống đang giúp doanh nghiệp làm gì: mở đợt thực tập,
                phân công mentor, theo dõi tiến độ theo tuần và chốt đánh giá cuối kỳ bằng một
                luồng vận hành nhất quán.
              </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row">
              {isAuthenticated ? (
                <button
                  type="button"
                  onClick={() => onNavigate('dashboard')}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--landing-accent)] px-7 py-4 text-base font-semibold text-slate-950 transition hover:bg-[var(--landing-accent-soft)]"
                >
                  Mở dashboard
                  <ArrowRight className="h-5 w-5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onOpenLogin}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--landing-accent)] px-7 py-4 text-base font-semibold text-slate-950 transition hover:bg-[var(--landing-accent-soft)]"
                >
                  <LogIn className="h-5 w-5" />
                  Đăng nhập cho quản trị viên và mentor
                </button>
              )}

              <a
                href="#capabilities"
                className="inline-flex items-center justify-center rounded-full border border-white/14 px-7 py-4 text-base font-medium text-white/78 transition hover:border-white/24 hover:text-white"
              >
                Xem năng lực hệ thống
              </a>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {trustPoints.map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-white/74 backdrop-blur"
                >
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-300" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 rounded-[2rem] bg-[linear-gradient(135deg,rgba(255,255,255,0.06),rgba(255,255,255,0.01))]" />
            <div className="relative overflow-hidden rounded-[2rem] border border-white/12 bg-[rgba(255,255,255,0.06)] p-6 shadow-[0_32px_120px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-8">
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.28em] text-white/45">Snapshot</p>
                  <h2 className="mt-2 font-display text-2xl text-white">Vận hành thực tập gọn hơn</h2>
                </div>
                <div className="rounded-full border border-emerald-300/25 bg-emerald-300/10 px-3 py-1 text-xs font-semibold text-emerald-200">
                  Live process
                </div>
              </div>

              <div className="space-y-4">
                {highlights.map((item) => (
                  <div
                    key={item.value}
                    className="rounded-3xl border border-white/10 bg-[rgba(10,20,34,0.58)] p-5"
                  >
                    <div className="mb-3 flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--landing-accent)] text-sm font-bold text-slate-950">
                        {item.value}
                      </div>
                      <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                    </div>
                    <p className="text-sm leading-7 text-white/68">{item.description}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <div className="rounded-3xl border border-white/10 bg-black/16 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/45">Role</p>
                  <p className="mt-2 text-lg font-semibold text-white">Admin</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-black/16 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/45">Flow</p>
                  <p className="mt-2 text-lg font-semibold text-white">Mentor</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-black/16 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/45">Output</p>
                  <p className="mt-2 text-lg font-semibold text-white">Evaluation</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="capabilities" className="border-t border-white/10">
          <div className="mx-auto max-w-7xl px-4 py-18 sm:px-8 sm:py-24">
            <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl space-y-3">
                <p className="text-sm uppercase tracking-[0.28em] text-[var(--landing-accent)]">
                  Năng lực cốt lõi
                </p>
                <h2 className="font-display text-3xl font-semibold text-white sm:text-5xl">
                  Bố cục mới tập trung vào giá trị vận hành, không chỉ là mô tả tính năng.
                </h2>
              </div>
              <p className="max-w-xl text-sm leading-7 text-white/64 sm:text-base">
                Mỗi khối nội dung đều trả lời một câu hỏi cụ thể: hệ thống hỗ trợ ai, giúp giảm tải
                bước nào và kiểm soát chất lượng ra sao.
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              {capabilities.map(({ icon: Icon, title, description }) => (
                <article
                  key={title}
                  className="rounded-[2rem] border border-white/10 bg-white/6 p-8 backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-[var(--landing-accent)]/40"
                >
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--landing-accent)]/12 text-[var(--landing-accent)]">
                    <Icon className="h-7 w-7" />
                  </div>
                  <h3 className="text-2xl font-semibold text-white">{title}</h3>
                  <p className="mt-4 text-sm leading-7 text-white/66">{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="workflow" className="border-t border-white/10">
          <div className="mx-auto max-w-7xl px-4 py-18 sm:px-8 sm:py-24">
            <div className="mb-12 max-w-3xl space-y-3">
              <p className="text-sm uppercase tracking-[0.28em] text-[var(--landing-accent)]">
                Quy trình 4 bước
              </p>
              <h2 className="font-display text-3xl font-semibold text-white sm:text-5xl">
                Một luồng đủ rõ để doanh nghiệp nhìn thấy cách hệ thống được dùng trong thực tế.
              </h2>
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {workflow.map((item) => (
                <article
                  key={item.step}
                  className="rounded-[2rem] border border-white/10 bg-[rgba(255,255,255,0.04)] p-6"
                >
                  <div className="mb-5 flex items-center justify-between">
                    <span className="rounded-full border border-white/12 bg-white/6 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-white/72">
                      {item.step}
                    </span>
                    <Target className="h-5 w-5 text-[var(--landing-accent)]" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-white/64">{item.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="security" className="border-t border-white/10">
          <div className="mx-auto max-w-7xl px-4 py-18 sm:px-8 sm:py-24">
            <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="rounded-[2rem] border border-white/10 bg-[rgba(255,255,255,0.05)] p-8">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-[var(--landing-accent)]/14 text-[var(--landing-accent)]">
                  <ShieldCheck className="h-8 w-8" />
                </div>
                <p className="text-sm uppercase tracking-[0.28em] text-[var(--landing-accent)]">
                  Trust & control
                </p>
                <h2 className="mt-3 font-display text-3xl font-semibold text-white">
                  Bảo mật và phân quyền là phần của trải nghiệm, không phải một ghi chú phụ.
                </h2>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="rounded-[2rem] border border-white/10 bg-white/6 p-6">
                  <Users className="h-7 w-7 text-[var(--landing-accent)]" />
                  <h3 className="mt-5 text-xl font-semibold text-white">Theo vai trò</h3>
                  <p className="mt-3 text-sm leading-7 text-white/66">
                    Admin, mentor và sinh viên nhìn thấy đúng phần việc của mình để giảm sai lệch khi vận hành.
                  </p>
                </div>
                <div className="rounded-[2rem] border border-white/10 bg-white/6 p-6">
                  <Layers3 className="h-7 w-7 text-[var(--landing-accent)]" />
                  <h3 className="mt-5 text-xl font-semibold text-white">Theo từng đợt</h3>
                  <p className="mt-3 text-sm leading-7 text-white/66">
                    Dữ liệu được tổ chức theo phase và vòng đánh giá để dễ truy vết, tổng hợp và đối chiếu.
                  </p>
                </div>
                <div className="rounded-[2rem] border border-white/10 bg-white/6 p-6">
                  <CalendarRange className="h-7 w-7 text-[var(--landing-accent)]" />
                  <h3 className="mt-5 text-xl font-semibold text-white">Theo mốc thời gian</h3>
                  <p className="mt-3 text-sm leading-7 text-white/66">
                    Các mốc theo tuần và cuối kỳ giúp bộ phận quản lý bám đúng tiến độ của toàn chương trình.
                  </p>
                </div>
                <div className="rounded-[2rem] border border-white/10 bg-white/6 p-6">
                  <BadgeCheck className="h-7 w-7 text-[var(--landing-accent)]" />
                  <h3 className="mt-5 text-xl font-semibold text-white">Theo chuẩn đánh giá</h3>
                  <p className="mt-3 text-sm leading-7 text-white/66">
                    Tiêu chí và kết quả được lưu đồng nhất, phù hợp cho tổng hợp báo cáo và đối chiếu chất lượng.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-white/10">
          <div className="mx-auto max-w-6xl px-4 py-18 sm:px-8 sm:py-24">
            <div className="rounded-[2.5rem] border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-8 text-center shadow-[0_30px_80px_rgba(0,0,0,0.22)] backdrop-blur sm:p-12">
              <div className="mx-auto max-w-3xl space-y-4">
                <p className="text-sm uppercase tracking-[0.28em] text-[var(--landing-accent)]">
                  Call to action
                </p>
                <h2 className="font-display text-3xl font-semibold text-white sm:text-5xl">
                  Nếu public page cần tạo cảm giác sản phẩm thật, phần này đã đi đúng hướng.
                </h2>
                <p className="text-sm leading-7 text-white/68 sm:text-base">
                  Giao diện mới nhấn vào nhịp vận hành, mức độ tin cậy và vai trò người dùng thay vì xếp các card tính năng theo kiểu chung chung.
                </p>
              </div>

              <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                {isAuthenticated ? (
                  <button
                    type="button"
                    onClick={() => onNavigate('dashboard')}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--landing-accent)] px-8 py-4 text-base font-semibold text-slate-950 transition hover:bg-[var(--landing-accent-soft)]"
                  >
                    Vào dashboard
                    <ArrowRight className="h-5 w-5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={onOpenLogin}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--landing-accent)] px-8 py-4 text-base font-semibold text-slate-950 transition hover:bg-[var(--landing-accent-soft)]"
                  >
                    <LogIn className="h-5 w-5" />
                    Đăng nhập để bắt đầu
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 px-4 py-8 text-center text-sm text-white/42 sm:px-8">
        <p>© 2026 Internship Management System. Public landing page redesigned for a clearer first impression.</p>
      </footer>
    </div>
  );
};
