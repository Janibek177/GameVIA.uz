import React, { useState, useEffect } from 'react';
import { InventoryItem } from '../types';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';
import { UserProfile } from './AuthModal';
import { GoldWithdrawal } from '../server/types';
import { createWithdrawal, fetchUserWithdrawals, fetchOrder } from '../utils/api';
import {
  Gamepad2,
  CheckCircle2,
  Clock,
  ShieldCheck,
  AlertCircle,
  Coins,
  Sparkles,
  Lock,
  ArrowRight,
  Package,
  X,
  CreditCard,
  RefreshCw,
  Send,
  Upload,
  Image,
} from 'lucide-react';

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  userBalance: number;
  inventory: InventoryItem[];
  onDeductBalance: (amount: number) => void;
  onBurnItem: (instanceId: string) => void;
  currentUser?: UserProfile | null;
}

interface ActiveGame {
  id: 'standoff2' | 'pubg';
  name: string;
  subtitle: string;
  currencyName: string;
  rateMultiplier: number; // 1 Gold = X in-game
  color: string;
  badge: string;
  fieldLabel: string;
  placeholder: string;
  hint: string;
  iconText: string;
}

interface ComingSoonGame {
  id: string;
  name: string;
  currency: string;
  iconText: string;
}

const ACTIVE_GAMES: ActiveGame[] = [
  {
    id: 'standoff2',
    name: 'Standoff 2',
    subtitle: 'Голда (Gold G) по Pattern ID',
    currencyName: 'G Голда',
    rateMultiplier: 1.0,
    color: '#f59e0b',
    badge: '⚡ Выкуп скина',
    fieldLabel: 'Игровой ID в Standoff 2 (Player ID)',
    placeholder: 'Например: 14829105',
    hint: 'Числовой ID из вашего профиля Standoff 2. Администратор выкупает ваш скин по Pattern ID.',
    iconText: 'SO2',
  },
  {
    id: 'pubg',
    name: 'PUBG Mobile',
    subtitle: 'UC (Unknown Cash) по Player ID',
    currencyName: 'UC',
    rateMultiplier: 0.9,
    color: '#eab308',
    badge: '⚡ Быстро',
    fieldLabel: 'Игровой ID персонажа (Player ID) в PUBG',
    placeholder: 'Например: 5192840192',
    hint: 'Числовой UID из вашего профиля PUBG Mobile. Прямой перевод UC на игровой аккаунт.',
    iconText: 'PUBG',
  },
];

const COMING_SOON_GAMES: ComingSoonGame[] = [
  { id: 'cs2_steam', name: 'CS2 / Steam Wallet', currency: 'Steam Баланс', iconText: 'CS2' },
  { id: 'roblox', name: 'Roblox', currency: 'Robux R$', iconText: 'RBX' },
  { id: 'brawlstars', name: 'Brawl Stars', currency: 'Гемы 💎', iconText: 'BS' },
  { id: 'freefire', name: 'Free Fire', currency: 'Алмазы 💎', iconText: 'FF' },
  { id: 'dota2', name: 'Dota 2', currency: 'Steam Wallet', iconText: 'DOTA' },
];

