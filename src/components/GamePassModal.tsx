import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { sound } from '../utils/audio';
import { InventoryItem, Skin } from '../types';
import { getSkinById } from '../data/skins';
import { WeaponIcon } from './WeaponIcon';
import {
  buyVipPass,
  saveUserAccountState,
  fetchUserAccountState,
  createGoldOrder,
  uploadOrderReceipt,
  fetchOrder,
} from '../utils/api';
import { UserProfile } from './AuthModal';
import {
  X,
  Sparkles,
  Trophy,
  CheckCircle2,
  Lock,
  Crown,
  Flame,
  ArrowRight,
  Gift,
  Coins,
  ShieldAlert,
  ChevronRight,
  Layers,
  Rocket,
  Bomb,
  Zap,
  AlertCircle,
  CreditCard,
  PlusCircle,
  Clock,
  Star,
  Info,
  Copy,
  Check,
  Send,
  Upload,
} from 'lucide-react';
import { Language, t } from '../utils/i18n';

interface GamePassModalProps {
  isOpen: boolean;
  onClose: () => void;
  userBalance: number;
  onDeductBalance: (amount: number) => void;
  onAddBalance: (amount: number) => void;
  onWinItem: (item: InventoryItem) => void;
  onNavigateToTab?: (tab: string) => void;
  onOpenTopUp?: () => void;
  currentUser?: UserProfile | null;
  language?: Language;
}

export interface PassQuest {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  xpReward: number;
  completed: boolean;
  claimed: boolean;
  gameTab: string;
  icon: string;
}

export interface PassTier {
  level: number;
  xpRequired: number;
  freeReward: {
    type: 'acoin' | 'skin';
    amount?: number;
    skinId?: string;
    label: string;
  };
  premiumReward: {
    type: 'acoin' | 'skin';
    amount?: number;
    skinId?: string;
    label: string;
  };
}

export const PASS_TIERS: PassTier[] = [
  {
    level: 1,
    xpRequired: 100,
    freeReward: { type: 'acoin', amount: 50, label: '+50 Gold' },
    premiumReward: { type: 'acoin', amount: 150, label: '+150 Gold VIP' },
  },
  {
    level: 2,
    xpRequired: 220,
    freeReward: { type: 'skin', skinId: 'p250_sanddune', label: 'P250 | Песчаная буря' },
    premiumReward: { type: 'skin', skinId: 'glock_warhawk', label: 'Glock-18 | Ястреб' },
  },
  {
    level: 3,
    xpRequired: 360,
    freeReward: { type: 'acoin', amount: 80, label: '+80 Gold' },
    premiumReward: { type: 'acoin', amount: 220, label: '+220 Gold VIP' },
  },
  {
    level: 4,
    xpRequired: 520,
    freeReward: { type: 'skin', skinId: 'galil_cold', label: 'Galil AR | Сигнал льда' },
    premiumReward: { type: 'skin', skinId: 'usp_lead', label: 'USP-S | Проводник' },
  },
  {
    level: 5,
    xpRequired: 700,
    freeReward: { type: 'acoin', amount: 120, label: '+120 Gold' },
    premiumReward: { type: 'skin', skinId: 'deagle_oxide', label: 'Desert Eagle | Оксидное пламя' },
  },
  {
    level: 6,
    xpRequired: 900,
    freeReward: { type: 'skin', skinId: 'mag7_firecore', label: 'MAG-7 | Пламенный след' },
    premiumReward: { type: 'acoin', amount: 350, label: '+350 Gold VIP' },
  },
  {
    level: 7,
    xpRequired: 1120,
    freeReward: { type: 'acoin', amount: 160, label: '+160 Gold' },
    premiumReward: { type: 'skin', skinId: 'm4a4_evil', label: 'M4A4 | Злобный даймё' },
  },
  {
    level: 8,
    xpRequired: 1360,
    freeReward: { type: 'skin', skinId: 'mp9_starlight', label: 'MP9 | Скромный блеск' },
    premiumReward: { type: 'acoin', amount: 450, label: '+450 Gold VIP' },
  },
  {
    level: 9,
    xpRequired: 1620,
    freeReward: { type: 'acoin', amount: 220, label: '+220 Gold' },
    premiumReward: { type: 'skin', skinId: 'awp_atheris', label: 'AWP | Древесная гадюка' },
  },
  {
    level: 10,
    xpRequired: 1900,
    freeReward: { type: 'skin', skinId: 'sg553_aerial', label: 'SG 553 | Полёт дракона' },
    premiumReward: { type: 'skin', skinId: 'usp_cortex', label: 'USP-S | Извилины (Cortex)' },
  },
  {
    level: 12,
    xpRequired: 2400,
    freeReward: { type: 'acoin', amount: 300, label: '+300 Gold' },
    premiumReward: { type: 'acoin', amount: 600, label: '+600 Gold VIP' },
  },
  {
    level: 14,
    xpRequired: 2900,
    freeReward: { type: 'acoin', amount: 380, label: '+380 Gold' },
    premiumReward: { type: 'skin', skinId: 'ak47_phantom', label: 'AK-47 | Фантомный вредитель' },
  },
  {
    level: 16,
    xpRequired: 3500,
    freeReward: { type: 'skin', skinId: 'glock_water', label: 'Glock-18 | Водяной элементаль' },
    premiumReward: { type: 'acoin', amount: 750, label: '+750 Gold VIP' },
  },
  {
    level: 18,
    xpRequired: 4200,
    freeReward: { type: 'acoin', amount: 500, label: '+500 Gold' },
    premiumReward: { type: 'acoin', amount: 900, label: '+900 Gold VIP' },
  },
  {
    level: 20,
    xpRequired: 5000,
    freeReward: { type: 'acoin', amount: 650, label: '+650 Gold' },
    premiumReward: { type: 'skin', skinId: 'ak47_redline', label: 'AK-47 | Красная линия' },
  },
];

