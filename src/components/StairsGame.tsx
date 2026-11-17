import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { sound } from '../utils/audio';
import { Coins, ChevronDown, ChevronUp, HelpCircle, AlertTriangle, CheckCircle2, Zap } from 'lucide-react';

interface StairsGameProps {
  userBalance: number;
  onDeductBalance: (amount: number) => void;
  onAddBalance: (amount: number) => void;
}

// 12 rungs configuration based on user screenshot
// Each row has a set number of step segments (pill blocks)
const ROW_SEGMENTS_COUNT = [11, 11, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2];

// Multipliers for different stone counts (rows 0 bottom to 11 top)
// 3 stones matches the exact values in user's screenshot:
// [1.12, 1.33, 1.6, 1.94, 2.39, 2.99, 3.81, 4.95, 6.6, 9.08, 12.97, 19.46]
const STONES_MULTIPLIERS: Record<number, number[]> = {
  1: [1.01, 1.05, 1.10, 1.18, 1.30, 1.45, 1.65, 1.90, 2.25, 2.80, 3.70, 5.20],
  2: [1.03, 1.12, 1.25, 1.42, 1.65, 2.00, 2.40, 3.05, 3.90, 5.20, 7.40, 10.80],
  3: [1.08, 1.22, 1.45, 1.75, 2.15, 2.70, 3.45, 4.50, 6.10, 8.40, 11.90, 17.50],
  4: [1.12, 1.38, 1.72, 2.25, 3.00, 4.00, 5.50, 7.80, 11.60, 18.20, 29.50, 53.00],
  5: [1.20, 1.58, 2.15, 3.00, 4.25, 6.30, 9.40, 15.50, 26.00, 48.00, 95.00, 220.00],
  6: [1.30, 1.82, 2.70, 4.15, 6.60, 11.00, 19.50, 36.00, 71.00, 155.00, 380.00, 1050.00],
  7: [1.42, 2.25, 3.75, 6.60, 12.00, 23.00, 48.00, 105.00, 270.00, 750.00, 2300.00, 7800.00],
};

interface StepRow {
  segments: ('idle' | 'safe' | 'stone')[];
  stoneIndices: number[];
}

