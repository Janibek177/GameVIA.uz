import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { InventoryItem, Skin } from '../types';
import { ALL_SKINS, getRarityConfig } from '../data/skins';
import { WeaponIcon } from './WeaponIcon';
import { sound } from '../utils/audio';
import {
  Zap,
  RotateCw,
  AlertTriangle,
  CheckCircle,
  Coins,
  Sparkles,
  Search,
  Filter,
  Flame,
  Crown,
  ChevronDown,
  Gift
} from 'lucide-react';

interface UpgradeGameProps {
  inventory: InventoryItem[];
  userBalance: number;
  initialSelectedItem?: InventoryItem | null;
  onWinItem: (item: InventoryItem) => void;
  onBurnItem: (itemInstanceId: string) => void;
  onDeductBalance: (amount: number) => void;
  onAddBalance: (amount: number) => void;
}

export const UpgradeGame: React.FC<UpgradeGameProps> = ({
  inventory,
  userBalance,
  initialSelectedItem,
  onWinItem,
  onBurnItem,
  onDeductBalance,
  onAddBalance,
}) => {
  // If no items in inventory, automatically default to cash mode!
  const hasInventory = inventory.length > 0;
  const [useCash, setUseCash] = useState<boolean>(!hasInventory || !initialSelectedItem);
  const [selectedInventoryItem, setSelectedInventoryItem] = useState<InventoryItem | null>(
    initialSelectedItem || (hasInventory ? inventory[0] : null)
  );
  const [cashAmount, setCashAmount] = useState<number>(100);

  // If inventory items change or empty, make sure state is valid
  useEffect(() => {
    if (inventory.length === 0) {
      setUseCash(true);
      setRewardType('money');
      setSelectedInventoryItem(null);
    } else if (!selectedInventoryItem && !useCash) {
      setSelectedInventoryItem(inventory[0]);
    }
  }, [inventory, useCash, selectedInventoryItem]);

  // Reward Mode: 'skin' (get weapon into inventory) or 'money' (payout cash directly to balance!)
  const [rewardType, setRewardType] = useState<'skin' | 'money'>('money');

  // Target Value in rubles
  const [customTargetValue, setCustomTargetValue] = useState<number>(2500);

  // Selected target skin from catalog (sorted descending by default to show luxury items)
  const [targetSkin, setTargetSkin] = useState<Skin>(() => {
    return ALL_SKINS.find(s => s.id === 'knife_karambit_doppler') || ALL_SKINS[15];
  });

  // Catalog search & filter modal/tabs
  const [isCatalogOpen, setIsCatalogOpen] = useState<boolean>(false);
  const [catalogSearch, setCatalogSearch] = useState<string>('');
  const [catalogRarityFilter, setCatalogRarityFilter] = useState<string>('all');

  // Spinning wheel state
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [wheelRotation, setWheelRotation] = useState<number>(0);
  const [resultOutcome, setResultOutcome] = useState<'won' | 'lost' | null>(null);
  const [lastWinAmount, setLastWinAmount] = useState<number>(0);
  const [lastWonSkin, setLastWonSkin] = useState<Skin | null>(null);
  const [lastWonItemInstanceId, setLastWonItemInstanceId] = useState<string | null>(null);
  const [isSoldToBalance, setIsSoldToBalance] = useState<boolean>(false);

  // Current stake value
  const inputValue = useCash ? cashAmount : (selectedInventoryItem?.price || 0);

  // Target value determines either targetSkin price or custom target value
  const effectiveTargetValue = rewardType === 'skin'
    ? targetSkin.price
    : Math.max(10, customTargetValue);
  const targetValue = effectiveTargetValue;

  // House edge 22% (0.78 factor) - Stricter balance
  const HOUSE_EDGE_FACTOR = 0.78;
  const rawChance = targetValue > 0 && inputValue > 0 ? (inputValue / targetValue) * HOUSE_EDGE_FACTOR * 100 : 0;
  const clampedChance = Math.min(Math.max(rawChance, 0.05), 85); // min 0.05%, max 85%
  const multiplier = inputValue > 0 ? (targetValue / inputValue).toFixed(2) : '1.00';

  // Winning circular sector degrees (0 to 360)
  const winningAngle = (clampedChance / 100) * 360;

  // Handle Multiplier quick click (1.5x, 2x, 5x, 10x, 25x, 50x, 100x, 500x)
  const handleSelectMultiplier = (mult: number) => {
    if (inputValue <= 0) return;
    const newTargetCost = Math.max(10, Math.round(inputValue * mult));
    setCustomTargetValue(newTargetCost);

    // If in skin mode, find skin closest to this target cost!
    const sortedByDistance = [...ALL_SKINS].sort(
      (a, b) => Math.abs(a.price - newTargetCost) - Math.abs(b.price - newTargetCost)
    );
    if (sortedByDistance.length > 0) {
      setTargetSkin(sortedByDistance[0]);
    }
  };

  // When user inputs a custom target amount
  const handleCustomTargetChange = (val: number) => {
    const cleanVal = Math.max(10, val);
    setCustomTargetValue(cleanVal);
    // Find closest skin
    const sortedByDistance = [...ALL_SKINS].sort(
      (a, b) => Math.abs(a.price - cleanVal) - Math.abs(b.price - cleanVal)
    );
    if (sortedByDistance.length > 0) {
      setTargetSkin(sortedByDistance[0]);
    }
  };

  // Synchronize target value when stake changes so it is always sensible
  const handleCashAmountChange = (val: number) => {
    setCashAmount(val);
    if (customTargetValue < Math.round(val * 1.1)) {
      setCustomTargetValue(Math.round(val * 1.33));
    }
  };

  // Perform Spin Upgrade
  const handleSpinUpgrade = () => {
    if (isSpinning) return;
    if (useCash && userBalance < cashAmount) return;
    if (!useCash && !selectedInventoryItem) return;
    if (inputValue <= 0 || targetValue <= 0) return;

    setIsSpinning(true);
    setResultOutcome(null);
    setLastWonSkin(null);
    setLastWonItemInstanceId(null);
    setIsSoldToBalance(false);
    sound.playOpen();

    if (useCash) {
      onDeductBalance(cashAmount);
    }

    // Roll random outcome against clampedChance
    const rollPercent = Math.random() * 100;
    const isWin = rollPercent <= clampedChance;

    // Calculate exact wheel landing angle:
    // - On WIN: lands strictly and safely inside the green sector [safeMargin, winningAngle - safeMargin]
    // - On LOSS: lands strictly and safely inside the loss sector [winningAngle + safeMargin, 360 - safeMargin]
    // A safe margin prevents ambiguous landing directly on the boundary line
    let stopAngleOnWheel: number;
    if (isWin) {
      const safeMargin = Math.min(Math.max(2, winningAngle * 0.04), 6);
      const span = Math.max(1, winningAngle - (2 * safeMargin));
      stopAngleOnWheel = safeMargin + Math.random() * span;
    } else {
      const lossArc = 360 - winningAngle;
      const safeMargin = Math.min(Math.max(2, lossArc * 0.04), 6);
      const span = Math.max(1, lossArc - (2 * safeMargin));
      stopAngleOnWheel = winningAngle + safeMargin + Math.random() * span;
    }

    // Always rotate smoothly clockwise (forward) by 6 full rotations plus forward angular offset
    const currentNorm = ((wheelRotation % 360) + 360) % 360;
    const forwardOffset = ((stopAngleOnWheel - currentNorm) + 360) % 360;
    const extraRotations = 360 * 6;
    const targetTotalRotation = wheelRotation + extraRotations + forwardOffset;
    setWheelRotation(targetTotalRotation);

    // Audio ticks during spinning
    let tickCount = 0;
    const interval = setInterval(() => {
      sound.playTick();
      tickCount++;
      if (tickCount > 25) clearInterval(interval);
    }, 150);

    setTimeout(() => {
      clearInterval(interval);
      setIsSpinning(false);

      if (isWin) {
        setResultOutcome('won');
        sound.playWin(targetSkin.rarity === 'arcana' || targetSkin.rarity === 'secret' || targetValue >= 10000);

        if (!useCash && selectedInventoryItem) {
          onBurnItem(selectedInventoryItem.instanceId);
        }

        // Payout: Either Cash to Balance or Skin to Inventory
        if (rewardType === 'money') {
          // Automatic money crediting directly to user balance!
          setLastWinAmount(targetValue);
          onAddBalance(targetValue);
        } else {
          // Weapon win
          const wonSkinObject = targetSkin;
          setLastWonSkin(wonSkinObject);
          setLastWinAmount(wonSkinObject.price);
          const wonInstanceId = `upgrade-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
          setLastWonItemInstanceId(wonInstanceId);
          const newWonItem: InventoryItem = {
            ...wonSkinObject,
            instanceId: wonInstanceId,
            acquiredAt: Date.now(),
            fromCase: 'Апгрейд GameVia',
          };
          onWinItem(newWonItem);
        }

        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
        });
      } else {
        setResultOutcome('lost');
        sound.playFail();

        if (!useCash && selectedInventoryItem) {
          onBurnItem(selectedInventoryItem.instanceId);
          setSelectedInventoryItem(null);
          // If no items left, automatically switch to balance
          if (inventory.length <= 1) {
            setUseCash(true);
          }
        }
      }
    }, 4500);
  };

  // Filtered skins for the catalog selector
  const filteredCatalogSkins = ALL_SKINS.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(catalogSearch.toLowerCase()) ||
                          s.weapon.toLowerCase().includes(catalogSearch.toLowerCase());
    const matchesRarity = catalogRarityFilter === 'all' || s.rarity === catalogRarityFilter;
    return matchesSearch && matchesRarity;
  }).sort((a, b) => b.price - a.price);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Top Banner & Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2.5 rounded-2xl bg-gradient-to-br from-purple-500/30 to-pink-500/20 text-purple-300 border border-purple-500/40 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
              <Zap className="w-6 h-6 text-purple-400" />
            </span>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white uppercase font-display tracking-wide flex items-center gap-2">
                Режим «Апгрейд»
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono font-bold">
                  CS2 + Acoin
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Ставьте скин или баланс, выбирайте желаемую сумму или оружие мечты (до 1 800 000 Acoin) и крутите колесо!
              </p>
            </div>
          </div>
        </div>

        {/* Multiplier & Probability Indicator Card */}
        <div className="flex items-center gap-4 bg-[#111726] px-5 py-3 rounded-2xl border border-slate-800 shadow-xl">
          <div className="text-right">
            <div className="text-[11px] text-slate-400 uppercase font-semibold">Шанс победы</div>
            <div className="text-xl sm:text-2xl font-mono font-black text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]">
              {clampedChance.toFixed(2)}%
            </div>
          </div>
          <div className="h-10 w-px bg-slate-800" />
          <div>
            <div className="text-[11px] text-slate-400 uppercase font-semibold">Множитель</div>
            <div className="text-xl sm:text-2xl font-mono font-black text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.4)]">
              {multiplier}x
            </div>
          </div>
        </div>
      </div>

      {/* Quick Multiplier Strip ("Выбрать какую стоимостью хочешь поднять") */}
      <div className="mb-6 p-4 rounded-2xl bg-[#0d121c] border border-slate-800/90 shadow-lg">
        <div className="flex items-center justify-between mb-2.5 flex-wrap gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-400" />
            Быстрый выбор множителя (на какую стоимость поднять):
          </span>
          <span className="text-xs text-slate-400 font-mono">
            Целевая сумма: <span className="text-amber-400 font-bold">{targetValue.toLocaleString('ru-RU')} AC</span>
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {[1.5, 2, 3, 5, 10, 20, 50, 100, 200, 500, 1000].map((m) => (
            <button
              key={m}
              disabled={isSpinning || inputValue <= 0}
              onClick={() => handleSelectMultiplier(m)}
              className="px-3.5 py-1.5 rounded-xl bg-[#141d2f] hover:bg-amber-500 hover:text-black border border-slate-800 hover:border-amber-400 text-xs font-mono font-extrabold text-slate-300 transition cursor-pointer shrink-0 active:scale-95 shadow-sm"
            >
              {m}x
            </button>
          ))}
        </div>
      </div>

      {/* Main Upgrade Arena: 3 columns (Input -> Wheel -> Target) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* COLUMN 1: INPUT SELECTION (Скин или Баланс) */}
        <div className="lg:col-span-4 rounded-2xl bg-[#101625] border border-slate-800 p-5 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <span>1.</span> Что ставите?
              </span>

              {/* Mode switch: Skin vs Cash */}
              <div className="flex items-center gap-1 bg-[#090d16] p-1 rounded-xl text-xs border border-slate-800">
                <button
                  disabled={isSpinning || !hasInventory}
                  onClick={() => {
                    setUseCash(false);
                    setRewardType('skin');
                  }}
                  className={`px-3 py-1 rounded-lg cursor-pointer transition ${
                    !useCash
                      ? 'bg-amber-500 text-black font-extrabold shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  } ${!hasInventory ? 'opacity-40 cursor-not-allowed' : ''}`}
                >
                  Скин ({inventory.length})
                </button>
                <button
                  disabled={isSpinning}
                  onClick={() => {
                    setUseCash(true);
                    setRewardType('money');
                  }}
                  className={`px-3 py-1 rounded-lg cursor-pointer transition ${
                    useCash
                      ? 'bg-amber-500 text-black font-extrabold shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Acoin
                </button>
              </div>
            </div>

            {useCash ? (
              <div className="mt-4 flex flex-col">
                <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">
                  Своя сумма ставки с баланса (Acoin):
                </span>
                
                {/* Freely typable bet amount input field */}
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max={userBalance}
                    value={cashAmount || ''}
                    placeholder="Напишите сумму ставки..."
                    onChange={(e) => {
                      const val = e.target.value === '' ? 0 : Number(e.target.value);
                      handleCashAmountChange(val);
                    }}
                    disabled={isSpinning}
                    className="w-full bg-slate-900 border-2 border-amber-500/50 rounded-2xl px-4 py-3 text-2xl font-black font-mono text-amber-400 focus:outline-none focus:border-amber-400 shadow-inner"
                  />
                  <span className="absolute right-4 top-3.5 text-base font-black text-amber-400 font-mono">AC</span>
                </div>

                <div className="text-xs text-slate-400 mt-2 flex items-center justify-between">
                  <span>Доступно: <strong className="text-emerald-400 font-mono">{userBalance.toLocaleString('ru-RU')} AC</strong></span>
                  <button
                    type="button"
                    disabled={isSpinning}
                    onClick={() => handleCashAmountChange(userBalance)}
                    className="text-xs text-amber-400 hover:underline cursor-pointer"
                  >
                    Поставить всё
                  </button>
                </div>

                {/* Bet Slider */}
                <input
                  type="range"
                  min="1"
                  max={Math.max(1000, userBalance)}
                  step="1"
                  value={cashAmount}
                  onChange={(e) => handleCashAmountChange(Number(e.target.value))}
                  disabled={isSpinning}
                  className="w-full mt-4 accent-amber-500 cursor-pointer"
                />

                {/* Quick Add Buttons */}
                <div className="grid grid-cols-4 gap-1.5 mt-3 w-full">
                  {[10, 50, 200, 1000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      disabled={isSpinning}
                      onClick={() => handleCashAmountChange(amt)}
                      className="py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 text-xs font-mono font-bold text-slate-300 hover:text-white cursor-pointer transition active:scale-95"
                    >
                      {amt} AC
                    </button>
                  ))}
                </div>
              </div>
            ) : selectedInventoryItem ? (() => {
              const sRarity = getRarityConfig(selectedInventoryItem?.rarity);
              return (
                <div className="mt-4 flex flex-col items-center text-center">
                  <div
                    className="w-28 h-28 rounded-2xl flex items-center justify-center p-3 border shadow-lg transition-transform hover:scale-105"
                    style={{
                      backgroundColor: `${sRarity.color}15`,
                      borderColor: sRarity.color,
                      boxShadow: `0 0 20px ${sRarity.color}25`,
                    }}
                  >
                    <WeaponIcon skin={selectedInventoryItem} size="lg" />
                  </div>
                  <div className="mt-3 font-black text-white text-base">
                    {selectedInventoryItem.name}
                  </div>
                  <div className="text-base font-mono text-amber-400 font-black mt-1">
                    {selectedInventoryItem.price.toLocaleString('ru-RU')} AC
                  </div>
                  <span
                    className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full mt-1 border"
                    style={{ color: sRarity.color, borderColor: `${sRarity.color}40`, backgroundColor: `${sRarity.color}15` }}
                  >
                    {sRarity.label}
                  </span>
                </div>
              );
            })() : (
              <div className="mt-8 text-center p-6 rounded-xl bg-slate-900/50 border border-dashed border-slate-800">
                <Coins className="w-8 h-8 text-amber-400 mx-auto mb-2 opacity-80" />
                <div className="text-sm font-bold text-slate-300">Инвентарь пуст</div>
                <p className="text-xs text-slate-400 mt-1">
                  У вас нет скинов. Апгрейд автоматически настроен на ставку с баланса (Acoin)!
                </p>
                <button
                  onClick={() => setUseCash(true)}
                  className="mt-3 px-3 py-1.5 rounded-lg bg-amber-500 text-black font-extrabold text-xs cursor-pointer"
                >
                  Переключить на Баланс
                </button>
              </div>
            )}
          </div>

          {/* Quick Inventory Switcher */}
          {!useCash && inventory.length > 0 && (
            <div className="mt-4 pt-3 border-t border-slate-800">
              <span className="text-[11px] text-slate-400 block mb-2 font-semibold">
                Выбрать предмет из инвентаря ({inventory.length}):
              </span>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                {inventory.map((item) => (
                  <button
                    key={item.instanceId}
                    disabled={isSpinning}
                    onClick={() => setSelectedInventoryItem(item)}
                    className={`shrink-0 p-1.5 rounded-xl border text-left cursor-pointer transition ${
                      selectedInventoryItem?.instanceId === item.instanceId
                        ? 'border-amber-400 bg-amber-500/15 shadow-md'
                        : 'border-slate-800 bg-slate-900 hover:border-slate-700'
                    }`}
                  >
                    <div className="w-12 h-9 flex items-center justify-center">
                      <WeaponIcon skin={item} size="sm" showGlow={false} />
                    </div>
                    <div className="text-[10px] font-mono text-amber-400 font-bold truncate max-w-[65px] mt-0.5">
                      {item.price.toLocaleString('ru-RU')} AC
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* COLUMN 2: CENTER UPGRADE SPINNER WHEEL */}
        <div className="lg:col-span-4 flex flex-col items-center justify-center p-4 rounded-2xl bg-[#0b0f19] border border-slate-800/80 shadow-2xl relative">
          
          {/* Wheel Graphic */}
          <div className="relative w-64 h-64 sm:w-72 sm:h-72">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {/* Background Loss Sector (Dark Slate with subtle Crimson Tint) */}
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#171e2e"
                strokeWidth="10"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#ef4444"
                strokeOpacity="0.2"
                strokeWidth="10"
              />

              {/* Exact Winning Sector Arc (butt linecap prevents visual bleed beyond math angle) */}
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#10b981"
                strokeWidth="10"
                strokeDasharray={`${(clampedChance / 100) * (2 * Math.PI * 40)} ${2 * Math.PI * 40}`}
                strokeLinecap="butt"
                transform="rotate(-90 50 50)"
                className="transition-all duration-300 drop-shadow-[0_0_14px_rgba(16,185,129,0.8)]"
              />

              {/* Sector Start Boundary Marker (0° / Top / 12 o'clock) */}
              <line
                x1="50"
                y1="4"
                x2="50"
                y2="16"
                stroke="#ffffff"
                strokeWidth="2"
                strokeLinecap="round"
                opacity="0.95"
              />

              {/* Sector End Boundary Marker (at exact winningAngle from 12 o'clock) */}
              <line
                x1="50"
                y1="4"
                x2="50"
                y2="16"
                stroke="#f59e0b"
                strokeWidth="2.5"
                strokeLinecap="round"
                transform={`rotate(${winningAngle} 50 50)`}
                className="drop-shadow-[0_0_6px_#f59e0b]"
              />
            </svg>

            {/* Inner Center Stats */}
            <div className="absolute inset-10 rounded-full bg-[#0a0d16] border border-slate-800 flex flex-col items-center justify-center text-center p-3 shadow-inner">
              <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest">
                ШАНС
              </span>
              <span className="text-2xl sm:text-3xl font-black font-mono text-white mt-0.5 drop-shadow-md">
                {clampedChance.toFixed(1)}%
              </span>
              <div className="mt-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-xs font-black border border-amber-500/30">
                x{multiplier}
              </div>
              <span className="text-[9px] text-slate-400 mt-1 font-mono">
                {rewardType === 'money' ? 'Выигрыш: Деньги' : 'Выигрыш: Скин'}
              </span>
            </div>

            {/* Rotating Needle Pointer */}
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none transition-transform will-change-transform"
              style={{
                transform: `rotate(${wheelRotation}deg)`,
                transition: isSpinning ? 'transform 4.5s cubic-bezier(0.1, 0.9, 0.2, 1)' : 'none',
              }}
            >
              <div className="w-1.5 h-32 bg-gradient-to-t from-amber-500 to-amber-300 absolute top-2 rounded-full shadow-[0_0_16px_#f59e0b] flex flex-col items-center">
                <div className="w-4 h-4 bg-white rounded-full -mt-1.5 border-2 border-amber-400 shadow-[0_0_10px_#ffffff]" />
              </div>
            </div>
          </div>

          {/* Outcome Notifications */}
          {resultOutcome && (
            <div
              className={`mt-4 px-4 py-3 rounded-2xl text-center text-sm font-bold flex flex-col items-center gap-1.5 animate-bounce ${
                resultOutcome === 'won'
                  ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                  : 'bg-red-950/60 text-red-300 border border-red-500/50'
              }`}
            >
              <div className="flex items-center gap-2 font-black uppercase tracking-wide">
                {resultOutcome === 'won' ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                    <span>УСПЕШНЫЙ АПГРЕЙД!</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                    <span>НЕУДАЧА! ПРЕДМЕТ СГОРЕЛ</span>
                  </>
                )}
              </div>
              <div className="text-xs font-normal">
                {resultOutcome === 'won' ? (
                  rewardType === 'money' ? (
                    <span className="font-mono text-emerald-400 font-extrabold text-sm">
                      +{lastWinAmount.toLocaleString('ru-RU')} AC зачислено на баланс!
                    </span>
                  ) : (
                    <div className="space-y-1.5">
                      <div>
                        Скин «{lastWonSkin?.name}» за <b className="text-amber-400 font-mono">{lastWinAmount.toLocaleString('ru-RU')} AC</b> добавлен в инвентарь!
                      </div>
                      {lastWonItemInstanceId && !isSoldToBalance && (
                        <button
                          type="button"
                          onClick={() => {
                            onBurnItem(lastWonItemInstanceId);
                            onAddBalance(lastWinAmount);
                            setIsSoldToBalance(true);
                            sound.playCashout();
                          }}
                          className="mx-auto mt-2 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase flex items-center gap-1.5 cursor-pointer shadow-md transition active:scale-95"
                        >
                          <Coins className="w-3.5 h-3.5" />
                          <span>Продать за {lastWinAmount.toLocaleString('ru-RU')} AC на баланс</span>
                        </button>
                      )}
                      {isSoldToBalance && (
                        <div className="text-emerald-400 font-bold text-xs flex items-center justify-center gap-1 mt-1">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Скин продан! +{lastWinAmount.toLocaleString('ru-RU')} AC начислено на баланс</span>
                        </div>
                      )}
                    </div>
                  )
                ) : (
                  <span>Шанс был {clampedChance.toFixed(1)}%. Попробуйте еще раз!</span>
                )}
              </div>
            </div>
          )}

          {/* Upgrade Action Button */}
          <button
            onClick={handleSpinUpgrade}
            disabled={
              isSpinning ||
              (!useCash && !selectedInventoryItem) ||
              (useCash && userBalance < cashAmount) ||
              inputValue <= 0
            }
            className={`mt-5 w-full py-4 px-6 rounded-2xl font-black text-base flex items-center justify-center gap-2.5 transition cursor-pointer shadow-xl ${
              isSpinning
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:brightness-110 text-white shadow-purple-500/30 active:scale-95'
            }`}
          >
            {isSpinning ? (
              <>
                <RotateCw className="w-5 h-5 animate-spin" />
                <span>Крутится колесо фортуны...</span>
              </>
            ) : (
              <>
                <Zap className="w-5 h-5 text-amber-300" />
                <span>
                  КРУТИТЬ АПГРЕЙД ({clampedChance.toFixed(1)}%)
                </span>
              </>
            )}
          </button>
        </div>

        {/* COLUMN 3: TARGET SELECTION (Скин или Деньги на баланс) */}
        <div className="lg:col-span-4 rounded-2xl bg-[#101625] border border-slate-800 p-5 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <span>2.</span> Что хотите поднять?
              </span>

              {/* Reward Type Toggle: Skin vs Cash */}
              <div className="flex items-center gap-1 bg-[#090d16] p-1 rounded-xl text-xs border border-slate-800">
                <button
                  disabled={isSpinning}
                  onClick={() => setRewardType('skin')}
                  className={`px-3 py-1 rounded-lg cursor-pointer transition ${
                    rewardType === 'skin'
                      ? 'bg-purple-600 text-white font-extrabold shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Оружие
                </button>
                <button
                  disabled={isSpinning}
                  onClick={() => setRewardType('money')}
                  className={`px-3 py-1 rounded-lg cursor-pointer transition ${
                    rewardType === 'money'
                      ? 'bg-emerald-500 text-black font-extrabold shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Acoin
                </button>
              </div>
            </div>

            {/* Display Target */}
            {rewardType === 'money' ? (
              <div className="mt-4 flex flex-col">
                <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">
                  Своя целевая сумма на баланс (Acoin):
                </span>

                {/* Freely typable target amount input field */}
                <div className="relative">
                  <input
                    type="number"
                    min="10"
                    max="5000000"
                    value={customTargetValue || ''}
                    placeholder="Напишите желаемую сумму..."
                    onChange={(e) => {
                      const val = e.target.value === '' ? 0 : Number(e.target.value);
                      handleCustomTargetChange(val);
                    }}
                    disabled={isSpinning}
                    className="w-full bg-slate-900 border-2 border-emerald-500/50 rounded-2xl px-4 py-3 text-2xl font-black font-mono text-emerald-400 focus:outline-none focus:border-emerald-400 shadow-inner"
                  />
                  <span className="absolute right-4 top-3.5 text-base font-black text-emerald-400 font-mono">AC</span>
                </div>

                <p className="text-xs text-slate-400 mt-2">
                  При успехе выигрыш автоматически зачислится на баланс аккаунта!
                </p>

                {/* Custom Target Slider */}
                <input
                  type="range"
                  min="20"
                  max="1000000"
                  step="50"
                  value={customTargetValue}
                  onChange={(e) => handleCustomTargetChange(Number(e.target.value))}
                  disabled={isSpinning}
                  className="w-full mt-4 accent-emerald-500 cursor-pointer"
                />

                {/* Quick Target Values */}
                <div className="grid grid-cols-4 gap-1.5 mt-3 w-full">
                  {[500, 2500, 10000, 50000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      disabled={isSpinning}
                      onClick={() => handleCustomTargetChange(amt)}
                      className="py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 text-xs font-mono font-bold text-slate-300 hover:text-white cursor-pointer transition active:scale-95"
                    >
                      {amt.toLocaleString('ru-RU')} AC
                    </button>
                  ))}
                </div>
              </div>
            ) : (() => {
              const tRarity = getRarityConfig(targetSkin?.rarity);
              return (
                <div className="mt-4 flex flex-col items-center text-center">
                  <div
                    className="w-28 h-28 rounded-2xl flex items-center justify-center p-3 border shadow-lg transition-transform hover:scale-105"
                    style={{
                      backgroundColor: `${tRarity.color}15`,
                      borderColor: tRarity.color,
                      boxShadow: `0 0 20px ${tRarity.color}25`,
                    }}
                  >
                    <WeaponIcon skin={targetSkin} size="lg" />
                  </div>
                  <div className="mt-3 font-black text-white text-base">
                    {targetSkin.name}
                  </div>
                  <div className="text-base font-mono text-amber-400 font-black mt-1">
                    {targetSkin.price.toLocaleString('ru-RU')} AC
                  </div>
                  <span
                    className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full mt-1 border"
                    style={{ color: tRarity.color, borderColor: `${tRarity.color}40`, backgroundColor: `${tRarity.color}15` }}
                  >
                    {tRarity.label}
                  </span>
                </div>
              );
            })()}
          </div>

          {/* Target Skin Picker & Ultra-Expensive Showcase */}
          <div className="mt-4 pt-3 border-t border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] text-slate-300 font-bold flex items-center gap-1.5">
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                {rewardType === 'money' ? 'Или поднять на скин:' : 'Топовые цели & Дорогие скины:'}
              </span>
              <button
                disabled={isSpinning}
                onClick={() => setIsCatalogOpen(true)}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer underline flex items-center gap-1"
              >
                Весь каталог ({ALL_SKINS.length})
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>

            {/* Quick High-Value Weapons Row (Includes Ultra Expensive Weapons!) */}
            <div className="grid grid-cols-3 gap-2">
              {ALL_SKINS.filter(s => s.price >= 50000).slice(0, 6).map((skin, idx) => {
                const rCfg = getRarityConfig(skin.rarity);
                return (
                  <button
                    key={`${skin.id}-${idx}`}
                    disabled={isSpinning}
                    onClick={() => {
                      setTargetSkin(skin);
                      setCustomTargetValue(skin.price);
                    }}
                    className={`p-2 rounded-xl border text-center cursor-pointer transition ${
                      targetSkin.id === skin.id
                        ? 'border-purple-400 bg-purple-500/20 shadow-md'
                        : 'border-slate-800 bg-slate-900/90 hover:border-slate-700'
                    }`}
                  >
                    <div className="w-full h-8 flex items-center justify-center">
                      <WeaponIcon skin={skin} size="sm" showGlow={false} />
                    </div>
                    <div className="text-[10px] font-mono text-amber-400 font-bold mt-1 truncate">
                      {skin.price.toLocaleString('ru-RU')} AC
                    </div>
                    <div className="text-[8px] truncate" style={{ color: rCfg.color }}>
                      {skin.weapon}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* FULL CATALOG MODAL: Pick any weapon including ultra-expensive up to 1,800,000 AC */}
      {isCatalogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0f1523] border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-white uppercase font-display flex items-center gap-2">
                  <Crown className="w-5 h-5 text-amber-400" />
                  Каталог оружия для Апгрейда
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Выберите любой скин из CS2: от бюджетных до супер-секретных и раритетных за миллионы Acoin!
                </p>
              </div>
              <button
                onClick={() => setIsCatalogOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center cursor-pointer font-bold text-sm"
              >
                ✕
              </button>
            </div>

            {/* Filters & Search */}
            <div className="p-4 bg-[#0a0e18] border-b border-slate-800 flex flex-col sm:flex-row items-center gap-3">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Поиск по названию или оружию..."
                  value={catalogSearch}
                  onChange={(e) => setCatalogSearch(e.target.value)}
                  className="w-full bg-[#121927] border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto w-full pb-1 scrollbar-none">
                {[
                  { id: 'all', label: 'Все' },
                  { id: 'secret', label: '⚡ Секретные' },
                  { id: 'arcana', label: '★ Аркана' },
                  { id: 'legendary', label: 'Легендарные' },
                  { id: 'epic', label: 'Эпические' },
                  { id: 'super_rare', label: 'Сверхредкие' },
                  { id: 'rare', label: 'Редкие' },
                ].map((rf) => (
                  <button
                    key={rf.id}
                    onClick={() => setCatalogRarityFilter(rf.id)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer shrink-0 ${
                      catalogRarityFilter === rf.id
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {rf.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Skin Grid */}
            <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {filteredCatalogSkins.map((skin, idx) => {
                const rCfg = getRarityConfig(skin.rarity);
                const isSelected = targetSkin.id === skin.id;
                return (
                  <button
                    key={`${skin.id}-${idx}`}
                    onClick={() => {
                      setTargetSkin(skin);
                      setCustomTargetValue(skin.price);
                      setIsCatalogOpen(false);
                    }}
                    className={`p-3 rounded-2xl border text-center cursor-pointer transition flex flex-col justify-between items-center ${
                      isSelected
                        ? 'border-purple-400 bg-purple-500/20 shadow-lg ring-2 ring-purple-500/40'
                        : 'border-slate-800 bg-[#121928] hover:border-purple-500/50 hover:bg-[#151e31]'
                    }`}
                  >
                    <div className="w-full h-20 flex items-center justify-center p-2">
                      <WeaponIcon skin={skin} size="md" />
                    </div>
                    <div className="mt-2 w-full">
                      <div className="text-xs font-bold text-white truncate" title={skin.name}>
                        {skin.name}
                      </div>
                      <div className="text-xs font-mono font-black text-amber-400 mt-1">
                        {skin.price.toLocaleString('ru-RU')} AC
                      </div>
                      <span
                        className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full mt-1 inline-block border"
                        style={{ color: rCfg.color, borderColor: `${rCfg.color}40`, backgroundColor: `${rCfg.color}15` }}
                      >
                        {rCfg.label}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-slate-800 bg-[#0a0e18] flex items-center justify-between text-xs text-slate-400">
              <span>Всего найдено: <b className="text-white">{filteredCatalogSkins.length}</b> скинов</span>
              <button
                onClick={() => setIsCatalogOpen(false)}
                className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold cursor-pointer"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
