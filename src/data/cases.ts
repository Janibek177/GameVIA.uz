import { CaseDefinition, Skin } from '../types';
import { getSkinById } from './skins';
import { KNIFE_CASES } from './knife_cases';

const BASE_CASES: CaseDefinition[] = [
  // ==========================================
  // 1. БЕСПЛАТНЫЙ & БЮДЖЕТНЫЙ
  // ==========================================
  {
    id: 'free_daily',
    name: '🎁 Ежедневный Free Drop',
    category: 'special',
    price: 0,
    accentColor: '#10b981',
    image: 'gift',
    description: 'Бесплатный ежедневный кейс. Шанс выбить стартовый скин или тайный дроп!',
    items: [
      { skin: getSkinById('p250_sanddune'), weight: 350 },
      { skin: getSkinById('mp9_starlight'), weight: 230 },
      { skin: getSkinById('mag7_firecore'), weight: 160 },
      { skin: getSkinById('galil_cold'), weight: 95 },
      { skin: getSkinById('glock_warhawk'), weight: 65 },
      { skin: getSkinById('deagle_oxide'), weight: 45 },
      { skin: getSkinById('awp_atheris'), weight: 22 },
      { skin: getSkinById('usp_cortex'), weight: 12 },
      { skin: getSkinById('ak47_redline'), weight: 4.5 },
      { skin: getSkinById('knife_gut_rust'), weight: 0.8 },
    ],
  },
  {
    id: 'tg_subscribe_case',
    name: '📢 Бонус за подписку на Telegram',
    category: 'special',
    price: 0,
    accentColor: '#0ea5e9',
    image: 'sparkles',
    description: 'Ежедневный бонус за подписку на Telegram-канал t.me/GameV1A. Доступен 1 раз в 24 часа только для подписчиков!',
    items: [
      { skin: getSkinById('p250_sanddune'), weight: 300 },
      { skin: getSkinById('mp9_starlight'), weight: 220 },
      { skin: getSkinById('glock_warhawk'), weight: 180 },
      { skin: getSkinById('galil_cold'), weight: 120 },
      { skin: getSkinById('deagle_oxide'), weight: 80 },
      { skin: getSkinById('usp_cortex'), weight: 50 },
      { skin: getSkinById('awp_atheris'), weight: 30 },
      { skin: getSkinById('ak47_redline'), weight: 15 },
      { skin: getSkinById('ak47_bloodsport'), weight: 4 },
      { skin: getSkinById('knife_gut_rust'), weight: 0.9 },
      { skin: getSkinById('knife_flip_autotronic'), weight: 0.2 },
    ],
  },
  {
    id: 'student_drop',
    name: '🪙 Студенческий CS2',
    category: 'cheap',
    price: 25,
    accentColor: '#06b6d4',
    image: 'coin',
    description: 'Бюджетный кейс за 25 AC. Оружие строго не дороже 100 AC, а скины за 55-85 AC выпадают редко!',
    items: [
      { skin: getSkinById('p250_sanddune'), weight: 470 }, // 14 AC - базовый дроп
      { skin: getSkinById('mag7_firecore'), weight: 300 }, // 26 AC - частый дроп
      { skin: getSkinById('mp9_starlight'), weight: 180 }, // 35 AC
      { skin: getSkinById('glock_warhawk'), weight: 80 },  // 42 AC
      { skin: getSkinById('galil_cold'), weight: 42 },     // 48 AC
      { skin: getSkinById('sg553_aerial'), weight: 18 },   // 55 AC - редкий дроп
      { skin: getSkinById('usp_lead'), weight: 6 },        // 85 AC - джекпот
    ],
  },
  {
    id: 'apex_starter',
    name: '⚡ GameVia Starter',
    category: 'cheap',
    price: 49,
    accentColor: '#3b82f6',
    image: 'shield',
    description: 'Фирменный стартовый кейс с хорошим балансом отдачи и ножом в джекпоте.',
    items: [
      { skin: getSkinById('p250_sanddune'), weight: 300 },
      { skin: getSkinById('mag7_firecore'), weight: 260 },
      { skin: getSkinById('glock_warhawk'), weight: 200 },
      { skin: getSkinById('galil_cold'), weight: 130 },
      { skin: getSkinById('usp_lead'), weight: 65 },
      { skin: getSkinById('m4a4_evil'), weight: 32 },
      { skin: getSkinById('awp_atheris'), weight: 24 },
      { skin: getSkinById('ak47_phantom'), weight: 14 },
      { skin: getSkinById('ak47_redline'), weight: 5.5 },
      { skin: getSkinById('awp_neo_noir'), weight: 2.8 },
      { skin: getSkinById('knife_gut_rust'), weight: 0.8 },
      { skin: getSkinById('knife_flip_autotronic'), weight: 0.25 },
    ],
  },
  {
    id: 'starter_boost_69',
    name: '🚀 Стартовый Буст',
    category: 'cheap',
    price: 69,
    accentColor: '#06b6d4',
    image: 'shield',
    description: 'Доступный кейс за 69 AC. Отличный старт с Deagle Оксидное пламя и шансом на AWP Гадюка!',
    items: [
      { skin: getSkinById('p250_sanddune'), weight: 290 },
      { skin: getSkinById('mag7_firecore'), weight: 240 },
      { skin: getSkinById('glock_warhawk'), weight: 200 },
      { skin: getSkinById('galil_cold'), weight: 140 },
      { skin: getSkinById('usp_lead'), weight: 95 },
      { skin: getSkinById('deagle_oxide'), weight: 58 },
      { skin: getSkinById('awp_atheris'), weight: 38 },
      { skin: getSkinById('usp_cortex'), weight: 18 },
      { skin: getSkinById('ak47_redline'), weight: 4.5 },
    ],
  },
  {
    id: 'pistol_rush',
    name: '🔫 Пистолетный Раш',
    category: 'cheap',
    price: 89,
    accentColor: '#8b5cf6',
    image: 'crosshair',
    description: 'Коллекция пистолетов: от Glock и Deagle до Printstream и Kill Confirmed.',
    items: [
      { skin: getSkinById('p250_sanddune'), weight: 390 },
      { skin: getSkinById('glock_warhawk'), weight: 280 },
      { skin: getSkinById('usp_lead'), weight: 180 },
      { skin: getSkinById('deagle_oxide'), weight: 95 },
      { skin: getSkinById('usp_cortex'), weight: 40 },
      { skin: getSkinById('glock_water'), weight: 20 },
      { skin: getSkinById('usp_kill_confirmed'), weight: 4.5 },
      { skin: getSkinById('deagle_printstream'), weight: 3 },
      { skin: getSkinById('knife_gut_rust'), weight: 1.2 },
    ],
  },
  {
    id: 'budget_hit_99',
    name: '🎯 Бюджетный Хит',
    category: 'cheap',
    price: 99,
    accentColor: '#10b981',
    image: 'target',
    description: 'Популярный бюджетный кейс с высоким шансом окупиться и выбить AWP или Redline!',
    items: [
      { skin: getSkinById('mag7_firecore'), weight: 310 },
      { skin: getSkinById('mp9_starlight'), weight: 260 },
      { skin: getSkinById('galil_cold'), weight: 200 },
      { skin: getSkinById('usp_lead'), weight: 130 },
      { skin: getSkinById('deagle_oxide'), weight: 75 },
      { skin: getSkinById('awp_atheris'), weight: 40 },
      { skin: getSkinById('usp_cortex'), weight: 20 },
      { skin: getSkinById('glock_water'), weight: 9 },
      { skin: getSkinById('ak47_redline'), weight: 3.5 },
      { skin: getSkinById('knife_gut_rust'), weight: 0.3 },
    ],
  },
  {
    id: 'army_supply',
    name: '📦 Армейский Дроп',
    category: 'cheap',
    price: 149,
    accentColor: '#6366f1',
    image: 'box',
    description: 'Повышенный шанс на засекреченное вооружение и штурмовые винтовки.',
    items: [
      { skin: getSkinById('galil_cold'), weight: 340 },
      { skin: getSkinById('sg553_aerial'), weight: 280 },
      { skin: getSkinById('glock_warhawk'), weight: 220 },
      { skin: getSkinById('awp_atheris'), weight: 120 },
      { skin: getSkinById('ak47_phantom'), weight: 40 },
      { skin: getSkinById('m4a4_evil'), weight: 30 },
      { skin: getSkinById('usp_cortex'), weight: 18 },
      { skin: getSkinById('ak47_redline'), weight: 4 },
      { skin: getSkinById('awp_neo_noir'), weight: 2 },
      { skin: getSkinById('ak47_bloodsport'), weight: 0.6 },
      { skin: getSkinById('knife_flip_autotronic'), weight: 0.2 },
    ],
  },
  {
    id: 'pistol_rush_v2_180',
    name: '⚡ Пистолетный Раш V2',
    category: 'popular',
    price: 180,
    accentColor: '#ec4899',
    image: 'crosshair',
    description: 'Улучшенный пистолетный кейс! Высокие шансы на Deagle Oxide, Cortex, Водяной элементаль и Printstream.',
    items: [
      { skin: getSkinById('glock_warhawk'), weight: 360 },
      { skin: getSkinById('usp_lead'), weight: 320 },
      { skin: getSkinById('deagle_oxide'), weight: 190 },
      { skin: getSkinById('usp_cortex'), weight: 75 },
      { skin: getSkinById('glock_water'), weight: 35 },
      { skin: getSkinById('m4a4_evil'), weight: 18 },
      { skin: getSkinById('usp_kill_confirmed'), weight: 4.5 },
      { skin: getSkinById('deagle_printstream'), weight: 2 },
      { skin: getSkinById('knife_gut_rust'), weight: 0.6 },
    ],
  },
  {
    id: 'sniper_assault_260',
    name: '🎯 Снайперский Штурм',
    category: 'popular',
    price: 260,
    accentColor: '#3b82f6',
    image: 'crosshair',
    description: 'Элитные снайперские винтовки: AWP Atheris, SSG 08 Пламя дракона, Neo-Noir, Скоростной зверь и Азимов!',
    items: [
      { skin: getSkinById('sg553_aerial'), weight: 260 },
      { skin: getSkinById('usp_lead'), weight: 220 },
      { skin: getSkinById('deagle_oxide'), weight: 200 },
      { skin: getSkinById('awp_atheris'), weight: 180 },
      { skin: getSkinById('ssg_dragonfire'), weight: 48 },
      { skin: getSkinById('awp_neo_noir'), weight: 22 },
      { skin: getSkinById('awp_hyper_beast'), weight: 11 },
      { skin: getSkinById('awp_asiimov'), weight: 3.2 },
    ],
  },
  {
    id: 'covert_350',
    name: '🔥 Тайное за 350',
    category: 'popular',
    price: 350,
    accentColor: '#ef4444',
    image: 'flame',
    description: 'Высокий шанс на засекреченные и тайные скины CS2: AK-47 Redline, M4A4 Desolate Space и нож!',
    items: [
      { skin: getSkinById('usp_lead'), weight: 250 },
      { skin: getSkinById('deagle_oxide'), weight: 260 },
      { skin: getSkinById('awp_atheris'), weight: 220 },
      { skin: getSkinById('usp_cortex'), weight: 140 },
      { skin: getSkinById('glock_water'), weight: 75 },
      { skin: getSkinById('m4a4_desolate'), weight: 45 },
      { skin: getSkinById('ak47_redline'), weight: 30 },
      { skin: getSkinById('ak47_empress'), weight: 6 },
      { skin: getSkinById('knife_gut_rust'), weight: 2.5 },
      { skin: getSkinById('knife_flip_autotronic'), weight: 0.8 },
    ],
  },
  {
    id: 'neon_drive_480',
    name: '💎 Неоновый Драйв',
    category: 'premium',
    price: 480,
    accentColor: '#06b6d4',
    image: 'sparkles',
    description: 'Неоновые расцветки и элитный арсенал: Скоростной зверь, Повелитель пустошей, Император и Складной нож!',
    items: [
      { skin: getSkinById('deagle_oxide'), weight: 280 },
      { skin: getSkinById('awp_atheris'), weight: 250 },
      { skin: getSkinById('usp_cortex'), weight: 210 },
      { skin: getSkinById('glock_water'), weight: 110 },
      { skin: getSkinById('m4a4_desolate'), weight: 65 },
      { skin: getSkinById('ak47_redline'), weight: 45 },
      { skin: getSkinById('ssg_dragonfire'), weight: 25 },
      { skin: getSkinById('awp_hyper_beast'), weight: 12 },
      { skin: getSkinById('m4a4_emperor'), weight: 7 },
      { skin: getSkinById('ak47_bloodsport'), weight: 4 },
      { skin: getSkinById('knife_flip_autotronic'), weight: 1.5 },
    ],
  },

  // ==========================================
  // 2. ПОПУЛЯРНЫЕ CS2
  // ==========================================
  {
    id: 'awp_express',
    name: '🎯 AWP Лихорадка',
    category: 'popular',
    price: 299,
    accentColor: '#a855f7',
    image: 'crosshair',
    description: 'Легендарные снайперские винтовки: Atheris, Neo-Noir, Asiimov, Dragon Lore и Gungnir!',
    items: [
      { skin: getSkinById('galil_cold'), weight: 480 },
      { skin: getSkinById('awp_atheris'), weight: 320 },
      { skin: getSkinById('usp_cortex'), weight: 65 },
      { skin: getSkinById('awp_neo_noir'), weight: 12 },
      { skin: getSkinById('deagle_printstream'), weight: 3.5 },
      { skin: getSkinById('awp_asiimov'), weight: 2 },
      { skin: getSkinById('awp_lightning'), weight: 0.5 },
      { skin: getSkinById('knife_flip_autotronic'), weight: 0.25 },
      { skin: getSkinById('awp_dragon_lore'), weight: 0.04 },
      { skin: getSkinById('awp_gungnir'), weight: 0.02 },
    ],
  },
  {
    id: 'arms_race',
    name: '🏎️ Гонка Вооружений',
    category: 'popular',
    price: 450,
    accentColor: '#ec4899',
    image: 'flag',
    description: 'Разнообразный арсенал CS2: от доступных пистолетов до ножей и винтовок.',
    items: [
      { skin: getSkinById('glock_warhawk'), weight: 320 },
      { skin: getSkinById('sg553_aerial'), weight: 260 },
      { skin: getSkinById('deagle_oxide'), weight: 220 },
      { skin: getSkinById('m4a4_evil'), weight: 160 },
      { skin: getSkinById('usp_cortex'), weight: 40 },
      { skin: getSkinById('glock_water'), weight: 22 },
      { skin: getSkinById('ak47_redline'), weight: 10 },
      { skin: getSkinById('awp_neo_noir'), weight: 5 },
      { skin: getSkinById('m4a1s_hyper_beast'), weight: 3 },
      { skin: getSkinById('usp_kill_confirmed'), weight: 1.8 },
      { skin: getSkinById('ak47_bloodsport'), weight: 0.8 },
      { skin: getSkinById('knife_gut_rust'), weight: 0.4 },
      { skin: getSkinById('knife_flip_autotronic'), weight: 0.15 },
    ],
  },
  {
    id: 'ak47_syndicate',
    name: '⚡ AK-47 Syndicate',
    category: 'popular',
    price: 590,
    accentColor: '#f97316',
    image: 'zap',
    description: 'Все лучшие скины на автомат Калашникова: от базовых винтовок до Красной линии, Bloodsport и Лотоса!',
    items: [
      { skin: getSkinById('galil_cold'), weight: 350 },
      { skin: getSkinById('m4a4_evil'), weight: 300 },
      { skin: getSkinById('ak47_phantom'), weight: 220 },
      { skin: getSkinById('ak47_redline'), weight: 18 },
      { skin: getSkinById('ak47_empress'), weight: 5 },
      { skin: getSkinById('ak47_bloodsport'), weight: 2.5 },
      { skin: getSkinById('ak47_vulcan'), weight: 0.8 },
      { skin: getSkinById('knife_gut_rust'), weight: 0.8 },
      { skin: getSkinById('knife_flip_autotronic'), weight: 0.4 },
      { skin: getSkinById('knife_karambit_doppler'), weight: 0.1 },
      { skin: getSkinById('ak47_wild_lotus'), weight: 0.03 },
    ],
  },
  {
    id: 'covert_hunter',
    name: '🔥 Covert Охотник',
    category: 'popular',
    price: 890,
    accentColor: '#ef4444',
    image: 'target',
    description: 'Повышенный шанс на Тайное красное оружие и ножевой дроп с реальным риском!',
    items: [
      { skin: getSkinById('deagle_oxide'), weight: 280 },
      { skin: getSkinById('m4a4_evil'), weight: 260 },
      { skin: getSkinById('usp_cortex'), weight: 220 },
      { skin: getSkinById('ak47_phantom'), weight: 190 },
      { skin: getSkinById('glock_water'), weight: 150 },
      { skin: getSkinById('ak47_redline'), weight: 90 },
      { skin: getSkinById('awp_neo_noir'), weight: 55 },
      { skin: getSkinById('m4a1s_hyper_beast'), weight: 35 },
      { skin: getSkinById('usp_kill_confirmed'), weight: 20 },
      { skin: getSkinById('deagle_printstream'), weight: 14 },
      { skin: getSkinById('ak47_bloodsport'), weight: 8 },
      { skin: getSkinById('awp_asiimov'), weight: 5 },
      { skin: getSkinById('knife_flip_autotronic'), weight: 1.5 },
      { skin: getSkinById('knife_karambit_doppler'), weight: 0.6 },
    ],
  },

  // ==========================================
  // 3. ДОРОГИЕ НОЖЕВЫЕ КЕЙСЫ (ПО ЗАПРОСУ ПОЛЬЗОВАТЕЛЯ!)
  // ==========================================
  {
    id: 'knife_entry',
    name: '🔪 Доступный Нож (Budget Knife)',
    category: 'premium',
    price: 6900,
    accentColor: '#eab308',
    image: 'sword',
    description: 'Входной билет в мир ножей CS2: риск получить базовый дроп или выбить ценное лезвие!',
    items: [
      { skin: getSkinById('usp_cortex'), weight: 320 },
      { skin: getSkinById('ak47_phantom'), weight: 280 },
      { skin: getSkinById('ak47_redline'), weight: 240 },
      { skin: getSkinById('deagle_printstream'), weight: 180 },
      { skin: getSkinById('ak47_bloodsport'), weight: 90 },
      { skin: getSkinById('knife_gut_rust'), weight: 45 },
      { skin: getSkinById('knife_flip_autotronic'), weight: 18 },
      { skin: getSkinById('knife_stiletto_marble'), weight: 6 },
      { skin: getSkinById('knife_m9_lore'), weight: 1.5 },
      { skin: getSkinById('knife_karambit_doppler'), weight: 0.5 },
    ],
  },
  {
    id: 'knife_karambit_elite',
    name: '🌀 Только Керамбиты (Karambit Elite)',
    category: 'premium',
    price: 16900,
    accentColor: '#8b5cf6',
    image: 'disc',
    description: 'Элитный кейс с культовыми изогнутыми ножами-когтями и редкими градиентами!',
    items: [
      { skin: getSkinById('ak47_redline'), weight: 420 },
      { skin: getSkinById('ak47_bloodsport'), weight: 320 },
      { skin: getSkinById('knife_gut_rust'), weight: 170 },
      { skin: getSkinById('knife_flip_autotronic'), weight: 65 },
      { skin: getSkinById('knife_stiletto_marble'), weight: 25 },
      { skin: getSkinById('knife_m9_lore'), weight: 6 },
      { skin: getSkinById('knife_karambit_doppler'), weight: 2 },
      { skin: getSkinById('knife_karambit_bluegem'), weight: 0.1 },
    ],
  },
  {
    id: 'knife_gloves_vip',
    name: '🧤 Ножи & Перчатки VIP',
    category: 'premium',
    price: 24500,
    accentColor: '#f59e0b',
    image: 'gem',
    description: 'Идеальное комбо: легендарные перчатки спецназа и элитные лезвия.',
    items: [
      { skin: getSkinById('deagle_printstream'), weight: 420 },
      { skin: getSkinById('ak47_bloodsport'), weight: 310 },
      { skin: getSkinById('knife_gut_rust'), weight: 160 },
      { skin: getSkinById('knife_flip_autotronic'), weight: 65 },
      { skin: getSkinById('knife_stiletto_marble'), weight: 25 },
      { skin: getSkinById('knife_m9_lore'), weight: 10 },
      { skin: getSkinById('knife_karambit_doppler'), weight: 4 },
      { skin: getSkinById('gloves_vice'), weight: 0.8 },
      { skin: getSkinById('gloves_pandora'), weight: 0.2 },
    ],
  },
  {
    id: 'knife_skeleton_web',
    name: '🕸️ Скелетный Нож & Паутина',
    category: 'premium',
    price: 38000,
    accentColor: '#ef4444',
    image: 'flame',
    description: 'Хайроллер кейс с шансом на ★ Скелетный нож Crimson Web и Нож-бабочку!',
    items: [
      { skin: getSkinById('ak47_bloodsport'), weight: 430 },
      { skin: getSkinById('knife_gut_rust'), weight: 300 },
      { skin: getSkinById('knife_flip_autotronic'), weight: 170 },
      { skin: getSkinById('knife_stiletto_marble'), weight: 65 },
      { skin: getSkinById('knife_m9_lore'), weight: 18 },
      { skin: getSkinById('knife_karambit_doppler'), weight: 8 },
      { skin: getSkinById('knife_skeleton_fade'), weight: 2.5 },
      { skin: getSkinById('knife_skeleton_crimson'), weight: 0.8 },
    ],
  },
  {
    id: 'knife_butterfly_crown',
    name: '🦋 Королевская Бабочка & Допплер',
    category: 'premium',
    price: 58000,
    accentColor: '#ec4899',
    image: 'sparkle',
    description: 'Ультимативный ножевой кейс: Бабочки Fade, Lore, Керамбиты и Скелетные ножи.',
    items: [
      { skin: getSkinById('knife_gut_rust'), weight: 420 },
      { skin: getSkinById('knife_flip_autotronic'), weight: 310 },
      { skin: getSkinById('knife_stiletto_marble'), weight: 160 },
      { skin: getSkinById('knife_ursus_doppler'), weight: 65 },
      { skin: getSkinById('knife_m9_lore'), weight: 25 },
      { skin: getSkinById('knife_butterfly_fade'), weight: 7 },
      { skin: getSkinById('knife_butterfly_lore'), weight: 2.5 },
      { skin: getSkinById('knife_butterfly_emerald'), weight: 0.4 },
    ],
  },
  {
    id: 'god_tier_case',
    name: '⚡ Apex God-Tier: Гунгнир & Lore',
    category: 'premium',
    price: 95000,
    accentColor: '#06b6d4',
    image: 'crown',
    description: 'Самый дорогой кейс на платформе! Джекпоты: AWP Gungnir, Dragon Lore и Wild Lotus.',
    items: [
      { skin: getSkinById('knife_flip_autotronic'), weight: 440 },
      { skin: getSkinById('knife_stiletto_marble'), weight: 320 },
      { skin: getSkinById('knife_m9_lore'), weight: 140 },
      { skin: getSkinById('knife_karambit_doppler'), weight: 55 },
      { skin: getSkinById('gloves_vice'), weight: 16 },
      { skin: getSkinById('awp_dragon_lore'), weight: 6 },
      { skin: getSkinById('ak47_wild_lotus'), weight: 2.5 },
      { skin: getSkinById('awp_gungnir'), weight: 0.8 },
    ],
  },

  // ==========================================
  // 4. ТЕМАТИЧЕСКИЕ & ИГРОВЫЕ КЕЙСЫ
  // ==========================================
  {
    id: 'dragon_nest',
    name: '👑 Dragon Nest (Логово Дракона)',
    category: 'premium',
    price: 1850,
    accentColor: '#f59e0b',
    image: 'crown',
    description: 'Премиум кейс с высокими ставками на AWP Dragon Lore и топовые скины CS2.',
    items: [
      { skin: getSkinById('m4a4_evil'), weight: 360 },
      { skin: getSkinById('ak47_phantom'), weight: 320 },
      { skin: getSkinById('glock_water'), weight: 240 },
      { skin: getSkinById('ak47_redline'), weight: 180 },
      { skin: getSkinById('awp_neo_noir'), weight: 90 },
      { skin: getSkinById('m4a1s_hyper_beast'), weight: 40 },
      { skin: getSkinById('awp_asiimov'), weight: 15 },
      { skin: getSkinById('m4a4_howl_tribute'), weight: 4 },
      { skin: getSkinById('gloves_vice'), weight: 1.2 },
      { skin: getSkinById('awp_dragon_lore'), weight: 0.25 },
    ],
  },
  {
    id: 'howl_tribute_case',
    name: '🐺 Вой Охотника (Howl Tribute)',
    category: 'premium',
    price: 7900,
    accentColor: '#dc2626',
    image: 'flame',
    description: 'Огненный кейс с повышенным шансом на контрабандный M4A4 Howl и ножи.',
    items: [
      { skin: getSkinById('m4a4_evil'), weight: 320 },
      { skin: getSkinById('usp_cortex'), weight: 280 },
      { skin: getSkinById('ak47_redline'), weight: 240 },
      { skin: getSkinById('deagle_printstream'), weight: 180 },
      { skin: getSkinById('ak47_bloodsport'), weight: 90 },
      { skin: getSkinById('awp_asiimov'), weight: 40 },
      { skin: getSkinById('ak47_vulcan'), weight: 16 },
      { skin: getSkinById('knife_flip_autotronic'), weight: 6 },
      { skin: getSkinById('m4a4_howl_tribute'), weight: 3 },
      { skin: getSkinById('knife_karambit_doppler'), weight: 1 },
    ],
  },
  {
    id: 'standoff_special',
    name: '📱 Standoff 2 Box',
    category: 'standoff',
    price: 159,
    accentColor: '#f97316',
    image: 'flame',
    description: 'Фирменный кейс по мотивам популярного мобильного шутера Standoff 2.',
    items: [
      { skin: getSkinById('p250_sanddune'), weight: 420 },
      { skin: getSkinById('deagle_oxide'), weight: 300 },
      { skin: getSkinById('glock_warhawk'), weight: 170 },
      { skin: getSkinById('glock_water'), weight: 45 },
      { skin: getSkinById('deagle_printstream'), weight: 8 },
      { skin: getSkinById('ak47_bloodsport'), weight: 1.2 },
      { skin: getSkinById('knife_flip_autotronic'), weight: 0.15 },
    ],
  },

  // ==========================================
  // 5. НОВЫЕ ЭЛИТНЫЕ, НОЖЕВЫЕ И ТЕМАТИЧЕСКИЕ КЕЙСЫ
  // ==========================================
  {
    id: 'billionaire_case',
    name: '💎 Apex Billionaire Club',
    category: 'premium',
    price: 350000,
    accentColor: '#38bdf8',
    image: 'crown',
    description: 'Самый дорогой и престижный кейс в мире CS2! В джекпоте: Dragon Lore Royal Gold (3.5 млн AC), StatTrak #661 Scar (2.85 млн AC) и Керамбит Blue Gem #387.',
    items: [
      { skin: getSkinById('knife_stiletto_marble'), weight: 430 },
      { skin: getSkinById('knife_m9_lore'), weight: 310 },
      { skin: getSkinById('knife_butterfly_lore'), weight: 140 },
      { skin: getSkinById('knife_skeleton_crimson'), weight: 65 },
      { skin: getSkinById('ak47_wild_lotus'), weight: 25 },
      { skin: getSkinById('gloves_pandora'), weight: 15 },
      { skin: getSkinById('awp_gungnir'), weight: 7 },
      { skin: getSkinById('knife_butterfly_emerald'), weight: 2.5 },
      { skin: getSkinById('knife_karambit_bluegem'), weight: 0.8 },
      { skin: getSkinById('awp_dragon_lore_souvenir'), weight: 0.4 },
      { skin: getSkinById('ak47_case_hardened_st_661'), weight: 0.3 },
      { skin: getSkinById('awp_dragon_lore_gold_fn'), weight: 0.15 },
    ],
  },
  {
    id: 'blue_gem_case',
    name: '💙 Blue Gem Masters (#387 & #661)',
    category: 'premium',
    price: 175000,
    accentColor: '#0ea5e9',
    image: 'sparkles',
    description: 'Коллекция чистейшей закаленной синевы: Керамбит Blue Gem #387, StatTrak Scar #661 и Нож бродяги Fade.',
    items: [
      { skin: getSkinById('knife_flip_autotronic'), weight: 430 },
      { skin: getSkinById('knife_stiletto_marble'), weight: 310 },
      { skin: getSkinById('knife_nomad_fade'), weight: 150 },
      { skin: getSkinById('knife_stiletto_crimson'), weight: 60 },
      { skin: getSkinById('m4a1s_welcome_jungle'), weight: 25 },
      { skin: getSkinById('ak47_gold_arabesque'), weight: 10 },
      { skin: getSkinById('ak47_case_hardened_blue'), weight: 2 },
      { skin: getSkinById('knife_karambit_bluegem'), weight: 0.6 },
      { skin: getSkinById('ak47_case_hardened_st_661'), weight: 0.35 },
    ],
  },
  {
    id: 'emerald_sapphire_case',
    name: '✨ Изумруды & Сапфиры (Gem Doppler)',
    category: 'premium',
    price: 120000,
    accentColor: '#10b981',
    image: 'sparkles',
    description: 'Редчайшие драгоценные фазы: Нож-бабочка Emerald, Коготь Sapphire и Керамбит Doppler.',
    items: [
      { skin: getSkinById('knife_flip_autotronic'), weight: 440 },
      { skin: getSkinById('knife_stiletto_marble'), weight: 310 },
      { skin: getSkinById('knife_huntsman_fade'), weight: 140 },
      { skin: getSkinById('knife_ursus_doppler'), weight: 65 },
      { skin: getSkinById('knife_karambit_doppler'), weight: 25 },
      { skin: getSkinById('knife_talon_sapphire'), weight: 5 },
      { skin: getSkinById('knife_m9_crimson_fn'), weight: 1.5 },
      { skin: getSkinById('knife_butterfly_emerald'), weight: 0.7 },
    ],
  },
  {
    id: 'gloves_elite_case',
    name: '🧤 Королевские Перчатки (Gloves Master)',
    category: 'premium',
    price: 42000,
    accentColor: '#ec4899',
    image: 'shield',
    description: 'Исключительно топовые перчатки CS2: от King Snake и Spearmint до Vice и Pandora’s Box.',
    items: [
      { skin: getSkinById('deagle_printstream'), weight: 430 },
      { skin: getSkinById('ak47_bloodsport'), weight: 310 },
      { skin: getSkinById('ak47_vulcan'), weight: 160 },
      { skin: getSkinById('gloves_king_snake'), weight: 60 },
      { skin: getSkinById('gloves_spearmint'), weight: 22 },
      { skin: getSkinById('gloves_vice'), weight: 6 },
      { skin: getSkinById('gloves_pandora'), weight: 1.2 },
    ],
  },
  {
    id: 'arabesque_gold_case',
    name: '👑 Золотая Лихорадка (Gold Arabesque)',
    category: 'premium',
    price: 29000,
    accentColor: '#eab308',
    image: 'crown',
    description: 'Золотые шедевры востока: AK-47 Золотая арабеска, M4A1-S В джунгли и M9 Lore.',
    items: [
      { skin: getSkinById('ak47_redline'), weight: 410 },
      { skin: getSkinById('ak47_bloodsport'), weight: 320 },
      { skin: getSkinById('awp_asiimov'), weight: 170 },
      { skin: getSkinById('ak47_vulcan'), weight: 60 },
      { skin: getSkinById('knife_m9_lore'), weight: 15 },
      { skin: getSkinById('m4a1s_welcome_jungle'), weight: 4 },
      { skin: getSkinById('ak47_gold_arabesque'), weight: 1.5 },
      { skin: getSkinById('awp_desert_hydra'), weight: 0.3 },
    ],
  },
  {
    id: 'covert_sniper_case',
    name: '🎯 Снайперская Элита (AWP Masters)',
    category: 'popular',
    price: 14900,
    accentColor: '#06b6d4',
    image: 'crosshair',
    description: 'Культовые винтовки AWP: Desert Hydra, Dragon Lore, Gungnir, Asiimov и Wildfire.',
    items: [
      { skin: getSkinById('awp_atheris'), weight: 420 },
      { skin: getSkinById('awp_neo_noir'), weight: 330 },
      { skin: getSkinById('awp_wildfire'), weight: 150 },
      { skin: getSkinById('awp_asiimov'), weight: 60 },
      { skin: getSkinById('awp_lightning'), weight: 12 },
      { skin: getSkinById('awp_desert_hydra'), weight: 2 },
      { skin: getSkinById('awp_dragon_lore'), weight: 0.6 },
      { skin: getSkinById('awp_gungnir'), weight: 0.15 },
    ],
  },
  {
    id: 'covert_rifles_case',
    name: '🔥 Тяжелый Огонь (Covert Rifles)',
    category: 'popular',
    price: 4500,
    accentColor: '#ef4444',
    image: 'flame',
    description: 'Убойная мощь штурмовых винтовок: Howl, Wild Lotus, Vulcan, Bloodsport и Hyper Beast.',
    items: [
      { skin: getSkinById('m4a4_evil'), weight: 400 },
      { skin: getSkinById('ak47_phantom'), weight: 320 },
      { skin: getSkinById('ak47_redline'), weight: 170 },
      { skin: getSkinById('m4a1s_hyper_beast'), weight: 65 },
      { skin: getSkinById('ak47_bloodsport'), weight: 28 },
      { skin: getSkinById('ak47_vulcan'), weight: 7 },
      { skin: getSkinById('m4a4_howl_tribute'), weight: 1.8 },
      { skin: getSkinById('ak47_wild_lotus'), weight: 0.15 },
    ],
  },
  {
    id: 'knife_roulette_budget',
    name: '🔪 Доступные Ножи (Budget Blades)',
    category: 'cheap',
    price: 1390,
    accentColor: '#8b5cf6',
    image: 'box',
    description: 'Бюджетный ножевой кейс: шанс выбить лезвие от Gut Rust до Ursus Doppler!',
    items: [
      { skin: getSkinById('m4a4_evil'), weight: 440 },
      { skin: getSkinById('glock_water'), weight: 310 },
      { skin: getSkinById('ak47_phantom'), weight: 130 },
      { skin: getSkinById('ak47_redline'), weight: 55 },
      { skin: getSkinById('deagle_printstream'), weight: 25 },
      { skin: getSkinById('usp_kill_confirmed'), weight: 10 },
      { skin: getSkinById('knife_gut_rust'), weight: 5 },
      { skin: getSkinById('knife_flip_autotronic'), weight: 1.5 },
      { skin: getSkinById('knife_huntsman_fade'), weight: 0.6 },
      { skin: getSkinById('knife_ursus_doppler'), weight: 0.2 },
    ],
  },
  {
    id: 'night_stalker_case',
    name: '🌙 Ночной Охотник (Dark Ops)',
    category: 'cheap',
    price: 650,
    accentColor: '#6366f1',
    image: 'crosshair',
    description: 'Скрытная ночная спецоперация: темные и неоновые скины плюс шанс на ножевой дроп.',
    items: [
      { skin: getSkinById('glock_warhawk'), weight: 440 },
      { skin: getSkinById('m4a4_evil'), weight: 310 },
      { skin: getSkinById('usp_cortex'), weight: 140 },
      { skin: getSkinById('ak47_phantom'), weight: 55 },
      { skin: getSkinById('awp_neo_noir'), weight: 15 },
      { skin: getSkinById('deagle_printstream'), weight: 6 },
      { skin: getSkinById('knife_gut_rust'), weight: 1.2 },
      { skin: getSkinById('knife_flip_autotronic'), weight: 0.3 },
    ],
  },
];

