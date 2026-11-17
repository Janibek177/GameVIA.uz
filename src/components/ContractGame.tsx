import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { InventoryItem } from '../types';
import { ALL_SKINS, RARITY_CONFIG, getRarityConfig } from '../data/skins';
import { WeaponIcon } from './WeaponIcon';
import { sound } from '../utils/audio';
import { Layers, Sparkles, Plus, X, ArrowRight, RotateCw, CheckCircle } from 'lucide-react';

interface ContractGameProps {
  inventory: InventoryItem[];
  onCraftSuccess: (craftedItem: InventoryItem, consumedIds: string[]) => void;
}

export const ContractGame: React.FC<ContractGameProps> = ({ inventory, onCraftSuccess }) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isCrafting, setIsCrafting] = useState<boolean>(false);
  const [craftedResult, setCraftedResult] = useState<InventoryItem | null>(null);

  const selectedItems = inventory.filter(it => selectedIds.includes(it.instanceId));
  const totalInputCost = selectedItems.reduce((sum, it) => sum + it.price, 0);

  const toggleSelect = (instanceId: string) => {
    if (isCrafting) return;
    if (selectedIds.includes(instanceId)) {
      setSelectedIds(prev => prev.filter(id => id !== instanceId));
    } else {
      if (selectedIds.length >= 10) return;
      setSelectedIds(prev => [...prev, instanceId]);
    }
  };

  const handleCraft = () => {
    if (selectedItems.length < 3 || isCrafting) return;

    setIsCrafting(true);
    setCraftedResult(null);
    sound.playOpen();

    // Crafting logic:
    // Output target is based on totalInputCost with random multiplier between 0.6x and 2.4x
    // Weighted towards typical GameVia/CS2 contract mechanics
    const r = Math.random();
    let multiplier: number;
    if (r < 0.6) {
      // 60% chance: slightly lower or break-even (0.6x to 0.95x)
      multiplier = 0.6 + Math.random() * 0.35;
    } else if (r < 0.9) {
      // 30% chance: modest profit (1.1x to 1.7x)
      multiplier = 1.1 + Math.random() * 0.6;
    } else {
      // 10% chance: big hit (1.8x to 3.2x)
      multiplier = 1.8 + Math.random() * 1.4;
    }

    const targetPrice = Math.max(20, Math.round(totalInputCost * multiplier));

    // Find the closest skin to this price in ALL_SKINS
    const sortedByDiff = [...ALL_SKINS].sort((a, b) => {
      return Math.abs(a.price - targetPrice) - Math.abs(b.price - targetPrice);
    });

    const candidateSkins = sortedByDiff.slice(0, 3);
    const wonSkin = candidateSkins[Math.floor(Math.random() * candidateSkins.length)];

    setTimeout(() => {
      const newItem: InventoryItem = {
        ...wonSkin,
        instanceId: `contract-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        acquiredAt: Date.now(),
        fromCase: 'Контракт обмена',
      };

      setIsCrafting(false);
      setCraftedResult(newItem);
      onCraftSuccess(newItem, selectedIds);
      setSelectedIds([]);

      sound.playWin(newItem.rarity === 'arcana' || newItem.rarity === 'secret' || newItem.rarity === 'legendary');
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
      });
    }, 2800);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <Layers className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-black text-white uppercase font-display tracking-wide">
              Контракты обмена
            </h1>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Положите от 3 до 10 скинов, чтобы скрафтить один более ценный предмет!
          </p>
        </div>

        <div className="flex items-center gap-3 bg-[#131b29] p-3 rounded-xl border border-slate-800">
          <div>
            <div className="text-xs text-slate-400">Сумма сырья:</div>
            <div className="text-lg font-mono font-bold text-amber-400">
              {totalInputCost.toLocaleString('ru-RU')} AC
            </div>
          </div>
          <div className="h-8 w-px bg-slate-800" />
          <div>
            <div className="text-xs text-slate-400">Слотов заполнено:</div>
            <div className="text-lg font-mono font-bold text-white">
              {selectedIds.length} / 10
            </div>
          </div>
        </div>
      </div>

      {/* Contract Slots Matrix (10 slots) */}
      <div className="rounded-2xl bg-[#0f1422] border border-slate-800 p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Слоты контракта (минимум 3 предмета)
          </span>
          {selectedIds.length > 0 && (
            <button
              onClick={() => setSelectedIds([])}
              disabled={isCrafting}
              className="text-xs text-red-400 hover:text-red-300 cursor-pointer"
            >
              Очистить слоты
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 md:grid-cols-10 gap-2.5">
          {Array.from({ length: 10 }).map((_, idx) => {
            const item = selectedItems[idx];
            return (
              <div
                key={idx}
                className={`h-28 rounded-xl border border-dashed flex flex-col items-center justify-center p-2 relative transition-all ${
                  item
                    ? 'border-amber-500/50 bg-[#161f30]'
                    : 'border-slate-800 bg-[#0c101a]'
                }`}
              >
                {item ? (
                  <>
                    <button
                      onClick={() => toggleSelect(item.instanceId)}
                      disabled={isCrafting}
                      className="absolute top-1 right-1 p-0.5 rounded bg-black/60 text-slate-400 hover:text-white cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    <div className="w-full h-12 flex items-center justify-center">
                      <WeaponIcon skin={item} size="sm" showGlow={false} />
                    </div>
                    <span className="text-[10px] text-white font-medium truncate w-full text-center mt-1">
                      {item.skinName}
                    </span>
                    <span className="text-[10px] font-mono text-amber-400">
                      {item.price} AC
                    </span>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-600">
                    <Plus className="w-4 h-4" />
                    <span className="text-[9px] mt-1 font-mono">#{idx + 1}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Action Button */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800">
          <div className="text-xs text-slate-400">
            {selectedIds.length < 3 ? (
              <span>Выберите ещё как минимум {3 - selectedIds.length} скина из инвентаря ниже</span>
            ) : (
              <span className="text-emerald-400">Контракт готов к подписанию!</span>
            )}
          </div>

          <button
            onClick={handleCraft}
            disabled={selectedIds.length < 3 || isCrafting}
            className={`py-3 px-8 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition cursor-pointer shadow-lg ${
              isCrafting
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : selectedIds.length >= 3
                ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-amber-500 hover:brightness-110 text-white shadow-blue-500/25 active:scale-95'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            {isCrafting ? (
              <>
                <RotateCw className="w-4 h-4 animate-spin" />
                <span>Крафтится контракт...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>ПОДПИСАТЬ КОНТРАКТ ({totalInputCost} AC)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {craftedResult && (() => {
        const cRarity = getRarityConfig(craftedResult?.rarity);
        return (
          <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-[#141d2e] to-[#1c1836] border border-amber-500/40 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 animate-fade-in">
            <div className="flex items-center gap-5">
              <div
                className="w-24 h-24 rounded-2xl flex items-center justify-center p-2 border"
                style={{
                  backgroundColor: `${cRarity.color}15`,
                  borderColor: cRarity.color,
                }}
              >
                <WeaponIcon skin={craftedResult} size="lg" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wide">
                    Успешный крафт!
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mt-1">
                  {craftedResult.name}
                </h3>
              <div className="text-lg font-mono font-extrabold text-amber-400 mt-0.5">
                Стоимость: {craftedResult.price.toLocaleString('ru-RU')} AC
              </div>
            </div>
          </div>

          <button
            onClick={() => setCraftedResult(null)}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm cursor-pointer shadow-md"
          >
            Забрать в инвентарь
          </button>
          </div>
        );
      })()}

      {/* Available User Inventory Picker */}
      <div className="rounded-2xl bg-[#0d121c] border border-slate-800 p-6">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-3">
          Ваш инвентарь (кликните, чтобы добавить в контракт):
        </h3>

        {inventory.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-sm">
            Ваш инвентарь пуст. Откройте бесплатные или стартовые кейсы во вкладке «Кейсы»!
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2.5">
            {inventory.map((item) => {
              const isSelected = selectedIds.includes(item.instanceId);
              const rarity = getRarityConfig(item?.rarity);
              return (
                <button
                  key={item.instanceId}
                  onClick={() => toggleSelect(item.instanceId)}
                  disabled={isCrafting}
                  className={`rounded-xl p-2.5 flex flex-col items-center justify-between text-center transition-all cursor-pointer relative ${
                    isSelected
                      ? 'border-2 border-amber-400 bg-amber-500/15 scale-95 shadow-lg'
                      : 'border border-slate-800 bg-[#121825] hover:border-slate-700'
                  }`}
                  style={{ borderBottom: isSelected ? undefined : `3px solid ${rarity.color}` }}
                >
                  {isSelected && (
                    <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-amber-400 text-black flex items-center justify-center text-[10px] font-bold">
                      ✓
                    </div>
                  )}
                  <div className="w-full h-10 flex items-center justify-center">
                    <WeaponIcon skin={item} size="sm" showGlow={false} />
                  </div>
                  <div className="text-[10px] font-semibold text-slate-200 truncate w-full mt-1">
                    {item.skinName}
                  </div>
                  <div className="text-[10px] font-mono text-amber-400 mt-0.5">
                    {item.price} AC
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
