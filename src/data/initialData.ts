export interface BookItem {
  id: string;
  title: string;
  icon: string;
  category: string;
  grade: string;
  description: string;
  url: string;
  popular: number;
  isNew: boolean;
  teacherNotes?: string;
  createdBy?: string;
  createdAt?: string;
}

export interface EvaluationItem {
  id: string;
  subject: string;
  icon: string;
  week: string;
  title: string;
  url: string;
  solutionUrl?: string;
  createdBy?: string;
  createdAt?: string;
}

export interface ExamQuestion {
  cat: string;
  q: string;
  opts: string[];
  ans: number;
  exp: string;
}

export interface ExamItem {
  id: string;
  title: string;
  subject: string;
  timeLimit: number;
  questions: ExamQuestion[];
  createdBy?: string;
  createdAt?: string;
}

export interface AnnouncementItem {
  id: string;
  title: string;
  content: string;
  category: string;
  date: string;
  createdBy?: string;
  createdAt?: string;
}

export interface StudentUser {
  phone: string;
  name: string;
  username?: string;
  grade: string;
  role?: 'student' | 'admin' | 'owner';
  status?: 'pending' | 'approved' | 'rejected';
  forumStatus?: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  promotedAt?: string;
  promotedBy?: string;
  watchedVideos?: string[];
  completedExams?: { examId: string; score: number; total: number; date: string }[];
}

export interface ForumPost {
  id: string;
  authorPhone: string;
  authorName: string;
  authorUsername: string;
  authorRole: 'student' | 'admin' | 'owner';
  title: string;
  content: string;
  category: string;
  likes: string[];
  repliesCount: number;
  createdAt: string;
  isPinned?: boolean;
}

export interface ForumReply {
  id: string;
  postId: string;
  authorPhone: string;
  authorName: string;
  authorUsername: string;
  authorRole: 'student' | 'admin' | 'owner';
  content: string;
  likes: string[];
  createdAt: string;
}

export const FORUM_CATEGORIES = [
  { id: 'all', name: 'جميع الموضوعات', icon: '💬' },
  { id: 'general', name: 'نقاش عام وتجارب', icon: '📢' },
  { id: 'questions', name: 'أسئلة ومسائل صعبة', icon: '❓' },
  { id: 'summaries', name: 'ملخصات ومذكرات الطلاب', icon: '📝' },
  { id: 'tips', name: 'نصائح المذاكرة وتنظيم الوقت', icon: '💡' }
];

export const DEFAULT_FORUM_POSTS: ForumPost[] = [
  {
    id: 'post-1',
    authorPhone: 'ramadanh66778@gmail.com',
    authorName: 'الأستاذ: محمد رمضان الحرباوي',
    authorUsername: 'ramadan_admin',
    authorRole: 'owner',
    title: 'أهلاً وسهلاً بجميع الطلاب في منتدى ومجتمع المكتبة التعليمية الشاملة 👑',
    content: 'مرحباً بكم يا أبطال تانية بكالوريا والثانوية العامة! هذا المنتدى مخصص لمناقشة الدروس، حل المسائل الصعبة، مشاركة الملخصات المفيدة، والتواصل المباشر مع المعلمين والمشرفين. نرجو الالتزام بالاحترام والتعاون المثمر.',
    category: 'نقاش عام وتجارب',
    likes: ['ramadanh66778@gmail.com'],
    repliesCount: 2,
    createdAt: new Date().toISOString(),
    isPinned: true
  },
  {
    id: 'post-2',
    authorPhone: '01099887766',
    authorName: 'أحمد محمود',
    authorUsername: 'ahmed_bac2',
    authorRole: 'student',
    title: 'طريقة مبسطة لفهم وحفظ قواعد النحو وإعراب جمل تانية بكالوريا 📚',
    content: 'جمعت لكم تلخيص سريع لأهم القواعد النحوية وإعراب جمل المصادر والمشتقات اللي بتيجي دايماً في امتحانات الوزارة والتقييمات الأسبوعية. تقدروا تشاركوني أي جملة وقفت معاكم هنا وسأساعدكم في إعرابها!',
    category: 'ملخصات ومذكرات الطلاب',
    likes: ['01099887766'],
    repliesCount: 1,
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    isPinned: false
  }
];

export const DEFAULT_FORUM_REPLIES: Record<string, ForumReply[]> = {
  'post-1': [
    {
      id: 'rep-1',
      postId: 'post-1',
      authorPhone: '01011223344',
      authorName: 'سارة خالد',
      authorUsername: 'sara_study',
      authorRole: 'student',
      content: 'شكراً جزيلاً لحضرتك يا أستاذ محمد على المجهود العظيم والموقع الرائع والكتب المعتمدة!',
      likes: [],
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
    },
    {
      id: 'rep-2',
      postId: 'post-1',
      authorPhone: 'ramadanh66778@gmail.com',
      authorName: 'الأستاذ: محمد رمضان الحرباوي',
      authorUsername: 'ramadan_admin',
      authorRole: 'owner',
      content: 'بالتوفيق والنجاح الباهر لجميع أبنائنا وبناتنا الأعزاء دائماً 🌟',
      likes: [],
      createdAt: new Date(Date.now() - 3600000).toISOString()
    }
  ]
};

export interface SupportChatMessage {
  id: string;
  studentPhone: string;
  studentName: string;
  senderRole: 'student' | 'teacher';
  senderName: string;
  text: string;
  createdAt: string;
}

export interface VideoAttachment {
  id: string;
  title: string;
  url: string;
  type?: 'pdf' | 'doc' | 'link';
}

export interface VideoItem {
  id: string;
  title: string;
  category: string;
  subCategory?: string;
  grade: string;
  description: string;
  videoUrl: string;
  thumbnail?: string;
  duration?: string;
  attachments?: VideoAttachment[];
  teacherNotes?: string;
  createdAt?: string;
  createdBy?: string;
}

export interface StudentNote {
  id: string;
  studentPhone: string;
  studentName: string;
  title: string;
  content: string;
  relatedItemId?: string;
  relatedItemTitle?: string;
  updatedAt: string;
}


export const CATEGORIES = [
  { id: 'all', name: 'الكل', icon: '📚' },
  { id: 'لغة عربية', name: 'لغة عربية', icon: '📖' },
  { id: 'تاريخ', name: 'تاريخ', icon: '🏛️' },
  { id: 'رياضيات', name: 'رياضيات', icon: '📐' },
  { id: 'فيزياء', name: 'فيزياء', icon: '⚡' },
  { id: 'كيمياء', name: 'كيمياء', icon: '🧪' },
  { id: 'أحياء', name: 'أحياء', icon: '🧬' },
  { id: 'مواد شرعية', name: 'مواد شرعية', icon: '🕌' },
  { id: 'فلسفة ومنطق', name: 'فلسفة ومنطق', icon: '💡' },
  { id: 'برمجة', name: 'برمجة', icon: '💻' },
  { id: 'عام', name: 'عام وثقافة', icon: '🌐' },
];

