import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { sound } from '../utils/audio';
import { Rocket, Zap, TrendingUp, AlertOctagon, CheckCircle2, ShieldCheck, Flame, Users, History, RotateCcw } from 'lucide-react';
import { UserProfile } from './AuthModal';

interface CrashGameProps {
  userBalance: number;
  onDeductBalance: (amount: number) => void;
  onAddBalance: (amount: number) => void;
  currentUser?: UserProfile | null;
}

interface BetPlayer {
  id: string;
  name: string;
  avatarSeed: string;
  bet: number;
  cashedOutAt: number | null; // null if still in or crashed
  profit: number;
}

export const CrashGame: React.FC<CrashGameProps> = ({
  userBalance,
  onDeductBalance,
  onAddBalance,
  currentUser,
}) => {
  // Game states: 'waiting' | 'flying' | 'crashed'
  const [gameState, setGameState] = useState<'waiting' | 'flying' | 'crashed'>('waiting');
  const [multiplier, setMultiplier] = useState<number>(1.00);
  const [betAmount, setBetAmount] = useState<number>(100);
  const [autoCashout, setAutoCashout] = useState<string>('2.00');
  const [hasBet, setHasBet] = useState<boolean>(false);
  const [userCashedOut, setUserCashedOut] = useState<boolean>(false);
  const [cashedOutMultiplier, setCashedOutMultiplier] = useState<number | null>(null);
  const [history, setHistory] = useState<number[]>([2.15, 1.84, 3.20, 2.35, 1.45, 4.90, 2.10, 1.92]);
  const [countdown, setCountdown] = useState<number>(0);
  const [players, setPlayers] = useState<BetPlayer[]>([]);

  const crashPointRef = useRef<number>(1.00);
  const startTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Auto cashout numeric value
  const autoCashVal = parseFloat(autoCashout);

  const generateCrashPoint = (): number => {
    const r = Math.random();
    if (r < 0.35) {
      return 1.00 + Math.random() * 0.45;
    } else if (r < 0.75) {
      return 1.45 + Math.random() * 0.70;
    } else if (r < 0.95) {
      return 2.15 + Math.random() * 2.35;
    } else {
      return 4.50 + Math.random() * 3.50;
    }
  };

  // Start new round automatically
  const startRound = () => {
    const cp = generateCrashPoint();
    crashPointRef.current = Number(cp.toFixed(2));
    setMultiplier(1.00);
    setGameState('flying');
    setUserCashedOut(false);
    setCashedOutMultiplier(null);
    startTimeRef.current = performance.now();

    // Real players only (no fake bots)
    const realBets: BetPlayer[] = [];
    if (hasBet) {
      realBets.push({
        id: 'user-me',
        name: currentUser?.name || 'Вы (Игрок)',
        avatarSeed: currentUser?.email || 'me',
        bet: betAmount,
        cashedOutAt: null,
        profit: 0,
      });
    }

    setPlayers(realBets);
    sound.playOpen();
  };

  // Animation loop
  useEffect(() => {
    if (gameState !== 'flying') return;

    const targetCrash = crashPointRef.current;

    const tick = (now: number) => {
      const elapsedSeconds = (now - startTimeRef.current) / 1000;
      // Exponential curve: multiplier = e^(0.065 * t)
      const current = Math.max(1.00, Math.pow(Math.E, 0.075 * elapsedSeconds * 2.8));

      // Draw canvas rocket and line
      drawCanvas(current);

      // Check auto-cashout for user
      if (
        hasBet &&
        !userCashedOut &&
        !isNaN(autoCashVal) &&
        autoCashVal > 1.01 &&
        current >= autoCashVal &&
        current < targetCrash
      ) {
        handleCashout(autoCashVal);
      }


      if (current >= targetCrash) {
        // CRASH EVENT
        setMultiplier(targetCrash);
        setGameState('crashed');
        sound.playCrashExplosion();
        setHistory(h => [targetCrash, ...h.slice(0, 9)]);

        // User loss if didn't cash out
        if (hasBet && !userCashedOut) {
          setHasBet(false);
        }

        // Brief crash impact display (1.5s), then open 10-second betting window
        setTimeout(() => {
          setGameState('waiting');
          setCountdown(10);
        }, 1500);

        return;
      }

      setMultiplier(Number(current.toFixed(2)));
      animationFrameRef.current = requestAnimationFrame(tick);
    };

    animationFrameRef.current = requestAnimationFrame(tick);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameState, hasBet, userCashedOut, autoCashVal]);

  // 10-second intermission timer during 'waiting' state
  useEffect(() => {
    if (gameState !== 'waiting') return;

    setCountdown(10);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          startRound();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState]);

  // Canvas drawing
  const drawCanvas = (currentMult: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Grid lines
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 80) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 50) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Curve calculation
    const progress = Math.min((currentMult - 1) / 10, 1);
    const endX = 40 + progress * (width - 100);
    const endY = height - 40 - Math.pow(progress, 0.8) * (height - 90);

    // Glow under curve
    const grad = ctx.createLinearGradient(0, height, 0, endY);
    grad.addColorStop(0, 'rgba(245, 158, 11, 0.0)');
    grad.addColorStop(1, 'rgba(245, 158, 11, 0.25)');

    ctx.beginPath();
    ctx.moveTo(40, height - 40);
    ctx.quadraticCurveTo(width * 0.45, height - 40, endX, endY);
    ctx.lineTo(endX, height - 40);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Main Curve
    ctx.beginPath();
    ctx.moveTo(40, height - 40);
    ctx.quadraticCurveTo(width * 0.45, height - 40, endX, endY);
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Rocket / Flame Point at the tip
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(endX, endY, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(endX - 5, endY + 4, 4, 0, Math.PI * 2);
    ctx.fill();
  };

  // User Place Bet
  const handlePlaceBet = () => {
    if (betAmount < 1 || userBalance < betAmount) return;
    onDeductBalance(betAmount);
    setHasBet(true);
    setUserCashedOut(false);
    setCashedOutMultiplier(null);
  };

  // User Cashout
  const handleCashout = (atMultiplier?: number) => {
    if (!hasBet || userCashedOut || gameState !== 'flying') return;

    const winMult = atMultiplier || multiplier;
    const winAmount = Math.round(betAmount * winMult);

    setUserCashedOut(true);
    setCashedOutMultiplier(winMult);
    setHasBet(false);
    onAddBalance(winAmount);

    sound.playCashout();
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#f59e0b', '#10b981', '#ffffff'],
    });

    setPlayers(prev =>
      prev.map(p => (p.id === 'user-me' ? { ...p, cashedOutAt: winMult, profit: winAmount } : p))
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Rocket className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-black text-white uppercase font-display tracking-wide">
              Режим «Краш» (Crash)
            </h1>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Сделайте ставку, следите за взлётом множителя и успейте забрать выигрыш до крушения ракеты!
          </p>
        </div>

        {/* History of past multipliers */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          <History className="w-4 h-4 text-slate-500 mr-1 shrink-0" />
          {history.map((h, i) => (
            <span
              key={i}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold shrink-0 ${
                h >= 10
                  ? 'bg-purple-950/60 text-purple-300 border border-purple-500/40 shadow-[0_0_10px_rgba(168,85,247,0.3)]'
                  : h >= 2
                  ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40'
                  : 'bg-slate-900 text-slate-400 border border-slate-800'
              }`}
            >
              {h.toFixed(2)}x
            </span>
          ))}
        </div>
      </div>

      {/* Main Crash Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Controls */}
        <div className="lg:col-span-4 rounded-2xl bg-[#0f1422] border border-slate-800 p-5 flex flex-col justify-between shadow-xl">
          <div className="space-y-5">
            {/* Bet Input */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Сумма ставки (Acoin)
                </label>
                <span className="text-xs text-slate-500 font-mono">
                  Баланс: {userBalance.toLocaleString('ru-RU')} AC
                </span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max={userBalance}
                  value={betAmount || ''}
                  placeholder="Своя сумма ставки..."
                  onChange={(e) => {
                    const val = e.target.value === '' ? 0 : Number(e.target.value);
                    setBetAmount(val);
                  }}
                  disabled={hasBet}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-base font-mono font-bold text-white focus:outline-none focus:border-amber-500"
                />
                <span className="absolute right-3.5 top-3.5 text-xs font-bold text-amber-400 font-mono">AC</span>
              </div>

              {/* Quick Bet Buttons */}
              <div className="grid grid-cols-4 gap-1.5 mt-2">
                <button
                  type="button"
                  disabled={hasBet}
                  onClick={() => setBetAmount(Math.max(1, Math.floor(betAmount / 2)))}
                  className="py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 cursor-pointer"
                >
                  ½
                </button>
                <button
                  type="button"
                  disabled={hasBet}
                  onClick={() => setBetAmount(Math.min(userBalance, Math.max(1, betAmount * 2)))}
                  className="py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 cursor-pointer"
                >
                  2X
                </button>
                <button
                  type="button"
                  disabled={hasBet}
                  onClick={() => setBetAmount(1)}
                  className="py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 cursor-pointer"
                >
                  1 AC
                </button>
                <button
                  type="button"
                  disabled={hasBet}
                  onClick={() => setBetAmount(userBalance)}
                  className="py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-amber-400 cursor-pointer"
                >
                  MAX
                </button>
              </div>
            </div>

            {/* Auto Cashout */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Авто-вывод (Автокешаут)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={autoCashout}
                  onChange={(e) => setAutoCashout(e.target.value)}
                  disabled={hasBet}
                  placeholder="2.00"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm font-mono font-bold text-white focus:outline-none focus:border-amber-500"
                />
                <span className="absolute right-3.5 top-2.5 text-xs font-bold text-slate-400">X</span>
              </div>
            </div>
          </div>

          {/* Action Bet / Cashout Button */}
          <div className="mt-6 pt-4 border-t border-slate-800">
            {hasBet && gameState === 'flying' && !userCashedOut ? (
              <button
                onClick={() => handleCashout()}
                className="w-full py-4 rounded-xl font-black text-base bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 hover:brightness-110 text-black shadow-lg shadow-emerald-500/30 flex flex-col items-center justify-center cursor-pointer active:scale-95 animate-pulse"
              >
                <span>ЗАБРАТЬ ВЫИГРЫШ</span>
                <span className="text-xs font-mono font-extrabold mt-0.5">
                  +{Math.round(betAmount * multiplier).toLocaleString('ru-RU')} AC ({multiplier.toFixed(2)}x)
                </span>
              </button>
            ) : userCashedOut && (gameState === 'flying' || gameState === 'crashed') ? (
              <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-center space-y-1">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
                  ✓ Выигрыш зафиксирован ({cashedOutMultiplier?.toFixed(2)}x)
                </span>
                <div className="text-xl font-mono font-black text-white">
                  +{Math.round(betAmount * (cashedOutMultiplier || 1)).toLocaleString('ru-RU')} AC
                </div>
                <span className="text-[11px] text-slate-400 block pt-1 border-t border-emerald-500/30">
                  {gameState === 'flying' ? 'Ожидание крушения ракеты для новой ставки...' : `Новый раунд через ${countdown}с`}
                </span>
              </div>
            ) : gameState === 'flying' && !hasBet ? (
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center text-slate-400">
                <span className="text-xs font-bold block text-slate-300">Раунд уже идёт</span>
                <span className="text-[11px] block mt-1">
                  Вы сможете сделать ставку на следующий взлёт после окончания текущего!
                </span>
              </div>
            ) : gameState === 'crashed' ? (
              <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/40 text-center space-y-1">
                <span className="text-xs font-bold text-red-400 uppercase tracking-wider block">
                  Ракета разбилась ({multiplier.toFixed(2)}x)
                </span>
                <span className="text-xs text-slate-300 block">
                  Следующий раунд начнётся через {countdown}с
                </span>
              </div>
            ) : gameState === 'waiting' && hasBet ? (
              <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-center space-y-1">
                <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Ставка принята: {betAmount.toLocaleString('ru-RU')} AC</span>
                </div>
                <span className="text-sm text-white font-mono font-black block mt-1">
                  Взлёт через {countdown}с...
                </span>
                <span className="text-[10px] text-slate-400 block">
                  Ракета стартует автоматически после окончания таймера
                </span>
              </div>
            ) : (
              <button
                onClick={handlePlaceBet}
                disabled={userBalance < betAmount || hasBet}
                className="w-full py-4 rounded-xl font-black text-base bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:from-amber-400 hover:to-orange-400 text-black shadow-lg shadow-amber-500/25 flex flex-col items-center justify-center cursor-pointer active:scale-95 disabled:opacity-50"
              >
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  <span>ПОСТАВИТЬ СТАВКУ И ИГРАТЬ</span>
                </div>
                <span className="text-xs font-mono font-bold mt-0.5">
                  {betAmount.toLocaleString('ru-RU')} AC {gameState === 'waiting' ? `• До старта ${countdown}с` : ''}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Center: Live Flight Display */}
        <div className="lg:col-span-8 rounded-2xl bg-[#0a0e17] border border-slate-800 p-6 flex flex-col justify-between relative overflow-hidden shadow-2xl min-h-[420px]">
          {/* Subtle Grid Watermark */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

          {/* Canvas Rocket Curve */}
          <div className="relative w-full h-72 flex items-center justify-center">
            <canvas
              ref={canvasRef}
              width={750}
              height={300}
              className="absolute inset-0 w-full h-full object-contain pointer-events-none"
            />

            {/* Giant Center Multiplier Display */}
            <div className="relative z-10 flex flex-col items-center justify-center select-none">
              {gameState === 'crashed' ? (
                <div className="text-center animate-bounce">
                  <div className="text-5xl sm:text-7xl font-black font-mono text-red-500 drop-shadow-[0_0_25px_rgba(239,68,68,0.7)]">
                    {multiplier.toFixed(2)}x
                  </div>
                  <div className="mt-2 text-sm font-bold uppercase tracking-wider text-red-400 flex items-center gap-1.5 justify-center">
                    <AlertOctagon className="w-4 h-4" />
                    <span>CRASHED! Новый раунд через {countdown}с</span>
                  </div>
                </div>
              ) : gameState === 'flying' ? (
                <div className="text-center">
                  <div className="text-6xl sm:text-8xl font-black font-mono text-amber-400 drop-shadow-[0_0_35px_rgba(245,158,11,0.6)]">
                    {multiplier.toFixed(2)}x
                  </div>
                  <div className="mt-2 text-xs font-bold uppercase tracking-widest text-emerald-400 animate-pulse flex items-center justify-center gap-1.5">
                    <TrendingUp className="w-4 h-4" />
                    <span>РАКЕТА НАБИРАЕТ ВЫСОТУ</span>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <div className="text-6xl sm:text-7xl font-black font-mono text-amber-400 drop-shadow-[0_0_25px_rgba(245,158,11,0.5)]">
                    {countdown}с
                  </div>
                  <div className="mt-2 text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-center gap-1.5">
                    <Rocket className="w-4 h-4 text-amber-400 animate-pulse" />
                    <span>Приём ставок открыт! До взлёта {countdown}с</span>
                  </div>
                  <div className="w-48 h-2 bg-slate-800 rounded-full mx-auto mt-3 overflow-hidden border border-slate-700/60">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-1000 ease-linear rounded-full"
                      style={{ width: `${Math.max(0, Math.min(100, (countdown / 10) * 100))}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Bets Feed / Active Players */}
          <div className="mt-4 pt-4 border-t border-slate-800/80">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-amber-400" />
                Ставки игроков в раунде ({players.length})
              </span>
              <span className="font-mono text-slate-400">
                Provably Fair 256-bit SHA
              </span>
            </div>

            {players.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 text-center text-xs text-slate-500 py-6">
                <Users className="w-5 h-5 mx-auto mb-1.5 text-slate-600" />
                <span>Ожидание ставок реальных игроков... Сделайте ставку на следующий раунд!</span>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {players.map((p) => {
                  const isCashed = p.cashedOutAt !== null;
                  const isUser = p.id === 'user-me';

                  return (
                    <div
                      key={p.id}
                      className={`p-2 rounded-lg border text-xs flex items-center justify-between ${
                        isUser
                          ? 'border-amber-400 bg-amber-500/10'
                          : isCashed
                          ? 'border-emerald-500/30 bg-emerald-950/20'
                          : 'border-slate-800 bg-slate-900/60'
                      }`}
                    >
                      <div className="truncate mr-2">
                        <span className={`font-semibold truncate block ${isUser ? 'text-amber-300' : 'text-slate-300'}`}>
                          {p.name}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {p.bet} AC
                        </span>
                      </div>

                      <div className="text-right shrink-0">
                        {isCashed ? (
                          <span className="text-[11px] font-mono font-bold text-emerald-400">
                            {p.cashedOutAt}x
                          </span>
                        ) : gameState === 'crashed' ? (
                          <span className="text-[10px] font-mono text-red-400">
                            Крах
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-500">
                            В игре...
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
