import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { sound } from '../utils/audio';
import { Layers, Zap, AlertTriangle, CheckCircle2, ChevronUp, ShieldCheck } from 'lucide-react';

interface TowerGameProps {
  userBalance: number;
  onDeductBalance: (amount: number) => void;
  onAddBalance: (amount: number) => void;
}

interface RowState {
  tiles: ('unknown' | 'safe' | 'trap')[];
  trapIndex: number;
}

const MULTIPLIERS = [1.15, 1.65, 2.45, 3.65, 5.50, 8.80, 13.50, 21.00];

export const TowerGame: React.FC<TowerGameProps> = ({
  userBalance,
  onDeductBalance,
  onAddBalance,
}) => {
  const [betAmount, setBetAmount] = useState<number>(100);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentRow, setCurrentRow] = useState<number>(0); // 0 to 7 (8 rows)
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [wonPayout, setWonPayout] = useState<number | null>(null);
  const [wonMultiplier, setWonMultiplier] = useState<number | null>(null);

  // 8 rows from bottom (0) to top (7), each row has 3 blocks (1 trap, 2 safe)
  const [towerData, setTowerData] = useState<RowState[]>(() =>
    Array(8).fill(null).map(() => ({
      tiles: ['unknown', 'unknown', 'unknown'],
      trapIndex: Math.floor(Math.random() * 3),
    }))
  );

  const startTowerGame = () => {
    if (betAmount < 1 || userBalance < betAmount || isPlaying) return;

    onDeductBalance(betAmount);

    const newRows: RowState[] = Array(8).fill(null).map(() => ({
      tiles: ['unknown', 'unknown', 'unknown'],
      trapIndex: Math.floor(Math.random() * 3),
    }));

    setTowerData(newRows);
    setCurrentRow(0);
    setIsPlaying(true);
    setGameOver(false);
    setWonPayout(null);
    setWonMultiplier(null);
    sound.playOpen();
  };

  const handleTilePick = (rowIndex: number, tileIndex: number) => {
    if (!isPlaying || gameOver || rowIndex !== currentRow) return;

    const row = towerData[rowIndex];
    const isTrap = tileIndex === row.trapIndex;

    const updatedRows = [...towerData];
    if (isTrap) {
      // FELL DOWN!
      updatedRows[rowIndex].tiles[tileIndex] = 'trap';
      // reveal rest of this row
      for (let i = 0; i < 3; i++) {
        if (i !== tileIndex) updatedRows[rowIndex].tiles[i] = 'safe';
      }

      setTowerData(updatedRows);
      setIsPlaying(false);
      setGameOver(true);
      sound.playCrashExplosion();
    } else {
      // SAFE STEP!
      updatedRows[rowIndex].tiles[tileIndex] = 'safe';
      sound.playTick();
      setTowerData(updatedRows);

      if (rowIndex === 7) {
        // REACHED THE VERY TOP!
        handleCashout(rowIndex);
      } else {
        setCurrentRow(rowIndex + 1);
      }
    }
  };

  const handleCashout = (rowToCash = currentRow - 1) => {
    if (!isPlaying || rowToCash < 0) return;

    const mult = MULTIPLIERS[rowToCash];
    const payout = Math.round(betAmount * mult);

    sound.playWin(true);
    onAddBalance(payout);
    setWonPayout(payout);
    setWonMultiplier(mult);
    setIsPlaying(false);
    setGameOver(true);

    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#06b6d4', '#f59e0b', '#ffffff'],
    });
  };

  const currentMultiplier = currentRow > 0 ? MULTIPLIERS[currentRow - 1] : 1.00;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Title */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Layers className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-black text-white uppercase font-display tracking-wide">
              Режим «Башня» (Tower)
            </h1>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Поднимайтесь по этажам высокой башни: на каждом этаже 2 безопасные плиты и 1 ловушка!
          </p>
        </div>

        {isPlaying && currentRow > 0 && (
          <div className="flex items-center gap-4 bg-[#111726] p-3 rounded-xl border border-slate-800">
            <div>
              <span className="text-[11px] text-slate-400 block">Этаж: {currentRow} / 8</span>
              <span className="text-xl font-bold font-mono text-cyan-400">{currentMultiplier}x</span>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Controls Column */}
        <div className="lg:col-span-4 rounded-2xl bg-[#0f1422] border border-slate-800 p-5 shadow-xl space-y-5">
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
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-base font-mono font-bold text-white focus:outline-none focus:border-cyan-500"
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

          <div className="pt-2 border-t border-slate-800">
            {isPlaying ? (
              <button
                onClick={() => handleCashout()}
                disabled={currentRow === 0}
                className="w-full py-4 rounded-xl font-black text-base bg-gradient-to-r from-emerald-500 to-teal-400 hover:brightness-110 text-black shadow-lg shadow-emerald-500/30 flex flex-col items-center justify-center cursor-pointer active:scale-95 disabled:opacity-50 animate-pulse"
              >
                <span>ЗАБРАТЬ ВЫИГРЫШ</span>
                <span className="text-xs font-mono font-extrabold mt-0.5">
                  +{Math.round(betAmount * currentMultiplier).toLocaleString('ru-RU')} AC ({currentMultiplier}x)
                </span>
              </button>
            ) : (
              <button
                onClick={startTowerGame}
                disabled={userBalance < betAmount}
                className="w-full py-4 rounded-xl font-black text-base bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-500 hover:from-cyan-400 hover:to-blue-400 text-black shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
              >
                <Zap className="w-5 h-5" />
                <span>НАЧАТЬ ПОДЪЁМ ({betAmount} AC)</span>
              </button>
            )}
          </div>

          {wonPayout !== null && (
            <div className="p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-center animate-fade-in">
              <span className="text-xs font-bold text-emerald-400 block">УСПЕШНЫЙ ПОДЪЁМ!</span>
              <span className="text-xl font-mono font-black text-white">
                +{wonPayout.toLocaleString('ru-RU')} AC ({wonMultiplier !== null ? wonMultiplier.toFixed(2) : currentMultiplier.toFixed(2)}x)
              </span>
            </div>
          )}

          {gameOver && wonPayout === null && (
            <div className="p-3.5 rounded-xl bg-red-500/20 border border-red-500/40 text-center animate-fade-in">
              <span className="text-xs font-bold text-red-400 block">ПАДЕНИЕ С ВЫСОТЫ!</span>
              <span className="text-xs text-slate-400 mt-1 block">Вы наступили на ловушку. Попробуйте снова!</span>
            </div>
          )}
        </div>

        {/* Tower Ladder Arena (8 Floors stacked vertically, floor 7 top, floor 0 bottom) */}
        <div className="lg:col-span-8 rounded-2xl bg-[#0a0e17] border border-slate-800 p-6 flex flex-col items-center justify-center shadow-2xl">
          <div className="w-full max-w-[460px] space-y-2">
            {[7, 6, 5, 4, 3, 2, 1, 0].map((rowIndex) => {
              const row = towerData[rowIndex];
              const isCurrent = isPlaying && currentRow === rowIndex;
              const isPassed = isPlaying && currentRow > rowIndex;
              const mult = MULTIPLIERS[rowIndex];

              return (
                <div
                  key={rowIndex}
                  className={`flex items-center gap-3 p-1.5 rounded-xl transition-all ${
                    isCurrent
                      ? 'bg-cyan-950/40 border border-cyan-500/60 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                      : isPassed
                      ? 'bg-slate-900/40 border border-emerald-500/30'
                      : 'bg-slate-900/20 border border-slate-800/60 opacity-60'
                  }`}
                >
                  {/* Multiplier Tag */}
                  <span
                    className={`w-14 text-right font-mono text-xs font-bold shrink-0 ${
                      isPassed ? 'text-emerald-400' : isCurrent ? 'text-cyan-300' : 'text-slate-500'
                    }`}
                  >
                    {mult.toFixed(2)}x
                  </span>

                  {/* 3 Step Tiles */}
                  <div className="grid grid-cols-3 gap-2 flex-1">
                    {row.tiles.map((tileStatus, tileIdx) => {
                      return (
                        <button
                          key={tileIdx}
                          disabled={!isCurrent}
                          onClick={() => handleTilePick(rowIndex, tileIdx)}
                          className={`h-11 rounded-lg font-bold text-sm flex items-center justify-center transition-all ${
                            tileStatus === 'safe'
                              ? 'bg-emerald-950/90 border-2 border-emerald-400 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.5)]'
                              : tileStatus === 'trap'
                              ? 'bg-red-950/90 border-2 border-red-500 text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.5)]'
                              : isCurrent
                              ? 'bg-cyan-900/30 hover:bg-cyan-800/40 border border-cyan-500/50 hover:border-cyan-400 cursor-pointer text-cyan-200 active:scale-95'
                              : 'bg-slate-800/50 border border-slate-700/40 text-slate-600 cursor-not-allowed'
                          }`}
                        >
                          {tileStatus === 'safe' ? (
                            <span>💎</span>
                          ) : tileStatus === 'trap' ? (
                            <span>💀</span>
                          ) : isCurrent ? (
                            <span>?</span>
                          ) : (
                            <span>·</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
