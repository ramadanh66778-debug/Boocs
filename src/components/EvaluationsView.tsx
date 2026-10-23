import React, { useState } from 'react';
import { EvaluationItem } from '../data/initialData';
import { FileCheck2, Download, CheckCircle, ExternalLink, Calendar, BookOpen } from 'lucide-react';

interface EvaluationsViewProps {
  evaluations: EvaluationItem[];
  theme?: 'dark' | 'light';
}

export const EvaluationsView: React.FC<EvaluationsViewProps> = ({
  evaluations,
  theme = 'dark'
}) => {
  const isDark = theme === 'dark';
  const [selectedSubject, setSelectedSubject] = useState('الكل');

  const subjects = ['الكل', ...Array.from(new Set(evaluations.map((e) => e.subject)))];

  const filtered =
    selectedSubject === 'الكل'
      ? evaluations
      : evaluations.filter((e) => e.subject === selectedSubject);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div
        className={`border rounded-2xl p-6 sm:p-8 shadow-xl ${
          isDark
            ? 'bg-gradient-to-br from-emerald-950/60 via-slate-900 to-slate-900 border-emerald-500/30 text-white'
            : 'bg-gradient-to-br from-emerald-50 via-white to-slate-50 border-emerald-200 text-slate-900 shadow-sm'
        }`}
      >
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs font-semibold mb-3">
            <FileCheck2 className="w-3.5 h-3.5" />
            التقييمات الأسبوعية والواجبات المنزلية الرسمية
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            ملفات التقييم الأسبوعي ونماذج الإجابة
          </h2>
          <p className={`text-sm mt-2 leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            جميع أوراق الواجبات والتقييمات المدرسية الأسبوعية المقررة لمختلف المواد مع إتاحة نماذج الإجابة النموذجية المعتمدة للمراجعة الذاتية.
          </p>
        </div>
      </div>

      {/* Subject Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {subjects.map((sub) => (
          <button
            key={sub}
            onClick={() => setSelectedSubject(sub)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 cursor-pointer ${
              selectedSubject === sub
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/25'
                : isDark
                ? 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
            }`}
          >
            {sub}
          </button>
        ))}
      </div>

      {/* Grid of Evaluations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((item) => (
          <div
            key={item.id}
            className={`border rounded-2xl p-5 shadow-lg transition-all flex flex-col justify-between hover:-translate-y-1 ${
              isDark
                ? 'bg-slate-900/80 hover:bg-slate-900 border-slate-800 hover:border-emerald-500/40 text-white'
                : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-emerald-400 text-slate-900 shadow-sm'
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-xs font-bold">
                  {item.subject}
                </span>
                <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                  <Calendar className="w-3.5 h-3.5" />
                  {item.week}
                </span>
              </div>

              <h3 className="font-bold text-base leading-snug mb-3">{item.title}</h3>
            </div>

            <div className={`pt-4 border-t mt-4 flex items-center gap-2 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>ورقة التقييم</span>
              </a>

              {item.solutionUrl && (
                <a
                  href={item.solutionUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex-1 py-2 px-3 rounded-xl border font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors ${
                    isDark
                      ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                  }`}
                >
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                  <span>نموذج الحل</span>
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
