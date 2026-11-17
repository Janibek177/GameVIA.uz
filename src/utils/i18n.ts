export type Language = 'ru' | 'uz' | 'en';

export interface Translations {
  [key: string]: {
    ru: string;
    uz: string;
    en: string;
  };
}

export const TRANSLATIONS: Translations = {
  // Navigation
  'nav.cases': { ru: 'Кейсы', uz: 'Qutilar', en: 'Cases' },
  'nav.crash': { ru: 'Краш', uz: 'Krash', en: 'Crash' },
  'nav.mines': { ru: 'Мины', uz: 'Minalar', en: 'Mines' },
  'nav.stairs': { ru: 'Лесенка', uz: 'Zina', en: 'Stairs' },
  'nav.tower': { ru: 'Башня', uz: 'Minora', en: 'Tower' },
  'nav.upgrade': { ru: 'Апгрейд', uz: 'Yangilash', en: 'Upgrade' },
  'nav.contract': { ru: 'Контракты', uz: 'Shartnomalar', en: 'Contracts' },
  'nav.pass': { ru: 'GamePass', uz: 'GamePass', en: 'GamePass' },
  'nav.inventory': { ru: 'Инвентарь', uz: 'Inventar', en: 'Inventory' },
  'nav.analyzer': { ru: 'RTP Анализ', uz: 'RTP Tahlil', en: 'RTP Analysis' },
  'nav.about': { ru: 'FAQ', uz: 'FAQ', en: 'FAQ' },

  // Top Bar & Buttons
  'topbar.promo': { ru: 'Промокод', uz: 'Promokod', en: 'Promo Code' },
  'topbar.history': { ru: 'История', uz: 'Tarix', en: 'History' },
  'topbar.support': { ru: 'Поддержка', uz: 'Yordam', en: 'Support' },
  'topbar.balance': { ru: 'Баланс', uz: 'Balans', en: 'Balance' },
  'topbar.topup': { ru: 'Пополнить', uz: "To'ldirish", en: 'Top Up' },
  'topbar.withdraw': { ru: 'Вывести', uz: 'Yechib olish', en: 'Withdraw' },
  'topbar.login': { ru: 'Войти', uz: 'Kirish', en: 'Sign In' },
  'topbar.profile': { ru: 'Профиль', uz: 'Profil', en: 'Profile' },
  'topbar.sound_on': { ru: 'Включить звук', uz: 'Ovozni yoqish', en: 'Unmute' },
  'topbar.sound_off': { ru: 'Выключить звук', uz: "Ovozni o'chirish", en: 'Mute' },

  // Hero & Live Stats
  'hero.badge': {
    ru: 'GameVia · Официальный симулятор кейсов, лесенки, краша и вывода в игры',
    uz: "GameVia · Rasmiy qutilar, zina, krash simulyatori va o'yinlarga yechish",
    en: 'GameVia · Official case opening, stairs, crash simulator and game payouts',
  },
  'hero.title': { ru: 'Открывай кейсы на', uz: 'Qutilarni oching', en: 'Open cases on' },
  'hero.desc': {
    ru: '28 уникальных кейсов с реалистичными скинами оружия, детальными 3D фонами, рулеткой со звуками, режимами «Лесенка», «Башня», «Краш», Апгрейдами на скины и деньги, а также открытой математикой отдачи.',
    uz: "Haqiqiy qurol skinlari, batafsil 3D fonlar, ovozli ruletka, «Zina», «Minora», «Krash» rejimlari, skin va pul yangilashlari bilan 28 ta noyob quti.",
    en: '28 unique cases with realistic weapon skins, detailed 3D backgrounds, roulette with sound effects, Stairs, Tower, Crash games, upgrades, and transparent RTP math.',
  },
  'hero.daily_btn': { ru: 'Бесплатный ежедневный кейс', uz: 'Kunlik bepul quti', en: 'Free Daily Case' },
  'hero.tg_btn': { ru: 'Кейс за Telegram', uz: 'Telegram uchun quti', en: 'Telegram Bonus Case' },
  'hero.players_online': { ru: 'Игроков онлайн:', uz: "O'yinchilar onlayn:", en: 'Players online:' },
  'hero.total_opens': { ru: 'Всего открытий:', uz: 'Jami ochilgan:', en: 'Total opens:' },
  'hero.crash_record': { ru: 'Краш рекорд дня:', uz: 'Kun krash rekordi:', en: 'Daily Crash record:' },
  'hero.jackpot': { ru: 'Джекпот дня:', uz: 'Kun jekpoti:', en: 'Daily Jackpot:' },

  // Live Drops
  'live.title': { ru: 'Живая лента дропов', uz: 'Jonli yutuqlar lentasi', en: 'Live Drops Ticker' },
  'live.real_players': { ru: 'Реальные игроки', uz: "Haqiqiy o'yinchilar", en: 'Real Players' },

  // Categories
  'cat.all': { ru: 'Все кейсы', uz: 'Barcha qutilar', en: 'All Cases' },
  'cat.knives': { ru: '🔪 Только Ножи', uz: '🔪 Faqat Pichoqlar', en: '🔪 Knives Only' },
  'cat.cheap': { ru: '💵 Бюджетные (<150 AC)', uz: '💵 Hamyonbop (<150 AC)', en: '💵 Budget (<150 AC)' },
  'cat.popular': { ru: '🔥 Популярные CS2', uz: '🔥 Ommabop CS2', en: '🔥 Popular CS2' },
  'cat.premium': { ru: '👑 Премиум & Ножи', uz: '👑 Premium & Pichoqlar', en: '👑 Premium & Knives' },
  'cat.standoff': { ru: '📱 Standoff 2', uz: '📱 Standoff 2', en: '📱 Standoff 2' },
  'cat.special': { ru: '🎁 Особые', uz: '🎁 Maxsus', en: '🎁 Special' },

  // Case Card
  'card.open': { ru: 'Открыть кейс', uz: 'Qutini ochish', en: 'Open Case' },
  'card.free': { ru: 'FREE', uz: 'BEPUL', en: 'FREE' },
  'card.open_free': { ru: 'Открыть бесплатно', uz: 'Bepul ochish', en: 'Open Free' },
  'card.daily_cooldown': { ru: '1 раз в 24ч', uz: '24 soatda 1 marta', en: '1x per 24h' },
  'card.available_in': { ru: 'Доступен через', uz: 'Qolgan vaqt', en: 'Available in' },
  'card.need_tg': { ru: '📢 Нужна подписка', uz: "📢 Obuna bo'ling", en: '📢 Sub Needed' },
  'card.tg_bonus': { ru: '🎁 Бонус Telegram (1 раз в 24ч)', uz: '🎁 Telegram bonusi (24 soatda 1 marta)', en: '🎁 Telegram Bonus (1x per 24h)' },
  'card.skins_count': { ru: 'скинов', uz: 'skinlar', en: 'skins' },
  'card.top_drop': { ru: 'Топ:', uz: 'Top:', en: 'Top:' },
  'card.voucher_open': { ru: '🎁 Открыть по промокоду', uz: '🎁 Promokod orqali ochish', en: '🎁 Open with Voucher' },
  'card.open_daily': { ru: '🎁 Открыть ежедневный', uz: '🎁 Kunlik qutini ochish', en: '🎁 Open Daily Case' },
  'card.subscribe_tg': { ru: '📢 Подпишись на TG', uz: "📢 TG ga obuna bo'l", en: '📢 Subscribe to TG' },

  // Inventory
  'inv.title': { ru: 'Ваш инвентарь', uz: 'Sizning inventaringiz', en: 'Your Inventory' },
  'inv.sub': {
    ru: 'Управляйте полученными предметами: продавайте за Acoin, улучшайте в Апгрейде или выводите в игры',
    uz: "Olingan buyumlarni boshqaring: Acoin evaziga soting, Yangilashda ko'taring yoki o'yinga chiqaring",
    en: 'Manage obtained skins: sell for Acoin, upgrade, or withdraw to games',
  },
  'inv.total_value': { ru: 'Общая стоимость:', uz: 'Umumiy qiymat:', en: 'Total value:' },
  'inv.sell_all': { ru: 'Продать всё', uz: 'Hammasini sotish', en: 'Sell All' },
  'inv.confirm_sell_all': { ru: '⚠️ Точно продать всё', uz: '⚠️ Rostdan hammasini sotasizmi', en: '⚠️ Really sell all' },
  'inv.cancel': { ru: 'Отмена', uz: 'Bekor qilish', en: 'Cancel' },
  'inv.sell_junk': { ru: 'Продать ширп (<100 AC)', uz: 'Arzonlarini sotish (<100 AC)', en: 'Sell junk (<100 AC)' },
  'inv.sell': { ru: 'Продать', uz: 'Sotish', en: 'Sell' },
  'inv.withdraw_game': { ru: 'Вывести в игру', uz: "O'yinga chiqarish", en: 'Withdraw to game' },
  'inv.to_upgrade': { ru: 'В Апгрейд', uz: 'Yangilashga', en: 'To Upgrade' },
  'inv.empty_title': { ru: 'Инвентарь пуст', uz: "Inventar bo'sh", en: 'Inventory is empty' },
  'inv.empty_desc': {
    ru: 'Откройте кейсы на главной странице или введите промокод, чтобы получить скины!',
    uz: 'Skinlar olish uchun asosiy sahifadagi qutilarni oching yoki promokod kiriting!',
    en: 'Open cases on the main page or enter a promo code to get skins!',
  },

  // VIP Pass (Only Real Money!)
  'pass.modal_title': { ru: 'GameVia Battle Pass', uz: 'GameVia Jangovar Passi', en: 'GameVia Battle Pass' },
  'pass.season': { ru: 'Сезон 1 • Огненный Штурм', uz: '1-mavsum • Olovli Hujum', en: 'Season 1 • Fire Storm' },
  'pass.days_left': { ru: '28 дней', uz: '28 kun', en: '28 days' },
  'pass.level': { ru: 'Уровень', uz: 'Daraja', en: 'Level' },
  'pass.xp': { ru: 'Опыт (XP)', uz: 'Tajriba (XP)', en: 'Experience (XP)' },
  'pass.rewards_tab': { ru: 'Шкала наград', uz: 'Mukofotlar shkalasi', en: 'Rewards Track' },
  'pass.quests_tab': { ru: 'Задания на опыт', uz: 'Tajriba topshiriqlari', en: 'XP Quests' },
  'pass.buy_vip_btn': { ru: 'Купить VIP Pass (За деньги)', uz: 'VIP Pass sotib olish (Pulga)', en: 'Buy VIP Pass (Real Money)' },
  'pass.vip_active': { ru: 'VIP Pass АКТИВЕН', uz: 'VIP Pass FAOLLASHTIRILGAN', en: 'VIP Pass ACTIVE' },
  'pass.real_money_rule': {
    ru: '⚠️ Внимание: VIP Pass покупается ТОЛЬКО за реальные деньги (Humo / Visa / СБП), списание баланса Gold недоступно!',
    uz: "⚠️ Diqqat: VIP Pass FAQAT haqiqiy pulga (Humo / Visa / SBP) sotib olinadi, o'yin Gold balansi orqali emas!",
    en: '⚠️ Attention: VIP Pass is purchased ONLY with real money (Humo / Visa / SBP), Gold balance cannot be used!',
  },
  'pass.free_track': { ru: 'Бесплатно', uz: 'Bepul', en: 'Free' },
  'pass.vip_track': { ru: 'VIP Pass', uz: 'VIP Pass', en: 'VIP Pass' },
  'pass.claim': { ru: 'Забрать', uz: 'Olish', en: 'Claim' },
  'pass.claimed': { ru: 'Получено', uz: 'Olingan', en: 'Claimed' },
  'pass.locked': { ru: 'Заблокировано', uz: 'Qulflangan', en: 'Locked' },
  'pass.standard_name': { ru: 'Стандарт VIP Pass', uz: 'Standart VIP Pass', en: 'Standard VIP Pass' },
  'pass.bundle_name': { ru: 'Бандл VIP + 10 Уровней', uz: "To'plam VIP + 10 Daraja", en: 'Bundle VIP + 10 Levels' },
  'pass.boost_name': { ru: '+1 Уровень Boost', uz: '+1 Daraja Boost', en: '+1 Level Boost' },
  'pass.submit_receipt': { ru: 'Отправить чек об оплате', uz: "To'lov chekini yuborish", en: 'Submit Payment Receipt' },
  'pass.contact_telegram': { ru: 'Купить через Telegram', uz: 'Telegram orqali sotib olish', en: 'Buy via Telegram' },
  'pass.payment_humo': { ru: 'Карта HUMO:', uz: 'HUMO kartasi:', en: 'HUMO Card:' },
  'pass.payment_visa': { ru: 'Карта VISA:', uz: 'VISA kartasi:', en: 'VISA Card:' },
  'pass.payment_holder': { ru: 'Получатель:', uz: 'Qabul qiluvchi:', en: 'Recipient:' },
  'pass.payment_sbp': { ru: 'СБП / ID:', uz: 'SBP / ID:', en: 'SBP / ID:' },
  'pass.payment_instruction': {
    ru: 'Оплатите выбранный тариф на одну из карт, затем прикрепите чек или напишите в Telegram для моментальной активации.',
    uz: "Tanlangan tarifni kartalardan biriga to'lang, so'ngra chekni biriktiring yoki tezkor faollashtirish uchun Telegramga yozing.",
    en: 'Pay for the selected tier using one of the cards, then attach your receipt or contact Telegram for instant activation.',
  },

  // Top-Up Modal
  'topup.title': { ru: 'Покупка Gold', uz: 'Gold sotib olish', en: 'Buy Gold' },
  'topup.tab_buy': { ru: 'Купить Gold', uz: 'Gold sotib olish', en: 'Buy Gold' },
  'topup.tab_history': { ru: 'История заказов', uz: 'Buyurtmalar tarixi', en: 'Order History' },
  'topup.humo_card': { ru: 'Карта HUMO (Узбекистан)', uz: "HUMO kartasi (O'zbekiston)", en: 'HUMO Card (Uzbekistan)' },
  'topup.visa_card': { ru: 'Карта VISA (СНГ / Международная)', uz: 'VISA kartasi (Xalqaro / MDH)', en: 'VISA Card (International / CIS)' },
  'topup.copy_humo': { ru: 'Копировать Humo', uz: 'Humo nusxalash', en: 'Copy Humo' },
  'topup.copy_visa': { ru: 'Копировать Visa', uz: 'Visa nusxalash', en: 'Copy Visa' },
  'topup.copied': { ru: 'Скопировано!', uz: 'Nusxalandi!', en: 'Copied!' },
  'topup.holder': { ru: 'Получатель:', uz: 'Qabul qiluvchi:', en: 'Recipient:' },
  'topup.proceed_pay': { ru: 'Перейти к оплате', uz: "To'lovga o'tish", en: 'Proceed to Payment' },
  'topup.i_paid': { ru: 'Я оплатил, загрузить чек', uz: "To'ladim, chekni yuklash", en: 'I Paid, Upload Receipt' },
  'topup.back': { ru: 'Назад', uz: 'Orqaga', en: 'Back' },

  // Support
  'support.title': { ru: 'Служба поддержки 24/7', uz: "Qo'llab-quvvatlash xizmati 24/7", en: 'Support Service 24/7' },
  'support.desc': {
    ru: 'Мы на связи круглосуточно. Отвечаем в течение 2-5 минут в Telegram.',
    uz: 'Biz kechayu-kunduz aloqadamiz. Telegram orqali 2-5 daqiqa ichida javob beramiz.',
    en: 'We are available 24/7. Response within 2-5 minutes in Telegram.',
  },
  'support.chief': { ru: 'Главный:', uz: 'Asosiy:', en: 'Head:' },
  'support.admin': { ru: 'Администратор:', uz: 'Administrator:', en: 'Administrator:' },

  // Auth gate notice
  'auth.required_title': { ru: 'Требуется авторизация', uz: 'Avtorizatsiya talab qilinadi', en: 'Sign In Required' },
  'auth.required_cases': { ru: 'Войдите или зарегистрируйтесь, чтобы открывать кейсы!', uz: 'Qutilarni ochish uchun tizimga kiring yoki ro‘yxatdan o‘ting!', en: 'Please sign in or register to open cases!' },
  'auth.required_games': { ru: 'Войдите в аккаунт, чтобы играть в игры и делать ставки!', uz: 'O‘yin o‘ynash va stavka qilish uchun hisobingizga kiring!', en: 'Sign in to your account to play games and place bets!' },
  'auth.required_topup': { ru: 'Войдите в аккаунт, чтобы пополнить баланс!', uz: 'Balansni to‘ldirish uchun tizimga kiring!', en: 'Please sign in to top up your balance!' },
  'auth.required_withdraw': { ru: 'Войдите в аккаунт, чтобы вывести баланс!', uz: 'Mablag‘ni yechish uchun hisobingizga kiring!', en: 'Please sign in to withdraw your balance!' },
  'auth.login_btn': { ru: 'Войти в аккаунт', uz: 'Hisobga kirish', en: 'Sign In' },
};

