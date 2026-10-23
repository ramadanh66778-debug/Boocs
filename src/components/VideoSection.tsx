import React, { useState } from 'react';
import { VideoItem, StudentNote, StudentUser } from '../data/initialData';
import { CustomVideoPlayer } from './CustomVideoPlayer';
import {
  Play,
  Video,
  FileText,
  Download,
  PlusCircle,
  Clock,
  Sparkles,
  ExternalLink,
  Paperclip,
  CheckCircle2,
  Search,
  BookOpen,
  Filter,
  FileCheck2,
  User,
  AlertCircle,
  Trash2,
  Copy,
  FolderOpen,
  X,
  Share2
} from 'lucide-react';

interface VideoSectionProps {
  videos: VideoItem[];
  theme?: 'dark' | 'light';
  studentUser: StudentUser | null;
  onSaveNote: (note: StudentNote) => Promise<void>;
  onDeleteNote?: (noteId: string) => Promise<void>;
  savedNotes: StudentNote[];
  onOpenAuthModal: () => void;
  watchedVideos?: string[];
  onToggleWatchedVideo?: (videoId: string) => Promise<void>;
}

export const VideoSection: React.FC<VideoSectionProps> = ({
  videos,
  theme = 'dark',
  studentUser,
  onSaveNote,
  onDeleteNote,
  savedNotes,
  onOpenAuthModal,
  watchedVideos = [],
  onToggleWatchedVideo
}) => {
  const isDark = theme === 'dark';
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(() => videos[0] || null);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [activeSubCategory, setActiveSubCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Note addition inputs
  const [noteTitle, setNoteTitle] = useState<string>('');
  const [noteContent, setNoteContent] = useState<string>('');
  const [isSavingNote, setIsSavingNote] = useState<boolean>(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // All Notes Modal View
  const [showAllNotesModal, setShowAllNotesModal] = useState<boolean>(false);
  const [notesSearch, setNotesSearch] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Convert raw URL into embeddable URL
  const getEmbedUrl = (url: string) => {
    if (!url) return '';
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      let videoId = '';
      if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1]?.split('?')[0];
      } else if (url.includes('watch?v=')) {
        videoId = url.split('watch?v=')[1]?.split('&')[0];
      } else if (url.includes('embed/')) {
        return url;
      }
      return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0` : url;
    }
    if (url.includes('drive.google.com')) {
      if (url.includes('/view') || url.includes('/edit')) {
        return url.replace(/\/view(\?.*)?$/, '/preview').replace(/\/edit(\?.*)?$/, '/preview');
      }
      if (!url.includes('/preview')) {
        return url + (url.includes('?') ? '&preview=true' : '/preview');
      }
      return url;
    }
    return url;
  };

  // Filter student notes for current student
  const studentPersonalNotes = studentUser
    ? savedNotes.filter((n) => n.studentPhone === studentUser.phone)
    : [];

  // Notes specifically for the selected video
  const currentVideoNotes = selectedVideo
    ? studentPersonalNotes.filter((n) => n.relatedItemId === selectedVideo.id)
    : [];

  // Save a brand NEW discrete note (does NOT overwrite!)
  const handleAddNewNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVideo) return;
    if (!studentUser) {
      onOpenAuthModal();
      return;
    }
    if (!noteContent.trim()) {
      return;
    }

    setIsSavingNote(true);
    setSaveSuccessMsg(null);

    const generatedTitle = noteTitle.trim() || `ملاحظة: ${selectedVideo.title}`;
    const uniqueNoteId = `note-${studentUser.phone}-${Date.now()}`;

    const newNote: StudentNote = {
      id: uniqueNoteId,
      studentPhone: studentUser.phone,
      studentName: studentUser.name,
      title: generatedTitle,
      content: noteContent.trim(),
      relatedItemId: selectedVideo.id,
      relatedItemTitle: selectedVideo.title,
      updatedAt: new Date().toISOString()
    };

    try {
      await onSaveNote(newNote);
      setNoteTitle('');
      setNoteContent('');
      setSaveSuccessMsg('تمت إضافة الملاحظة وحفظها بنجاح في قاعدة البيانات! 💾✨');
      setTimeout(() => setSaveSuccessMsg(null), 4000);
    } catch (err: any) {
      alert('خطأ في حفظ الملاحظة: ' + (err.message || 'حدث خطأ غير متوقع'));
    } finally {
      setIsSavingNote(false);
    }
  };

  const handleCopyNote = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleDeleteNoteClick = async (noteId: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه الملاحظة؟')) return;
    if (onDeleteNote) {
      await onDeleteNote(noteId);
    }
  };

  // Filter videos by subject, subcategory, search
  const filteredVideos = videos.filter((v) => {
    const matchesCat = activeCategory === 'all' || v.category === activeCategory;
    const matchesSub = activeSubCategory === 'all' || v.subCategory === activeSubCategory;
    const matchesSearch =
      v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.subCategory && v.subCategory.toLowerCase().includes(searchQuery.toLowerCase())) ||
      v.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSub && matchesSearch;
  });

  const categories = ['all', ...Array.from(new Set(videos.map((v) => v.category)))];
  const subCategories = ['all', 'شرح ومراجعة', 'حل التقييمات والواجبات', 'تحفيز وتوجيه'];

  return (
    <div className="space-y-6 sm:space-y-8" dir="rtl">
      {/* Header Banner */}
      <div
        className={`relative overflow-hidden rounded-3xl border p-5 sm:p-8 shadow-xl transition-colors ${
          isDark
            ? 'bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-900 border-indigo-500/30 text-white'
            : 'bg-gradient-to-br from-indigo-50 via-white to-sky-50 border-indigo-200 text-slate-900 shadow-sm'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="max-w-2xl">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold">
                <Video className="w-3.5 h-3.5" />
                <span>أرشيف المحاضرات والفيديوهات الرسمية ({videos.length} فيديو)</span>
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>برعاية وتطوير: محمد رمضان الحرباوي</span>
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
              شروحات وفيديوهات المناهج والتقييمات
            </h1>
            <p className={`text-xs sm:text-sm mt-2 leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              جميع شروحات تانية بكالوريا والثانوية العامة المسترجعة مع تقسيم المواد والتصنيفات، وأوراق العمل المرفقة تحت كل مادة، ونظام الملاحظات المتعدد المباشر.
            </p>
          </div>

          {/* Quick Action: Open All Notes */}
          <button
            onClick={() => {
              if (!studentUser) {
                onOpenAuthModal();
              } else {
                setShowAllNotesModal(true);
              }
            }}
            className="px-4 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/25 transition-all cursor-pointer"
          >
            <FolderOpen className="w-4 h-4" />
            <span>دفتر جميع ملاحظاتي ({studentPersonalNotes.length}) 📝</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Player + Playlist */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Active Video Player + Notes */}
        <div className="lg:col-span-2 space-y-6 min-w-0">
          {selectedVideo ? (
            <div
              className={`rounded-3xl border overflow-hidden shadow-2xl transition-all ${
                isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
              }`}
            >
              {/* Custom Protected Video Player with Anti-Piracy Watermark & Controls */}
              <CustomVideoPlayer
                videoUrl={selectedVideo.videoUrl}
                title={selectedVideo.title}
                thumbnail={selectedVideo.thumbnail}
                studentUser={studentUser}
                theme={theme}
                onEnded={() => {
                  if (onToggleWatchedVideo && !watchedVideos.includes(selectedVideo.id)) {
                    onToggleWatchedVideo(selectedVideo.id);
                  }
                }}
              />

              {/* Video Info Header */}
              <div className="p-4 sm:p-6 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-3 py-1 rounded-xl bg-indigo-600/20 text-indigo-400 font-bold text-xs border border-indigo-500/30">
                      {selectedVideo.category}
                    </span>
                    {selectedVideo.subCategory && (
                      <span className="px-2.5 py-1 rounded-xl bg-emerald-500/15 text-emerald-400 font-bold text-xs border border-emerald-500/30">
                        {selectedVideo.subCategory}
                      </span>
                    )}
                    <span className="text-xs px-2.5 py-1 rounded-xl bg-slate-800 text-slate-300 border border-slate-700">
                      {selectedVideo.grade}
                    </span>
                    {selectedVideo.duration && (
                      <span className="text-xs flex items-center gap-1 text-slate-400">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{selectedVideo.duration}</span>
                      </span>
                    )}
                  </div>

                  {/* Watched Toggle Button */}
                  {selectedVideo && (
                    <button
                      type="button"
                      onClick={() => {
                        if (!studentUser) {
                          onOpenAuthModal();
                          return;
                        }
                        if (onToggleWatchedVideo) {
                          onToggleWatchedVideo(selectedVideo.id);
                        }
                      }}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm ${
                        watchedVideos.includes(selectedVideo.id)
                          ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-600/30'
                          : isDark
                          ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
                      }`}
                      title={watchedVideos.includes(selectedVideo.id) ? 'إلغاء تحديد المشاهدة' : 'تحديد هذه المحاضرة كمكتملة ومحفوظة في حسابك'}
                    >
                      <CheckCircle2
                        className={`w-4 h-4 ${
                          watchedVideos.includes(selectedVideo.id) ? 'text-emerald-400' : 'text-slate-400'
                        }`}
                      />
                      <span>
                        {watchedVideos.includes(selectedVideo.id) ? 'تمت المشاهدة بنجاح ✅' : 'تحديد كـ تمت المشاهدة 👁️'}
                      </span>
                    </button>
                  )}
                </div>

                <h2 className={`text-lg sm:text-2xl font-black break-words ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {selectedVideo.title}
                </h2>

                <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  {selectedVideo.description}
                </p>

                {selectedVideo.teacherNotes && (
                  <div
                    className={`p-3.5 sm:p-4 rounded-2xl border ${
                      isDark
                        ? 'bg-amber-950/30 border-amber-500/30 text-amber-200'
                        : 'bg-amber-50 border-amber-200 text-amber-900'
                    }`}
                  >
                    <p className="text-xs font-bold flex items-center gap-1.5 mb-1 text-amber-400">
                      <Sparkles className="w-4 h-4 shrink-0" />
                      <span>توجيهات وملاحظات المعلم (محمد رمضان):</span>
                    </p>
                    <p className="text-xs leading-relaxed">{selectedVideo.teacherNotes}</p>
                  </div>
                )}

                {/* Attached Worksheets & Files under this subject */}
                <div className="pt-4 border-t border-slate-800/80">
                  <h3 className="text-xs sm:text-sm font-bold flex items-center gap-2 mb-3">
                    <Paperclip className="w-4 h-4 text-cyan-400" />
                    <span>الملفات وأوراق العمل المرفقة مع مادة ({selectedVideo.category}):</span>
                  </h3>

                  {selectedVideo.attachments && selectedVideo.attachments.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {selectedVideo.attachments.map((att) => (
                        <a
                          key={att.id}
                          href={att.url}
                          target="_blank"
                          rel="noreferrer"
                          className={`flex items-center justify-between p-3 sm:p-3.5 rounded-2xl border transition-all hover:scale-[1.01] ${
                            isDark
                              ? 'bg-slate-800/70 hover:bg-slate-800 border-slate-700 text-slate-200'
                              : 'bg-slate-50 hover:bg-indigo-50/50 border-slate-200 text-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 overflow-hidden">
                            <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0">
                              <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                            </span>
                            <div className="overflow-hidden">
                              <p className="text-xs font-bold truncate">{att.title}</p>
                              <span className="text-[10px] text-slate-400">ملف جاهز للتحميل والقراءة</span>
                            </div>
                          </div>
                          <span className="p-1.5 sm:p-2 rounded-xl bg-cyan-600/20 text-cyan-400 shrink-0">
                            <Download className="w-4 h-4" />
                          </span>
                        </a>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-slate-800/40 text-slate-400 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-slate-500 shrink-0" />
                      <span>لا توجد ملفات مرفقة إضافية مع هذا الفيديو.</span>
                    </div>
                  )}
                </div>

                {/* MULTI-NOTE STUDENT SYSTEM */}
                <div className="pt-4 border-t border-slate-800/80 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-black flex items-center gap-2">
                        <FileCheck2 className="w-4 h-4 text-emerald-400" />
                        <span>ملاحظاتي الخاصة بهذه المحاضرة ({currentVideoNotes.length})</span>
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        أضف ملاحظات متعددة دون استبدال السابقة، واحفظها مباشرة في قاعدة البيانات.
                      </p>
                    </div>

                    {studentUser ? (
                      <span className="text-xs px-2.5 py-1 rounded-lg bg-indigo-600/20 text-indigo-400 font-bold border border-indigo-500/30">
                        {studentUser.name}
                      </span>
                    ) : (
                      <button
                        onClick={onOpenAuthModal}
                        className="text-xs text-amber-400 hover:underline flex items-center gap-1 cursor-pointer font-bold"
                      >
                        <User className="w-3.5 h-3.5" />
                        <span>سجل دخولك لحفظ ملاحظاتك</span>
                      </button>
                    )}
                  </div>

                  {/* Add Note Form */}
                  <form onSubmit={handleAddNewNote} className="space-y-2.5">
                    <input
                      type="text"
                      value={noteTitle}
                      onChange={(e) => setNoteTitle(e.target.value)}
                      placeholder={`عنوان الملاحظة (اختياري: مثال: تلخيص فكرة رقم 1)...`}
                      className={`w-full px-3.5 py-2.5 rounded-xl text-xs border ${
                        isDark
                          ? 'bg-slate-950/80 border-slate-700 text-slate-100 placeholder-slate-500 focus:border-emerald-500'
                          : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-emerald-600'
                      }`}
                    />

                    <textarea
                      rows={3}
                      value={noteContent}
                      onChange={(e) => setNoteContent(e.target.value)}
                      placeholder="اكتب ملاحظتك أو تلخيصك هنا (القوانين، الإعراب، ملاحظات الأستاذ محمد رمضان)..."
                      className={`w-full p-3.5 rounded-xl text-xs sm:text-sm border ${
                        isDark
                          ? 'bg-slate-950/80 border-slate-700 text-slate-100 placeholder-slate-500 focus:border-emerald-500'
                          : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-emerald-600'
                      }`}
                    />

                    {saveSuccessMsg && (
                      <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>{saveSuccessMsg}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-1">
                      <button
                        type="submit"
                        disabled={isSavingNote || !noteContent.trim()}
                        className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-emerald-600/25 transition-all cursor-pointer"
                      >
                        <PlusCircle className="w-4 h-4" />
                        <span>{isSavingNote ? 'جاري الحفظ في السحابة...' : 'إضافة ملاحظة جديدة'}</span>
                      </button>

                      {currentVideoNotes.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setShowAllNotesModal(true)}
                          className="text-xs text-indigo-400 hover:text-indigo-300 underline font-semibold cursor-pointer"
                        >
                          عرض الكل في صفحة الملاحظات ({studentPersonalNotes.length})
                        </button>
                      )}
                    </div>
                  </form>

                  {/* List of Notes for Current Video */}
                  {currentVideoNotes.length > 0 && (
                    <div className="space-y-2.5 pt-2">
                      <p className="text-xs font-bold text-slate-400">
                        ملاحظاتك السابقة على هذا الدرس ({currentVideoNotes.length}):
                      </p>
                      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                        {currentVideoNotes.map((note) => (
                          <div
                            key={note.id}
                            className={`p-3 rounded-2xl border transition-all ${
                              isDark
                                ? 'bg-slate-950/60 border-slate-800 text-slate-200'
                                : 'bg-slate-50 border-slate-200 text-slate-800'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <span className="text-xs font-bold text-emerald-400 truncate">
                                {note.title}
                              </span>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <button
                                  onClick={() => handleCopyNote(note.content, note.id)}
                                  className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 cursor-pointer"
                                  title="نسخ الملاحظة"
                                >
                                  {copiedId === note.id ? (
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                  )}
                                </button>
                                {onDeleteNote && (
                                  <button
                                    onClick={() => handleDeleteNoteClick(note.id)}
                                    className="p-1 text-slate-400 hover:text-rose-400 rounded hover:bg-slate-800 cursor-pointer"
                                    title="حذف الملاحظة"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>
                            <p className="text-xs leading-relaxed whitespace-pre-wrap">{note.content}</p>
                            <div className="text-[10px] text-slate-500 mt-1 flex items-center justify-between">
                              <span>{new Date(note.updatedAt).toLocaleDateString('ar-EG')}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className={`p-12 text-center rounded-3xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <Video className="w-12 h-12 text-slate-500 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-400">اختر فيديو من القائمة للبدء في المشاهدة</p>
            </div>
          )}
        </div>

        {/* Right Col: Video Playlist & Filtering */}
        <div className="space-y-4 min-w-0">
          {/* Search in Videos */}
          <div className="relative">
            <Search className="w-4 h-4 absolute right-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث في الفيديوهات أو الدروس..."
              className={`w-full pr-10 pl-3 py-2.5 rounded-2xl text-xs border ${
                isDark
                  ? 'bg-slate-900 border-slate-800 text-slate-100 placeholder-slate-500'
                  : 'bg-white border-slate-200 text-slate-900'
              }`}
            />
          </div>

          {/* Subject Categories Filter */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-slate-400 block px-1">المادة الدراسية:</span>
            <div
              className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar"
              style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
            >
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setActiveCategory(c)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-colors cursor-pointer ${
                    activeCategory === c
                      ? 'bg-indigo-600 text-white'
                      : isDark
                      ? 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {c === 'all' ? 'جميع المواد' : c}
                </button>
              ))}
            </div>
          </div>

          {/* Subcategories (Tabs) */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-slate-400 block px-1">نوع المحتوى:</span>
            <div
              className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar"
              style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
            >
              {subCategories.map((sc) => (
                <button
                  key={sc}
                  onClick={() => setActiveSubCategory(sc)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold shrink-0 transition-colors cursor-pointer ${
                    activeSubCategory === sc
                      ? 'bg-emerald-600 text-white'
                      : isDark
                      ? 'bg-slate-800/80 text-slate-400 hover:bg-slate-800'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {sc === 'all' ? 'الكل' : sc}
                </button>
              ))}
            </div>
          </div>

          {/* Watched Progress Statistics Card */}
          <div
            className={`p-3.5 rounded-2xl border ${
              isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-bold flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>إنجازك في المحاضرات:</span>
              </span>
              <span className="font-bold text-slate-300">
                {videos.filter((v) => watchedVideos.includes(v.id)).length} من {videos.length} ({Math.round(((videos.filter((v) => watchedVideos.includes(v.id)).length) / (videos.length || 1)) * 100)}%)
              </span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.round(((videos.filter((v) => watchedVideos.includes(v.id)).length) / (videos.length || 1)) * 100)}%` }}
              />
            </div>
          </div>

          {/* Videos List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400 px-1">
              <span>قائمة المحاضرات ({filteredVideos.length})</span>
            </div>

            <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
              {filteredVideos.map((video) => {
                const isSelected = selectedVideo?.id === video.id;
                const isWatched = watchedVideos.includes(video.id);
                const videoNoteCount = studentPersonalNotes.filter(
                  (n) => n.relatedItemId === video.id
                ).length;

                return (
                  <div
                    key={video.id}
                    onClick={() => setSelectedVideo(video)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-600/15 shadow-lg shadow-indigo-600/20 ring-1 ring-indigo-500/40'
                        : isDark
                        ? 'bg-slate-900/80 hover:bg-slate-800/80 border-slate-800 text-slate-200'
                        : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800 shadow-sm'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          isSelected
                            ? 'bg-indigo-600 text-white'
                            : isWatched
                            ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                            : isDark
                            ? 'bg-slate-800 text-slate-400'
                            : 'bg-indigo-50 text-indigo-600'
                        }`}
                      >
                        {isWatched ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Play className="w-4 h-4 fill-current ml-0.5" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5 mb-1">
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400">
                            {video.category}
                          </span>
                          {video.subCategory && (
                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400">
                              {video.subCategory}
                            </span>
                          )}
                          {isWatched && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center gap-0.5">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              <span>تمت المشاهدة</span>
                            </span>
                          )}
                          {videoNoteCount > 0 && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-400 flex items-center gap-0.5">
                              <span>{videoNoteCount} ملاحظات</span>
                            </span>
                          )}
                        </div>

                        <h4 className="text-xs font-bold truncate">{video.title}</h4>
                        <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                          {video.description}
                        </p>

                        {video.attachments && video.attachments.length > 0 && (
                          <div className="flex items-center gap-1 text-[10px] text-cyan-400 font-semibold mt-1">
                            <Paperclip className="w-3 h-3" />
                            <span>{video.attachments.length} ملفات مرفقة</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ALL NOTES MODAL (دفتر الملاحظات الشامل) */}
      {showAllNotesModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto"
          dir="rtl"
        >
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl p-5 sm:p-7 shadow-2xl relative text-slate-100 my-auto max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                  <FolderOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white">
                    دفتر ملاحظاتي وتلخيصاتي الشامل
                  </h3>
                  <p className="text-xs text-slate-400">
                    جميع الملاحظات التي قمت بكتابتها وحفظها أثناء مشاهدة الدروس ({studentPersonalNotes.length} ملاحظة)
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowAllNotesModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Notes Search Filter */}
            <div className="py-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute right-3.5 top-3.5 text-slate-400" />
                <input
                  type="text"
                  value={notesSearch}
                  onChange={(e) => setNotesSearch(e.target.value)}
                  placeholder="ابحث في نص أو عنوان أي ملاحظة..."
                  className="w-full pr-10 pl-3 py-2.5 rounded-xl text-xs bg-slate-950 border border-slate-700 text-slate-100 placeholder-slate-500"
                />
              </div>
            </div>

            {/* Notes List */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 py-2">
              {studentPersonalNotes.filter(
                (n) =>
                  !notesSearch ||
                  n.title.toLowerCase().includes(notesSearch.toLowerCase()) ||
                  n.content.toLowerCase().includes(notesSearch.toLowerCase()) ||
                  (n.relatedItemTitle && n.relatedItemTitle.toLowerCase().includes(notesSearch.toLowerCase()))
              ).length > 0 ? (
                studentPersonalNotes
                  .filter(
                    (n) =>
                      !notesSearch ||
                      n.title.toLowerCase().includes(notesSearch.toLowerCase()) ||
                      n.content.toLowerCase().includes(notesSearch.toLowerCase()) ||
                      (n.relatedItemTitle &&
                        n.relatedItemTitle.toLowerCase().includes(notesSearch.toLowerCase()))
                  )
                  .map((note) => (
                    <div
                      key={note.id}
                      className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 space-y-2 transition-all"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <h4 className="text-sm font-bold text-emerald-400">{note.title}</h4>
                          {note.relatedItemTitle && (
                            <p className="text-[11px] text-indigo-400 font-semibold truncate max-w-sm">
                              المحاضرة: {note.relatedItemTitle}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5">
                          {note.relatedItemId && (
                            <button
                              onClick={() => {
                                const found = videos.find((v) => v.id === note.relatedItemId);
                                if (found) setSelectedVideo(found);
                                setShowAllNotesModal(false);
                              }}
                              className="px-2.5 py-1 text-[11px] rounded-lg bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/30 font-semibold cursor-pointer"
                              title="الانتقال للمحاضرة"
                            >
                              الانتقال للدرس
                            </button>
                          )}
                          <button
                            onClick={() => handleCopyNote(note.content, note.id)}
                            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
                            title="نسخ"
                          >
                            {copiedId === note.id ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                          {onDeleteNote && (
                            <button
                              onClick={() => handleDeleteNoteClick(note.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 cursor-pointer"
                              title="حذف"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
                        {note.content}
                      </div>

                      <div className="text-[10px] text-slate-500 flex items-center justify-between">
                        <span>تاريخ الإضافة: {new Date(note.updatedAt).toLocaleDateString('ar-EG')}</span>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="py-12 text-center text-slate-500 space-y-2">
                  <FolderOpen className="w-10 h-10 mx-auto text-slate-600" />
                  <p className="text-xs font-bold">لا توجد ملاحظات مطابقة</p>
                  <p className="text-[11px] text-slate-500">
                    اكتب ملاحظاتك أثناء مشاهدة أي فيديو وستظهر جميعها هنا مرتبة.
                  </p>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setShowAllNotesModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