export const DEFAULT_BOOKS: BookItem[] = [
  {
    "id": "book-1",
    "title": "كتاب التاريخ",
    "icon": "📚",
    "category": "تاريخ",
    "grade": "الصف الثاني / الثالث الثانوي",
    "description": "الكتاب الدراسي لمادة التاريخ للصف الثاني الثانوي (PDF).",
    "url": "https://drive.google.com/file/d/1JQlVNklrEfleYtSSgntUNfUrP09mWhEu/view?usp=drive_link",
    "popular": 75,
    "isNew": false
  },
  {
    "id": "book-2",
    "title": "كتاب النحو",
    "icon": "📖",
    "category": "لغة عربية",
    "grade": "الصف الثاني / الثالث الثانوي",
    "description": "الكتاب الدراسي لمادة النحو للصف الثاني الثانوي (PDF).",
    "url": "https://drive.google.com/file/d/1DH8DeZDQqVnYfTovoug5EuGxTpA-7CqR/view?usp=sharing",
    "popular": 75,
    "isNew": false
  },
  {
    "id": "book-3",
    "title": "تأسيس رياضيات",
    "icon": "📐",
    "category": "رياضيات",
    "grade": "الصف الثاني / الثالث الثانوي",
    "description": "مذكرة تأسيس في الرياضيات للصف الثاني الثانوي (PDF).",
    "url": "https://drive.google.com/file/d/1qxqcD6p7RBt19L6EvxMRLa1aore8DmeD/view?usp=sharing",
    "popular": 75,
    "isNew": false
  },
  {
    "id": "book-4",
    "title": "الميسر في أصول الفقه الإسلامي",
    "icon": "📘",
    "category": "مواد شرعية",
    "grade": "الصف الثاني / الثالث الثانوي",
    "description": "كتاب الميسر في أصول الفقه الإسلامي – إعداد: عمر أحمد (PDF).",
    "url": "https://drive.google.com/file/d/1S3guUKhyG89zaRtfRr4HTE_GKc0-gh2Z/view?usp=sharing",
    "popular": 75,
    "isNew": false
  },
  {
    "id": "book-5",
    "title": "ملخص الدرس الأول - التاريخ (بناء الدولة المصرية)",
    "icon": "🏛️",
    "category": "تاريخ",
    "grade": "الصف الثاني / الثالث الثانوي",
    "description": "ملخص الدرس الأول في مادة التاريخ: بناء الدولة المصرية للصف الثاني الثانوي (PDF).",
    "url": "https://drive.google.com/file/d/1qeeYaaEYTOUMXc5DIwZHNEtXMNlhvh-l/view?usp=sharing",
    "popular": 75,
    "isNew": false
  },
  {
    "id": "book-6",
    "title": "الثلاثة الذين خُلِّفوا",
    "icon": "📘",
    "category": "مواد شرعية",
    "grade": "الصف الثاني / الثالث الثانوي",
    "description": "كتاب الثلاثة الذين خُلِّفوا – إعداد: عمر أحمد المنشاوي (PDF).",
    "url": "https://drive.google.com/file/d/1VH8UeFmU4hVWWrQCii4tYwscaspOfvX3/view?usp=sharing",
    "popular": 75,
    "isNew": false
  },
  {
    "id": "book-7",
    "title": "كورس تأسيس رياضة",
    "icon": "🎥",
    "category": "رياضيات",
    "grade": "الصف الثاني / الثالث الثانوي",
    "description": "كورس تأسيس الرياضيات للصف الثاني الثانوي.",
    "url": "https://drive.google.com/file/d/1eZAa1apbXTuTGpokc2oF5MZVLzxrvvi5/view?usp=sharing",
    "popular": 100,
    "isNew": false
  },
  {
    "id": "book-8",
    "title": "الفيزياء",
    "icon": "⚛️",
    "category": "فيزياء",
    "grade": "الصف الثاني / الثالث الثانوي",
    "description": "كتاب الفيزياء للصف الثاني الثانوي (PDF).",
    "url": "https://drive.google.com/file/d/11TRHopBJ1tfw4D26ScOpLGH4ff-Lt0US/view?usp=sharing",
    "popular": 100,
    "isNew": false
  },
  {
    "id": "book-9",
    "title": "الجزء الأول من الكورس التأسيسي للبرمجة",
    "icon": "💻",
    "category": "برمجة",
    "grade": "الصف الثاني / الثالث الثانوي",
    "description": "الجزء الأول من الكورس التأسيسي للبرمجة – إعداد وتجهيز: محمد رمضان الحرباوي.",
    "url": "https://drive.google.com/file/d/1VV4ooxWD_yGBb1atk14ndQ1RmDPPvbgv/view?usp=sharing",
    "popular": 100,
    "isNew": false
  },
  {
    "id": "book-10",
    "title": "الكافي في علوم البلاغة العربية",
    "icon": "📖",
    "category": "لغة عربية",
    "grade": "الصف الثاني / الثالث الثانوي",
    "description": "كتاب الكافي في علوم البلاغة العربية (HTML).",
    "url": "./الكافي_في_علوم_البلاغة_العربية.html",
    "popular": 100,
    "isNew": false
  },
  {
    "id": "book-11",
    "title": "كورس اللغة العربية",
    "icon": "📖",
    "category": "كورسات",
    "grade": "الصف الثاني / الثالث الثانوي",
    "description": "كورس اللغة العربية.",
    "url": "https://mhmdrmdan.yobader.com/course/kors-lghh-aarbyh",
    "popular": 100,
    "isNew": false
  },
  {
    "id": "book-12",
    "title": "كورس اللغة الإنجليزية",
    "icon": "🇬🇧",
    "category": "كورسات",
    "grade": "الصف الثاني / الثالث الثانوي",
    "description": "كورس اللغة الإنجليزية.",
    "url": "https://mhmdrmdan.yobader.com/course/lghh-anglyzyh",
    "popular": 100,
    "isNew": false
  },
  {
    "id": "book-13",
    "title": "كورس الفيزياء",
    "icon": "⚛️",
    "category": "كورسات",
    "grade": "الصف الثاني / الثالث الثانوي",
    "description": "كورس الفيزياء.",
    "url": "https://mhmdrmdan.yobader.com/course/fyzyaaa",
    "popular": 100,
    "isNew": false
  },
  {
    "id": "book-14",
    "title": "كورس التاريخ الوطني",
    "icon": "🏛️",
    "category": "كورسات",
    "grade": "الصف الثاني / الثالث الثانوي",
    "description": "كورس التاريخ الوطني.",
    "url": "https://mhmdrmdan.yobader.com/course/tarykh-otny",
    "popular": 100,
    "isNew": false
  },
  {
    "id": "book-15",
    "title": "كورس البرمجة والذكاء الاصطناعي",
    "icon": "💻",
    "category": "كورسات",
    "grade": "الصف الثاني / الثالث الثانوي",
    "description": "الكورس التأسيسي للبرمجة والذكاء الاصطناعي.",
    "url": "https://mhmdrmdan.yobader.com/course/kors-tasysy-brmgh",
    "popular": 100,
    "isNew": false
  },
  {
    "id": "book-16",
    "title": "أخبار وزارة التربية والتعليم",
    "icon": "📰",
    "category": "كورسات",
    "grade": "الصف الثاني / الثالث الثانوي",
    "description": "آخر الأخبار والحوارات والمعلومات الرسمية.",
    "url": "https://mhmdrmdan.yobader.com/course/ay-akhbar-bkhsos-ozarh-altrbyh-oaltaalym-ontham-albkalorya",
    "popular": 100,
    "isNew": false
  },
  {
    "id": "book-17",
    "title": "امتحان تاريخ - الدرس الأول",
    "icon": "📝",
    "category": "امتحانات",
    "grade": "الصف الثاني / الثالث الثانوي",
    "description": "امتحان على الدرس الأول في مادة التاريخ.",
    "url": "./index (1).html",
    "popular": 100,
    "isNew": false
  },
  {
    "id": "book-18",
    "title": "امتحان النحو",
    "icon": "📝",
    "category": "امتحانات",
    "grade": "الصف الثاني / الثالث الثانوي",
    "description": "امتحان تفاعلي على النحو.",
    "url": "./exam_naho.html",
    "popular": 100,
    "isNew": false
  },
  {
    "id": "book-19",
    "title": "أجمل مذكرة بلاغة للثانوية العامة بصفوفها الثلاثة",
    "icon": "📘",
    "category": "لغة عربية",
    "grade": "الصف الثاني / الثالث الثانوي",
    "description": "مذكرة شاملة في البلاغة للثانوية العامة بجميع الصفوف، مناسبة للمراجعة والتأسيس.",
    "url": "https://drive.google.com/file/d/1rcocqEmuz8sG9SMgXOfzHeeIgpWVsrHf/view?usp=sharing",
    "popular": 100,
    "isNew": false
  },
  {
    "id": "book-20",
    "title": "تأسيس إنجلش - العمالقة 2026",
    "icon": "🇬🇧",
    "category": "إنجليزي",
    "grade": "الصف الثاني / الثالث الثانوي",
    "description": "كتاب تأسيس اللغة الإنجليزية (العمالقة 2026) بصيغة PDF.",
    "url": "https://drive.google.com/file/d/1Vty0yywJ_sPPJ67LFW9ujmtAgZyJ6Ah8/view?usp=sharing",
    "popular": 100,
    "isNew": false
  },
  {
    "id": "book-21",
    "title": "كورس تأسيس إنجليزي - مستر سعيد الهيت",
    "icon": "🇬🇧",
    "category": "إنجليزي",
    "grade": "الصف الثاني / الثالث الثانوي",
    "description": "ملف كورس تأسيسي في اللغة الإنجليزية بصيغة PDF.",
    "url": "https://drive.google.com/file/d/1R7LLcvinGsCPZhK_TvKwvnoq_j9M09BM/view?usp=sharing",
    "popular": 100,
    "isNew": false
  },
  {
    "id": "book-22",
    "title": "الحصة التمهيدية",
    "icon": "🎥",
    "category": "برمجة",
    "grade": "الصف الثاني / الثالث الثانوي",
    "description": "الحصة التمهيدية.",
    "url": "https://drive.google.com/file/d/1MJRgmiCFnfQU4whC7wDTtW42VcZyYXE9/view?usp=sharing",
    "popular": 100,
    "isNew": false
  },
  {
    "id": "book-23",
    "title": "ترسيخ العقيدة الإسلامية - 2",
    "icon": "📘",
    "category": "مواد شرعية",
    "grade": "الصف الثاني / الثالث الثانوي",
    "description": "كتاب ترسيخ العقيدة الإسلامية - 2.",
    "url": "./ترسيخ_العقيدة_الإسلامية-2.html",
    "popular": 100,
    "isNew": false
  },
  {
    "id": "book-24",
    "title": "قاموس الفكيكه",
    "icon": "📖",
    "category": "إنجليزي",
    "grade": "الصف الثاني / الثالث الثانوي",
    "description": "قاموس الفكيكه.",
    "url": "./قاموس الفكيكه.html",
    "popular": 100,
    "isNew": false
  },
  {
    "id": "book-25",
    "title": "كتاب كيان لغة عربية تانية بكالوريا",
    "icon": "📖",
    "category": "لغة عربية",
    "grade": "الصف الثاني / الثالث الثانوي",
    "description": "كتاب كيان للغة العربية لطلاب تانية بكالوريا.",
    "url": "https://drive.google.com/file/d/1aXVTBXMEb7suoapqTZjHbLnBGPIWyPui/view?usp=sharing",
    "popular": 110,
    "isNew": false
  },
  {
    "id": "book-26",
    "title": "كتاب العمالقة سنة تانية بكالوريا - الجزء الثاني 2027",
    "icon": "🇬🇧",
    "category": "إنجليزي",
    "grade": "الصف الثاني / الثالث الثانوي",
    "description": "كتاب العمالقة للصف الثاني الثانوي بكالوريا – الجزء الثاني 2027.",
    "url": "https://drive.google.com/file/d/1mZIXzZD5DaskdzvVEGXrM0DZxCw7WhY3/view?usp=sharing",
    "popular": 110,
    "isNew": false
  },
  {
    "id": "book-27",
    "title": "الثقافة المالية PDF تانية بكالوريا",
    "icon": "💰",
    "category": "ثقافة مالية",
    "grade": "الصف الثاني / الثالث الثانوي",
    "description": "ملف الثقافة المالية PDF لطلاب تانية بكالوريا.",
    "url": "https://drive.google.com/file/d/1POmeADij1wPo-5c2FbusKZa3bYibfqPB/view?usp=sharing",
    "popular": 110,
    "isNew": false
  },
  {
    "id": "book-28",
    "title": "إجابات_المعاصر_تانية_ثانوي_بكالوريا_الترم_الاول_2027",
    "icon": "✅",
    "category": "إنجليزي",
    "grade": "الصف الثاني / الثالث الثانوي",
    "description": "إجابات المعاصر تانية ثانوي بكالوريا – الترم الأول 2027.",
    "url": "https://drive.google.com/file/d/1VXSqXuikXpknsXYEoQgCY4mIPj3LHjSd/view?usp=sharing",
    "popular": 110,
    "isNew": false
  },
  {
    "id": "book-29",
    "title": "ملحق_المعاصر_انجليزي_2ث_بكالوريا_الترم_الاول_2027",
    "icon": "📎",
    "category": "إنجليزي",
    "grade": "الصف الثاني / الثالث الثانوي",
    "description": "ملحق المعاصر إنجليزي 2 ث بكالوريا – الترم الأول 2027.",
    "url": "https://drive.google.com/file/d/1IxXRUpuJ-uzYiycTzFX33Qy8g43eE34I/view?usp=sharing",
    "popular": 110,
    "isNew": false
  },
  {
    "id": "book-30",
    "title": "كتاب_المعاصر_انجليزي_2بكالوريا_2027_ترم1",
    "icon": "📘",
    "category": "إنجليزي",
    "grade": "الصف الثاني / الثالث الثانوي",
    "description": "كتاب المعاصر إنجليزي 2 بكالوريا 2027 – الترم الأول.",
    "url": "https://drive.google.com/file/d/1uftB4n53TRWacPzTe7Kmv_HHGLLslZ7q/view?usp=sharing",
    "popular": 110,
    "isNew": false
  },
  {
    "id": "book-31",
    "title": "كتاب الإنجليزي العمالقة - الجزء الأول",
    "icon": "🇬🇧",
    "category": "إنجليزي",
    "grade": "الصف الثاني / الثالث الثانوي",
    "description": "كتاب الإنجليزي العمالقة – الجزء الأول.",
    "url": "https://drive.google.com/file/d/1WhYUKpIivmpWmLqf-h1idF2HcjJxlIWQ/view?usp=sharing",
    "popular": 110,
    "isNew": false
  },
  {
    "id": "book-32",
    "title": "كتاب الأضواء تاريخ تانية بكالوريا",
    "icon": "🏛️",
    "category": "تاريخ",
    "grade": "الصف الثاني / الثالث الثانوي",
    "description": "كتاب الأضواء لمادة التاريخ لطلاب تانية بكالوريا.",
    "url": "https://drive.google.com/file/d/1_BBe00y41IfyNfPWKYMvol_WqqPsDd_D/view?usp=sharing",
    "popular": 110,
    "isNew": false
  },
  {
    "id": "book-33",
    "title": "كتاب الامتحان لغة عربية - الجزء الأول 2027",
    "icon": "📕",
    "category": "لغة عربية",
    "grade": "الصف الثاني / الثالث الثانوي",
    "description": "الجزء الأول من سلسلة كتاب الامتحان في اللغة العربية – 2027.",
    "url": "https://drive.google.com/file/d/14W9FiVD8F1TVMlxlGMwfGqJw5USehBEJ/view?usp=sharing",
    "popular": 110,
    "isNew": false
  },
  {
    "id": "book-34",
    "title": "كتاب الامتحان لغة عربية - الجزء الثاني 2027",
    "icon": "📕",
    "category": "لغة عربية",
    "grade": "الصف الثاني / الثالث الثانوي",
    "description": "الجزء الثاني من سلسلة كتاب الامتحان في اللغة العربية – 2027.",
    "url": "https://drive.google.com/file/d/107Obccz6RVtYLDwiHHYKUm8PwCzjQuh-/view?usp=sharing",
    "popular": 110,
    "isNew": false
  },
  {
    "id": "book-35",
    "title": "كتاب الامتحان لغة عربية - الجزء الثالث 2027",
    "icon": "📕",
    "category": "لغة عربية",
    "grade": "الصف الثاني / الثالث الثانوي",
    "description": "الجزء الثالث من سلسلة كتاب الامتحان في اللغة العربية – 2027.",
    "url": "https://drive.google.com/file/d/1GvsB2L0-S9ZpZaGKwkF_txFOUXy6N78H/view?usp=sharing",
    "popular": 110,
    "isNew": false
  },
  {
    "id": "book-36",
    "title": "المواد كاملة 🍒🫂 🤍",
    "icon": "📚",
    "category": "المواد كاملة",
    "grade": "الصف الثاني / الثالث الثانوي",
    "description": "مجلد Google Drive شامل يحتوي على المواد كاملة.",
    "url": "https://drive.google.com/drive/folders/1mgk5MoazbJ1uUzL3zvvfzltQUOXQoTM2",
    "popular": 120,
    "isNew": false
  },
  {
    "id": "book-37",
    "title": "العمالقة English-part 3 🩶",
    "icon": "🇬🇧",
    "category": "إنجليزي",
    "grade": "الصف الثاني / الثالث الثانوي",
    "description": "كتاب العمالقة English-part 3 لطلاب تانية بكالوريا.",
    "url": "https://drive.google.com/file/d/1O0JFW5vkMSa2Xk-bVo0kH4YFLbRGuwVw/view?usp=drivesdk",
    "popular": 130,
    "isNew": false
  },
  {
    "id": "book-38",
    "title": "محمد صلاح - قاف ثاء 2ث بكالوريا 2027",
    "icon": "📘",
    "category": "لغة عربية",
    "grade": "الصف الثاني / الثالث الثانوي",
    "description": "كتاب محمد صلاح قاف ثاء لطلاب تانية بكالوريا 2027.",
    "url": "https://drive.google.com/file/d/14RSmYlYUWrc0isvDxRwPiPUT69uyYdU1/view?usp=sharing",
    "popular": 140,
    "isNew": false
  },
  {
    "id": "book-39",
    "title": "محمد صلاح - طلع الأديب 2ث بكالوريا 2027",
    "icon": "📖",
    "category": "لغة عربية",
    "grade": "الصف الثاني / الثالث الثانوي",
    "description": "كتاب محمد صلاح طلع الأديب لطلاب تانية بكالوريا 2027.",
    "url": "https://drive.google.com/file/d/1jM6yP51mwDzY_wh2yZJmATyDgbP5Dd8V/view?usp=drivesdk",
    "popular": 140,
    "isNew": false
  },
  {
    "id": "book-40",
    "title": "محمد صلاح - روائع الأدب 2ث بكالوريا 2027",
    "icon": "📚",
    "category": "لغة عربية",
    "grade": "الصف الثاني / الثالث الثانوي",
    "description": "كتاب محمد صلاح روائع الأدب لطلاب تانية بكالوريا 2027.",
    "url": "https://drive.google.com/file/d/1JXg9Rt1bam18hNNfBcnLHazK_DMlQ3Lf/view?usp=drivesdk",
    "popular": 140,
    "isNew": false
  },
  {
    "id": "book-41",
    "title": "محمد صلاح - شرح الجزء الأول 2ث بكالوريا 2027",
    "icon": "📕",
    "category": "لغة عربية",
    "grade": "الصف الثاني / الثالث الثانوي",
    "description": "شرح الجزء الأول من كتاب محمد صلاح لطلاب تانية بكالوريا 2027.",
    "url": "https://drive.google.com/file/d/1aMLqGD5luF15_fgbA1ZV8wlM0Zujf-nA/view?usp=drivesdk",
    "popular": 140,
    "isNew": false
  },
  {
    "id": "book-42",
    "title": "محمد صلاح - شرح الجزء الثاني 2ث بكالوريا 2027",
    "icon": "📕",
    "category": "لغة عربية",
    "grade": "الصف الثاني / الثالث الثانوي",
    "description": "شرح الجزء الثاني من كتاب محمد صلاح لطلاب تانية بكالوريا 2027.",
    "url": "https://drive.google.com/file/d/1MjwFpiFdh2QIoFQabXVpgbilDEOewJuw/view?usp=drivesdk",
    "popular": 140,
    "isNew": false
  },
  {
    "id": "book-43",
    "title": "شرح البلاغة كاملةً (سلسلة التميز) - 1",
    "icon": "📘",
    "category": "لغة عربية",
    "grade": "الصف الثاني / الثالث الثانوي",
    "description": "شرح البلاغة كاملةً (سلسلة التميز) - الجزء الأول، برعاية محمد رمضان الحرباوي.",
    "url": "https://drive.google.com/file/d/1qNCxHDF7CDOAkeiGxlMnH204PGE4F5Bo/view?usp=drivesdk",
    "popular": 145,
    "isNew": false
  },
  {
    "id": "book-44",
    "title": "كتاب ملخص فيزياء تانية بكالوريا",
    "icon": "⚡",
    "category": "فيزياء",
    "grade": "الصف الثاني / الثالث الثانوي",
    "description": "كتاب ملخص فيزياء تانية بكالوريا، برعاية محمد رمضان الحرباوي.",
    "url": "https://drive.google.com/file/d/1JfC-a11Pc9HzjWJPOc3VBiyD03bCLFLJ/view?usp=sharing",
    "popular": 150,
    "isNew": false
  },
  {
    "id": "book-45",
    "title": "كتاب الوافي (فيزياء)",
    "icon": "⚡",
    "category": "فيزياء",
    "grade": "الصف الثاني / الثالث الثانوي",
    "description": "كتاب الوافي في مادة الفيزياء لطلاب تانية بكالوريا.",
    "url": "https://drive.google.com/file/d/1uAjEZbJaGiipdR-cnwo8XCt2H2HaKsVM/view?usp=drivesdk",
    "popular": 150,
    "isNew": false
  },
  {
    "id": "book-46",
    "title": "كتاب المستر مهاب سلامة - تاريخ وطني تانية بكالوريا",
    "icon": "🏛️",
    "category": "تاريخ",
    "grade": "الصف الثاني / الثالث الثانوي",
    "description": "كتاب المستر مهاب سلامة في مادة التاريخ الوطني لطلاب تانية بكالوريا، برعاية محمد رمضان الحرباوي.",
    "url": "https://drive.google.com/file/d/17c5i9X5ByrbGk8lHmr94B_zIQSED4ZKT/view?usp=sharing",
    "popular": 0,
    "isNew": false
  },
  {
    "id": "book-47",
    "title": "كتاب الفائز - برمجه تانيه بكالوريا",
    "icon": "💻",
    "category": "برمجة",
    "grade": "الصف الثاني / الثالث الثانوي",
    "description": "كتاب الفائز - برمجه تانيه بكالوريا، برعاية محمد رمضان الحرباوي.",
    "url": "https://drive.google.com/file/d/1Qkszte2tWQQ14rHyPgtJEYbQEEVCuaAS/view?usp=sharing",
    "popular": 155,
    "isNew": false
  },
  {
    "id": "book-48",
    "title": "كتاب الثقافة المالية - تانية بكالوريا 2027",
    "icon": "💰",
    "category": "ثقافة مالية",
    "grade": "الصف الثاني / الثالث الثانوي",
    "description": "كتاب الثقافة المالية لطلاب تانية بكالوريا 2027.",
    "url": "https://drive.google.com/file/d/12krhB3csGMy3mR7V9il0qm9bntBrzbdc/view?usp=sharing",
    "popular": 160,
    "isNew": false
  },
  {
    "id": "book-49",
    "title": "طريقة حل أي سؤال فقرة حجاجية",
    "icon": "📝",
    "category": "لغة عربية",
    "grade": "الصف الثاني / الثالث الثانوي",
    "description": "ملف تدريبي يوضح طريقة حل أي سؤال فقرة حجاجية، للطلاب، برعاية محمد رمضان الحرباوي.",
    "url": "https://drive.google.com/file/d/10FTGkSReUakong6IJJ1CMNHBohdMETUc/view?usp=drivesdk",
    "popular": 165,
    "isNew": false
  },
  {
    "id": "book-50",
    "title": "بعض التدريبات على الفقرة الحجاجية",
    "icon": "✏️",
    "category": "لغة عربية",
    "grade": "الصف الثاني / الثالث الثانوي",
    "description": "ملف تدريبات على الفقرة الحجاجية، برعاية محمد رمضان الحرباوي.",
    "url": "https://drive.google.com/file/d/1AmRO8uXtpQsceY_O8tpUSqj-N8v6_IHd/view?usp=drivesdk",
    "popular": 165,
    "isNew": false
  },
  {
    "id": "book-51",
    "title": "كتاب أ. محمد عبدالمعبود فيزياء - تانية بكالوريا - جزء الشرح",
    "icon": "⚡",
    "category": "فيزياء",
    "grade": "الصف الثاني / الثالث الثانوي",
    "description": "جزء الشرح من كتاب أ. محمد عبدالمعبود فيزياء لطلاب تانية بكالوريا، برعاية محمد رمضان الحرباوي.",
    "url": "https://drive.google.com/file/d/1ebJ6H2QfJZkpWANKYQu8qEsnlC6RLHcV/view?usp=sharing",
    "popular": 170,
    "isNew": false
  },
  {
    "id": "book-52",
    "title": "كتاب عبدالمعبود - أسئلة - تانية بكالوريا 2026 - الترم الأول",
    "icon": "📝",
    "category": "فيزياء",
    "grade": "الصف الثاني / الثالث الثانوي",
    "description": "جزء الأسئلة من كتاب عبدالمعبود فيزياء لطلاب تانية بكالوريا 2026 - الترم الأول، برعاية محمد رمضان الحرباوي.",
    "url": "https://drive.google.com/file/d/1yjCTonMjOL2S_ZyXSCOMAkG4otglNzWG/view?usp=sharing",
    "popular": 170,
    "isNew": false
  },
  {
    "id": "book-53",
    "title": "كتاب الامتحان تاريخ - تانية بكالوريا",
    "icon": "🏛️",
    "category": "تاريخ",
    "grade": "الصف الثاني / الثالث الثانوي",
    "description": "كتاب الامتحان في مادة التاريخ لطلاب تانية بكالوريا، برعاية محمد رمضان الحرباوي.",
    "url": "https://drive.google.com/file/d/1RCnANotlh94UtFPWnU0_9ooCcQk_DRid/view?usp=sharing",
    "popular": 175,
    "isNew": false
  }
];