const INITIAL_QUESTS: PassQuest[] = [
  {
    id: 'q_open_cases',
    title: 'Кейс-мастер',
    description: 'Откройте любые 2 кейса на GameVia',
    target: 2,
    current: 1,
    xpReward: 150,
    completed: false,
    claimed: false,
    gameTab: 'cases',
    icon: 'flame',
  },
  {
    id: 'q_upgrade',
    title: 'Мастер Апгрейда',
    description: 'Сделайте 1 удачный апгрейд оружия или Gold',
    target: 1,
    current: 0,
    xpReward: 160,
    completed: false,
    claimed: false,
    gameTab: 'upgrade',
    icon: 'zap',
  },
  {
    id: 'q_stairs',
    title: 'Вершина Лесенки',
    description: 'Пройдите хотя бы 3 ступени в мини-игре «Лесенка»',
    target: 3,
    current: 0,
    xpReward: 150,
    completed: false,
    claimed: false,
    gameTab: 'stairs',
    icon: 'ladder',
  },
  {
    id: 'q_crash',
    title: 'Космический взлёт',
    description: 'Заберите выигрыш в Краше с коэффициентом от 2.00x',
    target: 1,
    current: 0,
    xpReward: 180,
    completed: false,
    claimed: false,
    gameTab: 'crash',
    icon: 'rocket',
  },
  {
    id: 'q_mines',
    title: 'Сапёр-эксперт',
    description: 'Откройте 4 алмаза без подрыва в режиме «Мины»',
    target: 4,
    current: 0,
    xpReward: 140,
    completed: false,
    claimed: false,
    gameTab: 'mines',
    icon: 'bomb',
  },
  {
    id: 'q_tower',
    title: 'Цитадель Башни',
    description: 'Поднимитесь на 3 этажа в режиме «Башня»',
    target: 3,
    current: 0,
    xpReward: 150,
    completed: false,
    claimed: false,
    gameTab: 'tower',
    icon: 'layers',
  },
  {
    id: 'q_contract',
    title: 'Крафтер скинов',
    description: 'Создайте 1 контракт обмена из скинов',
    target: 1,
    current: 0,
    xpReward: 190,
    completed: false,
    claimed: false,
    gameTab: 'contract',
    icon: 'sparkles',
  },
];