export const CASE_TRANSLATIONS: Record<
  string,
  { name: { ru: string; uz: string; en: string }; desc: { ru: string; uz: string; en: string } }
> = {
  free_daily: {
    name: { ru: '🎁 Ежедневный Free Drop', uz: '🎁 Kunlik Bepul Quti', en: '🎁 Free Daily Drop' },
    desc: {
      ru: 'Бесплатный ежедневный кейс. Шанс выбить стартовый скин или тайный дроп!',
      uz: 'Kunlik bepul quti. Boshlang‘ich yoki maxfiy skin yutish imkoniyati!',
      en: 'Free daily case. Chance to pull a starter skin or covert drop!',
    },
  },
  tg_subscribe_case: {
    name: { ru: '📢 Бонус за подписку на Telegram', uz: '📢 Telegram Obuna Bonusi', en: '📢 Telegram Subscription Bonus' },
    desc: {
      ru: 'Ежедневный бонус за подписку на Telegram-канал t.me/GameV1A. Доступен 1 раз в 24 часа!',
      uz: 't.me/GameV1A Telegram kanaliga obuna uchun kunlik bonus. 24 soatda 1 marta!',
      en: 'Daily bonus for subscribing to t.me/GameV1A Telegram channel. 1x per 24 hours!',
    },
  },
  student_drop: {
    name: { ru: '🪙 Студенческий CS2', uz: '🪙 Talabalar CS2 Qutisi', en: '🪙 Student CS2 Case' },
    desc: {
      ru: 'Бюджетный кейс за 25 AC. Оружие строго не дороже 100 AC, а скины за 55-85 AC выпадают редко!',
      uz: '25 AC lik hamyonbop quti. 100 AC dan oshmaydigan qurollar va kamyob skinlar!',
      en: 'Budget case for 25 AC. Weapons under 100 AC with rare high-tier pulls!',
    },
  },
  apex_starter: {
    name: { ru: '⚡ GameVia Starter', uz: '⚡ GameVia Boshlang‘ich', en: '⚡ GameVia Starter' },
    desc: {
      ru: 'Фирменный стартовый кейс с хорошим балансом отдачи и ножом в джекпоте.',
      uz: 'Yaxshi muvozanat va jekpotda pichoq bo‘lgan maxsus start quti.',
      en: 'Signature starter case with balanced RTP and knife jackpot.',
    },
  },
  starter_boost_69: {
    name: { ru: '🚀 Стартовый Буст', uz: '🚀 Start Tezlanishi', en: '🚀 Starter Boost' },
    desc: {
      ru: 'Доступный кейс за 69 AC. Отличный старт с Deagle Оксидное пламя и шансом на AWP Гадюка!',
      uz: '69 AC lik qulay quti. Deagle va AWP Viper yutish imkoniyati!',
      en: 'Affordable 69 AC case. Great start with Deagle Oxide Blaze and AWP Atheris!',
    },
  },
  pistol_rush: {
    name: { ru: '🔫 Пистолетный Раш', uz: '🔫 To‘pponchalar Hujumi', en: '🔫 Pistol Rush' },
    desc: {
      ru: 'Коллекция пистолетов: от Glock и Deagle до Printstream и Kill Confirmed.',
      uz: 'To‘pponchalar to‘plami: Glock, Deagle dan Printstream va Kill Confirmed gacha.',
      en: 'Collection of pistols: from Glock and Deagle to Printstream and Kill Confirmed.',
    },
  },
  budget_hit_99: {
    name: { ru: '🎯 Бюджетный Хит', uz: '🎯 Hamyonbop Xit', en: '🎯 Budget Hit' },
    desc: {
      ru: 'Популярный бюджетный кейс с высоким шансом окупиться и выбить AWP или Redline!',
      uz: 'AWP yoki Redline yutish uchun yuqori imkoniyatli ommabop arzon quti!',
      en: 'Popular budget case with high chance to profit and land AWP or Redline!',
    },
  },
  army_supply: {
    name: { ru: '📦 Армейский Дроп', uz: '📦 Harbiy Ta’minot', en: '📦 Army Supply' },
    desc: {
      ru: 'Повышенный шанс на засекреченное вооружение и штурмовые винтовки.',
      uz: 'Maxfiy qurollar va shturm miltiqlariga yuqori imkoniyat.',
      en: 'Increased chance for classified weapons and assault rifles.',
    },
  },
  pistol_rush_v2_180: {
    name: { ru: '⚡ Пистолетный Раш V2', uz: '⚡ To‘pponchalar Hujumi V2', en: '⚡ Pistol Rush V2' },
    desc: {
      ru: 'Улучшенный пистолетный кейс! Высокие шансы на Deagle Oxide, Cortex, Водяной элементаль и Printstream.',
      uz: 'Yangilangan to‘pponcha qutisi: Deagle Oxide, Cortex va Printstream.',
      en: 'Enhanced pistol case: high chances for Oxide, Cortex, Water Elemental, and Printstream.',
    },
  },
  sniper_assault_260: {
    name: { ru: '🎯 Снайперский Штурм', uz: '🎯 Merganlar Hujumi', en: '🎯 Sniper Assault' },
    desc: {
      ru: 'Элитные снайперские винтовки: AWP Atheris, SSG 08 Пламя дракона, Neo-Noir, Скоростной зверь и Азимов!',
      uz: 'Elita snayper miltiqlari: AWP Atheris, Dragonfire, Neo-Noir va Asiimov!',
      en: 'Elite sniper rifles: AWP Atheris, SSG 08 Dragonfire, Neo-Noir, Hyper Beast, and Asiimov!',
    },
  },
  covert_350: {
    name: { ru: '🔥 Тайное за 350', uz: '🔥 350 lik Maxfiy Quti', en: '🔥 Covert 350' },
    desc: {
      ru: 'Высокий шанс на засекреченные и тайные скины CS2: AK-47 Redline, M4A4 Desolate Space и нож!',
      uz: 'CS2 maxfiy skinlariga yuqori imkoniyat: AK-47 Redline, M4A4 va pichoq!',
      en: 'High chance for CS2 classified and covert skins: AK-47 Redline, M4A4 Desolate Space, and a knife!',
    },
  },
  neon_drive_480: {
    name: { ru: '💎 Неоновый Драйв', uz: '💎 Neon Drayv', en: '💎 Neon Drive' },
    desc: {
      ru: 'Неоновые расцветки и элитный арсенал: Скоростной зверь, Повелитель пустошей, Император и Складной нож!',
      uz: 'Neon ranglar va elita qurollar: Hyper Beast, Wasteland Rebel va Buklama pichoq!',
      en: 'Neon aesthetics and elite arsenal: Hyper Beast, Wasteland Rebel, The Emperor, and Flip Knife!',
    },
  },
  awp_express: {
    name: { ru: '🎯 AWP Лихорадка', uz: '🎯 AWP Isitmasi', en: '🎯 AWP Fever' },
    desc: {
      ru: 'Легендарные снайперские винтовки: Atheris, Neo-Noir, Asiimov, Dragon Lore и Gungnir!',
      uz: 'Afsonaviy snayper miltiqlari: Atheris, Asiimov, Dragon Lore va Gungnir!',
      en: 'Legendary sniper rifles: Atheris, Neo-Noir, Asiimov, Dragon Lore, and Gungnir!',
    },
  },
  arms_race: {
    name: { ru: '🏎️ Гонка Вооружений', uz: '🏎️ Qurollanish Poygasi', en: '🏎️ Arms Race' },
    desc: {
      ru: 'Разнообразный арсенал CS2: от доступных пистолетов до ножей и винтовок.',
      uz: 'Turli xil CS2 qurollari: arzon to‘pponchalardan tortib pichoqlar va miltiqlargacha.',
      en: 'Diverse CS2 arsenal: from budget handguns to knives and rifles.',
    },
  },
  ak47_syndicate: {
    name: { ru: '⚡ AK-47 Syndicate', uz: '⚡ AK-47 Sindikati', en: '⚡ AK-47 Syndicate' },
    desc: {
      ru: 'Все лучшие скины на автомат Калашникова: от базовых винтовок до Красной линии, Bloodsport и Лотоса!',
      uz: 'Barcha eng sara Kalashnikov skinlari: Redline, Bloodsport va Wild Lotus!',
      en: 'All best skins for Kalashnikov: from basic rifles to Redline, Bloodsport, and Wild Lotus!',
    },
  },
  covert_hunter: {
    name: { ru: '🔥 Covert Охотник', uz: '🔥 Covert Ovchi', en: '🔥 Covert Hunter' },
    desc: {
      ru: 'Повышенный шанс на Тайное красное оружие и ножевой дроп с реальным риском!',
      uz: 'Qizil maxfiy qurollar va pichoq yutishga oshirilgan imkoniyat!',
      en: 'Boosted odds for Covert red skins and knife drops with real thrill!',
    },
  },
  knife_entry: {
    name: { ru: '🔪 Доступный Нож (Budget Knife)', uz: '🔪 Hamyonbop Pichoq', en: '🔪 Budget Knife' },
    desc: {
      ru: 'Входной билет в мир ножей CS2: риск получить базовый дроп или выбить ценное лезвие!',
      uz: 'CS2 pichoqlar olamiga kirish eshigi: qimmatbaho tig‘ yutib olish imkoni!',
      en: 'Gateway to CS2 knives: risk basic drops or pull a valuable blade!',
    },
  },
  knife_karambit_elite: {
    name: { ru: '🌀 Только Керамбиты (Karambit Elite)', uz: '🌀 Faqat Karambitlar', en: '🌀 Karambit Elite Only' },
    desc: {
      ru: 'Элитный кейс с культовыми изогнутыми ножами-когтями и редкими градиентами!',
      uz: 'Noyob gradientli mashhur egri panja pichoqlarining elita qutisi!',
      en: 'Elite case featuring iconic curved claw knives and rare Doppler fades!',
    },
  },
  knife_gloves_vip: {
    name: { ru: '🧤 Ножи & Перчатки VIP', uz: '🧤 Pichoqlar & Qo‘lqoplar VIP', en: '🧤 Knives & Gloves VIP' },
    desc: {
      ru: 'Идеальное комбо: легендарные перчатки спецназа и элитные лезвия.',
      uz: 'Ajoyib kombinatsiya: afsonaviy maxsus qo‘lqoplar va elita pichoqlar.',
      en: 'The ultimate combo: legendary specialist gloves and elite blades.',
    },
  },
  knife_skeleton_web: {
    name: { ru: '🕸️ Скелетный Нож & Паутина', uz: '🕸️ Skelet Pichoq & O‘rgimchak To‘ri', en: '🕸️ Skeleton Knife & Web' },
    desc: {
      ru: 'Хайроллер кейс с шансом на ★ Скелетный нож Crimson Web и Нож-бабочку!',
      uz: '★ Skelet pichoq Crimson Web va Kapalak pichoq yutish uchun xit quti!',
      en: 'High-roller case featuring ★ Skeleton Knife Crimson Web and Butterfly!',
    },
  },
  knife_butterfly_crown: {
    name: { ru: '🦋 Королевская Бабочка & Допплер', uz: '🦋 Qirollik Kapalak Pichog‘i & Doppler', en: '🦋 Royal Butterfly & Doppler' },
    desc: {
      ru: 'Ультимативный ножевой кейс: Бабочки Fade, Lore, Керамбиты и Скелетные ножи.',
      uz: 'Eng oliy pichoqlar qutisi: Fade, Lore kapalaklar, Karambitlar va Skelet pichoqlar.',
      en: 'Ultimate knife case: Butterfly Fade, Lore, Karambits, and Skeleton knives.',
    },
  },
  god_tier_case: {
    name: { ru: '⚡ Apex God-Tier: Гунгнир & Lore', uz: '⚡ Apex God-Tier: Gungnir & Lore', en: '⚡ Apex God-Tier: Gungnir & Lore' },
    desc: {
      ru: 'Самый дорогой кейс на платформе! Джекпоты: AWP Gungnir, Dragon Lore и Wild Lotus.',
      uz: 'Platformadagi eng hashamatli quti! Jekpotlar: AWP Gungnir, Dragon Lore va Wild Lotus.',
      en: 'The most prestigious case on the platform! Jackpots: AWP Gungnir, Dragon Lore, and Wild Lotus.',
    },
  },
  dragon_nest: {
    name: { ru: '👑 Dragon Nest (Логово Дракона)', uz: '👑 Ajdaho Uyasi (Dragon Nest)', en: '👑 Dragon Nest' },
    desc: {
      ru: 'Премиум кейс с высокими ставками на AWP Dragon Lore и топовые скины CS2.',
      uz: 'AWP Dragon Lore va eng sara CS2 skinlariga yuqori stavkali premium quti.',
      en: 'Premium case with high stakes for AWP Dragon Lore and top CS2 skins.',
    },
  },
  howl_tribute_case: {
    name: { ru: '🐺 Вой Охотника (Howl Tribute)', uz: '🐺 Ovchi Uvishi (Howl Tribute)', en: '🐺 Hunter’s Howl Tribute' },
    desc: {
      ru: 'Огненный кейс с повышенным шансом на контрабандный M4A4 Howl и ножи.',
      uz: 'Kontrabanda M4A4 Howl va pichoqlar uchun olovli quti.',
      en: 'Fiery case with boosted odds for Contraband M4A4 Howl and knives.',
    },
  },
  standoff_special: {
    name: { ru: '📱 Standoff 2 Box', uz: '📱 Standoff 2 Qutisi', en: '📱 Standoff 2 Box' },
    desc: {
      ru: 'Фирменный кейс по мотивам популярного мобильного шутера Standoff 2.',
      uz: 'Mashhur mobil shuter Standoff 2 motivlari asosidagi maxsus quti.',
      en: 'Signature case inspired by the popular mobile shooter Standoff 2.',
    },
  },
  billionaire_case: {
    name: { ru: '💎 Apex Billionaire Club', uz: '💎 Apex Milliarderlar Klubi', en: '💎 Apex Billionaire Club' },
    desc: {
      ru: 'Самый дорогой и престижный кейс в мире CS2! В джекпоте: Dragon Lore Royal Gold, StatTrak #661 Scar и Керамбит Blue Gem.',
      uz: 'CS2 olamidagi eng qimmatbaho quti! Jekpotda: Dragon Lore Royal Gold, StatTrak #661 Scar va Karambit Blue Gem.',
      en: 'The most prestigious case in the CS2 universe! Jackpots: Dragon Lore Royal Gold, StatTrak #661 Scar, and Karambit Blue Gem.',
    },
  },
  blue_gem_case: {
    name: { ru: '💙 Blue Gem Masters (#387 & #661)', uz: '💙 Moviy Javohir Ustasi (#387 & #661)', en: '💙 Blue Gem Masters (#387 & #661)' },
    desc: {
      ru: 'Коллекция чистейшей закаленной синевы: Керамбит Blue Gem #387, StatTrak Scar #661 и Нож бродяги Fade.',
      uz: 'Eng toza moviy po‘lat to‘plami: Karambit Blue Gem #387 va StatTrak Scar #661.',
      en: 'Pure Case Hardened azure collection: Karambit Blue Gem #387 and StatTrak Scar #661.',
    },
  },
  emerald_sapphire_case: {
    name: { ru: '✨ Изумруды & Сапфиры (Gem Doppler)', uz: '✨ Zumradlar & Yoqutlar (Gem Doppler)', en: '✨ Emerald & Sapphire (Gem Doppler)' },
    desc: {
      ru: 'Редчайшие драгоценные фазы: Нож-бабочка Emerald, Коготь Sapphire и Керамбит Doppler.',
      uz: 'Eng nodir qimmatbaho fazalar: Zumrad Kapalak, Sapfir Tirnoq va Karambit Doppler.',
      en: 'Rarest gemstone Doppler phases: Butterfly Emerald, Talon Sapphire, and Karambit Doppler.',
    },
  },
  gloves_elite_case: {
    name: { ru: '🧤 Королевские Перчатки (Gloves Master)', uz: '🧤 Qirollik Qo‘lqoplari (Gloves Master)', en: '🧤 Royal Gloves Master' },
    desc: {
      ru: 'Исключительно топовые перчатки CS2: от King Snake и Spearmint до Vice и Pandora’s Box.',
      uz: 'CS2 ning eng zo‘r qo‘lqoplari: King Snake, Spearmint dan Vice va Pandora gacha.',
      en: 'Exclusively top CS2 gloves: from King Snake and Spearmint to Vice and Pandora’s Box.',
    },
  },
  arabesque_gold_case: {
    name: { ru: '👑 Золотая Лихорадка (Gold Arabesque)', uz: '👑 Oltin Isitmasi (Gold Arabesque)', en: '👑 Gold Rush (Arabesque)' },
    desc: {
      ru: 'Золотые шедевры востока: AK-47 Золотая арабеска, M4A1-S В джунгли и M9 Lore.',
      uz: 'Sharq oltin asarlari: AK-47 Oltin arabeska, M4A1-S va M9 Lore.',
      en: 'Golden eastern masterpieces: AK-47 Gold Arabesque, M4A1-S Welcome to the Jungle, and M9 Lore.',
    },
  },
  covert_sniper_case: {
    name: { ru: '🎯 Снайперская Элита (AWP Masters)', uz: '🎯 Merganlar Elitasi (AWP Masters)', en: '🎯 Sniper Elite (AWP Masters)' },
    desc: {
      ru: 'Культовые винтовки AWP: Desert Hydra, Dragon Lore, Gungnir, Asiimov и Wildfire.',
      uz: 'Kult AWP miltiqlari: Desert Hydra, Dragon Lore, Gungnir, Asiimov va Wildfire.',
      en: 'Iconic AWP rifles: Desert Hydra, Dragon Lore, Gungnir, Asiimov, and Wildfire.',
    },
  },
  covert_rifles_case: {
    name: { ru: '🔥 Тяжелый Огонь (Covert Rifles)', uz: '🔥 Qaynoq Olov (Covert Rifles)', en: '🔥 Heavy Firepower (Covert Rifles)' },
    desc: {
      ru: 'Убойная мощь штурмовых винтовок: Howl, Wild Lotus, Vulcan, Bloodsport и Hyper Beast.',
      uz: 'Shturm qurollarining qudrati: Howl, Wild Lotus, Vulcan, Bloodsport va Hyper Beast.',
      en: 'Devastating rifle firepower: Howl, Wild Lotus, Vulcan, Bloodsport, and Hyper Beast.',
    },
  },
  knife_roulette_budget: {
    name: { ru: '🔪 Доступные Ножи (Budget Blades)', uz: '🔪 Qulay Pichoqlar (Budget Blades)', en: '🔪 Budget Blades' },
    desc: {
      ru: 'Бюджетный ножевой кейс: шанс выбить лезвие от Gut Rust до Ursus Doppler!',
      uz: 'Hamyonbop pichoq qutisi: Gut Rust dan Ursus Doppler gacha yutish imkoniyati!',
      en: 'Budget knife case: chance to pull blades from Gut Rust to Ursus Doppler!',
    },
  },
  night_stalker_case: {
    name: { ru: '🌙 Ночной Охотник (Dark Ops)', uz: '🌙 Tungi Ovchi (Dark Ops)', en: '🌙 Night Stalker (Dark Ops)' },
    desc: {
      ru: 'Скрытная ночная спецоперация: темные и неоновые скины плюс шанс на ножевой дроп.',
      uz: 'Tungi maxsus operatsiya: qorong‘i va neon skinlar hamda pichoq yutish imkoni.',
      en: 'Stealth night ops: dark and neon weapon skins plus knife drop odds.',
    },
  },
};

export const getCaseLocalizedName = (caseId: string, defaultName: string, lang: Language = 'ru'): string => {
  const item = CASE_TRANSLATIONS[caseId];
  if (item && item.name && item.name[lang]) {
    return item.name[lang];
  }
  return defaultName;
};

export const getCaseLocalizedDesc = (caseId: string, defaultDesc: string, lang: Language = 'ru'): string => {
  const item = CASE_TRANSLATIONS[caseId];
  if (item && item.desc && item.desc[lang]) {
    return item.desc[lang];
  }
  return defaultDesc;
};

export const t = (key: string, lang: Language = 'ru', fallback?: string): string => {
  const item = TRANSLATIONS[key];
  if (item && item[lang]) {
    return item[lang];
  }
  if (item && item.ru) {
    return item.ru;
  }
  return fallback || key;
};
