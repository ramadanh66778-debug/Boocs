import React, { useState } from 'react';
import {
  X,
  LogIn,
  UserPlus,
  Phone,
  Lock,
  User,
  GraduationCap,
  AlertCircle,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { db, auth, googleProvider } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { signInWithPopup } from 'firebase/auth';
import { executeGoogleSignIn } from '../utils/googleAuth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (userData: { name: string; phone: string; grade: string }) => void;
  onTeacherSuccess?: (teacherProfile: { name: string; email: string; photoURL?: string }) => void;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onTeacherSuccess,
  initialMode = 'login'
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);

  // Form fields for student
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [grade, setGrade] = useState('تانية بكالوريا / الصف الثاني الثانوي');

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

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
      const localUsersStr = localStorage.getItem('bac_registered_students');
      const localUsers = localUsersStr ? JSON.parse(localUsersStr) : {};

      let foundUser = localUsers[cleanPhone];
      if (!foundUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', cleanPhone));
          if (userDoc.exists()) {
            foundUser = userDoc.data();
          }
        } catch (e) {
          console.warn('Firestore read fallback:', e);
        }
      }

      if (foundUser) {
        if (foundUser.password && foundUser.password !== cleanPass) {
          setError('الرقم السري غير صحيح. يرجى المحاولة مرة أخرى.');
          setLoading(false);
          return;
        }

        const studentData = {
          name: foundUser.name || 'طالب',
          phone: cleanPhone,
          grade: foundUser.grade || grade
        };

        localStorage.setItem('student_session', JSON.stringify(studentData));
        onSuccess(studentData);
        onClose();
      } else {
        setError('رقم الهاتف غير مسجل. يرجى الضغط على "حساب جديد" لإنشاء حساب.');
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
      setError('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    if (cleanPass.length < 4) {
      setError('الرقم السري يجب أن يتكون من 4 أرقام أو حروف على الأقل');
      return;
    }

    if (cleanPass !== confirmPassword.trim()) {
      setError('الرقم السري وتأكيده غير متطابقين');
      return;
    }

    setLoading(true);
    setError(null);

    const studentData = {
      name: cleanName,
      phone: cleanPhone,
      password: cleanPass,
      grade,
      role: 'student',
      createdAt: new Date().toISOString()
    };

    try {
      try {
        await setDoc(doc(db, 'users', cleanPhone), studentData);
      } catch (err) {
        console.warn('Firestore profile write fallback:', err);
      }

      const localUsersStr = localStorage.getItem('bac_registered_students');
      const localUsers = localUsersStr ? JSON.parse(localUsersStr) : {};
      localUsers[cleanPhone] = studentData;
      localStorage.setItem('bac_registered_students', JSON.stringify(localUsers));

      localStorage.setItem(
        'student_session',
        JSON.stringify({
          name: cleanName,
          phone: cleanPhone,
          grade
        })
      );

      onSuccess({ name: cleanName, phone: cleanPhone, grade });
      onClose();
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء إنشاء الحساب');
    } finally {
      setLoading(false);
    }
  };

  // Google Sign-In (Unified for Teacher and Students)
  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError(null);
    try {
      const result = await executeGoogleSignIn();
      if (result.success) {
        if (result.isTeacher && result.teacherProfile) {
          if (onTeacherSuccess) {
            onTeacherSuccess(result.teacherProfile);
          }
          onClose();
        } else if (result.studentData) {
          onSuccess({
            name: result.studentData.name,
            phone: result.studentData.phone,
            grade: result.studentData.grade
          });
          onClose();
        }
      } else {
        setError(result.error || 'تعذر تسجيل الدخول بـ Google. يرجى تجربة رقم الهاتف.');
      }
    } catch (err: any) {
      console.warn('Google sign-in error:', err);
      setError('حدث خطأ أثناء الاتصال بـ Google. يرجى استخدام تسجيل الدخول برقم الهاتف.');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto"
      dir="rtl"
    >
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-5 sm:p-7 shadow-2xl relative text-slate-100 my-auto max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          aria-label="إغلاق"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon */}
        <div className="w-13 h-13 rounded-2xl mx-auto flex items-center justify-center shadow-lg mb-3 bg-gradient-to-tr from-indigo-600 via-indigo-700 to-indigo-800 shadow-indigo-600/30">
          <GraduationCap className="w-7 h-7 text-white" />
        </div>

        <div className="text-center mb-5">
          <h3 className="text-lg sm:text-xl font-black text-white">
            {mode === 'login' ? 'تسجيل الدخول إلى المنصة' : 'إنشاء حساب طالب جديد'}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            {mode === 'login'
              ? 'سجل دخولك برقم الهاتف أو مباشرة عبر حساب Google'
              : 'أنشئ حسابك لحفظ ملاحظاتك ونتائج اختباراتك تلقائياً'}
          </p>
        </div>

        {/* Tabs: Login / Register ONLY (Teacher tab removed completely) */}
        <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800 mb-5 gap-1">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
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
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              mode === 'register'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            حساب جديد
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/70 border border-rose-800/80 text-rose-200 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {/* Google Sign-In Button */}
        <div className="space-y-3 mb-5">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            className="w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-100 active:bg-slate-200 text-slate-900 font-bold text-xs flex items-center justify-center gap-2.5 shadow-md transition-all cursor-pointer disabled:opacity-50"
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
            <span>المتابعة بحساب Google</span>
          </button>

          <div className="flex items-center gap-3">
            <div className="h-px bg-slate-800 flex-1" />
            <span className="text-[11px] text-slate-500 font-semibold">أو برقم الهاتف</span>
            <div className="h-px bg-slate-800 flex-1" />
          </div>
        </div>

        {/* STUDENT PHONE/PASSWORD FORM */}
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
                  placeholder="مثال: أحمد محمد علي"
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
                    placeholder="أعد إدخال الرقم السري"
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
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100 focus:border-indigo-500 text-xs"
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
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50 mt-2"
          >
            {loading ? (
              <span>جاري المعالجة...</span>
            ) : mode === 'login' ? (
              <>
                <LogIn className="w-4 h-4" />
                <span>دخول برقم الهاتف</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>إتمام إنشاء الحساب</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
