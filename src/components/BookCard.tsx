import React from 'react';
import { BookItem } from '../data/initialData';
import { BookOpen, Download, Heart, Sparkles, ExternalLink, MessageSquare } from 'lucide-react';

interface BookCardProps {
  book: BookItem;
  onRead: (book: BookItem) => void;
  isFavorite: boolean;
  onToggleFavorite: (bookId: string) => void;
  theme?: 'dark' | 'light';
}

export const BookCard: React.FC<BookCardProps> = ({
  book,
  onRead,
  isFavorite,
  onToggleFavorite,
  theme = 'dark'
}) => {
  const isDark = theme === 'dark';

  return (
    <div
      className={`group border rounded-2xl p-5 shadow-lg transition-all duration-300 flex flex-col justify-between hover:-translate-y-1 relative overflow-hidden ${
        isDark
          ? 'bg-slate-900/80 hover:bg-slate-900 border-slate-800 hover:border-indigo-500/40 text-slate-100'
          : 'bg-white hover:bg-slate-50/80 border-slate-200 hover:border-indigo-400 text-slate-900 shadow-sm'
      }`}
    >
      {/* Popular or New Tag */}
      {book.isNew && (
        <div className="absolute top-3 left-3">
          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5" /> جديد
          </span>
        </div>
      )}

      <div>
        {/* Category & Icon */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
            {book.icon || '📚'}
          </div>

          <div className="flex items-center gap-1.5">
            <span
              className={`text-xs px-2.5 py-1 rounded-lg border font-medium ${
                isDark
                  ? 'bg-slate-800/80 border-slate-700 text-slate-300'
                  : 'bg-slate-100 border-slate-200 text-slate-700'
              }`}
            >
              {book.category}
            </span>
            <button
              onClick={() => onToggleFavorite(book.id)}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                isFavorite
                  ? 'bg-rose-500/20 border-rose-500/40 text-rose-500'
                  : isDark
                  ? 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-rose-500'
                  : 'bg-slate-100 border-slate-200 text-slate-400 hover:text-rose-500'
              }`}
              title={isFavorite ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>
          </div>
        </div>

        {/* Title & Grade */}
        <h3
          className={`font-bold text-base group-hover:text-indigo-500 transition-colors line-clamp-1 mb-1 ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}
        >
          {book.title}
        </h3>
        <p className="text-[11px] font-medium text-amber-500 mb-2">{book.grade}</p>

        {/* Description */}
        <p className={`text-xs line-clamp-2 leading-relaxed mb-3 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          {book.description || 'كتاب دراسي ومذكرة شاملة مخصصة لطلاب تانية بكالوريا والثانوية العامة.'}
        </p>

        {/* Teacher Notes */}
        {book.teacherNotes && (
          <div className="mb-4 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-300 text-xs flex items-start gap-1.5">
            <MessageSquare className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-500" />
            <span className="line-clamp-2 text-[11px]">{book.teacherNotes}</span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className={`pt-3 border-t flex items-center gap-2 mt-auto ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
        <button
          onClick={() => onRead(book)}
          className="flex-1 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-md shadow-indigo-600/25 cursor-pointer"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>قراءة مباشرة</span>
        </button>

        <a
          href={book.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`py-2 px-3 rounded-xl border font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
            isDark
              ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
          }`}
          title="تحميل الملف أو فتح الرابط الأصلي"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">تحميل</span>
        </a>
      </div>
    </div>
  );
};
