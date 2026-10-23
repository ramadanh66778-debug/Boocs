import React, { useState, useEffect } from 'react';
import { ExamItem, DEFAULT_EXAM } from '../data/initialData';
import {
  Clock,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Award,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  BookOpen,
  HelpCircle
} from 'lucide-react';

interface ExamRunnerProps {
  exams?: ExamItem[];
  exam?: ExamItem;
  theme?: 'dark' | 'light';
}

export const ExamRunner: React.FC<ExamRunnerProps> = ({
  exams = [],
  exam,
  theme = 'dark'
}) => {
  const isDark = theme === 'dark';

  // Available exams list
  const allExams = exams.length > 0 ? exams : [exam || DEFAULT_EXAM];
  const [selectedExamId, setSelectedExamId] = useState<string>(
    exam?.id || allExams[0]?.id || DEFAULT_EXAM.id
  );

  const activeExam = allExams.find((e) => e.id === selectedExamId) || allExams[0] || DEFAULT_EXAM;
  const questions =
    activeExam.questions && activeExam.questions.length > 0
      ? activeExam.questions
      : DEFAULT_EXAM.questions;

  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState<{ [qIdx: number]: number }>({});
  const [showExplanation, setShowExplanation] = useState<{ [qIdx: number]: boolean }>({});
  const [isFinished, setIsFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState((activeExam.timeLimit || 15) * 60);

  // Reset exam on exam switch
  useEffect(() => {
    setCurrentIdx(0);
    setUserAnswers({});
    setShowExplanation({});
    setIsFinished(false);
    setTimeLeft((activeExam.timeLimit || 15) * 60);
  }, [selectedExamId]);

  // Timer countdown
  useEffect(() => {
    if (isFinished) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsFinished(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isFinished, selectedExamId]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleSelectOption = (optIdx: number) => {
    if (isFinished) return;
    setUserAnswers((prev) => ({
      ...prev,
      [currentIdx]: optIdx
    }));
  };

  const currentQ = questions[currentIdx] || questions[0];
  const isSelected = userAnswers[currentIdx] !== undefined;
  const selectedOpt = userAnswers[currentIdx];

  // Calculate score
  const calculateScore = () => {
    let score = 0;
    questions.forEach((q, idx) => {
      if (userAnswers[idx] === q.ans) score++;
    });
    return score;
  };

  const resetExam = () => {
    setUserAnswers({});
    setShowExplanation({});
    setCurrentIdx(0);
    setIsFinished(false);
    setTimeLeft((activeExam.timeLimit || 15) * 60);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Exam Switcher (if multiple exams exist) */}
      {allExams.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <span className="text-xs font-bold text-slate-500 shrink-0">اختر الاختبار:</span>
          {allExams.map((ex) => (
            <button
              key={ex.id}
              onClick={() => setSelectedExamId(ex.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 cursor-pointer ${
                selectedExamId === ex.id
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : isDark
                  ? 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              <span>{ex.title}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-500/20">
                {ex.questions?.length || 0} أسئلة
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Top Banner */}
      <div
        className={`border rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
          isDark
            ? 'bg-gradient-to-r from-indigo-950/70 via-slate-900 to-slate-900 border-indigo-500/30 text-white'
            : 'bg-gradient-to-r from-indigo-50 via-white to-amber-50 border-indigo-200 text-slate-900 shadow-sm'
        }`}
      >
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-500 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            اختبار إلكتروني تدريبي تفاعلي
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold">{activeExam.title}</h2>
          <p className="text-xs text-slate-500 mt-1">
            المادة: {activeExam.subject} • إجمالي الأسئلة: {questions.length} سؤال
          </p>
        </div>

        {/* Timer Badge */}
        {!isFinished && (
          <div
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border font-mono font-bold text-sm shadow-md ${
              isDark
                ? 'bg-slate-950 border-indigo-500/30 text-indigo-300'
                : 'bg-white border-indigo-200 text-indigo-700'
            }`}
          >
            <Clock className="w-4 h-4 text-indigo-500" />
            <span>الوقت المتبقي: {formatTime(timeLeft)}</span>
          </div>
        )}
      </div>

      {/* Main Exam Card / Results View */}
      {!isFinished ? (
        <div
          className={`border rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 ${
            isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          {/* Progress & Question Numbers */}
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-3">
              <span>
                السؤال {currentIdx + 1} من {questions.length}
              </span>
              <span>{Math.round(((currentIdx + 1) / questions.length) * 100)}% تم الإنجاز</span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2 bg-slate-500/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-l from-indigo-500 to-violet-500 transition-all duration-300"
                style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
              />
            </div>

            {/* Quick navigator pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-3">
              {questions.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIdx(i)}
                  className={`w-7 h-7 rounded-lg text-xs font-bold transition-all shrink-0 flex items-center justify-center cursor-pointer ${
                    currentIdx === i
                      ? 'bg-indigo-600 text-white ring-2 ring-indigo-400 shadow-md'
                      : userAnswers[i] !== undefined
                      ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                      : isDark
                      ? 'bg-slate-800 text-slate-400 hover:text-white'
                      : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>

          {/* Question Text */}
          <div
            className={`p-5 rounded-2xl border ${
              isDark ? 'bg-slate-950/60 border-slate-800/80' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 mb-2 inline-block">
              {currentQ.cat}
            </span>
            <h3 className="text-lg sm:text-xl font-bold leading-relaxed">{currentQ.q}</h3>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {currentQ.opts.map((opt, optIdx) => {
              const isOptionSelected = selectedOpt === optIdx;
              return (
                <button
                  key={optIdx}
                  onClick={() => handleSelectOption(optIdx)}
                  className={`w-full text-right p-4 rounded-xl border text-sm font-medium transition-all flex items-center justify-between cursor-pointer ${
                    isOptionSelected
                      ? 'bg-indigo-600/15 border-indigo-500 font-bold shadow-md'
                      : isDark
                      ? 'bg-slate-950/70 border-slate-800 text-slate-300 hover:bg-slate-800/60 hover:text-white'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                        isOptionSelected
                          ? 'bg-indigo-600 text-white'
                          : isDark
                          ? 'bg-slate-800 text-slate-400'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {optIdx + 1}
                    </span>
                    <span>{opt}</span>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      isOptionSelected
                        ? 'border-indigo-500 bg-indigo-500'
                        : isDark
                        ? 'border-slate-600'
                        : 'border-slate-300'
                    }`}
                  >
                    {isOptionSelected && <span className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Teacher Explanation Reveal */}
          {isSelected && (
            <div className="pt-2">
              <button
                onClick={() =>
                  setShowExplanation((prev) => ({ ...prev, [currentIdx]: !prev[currentIdx] }))
                }
                className="text-xs text-indigo-500 hover:underline flex items-center gap-1.5 font-semibold cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>
                  {showExplanation[currentIdx]
                    ? 'إخفاء شرح الإجابة'
                    : 'عرض شرح وتوضيح الإجابة من المعلم'}
                </span>
              </button>
              {showExplanation[currentIdx] && (
                <div
                  className={`mt-2 p-3.5 rounded-xl border text-xs leading-relaxed ${
                    isDark
                      ? 'bg-indigo-950/40 border-indigo-800 text-indigo-200'
                      : 'bg-indigo-50 border-indigo-200 text-indigo-900'
                  }`}
                >
                  💡 <strong>شرح وتوضيح المعلم:</strong> {currentQ.exp}
                </div>
              )}
            </div>
          )}

          {/* Navigation Controls */}
          <div className="pt-6 border-t border-slate-700/50 flex items-center justify-between">
            <button
              onClick={() => setCurrentIdx((prev) => Math.max(0, prev - 1))}
              disabled={currentIdx === 0}
              className={`px-4 py-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                isDark
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
              }`}
            >
              <ChevronRight className="w-4 h-4" />
              <span>السابق</span>
            </button>

            {currentIdx < questions.length - 1 ? (
              <button
                onClick={() => setCurrentIdx((prev) => Math.min(questions.length - 1, prev + 1))}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
              >
                <span>التالي</span>
                <ChevronLeft className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => setIsFinished(true)}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>إنهاء الاختبار وعرض النتيجة</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Results View */
        <div
          className={`border rounded-3xl p-6 sm:p-10 shadow-2xl text-center space-y-6 ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center mx-auto shadow-2xl shadow-indigo-500/25">
            <Award className="w-10 h-10 text-white" />
          </div>

          <div>
            <h3 className="text-2xl sm:text-3xl font-black">نتيجة الاختبار</h3>
            <p className="text-xs text-slate-500 mt-1">
              تم إنهاء {activeExam.title} بنجاح
            </p>
          </div>

          {/* Score Box */}
          <div
            className={`max-w-xs mx-auto p-6 rounded-2xl border ${
              isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <p className="text-xs text-slate-500 font-semibold mb-1">الدرجة النهائية</p>
            <div className="flex items-center justify-center gap-2 text-4xl sm:text-5xl font-black text-indigo-500">
              <span>{calculateScore()}</span>
              <span className="text-2xl text-slate-400">/</span>
              <span className="text-2xl text-slate-400">{questions.length}</span>
            </div>
            <p className="text-xs font-bold mt-2 text-emerald-500">
              النسبة المئوية: {Math.round((calculateScore() / questions.length) * 100)}%
            </p>
          </div>

          {/* Question by Question Review */}
          <div className="space-y-3 text-right max-h-96 overflow-y-auto pt-4 border-t border-slate-700/50">
            <h4 className="font-bold text-sm mb-3">مراجعة الإجابات ونموذج الحل:</h4>
            {questions.map((q, idx) => {
              const uAns = userAnswers[idx];
              const isCorrect = uAns === q.ans;
              return (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border text-xs space-y-2 ${
                    isCorrect
                      ? 'bg-emerald-500/10 border-emerald-500/30'
                      : 'bg-rose-500/10 border-rose-500/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold">
                      س{idx + 1}: {q.q}
                    </span>
                    {isCorrect ? (
                      <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                        <CheckCircle2 className="w-4 h-4" /> إجابة صحيحة
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400 font-bold">
                        <XCircle className="w-4 h-4" /> إجابة خاطئة
                      </span>
                    )}
                  </div>
                  <div className="text-slate-600 dark:text-slate-400">
                    <p>
                      إجابتك: {uAns !== undefined ? q.opts[uAns] : 'لم تقم بالإجابة'}
                    </p>
                    <p className="text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">
                      الإجابة النموذجية: {q.opts[q.ans]}
                    </p>
                    {q.exp && <p className="mt-1 text-slate-500">💡 {q.exp}</p>}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action buttons */}
          <div className="pt-4 flex items-center justify-center gap-4">
            <button
              onClick={resetExam}
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/30 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>إعادة الاختبار مرة أخرى</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
