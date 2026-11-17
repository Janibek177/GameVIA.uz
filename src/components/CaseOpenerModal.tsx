import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { CaseDefinition, Skin, InventoryItem } from '../types';
import { rollCaseItem, calculateCaseStats, getAdjustedCaseDropWeight } from '../data/cases';
import { RARITY_CONFIG, getRarityConfig } from '../data/skins';
import { sound } from '../utils/audio';
import { WeaponIcon } from './WeaponIcon';
import { getCaseImageUrl } from '../data/weaponImages';
import { X, Sparkles, Zap, RotateCw, ShieldAlert, CheckCircle2, Package, Gift, AlertCircle, LogIn } from 'lucide-react';
import { findPromoCode } from '../data/promoCodes';
import { activatePromoCodeOnServer } from '../utils/api';
import { UserProfile } from './AuthModal';
import { Language, getCaseLocalizedName, getCaseLocalizedDesc } from '../utils/i18n';

interface CaseOpenerModalProps {
  caseDef: CaseDefinition;
  userBalance: number;
  onClose: () => void;
  onItemWon: (item: InventoryItem) => void;
  onDeductBalance: (amount: number) => void;
  onSellImmediately: (amount: number) => void;
  onNavigateToUpgrade: (item: InventoryItem) => void;
  freeVoucherCount?: number;
  onConsumeVoucher?: (caseId: string) => void;
  onGrantCaseVoucher?: (caseId: string, caseName: string) => void;
  onApplyBonus?: (amount: number) => void;
  usedCodes?: string[];
  setUsedCodes?: React.Dispatch<React.SetStateAction<string[]>>;
  currentUser?: UserProfile | null;
  lastDailyOpenTime?: number;
  onDailyCaseOpened?: () => void;
  lastTgOpenTime?: number;
  onTgCaseOpened?: () => void;
  isTgSubscribed?: boolean;
  onTgSubscribed?: () => void;
  onTgUnsubscribed?: () => void;
  language?: Language;
  onOpenAuth?: () => void;
}

const REEL_ITEMS_COUNT = 65;
const WINNING_INDEX = 55; // Reel lands around index 55
const DAILY_COOLDOWN_MS = 24 * 60 * 60 * 1000;

