import React from 'react';
import { X, ExternalLink, Download, BookOpen, AlertCircle } from 'lucide-react';
import { BookItem } from '../data/initialData';

interface BookReaderModalProps {
  book: BookItem | null;
  onClose: () => void;
}

export const BookReaderModal: React.FC<BookReaderModalProps> = ({ book, onClose }) => {
  if (!book) return null;

  // Convert Google Drive view URL to preview/embed URL if possible
  const getEmbedUrl = (url: string) => {
    if (url.includes('drive.google.com/file/d/')) {
      const idMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
      if (idMatch) {
        return `https://drive.google.com/file/d/${idMatch[1]}/preview`;
      }
    }
    return url;
  };

  const embedUrl = getEmbedUrl(book.url);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{book.icon || '📚'}</span>
            <div>
              <h3 className="font-bold text-white text-sm sm:text-base">{book.title}</h3>
              <p className="text-xs text-slate-400">{book.category} • {book.grade}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={book.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>تحميل مباشر</span>
            </a>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Teacher Notes Banner if present */}
        {book.teacherNotes && (
          <div className="px-4 py-2 bg-amber-500/10 border-b border-amber-500/20 text-amber-300 text-xs flex items-center gap-2">
            <span className="font-bold">نصيحة المعلم:</span>
            <span>{book.teacherNotes}</span>
          </div>
        )}

        {/* Reader Frame / Fallback */}
        <div className="flex-1 bg-slate-950 relative">
          <iframe
            src={embedUrl}
            title={book.title}
            className="w-full h-full border-none"
            allow="autoplay"
          />
        </div>
      </div>
    </div>
  );
};
