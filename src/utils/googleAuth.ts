import { auth, googleProvider, db } from '../firebase';
import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithCredential,
  GoogleAuthProvider,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { StudentUser } from '../data/initialData';

export const OWNER_EMAIL = 'ramadanh66778@gmail.com';

// Teacher Master Passcodes (for offline or emergency access if Google OAuth is restricted by domain)
export const TEACHER_MASTER_PASSCODES = [
  'ramadan2025',
  'mr-ramadan-2025',
  'alharbawy2025',
  '01020304',
  '12345678'
];

export interface GoogleAuthResult {
  success: boolean;
  isTeacher: boolean;
  teacherProfile?: {
    name: string;
    email: string;
    photoURL?: string;
  };
  studentData?: StudentUser;
  error?: string;
  isUnauthorizedDomain?: boolean;
}

// Decode Google JWT from GIS
export function decodeJwt(token: string): any {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.warn('Failed to decode JWT:', e);
    return null;
  }
}

// Process a verified Google user (from Firebase or GSI)
export async function processGoogleUser(
  email: string,
  name: string,
  photoURL?: string
): Promise<GoogleAuthResult> {
  const cleanEmail = email.toLowerCase().trim();
  const cleanName = name || 'مستخدم Google';

  // 1. Is this the Teacher / Owner?
  if (cleanEmail === OWNER_EMAIL) {
    const profile = {
      name: 'الأستاذ: محمد رمضان الحرباوي (المعلم المشرف)',
      email: cleanEmail,
      photoURL: photoURL || undefined
    };
    try {
      localStorage.setItem('teacher_session_auth', 'true');
      localStorage.setItem('teacher_profile', JSON.stringify(profile));
    } catch {}
    return {
      success: true,
      isTeacher: true,
      teacherProfile: profile
    };
  }

  // 2. Student via Google
  let existingStatus: 'pending' | 'approved' | 'rejected' = 'pending';
  const safeDocId = cleanEmail.replace(/[^a-zA-Z0-9_]/g, '_');

  try {
    const userDoc = await getDoc(doc(db, 'users', safeDocId));
    if (userDoc.exists()) {
      existingStatus = userDoc.data().status || 'pending';
    } else {
      await setDoc(doc(db, 'users', safeDocId), {
        name: cleanName,
        email: cleanEmail,
        phone: cleanEmail,
        grade: 'طالب مسجل عبر Google',
        role: 'student',
        status: 'pending',
        createdAt: new Date().toISOString()
      });
    }
  } catch (err) {
    console.warn('Firestore student sync fallback:', err);
  }

  const studentData: StudentUser = {
    name: cleanName,
    phone: cleanEmail,
    grade: 'طالب مسجل عبر Google',
    status: existingStatus,
    createdAt: new Date().toISOString()
  };

  try {
    localStorage.setItem('student_session', JSON.stringify(studentData));
  } catch {}

  return {
    success: true,
    isTeacher: false,
    studentData
  };
}

// Direct Google OAuth2 token fallback for external domains (e.g. Vercel)
export function signInWithGoogleOAuthDirect(): Promise<GoogleAuthResult> {
  return new Promise((resolve) => {
    try {
      const g = (window as any).google;
      if (g && g.accounts && g.accounts.oauth2) {
        const client = g.accounts.oauth2.initTokenClient({
          client_id: '735952128063-tknsdf5lpbl0pqe08vnott1kpiqm06ol.apps.googleusercontent.com',
          scope: 'email profile openid',
          callback: async (tokenResponse: any) => {
            if (tokenResponse && tokenResponse.access_token) {
              try {
                const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                  headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
                });
                const userData = await res.json();
                if (userData && userData.email) {
                  const authResult = await processGoogleUser(
                    userData.email,
                    userData.name || 'مستخدم Google',
                    userData.picture || undefined
                  );
                  resolve(authResult);
                  return;
                }
              } catch (fetchErr) {
                console.warn('UserInfo fetch error:', fetchErr);
              }
            }
            resolve({
              success: false,
              isTeacher: false,
              error: 'تعذر التحقق من حساب Google. يرجى التأكد من اتصال الإنترنت.'
            });
          }
        });
        client.requestAccessToken();
        return;
      }
    } catch (e) {
      console.warn('Google OAuth2 direct error:', e);
    }
    resolve({
      success: false,
      isTeacher: false,
      error: 'تعذر تشغيل نافذة مصادقة Google. يرجى استخدام تسجيل الدخول برقم الهاتف.'
    });
  });
}

// Handle Google Sign-In with multiple fallback mechanisms
export async function executeGoogleSignIn(): Promise<GoogleAuthResult> {
  // Try Firebase signInWithPopup first
  try {
    googleProvider.setCustomParameters({ prompt: 'select_account' });
    const res = await signInWithPopup(auth, googleProvider);
    if (res.user && res.user.email) {
      return await processGoogleUser(
        res.user.email,
        res.user.displayName || '',
        res.user.photoURL || undefined
      );
    }
    return { success: false, isTeacher: false, error: 'لم يتم استلام بيانات الحساب من Google' };
  } catch (err: any) {
    console.warn('Firebase signInWithPopup notice:', err.code, err.message);

    // Case A: Unauthorized domain in Firebase (e.g. Vercel deployment) -> Try Google OAuth2 direct
    if (err.code === 'auth/unauthorized-domain') {
      try {
        const directRes = await signInWithGoogleOAuthDirect();
        if (directRes.success) {
          return directRes;
        }
      } catch (directErr) {
        console.warn('Direct OAuth fallback error:', directErr);
      }
      return {
        success: false,
        isTeacher: false,
        error: 'جاري تحديث مصادقة Google. يمكنك تسجيل الدخول برقم الهاتف مباشرة دون انتظار.'
      };
    }

    // Case B: Popup was blocked by browser -> try Redirect
    if (err.code === 'auth/popup-blocked') {
      try {
        await signInWithRedirect(auth, googleProvider);
        return {
          success: false,
          isTeacher: false,
          error: 'تم تحويلك إلى صفحة تسجيل الدخول... يرجى الانتظار.'
        };
      } catch (redirectErr: any) {
        return {
          success: false,
          isTeacher: false,
          error: 'تم حظر النافذة المنبثقة من قبل المتصفح. يرجى السماح بالنوافذ المنبثقة ثم المحاولة مرة أخرى.'
        };
      }
    }

    // Case C: User closed popup
    if (err.code === 'auth/popup-closed-by-user') {
      return {
        success: false,
        isTeacher: false,
        error: 'تم إغلاق نافذة تسجيل الدخول قبل إتمام العملية.'
      };
    }

    // Case D: Network failure
    if (err.code === 'auth/network-request-failed') {
      return {
        success: false,
        isTeacher: false,
        error: 'تعذر الاتصال بخوادم Google. يرجى التحقق من اتصالك بالإنترنت أو تجربة تسجيل الدخول برقم الهاتف.'
      };
    }

    // General fallback
    return {
      success: false,
      isTeacher: false,
      error: err.message || 'تعذر تسجيل الدخول بـ Google في الوقت الحالي. يمكنك الدخول برقم الهاتف.'
    };
  }
}

// Check redirect result on component mount
export async function checkGoogleRedirectResult(): Promise<GoogleAuthResult | null> {
  try {
    const result = await getRedirectResult(auth);
    if (result && result.user && result.user.email) {
      return await processGoogleUser(
        result.user.email,
        result.user.displayName || '',
        result.user.photoURL || undefined
      );
    }
  } catch (err) {
    console.warn('Error checking redirect result:', err);
  }
  return null;
}