export const WithdrawModal: React.FC<WithdrawModalProps> = ({
  isOpen,
  onClose,
  userBalance,
  onDeductBalance,
  currentUser,
}) => {
  const [activeTab, setActiveTab] = useState<'games' | 'cs2_skins' | 'history'>('games');
  const [selectedGameId, setSelectedGameId] = useState<'standoff2' | 'pubg'>('standoff2');

  // Form fields
  const [withdrawAmount, setWithdrawAmount] = useState<number>(() => Math.min(500, Math.max(50, userBalance || 100)));
  const [playerId, setPlayerId] = useState<string>('');

  // Standoff 2 Skin & Pattern & Avatar fields
  const [skinName, setSkinName] = useState<string>('');
  const [skinPattern, setSkinPattern] = useState<string>('');
  const [skinScreenshotUrl, setSkinScreenshotUrl] = useState<string | null>(null);
  const [playerAvatarUrl, setPlayerAvatarUrl] = useState<string | null>(null);

  // Status feedback
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [successWithdrawal, setSuccessWithdrawal] = useState<GoldWithdrawal | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Server history
  const [history, setHistory] = useState<GoldWithdrawal[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(false);

  const userId = currentUser?.uid || currentUser?.email || 'player_guest';
  const username = currentUser?.name || 'Игрок GameVia';

  const loadWithdrawals = async () => {
    setIsLoadingHistory(true);
    try {
      const data = await fetchUserWithdrawals(userId);
      setHistory(data);
    } catch (err) {
      console.warn('Failed to fetch user withdrawals:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadWithdrawals();
    }
  }, [isOpen, userId]);

  if (!isOpen) return null;

  const currentGame = ACTIVE_GAMES.find((g) => g.id === selectedGameId) || ACTIVE_GAMES[0];
  const convertedAmount = Math.round((Number(withdrawAmount) || 0) * currentGame.rateMultiplier);

  // Market price for Standoff 2 (GameVia covers the 20% in-game fee)
  // Seller receives 80%, so market listing price = withdrawAmount / 0.8
  const standoffMarketPrice =
    selectedGameId === 'standoff2'
      ? `${(Math.ceil(((Number(withdrawAmount) || 0) / 0.8) * 100) / 100).toFixed(2)} G`
      : '';

  const handleWithdraw = async () => {
    setErrorMessage(null);
    setSuccessWithdrawal(null);

    const amt = Number(withdrawAmount);
    const totalDeduct = Math.round(amt * 1.5);
    const feeAmt = Math.round(amt * 0.5);

    if (!amt || isNaN(amt) || amt < 50) {
      setErrorMessage('Минимальная сумма для вывода: 50 Gold');
      return;
    }
    if (userBalance < totalDeduct) {
      setErrorMessage(
        `Недостаточно средств. Для вывода ${amt.toLocaleString('ru-RU')} Gold требуется ${totalDeduct.toLocaleString('ru-RU')} Gold (с учётом комиссии 50% = +${feeAmt.toLocaleString('ru-RU')} Gold). Ваш баланс: ${userBalance.toLocaleString('ru-RU')} Gold`
      );
      return;
    }

    const cleanPlayerId = playerId.trim();
    if (!cleanPlayerId) {
      setErrorMessage(`Пожалуйста, укажите ваш ${currentGame.fieldLabel}`);
      return;
    }
    if (cleanPlayerId.length < 3) {
      setErrorMessage('Укажите корректные реквизиты игрока');
      return;
    }

    // Validation for Standoff 2: Pattern is required; weapon name is optional (img + pattern)
    if (selectedGameId === 'standoff2') {
      if (!skinPattern.trim()) {
        setErrorMessage('Укажите номер паттерна (Pattern ID) скина из окна осмотра в игре!');
        return;
      }
    }

    setIsProcessing(true);
    sound.playOpen();

    try {
      const withdrawal = await createWithdrawal({
        userId,
        username,
        userEmail: currentUser?.email,
        goldAmount: amt,
        payoutMethod: currentGame.id,
        payoutTarget: cleanPlayerId,
        skinName: selectedGameId === 'standoff2' ? (skinName.trim() || 'Скин с рынка (по скриншоту)') : undefined,
        skinPattern: selectedGameId === 'standoff2' ? skinPattern.trim() : undefined,
        marketPrice: selectedGameId === 'standoff2' ? standoffMarketPrice : undefined,
        screenshotUrl: skinScreenshotUrl || undefined,
        playerAvatarUrl: playerAvatarUrl || undefined,
        currency: (localStorage.getItem('gamevia_currency') as 'RUB' | 'UZS') || 'RUB',
      });

      // Deduct balance locally immediately as totalDeduct is reserved on server (1.5x deduction)
      onDeductBalance(totalDeduct);
      setSuccessWithdrawal(withdrawal);
      setHistory((prev) => [withdrawal, ...prev]);
      sound.playWin(false);

      confetti({
        particleCount: 65,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#10b981', '#f59e0b', '#3b82f6'],
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Ошибка создания заявки');
      sound.playFail();
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">✅ Выплачено</span>;
      case 'APPROVED':
      case 'PROCESSING':
        return <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">⚡ В процессе</span>;
      case 'REJECTED':
        return <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">❌ Отклонено</span>;
      default:
        return <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">🕒 На проверке</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none">
      <div className="bg-[#0e1320] border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-[#0a0e18]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center">
              <Gamepad2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white uppercase font-display tracking-wide flex items-center gap-2">
                Вывод средств
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono font-bold">
                  GameVia Payout
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Вывод Gold в Standoff 2, PUBG Mobile и на банковские карты / СБП
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-4 pt-3 bg-[#0a0e18] border-b border-slate-800/80 overflow-x-auto">
          <button
            onClick={() => setActiveTab('games')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition border-b-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'games'
                ? 'border-amber-500 text-amber-400 bg-amber-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Coins className="w-4 h-4" />
            <span>Вывод Gold (Игры & Карты)</span>
          </button>

          <button
            onClick={() => setActiveTab('cs2_skins')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition border-b-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'cs2_skins'
                ? 'border-cyan-500 text-cyan-400 bg-cyan-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Package className="w-4 h-4 text-cyan-400" />
            <span>Скины CS2 (Steam Bot)</span>
            <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-mono">
              Скоро
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab('history');
              loadWithdrawals();
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition border-b-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'history'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>История ({history.length})</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          {/* TAB 1: ACTIVE GAME & FIAT WITHDRAWAL */}
          {activeTab === 'games' && (
            <div className="space-y-5">
              {/* Game Selector Buttons */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  1. Выберите игру для вывода валюты:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {ACTIVE_GAMES.map((game) => {
                    const isSelected = selectedGameId === game.id;
                    return (
                      <button
                        key={game.id}
                        type="button"
                        onClick={() => {
                          setSelectedGameId(game.id);
                          setSuccessWithdrawal(null);
                          setErrorMessage(null);
                        }}
                        className={`p-3 rounded-2xl border text-left transition cursor-pointer relative flex flex-col justify-between ${
                          isSelected
                            ? 'bg-amber-500/15 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                            : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 font-black font-mono text-xs flex items-center justify-center">
                            {game.iconText}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            {game.badge}
                          </span>
                        </div>
                        <div className="mt-2">
                          <div className="text-xs font-black text-white">{game.name}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">{game.subtitle}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Form Input Section */}
              <div className="bg-[#121826] border border-slate-800 p-4 sm:p-5 rounded-2xl space-y-4">
                {/* Amount input */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      2. Сумма Gold для списания:
                    </label>
                    <span className="text-xs text-slate-400 font-mono">
                      Доступно: <b className="text-white font-bold">{userBalance.toLocaleString('ru-RU')} Gold</b>
                    </span>
                  </div>

                  <div className="relative">
                    <input
                      type="number"
                      min="50"
                      max={userBalance}
                      value={withdrawAmount || ''}
                      onChange={(e) => {
                        setWithdrawAmount(Number(e.target.value));
                        setErrorMessage(null);
                      }}
                      className="w-full bg-[#0a0e16] border border-slate-700 rounded-xl px-4 py-3 text-white font-mono text-base font-bold placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
                      placeholder="Минимум 50 Gold"
                    />
                    <div className="absolute right-3 top-2.5 flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setWithdrawAmount(Math.min(userBalance, 500))}
                        className="px-2 py-1 rounded bg-slate-800 text-[10px] font-bold text-slate-300 hover:text-white"
                      >
                        500
                      </button>
                      <button
                        type="button"
                        onClick={() => setWithdrawAmount(Math.min(userBalance, 2000))}
                        className="px-2 py-1 rounded bg-slate-800 text-[10px] font-bold text-slate-300 hover:text-white"
                      >
                        2 000
                      </button>
                      <button
                        type="button"
                        onClick={() => setWithdrawAmount(userBalance)}
                        className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 text-[10px] font-bold border border-amber-500/40"
                      >
                        Все
                      </button>
                    </div>
                  </div>
                </div>

                {/* Conversion & Fee Breakdown Box */}
                <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Будет выплачено в игру:</span>
                      <strong className="text-base font-black font-mono text-emerald-400">
                        {convertedAmount.toLocaleString('ru-RU')} {currentGame.currencyName}
                      </strong>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Курс:</span>
                      <span className="font-mono text-slate-300 font-bold">
                        1 Gold = {currentGame.rateMultiplier} {currentGame.iconText}
                      </span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Комиссия сервиса (50%):</span>
                    <span className="font-mono text-rose-400 font-bold">
                      +{Math.round((Number(withdrawAmount) || 0) * 0.5).toLocaleString('ru-RU')} Gold
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span className="text-amber-400">Итого спишется с баланса:</span>
                    <span className="font-mono text-amber-400 text-xs">
                      {Math.round((Number(withdrawAmount) || 0) * 1.5).toLocaleString('ru-RU')} Gold
                    </span>
                  </div>
                </div>

                {/* Player ID / Target details */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1.5">
                    3. {currentGame.fieldLabel}:
                  </label>
                  <input
                    type="text"
                    value={playerId}
                    onChange={(e) => {
                      setPlayerId(e.target.value);
                      setErrorMessage(null);
                    }}
                    placeholder={currentGame.placeholder}
                    className="w-full bg-[#0a0e16] border border-slate-700 rounded-xl px-4 py-3 text-white font-mono text-sm placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
                  />
                  <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                    💡 {currentGame.hint}
                  </p>
                </div>

                {/* Player In-Game Avatar Upload (IMG) */}
                <div className="space-y-2 pt-1 border-t border-slate-800">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                      <Image className="w-4 h-4 text-cyan-400" />
                      <span>📸 АВАПАРКА ПРОФИЛЯ ИГРОКА (IMG):</span>
                    </label>
                    <span className="text-[10px] text-slate-400 font-mono">Аватарка</span>
                  </div>

                  {playerAvatarUrl ? (
                    <div className="p-3 rounded-xl bg-slate-900 border border-cyan-500/50 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={playerAvatarUrl}
                          alt="Аватарка игрока"
                          className="w-12 h-12 rounded-full object-cover border-2 border-cyan-400 shadow-md"
                        />
                        <div>
                          <div className="text-xs font-bold text-cyan-300 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                            <span>Аватарка прикреплена</span>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            Администратор сверит её с аватаркой вашего профиля в игре
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setPlayerAvatarUrl(null)}
                        className="px-2.5 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold transition cursor-pointer"
                      >
                        Удалить
                      </button>
                    </div>
                  ) : (
                    <label className="border-2 border-dashed border-slate-700 hover:border-cyan-500/70 bg-[#0a0e16]/80 hover:bg-cyan-500/5 transition rounded-xl p-3.5 flex flex-col items-center justify-center text-center cursor-pointer group">
                      <Upload className="w-6 h-6 text-cyan-400/80 group-hover:scale-110 transition-transform mb-1" />
                      <span className="text-xs font-bold text-slate-200 group-hover:text-cyan-300">
                        Загрузить аватарку игрока из игры
                      </span>
                      <span className="text-[10px] text-slate-400 mt-0.5">
                        Сделайте скриншот профиля с вашей аватаркой и прикрепите сюда
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = () => {
                              setPlayerAvatarUrl(reader.result as string);
                              setErrorMessage(null);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  )}
                </div>

                {/* STANDOFF 2 MARKET LOT DETAILS (IMG + PATTERN) */}
                {selectedGameId === 'standoff2' && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-[#161a29] to-[#0d121e] border-2 border-amber-500/40 space-y-4 shadow-xl">
                    <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
                      <div className="flex items-center gap-2.5">
                        <span className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm">
                          🎯
                        </span>
                        <div>
                          <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-amber-400">
                            Выкуп скина на рынке Standoff 2
                          </h4>
                          <p className="text-[11px] text-slate-400">
                            Достаточно указать <b>Pattern</b> и прикрепить <b>IMG (скриншот)</b>
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono">
                        SO2 Market
                      </span>
                    </div>

                    {/* 1. Market Listing Price Banner with 20% Commission Compensation */}
                    <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-inner">
                      <div>
                        <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">
                          Выставите скин на рынке за точную цену:
                        </span>
                        <div className="text-xl font-black font-mono text-emerald-300 tracking-wide mt-0.5">
                          {standoffMarketPrice || '0.00 G'}
                        </div>
                      </div>
                      <div className="text-xs text-emerald-200/90 leading-tight sm:max-w-[220px]">
                        🛡️ Комиссию рынка 20% полностью оплачивает <b>GameVia</b>. Вы получите ровно <b>{withdrawAmount || 0} G</b> на аккаунт!
                      </div>
                    </div>

                    {/* 2. PRIMARY FIELD: SKIN PATTERN NUMBER */}
                    <div className="p-3.5 rounded-xl bg-amber-500/10 border-2 border-amber-500/60 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                          <span>🎯 НОМЕР ПАТТЕРНА (PATTERN ID):</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-500/30 text-red-200 border border-red-500/50">
                            ОБЯЗАТЕЛЬНО
                          </span>
                        </label>
                      </div>
                      <input
                        type="text"
                        value={skinPattern}
                        onChange={(e) => {
                          setSkinPattern(e.target.value);
                          setErrorMessage(null);
                        }}
                        placeholder="Например: 421 (или 690, 888, 125)"
                        className="w-full bg-[#0a0e16] border-2 border-amber-500 focus:border-amber-400 rounded-xl px-4 py-2.5 text-white font-mono text-base font-bold placeholder:text-slate-600 focus:outline-none shadow-inner"
                      />
                      <p className="text-[11px] text-amber-200/90 leading-relaxed">
                        🔍 <b>Как узнать:</b> В игре нажмите на скин в инвентаре → «Осмотреть» → найдите строку <b>Pattern: [число]</b>. По этому числу бот и админ сразу найдут именно ваш лот!
                      </p>
                    </div>

                    {/* 3. PRIMARY FIELD: SCREENSHOT OF THE LOT (IMG) */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-black uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                          <Image className="w-4 h-4 text-amber-400" />
                          <span>📸 СКРИНШОТ ВЫСТАВЛЕННОГО ЛОТА (IMG):</span>
                        </label>
                        <span className="text-[10px] text-slate-400 font-mono">PNG / JPG</span>
                      </div>

                      {skinScreenshotUrl ? (
                        <div className="p-3 rounded-xl bg-slate-900 border border-emerald-500/50 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={skinScreenshotUrl}
                              alt="Скриншот лота"
                              className="w-14 h-14 rounded-lg object-cover border-2 border-emerald-500 shadow-md"
                            />
                            <div>
                              <div className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Скриншот прикреплен</span>
                              </div>
                              <p className="text-[10px] text-slate-400 mt-0.5">
                                Администратор увидит его в Telegram для быстрой сверки
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setSkinScreenshotUrl(null)}
                            className="px-2.5 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold transition cursor-pointer"
                          >
                            Удалить
                          </button>
                        </div>
                      ) : (
                        <label className="border-2 border-dashed border-slate-700 hover:border-amber-500/70 bg-[#0a0e16]/80 hover:bg-amber-500/5 transition rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer group">
                          <Upload className="w-7 h-7 text-amber-400/80 group-hover:scale-110 transition-transform mb-1.5" />
                          <span className="text-xs font-bold text-slate-200 group-hover:text-amber-300">
                            Нажмите, чтобы загрузить скриншот лота
                          </span>
                          <span className="text-[10px] text-slate-400 mt-0.5">
                            Сделайте скрин лота на рынке Standoff 2 и прикрепите сюда
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = () => {
                                  setSkinScreenshotUrl(reader.result as string);
                                  setErrorMessage(null);
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                        </label>
                      )}
                    </div>

                    {/* 4. OPTIONAL WEAPON NAME (NOT MANDATORY) */}
                    <div className="pt-1">
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-semibold text-slate-400">
                          Название оружия / скина (необязательно):
                        </label>
                        <span className="text-[10px] text-slate-500 font-mono">Необязательно</span>
                      </div>
                      <input
                        type="text"
                        value={skinName}
                        onChange={(e) => {
                          setSkinName(e.target.value);
                          setErrorMessage(null);
                        }}
                        placeholder="Можно оставить пустым — выкуп идет по Pattern и скриншоту"
                        className="w-full bg-[#0a0e16] border border-slate-800 rounded-xl px-3.5 py-2 text-white font-mono text-xs placeholder:text-slate-600 focus:outline-none focus:border-slate-600"
                      />
                    </div>
                  </div>
                )}

                {/* Error Banner */}
                {errorMessage && (
                  <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Success Banner */}
                {successWithdrawal && (
                  <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-200 text-xs space-y-1.5 animate-fade-in">
                    <div className="flex items-center gap-2 font-bold text-emerald-400">
                      <CheckCircle2 className="w-5 h-5 shrink-0" />
                      <span>Заявка #{successWithdrawal.id} успешно создана!</span>
                    </div>
                    <p className="leading-relaxed">
                      Уведомление с вашими реквизитами передано администратору в Telegram (@GamviaBot).
                      Средства ({successWithdrawal.goldAmount} Gold) зарезервированы на сервере.
                    </p>
                    <div className="text-[10px] text-slate-400 pt-1">
                      Вы можете отслеживать статус во вкладке «История».
                    </div>
                  </div>
                )}

                {/* Submit Action */}
                <button
                  type="button"
                  onClick={handleWithdraw}
                  disabled={isProcessing || userBalance < 50}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 hover:brightness-110 disabled:opacity-50 text-black font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition shadow-lg shadow-emerald-500/20 active:scale-98"
                >
                  <Send className="w-4 h-4" />
                  <span>
                    {isProcessing
                      ? 'Создание заявки...'
                      : `Подать заявку на вывод ${withdrawAmount || 0} Gold`}
                  </span>
                </button>
              </div>

              {/* Coming Soon Games List */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    Остальные игры (Coming Soon):
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">Скоро в GameVia</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {COMING_SOON_GAMES.map((game) => (
                    <div
                      key={game.id}
                      className="p-2.5 rounded-xl bg-slate-900/50 border border-slate-800/80 flex items-center justify-between text-slate-500 opacity-75"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-7 h-7 rounded-lg bg-slate-800 text-slate-400 font-bold font-mono text-[10px] flex items-center justify-center shrink-0">
                          {game.iconText}
                        </span>
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-slate-400 truncate">{game.name}</div>
                          <div className="text-[10px] text-slate-500 truncate">{game.currency}</div>
                        </div>
                      </div>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-amber-400/80 shrink-0 font-mono flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5" />
                        Скоро
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CS2 SKINS WITHDRAWAL (COMING SOON) */}
          {activeTab === 'cs2_skins' && (
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-cyan-500/30 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 mx-auto flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.2)]">
                <Sparkles className="w-8 h-8" />
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-bold font-mono">
                <Clock className="w-3.5 h-3.5" />
                <span>РАЗДЕЛ В РАЗРАБОТКЕ · COMING SOON</span>
              </div>

              <div>
                <h3 className="text-xl font-black text-white uppercase font-display tracking-wide">
                  Вывод скинов CS2 (Steam Trade Bot)
                </h3>
                <p className="text-xs text-slate-300 max-w-md mx-auto mt-2 leading-relaxed">
                  Прямой вывод скинов CS2 в ваш инвентарь Steam через автоматических трейд-ботов находится в активной разработке и станет доступен в следующем обновлении GameVia!
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab('games')}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:brightness-110 text-black font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition shadow-lg shadow-amber-500/20"
              >
                <span>Перейти к выводу Gold</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* TAB 3: REAL SERVER WITHDRAWAL HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  История ваших заявок на вывод:
                </label>
                <button
                  onClick={loadWithdrawals}
                  className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingHistory ? 'animate-spin' : ''}`} />
                  <span>Обновить</span>
                </button>
              </div>

              {history.length === 0 ? (
                <div className="text-center p-8 text-slate-500 text-xs rounded-2xl bg-slate-900/40 border border-slate-800">
                  Заявок на вывод пока нет.
                </div>
              ) : (
                history.map((record) => (
                  <div
                    key={record.id}
                    className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0">
                        <Gamepad2 className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-2">
                          <span>{record.payoutMethodLabel}</span>
                          <span className="text-[10px] font-mono text-slate-500">#{record.id}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          Реквизиты: {record.payoutTarget}
                        </div>
                        {record.skinPattern && (
                          <div className="mt-1 flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 font-mono font-bold">
                              🎯 Паттерн: #{record.skinPattern}
                            </span>
                            {record.skinName && (
                              <span className="text-[10px] text-slate-300 font-mono">
                                Скин: {record.skinName}
                              </span>
                            )}
                            {record.marketPrice && (
                              <span className="text-[10px] text-emerald-400 font-mono">
                                Выкуп: {record.marketPrice}
                              </span>
                            )}
                          </div>
                        )}
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          {new Date(record.createdAt).toLocaleString('ru-RU')}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs font-mono font-black text-amber-400">
                        {record.payoutAmount}
                      </div>
                      <div className="text-[10px] font-mono text-slate-500">
                        ({record.goldAmount.toLocaleString('ru-RU')} Gold)
                      </div>
                      <div className="mt-1">
                        {getStatusBadge(record.status)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer Guarantee */}
        <div className="p-3.5 border-t border-slate-800 bg-[#0a0e18] flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>GameVia Payout Gateway • Зачисление по реквизитам</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold cursor-pointer text-xs"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};