export const DEFAULT_EVALUATIONS: EvaluationItem[] = [
  {
    id: 'eval-1',
    subject: 'اللغة العربية',
    icon: '📖',
    week: 'الأسبوع الأول',
    title: 'تقييم النحو والبلاغة - الأسبوع 1',
    url: 'https://drive.google.com/file/d/1IxPP_VsH2Wom8T5n3IyPduudFXd3-DSc/view?usp=sharing',
    solutionUrl: 'https://drive.google.com/file/d/1DH8DeZDQqVnYfTovoug5EuGxTpA-7CqR/view?usp=sharing'
  },
  {
    id: 'eval-2',
    subject: 'اللغة العربية',
    icon: '📖',
    week: 'الأسبوع الثاني',
    title: 'واجب القراءة المتحررة والتعبير - الأسبوع 2',
    url: 'https://drive.google.com/file/d/1IxPP_VsH2Wom8T5n3IyPduudFXd3-DSc/view?usp=sharing',
    solutionUrl: 'https://drive.google.com/file/d/1DH8DeZDQqVnYfTovoug5EuGxTpA-7CqR/view?usp=sharing'
  },
  {
    id: 'eval-3',
    subject: 'التاريخ',
    icon: '🏛️',
    week: 'الأسبوع الأول',
    title: 'تقييم الدرس الأول: الحملة الفرنسية وأثرها',
    url: 'https://drive.google.com/file/d/1JQlVNklrEfleYtSSgntUNfUrP09mWhEu/view?usp=sharing',
    solutionUrl: 'https://drive.google.com/file/d/1qeeYaaEYTOUM4J9y3y_i92jA6nB8_eY/view?usp=sharing'
  },
  {
    id: 'eval-4',
    subject: 'الرياضيات',
    icon: '📐',
    week: 'الأسبوع الأول',
    title: 'تقييم النهايات والاتصال - الأسبوع 1',
    url: 'https://drive.google.com/file/d/1qxqcD6p7RBt19L6EvxMRLa1aore8DmeD/view?usp=sharing',
    solutionUrl: 'https://drive.google.com/file/d/1qxqcD6p7RBt19L6EvxMRLa1aore8DmeD/view?usp=sharing'
  },
  {
    id: 'eval-5',
    subject: 'الفيزياء',
    icon: '⚡',
    week: 'الأسبوع الثاني',
    title: 'تقييم التيار الكهربي وتوصيل المقاومات',
    url: 'https://drive.google.com/file/d/1bC-17hC06L05p3w37gJkY8r6vY-fS99L/view?usp=sharing',
    solutionUrl: 'https://drive.google.com/file/d/1bC-17hC06L05p3w37gJkY8r6vY-fS99L/view?usp=sharing'
  }
];

