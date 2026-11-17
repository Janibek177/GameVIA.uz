export interface GoldPromo {
  type: 'gold';
  reward: number;
  label: string;
  badge: string;
  maxActivations: number;
}

export interface CasePromo {
  type: 'case';
  caseId: string;
  caseName: string;
  label: string;
  badge: string;
  maxActivations: number;
}

export type PromoDefinition = GoldPromo | CasePromo;

export interface PromoPack {
  id: string;
  title: string;
  description: string;
  codes: string[]; // 5 promo codes: 2 gold, 3 cases
}

// 6 Тематических Пакетов по 5 Промокодов (Всего 30 Промокодов: 12 Gold + 18 Cases)
// У каждого промокода установлен лимит: 20 активаций!
export const PROMO_PACKS: PromoPack[] = [
  {
    id: 'pack_exclusive',
    title: '⭐ Эксклюзив (Лимит 2 активации)',
    description: 'Макс. кол-во Gold (50,000) и самый дорогой кейс (Billionaire Club)',
    codes: ['GOLD-MAX-2X', 'BILLIONAIRE-2X'],
  },
  {
    id: 'pack_1',
    title: 'Пакет 1: «Стартовый штурм»',
    description: '2 кода на Gold + 3 кода на базовые кейсы',
    codes: ['GOLD-START', 'VIA-BOOST', 'CASE-STUDENT', 'CASE-STARTER', 'CASE-BOOST69'],
  },
  {
    id: 'pack_2',
    title: 'Пакет 2: «Пистолетная дуэль»',
    description: '2 кода на Gold + 3 кода на пистолетные кейсы',
    codes: ['GOLD-PISTOL', 'LUCKY-SHOT', 'CASE-PISTOL', 'CASE-HIT99', 'CASE-PISTOL2'],
  },
  {
    id: 'pack_3',
    title: 'Пакет 3: «Армейский арсенал»',
    description: '2 кода на Gold + 3 кода на винтовки и снайперки',
    codes: ['GOLD-ARMY', 'FIRE-POWER', 'CASE-ARMY', 'CASE-SNIPER', 'CASE-COVERT'],
  },
  {
    id: 'pack_4',
    title: 'Пакет 4: «Неоновый азарт»',
    description: '2 кода на Gold + 3 кода на элитный транспорт и AWP',
    codes: ['GOLD-NEON', 'TURBO-WIN', 'CASE-NEON', 'CASE-AWP', 'CASE-RACE'],
  },
  {
    id: 'pack_5',
    title: 'Пакет 5: «Синдикат и Спецназ»',
    description: '2 кода на Gold + 3 кода на AK-47 и Standoff 2',
    codes: ['GOLD-ELITE', 'ROYAL-GOLD', 'CASE-AK47', 'CASE-HUNTER', 'CASE-STANDOFF'],
  },
  {
    id: 'pack_6',
    title: 'Пакет 6: «Легендарные клинки»',
    description: '2 кода на Gold + 3 кода на топовые ножевые кейсы',
    codes: ['GOLD-KNIFE', 'TITAN-850', 'CASE-KNIFE1', 'CASE-KARAMBIT', 'CASE-BUTTERFLY'],
  },
];

