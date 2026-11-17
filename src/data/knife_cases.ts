import { CaseDefinition } from '../types';
import { getSkinById } from './skins';

export const KNIFE_CASES: CaseDefinition[] = [
  // 1. Бюджетные ножевые кейсы (цена 3 800 AC - 7 500 AC)
  // Самый дешевый нож обязательно дешевле цены кейса!
  {
    id: 'knife_case_navaja_starter',
    name: '🗡️ Наваха: Стартовый Нож',
    category: 'knives',
    price: 3800,
    accentColor: '#3b82f6',
    image: 'sword',
    description: 'Входной ножевой кейс CS2. Минимальный дроп — Наваха Африканка (3 200 AC), джекпот — Наваха Зуб тигра (7 900 AC)!',
    items: [
      { skin: getSkinById('knife_navaja_safari'), weight: 520 },     // 3 200 AC (< 3800)
      { skin: getSkinById('knife_navaja_urban'), weight: 320 },      // 3 600 AC (< 3800)
      { skin: getSkinById('knife_navaja_damascus'), weight: 120 },   // 5 400 AC
      { skin: getSkinById('knife_gut_scorched'), weight: 35 },       // 5 800 AC
      { skin: getSkinById('knife_navaja_tiger'), weight: 5 },        // 7 900 AC
    ],
  },
  {
    id: 'knife_case_shadow_daggers',
    name: '🗡️ Дроп Тычковых ножей',
    category: 'knives',
    price: 4500,
    accentColor: '#06b6d4',
    image: 'sword',
    description: 'Коллекция тычковых ножей. Базовый дроп — Патина (4 100 AC), топ — Сапфир Волны (14 200 AC)!',
    items: [
      { skin: getSkinById('knife_shadow_rust'), weight: 540 },       // 4 100 AC (< 4500)
      { skin: getSkinById('knife_navaja_urban'), weight: 280 },      // 3 600 AC (< 4500)
      { skin: getSkinById('knife_shadow_crimson'), weight: 130 },    // 6 800 AC
      { skin: getSkinById('knife_gut_doppler'), weight: 42 },        // 8 500 AC
      { skin: getSkinById('knife_shadow_doppler'), weight: 8 },      // 14 200 AC
    ],
  },
  {
    id: 'knife_case_gut_master',
    name: '🗡️ Ножи-крюки: Gut Hunter',
    category: 'knives',
    price: 5200,
    accentColor: '#10b981',
    image: 'sword',
    description: 'Классический охотничий крюк. Стартовый дроп — Пиксельный камуфляж (4 500 AC), топ — Gut Doppler Phase 4 (8 500 AC).',
    items: [
      { skin: getSkinById('knife_gut_forest'), weight: 530 },        // 4 500 AC (< 5200)
      { skin: getSkinById('knife_navaja_urban'), weight: 260 },      // 3 600 AC (< 5200)
      { skin: getSkinById('knife_gut_scorched'), weight: 150 },      // 5 800 AC
      { skin: getSkinById('knife_gut_rust'), weight: 50 },          // 9 800 AC
      { skin: getSkinById('knife_gut_doppler'), weight: 10 },        // 8 500 AC
    ],
  },
  {
    id: 'knife_case_falchion_edge',
    name: '🗡️ Фальшион: Острое лезвие',
    category: 'knives',
    price: 5900,
    accentColor: '#8b5cf6',
    image: 'sword',
    description: 'Фальшионы с уникальной анимацией осмотра. Самый дешёвый — Boreal Forest (4 900 AC), топ — Фальшион Fade (12 500 AC)!',
    items: [
      { skin: getSkinById('knife_falchion_boreal'), weight: 520 },    // 4 900 AC (< 5900)
      { skin: getSkinById('knife_gut_forest'), weight: 270 },         // 4 500 AC (< 5900)
      { skin: getSkinById('knife_falchion_rust'), weight: 150 },      // 6 200 AC
      { skin: getSkinById('knife_bowie_scorched'), weight: 50 },      // 7 200 AC
      { skin: getSkinById('knife_falchion_fade'), weight: 10 },       // 12 500 AC
    ],
  },
  {
    id: 'knife_case_rust_patina',
    name: '🗡️ Коллекция Патина & Ржавчина',
    category: 'knives',
    price: 6400,
    accentColor: '#d97706',
    image: 'sword',
    description: 'Брутальные закаленные лезвия с ржавчиной. Минимальный дроп от 4 100 AC до легендарного Gut Rust (9 800 AC).',
    items: [
      { skin: getSkinById('knife_shadow_rust'), weight: 510 },       // 4 100 AC (< 6400)
      { skin: getSkinById('knife_falchion_rust'), weight: 320 },     // 6 200 AC (< 6400)
      { skin: getSkinById('knife_navaja_tiger'), weight: 110 },      // 7 900 AC
      { skin: getSkinById('knife_gut_rust'), weight: 55 },          // 9 800 AC
      { skin: getSkinById('knife_ursus_night'), weight: 5 },         // 15 500 AC
    ],
  },
  {
    id: 'knife_case_bowie_classic',
    name: '🗡️ Большой Нож Боуи',
    category: 'knives',
    price: 7900,
    accentColor: '#ef4444',
    image: 'sword',
    description: 'Массивный тесак Боуи. Минимальный скин — Обугленный (7 200 AC), главный трофей — Bowie Ruby (49 000 AC)!',
    items: [
      { skin: getSkinById('knife_bowie_scorched'), weight: 520 },    // 7 200 AC (< 7900)
      { skin: getSkinById('knife_falchion_rust'), weight: 320 },     // 6 200 AC (< 7900)
      { skin: getSkinById('knife_bowie_damascus'), weight: 110 },    // 10 500 AC
      { skin: getSkinById('knife_flip_lore'), weight: 42 },          // 17 500 AC
      { skin: getSkinById('knife_bowie_doppler'), weight: 8 },       // 49 000 AC
    ],
  },
  {
    id: 'knife_case_huntsman_wild',
    name: '🗡️ Охотничий Клинок (Huntsman)',
    category: 'knives',
    price: 9800,
    accentColor: '#14b8a6',
    image: 'sword',
    description: 'Тяжелый тактический охотничий нож. Младший дроп — Обугленный (9 200 AC), джекпот — Охотничий Fade (36 000 AC)!',
    items: [
      { skin: getSkinById('knife_huntsman_scorched'), weight: 510 }, // 9 200 AC (< 9800)
      { skin: getSkinById('knife_bowie_scorched'), weight: 290 },    // 7 200 AC (< 9800)
      { skin: getSkinById('knife_bowie_damascus'), weight: 130 },    // 10 500 AC
      { skin: getSkinById('knife_falchion_fade'), weight: 60 },      // 12 500 AC
      { skin: getSkinById('knife_huntsman_fade'), weight: 10 },      // 36 000 AC
    ],
  },
  {
    id: 'knife_case_damascus_steel',
    name: '🗡️ Дамасская Сталь: Узоры',
    category: 'knives',
    price: 11200,
    accentColor: '#94a3b8',
    image: 'sword',
    description: 'Узорчатая слоёная дамасская сталь. Дешёвый дроп — Наваха Дамаск (5 400 AC), топ — Боуи Дамаск (10 500 AC) и Классик Fade!',
    items: [
      { skin: getSkinById('knife_navaja_damascus'), weight: 480 },   // 5 400 AC (< 11200)
      { skin: getSkinById('knife_bowie_scorched'), weight: 290 },    // 7 200 AC (< 11200)
      { skin: getSkinById('knife_bowie_damascus'), weight: 160 },    // 10 500 AC (< 11200)
      { skin: getSkinById('knife_falchion_fade'), weight: 55 },      // 12 500 AC
      { skin: getSkinById('knife_classic_fade'), weight: 15 },       // 21 000 AC
    ],
  },
  {
    id: 'knife_case_shadow_sapphire_rush',
    name: '🗡️ Тычки: Погоня за Сапфиром',
    category: 'knives',
    price: 13500,
    accentColor: '#38bdf8',
    image: 'sword',
    description: 'Охота за редчайшим Сапфиром на тычковые ножи (14 200 AC). Базовый дроп от 4 100 AC!',
    items: [
      { skin: getSkinById('knife_shadow_rust'), weight: 490 },       // 4 100 AC (< 13500)
      { skin: getSkinById('knife_shadow_crimson'), weight: 320 },    // 6 800 AC (< 13500)
      { skin: getSkinById('knife_falchion_fade'), weight: 120 },     // 12 500 AC (< 13500)
      { skin: getSkinById('knife_shadow_doppler'), weight: 60 },     // 14 200 AC
      { skin: getSkinById('knife_paracord_fade'), weight: 10 },      // 23 500 AC
    ],
  },
  {
    id: 'knife_case_ursus_strike',
    name: '🗡️ Нож Медведь: Ursus Ops',
    category: 'knives',
    price: 16800,
    accentColor: '#f97316',
    image: 'sword',
    description: 'Угловатый боевой нож Ursus. Базовый скин — Night Stripe (15 500 AC), топ — Ursus Doppler Phase 2 (45 000 AC)!',
    items: [
      { skin: getSkinById('knife_ursus_night'), weight: 520 },       // 15 500 AC (< 16800)
      { skin: getSkinById('knife_bowie_damascus'), weight: 280 },    // 10 500 AC (< 16800)
      { skin: getSkinById('knife_classic_fade'), weight: 130 },      // 21 000 AC
      { skin: getSkinById('knife_survival_fade'), weight: 55 },      // 27 000 AC
      { skin: getSkinById('knife_ursus_doppler'), weight: 15 },      // 45 000 AC
    ],
  },

  // 2. Средний диапазон (цена 18 000 AC - 35 000 AC)
  {
    id: 'knife_case_flip_legends',
    name: '🗡️ Складной Нож: Lore & Auto',
    category: 'knives',
    price: 19500,
    accentColor: '#eab308',
    image: 'sword',
    description: 'Элегантные складные ножи. Младший исход — Складной Lore (17 500 AC), главный приз — Складной Автотроника (25 500 AC)!',
    items: [
      { skin: getSkinById('knife_flip_lore'), weight: 520 },         // 17 500 AC (< 19500)
      { skin: getSkinById('knife_falchion_fade'), weight: 280 },     // 12 500 AC (< 19500)
      { skin: getSkinById('knife_classic_fade'), weight: 120 },      // 21 000 AC
      { skin: getSkinById('knife_paracord_fade'), weight: 65 },      // 23 500 AC
      { skin: getSkinById('knife_flip_autotronic'), weight: 15 },    // 25 500 AC
    ],
  },
  {
    id: 'knife_case_classic_nostalgia',
    name: '🗡️ Ностальгия 1.6: Classic Knife',
    category: 'knives',
    price: 22800,
    accentColor: '#a855f7',
    image: 'sword',
    description: 'Оригинальный классический нож из CS 1.6. Самый дешевый скин — Фальшион Fade (12 500 AC), топ — Classic Fade (21 000 AC)!',
    items: [
      { skin: getSkinById('knife_falchion_fade'), weight: 480 },     // 12 500 AC (< 22800)
      { skin: getSkinById('knife_flip_lore'), weight: 310 },         // 17 500 AC (< 22800)
      { skin: getSkinById('knife_classic_fade'), weight: 140 },      // 21 000 AC (< 22800)
      { skin: getSkinById('knife_paracord_fade'), weight: 55 },      // 23 500 AC
      { skin: getSkinById('knife_survival_fade'), weight: 15 },      // 27 000 AC
    ],
  },
  {
    id: 'knife_case_paracord_tangle',
    name: '🗡️ Паракорд: Выживание в тайге',
    category: 'knives',
    price: 25500,
    accentColor: '#10b981',
    image: 'sword',
    description: 'Рукоять с паракордовым шнуром. Базовый дроп от 17 500 AC, супер-дроп — Нож выживания Fade (27 000 AC)!',
    items: [
      { skin: getSkinById('knife_flip_lore'), weight: 510 },         // 17 500 AC (< 25500)
      { skin: getSkinById('knife_classic_fade'), weight: 280 },      // 21 000 AC (< 25500)
      { skin: getSkinById('knife_paracord_fade'), weight: 135 },     // 23 500 AC (< 25500)
      { skin: getSkinById('knife_flip_autotronic'), weight: 60 },    // 25 500 AC
      { skin: getSkinById('knife_survival_fade'), weight: 15 },      // 27 000 AC
    ],
  },
  {
    id: 'knife_case_survival_edge',
    name: '🗡️ Нож Выживания: Экстрим',
    category: 'knives',
    price: 28900,
    accentColor: '#f59e0b',
    image: 'sword',
    description: 'Нож для суровых условий. Самый дешевый — Classic Fade (21 000 AC), главный дроп — Коготь Зуб тигра (32 000 AC)!',
    items: [
      { skin: getSkinById('knife_classic_fade'), weight: 500 },      // 21 000 AC (< 28900)
      { skin: getSkinById('knife_paracord_fade'), weight: 300 },     // 23 500 AC (< 28900)
      { skin: getSkinById('knife_survival_fade'), weight: 130 },     // 27 000 AC (< 28900)
      { skin: getSkinById('knife_talon_tiger'), weight: 55 },        // 32 000 AC
      { skin: getSkinById('knife_stiletto_marble'), weight: 15 },    // 35 000 AC
    ],
  },
  {
    id: 'knife_case_stiletto_mafia',
    name: '🗡️ Итальянский Стилет: Мафия',
    category: 'knives',
    price: 36500,
    accentColor: '#dc2626',
    image: 'sword',
    description: 'Мгновенный выкидной стилет. Стартовый дроп — Падение на Автотронику (25 500 AC), топ — Стилет Мраморный (35 000 AC) и Зуб тигра (38 000 AC)!',
    items: [
      { skin: getSkinById('knife_flip_autotronic'), weight: 490 },   // 25 500 AC (< 36500)
      { skin: getSkinById('knife_survival_fade'), weight: 310 },     // 27 000 AC (< 36500)
      { skin: getSkinById('knife_talon_tiger'), weight: 120 },       // 32 000 AC (< 36500)
      { skin: getSkinById('knife_stiletto_marble'), weight: 60 },    // 35 000 AC (< 36500)
      { skin: getSkinById('knife_stiletto_tiger'), weight: 20 },     // 38 000 AC
    ],
  },
  {
    id: 'knife_case_talon_predator',
    name: '🗡️ Нож Коготь: Хищник (Talon)',
    category: 'knives',
    price: 39900,
    accentColor: '#6366f1',
    image: 'sword',
    description: 'Изогнутый коготь хищной птицы. Самый дешевый нож — 27 000 AC, джекпот — Коготь Градиент (110 000 AC)!',
    items: [
      { skin: getSkinById('knife_survival_fade'), weight: 500 },     // 27 000 AC (< 39900)
      { skin: getSkinById('knife_talon_tiger'), weight: 320 },       // 32 000 AC (< 39900)
      { skin: getSkinById('knife_stiletto_tiger'), weight: 120 },    // 38 000 AC (< 39900)
      { skin: getSkinById('knife_ursus_doppler'), weight: 45 },      // 45 000 AC
      { skin: getSkinById('knife_talon_fade'), weight: 15 },         // 110 000 AC
    ],
  },
  {
    id: 'knife_case_tiger_fang',
    name: '🗡️ Коллекция «Зуб тигра» (Tiger Tooth)',
    category: 'knives',
    price: 43500,
    accentColor: '#f59e0b',
    image: 'sword',
    description: 'Ярко-золотые полосатые лезвия. Базовый дроп от 32 000 AC, топовый дроп — Керамбит Зуб тигра (68 000 AC) и Бабочка (89 000 AC)!',
    items: [
      { skin: getSkinById('knife_talon_tiger'), weight: 510 },       // 32 000 AC (< 43500)
      { skin: getSkinById('knife_stiletto_tiger'), weight: 310 },    // 38 000 AC (< 43500)
      { skin: getSkinById('knife_karambit_tiger'), weight: 120 },    // 68 000 AC
      { skin: getSkinById('knife_m9_doppler'), weight: 45 },         // 74 000 AC
      { skin: getSkinById('knife_butterfly_tiger'), weight: 15 },    // 89 000 AC
    ],
  },
  {
    id: 'knife_case_bowie_ruby_vault',
    name: '🗡️ Рубиновый Сейф Боуи',
    category: 'knives',
    price: 52000,
    accentColor: '#e11d48',
    image: 'sword',
    description: 'Охота на алый рубин Bowie Ruby (49 000 AC). Самый дешевый скин в кейсе — Стилет Зуб тигра (38 000 AC)!',
    items: [
      { skin: getSkinById('knife_stiletto_tiger'), weight: 520 },    // 38 000 AC (< 52000)
      { skin: getSkinById('knife_ursus_doppler'), weight: 310 },     // 45 000 AC (< 52000)
      { skin: getSkinById('knife_bowie_doppler'), weight: 110 },     // 49 000 AC (< 52000)
      { skin: getSkinById('knife_karambit_tiger'), weight: 45 },     // 68 000 AC
      { skin: getSkinById('knife_m9_lore'), weight: 15 },            // 92 000 AC
    ],
  },
  {
    id: 'knife_case_karambit_tiger_rush',
    name: '🗡️ Керамбит: Золотой Коготь',
    category: 'knives',
    price: 72000,
    accentColor: '#eab308',
    image: 'sword',
    description: 'Премиум керамбиты. Самый дешевый нож — 45 000 AC (Ursus Doppler), главный приз — Керамбит Допплер (118 000 AC)!',
    items: [
      { skin: getSkinById('knife_ursus_doppler'), weight: 510 },     // 45 000 AC (< 72000)
      { skin: getSkinById('knife_bowie_doppler'), weight: 290 },     // 49 000 AC (< 72000)
      { skin: getSkinById('knife_karambit_tiger'), weight: 130 },    // 68 000 AC (< 72000)
      { skin: getSkinById('knife_m9_doppler'), weight: 55 },         // 74 000 AC
      { skin: getSkinById('knife_karambit_doppler'), weight: 15 },   // 118 000 AC
    ],
  },
  {
    id: 'knife_case_m9_bayonet_doppler',
    name: '🗡️ M9 Байонет: Волны Phase 2',
    category: 'knives',
    price: 79000,
    accentColor: '#a855f7',
    image: 'sword',
    description: 'Массивный штык-нож с пилой. Базовый дроп — 49 000 AC, супер-дроп — M9 Байонет Lore (92 000 AC)!',
    items: [
      { skin: getSkinById('knife_bowie_doppler'), weight: 500 },     // 49 000 AC (< 79000)
      { skin: getSkinById('knife_karambit_tiger'), weight: 310 },    // 68 000 AC (< 79000)
      { skin: getSkinById('knife_m9_doppler'), weight: 130 },        // 74 000 AC (< 79000)
      { skin: getSkinById('knife_butterfly_tiger'), weight: 45 },    // 89 000 AC
      { skin: getSkinById('knife_m9_lore'), weight: 15 },            // 92 000 AC
    ],
  },

  // 3. Высокий премиум (цена 95 000 AC - 220 000 AC)
  {
    id: 'knife_case_butterfly_tiger_fang',
    name: '🗡️ Бабочка: Зуб тигра & Фаде',
    category: 'knives',
    price: 95000,
    accentColor: '#f59e0b',
    image: 'sword',
    description: 'Культовый нож-бабочка. Дешевый исход — 68 000 AC, главный джекпот — Бабочка Fade (188 000 AC)!',
    items: [
      { skin: getSkinById('knife_karambit_tiger'), weight: 510 },    // 68 000 AC (< 95000)
      { skin: getSkinById('knife_m9_doppler'), weight: 300 },        // 74 000 AC (< 95000)
      { skin: getSkinById('knife_butterfly_tiger'), weight: 125 },   // 89 000 AC (< 95000)
      { skin: getSkinById('knife_talon_fade'), weight: 50 },         // 110 000 AC
      { skin: getSkinById('knife_butterfly_fade'), weight: 15 },     // 188 000 AC
    ],
  },
  {
    id: 'knife_case_m9_lore_shrine',
    name: '🗡️ Святилище M9 Lore',
    category: 'knives',
    price: 99000,
    accentColor: '#eab308',
    image: 'sword',
    description: 'Золотой M9 Байонет Легенды. Дешевый исход — 74 000 AC, топ — Керамбит Допплер (118 000 AC)!',
    items: [
      { skin: getSkinById('knife_m9_doppler'), weight: 500 },        // 74 000 AC (< 99000)
      { skin: getSkinById('knife_butterfly_tiger'), weight: 310 },   // 89 000 AC (< 99000)
      { skin: getSkinById('knife_m9_lore'), weight: 130 },           // 92 000 AC (< 99000)
      { skin: getSkinById('knife_talon_fade'), weight: 45 },         // 110 000 AC
      { skin: getSkinById('knife_karambit_doppler'), weight: 15 },   // 118 000 AC
    ],
  },
  {
    id: 'knife_case_talon_fade_crown',
    name: '🗡️ Коготь Градиент: 100% Fade',
    category: 'knives',
    price: 119000,
    accentColor: '#ec4899',
    image: 'sword',
    description: 'Радужные переливы на изогнутом когте. Дешевый исход — 89 000 AC, супер-приз — Нож бродяги Fade (135 000 AC)!',
    items: [
      { skin: getSkinById('knife_butterfly_tiger'), weight: 490 },   // 89 000 AC (< 119000)
      { skin: getSkinById('knife_m9_lore'), weight: 310 },           // 92 000 AC (< 119000)
      { skin: getSkinById('knife_talon_fade'), weight: 135 },        // 110 000 AC (< 119000)
      { skin: getSkinById('knife_karambit_doppler'), weight: 50 },   // 118 000 AC (< 119000)
      { skin: getSkinById('knife_nomad_fade'), weight: 15 },         // 135 000 AC
    ],
  },
  {
    id: 'knife_case_karambit_doppler_p2',
    name: '🗡️ Керамбит Волны Phase 2',
    category: 'knives',
    price: 129000,
    accentColor: '#8b5cf6',
    image: 'sword',
    description: 'Культовый Керамбит Doppler. Минимальный скин — M9 Lore (92 000 AC), топ — Стилет Crimson Web (160 000 AC)!',
    items: [
      { skin: getSkinById('knife_m9_lore'), weight: 510 },           // 92 000 AC (< 129000)
      { skin: getSkinById('knife_talon_fade'), weight: 300 },        // 110 000 AC (< 129000)
      { skin: getSkinById('knife_karambit_doppler'), weight: 125 },  // 118 000 AC (< 129000)
      { skin: getSkinById('knife_nomad_fade'), weight: 50 },         // 135 000 AC
      { skin: getSkinById('knife_stiletto_crimson'), weight: 15 },   // 160 000 AC
    ],
  },
  {
    id: 'knife_case_nomad_fade_hunter',
    name: '🗡️ Нож Бродяги: Nomad Fade',
    category: 'knives',
    price: 145000,
    accentColor: '#f97316',
    image: 'sword',
    description: 'Тактический нож Nomad. Самый дешевый скин — 110 000 AC, главный выигрыш — Бабочка Fade (188 000 AC)!',
    items: [
      { skin: getSkinById('knife_talon_fade'), weight: 500 },        // 110 000 AC (< 145000)
      { skin: getSkinById('knife_karambit_doppler'), weight: 310 },  // 118 000 AC (< 145000)
      { skin: getSkinById('knife_nomad_fade'), weight: 130 },        // 135 000 AC (< 145000)
      { skin: getSkinById('knife_stiletto_crimson'), weight: 45 },   // 160 000 AC
      { skin: getSkinById('knife_butterfly_fade'), weight: 15 },     // 188 000 AC
    ],
  },
  {
    id: 'knife_case_stiletto_crimson_web',
    name: '🗡️ Стилет: Кровавая паутина FN',
    category: 'knives',
    price: 172000,
    accentColor: '#dc2626',
    image: 'sword',
    description: 'Алая паутина на итальянском стилете. Самый дешёвый — 118 000 AC, главный джекпот — Скелетный нож Fade (195 000 AC)!',
    items: [
      { skin: getSkinById('knife_karambit_doppler'), weight: 500 },  // 118 000 AC (< 172000)
      { skin: getSkinById('knife_nomad_fade'), weight: 300 },        // 135 000 AC (< 172000)
      { skin: getSkinById('knife_stiletto_crimson'), weight: 135 },  // 160 000 AC (< 172000)
      { skin: getSkinById('knife_butterfly_fade'), weight: 50 },     // 188 000 AC
      { skin: getSkinById('knife_skeleton_fade'), weight: 15 },      // 195 000 AC
    ],
  },
  {
    id: 'knife_case_butterfly_fade_grail',
    name: '🗡️ Нож-бабочка Градиент (Fade)',
    category: 'knives',
    price: 199000,
    accentColor: '#ec4899',
    image: 'sword',
    description: 'Главная мечта каждого игрока CS2. Самый дешёвый исход — 135 000 AC, главный дроп — Бабочка Lore (215 000 AC)!',
    items: [
      { skin: getSkinById('knife_nomad_fade'), weight: 500 },        // 135 000 AC (< 199000)
      { skin: getSkinById('knife_stiletto_crimson'), weight: 310 },  // 160 000 AC (< 199000)
      { skin: getSkinById('knife_butterfly_fade'), weight: 125 },    // 188 000 AC (< 199000)
      { skin: getSkinById('knife_skeleton_fade'), weight: 50 },      // 195 000 AC (< 199000)
      { skin: getSkinById('knife_butterfly_lore'), weight: 15 },     // 215 000 AC
    ],
  },
  {
    id: 'knife_case_skeleton_fade_royale',
    name: '🗡️ Скелетный Нож Градиент',
    category: 'knives',
    price: 210000,
    accentColor: '#f59e0b',
    image: 'sword',
    description: 'Скелетный нож с градиентным лезвием. Базовый дроп от 160 000 AC, топ — Скелетный Crimson (245 000 AC)!',
    items: [
      { skin: getSkinById('knife_stiletto_crimson'), weight: 500 },  // 160 000 AC (< 210000)
      { skin: getSkinById('knife_butterfly_fade'), weight: 300 },    // 188 000 AC (< 210000)
      { skin: getSkinById('knife_skeleton_fade'), weight: 130 },     // 195 000 AC (< 210000)
      { skin: getSkinById('knife_butterfly_lore'), weight: 55 },     // 215 000 AC
      { skin: getSkinById('knife_skeleton_crimson'), weight: 15 },   // 245 000 AC
    ],
  },
  {
    id: 'knife_case_butterfly_lore_elite',
    name: '🗡️ Нож-бабочка: Золотые Легенды',
    category: 'knives',
    price: 230000,
    accentColor: '#eab308',
    image: 'sword',
    description: 'Золотая вязь на рукояти бабочки. Самый дешевый скин — 188 000 AC, джекпот — Коготь Сапфир (460 000 AC)!',
    items: [
      { skin: getSkinById('knife_butterfly_fade'), weight: 510 },    // 188 000 AC (< 230000)
      { skin: getSkinById('knife_skeleton_fade'), weight: 300 },     // 195 000 AC (< 230000)
      { skin: getSkinById('knife_butterfly_lore'), weight: 125 },    // 215 000 AC (< 230000)
      { skin: getSkinById('knife_skeleton_crimson'), weight: 50 },   // 245 000 AC
      { skin: getSkinById('knife_talon_sapphire'), weight: 15 },     // 460 000 AC
    ],
  },
  {
    id: 'knife_case_skeleton_crimson_vault',
    name: '🗡️ Скелетный Нож: Кровавая паутина',
    category: 'knives',
    price: 260000,
    accentColor: '#dc2626',
    image: 'sword',
    description: 'Один из самых редких скинов в CS2. Базовый скин — 195 000 AC, джекпот — M9 Gamma Emerald (520 000 AC)!',
    items: [
      { skin: getSkinById('knife_skeleton_fade'), weight: 500 },     // 195 000 AC (< 260000)
      { skin: getSkinById('knife_butterfly_lore'), weight: 310 },    // 215 000 AC (< 260000)
      { skin: getSkinById('knife_skeleton_crimson'), weight: 125 },  // 245 000 AC (< 260000)
      { skin: getSkinById('knife_talon_sapphire'), weight: 50 },     // 460 000 AC
      { skin: getSkinById('knife_m9_gamma'), weight: 15 },           // 520 000 AC
    ],
  },

  // 4. Ультра-элитные самоцветы (цена 480 000 AC - 1 350 000 AC)
  {
    id: 'knife_case_talon_sapphire_temple',
    name: '🗡️ Храм Сапфира: Talon Sapphire',
    category: 'knives',
    price: 490000,
    accentColor: '#0ea5e9',
    image: 'sword',
    description: 'Сапфировый коготь. Самый дешевый скин — 245 000 AC, джекпот — Керамбит Рубин (680 000 AC)!',
    items: [
      { skin: getSkinById('knife_skeleton_crimson'), weight: 500 },  // 245 000 AC (< 490000)
      { skin: getSkinById('knife_talon_sapphire'), weight: 310 },    // 460 000 AC (< 490000)
      { skin: getSkinById('knife_m9_gamma'), weight: 125 },          // 520 000 AC
      { skin: getSkinById('knife_karambit_ruby'), weight: 50 },      // 680 000 AC
      { skin: getSkinById('knife_butterfly_emerald'), weight: 15 },  // 880 000 AC
    ],
  },
  {
    id: 'knife_case_m9_emerald_domain',
    name: '🗡️ Изумрудный M9: Gamma Emerald',
    category: 'knives',
    price: 550000,
    accentColor: '#10b981',
    image: 'sword',
    description: 'Чистейший изумруд на штык-ноже M9. Младший исход — 460 000 AC, супер-дроп — Бабочка Изумруд (880 000 AC)!',
    items: [
      { skin: getSkinById('knife_talon_sapphire'), weight: 510 },    // 460 000 AC (< 550000)
      { skin: getSkinById('knife_m9_gamma'), weight: 310 },          // 520 000 AC (< 550000)
      { skin: getSkinById('knife_karambit_ruby'), weight: 110 },     // 680 000 AC
      { skin: getSkinById('knife_m9_crimson_fn'), weight: 55 },      // 750 000 AC
      { skin: getSkinById('knife_butterfly_emerald'), weight: 15 },  // 880 000 AC
    ],
  },
  {
    id: 'knife_case_karambit_ruby_flame',
    name: '🗡️ Керамбит Рубин: Алое Пламя',
    category: 'knives',
    price: 720000,
    accentColor: '#ef4444',
    image: 'sword',
    description: 'Драгоценный рубиновый керамбит. Самый дешевый нож — 520 000 AC, топ — Бабочка Сапфир (950 000 AC)!',
    items: [
      { skin: getSkinById('knife_m9_gamma'), weight: 500 },          // 520 000 AC (< 720000)
      { skin: getSkinById('knife_karambit_ruby'), weight: 310 },     // 680 000 AC (< 720000)
      { skin: getSkinById('knife_m9_crimson_fn'), weight: 125 },     // 750 000 AC
      { skin: getSkinById('knife_butterfly_emerald'), weight: 50 },  // 880 000 AC
      { skin: getSkinById('knife_butterfly_sapphire'), weight: 15 }, // 950 000 AC
    ],
  },
  {
    id: 'knife_case_m9_crimson_web_fn',
    name: '🗡️ Легендарный M9 Crimson Web FN',
    category: 'knives',
    price: 790000,
    accentColor: '#991b1b',
    image: 'sword',
    description: 'Мифический нож за 750 000 AC. Самый дешевый скин — 680 000 AC, главный джекпот — Бабочка Сапфир (950 000 AC)!',
    items: [
      { skin: getSkinById('knife_karambit_ruby'), weight: 520 },     // 680 000 AC (< 790000)
      { skin: getSkinById('knife_m9_crimson_fn'), weight: 310 },     // 750 000 AC (< 790000)
      { skin: getSkinById('knife_butterfly_emerald'), weight: 110 }, // 880 000 AC
      { skin: getSkinById('knife_butterfly_sapphire'), weight: 45 }, // 950 000 AC
      { skin: getSkinById('knife_karambit_bluegem'), weight: 15 },   // 1 250 000 AC
    ],
  },
  {
    id: 'knife_case_butterfly_emerald_king',
    name: '🗡️ Бабочка Изумруд: Корона CS2',
    category: 'knives',
    price: 920000,
    accentColor: '#059669',
    image: 'sword',
    description: 'Изумрудная бабочка за 880 000 AC. Младший дроп — 750 000 AC, супер-дроп — Керамбит Blue Gem #387 (1 250 000 AC)!',
    items: [
      { skin: getSkinById('knife_m9_crimson_fn'), weight: 510 },     // 750 000 AC (< 920000)
      { skin: getSkinById('knife_butterfly_emerald'), weight: 300 }, // 880 000 AC (< 920000)
      { skin: getSkinById('knife_butterfly_sapphire'), weight: 130 },// 950 000 AC
      { skin: getSkinById('knife_talon_sapphire'), weight: 45 },     // 460 000 AC (< 920000)
      { skin: getSkinById('knife_karambit_bluegem'), weight: 15 },   // 1 250 000 AC
    ],
  },
  {
    id: 'knife_case_butterfly_sapphire_god',
    name: '🗡️ Бабочка Сапфир: Владыка Небес',
    category: 'knives',
    price: 990000,
    accentColor: '#2563eb',
    image: 'sword',
    description: 'Королевский Сапфир на Бабочку (950 000 AC). Самый дешевый скин — 880 000 AC, джекпот — Керамбит Blue Gem (1 250 000 AC)!',
    items: [
      { skin: getSkinById('knife_butterfly_emerald'), weight: 510 }, // 880 000 AC (< 990000)
      { skin: getSkinById('knife_butterfly_sapphire'), weight: 310 },// 950 000 AC (< 990000)
      { skin: getSkinById('knife_karambit_ruby'), weight: 120 },     // 680 000 AC (< 990000)
      { skin: getSkinById('knife_m9_crimson_fn'), weight: 45 },      // 750 000 AC (< 990000)
      { skin: getSkinById('knife_karambit_bluegem'), weight: 15 },   // 1 250 000 AC
    ],
  },
  {
    id: 'knife_case_blue_gem_karambit_387',
    name: '🗡️ Керамбит Blue Gem #387: Сокровище',
    category: 'knives',
    price: 1350000,
    accentColor: '#06b6d4',
    image: 'sword',
    description: 'Ультимативный ножевой кейс! Чистейшая синева #387 (1 250 000 AC). Самый дешёвый скин — Бабочка Сапфир (950 000 AC).',
    items: [
      { skin: getSkinById('knife_butterfly_emerald'), weight: 490 }, // 880 000 AC (< 1350000)
      { skin: getSkinById('knife_butterfly_sapphire'), weight: 330 },// 950 000 AC (< 1350000)
      { skin: getSkinById('knife_m9_crimson_fn'), weight: 120 },     // 750 000 AC (< 1350000)
      { skin: getSkinById('knife_karambit_bluegem'), weight: 60 },   // 1 250 000 AC (< 1350000)
      { skin: getSkinById('knife_talon_sapphire'), weight: 20 },     // 460 000 AC (< 1350000)
    ],
  },

  // 5. Тематические ножевые кейсы (Doppler Phase, Fade, Autotronic, Crimson, Marble, Safari)
  {
    id: 'knife_case_doppler_phases',
    name: '🗡️ Все Фазы Doppler CS2',
    category: 'knives',
    price: 15900,
    accentColor: '#c084fc',
    image: 'sword',
    description: 'Сборник фаз Doppler: от Тычковых Сапфир и Gut Doppler до Ursus Doppler Phase 2!',
    items: [
      { skin: getSkinById('knife_gut_doppler'), weight: 510 },       // 8 500 AC (< 15900)
      { skin: getSkinById('knife_shadow_doppler'), weight: 320 },    // 14 200 AC (< 15900)
      { skin: getSkinById('knife_ursus_night'), weight: 110 },       // 15 500 AC (< 15900)
      { skin: getSkinById('knife_ursus_doppler'), weight: 50 },      // 45 000 AC
      { skin: getSkinById('knife_karambit_doppler'), weight: 10 },   // 118 000 AC
    ],
  },
  {
    id: 'knife_case_fade_spectrum',
    name: '🗡️ Спектр Fade: Радужные Ножи',
    category: 'knives',
    price: 24900,
    accentColor: '#f43f5e',
    image: 'sword',
    description: 'Исключительно ножи с градиентом Fade: Фальшион, Classic, Паракорд, Выживание и Охотничий!',
    items: [
      { skin: getSkinById('knife_falchion_fade'), weight: 510 },     // 12 500 AC (< 24900)
      { skin: getSkinById('knife_classic_fade'), weight: 300 },      // 21 000 AC (< 24900)
      { skin: getSkinById('knife_paracord_fade'), weight: 125 },     // 23 500 AC (< 24900)
      { skin: getSkinById('knife_survival_fade'), weight: 50 },      // 27 000 AC
      { skin: getSkinById('knife_huntsman_fade'), weight: 15 },      // 36 000 AC
    ],
  },
  {
    id: 'knife_case_autotronic_high_tech',
    name: '🗡️ Автотроника: Хай-тек Сталь',
    category: 'knives',
    price: 27900,
    accentColor: '#ef4444',
    image: 'sword',
    description: 'Сетчатый стальной хай-тек дизайн. Дешевый исход — 17 500 AC, главный скин — Складной Автотроника (25 500 AC)!',
    items: [
      { skin: getSkinById('knife_flip_lore'), weight: 520 },         // 17 500 AC (< 27900)
      { skin: getSkinById('knife_classic_fade'), weight: 290 },      // 21 000 AC (< 27900)
      { skin: getSkinById('knife_paracord_fade'), weight: 120 },     // 23 500 AC (< 27900)
      { skin: getSkinById('knife_flip_autotronic'), weight: 55 },    // 25 500 AC (< 27900)
      { skin: getSkinById('knife_stiletto_marble'), weight: 15 },    // 35 000 AC
    ],
  },
  {
    id: 'knife_case_crimson_web_cult',
    name: '🗡️ Культ Кровавой Паутины',
    category: 'knives',
    price: 32000,
    accentColor: '#991b1b',
    image: 'sword',
    description: 'Алые ножи с тонким паутинным узором. Минимальный скин — 6 800 AC, джекпот — Стилет Кровавая паутина (160 000 AC)!',
    items: [
      { skin: getSkinById('knife_shadow_crimson'), weight: 530 },    // 6 800 AC (< 32000)
      { skin: getSkinById('knife_classic_fade'), weight: 280 },      // 21 000 AC (< 32000)
      { skin: getSkinById('knife_survival_fade'), weight: 120 },     // 27 000 AC (< 32000)
      { skin: getSkinById('knife_stiletto_crimson'), weight: 55 },   // 160 000 AC
      { skin: getSkinById('knife_skeleton_crimson'), weight: 15 },   // 245 000 AC
    ],
  },
  {
    id: 'knife_case_marble_fade_prismatic',
    name: '🗡️ Мраморный Градиент: Огонь и Лёд',
    category: 'knives',
    price: 39500,
    accentColor: '#38bdf8',
    image: 'sword',
    description: 'Трёхцветные переливы Marble Fade. Самый дешёвый — 25 500 AC, джекпот — Стилет Мраморный (35 000 AC) и Ursus (45 000 AC)!',
    items: [
      { skin: getSkinById('knife_flip_autotronic'), weight: 510 },   // 25 500 AC (< 39500)
      { skin: getSkinById('knife_talon_tiger'), weight: 300 },       // 32 000 AC (< 39500)
      { skin: getSkinById('knife_stiletto_marble'), weight: 130 },   // 35 000 AC (< 39500)
      { skin: getSkinById('knife_stiletto_tiger'), weight: 45 },     // 38 000 AC (< 39500)
      { skin: getSkinById('knife_ursus_doppler'), weight: 15 },      // 45 000 AC
    ],
  },
  {
    id: 'knife_case_safari_boreal_camo',
    name: '🗡️ Сафари & Камуфляж (Militia)',
    category: 'knives',
    price: 4200,
    accentColor: '#65a30d',
    image: 'sword',
    description: 'Маскировочные армейские ножи CS2. Стартовый скин — Наваха Африканка (3 200 AC), топ — Боуи Обугленный (7 200 AC)!',
    items: [
      { skin: getSkinById('knife_navaja_safari'), weight: 530 },     // 3 200 AC (< 4200)
      { skin: getSkinById('knife_navaja_urban'), weight: 300 },      // 3 600 AC (< 4200)
      { skin: getSkinById('knife_gut_forest'), weight: 120 },        // 4 500 AC
      { skin: getSkinById('knife_falchion_boreal'), weight: 40 },    // 4 900 AC
      { skin: getSkinById('knife_bowie_scorched'), weight: 10 },     // 7 200 AC
    ],
  },
  {
    id: 'knife_case_night_ops_stealth',
    name: '🗡️ Ночная Спецоперация (Night Ops)',
    category: 'knives',
    price: 16500,
    accentColor: '#1e1b4b',
    image: 'sword',
    description: 'Глубокие матовые ночные лезвия. Базовый исход — 10 500 AC, топовый дроп — Медвежий Night Stripe (15 500 AC) и Фальшион Fade!',
    items: [
      { skin: getSkinById('knife_bowie_damascus'), weight: 500 },    // 10 500 AC (< 16500)
      { skin: getSkinById('knife_falchion_fade'), weight: 310 },     // 12 500 AC (< 16500)
      { skin: getSkinById('knife_ursus_night'), weight: 135 },       // 15 500 AC (< 16500)
      { skin: getSkinById('knife_flip_lore'), weight: 45 },          // 17 500 AC
      { skin: getSkinById('knife_classic_fade'), weight: 10 },       // 21 000 AC
    ],
  },
  {
    id: 'knife_case_lore_dragon_gold',
    name: '🗡️ Драконьи Легенды: Lore Edition',
    category: 'knives',
    price: 85000,
    accentColor: '#ca8a04',
    image: 'sword',
    description: 'Узоры Lore с кельтскими мотивами. Стартовый дроп — 17 500 AC, топ — Нож-бабочка Lore (215 000 AC)!',
    items: [
      { skin: getSkinById('knife_flip_lore'), weight: 480 },         // 17 500 AC (< 85000)
      { skin: getSkinById('knife_karambit_tiger'), weight: 310 },    // 68 000 AC (< 85000)
      { skin: getSkinById('knife_m9_lore'), weight: 140 },           // 92 000 AC
      { skin: getSkinById('knife_butterfly_fade'), weight: 55 },     // 188 000 AC
      { skin: getSkinById('knife_butterfly_lore'), weight: 15 },     // 215 000 AC
    ],
  },
  {
    id: 'knife_case_urban_masked_concrete',
    name: '🗡️ Городской Камуфляж (Urban)',
    category: 'knives',
    price: 4900,
    accentColor: '#64748b',
    image: 'sword',
    description: 'Городские бетонные текстуры маскировки. Стартовый скин — 3 600 AC, топ — Наваха Зуб тигра (7 900 AC)!',
    items: [
      { skin: getSkinById('knife_navaja_urban'), weight: 530 },      // 3 600 AC (< 4900)
      { skin: getSkinById('knife_shadow_rust'), weight: 290 },       // 4 100 AC (< 4900)
      { skin: getSkinById('knife_falchion_boreal'), weight: 120 },   // 4 900 AC
      { skin: getSkinById('knife_gut_scorched'), weight: 45 },       // 5 800 AC
      { skin: getSkinById('knife_navaja_tiger'), weight: 15 },       // 7 900 AC
    ],
  },
  {
    id: 'knife_case_scorched_earth_fire',
    name: '🗡️ Обугленная Земля (Scorched)',
    category: 'knives',
    price: 6100,
    accentColor: '#78350f',
    image: 'sword',
    description: 'Обожженные пламенем клинки. Самый дешевый скин — 4 500 AC, главный скин — Нож Боуи Обугленный (7 200 AC)!',
    items: [
      { skin: getSkinById('knife_gut_forest'), weight: 510 },        // 4 500 AC (< 6100)
      { skin: getSkinById('knife_gut_scorched'), weight: 320 },      // 5 800 AC (< 6100)
      { skin: getSkinById('knife_bowie_scorched'), weight: 120 },    // 7 200 AC
      { skin: getSkinById('knife_gut_doppler'), weight: 40 },        // 8 500 AC
      { skin: getSkinById('knife_huntsman_scorched'), weight: 10 },  // 9 200 AC
    ],
  },
  {
    id: 'knife_case_case_hardened_heat',
    name: '🗡️ Поверхностная Закалка: Ножи',
    category: 'knives',
    price: 185000,
    accentColor: '#0284c7',
    image: 'sword',
    description: 'Обожженная в углях синяя сталь. Самый дешевый скин — 118 000 AC, в джекпоте — Керамбит Blue Gem #387 (1 250 000 AC)!',
    items: [
      { skin: getSkinById('knife_karambit_doppler'), weight: 500 },  // 118 000 AC (< 185000)
      { skin: getSkinById('knife_nomad_fade'), weight: 300 },        // 135 000 AC (< 185000)
      { skin: getSkinById('knife_stiletto_crimson'), weight: 135 },  // 160 000 AC (< 185000)
      { skin: getSkinById('knife_skeleton_fade'), weight: 50 },      // 195 000 AC
      { skin: getSkinById('knife_karambit_bluegem'), weight: 15 },   // 1 250 000 AC
    ],
  },
  {
    id: 'knife_case_curved_claws_duel',
    name: '🗡️ Изогнутые Клинки: Дуэль Когтей',
    category: 'knives',
    price: 89000,
    accentColor: '#a855f7',
    image: 'sword',
    description: 'Битва Керамбита и Когтя! Дешевый дроп — 68 000 AC, топовый дроп — Керамбит Допплер (118 000 AC)!',
    items: [
      { skin: getSkinById('knife_karambit_tiger'), weight: 500 },    // 68 000 AC (< 89000)
      { skin: getSkinById('knife_m9_doppler'), weight: 310 },        // 74 000 AC (< 89000)
      { skin: getSkinById('knife_talon_fade'), weight: 130 },        // 110 000 AC
      { skin: getSkinById('knife_karambit_doppler'), weight: 50 },   // 118 000 AC
      { skin: getSkinById('knife_butterfly_fade'), weight: 10 },     // 188 000 AC
    ],
  },
  {
    id: 'knife_case_tactical_special_forces',
    name: '🗡️ Тактический Спецназ (Tactical)',
    category: 'knives',
    price: 29500,
    accentColor: '#334155',
    image: 'sword',
    description: 'Экипировка боевых пловцов и разведчиков. Самый дешёвый — 21 000 AC, топ — Стилет Мраморный (35 000 AC)!',
    items: [
      { skin: getSkinById('knife_classic_fade'), weight: 500 },      // 21 000 AC (< 29500)
      { skin: getSkinById('knife_paracord_fade'), weight: 300 },     // 23 500 AC (< 29500)
      { skin: getSkinById('knife_survival_fade'), weight: 135 },     // 27 000 AC (< 29500)
      { skin: getSkinById('knife_talon_tiger'), weight: 50 },        // 32 000 AC
      { skin: getSkinById('knife_stiletto_marble'), weight: 15 },    // 35 000 AC
    ],
  },
  {
    id: 'knife_case_butterfly_acrobatics',
    name: '🗡️ Бабочка: Акробатика Трюков',
    category: 'knives',
    price: 185000,
    accentColor: '#ec4899',
    image: 'sword',
    description: 'Лучшие вращения Бабочки. Самый дешёвый — 89 000 AC, главный выигрыш — Бабочка Lore (215 000 AC)!',
    items: [
      { skin: getSkinById('knife_butterfly_tiger'), weight: 500 },   // 89 000 AC (< 185000)
      { skin: getSkinById('knife_talon_fade'), weight: 300 },        // 110 000 AC (< 185000)
      { skin: getSkinById('knife_nomad_fade'), weight: 135 },        // 135 000 AC (< 185000)
      { skin: getSkinById('knife_butterfly_fade'), weight: 50 },     // 188 000 AC
      { skin: getSkinById('knife_butterfly_lore'), weight: 15 },     // 215 000 AC
    ],
  },
  {
    id: 'knife_case_russian_roulette_knives',
    name: '🗡️ Ножевая Рулетка: All-in',
    category: 'knives',
    price: 55000,
    accentColor: '#ef4444',
    image: 'sword',
    description: 'Высокий риск: можно получить нож за 27 000 AC или сорвать куш за 188 000 AC!',
    items: [
      { skin: getSkinById('knife_survival_fade'), weight: 490 },     // 27 000 AC (< 55000)
      { skin: getSkinById('knife_stiletto_marble'), weight: 320 },   // 35 000 AC (< 55000)
      { skin: getSkinById('knife_ursus_doppler'), weight: 130 },     // 45 000 AC (< 55000)
      { skin: getSkinById('knife_m9_lore'), weight: 50 },            // 92 000 AC
      { skin: getSkinById('knife_butterfly_fade'), weight: 10 },     // 188 000 AC
    ],
  },
  {
    id: 'knife_case_budget_knives_5k',
    name: '🗡️ Доступный Нож: 5K Club',
    category: 'knives',
    price: 5500,
    accentColor: '#14b8a6',
    image: 'sword',
    description: 'Специальный кейс до 5 500 AC. Самый дешевый скин — 4 100 AC, в джекпоте — Охотничий скин за 9 200 AC!',
    items: [
      { skin: getSkinById('knife_shadow_rust'), weight: 520 },       // 4 100 AC (< 5500)
      { skin: getSkinById('knife_gut_forest'), weight: 300 },        // 4 500 AC (< 5500)
      { skin: getSkinById('knife_gut_scorched'), weight: 120 },      // 5 800 AC
      { skin: getSkinById('knife_bowie_scorched'), weight: 50 },     // 7 200 AC
      { skin: getSkinById('knife_huntsman_scorched'), weight: 10 },  // 9 200 AC
    ],
  },
  {
    id: 'knife_case_budget_knives_10k',
    name: '🗡️ Ножевой Клуб: 10K Target',
    category: 'knives',
    price: 10500,
    accentColor: '#84cc16',
    image: 'sword',
    description: 'Кейс среднего бюджета. Младший дроп — 7 200 AC, топ — Тычковые Сапфир (14 200 AC)!',
    items: [
      { skin: getSkinById('knife_bowie_scorched'), weight: 500 },    // 7 200 AC (< 10500)
      { skin: getSkinById('knife_navaja_tiger'), weight: 310 },      // 7 900 AC (< 10500)
      { skin: getSkinById('knife_gut_doppler'), weight: 130 },       // 8 500 AC (< 10500)
      { skin: getSkinById('knife_falchion_fade'), weight: 45 },      // 12 500 AC
      { skin: getSkinById('knife_shadow_doppler'), weight: 15 },     // 14 200 AC
    ],
  },
  {
    id: 'knife_case_budget_knives_20k',
    name: '🗡️ Ножевой Клуб: 20K Target',
    category: 'knives',
    price: 21500,
    accentColor: '#eab308',
    image: 'sword',
    description: 'Солидный ножевой кейс. Базовый скин — 15 500 AC, джекпот — Нож выживания Fade (27 000 AC)!',
    items: [
      { skin: getSkinById('knife_ursus_night'), weight: 500 },       // 15 500 AC (< 21500)
      { skin: getSkinById('knife_flip_lore'), weight: 310 },         // 17 500 AC (< 21500)
      { skin: getSkinById('knife_classic_fade'), weight: 130 },      // 21 000 AC (< 21500)
      { skin: getSkinById('knife_flip_autotronic'), weight: 45 },    // 25 500 AC
      { skin: getSkinById('knife_survival_fade'), weight: 15 },      // 27 000 AC
    ],
  },
  {
    id: 'knife_case_budget_knives_50k',
    name: '🗡️ Ножевой Клуб: 50K Target',
    category: 'knives',
    price: 52000,
    accentColor: '#f97316',
    image: 'sword',
    description: 'Серьезный хайроллер кейс. Младший дроп — 35 000 AC, топ — Керамбит Зуб тигра (68 000 AC) и M9 (74 000 AC)!',
    items: [
      { skin: getSkinById('knife_stiletto_marble'), weight: 510 },   // 35 000 AC (< 52000)
      { skin: getSkinById('knife_stiletto_tiger'), weight: 300 },    // 38 000 AC (< 52000)
      { skin: getSkinById('knife_ursus_doppler'), weight: 130 },     // 45 000 AC (< 52000)
      { skin: getSkinById('knife_karambit_tiger'), weight: 45 },     // 68 000 AC
      { skin: getSkinById('knife_m9_doppler'), weight: 15 },         // 74 000 AC
    ],
  },
  {
    id: 'knife_case_ultimate_apex_blades',
    name: '👑 GameVia Blades: Ультимативный Ножевой',
    category: 'knives',
    price: 295000,
    accentColor: '#38bdf8',
    image: 'sword',
    description: 'Флагманский ножевой кейс GameVia! Самый дешёвый — 188 000 AC, в джекпоте — Керамбит Blue Gem #387 (1 250 000 AC)!',
    items: [
      { skin: getSkinById('knife_butterfly_fade'), weight: 480 },    // 188 000 AC (< 295000)
      { skin: getSkinById('knife_skeleton_fade'), weight: 300 },     // 195 000 AC (< 295000)
      { skin: getSkinById('knife_skeleton_crimson'), weight: 140 },  // 245 000 AC (< 295000)
      { skin: getSkinById('knife_talon_sapphire'), weight: 55 },     // 460 000 AC
      { skin: getSkinById('knife_karambit_bluegem'), weight: 25 },   // 1 250 000 AC
    ],
  },
];
