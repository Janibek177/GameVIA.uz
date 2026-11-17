import React, { useState, useRef } from 'react';
import { InventoryItem, ItemRarity } from '../types';
import { RARITY_CONFIG, getRarityConfig } from '../data/skins';
import { WeaponIcon } from './WeaponIcon';
import { Package, Trash2, Zap, ArrowUpDown, DollarSign, ExternalLink, ShieldCheck, Check } from 'lucide-react';
import { Language, t } from '../utils/i18n';

interface InventoryViewProps {
  inventory: InventoryItem[];
  onSellItem: (instanceId: string, price: number) => void;
  onSellMultiple: (instanceIds: string[], totalSum: number) => void;
  onNavigateToUpgrade: (item: InventoryItem) => void;
  language?: Language;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  inventory,
  onSellItem,
  onSellMultiple,
  onNavigateToUpgrade,
  language = 'ru',
}) => {
  const [rarityFilter, setRarityFilter] = useState<ItemRarity | 'all'>('all');
  const [sortBy, setSortBy] = useState<'price_desc' | 'price_asc' | 'recent'>('price_desc');
  const [withdrawNotification, setWithdrawNotification] = useState<string | null>(null);
  const [confirmSellAll, setConfirmSellAll] = useState<boolean>(false);
  const confirmTimeoutRef = useRef<any>(null);

  const totalValue = inventory.reduce((sum, it) => sum + it.price, 0);

  const filteredItems = inventory.filter((item) => {
    if (rarityFilter !== 'all' && item.rarity !== rarityFilter) return false;
    return true;
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    if (sortBy === 'price_desc') return b.price - a.price;
    if (sortBy === 'price_asc') return a.price - b.price;
    return b.acquiredAt - a.acquiredAt;
  });

  const handleSellAll = () => {
    if (inventory.length === 0) return;
    if (!confirmSellAll) {
      setConfirmSellAll(true);
      if (confirmTimeoutRef.current) clearTimeout(confirmTimeoutRef.current);
      confirmTimeoutRef.current = setTimeout(() => {
        setConfirmSellAll(false);
      }, 5000);
      return;
    }

    if (confirmTimeoutRef.current) clearTimeout(confirmTimeoutRef.current);
    const count = inventory.length;
    const sum = totalValue;
    onSellMultiple(inventory.map((i) => i.instanceId), totalValue);
    setConfirmSellAll(false);
    setWithdrawNotification(`✅ Успешно продано ${count} скинов на сумму ${sum.toLocaleString('ru-RU')} Acoin! Баланс пополнен.`);
    setTimeout(() => {
      setWithdrawNotification(null);
    }, 4500);
  };

  const handleSellJunk = () => {
    const junk = inventory.filter((i) => i.price < 100);
    if (junk.length === 0) {
      setWithdrawNotification('В вашем инвентаре нет дешёвых скинов (< 100 AC).');
      setTimeout(() => setWithdrawNotification(null), 3000);
      return;
    }
    const junkSum = junk.reduce((s, it) => s + it.price, 0);
    onSellMultiple(junk.map((i) => i.instanceId), junkSum);
    setWithdrawNotification(`✅ Продано ${junk.length} дешёвых скинов на сумму ${junkSum.toLocaleString('ru-RU')} Acoin!`);
    setTimeout(() => setWithdrawNotification(null), 4000);
  };

  const handleSimulateWithdraw = (item: InventoryItem) => {
    setWithdrawNotification(`Запрос на вывод скина «${item.name}» в игру отправлен! Создается оффер через игровой шлюз.`);
    setTimeout(() => {
      setWithdrawNotification(null);
    }, 4500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Withdraw notification toast */}
      {withdrawNotification && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-sm flex items-center justify-between shadow-lg animate-fade-in">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span>{withdrawNotification}</span>
          </div>
          <button
            onClick={() => setWithdrawNotification(null)}
            className="text-xs text-emerald-400 hover:text-white underline cursor-pointer"
          >
            Закрыть
          </button>
        </div>
      )}

      {/* Top Bar with Total Value and Quick Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Package className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-black text-white uppercase font-display tracking-wide">
              {t('inv.title', language, 'Ваш инвентарь')} ({inventory.length} {t('card.skins_count', language, 'скинов')})
            </h1>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            {t('inv.sub', language, 'Управляйте полученными предметами: продавайте за Acoin, улучшайте в Апгрейде или выводите в игры')}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-[#121825] px-4 py-2.5 rounded-xl border border-slate-800">
            <span className="text-[11px] text-slate-400 block">{t('inv.total_value', language, 'Общая стоимость:')}</span>
            <span className="text-xl font-bold font-mono text-amber-400">
              {totalValue.toLocaleString('ru-RU')} Acoin
            </span>
          </div>

          {inventory.length > 0 && (
            <>
              <button
                onClick={handleSellJunk}
                className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition cursor-pointer"
                title="Продать скины дешевле 100 Acoin"
              >
                {t('inv.sell_junk', language, 'Продать ширп (<100 AC)')}
              </button>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleSellAll}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-md ${
                    confirmSellAll
                      ? 'bg-red-600 hover:bg-red-500 text-white animate-pulse border border-red-400'
                      : 'bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30'
                  }`}
                  title="Продать все предметы из инвентаря"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>
                    {confirmSellAll
                      ? `${t('inv.confirm_sell_all', language, '⚠️ Точно продать всё')} (${totalValue.toLocaleString('ru-RU')} AC)?`
                      : t('inv.sell_all', language, 'Продать всё')}
                  </span>
                </button>

                {confirmSellAll && (
                  <button
                    onClick={() => setConfirmSellAll(false)}
                    className="px-2.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
                    title="Отменить продажу"
                  >
                    {t('inv.cancel', language, 'Отмена')}
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Filters and Sorting bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 p-3 rounded-xl bg-[#0f1422] border border-slate-800">
        {/* Rarity filter tabs */}
        <div className="flex flex-wrap items-center gap-1">
          <button
            onClick={() => setRarityFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition ${
              rarityFilter === 'all'
                ? 'bg-amber-500 text-black font-bold'
                : 'text-slate-400 hover:text-white bg-slate-900'
            }`}
          >
            Все ({inventory.length})
          </button>
          {(['rare', 'super_rare', 'epic', 'legendary', 'arcana', 'secret'] as ItemRarity[]).map((r) => {
            const count = inventory.filter(i => i.rarity === r).length;
            const config = RARITY_CONFIG[r];
            return (
              <button
                key={r}
                onClick={() => setRarityFilter(r)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition ${
                  rarityFilter === r
                    ? 'text-white font-bold'
                    : 'text-slate-400 hover:text-white bg-slate-900'
                }`}
                style={{
                  backgroundColor: rarityFilter === r ? `${config.color}35` : undefined,
                  border: rarityFilter === r ? `1px solid ${config.color}` : undefined,
                }}
              >
                {config.label} ({count})
              </button>
            );
          })}
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-4 h-4 text-slate-400" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-slate-900 border border-slate-700 text-xs rounded-lg px-2.5 py-1.5 text-slate-200 cursor-pointer focus:outline-none"
          >
            <option value="price_desc">Сначала дорогие</option>
            <option value="price_asc">Сначала дешёвые</option>
            <option value="recent">Сначала новые</option>
          </select>
        </div>
      </div>

      {/* Grid of Items */}
      {sortedItems.length === 0 ? (
        <div className="py-20 text-center rounded-2xl bg-[#0f1422] border border-dashed border-slate-800 flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-800/50 flex items-center justify-center text-3xl mb-3">
            📦
          </div>
          <h3 className="text-lg font-bold text-slate-300">{t('inv.empty_title', language, 'Инвентарь пуст')}</h3>
          <p className="text-xs text-slate-500 max-w-sm mt-1">
            {t('inv.empty_desc', language, 'Откройте кейсы на главной странице или введите промокод, чтобы получить скины!')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {sortedItems.map((item) => {
            const rarity = getRarityConfig(item.rarity);
            return (
              <div
                key={item.instanceId}
                className="rounded-xl bg-[#121825] border border-slate-800 hover:border-slate-700 flex flex-col justify-between p-3 relative group transition hover:shadow-lg"
                style={{ borderBottom: `3px solid ${rarity.color}` }}
              >
                {/* Wear and Origin */}
                <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                  <span className="font-mono">[{item.wear}]</span>
                  <span className="text-[9px] text-slate-400 truncate max-w-[90px]">
                    {item.fromCase || 'Кейс'}
                  </span>
                </div>

                {/* Weapon Icon */}
                <div className="my-2 py-1 flex items-center justify-center">
                  <WeaponIcon skin={item} size="md" />
                </div>

                {/* Skin Info */}
                <div className="text-center mt-1">
                  <div className="text-[11px] text-slate-400 truncate">
                    {item.weapon}
                  </div>
                  <div className="text-xs font-bold text-white truncate" style={{ color: rarity.color }}>
                    {item.skinName}
                  </div>
                  <div className="text-sm font-mono font-bold text-amber-400 mt-1">
                    {item.price.toLocaleString('ru-RU')} AC
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between gap-1">
                  <button
                    onClick={() => onSellItem(item.instanceId, item.price)}
                    className="flex-1 py-1 px-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[10px] font-semibold transition cursor-pointer truncate"
                    title="Продать скин"
                  >
                    {t('inv.sell', language, 'Продать')}
                  </button>

                  <button
                    onClick={() => onNavigateToUpgrade(item)}
                    className="p-1 rounded bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-[10px] transition cursor-pointer"
                    title={t('inv.to_upgrade', language, 'В Апгрейд')}
                  >
                    <Zap className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleSimulateWithdraw(item)}
                    className="p-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[10px] transition cursor-pointer"
                    title="Вывести скин в игру"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
