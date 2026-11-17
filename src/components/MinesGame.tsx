import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { sound } from '../utils/audio';
import { Bomb, Gem, Zap, RotateCcw, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface MinesGameProps {
  userBalance: number;
  onDeductBalance: (amount: number) => void;
  onAddBalance: (amount: number) => void;
}

interface TileState {
  revealed: boolean;
  isMine: boolean;
}

export const MinesGame: React.FC<MinesGameProps> = ({
  userBalance,
  onDeductBalance,
  onAddBalance,
}) => {
  const [betAmount, setBetAmount] = useState<number>(100);
  const [mineCount, setMineCount] = useState<number>(3);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [wonAmount, setWonAmount] = useState<number | null>(null);

  // 25 tiles (5x5 grid)
  const [grid, setGrid] = useState<TileState[]>(() =>
    Array(25).fill(null).map(() => ({ revealed: false, isMine: false }))
  );
  const [gemsFound, setGemsFound] = useState<number>(0);

  // Calculate multiplier based on gems found and total mines
  const calculateMultiplier = (revealedGems: number, mines: number): number => {
    if (revealedGems === 0) return 1.00;
    let mult = 1.00;
    for (let i = 0; i < revealedGems; i++) {
      mult *= (25 - i) / (25 - mines - i);
    }
    // 0.88 house edge (stricter)
    return Number((mult * 0.88).toFixed(2));
  };

  const currentMultiplier = calculateMultiplier(gemsFound, mineCount);
  const nextMultiplier = calculateMultiplier(gemsFound + 1, mineCount);

  // Start new game
  const handleStartGame = () => {
    if (betAmount < 1 || userBalance < betAmount || isPlaying) return;

    onDeductBalance(betAmount);

    // Randomly place `mineCount` mines in 25 tiles
    const indices = Array.from({ length: 25 }, (_, i) => i);
    // Shuffle
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    const mineIndices = new Set(indices.slice(0, mineCount));

    const newGrid: TileState[] = Array(25).fill(null).map((_, idx) => ({
      revealed: false,
      isMine: mineIndices.has(idx),
    }));

    setGrid(newGrid);
    setGemsFound(0);
    setIsPlaying(true);
    setGameOver(false);
    setWonAmount(null);
    sound.playOpen();
  };

  // Click a tile
  const handleTileClick = (index: number) => {
    if (!isPlaying || gameOver || grid[index].revealed) return;

    const target = grid[index];

    if (target.isMine) {
      // BOOM!
      sound.playCrashExplosion();
      setGameOver(true);
      setIsPlaying(false);
      // Reveal all mines
      setGrid(prev =>
        prev.map(t => ({ ...t, revealed: true }))
      );
    } else {
      // GEM!
      sound.playTick();
      const nextGems = gemsFound + 1;
      setGemsFound(nextGems);

      setGrid(prev => {
        const next = [...prev];
        next[index] = { ...next[index], revealed: true };
        return next;
      });

      // If all safe tiles found -> auto win
      if (nextGems === 25 - mineCount) {
        handleCashout(nextGems);
      }
    }
  };

  // Cashout
  const handleCashout = (gemsCount = gemsFound) => {
    if (!isPlaying || gameOver || gemsCount === 0) return;

    const mult = calculateMultiplier(gemsCount, mineCount);
    const payout = Math.round(betAmount * mult);

    sound.playWin(true);
    onAddBalance(payout);
    setWonAmount(payout);
    setIsPlaying(false);
    setGameOver(true);

    // Reveal rest of grid
    setGrid(prev => prev.map(t => ({ ...t, revealed: true })));

    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#10b981', '#f59e0b', '#ffffff'],
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Title */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Bomb className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-black text-white uppercase font-display tracking-wide">
              Режим «Мины» (Mines)
            </h1>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Открывайте безопасные ячейки с алмазами 💎 и забирайте выигрыш в любой момент до взрыва мины!
          </p>
        </div>

        {isPlaying && (
          <div className="flex items-center gap-4 bg-[#111726] p-3 rounded-xl border border-slate-800">
            <div>
              <span className="text-[11px] text-slate-400 block">Текущий множитель</span>
              <span className="text-xl font-bold font-mono text-emerald-400">{currentMultiplier}x</span>
            </div>
            <div className="h-8 w-px bg-slate-800" />
            <div>
              <span className="text-[11px] text-slate-400 block">Следующий шаг</span>
              <span className="text-xl font-bold font-mono text-amber-400">{nextMultiplier}x</span>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Controls Column */}
        <div className="lg:col-span-4 rounded-2xl bg-[#0f1422] border border-slate-800 p-5 shadow-xl space-y-5">
          {/* Bet Input */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Сумма ставки
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
                disabled={isPlaying}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-base font-mono font-bold text-white focus:outline-none focus:border-emerald-500"
              />
              <span className="absolute right-3.5 top-3 text-xs font-bold text-amber-400 font-mono">AC</span>
            </div>

            <div className="grid grid-cols-4 gap-1.5 mt-2">
              <button
                type="button"
                disabled={isPlaying}
                onClick={() => setBetAmount(Math.max(1, Math.floor(betAmount / 2)))}
                className="py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 cursor-pointer"
              >
                ½
              </button>
              <button
                type="button"
                disabled={isPlaying}
                onClick={() => setBetAmount(Math.min(userBalance, Math.max(1, betAmount * 2)))}
                className="py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 cursor-pointer"
              >
                2X
              </button>
              <button
                type="button"
                disabled={isPlaying}
                onClick={() => setBetAmount(1)}
                className="py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 cursor-pointer"
              >
                1 AC
              </button>
              <button
                type="button"
                disabled={isPlaying}
                onClick={() => setBetAmount(userBalance)}
                className="py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-amber-400 cursor-pointer"
              >
                MAX
              </button>
            </div>
          </div>

          {/* Mine Count Select */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Количество мин на поле (1 - 24):
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {[1, 3, 5, 10, 15].map((cnt) => (
                <button
                  key={cnt}
                  type="button"
                  disabled={isPlaying}
                  onClick={() => setMineCount(cnt)}
                  className={`py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                    mineCount === cnt
                      ? 'bg-red-500 text-black font-extrabold shadow-md'
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {cnt} 💣
                </button>
              ))}
            </div>
          </div>

          {/* Game Action Buttons */}
          <div className="pt-2 border-t border-slate-800">
            {isPlaying ? (
              <button
                onClick={() => handleCashout()}
                disabled={gemsFound === 0}
                className="w-full py-4 rounded-xl font-black text-base bg-gradient-to-r from-emerald-500 to-teal-400 hover:brightness-110 text-black shadow-lg shadow-emerald-500/30 flex flex-col items-center justify-center cursor-pointer active:scale-95 disabled:opacity-50 animate-pulse"
              >
                <span>ЗАБРАТЬ ВЫИГРЫШ</span>
                <span className="text-xs font-mono font-extrabold mt-0.5">
                  +{Math.round(betAmount * currentMultiplier).toLocaleString('ru-RU')} AC ({currentMultiplier}x)
                </span>
              </button>
            ) : (
              <button
                onClick={handleStartGame}
                disabled={userBalance < betAmount}
                className="w-full py-4 rounded-xl font-black text-base bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:from-amber-400 hover:to-orange-400 text-black shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
              >
                <Zap className="w-5 h-5" />
                <span>НАЧАТЬ ИГРУ ({betAmount} AC)</span>
              </button>
            )}
          </div>

          {wonAmount !== null && (
            <div className="p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-center animate-fade-in">
              <span className="text-xs font-bold text-emerald-400 block">ПОБЕДА!</span>
              <span className="text-xl font-mono font-black text-white">
                +{wonAmount.toLocaleString('ru-RU')} AC ({currentMultiplier}x)
              </span>
            </div>
          )}

          {gameOver && wonAmount === null && (
            <div className="p-3.5 rounded-xl bg-red-500/20 border border-red-500/40 text-center animate-fade-in">
              <span className="text-xs font-bold text-red-400 block">ВЫ ПОДОРВАЛИСЬ НА МИНЕ!</span>
              <span className="text-xs text-slate-400 mt-1 block">Ставка {betAmount} AC сгорела. Попробуйте снова!</span>
            </div>
          )}
        </div>

        {/* 5x5 Grid Arena */}
        <div className="lg:col-span-8 rounded-2xl bg-[#0a0e17] border border-slate-800 p-6 flex flex-col items-center justify-center shadow-2xl">
          <div className="grid grid-cols-5 gap-2.5 sm:gap-3.5 w-full max-w-[440px]">
            {grid.map((tile, idx) => {
              const isRevealed = tile.revealed;
              const isMine = tile.isMine;

              return (
                <button
                  key={idx}
                  disabled={!isPlaying || isRevealed}
                  onClick={() => handleTileClick(idx)}
                  className={`aspect-square rounded-2xl font-black text-2xl flex items-center justify-center transition-all duration-200 select-none shadow-md ${
                    !isRevealed
                      ? isPlaying
                        ? 'bg-[#141b2a] hover:bg-[#1a2337] border border-slate-700/80 hover:border-amber-400/60 cursor-pointer hover:scale-105 active:scale-95'
                        : 'bg-[#111724] border border-slate-800 cursor-not-allowed opacity-90'
                      : isMine
                      ? 'bg-red-950/80 border-2 border-red-500 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.5)] animate-shake'
                      : 'bg-emerald-950/80 border-2 border-emerald-400 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.5)] animate-pop'
                  }`}
                >
                  {isRevealed ? (
                    isMine ? (
                      <span className="text-2xl">💣</span>
                    ) : (
                      <span className="text-2xl drop-shadow-[0_0_8px_#10b981]">💎</span>
                    )
                  ) : (
                    <span className="text-slate-700 text-xs font-mono font-normal">
                      {idx + 1}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-6 flex items-center gap-6 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <span>💎</span> Алмазов найдено: <strong className="text-emerald-400 font-mono">{gemsFound} / {25 - mineCount}</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <span>💣</span> Мин на поле: <strong className="text-red-400 font-mono">{mineCount}</strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
