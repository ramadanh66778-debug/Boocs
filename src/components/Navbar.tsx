import React from 'react';
import {
  BookOpen,
  GraduationCap,
  FileCheck2,
  HelpCircle,
  Heart,
  LogIn,
  LogOut,
  User,
  Sparkles,
  Headphones,
  Sun,
  Moon,
  Video,
  ShieldCheck,
  MessageSquare
} from 'lucide-react';
import { StudentUser } from '../data/initialData';

interface NavbarProps {
  currentTab: 'books' | 'videos' | 'evaluations' | 'exams' | 'quran' | 'favorites' | 'teacher' | 'profile' | 'forum';
  setCurrentTab: (tab: 'books' | 'videos' | 'evaluations' | 'exams' | 'quran' | 'favorites' | 'teacher' | 'profile' | 'forum') => void;
  studentUser: StudentUser | null;
  onLoginClick: () => void;
  onLogoutClick: () => void;
  onSupportClick?: () => void;
  favoritesCount: number;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
  isTeacherAuthenticated?: boolean;
  teacherProfile?: { name: string; email: string; photoURL?: string } | null;
  onTeacherLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  studentUser,
  onLoginClick,
  onLogoutClick,
  onSupportClick,
  favoritesCount,
  theme = 'dark',
  onToggleTheme,
  isTeacherAuthenticated = false,
  teacherProfile,
  onTeacherLogout
}) => {
  const isDark = theme === 'dark';
  const canAccessAdmin = isTeacherAuthenticated || studentUser?.role === 'admin' || studentUser?.role === 'owner';

  return (
    <header
      className={`sticky top-0 z-50 backdrop-blur-md border-b transition-colors ${
        isDark
          ? 'bg-slate-900/95 border-slate-800 text-slate-100'
          : 'bg-white/95 border-slate-200 text-slate-900 shadow-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between min-h-[4.25rem] py-2 gap-2 sm:gap-4">
          {/* Logo */}
          <button
            onClick={() => setCurrentTab('books')}
            className="flex items-center gap-2 sm:gap-3 text-right group cursor-pointer focus:outline-none shrink-0"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-amber-500 via-indigo-600 to-indigo-800 flex items-center justify-center shadow-lg shadow-indigo-600/25 group-hover:scale-105 transition-transform shrink-0">
              <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span
                  className={`font-black text-sm sm:text-base md:text-lg group-hover:text-indigo-500 transition-colors truncate ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  المكتبة التعليمية الشاملة
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/30 whitespace-nowrap hidden xs:inline-block">
                  تانية بكالوريا
                </span>
              </div>
              <p className={`text-[11px] hidden sm:block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                كتب الوزارة • الفيديوهات والشروحات • التقييمات • الامتحانات
              </p>
            </div>
          </button>

          {/* Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-1 text-sm font-medium">
            <button
              onClick={() => setCurrentTab('books')}
              className={`px-3 py-2 rounded-xl flex items-center gap-2 transition-colors cursor-pointer ${
                currentTab === 'books'
                  ? 'bg-indigo-600/20 text-indigo-500 border border-indigo-500/30 font-bold'
                  : isDark
                  ? 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>المكتبة والكتب</span>
            </button>

            <button
              onClick={() => setCurrentTab('videos')}
              className={`px-3 py-2 rounded-xl flex items-center gap-2 transition-colors cursor-pointer ${
                currentTab === 'videos'
                  ? 'bg-indigo-600/20 text-indigo-500 border border-indigo-500/30 font-bold'
                  : isDark
                  ? 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Video className="w-4 h-4 text-purple-400" />
              <span>الفيديوهات والشروحات</span>
            </button>

            <button
              onClick={() => setCurrentTab('evaluations')}
              className={`px-3 py-2 rounded-xl flex items-center gap-2 transition-colors cursor-pointer ${
                currentTab === 'evaluations'
                  ? 'bg-indigo-600/20 text-indigo-500 border border-indigo-500/30 font-bold'
                  : isDark
                  ? 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <FileCheck2 className="w-4 h-4" />
              <span>التقييمات والواجبات</span>
            </button>

            <button
              onClick={() => setCurrentTab('exams')}
              className={`px-3 py-2 rounded-xl flex items-center gap-2 transition-colors cursor-pointer ${
                currentTab === 'exams'
                  ? 'bg-indigo-600/20 text-indigo-500 border border-indigo-500/30 font-bold'
                  : isDark
                  ? 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              <span>الاختبارات</span>
            </button>

            <button
              onClick={() => setCurrentTab('favorites')}
              className={`px-3 py-2 rounded-xl flex items-center gap-2 transition-colors relative cursor-pointer ${
                currentTab === 'favorites'
                  ? 'bg-indigo-600/20 text-indigo-500 border border-indigo-500/30 font-bold'
                  : isDark
                  ? 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Heart className="w-4 h-4 text-rose-500" />
              <span>المفضلة</span>
              {favoritesCount > 0 && (
                <span className="text-[10px] bg-rose-500 text-white font-bold px-1.5 py-0.2 rounded-full">
                  {favoritesCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setCurrentTab('quran')}
              className={`px-3 py-2 rounded-xl flex items-center gap-2 transition-colors cursor-pointer ${
                currentTab === 'quran'
                  ? 'bg-indigo-600/20 text-indigo-500 border border-indigo-500/30 font-bold'
                  : isDark
                  ? 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Sparkles className="w-4 h-4 text-emerald-500" />
              <span>القرآن الكريم</span>
            </button>

            {studentUser && (
              <button
                onClick={() => setCurrentTab('profile')}
                className={`px-3 py-2 rounded-xl flex items-center gap-2 transition-colors cursor-pointer ${
                  currentTab === 'profile'
                    ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30'
                    : isDark
                    ? 'text-amber-300 hover:text-white hover:bg-slate-800/60'
                    : 'text-indigo-700 hover:text-indigo-900 hover:bg-indigo-50'
                }`}
                title="الملف الشخصي وحساب الطالب والإحصائيات"
              >
                <User className="w-4 h-4 text-amber-400" />
                <span>حسابي وإحصائياتي</span>
              </button>
            )}

            {onSupportClick && (
              <button
                onClick={onSupportClick}
                className={`px-3 py-2 rounded-xl flex items-center gap-2 transition-colors cursor-pointer ${
                  isDark
                    ? 'text-cyan-400 hover:text-white hover:bg-slate-800/60'
                    : 'text-cyan-700 hover:text-cyan-900 hover:bg-cyan-50'
                }`}
                title="الدعم الفني وخدمة الطلاب"
              >
                <Headphones className="w-4 h-4 text-cyan-500" />
                <span>الدعم الفني</span>
              </button>
            )}
          </nav>

          {/* User, Theme Toggle & Teacher Dashboard (STRICTLY HIDDEN UNLESS AUTHENTICATED) */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Theme Toggle (Day / Night) */}
            {onToggleTheme && (
              <button
                onClick={onToggleTheme}
                className={`p-2 sm:p-2.5 rounded-xl border transition-all cursor-pointer ${
                  isDark
                    ? 'bg-slate-800/80 border-slate-700 text-amber-400 hover:bg-slate-700'
                    : 'bg-slate-100 border-slate-200 text-indigo-600 hover:bg-slate-200'
                }`}
                title={isDark ? 'التبديل إلى الوضع النهاري' : 'التبديل إلى الوضع الليلي'}
                aria-label="تبديل المظهر"
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            )}

            {/* TEACHER DASHBOARD: ONLY RENDERED IF isTeacherAuthenticated IS TRUE */}
            {isTeacherAuthenticated && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentTab('teacher')}
                  className={`px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    currentTab === 'teacher'
                      ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/25 ring-2 ring-amber-400'
                      : isDark
                      ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40'
                      : 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300'
                  }`}
                  title="لوحة تحكم المعلم المشرف (الأستاذ محمد رمضان)"
                >
                  <ShieldCheck className="w-4 h-4 text-amber-500 shrink-0" />
                  <span className="hidden sm:inline">لوحة المعلم (محمد رمضان) 👑</span>
                  <span className="sm:hidden">المعلم 👑</span>
                </button>

                {onTeacherLogout && (
                  <button
                    onClick={onTeacherLogout}
                    className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    title="تسجيل خروج المعلم"
                    aria-label="تسجيل خروج المعلم"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}

            {/* Student Account Badge or Login */}
            {studentUser ? (
              <div
                className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl border transition-all ${
                  currentTab === 'profile'
                    ? 'bg-indigo-600/20 border-indigo-500/50 ring-2 ring-indigo-500/30'
                    : isDark
                    ? 'bg-slate-800/80 border-slate-700 hover:border-slate-600'
                    : 'bg-slate-100 border-slate-200 hover:border-slate-300'
                }`}
              >
                <button
                  onClick={() => setCurrentTab('profile')}
                  className="flex items-center gap-1.5 sm:gap-2 cursor-pointer text-right group"
                  title="عرض بيانات حسابي وإحصائياتي"
                >
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-indigo-600 group-hover:bg-indigo-500 flex items-center justify-center text-xs font-bold text-white shrink-0 transition-colors">
                    <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                  <div className="hidden sm:block text-right">
                    <p
                      className={`text-xs font-semibold truncate max-w-[100px] md:max-w-[130px] group-hover:text-indigo-400 transition-colors ${
                        isDark ? 'text-white' : 'text-slate-900'
                      }`}
                    >
                      {studentUser.name}
                    </p>
                    <span
                      className={`text-[10px] flex items-center gap-1 font-mono truncate max-w-[100px] ${
                        isDark ? 'text-indigo-300' : 'text-indigo-700'
                      }`}
                      dir="ltr"
                    >
                      {studentUser.phone}
                    </span>
                  </div>
                </button>
                <button
                  onClick={onLogoutClick}
                  className="p-1 hover:text-red-500 text-slate-400 transition-colors cursor-pointer"
                  title="تسجيل الخروج"
                  aria-label="تسجيل الخروج"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : null}
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div
          className={`flex lg:hidden items-center py-2 border-t overflow-x-auto gap-1 sm:gap-1.5 text-xs no-scrollbar ${
            isDark ? 'border-slate-800/70' : 'border-slate-200'
          }`}
          style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
        >
          {studentUser && (
            <button
              onClick={() => setCurrentTab('profile')}
              className={`px-2.5 py-1.5 rounded-lg shrink-0 flex items-center gap-1 ${
                currentTab === 'profile'
                  ? 'bg-indigo-600 text-white font-bold'
                  : isDark
                  ? 'text-amber-400 hover:text-amber-300'
                  : 'text-indigo-700 hover:text-indigo-900'
              }`}
            >
              <User className="w-3.5 h-3.5 text-amber-400" />
              <span>حسابي</span>
            </button>
          )}

          <button
            onClick={() => setCurrentTab('books')}
            className={`px-2.5 py-1.5 rounded-lg shrink-0 flex items-center gap-1 ${
              currentTab === 'books'
                ? 'bg-indigo-600 text-white font-bold'
                : isDark
                ? 'text-slate-400 hover:text-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>الكتب</span>
          </button>

          <button
            onClick={() => setCurrentTab('videos')}
            className={`px-2.5 py-1.5 rounded-lg shrink-0 flex items-center gap-1 ${
              currentTab === 'videos'
                ? 'bg-indigo-600 text-white font-bold'
                : isDark
                ? 'text-slate-400 hover:text-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>الفيديوهات</span>
          </button>

          <button
            onClick={() => setCurrentTab('evaluations')}
            className={`px-2.5 py-1.5 rounded-lg shrink-0 flex items-center gap-1 ${
              currentTab === 'evaluations'
                ? 'bg-indigo-600 text-white font-bold'
                : isDark
                ? 'text-slate-400 hover:text-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileCheck2 className="w-3.5 h-3.5" />
            <span>التقييمات</span>
          </button>

          <button
            onClick={() => setCurrentTab('exams')}
            className={`px-2.5 py-1.5 rounded-lg shrink-0 flex items-center gap-1 ${
              currentTab === 'exams'
                ? 'bg-indigo-600 text-white font-bold'
                : isDark
                ? 'text-slate-400 hover:text-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>الامتحانات</span>
          </button>

          <button
            onClick={() => setCurrentTab('favorites')}
            className={`px-2.5 py-1.5 rounded-lg shrink-0 flex items-center gap-1 ${
              currentTab === 'favorites'
                ? 'bg-indigo-600 text-white font-bold'
                : isDark
                ? 'text-slate-400 hover:text-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Heart className="w-3.5 h-3.5 text-rose-500" />
            <span>المفضلة</span>
          </button>

          <button
            onClick={() => setCurrentTab('quran')}
            className={`px-2.5 py-1.5 rounded-lg shrink-0 flex items-center gap-1 ${
              currentTab === 'quran'
                ? 'bg-indigo-600 text-white font-bold'
                : isDark
                ? 'text-slate-400 hover:text-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
            <span>القرآن</span>
          </button>

          {/* Teacher button on mobile: STRICTLY HIDDEN UNLESS AUTHENTICATED */}
          {isTeacherAuthenticated && (
            <button
              onClick={() => setCurrentTab('teacher')}
              className={`px-2.5 py-1.5 rounded-lg shrink-0 flex items-center gap-1 ${
                currentTab === 'teacher'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'text-amber-500 font-semibold'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>المعلم 👑</span>
            </button>
          )}

          {onSupportClick && (
            <button
              onClick={onSupportClick}
              className="px-2.5 py-1.5 rounded-lg shrink-0 flex items-center gap-1 text-cyan-600 dark:text-cyan-400"
            >
              <Headphones className="w-3.5 h-3.5" />
              <span>الدعم</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
