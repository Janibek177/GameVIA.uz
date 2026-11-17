import React, { useState } from 'react';
import { Skin } from '../types';
import { getRarityConfig } from '../data/skins';
import { getSkinImageUrl } from '../data/weaponImages';

interface WeaponIconProps {
  skin: Skin;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showGlow?: boolean;
  preferType?: 'auto' | 'img' | 'svg';
}

export const WeaponIcon: React.FC<WeaponIconProps> = ({
  skin,
  size = 'md',
  showGlow = true,
  preferType = 'auto',
}) => {
  const [imageFailed, setImageFailed] = useState(false);
  const imageUrl = skin?.imageUrl || getSkinImageUrl(skin);
  const showImage = (preferType === 'img' || (preferType === 'auto' && imageUrl)) && !imageFailed;
  const rarity = getRarityConfig(skin?.rarity);
  const skinColor = skin?.color || rarity.color || '#3b82f6';

  const sizeClasses = {
    sm: 'w-16 h-12',
    md: 'w-28 h-20',
    lg: 'w-44 h-28',
    xl: 'w-64 h-40',
  }[size];

  const weaponName = (skin?.weapon || '').toUpperCase();
  const skinName = (skin?.name || '').toUpperCase();
  const iconType = skin?.iconType || 'rifle';

  // Distinct color palettes per skin type
  const isLoreOrGold = skinName.includes('ИСТОРИЯ') || skinName.includes('LORE') || skinName.includes('GOLD') || skin?.rarity === 'arcana';
  const isFireOrRed = skinName.includes('ПЛАМЯ') || skinName.includes('REDLINE') || skinName.includes('КРАСН') || skinName.includes('АЗИМОВ') || skinName.includes('BLOOD');
  const isCyanOrIce = skinName.includes('НЕОН') || skinName.includes('ВОДЯН') || skinName.includes('СИГНАЛ') || skinName.includes('HYPER') || skin?.rarity === 'secret';
  const isPurple = skin?.rarity === 'epic' || skinName.includes('ИЗВИЛИНЫ') || skinName.includes('ФЕОД');

  const primaryGradient = isLoreOrGold
    ? ['#fbbf24', '#f59e0b', '#78350f']
    : isFireOrRed
    ? ['#f87171', '#dc2626', '#450a0a']
    : isCyanOrIce
    ? ['#38bdf8', '#0284c7', '#082f49']
    : isPurple
    ? ['#c084fc', '#9333ea', '#3b0764']
    : [skinColor, rarity.color, '#0f172a'];

  const gradId = `wep-grad-${skin?.id || 'def'}-${Math.abs((skin?.name || '').length)}`;

  // Determine specific weapon silhouette
  const isSniper = iconType === 'sniper' || weaponName.includes('AWP') || weaponName.includes('SSG');
  const isKnife = iconType === 'knife' || weaponName.includes('НОЖ') || weaponName.includes('КЕРАМБИТ') || weaponName.includes('БАБОЧКА') || weaponName.includes('ШТЫК');
  const isKarambit = isKnife && (weaponName.includes('КЕРАМБИТ') || skinName.includes('KARAMBIT'));
  const isButterfly = isKnife && (weaponName.includes('БАБОЧКА') || skinName.includes('BUTTERFLY'));
  const isPistol = iconType === 'pistol' || weaponName.includes('DEAGLE') || weaponName.includes('GLOCK') || weaponName.includes('USP') || weaponName.includes('P250');
  const isDeagle = isPistol && (weaponName.includes('DEAGLE') || weaponName.includes('DESERT'));
  const isUSP = isPistol && weaponName.includes('USP');
  const isGloves = iconType === 'gloves' || weaponName.includes('ПЕРЧАТКИ') || skinName.includes('GLOVES');
  const isSMG = iconType === 'smg' || weaponName.includes('MP9') || weaponName.includes('P90') || weaponName.includes('MAC-10');
  const isM4 = weaponName.includes('M4') || skinName.includes('M4A4') || skinName.includes('M4A1');

  // Tag info
  const displayTag = weaponName || (isSniper ? 'AWP' : isKnife ? 'НОЖ' : isPistol ? 'ПИСТОЛЕТ' : isGloves ? 'ПЕРЧАТКИ' : 'АК-47');
  const wearTag = skin?.wear || 'FN';
  const isStatTrak = skin?.rarity === 'arcana' || skin?.rarity === 'secret' || (skin?.price && skin.price > 1000);

  return (
    <div
      className={`relative flex items-center justify-center ${sizeClasses} select-none overflow-hidden rounded-xl group border border-slate-800/80 bg-gradient-to-b from-[#0e131f] via-[#090d15] to-[#06080d]`}
    >
      {/* Dynamic Ambient Background Glow */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none transition-opacity group-hover:opacity-40"
        style={{
          background: `radial-gradient(circle at center, ${rarity.color} 0%, transparent 75%)`,
        }}
      />

      {/* Cyber Grid Texture */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:12px_12px]" />

      {/* Watermark Weapon & Wear Badges */}
      {size !== 'sm' && (
        <div className="absolute top-1.5 left-2 z-20 flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity pointer-events-none">
          <span className="text-[9px] font-mono font-bold text-slate-300 uppercase tracking-wider bg-black/80 px-1.5 py-0.5 rounded border border-slate-700/60 shadow-sm backdrop-blur-xs">
            {displayTag}
          </span>
          <span className="text-[8px] font-mono font-bold text-amber-400 bg-amber-500/20 px-1 py-0.5 rounded border border-amber-500/30">
            {wearTag}
          </span>
          {isStatTrak && (
            <span className="text-[8px] font-mono font-extrabold text-orange-400 bg-orange-500/25 px-1 py-0.5 rounded border border-orange-500/40 shadow-[0_0_8px_rgba(249,115,22,0.4)]">
              ST™
            </span>
          )}
        </div>
      )}

      {/* Rarity Ambient Center Light */}
      {showGlow && (
        <div
          className="absolute inset-4 rounded-full blur-xl opacity-25 pointer-events-none group-hover:opacity-55 transition-opacity"
          style={{ backgroundColor: rarity.color }}
        />
      )}

      {/* ============================================================== */}
      {/* CRISP IMAGE OR PROCEDURAL SVG VECTOR WEAPON RENDERING         */}
      {/* ============================================================== */}
      {showImage ? (
        <img
          src={imageUrl}
          alt={skin?.name || 'Weapon'}
          className="relative z-10 max-w-full max-h-full object-contain p-1.5 group-hover:scale-110 transition-transform duration-300 drop-shadow-[0_8px_16px_rgba(0,0,0,0.9)]"
          onError={() => setImageFailed(true)}
          loading="lazy"
        />
      ) : (
        <svg
          viewBox="0 0 160 80"
          className="relative z-10 w-full h-full p-2 group-hover:scale-110 transition-transform duration-300 drop-shadow-[0_8px_16px_rgba(0,0,0,0.9)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
        <defs>
          <linearGradient id={`${gradId}-main`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={primaryGradient[0]} />
            <stop offset="50%" stopColor={primaryGradient[1]} />
            <stop offset="100%" stopColor={primaryGradient[2]} />
          </linearGradient>

          <linearGradient id={`${gradId}-metal`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#475569" />
            <stop offset="35%" stopColor="#94a3b8" />
            <stop offset="70%" stopColor="#334155" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>

          <linearGradient id={`${gradId}-gold`} x1="0%" y1="0%" x2="100%" y2="50%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="40%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#78350f" />
          </linearGradient>

          <linearGradient id={`${gradId}-dark`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#090d16" />
          </linearGradient>

          <filter id={`${gradId}-glow`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* 1. SNIPER RIFLE (AWP / SSG) */}
        {isSniper && (
          <g transform="translate(5, 12)">
            {/* Long Barrel & Muzzle Brake */}
            <path d="M78 22 L146 22 L146 25 L143 27 L78 27 Z" fill={`url(#${gradId}-metal)`} />
            <rect x="146" y="21" width="6" height="7" rx="1" fill="#0f172a" stroke="#64748b" strokeWidth="0.5" />
            <line x1="148" y1="23" x2="148" y2="26" stroke="#94a3b8" strokeWidth="0.75" />
            
            {/* Bipod mount */}
            <path d="M125 27 L122 36 M127 27 L130 36" stroke="#475569" strokeWidth="1.2" strokeLinecap="round" />

            {/* Massive Telescopic Optical Scope */}
            <rect x="42" y="10" width="46" height="7" rx="2" fill={`url(#${gradId}-dark)`} stroke="#475569" strokeWidth="0.75" />
            {/* Scope bells */}
            <path d="M38 8 L42 10 L42 17 L38 19 Z" fill="#0f172a" stroke="#64748b" strokeWidth="0.5" />
            <circle cx="39" cy="13.5" r="3" fill={primaryGradient[0]} opacity="0.8" />
            <path d="M88 10 L94 8 L94 19 L88 17 Z" fill="#0f172a" stroke="#64748b" strokeWidth="0.5" />
            <circle cx="93" cy="13.5" r="3" fill="#38bdf8" opacity="0.7" />
            {/* Scope adjustment turrets */}
            <rect x="63" y="7" width="5" height="3" fill="#64748b" rx="0.5" />
            {/* Scope mounts */}
            <path d="M48 17 L52 23 M76 17 L72 23" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" />

            {/* Receiver Chassis (Skin body with vibrant gradient) */}
            <path
              d="M36 23 L96 23 L92 31 L80 32 L78 26 L50 26 L42 36 L24 38 L16 36 L12 28 L36 23 Z"
              fill={`url(#${gradId}-main)`}
              stroke={skinColor}
              strokeWidth="0.75"
              filter={`url(#${gradId}-glow)`}
            />

            {/* Bolt Handle */}
            <path d="M52 20 L54 17 L57 17" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="58" cy="17" r="1.5" fill="#f8fafc" />

            {/* Ergonomic Thumbhole Sniper Stock */}
            <path
              d="M12 28 L36 28 L30 46 L8 44 L6 33 Z"
              fill={`url(#${gradId}-dark)`}
              stroke="#334155"
              strokeWidth="0.75"
            />
            {/* Thumbhole cut */}
            <ellipse cx="22" cy="36" rx="5" ry="3.5" fill="#090d15" stroke="#475569" strokeWidth="0.5" />
            {/* Butt-pad */}
            <rect x="4" y="30" width="3" height="15" rx="1.5" fill="#1e293b" stroke="#475569" strokeWidth="0.5" />

            {/* Straight Box Magazine */}
            <path d="M64 32 L62 44 L72 44 L75 32 Z" fill="#0f172a" stroke="#475569" strokeWidth="0.75" />
            <line x1="66" y1="35" x2="65" y2="42" stroke={skinColor} strokeWidth="0.75" opacity="0.6" />

            {/* Trigger Guard & Trigger */}
            <path d="M48 33 C48 38 56 38 56 33" stroke="#64748b" strokeWidth="0.75" fill="none" />
            <path d="M51 34 L52 36" stroke="#cbd5e1" strokeWidth="1" strokeLinecap="round" />

            {/* Weapon highlight specular line */}
            <path d="M38 25 L92 25" stroke="#ffffff" strokeWidth="0.75" strokeLinecap="round" opacity="0.5" />
          </g>
        )}

        {/* 2. KARAMBIT KNIFE */}
        {isKarambit && (
          <g transform="translate(18, 14)">
            {/* Ergonomic handle with finger grooves */}
            <path
              d="M20 28 C26 22 36 20 48 24 C54 26 58 32 60 38 C56 42 46 44 38 40 C30 38 24 35 20 28 Z"
              fill={`url(#${gradId}-dark)`}
              stroke="#475569"
              strokeWidth="1"
            />
            {/* Finger indents */}
            <circle cx="36" cy="30" r="2.5" fill="#090d15" stroke="#334155" strokeWidth="0.5" />
            <circle cx="46" cy="32" r="2.5" fill="#090d15" stroke="#334155" strokeWidth="0.5" />

            {/* Safety Pommel Ring */}
            <circle cx="16" cy="27" r="8" fill="none" stroke={`url(#${gradId}-metal)`} strokeWidth="3" />
            <circle cx="16" cy="27" r="5" fill="#090d15" />

            {/* Curved Hawkbill Talon Blade */}
            <path
              d="M58 26 C72 24 95 30 114 46 C98 52 76 48 58 38 Z"
              fill={`url(#${gradId}-main)`}
              stroke={skinColor}
              strokeWidth="0.8"
              filter={`url(#${gradId}-glow)`}
            />
            {/* Razor Edge / Grind bevel */}
            <path
              d="M60 38 C78 46 98 48 114 46"
              stroke="#ffffff"
              strokeWidth="1.2"
              strokeLinecap="round"
              opacity="0.85"
            />
            {/* Blade spine highlight */}
            <path d="M60 26 C75 25 96 32 110 44" stroke={primaryGradient[0]} strokeWidth="0.75" opacity="0.6" />
          </g>
        )}

        {/* 3. BUTTERFLY KNIFE (Balisong) */}
        {isButterfly && (
          <g transform="translate(15, 12)">
            {/* Safe & Bite Handles swung in open grip */}
            <path
              d="M16 18 L64 26 L62 31 L14 23 Z"
              fill={`url(#${gradId}-dark)`}
              stroke="#475569"
              strokeWidth="0.75"
            />
            <circle cx="26" cy="21" r="1.5" fill="#38bdf8" opacity="0.7" />
            <circle cx="36" cy="23" r="1.5" fill="#38bdf8" opacity="0.7" />
            <circle cx="46" cy="25" r="1.5" fill="#38bdf8" opacity="0.7" />

            <path
              d="M18 36 L64 30 L66 35 L20 41 Z"
              fill={`url(#${gradId}-dark)`}
              stroke="#475569"
              strokeWidth="0.75"
            />
            <circle cx="28" cy="38" r="1.5" fill="#38bdf8" opacity="0.7" />
            <circle cx="38" cy="36" r="1.5" fill="#38bdf8" opacity="0.7" />
            <circle cx="48" cy="34" r="1.5" fill="#38bdf8" opacity="0.7" />

            {/* Pivot Pins & Choil */}
            <circle cx="64" cy="28" r="3" fill="#cbd5e1" stroke="#0f172a" strokeWidth="0.75" />
            <circle cx="65" cy="32" r="3" fill="#cbd5e1" stroke="#0f172a" strokeWidth="0.75" />

            {/* Curved Swedge Bowie Blade */}
            <path
              d="M66 28 L124 25 C120 32 108 38 88 36 L66 33 Z"
              fill={`url(#${gradId}-main)`}
              stroke={skinColor}
              strokeWidth="0.8"
              filter={`url(#${gradId}-glow)`}
            />
            {/* Sharp Cutting Edge */}
            <path d="M66 33 L88 36 C108 38 120 32 124 25" stroke="#ffffff" strokeWidth="1.2" opacity="0.9" />
          </g>
        )}

        {/* 4. COMBAT KNIVES (M9 Bayonet, Gut Knife, etc.) */}
        {isKnife && !isKarambit && !isButterfly && (
          <g transform="translate(16, 15)">
            {/* Handle with ribs */}
            <path d="M12 28 L48 28 L46 38 L14 38 Z" fill="#0f172a" stroke="#475569" strokeWidth="0.75" />
            <line x1="22" y1="28" x2="22" y2="38" stroke="#334155" strokeWidth="1.5" />
            <line x1="30" y1="28" x2="30" y2="38" stroke="#334155" strokeWidth="1.5" />
            <line x1="38" y1="28" x2="38" y2="38" stroke="#334155" strokeWidth="1.5" />
            {/* Pommel */}
            <rect x="8" y="27" width="5" height="12" rx="1.5" fill="#475569" stroke="#94a3b8" strokeWidth="0.5" />
            {/* Crossguard */}
            <rect x="47" y="22" width="4" height="22" rx="1" fill="#64748b" stroke="#cbd5e1" strokeWidth="0.5" />

            {/* Massive Bowie / M9 Blade with Sawback */}
            <path
              d="M51 25 L98 25 L124 33 C108 39 76 40 51 36 Z"
              fill={`url(#${gradId}-main)`}
              stroke={skinColor}
              strokeWidth="0.8"
              filter={`url(#${gradId}-glow)`}
            />
            {/* Saw teeth on spine */}
            <path d="M60 25 L63 22 L66 25 L69 22 L72 25 L75 22 L78 25 L81 22 L84 25" stroke="#94a3b8" strokeWidth="0.75" />
            {/* Blood groove fuller */}
            <line x1="60" y1="30" x2="95" y2="30" stroke="#090d15" strokeWidth="1.5" strokeLinecap="round" />
            {/* Razor cutting edge */}
            <path d="M51 36 C76 40 108 39 124 33" stroke="#ffffff" strokeWidth="1.2" opacity="0.9" />
          </g>
        )}

        {/* 5. DESERT EAGLE PISTOL */}
        {isDeagle && (
          <g transform="translate(30, 16)">
            {/* Textured Grip Handle */}
            <path
              d="M24 24 L36 24 L46 54 L30 55 L22 36 Z"
              fill={`url(#${gradId}-dark)`}
              stroke="#334155"
              strokeWidth="0.8"
            />
            {/* Desert Eagle Eagle Emblem / Grip Medallion */}
            <circle cx="34" cy="40" r="4.5" fill="#090d15" stroke={skinColor} strokeWidth="0.75" />
            <path d="M32 40 L34 38 L36 40 L34 42 Z" fill="#f59e0b" />

            {/* Heavy Massive Polygonal Slide */}
            <path
              d="M20 16 L94 16 L96 26 L22 26 Z"
              fill={`url(#${gradId}-main)`}
              stroke={skinColor}
              strokeWidth="0.8"
              filter={`url(#${gradId}-glow)`}
            />
            {/* Slide bevel and ejection port */}
            <rect x="42" y="17" width="16" height="5" fill="#0f172a" stroke="#475569" strokeWidth="0.5" />
            {/* Rear slide serrations */}
            <line x1="26" y1="18" x2="26" y2="24" stroke="#64748b" strokeWidth="0.75" />
            <line x1="29" y1="18" x2="29" y2="24" stroke="#64748b" strokeWidth="0.75" />
            <line x1="32" y1="18" x2="32" y2="24" stroke="#64748b" strokeWidth="0.75" />

            {/* Front & Rear Sights */}
            <rect x="22" y="13" width="3" height="3" fill="#cbd5e1" />
            <rect x="90" y="13" width="3" height="3" fill="#cbd5e1" />

            {/* Trigger Guard & Trigger */}
            <path d="M38 26 C38 34 50 34 50 26" stroke="#64748b" strokeWidth="1" fill="none" />
            <path d="M43 28 L44 31" stroke="#cbd5e1" strokeWidth="1.2" strokeLinecap="round" />
            
            {/* Specular highlight */}
            <line x1="22" y1="17.5" x2="92" y2="17.5" stroke="#ffffff" strokeWidth="0.8" opacity="0.6" />
          </g>
        )}

        {/* 6. GLOCK / USP PISTOL */}
        {isPistol && !isDeagle && (
          <g transform="translate(26, 16)">
            {/* Grip Handle */}
            <path
              d="M24 24 L36 24 L42 52 L28 53 L22 34 Z"
              fill={`url(#${gradId}-dark)`}
              stroke="#334155"
              strokeWidth="0.8"
            />
            {/* Stippling texture on grip */}
            <line x1="28" y1="36" x2="36" y2="36" stroke="#475569" strokeWidth="1" strokeDasharray="1 1.5" />
            <line x1="29" y1="42" x2="38" y2="42" stroke="#475569" strokeWidth="1" strokeDasharray="1 1.5" />

            {/* Slide */}
            <path
              d="M20 17 L82 17 L82 26 L22 26 Z"
              fill={`url(#${gradId}-main)`}
              stroke={skinColor}
              strokeWidth="0.8"
              filter={`url(#${gradId}-glow)`}
            />
            <rect x="44" y="18" width="12" height="4" fill="#090d15" stroke="#475569" strokeWidth="0.5" />

            {/* Optional USP Suppressor (Silencer) */}
            {isUSP && (
              <g>
                <rect x="82" y="18" width="32" height="8" rx="2" fill={`url(#${gradId}-metal)`} stroke="#64748b" strokeWidth="0.75" />
                <line x1="90" y1="18" x2="90" y2="26" stroke="#334155" strokeWidth="0.75" />
                <line x1="102" y1="18" x2="102" y2="26" stroke="#334155" strokeWidth="0.75" />
              </g>
            )}

            {/* Sights */}
            <rect x="22" y="14" width="2.5" height="3" fill="#cbd5e1" />
            <rect x={isUSP ? "80" : "78"} y="14" width="2.5" height="3" fill="#cbd5e1" />

            {/* Trigger Guard */}
            <path d="M36 26 C36 33 46 33 46 26" stroke="#64748b" strokeWidth="1" fill="none" />
            <path d="M40 28 L41 31" stroke="#cbd5e1" strokeWidth="1" strokeLinecap="round" />
          </g>
        )}

        {/* 7. M4A4 / M4A1-S RIFLE */}
        {isM4 && (
          <g transform="translate(10, 14)">
            {/* Barrel & Flash Hider */}
            <rect x="94" y="22" width="40" height="4" fill={`url(#${gradId}-metal)`} />
            <rect x="134" y="21" width="6" height="6" rx="1" fill="#0f172a" stroke="#64748b" strokeWidth="0.5" />
            {/* Front Sight Post */}
            <polygon points="120,22 122,15 125,15 127,22" fill="#475569" />

            {/* Handguard (Upper & Lower) */}
            <rect x="76" y="20" width="28" height="8" rx="1" fill={`url(#${gradId}-dark)`} stroke="#475569" strokeWidth="0.5" />
            {/* Picatinny quad rail lines */}
            <line x1="78" y1="20" x2="102" y2="20" stroke="#94a3b8" strokeWidth="1" strokeDasharray="1.5 1.5" />

            {/* Receiver (Skin Canvas) */}
            <path
              d="M44 20 L76 20 L76 28 L66 29 L54 29 L46 29 Z"
              fill={`url(#${gradId}-main)`}
              stroke={skinColor}
              strokeWidth="0.8"
              filter={`url(#${gradId}-glow)`}
            />
            {/* Carry Handle / Top Rail with Holo Sight */}
            <path d="M46 20 L48 14 L68 14 L70 20 Z" fill="#0f172a" stroke="#475569" strokeWidth="0.75" />
            <line x1="52" y1="16" x2="64" y2="16" stroke={primaryGradient[0]} strokeWidth="1" />

            {/* STANAG Curved Magazine */}
            <path d="M58 29 L64 47 L74 46 L70 29 Z" fill="#0f172a" stroke="#475569" strokeWidth="0.75" />
            <line x1="65" y1="33" x2="68" y2="42" stroke={skinColor} strokeWidth="0.75" opacity="0.6" />

            {/* Pistol Grip */}
            <path d="M42 28 L40 44 L48 44 L48 29 Z" fill="#090d15" stroke="#334155" strokeWidth="0.75" />

            {/* Collapsible Crane Buttstock */}
            <rect x="22" y="22" width="22" height="4" fill="#64748b" />
            <path d="M12 20 L32 20 L30 34 L16 38 L12 24 Z" fill={`url(#${gradId}-dark)`} stroke="#475569" strokeWidth="0.75" />
            {/* Rubber buttpad */}
            <rect x="8" y="21" width="4" height="17" rx="1.5" fill="#0f172a" />
          </g>
        )}

        {/* 8. AK-47 RIFLE (Default for assault rifles and iconic skins) */}
        {!isSniper && !isKnife && !isPistol && !isM4 && !isGloves && !isSMG && (
          <g transform="translate(10, 14)">
            {/* Barrel, Gas Tube & Slanted Muzzle Brake */}
            <rect x="94" y="22" width="42" height="3.5" fill={`url(#${gradId}-metal)`} />
            <rect x="90" y="19" width="30" height="3" fill="#334155" />
            <polygon points="136,21 142,20 142,26 136,25" fill="#0f172a" stroke="#64748b" strokeWidth="0.5" />
            {/* Front Sight Base */}
            <polygon points="126,22 128,15 131,15 133,22" fill="#475569" />

            {/* Wooden / Synthetic Upper & Lower Handguard */}
            <path
              d="M74 18 L94 18 L92 28 L74 28 Z"
              fill={`url(#${gradId}-main)`}
              stroke={skinColor}
              strokeWidth="0.8"
              filter={`url(#${gradId}-glow)`}
            />

            {/* Receiver with Dust Cover */}
            <path
              d="M44 19 L74 19 L74 29 L64 29 L46 29 Z"
              fill={`url(#${gradId}-main)`}
              stroke={skinColor}
              strokeWidth="0.8"
              filter={`url(#${gradId}-glow)`}
            />
            {/* Safety Selector Lever */}
            <line x1="50" y1="23" x2="66" y2="25" stroke="#cbd5e1" strokeWidth="1" strokeLinecap="round" />
            <circle cx="49" cy="23" r="1.5" fill="#94a3b8" />

            {/* Rear Tangent Sight */}
            <rect x="70" y="16" width="6" height="3" fill="#64748b" />

            {/* Iconic Curved Banana Magazine with ribbed stamping */}
            <path
              d="M58 29 C62 38 72 46 84 49 L88 44 C78 40 70 34 68 29 Z"
              fill="#0f172a"
              stroke="#475569"
              strokeWidth="0.8"
            />
            <path d="M64 34 C69 39 76 43 82 45" stroke={skinColor} strokeWidth="0.75" opacity="0.6" strokeDasharray="1 2" />

            {/* Pistol Grip */}
            <path d="M42 29 L39 45 L47 45 L48 29 Z" fill="#090d15" stroke="#334155" strokeWidth="0.8" />

            {/* Classic Wooden / Polymer Buttstock */}
            <path
              d="M12 28 L44 23 L44 29 L28 40 L12 42 Z"
              fill={`url(#${gradId}-dark)`}
              stroke="#334155"
              strokeWidth="0.8"
            />
            {/* Butt-plate */}
            <rect x="9" y="27" width="3.5" height="15" rx="1.5" fill="#0f172a" stroke="#475569" strokeWidth="0.5" />

            {/* Specular highlight along top ridge */}
            <line x1="44" y1="19.5" x2="94" y2="19.5" stroke="#ffffff" strokeWidth="0.75" opacity="0.6" strokeLinecap="round" />
          </g>
        )}

        {/* 9. TACTICAL COMBAT GLOVES */}
        {isGloves && (
          <g transform="translate(35, 14)">
            {/* Left Glove Silhouette */}
            <path
              d="M14 26 C16 16 28 14 36 22 L44 28 C46 34 42 46 34 48 L22 46 C16 42 12 34 14 26 Z"
              fill={`url(#${gradId}-main)`}
              stroke={skinColor}
              strokeWidth="0.8"
              filter={`url(#${gradId}-glow)`}
            />
            {/* Molded Knuckle Armor */}
            <rect x="22" y="22" width="14" height="6" rx="2" fill="#0f172a" stroke="#64748b" strokeWidth="0.75" />
            <circle cx="25" cy="25" r="1" fill="#38bdf8" />
            <circle cx="29" cy="25" r="1" fill="#38bdf8" />
            <circle cx="33" cy="25" r="1" fill="#38bdf8" />

            {/* Right Glove Silhouette */}
            <path
              d="M54 26 C56 16 68 14 76 22 L84 28 C86 34 82 46 74 48 L62 46 C56 42 52 34 54 26 Z"
              fill={`url(#${gradId}-main)`}
              stroke={skinColor}
              strokeWidth="0.8"
              filter={`url(#${gradId}-glow)`}
            />
            {/* Molded Knuckle Armor */}
            <rect x="62" y="22" width="14" height="6" rx="2" fill="#0f172a" stroke="#64748b" strokeWidth="0.75" />
            <circle cx="65" cy="25" r="1" fill="#38bdf8" />
            <circle cx="69" cy="25" r="1" fill="#38bdf8" />
            <circle cx="73" cy="25" r="1" fill="#38bdf8" />

            {/* Wrist Straps with Rubber Velcro Pull */}
            <rect x="18" y="44" width="16" height="5" rx="1" fill="#1e293b" stroke="#475569" strokeWidth="0.5" />
            <rect x="58" y="44" width="16" height="5" rx="1" fill="#1e293b" stroke="#475569" strokeWidth="0.5" />
          </g>
        )}

        {/* 10. SMG (MP9 / P90) */}
        {isSMG && (
          <g transform="translate(24, 16)">
            {/* Compact Body */}
            <path
              d="M24 20 L86 20 L86 32 L68 32 L62 44 L48 44 L50 32 L26 32 Z"
              fill={`url(#${gradId}-main)`}
              stroke={skinColor}
              strokeWidth="0.8"
              filter={`url(#${gradId}-glow)`}
            />
            {/* Top charging rail */}
            <line x1="28" y1="18" x2="80" y2="18" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="2 2" />
            {/* Forward integrated grip */}
            <path d="M74 32 L78 46 L70 46 L68 32 Z" fill="#090d15" stroke="#334155" strokeWidth="0.75" />
            {/* Muzzle */}
            <rect x="86" y="23" width="8" height="5" fill="#0f172a" stroke="#64748b" strokeWidth="0.5" />
            {/* Wire folding stock */}
            <path d="M24 24 L10 24 L8 36" stroke="#475569" strokeWidth="1.5" fill="none" />
          </g>
        )}
      </svg>
      )}

      {/* Rarity Bottom Accent Line */}
      <div
        className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full opacity-80"
        style={{ backgroundColor: rarity.color }}
      />
    </div>
  );
};
