import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Plus,
  Trash2,
  Edit3,
  CheckCircle,
  FileCheck2,
  HelpCircle,
  Bell,
  Sparkles,
  RefreshCw,
  ExternalLink,
  Save,
  X,
  AlertCircle,
  Lock,
  ShieldCheck,
  Headphones,
  Phone,
  MessageCircle,
  Calendar,
  LogIn,
  LogOut,
  Search,
  Users,
  GraduationCap,
  Clock,
  UserCheck,
  Video,
  Paperclip,
  FileText,
  Send
} from 'lucide-react';
import {
  SupportChatMessage,
  BookItem,
  EvaluationItem,
  ExamItem,
  ExamQuestion,
  AnnouncementItem,
  StudentUser,
  VideoItem,
  VideoAttachment,
  CATEGORIES,
  DEFAULT_EXAM
} from '../data/initialData';
import { SupportTicket } from './SupportModal';
import { db, auth, googleProvider } from '../firebase';
import { doc, setDoc, deleteDoc, collection, onSnapshot } from 'firebase/firestore';
import { signInWithPopup, signOut } from 'firebase/auth';
import {
  executeGoogleSignIn,
  OWNER_EMAIL,
  TEACHER_MASTER_PASSCODES
} from '../utils/googleAuth';

interface TeacherDashboardProps {
  books: BookItem[];
  evaluations: EvaluationItem[];
  exams: ExamItem[];
  announcements: AnnouncementItem[];
  supportTickets: SupportTicket[];
  students: StudentUser[];
  videos?: VideoItem[];
  onRefresh: () => void;
  onDeleteBook: (id: string) => Promise<void>;
  onSaveBook: (book: BookItem) => Promise<void>;
  onDeleteTicket?: (id: string) => Promise<void>;
  onToggleTicketStatus?: (id: string) => Promise<void>;
  onSaveExam?: (exam: ExamItem) => Promise<void>;
  onDeleteExam?: (id: string) => Promise<void>;
  onDeleteStudent?: (phone: string) => Promise<void>;
  onApproveStudent?: (phone: string) => Promise<void>;
  onRejectStudent?: (phone: string) => Promise<void>;
  onPromoteStudent?: (phone: string, role: 'student' | 'admin' | 'owner') => Promise<void>;
  onSaveEval?: (evaluation: EvaluationItem) => Promise<void>;
  onSaveVideo?: (video: VideoItem) => Promise<void>;
  onDeleteVideo?: (id: string) => Promise<void>;
  userId?: string;
  theme?: 'dark' | 'light';
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  books,
  evaluations,
  exams,
  announcements,
  supportTickets = [],
  students = [],
  videos = [],
  onRefresh,
  onDeleteBook,
  onSaveBook,
  onDeleteTicket,
  onToggleTicketStatus,
  onSaveExam,
  onDeleteExam,
  onDeleteStudent,
  onApproveStudent,
  onRejectStudent,
  onPromoteStudent,
  onSaveEval,
  onSaveVideo,
  onDeleteVideo,
  userId = 'teacher-admin',
  theme = 'dark'
}) => {
  const isDark = theme === 'dark';

  // Security & Authentication Gate (Accepts Teacher Google Auth or Promoted Admin/Owner Students)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const isTeacher = localStorage.getItem('teacher_session_auth') === 'true';
      const studentSession = localStorage.getItem('student_session');
      if (studentSession) {
        const parsed = JSON.parse(studentSession);
        if (parsed.role === 'admin' || parsed.role === 'owner') return true;
      }
      return isTeacher;
    } catch {
      return false;
    }
  });

  const [teacherProfile, setTeacherProfile] = useState<{
    name: string;
    email: string;
    photoURL?: string;
  } | null>(() => {
    try {
      const saved = localStorage.getItem('teacher_profile');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [authError, setAuthError] = useState<string | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Active SubTab
  const [activeSubTab, setActiveSubTab] = useState<
    'books' | 'videos' | 'evaluations' | 'exams' | 'students' | 'chat' | 'announcements' | 'support'
  >('books');

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ type, text });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Search States
  const [dashboardBookSearch, setDashboardBookSearch] = useState('');
  const [studentSearch, setStudentSearch] = useState('');
  const [videoSearch, setVideoSearch] = useState('');

  // Delete Confirmation Modals
  const [deleteConfirmBook, setDeleteConfirmBook] = useState<BookItem | null>(null);
  const [deleteConfirmExam, setDeleteConfirmExam] = useState<ExamItem | null>(null);
  const [deleteConfirmStudent, setDeleteConfirmStudent] = useState<StudentUser | null>(null);
  const [deleteConfirmVideo, setDeleteConfirmVideo] = useState<VideoItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Selected Exam for editing
  const [selectedExamId, setSelectedExamId] = useState<string>(() => exams[0]?.id || DEFAULT_EXAM.id);

  // Modal states
  const [showBookModal, setShowBookModal] = useState(false);
  const [showEvalModal, setShowEvalModal] = useState(false);
  const [showAnnounceModal, setShowAnnounceModal] = useState(false);
  const [showExamCreateModal, setShowExamCreateModal] = useState(false);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);

  // Video form state
  const [editingVideoId, setEditingVideoId] = useState<string | null>(null);
  const [videoTitle, setVideoTitle] = useState('');
  const [videoCat, setVideoCat] = useState('رياضيات');
  const [videoGrade, setVideoGrade] = useState('الصف الثاني / الثالث الثانوي');
  const [videoDesc, setVideoDesc] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoDuration, setVideoDuration] = useState('45 دقيقة');
  const [videoNotes, setVideoNotes] = useState('');
  const [videoAttachments, setVideoAttachments] = useState<VideoAttachment[]>([]);
  const [isSavingVideo, setIsSavingVideo] = useState(false);

  // Book form state
  const [bookTitle, setBookTitle] = useState('');
  const [bookCat, setBookCat] = useState('لغة عربية');
  const [bookGrade, setBookGrade] = useState('الصف الثاني / الثالث الثانوي');
  const [bookDesc, setBookDesc] = useState('');
  const [bookUrl, setBookUrl] = useState('');
  const [bookIcon, setBookIcon] = useState('📚');
  const [bookNotes, setBookNotes] = useState('');
  const [editingBookId, setEditingBookId] = useState<string | null>(null);
  const [isSavingBook, setIsSavingBook] = useState(false);

  // Evaluation form state
  const [evalSubject, setEvalSubject] = useState('اللغة العربية');
  const [evalWeek, setEvalWeek] = useState('الأسبوع الأول');
  const [evalTitle, setEvalTitle] = useState('');
  const [evalUrl, setEvalUrl] = useState('');
  const [evalSolutionUrl, setEvalSolutionUrl] = useState('');
  const [editingEvalId, setEditingEvalId] = useState<string | null>(null);

  // Announcement form state
  const [announceTitle, setAnnounceTitle] = useState('');
  const [announceContent, setAnnounceContent] = useState('');
  const [announceCat, setAnnounceCat] = useState('تنبيه عام');

  // Exam creation form state
  const [newExamTitle, setNewExamTitle] = useState('');
  const [newExamSubject, setNewExamSubject] = useState('لغة عربية');
  const [newExamTime, setNewExamTime] = useState(15);

  // Question form state
  const [editingQuestionIdx, setEditingQuestionIdx] = useState<number | null>(null);
  const [examQSubject, setExamQSubject] = useState('لغة عربية');
  const [examQCat, setExamQCat] = useState('قواعد وإعراب');
  const [examQText, setExamQText] = useState('');
  const [examOpt0, setExamOpt0] = useState('');
  const [examOpt1, setExamOpt1] = useState('');
  const [examOpt2, setExamOpt2] = useState('');
  const [examOpt3, setExamOpt3] = useState('');
  const [examAns, setExamAns] = useState(0);
  const [examExp, setExamExp] = useState('');

  // Local optimistic students state (deduplicated by phone/email to avoid duplicate keys)
  const dedupeStudents = (list: StudentUser[]): StudentUser[] => {
    const map = new Map<string, StudentUser>();
    list.forEach((s) => {
      if (!s) return;
      const key = (s.phone || '').trim().toLowerCase().replace(/[^a-zA-Z0-9]/g, '');
      if (!key) return;
      const existing = map.get(key);
      if (!existing || s.status === 'approved' || (s.status && !existing.status)) {
        map.set(key, s);
      }
    });
    return Array.from(map.values());
  };

  const [localStudents, setLocalStudents] = useState<StudentUser[]>(() => dedupeStudents(students));
  useEffect(() => {
    setLocalStudents(dedupeStudents(students));
  }, [students]);

  // Optimistic Student Approval Handler
  const handleApproveStudentOptimistic = (phone: string, studentName: string) => {
    setLocalStudents((prev) =>
      prev.map((s) => (s.phone === phone ? { ...s, status: 'approved' } : s))
    );
    showToast(`تم اعتماد وتفعيل حساب الطالب ${studentName} فوراً! ✅`);
    if (onApproveStudent) {
      onApproveStudent(phone).catch((e) => console.warn('Approve student error:', e));
    }
  };

  // Optimistic Student Rejection Handler
  const handleRejectStudentOptimistic = (phone: string, studentName: string) => {
    setLocalStudents((prev) =>
      prev.map((s) => (s.phone === phone ? { ...s, status: 'rejected' } : s))
    );
    showToast(`تم رفض حساب الطالب ${studentName} ❌`, 'error');
    if (onRejectStudent) {
      onRejectStudent(phone).catch((e) => console.warn('Reject student error:', e));
    }
  };

  // Supervisor Promotion & Role Handler (Promote to Admin / Owner or demote to Student)
  const handlePromoteStudent = async (phone: string, role: 'student' | 'admin' | 'owner', studentName: string) => {
    // 1. Instant optimistic local state update
    setLocalStudents((prev) =>
      prev.map((s) => (s.phone === phone ? { ...s, role } : s))
    );

    const roleName =
      role === 'owner' ? 'مالك مساعد 👑' : role === 'admin' ? 'مشرف عام / أدمن 🛡️' : 'طالب عادي 🎓';
    showToast(`تم تعيين رتبة "${studentName}" كـ (${roleName}) بنجاح!`);

    // 2. Call parent handler or write directly to Firestore
    if (onPromoteStudent) {
      await onPromoteStudent(phone, role);
    } else {
      const safeDocId = phone.replace(/[^a-zA-Z0-9_]/g, '_');
      const promotionData = {
        role,
        promotedAt: new Date().toISOString(),
        promotedBy: teacherProfile?.name || 'محمد رمضان الحرباوي'
      };
      try {
        await Promise.allSettled([
          setDoc(doc(db, 'users', phone), promotionData, { merge: true }),
          setDoc(doc(db, 'users', safeDocId), promotionData, { merge: true })
        ]);
      } catch (err) {
        console.warn('Firestore promotion warning:', err);
      }
    }
  };

  // Google Login Authentication Handler (STRICTLY FOR ramadanh66778@gmail.com)
  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setAuthError(null);
    try {
      const result = await executeGoogleSignIn();
      if (result.success && result.isTeacher && result.teacherProfile) {
        setIsAuthenticated(true);
        setTeacherProfile(result.teacherProfile);
        try {
          localStorage.setItem('teacher_session_auth', 'true');
          localStorage.setItem('teacher_profile', JSON.stringify(result.teacherProfile));
        } catch {}
        showToast(`مرحباً بك يا أستاذ ${result.teacherProfile.name}! تم التحقق من هويتك بنجاح.`);
      } else if (result.success && !result.isTeacher) {
        await signOut(auth);
        setIsAuthenticated(false);
        setTeacherProfile(null);
        setAuthError(`غير مصرح لك بالدخول نهائياً. هذه اللوحة مشفرة ومخصصة فقط للمالك (${OWNER_EMAIL}).`);
      } else {
        setAuthError(result.error || 'تعذر تسجيل الدخول بـ Google.');
      }
    } catch (err: any) {
      console.warn('Google sign-in error:', err);
      setAuthError('حدث خطأ أثناء مصادقة Google. يرجى المحاولة مرة أخرى.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch {}
    setIsAuthenticated(false);
    setTeacherProfile(null);
    try {
      localStorage.removeItem('teacher_session_auth');
      localStorage.removeItem('teacher_profile');
    } catch {}
  };

  // Save Book (Add or Edit)
  const handleSaveBookSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookTitle.trim() || !bookUrl.trim()) return;

    setIsSavingBook(true);
    const id = editingBookId || `book-${Date.now()}`;
    const newBook: BookItem = {
      id,
      title: bookTitle.trim(),
      category: bookCat,
      grade: bookGrade,
      description: bookDesc.trim(),
      url: bookUrl.trim(),
      icon: bookIcon.trim() || '📚',
      popular: 90,
      isNew: true,
      teacherNotes: bookNotes.trim(),
      createdBy: teacherProfile?.email || 'admin-teacher',
      createdAt: new Date().toISOString()
    };

    try {
      await onSaveBook(newBook);
      setShowBookModal(false);
      resetBookForm();
      showToast(editingBookId ? 'تم تحديث بيانات الكتاب بنجاح!' : 'تمت إضافة الكتاب الجديد للمكتبة بنجاح!');
    } catch (err: any) {
      showToast('خطأ في حفظ الكتاب: ' + err.message, 'error');
    } finally {
      setIsSavingBook(false);
    }
  };

  const resetBookForm = () => {
    setBookTitle('');
    setBookCat('لغة عربية');
    setBookGrade('الصف الثاني / الثالث الثانوي');
    setBookDesc('');
    setBookUrl('');
    setBookIcon('📚');
    setBookNotes('');
    setEditingBookId(null);
  };

  const handleEditBook = (b: BookItem) => {
    setEditingBookId(b.id);
    setBookTitle(b.title);
    setBookCat(b.category);
    setBookGrade(b.grade);
    setBookDesc(b.description);
    setBookUrl(b.url);
    setBookIcon(b.icon);
    setBookNotes(b.teacherNotes || '');
    setShowBookModal(true);
  };

  const handleConfirmDeleteBook = async () => {
    if (!deleteConfirmBook) return;
    setIsDeleting(true);
    try {
      await onDeleteBook(deleteConfirmBook.id);
      showToast(`تم حذف كتاب "${deleteConfirmBook.title}" بنجاح.`);
      setDeleteConfirmBook(null);
    } catch (err: any) {
      showToast('خطأ أثناء الحذف: ' + err.message, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Reset Video Form
  const resetVideoForm = () => {
    setVideoTitle('');
    setVideoCat('رياضيات');
    setVideoGrade('الصف الثاني / الثالث الثانوي');
    setVideoDesc('');
    setVideoUrl('');
    setVideoDuration('45 دقيقة');
    setVideoNotes('');
    setVideoAttachments([]);
    setEditingVideoId(null);
  };

  // Edit Video
  const handleEditVideo = (v: VideoItem) => {
    setEditingVideoId(v.id);
    setVideoTitle(v.title);
    setVideoCat(v.category);
    setVideoGrade(v.grade);
    setVideoDesc(v.description);
    setVideoUrl(v.videoUrl);
    setVideoDuration(v.duration || '45 دقيقة');
    setVideoNotes(v.teacherNotes || '');
    setVideoAttachments(v.attachments ? [...v.attachments] : []);
    setShowVideoModal(true);
  };

  // Save / Update Video
  const handleSaveVideoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoTitle.trim() || !videoUrl.trim()) return;

    setIsSavingVideo(true);
    const id = editingVideoId || `vid-${Date.now()}`;
    const newVid: VideoItem = {
      id,
      title: videoTitle.trim(),
      category: videoCat,
      grade: videoGrade,
      description: videoDesc.trim(),
      videoUrl: videoUrl.trim(),
      duration: videoDuration.trim() || '45 دقيقة',
      teacherNotes: videoNotes.trim(),
      attachments: videoAttachments.filter((a) => a.title.trim() && a.url.trim()),
      createdBy: teacherProfile?.email || 'ramadanh66778@gmail.com',
      createdAt: new Date().toISOString()
    };

    try {
      if (onSaveVideo) {
        await onSaveVideo(newVid);
      } else {
        await setDoc(doc(db, 'videos', id), newVid);
      }
      setShowVideoModal(false);
      resetVideoForm();
      showToast(editingVideoId ? 'تم تحديث المحاضرة بنجاح!' : 'تمت إضافة المحاضرة الجديدة بنجاح!');
      onRefresh();
    } catch (err: any) {
      showToast('خطأ في حفظ الفيديو: ' + err.message, 'error');
    } finally {
      setIsSavingVideo(false);
    }
  };

  // Confirm Delete Video
  const handleConfirmDeleteVideo = async () => {
    if (!deleteConfirmVideo) return;
    setIsDeleting(true);
    try {
      if (onDeleteVideo) {
        await onDeleteVideo(deleteConfirmVideo.id);
      } else {
        await deleteDoc(doc(db, 'videos', deleteConfirmVideo.id));
      }
      showToast(`تم حذف فيديو "${deleteConfirmVideo.title}" بنجاح.`);
      setDeleteConfirmVideo(null);
      onRefresh();
    } catch (err: any) {
      showToast('خطأ أثناء الحذف: ' + err.message, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Attachment Helpers for Video Modal
  const handleAddAttachment = () => {
    setVideoAttachments((prev) => [
      ...prev,
      { id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`, title: '', url: '', type: 'pdf' }
    ]);
  };

  const handleRemoveAttachment = (id: string) => {
    setVideoAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleUpdateAttachment = (id: string, field: 'title' | 'url', val: string) => {
    setVideoAttachments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, [field]: val } : a))
    );
  };


  // Reset Evaluation Form
  const resetEvalForm = () => {
    setEvalTitle('');
    setEvalUrl('');
    setEvalSolutionUrl('');
    setEvalSubject('اللغة العربية');
    setEvalWeek('الأسبوع الأول');
    setEditingEvalId(null);
  };

  // Edit Evaluation
  const handleEditEval = (ev: EvaluationItem) => {
    setEditingEvalId(ev.id);
    setEvalSubject(ev.subject);
    setEvalWeek(ev.week);
    setEvalTitle(ev.title);
    setEvalUrl(ev.url);
    setEvalSolutionUrl(ev.solutionUrl || '');
    setShowEvalModal(true);
  };

  // Save Evaluation (Add or Edit)
  const handleSaveEval = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!evalTitle.trim() || !evalUrl.trim()) return;

    const id = editingEvalId || `eval-${Date.now()}`;
    const newEval: EvaluationItem = {
      id,
      subject: evalSubject,
      week: evalWeek,
      title: evalTitle.trim(),
      url: evalUrl.trim(),
      solutionUrl: evalSolutionUrl.trim() || evalUrl.trim(),
      icon: '📝',
      createdBy: teacherProfile?.email || 'admin-teacher',
      createdAt: new Date().toISOString()
    };

    try {
      if (onSaveEval) {
        await onSaveEval(newEval);
      } else {
        await setDoc(doc(db, 'evaluations', id), newEval, { merge: true });
      }
      setShowEvalModal(false);
      resetEvalForm();
      showToast(editingEvalId ? 'تم تحديث بيانات التقييم بنجاح!' : 'تمت إضافة التقييم الأسبوعي وحفظه تلقائياً!');
      onRefresh();
    } catch (err: any) {
      showToast('خطأ في حفظ التقييم: ' + err.message, 'error');
    }
  };

  const handleDeleteEval = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'evaluations', id));
      showToast('تم حذف التقييم تلقائياً.');
      onRefresh();
    } catch (err: any) {
      showToast('خطأ في الحذف: ' + err.message, 'error');
    }
  };

  // Create New Exam
  const handleCreateNewExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExamTitle.trim()) return;

    const id = `exam-${Date.now()}`;
    const newExam: ExamItem = {
      id,
      title: newExamTitle.trim(),
      subject: newExamSubject.trim(),
      timeLimit: Number(newExamTime) || 15,
      questions: [],
      createdBy: teacherProfile?.email || 'admin-teacher',
      createdAt: new Date().toISOString()
    };

    try {
      if (onSaveExam) {
        await onSaveExam(newExam);
      } else {
        await setDoc(doc(db, 'exams', id), {
          ...newExam,
          questions: JSON.stringify(newExam.questions)
        });
      }
      setSelectedExamId(id);
      setShowExamCreateModal(false);
      setNewExamTitle('');
      showToast('تم إنشاء الاختبار الجديد بنجاح! يمكنك الآن إضافة الأسئلة إليه.');
      onRefresh();
    } catch (err: any) {
      showToast('خطأ في إنشاء الاختبار: ' + err.message, 'error');
    }
  };

  // Add / Edit Question in current exam
  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!examQText.trim() || !examOpt0.trim() || !examOpt1.trim()) return;

    const currentExam = exams.find((e) => e.id === selectedExamId) || exams[0] || DEFAULT_EXAM;
    const currentQuestions = currentExam.questions || [];

    const newQuestion: ExamQuestion = {
      cat: examQCat.trim() || 'عام',
      q: examQText.trim(),
      opts: [
        examOpt0.trim(),
        examOpt1.trim(),
        examOpt2.trim() || 'خيار إضافي',
        examOpt3.trim() || 'خيار إضافي'
      ],
      ans: examAns,
      exp: examExp.trim() || 'توضيح الحل من المعلم.'
    };

    let updatedQuestions: ExamQuestion[];
    if (editingQuestionIdx !== null) {
      updatedQuestions = currentQuestions.map((q, idx) =>
        idx === editingQuestionIdx ? newQuestion : q
      );
    } else {
      updatedQuestions = [...currentQuestions, newQuestion];
    }

    const updatedExam: ExamItem = {
      ...currentExam,
      questions: updatedQuestions,
      updatedAt: new Date().toISOString()
    } as any;

    try {
      if (onSaveExam) {
        await onSaveExam(updatedExam);
      } else {
        await setDoc(doc(db, 'exams', currentExam.id), {
          id: currentExam.id,
          title: currentExam.title,
          subject: currentExam.subject,
          timeLimit: currentExam.timeLimit,
          questions: JSON.stringify(updatedQuestions),
          createdBy: 'admin-teacher',
          updatedAt: new Date().toISOString()
        });
      }

      setShowQuestionModal(false);
      resetQuestionForm();
      showToast(
        editingQuestionIdx !== null
          ? 'تم تعديل السؤال بنجاح وحفظه تلقائياً!'
          : 'تمت إضافة السؤال بنجاح وتحديث الاختبار تلقائياً!'
      );
      onRefresh();
    } catch (err: any) {
      showToast('خطأ في حفظ السؤال: ' + err.message, 'error');
    }
  };

  const resetQuestionForm = () => {
    setEditingQuestionIdx(null);
    setExamQCat('قواعد وإعراب');
    setExamQText('');
    setExamOpt0('');
    setExamOpt1('');
    setExamOpt2('');
    setExamOpt3('');
    setExamAns(0);
    setExamExp('');
  };

  const handleEditQuestionClick = (q: ExamQuestion, idx: number) => {
    setEditingQuestionIdx(idx);
    setExamQCat(q.cat);
    setExamQText(q.q);
    setExamOpt0(q.opts[0] || '');
    setExamOpt1(q.opts[1] || '');
    setExamOpt2(q.opts[2] || '');
    setExamOpt3(q.opts[3] || '');
    setExamAns(q.ans || 0);
    setExamExp(q.exp || '');
    setShowQuestionModal(true);
  };

  const handleDeleteQuestion = async (idx: number) => {
    const currentExam = exams.find((e) => e.id === selectedExamId) || exams[0] || DEFAULT_EXAM;
    const currentQuestions = currentExam.questions || [];
    const updated = currentQuestions.filter((_, i) => i !== idx);

    const updatedExam: ExamItem = {
      ...currentExam,
      questions: updated,
      updatedAt: new Date().toISOString()
    } as any;

    try {
      if (onSaveExam) {
        await onSaveExam(updatedExam);
      } else {
        await setDoc(doc(db, 'exams', currentExam.id), {
          id: currentExam.id,
          title: currentExam.title,
          subject: currentExam.subject,
          timeLimit: currentExam.timeLimit,
          questions: JSON.stringify(updated),
          createdBy: 'admin-teacher',
          updatedAt: new Date().toISOString()
        });
      }
      showToast('تم حذف السؤال وتحديث الاختبار تلقائياً.');
      onRefresh();
    } catch (err: any) {
      showToast('خطأ في حذف السؤال: ' + err.message, 'error');
    }
  };

  const handleConfirmDeleteExam = async () => {
    if (!deleteConfirmExam) return;
    setIsDeleting(true);
    try {
      if (onDeleteExam) {
        await onDeleteExam(deleteConfirmExam.id);
      } else {
        await deleteDoc(doc(db, 'exams', deleteConfirmExam.id));
      }
      showToast(`تم حذف اختبار "${deleteConfirmExam.title}" بنجاح.`);
      setDeleteConfirmExam(null);
      const remaining = exams.filter((e) => e.id !== deleteConfirmExam.id);
      if (remaining.length > 0) {
        setSelectedExamId(remaining[0].id);
      }
      onRefresh();
    } catch (err: any) {
      showToast('خطأ أثناء الحذف: ' + err.message, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Delete Student
  const handleConfirmDeleteStudent = async () => {
    if (!deleteConfirmStudent) return;
    setIsDeleting(true);
    try {
      if (onDeleteStudent) {
        await onDeleteStudent(deleteConfirmStudent.phone);
      } else {
        await deleteDoc(doc(db, 'users', deleteConfirmStudent.phone));
      }
      showToast(`تم حذف حساب الطالب "${deleteConfirmStudent.name}" بنجاح.`);
      setDeleteConfirmStudent(null);
      onRefresh();
    } catch (err: any) {
      showToast('خطأ أثناء الحذف: ' + err.message, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Save Announcement
  const handleSaveAnnounce = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!announceTitle.trim() || !announceContent.trim()) return;

    const id = `ann-${Date.now()}`;
    const newAnn: AnnouncementItem = {
      id,
      title: announceTitle,
      content: announceContent,
      category: announceCat,
      date: 'الآن',
      createdBy: teacherProfile?.email || 'admin-teacher',
      createdAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'announcements', id), newAnn);
      setShowAnnounceModal(false);
      setAnnounceTitle('');
      setAnnounceContent('');
      showToast('تم نشر التنبيه للطلاب بنجاح وحفظه تلقائياً!');
      onRefresh();
    } catch (err: any) {
      showToast('خطأ في نشر الإعلان: ' + err.message, 'error');
    }
  };

  const handleDeleteAnnounce = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'announcements', id));
      showToast('تم حذف الإعلان تلقائياً.');
      onRefresh();
    } catch (err: any) {
      showToast('خطأ في الحذف: ' + err.message, 'error');
    }
  };

  // Filtered books
  const displayedBooks = books.filter((b) => {
    if (!dashboardBookSearch.trim()) return true;
    const q = dashboardBookSearch.toLowerCase();
    return (
      b.title.toLowerCase().includes(q) ||
      b.category.toLowerCase().includes(q) ||
      b.grade.toLowerCase().includes(q)
    );
  });

  // Student Approval Filter & Live Chat States
  const [studentStatusFilter, setStudentStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [chatMessages, setChatMessages] = useState<SupportChatMessage[]>([]);
  const [selectedChatStudentPhone, setSelectedChatStudentPhone] = useState<string | null>(null);
  const [teacherReplyText, setTeacherReplyText] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);

  // Sync Live Chat Messages
  useEffect(() => {
    try {
      const unsub = onSnapshot(collection(db, 'support_messages'), (snapshot) => {
        const msgs: SupportChatMessage[] = [];
        snapshot.forEach((d) => msgs.push(d.data() as SupportChatMessage));
        msgs.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        setChatMessages(msgs);
      });
      return () => unsub();
    } catch (e) {
      console.warn('Chat listener error:', e);
    }
  }, []);

  // Unique students who messaged in chat
  const chatStudentPhones = Array.from(new Set(chatMessages.map((m) => m.studentPhone)));

  const handleSendTeacherReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChatStudentPhone || !teacherReplyText.trim()) return;

    setIsSendingReply(true);
    const targetStudent = students.find((s) => s.phone === selectedChatStudentPhone);
    const studentName = targetStudent?.name || 'طالب';
    const msgId = `msg-${Date.now()}`;
    const newMsg: SupportChatMessage = {
      id: msgId,
      studentPhone: selectedChatStudentPhone,
      studentName,
      senderRole: 'teacher',
      senderName: 'الأستاذ: محمد رمضان الحرباوي 👑',
      text: teacherReplyText.trim(),
      createdAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'support_messages', msgId), newMsg);
      setTeacherReplyText('');
      showToast('تم إرسال ردك للطالب بنجاح! 📨');
    } catch (err: any) {
      showToast('خطأ في إرسال الرد: ' + err.message, 'error');
    } finally {
      setIsSendingReply(false);
    }
  };

  const pendingStudentsCount = localStudents.filter((s) => s.status === 'pending' || !s.status).length;
  const approvedStudentsCount = localStudents.filter((s) => s.status === 'approved').length;
  const rejectedStudentsCount = localStudents.filter((s) => s.status === 'rejected').length;

  // Filtered students
  const displayedStudents = localStudents.filter((s) => {
    const q = studentSearch.toLowerCase().trim();
    const matchesSearch = !q || s.name.toLowerCase().includes(q) || s.phone.includes(q) || (s.grade && s.grade.toLowerCase().includes(q));
    const matchesStatus =
      studentStatusFilter === 'all'
        ? true
        : studentStatusFilter === 'pending'
        ? s.status === 'pending' || !s.status
        : s.status === studentStatusFilter;
    return matchesSearch && matchesStatus;
  });

  // Filtered videos
  const displayedVideos = videos.filter((v) => {
    if (!videoSearch.trim()) return true;
    const q = videoSearch.toLowerCase();
    return (
      v.title.toLowerCase().includes(q) ||
      v.category.toLowerCase().includes(q) ||
      v.description.toLowerCase().includes(q)
    );
  });


  const activeExam = exams.find((e) => e.id === selectedExamId) || exams[0] || DEFAULT_EXAM;
  const unreadTicketsCount = supportTickets.filter((t) => t.status === 'جديدة').length;

  // =========================================================================
  // IF NOT AUTHENTICATED: CLEAN MODERN GOOGLE AUTHENTICATION GATE
  // =========================================================================
  if (!isAuthenticated) {
    return (
      <div
        className={`max-w-md mx-auto my-12 p-6 sm:p-8 rounded-3xl shadow-2xl relative overflow-hidden transition-colors ${
          isDark
            ? 'bg-slate-900 border border-amber-500/30 text-slate-100'
            : 'bg-white border border-amber-400 text-slate-900'
        }`}
      >
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-500 via-amber-600 to-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-amber-500/20">
          <ShieldCheck className="w-8 h-8 text-white" />
        </div>

        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 text-xs font-semibold mb-2">
            <Lock className="w-3.5 h-3.5" />
            بوابة دخول المعلم والإدارة
          </div>
          <h2 className="text-2xl font-black">تسجيل دخول لوحة التحكم</h2>
          <p className={`text-xs mt-1.5 leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            سجّل الدخول بحساب Google المعتمد لإدارة وتعديل وحذف محتوى المكتبة، متابعة الاختبارات، ومعرفة الطلاب المسجلين في الموقع.
          </p>
        </div>

        {authError && (
          <div className="mb-5 p-3.5 rounded-xl bg-amber-950/70 border border-amber-800/80 text-amber-200 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="flex-1 leading-relaxed">
              <span>{authError}</span>
            </div>
          </div>
        )}

        {/* Google One-Click Login */}
        <div className="space-y-3">
          <button
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            className={`w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-3 transition-all cursor-pointer shadow-xl disabled:opacity-50 ${
              isDark
                ? 'bg-white hover:bg-slate-100 text-slate-900'
                : 'bg-slate-900 hover:bg-slate-800 text-white'
            }`}
          >
            {googleLoading ? (
              <RefreshCw className="w-5 h-5 animate-spin text-indigo-600" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            )}
            <span>المتابعة بحساب Google</span>
          </button>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-700/50 text-center">
          <p className="text-[11px] text-slate-500 flex items-center justify-center gap-1">
            <Lock className="w-3 h-3" />
            <span>نظام مصادقة آمن 100% • مخصص حصرياً للمشرف: محمد رمضان الحرباوي</span>
          </p>
        </div>
      </div>
    );
  }

  // =========================================================================
  // IF AUTHENTICATED: RENDER FULL TEACHER DASHBOARD
  // =========================================================================
  return (
    <div className="space-y-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl shadow-2xl border text-sm font-bold flex items-center gap-2.5 transition-all ${
            toastMessage.type === 'success'
              ? 'bg-emerald-950/95 border-emerald-500 text-emerald-100 shadow-emerald-950/50'
              : 'bg-rose-950/95 border-rose-500 text-rose-100 shadow-rose-950/50'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Top Banner with Teacher Profile */}
      <div
        className={`border rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden transition-colors ${
          isDark
            ? 'bg-gradient-to-r from-slate-900 via-indigo-950/70 to-slate-900 border-amber-500/40 text-slate-100'
            : 'bg-gradient-to-r from-white via-indigo-50/50 to-amber-50/40 border-amber-300 text-slate-900'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs font-bold">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                جلسة معلم نشطة ومؤكدة
              </span>
              {teacherProfile && (
                <span
                  className={`text-xs px-3 py-1 rounded-full border flex items-center gap-1.5 font-medium ${
                    isDark
                      ? 'text-indigo-300 bg-indigo-950/60 border-indigo-800'
                      : 'text-indigo-800 bg-indigo-100 border-indigo-200'
                  }`}
                >
                  <span>{teacherProfile.name}</span>
                  <span className="text-slate-400">•</span>
                  <span className="font-mono text-[11px] text-amber-500">{teacherProfile.email}</span>
                </span>
              )}
            </div>

            <h2 className="text-2xl sm:text-3xl font-black">لوحة تحكم المعلم وإدارة المنصة</h2>
            <p className={`text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              إدارة كاملة للكتب والمذكرات، وضع الامتحانات التفاعلية، متابعة قائمة الطلاب المسجلين، والرد الفوري على رسائل الدعم الفني.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Logout / Lock Button */}
            <button
              onClick={handleLogout}
              className={`inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                isDark
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-rose-300 border-slate-700'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-rose-600 border-slate-300'
              }`}
              title="تسجيل الخروج وقفل اللوحة"
            >
              <LogOut className="w-4 h-4" />
              <span>تسجيل الخروج</span>
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Books */}
        <div
          className={`border rounded-2xl p-4 sm:p-5 shadow-lg flex items-center justify-between ${
            isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div>
            <span className="text-xs text-slate-500 font-medium">الكتب والمذكرات</span>
            <p className="text-2xl sm:text-3xl font-extrabold mt-1">{books.length}</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
        </div>

        {/* Registered Students (NEW STAT) */}
        <div
          className={`border rounded-2xl p-4 sm:p-5 shadow-lg flex items-center justify-between ${
            isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div>
            <span className="text-xs text-slate-500 font-medium">الطلاب المسجلين</span>
            <p className="text-2xl sm:text-3xl font-extrabold text-blue-500 mt-1">{students.length}</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Exams (NEW) */}
        <div
          className={`border rounded-2xl p-4 sm:p-5 shadow-lg flex items-center justify-between ${
            isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div>
            <span className="text-xs text-slate-500 font-medium">الاختبارات التفاعلية</span>
            <p className="text-2xl sm:text-3xl font-extrabold text-amber-500 mt-1">{exams.length}</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center">
            <HelpCircle className="w-5 h-5" />
          </div>
        </div>

        {/* Evaluations */}
        <div
          className={`border rounded-2xl p-4 sm:p-5 shadow-lg flex items-center justify-between ${
            isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div>
            <span className="text-xs text-slate-500 font-medium">التقييمات الأسبوعية</span>
            <p className="text-2xl sm:text-3xl font-extrabold text-emerald-500 mt-1">{evaluations.length}</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center">
            <FileCheck2 className="w-5 h-5" />
          </div>
        </div>

        {/* Announcements */}
        <div
          className={`border rounded-2xl p-4 sm:p-5 shadow-lg flex items-center justify-between ${
            isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div>
            <span className="text-xs text-slate-500 font-medium">الإعلانات</span>
            <p className="text-2xl sm:text-3xl font-extrabold text-violet-500 mt-1">{announcements.length}</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-violet-500/10 text-violet-500 border border-violet-500/20 flex items-center justify-center">
            <Bell className="w-5 h-5" />
          </div>
        </div>

        {/* Videos */}
        <div
          className={`border rounded-2xl p-4 sm:p-5 shadow-lg flex items-center justify-between ${
            isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div>
            <span className="text-xs text-slate-500 font-medium">الفيديوهات</span>
            <p className="text-2xl sm:text-3xl font-extrabold text-purple-500 mt-1">{videos.length}</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-purple-500/10 text-purple-500 border border-purple-500/20 flex items-center justify-center">
            <Video className="w-5 h-5" />
          </div>
        </div>

        {/* Support Tickets */}
        <div
          className={`border rounded-2xl p-4 sm:p-5 shadow-lg flex items-center justify-between col-span-2 lg:col-span-1 ${
            isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div>
            <span className="text-xs text-slate-500 font-medium">رسائل الدعم</span>
            <div className="flex items-center gap-1.5 mt-1">
              <p className="text-2xl sm:text-3xl font-extrabold text-cyan-500">{supportTickets.length}</p>
              {unreadTicketsCount > 0 && (
                <span className="text-[10px] bg-rose-500 text-white font-bold px-1.5 py-0.5 rounded-full">
                  {unreadTicketsCount}
                </span>
              )}
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-cyan-500/10 text-cyan-500 border border-cyan-500/20 flex items-center justify-center">
            <Headphones className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Navigation SubTabs */}
      <div
        className={`flex border-b gap-2 sm:gap-4 overflow-x-auto text-xs sm:text-sm ${
          isDark ? 'border-slate-800' : 'border-slate-200'
        }`}
      >
        <button
          onClick={() => setActiveSubTab('books')}
          className={`pb-3 px-3 font-semibold border-b-2 transition-colors flex items-center gap-2 shrink-0 cursor-pointer ${
            activeSubTab === 'books'
              ? 'border-indigo-500 text-indigo-500 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>إدارة الكتب والمذكرات ({books.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('videos')}
          className={`pb-3 px-3 font-semibold border-b-2 transition-colors flex items-center gap-2 shrink-0 cursor-pointer ${
            activeSubTab === 'videos'
              ? 'border-purple-500 text-purple-500 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
          }`}
        >
          <Video className="w-4 h-4 text-purple-400" />
          <span>إدارة الفيديوهات والشروحات ({videos.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('students')}
          className={`pb-3 px-3 font-semibold border-b-2 transition-colors flex items-center gap-2 shrink-0 cursor-pointer ${
            activeSubTab === 'students'
              ? 'border-blue-500 text-blue-500 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>الطلاب واعتماد الحسابات ({students.length})</span>
          {pendingStudentsCount > 0 && (
            <span className="text-[10px] bg-amber-500 text-slate-950 font-black px-1.5 py-0.2 rounded-full animate-pulse">
              {pendingStudentsCount} طلبات معلقة ⏳
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('chat')}
          className={`pb-3 px-3 font-semibold border-b-2 transition-colors flex items-center gap-2 shrink-0 cursor-pointer ${
            activeSubTab === 'chat'
              ? 'border-emerald-500 text-emerald-500 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
          }`}
        >
          <MessageCircle className="w-4 h-4" />
          <span>محادثات الطلاب الحية (Live Chat) 💬</span>
          {chatStudentPhones.length > 0 && (
            <span className="text-[10px] bg-emerald-500 text-white font-bold px-1.5 py-0.2 rounded-full">
              {chatStudentPhones.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('exams')}
          className={`pb-3 px-3 font-semibold border-b-2 transition-colors flex items-center gap-2 shrink-0 cursor-pointer ${
            activeSubTab === 'exams'
              ? 'border-amber-500 text-amber-500 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>الامتحانات التفاعلية ({exams.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('evaluations')}
          className={`pb-3 px-3 font-semibold border-b-2 transition-colors flex items-center gap-2 shrink-0 cursor-pointer ${
            activeSubTab === 'evaluations'
              ? 'border-emerald-500 text-emerald-500 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
          }`}
        >
          <FileCheck2 className="w-4 h-4" />
          <span>التقييمات والواجبات ({evaluations.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('support')}
          className={`pb-3 px-3 font-semibold border-b-2 transition-colors flex items-center gap-2 shrink-0 cursor-pointer ${
            activeSubTab === 'support'
              ? 'border-cyan-500 text-cyan-500 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
          }`}
        >
          <Headphones className="w-4 h-4" />
          <span>رسائل الدعم الفني ({supportTickets.length})</span>
          {unreadTicketsCount > 0 && (
            <span className="text-[10px] bg-rose-500 text-white font-bold px-1.5 py-0.2 rounded-full">
              {unreadTicketsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('announcements')}
          className={`pb-3 px-3 font-semibold border-b-2 transition-colors flex items-center gap-2 shrink-0 cursor-pointer ${
            activeSubTab === 'announcements'
              ? 'border-violet-500 text-violet-500 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>إعلانات الطلاب ({announcements.length})</span>
        </button>
      </div>

      {/* SubTab 1: Books Management */}
      {activeSubTab === 'books' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-base">
                قائمة الكتب والمقررات الحالية ({books.length} كتاب)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                تعديل وحذف أي كتاب بنقرة واحدة، والمزامنة تتم تلقائياً مع السحابة والموقع.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <input
                  type="text"
                  value={dashboardBookSearch}
                  onChange={(e) => setDashboardBookSearch(e.target.value)}
                  placeholder="بحث سريع في الكتب..."
                  className={`border rounded-xl pr-9 pl-3 py-2 text-xs focus:border-indigo-500 w-48 sm:w-60 ${
                    isDark ? 'bg-slate-950 border-slate-700 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3" />
              </div>

              <button
                onClick={() => {
                  resetBookForm();
                  setShowBookModal(true);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs font-semibold shadow-md transition-colors cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة كتاب جديد</span>
              </button>
            </div>
          </div>

          <div
            className={`rounded-2xl border overflow-hidden shadow-xl max-h-[620px] overflow-y-auto ${
              isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
            }`}
          >
            <table className="w-full text-right text-xs">
              <thead
                className={`uppercase border-b sticky top-0 z-10 backdrop-blur-sm ${
                  isDark ? 'bg-slate-950/80 border-slate-800 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-600'
                }`}
              >
                <tr>
                  <th className="p-3.5 sm:p-4">الكتاب / المادة</th>
                  <th className="p-3.5 sm:p-4">الشعبة / المادة</th>
                  <th className="p-3.5 sm:p-4">الصف</th>
                  <th className="p-3.5 sm:p-4 text-center">إجراءات التحكم</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-slate-800/60' : 'divide-slate-200'}`}>
                {displayedBooks.map((b) => (
                  <tr key={b.id} className={isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'}>
                    <td className="p-3.5 sm:p-4">
                      <div className="flex items-center gap-3">
                        <span className="text-xl shrink-0">{b.icon || '📚'}</span>
                        <div>
                          <p className="font-semibold text-sm">{b.title}</p>
                          <p className="text-slate-500 text-[11px] truncate max-w-xs">{b.description}</p>
                          {b.teacherNotes && (
                            <p className="text-amber-500 text-[10px] mt-0.5 truncate max-w-xs">
                              💡 نصيحة المعلم: {b.teacherNotes}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5 sm:p-4">
                      <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 font-medium">
                        {b.category}
                      </span>
                    </td>
                    <td className="p-3.5 sm:p-4 text-slate-500">{b.grade}</td>
                    <td className="p-3.5 sm:p-4">
                      <div className="flex items-center justify-center gap-1.5">
                        <a
                          href={b.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-lg text-slate-400 hover:text-indigo-500 transition-colors"
                          title="معاينة الملف"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => handleEditBook(b)}
                          className="px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/30 font-semibold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                          title="تعديل بيانات الكتاب"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>تعديل</span>
                        </button>
                        <button
                          onClick={() => setDeleteConfirmBook(b)}
                          className="px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/30 font-semibold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                          title="حذف الكتاب"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>حذف</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SubTab: Videos Management (NEW REQUEST) */}
      {activeSubTab === 'videos' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-base">
                قائمة الفيديوهات والشروحات التعليمية ({videos.length} محاضرة)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                إضافة شروحات جديدة، إرفاق أوراق عمل وملخصات PDF مع كل فيديو، وتعديل أو حذف المحاضرات.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <input
                  type="text"
                  value={videoSearch}
                  onChange={(e) => setVideoSearch(e.target.value)}
                  placeholder="بحث في الفيديوهات..."
                  className={`border rounded-xl pr-9 pl-3 py-2 text-xs focus:border-purple-500 w-48 sm:w-60 ${
                    isDark ? 'bg-slate-950 border-slate-700 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3" />
              </div>

              <button
                onClick={() => {
                  resetVideoForm();
                  setShowVideoModal(true);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 active:bg-purple-700 text-white text-xs font-semibold shadow-md transition-colors cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة فيديو جديد</span>
              </button>
            </div>
          </div>

          <div
            className={`rounded-2xl border overflow-hidden shadow-xl max-h-[620px] overflow-y-auto ${
              isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
            }`}
          >
            <table className="w-full text-right text-xs">
              <thead
                className={`uppercase border-b sticky top-0 z-10 backdrop-blur-sm ${
                  isDark ? 'bg-slate-950/80 border-slate-800 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-600'
                }`}
              >
                <tr>
                  <th className="p-3.5 sm:p-4">المحاضرة / العنوان</th>
                  <th className="p-3.5 sm:p-4">المادة</th>
                  <th className="p-3.5 sm:p-4">الصف والمدة</th>
                  <th className="p-3.5 sm:p-4">الملفات المرفقة</th>
                  <th className="p-3.5 sm:p-4 text-center">إجراءات التحكم</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-slate-800/60' : 'divide-slate-200'}`}>
                {displayedVideos.map((v) => (
                  <tr key={v.id} className={isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'}>
                    <td className="p-3.5 sm:p-4">
                      <div className="flex items-center gap-3">
                        <span className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center shrink-0">
                          <Video className="w-5 h-5" />
                        </span>
                        <div>
                          <p className="font-semibold text-sm">{v.title}</p>
                          <p className="text-slate-500 text-[11px] truncate max-w-xs">{v.description}</p>
                          {v.teacherNotes && (
                            <p className="text-amber-500 text-[10px] mt-0.5 truncate max-w-xs">
                              💡 توجيهات: {v.teacherNotes}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5 sm:p-4">
                      <span className="px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 font-medium">
                        {v.category}
                      </span>
                    </td>
                    <td className="p-3.5 sm:p-4">
                      <div>
                        <p className="font-medium text-slate-300">{v.grade}</p>
                        {v.duration && <p className="text-[10px] text-slate-400 mt-0.5">{v.duration}</p>}
                      </div>
                    </td>
                    <td className="p-3.5 sm:p-4">
                      {v.attachments && v.attachments.length > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-bold text-[11px]">
                          <Paperclip className="w-3 h-3" />
                          <span>{v.attachments.length} ملفات مرفقة</span>
                        </span>
                      ) : (
                        <span className="text-slate-500 text-[11px]">لا يوجد</span>
                      )}
                    </td>
                    <td className="p-3.5 sm:p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <a
                          href={v.videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-lg text-slate-400 hover:text-purple-400 transition-colors"
                          title="مشاهدة رابط الفيديو"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => handleEditVideo(v)}
                          className="px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/30 font-semibold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                          title="تعديل الفيديو والمرفقات"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>تعديل</span>
                        </button>
                        <button
                          onClick={() => setDeleteConfirmVideo(v)}
                          className="px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/30 font-semibold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                          title="حذف الفيديو"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>حذف</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SubTab 2: Registered Students & Access Approval */}
      {activeSubTab === 'students' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base sm:text-lg">
                  مراجعة واعتماد طلبات الطلاب ({students.length} حساب)
                </h3>
                {pendingStudentsCount > 0 && (
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black animate-pulse">
                    {pendingStudentsCount} طلبات بانتظار موافقتك ⏳
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                يمكنك الموافقة على تفعيل الحساب فوراً لتفتح للطالب المكتبة، أو رفضه أو تجميده لحماية المنصة.
              </p>
            </div>

            <div className="relative">
              <input
                type="text"
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                placeholder="ابحث باسم الطالب أو رقم الهاتف..."
                className={`border rounded-xl pr-9 pl-3 py-2 text-xs focus:border-blue-500 w-56 sm:w-72 ${
                  isDark ? 'bg-slate-950 border-slate-700 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3" />
            </div>
          </div>

          {/* Status Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setStudentStatusFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                studentStatusFilter === 'all'
                  ? 'bg-blue-600 text-white shadow-md'
                  : isDark
                  ? 'bg-slate-800 text-slate-400 hover:text-white'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              جميع الطلاب ({students.length})
            </button>
            <button
              onClick={() => setStudentStatusFilter('pending')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                studentStatusFilter === 'pending'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                  : isDark
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                  : 'bg-amber-50 text-amber-800 border border-amber-200'
              }`}
            >
              <span>قيد الانتظار والمراجعة ⏳</span>
              <span className="text-[10px] bg-amber-600/30 px-1.5 py-0.2 rounded-full">
                {pendingStudentsCount}
              </span>
            </button>
            <button
              onClick={() => setStudentStatusFilter('approved')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                studentStatusFilter === 'approved'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : isDark
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              }`}
            >
              <span>المعتمدين والمفعلين ✅</span>
              <span className="text-[10px] bg-emerald-600/30 px-1.5 py-0.2 rounded-full">
                {approvedStudentsCount}
              </span>
            </button>
            <button
              onClick={() => setStudentStatusFilter('rejected')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                studentStatusFilter === 'rejected'
                  ? 'bg-rose-600 text-white shadow-md'
                  : isDark
                  ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              <span>المرفوضين ❌</span>
              <span className="text-[10px] bg-rose-600/30 px-1.5 py-0.2 rounded-full">
                {rejectedStudentsCount}
              </span>
            </button>
          </div>

          {displayedStudents.length > 0 ? (
            <div
              className={`rounded-2xl border overflow-hidden shadow-xl max-h-[620px] overflow-y-auto ${
                isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
              }`}
            >
              <table className="w-full text-right text-xs">
                <thead
                  className={`uppercase border-b sticky top-0 z-10 backdrop-blur-sm ${
                    isDark ? 'bg-slate-950/80 border-slate-800 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-600'
                  }`}
                >
                  <tr>
                    <th className="p-3.5 sm:p-4">اسم الطالب</th>
                    <th className="p-3.5 sm:p-4">رقم الهاتف</th>
                    <th className="p-3.5 sm:p-4">الصف</th>
                    <th className="p-3.5 sm:p-4 text-center">حالة الحساب</th>
                    <th className="p-3.5 sm:p-4 text-center">الرتبة والصلاحية (ترقية المشرفين) 👑</th>
                    <th className="p-3.5 sm:p-4">تاريخ الطلب</th>
                    <th className="p-3.5 sm:p-4 text-center">المراجعة والاعتماد</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? 'divide-slate-800/60' : 'divide-slate-200'}`}>
                  {displayedStudents.map((s, idx) => {
                    const isApproved = s.status === 'approved';
                    const isRejected = s.status === 'rejected';
                    const isPending = !isApproved && !isRejected;

                    return (
                      <tr key={`${s.phone || 'student'}-${idx}`} className={isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'}>
                        <td className="p-3.5 sm:p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-500 flex items-center justify-center font-bold text-sm shrink-0">
                              {s.name.charAt(0) || 'ط'}
                            </div>
                            <div>
                              <p className="font-semibold text-sm">{s.name}</p>
                              <span className="text-[10px] text-slate-400">طالب</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-3.5 sm:p-4">
                          <span className="font-mono text-indigo-400 font-semibold text-xs" dir="ltr">
                            {s.phone}
                          </span>
                        </td>
                        <td className="p-3.5 sm:p-4 text-slate-400 text-xs">
                          {s.grade || 'تانية بكالوريا'}
                        </td>
                        <td className="p-3.5 sm:p-4 text-center">
                          {isApproved && (
                            <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold text-[11px] inline-flex items-center gap-1">
                              <span>معتمد ومفعل</span>
                              <CheckCircle className="w-3 h-3" />
                            </span>
                          )}
                          {isRejected && (
                            <span className="px-2.5 py-1 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30 font-bold text-[11px] inline-flex items-center gap-1">
                              <span>مرفوض</span>
                              <X className="w-3 h-3" />
                            </span>
                          )}
                          {isPending && (
                            <span className="px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 font-bold text-[11px] inline-flex items-center gap-1 animate-pulse">
                              <span>قيد المراجعة</span>
                              <Clock className="w-3 h-3" />
                            </span>
                          )}
                        </td>
                        {/* SUPERVISOR / ROLE PROMOTION SELECTOR */}
                        <td className="p-3.5 sm:p-4 text-center">
                          <div className="inline-flex items-center gap-1.5">
                            <select
                              value={s.role || 'student'}
                              onChange={(e) =>
                                handlePromoteStudent(s.phone, e.target.value as 'student' | 'admin' | 'owner', s.name)
                              }
                              className={`text-[11px] font-bold px-2.5 py-1.5 rounded-xl border cursor-pointer focus:outline-none transition-colors ${
                                s.role === 'owner'
                                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-400 font-black'
                                  : s.role === 'admin'
                                  ? 'bg-purple-500/20 border-purple-500/50 text-purple-400 font-bold'
                                  : isDark
                                  ? 'bg-slate-800 border-slate-700 text-slate-300'
                                  : 'bg-slate-100 border-slate-300 text-slate-700'
                              }`}
                              title="ترقية أو تغيير رتبة المستخدم"
                            >
                              <option value="student">🎓 طالب عادي</option>
                              <option value="admin">🛡️ مشرف عام (أدمن)</option>
                              <option value="owner">👑 مالك مساعد</option>
                            </select>
                          </div>
                        </td>
                        <td className="p-3.5 sm:p-4 text-slate-500 text-[11px]">
                          {s.createdAt ? new Date(s.createdAt).toLocaleDateString('ar-EG') : 'جديد'}
                        </td>
                        <td className="p-3.5 sm:p-4">
                          <div className="flex items-center justify-center gap-1.5 flex-wrap">
                            {/* APPROVE BUTTON */}
                            {!isApproved && (
                              <button
                                onClick={() => handleApproveStudentOptimistic(s.phone, s.name)}
                                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 shadow-md shadow-emerald-600/25 transition-all cursor-pointer"
                                title="موافقة وتفعيل الحساب فوراً"
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                                <span>موافقة</span>
                              </button>
                            )}

                            {/* REJECT BUTTON */}
                            {!isRejected && (
                              <button
                                onClick={() => handleRejectStudentOptimistic(s.phone, s.name)}
                                className="px-2.5 py-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 font-semibold text-xs flex items-center gap-1 transition-all cursor-pointer"
                                title="رفض الحساب"
                              >
                                <X className="w-3.5 h-3.5" />
                                <span>رفض</span>
                              </button>
                            )}

                            {/* Live Chat with Student */}
                            <button
                              onClick={() => {
                                setSelectedChatStudentPhone(s.phone);
                                setActiveSubTab('chat');
                              }}
                              className="p-1.5 rounded-lg bg-cyan-600/20 text-cyan-300 hover:bg-cyan-600/30 transition-colors cursor-pointer"
                              title="بدء شات مباشر مع الطالب"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                            </button>

                            {/* WhatsApp */}
                            <a
                              href={`https://wa.me/${s.phone.replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 transition-colors"
                              title="محادثة واتساب"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                            </a>

                            {/* Delete Student */}
                            <button
                              onClick={() => setDeleteConfirmStudent(s)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                              title="حذف حساب الطالب"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div
              className={`text-center py-16 rounded-2xl border ${
                isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <Users className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <h4 className="text-base font-bold text-slate-500">لا يوجد طلاب في هذا التصنيف حالياً</h4>
              <p className="text-xs text-slate-400 mt-1">
                اختر تصنيفاً آخر أو انتظر تسجيل طلبات جديدة من الطلاب.
              </p>
            </div>
          )}
        </div>
      )}

      {/* SubTab 2.5: Live Student Chat & Messaging */}
      {activeSubTab === 'chat' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-black text-base sm:text-lg flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-emerald-400" />
                <span>محادثات الطلاب الحية والمباشرة (Live Chat)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                تحدث مع طلابك مباشرة بشكل لحظي، أجب على استفساراتهم وساعدهم في المذاكرة.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Conversations List (Students) */}
            <div
              className={`p-3 rounded-2xl border space-y-2 max-h-[550px] overflow-y-auto ${
                isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
              }`}
            >
              <h4 className="text-xs font-bold text-slate-400 px-1 mb-2">
                قائمة محادثات الطلاب ({chatStudentPhones.length}):
              </h4>

              {chatStudentPhones.length > 0 ? (
                chatStudentPhones.map((ph, phIdx) => {
                  const student = students.find((s) => s.phone === ph);
                  const studentMsgs = chatMessages.filter((m) => m.studentPhone === ph);
                  const lastMsg = studentMsgs[studentMsgs.length - 1];
                  const isSelected = selectedChatStudentPhone === ph;

                  return (
                    <div
                      key={`${ph}-${phIdx}`}
                      onClick={() => setSelectedChatStudentPhone(ph)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-600/20 border-indigo-500 shadow-md'
                          : isDark
                          ? 'bg-slate-950/60 hover:bg-slate-800/60 border-slate-800 text-slate-300'
                          : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs truncate">
                          {student?.name || lastMsg?.studentName || 'طالب'}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono" dir="ltr">
                          {ph}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate">
                        {lastMsg?.text || 'لا توجد رسائل بعد'}
                      </p>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-xs text-slate-500">
                  لا توجد محادثات نشطة حالياً. عندما يرسل طالب رسالة ستظهر هنا فوراً.
                </div>
              )}
            </div>

            {/* Active Chat Conversation */}
            <div
              className={`md:col-span-2 p-4 rounded-2xl border flex flex-col min-h-[450px] max-h-[550px] ${
                isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
              }`}
            >
              {selectedChatStudentPhone ? (
                <>
                  {/* Chat Top Bar */}
                  <div className="pb-3 border-b border-slate-800 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs sm:text-sm font-black text-white">
                        محادثة مع: {students.find((s) => s.phone === selectedChatStudentPhone)?.name || 'طالب'}
                      </h4>
                      <span className="text-[10px] text-slate-400 font-mono" dir="ltr">
                        {selectedChatStudentPhone}
                      </span>
                    </div>

                    <a
                      href={`https://wa.me/${selectedChatStudentPhone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold flex items-center gap-1"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>واتساب</span>
                    </a>
                  </div>

                  {/* Messages Bubble Area */}
                  <div className="flex-1 overflow-y-auto space-y-3 py-3 px-1">
                    {chatMessages
                      .filter((m) => m.studentPhone === selectedChatStudentPhone)
                      .map((msg) => {
                        const isTeacher = msg.senderRole === 'teacher';
                        return (
                          <div
                            key={msg.id}
                            className={`flex items-start gap-2 max-w-[80%] ${
                              isTeacher ? 'mr-auto' : 'ml-auto flex-row-reverse'
                            }`}
                          >
                            <div
                              className={`p-3 rounded-2xl text-xs leading-relaxed ${
                                isTeacher
                                  ? 'bg-amber-500 text-slate-950 font-medium rounded-tr-none shadow-md'
                                  : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700'
                              }`}
                            >
                              <div className="font-bold text-[10px] mb-0.5 opacity-80">
                                {isTeacher ? 'أنت (المعلم المشرف 👑)' : msg.senderName}
                              </div>
                              <p className="whitespace-pre-wrap">{msg.text}</p>
                              <div className="text-[9px] mt-1 opacity-60 text-left">
                                {new Date(msg.createdAt).toLocaleTimeString('ar-EG', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>

                  {/* Teacher Reply Input */}
                  <form onSubmit={handleSendTeacherReply} className="pt-3 border-t border-slate-800 flex gap-2">
                    <input
                      type="text"
                      value={teacherReplyText}
                      onChange={(e) => setTeacherReplyText(e.target.value)}
                      placeholder="اكتب ردك المباشر كمعلم ومشرف للطالب..."
                      className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:border-amber-500"
                    />
                    <button
                      type="submit"
                      disabled={isSendingReply || !teacherReplyText.trim()}
                      className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-md shadow-amber-500/25 transition-all cursor-pointer disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>إرسال الرد</span>
                    </button>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-500 space-y-2">
                  <MessageCircle className="w-12 h-12 text-slate-600" />
                  <p className="text-xs font-bold">اختر طالباً من القائمة لعرض المحادثة والرد عليه</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SubTab 3: Interactive Exams Creator & Management (NEW REQUEST) */}
      {activeSubTab === 'exams' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-base">
                نظام الامتحانات التفاعلية وبنك الأسئلة
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                أنت من يضع الاختبارات والأسئلة! يمكنك إنشاء اختبار جديد، إضافة أسئلة وخيارات وتحديد الإجابة الصحيحة وشرح المعلم.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowExamCreateModal(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 text-xs font-bold shadow-md transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>إنشاء اختبار جديد</span>
              </button>

              <button
                onClick={() => {
                  resetQuestionForm();
                  setShowQuestionModal(true);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة سؤال للاختبار الحالي</span>
              </button>
            </div>
          </div>

          {/* Exam Switcher Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <span className="text-xs font-bold text-slate-500 shrink-0">اختر الاختبار للتحكم:</span>
            {exams.map((ex) => (
              <button
                key={ex.id}
                onClick={() => setSelectedExamId(ex.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 cursor-pointer ${
                  selectedExamId === ex.id
                    ? 'bg-amber-500 text-slate-950 shadow-md ring-2 ring-amber-400'
                    : isDark
                    ? 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <span>{ex.title}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800/40">
                  {ex.questions?.length || 0} أسئلة
                </span>
              </button>
            ))}
          </div>

          {/* Active Exam Header & Delete Option */}
          <div
            className={`p-4 sm:p-5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
            }`}
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20">
                  {activeExam.subject}
                </span>
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  الزمن: {activeExam.timeLimit} دقيقة
                </span>
              </div>
              <h4 className="text-lg font-bold mt-1">{activeExam.title}</h4>
              <p className="text-xs text-slate-500">
                إجمالي الأسئلة في هذا الاختبار: {activeExam.questions?.length || 0} سؤال
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  resetQuestionForm();
                  setShowQuestionModal(true);
                }}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة سؤال</span>
              </button>

              {exams.length > 1 && (
                <button
                  onClick={() => setDeleteConfirmExam(activeExam)}
                  className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/30 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  title="حذف هذا الاختبار بالكامل"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>حذف الاختبار</span>
                </button>
              )}
            </div>
          </div>

          {/* Questions List */}
          <div className="space-y-4">
            {(activeExam.questions || []).length > 0 ? (
              activeExam.questions.map((q, idx) => (
                <div
                  key={idx}
                  className={`border rounded-2xl p-5 shadow-lg transition-all ${
                    isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 flex items-center justify-center text-xs font-bold">
                        {idx + 1}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-500/10 text-slate-500 font-medium">
                        {q.cat}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-emerald-500 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        الإجابة الصحيحة: الخيار رقم {q.ans + 1}
                      </span>
                      <button
                        onClick={() => handleEditQuestionClick(q, idx)}
                        className="p-1.5 text-slate-400 hover:text-amber-500 transition-colors cursor-pointer"
                        title="تعديل السؤال"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteQuestion(idx)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                        title="حذف السؤال"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p className="font-bold text-sm mb-4 leading-relaxed">{q.q}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs mb-3">
                    {q.opts.map((opt, oIdx) => (
                      <div
                        key={oIdx}
                        className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                          oIdx === q.ans
                            ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-300 font-bold'
                            : isDark
                            ? 'bg-slate-950 border-slate-800 text-slate-300'
                            : 'bg-slate-50 border-slate-200 text-slate-700'
                        }`}
                      >
                        <span className="w-5 h-5 rounded-full bg-slate-500/20 text-[11px] flex items-center justify-center shrink-0">
                          {oIdx + 1}
                        </span>
                        <span>{opt}</span>
                      </div>
                    ))}
                  </div>

                  {q.exp && (
                    <p
                      className={`text-xs p-2.5 rounded-xl border ${
                        isDark
                          ? 'bg-indigo-950/30 text-indigo-300 border-indigo-900/40'
                          : 'bg-indigo-50 text-indigo-900 border-indigo-100'
                      }`}
                    >
                      💡 <strong>الشرح التعليمي للمعلم:</strong> {q.exp}
                    </p>
                  )}
                </div>
              ))
            ) : (
              <div
                className={`text-center py-16 rounded-2xl border ${
                  isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <HelpCircle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <h4 className="text-base font-bold text-slate-500">لا توجد أسئلة في هذا الاختبار بعد</h4>
                <p className="text-xs text-slate-400 mt-1 mb-4">
                  اضغط على زر "إضافة سؤال للاختبار" لكتابة أول سؤال مع خياراته وتفسير الإجابة.
                </p>
                <button
                  onClick={() => {
                    resetQuestionForm();
                    setShowQuestionModal(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer"
                >
                  إضافة سؤال الآن
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SubTab 4: Evaluations */}
      {activeSubTab === 'evaluations' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base">التقييمات والواجبات المنزلية الأسبوعية</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                إضافة ملفات الواجبات ونماذج الإجابة وتزامنها تلقائياً مع موقع الطلاب.
              </p>
            </div>
            <button
              onClick={() => {
                resetEvalForm();
                setShowEvalModal(true);
              }}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة تقييم جديد</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {evaluations.map((ev) => (
              <div
                key={ev.id}
                className={`border rounded-2xl p-5 shadow-lg flex flex-col justify-between ${
                  isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-xs font-bold">
                      {ev.subject}
                    </span>
                    <span className="text-xs text-slate-500">{ev.week}</span>
                  </div>
                  <h4 className="font-bold text-sm mb-2">{ev.title}</h4>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-700/50 mt-4">
                  <div className="flex items-center gap-2">
                    <a
                      href={ev.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-indigo-500 hover:underline flex items-center gap-1"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>ورقة التقييم</span>
                    </a>
                    {ev.solutionUrl && (
                      <a
                        href={ev.solutionUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-emerald-500 hover:underline flex items-center gap-1 mr-2"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>نموذج الإجابة</span>
                      </a>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEditEval(ev)}
                      className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors cursor-pointer"
                      title="تعديل التقييم والواجب"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteEval(ev.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                      title="حذف التقييم"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SubTab 5: Support Messages */}
      {activeSubTab === 'support' && (
        <div className="space-y-4">
          <div>
            <h3 className="font-bold text-base">
              رسائل واستفسارات الدعم الفني من الطلاب ({supportTickets.length})
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              تظهر هنا استفسارات وطلبات الطلاب مع أرقام هواتفهم للتواصل المباشر عبر الهاتف والواتساب.
            </p>
          </div>

          {supportTickets.length > 0 ? (
            <div className="space-y-3">
              {supportTickets.map((t) => (
                <div
                  key={t.id}
                  className={`border rounded-2xl p-5 shadow-lg transition-all ${
                    t.status === 'جديدة'
                      ? isDark
                        ? 'border-cyan-500/50 bg-slate-900 ring-1 ring-cyan-500/20'
                        : 'border-cyan-400 bg-cyan-50/40 ring-1 ring-cyan-300'
                      : isDark
                      ? 'border-slate-800 bg-slate-950/50'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 border-b border-slate-700/50 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-500 flex items-center justify-center font-bold text-sm">
                        {t.name.charAt(0) || 'ط'}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm">{t.name}</h4>
                        <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                          <span className="font-mono text-cyan-600 dark:text-cyan-400 font-semibold" dir="ltr">
                            {t.phone}
                          </span>
                          <span>•</span>
                          <span className="text-[11px] px-2 py-0.5 rounded bg-slate-500/10 text-slate-500">
                            {t.category}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                          t.status === 'جديدة'
                            ? 'bg-rose-500/10 text-rose-500 border-rose-500/30'
                            : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                        }`}
                      >
                        {t.status}
                      </span>
                    </div>
                  </div>

                  {/* Message body */}
                  <p
                    className={`text-xs sm:text-sm leading-relaxed p-3.5 rounded-xl border mb-3 whitespace-pre-wrap ${
                      isDark ? 'bg-slate-950/80 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  >
                    {t.message}
                  </p>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1">
                    <span className="text-[11px] text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(t.createdAt).toLocaleString('ar-EG')}
                    </span>

                    <div className="flex items-center gap-2">
                      <a
                        href={`https://wa.me/${t.phone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md transition-colors"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>مراسلة واتساب</span>
                      </a>

                      <a
                        href={`tel:${t.phone}`}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold text-xs border transition-colors ${
                          isDark
                            ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                        }`}
                      >
                        <Phone className="w-3.5 h-3.5 text-indigo-500" />
                        <span>اتصال</span>
                      </a>

                      {onToggleTicketStatus && (
                        <button
                          onClick={() => onToggleTicketStatus(t.id)}
                          className={`px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer ${
                            isDark
                              ? 'bg-slate-800 hover:bg-slate-700 text-cyan-300 border-slate-700'
                              : 'bg-slate-100 hover:bg-slate-200 text-cyan-800 border-slate-300'
                          }`}
                        >
                          {t.status === 'جديدة' ? 'تحديد كمقروء' : 'إعادة تعيين كجديد'}
                        </button>
                      )}

                      {onDeleteTicket && (
                        <button
                          onClick={() => onDeleteTicket(t.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                          title="حذف الرسالة"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              className={`text-center py-16 rounded-2xl border ${
                isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <Headphones className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <h4 className="text-base font-bold text-slate-500">لا توجد رسائل دعم فني حالياً</h4>
              <p className="text-xs text-slate-400 mt-1">
                عندما يرسل الطلاب استفسارات من زر الدعم الفني، ستظهر هنا فوراً.
              </p>
            </div>
          )}
        </div>
      )}

      {/* SubTab 6: Announcements */}
      {activeSubTab === 'announcements' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base">إعلانات وتنبيهات الطلاب</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                نشر تنبيهات عامة ومواعيد الامتحانات لتظهر للطلاب فوراً في الصفحة الرئيسية.
              </p>
            </div>
            <button
              onClick={() => setShowAnnounceModal(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-md transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>نشر إعلان جديد</span>
            </button>
          </div>

          <div className="space-y-3">
            {announcements.map((a) => (
              <div
                key={a.id}
                className={`border rounded-2xl p-5 shadow-lg flex items-start justify-between gap-4 ${
                  isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-violet-500/10 text-violet-500 border border-violet-500/20">
                      {a.category}
                    </span>
                    <span className="text-xs text-slate-500">{a.date}</span>
                  </div>
                  <h4 className="font-bold text-sm mb-1">{a.title}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">{a.content}</p>
                </div>
                <button
                  onClick={() => handleDeleteAnnounce(a.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors shrink-0 cursor-pointer"
                  title="حذف الإعلان"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL (Books) */}
      {deleteConfirmBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div
            className={`border rounded-3xl w-full max-w-md p-6 shadow-2xl relative ${
              isDark ? 'bg-slate-900 border-rose-500/40 text-slate-100' : 'bg-white border-rose-300 text-slate-900'
            }`}
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-center">تأكيد حذف الكتاب</h3>
            <p className="text-xs text-slate-500 text-center mt-2 leading-relaxed">
              هل أنت متأكد من رغبتك في حذف كتاب:
              <br />
              <strong className="text-sm mt-1 inline-block">"{deleteConfirmBook.title}"</strong>
              <br />
              سيتم حذفه من المكتبة والموقع وقاعدة البيانات تلقائياً.
            </p>
            <div className="flex items-center gap-3 mt-6">
              <button
                type="button"
                onClick={() => setDeleteConfirmBook(null)}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl bg-slate-500/10 hover:bg-slate-500/20 text-slate-500 text-xs font-semibold cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteBook}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                <span>نعم، حذف الآن</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL (Exam) */}
      {deleteConfirmExam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div
            className={`border rounded-3xl w-full max-w-md p-6 shadow-2xl relative ${
              isDark ? 'bg-slate-900 border-rose-500/40 text-slate-100' : 'bg-white border-rose-300 text-slate-900'
            }`}
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-center">تأكيد حذف الاختبار</h3>
            <p className="text-xs text-slate-500 text-center mt-2 leading-relaxed">
              هل أنت متأكد من حذف اختبار:
              <br />
              <strong className="text-sm mt-1 inline-block">"{deleteConfirmExam.title}"</strong>
              <br />
              سيتم حذف جميع أسئلته وإزالته من موقع الطلاب تلقائياً.
            </p>
            <div className="flex items-center gap-3 mt-6">
              <button
                type="button"
                onClick={() => setDeleteConfirmExam(null)}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl bg-slate-500/10 text-slate-500 text-xs font-semibold cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteExam}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                <span>نعم، حذف الاختبار</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL (Student) */}
      {deleteConfirmStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div
            className={`border rounded-3xl w-full max-w-md p-6 shadow-2xl relative ${
              isDark ? 'bg-slate-900 border-rose-500/40 text-slate-100' : 'bg-white border-rose-300 text-slate-900'
            }`}
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-center">تأكيد حذف حساب الطالب</h3>
            <p className="text-xs text-slate-500 text-center mt-2 leading-relaxed">
              هل أنت متأكد من حذف حساب الطالب:
              <br />
              <strong className="text-sm mt-1 inline-block">"{deleteConfirmStudent.name}"</strong>
              <br />
              رقم الهاتف: ({deleteConfirmStudent.phone})
            </p>
            <div className="flex items-center gap-3 mt-6">
              <button
                type="button"
                onClick={() => setDeleteConfirmStudent(null)}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl bg-slate-500/10 text-slate-500 text-xs font-semibold cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteStudent}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                <span>نعم، حذف الحساب</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: Book Add / Edit Modal */}
      {showBookModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div
            className={`border rounded-2xl w-full max-w-lg p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto ${
              isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <h3 className="font-bold text-base">
                {editingBookId ? 'تعديل بيانات الكتاب' : 'إضافة كتاب أو مذكرة جديدة للمكتبة'}
              </h3>
              <button onClick={() => setShowBookModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBookSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1">عنوان الكتاب أو المذكرة *</label>
                <input
                  type="text"
                  required
                  value={bookTitle}
                  onChange={(e) => setBookTitle(e.target.value)}
                  placeholder="مثال: كتاب الفيزياء الحديثة - الفصل الأول"
                  className={`w-full border rounded-xl p-3 focus:border-indigo-500 ${
                    isDark ? 'bg-slate-950 border-slate-700 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">المادة / التصنيف</label>
                  <select
                    value={bookCat}
                    onChange={(e) => setBookCat(e.target.value)}
                    className={`w-full border rounded-xl p-3 focus:border-indigo-500 cursor-pointer ${
                      isDark ? 'bg-slate-950 border-slate-700 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  >
                    {CATEGORIES.filter((c) => c.id !== 'all').map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">أيقونة توضيحية</label>
                  <input
                    type="text"
                    value={bookIcon}
                    onChange={(e) => setBookIcon(e.target.value)}
                    placeholder="📚 أو 📖 أو 🏛️"
                    className={`w-full border rounded-xl p-3 focus:border-indigo-500 text-center ${
                      isDark ? 'bg-slate-950 border-slate-700 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">الصف / الشعبة</label>
                <input
                  type="text"
                  value={bookGrade}
                  onChange={(e) => setBookGrade(e.target.value)}
                  placeholder="مثال: تانية بكالوريا / علمي علوم"
                  className={`w-full border rounded-xl p-3 focus:border-indigo-500 ${
                    isDark ? 'bg-slate-950 border-slate-700 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">
                  رابط تحميل أو قراءة الكتاب (Google Drive / PDF URL) *
                </label>
                <input
                  type="url"
                  required
                  dir="ltr"
                  value={bookUrl}
                  onChange={(e) => setBookUrl(e.target.value)}
                  placeholder="https://drive.google.com/file/d/... أو رابط مباشر"
                  className={`w-full border rounded-xl p-3 focus:border-indigo-500 ${
                    isDark ? 'bg-slate-950 border-slate-700 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">وصف مختصر</label>
                <textarea
                  rows={2}
                  value={bookDesc}
                  onChange={(e) => setBookDesc(e.target.value)}
                  placeholder="نبذة عن محتوى الكتاب وأهميته للطلاب..."
                  className={`w-full border rounded-xl p-3 focus:border-indigo-500 ${
                    isDark ? 'bg-slate-950 border-slate-700 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">ملاحظات ونصائح المعلم للطلاب</label>
                <input
                  type="text"
                  value={bookNotes}
                  onChange={(e) => setBookNotes(e.target.value)}
                  placeholder="مثال: ركز على أسئلة الفصل الثاني والمسائل النموذجية"
                  className={`w-full border rounded-xl p-3 focus:border-indigo-500 ${
                    isDark ? 'bg-slate-950 border-slate-700 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowBookModal(false)}
                  disabled={isSavingBook}
                  className="px-4 py-2.5 rounded-xl bg-slate-500/10 text-slate-500 font-medium cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSavingBook}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold flex items-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/30 disabled:opacity-50"
                >
                  {isSavingBook ? <RefreshCw className="w-4 h-4 animate-spin text-white" /> : <Save className="w-4 h-4" />}
                  <span>{editingBookId ? 'حفظ التعديلات' : 'إضافة الكتاب'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Create New Exam Modal */}
      {showExamCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div
            className={`border rounded-2xl w-full max-w-md p-6 shadow-2xl relative ${
              isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <h3 className="font-bold text-base">إنشاء اختبار تفاعلي جديد</h3>
              <button onClick={() => setShowExamCreateModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewExam} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1">عنوان الاختبار *</label>
                <input
                  type="text"
                  required
                  value={newExamTitle}
                  onChange={(e) => setNewExamTitle(e.target.value)}
                  placeholder="مثال: اختبار الفيزياء - الفصل الأول (الكهربية)"
                  className={`w-full border rounded-xl p-3 focus:border-amber-500 ${
                    isDark ? 'bg-slate-950 border-slate-700 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">المادة الدراسية</label>
                  <input
                    type="text"
                    required
                    value={newExamSubject}
                    onChange={(e) => setNewExamSubject(e.target.value)}
                    placeholder="مثال: لغة عربية / فيزياء"
                    className={`w-full border rounded-xl p-3 focus:border-amber-500 ${
                      isDark ? 'bg-slate-950 border-slate-700 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">مدة الاختبار (بالدقائق)</label>
                  <input
                    type="number"
                    min={5}
                    max={180}
                    required
                    value={newExamTime}
                    onChange={(e) => setNewExamTime(Number(e.target.value))}
                    className={`w-full border rounded-xl p-3 focus:border-amber-500 text-center ${
                      isDark ? 'bg-slate-950 border-slate-700 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowExamCreateModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-500/10 text-slate-500 font-medium cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-bold flex items-center gap-2 cursor-pointer shadow-lg shadow-amber-500/25"
                >
                  <Save className="w-4 h-4" />
                  <span>تأكيد وإنشاء الاختبار</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Question Add / Edit Modal */}
      {showQuestionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div
            className={`border rounded-2xl w-full max-w-lg p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto ${
              isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <h3 className="font-bold text-base">
                {editingQuestionIdx !== null ? 'تعديل السؤال' : 'إضافة سؤال جديد للاختبار'}
              </h3>
              <button onClick={() => setShowQuestionModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">المادة</label>
                  <input
                    type="text"
                    value={examQSubject}
                    onChange={(e) => setExamQSubject(e.target.value)}
                    className={`w-full border rounded-xl p-3 ${
                      isDark ? 'bg-slate-950 border-slate-700 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">الفرع / الموضوع</label>
                  <input
                    type="text"
                    value={examQCat}
                    onChange={(e) => setExamQCat(e.target.value)}
                    placeholder="مثال: كان وأخواتها"
                    className={`w-full border rounded-xl p-3 ${
                      isDark ? 'bg-slate-950 border-slate-700 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">نص السؤال *</label>
                <textarea
                  rows={3}
                  required
                  value={examQText}
                  onChange={(e) => setExamQText(e.target.value)}
                  placeholder="اكتب السؤال بوضوح هنا..."
                  className={`w-full border rounded-xl p-3 ${
                    isDark ? 'bg-slate-950 border-slate-700 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div className="space-y-2">
                <label className="block font-semibold">الخيارات الأربعة (حدد الدائرة بجانب الإجابة الصحيحة):</label>
                {[
                  { val: examOpt0, set: setExamOpt0, idx: 0 },
                  { val: examOpt1, set: setExamOpt1, idx: 1 },
                  { val: examOpt2, set: setExamOpt2, idx: 2 },
                  { val: examOpt3, set: setExamOpt3, idx: 3 }
                ].map((item) => (
                  <div key={item.idx} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="correctOptChoice"
                      checked={examAns === item.idx}
                      onChange={() => setExamAns(item.idx)}
                      className="accent-emerald-500 w-4 h-4 cursor-pointer"
                    />
                    <input
                      type="text"
                      required={item.idx < 2}
                      value={item.val}
                      onChange={(e) => item.set(e.target.value)}
                      placeholder={`الخيار ${item.idx + 1}`}
                      className={`flex-1 border rounded-xl p-2.5 ${
                        isDark ? 'bg-slate-950 border-slate-700 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="block font-semibold mb-1">التوضيح والشرح التعليمي للحل</label>
                <input
                  type="text"
                  value={examExp}
                  onChange={(e) => setExamExp(e.target.value)}
                  placeholder="مثال: لأن الفعل ناقص ناسخ يرفع المبتدأ وينصب الخبر..."
                  className={`w-full border rounded-xl p-3 ${
                    isDark ? 'bg-slate-950 border-slate-700 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowQuestionModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-500/10 text-slate-500 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-bold flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingQuestionIdx !== null ? 'حفظ تعديل السؤال' : 'إضافة السؤال'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: Evaluation Modal */}
      {showEvalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div
            className={`border rounded-2xl w-full max-w-lg p-6 shadow-2xl relative ${
              isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-emerald-500" />
                <span>{editingEvalId ? 'تعديل بيانات التقييم والواجب الأسبوعي' : 'إضافة تقييم أو واجب أسبوعي جديد'}</span>
              </h3>
              <button onClick={() => setShowEvalModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEval} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">المادة</label>
                  <input
                    type="text"
                    required
                    value={evalSubject}
                    onChange={(e) => setEvalSubject(e.target.value)}
                    placeholder="مثال: اللغة العربية / التاريخ"
                    className={`w-full border rounded-xl p-3 ${
                      isDark ? 'bg-slate-950 border-slate-700 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">الأسبوع الدراسي</label>
                  <input
                    type="text"
                    required
                    value={evalWeek}
                    onChange={(e) => setEvalWeek(e.target.value)}
                    placeholder="مثال: الأسبوع الثالث"
                    className={`w-full border rounded-xl p-3 ${
                      isDark ? 'bg-slate-950 border-slate-700 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">عنوان التقييم</label>
                <input
                  type="text"
                  required
                  value={evalTitle}
                  onChange={(e) => setEvalTitle(e.target.value)}
                  placeholder="مثال: التقييم الأسبوعي الثاني في النحو والبلاغة"
                  className={`w-full border rounded-xl p-3 ${
                    isDark ? 'bg-slate-950 border-slate-700 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">رابط ملف التقييم (Google Drive / PDF)</label>
                <input
                  type="url"
                  required
                  dir="ltr"
                  value={evalUrl}
                  onChange={(e) => setEvalUrl(e.target.value)}
                  placeholder="https://drive.google.com/..."
                  className={`w-full border rounded-xl p-3 ${
                    isDark ? 'bg-slate-950 border-slate-700 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">رابط نموذج الإجابة (اختياري)</label>
                <input
                  type="url"
                  dir="ltr"
                  value={evalSolutionUrl}
                  onChange={(e) => setEvalSolutionUrl(e.target.value)}
                  placeholder="https://drive.google.com/..."
                  className={`w-full border rounded-xl p-3 ${
                    isDark ? 'bg-slate-950 border-slate-700 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowEvalModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-500/10 text-slate-500 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingEvalId ? 'حفظ تعديلات التقييم ✅' : 'حفظ التقييم الأسبوعي 🚀'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: Announcement Modal */}
      {showAnnounceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div
            className={`border rounded-2xl w-full max-w-lg p-6 shadow-2xl relative ${
              isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <h3 className="font-bold text-base">نشر إشعار أو تنبيه للطلاب</h3>
              <button onClick={() => setShowAnnounceModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAnnounce} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1">نوع الإعلان</label>
                <select
                  value={announceCat}
                  onChange={(e) => setAnnounceCat(e.target.value)}
                  className={`w-full border rounded-xl p-3 ${
                    isDark ? 'bg-slate-950 border-slate-700 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                >
                  <option value="تنبيه عام">تنبيه عام</option>
                  <option value="واجب مدرسي">واجب مدرسي</option>
                  <option value="موعد امتحان">موعد امتحان</option>
                  <option value="إشعار هام">إشعار هام</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">عنوان الإشعار</label>
                <input
                  type="text"
                  required
                  value={announceTitle}
                  onChange={(e) => setAnnounceTitle(e.target.value)}
                  placeholder="مثال: تنبيه هام بخصوص موعد تسليم تقييم الأسبوع الثالث"
                  className={`w-full border rounded-xl p-3 ${
                    isDark ? 'bg-slate-950 border-slate-700 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">نص وتفاصيل الإشعار</label>
                <textarea
                  rows={3}
                  required
                  value={announceContent}
                  onChange={(e) => setAnnounceContent(e.target.value)}
                  placeholder="اكتب التنبيه هنا..."
                  className={`w-full border rounded-xl p-3 ${
                    isDark ? 'bg-slate-950 border-slate-700 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowAnnounceModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-500/10 text-slate-500 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>نشر الإعلان</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL (Videos) */}
      {deleteConfirmVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div
            className={`border rounded-3xl w-full max-w-md p-6 shadow-2xl relative ${
              isDark ? 'bg-slate-900 border-rose-500/40 text-slate-100' : 'bg-white border-rose-300 text-slate-900'
            }`}
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-center">تأكيد حذف الفيديو</h3>
            <p className="text-xs text-slate-500 text-center mt-2 leading-relaxed">
              هل أنت متأكد من رغبتك في حذف فيديو:
              <br />
              <strong className="text-sm mt-1 inline-block">"{deleteConfirmVideo.title}"</strong>
              <br />
              سيتم حذفه من المنصة وقاعدة البيانات تلقائياً.
            </p>
            <div className="flex items-center gap-3 mt-6">
              <button
                type="button"
                onClick={() => setDeleteConfirmVideo(null)}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl bg-slate-500/10 hover:bg-slate-500/20 text-slate-500 text-xs font-semibold cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteVideo}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                <span>نعم، حذف الآن</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Video Creation / Edit Modal */}
      {showVideoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div
            className={`border rounded-3xl w-full max-w-2xl p-6 sm:p-8 shadow-2xl relative my-8 max-h-[90vh] overflow-y-auto ${
              isDark ? 'bg-slate-900 border-purple-500/40 text-slate-100' : 'bg-white border-purple-300 text-slate-900'
            }`}
          >
            <div className="flex items-center justify-between border-b pb-4 mb-5">
              <div className="flex items-center gap-2">
                <span className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                  <Video className="w-5 h-5" />
                </span>
                <h3 className="font-bold text-base sm:text-lg">
                  {editingVideoId ? 'تعديل بيانات المحاضرة والشرح' : 'إضافة فيديو ومحاضرة تعليمية جديدة'}
                </h3>
              </div>
              <button
                onClick={() => setShowVideoModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveVideoSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1">عنوان المحاضرة / الفيديو *</label>
                <input
                  type="text"
                  required
                  value={videoTitle}
                  onChange={(e) => setVideoTitle(e.target.value)}
                  placeholder="مثال: شرح الدرس الأول تاريخ - بناء الدولة الحديثة"
                  className={`w-full border rounded-xl p-3 ${
                    isDark ? 'bg-slate-950 border-slate-700 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold mb-1">المادة والتصنيف</label>
                  <select
                    value={videoCat}
                    onChange={(e) => setVideoCat(e.target.value)}
                    className={`w-full border rounded-xl p-3 ${
                      isDark ? 'bg-slate-950 border-slate-700 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  >
                    <option value="رياضيات">رياضيات</option>
                    <option value="لغة عربية">لغة عربية</option>
                    <option value="تاريخ">تاريخ</option>
                    <option value="فيزياء">فيزياء</option>
                    <option value="كيمياء">كيمياء</option>
                    <option value="أحياء">أحياء</option>
                    <option value="برمجة">برمجة</option>
                    <option value="إنجليزي">إنجليزي</option>
                    <option value="مواد شرعية">مواد شرعية</option>
                    <option value="عام">عام وثقافة</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">الصف الدراسي</label>
                  <select
                    value={videoGrade}
                    onChange={(e) => setVideoGrade(e.target.value)}
                    className={`w-full border rounded-xl p-3 ${
                      isDark ? 'bg-slate-950 border-slate-700 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  >
                    <option value="الصف الثاني / الثالث الثانوي">الصف الثاني / الثالث الثانوي</option>
                    <option value="تانية بكالوريا والثانوية">تانية بكالوريا والثانوية</option>
                    <option value="الصف الثالث الثانوي علمي">الصف الثالث الثانوي علمي</option>
                    <option value="الصف الثالث الثانوي أدبي">الصف الثالث الثانوي أدبي</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">مدة الفيديو التقريبية</label>
                  <input
                    type="text"
                    value={videoDuration}
                    onChange={(e) => setVideoDuration(e.target.value)}
                    placeholder="مثال: 45 دقيقة"
                    className={`w-full border rounded-xl p-3 ${
                      isDark ? 'bg-slate-950 border-slate-700 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">
                  رابط الفيديو (YouTube، Google Drive، أو رابط مباشر MP4) *
                </label>
                <input
                  type="url"
                  required
                  dir="ltr"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=... أو https://drive.google.com/file/d/..."
                  className={`w-full border rounded-xl p-3 ${
                    isDark ? 'bg-slate-950 border-slate-700 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">وصف المحاضرة والموضوعات</label>
                <textarea
                  rows={2}
                  value={videoDesc}
                  onChange={(e) => setVideoDesc(e.target.value)}
                  placeholder="اكتب نبذة عن المحاضرة والنقاط الأساسية المشروحة..."
                  className={`w-full border rounded-xl p-3 ${
                    isDark ? 'bg-slate-950 border-slate-700 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">توجيهات وملاحظات المعلم للطلاب</label>
                <textarea
                  rows={2}
                  value={videoNotes}
                  onChange={(e) => setVideoNotes(e.target.value)}
                  placeholder="مثال: يرجى حل التمارين المرفقة بعد المشاهدة مباشرة..."
                  className={`w-full border rounded-xl p-3 ${
                    isDark ? 'bg-slate-950 border-slate-700 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              {/* Attachments Section */}
              <div className="pt-3 border-t space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-bold flex items-center gap-1.5 text-sm">
                      <Paperclip className="w-4 h-4 text-cyan-400" />
                      <span>الملفات وأوراق العمل المرفقة مع الفيديو (PDF / مذكرات)</span>
                    </label>
                    <p className="text-[11px] text-slate-400">
                      يمكنك ربط ملفات PDF وأوراق عمل ليتمكن الطالب من تحميلها أثناء مشاهدة الفيديو.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddAttachment}
                    className="px-3 py-1.5 rounded-xl bg-cyan-600/20 text-cyan-400 hover:bg-cyan-600/30 border border-cyan-500/30 text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>إضافة ملف مرفق</span>
                  </button>
                </div>

                {videoAttachments.length > 0 && (
                  <div className="space-y-2">
                    {videoAttachments.map((att, idx) => (
                      <div
                        key={att.id}
                        className={`p-3 rounded-xl border flex flex-col sm:flex-row items-center gap-2 ${
                          isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <input
                          type="text"
                          required
                          value={att.title}
                          onChange={(e) => handleUpdateAttachment(att.id, 'title', e.target.value)}
                          placeholder="عنوان الملف (مثال: ورقة عمل الدرس الأول PDF)"
                          className={`flex-1 w-full border rounded-lg p-2 text-xs ${
                            isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-300'
                          }`}
                        />
                        <input
                          type="url"
                          required
                          dir="ltr"
                          value={att.url}
                          onChange={(e) => handleUpdateAttachment(att.id, 'url', e.target.value)}
                          placeholder="رابط الملف (Google Drive أو مباشر)"
                          className={`flex-1 w-full border rounded-lg p-2 text-xs ${
                            isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-300'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveAttachment(att.id)}
                          className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg cursor-pointer shrink-0"
                          title="حذف الملف المرفق"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowVideoModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-500/10 text-slate-500 hover:bg-slate-500/20 text-xs font-semibold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSavingVideo}
                  className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 active:bg-purple-700 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-purple-600/25 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSavingVideo ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>{editingVideoId ? 'حفظ التعديلات' : 'إضافة المحاضرة الآن'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

