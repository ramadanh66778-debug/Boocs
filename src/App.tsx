import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { BookCard } from './components/BookCard';
import { BookReaderModal } from './components/BookReaderModal';
import { TeacherDashboard } from './components/TeacherDashboard';
import { EvaluationsView } from './components/EvaluationsView';
import { ExamRunner } from './components/ExamRunner';
import { QuranSection } from './components/QuranSection';
import { VideoSection } from './components/VideoSection';
import { AuthModal } from './components/AuthModal';
import { AuthGateway } from './components/AuthGateway';
import { SupportModal, SupportTicket } from './components/SupportModal';
import { StudentProfileView } from './components/StudentProfileView';
import {
  BookItem,
  EvaluationItem,
  ExamItem,
  AnnouncementItem,
  StudentUser,
  VideoItem,
  StudentNote,
  CATEGORIES,
  DEFAULT_BOOKS,
  DEFAULT_EVALUATIONS,
  DEFAULT_EXAM,
  DEFAULT_ANNOUNCEMENTS,
  DEFAULT_VIDEOS
} from './data/initialData';
import { db, testConnection } from './firebase';
import { checkGoogleRedirectResult } from './utils/googleAuth';
import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  deleteDoc,
  updateDoc
} from 'firebase/firestore';
import {
  Search,
  BookOpen,
  Sparkles,
  Filter,
  Heart,
  Bell,
  Headphones,
  Video,
  ShieldCheck
} from 'lucide-react';

// Helper to normalize phone / email keys to prevent duplicate keys in lists
function normalizeStudentId(raw?: string): string {
  if (!raw) return '';
  return raw.trim().toLowerCase().replace(/[^a-zA-Z0-9]/g, '');
}

