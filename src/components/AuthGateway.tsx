import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Sparkles,
  ShieldCheck,
  Lock,
  Phone,
  User,
  LogIn,
  UserPlus,
  AlertCircle,
  RefreshCw,
  Clock,
  Headphones,
  CheckCircle2,
  XCircle,
  MessageCircle,
  LogOut
} from 'lucide-react';
import { db, auth, googleProvider } from '../firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { signInWithPopup } from 'firebase/auth';
import { StudentUser } from '../data/initialData';
import {
  executeGoogleSignIn,
  checkGoogleRedirectResult,
  processGoogleUser,
  decodeJwt,
  OWNER_EMAIL,
  TEACHER_MASTER_PASSCODES
} from '../utils/googleAuth';

interface AuthGatewayProps {
  onStudentApproved: (userData: StudentUser) => void;
  onTeacherLogin: (teacherProfile: { name: string; email: string; photoURL?: string }) => void;
  currentStudentUser: StudentUser | null;
  onLogout: () => void;
  onOpenSupport: () => void;
  theme?: 'dark' | 'light';
}

export const AuthGateway: React.FC<AuthGatewayProps> = ({
  onStudentApproved,
  onTeacherLogin,
  currentStudentUser,
  onLogout,
  onOpenSupport,
  theme = 'dark'
}) => {
  const isDark = theme === 'dark';
  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Form Fields
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [grade, setGrade] = useState('تانية بكالوريا / الصف الثاني الثانوي');

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check Google Redirect on Mount
  useEffect(() => {
    checkGoogleRedirectResult().then((result) => {
      if (result && result.success) {
        if (result.isTeacher && result.teacherProfile) {
          onTeacherLogin(result.teacherProfile);
        } else if (result.studentData) {
          onStudentApproved(result.studentData);
        }
      }
    });
  }, []);

  // Initialize Google Identity Services (GSI) if available
  useEffect(() => {
    try {
      const g = (window as any).google;
      if (g && g.accounts && g.accounts.id) {
        g.accounts.id.initialize({
          client_id: '735952128063-tknsdf5lpbl0pqe08vnott1kpiqm06ol.apps.googleusercontent.com',
          callback: async (response: any) => {
            if (response && response.credential) {
              setGoogleLoading(true);
              const decoded = decodeJwt(response.credential);
              if (decoded && decoded.email) {
                const res = await processGoogleUser(
                  decoded.email,
                  decoded.name || '',
                  decoded.picture || undefined
                );
                if (res.success) {
                  if (res.isTeacher && res.teacherProfile) {
                    onTeacherLogin(res.teacherProfile);
                  } else if (res.studentData) {
                    onStudentApproved(res.studentData);
                  }
                }
              }
              setGoogleLoading(false);
            }
          }
        });
      }
    } catch (e) {
      console.warn('GSI init notice:', e);
    }
  }, []);

  // Real-time status sync for pending students (listens to Firestore & local cache)
  useEffect(() => {
    if (!currentStudentUser || currentStudentUser.status === 'approved') return;

    const safeDocId = currentStudentUser.phone.replace(/[^a-zA-Z0-9_]/g, '_');

    const handleApproved = (data: any) => {
      const approvedStudent: StudentUser = {
        ...currentStudentUser,
        status: 'approved',
        name: data?.name || currentStudentUser.name,
        grade: data?.grade || currentStudentUser.grade
      };
      localStorage.setItem('student_session', JSON.stringify(approvedStudent));
      onStudentApproved(approvedStudent);
    };

    // Check localStorage in case teacher approved in this or another tab
    const interval = setInterval(() => {
      try {
        const localSession = localStorage.getItem('student_session');
        if (localSession) {
          const parsed = JSON.parse(localSession);
          if (parsed.status === 'approved' && (parsed.phone === currentStudentUser.phone || parsed.phone === safeDocId)) {
            handleApproved(parsed);
          }
        }
        const localReg = localStorage.getItem('bac_registered_students');
        if (localReg) {
          const regObj = JSON.parse(localReg);
          const found = regObj[currentStudentUser.phone] || regObj[safeDocId];
          if (found && found.status === 'approved') {
            handleApproved(found);
          }
        }
      } catch {}
    }, 1500);

    // 1. Listen on raw phone doc
    const unsub1 = onSnapshot(doc(db, 'users', currentStudentUser.phone), (docSnap) => {
      if (docSnap.exists() && docSnap.data().status === 'approved') {
        handleApproved(docSnap.data());
      }
    }, () => {});

    // 2. Listen on safeDocId doc
    const unsub2 = onSnapshot(doc(db, 'users', safeDocId), (docSnap) => {
      if (docSnap.exists() && docSnap.data().status === 'approved') {
        handleApproved(docSnap.data());
      }
    }, () => {});

    return () => {
      clearInterval(interval);
      unsub1();
      unsub2();
    };
  }, [currentStudentUser?.phone, currentStudentUser?.status]);

  // Student Phone/Password Login
  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phone.trim();
    const cleanPass = password.trim();

    if (!cleanPhone || !cleanPass) {
      setError('يرجى إدخال رقم الهاتف والرقم السري');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let foundUser: any = null;

      // 1. Try Firestore
      try {
        const userDoc = await getDoc(doc(db, 'users', cleanPhone));
        if (userDoc.exists()) {
          foundUser = userDoc.data();
        }
      } catch (err) {
        console.warn('Firestore user fetch fallback:', err);
      }

      // 2. Try Local Storage
      if (!foundUser) {
        try {
          const localUsersStr = localStorage.getItem('bac_registered_students');
          if (localUsersStr) {
            const localUsers = JSON.parse(localUsersStr);
            foundUser = localUsers[cleanPhone];
          }
        } catch {}
      }

      if (foundUser) {
        if (foundUser.password && foundUser.password !== cleanPass) {
          setError('الرقم السري غير صحيح. يرجى التأكد وإعادة المحاولة.');
          setLoading(false);
          return;
        }

        const studentData: StudentUser = {
          name: foundUser.name || 'طالب',
          phone: cleanPhone,
          grade: foundUser.grade || grade,
          status: foundUser.status || 'pending',
          createdAt: foundUser.createdAt || new Date().toISOString()
        };

        localStorage.setItem('student_session', JSON.stringify(studentData));
        onStudentApproved(studentData);
      } else {
        setError('هذا الحساب غير مسجل مسبقاً. يرجى الضغط على "طلب حساب جديد" لإرسال طلبك.');
      }
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  };

  // Student Register
  const handleStudentRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phone.trim();
    const cleanPass = password.trim();
    const cleanName = name.trim();

    if (!cleanPhone || !cleanPass || !cleanName) {
      setError('يرجى إدخال جميع البيانات المطلوبة');
      return;
    }

    if (cleanPass.length < 4) {
      setError('الرقم السري يجب ألا يقل عن 4 أحرف أو أرقام');
      return;
    }

    if (cleanPass !== confirmPassword.trim()) {
      setError('الرقم السري وتأكيده غير متطابقين');
      return;
    }

    setLoading(true);
    setError(null);

    // Initial status is STRICTLY PENDING until Teacher approves
    const newStudent: StudentUser = {
      name: cleanName,
      phone: cleanPhone,
      grade,
      role: 'student',
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    const fullRecord = {
      ...newStudent,
      password: cleanPass
    };

    try {
      // Save to Firestore
      try {
        await setDoc(doc(db, 'users', cleanPhone), fullRecord);
      } catch (err) {
        console.warn('Firestore registration write fallback:', err);
      }

      // Save to local storage cache
      try {
        const localUsersStr = localStorage.getItem('bac_registered_students');
        const localUsers = localUsersStr ? JSON.parse(localUsersStr) : {};
        localUsers[cleanPhone] = fullRecord;
        localStorage.setItem('bac_registered_students', JSON.stringify(localUsers));
      } catch {}

      localStorage.setItem('student_session', JSON.stringify(newStudent));
      onStudentApproved(newStudent);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء إرسال طلب التسجيل');
    } finally {
      setLoading(false);
    }
  };

  // Google Login (Owner ramadanh66778@gmail.com = Instant Teacher Access; Others = Student)
  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError(null);
    try {
      const result = await executeGoogleSignIn();
      if (result.success) {
        if (result.isTeacher && result.teacherProfile) {
          onTeacherLogin(result.teacherProfile);
        } else if (result.studentData) {
          onStudentApproved(result.studentData);
        }
      } else {
        if (result.error) {
          setError(result.error);
        }
      }
    } catch (err: any) {
      console.warn('Google sign-in error:', err);
      setError('حدث خطأ أثناء الاتصال بحساب Google. يمكنك المحاولة مجدداً أو استخدام رقم الهاتف.');
    } finally {
      setGoogleLoading(false);
    }
  };

  // =======================================================================
  // CASE 1: STUDENT ACCOUNT IS PENDING APPROVAL
  // =======================================================================
  if (currentStudentUser && currentStudentUser.status === 'pending') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950 text-slate-100" dir="rtl">
        <div className="max-w-xl w-full bg-slate-900 border border-amber-500/40 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden text-center space-y-6">
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Pending Badge */}
          <div className="w-18 h-18 rounded-3xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center mx-auto shadow-xl shadow-amber-500/10 animate-pulse">
            <Clock className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold">
              <span>طلب حسابك قيد المراجعة الأمنية والاعتماد</span>
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              أهلاً بك يا {currentStudentUser.name}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-md mx-auto">
              تم استلام طلب انضمامك برقم الهاتف (<span className="font-mono text-amber-300" dir="ltr">{currentStudentUser.phone}</span>) بنجاح، وهو الآن معروض في لوحة تحكم <strong className="text-amber-400">الأستاذ: محمد رمضان الحرباوي</strong> لمراجعته واعتماده.
            </p>
          </div>

          {/* Status Box */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-right space-y-2 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-slate-400">حالة الحساب:</span>
              <span className="font-bold text-amber-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                قيد المراجعة والاعتماد
              </span>
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-slate-400">الصف / الشعبة:</span>
              <span className="font-bold text-slate-200">{currentStudentUser.grade}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">نظام المراقبة اللحظي:</span>
              <span className="font-bold text-emerald-400">نشط (تفتح المكتبة فوراً عند الموافقة)</span>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3 pt-2">
            <button
              onClick={onOpenSupport}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-600/25 transition-all cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>محادثة الأستاذ محمد رمضان والدعم الفني لتسريع التفعيل 💬</span>
            </button>

            <button
              onClick={onLogout}
              className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>تسجيل الخروج والرجوع لبوابة الدخول</span>
            </button>
          </div>

          <div className="text-[11px] text-slate-500">
            برعاية وتطوير: محمد رمضان الحرباوي • نظام حماية متطور 100%
          </div>
        </div>
      </div>
    );
  }

  // =======================================================================
  // CASE 2: STUDENT ACCOUNT IS REJECTED
  // =======================================================================
  if (currentStudentUser && currentStudentUser.status === 'rejected') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950 text-slate-100" dir="rtl">
        <div className="max-w-md w-full bg-slate-900 border border-rose-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden text-center space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center justify-center mx-auto">
            <XCircle className="w-9 h-9" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black text-white">عذراً، تم رفض الحساب أو تجميده</h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              تم تعليق الحساب المرتبط بالرقم ({currentStudentUser.phone}). يرجى مراجعة إدارة المنصة عبر الدعم الفني للاستفسار وتصحيح البيانات.
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={onOpenSupport}
              className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
            >
              <Headphones className="w-4 h-4" />
              <span>التواصل مع الدعم الفني</span>
            </button>
            <button
              onClick={onLogout}
              className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>تسجيل الخروج</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =======================================================================
  // CASE 3: VISITOR / UNREGISTERED - MAIN LOGIN GATEWAY
  // =======================================================================
  return (
    <div
      className="min-h-screen flex flex-col justify-center items-center p-4 bg-slate-950 text-slate-100 relative overflow-hidden"
      dir="rtl"
    >
      {/* Background Glows */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Banner Tag */}
      <div className="mb-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black shadow-lg">
        <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
        <span>👑 برعاية وتطوير: محمد رمضان الحرباوي 👑</span>
      </div>

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 text-slate-100 space-y-6">
        {/* Platform Identity */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-500 via-indigo-600 to-indigo-800 flex items-center justify-center mx-auto shadow-xl shadow-indigo-600/30">
            <GraduationCap className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            المكتبة التعليمية الشاملة
          </h1>
          <p className="text-xs text-slate-400">
            تانية بكالوريا والثانوية العامة • كتب الوزارة والفيديوهات والتقييمات
          </p>
        </div>

        {/* Security Notice */}
        <div className="p-3 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-indigo-300 text-xs flex items-center gap-2.5">
          <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" />
          <p className="text-[11px] leading-relaxed">
            منظومة تعليمية مؤمنة 100%. يلزم تسجيل الدخول أو إرسال طلب انضمام للوصول إلى محتويات المنصة.
          </p>
        </div>

        {/* Tabs: Login vs Register */}
        <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800 gap-1">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              mode === 'login'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            تسجيل الدخول
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError(null);
            }}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              mode === 'register'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            طلب حساب طالب جديد
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-800/80 text-rose-200 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {/* Google Authentication */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-slate-100 active:bg-slate-200 text-slate-900 font-bold text-xs flex items-center justify-center gap-2.5 shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            {googleLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
            ) : (
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
            <span>المتابعة باستخدام Google</span>
          </button>

          <div className="flex items-center gap-3">
            <div className="h-px bg-slate-800 flex-1" />
            <span className="text-[11px] text-slate-500 font-semibold">أو برقم الهاتف</span>
            <div className="h-px bg-slate-800 flex-1" />
          </div>
        </div>

        {/* Main Form */}
        <form
          onSubmit={mode === 'login' ? handleStudentLogin : handleStudentRegister}
          className="space-y-3.5 text-xs"
        >
          {mode === 'register' && (
            <div>
              <label className="block text-slate-300 font-semibold mb-1">الاسم بالكامل *</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: يوسف أحمد محمود"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pr-10 pl-3 py-2.5 text-slate-100 focus:border-indigo-500 text-xs"
                />
                <User className="w-4 h-4 text-slate-500 absolute right-3.5 top-3" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-slate-300 font-semibold mb-1">رقم الهاتف *</label>
            <div className="relative">
              <input
                type="tel"
                required
                dir="ltr"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="01xxxxxxxxx"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pr-10 pl-3 py-2.5 text-slate-100 focus:border-indigo-500 text-xs text-right"
              />
              <Phone className="w-4 h-4 text-slate-500 absolute right-3.5 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">الرقم السري *</label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="أدخل الرقم السري"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pr-10 pl-3 py-2.5 text-slate-100 focus:border-indigo-500 text-xs text-right"
              />
              <Lock className="w-4 h-4 text-slate-500 absolute right-3.5 top-3" />
            </div>
          </div>

          {mode === 'register' && (
            <>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">تأكيد الرقم السري *</label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="أعد كتابة الرقم السري"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pr-10 pl-3 py-2.5 text-slate-100 focus:border-indigo-500 text-xs text-right"
                  />
                  <Lock className="w-4 h-4 text-slate-500 absolute right-3.5 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">الصف / الشعبة</label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100 focus:border-indigo-500 text-xs cursor-pointer"
                >
                  <option value="تانية بكالوريا / الصف الثاني الثانوي">
                    تانية بكالوريا / الصف الثاني الثانوي
                  </option>
                  <option value="الصف الثالث الثانوي / بكالوريا علمي">
                    الصف الثالث الثانوي / بكالوريا علمي
                  </option>
                  <option value="الصف الثالث الثانوي / بكالوريا أدبي">
                    الصف الثالث الثانوي / بكالوريا أدبي
                  </option>
                  <option value="شعبة العلوم الرياضية">شعبة العلوم الرياضية</option>
                </select>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50 mt-2"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin text-white" />
            ) : mode === 'login' ? (
              <>
                <LogIn className="w-4 h-4" />
                <span>دخول إلى المنصة</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>إرسال طلب الانضمام للمراجعة</span>
              </>
            )}
          </button>
        </form>

        {/* Footer Support link */}
        <div className="pt-2 text-center border-t border-slate-800">
          <button
            onClick={onOpenSupport}
            className="text-xs text-cyan-400 hover:underline inline-flex items-center gap-1.5 cursor-pointer font-semibold"
          >
            <Headphones className="w-3.5 h-3.5" />
            <span>بحاجة لمساعدة أو استفسار؟ تحدث مع الدعم الفني</span>
          </button>
        </div>
      </div>
    </div>
  );
};
