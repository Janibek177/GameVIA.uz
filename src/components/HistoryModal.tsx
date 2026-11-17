import React, { useState, useEffect } from 'react';
import { GoldOrder, GoldWithdrawal } from '../server/types';
import { fetchUserOrders, fetchUserWithdrawals } from '../utils/api';
import { UserProfile } from './AuthModal';
import {
  X,
  Clock,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Coins,
  ArrowUpRight,
  ArrowDownLeft,
  Image as ImageIcon,
  UserCheck,
  ShieldAlert,
  RefreshCw,
} from 'lucide-react';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onOpenWithdraw: () => void;
  onOpenTopUp: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onOpenWithdraw,
  onOpenTopUp,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'deposits' | 'withdrawals'>('all');
  const [orders, setOrders] = useState<GoldOrder[]>([]);
  const [withdrawals, setWithdrawals] = useState<GoldWithdrawal[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [previewImage, setPreviewImage] = useState<{ url: string; title: string } | null>(null);

  const userId = currentUser?.uid || currentUser?.email || 'player_guest';

  const loadHistoryData = async () => {
    setIsLoading(true);
    try {
      const [ordData, wdrData] = await Promise.all([
        fetchUserOrders(userId),
        fetchUserWithdrawals(userId),
      ]);
      setOrders(ordData || []);
      setWithdrawals(wdrData || []);
    } catch (err) {
      console.error('Failed to load history data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadHistoryData();
    }
  }, [isOpen, userId]);

  if (!isOpen) return null;

  // Calculate time remaining before 3 hour auto-expiration
  const getTimeRemainingStr = (createdAt: number) => {
    const THREE_HOURS_MS = 3 * 60 * 60 * 1000;
    const elapsed = Date.now() - createdAt;
    const remaining = THREE_HOURS_MS - elapsed;
    if (remaining <= 0) return 'Истёк срок';
    const mins = Math.floor(remaining / 60000);
    const hrs = Math.floor(mins / 60);
    const remMins = mins % 60;
    return `${hrs} ч ${remMins} мин`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-4xl bg-[#0d121f] border border-amber-500/40 rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-[#171328] via-[#101426] to-[#151c2e] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Clock className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white uppercase tracking-wide">История операций</h3>
              <p className="text-xs text-slate-400">
                Все ваши заявки на пополнение баланса и вывод Gold (авто-отмена через 3 часа)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadHistoryData}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer transition"
              title="Обновить историю"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-amber-400' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Subtabs */}
        <div className="px-5 pt-4 bg-[#0d121f] border-b border-slate-800 flex items-center gap-2">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
              activeTab === 'all'
                ? 'bg-amber-500 text-black shadow'
                : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300'
            }`}
          >
            Все ({orders.length + withdrawals.length})
          </button>
          <button
            onClick={() => setActiveTab('deposits')}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'deposits'
                ? 'bg-emerald-500 text-black shadow'
                : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300'
            }`}
          >
            <ArrowDownLeft className="w-3.5 h-3.5" />
            <span>Пополнения ({orders.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('withdrawals')}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'withdrawals'
                ? 'bg-amber-500 text-black shadow'
                : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300'
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Выводы ({withdrawals.length})</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5 scrollbar-none">
          {isLoading ? (
            <div className="text-center py-12 text-slate-400 font-mono text-sm animate-pulse">
              Загрузка истории заявок...
            </div>
          ) : orders.length === 0 && withdrawals.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <div className="w-16 h-16 rounded-full bg-slate-800/60 mx-auto flex items-center justify-center text-slate-500 text-2xl">
                📋
              </div>
              <p className="text-slate-400 text-sm font-semibold">У вас пока нет обработанных или текущих заявок</p>
              <div className="flex justify-center gap-3 pt-2">
                <button
                  onClick={() => {
                    onClose();
                    onOpenTopUp();
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-500 text-black font-extrabold text-xs uppercase cursor-pointer hover:bg-emerald-400"
                >
                  Пополнить Gold
                </button>
                <button
                  onClick={() => {
                    onClose();
                    onOpenWithdraw();
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-500 text-black font-extrabold text-xs uppercase cursor-pointer hover:bg-amber-400"
                >
                  Вывести Gold
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Combine deposits & withdrawals in chronological order */}
              {[
                ...orders.map((o) => ({ type: 'order' as const, data: o, date: o.createdAt })),
                ...withdrawals.map((w) => ({ type: 'withdrawal' as const, data: w, date: w.createdAt })),
              ]
                .filter((item) => {
                  if (activeTab === 'deposits') return item.type === 'order';
                  if (activeTab === 'withdrawals') return item.type === 'withdrawal';
                  return true;
                })
                .sort((a, b) => b.date - a.date)
                .map((item) => {
                  if (item.type === 'order') {
                    const o = item.data as GoldOrder;
                    const isPending = o.status === 'PENDING_PAYMENT' || o.status === 'PENDING_REVIEW';
                    const isApproved = o.status === 'APPROVED';
                    const isCancelled = o.status === 'CANCELLED' || o.status === 'REJECTED';

                    return (
                      <div
                        key={o.id}
                        className="p-4 rounded-2xl bg-[#121726] border border-slate-800 hover:border-slate-700 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                            <ArrowDownLeft className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono text-slate-400">ID: {o.id}</span>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                                Пополнение
                              </span>
                            </div>
                            <h4 className="text-sm font-bold text-white mt-1">
                              +{o.totalGold.toLocaleString('ru-RU')} Gold ({ (o.paymentAmount || o.paymentAmountRub).toLocaleString('ru-RU')} {o.currency === 'UZS' ? 'сум' : '₽'})
                            </h4>
                            <p className="text-xs text-slate-400 mt-0.5">
                              {o.currency === 'UZS' ? 'Карта / Каспи / Перевод' : 'Карта / СБП'} • {new Date(o.createdAt).toLocaleString('ru-RU')}
                            </p>
                          </div>
                        </div>

                        <div className="text-right flex flex-col sm:items-end justify-center">
                          {isPending && (
                            <div className="px-3 py-1 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-xs flex items-center gap-1.5 shrink-0">
                              <Clock className="w-3.5 h-3.5 animate-spin text-amber-400" />
                              <span>В обработке (осталось {getTimeRemainingStr(o.createdAt)})</span>
                            </div>
                          )}
                          {isApproved && (
                            <div className="px-3 py-1 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center gap-1.5 shrink-0">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Зачислено на баланс</span>
                            </div>
                          )}
                          {isCancelled && (
                            <div className="px-3 py-1 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 font-bold text-xs flex items-center gap-1.5 shrink-0">
                              <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                              <span>{o.rejectionReason || 'Отменено'}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  } else {
                    const w = item.data as GoldWithdrawal;
                    const isPending = w.status === 'PENDING_REVIEW' || w.status === 'PROCESSING';
                    const isCompleted = w.status === 'APPROVED' || w.status === 'COMPLETED';
                    const isRejected = w.status === 'REJECTED' || w.status === 'CANCELLED';

                    return (
                      <div
                        key={w.id}
                        className="p-4 rounded-2xl bg-[#121726] border border-slate-800 hover:border-slate-700 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                            <ArrowUpRight className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono text-slate-400">ID: {w.id}</span>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/30">
                                Вывод Gold
                              </span>
                            </div>
                            <h4 className="text-sm font-bold text-white mt-1">
                              -{w.goldAmount.toLocaleString('ru-RU')} Gold ({w.payoutAmount})
                            </h4>
                            <p className="text-xs text-slate-300 mt-0.5">
                              {w.payoutMethodLabel} • Реквизиты: <span className="font-mono text-amber-300">{w.payoutTarget}</span>
                            </p>
                            {w.skinPattern && (
                              <p className="text-[11px] text-cyan-300 font-mono mt-0.5">
                                Паттерн: {w.skinPattern} | Скин: {w.skinName || 'SO2'}
                              </p>
                            )}

                            {/* Image Attachment Badges */}
                            <div className="flex items-center gap-2 mt-2">
                              {w.playerAvatarUrl && (
                                <button
                                  type="button"
                                  onClick={() => setPreviewImage({ url: w.playerAvatarUrl!, title: 'Аватарка игрока' })}
                                  className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[10px] font-bold flex items-center gap-1 cursor-pointer border border-slate-700"
                                >
                                  <UserCheck className="w-3 h-3 text-cyan-400" />
                                  <span>Аватарка</span>
                                </button>
                              )}
                              {w.screenshotUrl && (
                                <button
                                  type="button"
                                  onClick={() => setPreviewImage({ url: w.screenshotUrl!, title: 'Скриншот скина / рынка' })}
                                  className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-[10px] font-bold flex items-center gap-1 cursor-pointer border border-slate-700"
                                >
                                  <ImageIcon className="w-3 h-3 text-amber-400" />
                                  <span>Скриншот скина</span>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="text-right flex flex-col sm:items-end justify-center">
                          {isPending && (
                            <div className="px-3 py-1 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-xs flex items-center gap-1.5 shrink-0">
                              <Clock className="w-3.5 h-3.5 animate-spin text-amber-400" />
                              <span>В обработке (осталось {getTimeRemainingStr(w.createdAt)})</span>
                            </div>
                          )}
                          {isCompleted && (
                            <div className="px-3 py-1 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center gap-1.5 shrink-0">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Выплата завершена</span>
                            </div>
                          )}
                          {isRejected && (
                            <div className="px-3 py-1 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-300 font-bold text-xs flex items-center gap-1.5 shrink-0">
                              <RotateCcw className="w-3.5 h-3.5 text-purple-400" />
                              <span>Отклонено: Gold возвращена на баланс</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  }
                })}
            </div>
          )}
        </div>

        {/* IMAGE PREVIEW LIGHTBOX */}
        {previewImage && (
          <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
            <div className="relative max-w-lg w-full bg-[#121624] border border-slate-700 rounded-3xl p-4 text-center space-y-3">
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="absolute top-3 right-3 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
              <h4 className="text-sm font-bold text-white uppercase">{previewImage.title}</h4>
              <div className="max-h-[60vh] overflow-hidden rounded-2xl bg-black flex items-center justify-center border border-slate-800">
                <img src={previewImage.url} alt="Превью" className="max-h-[55vh] object-contain" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