export const DEFAULT_EXAM: ExamItem = {
  id: 'exam-naho-1',
  title: 'امتحان النحو الشامل (التطبيقي)',
  subject: 'لغة عربية',
  timeLimit: 15,
  questions: [
    {
      cat: 'الفاعل',
      q: 'في الجملة: (أكَلَ الولدُ التفاحةَ) — ما إعراب كلمة (الولدُ)؟',
      opts: ['فاعل مرفوع بالضمة', 'مبتدأ مرفوع', 'نائب فاعل مرفوع', 'مفعول به منصوب'],
      ans: 0,
      exp: 'الولدُ: فاعل مرفوع وعلامة رفعه الضمة الظاهرة لأنه من قام بالفعل.'
    },
    {
      cat: 'المفعول به',
      q: 'في الجملة: (شرِبَ الطالبُ الماءَ) — ما إعراب (الماءَ)؟',
      opts: ['فاعل مرفوع', 'مفعول به منصوب بالفتحة', 'مبتدأ مؤخر', 'تمييز منصوب'],
      ans: 1,
      exp: 'الماءَ: مفعول به منصوب وعلامة نصبه الفتحة الظاهرة لأنه وقع عليه فعل الفاعل.'
    },
    {
      cat: 'نائب الفاعل',
      q: 'في الجملة: (كُسِرَ الزجاجُ) — ما إعراب (الزجاجُ)؟',
      opts: ['فاعل مرفوع', 'مبتدأ مرفوع', 'نائب فاعل مرفوع بالضمة', 'خبر مرفوع'],
      ans: 2,
      exp: 'الزجاجُ: نائب فاعل مرفوع لأن الفعل (كُسِرَ) مبني للمجهول مضموم أوله مكسور ما قبل آخره.'
    },
    {
      cat: 'كان وأخواتها',
      q: 'في الجملة: (كانَ الجوُّ باردًا) — ما إعراب كلمة (باردًا)؟',
      opts: ['خبر كان منصوب بالفتحة', 'اسم كان مرفوع', 'حال منصوب', 'نعت منصوب'],
      ans: 0,
      exp: 'باردًا: خبر كان منصوب وعلامة نصبه الفتحة، وكان ترفع المبتدأ وتنصب الخبر.'
    },
    {
      cat: 'إنّ وأخواتها',
      q: 'في الجملة: (إنَّ الحقَّ منتصرٌ) — ما إعراب كلمة (الحقَّ)؟',
      opts: ['اسم إنّ منصوب بالفتحة', 'خبر إنّ مرفوع', 'مبتدأ منصوب', 'فاعل مرفوع'],
      ans: 0,
      exp: 'الحقَّ: اسم إنّ منصوب وعلامة نصبه الفتحة الظاهرة.'
    },
    {
      cat: 'الحال',
      q: 'في الجملة: (جاءَ المعلمُ مسرورًا) — ما إعراب كلمة (مسرورًا)؟',
      opts: ['مفعول به', 'تمييز منصوب', 'حال منصوبة بالفتحة', 'نعت مرفوع'],
      ans: 2,
      exp: 'مسرورًا: حال منصوبة بالفتحة تبين هيئة الفاعل حين وقوع الفعل.'
    },
    {
      cat: 'التمييز',
      q: 'في الجملة: (اشتريتُ عشرينَ كتابًا) — ما إعراب كلمة (كتابًا)؟',
      opts: ['مفعول به', 'تمييز منصوب بالفتحة', 'حال منصوب', 'مضاف إليه مجرور'],
      ans: 1,
      exp: 'كتابًا: تمييز ملفوظ منصوب بالفتحة بعد العدد من 11 إلى 99 يكون مفرداً منصوباً.'
    },
    {
      cat: 'المستثنى',
      q: 'في الجملة: (حضرَ الطلابُ إلا زيدًا) — ما حكم إعراب (زيدًا)؟',
      opts: ['مستثنى واجب النصب بالفتحة', 'بدل مرفوع', 'مفعول به', 'فاعل مؤخر'],
      ans: 0,
      exp: 'زيدًا: مستثنى منصوب وجوباً لأن الكلام تام مثبت.'
    }
  ]
};

export const DEFAULT_ANNOUNCEMENTS: AnnouncementItem[] = [
  {
    id: 'ann-1',
    title: 'مرحباً بطلاب تانية بكالوريا والثانوية العامة',
    content: 'تم تحديث جميع كتب الوزارة والتقييمات الأسبوعية ونماذج الإجابة النموذجية لكافة المواد والشعب.',
    category: 'تنبيه عام',
    date: 'اليوم'
  },
  {
    id: 'ann-2',
    title: 'بدء نشر تقييمات الأسبوع الثالث والواجبات المدرسية',
    content: 'يمكنكم تحميل أوراق العمل وتقييمات الأسبوع الثالث من قسم التقييمات مع الحلول المعتمدة.',
    category: 'واجب مدرسي',
    date: 'أمس'
  }
];

