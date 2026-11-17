import React, { useState } from 'react';
import { CASES, calculateCaseStats, rollCaseItem } from '../data/cases';
import { CaseDefinition, SimResult, ItemRarity } from '../types';
import { RARITY_CONFIG } from '../data/skins';
import { BarChart3, TrendingDown, Play, RotateCcw, AlertTriangle, CheckCircle, ShieldAlert } from 'lucide-react';

export const MathAnalyzer: React.FC = () => {
  const [selectedCase, setSelectedCase] = useState<CaseDefinition>(CASES[1]); // Bull Starter
  const [iterations, setIterations] = useState<100 | 500 | 1000>(100);
  const [simResult, setSimResult] = useState<SimResult | null>(null);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  const stats = calculateCaseStats(selectedCase);

  const runSimulation = () => {
    setIsSimulating(true);

    setTimeout(() => {
      let totalSpent = 0;
      let totalWon = 0;
      let bestDrop = selectedCase.items[0].skin;
      let currentBalance = 0;

      const dropsByRarity: Record<ItemRarity, number> = {
        rare: 0,
        super_rare: 0,
        epic: 0,
        legendary: 0,
        arcana: 0,
        secret: 0,
      };

      const history: { openIndex: number; balance: number; won: number }[] = [];

      for (let i = 1; i <= iterations; i++) {
        totalSpent += selectedCase.price;
        const skin = rollCaseItem(selectedCase);
        totalWon += skin.price;

        const r = skin.rarity as ItemRarity;
        if (dropsByRarity[r] !== undefined) {
          dropsByRarity[r] = dropsByRarity[r] + 1;
        }

        if (skin.price > bestDrop.price) {
          bestDrop = skin;
        }

        currentBalance += skin.price - selectedCase.price;

        // sample history points
        if (i % Math.max(1, Math.floor(iterations / 40)) === 0 || i === iterations) {
          history.push({
            openIndex: i,
            balance: currentBalance,
            won: skin.price,
          });
        }
      }

      const netProfit = totalWon - totalSpent;
      const rtpPercentage = totalSpent > 0 ? (totalWon / totalSpent) * 100 : 100;

      setSimResult({
        totalOpens: iterations,
        totalSpent,
        totalWon,
        netProfit,
        rtpPercentage: Number(rtpPercentage.toFixed(2)),
        bestDrop,
        dropsByRarity,
        history,
      });

      setIsSimulating(false);
    }, 250);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Title */}
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <BarChart3 className="w-5 h-5" />
          </span>
          <h1 className="text-2xl font-black text-white uppercase font-display tracking-wide">
            Математика & RTP (Симулятор шансов)
          </h1>
        </div>
        <p className="text-sm text-slate-400 mt-1">
          Научный и прозрачный разбор экономики кейсов GameVia: метод Монте-Карло, маржа платформы и реальное матожидание.
        </p>
      </div>

      {/* Control Box */}
      <div className="rounded-2xl bg-[#111726] border border-slate-800 p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          {/* Select Case */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Выберите кейс для симуляции:
            </label>
            <select
              value={selectedCase.id}
              onChange={(e) => {
                const found = CASES.find(c => c.id === e.target.value);
                if (found) {
                  setSelectedCase(found);
                  setSimResult(null);
                }
              }}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none cursor-pointer"
            >
              {CASES.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.price === 0 ? 'Бесплатно' : `${c.price} AC`})
                </option>
              ))}
            </select>
          </div>

          {/* Select Iterations */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Количество открытий:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {([100, 500, 1000] as const).map(n => (
                <button
                  key={n}
                  onClick={() => setIterations(n)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition cursor-pointer ${
                    iterations === n
                      ? 'bg-amber-500 text-black'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {n} раз
                </button>
              ))}
            </div>
          </div>

          {/* Run Button */}
          <div>
            <button
              onClick={runSimulation}
              disabled={isSimulating}
              className="w-full py-2.5 px-6 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black flex items-center justify-center gap-2 shadow-lg transition cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{isSimulating ? 'Расчёт...' : `Смоделировать ${iterations} открытий`}</span>
            </button>
          </div>
        </div>

        {/* Theoretical Stats of Selected Case */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="bg-[#0b0f19] p-3 rounded-xl border border-slate-800">
            <span className="text-[11px] text-slate-400 block">Стоимость 1 кейса</span>
            <span className="text-base font-bold font-mono text-white">
              {selectedCase.price} AC
            </span>
          </div>

          <div className="bg-[#0b0f19] p-3 rounded-xl border border-slate-800">
            <span className="text-[11px] text-slate-400 block">Средний выигрыш (EV)</span>
            <span className="text-base font-bold font-mono text-amber-400">
              ~{stats.expectedValue} AC
            </span>
          </div>

          <div className="bg-[#0b0f19] p-3 rounded-xl border border-slate-800">
            <span className="text-[11px] text-slate-400 block">Теоретический RTP</span>
            <span className="text-base font-bold font-mono text-emerald-400">
              {stats.rtp}%
            </span>
          </div>

          <div className="bg-[#0b0f19] p-3 rounded-xl border border-slate-800">
            <span className="text-[11px] text-slate-400 block">Комиссия сайта (Маржа)</span>
            <span className="text-base font-bold font-mono text-red-400">
              {stats.houseEdge}%
            </span>
          </div>
        </div>
      </div>

      {/* Simulation Results Display */}
      {simResult && (
        <div className="space-y-6 animate-fade-in">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-[#111726] border border-slate-800">
              <span className="text-xs text-slate-400">Потрачено в симуляции:</span>
              <div className="text-xl font-bold font-mono text-white mt-1">
                {simResult.totalSpent.toLocaleString('ru-RU')} AC
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#111726] border border-slate-800">
              <span className="text-xs text-slate-400">Выбито скинов на сумму:</span>
              <div className="text-xl font-bold font-mono text-amber-400 mt-1">
                {simResult.totalWon.toLocaleString('ru-RU')} AC
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#111726] border border-slate-800">
              <span className="text-xs text-slate-400">Чистый итог игрока:</span>
              <div
                className={`text-xl font-bold font-mono mt-1 ${
                  simResult.netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'
                }`}
              >
                {simResult.netProfit > 0 ? '+' : ''}
                {simResult.netProfit.toLocaleString('ru-RU')} AC
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#111726] border border-slate-800">
              <span className="text-xs text-slate-400">Фактический RTP:</span>
              <div
                className={`text-xl font-bold font-mono mt-1 ${
                  simResult.rtpPercentage >= 100 ? 'text-emerald-400' : 'text-amber-400'
                }`}
              >
                {simResult.rtpPercentage}%
              </div>
            </div>
          </div>

          {/* Balance Curve Chart (Visual SVG Graph) */}
          <div className="rounded-2xl bg-[#111726] border border-slate-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">
                Динамика баланса на дистанции ({simResult.totalOpens} открытий)
              </h3>
              <span className="text-xs text-slate-400 font-mono">
                Итог: {simResult.netProfit} AC
              </span>
            </div>

            {/* SVG Sparkline */}
            <div className="w-full h-44 bg-[#0a0e16] rounded-xl p-3 border border-slate-800/80 relative flex items-center justify-center">
              {(() => {
                const points = simResult.history;
                if (points.length < 2) return null;

                const values = points.map(p => p.balance);
                const minVal = Math.min(...values, 0);
                const maxVal = Math.max(...values, 0);
                const range = (maxVal - minVal) || 1;

                const width = 800;
                const height = 140;

                const zeroY = height - ((0 - minVal) / range) * height;

                const pathCoords = points.map((p, i) => {
                  const x = (i / (points.length - 1)) * width;
                  const y = height - ((p.balance - minVal) / range) * height;
                  return `${x},${y}`;
                }).join(' L ');

                return (
                  <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
                    {/* Zero baseline */}
                    <line
                      x1="0"
                      y1={zeroY}
                      x2={width}
                      y2={zeroY}
                      stroke="#475569"
                      strokeDasharray="4 4"
                      strokeWidth="1"
                    />

                    {/* Curve */}
                    <path
                      d={`M ${pathCoords}`}
                      fill="none"
                      stroke={simResult.netProfit >= 0 ? '#10b981' : '#ef4444'}
                      strokeWidth="2.5"
                    />
                  </svg>
                );
              })()}
            </div>

            <p className="mt-3 text-xs text-slate-400 leading-relaxed">
              💡 <strong>Объяснение графика:</strong> Пунктирная линия — нулевая точка (безубыток). В подавляющем большинстве симуляций график уходит вниз из-за встроенной комиссии кейса ({stats.houseEdge}%). Резкие скачки вверх происходят только в редкие моменты выпадения Тайного оружия или Ножа.
            </p>
          </div>

          {/* Rarity Breakdown */}
          <div className="rounded-2xl bg-[#111726] border border-slate-800 p-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-4">
              Распределение выпавших редкостей:
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {(Object.keys(simResult.dropsByRarity) as ItemRarity[]).map(rarity => {
                const count = simResult.dropsByRarity[rarity];
                const percent = ((count / simResult.totalOpens) * 100).toFixed(1);
                const config = RARITY_CONFIG[rarity];

                return (
                  <div
                    key={rarity}
                    className="p-3 rounded-xl bg-[#0b0f19] border border-slate-800 text-center"
                    style={{ borderTop: `3px solid ${config.color}` }}
                  >
                    <span className="text-xs font-semibold text-slate-300 block truncate">
                      {config.label}
                    </span>
                    <span className="text-xl font-bold font-mono text-white mt-1 block">
                      {count}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {percent}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Educational Truth Section */}
      <div className="mt-8 p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30">
        <div className="flex items-start gap-3">
          <ShieldAlert className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-amber-300 text-sm">
              Почему в долгосроке игрок на сайтах кейсов всегда теряет деньги?
            </h4>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              В отличие от официальных кейсов CS2 от Valve (где фиксированная вероятность ножа 0.26%), сайты вроде GameVia сами определяют коэффициенты отдачи (RTP) каждого кейса. Обычно RTP составляет от <strong>55% до 75%</strong>. Это означает, что из каждых внесенных 1 000 Acoin сервис оставляет себе 250–450 Acoin в виде чистой математической прибыли, а игрокам в сумме выплачивает лишь оставшиеся 550–750 Acoin скинами. Выиграть можно только на короткой дистанции при огромном везении!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