export const CaseOpenerModal: React.FC<CaseOpenerModalProps> = ({
  caseDef,
  userBalance,
  onClose,
  onItemWon,
  onDeductBalance,
  onSellImmediately,
  onNavigateToUpgrade,
  freeVoucherCount = 0,
  onConsumeVoucher,
  onGrantCaseVoucher,
  onApplyBonus,
  usedCodes = [],
  setUsedCodes,
  currentUser,
  lastDailyOpenTime = 0,
  onDailyCaseOpened,
  lastTgOpenTime = 0,
  onTgCaseOpened,
  isTgSubscribed = false,
  onTgSubscribed,
  onTgUnsubscribed,
  language = 'ru',
  onOpenAuth,
}) => {
  const [multiCount, setMultiCount] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [fastSpin, setFastSpin] = useState<boolean>(false);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [hasLanded, setHasLanded] = useState<boolean>(false);
  
  // Case promo code input state
  const [casePromoInput, setCasePromoInput] = useState<string>('');
  const [promoNotice, setPromoNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Reels data: array of item strips, one for each case opened
  const [reels, setReels] = useState<{ id: number; items: Skin[]; winner: Skin }[]>([]);
  const [wonItems, setWonItems] = useState<InventoryItem[]>([]);
  const [winningItem, setWinningItem] = useState<InventoryItem | null>(null);

  const reelContainerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const reelTrackRefs = useRef<(HTMLDivElement | null)[]>([]);
  const audioLastTickRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);

  const stats = calculateCaseStats(caseDef);
  const totalPrice = caseDef.price * multiCount;
  const hasVoucher = freeVoucherCount > 0 && multiCount === 1;
  const canAfford = hasVoucher || userBalance >= totalPrice;

  // Exact card dimensions to match CSS width + gap-2 (8px)
  const getCardMetrics = (count: number) => {
    if (count === 1) return { cardClass: 'w-[140px] h-[155px]', step: 148, size: 'md' as const };
    if (count === 2) return { cardClass: 'w-[116px] h-[118px]', step: 124, size: 'sm' as const };
    return { cardClass: 'w-[104px] h-[100px]', step: 112, size: 'sm' as const };
  };

  // Generate an individual reel item strip leading up to a predetermined winner
  const generateReelStrip = (predeterminedWinner: Skin) => {
    const list: Skin[] = [];
    for (let i = 0; i < REEL_ITEMS_COUNT; i++) {
      if (i === WINNING_INDEX) {
        list.push(predeterminedWinner);
      } else {
        list.push(rollCaseItem(caseDef));
      }
    }
    return list;
  };

  const [now, setNow] = useState<number>(Date.now());
  const [tgNotice, setTgNotice] = useState<string | null>(null);

  // 1-second interval for countdown timer if viewing daily case or tg case
  useEffect(() => {
    if (caseDef.id !== 'free_daily' && caseDef.id !== 'tg_subscribe_case') return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [caseDef.id]);

  const isDailyCase = caseDef.id === 'free_daily';
  const isTgCase = caseDef.id === 'tg_subscribe_case';

  // Lock multi-spin for special single cases
  useEffect(() => {
    if (isDailyCase || isTgCase) {
      setMultiCount(1);
    }
  }, [caseDef.id, isDailyCase, isTgCase]);

  // Daily cooldown calculations
  const dailyTimePassed = now - lastDailyOpenTime;
  const isDailyLocked = isDailyCase && lastDailyOpenTime > 0 && dailyTimePassed < DAILY_COOLDOWN_MS;
  const dailyRemainingMs = Math.max(0, DAILY_COOLDOWN_MS - dailyTimePassed);
  const remainingH = Math.floor(dailyRemainingMs / (1000 * 60 * 60));
  const remainingM = Math.floor((dailyRemainingMs % (1000 * 60 * 60)) / (1000 * 60));
  const remainingS = Math.floor((dailyRemainingMs % (1000 * 60)) / 1000);

  // Telegram case cooldown calculations (strictly 1 time every 24 hours)
  const tgTimePassed = now - lastTgOpenTime;
  const isTgCooldownLocked = isTgCase && lastTgOpenTime > 0 && tgTimePassed < DAILY_COOLDOWN_MS;
  const tgRemainingMs = Math.max(0, DAILY_COOLDOWN_MS - tgTimePassed);
  const tgRemainingH = Math.floor(tgRemainingMs / (1000 * 60 * 60));
  const tgRemainingM = Math.floor((tgRemainingMs % (1000 * 60 * 60)) / (1000 * 60));
  const tgRemainingS = Math.floor((tgRemainingMs % (1000 * 60)) / 1000);

  // Telegram lock (strictly locked if unsubscribed OR cooldown active)
  const isTgNotSubscribed = isTgCase && !isTgSubscribed;
  const isTgLocked = isTgCase && (isTgNotSubscribed || isTgCooldownLocked);

  const handleVerifyTgSubscription = () => {
    if (onTgSubscribed) {
      onTgSubscribed();
    }
    sound.playWin(true);
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#0ea5e9', '#38bdf8', '#ffffff'],
    });
    setTgNotice('🎉 Подписка на канал t.me/GameV1A успешно подтверждена! Кейс разблокирован.');
  };

  const setupInitialReels = (count: number) => {
    const newReels: { id: number; items: Skin[]; winner: Skin }[] = [];

    for (let i = 0; i < count; i++) {
      const winner = rollCaseItem(caseDef);
      newReels.push({
        id: i,
        winner,
        items: generateReelStrip(winner),
      });
    }
    setReels(newReels);
  };

  useEffect(() => {
    setupInitialReels(multiCount);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [caseDef, multiCount]);

  const handleApplyCasePromo = async () => {
    const rawCode = casePromoInput.trim().toUpperCase();
    if (!rawCode) return;

    if (usedCodes.includes(rawCode)) {
      setPromoNotice({ type: 'error', text: `Промокод «${rawCode}» уже был активирован на вашем аккаунте!` });
      sound.playFail();
      return;
    }

    const promo = findPromoCode(rawCode);
    if (!promo) {
      setPromoNotice({ type: 'error', text: 'Неверный или недействительный промокод.' });
      sound.playFail();
      return;
    }

    const userKey =
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

    const serverResult = await activatePromoCodeOnServer(userKey, rawCode, promo.maxActivations || 20);
    if (!serverResult.success) {
      setPromoNotice({ type: 'error', text: serverResult.error || 'Лимит активаций этого промокода (20/20) уже исчерпан!' });
      sound.playFail();
      return;
    }

    if (setUsedCodes) {
      setUsedCodes((prev) => [...prev, rawCode]);
    }

    if (promo.type === 'case') {
      if (onGrantCaseVoucher) {
        onGrantCaseVoucher(promo.caseId, promo.caseName);
      }
      if (promo.caseId === caseDef.id) {
        setPromoNotice({
          type: 'success',
          text: `🎉 Промокод активирован! Вам начислено 1 бесплатное открытие кейса «${caseDef.name}»!`,
        });
        setMultiCount(1);
      } else {
        setPromoNotice({
          type: 'success',
          text: `🎟️ Промокод активирован для кейса «${promo.caseName}»! Он сохранён в вашем профиле.`,
        });
      }
    } else if (promo.type === 'gold') {
      if (onApplyBonus) {
        onApplyBonus(promo.reward);
      }
      setPromoNotice({
        type: 'success',
        text: `💰 На ваш баланс начислено +${promo.reward} Gold!`,
      });
    }

    sound.playWin(true);
    confetti({
      particleCount: 65,
      spread: 75,
      origin: { y: 0.6 },
      colors: ['#f59e0b', '#10b981', '#3b82f6'],
    });
    setCasePromoInput('');
  };

  const handleStartSpin = () => {
    if (!currentUser) {
      if (onOpenAuth) onOpenAuth();
      return;
    }
    if (isSpinning || !canAfford || isDailyLocked || isTgLocked) return;

    if (isDailyCase && onDailyCaseOpened) {
      onDailyCaseOpened();
    }

    if (isTgCase && onTgCaseOpened) {
      onTgCaseOpened();
    }

    if (hasVoucher) {
      if (onConsumeVoucher) {
        onConsumeVoucher(caseDef.id);
      }
    } else {
      onDeductBalance(totalPrice);
    }

    setIsSpinning(true);
    setHasLanded(false);
    setWinningItem(null);
    setWonItems([]);

    sound.playOpen();

    // Roll fair, independent drops for each case based on authentic probabilities
    const rolls: InventoryItem[] = [];
    const newReels: { id: number; items: Skin[]; winner: Skin }[] = [];

    for (let m = 0; m < multiCount; m++) {
      const rolledSkin = rollCaseItem(caseDef);

      const inventoryEntry: InventoryItem = {
        ...rolledSkin,
        instanceId: `item-${Date.now()}-${m}-${Math.random().toString(36).substring(2, 7)}`,
        acquiredAt: Date.now(),
        fromCase: caseDef.name,
      };
      rolls.push(inventoryEntry);

      newReels.push({
        id: m,
        winner: rolledSkin,
        items: generateReelStrip(rolledSkin),
      });
    }

    setReels(newReels);

    // Reset transform positions for all tracks
    reelTrackRefs.current.forEach((track) => {
      if (track) {
        track.style.transition = 'none';
        track.style.transform = 'translateX(0px)';
      }
    });

    const { step } = getCardMetrics(multiCount);
    const duration = fastSpin ? 1100 : 5200;
    const stagger = fastSpin ? 80 : 200; // Distinct staggered finish for multi-case

    // Start tick audio
    const startTime = performance.now();
    let lastItemIndex = 0;

    const trackTicks = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      const currentPos = WINNING_INDEX * step * ease;

      const currentItemIndex = Math.floor(currentPos / step);
      if (currentItemIndex !== lastItemIndex && now - audioLastTickRef.current > 38) {
        sound.playTick();
        audioLastTickRef.current = now;
        lastItemIndex = currentItemIndex;
      }

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(trackTicks);
      }
    };

    animationFrameRef.current = requestAnimationFrame(trackTicks);

    // Animate each reel track with individual slight jitter and separate staggered timing
    setTimeout(() => {
      newReels.forEach((reel, idx) => {
        const track = reelTrackRefs.current[idx];
        const container = reelContainerRefs.current[idx];
        if (track && container) {
          const containerWidth = container.clientWidth || 700;
          const jitter = (Math.random() - 0.5) * 36;
          const targetOffset = WINNING_INDEX * step + step / 2 - containerWidth / 2 + jitter;
          const reelDuration = duration + idx * stagger;
          track.style.transition = `transform ${reelDuration}ms cubic-bezier(0.12, 0.82, 0.22, 1)`;
          track.style.transform = `translateX(-${targetOffset}px)`;
        }
      });
    }, 40);

    // On finish spinning
    const totalDuration = duration + (multiCount - 1) * stagger;
    setTimeout(() => {
      setIsSpinning(false);
      setHasLanded(true);
      setWinningItem(rolls[0]);
      setWonItems(rolls);

      // Check if any jackpot was won
      const hasJackpot = rolls.some(
        (it) => it.rarity === 'secret' || it.rarity === 'arcana' || it.rarity === 'legendary'
      );
      const bestRarity = rolls.reduce(
        (best, it) => (it.price > best.price ? it : best),
        rolls[0]
      );

      sound.playWin(bestRarity.rarity === 'secret' || bestRarity.rarity === 'arcana');

      if (hasJackpot) {
        confetti({
          particleCount: multiCount * 35,
          spread: 85,
          origin: { y: 0.6 },
          colors: ['#f59e0b', '#06b6d4', '#ec4899', '#ffffff'],
        });
      }
    }, totalDuration + 120);
  };

  // Sell ALL won items immediately - converts directly to balance, does NOT put in inventory!
  const handleSellNow = () => {
    const totalWonSum = wonItems.reduce((acc, it) => acc + it.price, 0);
    sound.playWin(false);
    onSellImmediately(totalWonSum);
    setHasLanded(false);
    setWinningItem(null);
    setWonItems([]);
  };

  // Keep ALL won items and add them to inventory
  const handleKeepAll = () => {
    wonItems.forEach((item) => onItemWon(item));
    setHasLanded(false);
    setWinningItem(null);
    setWonItems([]);
  };

  // Sell a single item from the won list
  const handleSellSingle = (itemToSell: InventoryItem) => {
    onSellImmediately(itemToSell.price);
    sound.playWin(false);
    const remaining = wonItems.filter((it) => it.instanceId !== itemToSell.instanceId);
    setWonItems(remaining);
    if (remaining.length === 0) {
      setHasLanded(false);
      setWinningItem(null);
    }
  };

  // Keep a single item: send it to inventory and remove from won screen
  const handleKeepSingle = (itemToKeep: InventoryItem) => {
    onItemWon(itemToKeep);
    const remaining = wonItems.filter((it) => it.instanceId !== itemToKeep.instanceId);
    setWonItems(remaining);
    if (remaining.length === 0) {
      setHasLanded(false);
      setWinningItem(null);
    }
  };

  const handleCloseModal = () => {
    // If modal is closed while victory screen has unclaimed items, keep them in inventory
    if (wonItems.length > 0) {
      wonItems.forEach((item) => onItemWon(item));
    }
    onClose();
  };

  const { cardClass, size: cardIconSize } = getCardMetrics(multiCount);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-[#0f1420] border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh]">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 border-b border-slate-800 bg-[#0a0e17]">
          <div className="flex items-center gap-3">
            <img
              src={getCaseImageUrl(caseDef)}
              alt={caseDef.name}
              className="w-10 h-10 object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-lg text-white font-display">
                  {getCaseLocalizedName(caseDef.id, caseDef.name, language)}
                </h2>
                {multiCount > 1 && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Мульти-открытие: {multiCount}x
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>
                  Стоимость одного: <strong className="text-amber-400">{caseDef.price === 0 ? 'Бесплатно' : `${caseDef.price} Acoin`}</strong>
                </span>
                <span>·</span>
                <span>RTP кейса: <strong className="text-slate-300">{stats.rtp}%</strong></span>
              </div>
            </div>
          </div>

          <button
            onClick={handleCloseModal}
            disabled={isSpinning}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition disabled:opacity-40 cursor-pointer"
            aria-label="Закрыть"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Roulette Arena */}
        <div className="p-4 sm:p-6 flex flex-col items-center justify-center bg-gradient-to-b from-[#0a0e17] via-[#0f1420] to-[#0a0e17] relative flex-1 overflow-y-auto">
          {/* Daily Cooldown Banner */}
          {!hasLanded && isDailyCase && (
            isDailyLocked ? (
              <div className="w-full mb-4 p-3.5 sm:p-4 rounded-2xl bg-amber-500/10 border border-amber-500/35 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
                <div className="flex items-center gap-3">
                  <span className="text-2xl shrink-0">⏳</span>
                  <div>
                    <div className="font-bold text-white text-sm flex items-center gap-2">
                      <span>Ежедневный кейс уже открыт сегодня</span>
                      <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-mono border border-amber-500/30">1 раз в 24 часа</span>
                    </div>
                    <div className="text-slate-300 text-xs mt-0.5">
                      По правилам платформы бесплатный ежедневный кейс можно открывать строго 1 раз в 24 часа для каждого игрока.
                    </div>
                  </div>
                </div>
                <div className="bg-black/70 px-4 py-2 rounded-xl border border-amber-500/40 text-center font-mono font-black text-amber-400 text-base shrink-0 tracking-wider shadow-inner">
                  {String(remainingH).padStart(2, '0')}:{String(remainingM).padStart(2, '0')}:{String(remainingS).padStart(2, '0')}
                </div>
              </div>
            ) : (
              <div className="w-full mb-3 p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-2">
                  <Gift className="w-4 h-4 text-emerald-400" />
                  <span>Ежедневный кейс готов к открытию! Вы можете забрать один бесплатный дроп за сегодня (1 раз в 24ч).</span>
                </div>
                <span className="text-[10px] font-mono bg-emerald-500/30 text-emerald-200 px-2 py-0.5 rounded">
                  Готов
                </span>
              </div>
            )
          )}

          {/* Telegram Channel Requirement Banner */}
          {!hasLanded && isTgCase && (
            !isTgSubscribed ? (
              <div className="w-full mb-4 p-4 rounded-2xl bg-gradient-to-r from-sky-950/80 via-[#0c192e] to-sky-950/80 border border-sky-500/50 shadow-xl">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-xl shrink-0 shadow-[0_0_15px_rgba(14,165,233,0.3)]">
                      📢
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-white text-sm sm:text-base">
                          Подпишитесь на Telegram-канал GameVia
                        </h3>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          ⚡ Авто-проверка
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-0.5">
                        Нажмите кнопку канала — подписка на <a href="https://t.me/GameV1A" target="_blank" rel="noopener noreferrer" onClick={handleVerifyTgSubscription} className="text-sky-400 font-bold hover:underline">t.me/GameV1A</a> подтвердится автоматически и разблокирует бесплатный кейс!
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0">
                    <a
                      href="https://t.me/GameV1A"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={handleVerifyTgSubscription}
                      className="flex-1 md:flex-none px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-black font-extrabold text-xs flex items-center justify-center gap-1.5 transition shadow-lg shadow-sky-500/25 cursor-pointer active:scale-95"
                    >
                      <span>👉 Перейти в канал (Авто)</span>
                    </a>
                    <button
                      type="button"
                      onClick={handleVerifyTgSubscription}
                      className="flex-1 md:flex-none px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs flex items-center justify-center gap-1.5 transition shadow-lg shadow-emerald-500/25 cursor-pointer active:scale-95"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Подтвердить авто</span>
                    </button>
                  </div>
                </div>

                {tgNotice && (
                  <div className="mt-2.5 p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-fade-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{tgNotice}</span>
                  </div>
                )}
              </div>
            ) : isTgCooldownLocked ? (
              <div className="w-full mb-3 p-4 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs shadow-lg space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 font-bold text-sm text-white">
                    <span className="text-lg">⏳</span>
                    <span>Вы уже открывали Telegram-кейс сегодня!</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    1 раз в 24 часа
                  </span>
                </div>
                <p className="text-slate-300">
                  Следующее бесплатное открытие станет доступно через: <b className="text-amber-400 font-mono text-sm">{String(tgRemainingH).padStart(2, '0')}:{String(tgRemainingM).padStart(2, '0')}:{String(tgRemainingS).padStart(2, '0')}</b>
                </p>
                <div className="flex items-center justify-between pt-1 border-t border-amber-500/20 text-[11px]">
                  <span className="text-slate-400">Канал подписки: <a href="https://t.me/GameV1A" target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:underline">t.me/GameV1A</a></span>
                  {onTgUnsubscribed && (
                    <button
                      type="button"
                      onClick={() => {
                        onTgUnsubscribed();
                        setTgNotice(null);
                      }}
                      className="text-slate-400 hover:text-rose-400 underline cursor-pointer"
                    >
                      Отписались? Проверить подписку заново
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="w-full mb-3 p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Подписка на <b>t.me/GameV1A</b> активна! Кейс разблокирован (доступен 1 раз в 24ч) — можно открывать.</span>
                </div>
                <div className="flex items-center gap-2.5 text-[11px] shrink-0">
                  <a
                    href="https://t.me/GameV1A"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sky-400 hover:underline"
                  >
                    Канал @GameV1A →
                  </a>
                  {onTgUnsubscribed && (
                    <button
                      type="button"
                      onClick={() => {
                        onTgUnsubscribed();
                        setTgNotice(null);
                      }}
                      className="text-slate-400 hover:text-rose-400 underline cursor-pointer"
                    >
                      (Отписался)
                    </button>
                  )}
                </div>
              </div>
            )
          )}

          {/* If spinning or ready to spin: render the reels */}
          {!hasLanded && (
            <div className={`w-full flex flex-col gap-2.5 ${multiCount >= 3 ? 'max-h-[390px] overflow-y-auto pr-1' : ''}`}>
              {reels.map((reel, rIdx) => {
                const isSingle = multiCount === 1;
                const reelHeight = isSingle ? 'h-44' : multiCount === 2 ? 'h-32' : 'h-28';

                return (
                  <div key={reel.id} className="w-full relative">
                    {/* Header tag for multi reels */}
                    {!isSingle && (
                      <div className="flex items-center justify-between mb-1 px-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-mono font-bold text-amber-400 flex items-center gap-1">
                            <Package className="w-3 h-3 text-amber-400" />
                            Кейс #{rIdx + 1}
                          </span>
                          <span className="text-[9px] font-mono text-cyan-300 bg-cyan-950/40 px-1.5 py-0.5 rounded border border-cyan-800/40">
                            Отдельный слот дропа
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {isSpinning ? 'Вращается...' : 'Готов к открытию'}
                        </span>
                      </div>
                    )}

                    {/* Reel Box */}
                    <div
                      ref={(el) => { reelContainerRefs.current[rIdx] = el; }}
                      className={`w-full relative ${reelHeight} overflow-hidden rounded-xl border border-slate-700/80 bg-[#070a10] shadow-inner flex items-center`}
                    >
                      {/* Center Pointer / Cursor (Yellow indicator line) */}
                      <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-1 bg-amber-400 z-30 pointer-events-none shadow-[0_0_12px_#fbbf24]">
                        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-0 h-0 border-x-[7px] border-x-transparent border-t-[9px] border-t-amber-400" />
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-x-[7px] border-x-transparent border-b-[9px] border-b-amber-400" />
                      </div>

                      {/* Gradient shadow edges */}
                      <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-[#070a10] to-transparent z-20 pointer-events-none" />
                      <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-[#070a10] to-transparent z-20 pointer-events-none" />

                      {/* Scrolling Track */}
                      <div
                        ref={(el) => { reelTrackRefs.current[rIdx] = el; }}
                        className="flex items-center gap-2 px-4 will-change-transform"
                        style={{ transform: 'translateX(0px)' }}
                      >
                        {reel.items.map((skin, idx) => {
                          const rarity = getRarityConfig(skin?.rarity);
                          return (
                            <div
                              key={`${skin.id}-${rIdx}-${idx}`}
                              className={`${cardClass} shrink-0 rounded-lg bg-[#111724] border border-slate-800 flex flex-col items-center justify-between p-1.5 relative group overflow-hidden select-none`}
                              style={{ borderBottom: `2.5px solid ${rarity.color}` }}
                            >
                              <div className="text-[9px] text-slate-400 font-mono self-start truncate w-full">
                                {skin.weapon}
                              </div>

                              <div className="my-auto py-0.5">
                                <WeaponIcon skin={skin} size={cardIconSize} showGlow={false} />
                              </div>

                              <div className="w-full text-center">
                                <div className="text-[10px] font-bold truncate" style={{ color: rarity.color }}>
                                  {skin.skinName}
                                </div>
                                <div className="text-[9px] font-mono text-amber-400/90">
                                  {skin.price.toLocaleString('ru-RU')} AC
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Won Items Showcase (Appears when spin finishes) */}
          {hasLanded && wonItems.length > 0 && (
            <div className="w-full animate-fade-in space-y-4">
              {/* Header result */}
              <div className="p-4 rounded-2xl bg-[#141b29] border border-amber-500/40 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                      Дроп получен ({wonItems.length} {wonItems.length === 1 ? 'предмет' : 'разных предмета'})
                    </span>
                  </div>
                  <div className="text-2xl font-black font-mono text-white mt-1">
                    Общая стоимость: +{wonItems.reduce((acc, it) => acc + it.price, 0).toLocaleString('ru-RU')} Acoin
                  </div>
                </div>

                {/* Sell All / Keep Buttons */}
                <div className="flex items-center gap-2.5 w-full sm:w-auto">
                  <button
                    onClick={handleSellNow}
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-amber-200 text-xs font-bold border border-slate-700 hover:border-amber-500/50 transition cursor-pointer"
                  >
                    💰 Продать всё (+{wonItems.reduce((acc, it) => acc + it.price, 0).toLocaleString('ru-RU')} AC)
                  </button>

                  <button
                    onClick={handleKeepAll}
                    className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-extrabold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-lg shadow-amber-500/20"
                  >
                    <RotateCw className="w-4 h-4" />
                    <span>Оставить в инвентаре</span>
                  </button>
                </div>
              </div>

              {/* Grid of all dropped items */}
              <div className={`grid gap-3 ${wonItems.length === 1 ? 'grid-cols-1 max-w-md mx-auto' : wonItems.length === 2 ? 'grid-cols-2' : wonItems.length === 3 ? 'grid-cols-3' : wonItems.length === 4 ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-2 sm:grid-cols-5'}`}>
                {wonItems.map((item, idx) => {
                  const winRarity = getRarityConfig(item?.rarity);
                  return (
                    <div
                      key={item.instanceId || idx}
                      className="rounded-2xl bg-[#111726] border p-3 flex flex-col items-center justify-between text-center relative group shadow-md"
                      style={{
                        borderColor: `${winRarity.color}50`,
                        background: `radial-gradient(circle at 50% 30%, ${winRarity.color}15 0%, #0d121c 85%)`,
                      }}
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <span className="text-[9px] font-mono font-bold text-amber-400 bg-black/60 px-1.5 py-0.5 rounded border border-slate-800">
                          Кейс #{idx + 1}
                        </span>
                        <span className="text-[9px] font-mono text-slate-400">[{item.wear}]</span>
                      </div>

                      <div className="my-2">
                        <WeaponIcon skin={item} size={wonItems.length > 2 ? 'md' : 'lg'} />
                      </div>

                      <div className="w-full">
                        <span
                          className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded inline-block mb-1"
                          style={{
                            backgroundColor: `${winRarity.color}25`,
                            color: winRarity.color,
                          }}
                        >
                          {winRarity.label}
                        </span>
                        <h4 className="text-xs font-bold text-white truncate w-full">
                          {item.name}
                        </h4>
                        <div className="text-sm font-mono font-extrabold text-amber-400 mt-1">
                          {item.price.toLocaleString('ru-RU')} AC
                        </div>
                      </div>

                      <div className="w-full mt-2 pt-2 border-t border-slate-800/80 flex flex-col gap-1.5">
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleSellSingle(item)}
                            className="flex-1 py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-[10px] font-bold transition cursor-pointer"
                          >
                            Продать (+{item.price} AC)
                          </button>
                          <button
                            onClick={() => handleKeepSingle(item)}
                            className="flex-1 py-1.5 px-2 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold transition cursor-pointer"
                          >
                            Забрать
                          </button>
                        </div>
                        <button
                          onClick={() => {
                            // First register to inventory so upgrade can find it
                            onItemWon(item);
                            onNavigateToUpgrade(item);
                          }}
                          className="w-full py-1 px-2 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 text-[10px] font-semibold flex items-center justify-center gap-1 transition cursor-pointer"
                        >
                          <Zap className="w-3 h-3 text-purple-400" />
                          <span>В Апгрейд</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Free voucher banner */}
          {freeVoucherCount > 0 && !hasLanded && (
            <div className="mt-3 p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center justify-between gap-3 animate-fade-in shadow-lg shadow-emerald-500/10">
              <div className="flex items-center gap-2">
                <Gift className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>У вас есть <b>{freeVoucherCount}</b> бесплатное открытие этого кейса по промокоду!</span>
              </div>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/30 text-emerald-200">
                100% Free
              </span>
            </div>
          )}

          {/* Controls Bar */}
          {!hasLanded && (
            <div className="mt-5 flex flex-wrap items-center justify-between gap-4 w-full pt-3 border-t border-slate-800/80">
              {/* Multi-spin toggle (1, 2, 3, 4, 5) - hidden for daily and tg single cases */}
              {!isDailyCase && !isTgCase ? (
                <div className="flex items-center gap-1.5 bg-[#121824] p-1 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-400 px-2 font-medium">Кейсов:</span>
                  {([1, 2, 3, 4, 5] as const).map((cnt) => (
                    <button
                      key={cnt}
                      disabled={isSpinning}
                      onClick={() => setMultiCount(cnt)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                        multiCount === cnt
                          ? 'bg-amber-500 text-black shadow-md'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      x{cnt}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#121824] border border-slate-800 text-xs">
                  <span className="text-amber-400 font-bold">1 открытие</span>
                  <span className="text-[10px] text-slate-400">({isDailyCase ? '1 раз в 24 часа' : 'Бонус Telegram'})</span>
                </div>
              )}

              {/* Fast Spin Checkbox */}
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={fastSpin}
                  onChange={(e) => setFastSpin(e.target.checked)}
                  disabled={isSpinning}
                  className="rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-0 cursor-pointer"
                />
                <span>Быстрое открытие (Fast)</span>
              </label>

              {/* Big Open Button */}
              {!currentUser ? (
                <button
                  type="button"
                  onClick={() => onOpenAuth?.()}
                  className="py-3.5 px-8 rounded-xl font-extrabold text-base flex items-center justify-center gap-2 shadow-lg bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:from-amber-400 hover:to-orange-400 text-black shadow-amber-500/25 active:scale-95 cursor-pointer uppercase tracking-wide"
                >
                  <LogIn className="w-5 h-5" />
                  <span>ВОЙДИТЕ В АККАУНТ ДЛЯ ОТКРЫТИЯ</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    if (isTgNotSubscribed) {
                      handleVerifyTgSubscription();
                      return;
                    }
                    handleStartSpin();
                  }}
                  disabled={isSpinning || !canAfford || isDailyLocked || (isTgCase && isTgCooldownLocked)}
                  className={`py-3 px-8 rounded-xl font-extrabold text-base flex items-center justify-center gap-2 shadow-lg transition cursor-pointer ${
                    isSpinning
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : isDailyLocked || isTgCooldownLocked
                      ? 'bg-slate-800 text-amber-400 border border-amber-500/40 cursor-not-allowed'
                      : isTgNotSubscribed
                      ? 'bg-gradient-to-r from-sky-500 via-blue-500 to-emerald-500 hover:from-sky-400 hover:to-emerald-400 text-black shadow-sky-500/30 active:scale-95 animate-pulse'
                      : hasVoucher
                      ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 hover:from-emerald-400 hover:to-teal-300 text-black shadow-emerald-500/30 active:scale-95 animate-pulse'
                      : canAfford
                      ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:from-amber-400 hover:to-orange-400 text-black shadow-amber-500/25 active:scale-95'
                      : 'bg-red-950/40 text-red-400 border border-red-500/30'
                  }`}
                >
                {isSpinning ? (
                  <>
                    <RotateCw className="w-5 h-5 animate-spin" />
                    <span>Открывается ({multiCount} шт)...</span>
                  </>
                ) : isDailyLocked ? (
                  <>
                    <span>⏳</span>
                    <span>ДОСТУПЕН ЧЕРЕЗ {String(remainingH).padStart(2, '0')}:{String(remainingM).padStart(2, '0')}:{String(remainingS).padStart(2, '0')}</span>
                  </>
                ) : isTgCooldownLocked ? (
                  <>
                    <span>⏳</span>
                    <span>ДОСТУПЕН ЧЕРЕЗ {String(tgRemainingH).padStart(2, '0')}:{String(tgRemainingM).padStart(2, '0')}:{String(tgRemainingS).padStart(2, '0')}</span>
                  </>
                ) : isTgNotSubscribed ? (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>⚡ ПОДТВЕРДИТЬ ПОДПИСКУ И РАЗБЛОКИРОВАТЬ</span>
                  </>
                ) : hasVoucher ? (
                  <>
                    <Gift className="w-5 h-5" />
                    <span>ОТКРЫТЬ БЕСПЛАТНО (ПО ПРОМОКОДУ)</span>
                  </>
                ) : isDailyCase ? (
                  <>
                    <Gift className="w-5 h-5" />
                    <span>ОТКРЫТЬ ЕЖЕДНЕВНЫЙ КЕЙС БЕСПЛАТНО</span>
                  </>
                ) : isTgCase ? (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>ОТКРЫТЬ БОНУС TELEGRAM (1 РАЗ В 24Ч)</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>
                      {totalPrice === 0
                        ? 'ОТКРЫТЬ БЕСПЛАТНО'
                        : `ОТКРЫТЬ ${multiCount > 1 ? `(${multiCount} КЕЙСА)` : ''} ЗА ${totalPrice.toLocaleString('ru-RU')} Acoin`}
                    </span>
                  </>
                )}
              </button>
            )}
          </div>
          )}

          {/* Promo code entry box directly in case */}
          {!hasLanded && !isSpinning && (
            <div className="mt-4 p-3.5 rounded-2xl bg-[#0b0f19] border border-slate-800/90 shadow-inner">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-bold shrink-0">
                    🎟️
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">Есть промокод на кейс?</span>
                    <span className="text-[10px] text-slate-400">Введите промокод для бесплатного открытия</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={casePromoInput}
                    onChange={(e) => setCasePromoInput(e.target.value.toUpperCase())}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleApplyCasePromo();
                    }}
                    placeholder="Например: FREE-STUDENT"
                    className="w-48 sm:w-56 bg-slate-900 border border-slate-700 focus:border-amber-500 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 font-mono focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCasePromo}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs uppercase cursor-pointer transition shadow active:scale-95 shrink-0"
                  >
                    Ввести
                  </button>
                </div>
              </div>

              {promoNotice && (
                <div
                  className={`mt-2.5 p-2 rounded-xl text-[11px] font-semibold flex items-center gap-2 animate-fade-in ${
                    promoNotice.type === 'success'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  }`}
                >
                  {promoNotice.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  )}
                  <span>{promoNotice.text}</span>
                </div>
              )}
            </div>
          )}

          {!canAfford && !isSpinning && !hasLanded && (
            <p className="mt-2 text-xs text-red-400 flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5" />
              Недостаточно средств. Пополните виртуальный баланс или введите промокод на кейс выше.
            </p>
          )}
        </div>

        {/* Items Contained in This Case Preview Grid */}
        <div className="px-5 sm:px-6 py-4 border-t border-slate-800/80 bg-[#0d121c] overflow-y-auto max-h-52">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Содержимое кейса ({caseDef.items.length} скинов)
            </h4>
            <span className="text-[11px] text-slate-400">
              Шансы сбалансированы GameVia (возможен любой дроп)
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
            {(() => {
              const adjustedItems = caseDef.items.map((it) => ({
                skin: it.skin,
                weight: getAdjustedCaseDropWeight(it.skin.price, caseDef.price, it.weight),
              }));
              const totalWeight = adjustedItems.reduce((s, it) => s + it.weight, 0);

              return adjustedItems.map(({ skin, weight }, idx) => {
                const dropPercent = ((weight / totalWeight) * 100).toFixed(weight / totalWeight < 0.01 ? 2 : 1);
                const rarity = getRarityConfig(skin?.rarity);

                return (
                  <div
                    key={`${skin.id}-${idx}`}
                    className="rounded-lg bg-[#111724] border border-slate-800 p-2 flex flex-col items-center justify-between text-center relative group"
                    style={{ borderBottom: `2px solid ${rarity.color}` }}
                  >
                    <div className="text-[9px] text-slate-400 w-full truncate">
                      {skin.weapon}
                    </div>
                    <div className="my-1">
                      <WeaponIcon skin={skin} size="sm" showGlow={false} />
                    </div>
                    <div className="w-full truncate text-[10px] font-semibold" style={{ color: rarity.color }}>
                      {skin.skinName}
                    </div>
                    <div className="flex items-center justify-between w-full mt-1 text-[9px]">
                      <span className="text-amber-400 font-mono">{skin.price} AC</span>
                      <span className="text-slate-400">{dropPercent}%</span>
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </div>
      </div>
    </div>
  );
};