export const DEFAULT_VIDEOS: VideoItem[] = [
  {
    id: "vid-legacy-1",
    title: "شرح القضايا الأخلاقية - علم النفس - تانية بكالوريا أزهر",
    category: "علم نفس وفلسفة",
    subCategory: "شرح ومراجعة",
    grade: "تانية بكالوريا / الصف الثاني الثانوي",
    description: "شرح القضايا الأخلاقية لطلاب علم النفس - تانية بكالوريا أزهر.",
    videoUrl: "https://youtu.be/j-G3uMRtOwo?si=OATvFP-xhg6fMIC9",
    duration: "شرح كامل",
    attachments: [
      {
            "id": "att-ps-1",
            "title": "مذكرة القضايا الأخلاقية وعلم النفس للثانوية (PDF)",
            "url": "https://drive.google.com/file/d/1PsYch0L0gyM0dUl3P0rtal2027G00gl/view?usp=sharing",
            "type": "pdf"
      }
],
    teacherNotes: "برعاية وتطوير: محمد رمضان الحرباوي • ركز على النقاط الأساسية ودونها في قسم الملاحظات أدناه.",
    createdAt: "2026-09-10T12:00:00Z",
    createdBy: "محمد رمضان الحرباوي"
  },
  {
    id: "vid-legacy-2",
    title: "شرح القضايا الأخلاقية في البرمجة - لغة عربية",
    category: "لغة عربية",
    subCategory: "شرح ومراجعة",
    grade: "تانية بكالوريا / الصف الثاني الثانوي",
    description: "شرح القضايا الأخلاقية في البرمجة في أقل من ربع ساعة 🔥 التحيز الخوارزمي والخصوصية وبيانات التدريب مع أ/ سعيد السيد.",
    videoUrl: "https://youtu.be/vK6Mc680FKM?si=2p8DJp-U1gEcqbX2",
    duration: "شرح كامل",
    attachments: [
      {
            "id": "att-ar-1",
            "title": "كتاب النحو الوزاري للصف الثاني الثانوي (PDF)",
            "url": "https://drive.google.com/file/d/1DH8DeZDQqVnYfTovoug5EuGxTpA-7CqR/view?usp=sharing",
            "type": "pdf"
      },
      {
            "id": "att-ar-2",
            "title": "أوراق تقييمات الأسبوع والواجبات - لغة عربية (PDF)",
            "url": "https://drive.google.com/file/d/144Pz95q914wZ38_0kU8oB55qU8n7L93e/view?usp=sharing",
            "type": "pdf"
      }
],
    teacherNotes: "برعاية وتطوير: محمد رمضان الحرباوي • ركز على النقاط الأساسية ودونها في قسم الملاحظات أدناه.",
    createdAt: "2026-09-10T12:00:00Z",
    createdBy: "محمد رمضان الحرباوي"
  },
  {
    id: "vid-legacy-3",
    title: "شرح القضايا الأخلاقية في البرمجة - لغات",
    category: "لغة إنجليزية",
    subCategory: "شرح ومراجعة",
    grade: "تانية بكالوريا / الصف الثاني الثانوي",
    description: "شرح القضايا الأخلاقية في البرمجة في أقل من ربع ساعة 🔥 التحيز الخوارزمي والخصوصية وبيانات التدريب مع أ/ سعيد السيد.",
    videoUrl: "https://youtu.be/DcKwJXn9mf8?si=oBj2SQqsKGLegvej",
    duration: "شرح كامل",
    attachments: [
      {
            "id": "att-en-1",
            "title": "كتاب اللغة الإنجليزية والمفردات وقواعد الترجمة (PDF)",
            "url": "https://drive.google.com/file/d/1EnGl1shB00k2027ThnwyaP0rtalG00gl/view?usp=sharing",
            "type": "pdf"
      }
],
    teacherNotes: "برعاية وتطوير: محمد رمضان الحرباوي • ركز على النقاط الأساسية ودونها في قسم الملاحظات أدناه.",
    createdAt: "2026-09-10T12:00:00Z",
    createdBy: "محمد رمضان الحرباوي"
  },
  {
    id: "vid-legacy-4",
    title: "الفيديو التعليمي الأول",
    category: "تحفيز وتوجيه",
    subCategory: "تحفيز وتوجيه",
    grade: "تانية بكالوريا / الصف الثاني الثانوي",
    description: "فيديو تحفيزي لطلاب البكالوريا.",
    videoUrl: "https://youtu.be/ZF7WMdoBdO8?si=yNjB7hTj58dsf7fd",
    duration: "شرح كامل",
    attachments: [
      {
            "id": "att-mo-1",
            "title": "دليل التفوق وإدارة وتنظيم وقت المذاكرة (PDF)",
            "url": "https://drive.google.com/file/d/1Gu1dETfWqThnwyaP0rtal2027G00gl/view?usp=sharing",
            "type": "pdf"
      }
],
    teacherNotes: "برعاية وتطوير: محمد رمضان الحرباوي • ركز على النقاط الأساسية ودونها في قسم الملاحظات أدناه.",
    createdAt: "2026-09-10T12:00:00Z",
    createdBy: "محمد رمضان الحرباوي"
  },
  {
    id: "vid-legacy-5",
    title: "الفيديو التعليمي الثاني",
    category: "تحفيز وتوجيه",
    subCategory: "تحفيز وتوجيه",
    grade: "تانية بكالوريا / الصف الثاني الثانوي",
    description: "فيديو تحفيزي لطلاب البكالوريا.",
    videoUrl: "https://youtu.be/VVZy0y6xJcc?si=0W7Vbc_TD-D7lfZK",
    duration: "شرح كامل",
    attachments: [
      {
            "id": "att-mo-1",
            "title": "دليل التفوق وإدارة وتنظيم وقت المذاكرة (PDF)",
            "url": "https://drive.google.com/file/d/1Gu1dETfWqThnwyaP0rtal2027G00gl/view?usp=sharing",
            "type": "pdf"
      }
],
    teacherNotes: "برعاية وتطوير: محمد رمضان الحرباوي • ركز على النقاط الأساسية ودونها في قسم الملاحظات أدناه.",
    createdAt: "2026-09-10T12:00:00Z",
    createdBy: "محمد رمضان الحرباوي"
  },
  {
    id: "vid-legacy-6",
    title: "الفيديو التعليمي الثالث",
    category: "تحفيز وتوجيه",
    subCategory: "تحفيز وتوجيه",
    grade: "تانية بكالوريا / الصف الثاني الثانوي",
    description: "فيديو تحفيزي لطلاب البكالوريا.",
    videoUrl: "https://www.youtube.com/embed/9D9GmbkdkME?si=6MUCwqMp4zu_EAvK",
    duration: "شرح كامل",
    attachments: [
      {
            "id": "att-mo-1",
            "title": "دليل التفوق وإدارة وتنظيم وقت المذاكرة (PDF)",
            "url": "https://drive.google.com/file/d/1Gu1dETfWqThnwyaP0rtal2027G00gl/view?usp=sharing",
            "type": "pdf"
      }
],
    teacherNotes: "برعاية وتطوير: محمد رمضان الحرباوي • ركز على النقاط الأساسية ودونها في قسم الملاحظات أدناه.",
    createdAt: "2026-09-10T12:00:00Z",
    createdBy: "محمد رمضان الحرباوي"
  },
  {
    id: "vid-legacy-7",
    title: "تحفيز طلاب البكالوريا والثانوية العامة",
    category: "تحفيز وتوجيه",
    subCategory: "تحفيز وتوجيه",
    grade: "تانية بكالوريا / الصف الثاني الثانوي",
    description: "قسم تحفيزي لطلاب البكالوريا وطلاب الثانوية العامة.",
    videoUrl: "https://youtu.be/UuStwCzzcD8?si=xHju3r-u8ec8hUTb",
    duration: "شرح كامل",
    attachments: [
      {
            "id": "att-mo-1",
            "title": "دليل التفوق وإدارة وتنظيم وقت المذاكرة (PDF)",
            "url": "https://drive.google.com/file/d/1Gu1dETfWqThnwyaP0rtal2027G00gl/view?usp=sharing",
            "type": "pdf"
      }
],
    teacherNotes: "برعاية وتطوير: محمد رمضان الحرباوي • ركز على النقاط الأساسية ودونها في قسم الملاحظات أدناه.",
    createdAt: "2026-09-10T12:00:00Z",
    createdBy: "محمد رمضان الحرباوي"
  },
  {
    id: "vid-legacy-8",
    title: "قرآن كريم",
    category: "قرآن كريم",
    subCategory: "تحفيز وتوجيه",
    grade: "تانية بكالوريا / الصف الثاني الثانوي",
    description: "قرآن كريم.",
    videoUrl: "https://youtu.be/YhjjkHSYzaM?si=xvkNraI_1bB3Uw0g",
    duration: "شرح كامل",
    attachments: [
      {
            "id": "att-qr-1",
            "title": "المصحف الشريف المرتل والأدعية المختارة (PDF)",
            "url": "https://drive.google.com/file/d/1QrAnM0shafThnwyaP0rtal2027G00gl/view?usp=sharing",
            "type": "pdf"
      }
],
    teacherNotes: "برعاية وتطوير: محمد رمضان الحرباوي • ركز على النقاط الأساسية ودونها في قسم الملاحظات أدناه.",
    createdAt: "2026-09-10T12:00:00Z",
    createdBy: "محمد رمضان الحرباوي"
  },
  {
    id: "vid-legacy-9",
    title: "تلاوة هادئة",
    category: "قرآن كريم",
    subCategory: "تحفيز وتوجيه",
    grade: "تانية بكالوريا / الصف الثاني الثانوي",
    description: "تلاوة هادئة من القرآن الكريم.",
    videoUrl: "https://youtu.be/dN_wUpDgQzM?si=-LPSNPIhjtWB2Po2",
    duration: "شرح كامل",
    attachments: [
      {
            "id": "att-qr-1",
            "title": "المصحف الشريف المرتل والأدعية المختارة (PDF)",
            "url": "https://drive.google.com/file/d/1QrAnM0shafThnwyaP0rtal2027G00gl/view?usp=sharing",
            "type": "pdf"
      }
],
    teacherNotes: "برعاية وتطوير: محمد رمضان الحرباوي • ركز على النقاط الأساسية ودونها في قسم الملاحظات أدناه.",
    createdAt: "2026-09-10T12:00:00Z",
    createdBy: "محمد رمضان الحرباوي"
  },
  {
    id: "vid-legacy-10",
    title: "قرآن كريم",
    category: "قرآن كريم",
    subCategory: "تحفيز وتوجيه",
    grade: "تانية بكالوريا / الصف الثاني الثانوي",
    description: "تلاوة من القرآن الكريم.",
    videoUrl: "https://youtu.be/EfvyfQWF5LQ?si=Xizo1j4X7dxXUa2g",
    duration: "شرح كامل",
    attachments: [
      {
            "id": "att-qr-1",
            "title": "المصحف الشريف المرتل والأدعية المختارة (PDF)",
            "url": "https://drive.google.com/file/d/1QrAnM0shafThnwyaP0rtal2027G00gl/view?usp=sharing",
            "type": "pdf"
      }
],
    teacherNotes: "برعاية وتطوير: محمد رمضان الحرباوي • ركز على النقاط الأساسية ودونها في قسم الملاحظات أدناه.",
    createdAt: "2026-09-10T12:00:00Z",
    createdBy: "محمد رمضان الحرباوي"
  },
  {
    id: "vid-legacy-11",
    title: "حل تقييم الأسبوع الأول - لغة عربية برعاية محمد رمضان الحرباوي",
    category: "لغة عربية",
    subCategory: "حل التقييمات والواجبات",
    grade: "تانية بكالوريا / الصف الثاني الثانوي",
    description: "حل تقييم الأسبوع الأول - لغة عربية برعاية محمد رمضان الحرباوي.",
    videoUrl: "https://youtu.be/7d7zqJkAW-4?si=2SeV64h2rqhsRezZ",
    duration: "شرح كامل",
    attachments: [
      {
            "id": "att-ar-1",
            "title": "كتاب النحو الوزاري للصف الثاني الثانوي (PDF)",
            "url": "https://drive.google.com/file/d/1DH8DeZDQqVnYfTovoug5EuGxTpA-7CqR/view?usp=sharing",
            "type": "pdf"
      },
      {
            "id": "att-ar-2",
            "title": "أوراق تقييمات الأسبوع والواجبات - لغة عربية (PDF)",
            "url": "https://drive.google.com/file/d/144Pz95q914wZ38_0kU8oB55qU8n7L93e/view?usp=sharing",
            "type": "pdf"
      }
],
    teacherNotes: "برعاية وتطوير: محمد رمضان الحرباوي • ركز على النقاط الأساسية ودونها في قسم الملاحظات أدناه.",
    createdAt: "2026-09-10T12:00:00Z",
    createdBy: "محمد رمضان الحرباوي"
  },
  {
    id: "vid-legacy-12",
    title: "حل الأداء الصفي والمنزلي - لغة عربية",
    category: "لغة عربية",
    subCategory: "حل التقييمات والواجبات",
    grade: "تانية بكالوريا / الصف الثاني الثانوي",
    description: "حل الأداء الصفي والمنزلي - لغة عربية.",
    videoUrl: "https://youtu.be/qk_i7oYZScU?si=VH6T7dxhENwjZTEs",
    duration: "شرح كامل",
    attachments: [
      {
            "id": "att-ar-1",
            "title": "كتاب النحو الوزاري للصف الثاني الثانوي (PDF)",
            "url": "https://drive.google.com/file/d/1DH8DeZDQqVnYfTovoug5EuGxTpA-7CqR/view?usp=sharing",
            "type": "pdf"
      },
      {
            "id": "att-ar-2",
            "title": "أوراق تقييمات الأسبوع والواجبات - لغة عربية (PDF)",
            "url": "https://drive.google.com/file/d/144Pz95q914wZ38_0kU8oB55qU8n7L93e/view?usp=sharing",
            "type": "pdf"
      }
],
    teacherNotes: "برعاية وتطوير: محمد رمضان الحرباوي • ركز على النقاط الأساسية ودونها في قسم الملاحظات أدناه.",
    createdAt: "2026-09-10T12:00:00Z",
    createdBy: "محمد رمضان الحرباوي"
  },
  {
    id: "vid-legacy-13",
    title: "حل تقييمات الوزارة الأسبوع الأول - ثانية بكالوريا - فيزياء",
    category: "فيزياء",
    subCategory: "حل التقييمات والواجبات",
    grade: "تانية بكالوريا / الصف الثاني الثانوي",
    description: "حل تقييمات الوزارة الأسبوع الأول - ثانية بكالوريا - فيزياء.",
    videoUrl: "https://youtu.be/vfd6Bg12Y58?si=y_8afnQyCQ9kmNDh",
    duration: "شرح كامل",
    attachments: [
      {
            "id": "att-ph-1",
            "title": "كتاب الفيزياء المدرسي وبنك الأسئلة المعتمد (PDF)",
            "url": "https://drive.google.com/file/d/1B6c2T228QfS8Wq89gB6qQ9k9M9kQ0q9k/view?usp=sharing",
            "type": "pdf"
      },
      {
            "id": "att-ph-2",
            "title": "مذكرة معسكر الفيزياء ومراجعة المتجهات والمقذوفات (PDF)",
            "url": "https://drive.google.com/file/d/1K7c3T339QfS9Wq90gC7rR0l0N0lR1r0l/view?usp=sharing",
            "type": "pdf"
      }
],
    teacherNotes: "برعاية وتطوير: محمد رمضان الحرباوي • ركز على النقاط الأساسية ودونها في قسم الملاحظات أدناه.",
    createdAt: "2026-09-10T12:00:00Z",
    createdBy: "محمد رمضان الحرباوي"
  },
  {
    id: "vid-legacy-14",
    title: "فيديو ترجمه مهم جدًا - تانية بكالوريا - ا/ إيهاب فاروق",
    category: "لغة إنجليزية",
    subCategory: "شرح ومراجعة",
    grade: "تانية بكالوريا / الصف الثاني الثانوي",
    description: "فيديو ترجمة مهم جدًا لطلاب تانية بكالوريا مع ا/ إيهاب فاروق.",
    videoUrl: "https://youtu.be/PRd0kN508CI?si=q8muCfXF-U59-lUZ",
    duration: "شرح كامل",
    attachments: [
      {
            "id": "att-en-1",
            "title": "كتاب اللغة الإنجليزية والمفردات وقواعد الترجمة (PDF)",
            "url": "https://drive.google.com/file/d/1EnGl1shB00k2027ThnwyaP0rtalG00gl/view?usp=sharing",
            "type": "pdf"
      }
],
    teacherNotes: "برعاية وتطوير: محمد رمضان الحرباوي • ركز على النقاط الأساسية ودونها في قسم الملاحظات أدناه.",
    createdAt: "2026-09-10T12:00:00Z",
    createdBy: "محمد رمضان الحرباوي"
  },
  {
    id: "vid-legacy-15",
    title: "حل الأسبوع الثاني - تانية بكالوريا - فيزياء",
    category: "فيزياء",
    subCategory: "حل التقييمات والواجبات",
    grade: "تانية بكالوريا / الصف الثاني الثانوي",
    description: "حل الأسبوع الثاني - تانية بكالوريا - فيزياء.",
    videoUrl: "https://youtu.be/38xHuiEYpmk?si=Qi4PcPaJ8hWGqgd_",
    duration: "شرح كامل",
    attachments: [
      {
            "id": "att-ph-1",
            "title": "كتاب الفيزياء المدرسي وبنك الأسئلة المعتمد (PDF)",
            "url": "https://drive.google.com/file/d/1B6c2T228QfS8Wq89gB6qQ9k9M9kQ0q9k/view?usp=sharing",
            "type": "pdf"
      },
      {
            "id": "att-ph-2",
            "title": "مذكرة معسكر الفيزياء ومراجعة المتجهات والمقذوفات (PDF)",
            "url": "https://drive.google.com/file/d/1K7c3T339QfS9Wq90gC7rR0l0N0lR1r0l/view?usp=sharing",
            "type": "pdf"
      }
],
    teacherNotes: "برعاية وتطوير: محمد رمضان الحرباوي • ركز على النقاط الأساسية ودونها في قسم الملاحظات أدناه.",
    createdAt: "2026-09-10T12:00:00Z",
    createdBy: "محمد رمضان الحرباوي"
  },
  {
    id: "vid-legacy-16",
    title: "حل الأسبوع الثالث - تانية بكالوريا - فيزياء",
    category: "فيزياء",
    subCategory: "حل التقييمات والواجبات",
    grade: "تانية بكالوريا / الصف الثاني الثانوي",
    description: "حل الأسبوع الثالث - تانية بكالوريا - فيزياء.",
    videoUrl: "https://youtu.be/NjK6P_hxBMI?si=4ZYudxfWGLlA3JlW",
    duration: "شرح كامل",
    attachments: [
      {
            "id": "att-ph-1",
            "title": "كتاب الفيزياء المدرسي وبنك الأسئلة المعتمد (PDF)",
            "url": "https://drive.google.com/file/d/1B6c2T228QfS8Wq89gB6qQ9k9M9kQ0q9k/view?usp=sharing",
            "type": "pdf"
      },
      {
            "id": "att-ph-2",
            "title": "مذكرة معسكر الفيزياء ومراجعة المتجهات والمقذوفات (PDF)",
            "url": "https://drive.google.com/file/d/1K7c3T339QfS9Wq90gC7rR0l0N0lR1r0l/view?usp=sharing",
            "type": "pdf"
      }
],
    teacherNotes: "برعاية وتطوير: محمد رمضان الحرباوي • ركز على النقاط الأساسية ودونها في قسم الملاحظات أدناه.",
    createdAt: "2026-09-10T12:00:00Z",
    createdBy: "محمد رمضان الحرباوي"
  },
  {
    id: "vid-legacy-17",
    title: "حل التقييم الأول - تاريخ وطني - أحمد عادل",
    category: "تاريخ",
    subCategory: "حل التقييمات والواجبات",
    grade: "تانية بكالوريا / الصف الثاني الثانوي",
    description: "حل التقييم الأول - تاريخ وطني - أحمد عادل.",
    videoUrl: "https://youtu.be/8q5Pny4XHtg?si=FrASFKka97ie49iJ",
    duration: "شرح كامل",
    attachments: [
      {
            "id": "att-hi-1",
            "title": "كتاب التاريخ المدرسي الوزاري (PDF)",
            "url": "https://drive.google.com/file/d/1JQlVNklrEfleYtSSgntUNfUrP09mWhEu/view?usp=drive_link",
            "type": "pdf"
      },
      {
            "id": "att-hi-2",
            "title": "ملخص الدرس الأول: بناء الدولة الحديثة (PDF)",
            "url": "https://drive.google.com/file/d/1qeeYaaEYTOUMXc5DIwZHNEtXMNlhvh-l/view?usp=sharing",
            "type": "pdf"
      }
],
    teacherNotes: "برعاية وتطوير: محمد رمضان الحرباوي • ركز على النقاط الأساسية ودونها في قسم الملاحظات أدناه.",
    createdAt: "2026-09-10T12:00:00Z",
    createdBy: "محمد رمضان الحرباوي"
  },
  {
    id: "vid-legacy-18",
    title: "حل التقييم الثاني - تاريخ وطني - أحمد عادل",
    category: "تاريخ",
    subCategory: "حل التقييمات والواجبات",
    grade: "تانية بكالوريا / الصف الثاني الثانوي",
    description: "حل التقييم الثاني - تاريخ وطني - أحمد عادل.",
    videoUrl: "https://youtu.be/3eEm0WSrPd4?si=8Kvskb5Z15rr5enf",
    duration: "شرح كامل",
    attachments: [
      {
            "id": "att-hi-1",
            "title": "كتاب التاريخ المدرسي الوزاري (PDF)",
            "url": "https://drive.google.com/file/d/1JQlVNklrEfleYtSSgntUNfUrP09mWhEu/view?usp=drive_link",
            "type": "pdf"
      },
      {
            "id": "att-hi-2",
            "title": "ملخص الدرس الأول: بناء الدولة الحديثة (PDF)",
            "url": "https://drive.google.com/file/d/1qeeYaaEYTOUMXc5DIwZHNEtXMNlhvh-l/view?usp=sharing",
            "type": "pdf"
      }
],
    teacherNotes: "برعاية وتطوير: محمد رمضان الحرباوي • ركز على النقاط الأساسية ودونها في قسم الملاحظات أدناه.",
    createdAt: "2026-09-10T12:00:00Z",
    createdBy: "محمد رمضان الحرباوي"
  },
  {
    id: "vid-legacy-19",
    title: "مراجعة أول 3 دروس وحل التقييمات - المتجهات والمقذوفات الأفقية وبزاوية - فيزياء بكالوريا 2ث",
    category: "فيزياء",
    subCategory: "شرح ومراجعة",
    grade: "تانية بكالوريا / الصف الثاني الثانوي",
    description: "مراجعة أول 3 دروس وحل التقييمات: المتجهات والمقذوفات الأفقية وبزاوية - فيزياء بكالوريا 2ث.",
    videoUrl: "https://youtu.be/Ib77CEEPt3k?si=FrWL1YrIXEaxYyFx",
    duration: "شرح كامل",
    attachments: [
      {
            "id": "att-ph-1",
            "title": "كتاب الفيزياء المدرسي وبنك الأسئلة المعتمد (PDF)",
            "url": "https://drive.google.com/file/d/1B6c2T228QfS8Wq89gB6qQ9k9M9kQ0q9k/view?usp=sharing",
            "type": "pdf"
      },
      {
            "id": "att-ph-2",
            "title": "مذكرة معسكر الفيزياء ومراجعة المتجهات والمقذوفات (PDF)",
            "url": "https://drive.google.com/file/d/1K7c3T339QfS9Wq90gC7rR0l0N0lR1r0l/view?usp=sharing",
            "type": "pdf"
      }
],
    teacherNotes: "برعاية وتطوير: محمد رمضان الحرباوي • ركز على النقاط الأساسية ودونها في قسم الملاحظات أدناه.",
    createdAt: "2026-09-10T12:00:00Z",
    createdBy: "محمد رمضان الحرباوي"
  },
  {
    id: "vid-legacy-20",
    title: "معسكر بكالوريا مراجعة نصف الفصل الأول - اليوم الأول - فيزياء 2 بكالوريا 2027 دكتور كيرلس",
    category: "فيزياء",
    subCategory: "شرح ومراجعة",
    grade: "تانية بكالوريا / الصف الثاني الثانوي",
    description: "معسكر بكالوريا مراجعة نصف الفصل الأول - اليوم الأول - فيزياء 2 بكالوريا 2027 دكتور كيرلس.",
    videoUrl: "https://youtu.be/DOF3NM-Vgs0?si=mRYivo-kDqZkQXAa",
    duration: "شرح كامل",
    attachments: [
      {
            "id": "att-ph-1",
            "title": "كتاب الفيزياء المدرسي وبنك الأسئلة المعتمد (PDF)",
            "url": "https://drive.google.com/file/d/1B6c2T228QfS8Wq89gB6qQ9k9M9kQ0q9k/view?usp=sharing",
            "type": "pdf"
      },
      {
            "id": "att-ph-2",
            "title": "مذكرة معسكر الفيزياء ومراجعة المتجهات والمقذوفات (PDF)",
            "url": "https://drive.google.com/file/d/1K7c3T339QfS9Wq90gC7rR0l0N0lR1r0l/view?usp=sharing",
            "type": "pdf"
      }
],
    teacherNotes: "برعاية وتطوير: محمد رمضان الحرباوي • ركز على النقاط الأساسية ودونها في قسم الملاحظات أدناه.",
    createdAt: "2026-09-10T12:00:00Z",
    createdBy: "محمد رمضان الحرباوي"
  },
  {
    id: "vid-legacy-21",
    title: "برمجة تانية بكالوريا 2027 - الأسبوع الأول",
    category: "برمجة",
    subCategory: "شرح ومراجعة",
    grade: "تانية بكالوريا / الصف الثاني الثانوي",
    description: "برمجة تانية بكالوريا 2027 - الأسبوع الأول.",
    videoUrl: "https://youtu.be/g8MhtoAElt8?si=d8t5CbLhTW29v9p7",
    duration: "شرح كامل",
    attachments: [
      {
            "id": "att-pr-1",
            "title": "كورس البرمجة والذكاء الاصطناعي - الجزء الأول (PDF)",
            "url": "https://drive.google.com/file/d/1VV4ooxWD_yGBb1atk14ndQ1RmDPPvbgv/view?usp=sharing",
            "type": "pdf"
      }
],
    teacherNotes: "برعاية وتطوير: محمد رمضان الحرباوي • ركز على النقاط الأساسية ودونها في قسم الملاحظات أدناه.",
    createdAt: "2026-09-10T12:00:00Z",
    createdBy: "محمد رمضان الحرباوي"
  },
  {
    id: "vid-legacy-22",
    title: "ملخص شرح الدرس الثاني",
    category: "فيزياء",
    subCategory: "شرح ومراجعة",
    grade: "تانية بكالوريا / الصف الثاني الثانوي",
    description: "ملخص وشرح مبسط للدرس الثاني ضمن المراجعة والاستعداد لطلاب تانية بكالوريا.",
    videoUrl: "https://youtu.be/eiVEbi3CbuY?si=J-l93imzrV10NAZ7",
    duration: "شرح كامل",
    attachments: [
      {
            "id": "att-ph-1",
            "title": "كتاب الفيزياء المدرسي وبنك الأسئلة المعتمد (PDF)",
            "url": "https://drive.google.com/file/d/1B6c2T228QfS8Wq89gB6qQ9k9M9kQ0q9k/view?usp=sharing",
            "type": "pdf"
      },
      {
            "id": "att-ph-2",
            "title": "مذكرة معسكر الفيزياء ومراجعة المتجهات والمقذوفات (PDF)",
            "url": "https://drive.google.com/file/d/1K7c3T339QfS9Wq90gC7rR0l0N0lR1r0l/view?usp=sharing",
            "type": "pdf"
      }
],
    teacherNotes: "برعاية وتطوير: محمد رمضان الحرباوي • ركز على النقاط الأساسية ودونها في قسم الملاحظات أدناه.",
    createdAt: "2026-09-10T12:00:00Z",
    createdBy: "محمد رمضان الحرباوي"
  },
  {
    id: "vid-legacy-23",
    title: "شرح كيف تضمن العلامة الكاملة في الوحدة الأولى؟ مراجعة الوحدة الأولى - برمجة تانية بكالوريا 2027",
    category: "برمجة",
    subCategory: "شرح ومراجعة",
    grade: "تانية بكالوريا / الصف الثاني الثانوي",
    description: "شرح كيف تضمن العلامة الكاملة في الوحدة الأولى؟ مراجعة الوحدة الأولى في البرمجة لطلاب تانية بكالوريا 2027. برعاية :- محمد رمضان الحرباوي",
    videoUrl: "https://youtu.be/f2SAoRlHVRg?si=3BWZeR_pzpvwcgaJ",
    duration: "شرح كامل",
    attachments: [
      {
            "id": "att-pr-1",
            "title": "كورس البرمجة والذكاء الاصطناعي - الجزء الأول (PDF)",
            "url": "https://drive.google.com/file/d/1VV4ooxWD_yGBb1atk14ndQ1RmDPPvbgv/view?usp=sharing",
            "type": "pdf"
      }
],
    teacherNotes: "برعاية وتطوير: محمد رمضان الحرباوي • ركز على النقاط الأساسية ودونها في قسم الملاحظات أدناه.",
    createdAt: "2026-09-10T12:00:00Z",
    createdBy: "محمد رمضان الحرباوي"
  },
  {
    id: "vid-legacy-24",
    title: "الورشة الأولى | الفيزياء 2 بكالوريا 2027 | أ/ محمد عبدالمعبود",
    category: "فيزياء",
    subCategory: "شرح ومراجعة",
    grade: "تانية بكالوريا / الصف الثاني الثانوي",
    description: "الورشة الأولى في الفيزياء لطلاب تانية بكالوريا 2027 مع أ/ محمد عبدالمعبود.",
    videoUrl: "https://youtu.be/gRfl-6BhYpU?si=L8_vWKnurlu74oJ9",
    duration: "شرح كامل",
    attachments: [
      {
            "id": "att-ph-1",
            "title": "كتاب الفيزياء المدرسي وبنك الأسئلة المعتمد (PDF)",
            "url": "https://drive.google.com/file/d/1B6c2T228QfS8Wq89gB6qQ9k9M9kQ0q9k/view?usp=sharing",
            "type": "pdf"
      },
      {
            "id": "att-ph-2",
            "title": "مذكرة معسكر الفيزياء ومراجعة المتجهات والمقذوفات (PDF)",
            "url": "https://drive.google.com/file/d/1K7c3T339QfS9Wq90gC7rR0l0N0lR1r0l/view?usp=sharing",
            "type": "pdf"
      }
],
    teacherNotes: "برعاية وتطوير: محمد رمضان الحرباوي • ركز على النقاط الأساسية ودونها في قسم الملاحظات أدناه.",
    createdAt: "2026-09-10T12:00:00Z",
    createdBy: "محمد رمضان الحرباوي"
  },
  {
    id: "vid-legacy-25",
    title: "أداء صفي + منزلي - لغة عربية 2027",
    category: "لغة عربية",
    subCategory: "حل التقييمات والواجبات",
    grade: "تانية بكالوريا / الصف الثاني الثانوي",
    description: "حل الأداء الصفي والمنزلي في اللغة العربية لطلاب تانية بكالوريا 2027.",
    videoUrl: "https://youtu.be/4l8zUlYuhFM?si=mf7T-_kdTcOfH9HQ",
    duration: "شرح كامل",
    attachments: [
      {
            "id": "att-ar-1",
            "title": "كتاب النحو الوزاري للصف الثاني الثانوي (PDF)",
            "url": "https://drive.google.com/file/d/1DH8DeZDQqVnYfTovoug5EuGxTpA-7CqR/view?usp=sharing",
            "type": "pdf"
      },
      {
            "id": "att-ar-2",
            "title": "أوراق تقييمات الأسبوع والواجبات - لغة عربية (PDF)",
            "url": "https://drive.google.com/file/d/144Pz95q914wZ38_0kU8oB55qU8n7L93e/view?usp=sharing",
            "type": "pdf"
      }
],
    teacherNotes: "برعاية وتطوير: محمد رمضان الحرباوي • ركز على النقاط الأساسية ودونها في قسم الملاحظات أدناه.",
    createdAt: "2026-09-10T12:00:00Z",
    createdBy: "محمد رمضان الحرباوي"
  },
  {
    id: "vid-legacy-26",
    title: "حل التقييم الأول - لغة عربية - 2027",
    category: "لغة عربية",
    subCategory: "حل التقييمات والواجبات",
    grade: "تانية بكالوريا / الصف الثاني الثانوي",
    description: "حل التقييم الأول في اللغة العربية لطلاب تانية بكالوريا 2027.",
    videoUrl: "https://youtu.be/cpfYUVqbQEU?si=qpsks9gj3JrQtsqf",
    duration: "شرح كامل",
    attachments: [
      {
            "id": "att-ar-1",
            "title": "كتاب النحو الوزاري للصف الثاني الثانوي (PDF)",
            "url": "https://drive.google.com/file/d/1DH8DeZDQqVnYfTovoug5EuGxTpA-7CqR/view?usp=sharing",
            "type": "pdf"
      },
      {
            "id": "att-ar-2",
            "title": "أوراق تقييمات الأسبوع والواجبات - لغة عربية (PDF)",
            "url": "https://drive.google.com/file/d/144Pz95q914wZ38_0kU8oB55qU8n7L93e/view?usp=sharing",
            "type": "pdf"
      }
],
    teacherNotes: "برعاية وتطوير: محمد رمضان الحرباوي • ركز على النقاط الأساسية ودونها في قسم الملاحظات أدناه.",
    createdAt: "2026-09-10T12:00:00Z",
    createdBy: "محمد رمضان الحرباوي"
  },
  {
    id: "vid-legacy-27",
    title: "حل التقييم الثاني - لغة عربية - 2027",
    category: "لغة عربية",
    subCategory: "حل التقييمات والواجبات",
    grade: "تانية بكالوريا / الصف الثاني الثانوي",
    description: "حل التقييم الثاني في اللغة العربية لطلاب تانية بكالوريا 2027.",
    videoUrl: "https://youtu.be/knMjmZPrvfk?si=ZpYOvIIbRfA3Fqyx",
    duration: "شرح كامل",
    attachments: [
      {
            "id": "att-ar-1",
            "title": "كتاب النحو الوزاري للصف الثاني الثانوي (PDF)",
            "url": "https://drive.google.com/file/d/1DH8DeZDQqVnYfTovoug5EuGxTpA-7CqR/view?usp=sharing",
            "type": "pdf"
      },
      {
            "id": "att-ar-2",
            "title": "أوراق تقييمات الأسبوع والواجبات - لغة عربية (PDF)",
            "url": "https://drive.google.com/file/d/144Pz95q914wZ38_0kU8oB55qU8n7L93e/view?usp=sharing",
            "type": "pdf"
      }
],
    teacherNotes: "برعاية وتطوير: محمد رمضان الحرباوي • ركز على النقاط الأساسية ودونها في قسم الملاحظات أدناه.",
    createdAt: "2026-09-10T12:00:00Z",
    createdBy: "محمد رمضان الحرباوي"
  },
  {
    id: "vid-legacy-28",
    title: "شرح الدرس السابع: كمية التحرك والدفع - فيزياء تانية بكالوريا 2027 - حل أسئلة الوزارة درس 7",
    category: "فيزياء",
    subCategory: "حل التقييمات والواجبات",
    grade: "تانية بكالوريا / الصف الثاني الثانوي",
    description: "شرح الدرس السابع (كمية التحرك والدفع) مع حل أسئلة الوزارة - فيزياء تانية بكالوريا 2027.",
    videoUrl: "https://youtu.be/aNFoGkUMGKc?si=qccSMU8pd8Ac19x9",
    duration: "شرح كامل",
    attachments: [
      {
            "id": "att-ph-1",
            "title": "كتاب الفيزياء المدرسي وبنك الأسئلة المعتمد (PDF)",
            "url": "https://drive.google.com/file/d/1B6c2T228QfS8Wq89gB6qQ9k9M9kQ0q9k/view?usp=sharing",
            "type": "pdf"
      },
      {
            "id": "att-ph-2",
            "title": "مذكرة معسكر الفيزياء ومراجعة المتجهات والمقذوفات (PDF)",
            "url": "https://drive.google.com/file/d/1K7c3T339QfS9Wq90gC7rR0l0N0lR1r0l/view?usp=sharing",
            "type": "pdf"
      }
],
    teacherNotes: "برعاية وتطوير: محمد رمضان الحرباوي • ركز على النقاط الأساسية ودونها في قسم الملاحظات أدناه.",
    createdAt: "2026-09-10T12:00:00Z",
    createdBy: "محمد رمضان الحرباوي"
  },
  {
    id: "vid-legacy-29",
    title: "الدرس الأول: بناء الدولة المصرية - تاريخ تانية بكالوريا مع مستر وليد مبروك",
    category: "تاريخ",
    subCategory: "شرح ومراجعة",
    grade: "تانية بكالوريا / الصف الثاني الثانوي",
    description: "محاضرة الدرس الأول: بناء الدولة المصرية - تاريخ تانية بكالوريا مع مستر وليد مبروك.",
    videoUrl: "https://youtu.be/yLn3m6_YBBI?si=LjTpBsT-dTleIToa",
    duration: "شرح كامل",
    attachments: [
      {
            "id": "att-hi-1",
            "title": "كتاب التاريخ المدرسي الوزاري (PDF)",
            "url": "https://drive.google.com/file/d/1JQlVNklrEfleYtSSgntUNfUrP09mWhEu/view?usp=drive_link",
            "type": "pdf"
      },
      {
            "id": "att-hi-2",
            "title": "ملخص الدرس الأول: بناء الدولة الحديثة (PDF)",
            "url": "https://drive.google.com/file/d/1qeeYaaEYTOUMXc5DIwZHNEtXMNlhvh-l/view?usp=sharing",
            "type": "pdf"
      }
],
    teacherNotes: "برعاية وتطوير: محمد رمضان الحرباوي • ركز على النقاط الأساسية ودونها في قسم الملاحظات أدناه.",
    createdAt: "2026-09-10T12:00:00Z",
    createdBy: "محمد رمضان الحرباوي"
  },
  {
    id: "vid-legacy-30",
    title: "الدرس الثالث: التحولات الكبرى في مصر (العصر القديم) - تاريخ تانية بكالوريا",
    category: "تاريخ",
    subCategory: "شرح ومراجعة",
    grade: "تانية بكالوريا / الصف الثاني الثانوي",
    description: "محاضرة الدرس الثالث: التحولات الكبرى في مصر (العصر القديم) - تاريخ تانية بكالوريا مع مستر وليد مبروك.",
    videoUrl: "https://youtu.be/m3H4swkkQJU?si=UYShBVGHdPJUpj_N",
    duration: "شرح كامل",
    attachments: [
      {
            "id": "att-hi-1",
            "title": "كتاب التاريخ المدرسي الوزاري (PDF)",
            "url": "https://drive.google.com/file/d/1JQlVNklrEfleYtSSgntUNfUrP09mWhEu/view?usp=drive_link",
            "type": "pdf"
      },
      {
            "id": "att-hi-2",
            "title": "ملخص الدرس الأول: بناء الدولة الحديثة (PDF)",
            "url": "https://drive.google.com/file/d/1qeeYaaEYTOUMXc5DIwZHNEtXMNlhvh-l/view?usp=sharing",
            "type": "pdf"
      }
],
    teacherNotes: "برعاية وتطوير: محمد رمضان الحرباوي • ركز على النقاط الأساسية ودونها في قسم الملاحظات أدناه.",
    createdAt: "2026-09-10T12:00:00Z",
    createdBy: "محمد رمضان الحرباوي"
  },
  {
    id: "vid-legacy-31",
    title: "الدرس الخامس: سياسة الاحتلال في مصر في العصر الحديث - تاريخ تانية بكالوريا",
    category: "تاريخ",
    subCategory: "شرح ومراجعة",
    grade: "تانية بكالوريا / الصف الثاني الثانوي",
    description: "محاضرة الدرس الخامس: سياسة الاحتلال في مصر في العصر الحديث - تاريخ تانية بكالوريا مع مستر وليد مبروك.",
    videoUrl: "https://youtu.be/Z3BkyhnMUtY?si=NweUQnXcvw3IAmwy",
    duration: "شرح كامل",
    attachments: [
      {
            "id": "att-hi-1",
            "title": "كتاب التاريخ المدرسي الوزاري (PDF)",
            "url": "https://drive.google.com/file/d/1JQlVNklrEfleYtSSgntUNfUrP09mWhEu/view?usp=drive_link",
            "type": "pdf"
      },
      {
            "id": "att-hi-2",
            "title": "ملخص الدرس الأول: بناء الدولة الحديثة (PDF)",
            "url": "https://drive.google.com/file/d/1qeeYaaEYTOUMXc5DIwZHNEtXMNlhvh-l/view?usp=sharing",
            "type": "pdf"
      }
],
    teacherNotes: "برعاية وتطوير: محمد رمضان الحرباوي • ركز على النقاط الأساسية ودونها في قسم الملاحظات أدناه.",
    createdAt: "2026-09-10T12:00:00Z",
    createdBy: "محمد رمضان الحرباوي"
  },
  {
    id: "vid-legacy-32",
    title: "مراجعة على الوحدة الأولى - تاريخ تانية بكالوريا مع مستر وليد مبروك",
    category: "تاريخ",
    subCategory: "شرح ومراجعة",
    grade: "تانية بكالوريا / الصف الثاني الثانوي",
    description: "مراجعة على الوحدة الأولى في التاريخ لطلاب تانية بكالوريا مع مستر وليد مبروك.",
    videoUrl: "https://youtu.be/dOZc_ffBWAk?si=PwCALPRrV7L-ix07",
    duration: "شرح كامل",
    attachments: [
      {
            "id": "att-hi-1",
            "title": "كتاب التاريخ المدرسي الوزاري (PDF)",
            "url": "https://drive.google.com/file/d/1JQlVNklrEfleYtSSgntUNfUrP09mWhEu/view?usp=drive_link",
            "type": "pdf"
      },
      {
            "id": "att-hi-2",
            "title": "ملخص الدرس الأول: بناء الدولة الحديثة (PDF)",
            "url": "https://drive.google.com/file/d/1qeeYaaEYTOUMXc5DIwZHNEtXMNlhvh-l/view?usp=sharing",
            "type": "pdf"
      }
],
    teacherNotes: "برعاية وتطوير: محمد رمضان الحرباوي • ركز على النقاط الأساسية ودونها في قسم الملاحظات أدناه.",
    createdAt: "2026-09-10T12:00:00Z",
    createdBy: "محمد رمضان الحرباوي"
  },
  {
    id: "vid-legacy-33",
    title: "من هو الغريب - حكايات غريب - أ/ محمد صلاح",
    category: "لغة عربية",
    subCategory: "شرح ومراجعة",
    grade: "تانية بكالوريا / الصف الثاني الثانوي",
    description: "استعراض مميز لقصة «حكايات غريب» مع أ/ محمد صلاح، مناسب لطلاب تانية بكالوريا.",
    videoUrl: "https://youtu.be/hvqGyNibVdk?si=-grhKmNRXalRDlOc",
    duration: "شرح كامل",
    attachments: [
      {
            "id": "att-ar-1",
            "title": "كتاب النحو الوزاري للصف الثاني الثانوي (PDF)",
            "url": "https://drive.google.com/file/d/1DH8DeZDQqVnYfTovoug5EuGxTpA-7CqR/view?usp=sharing",
            "type": "pdf"
      },
      {
            "id": "att-ar-2",
            "title": "أوراق تقييمات الأسبوع والواجبات - لغة عربية (PDF)",
            "url": "https://drive.google.com/file/d/144Pz95q914wZ38_0kU8oB55qU8n7L93e/view?usp=sharing",
            "type": "pdf"
      }
],
    teacherNotes: "برعاية وتطوير: محمد رمضان الحرباوي • ركز على النقاط الأساسية ودونها في قسم الملاحظات أدناه.",
    createdAt: "2026-09-10T12:00:00Z",
    createdBy: "محمد رمضان الحرباوي"
  },
  {
    id: "vid-legacy-34",
    title: "مراجعة Unit 1 لغة إنجليزية - تانية بكالوريا - أ/ عبقري اللغة",
    category: "لغة إنجليزية",
    subCategory: "شرح ومراجعة",
    grade: "تانية بكالوريا / الصف الثاني الثانوي",
    description: "مراجعة شاملة لـ Unit 1 في اللغة الإنجليزية لطلاب تانية بكالوريا مع أ/ عبقري اللغة.",
    videoUrl: "https://youtu.be/jAk-6WISM2Y?si=ejvSZGeGY6VAYZcI",
    duration: "شرح كامل",
    attachments: [
      {
            "id": "att-en-1",
            "title": "كتاب اللغة الإنجليزية والمفردات وقواعد الترجمة (PDF)",
            "url": "https://drive.google.com/file/d/1EnGl1shB00k2027ThnwyaP0rtalG00gl/view?usp=sharing",
            "type": "pdf"
      }
],
    teacherNotes: "برعاية وتطوير: محمد رمضان الحرباوي • ركز على النقاط الأساسية ودونها في قسم الملاحظات أدناه.",
    createdAt: "2026-09-10T12:00:00Z",
    createdBy: "محمد رمضان الحرباوي"
  }
];

