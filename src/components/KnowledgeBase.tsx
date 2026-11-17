import React, { useState } from 'react';
import { ShieldCheck, HelpCircle, AlertTriangle, Zap, CheckCircle2, ChevronDown, ChevronUp, Lock, RefreshCw, Flame, Coins } from 'lucide-react';

export const KnowledgeBase: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Что такое GameVia простыми словами?',
      a: 'GameVia — это популярная онлайн-платформа (сторонний сайт-рулетка), предназначенная для открытия кейсов со скинами для игр Counter-Strike 2 (CS2), Standoff 2 и PUBG. Сайт предлагает альтернативу внутриигровым кейсам Valve с собственными наборами скинов, бонусами и режимами.',
    },
    {
      q: 'Реально ли вывести скины с GameVia в Steam или Standoff 2?',
      a: 'Да, в штатном режиме сайт позволяет выводить скины через Steam Trade (автоматические боты или P2P трейды между пользователями), а для Standoff 2 — через передачу внутриигровой валюты (голды) на игровом рынке. Однако могут возникать задержки из-за 7-дневного трейд-бана Valve, отсутствия конкретного скина на складе бота (в этом случае предлагают аналогичный скин или продажу на баланс) или необходимости отыгрыша депозита (вейджер).',
    },
    {
      q: 'В чём главное отличие GameVia от официальных кейсов CS2 в Steam?',
      a: 'В официальном CS2 для кейса нужен ключ ($2.49), а шанс выпадения ножа строго фиксирован Valve (примерно 0.26%, или 1 из ~385 кейсов). На сайтах вроде GameVia стоимость кейса может быть любой (от 10 AC до 10 000 AC), а администрация сайта сама настраивает вероятности и коэффициенты отдачи (RTP) каждого отдельного кейса.',
    },
    {
      q: 'Можно ли стабильно зарабатывать на GameVia?',
      a: 'НЕТ. Любые сайты открытия кейсов имеют встроенную математическую маржу (House Edge). Теоретический возврат игроку (RTP) обычно составляет от 55% до 75%. Это означает, что на дистанции математика гарантированно играет в пользу сайта. Заработать на этом системно невозможно — это форма азартного развлечения.',
    },
    {
      q: 'Почему у стримеров на GameVia постоянно выпадают дорогие ножи?',
      a: 'Многие стримеры и блогеры работают по рекламным контрактам. Платформы могут предоставлять им повышенный баланс для видео, а также в нарезки на YouTube попадают только самые яркие и удачные моменты из многочасовых открытий, создавая иллюзию легкого выигрыша (ошибка выжившего).',
    },
    {
      q: 'Как защитить свой аккаунт Steam от фишинга и скама?',
      a: 'Никогда не переходите по рекламным ссылкам в поиске (Яндекс/Google), так как мошенники создают клоны-зеркала с похожими названиями для кражи Steam Guard и логинов. Проверяйте URL-адрес сайта, включите мобильный Steam Guard Authenticator и никогда не отдавайте свой Steam Web API Key.',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold mb-3">
          <span>⚡</span>
          <span>GameVia · Экспертный гид по кейсам</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white font-display uppercase tracking-wide">
          Всё о кейсах <span className="text-amber-500">GameVia</span>
        </h1>
        <p className="text-sm sm:text-base text-slate-400 mt-2 leading-relaxed">
          Как устроены платформы дропов, механики оружия и кейсов, математика шансов, вывод скинов и правила безопасности.
        </p>
      </div>

      {/* 3 Core Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
        <div className="p-5 rounded-2xl bg-[#111726] border border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-3">
            <Flame className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white text-base">Кейсы и Режимы</h3>
          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
            Сотни кастомных кейсов по CS2 и Standoff 2: «Новичок», «Тайное», «Ножевой», а также режимы Апгрейд, Контракты и Case Battles.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#111726] border border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-3">
            <RefreshCw className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white text-base">Вывод предметов</h3>
          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
            Вывод скинов в Steam через систему трейд-ботов или моментальная продажа скина на баланс сайта с возможностью реинвестирования.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#111726] border border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-3">
            <Coins className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white text-base">Бонусы и Промо</h3>
          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
            Бонусы к пополнению счета (+15–30%), бесплатные ежедневные кейсы, колесо фортуны и промокоды от популярных блогеров.
          </p>
        </div>
      </div>

      {/* Deep Dive Breakdown */}
      <div className="space-y-6 mb-12">
        {/* Section 1: How it works */}
        <div className="rounded-2xl bg-[#0f1422] border border-slate-800 p-6 sm:p-8">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-amber-500">1.</span> Как устроен алгоритм сайта?
          </h2>
          <div className="space-y-3 text-sm text-slate-300 leading-relaxed">
            <p>
              В основе сайта лежит генератор случайных чисел (RNG), который при нажатии кнопки «Открыть» крутит ленту-рулетку. Для каждого скина в кейсе задан определенный вес (вероятность).
            </p>
            <p>
              Дешевые скины (ширпотреб и армейское качество за 10–50 AC) имеют огромный вес (например, 70–85%), в то время как ножи, перчатки или AWP Dragon Lore имеют микро-шанс (от 0.05% до 0.5%).
            </p>
          </div>
        </div>

        {/* Section 2: Economics and House Edge */}
        <div className="rounded-2xl bg-[#0f1422] border border-slate-800 p-6 sm:p-8">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-amber-500">2.</span> Экономика и реальная математика (House Edge)
          </h2>
          <div className="space-y-3 text-sm text-slate-300 leading-relaxed">
            <p>
              Главное, что нужно понимать каждому игроку: <strong>любой сайт с кейсами — это бизнес с гарантированной математической прибылью</strong>.
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-slate-400 pl-2">
              <li>
                <strong className="text-slate-200">RTP (Return To Player):</strong> на сайтах кейсов возврат составляет примерно 60–75%. Для сравнения, в классических казино возврат в слотах обычно 94–97%.
              </li>
              <li>
                <strong className="text-slate-200">Маржа сайта:</strong> от 25% до 40% с каждого открытия кейса остается создателям платформы на покрытие комиссий ботов, маркетинг и прибыль.
              </li>
              <li>
                <strong className="text-slate-200">Вейджер (Отыгрыш):</strong> перед выводом денег или дорогих скинов сайты часто требуют сделать ставок на определенную сумму от внесенного депозита.
              </li>
            </ul>
          </div>
        </div>

        {/* Section 3: Safety and Anti-Scam */}
        <div className="rounded-2xl bg-[#0f1422] border border-red-500/30 p-6 sm:p-8 bg-gradient-to-br from-[#0f1422] to-red-950/20">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <span>3. Безопасность и защита от мошенников</span>
          </h2>
          <div className="space-y-3 text-sm text-slate-300 leading-relaxed">
            <p>
              Популярность бренда GameVia привлекает множество кибермошенников. Главные правила защиты:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-xs font-bold text-amber-400 block">⚠️ Фейковые сайты-клоны</span>
                <span className="text-xs text-slate-400 mt-1 block">
                  Не переходите по рекламе в поисковиках. Фишинговые сайты воруют логины и пароли Steam.
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-xs font-bold text-amber-400 block">⚠️ Steam API Scam</span>
                <span className="text-xs text-slate-400 mt-1 block">
                  Никогда не передавайте сторонним лицам свой Steam Web API ключ — это позволяет подменять трейды.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Accordion FAQ */}
      <div className="rounded-2xl bg-[#0f1422] border border-slate-800 p-6 sm:p-8">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-amber-400" />
          <span>Часто задаваемые вопросы (FAQ)</span>
        </h2>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={index}
                className="rounded-xl border border-slate-800 bg-[#121825] overflow-hidden transition"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="w-full p-4 text-left flex items-center justify-between gap-4 font-semibold text-sm text-white hover:text-amber-400 transition cursor-pointer"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-amber-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                  )}
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 pt-1 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/60 bg-[#0c101a]">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
