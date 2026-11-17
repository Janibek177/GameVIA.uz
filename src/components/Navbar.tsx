import React from 'react';
import {
  Volume2,
  VolumeX,
  Sparkles,
  Coins,
  Package,
  Flame,
  Zap,
  Layers,
  HelpCircle,
  BarChart3,
  Plus,
  Rocket,
  Bomb,
  ArrowUpRight,
  LogIn,
  Crown,
} from 'lucide-react';
import { sound } from '../utils/audio';
import { UserProfile } from './AuthModal';
import { Language, t } from '../utils/i18n';

export type NavTabType =
  | 'cases'
  | 'crash'
  | 'mines'
  | 'stairs'
  | 'tower'
  | 'upgrade'
  | 'contract'
  | 'pass'
  | 'inventory'
  | 'analyzer'
  | 'about';

interface NavbarProps {
  balance: number;
  inventoryCount: number;
  activeTab: NavTabType;
  setActiveTab: (tab: NavTabType) => void;
  onOpenPromo: () => void;
  onOpenTopUp: () => void;
  onOpenWithdraw: () => void;
  onOpenAuth: () => void;
  onOpenPass: () => void;
  onOpenHistory: () => void;
  onOpenSupport: () => void;
  currentUser: UserProfile | null;
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
  currency?: 'RUB' | 'UZS';
  onCurrencyChange?: (currency: 'RUB' | 'UZS') => void;
  language?: Language;
  onLanguageChange?: (lang: Language) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  balance,
  inventoryCount,
  activeTab,
  setActiveTab,
  onOpenPromo,
  onOpenTopUp,
  onOpenWithdraw,
  onOpenAuth,
  onOpenPass,
  onOpenHistory,
  onOpenSupport,
  currentUser,
  isMuted,
  setIsMuted,
  currency = 'RUB',
  onCurrencyChange,
  language = 'ru',
  onLanguageChange,
}) => {
  const toggleSound = () => {
    const next = !isMuted;
    sound.setMuted(next);
    setIsMuted(next);
  };

  const navItems = [
    { id: 'cases' as NavTabType, label: t('nav.cases', language), icon: Flame },
    { id: 'crash' as NavTabType, label: t('nav.crash', language), icon: Rocket },
    { id: 'mines' as NavTabType, label: t('nav.mines', language), icon: Bomb },
    {
      id: 'stairs' as NavTabType,
      label: t('nav.stairs', language),
      customIcon: (
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M7 2v2h2v4H7v2h2v4H7v2h2v4H7v2h10v-2h-2v-4h2v-2h-2v-4h2V8h-2V4h2V2H7zm4 4h2v2h-2V6zm0 6h2v2h-2v-2zm0 6h2v2h-2v-2z" />
        </svg>
      ),
      badge: 'NEW',
    },
    { id: 'tower' as NavTabType, label: t('nav.tower', language), icon: Layers },
    { id: 'upgrade' as NavTabType, label: t('nav.upgrade', language), icon: Zap },
    { id: 'contract' as NavTabType, label: t('nav.contract', language), icon: Sparkles },
    { id: 'pass' as NavTabType, label: t('nav.pass', language), icon: Crown, isHighlight: true },
    { id: 'inventory' as NavTabType, label: `${t('nav.inventory', language)} (${inventoryCount})`, icon: Package },
    { id: 'analyzer' as NavTabType, label: t('nav.analyzer', language), icon: BarChart3 },
    { id: 'about' as NavTabType, label: t('nav.about', language), icon: HelpCircle },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#0c1018]/95 backdrop-blur border-b border-slate-800 w-full shadow-lg">
      {/* Top Main Bar: Brand & User Actions */}
      <div className="w-full px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* Brand */}
        <button
          onClick={() => setActiveTab('cases')}
          className="flex items-center gap-2 text-left group cursor-pointer shrink-0"
        >
          <img
            src="/assets/aistudio/image_ffaf8878.png"
            alt="GameVia"
            className="w-9 h-9 rounded-xl object-cover shadow-[0_0_15px_rgba(245,158,11,0.4)] group-hover:scale-105 transition-transform shrink-0 border border-purple-500/40"
          />
          <div className="shrink-0 flex items-center gap-1.5">
            <span className="font-bold text-base sm:text-lg tracking-wider text-white uppercase font-display whitespace-nowrap">
              GAME<span className="text-amber-500">VIA</span>
            </span>
            <span className="text-[10px] text-amber-400/90 font-mono border border-amber-500/30 px-1 py-0.2 rounded bg-amber-500/10">
              DROPS
            </span>
          </div>
        </button>

        {/* Right side: Audio, Pass button, Promo, Balance, Top-Up, Withdraw, User/Sign In */}
        <div className="flex items-center gap-1.5 sm:gap-2 md:gap-2.5 shrink-0 mr-2 sm:mr-6">
          {/* Audio toggle */}
          <button
            onClick={toggleSound}
            aria-label={isMuted ? 'Включить звук' : 'Выключить звук'}
            className="p-2 rounded-lg bg-slate-800/70 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition cursor-pointer"
            title={isMuted ? 'Включить звук' : 'Выключить звук'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
          </button>

          {/* Quick GamePass Button */}
          <button
            onClick={onOpenPass}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-purple-500/15 hover:from-amber-500/25 hover:to-orange-500/25 border border-amber-500/40 text-amber-300 font-extrabold text-xs shadow-sm hover:shadow-[0_0_12px_rgba(245,158,11,0.3)] transition cursor-pointer active:scale-95 whitespace-nowrap"
            title="Открыть боевой пропуск GameVia"
          >
            <Crown className="w-3.5 h-3.5 text-amber-400" />
            <span>Pass</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping ml-0.5" />
          </button>

          {/* History button */}
          <button
            onClick={onOpenHistory}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-xs font-bold text-slate-200 transition cursor-pointer hover:border-amber-500/40 whitespace-nowrap"
            title={t('topbar.history', language)}
          >
            <span className="text-amber-400 font-bold">📋</span>
            <span>{t('topbar.history', language)}</span>
          </button>

          {/* Support button */}
          <button
            onClick={onOpenSupport}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-xs font-bold text-cyan-300 transition cursor-pointer hover:border-cyan-500/40 whitespace-nowrap"
            title={t('topbar.support', language)}
          >
            <span className="text-cyan-400 font-bold">💬</span>
            <span>{t('topbar.support', language)}</span>
          </button>

          {/* Promo button */}
          <button
            onClick={onOpenPromo}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-xs font-semibold text-amber-300 transition cursor-pointer hover:border-amber-500/40 whitespace-nowrap"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{t('topbar.promo', language)}</span>
          </button>

          {/* Language Switcher (RU / UZ / EN) */}
          {onLanguageChange && (
            <div className="flex items-center rounded-xl bg-[#131b29] p-1 border border-slate-700/80 shrink-0">
              <button
                onClick={() => onLanguageChange('ru')}
                className={`px-1.5 sm:px-2 py-1 rounded-lg text-[11px] font-extrabold transition-all cursor-pointer flex items-center gap-1 ${
                  language === 'ru'
                    ? 'bg-amber-500 text-black shadow-xs font-black'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Русский язык"
              >
                <span>🇷🇺</span>
                <span className="hidden sm:inline">RU</span>
              </button>
              <button
                onClick={() => onLanguageChange('uz')}
                className={`px-1.5 sm:px-2 py-1 rounded-lg text-[11px] font-extrabold transition-all cursor-pointer flex items-center gap-1 ${
                  language === 'uz'
                    ? 'bg-amber-500 text-black shadow-xs font-black'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="O'zbek tili"
              >
                <span>🇺🇿</span>
                <span className="hidden sm:inline">UZ</span>
              </button>
              <button
                onClick={() => onLanguageChange('en')}
                className={`px-1.5 sm:px-2 py-1 rounded-lg text-[11px] font-extrabold transition-all cursor-pointer flex items-center gap-1 ${
                  language === 'en'
                    ? 'bg-amber-500 text-black shadow-xs font-black'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="English language"
              >
                <span>🇬🇧</span>
                <span className="hidden sm:inline">EN</span>
              </button>
            </div>
          )}

          {/* Currency Switcher */}
          {onCurrencyChange && (
            <div className="flex items-center rounded-xl bg-[#131b29] p-1 border border-slate-700/80 shrink-0">
              <button
                onClick={() => onCurrencyChange('RUB')}
                className={`px-2 py-1 rounded-lg text-[11px] font-extrabold transition-all cursor-pointer ${
                  currency === 'RUB'
                    ? 'bg-amber-500 text-black shadow-xs font-black'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Отображать баланс в ₽ RUB"
              >
                ₽ RUB
              </button>
              <button
                onClick={() => onCurrencyChange('UZS')}
                className={`px-2 py-1 rounded-lg text-[11px] font-extrabold transition-all cursor-pointer ${
                  currency === 'UZS'
                    ? 'bg-amber-500 text-black shadow-xs font-black'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Отображать баланс в сум UZS"
              >
                UZS
              </button>
            </div>
          )}

          {/* Balance card */}
          <div className="flex items-center bg-[#131b29] border border-amber-500/30 rounded-xl p-1 pl-2.5 sm:pl-3 shadow-inner shrink-0">
            <div className="flex items-center gap-1.5 mr-2 sm:mr-2.5">
              <Coins className="w-4 h-4 text-amber-400 shrink-0" />
              <div className="flex flex-col">
                <span className="text-[9px] text-slate-400 leading-none">{t('topbar.balance', language)}</span>
                <span className="text-xs sm:text-sm font-bold font-mono text-white leading-tight whitespace-nowrap">
                  {balance.toLocaleString('ru-RU')} Gold
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={onOpenTopUp}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-bold text-xs shadow-md transition cursor-pointer whitespace-nowrap"
                title={t('topbar.topup', language)}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t('topbar.topup', language)}</span>
              </button>

              <button
                onClick={onOpenWithdraw}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-bold text-xs transition cursor-pointer whitespace-nowrap shadow-sm hover:shadow-emerald-500/20"
                title={t('topbar.withdraw', language)}
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>{t('topbar.withdraw', language)}</span>
              </button>
            </div>
          </div>

          {/* User Profile or Sign In Button */}
          {currentUser ? (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-2 p-1 pl-2 pr-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-emerald-500/40 hover:border-emerald-400 text-xs font-bold text-white transition cursor-pointer shrink-0 shadow-sm"
              title={t('topbar.profile', language)}
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-6 h-6 rounded-lg object-cover border border-emerald-400"
              />
              <span className="hidden sm:inline max-w-[90px] truncate">{currentUser.name}</span>
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-slate-800 to-slate-800/90 hover:from-amber-500/20 hover:to-orange-500/20 border border-slate-700 hover:border-amber-500/50 text-slate-100 hover:text-white text-xs font-semibold transition cursor-pointer shrink-0 shadow-sm"
              title={t('topbar.login', language)}
            >
              <LogIn className="w-3.5 h-3.5 text-amber-400" />
              <span>{t('topbar.login', language)}</span>
            </button>
          )}
        </div>
      </div>

      {/* Dedicated Navigation Sub-Bar */}
      <div className="w-full bg-[#0a0e16]/95 border-t border-slate-800/80 py-1.5 shadow-sm">
        <div className="w-full px-3 sm:px-6 lg:px-8 flex items-center justify-start gap-1 sm:gap-1.5 md:gap-2 overflow-x-auto scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const isHighlight = item.isHighlight;

            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === 'pass') {
                    onOpenPass();
                  } else {
                    setActiveTab(item.id);
                  }
                }}
                className={`shrink-0 flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer whitespace-nowrap relative ${
                  isActive
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.25)] font-semibold'
                    : isHighlight
                    ? 'bg-gradient-to-r from-amber-500/15 to-purple-500/15 border border-amber-500/30 text-amber-300 font-bold hover:brightness-125'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {item.customIcon ? (
                  <span className={isActive ? 'text-amber-400' : 'text-red-400'}>{item.customIcon}</span>
                ) : Icon ? (
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400' : isHighlight ? 'text-amber-400' : 'text-slate-400'}`} />
                ) : null}
                <span>{item.label}</span>
                {item.badge && (
                  <span className="text-[9px] font-extrabold px-1 py-0.2 rounded bg-red-500/20 text-red-400 border border-red-500/30 font-mono">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
