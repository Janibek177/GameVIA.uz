import React from 'react';
import { DropEvent } from '../types';
import { getRarityConfig } from '../data/skins';
import { WeaponIcon } from './WeaponIcon';
import { Users, Sparkles } from 'lucide-react';

interface LiveDropsBarProps {
  drops?: DropEvent[];
  onSelectSkin?: (skin: DropEvent) => void;
  currency?: 'RUB' | 'UZS';
}

export const LiveDropsBar: React.FC<LiveDropsBarProps> = ({
  drops = [],
  onSelectSkin,
  currency = 'RUB',
}) => {
  return (
    <div className="w-full bg-[#0d121c] border-b border-slate-800/80 px-3 py-2 overflow-hidden select-none">
      <div className="flex items-center gap-3 max-w-7xl mx-auto">
        <div className="flex items-center gap-2 shrink-0 pr-2 border-r border-slate-800">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <div className="flex items-center gap-1.5 text-[11px] font-bold tracking-wider text-slate-300 uppercase">
            <Users className="w-3.5 h-3.5 text-emerald-400" />
            <span>Дропы игроков</span>
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-0.5 mask-gradient min-h-[38px] flex-1">
          {drops.length === 0 ? (
            <div className="flex items-center gap-2 text-xs text-slate-500 py-1 font-medium italic">
              <Sparkles className="w-3.5 h-3.5 text-amber-500/70 animate-pulse" />
              <span>Ожидание выигрышей реальных игроков... Открывайте кейсы и выигрывайте!</span>
            </div>
          ) : (
            drops.map((drop) => {
              const rarity = getRarityConfig(drop.skin?.rarity);
              const displayPrice = currency === 'UZS' 
                ? `${Math.round(drop.skin.price * 135).toLocaleString('ru-RU')} сум`
                : `${drop.skin.price.toLocaleString('ru-RU')} AC`;

              return (
                <div
                  key={drop.id}
                  onClick={() => onSelectSkin?.(drop)}
                  className="group relative shrink-0 flex items-center gap-2.5 px-2.5 py-1.5 rounded-md bg-[#131a27] hover:bg-[#182132] border border-slate-800 hover:border-slate-700 cursor-pointer transition-all duration-200"
                  style={{ borderBottom: `2px solid ${rarity.color}` }}
                  title={`${drop.username} выбил ${drop.skin.name} (${displayPrice})`}
                >
                  <div className="w-8 h-6 flex items-center justify-center">
                    <WeaponIcon skin={drop.skin} size="sm" showGlow={false} />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-[10px] text-emerald-400 font-bold truncate max-w-[85px] flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                      {drop.username}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-200 truncate max-w-[100px]" style={{ color: rarity.color }}>
                      {drop.skin.skinName}
                    </span>
                  </div>
                  <div className="text-[10px] font-mono text-amber-400/90 ml-1 font-bold">
                    {displayPrice}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