export const GamePassModal: React.FC<GamePassModalProps> = ({
  isOpen,
  onClose,
  userBalance,
  onDeductBalance,
  onAddBalance,
  onWinItem,
  onNavigateToTab,
  onOpenTopUp,
  currentUser,
  language = 'ru',
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'rewards' | 'quests'>('rewards');

  // Account key for per-user pass persistence
  const userKey = useMemo(() => {
    return currentUser?.uid || currentUser?.email || 'guest';
  }, [currentUser]);

  // Load pass state for current user
  const [currentXp, setCurrentXp] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(`gamevia_acc_${userKey}_pass`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.currentXp === 'number') return parsed.currentXp;
      }
    } catch {}
    return 300;
  });

  const [isPremium, setIsPremium] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(`gamevia_acc_${userKey}_pass`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.isPremium === 'boolean') return parsed.isPremium;
      }
    } catch {}
    return false;
  });

  const [claimedFreeTiers, setClaimedFreeTiers] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem(`gamevia_acc_${userKey}_pass`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.claimedFreeTiers)) return parsed.claimedFreeTiers;
      }
    } catch {}
    return [1];
  });

  const [claimedPremiumTiers, setClaimedPremiumTiers] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem(`gamevia_acc_${userKey}_pass`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.claimedPremiumTiers)) return parsed.claimedPremiumTiers;
      }
    } catch {}
    return [];
  });

  const [quests, setQuests] = useState<PassQuest[]>(() => {
    try {
      const saved = localStorage.getItem(`gamevia_acc_${userKey}_pass`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.quests) && parsed.quests.length > 0) return parsed.quests;
      }
    } catch {}
    return INITIAL_QUESTS;
  });

  // Re-sync when switching accounts or opening modal
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`gamevia_acc_${userKey}_pass`);
      if (saved) {
        const p = JSON.parse(saved);
        if (typeof p.currentXp === 'number') setCurrentXp(p.currentXp);
        if (typeof p.isPremium === 'boolean') setIsPremium(p.isPremium);
        if (Array.isArray(p.claimedFreeTiers)) setClaimedFreeTiers(p.claimedFreeTiers);
        if (Array.isArray(p.claimedPremiumTiers)) setClaimedPremiumTiers(p.claimedPremiumTiers);
        if (Array.isArray(p.quests)) setQuests(p.quests);
      } else {
        // Reset to initial for guest or clean account
        setCurrentXp(currentUser ? 300 : 150);
        setIsPremium(false);
        setClaimedFreeTiers([1]);
        setClaimedPremiumTiers([]);
        setQuests(INITIAL_QUESTS);
      }
    } catch {}
  }, [userKey, isOpen]);

  // Persist pass state locally and on server
  useEffect(() => {
    const passState = {
      currentXp,
      isPremium,
      claimedFreeTiers,
      claimedPremiumTiers,
      quests,
    };
    try {
      localStorage.setItem(`gamevia_acc_${userKey}_pass`, JSON.stringify(passState));
    } catch {}

    if (currentUser && userKey !== 'guest') {
      saveUserAccountState(userKey, { passState });
    }
  }, [currentXp, isPremium, claimedFreeTiers, claimedPremiumTiers, quests, userKey, currentUser]);

  // Listen for background activation event from App.tsx polling
  useEffect(() => {
    const handlePassActivated = (e: any) => {
      const detail = e.detail;
      if (detail && detail.isPremium) {
        setIsPremium(true);
        if (typeof detail.currentXp === 'number') {
          setCurrentXp(detail.currentXp);
        }
      }
    };
    window.addEventListener('gamevia_pass_activated', handlePassActivated);
    return () => window.removeEventListener('gamevia_pass_activated', handlePassActivated);
  }, []);

  // Pass Purchase Modal State - Multi-step Flow matching TopUpModal
  const [isBuyModalOpen, setIsBuyModalOpen] = useState<boolean>(false);
  const [buyStep, setBuyStep] = useState<'select' | 'payment' | 'receipt' | 'status'>('select');
  const [selectedPackage, setSelectedPackage] = useState<'standard' | 'bundle' | 'level'>('standard');
  const [payCurrency, setPayCurrency] = useState<'RUB' | 'UZS'>('RUB');
  const [currentPassOrder, setCurrentPassOrder] = useState<any | null>(null);
  const [receiptBase64, setReceiptBase64] = useState<string | null>(null);
  const [receiptFileName, setReceiptFileName] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [receiptError, setReceiptError] = useState<string | null>(null);
  const [copiedCard, setCopiedCard] = useState<string | null>(null);

  const handleCopyCard = (num: string, label: string) => {
    navigator.clipboard?.writeText(num.replace(/\s+/g, ''));
    setCopiedCard(label);
    sound.playTick();
    setTimeout(() => setCopiedCard(null), 2000);
  };

  // Step 1: Create VIP Order on Server
  const handleCreatePassOrder = async (type: 'standard' | 'bundle' | 'level') => {
    setIsSubmitting(true);
    setReceiptError(null);
    sound.playTick();

    const packageTitles = {
      standard: '👑 VIP Pass (Сезон 1)',
      bundle: '⚡ VIP Pass + 10 Уровней',
      level: '📈 +1 Уровень GameVia Pass',
    };

    try {
      const order = await createGoldOrder({
        userId: userKey,
        username: currentUser?.name || 'Игрок GameVia',
        userEmail: currentUser?.email,
        goldAmount: 0,
        currency: payCurrency,
        orderType: 'VIP_PASS',
        productType: type as any,
        title: packageTitles[type],
      });

      setCurrentPassOrder(order);
      setBuyStep('payment');
    } catch (err: any) {
      setReceiptError(err.message || 'Ошибка создания заказа');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 2 -> 3: File Selection for Receipt
  const handleReceiptFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setReceiptError('Поддерживаются только изображения чеков (JPG, PNG, WEBP)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setReceiptError('Размер чека не должен превышать 5 МБ');
      return;
    }

    setReceiptError(null);
    setReceiptFileName(file.name);

    const reader = new FileReader();
    reader.onload = () => {
      setReceiptBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Step 3 -> 4: Submit Receipt to Server and Telegram Bot
  const handleSubmitPassReceipt = async () => {
    if (!currentPassOrder || !receiptBase64) {
      setReceiptError('Пожалуйста, прикрепите чек оплаты перед отправкой');
      return;
    }

    setIsSubmitting(true);
    setReceiptError(null);
    sound.playTick();

    try {
      const updated = await uploadOrderReceipt(currentPassOrder.id, receiptBase64);
      setCurrentPassOrder(updated);
      setBuyStep('status');
      sound.playOpen();
    } catch (err: any) {
      setReceiptError(err.message || 'Ошибка отправки чека');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Polling order status while in PENDING_REVIEW or PENDING_PAYMENT
  useEffect(() => {
    if (!currentPassOrder || currentPassOrder.status === 'APPROVED' || currentPassOrder.status === 'REJECTED') {
      return;
    }

    const interval = setInterval(async () => {
      try {
        const updated = await fetchOrder(currentPassOrder.id);
        if (updated) {
          setCurrentPassOrder(updated);

          if (updated.status === 'APPROVED') {
            setIsPremium(true);
            if (updated.productType === 'bundle' || updated.productType === 'vip_bundle_10') {
              setCurrentXp((prev) => prev + 1900);
            } else if (updated.productType === 'level' || updated.productType === 'level_boost') {
              setCurrentXp((prev) => prev + 300);
            }
            sound.playWin(true);
            confetti({
              particleCount: 140,
              spread: 90,
              origin: { y: 0.5 },
              colors: ['#f59e0b', '#fbbf24', '#ffffff', '#10b981'],
            });
          } else if (updated.status === 'REJECTED') {
            sound.playFail();
          }
        }
      } catch (err) {
        console.error('Polling pass order error:', err);
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [currentPassOrder]);

  // Calculate current level
  let currentLevel = 1;
  for (const tier of PASS_TIERS) {
    if (currentXp >= tier.xpRequired) {
      currentLevel = tier.level;
    } else {
      break;
    }
  }

  // Next level tier
  const nextTier = PASS_TIERS.find((t) => t.xpRequired > currentXp) || PASS_TIERS[PASS_TIERS.length - 1];
  const prevXpRequirement = currentLevel === 1 ? 0 : (PASS_TIERS.find((t) => t.level === currentLevel)?.xpRequired || 0);
  const xpIntoLevel = Math.max(0, currentXp - prevXpRequirement);
  const xpNeededForLevel = Math.max(1, nextTier.xpRequired - prevXpRequirement);
  const progressPercent = Math.min(100, (xpIntoLevel / xpNeededForLevel) * 100);

  // Claim Quest XP
  const handleClaimQuest = (questId: string) => {
    const q = quests.find((item) => item.id === questId);
    if (!q || q.claimed) return;

    sound.playWin(false);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#f59e0b', '#3b82f6', '#10b981'],
    });

    const xpToAdd = isPremium ? Math.round(q.xpReward * 1.5) : q.xpReward;
    setCurrentXp((prev) => prev + xpToAdd);
    setQuests((prev) =>
      prev.map((item) => (item.id === questId ? { ...item, claimed: true, completed: true } : item))
    );
  };

  // Quick Step Advance in Quest
  const handleQuickAdvanceQuest = (questId: string) => {
    sound.playTick();
    setQuests((prev) =>
      prev.map((item) => {
        if (item.id === questId) {
          const nextVal = Math.min(item.target, item.current + 1);
          return {
            ...item,
            current: nextVal,
            completed: nextVal >= item.target,
          };
        }
        return item;
      })
    );
  };

  // Claim Tier Reward
  const handleClaimReward = (tier: PassTier, isPremTrack: boolean) => {
    if (isPremTrack && !isPremium) {
      setSelectedPackage('standard');
      setBuyStep('select');
      setIsBuyModalOpen(true);
      return;
    }
    if (currentLevel < tier.level) return;

    const reward = isPremTrack ? tier.premiumReward : tier.freeReward;
    sound.playWin(true);

    if (reward.type === 'acoin' && reward.amount) {
      onAddBalance(reward.amount);
    } else if (reward.type === 'skin' && reward.skinId) {
      const skinObj = getSkinById(reward.skinId);
      if (skinObj) {
        const item: InventoryItem = {
          ...skinObj,
          instanceId: `pass-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          acquiredAt: Date.now(),
          fromCase: `GamePass Сезон 1 (Ур. ${tier.level})`,
        };
        onWinItem(item);
      }
    }

    if (isPremTrack) {
      setClaimedPremiumTiers((prev) => [...prev, tier.level]);
    } else {
      setClaimedFreeTiers((prev) => [...prev, tier.level]);
    }

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
    });
  };

  // Support ESC key to exit modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isBuyModalOpen) {
          setIsBuyModalOpen(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isBuyModalOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in select-none"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-5xl bg-[#0c101a] border border-amber-500/40 rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden"
      >
        {/* Top Header Banner */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-[#1b152d] via-[#101426] to-[#141b2c] border-b border-slate-800 relative">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            {/* Title & Season Info */}
            <div className="flex items-center gap-3.5">
              <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-amber-400 via-orange-500 to-red-600 flex items-center justify-center text-black font-black text-2xl shadow-[0_0_25px_rgba(245,158,11,0.5)] shrink-0">
                <Crown className="w-7 h-7 sm:w-8 sm:h-8 text-black" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 font-mono">
                    Сезон 1 • Огненный Штурм
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500" /> 28 дней
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white uppercase font-display tracking-wide mt-1">
                  GameVia Battle Pass
                </h2>
              </div>
            </div>

            {/* Right Side: Level/Meter + Close Button in same row */}
            <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap lg:flex-nowrap justify-between lg:justify-end">
              {/* Level, XP Meter & Buy Actions */}
              <div className="bg-[#0b0e17]/90 border border-slate-700/80 p-2.5 sm:px-4 rounded-2xl flex flex-wrap sm:flex-nowrap items-center gap-2.5 sm:gap-4 shadow-inner">
              <div className="text-center shrink-0">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Уровень</span>
                <span className="text-2xl font-black font-mono text-amber-400 leading-none">
                  {currentLevel}
                </span>
              </div>

              <div className="h-8 w-px bg-slate-800 hidden sm:block" />

              {/* XP Meter */}
              <div className="w-full sm:w-48 md:w-56">
                <div className="flex items-center justify-between text-xs font-mono mb-1">
                  <span className="text-slate-400 font-bold">Опыт (XP)</span>
                  <span className="text-white font-extrabold">
                    {currentXp} / {nextTier.xpRequired} XP
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden p-0.5 border border-slate-700/60">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400 transition-all duration-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Quick Level Buy Button */}
              <button
                type="button"
                onClick={() => {
                  setSelectedPackage('level');
                  setBuyStep('select');
                  setReceiptError(null);
                  setIsBuyModalOpen(true);
                }}
                className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700 text-[11px] font-bold font-mono flex items-center gap-1 cursor-pointer transition active:scale-95 shrink-0"
                title="Купить следующий уровень боевого пропуска"
              >
                <PlusCircle className="w-3.5 h-3.5 text-amber-400" />
                <span>+1 Ур. (99 ₽)</span>
              </button>

              {/* Premium Status or Buy VIP Pass */}
              {!isPremium ? (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPackage('standard');
                    setBuyStep('select');
                    setReceiptError(null);
                    setIsBuyModalOpen(true);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:brightness-110 text-black font-black text-xs uppercase tracking-wide cursor-pointer transition shadow-lg shadow-amber-500/25 active:scale-95 shrink-0 flex items-center gap-1.5"
                >
                  <Crown className="w-4 h-4 text-black" />
                  <span>{t('pass.buy_vip_btn', language, 'Купить VIP Pass (За деньги)')}</span>
                </button>
              ) : (
                <div className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/60 text-amber-300 font-extrabold text-xs uppercase tracking-wider flex items-center gap-1.5 shrink-0 shadow-[0_0_15px_rgba(245,158,11,0.25)]">
                  <Crown className="w-3.5 h-3.5 text-amber-400" />
                  <span>{t('pass.vip_active', language, 'VIP Pass АКТИВЕН')}</span>
                </div>
              )}
            </div>

            {/* Prominent Header Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-2.5 rounded-2xl bg-slate-800 hover:bg-rose-600 border border-slate-700 hover:border-rose-500 text-slate-300 hover:text-white cursor-pointer transition shadow-lg shrink-0 flex items-center justify-center group active:scale-95 z-50"
              aria-label="Закрыть"
              title="Закрыть (ESC)"
            >
              <X className="w-5 h-5 pointer-events-none group-hover:rotate-90 transition-transform duration-200" />
            </button>
          </div>
        </div>

          {/* Sub Navigation: Rewards vs Quests */}
          <div className="flex items-center gap-2 mt-4 sm:mt-5">
            <button
              onClick={() => setActiveSubTab('rewards')}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer flex items-center gap-2 ${
                activeSubTab === 'rewards'
                  ? 'bg-amber-500 text-black shadow-md'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>Шкала наград ({PASS_TIERS.length} уровней)</span>
            </button>
            <button
              onClick={() => setActiveSubTab('quests')}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer flex items-center gap-2 ${
                activeSubTab === 'quests'
                  ? 'bg-amber-500 text-black shadow-md'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Задания на опыт ({quests.filter((q) => !q.claimed).length})</span>
            </button>

            {/* Quick Banner for Pass Shop */}
            <button
              onClick={() => {
                setSelectedPackage('standard');
                setIsBuyModalOpen(true);
              }}
              className="ml-auto px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 text-amber-400 hover:text-amber-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition hidden md:flex"
            >
              <Crown className="w-3.5 h-3.5" />
              <span>Магазин Pass</span>
            </button>
          </div>
        </div>

        {/* Modal Body Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 scrollbar-none">
          {activeSubTab === 'rewards' ? (
            /* ============================================================== */
            /* 1. REWARDS TRACK TAB                                          */
            /* ============================================================== */
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                <span>Проходите уровни и забирайте эксклюзивные скины и золото</span>
                <span className="text-amber-400 font-semibold">
                  {isPremium ? '★ Все VIP награды разблокированы!' : 'Активируйте VIP Pass для получения всех элитных наград'}
                </span>
              </div>

              {/* Tiers List */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {PASS_TIERS.map((tier) => {
                  const isUnlocked = currentLevel >= tier.level;
                  const isFreeClaimed = claimedFreeTiers.includes(tier.level);
                  const isPremClaimed = claimedPremiumTiers.includes(tier.level);

                  const freeSkin = tier.freeReward.skinId ? getSkinById(tier.freeReward.skinId) : null;
                  const premSkin = tier.premiumReward.skinId ? getSkinById(tier.premiumReward.skinId) : null;

                  return (
                    <div
                      key={tier.level}
                      className={`p-4 rounded-2xl border transition-all relative overflow-hidden ${
                        isUnlocked
                          ? 'bg-[#121726] border-amber-500/40 shadow-lg'
                          : 'bg-[#0f131f] border-slate-800/80 opacity-85'
                      }`}
                    >
                      {/* Level Badge Header */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-7 h-7 rounded-lg font-black font-mono text-xs flex items-center justify-center ${
                              isUnlocked ? 'bg-amber-500 text-black shadow' : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {tier.level}
                          </span>
                          <span className="text-xs font-bold text-white uppercase tracking-wider">
                            Уровень {tier.level}
                          </span>
                        </div>
                        <span className="text-[11px] font-mono text-slate-400">
                          {tier.xpRequired} XP
                        </span>
                      </div>

                      {/* Free Track Card */}
                      <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 mb-2.5">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] font-bold uppercase text-slate-400">{t('pass.free_track', language, 'Бесплатно')}</span>
                          {isFreeClaimed ? (
                            <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> {t('pass.claimed', language, 'Получено')}
                            </span>
                          ) : isUnlocked ? (
                            <button
                              onClick={() => handleClaimReward(tier, false)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-black text-[10px] uppercase cursor-pointer transition active:scale-95 shadow"
                            >
                              {t('pass.claim', language, 'Забрать')}
                            </button>
                          ) : (
                            <span className="text-[10px] text-slate-500 flex items-center gap-1">
                              <Lock className="w-2.5 h-2.5" /> {t('pass.locked', language, 'Заблокировано')}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2.5">
                          {freeSkin ? (
                            <div className="w-13 h-10 flex items-center justify-center bg-black/50 rounded-lg p-0.5 shrink-0 border border-slate-800">
                              <WeaponIcon skin={freeSkin} size="sm" showGlow={false} />
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs shrink-0 border border-amber-500/30">
                              <Coins className="w-4 h-4" />
                            </div>
                          )}
                          <div className="text-xs font-bold text-slate-200 truncate">
                            {tier.freeReward.label}
                          </div>
                        </div>
                      </div>

                      {/* Premium / Elite Track Card */}
                      <div
                        className={`p-2.5 rounded-xl border ${
                          isPremium
                            ? 'bg-amber-950/20 border-amber-500/30'
                            : 'bg-slate-950/40 border-slate-800/80'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] font-bold uppercase text-amber-400 flex items-center gap-1">
                            <Crown className="w-3 h-3 text-amber-400" /> {t('pass.vip_track', language, 'VIP Pass')}
                          </span>
                          {isPremClaimed ? (
                            <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> {t('pass.claimed', language, 'Получено')}
                            </span>
                          ) : isUnlocked && isPremium ? (
                            <button
                              onClick={() => handleClaimReward(tier, true)}
                              className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:brightness-110 text-black font-black text-[10px] uppercase cursor-pointer transition active:scale-95 shadow"
                            >
                              {t('pass.claim', language, 'Забрать')}
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                if (!isPremium) {
                                  setSelectedPackage('standard');
                                  setBuyStep('select');
                                  setReceiptError(null);
                                  setIsBuyModalOpen(true);
                                }
                              }}
                              className={`text-[10px] flex items-center gap-1 font-semibold ${
                                !isPremium
                                  ? 'text-amber-400 hover:text-amber-300 underline cursor-pointer'
                                  : 'text-amber-500/70'
                              }`}
                            >
                              <Lock className="w-2.5 h-2.5" /> {!isPremium ? t('pass.buy_vip_btn', language, 'Купить VIP Pass') : t('pass.locked', language, 'Заблокировано')}
                            </button>
                          )}
                        </div>

                        <div className="flex items-center gap-2.5">
                          {premSkin ? (
                            <div className="w-13 h-10 flex items-center justify-center bg-black/50 rounded-lg p-0.5 shrink-0 border border-amber-500/30">
                              <WeaponIcon skin={premSkin} size="sm" showGlow={false} />
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs shrink-0 border border-amber-500/40">
                              <Coins className="w-4 h-4" />
                            </div>
                          )}
                          <div className="text-xs font-bold text-amber-300 truncate">
                            {tier.premiumReward.label}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* ============================================================== */
            /* 2. QUESTS & TASKS TAB                                          */
            /* ============================================================== */
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                <span>Выполняйте испытания в любимых мини-играх и получайте XP боевого пропуска</span>
                <span className="text-amber-400 font-mono">Обновление заданий: каждый день</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {quests.map((q) => {
                  const isReadyToClaim = q.current >= q.target && !q.claimed;
                  const xpAward = isPremium ? Math.round(q.xpReward * 1.5) : q.xpReward;

                  return (
                    <div
                      key={q.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        q.claimed
                          ? 'bg-[#0f1422]/60 border-slate-800 opacity-60'
                          : isReadyToClaim
                          ? 'bg-[#151c2e] border-emerald-500/50 shadow-lg shadow-emerald-500/10'
                          : 'bg-[#111624] border-slate-800'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <h4 className="text-sm font-bold text-white flex items-center gap-2">
                            {q.title}
                          </h4>
                          <p className="text-xs text-slate-400 mt-0.5">{q.description}</p>
                        </div>
                        <span className="px-2.5 py-1 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono font-bold text-xs shrink-0">
                          +{xpAward} XP {isPremium && '🔥'}
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
                          <span>Прогресс</span>
                          <span className="text-white font-bold">
                            {q.current} / {q.target}
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 rounded-full transition-all"
                            style={{ width: `${Math.min(100, (q.current / q.target) * 100)}%` }}
                          />
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="mt-3.5 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                        {q.claimed ? (
                          <span className="text-xs text-emerald-400 font-bold flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4" /> Награда получена
                          </span>
                        ) : isReadyToClaim ? (
                          <button
                            onClick={() => handleClaimQuest(q.id)}
                            className="w-full py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:brightness-110 text-black font-black text-xs uppercase cursor-pointer transition shadow-md flex items-center justify-center gap-1.5 animate-pulse"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Забрать +{xpAward} XP</span>
                          </button>
                        ) : (
                          <div className="flex items-center gap-2 w-full justify-between">
                            <button
                              onClick={() => {
                                onClose();
                                if (onNavigateToTab) onNavigateToTab(q.gameTab);
                              }}
                              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-cyan-300 cursor-pointer transition flex items-center gap-1"
                            >
                              <span>Перейти</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleQuickAdvanceQuest(q.id)}
                              className="px-2.5 py-1 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-[10px] text-slate-400 hover:text-slate-200 cursor-pointer"
                              title="Тестовый шаг прогресса"
                            >
                              +1 шаг
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ============================================================== */}
        {/* COMPREHENSIVE PASS PURCHASE MODAL (Standard, Bundle, Level)    */}
        {/* ============================================================== */}
        {isBuyModalOpen && (
          <div className="absolute inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fade-in">
            <div className="bg-[#121624] border-2 border-amber-500/80 rounded-3xl p-5 sm:p-7 max-w-xl w-full text-center relative shadow-[0_0_50px_rgba(245,158,11,0.4)] space-y-4 animate-scale-up max-h-[92vh] overflow-y-auto">
              <button
                type="button"
                onClick={() => {
                  setIsBuyModalOpen(false);
                  setReceiptError(null);
                }}
                className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Stepper Header (Select -> Payment -> Receipt -> Status) */}
              <div className="flex items-center justify-center gap-2 pb-2">
                {[
                  { id: 'select', label: '1. Тариф' },
                  { id: 'payment', label: '2. Реквизиты' },
                  { id: 'receipt', label: '3. Чек' },
                  { id: 'status', label: '4. Проверка' },
                ].map((s, idx) => (
                  <div key={s.id} className="flex items-center gap-1.5">
                    <span
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider transition ${
                        buyStep === s.id
                          ? 'bg-amber-500 text-black shadow-md font-black'
                          : 'bg-slate-800/80 text-slate-400'
                      }`}
                    >
                      {s.label}
                    </span>
                    {idx < 3 && <ChevronRight className="w-3.5 h-3.5 text-slate-600" />}
                  </div>
                ))}
              </div>

              {/* STEP 1: SELECT PACKAGE & CURRENCY */}
              {buyStep === 'select' && (
                <div className="space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-orange-500 mx-auto flex items-center justify-center shadow-[0_0_25px_rgba(245,158,11,0.5)]">
                    <Crown className="w-8 h-8 text-black" />
                  </div>

                  <div>
                    <h3 className="text-xl font-black text-white uppercase font-display tracking-wide">
                      {t('pass.modal_title', language, 'Покупка Боевого Пропуска')}
                    </h3>
                    <p className="text-xs text-slate-300 mt-1">
                      {t('pass.payment_instruction', language, 'Выберите тариф. Оплата производится переводом на карту с отправкой чека на проверку.')}
                    </p>
                  </div>

                  {/* Currency selector for payment */}
                  <div className="flex items-center justify-center gap-2 pt-1">
                    <span className="text-xs text-slate-400 font-semibold">Валюта оплаты:</span>
                    <div className="inline-flex rounded-xl bg-slate-900 p-1 border border-slate-800">
                      <button
                        type="button"
                        onClick={() => setPayCurrency('RUB')}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                          payCurrency === 'RUB' ? 'bg-amber-500 text-black shadow' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        ₽ Рубли (RUB)
                      </button>
                      <button
                        type="button"
                        onClick={() => setPayCurrency('UZS')}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                          payCurrency === 'UZS' ? 'bg-amber-500 text-black shadow' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        🇺🇿 Сумы (UZS)
                      </button>
                    </div>
                  </div>

                  {/* Packages Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
                    {/* 1. Standard VIP */}
                    <div
                      onClick={() => setSelectedPackage('standard')}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition relative ${
                        selectedPackage === 'standard'
                          ? 'bg-amber-500/20 border-amber-400 shadow-md ring-2 ring-amber-400/50'
                          : 'bg-black/40 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="text-[10px] uppercase font-bold text-amber-400">{t('pass.standard_name', language, 'Стандарт VIP')}</div>
                      <div className="text-base font-black text-white mt-1">VIP Pass</div>
                      <div className="text-xs text-slate-300 mt-1 leading-snug">
                        Полная премиум ветка + 50% XP
                      </div>
                      <div className="mt-3">
                        <span className="text-base font-black font-mono text-amber-400 block">
                          {payCurrency === 'UZS' ? '105 000 сум' : '790 ₽'}
                        </span>
                        <span className="text-[10px] font-bold font-mono text-slate-400 block">
                          {payCurrency === 'UZS' ? '790 ₽' : '105 000 сум'}
                        </span>
                      </div>
                    </div>

                    {/* 2. VIP + 10 Levels Bundle */}
                    <div
                      onClick={() => setSelectedPackage('bundle')}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition relative ${
                        selectedPackage === 'bundle'
                          ? 'bg-amber-500/20 border-amber-400 shadow-md ring-2 ring-amber-400/50'
                          : 'bg-black/40 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <span className="absolute -top-2 right-2 px-2 py-0.5 rounded-full bg-red-500 text-white font-extrabold text-[9px] uppercase tracking-wider shadow">
                        ХИТ
                      </span>
                      <div className="text-[10px] uppercase font-bold text-amber-400">{t('pass.bundle_name', language, 'Бандл VIP + 10 Ур.')}</div>
                      <div className="text-base font-black text-white mt-1">VIP + 10 Ур.</div>
                      <div className="text-xs text-slate-300 mt-1 leading-snug">
                        VIP доступ + сразу 10 уровней
                      </div>
                      <div className="mt-3">
                        <span className="text-base font-black font-mono text-amber-400 block">
                          {payCurrency === 'UZS' ? '199 000 сум' : '1 490 ₽'}
                        </span>
                        <span className="text-[10px] font-bold font-mono text-slate-400 block">
                          {payCurrency === 'UZS' ? '1 490 ₽' : '199 000 сум'}
                        </span>
                      </div>
                    </div>

                    {/* 3. Level Skip */}
                    <div
                      onClick={() => setSelectedPackage('level')}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition relative ${
                        selectedPackage === 'level'
                          ? 'bg-amber-500/20 border-amber-400 shadow-md ring-2 ring-amber-400/50'
                          : 'bg-black/40 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="text-[10px] uppercase font-bold text-cyan-400">{t('pass.boost_name', language, '+1 Уровень Boost')}</div>
                      <div className="text-base font-black text-white mt-1">+1 Уровень</div>
                      <div className="text-xs text-slate-300 mt-1 leading-snug">
                        Мгновенно открывает след. ур.
                      </div>
                      <div className="mt-3">
                        <span className="text-base font-black font-mono text-cyan-300 block">
                          {payCurrency === 'UZS' ? '13 500 сум' : '99 ₽'}
                        </span>
                        <span className="text-[10px] font-bold font-mono text-slate-400 block">
                          {payCurrency === 'UZS' ? '99 ₽' : '13 500 сум'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {receiptError && (
                    <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2 text-left">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{receiptError}</span>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => handleCreatePassOrder(selectedPackage)}
                    disabled={isSubmitting}
                    className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:brightness-110 disabled:opacity-50 text-black font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition shadow-lg shadow-amber-500/30 active:scale-95"
                  >
                    <span>{isSubmitting ? 'Создание заказа...' : 'Перейти к оплате'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* STEP 2: PAYMENT CREDENTIALS & INSTRUCTIONS */}
              {buyStep === 'payment' && currentPassOrder && (
                <div className="space-y-4 text-left">
                  <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-amber-400 uppercase font-bold block">Заказ {currentPassOrder.id}</span>
                      <span className="text-sm font-black text-white">{currentPassOrder.title || 'GameVia VIP Pass'}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block">К оплате:</span>
                      <span className="text-base font-black font-mono text-amber-400">
                        {(currentPassOrder.paymentAmount || currentPassOrder.paymentAmountRub).toLocaleString('ru-RU')} {currentPassOrder.currency === 'UZS' ? 'сум' : '₽'}
                      </span>
                    </div>
                  </div>

                  {/* Bank Transfer Cards */}
                  <div className="space-y-2.5">
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                      Переведите точную сумму по реквизитам:
                    </span>

                    {/* Humo Card */}
                    <div className="p-3 rounded-xl bg-[#090d16] border border-slate-800 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">
                          🇺🇿 Карта HUMO (Узбекистан / Сумы)
                        </span>
                        <span className="font-mono text-xs sm:text-sm font-bold text-white tracking-wider block mt-0.5">
                          {currentPassOrder.recipientCard || '9860 1701 1354 8268'}
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          Получатель: <strong className="text-slate-200">{currentPassOrder.recipientName || 'Musallam Abidov'}</strong>
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopyCard(currentPassOrder.recipientCard || '9860 1701 1354 8268', 'humo')}
                        className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-semibold flex items-center gap-1 cursor-pointer transition border border-amber-500/30"
                      >
                        {copiedCard === 'humo' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedCard === 'humo' ? 'Скопировано' : 'Копировать'}</span>
                      </button>
                    </div>

                    {/* Visa Card */}
                    <div className="p-3 rounded-xl bg-[#090d16] border border-slate-800 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">
                          💳 Карта VISA (СНГ / РФ / Рубли)
                        </span>
                        <span className="font-mono text-xs sm:text-sm font-bold text-white tracking-wider block mt-0.5">
                          4023 0605 0973 3761
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          Банк: <strong className="text-slate-200">Visa</strong>
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopyCard('4023 0605 0973 3761', 'visa')}
                        className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-semibold flex items-center gap-1 cursor-pointer transition border border-amber-500/30"
                      >
                        {copiedCard === 'visa' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedCard === 'visa' ? 'Скопировано' : 'Копировать'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 space-y-1">
                    <p className="font-bold text-amber-300">Инструкция по оплате:</p>
                    <p>1. Откройте приложение вашего банка и переведите указанную сумму.</p>
                    <p>2. Сохраните чек (скриншот или PDF/квитанцию) перевода.</p>
                    <p>3. Нажмите кнопку «Я оплатил, отправить чек» ниже для проверки администратором.</p>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setBuyStep('select')}
                      className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer transition"
                    >
                      Назад
                    </button>
                    <button
                      type="button"
                      onClick={() => setBuyStep('receipt')}
                      className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition shadow-lg shadow-amber-500/30"
                    >
                      <span>Я оплатил, отправить чек</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: UPLOAD RECEIPT */}
              {buyStep === 'receipt' && currentPassOrder && (
                <div className="space-y-4 text-left">
                  <div className="text-center space-y-1">
                    <h4 className="text-base font-black text-white uppercase">Прикрепите чек оплаты</h4>
                    <p className="text-xs text-slate-400">
                      Чек поступит администраторам в Telegram бот. VIP Pass активируется сразу после одобрения!
                    </p>
                  </div>

                  {/* Drop area */}
                  <label className="border-2 border-dashed border-amber-500/40 hover:border-amber-400 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 bg-black/40 hover:bg-amber-500/5 transition cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleReceiptFileChange}
                      className="hidden"
                    />
                    <Upload className="w-8 h-8 text-amber-400" />
                    <span className="text-xs font-bold text-white">
                      {receiptFileName ? `Выбран файл: ${receiptFileName}` : 'Нажмите для выбора фото чека'}
                    </span>
                    <span className="text-[10px] text-slate-400">JPG, PNG до 5 МБ</span>
                  </label>

                  {/* Preview if uploaded */}
                  {receiptBase64 && (
                    <div className="relative rounded-xl overflow-hidden border border-slate-700 max-h-44 flex items-center justify-center bg-black">
                      <img src={receiptBase64} alt="Чек" className="max-h-44 object-contain" />
                    </div>
                  )}

                  {receiptError && (
                    <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2 text-left">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{receiptError}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setBuyStep('payment')}
                      className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer transition"
                    >
                      Назад
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmitPassReceipt}
                      disabled={isSubmitting || !receiptBase64}
                      className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 disabled:opacity-50 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition shadow-lg shadow-emerald-500/30"
                    >
                      <span>{isSubmitting ? 'Отправка в бот...' : 'Отправить чек на проверку'}</span>
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: REVIEW STATUS & AUTO-ACTIVATION */}
              {buyStep === 'status' && currentPassOrder && (
                <div className="space-y-4 text-center py-2">
                  {currentPassOrder.status === 'APPROVED' ? (
                    <div className="space-y-3 animate-fade-in">
                      <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 mx-auto flex items-center justify-center">
                        <CheckCircle2 className="w-10 h-10" />
                      </div>
                      <h4 className="text-xl font-black text-white uppercase font-display">
                        🎉 VIP Pass успешно активирован!
                      </h4>
                      <p className="text-xs text-slate-300 max-w-sm mx-auto">
                        Администратор подтвердил ваш перевод. Все премиальные уровни и награды разблокированы!
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setIsBuyModalOpen(false);
                          setBuyStep('select');
                          setCurrentPassOrder(null);
                        }}
                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:brightness-110 text-white font-black text-xs uppercase tracking-wider cursor-pointer transition shadow-lg"
                      >
                        Забрать награды
                      </button>
                    </div>
                  ) : currentPassOrder.status === 'REJECTED' ? (
                    <div className="space-y-3 animate-fade-in">
                      <div className="w-16 h-16 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400 mx-auto flex items-center justify-center">
                        <AlertCircle className="w-10 h-10" />
                      </div>
                      <h4 className="text-xl font-black text-rose-300 uppercase font-display">
                        Чек не подтверждён
                      </h4>
                      <p className="text-xs text-slate-300 max-w-sm mx-auto">
                        {currentPassOrder.rejectionReason || 'Перевод не найден в банковской выписке. Проверьте реквизиты или обратитесь в поддержку.'}
                      </p>
                      <button
                        type="button"
                        onClick={() => setBuyStep('payment')}
                        className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase cursor-pointer transition"
                      >
                        Попробовать снова
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3 animate-fade-in">
                      <div className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 mx-auto flex items-center justify-center animate-pulse">
                        <Clock className="w-9 h-9" />
                      </div>
                      <h4 className="text-lg font-black text-white uppercase font-display">
                        Чек отправлен на проверку администратору
                      </h4>
                      <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed">
                        Заказ <code>{currentPassOrder.id}</code> передан в Telegram бот администрации.
                      </p>
                      <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 text-left space-y-1">
                        <p className="font-bold">💡 Вы можете закрыть это окно:</p>
                        <p className="text-slate-300 text-[11px]">
                          Как только администратор нажмёт «Одобрить», VIP Pass автоматически активируется в вашем профиле, даже если вы закроете сайт.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsBuyModalOpen(false)}
                        className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer transition"
                      >
                        Закрыть окно
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal Footer / Bottom Close Bar */}
        <div className="p-3 sm:p-4 bg-[#0a0e16] border-t border-slate-800 flex items-center justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-white font-bold text-xs uppercase tracking-wider cursor-pointer transition border border-slate-700 shadow-md active:scale-95"
          >
            Закрыть пропуск
          </button>
        </div>
      </div>
    </div>
  );
};
