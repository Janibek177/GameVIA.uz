import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { sound } from '../utils/audio';
import { X, Sparkles, CheckCircle2, AlertCircle, Gift, ShieldCheck, KeyRound, Check } from 'lucide-react';
import { findPromoCode } from '../data/promoCodes';
import { fetchPromoUsage, activatePromoCodeOnServer } from '../utils/api';
import { UserProfile } from './AuthModal';

interface PromoModalProps {
  onClose: () => void;
  onApplyBonus: (amount: number) => void;
  onGrantCaseVoucher?: (caseId: string, caseName: string) => void;
  usedCodes: string[];
  setUsedCodes: React.Dispatch<React.SetStateAction<string[]>>;
  currentUser?: UserProfile | null;
}

export const PromoModal: React.FC<PromoModalProps> = ({
  onClose,
  onApplyBonus,
  onGrantCaseVoucher,
  usedCodes,
  setUsedCodes,
  currentUser,
}) => {
  const [inputCode, setInputCode] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [usageCounts, setUsageCounts] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const userId =
    currentUser?.uid ||
    currentUser?.email ||
    (() => {
      let gid = localStorage.getItem('gamevia_guest_id');
      if (!gid) {
        gid = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        localStorage.setItem('gamevia_guest_id', gid);
      }
      return gid;
    })();

  // Fetch live promo usage counts from server for validation
  useEffect(() => {
    fetchPromoUsage().then((counts) => {
      if (counts) setUsageCounts(counts);
    });
  }, []);

  const handleApply = async () => {
    const rawCode = inputCode.trim().toUpperCase();
    if (!rawCode || isSubmitting) return;

    if (usedCodes.includes(rawCode)) {
      setStatusMessage({
        type: 'error',
        text: `Промокод «${rawCode}» уже был активирован на вашем аккаунте!`,
      });
      sound.playFail();
      return;
    }

    const promo = findPromoCode(rawCode);
    if (!promo) {
      setStatusMessage({
        type: 'error',
        text: 'Неверный или недействительный промокод. Проверьте правильность ввода!',
      });
      sound.playFail();
      return;
    }

    const currentUsed = usageCounts[rawCode] || 0;
    if (currentUsed >= promo.maxActivations) {
      setStatusMessage({
        type: 'error',
        text: `Лимит активаций этого промокода (${promo.maxActivations}/${promo.maxActivations}) уже исчерпан!`,
      });
      sound.playFail();
      return;
    }

    setIsSubmitting(true);
    try {
      const serverResult = await activatePromoCodeOnServer(userId, rawCode, promo.maxActivations);
      if (!serverResult.success) {
        setStatusMessage({
          type: 'error',
          text: serverResult.error || 'Ошибка активации промокода',
        });
        sound.playFail();
        return;
      }

      // Update local usage state
      setUsageCounts((prev) => ({
        ...prev,
        [rawCode]: (prev[rawCode] || 0) + 1,
      }));

      // Mark code as used
      setUsedCodes((prev) => [...prev, rawCode]);

      if (promo.type === 'gold') {
        onApplyBonus(promo.reward);
        setStatusMessage({
          type: 'success',
          text: `Успешно! На ваш баланс начислено +${promo.reward.toLocaleString('ru-RU')} Gold (${promo.label})!`,
        });
      } else if (promo.type === 'case') {
        if (onGrantCaseVoucher) {
          onGrantCaseVoucher(promo.caseId, promo.caseName);
        }
        setStatusMessage({
          type: 'success',
          text: `Успешно! Вам начислено бесплатное открытие кейса «${promo.caseName}»!`,
        });
      }

      sound.playWin(true);
      confetti({
        particleCount: 80,
        spread: 90,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#10b981', '#3b82f6', '#ec4899'],
      });
      setInputCode('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in select-none"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-[#0f1422] border-2 border-amber-500/40 rounded-3xl shadow-2xl p-5 sm:p-7 flex flex-col overflow-hidden"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white cursor-pointer transition shadow"
          aria-label="Закрыть"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3.5 mb-5 shrink-0">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 text-amber-400 flex items-center justify-center border border-amber-500/40 shadow-inner shrink-0">
            <Gift className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-xl text-white flex items-center gap-2">
              <span>Секретный промокод</span>
              <Sparkles className="w-4 h-4 text-amber-400" />
            </h3>
            <p className="text-xs text-slate-400">
              Введите ваш секретный код для получения Gold или кейсов
            </p>
          </div>
        </div>

        {/* Input form */}
        <div className="space-y-3 mb-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleApply();
                }}
                placeholder="ВВЕДИТЕ ПРОМОКОД"
                className="w-full bg-slate-900/90 border-2 border-slate-700 focus:border-amber-500 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 font-mono tracking-wider focus:outline-none transition shadow-inner font-bold"
                autoFocus
              />
              <KeyRound className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            </div>

            <button
              onClick={handleApply}
              disabled={isSubmitting || !inputCode.trim()}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-black text-xs uppercase cursor-pointer transition shadow-lg active:scale-95 shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Проверка...' : 'Применить'}
            </button>
          </div>

          {/* Status notice */}
          {statusMessage && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2.5 animate-fade-in ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              )}
              <span className="leading-relaxed font-semibold">{statusMessage.text}</span>
            </div>
          )}
        </div>

        {/* Secret Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-5 text-[11px]">
          <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800/80 flex flex-col justify-between">
            <div className="flex items-center gap-1.5 font-bold text-amber-300 mb-1">
              <Gift className="w-3.5 h-3.5" />
              <span>Бонусы и призы</span>
            </div>
            <p className="text-slate-400 leading-snug">
              Промокоды начисляют Gold на ваш баланс или дарят бесплатные открытия кейсов.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800/80 flex flex-col justify-between">
            <div className="flex items-center gap-1.5 font-bold text-cyan-300 mb-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Ограниченный лимит</span>
            </div>
            <p className="text-slate-400 leading-snug">
              Каждый секретный промокод имеет фиксированный лимит активаций. Успейте первыми!
            </p>
          </div>
        </div>

        {/* Activated Codes History */}
        <div className="border-t border-slate-800/80 pt-3.5 mb-4">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-2">
            <span>Активировано на этом аккаунте:</span>
            <span className="text-amber-400 font-mono font-bold">{usedCodes.length}</span>
          </div>

          {usedCodes.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto scrollbar-none pr-1">
              {usedCodes.map((code) => (
                <span
                  key={code}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[11px] font-mono font-semibold"
                >
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span>{code}</span>
                </span>
              ))}
            </div>
          ) : (
            <p className="text-[11px] text-slate-500 italic">
              Вы еще не активировали секретные промокоды на этом аккаунте.
            </p>
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span className="text-slate-500">GameVia Promo Engine</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-medium cursor-pointer transition text-xs"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};
