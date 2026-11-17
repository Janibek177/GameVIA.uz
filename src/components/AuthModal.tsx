import React, { useState } from 'react';
import { X, Lock, User, ArrowRight, ShieldCheck, CheckCircle2, AlertCircle, LogOut, Mail, UserPlus, Sparkles } from 'lucide-react';
import { sound } from '../utils/audio';
import {
  auth,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  db,
} from '../firebase';
import { doc, setDoc } from 'firebase/firestore';

export interface UserProfile {
  uid?: string;
  name: string;
  email: string;
  avatar: string;
  provider: 'google' | 'firebase_email' | 'login';
  role?: 'OWNER' | 'ADMIN' | 'USER';
}

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onLoginSuccess: (user: UserProfile) => void;
  onLogout: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLoginSuccess,
  onLogout,
}) => {
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [emailOrNick, setEmailOrNick] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [notice, setNotice] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  if (!isOpen) return null;

  // Convert input into a valid email if user entered a username
  const normalizeEmail = (val: string): string => {
    const clean = val.trim();
    if (clean.includes('@')) {
      return clean.toLowerCase();
    }
    return `${clean.toLowerCase()}@gamevia.gg`;
  };

  const getCleanUsername = (val: string): string => {
    const clean = val.trim();
    if (clean.includes('@')) {
      return clean.split('@')[0];
    }
    return clean;
  };

  // Google Firebase Popup Login
  const handleGoogleLogin = async () => {
    sound.playTick();
    setIsGoogleLoading(true);
    setNotice(null);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const profile: UserProfile = {
        uid: user.uid,
        name: user.displayName || user.email?.split('@')[0] || 'Игрок GameVia',
        email: user.email || 'player@gamevia.gg',
        avatar:
          user.photoURL ||
          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&h=120&q=80',
        provider: 'google',
      };

      // Sync with server and get role
      const res = await fetch('/api/user/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          email: profile.email,
          displayName: profile.name,
          photoURL: profile.avatar,
        }),
      });
      const data = await res.json();
      
      profile.role = data.role; // Set the role from the server
      
      onLoginSuccess(profile);
      sound.playWin(true);
      setNotice({
        type: 'success',
        text: `Добро пожаловать, ${profile.name}! Успешный вход через Google.`,
      });
      onClose();
    } catch (err: any) {
      console.error('Login error:', err);
      setNotice({ type: 'error', text: 'Ошибка при входе: ' + err.message });
      sound.playFail();
    } finally {
      setIsGoogleLoading(false);
    }
  };


  // Email / Password Login or Registration via Firebase
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrNick.trim() || !password.trim()) {
      setNotice({ type: 'error', text: 'Заполните логин и пароль' });
      return;
    }

    if (password.length < 6) {
      setNotice({ type: 'error', text: 'Пароль должен содержать не менее 6 символов' });
      return;
    }

    sound.playTick();
    setIsLoading(true);
    setNotice(null);

    const email = normalizeEmail(emailOrNick);
    const username = displayName.trim() || getCleanUsername(emailOrNick);

    try {
      if (authMode === 'signup') {
        // Register new account in Firebase
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        const user = cred.user;

        const profile: UserProfile = {
          uid: user.uid,
          name: username,
          email: user.email || email,
          avatar:
            'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&h=120&q=80',
          provider: 'firebase_email',
        };

        // Sync to Firestore
        try {
          await setDoc(
            doc(db, 'users', user.uid),
            {
              userId: user.uid,
              email: profile.email,
              displayName: profile.name,
              photoURL: profile.avatar,
              createdAt: Date.now(),
              updatedAt: Date.now(),
            },
            { merge: true }
          );
        } catch (dbErr) {
          console.warn('Firestore user create non-blocking error:', dbErr);
        }

        onLoginSuccess(profile);
        sound.playWin(false);
        setNotice({
          type: 'success',
          text: `Аккаунт успешно создан в Firebase! Добро пожаловать, ${profile.name}!`,
        });

        setTimeout(() => {
          onClose();
          setNotice(null);
        }, 1000);
      } else {
        // Sign in existing account
        try {
          const cred = await signInWithEmailAndPassword(auth, email, password);
          const user = cred.user;

          const profile: UserProfile = {
            uid: user.uid,
            name: user.displayName || username,
            email: user.email || email,
            avatar:
              user.photoURL ||
              'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&h=120&q=80',
            provider: 'firebase_email',
          };

          onLoginSuccess(profile);
          sound.playWin(false);
          setNotice({
            type: 'success',
            text: `Добро пожаловать, ${profile.name}! Вход в Firebase выполнен.`,
          });

          setTimeout(() => {
            onClose();
            setNotice(null);
          }, 1000);
        } catch (signErr: any) {
          // If user doesn't exist yet, offer easy 1-click fallback or inform them
          if (signErr.code === 'auth/user-not-found' || signErr.code === 'auth/invalid-credential') {
            setNotice({
              type: 'error',
              text: 'Неверный логин или пароль. Если у вас ещё нет аккаунта, переключитесь на вкладку «Регистрация».',
            });
          } else {
            throw signErr;
          }
        }
      }
    } catch (err: any) {
      console.error('Firebase Auth error:', err);
      let errMsg = 'Произошла ошибка при входе в Firebase.';
      if (err.code === 'auth/email-already-in-use') {
        errMsg = 'Этот логин/email уже зарегистрирован. Переключитесь на «Вход».';
      } else if (err.code === 'auth/weak-password') {
        errMsg = 'Слишком простой пароль. Используйте минимум 6 символов.';
      } else if (err.code === 'auth/invalid-email') {
        errMsg = 'Некорректный формат email/логина.';
      } else if (err.message) {
        errMsg = err.message;
      }
      setNotice({ type: 'error', text: errMsg });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoutClick = async () => {
    sound.playTick();
    try {
      await signOut(auth);
    } catch (e) {
      console.warn('SignOut error:', e);
    }
    onLogout();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-[#0f1422] border-2 border-amber-500/40 rounded-3xl shadow-2xl p-6 sm:p-7 overflow-hidden">
        {/* Decorative corner glows */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-blue-500/15 rounded-full blur-2xl pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer transition"
          aria-label="Закрыть"
        >
          <X className="w-4 h-4" />
        </button>

        {/* If user is already logged in */}
        {currentUser ? (
          <div>
            <div className="flex items-center gap-3.5 mb-6">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-14 h-14 rounded-2xl border-2 border-emerald-400/80 object-cover shadow-lg"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-lg text-white">{currentUser.name}</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Online
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-mono truncate max-w-[200px]">{currentUser.email}</p>
                <span className="text-[10px] text-amber-400 mt-0.5 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>
                    {currentUser.provider === 'google'
                      ? 'Google Firebase Auth'
                      : currentUser.provider === 'firebase_email'
                      ? 'Firebase Cloud Account'
                      : 'GameVia Профиль'}
                  </span>
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-3 mb-5">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>Ваш профиль подключен к Firebase проекту <b>gamevia-feae3</b>. Баланс, заявки и статистика защищены.</span>
            </div>

            <div className="space-y-2.5">
              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-extrabold text-sm shadow-md transition cursor-pointer"
              >
                Продолжить играть
              </button>
              <button
                type="button"
                onClick={handleLogoutClick}
                className="w-full py-2.5 rounded-xl bg-slate-800/80 hover:bg-red-500/20 hover:text-red-300 text-slate-300 font-semibold text-xs border border-slate-700/80 hover:border-red-500/40 transition cursor-pointer flex items-center justify-center gap-2"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Выйти из аккаунта</span>
              </button>
            </div>
          </div>
        ) : (
          <div>
            {/* Header */}
            <div className="flex items-center gap-3.5 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shadow-inner">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-xl text-white tracking-wide">Вход в GameVia</h3>
                <p className="text-xs text-slate-400">Firebase Auth & Cloud Database</p>
              </div>
            </div>

            {/* Mode switch tabs */}
            <div className="flex bg-slate-900/90 p-1 rounded-xl mb-4 border border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signin');
                  setNotice(null);
                }}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  authMode === 'signin'
                    ? 'bg-amber-500 text-black shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Вход в аккаунт
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signup');
                  setNotice(null);
                }}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  authMode === 'signup'
                    ? 'bg-amber-500 text-black shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Регистрация
              </button>
            </div>

            {/* Notice alert */}
            {notice && (
              <div
                className={`mb-4 p-3.5 rounded-2xl text-xs flex items-start gap-2.5 animate-fade-in ${
                  notice.type === 'success'
                    ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-300'
                    : notice.type === 'error'
                    ? 'bg-rose-500/15 border border-rose-500/40 text-rose-300'
                    : 'bg-amber-500/10 border border-amber-500/30 text-amber-300'
                }`}
              >
                {notice.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                )}
                <span className="leading-relaxed">{notice.text}</span>
              </div>
            )}

            {/* Google Sign In Button */}
            <button
              onClick={handleGoogleLogin}
              disabled={isGoogleLoading || isLoading}
              type="button"
              className="w-full mb-4 py-3 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-extrabold text-sm flex items-center justify-center gap-3 transition cursor-pointer shadow-xl hover:shadow-2xl border border-slate-200 group active:scale-95 disabled:opacity-50"
            >
              {isGoogleLoading ? (
                <div className="w-5 h-5 border-2 border-slate-400 border-t-slate-800 rounded-full animate-spin" />
              ) : (
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
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
              <span>Войти через Google</span>
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-slate-800" />
              <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">или по логину / email</span>
              <div className="flex-1 h-px bg-slate-800" />
            </div>

            {/* Email / Username & Password Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              {authMode === 'signup' && (
                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">
                    Игровой никнейм
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Например: Janibek_Pro"
                      className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
                    />
                    <UserPlus className="w-3.5 h-3.5 text-slate-500 absolute right-3.5 top-3" />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  Логин или Email
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={emailOrNick}
                    onChange={(e) => setEmailOrNick(e.target.value)}
                    placeholder="Логин или email@example.com"
                    className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
                  />
                  <Mail className="w-3.5 h-3.5 text-slate-500 absolute right-3.5 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  Пароль (минимум 6 символов)
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
                  />
                  <Lock className="w-3.5 h-3.5 text-slate-500 absolute right-3.5 top-3" />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || isGoogleLoading}
                className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-extrabold text-sm tracking-wide shadow-lg shadow-amber-500/20 transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{authMode === 'signup' ? 'Зарегистрироваться' : 'Войти'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Security badge */}
        <div className="mt-5 pt-3.5 border-t border-slate-800/80 flex items-center justify-center gap-2 text-[10px] text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Firebase Cloud Authentication • Проект <b>gamevia-feae3</b></span>
        </div>
      </div>
    </div>
  );
};
