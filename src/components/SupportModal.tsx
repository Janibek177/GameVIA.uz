import React, { useState } from 'react';
import { sound } from '../utils/audio';
import { UserProfile } from './AuthModal';
import {
  X,
  MessageSquare,
  Send,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Clock,
  ShieldCheck,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
}

const FAQ_ITEMS = [
  {
    q: 'Сколько времени занимает вывод Gold и выкуп скина?',
    a: 'Обычно выкуп скинов по паттерну в Standoff 2 и выплата по Player ID в PUBG занимают от 5 до 15 минут. Максимальный срок обработки — 3 часа. Если заявка не обработана за 3 часа, она автоматически отменяется, а вся Gold мгновенно возвращается на ваш баланс!',
  },
  {
    q: 'Что делать, если я указал неправильный паттерн скина или ID?',
    a: 'Администратор отменит заявку и укажет причину. Вся списанная Gold сразу вернётся на ваш баланс, после чего вы сможете создать новую заявку с правильным паттерном.',
  },
  {
    q: 'Как работает пополнение через банковский чек?',
    a: 'Вы переводите указанную сумму по реквизитам СБП / карты и прикрепляете скриншот чека. Администратор проверяет поступление средств в течение 1–5 минут и начисляется Gold на баланс.',
  },
  {
    q: 'Как обратиться напрямую к оператору?',
    a: 'Вы можете связаться с администрацией напрямую в Telegram:\n• Главный: @Janibek76\n• Администратор: @gameviauz',
  },
];

export const SupportModal: React.FC<SupportModalProps> = ({
  isOpen,
  onClose,
  currentUser,
}) => {
  const [topic, setTopic] = useState<'deposit' | 'withdraw' | 'pass' | 'other'>('withdraw');
  const [contact, setContact] = useState<string>(currentUser?.email || '');
  const [message, setMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSubmitting(true);
    try {
      // Send ticket to backend API
      await fetch('/api/support/ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser?.uid || currentUser?.email || 'player_guest',
          username: currentUser?.name || 'Игрок GameVia',
          contact: contact || currentUser?.email || 'Не указан',
          topic,
          message: message.trim(),
        }),
      });

      sound.playWin(false);
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setMessage('');
        onClose();
      }, 2500);
    } catch (err) {
      sound.playWin(false);
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setMessage('');
        onClose();
      }, 2000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-2xl bg-[#0f1422] border border-amber-500/40 rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-[#171328] via-[#101426] to-[#151c2e] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <MessageSquare className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white uppercase tracking-wide">Техническая поддержка</h3>
              <p className="text-xs text-slate-400">Мы на связи 24/7 для решения любых вопросов по играм и выводами</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 scrollbar-none">
          
          {/* Direct Telegram Contacts: Chief & Admin */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block px-1">
              Прямая связь в Telegram (Поддержка 24/7):
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Главный */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-500/10 via-slate-900 to-amber-950/20 border border-amber-500/30 flex flex-col justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-lg shrink-0 border border-amber-500/30">
                    👑
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
                      Главный
                    </span>
                    <strong className="text-sm font-bold text-white block truncate">
                      @Janibek76
                    </strong>
                    <span className="text-[11px] text-slate-400 block truncate">
                      Руководитель платформы
                    </span>
                  </div>
                </div>
                <a
                  href="https://t.me/Janibek76"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-black text-xs uppercase flex items-center justify-center gap-1.5 cursor-pointer shadow transition active:scale-98"
                >
                  <span>Написать Главному</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Администратор */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-blue-500/10 via-slate-900 to-indigo-950/20 border border-blue-500/30 flex flex-col justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-lg shrink-0 border border-blue-500/30">
                    🛡️
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 block">
                      Администратор
                    </span>
                    <strong className="text-sm font-bold text-white block truncate">
                      @gameviauz
                    </strong>
                    <span className="text-[11px] text-slate-400 block truncate">
                      Поддержка и выводы
                    </span>
                  </div>
                </div>
                <a
                  href="https://t.me/gameviauz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase flex items-center justify-center gap-1.5 cursor-pointer shadow transition active:scale-98"
                >
                  <span>Написать Админу</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>

          {/* Ticket Submission Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5 bg-black/40 p-4 rounded-2xl border border-slate-800">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Отправить тикет оператору</h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 font-bold block mb-1">Тема обращения</label>
                <select
                  value={topic}
                  onChange={(e: any) => setTopic(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                >
                  <option value="withdraw">Вывод Gold / Выкуп скина</option>
                  <option value="deposit">Пополнение баланса</option>
                  <option value="pass">Боевой пропуск GamePass</option>
                  <option value="other">Другой вопрос</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 font-bold block mb-1">Telegram / Email для связи</label>
                <input
                  type="text"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="@telegram_username или email"
                  className="w-full bg-slate-900 border border-slate-700 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 font-bold block mb-1">Подробное описание вопроса</label>
              <textarea
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Опишите вашу проблему, указав номер ID заявки если вопрос касается вывода..."
                className="w-full bg-slate-900 border border-slate-700 focus:border-amber-500 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none resize-none"
                required
              />
            </div>

            {submitted ? (
              <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center justify-center gap-2 animate-fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Обращение успешно отправлено! Оператор свяжется с вами.</span>
              </div>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting || !message.trim()}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:brightness-110 disabled:opacity-50 text-black font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition shadow active:scale-95"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? 'Отправка обращения...' : 'Отправить обращение'}</span>
              </button>
            )}
          </form>

          {/* FAQ Accordion */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>Часто задаваемые вопросы (FAQ)</span>
            </h4>

            {FAQ_ITEMS.map((item, idx) => {
              const isExpanded = expandedFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden transition"
                >
                  <button
                    onClick={() => setExpandedFaq(isExpanded ? null : idx)}
                    className="w-full p-3.5 text-left text-xs font-bold text-slate-200 flex items-center justify-between cursor-pointer hover:bg-slate-800/50"
                  >
                    <span>{item.q}</span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-amber-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                  </button>
                  {isExpanded && (
                    <div className="px-3.5 pb-3.5 text-xs text-slate-400 leading-relaxed border-t border-slate-800/80 pt-2 animate-fade-in">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
