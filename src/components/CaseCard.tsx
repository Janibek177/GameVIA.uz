import React from 'react';
import { CaseDefinition } from '../types';
import { calculateCaseStats } from '../data/cases';
import { WeaponIcon } from './WeaponIcon';
import { Sparkles, ArrowRight, Zap } from 'lucide-react';
import { RARITY_CONFIG, getRarityConfig } from '../data/skins';
import { getCaseImageUrl } from '../data/weaponImages';
import { Language, t, getCaseLocalizedName, getCaseLocalizedDesc } from '../utils/i18n';

interface CaseCardProps {
  caseDef: CaseDefinition;
  onOpen: (c: CaseDefinition) => void;
  userBalance: number;
  hasVoucher?: boolean;
  lastDailyOpenTime?: number;
  lastTgOpenTime?: number;
  isTgSubscribed?: boolean;
  language?: Language;
}

const DAILY_COOLDOWN_MS = 24 * 60 * 60 * 1000;

export const CaseCard: React.FC<CaseCardProps> = ({
  caseDef,
  onOpen,
  userBalance,
  hasVoucher,
  lastDailyOpenTime = 0,
  lastTgOpenTime = 0,
  isTgSubscribed = false,
  language = 'ru',
}) => {
  const [imgError, setImgError] = React.useState(false);
  const [now, setNow] = React.useState<number>(Date.now());

  // Update time for countdown every 5 seconds if daily or tg case
  React.useEffect(() => {
    if (caseDef.id !== 'free_daily' && caseDef.id !== 'tg_subscribe_case') return;
    const timer = setInterval(() => setNow(Date.now()), 5000);
    return () => clearInterval(timer);
  }, [caseDef.id]);

  const stats = calculateCaseStats(caseDef);
  const canAfford = userBalance >= caseDef.price;

  // Daily case cooldown check
  const isDailyCase = caseDef.id === 'free_daily';
  const dailyTimePassed = now - lastDailyOpenTime;
  const isDailyLocked = isDailyCase && lastDailyOpenTime > 0 && dailyTimePassed < DAILY_COOLDOWN_MS;
  const dailyRemainingMs = Math.max(0, DAILY_COOLDOWN_MS - dailyTimePassed);
  const remainingHours = Math.floor(dailyRemainingMs / (1000 * 60 * 60));
  const remainingMinutes = Math.floor((dailyRemainingMs % (1000 * 60 * 60)) / (1000 * 60));

  // Telegram case check (BOTH: strictly subscribed AND 24h daily cooldown)
  const isTgCase = caseDef.id === 'tg_subscribe_case';
  const tgTimePassed = now - lastTgOpenTime;
  const isTgCooldownLocked = isTgCase && lastTgOpenTime > 0 && tgTimePassed < DAILY_COOLDOWN_MS;
  const tgRemainingMs = Math.max(0, DAILY_COOLDOWN_MS - tgTimePassed);
  const tgRemainingHours = Math.floor(tgRemainingMs / (1000 * 60 * 60));
  const tgRemainingMinutes = Math.floor((tgRemainingMs % (1000 * 60 * 60)) / (1000 * 60));
  const isTgNotSubscribed = isTgCase && !isTgSubscribed;
  const isTgLocked = isTgCase && (isTgNotSubscribed || isTgCooldownLocked);

  // Top 3 best items in this case for preview
  const topItems = [...caseDef.items]
    .sort((a, b) => b.skin.price - a.skin.price)
    .slice(0, 3);

  const mainItem = topItems[0]?.skin;
  const mainRarity = getRarityConfig(mainItem?.rarity);
  const caseBoxImg = getCaseImageUrl(caseDef);

  return (
    <div className="group relative rounded-2xl bg-[#0e1422] border border-slate-800/90 hover:border-amber-500/50 transition-all duration-300 flex flex-col justify-between overflow-hidden hover:shadow-[0_12px_35px_rgba(0,0,0,0.7)] hover:-translate-y-1">
      {/* Top Accent Rim */}
      <div
        className="h-1 w-full transition-all duration-300 group-hover:h-1.5"
        style={{
          background: `linear-gradient(to right, ${caseDef.accentColor}, #f59e0b, ${caseDef.accentColor})`,
        }}
      />

      {/* Cyber Corner Glow */}
      <div
        className="absolute -top-12 -right-12 w-28 h-28 rounded-full blur-2xl opacity-15 group-hover:opacity-40 transition-opacity pointer-events-none"
        style={{ backgroundColor: caseDef.accentColor }}
      />

      <div className="p-5 flex flex-col flex-1">
        {/* Title, Case 3D Crate Image and Price */}
        <div className="flex items-start justify-between gap-2.5 mb-2">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {!imgError && caseBoxImg ? (
              <img
                src={caseBoxImg}
                alt={caseDef.name}
                className="w-12 h-12 object-contain drop-shadow-[0_6px_12px_rgba(0,0,0,0.8)] group-hover:scale-110 transition-transform duration-300 shrink-0"
                loading="lazy"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-purple-600/20 border border-amber-500/40 flex items-center justify-center shrink-0 shadow-inner">
                <svg className="w-6 h-6 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                  <path d="m3.3 7 8.7 5 8.7-5" />
                  <path d="M12 22V12" />
                </svg>
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h3 className="font-extrabold text-base sm:text-lg text-white group-hover:text-amber-400 transition-colors font-display tracking-wide truncate">
                {getCaseLocalizedName(caseDef.id, caseDef.name, language)}
              </h3>
              <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                {getCaseLocalizedDesc(caseDef.id, caseDef.description, language)}
              </p>
            </div>
          </div>

          <div className="text-right shrink-0">
            <div className="text-base font-black font-mono text-amber-400">
              {caseDef.price === 0 ? 'FREE' : `${caseDef.price.toLocaleString('ru-RU')} AC`}
            </div>
            {isDailyLocked ? (
              <div className="text-[10px] text-amber-400/90 font-mono font-bold">
                ⏳ {remainingHours}ч {remainingMinutes}м
              </div>
            ) : isDailyCase ? (
              <div className="text-[10px] text-emerald-400 font-mono font-bold">
                ✓ 1 раз в 24ч
              </div>
            ) : isTgCooldownLocked ? (
              <div className="text-[10px] text-amber-400/90 font-mono font-bold">
                ⏳ {tgRemainingHours}ч {tgRemainingMinutes}м
              </div>
            ) : isTgNotSubscribed ? (
              <div className="text-[10px] text-sky-400 font-mono font-bold">
                📢 Нужна подписка
              </div>
            ) : isTgCase ? (
              <div className="text-[10px] text-emerald-400 font-mono font-bold">
                ✓ 1 раз в 24ч
              </div>
            ) : (
              <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                RTP: <span className="font-semibold text-slate-300">{stats.rtp}%</span>
              </div>
            )}
          </div>
        </div>

        {/* Central Weapon Showcase Pod */}
        <div className="relative my-3 py-4 flex items-center justify-center bg-[#070a11]/90 rounded-xl border border-slate-800/80 group-hover:border-slate-700 overflow-hidden shadow-inner min-h-[140px]">
          {/* Subtle Ambient Radial Light behind Weapon */}
          <div
            className="absolute inset-0 opacity-25 group-hover:opacity-45 transition-opacity pointer-events-none"
            style={{
              background: `radial-gradient(circle at center, ${mainRarity.color} 0%, transparent 70%)`,
            }}
          />

          {/* Weapon Showcase */}
          <div className="relative z-10 w-full flex items-center justify-center px-2 transform group-hover:scale-105 transition-transform duration-300">
            <WeaponIcon skin={mainItem} size="lg" />
          </div>

          {/* Top Drop Overlay Pill */}
          <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur border border-slate-800/90 text-[10px] z-20">
            <span className="text-slate-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              Топ:
            </span>
            <span className="font-semibold text-amber-300 truncate max-w-[130px]">
              {mainItem.name}
            </span>
            <span className="font-mono text-slate-300 font-bold ml-1">
              {mainItem.price.toLocaleString('ru-RU')} AC
            </span>
          </div>
        </div>

        {/* Items Included Micro-Badges */}
        <div className="mt-auto pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            {topItems.map((ti, i) => {
              const rConfig = getRarityConfig(ti.skin?.rarity);
              return (
                <span
                  key={i}
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: rConfig.color }}
                  title={`${ti.skin.name} (${rConfig.label})`}
                />
              );
            })}
            <span className="text-[11px] text-slate-400 ml-1">
              {caseDef.items.length} {t('card.skins_count', language, 'скинов')}
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            EV: ~{stats.expectedValue} AC
          </span>
        </div>
      </div>

      {/* Button */}
      <div className="p-4 pt-0">
        <button
          onClick={() => onOpen(caseDef)}
          className={`w-full py-2.5 px-4 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg active:scale-95 ${
            hasVoucher
              ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 text-black shadow-emerald-500/30 animate-pulse'
              : isDailyLocked || isTgCooldownLocked
              ? 'bg-slate-800 hover:bg-slate-750 text-amber-400 border border-amber-500/30'
              : isTgNotSubscribed
              ? 'bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white shadow-sky-500/20'
              : caseDef.price === 0
              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black shadow-emerald-500/20'
              : canAfford
              ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:from-amber-400 hover:to-orange-400 text-black shadow-amber-500/20'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-400'
          }`}
        >
          <span>
            {hasVoucher
              ? t('card.voucher_open', language, '🎁 Открыть по промокоду')
              : isDailyLocked
              ? `⏳ ${t('card.available_in', language, 'Доступен через')} ${remainingHours}h ${remainingMinutes}m`
              : isDailyCase
              ? t('card.open_daily', language, '🎁 Открыть ежедневный')
              : isTgCooldownLocked
              ? `⏳ ${t('card.available_in', language, 'Доступен через')} ${tgRemainingHours}h ${tgRemainingMinutes}m`
              : isTgNotSubscribed
              ? t('card.subscribe_tg', language, '📢 Подпишись на TG')
              : isTgCase
              ? t('card.tg_bonus', language, '🎁 Бонус Telegram (1 раз в 24ч)')
              : caseDef.price === 0
              ? t('card.open_free', language, 'Открыть бесплатно')
              : t('card.open', language, 'Открыть кейс')}
          </span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
