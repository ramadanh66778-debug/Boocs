import React from 'react';
import {
  User,
  GraduationCap,
  Phone,
  Calendar,
  CheckCircle2,
  Clock,
  Video,
  BookOpen,
  FileText,
  Heart,
  MessageCircle,
  LogOut,
  Sparkles,
  HelpCircle,
  Play,
  Award
} from 'lucide-react';
import { StudentUser, VideoItem, StudentNote } from '../data/initialData';

interface StudentProfileViewProps {
  studentUser: StudentUser;
  videos: VideoItem[];
  savedNotes: StudentNote[];
  favoritesCount: number;
  theme?: 'dark' | 'light';
  onNavigateTab: (tab: 'books' | 'videos' | 'evaluations' | 'exams' | 'quran' | 'favorites') => void;
  onOpenSupport: () => void;
  onLogout: () => void;
}

export const StudentProfileView: React.FC<StudentProfileViewProps> = ({
  studentUser,
  videos,
  savedNotes,
  favoritesCount,
  theme = 'dark',
  onNavigateTab,
  onOpenSupport,
  onLogout
}) => {
  const isDark = theme === 'dark';
  const watchedList = studentUser.watchedVideos || [];
  const watchedVideosCount = watchedList.length;
  const totalVideosCount = videos.length || 1;
  const progressPercent = Math.min(100, Math.round((watchedVideosCount / totalVideosCount) * 100));

  // Student's personal notes
  const userNotes = savedNotes.filter((n) => n.studentPhone === studentUser.phone);

  // Watched video items
  const watchedVideoItems = videos.filter((v) => watchedList.includes(v.id));

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300" dir="rtl">
      {/* Profile Hero Header */}
      <div
        className={`relative overflow-hidden rounded-3xl border p-6 sm:p-8 shadow-2xl transition-all ${
          isDark
            ? 'bg-gradient-to-br from-indigo-950/80 via-slate-900 to-slate-900 border-indigo-500/30 text-white'
            : 'bg-gradient-to-br from-indigo-50 via-white to-sky-50 border-indigo-200 text-slate-900 shadow-sm'
        }`}
      >
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start justify-between gap-6 text-center md:text-right">
          <div className="flex flex-col sm:flex-row items-center gap-5">
            {/* Avatar */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-amber-500 via-indigo-600 to-purple-600 p-1 shadow-2xl shadow-indigo-600/30 flex items-center justify-center shrink-0">
              <div className="w-full h-full bg-slate-900 rounded-[22px] flex items-center justify-center text-white">
                <GraduationCap className="w-10 h-10 text-amber-400" />
              </div>
            </div>

            {/* Basic Info */}
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <h1 className="text-xl sm:text-3xl font-black">{studentUser.name}</h1>
                <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>طالب معتمد ومفعل ✅</span>
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-xs text-slate-400">
                <span className="flex items-center gap-1 font-mono text-indigo-300" dir="ltr">
                  <Phone className="w-3.5 h-3.5 text-indigo-400" />
                  {studentUser.phone}
                </span>
                <span>•</span>
                <span className="text-slate-300 font-semibold">{studentUser.grade}</span>
                <span>•</span>
                <span className="flex items-center gap-1 text-slate-400">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>انضم: {new Date(studentUser.createdAt).toLocaleDateString('ar-EG')}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Quick Support & Logout Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap justify-center">
            <button
              onClick={onOpenSupport}
              className="px-4 py-2.5 rounded-2xl bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-sm"
            >
              <MessageCircle className="w-4 h-4 text-cyan-400" />
              <span>محادثة الأستاذ محمد رمضان</span>
            </button>
            <button
              onClick={onLogout}
              className="px-3.5 py-2.5 rounded-2xl bg-slate-800/80 hover:bg-rose-950/40 text-slate-300 hover:text-rose-400 border border-slate-700/80 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>تسجيل الخروج</span>
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1: Watched Lectures */}
        <div
          onClick={() => onNavigateTab('videos')}
          className={`p-5 rounded-3xl border shadow-lg transition-all hover:scale-[1.01] cursor-pointer ${
            isDark ? 'bg-slate-900/90 border-slate-800 hover:border-emerald-500/40' : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Video className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
              {progressPercent}% إنجاز
            </span>
          </div>
          <p className="text-xs text-slate-400 font-semibold">المحاضرات المشاهدة</p>
          <h3 className="text-2xl font-black mt-1">
            {watchedVideosCount} <span className="text-xs text-slate-400 font-normal">من {totalVideosCount} محاضرة</span>
          </h3>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-3">
            <div
              className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-700"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Stat 2: Student Notes */}
        <div
          onClick={() => onNavigateTab('videos')}
          className={`p-5 rounded-3xl border shadow-lg transition-all hover:scale-[1.01] cursor-pointer ${
            isDark ? 'bg-slate-900/90 border-slate-800 hover:border-indigo-500/40' : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <FileText className="w-5 h-5" />
            </span>
            <span className="text-xs text-indigo-400 font-bold bg-indigo-500/10 px-2 py-0.5 rounded-full">
              دفتر الملاحظات
            </span>
          </div>
          <p className="text-xs text-slate-400 font-semibold">ملاحظاتي وتلخيصاتي</p>
          <h3 className="text-2xl font-black mt-1">
            {userNotes.length} <span className="text-xs text-slate-400 font-normal">ملاحظة مسجلة</span>
          </h3>
          <p className="text-[11px] text-indigo-400 mt-2 font-medium">مربوطة بدروسك ومحفوظة في السحابة</p>
        </div>

        {/* Stat 3: Favorites */}
        <div
          onClick={() => onNavigateTab('favorites')}
          className={`p-5 rounded-3xl border shadow-lg transition-all hover:scale-[1.01] cursor-pointer ${
            isDark ? 'bg-slate-900/90 border-slate-800 hover:border-rose-500/40' : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="p-2.5 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <Heart className="w-5 h-5" />
            </span>
            <span className="text-xs text-rose-400 font-bold bg-rose-500/10 px-2 py-0.5 rounded-full">
              المفضلة
            </span>
          </div>
          <p className="text-xs text-slate-400 font-semibold">الكتب المحفوظة</p>
          <h3 className="text-2xl font-black mt-1">
            {favoritesCount} <span className="text-xs text-slate-400 font-normal">كتاب وملف</span>
          </h3>
          <p className="text-[11px] text-rose-400 mt-2 font-medium">وصول فوري لكتب الوزارة المهمة</p>
        </div>

        {/* Stat 4: Interactive Bank */}
        <div
          onClick={() => onNavigateTab('exams')}
          className={`p-5 rounded-3xl border shadow-lg transition-all hover:scale-[1.01] cursor-pointer ${
            isDark ? 'bg-slate-900/90 border-slate-800 hover:border-amber-500/40' : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Award className="w-5 h-5" />
            </span>
            <span className="text-xs text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded-full">
              بنك الاختبارات
            </span>
          </div>
          <p className="text-xs text-slate-400 font-semibold">التقييمات والامتحانات</p>
          <h3 className="text-2xl font-black mt-1">
            جاهز <span className="text-xs text-slate-400 font-normal">للاختبار والتقييم اللحظي</span>
          </h3>
          <p className="text-[11px] text-amber-400 mt-2 font-medium">مع تصحيح إلكتروني وتفسير الإجابات</p>
        </div>
      </div>

      {/* Watched Lectures Section */}
      <div
        className={`rounded-3xl border p-5 sm:p-7 shadow-xl ${
          isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-800/80">
          <div>
            <h3 className="text-base sm:text-lg font-black flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>قائمة المحاضرات التي أنجزتها وتمت مشاهدتها ({watchedVideosCount})</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              كل درس تقوم بتحديده كـ "تمت المشاهدة" يُضاف تلقائياً هنا لتوثيق تقدمك الدراسي.
            </p>
          </div>

          <button
            onClick={() => onNavigateTab('videos')}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer self-start sm:self-auto"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>متابعة مشاهدة الفيديوهات</span>
          </button>
        </div>

        {watchedVideoItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {watchedVideoItems.map((video, idx) => (
              <div
                key={`${video.id}-${idx}`}
                onClick={() => onNavigateTab('videos')}
                className={`p-4 rounded-2xl border transition-all hover:scale-[1.01] cursor-pointer ${
                  isDark
                    ? 'bg-slate-950/60 border-slate-800 hover:border-emerald-500/50'
                    : 'bg-slate-50 border-slate-200 hover:border-emerald-300'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    {video.category}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>مكتمل</span>
                  </span>
                </div>
                <h4 className="font-bold text-xs sm:text-sm line-clamp-2 mb-2">{video.title}</h4>
                <p className="text-[11px] text-slate-400 line-clamp-1">{video.description}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-slate-400 space-y-3">
            <Video className="w-12 h-12 text-slate-500 mx-auto" />
            <h4 className="font-bold text-sm text-slate-300">لم تقم بتحديد أي محاضرة كمشاهدة بعد</h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              أثناء مشاهدتك للمحاضرات في قسم الفيديوهات، اضغط على زر "تحديد كـ تمت المشاهدة 👁️" لتظهر في إحصائياتك هنا.
            </p>
            <button
              onClick={() => onNavigateTab('videos')}
              className="mt-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs cursor-pointer shadow-lg inline-flex items-center gap-2"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>ابدأ مشاهدة أول محاضرة الآن</span>
            </button>
          </div>
        )}
      </div>

      {/* Quick Launchpad to All Sections */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
        <button
          onClick={() => onNavigateTab('books')}
          className={`p-4 rounded-2xl border text-center transition-all hover:scale-[1.02] cursor-pointer ${
            isDark ? 'bg-slate-900/60 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
          }`}
        >
          <BookOpen className="w-6 h-6 text-indigo-400 mx-auto mb-2" />
          <span className="font-bold text-xs block">كتب الوزارة</span>
          <span className="text-[10px] text-slate-400">PDF ومذكرات رسمية</span>
        </button>

        <button
          onClick={() => onNavigateTab('videos')}
          className={`p-4 rounded-2xl border text-center transition-all hover:scale-[1.02] cursor-pointer ${
            isDark ? 'bg-slate-900/60 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
          }`}
        >
          <Video className="w-6 h-6 text-purple-400 mx-auto mb-2" />
          <span className="font-bold text-xs block">جميع المحاضرات</span>
          <span className="text-[10px] text-slate-400">{videos.length} فيديو تعليمي</span>
        </button>

        <button
          onClick={() => onNavigateTab('evaluations')}
          className={`p-4 rounded-2xl border text-center transition-all hover:scale-[1.02] cursor-pointer ${
            isDark ? 'bg-slate-900/60 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
          }`}
        >
          <FileText className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
          <span className="font-bold text-xs block">التقييمات الأسبوعية</span>
          <span className="text-[10px] text-slate-400">واجبات ونماذج إجابة</span>
        </button>

        <button
          onClick={() => onNavigateTab('exams')}
          className={`p-4 rounded-2xl border text-center transition-all hover:scale-[1.02] cursor-pointer ${
            isDark ? 'bg-slate-900/60 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
          }`}
        >
          <HelpCircle className="w-6 h-6 text-amber-400 mx-auto mb-2" />
          <span className="font-bold text-xs block">بنك الامتحانات</span>
          <span className="text-[10px] text-slate-400">اختبارات تفاعلية</span>
        </button>
      </div>
    </div>
  );
};