// Главные Промокоды
export const MAIN_PROMO_CODES: Record<string, PromoDefinition> = {
  // --- ЭКСКЛЮЗИВНЫЕ СУПЕР-ПРОМОКОДЫ (ЛИМИТ 2 АКТИВАЦИИ) ---
  'GOLD-MAX-2X': {
    type: 'gold',
    reward: 50000,
    label: 'Максимальный бонус 50 000 Gold',
    badge: '50K Gold',
    maxActivations: 2,
  },
  'BILLIONAIRE-2X': {
    type: 'case',
    caseId: 'billionaire_case',
    caseName: '💎 Apex Billionaire Club',
    label: 'Кейс «Apex Billionaire Club» (Самый дорогой)',
    badge: 'Кейс 350k AC',
    maxActivations: 2,
  },

  // --- ПАКЕТ 1 ---
  'GOLD-START': {
    type: 'gold',
    reward: 250,
    label: 'Стартовый бонус 250 Gold',
    badge: '250 G',
    maxActivations: 20,
  },
  'VIA-BOOST': {
    type: 'gold',
    reward: 450,
    label: 'Турбо-буст 450 Gold',
    badge: '450 G',
    maxActivations: 20,
  },
  'CASE-STUDENT': {
    type: 'case',
    caseId: 'student_drop',
    caseName: '🪙 Студенческий CS2',
    label: 'Бесплатный кейс «Студенческий CS2»',
    badge: 'Кейс 25 AC',
    maxActivations: 20,
  },
  'CASE-STARTER': {
    type: 'case',
    caseId: 'apex_starter',
    caseName: '⚡ GameVia Starter',
    label: 'Бесплатный кейс «GameVia Starter»',
    badge: 'Кейс 49 AC',
    maxActivations: 20,
  },
  'CASE-BOOST69': {
    type: 'case',
    caseId: 'starter_boost_69',
    caseName: '🚀 Стартовый Буст',
    label: 'Бесплатный кейс «Стартовый Буст»',
    badge: 'Кейс 69 AC',
    maxActivations: 20,
  },

  // --- ПАКЕТ 2 ---
  'GOLD-PISTOL': {
    type: 'gold',
    reward: 300,
    label: 'Пистолетный купон 300 Gold',
    badge: '300 G',
    maxActivations: 20,
  },
  'LUCKY-SHOT': {
    type: 'gold',
    reward: 500,
    label: 'Точный выстрел 500 Gold',
    badge: '500 G',
    maxActivations: 20,
  },
  'CASE-PISTOL': {
    type: 'case',
    caseId: 'pistol_rush',
    caseName: '🔫 Пистолетный Раш',
    label: 'Бесплатный кейс «Пистолетный Раш»',
    badge: 'Кейс 89 AC',
    maxActivations: 20,
  },
  'CASE-HIT99': {
    type: 'case',
    caseId: 'budget_hit_99',
    caseName: '🎯 Бюджетный Хит',
    label: 'Бесплатный кейс «Бюджетный Хит»',
    badge: 'Кейс 99 AC',
    maxActivations: 20,
  },
  'CASE-PISTOL2': {
    type: 'case',
    caseId: 'pistol_rush_v2_180',
    caseName: '⚡ Пистолетный Раш V2',
    label: 'Бесплатный кейс «Пистолетный Раш V2»',
    badge: 'Кейс 180 AC',
    maxActivations: 20,
  },

  // --- ПАКЕТ 3 ---
  'GOLD-ARMY': {
    type: 'gold',
    reward: 350,
    label: 'Армейское снабжение 350 Gold',
    badge: '350 G',
    maxActivations: 20,
  },
  'FIRE-POWER': {
    type: 'gold',
    reward: 600,
    label: 'Огневая мощь 600 Gold',
    badge: '600 G',
    maxActivations: 20,
  },
  'CASE-ARMY': {
    type: 'case',
    caseId: 'army_supply',
    caseName: '📦 Армейский Дроп',
    label: 'Бесплатный кейс «Армейский Дроп»',
    badge: 'Кейс 149 AC',
    maxActivations: 20,
  },
  'CASE-SNIPER': {
    type: 'case',
    caseId: 'sniper_assault_260',
    caseName: '🎯 Снайперский Штурм',
    label: 'Бесплатный кейс «Снайперский Штурм»',
    badge: 'Кейс 260 AC',
    maxActivations: 20,
  },
  'CASE-COVERT': {
    type: 'case',
    caseId: 'covert_350',
    caseName: '🔥 Тайное за 350',
    label: 'Бесплатный кейс «Тайное за 350»',
    badge: 'Кейс 350 AC',
    maxActivations: 20,
  },

  // --- ПАКЕТ 4 ---
  'GOLD-NEON': {
    type: 'gold',
    reward: 400,
    label: 'Неоновый буст 400 Gold',
    badge: '400 G',
    maxActivations: 20,
  },
  'TURBO-WIN': {
    type: 'gold',
    reward: 700,
    label: 'Турбо-победа 700 Gold',
    badge: '700 G',
    maxActivations: 20,
  },
  'CASE-NEON': {
    type: 'case',
    caseId: 'neon_drive_480',
    caseName: '🏎️ Неоновый Драйв',
    label: 'Бесплатный кейс «Неоновый Драйв»',
    badge: 'Кейс 480 AC',
    maxActivations: 20,
  },
  'CASE-AWP': {
    type: 'case',
    caseId: 'awp_express',
    caseName: '🎯 AWP Экспресс',
    label: 'Бесплатный кейс «AWP Экспресс»',
    badge: 'Кейс 590 AC',
    maxActivations: 20,
  },
  'CASE-RACE': {
    type: 'case',
    caseId: 'arms_race',
    caseName: '⚔️ Гонка Вооружений',
    label: 'Бесплатный кейс «Гонка Вооружений»',
    badge: 'Кейс 750 AC',
    maxActivations: 20,
  },

  // --- ПАКЕТ 5 ---
  'GOLD-ELITE': {
    type: 'gold',
    reward: 550,
    label: 'Элитный бонус 550 Gold',
    badge: '550 G',
    maxActivations: 20,
  },
  'ROYAL-GOLD': {
    type: 'gold',
    reward: 750,
    label: 'Королевский слиток 750 Gold',
    badge: '750 G',
    maxActivations: 20,
  },
  'CASE-AK47': {
    type: 'case',
    caseId: 'ak47_syndicate',
    caseName: '🏴 AK-47 Синдикат',
    label: 'Бесплатный кейс «AK-47 Синдикат»',
    badge: 'Кейс 890 AC',
    maxActivations: 20,
  },
  'CASE-HUNTER': {
    type: 'case',
    caseId: 'covert_hunter',
    caseName: '🎖️ Охотник за Тайным',
    label: 'Бесплатный кейс «Охотник за Тайным»',
    badge: 'Кейс 1 100 AC',
    maxActivations: 20,
  },
  'CASE-STANDOFF': {
    type: 'case',
    caseId: 'standoff_special',
    caseName: '📱 Standoff 2 Special',
    label: 'Бесплатный кейс «Standoff 2 Special»',
    badge: 'Standoff 2',
    maxActivations: 20,
  },

  // --- ПАКЕТ 6 ---
  'GOLD-KNIFE': {
    type: 'gold',
    reward: 650,
    label: 'Ножевой фонд 650 Gold',
    badge: '650 G',
    maxActivations: 20,
  },
  'TITAN-850': {
    type: 'gold',
    reward: 850,
    label: 'Титан-награда 850 Gold',
    badge: '850 G',
    maxActivations: 20,
  },
  'CASE-KNIFE1': {
    type: 'case',
    caseId: 'knife_entry',
    caseName: '🔪 Первый Нож',
    label: 'Бесплатный кейс «Первый Нож»',
    badge: 'Ножевой кейс',
    maxActivations: 20,
  },
  'CASE-KARAMBIT': {
    type: 'case',
    caseId: 'knife_karambit_elite',
    caseName: '🌀 Керамбит Элита',
    label: 'Бесплатный кейс «Керамбит Элита»',
    badge: 'Керамбиты',
    maxActivations: 20,
  },
  'CASE-BUTTERFLY': {
    type: 'case',
    caseId: 'knife_butterfly_crown',
    caseName: '👑 Корона Бабочек',
    label: 'Бесплатный кейс «Корона Бабочек»',
    badge: 'Бабочки',
    maxActivations: 20,
  },
};

// Все промокоды вместе (включая алиасы)
export const ALL_PROMO_CODES: Record<string, PromoDefinition> = {
  ...MAIN_PROMO_CODES,
};

export function findPromoCode(code: string): PromoDefinition | null {
  const normalized = code.trim().toUpperCase();
  return ALL_PROMO_CODES[normalized] || null;
}