// Combine all standard CS2 cases + 50 specialized knife cases
export const CASES: CaseDefinition[] = [...BASE_CASES, ...KNIFE_CASES];

export function getAdjustedCaseDropWeight(
  skinPrice: number,
  casePrice: number,
  baseWeight: number
): number {
  if (casePrice <= 0) return baseWeight;
  const ratio = skinPrice / casePrice;
  let mult = 1.0;

  // Balanced odds with boosted drop rate for normal, medium, and high-value skins:
  if (ratio <= 0.6) {
    mult = 0.95; // reduced excessive spam of bottom-tier junk
  } else if (ratio <= 1.1) {
    mult = 1.05; // breakeven drops are smoother
  } else if (ratio <= 2.5) {
    mult = 0.92; // boosted chance for normal profit drops (x1.5 - x2.5)
  } else if (ratio <= 5.0) {
    mult = 0.60; // noticeably higher chance for great drops (x2.5 - x5.0)
  } else if (ratio <= 12.0) {
    mult = 0.32; // solid boost for epic / classified drops
  } else if (ratio <= 30.0) {
    mult = 0.18; // higher chance for covert skins and knives
  } else {
    mult = 0.06; // doubled chance for ultra-rare jackpots
  }

  return Math.max(0.05, baseWeight * mult);
}

