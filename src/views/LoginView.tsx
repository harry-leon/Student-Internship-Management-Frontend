import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../api/authService';
import { NavPage } from '../types';
import {
  LogIn,
  User,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  Server,
  AlertCircle,
  CheckCircle2,
  GraduationCap,
  Sparkles,
  ArrowRight,
  Briefcase,
  Users,
  Award,
} from 'lucide-react';

interface LoginViewProps {
  onSuccessNavigate: (page: NavPage) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onSuccessNavigate }) => {
  const { login, isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleQuickFill = (accUser: string, accPass: string) => {
    setUsername(accUser);
    setPassword(accPass);
    setError(null);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Vui lòng nhập tên đăng nhập');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      await login({ username, password });
      setSuccessMsg('Đăng nhập thành công! Đang chuyển hướng vào hệ thống...');
      setTimeout(() => {
        onSuccessNavigate('dashboard');
      }, 800);
    } catch (err: any) {
      setError(
        err.message ||
          'Đăng nhập không thành công. Vui lòng kiểm tra lại tên đăng nhập hoặc mật khẩu.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070d19] text-white flex items-center justify-center p-4 sm:p-6 lg:p-10 relative overflow-hidden font-sans">
      {/* Background Decorative Gradients & Glow Blobs */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/30 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 -right-40 w-96 h-96 bg-blue-600/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-purple-600/20 rounded-full blur-[130px] pointer-events-none" />

      {/* Grid Pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Main Glassmorphism Container */}
      <div className="w-full max-w-5xl bg-slate-900/80 backdrop-blur-2xl border border-slate-800/80 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] grid grid-cols-1 lg:grid-cols-12 overflow-hidden z-10">
        
        {/* Left Side: Branding Hero Banner (5 cols) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-indigo-900/60 via-slate-900 to-slate-950 p-8 sm:p-10 flex flex-col justify-between relative border-b lg:border-b-0 lg:border-r border-slate-800/80">
          <div className="space-y-6">
            {/* Logo Brand */}
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 border border-indigo-400/30">
                <GraduationCap className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-indigo-200">
                  IMS Portal
                </h1>
                <p className="text-xs text-indigo-300 font-medium tracking-wide">
                  INTERNSHIP MANAGEMENT SYSTEM
                </p>
              </div>
            </div>

            {/* Title & Description */}
            <div className="pt-4 space-y-3">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Spring Boot REST API Integrated</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold leading-tight text-white">
                Hệ Thống Quản Lý <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-blue-400 to-cyan-300">
                  Thực Tập Doanh Nghiệp
                </span>
              </h2>
              <p className="text-sm text-slate-400 leading-relaxed">
                Nền tảng kết nối Doanh nghiệp, Giảng viên Hướng dẫn & Sinh viên thực tập toàn diện, minh bạch và tối ưu quy trình đánh giá.
              </p>
            </div>

            {/* Quick Stats Badges */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 bg-slate-800/40 border border-slate-700/50 rounded-2xl flex items-center space-x-3">
                <Users className="w-5 h-5 text-indigo-400" />
                <div>
                  <div className="text-sm font-bold text-white">500+</div>
                  <div className="text-[11px] text-slate-400">Sinh viên</div>
                </div>
              </div>

              <div className="p-3 bg-slate-800/40 border border-slate-700/50 rounded-2xl flex items-center space-x-3">
                <Briefcase className="w-5 h-5 text-blue-400" />
                <div>
                  <div className="text-sm font-bold text-white">50+</div>
                  <div className="text-[11px] text-slate-400">Doanh nghiệp</div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Footer Quote */}
          <div className="pt-8 border-t border-slate-800/60 mt-8 text-xs text-slate-400 flex items-center justify-between">
            <span className="flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>JWT Authentication Secures</span>
            </span>
            <span className="text-slate-500">v2.0 Spring 2026</span>
          </div>
        </div>

        {/* Right Side: Interactive Login Form (7 cols) */}
        <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-center bg-slate-900/60 backdrop-blur-md">
          {/* Top Status Bar */}
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-xl font-bold text-white">Đăng Nhập Hệ Thống</h3>
              <p className="text-xs text-slate-400 mt-0.5">Nhập tài khoản để xác thực với Backend API</p>
            </div>
            <div className="flex items-center space-x-2 bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-700 text-xs">
              <Server className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-slate-300">API Port:</span>
              <span className="font-mono text-emerald-400 font-bold">8080</span>
            </div>
          </div>

          {/* If Already Logged In Banner */}
          {isAuthenticated && user ? (
            <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-2xl p-6 mb-6 space-y-4">
              <div className="flex items-center space-x-3 text-emerald-400">
                <CheckCircle2 className="w-6 h-6 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-base text-white">Bạn đang đăng nhập với tư cách:</h4>
                  <p className="text-sm text-emerald-300 font-medium">{user.fullName || user.username} ({user.role})</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => onSuccessNavigate('dashboard')}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-emerald-600/30 flex items-center space-x-2"
                >
                  <span>Vào Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="px-4 py-2.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 text-sm font-medium rounded-xl transition-all"
                >
                  Đăng xuất Token
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Alert Error Messages */}
              {error && (
                <div className="flex items-start space-x-3 bg-red-950/60 border border-red-500/40 text-red-300 rounded-2xl p-4 text-sm animate-fade-in">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-red-200">Xác thực không thành công</p>
                    <p className="text-xs text-red-300/90 mt-0.5">{error}</p>
                  </div>
                </div>
              )}

              {/* Alert Success Messages */}
              {successMsg && (
                <div className="flex items-center space-x-3 bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 rounded-2xl p-4 text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <p className="font-semibold">{successMsg}</p>
                </div>
              )}

              {/* Username Field */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                  Tên Đăng Nhập (Username)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Nhập username (VD: admin, mentor1, student1)..."
                    className="w-full pl-11 pr-4 py-3 bg-slate-950/80 border border-slate-700/80 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm transition-all"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Mật Khẩu (Password)
                  </label>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      alert('Vui lòng liên hệ Quản trị viên hệ thống để khôi phục mật khẩu.');
                    }}
                    className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    Quên mật khẩu?
                  </a>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mật khẩu của bạn..."
                    className="w-full pl-11 pr-11 py-3 bg-slate-950/80 border border-slate-700/80 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-indigo-500/30"
                  />
                  <span className="text-xs text-slate-300">Duy trì đăng nhập trên thiết bị này</span>
                </label>
              </div>

              {/* Quick Preset Buttons for Fast Demo Testing */}
              <div className="pt-2">
                <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold mb-2">
                  Tài khoản dùng thử nhanh (Quick Test):
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickFill('admin', 'admin123')}
                    className="px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs rounded-xl transition-all"
                  >
                    Admin: <span className="font-semibold">admin</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickFill('mentor1', 'mentor123')}
                    className="px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs rounded-xl transition-all"
                  >
                    Mentor: <span className="font-semibold">mentor1</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickFill('student1', 'student123')}
                    className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs rounded-xl transition-all"
                  >
                    Student: <span className="font-semibold">student1</span>
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2 space-y-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-semibold text-sm rounded-2xl shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/50 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Đang kết nối API Backend...</span>
                    </div>
                  ) : (
                    <>
                      <LogIn className="w-5 h-5" />
                      <span>Đăng Nhập Lấy Token</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const apiBase = import.meta.env.VITE_API_BASE_URL || '';
                    window.location.href = `${apiBase}/oauth2/authorization/google`;
                  }}
                  className="w-full py-3 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-white font-semibold text-sm rounded-2xl transition-all flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.15C3.26 21.3 7.31 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.61H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.39l3.99-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.61l3.99 3.15c.95-2.85 3.6-4.96 6.72-4.96z"
                    />
                  </svg>
                  <span>Đăng Nhập Bằng Google OAuth</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