function deduplicateStudentList(rawList: any[]): StudentUser[] {
  const map = new Map<string, StudentUser>();
  rawList.forEach((u) => {
    if (!u) return;
    const phone = (u.phone || u.id || '').trim();
    if (!phone) return;
    const key = normalizeStudentId(phone);
    if (!key) return;

    const existing = map.get(key);
    const item: StudentUser = {
      phone,
      name: u.name || existing?.name || 'طالب',
      grade: u.grade || existing?.grade || 'تانية بكالوريا والثانوية',
      status: u.status || existing?.status || 'approved',
      createdAt: u.createdAt || existing?.createdAt || new Date().toISOString(),
      watchedVideos: Array.isArray(u.watchedVideos)
        ? u.watchedVideos
        : existing?.watchedVideos || [],
      completedExams: Array.isArray(u.completedExams)
        ? u.completedExams
        : existing?.completedExams || []
    };

    if (!existing || u.status === 'approved' || (u.status && !existing.status)) {
      map.set(key, item);
    }
  });

  return Array.from(map.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export default function App() {
  // Day / Night Theme State
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      const saved = localStorage.getItem('bac_theme');
      return saved === 'light' ? 'light' : 'dark';
    } catch {
      return 'dark';
    }
  });

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    try {
      localStorage.setItem('bac_theme', nextTheme);
    } catch {}
  };

  const isDark = theme === 'dark';

  const [currentTab, setCurrentTab] = useState<
    'books' | 'videos' | 'evaluations' | 'exams' | 'quran' | 'favorites' | 'teacher' | 'profile'
  >('books');

  // Books State
  const [books, setBooks] = useState<BookItem[]>(() => {
    try {
      const saved = localStorage.getItem('bac_books_cache');
      return saved ? JSON.parse(saved) : DEFAULT_BOOKS;
    } catch {
      return DEFAULT_BOOKS;
    }
  });

  // Videos State
  const [videos, setVideos] = useState<VideoItem[]>(() => {
    try {
      const saved = localStorage.getItem('bac_videos_cache');
      return saved ? JSON.parse(saved) : DEFAULT_VIDEOS;
    } catch {
      return DEFAULT_VIDEOS;
    }
  });

  // Student Notes State (Saved in Firestore & local)
  const [studentNotes, setStudentNotes] = useState<StudentNote[]>(() => {
    try {
      const saved = localStorage.getItem('bac_student_notes');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [evaluations, setEvaluations] = useState<EvaluationItem[]>(DEFAULT_EVALUATIONS);
  const [exams, setExams] = useState<ExamItem[]>([DEFAULT_EXAM]);
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>(DEFAULT_ANNOUNCEMENTS);

  // Support Tickets State
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>(() => {
    try {
      const saved = localStorage.getItem('bac_support_tickets');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Registered Students State (Always Deduplicated)
  const [students, setStudents] = useState<StudentUser[]>(() => {
    try {
      const localUsersStr = localStorage.getItem('bac_registered_students');
      if (localUsersStr) {
        return deduplicateStudentList(Object.values(JSON.parse(localUsersStr)));
      }
      return [];
    } catch {
      return [];
    }
  });

  // Student Phone/Password Auth state (with security status)
  const [studentUser, setStudentUser] = useState<StudentUser | null>(() => {
    try {
      const saved = localStorage.getItem('student_session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Teacher Authentication State (STRICTLY for ramadanh66778@gmail.com)
  const [isTeacherAuthenticated, setIsTeacherAuthenticated] = useState<boolean>(() => {
    try {
      const authFlag = localStorage.getItem('teacher_session_auth') === 'true';
      const profileStr = localStorage.getItem('teacher_profile');
      if (authFlag && profileStr) {
        const parsed = JSON.parse(profileStr);
        return (parsed.email || '').toLowerCase().trim() === 'ramadanh66778@gmail.com';
      }
      return false;
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
      if (saved) {
        const parsed = JSON.parse(saved);
        if ((parsed.email || '').toLowerCase().trim() === 'ramadanh66778@gmail.com') {
          return parsed;
        }
      }
      return null;
    } catch {
      return null;
    }
  });

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [showSupportModal, setShowSupportModal] = useState(false);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Favorites
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('bac_favorites');
      return saved ? JSON.parse(saved) : ['book-1', 'book-2'];
    } catch {
      return ['book-1', 'book-2'];
    }
  });

  // Reading modal
  const [activeReadingBook, setActiveReadingBook] = useState<BookItem | null>(null);

  // Test connection & check Google redirect login on mount
  useEffect(() => {
    testConnection();
    checkGoogleRedirectResult().then((result) => {
      if (result && result.success) {
        if (result.isTeacher && result.teacherProfile) {
          handleTeacherSuccess(result.teacherProfile);
        } else if (result.studentData) {
          setStudentUser(result.studentData);
          try {
            localStorage.setItem('student_session', JSON.stringify(result.studentData));
          } catch {}
        }
      }
    });
  }, []);

  // 1. Listen & Auto-Sync Books in Firestore
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'books'),
      async (snapshot) => {
        if (!snapshot.empty) {
          const fetchedBooks: BookItem[] = [];
          snapshot.forEach((docSnap) => {
            fetchedBooks.push(docSnap.data() as BookItem);
          });
          if (fetchedBooks.length > 0) {
            setBooks(fetchedBooks);
            try {
              localStorage.setItem('bac_books_cache', JSON.stringify(fetchedBooks));
            } catch {}
          }
        } else {
          try {
            for (const b of DEFAULT_BOOKS) {
              await setDoc(doc(db, 'books', b.id), {
                ...b,
                createdBy: 'auto-sync',
                createdAt: new Date().toISOString()
              });
            }
          } catch (e) {
            console.warn('Auto-seed books warning:', e);
          }
        }
      },
      (error) => {
        console.warn('Firestore books fallback to default:', error.message);
      }
    );
    return () => unsub();
  }, []);

  // 2. Listen & Auto-Sync Videos in Firestore (34 Real Legacy Lectures)
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'videos'),
      async (snapshot) => {
        if (!snapshot.empty) {
          const fetchedVideos: VideoItem[] = [];
          snapshot.forEach((docSnap) => {
            fetchedVideos.push(docSnap.data() as VideoItem);
          });

          // If Firestore only had the old placeholder videos (< 30), merge in all DEFAULT_VIDEOS
          if (fetchedVideos.length < DEFAULT_VIDEOS.length) {
            for (const v of DEFAULT_VIDEOS) {
              if (!fetchedVideos.some((fv) => fv.id === v.id || fv.videoUrl === v.videoUrl)) {
                try {
                  await setDoc(doc(db, 'videos', v.id), {
                    ...v,
                    createdBy: 'auto-sync',
                    createdAt: new Date().toISOString()
                  });
                  fetchedVideos.push(v);
                } catch (e) {
                  console.warn('Syncing video warning:', e);
                }
              }
            }
          }

          if (fetchedVideos.length > 0) {
            setVideos(fetchedVideos);
            try {
              localStorage.setItem('bac_videos_cache', JSON.stringify(fetchedVideos));
            } catch {}
          }
        } else {
          try {
            for (const v of DEFAULT_VIDEOS) {
              await setDoc(doc(db, 'videos', v.id), {
                ...v,
                createdBy: 'auto-sync',
                createdAt: new Date().toISOString()
              });
            }
            setVideos(DEFAULT_VIDEOS);
            localStorage.setItem('bac_videos_cache', JSON.stringify(DEFAULT_VIDEOS));
          } catch (e) {
            console.warn('Auto-seed videos warning:', e);
          }
        }
      },
      (error) => {
        console.warn('Firestore videos fallback:', error.message);
        setVideos(DEFAULT_VIDEOS);
      }
    );
    return () => unsub();
  }, []);

  // 3. Listen & Auto-Sync Student Notes in Firestore
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'student_notes'),
      (snapshot) => {
        if (!snapshot.empty) {
          const fetchedNotes: StudentNote[] = [];
          snapshot.forEach((docSnap) => {
            fetchedNotes.push(docSnap.data() as StudentNote);
          });
          setStudentNotes(fetchedNotes);
          try {
            localStorage.setItem('bac_student_notes', JSON.stringify(fetchedNotes));
          } catch {}
        }
      },
      (error) => {
        console.warn('Firestore student_notes fallback:', error.message);
      }
    );
    return () => unsub();
  }, []);

  // 4. Listen & Auto-Sync Evaluations
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'evaluations'),
      async (snapshot) => {
        if (!snapshot.empty) {
          const fetchedEvals: EvaluationItem[] = [];
          snapshot.forEach((docSnap) => {
            fetchedEvals.push(docSnap.data() as EvaluationItem);
          });
          if (fetchedEvals.length > 0) {
            setEvaluations(fetchedEvals);
          }
        } else {
          try {
            for (const ev of DEFAULT_EVALUATIONS) {
              await setDoc(doc(db, 'evaluations', ev.id), {
                ...ev,
                createdBy: 'auto-sync',
                createdAt: new Date().toISOString()
              });
            }
          } catch (e) {
            console.warn('Auto-seed evaluations warning:', e);
          }
        }
      },
      (error) => {
        console.warn('Firestore evaluations fallback:', error.message);
      }
    );
    return () => unsub();
  }, []);

  // 5. Listen & Auto-Sync Exams
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'exams'),
      async (snapshot) => {
        if (!snapshot.empty) {
          const fetchedExams: ExamItem[] = [];
          snapshot.forEach((docSnap) => {
            const d = docSnap.data();
            let parsedQuestions = DEFAULT_EXAM.questions;
            if (typeof d.questions === 'string') {
              try {
                parsedQuestions = JSON.parse(d.questions);
              } catch {}
            } else if (Array.isArray(d.questions)) {
              parsedQuestions = d.questions;
            }
            fetchedExams.push({
              id: d.id || docSnap.id,
              title: d.title,
              subject: d.subject,
              timeLimit: d.timeLimit || 15,
              questions: parsedQuestions
            });
          });
          if (fetchedExams.length > 0) {
            setExams(fetchedExams);
          }
        } else {
          try {
            await setDoc(doc(db, 'exams', DEFAULT_EXAM.id), {
              id: DEFAULT_EXAM.id,
              title: DEFAULT_EXAM.title,
              subject: DEFAULT_EXAM.subject,
              timeLimit: DEFAULT_EXAM.timeLimit,
              questions: JSON.stringify(DEFAULT_EXAM.questions),
              createdBy: 'auto-sync',
              createdAt: new Date().toISOString()
            });
          } catch (e) {
            console.warn('Auto-seed exam warning:', e);
          }
        }
      },
      (error) => {
        console.warn('Firestore exams fallback:', error.message);
      }
    );
    return () => unsub();
  }, []);

  // 6. Listen & Auto-Sync Announcements
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'announcements'),
      async (snapshot) => {
        if (!snapshot.empty) {
          const fetchedAnn: AnnouncementItem[] = [];
          snapshot.forEach((docSnap) => {
            fetchedAnn.push(docSnap.data() as AnnouncementItem);
          });
          if (fetchedAnn.length > 0) {
            setAnnouncements(fetchedAnn);
          }
        } else {
          try {
            for (const a of DEFAULT_ANNOUNCEMENTS) {
              await setDoc(doc(db, 'announcements', a.id), {
                ...a,
                createdBy: 'auto-sync',
                createdAt: new Date().toISOString()
              });
            }
          } catch (e) {
            console.warn('Auto-seed announcements warning:', e);
          }
        }
      },
      (error) => {
        console.warn('Firestore announcements fallback:', error.message);
      }
    );
    return () => unsub();
  }, []);

  // 7. Listen to Registered Students (users collection) in Real-Time
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'users'),
      (snapshot) => {
        const rawList: any[] = [];
        snapshot.forEach((docSnap) => {
          const d = docSnap.data();
          rawList.push({
            phone: d.phone || docSnap.id,
            name: d.name,
            grade: d.grade,
            status: d.status,
            createdAt: d.createdAt,
            watchedVideos: d.watchedVideos,
            completedExams: d.completedExams
          });
        });

        // Merge with local registrations
        try {
          const localUsersStr = localStorage.getItem('bac_registered_students');
          if (localUsersStr) {
            const localObj = JSON.parse(localUsersStr);
            Object.values(localObj).forEach((u: any) => {
              if (u && u.phone) {
                rawList.push(u);
              }
            });
          }
        } catch {}

        const cleanList = deduplicateStudentList(rawList);
        setStudents(cleanList);
      },
      (error) => {
        console.warn('Firestore users fallback:', error.message);
      }
    );
    return () => unsub();
  }, []);

  // 8. Listen to Support Tickets in Real-Time
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'support_tickets'),
      (snapshot) => {
        if (!snapshot.empty) {
          const fetchedTickets: SupportTicket[] = [];
          snapshot.forEach((docSnap) => {
            fetchedTickets.push(docSnap.data() as SupportTicket);
          });
          fetchedTickets.sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          setSupportTickets(fetchedTickets);
          try {
            localStorage.setItem('bac_support_tickets', JSON.stringify(fetchedTickets));
          } catch {}
        }
      },
      (error) => {
        console.warn('Firestore support_tickets fallback:', error.message);
      }
    );
    return () => unsub();
  }, []);

  // Book Delete Handler
  const handleDeleteBook = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'books', id));
    } catch (err) {
      console.warn('Firestore book delete warning:', err);
    }
    setBooks((prev) => {
      const updated = prev.filter((b) => b.id !== id);
      try {
        localStorage.setItem('bac_books_cache', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Book Save / Edit Handler
  const handleSaveBook = async (book: BookItem) => {
    try {
      await setDoc(doc(db, 'books', book.id), book);
    } catch (err) {
      console.warn('Firestore book save warning:', err);
    }
    setBooks((prev) => {
      const exists = prev.some((b) => b.id === book.id);
      const updated = exists
        ? prev.map((b) => (b.id === book.id ? book : b))
        : [book, ...prev];
      try {
        localStorage.setItem('bac_books_cache', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Video Save / Edit Handler
  const handleSaveVideo = async (video: VideoItem) => {
    try {
      await setDoc(doc(db, 'videos', video.id), video);
    } catch (err) {
      console.warn('Firestore video save warning:', err);
    }
    setVideos((prev) => {
      const exists = prev.some((v) => v.id === video.id);
      const updated = exists ? prev.map((v) => (v.id === video.id ? video : v)) : [video, ...prev];
      try {
        localStorage.setItem('bac_videos_cache', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Video Delete Handler
  const handleDeleteVideo = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'videos', id));
    } catch (err) {
      console.warn('Firestore video delete warning:', err);
    }
    setVideos((prev) => {
      const updated = prev.filter((v) => v.id !== id);
      try {
        localStorage.setItem('bac_videos_cache', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Student Note Save Handler (Directly to Firestore and state!)
  const handleSaveNote = async (note: StudentNote) => {
    try {
      await setDoc(doc(db, 'student_notes', note.id), note);
    } catch (err) {
      console.warn('Firestore note save warning:', err);
    }
    setStudentNotes((prev) => {
      const exists = prev.some((n) => n.id === note.id);
      const updated = exists ? prev.map((n) => (n.id === note.id ? note : n)) : [note, ...prev];
      try {
        localStorage.setItem('bac_student_notes', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Student Note Delete Handler
  const handleDeleteNote = async (noteId: string) => {
    try {
      await deleteDoc(doc(db, 'student_notes', noteId));
    } catch (err) {
      console.warn('Firestore note delete warning:', err);
    }
    setStudentNotes((prev) => {
      const updated = prev.filter((n) => n.id !== noteId);
      try {
        localStorage.setItem('bac_student_notes', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Exam Save / Update Handler
  const handleSaveExam = async (exam: ExamItem) => {
    try {
      await setDoc(doc(db, 'exams', exam.id), {
        id: exam.id,
        title: exam.title,
        subject: exam.subject,
        timeLimit: exam.timeLimit,
        questions: JSON.stringify(exam.questions),
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      console.warn('Firestore exam save warning:', err);
    }
    setExams((prev) => {
      const exists = prev.some((e) => e.id === exam.id);
      return exists ? prev.map((e) => (e.id === exam.id ? exam : e)) : [...prev, exam];
    });
  };

  // Exam Delete Handler
  const handleDeleteExam = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'exams', id));
    } catch (err) {
      console.warn('Firestore exam delete warning:', err);
    }
    setExams((prev) => prev.filter((e) => e.id !== id));
  };

  // Student Approval Handler (Admin approves student)
  const handleApproveStudent = async (phone: string) => {
    const safeDocId = phone.replace(/[^a-zA-Z0-9_]/g, '_');

    // 1. Instant local state update
    setStudents((prev) =>
      prev.map((s) => (s.phone === phone || s.phone === safeDocId ? { ...s, status: 'approved' } : s))
    );

    // 2. Instant localStorage cache update
    try {
      const localUsersStr = localStorage.getItem('bac_registered_students');
      if (localUsersStr) {
        const localObj = JSON.parse(localUsersStr);
        if (localObj[phone]) localObj[phone].status = 'approved';
        if (localObj[safeDocId]) localObj[safeDocId].status = 'approved';
        localStorage.setItem('bac_registered_students', JSON.stringify(localObj));
      }
    } catch {}

    if (studentUser && (studentUser.phone === phone || studentUser.phone === safeDocId)) {
      const updated: StudentUser = { ...studentUser, status: 'approved' };
      setStudentUser(updated);
      try {
        localStorage.setItem('student_session', JSON.stringify(updated));
      } catch {}
    }

    // 3. Sync to Firestore without blocking UI
    try {
      const approvalData = {
        status: 'approved',
        reviewedAt: new Date().toISOString(),
        reviewedBy: 'محمد رمضان الحرباوي'
      };
      await Promise.allSettled([
        setDoc(doc(db, 'users', phone), approvalData, { merge: true }),
        setDoc(doc(db, 'users', safeDocId), approvalData, { merge: true })
      ]);
    } catch (err) {
      console.warn('Firestore student approve warning:', err);
    }
  };

  // Student Reject Handler (Admin rejects student)
  const handleRejectStudent = async (phone: string) => {
    const safeDocId = phone.replace(/[^a-zA-Z0-9_]/g, '_');

    // 1. Instant local state update
    setStudents((prev) =>
      prev.map((s) => (s.phone === phone || s.phone === safeDocId ? { ...s, status: 'rejected' } : s))
    );

    // 2. Instant localStorage cache update
    try {
      const localUsersStr = localStorage.getItem('bac_registered_students');
      if (localUsersStr) {
        const localObj = JSON.parse(localUsersStr);
        if (localObj[phone]) localObj[phone].status = 'rejected';
        if (localObj[safeDocId]) localObj[safeDocId].status = 'rejected';
        localStorage.setItem('bac_registered_students', JSON.stringify(localObj));
      }
    } catch {}

    if (studentUser && (studentUser.phone === phone || studentUser.phone === safeDocId)) {
      const updated: StudentUser = { ...studentUser, status: 'rejected' };
      setStudentUser(updated);
      try {
        localStorage.setItem('student_session', JSON.stringify(updated));
      } catch {}
    }

    // 3. Sync to Firestore without blocking UI
    try {
      const rejectData = {
        status: 'rejected',
        reviewedAt: new Date().toISOString(),
        reviewedBy: 'محمد رمضان الحرباوي'
      };
      await Promise.allSettled([
        setDoc(doc(db, 'users', phone), rejectData, { merge: true }),
        setDoc(doc(db, 'users', safeDocId), rejectData, { merge: true })
      ]);
    } catch (err) {
      console.warn('Firestore student reject warning:', err);
    }
  };

  // Student Delete Handler
  const handleDeleteStudent = async (phone: string) => {
    try {
      await deleteDoc(doc(db, 'users', phone));
    } catch (err) {
      console.warn('Firestore student delete warning:', err);
    }
    try {
      const localUsersStr = localStorage.getItem('bac_registered_students');
      if (localUsersStr) {
        const localObj = JSON.parse(localUsersStr);
        delete localObj[phone];
        localStorage.setItem('bac_registered_students', JSON.stringify(localObj));
      }
    } catch {}
    setStudents((prev) => prev.filter((s) => s.phone !== phone));
  };

  // Support Ticket Handlers
  const handleDeleteTicket = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'support_tickets', id));
    } catch (err) {
      console.warn('Firestore ticket delete warning:', err);
    }
    setSupportTickets((prev) => {
      const updated = prev.filter((t) => t.id !== id);
      try {
        localStorage.setItem('bac_support_tickets', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleToggleTicketStatus = async (id: string) => {
    const target = supportTickets.find((t) => t.id === id);
    if (!target) return;
    const newStatus = target.status === 'جديدة' ? 'تمت المراجعة' : 'جديدة';

    try {
      await updateDoc(doc(db, 'support_tickets', id), {
        status: newStatus
      });
    } catch (err) {
      console.warn('Firestore ticket update warning:', err);
    }

    setSupportTickets((prev) => {
      const updated = prev.map((t) => (t.id === id ? { ...t, status: newStatus as any } : t));
      try {
        localStorage.setItem('bac_support_tickets', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleTicketSubmitted = (newTicket: SupportTicket) => {
    setSupportTickets((prev) => [newTicket, ...prev.filter((t) => t.id !== newTicket.id)]);
  };

  const handleToggleFavorite = (bookId: string) => {
    setFavorites((prev) => {
      const updated = prev.includes(bookId)
        ? prev.filter((id) => id !== bookId)
        : [...prev, bookId];
      try {
        localStorage.setItem('bac_favorites', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Watched Video Toggle Handler (Synced with Student Profile & Firestore)
  const handleToggleWatchedVideo = async (videoId: string) => {
    if (!studentUser) return;
    const currentWatched = studentUser.watchedVideos || [];
    const isWatched = currentWatched.includes(videoId);
    const updatedWatched = isWatched
      ? currentWatched.filter((id) => id !== videoId)
      : [...currentWatched, videoId];

    const updatedUser: StudentUser = {
      ...studentUser,
      watchedVideos: updatedWatched
    };

    // 1. Instant local React state update
    setStudentUser(updatedUser);

    // 2. Update students directory state
    setStudents((prev) =>
      prev.map((s) =>
        s.phone === studentUser.phone ? { ...s, watchedVideos: updatedWatched } : s
      )
    );

    // 3. Update localStorage cache immediately
    try {
      localStorage.setItem('student_session', JSON.stringify(updatedUser));
      const localUsersStr = localStorage.getItem('bac_registered_students');
      if (localUsersStr) {
        const localObj = JSON.parse(localUsersStr);
        if (localObj[studentUser.phone]) {
          localObj[studentUser.phone].watchedVideos = updatedWatched;
        }
        const safeDocId = studentUser.phone.replace(/[^a-zA-Z0-9_]/g, '_');
        if (localObj[safeDocId]) {
          localObj[safeDocId].watchedVideos = updatedWatched;
        }
        localStorage.setItem('bac_registered_students', JSON.stringify(localObj));
      }
    } catch {}

    // 4. Background sync to Firestore without blocking UI
    try {
      const safeDocId = studentUser.phone.replace(/[^a-zA-Z0-9_]/g, '_');
      await Promise.allSettled([
        setDoc(doc(db, 'users', studentUser.phone), { watchedVideos: updatedWatched }, { merge: true }),
        setDoc(doc(db, 'users', safeDocId), { watchedVideos: updatedWatched }, { merge: true })
      ]);
    } catch (err) {
      console.warn('Firestore toggle watched warning:', err);
    }
  };

  const handleStudentLogout = () => {
    localStorage.removeItem('student_session');
    setStudentUser(null);
    setCurrentTab('books');
  };

  // Teacher Success & Logout
  const handleTeacherSuccess = (profile: { name: string; email: string; photoURL?: string }) => {
    setTeacherProfile(profile);
    setIsTeacherAuthenticated(true);
    setCurrentTab('teacher');
  };

  const handleTeacherLogout = () => {
    try {
      localStorage.removeItem('teacher_session_auth');
      localStorage.removeItem('teacher_profile');
    } catch {}
    setIsTeacherAuthenticated(false);
    setTeacherProfile(null);
    if (currentTab === 'teacher') {
      setCurrentTab('books');
    }
  };

  // Filter books
  const filteredBooks = books.filter((b) => {
    const matchesCategory = selectedCategory === 'all' || b.category === selectedCategory;
    const matchesSearch =
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const favoriteBooks = books.filter((b) => favorites.includes(b.id));

  // Access Control Gatekeeper: Only approved students or authenticated teacher can view library
  const isAuthorizedAccess =
    isTeacherAuthenticated || (studentUser && studentUser.status === 'approved');

  if (!isAuthorizedAccess) {
    return (
      <div className={theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}>
        <AuthGateway
          currentStudentUser={studentUser}
          onStudentApproved={(userData) => {
            setStudentUser(userData);
            setCurrentTab('profile'); // Direct user to profile to see all their account details!
            try {
              localStorage.setItem('student_session', JSON.stringify(userData));
            } catch {}
          }}
          onTeacherLogin={(profile) => {
            handleTeacherSuccess(profile);
          }}
          onLogout={handleStudentLogout}
          onOpenSupport={() => setShowSupportModal(true)}
          theme={theme}
        />

        {/* Technical Support Modal with Live Chat */}
        <SupportModal
          isOpen={showSupportModal}
          onClose={() => setShowSupportModal(false)}
          studentUser={studentUser}
          onTicketSubmitted={handleTicketSubmitted}
        />
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen flex flex-col font-sans selection:bg-indigo-500 selection:text-white transition-colors duration-200 relative ${
        isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}
      dir="rtl"
    >
      {/* Top Banner: برعاية وتطوير محمد رمضان الحرباوي */}
      <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-indigo-900 text-white py-3 px-4 text-center flex items-center justify-center gap-2 sm:gap-3 shadow-xl border-b border-amber-400/40 relative z-50">
        <Sparkles className="w-4 h-4 text-amber-300 animate-pulse shrink-0" />
        <span className="font-black text-sm sm:text-base tracking-wide text-amber-100">
          👑 برعاية وتطوير: محمد رمضان الحرباوي 👑
        </span>
        <span className="hidden md:inline text-amber-300/80">•</span>
        <span className="hidden md:inline text-xs sm:text-sm text-indigo-100 font-bold">
          المكتبة التعليمية الشاملة • تانية بكالوريا والثانوية العامة
        </span>
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
      </div>

      {/* Header Navigation with Day / Night Theme Toggle */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        studentUser={studentUser}
        onLoginClick={() => {
          setAuthModalMode('login');
          setShowAuthModal(true);
        }}
        onLogoutClick={handleStudentLogout}
        onSupportClick={() => setShowSupportModal(true)}
        favoritesCount={favorites.length}
        theme={theme}
        onToggleTheme={toggleTheme}
        isTeacherAuthenticated={isTeacherAuthenticated}
        teacherProfile={teacherProfile}
        onTeacherLogout={handleTeacherLogout}
      />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* VIEW 1: Books & Library */}
        {currentTab === 'books' && (
          <div className="space-y-8">
            {/* Hero Banner */}
            <div
              className={`relative overflow-hidden rounded-3xl border p-6 sm:p-10 shadow-2xl transition-colors ${
                isDark
                  ? 'bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-900 border-indigo-500/30 text-white'
                  : 'bg-gradient-to-br from-indigo-50 via-white to-blue-50 border-indigo-200 text-slate-900 shadow-sm'
              }`}
            >
              <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 max-w-3xl">
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-500 text-xs font-semibold">
                    <Sparkles className="w-3.5 h-3.5" />
                    المكتبة التعليمية الرسمية • تانية بكالوريا والثانوية العامة
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 text-xs font-extrabold shadow-sm">
                    <span>👑 برعاية وتطوير: محمد رمضان الحرباوي</span>
                  </div>
                </div>

                <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight mb-4">
                  مكتبة الكتب والمذكرات والتقييمات المعتمدة
                </h1>

                <p className={`text-sm sm:text-base leading-relaxed mb-6 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  استعرض وحمّل جميع كتب الوزارة ({books.length} كتاب ومذكرة من الملفات المعتمدة)، مع التقييمات الأسبوعية ونماذج الإجابة النموذجية لكافة المواد والشعب.
                </p>

                {/* Search Bar */}
                <div className="relative max-w-2xl">
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400">
                    <Search className="w-5 h-5 text-indigo-500" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="ابحث باسم الكتاب، المادة، أو الموضوع (مثال: تاريخ، نحو، رياضيات، فيزياء)..."
                    className={`w-full border rounded-2xl pr-12 pl-4 py-3.5 text-sm shadow-xl transition-all focus:ring-2 focus:ring-indigo-500/20 ${
                      isDark
                        ? 'bg-slate-950/90 border-indigo-500/40 text-slate-100 placeholder-slate-400 focus:border-indigo-400'
                        : 'bg-white border-indigo-300 text-slate-900 placeholder-slate-400 focus:border-indigo-600'
                    }`}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute inset-y-0 left-0 pl-4 flex items-center text-xs text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                    >
                      مسح
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Announcements */}
            {announcements.length > 0 && (
              <div
                className={`border rounded-2xl p-4 flex items-center gap-3 shadow-lg ${
                  isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
                }`}
              >
                <span className="w-8 h-8 rounded-xl bg-violet-500/10 text-violet-500 border border-violet-500/20 flex items-center justify-center shrink-0">
                  <Bell className="w-4 h-4" />
                </span>
                <div className="flex-1 overflow-hidden">
                  <p className="text-xs font-bold truncate">{announcements[0].title}</p>
                  <p className="text-[11px] text-slate-500 truncate">{announcements[0].content}</p>
                </div>
                <span className="text-[10px] text-slate-400 shrink-0">{announcements[0].date}</span>
              </div>
            )}

            {/* Categories */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5 text-indigo-500" />
                  تصفية حسب المادة أو الشعبة:
                </span>
                <span className="text-xs text-slate-400">
                  عرض {filteredBooks.length} من أصل {books.length} كتاب
                </span>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 cursor-pointer ${
                      selectedCategory === cat.id
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                        : isDark
                        ? 'bg-slate-900 text-slate-400 hover:text-slate-100 hover:bg-slate-800 border border-slate-800'
                        : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Books Grid */}
            {filteredBooks.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredBooks.map((book) => (
                  <BookCard
                    key={book.id}
                    book={book}
                    onRead={(b) => setActiveReadingBook(b)}
                    isFavorite={favorites.includes(book.id)}
                    onToggleFavorite={handleToggleFavorite}
                    theme={theme}
                  />
                ))}
              </div>
            ) : (
              <div
                className={`text-center py-16 rounded-2xl border ${
                  isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                }`}
              >
                <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-500">لم يتم العثور على كتب مطابقة</h3>
                <p className="text-xs text-slate-400 mt-1">جرب البحث بكلمة أخرى أو اختر تصنيفاً مختلفاً</p>
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: Videos & Lectures */}
        {currentTab === 'videos' && (
          <VideoSection
            videos={videos}
            theme={theme}
            studentUser={studentUser}
            onSaveNote={handleSaveNote}
            onDeleteNote={handleDeleteNote}
            savedNotes={studentNotes}
            watchedVideos={studentUser?.watchedVideos || []}
            onToggleWatchedVideo={handleToggleWatchedVideo}
            onOpenAuthModal={() => {
              setAuthModalMode('login');
              setShowAuthModal(true);
            }}
          />
        )}

        {/* VIEW 3: Evaluations */}
        {currentTab === 'evaluations' && (
          <EvaluationsView evaluations={evaluations} theme={theme} />
        )}

        {/* VIEW 4: Interactive Exams */}
        {currentTab === 'exams' && (
          <ExamRunner exams={exams} theme={theme} />
        )}

        {/* VIEW 5: Quran */}
        {currentTab === 'quran' && (
          <QuranSection theme={theme} />
        )}

        {/* VIEW 6: Favorites */}
        {currentTab === 'favorites' && (
          <div className="space-y-6">
            <div
              className={`border rounded-2xl p-6 sm:p-8 shadow-xl ${
                isDark
                  ? 'bg-gradient-to-r from-rose-950/70 via-slate-900 to-slate-900 border-rose-500/30 text-white'
                  : 'bg-gradient-to-r from-rose-50 via-white to-pink-50 border-rose-200 text-slate-900 shadow-sm'
              }`}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-semibold mb-3">
                <Heart className="w-3.5 h-3.5 fill-rose-500" />
                قائمتك المفضلة للوصول السريع
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold">الكتب والمذكرات المحفوظة</h2>
              <p className={`text-sm mt-2 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                الكتب التي قمت بحفظها للرجوع إليها في أي وقت أثناء المذاكرة.
              </p>
            </div>

            {favoriteBooks.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {favoriteBooks.map((book) => (
                  <BookCard
                    key={book.id}
                    book={book}
                    onRead={(b) => setActiveReadingBook(b)}
                    isFavorite={true}
                    onToggleFavorite={handleToggleFavorite}
                    theme={theme}
                  />
                ))}
              </div>
            ) : (
              <div
                className={`text-center py-16 rounded-2xl border ${
                  isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                }`}
              >
                <Heart className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-500">لا توجد كتب في المفضلة حالياً</h3>
                <p className="text-xs text-slate-400 mt-1">اضغط على أيقونة القلب على أي كتاب لإضافته هنا</p>
              </div>
            )}
          </div>
        )}

        {/* VIEW 7: Teacher Dashboard (STRICTLY RESTRICTED TO ramadanh66778@gmail.com) */}
        {currentTab === 'teacher' && (
          isTeacherAuthenticated ? (
            <TeacherDashboard
              books={books}
              evaluations={evaluations}
              exams={exams}
              announcements={announcements}
              supportTickets={supportTickets}
              students={students}
              videos={videos}
              onRefresh={() => {}}
              onDeleteBook={handleDeleteBook}
              onSaveBook={handleSaveBook}
              onSaveExam={handleSaveExam}
              onDeleteExam={handleDeleteExam}
              onDeleteStudent={handleDeleteStudent}
              onApproveStudent={handleApproveStudent}
              onRejectStudent={handleRejectStudent}
              onDeleteTicket={handleDeleteTicket}
              onToggleTicketStatus={handleToggleTicketStatus}
              onSaveVideo={handleSaveVideo}
              onDeleteVideo={handleDeleteVideo}
              userId="teacher-admin"
              theme={theme}
            />
          ) : (
            <div className="p-8 sm:p-12 text-center max-w-lg mx-auto bg-slate-900 border border-slate-800 rounded-3xl space-y-4 my-10">
              <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-500 flex items-center justify-center mx-auto">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-black text-white">منطقة خاصة بالمعلم المشرف فقط</h2>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                هذه الصفحة مقفلة تماماً ومخصصة للأستاذ محمد رمضان الحرباوي فقط. للدخول، يرجى تسجيل الدخول بحساب Google المعتمد (ramadanh66778@gmail.com).
              </p>
              <button
                onClick={() => setCurrentTab('books')}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-indigo-600/30 cursor-pointer"
              >
                العودة للمكتبة العامة
              </button>
            </div>
          )
        )}

        {/* VIEW 8: Student Profile View & Stats */}
        {currentTab === 'profile' && studentUser && (
          <StudentProfileView
            studentUser={studentUser}
            videos={videos}
            savedNotes={studentNotes}
            favoritesCount={favorites.length}
            theme={theme}
            onNavigateTab={(tab) => setCurrentTab(tab)}
            onOpenSupport={() => setShowSupportModal(true)}
            onLogout={handleStudentLogout}
          />
        )}
      </main>

      {/* Floating Technical Support Button */}
      <div className="fixed bottom-6 left-6 z-40">
        <button
          onClick={() => setShowSupportModal(true)}
          className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-cyan-600 via-indigo-600 to-indigo-700 hover:from-cyan-500 hover:to-indigo-600 text-white font-bold text-xs shadow-2xl shadow-cyan-600/40 hover:scale-105 active:scale-95 transition-all cursor-pointer border border-cyan-400/40"
          title="الدعم الفني وخدمة الطلاب"
        >
          <div className="relative">
            <Headphones className="w-4 h-4 text-cyan-200" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400" />
          </div>
          <span className="hidden sm:inline font-bold">الدعم الفني والمساعدة</span>
          <span className="sm:hidden font-bold">الدعم</span>
        </button>
      </div>

      {/* Embedded Book Reader Modal */}
      <BookReaderModal book={activeReadingBook} onClose={() => setActiveReadingBook(null)} />

      {/* Student & Teacher Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        initialMode={authModalMode}
        onClose={() => setShowAuthModal(false)}
        onSuccess={(student) => {
          const approvedStudent: StudentUser = {
            ...student,
            status: 'approved',
            createdAt: new Date().toISOString()
          };
          setStudentUser(approvedStudent);
          setCurrentTab('profile'); // Immediately direct to student profile view
          try {
            localStorage.setItem('student_session', JSON.stringify(approvedStudent));
          } catch {}
        }}
        onTeacherSuccess={handleTeacherSuccess}
      />

      {/* Technical Support Modal */}
      <SupportModal
        isOpen={showSupportModal}
        onClose={() => setShowSupportModal(false)}
        studentUser={studentUser}
        onTicketSubmitted={handleTicketSubmitted}
      />

      {/* Footer */}
      <footer
        className={`border-t py-8 text-center text-xs transition-colors mt-12 ${
          isDark ? 'border-slate-800 bg-slate-950 text-slate-400' : 'border-slate-200 bg-white text-slate-600'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-2">
          <p className="font-extrabold text-sm text-amber-500">
            برعاية وتطوير: محمد رمضان الحرباوي
          </p>
          <p className="font-bold">
            منصة المكتبة التعليمية الشاملة • تانية بكالوريا والثانوية العامة
          </p>
          <div className="flex items-center justify-center gap-4 text-[11px] pt-1">
            <button
              onClick={() => setShowSupportModal(true)}
              className="text-cyan-500 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Headphones className="w-3 h-3" />
              <span>إرسال رسالة للدعم الفني</span>
            </button>
            {isTeacherAuthenticated && (
              <>
                <span>•</span>
                <button
                  onClick={() => setCurrentTab('teacher')}
                  className="text-amber-500 hover:underline flex items-center gap-1 font-bold cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>لوحة تحكم المعلم المشرف 👑</span>
                </button>
              </>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