export function calculateCaseStats(caseDef: CaseDefinition) {
  const adjustedWeights = caseDef.items.map((it) => ({
    skin: it.skin,
    weight: getAdjustedCaseDropWeight(it.skin.price, caseDef.price, it.weight),
  }));

  const totalWeight = adjustedWeights.reduce((sum, it) => sum + it.weight, 0);
  let expectedValue = 0;

  for (const item of adjustedWeights) {
    const probability = item.weight / totalWeight;
    expectedValue += probability * item.skin.price;
  }

  const rtp = caseDef.price > 0 ? (expectedValue / caseDef.price) * 100 : 100;

  return {
    expectedValue: Math.round(expectedValue),
    rtp: Number(rtp.toFixed(1)),
    houseEdge: Number(Math.max(0, 100 - rtp).toFixed(1)),
  };
}

export function rollCaseItem(caseDef: CaseDefinition): Skin {
  const adjustedItems = caseDef.items.map((it) => ({
    skin: it.skin,
    weight: getAdjustedCaseDropWeight(it.skin.price, caseDef.price, it.weight),
  }));

  const totalWeight = adjustedItems.reduce((sum, it) => sum + it.weight, 0);
  let random = Math.random() * totalWeight;

  for (const item of adjustedItems) {
    if (random <= item.weight) {
      return item.skin;
    }
    random -= item.weight;
  }

  return adjustedItems[0].skin;
}