export const StairsGame: React.FC<StairsGameProps> = ({
  userBalance,
  onDeductBalance,
  onAddBalance,
}) => {
  const [betAmount, setBetAmount] = useState<number>(100);
  const [stoneCount, setStoneCount] = useState<number>(3);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentRow, setCurrentRow] = useState<number>(0); // 0 to 11
  const [selectedSegmentByRow, setSelectedSegmentByRow] = useState<Record<number, number>>({});
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [wonPayout, setWonPayout] = useState<number | null>(null);
  const [wonMultiplier, setWonMultiplier] = useState<number | null>(null);
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState<boolean>(false);

  // Generate 12 rows with random stone hazards based on stoneCount
  const [ladderData, setLadderData] = useState<StepRow[]>(() => {
    return ROW_SEGMENTS_COUNT.map((segCount) => {
      const stoneIndices: number[] = [];
      const safeStoneCount = Math.min(stoneCount, Math.max(1, segCount - 1));
      while (stoneIndices.length < safeStoneCount) {
        const randIdx = Math.floor(Math.random() * segCount);
        if (!stoneIndices.includes(randIdx)) {
          stoneIndices.push(randIdx);
        }
      }
      return {
        segments: Array(segCount).fill('idle'),
        stoneIndices,
      };
    });
  });

  const activeMultipliers = STONES_MULTIPLIERS[stoneCount] || STONES_MULTIPLIERS[3];

  const handleStartGame = () => {
    if (betAmount < 1 || userBalance < betAmount || isPlaying) return;

    onDeductBalance(betAmount);

    // Generate fresh ladder with random stone positions
    const newLadder: StepRow[] = ROW_SEGMENTS_COUNT.map((segCount) => {
      const stoneIndices: number[] = [];
      const safeStoneCount = Math.min(stoneCount, Math.max(1, segCount - 1));
      while (stoneIndices.length < safeStoneCount) {
        const randIdx = Math.floor(Math.random() * segCount);
        if (!stoneIndices.includes(randIdx)) {
          stoneIndices.push(randIdx);
        }
      }
      return {
        segments: Array(segCount).fill('idle'),
        stoneIndices,
      };
    });

    setLadderData(newLadder);
    setCurrentRow(0);
    setSelectedSegmentByRow({});
    setIsPlaying(true);
    setGameOver(false);
    setWonPayout(null);
    setWonMultiplier(null);
    sound.playOpen();
  };

  const handleSegmentClick = (rowIndex: number, segIndex: number) => {
    if (!isPlaying || gameOver || rowIndex !== currentRow) return;

    const row = ladderData[rowIndex];
    const isStone = row.stoneIndices.includes(segIndex);

    const updatedData = [...ladderData];
    setSelectedSegmentByRow((prev) => ({ ...prev, [rowIndex]: segIndex }));

    if (isStone) {
      // HIT A STONE! Loss
      updatedData[rowIndex].segments[segIndex] = 'stone';
      // reveal stones on this row
      row.stoneIndices.forEach((idx) => {
        updatedData[rowIndex].segments[idx] = 'stone';
      });

      setLadderData(updatedData);
      setIsPlaying(false);
      setGameOver(true);
      sound.playCrashExplosion();
    } else {
      // SAFE STEP!
      updatedData[rowIndex].segments[segIndex] = 'safe';
      sound.playTick();
      setLadderData(updatedData);

      if (rowIndex === 11) {
        // Reached top rung (Row 12 / index 11)! Auto-Cashout
        handleCashout(rowIndex);
      } else {
        setCurrentRow(rowIndex + 1);
      }
    }
  };

  const handleCashout = (rowToCash = currentRow - 1) => {
    if (!isPlaying || rowToCash < 0) return;

    const mult = activeMultipliers[rowToCash];
    const payout = Math.round(betAmount * mult);

    sound.playWin(true);
    onAddBalance(payout);
    setWonPayout(payout);
    setWonMultiplier(mult);
    setIsPlaying(false);
    setGameOver(true);

    confetti({
      particleCount: 75,
      spread: 75,
      origin: { y: 0.6 },
      colors: ['#3b82f6', '#10b981', '#f59e0b', '#ffffff'],
    });
  };

  const currentMultiplier = currentRow > 0 ? activeMultipliers[currentRow - 1] : 1.00;

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 py-6 select-none animate-fade-in">
      {/* Title & How to Play Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-red-500/20 text-red-500 border border-red-500/30 flex items-center justify-center font-black">
            {/* Red Ladder Icon */}
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M7 2v2h2v4H7v2h2v4H7v2h2v4H7v2h10v-2h-2v-4h2v-2h-2v-4h2V8h-2V4h2V2H7zm4 4h2v2h-2V6zm0 6h2v2h-2v-2zm0 6h2v2h-2v-2z" />
            </svg>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide font-display">
            Мини-игра Лесенка
          </h1>
        </div>

        {/* How to Play Toggle */}
        <div className="relative">
          <button
            onClick={() => setIsHowToPlayOpen((prev) => !prev)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#171822] hover:bg-[#202230] border border-slate-800 text-xs font-semibold text-slate-300 transition cursor-pointer"
          >
            <span>Как играть?</span>
            {isHowToPlayOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {isHowToPlayOpen && (
            <div className="absolute right-0 top-10 z-30 w-80 p-4 rounded-2xl bg-[#171a25] border border-slate-700 shadow-2xl text-xs text-slate-300 space-y-2 animate-fade-in">
              <div className="font-bold text-white flex items-center gap-1.5 text-sm">
                <HelpCircle className="w-4 h-4 text-amber-400" />
                <span>Правила мини-игры «Лесенка»</span>
              </div>
              <p>
                1. Выберите <b>сумму ставки</b> и <b>количество камней</b> (от 1 до 7).
              </p>
              <p>
                2. Нажимайте на плашки ступеней снизу вверх. Избегайте скрытых камней!
              </p>
              <p>
                3. С каждой безопасной ступенью ваш множитель растёт. Вы можете <b>забрать выигрыш в любой момент</b>!
              </p>
              <p className="text-[11px] text-amber-400 font-semibold pt-1 border-t border-slate-800">
                Добравшись до 12-й верхней ступени, вы срываете максимальный джекпот!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Main Game Grid: Left Ladder Arena, Right Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* LEFT: LADDER ARENA (12 rows, pyramid tapering upwards) */}
        <div className="lg:col-span-8 rounded-3xl bg-[#161822] border border-[#232736] p-4 sm:p-6 shadow-2xl relative overflow-hidden">
          {/* Subtle arena background pattern */}
          <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

          {/* 12 Rows rendered from Top (11) down to Bottom (0) */}
          <div className="space-y-2 relative z-10">
            {[11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0].map((rowIndex) => {
              const segCount = ROW_SEGMENTS_COUNT[rowIndex];
              const mult = activeMultipliers[rowIndex];
              const isCurrent = isPlaying && currentRow === rowIndex;
              const isPassed = isPlaying && currentRow > rowIndex;
              const rowData = ladderData[rowIndex];

              return (
                <div key={rowIndex} className="flex items-center gap-3">
                  {/* Left Multiplier Badge */}
                  <div
                    className={`w-16 sm:w-20 py-1 rounded-xl text-center font-mono font-bold text-xs shrink-0 transition-all ${
                      isCurrent
                        ? 'bg-cyan-500/25 border border-cyan-400 text-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.4)] scale-105'
                        : isPassed
                        ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
                        : 'bg-[#202330] border border-[#2a2f42] text-slate-400'
                    }`}
                  >
                    X{mult.toString().replace('.', ',')}
                  </div>

                  {/* Horizontal Ladder Step Segments */}
                  <div className="flex-1 flex items-center justify-center gap-1 sm:gap-2 px-1 sm:px-2">
                    {Array.from({ length: segCount }).map((_, segIdx) => {
                      const segStatus = rowData.segments[segIdx];
                      const isSelected = selectedSegmentByRow[rowIndex] === segIdx;

                      return (
                        <button
                          key={segIdx}
                          disabled={!isCurrent}
                          onClick={() => handleSegmentClick(rowIndex, segIdx)}
                          className={`flex-1 h-5 sm:h-6 rounded-full transition-all duration-200 relative ${
                            segStatus === 'safe'
                              ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_12px_rgba(16,185,129,0.9)] scale-105'
                              : segStatus === 'stone'
                              ? 'bg-gradient-to-r from-red-600 to-rose-500 shadow-[0_0_12px_rgba(239,68,68,0.9)] animate-pulse'
                              : isCurrent
                              ? 'bg-[#3b435b] hover:bg-cyan-400 hover:shadow-[0_0_16px_rgba(6,182,212,0.8)] cursor-pointer active:scale-95 ring-1 ring-cyan-400/40'
                              : isPassed
                              ? 'bg-[#282d3d] opacity-50'
                              : 'bg-[#1e222f] opacity-80'
                          }`}
                          title={isCurrent ? `Ступень ${segIdx + 1} (Нажмите чтобы наступить)` : undefined}
                        >
                          {segStatus === 'stone' && (
                            <span className="absolute inset-0 flex items-center justify-center text-[10px]">🪨</span>
                          )}
                          {segStatus === 'safe' && (
                            <span className="absolute inset-0 flex items-center justify-center text-[10px] text-black font-black">✓</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* In-game footer status */}
          {isPlaying && (
            <div className="mt-4 pt-3 border-t border-[#232736] flex items-center justify-between text-xs">
              <span className="text-slate-400">
                Текущая ступень: <b className="text-cyan-400 font-mono">{currentRow + 1} / 12</b>
              </span>
              <span className="text-slate-300 font-mono">
                Текущий множитель: <b className="text-emerald-400 font-bold">{currentMultiplier.toFixed(2)}x</b>
              </span>
            </div>
          )}
        </div>

        {/* RIGHT: CONTROLS PANEL */}
        <div className="lg:col-span-4 rounded-3xl bg-[#161822] border border-[#232736] p-5 shadow-2xl space-y-5">
          
          {/* 1. Сумма ставки */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-5 h-5 rounded-md bg-red-500/20 text-red-500 flex items-center justify-center">
                <Coins className="w-3.5 h-3.5" />
              </div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Сумма ставки
              </label>
            </div>

            <div className="relative">
              <input
                type="number"
                min="1"
                max={userBalance}
                value={betAmount || ''}
                placeholder="Сумма ставки..."
                disabled={isPlaying}
                onChange={(e) => {
                  const val = e.target.value === '' ? 0 : Number(e.target.value);
                  setBetAmount(val);
                }}
                className="w-full bg-[#10121a] border border-[#2a2f42] rounded-2xl px-4 py-3 text-base font-mono font-bold text-white focus:outline-none focus:border-blue-500 transition shadow-inner"
              />

              {/* Currency Selector (Gold bar icon from screenshot) */}
              <div className="absolute right-2 top-2 px-2.5 py-1.5 rounded-xl bg-[#1e2230] border border-[#2c3246] flex items-center gap-1.5 text-xs text-amber-400 font-bold font-mono">
                <span>🧈</span>
                <span className="text-slate-300 text-[11px]">AC</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </div>
            </div>

            {/* Quick Stake Buttons */}
            <div className="grid grid-cols-4 gap-1.5 mt-2">
              <button
                type="button"
                disabled={isPlaying}
                onClick={() => setBetAmount(Math.max(1, Math.floor(betAmount / 2)))}
                className="py-1.5 rounded-xl bg-[#202330] hover:bg-[#2b3042] text-xs font-bold text-slate-300 transition cursor-pointer"
              >
                ½
              </button>
              <button
                type="button"
                disabled={isPlaying}
                onClick={() => setBetAmount(Math.min(userBalance, Math.max(1, betAmount * 2)))}
                className="py-1.5 rounded-xl bg-[#202330] hover:bg-[#2b3042] text-xs font-bold text-slate-300 transition cursor-pointer"
              >
                2X
              </button>
              <button
                type="button"
                disabled={isPlaying}
                onClick={() => setBetAmount(10)}
                className="py-1.5 rounded-xl bg-[#202330] hover:bg-[#2b3042] text-xs font-bold text-slate-300 transition cursor-pointer"
              >
                Min
              </button>
              <button
                type="button"
                disabled={isPlaying}
                onClick={() => setBetAmount(userBalance)}
                className="py-1.5 rounded-xl bg-[#202330] hover:bg-[#2b3042] text-xs font-bold text-amber-400 transition cursor-pointer"
              >
                Max
              </button>
            </div>
          </div>

          {/* 2. Кол-во камней (Buttons 1 to 7 matching screenshot) */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-5 h-5 rounded-md bg-red-500/20 text-red-500 flex items-center justify-center">
                <Coins className="w-3.5 h-3.5" />
              </div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Кол-во камней
              </label>
            </div>

            <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
              {[1, 2, 3, 4, 5, 6, 7].map((num) => {
                const isSelected = stoneCount === num;
                return (
                  <button
                    key={num}
                    type="button"
                    disabled={isPlaying}
                    onClick={() => {
                      setStoneCount(num);
                      sound.playTick();
                    }}
                    className={`h-10 rounded-xl font-black text-sm transition cursor-pointer flex items-center justify-center ${
                      isSelected
                        ? 'bg-white text-slate-900 shadow-md font-black scale-105'
                        : 'bg-[#202330] hover:bg-[#282d3d] text-slate-300'
                    }`}
                  >
                    {num}
                  </button>
                );
              })}
            </div>
            <div className="text-[11px] text-slate-400 mt-1.5 text-right font-mono">
              Макс. множитель: <b className="text-amber-400">X{activeMultipliers[11]}</b>
            </div>
          </div>

          {/* 3. Action Button (Big Blue "Начать игру" from screenshot or "Забрать выигрыш") */}
          <div className="pt-2">
            {isPlaying ? (
              <button
                type="button"
                onClick={() => handleCashout()}
                disabled={currentRow === 0}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 hover:brightness-110 text-black font-black text-base shadow-xl shadow-emerald-500/30 flex flex-col items-center justify-center cursor-pointer transition active:scale-95 disabled:opacity-50 animate-pulse"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>ЗАБРАТЬ ВЫИГРЫШ</span>
                </div>
                <span className="text-xs font-mono font-extrabold mt-0.5">
                  +{Math.round(betAmount * currentMultiplier).toLocaleString('ru-RU')} AC ({currentMultiplier.toFixed(2)}x)
                </span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleStartGame}
                disabled={userBalance < betAmount}
                className="w-full py-4 rounded-2xl bg-[#3b82f6] hover:bg-[#2563eb] text-white font-black text-lg tracking-wide shadow-xl shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer transition active:scale-95 disabled:opacity-50"
              >
                <span>Начать игру</span>
              </button>
            )}
          </div>

          {/* Outcome notification cards */}
          {wonPayout !== null && (
            <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-center animate-fade-in">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
                УСПЕШНЫЙ ВЫИГРЫШ!
              </span>
              <span className="text-2xl font-mono font-black text-white block mt-1">
                +{wonPayout.toLocaleString('ru-RU')} AC ({wonMultiplier?.toFixed(2)}x)
              </span>
            </div>
          )}

          {gameOver && wonPayout === null && (
            <div className="p-4 rounded-2xl bg-red-500/20 border border-red-500/40 text-center animate-fade-in">
              <span className="text-xs font-bold text-red-400 uppercase tracking-wider block">
                УПАЛ КАМЕНЬ!
              </span>
              <span className="text-xs text-slate-300 mt-1 block">
                Ступень разрушена. Попробуйте снова!
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
