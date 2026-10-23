import React, { useState } from 'react';
import { Volume2, VolumeX, Sparkles, BookOpen } from 'lucide-react';

interface QuranSectionProps {
  theme?: 'dark' | 'light';
}

export const QuranSection: React.FC<QuranSectionProps> = ({ theme = 'dark' }) => {
  const isDark = theme === 'dark';
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio] = useState(() => new Audio('https://server8.mp3quran.net/afs/001.mp3'));

  const toggleAudio = () => {
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const duas = [
    {
      title: 'دعاء بدء المذاكرة',
      text: 'اللهم إني أسألك فهم النبيين، وحفظ المرسلين، والملائكة المقربين، اللهم اجعل ألسنتنا عامرة بذكرك، وقلوبنا بخشيتك، وأسرارنا بطاعتك، إنك على كل شيء قدير.'
    },
    {
      title: 'دعاء تيسير الامتحان والصعاب',
      text: 'اللهم لا سهل إلا ما جعلته سهلاً، وأنت تجعل الحزن إذا شئت سهلاً، يا أرحم الراحمين.'
    },
    {
      title: 'دعاء النسيان والتذكر',
      text: 'اللهم يا جامع الناس ليوم لا ريب فيه اجمع بيني وبين ضالتي، وما نسيت فذكرني به وما جهلت فعلمني.'
    },
    {
      title: 'آية الكرسي للطمأنينة والسكينة',
      text: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ.'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Quran Banner */}
      <div
        className={`border rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 ${
          isDark
            ? 'bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-900 border-emerald-500/30 text-white'
            : 'bg-gradient-to-r from-emerald-50 via-white to-teal-50 border-emerald-200 text-slate-900 shadow-sm'
        }`}
      >
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            واحة القرآن الكريم وأدعية التوفيق والتفوق
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold">القرآن الكريم وأدعية الطالب</h2>
          <p className={`text-sm mt-2 max-w-xl leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            الطمأنينة والتركيز أساس التفوق. استمع لتلاوة عطرة واقرأ أدعية الاستذكار وحفظ العلم.
          </p>
        </div>

        {/* Audio Recitation Player */}
        <button
          onClick={toggleAudio}
          className={`flex items-center gap-3 px-5 py-3 rounded-2xl border transition-all shadow-lg shrink-0 cursor-pointer ${
            isPlaying
              ? 'bg-emerald-600 text-white border-emerald-500 shadow-emerald-600/30 ring-2 ring-emerald-400'
              : isDark
              ? 'bg-slate-900/90 hover:bg-slate-800 text-emerald-300 border-emerald-500/30'
              : 'bg-white hover:bg-slate-50 text-emerald-700 border-emerald-300 shadow-sm'
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-500">
            {isPlaying ? <Volume2 className="w-5 h-5 animate-pulse" /> : <VolumeX className="w-5 h-5" />}
          </div>
          <div className="text-right">
            <p className="text-xs font-bold">{isPlaying ? 'جاري الاستماع لتلاوة الفاتحة' : 'استمع لتلاوة القرآن'}</p>
            <span className="text-[10px] text-slate-400">بصوت الشيخ مشاري العفاسي</span>
          </div>
        </button>
      </div>

      {/* Duas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {duas.map((d, idx) => (
          <div
            key={idx}
            className={`border rounded-2xl p-6 shadow-lg space-y-3 ${
              isDark ? 'bg-slate-900/80 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900 shadow-sm'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center font-bold text-xs">
                <BookOpen className="w-4 h-4" />
              </span>
              <h3 className="font-bold text-base">{d.title}</h3>
            </div>
            <p className={`text-xs sm:text-sm leading-relaxed p-4 rounded-xl border ${
              isDark ? 'bg-slate-950/60 border-slate-800/80 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}>
              {d.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
