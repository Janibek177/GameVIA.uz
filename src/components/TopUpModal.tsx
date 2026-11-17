import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { sound } from '../utils/audio';
import { UserProfile } from './AuthModal';
import { GoldOrder, PublicConfig } from '../server/types';
import {
  fetchPublicConfig,
  createGoldOrder,
  uploadOrderReceipt,
  fetchUserOrders,
  fetchOrder,
} from '../utils/api';
import {
  X,
  Coins,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Upload,
  Clock,
  History,
  ShieldCheck,
  RefreshCw,
  Eye,
  CreditCard,
  Send,
  Sparkles,
} from 'lucide-react';

interface TopUpModalProps {
  onClose: () => void;
  onAddBalance: (amount: number) => void;
  currentUser?: UserProfile | null;
  currency?: 'RUB' | 'UZS';
}

const PRESET_AMOUNTS = [
  { base: 500, label: '500 Gold' },
  { base: 1000, label: '1 000 Gold' },
  { base: 2000, label: '2 000 Gold' },
  { base: 5000, label: '5 000 Gold' },
];

export const TopUpModal: React.FC<TopUpModalProps> = ({
  onClose,
  onAddBalance,
  currentUser,
  currency = 'RUB',
}) => {
  const [activeTab, setActiveTab] = useState<'purchase' | 'history'>('purchase');
  const [step, setStep] = useState<'select' | 'payment' | 'receipt' | 'status'>('select');

  // Config from backend
  const [config, setConfig] = useState<PublicConfig>({
    exchangeRate: 1.0,
    minPurchaseGold: 50,
    maxPurchaseGold: 500000,
    minWithdrawGold: 50,
    maxWithdrawGold: 100000,
    recipient: {
      cardNumber: '9860 1701 1354 8268',
      cardHolder: 'Musallam Abidov',
      bankName: 'Humo',
      cardNumberVisa: '4023 0605 0973 3761',
      bankNameVisa: 'Visa',
      sbpPhone: '200205068',
    },
    botUsername: 'GamviaBot',
  });

  // Purchase inputs
  const [goldInput, setGoldInput] = useState<string>('1000');
  const [inputError, setInputError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Active Order & Receipt
  const [currentOrder, setCurrentOrder] = useState<GoldOrder | null>(null);
  const [receiptBase64, setReceiptBase64] = useState<string | null>(null);
  const [receiptFileName, setReceiptFileName] = useState<string>('');
  const [receiptError, setReceiptError] = useState<string>('');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isCredited, setIsCredited] = useState<boolean>(false);

  // Orders History
  const [historyOrders, setHistoryOrders] = useState<GoldOrder[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const userId = currentUser?.uid || currentUser?.email || 'player_guest';
  const username = currentUser?.name || 'Игрок GameVia';

  // Load public config
  useEffect(() => {
    fetchPublicConfig()
      .then((cfg) => {
        setConfig(cfg);
      })
      .catch((err) => console.warn('Could not load backend config:', err));
  }, []);

  // Filter out any obsolete placeholders so they never display
  const isStale = (s?: string) => !s || s.includes('любое') || s.includes('потом изменишь') || s.includes('JANIBEK');
  const effectiveCardHumo = !isStale(config.recipient?.cardNumber) ? config.recipient.cardNumber : '9860 1701 1354 8268';
  const effectiveCardVisa = config.recipient?.cardNumberVisa || '4023 0605 0973 3761';
  const effectiveHolder = !isStale(config.recipient?.cardHolder) ? config.recipient.cardHolder : 'Musallam Abidov';
  const effectivePhone = (config.recipient?.sbpPhone && !config.recipient.sbpPhone.includes('+998 913690778')) ? config.recipient.sbpPhone : '200205068';

  // Load user order history
  const loadHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const orders = await fetchUserOrders(userId);
      setHistoryOrders(orders);
    } catch (err) {
      console.warn('Failed to fetch orders history:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'history') {
      loadHistory();
    }
  }, [activeTab]);

  // Polling active order status if PENDING_REVIEW or PENDING_PAYMENT
  useEffect(() => {
    if (!currentOrder || currentOrder.status === 'APPROVED' || currentOrder.status === 'REJECTED') {
      return;
    }

    const interval = setInterval(async () => {
      try {
        const updated = await fetchOrder(currentOrder.id);
        if (updated) {
          setCurrentOrder(updated);

          if (updated.status === 'APPROVED' && !isCredited) {
            setIsCredited(true);
            sound.playWin(true);
            confetti({
              particleCount: 100,
              spread: 80,
              origin: { y: 0.5 },
              colors: ['#f59e0b', '#10b981', '#3b82f6', '#ffffff'],
            });
          } else if (updated.status === 'REJECTED') {
            sound.playFail();
          }
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [currentOrder, isCredited]);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    sound.playTick();
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Step 1: Create Order on Server
  const handleCreateOrder = async (amount: number) => {
    if (amount < config.minPurchaseGold) {
      setInputError(`Минимальная сумма покупки — ${config.minPurchaseGold} Gold`);
      return;
    }
    if (amount > config.maxPurchaseGold) {
      setInputError(`Максимальная сумма покупки — ${config.maxPurchaseGold.toLocaleString('ru-RU')} Gold`);
      return;
    }
    setInputError('');
    setIsSubmitting(true);
    sound.playTick();

    try {
      const order = await createGoldOrder({
        userId,
        username,
        userEmail: currentUser?.email,
        goldAmount: amount,
        currency,
      });
      setCurrentOrder(order);
      setStep('payment');
    } catch (err: any) {
      setInputError(err.message || 'Ошибка создания заказа');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 2 -> Step 3: Handle receipt selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setReceiptError('Поддерживаются только изображения (JPG, PNG, WEBP)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setReceiptError('Размер файла не должен превышать 5 МБ');
      return;
    }

    setReceiptError('');
    setReceiptFileName(file.name);

    const reader = new FileReader();
    reader.onload = () => {
      setReceiptBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Step 3 -> Step 4: Submit Receipt to Server and Telegram Bot
  const handleSubmitReceipt = async () => {
    if (!currentOrder || !receiptBase64) {
      setReceiptError('Пожалуйста, прикрепите чек перед отправкой');
      return;
    }

    setIsSubmitting(true);
    setReceiptError('');
    sound.playTick();

    try {
      const updated = await uploadOrderReceipt(currentOrder.id, receiptBase64);
      setCurrentOrder(updated);
      setStep('status');
      sound.playOpen();
    } catch (err: any) {
      setReceiptError(err.message || 'Ошибка отправки чека');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper calculations for custom amount
  const parsedGold = parseInt(goldInput.replace(/\D/g, ''), 10) || 0;
  const bonusGold = 0;
  const totalGoldCalc = parsedGold;
  
  const paymentAmountCalc = currency === 'UZS'
    ? Math.round(parsedGold * config.exchangeRate * 135)
    : Math.round(parsedGold * config.exchangeRate);
  const currencyLabel = currency === 'UZS' ? 'сум' : '₽';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-lg bg-[#0f1422] border border-slate-700/80 rounded-3xl shadow-2xl p-5 sm:p-6 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Glow corner */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 shadow-inner">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-lg text-white font-display uppercase tracking-wide">
                Покупка Gold
              </h3>
              <p className="text-[11px] text-slate-400">
                Курс: 1 Gold = {config.exchangeRate} ₽ ({Math.round(config.exchangeRate * 135)} сум) • Зачисление после проверки
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white cursor-pointer transition hover:bg-slate-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs (Purchase vs History) */}
        <div className="flex items-center gap-2 mt-3 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold">
          <button
            onClick={() => setActiveTab('purchase')}
            className={`flex-1 py-1.5 rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'purchase'
                ? 'bg-amber-500 text-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Купить Gold</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-1.5 rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'history'
                ? 'bg-amber-500 text-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>История заказов</span>
          </button>
        </div>

        {/* TAB 1: PURCHASE FLOW */}
        {activeTab === 'purchase' && (
          <div className="overflow-y-auto mt-4 space-y-4 pr-1 scrollbar-thin">
            {/* STEP 1: SELECT AMOUNT */}
            {step === 'select' && (
              <div className="space-y-4">
                {/* Custom Amount Form */}
                <div className="p-4 rounded-2xl bg-[#141b2a] border border-amber-500/30 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-300">Введите сумму Gold:</span>
                    <span className="text-amber-400 font-mono font-bold">
                      1:1 без скрытых комиссий
                    </span>
                  </div>

                  <div className="relative">
                    <input
                      type="number"
                      min={config.minPurchaseGold}
                      max={config.maxPurchaseGold}
                      value={goldInput}
                      onChange={(e) => {
                        setGoldInput(e.target.value);
                        if (inputError) setInputError('');
                      }}
                      className="w-full bg-[#0a0e17] border border-slate-700 rounded-xl px-4 py-3 text-white font-mono text-base font-bold placeholder:text-slate-500 focus:outline-none focus:border-amber-500 shadow-inner"
                      placeholder="Например: 1000"
                    />
                    <span className="absolute right-3.5 top-3 text-amber-400 font-black text-xs font-mono pointer-events-none">
                      GOLD
                    </span>
                  </div>

                  {inputError && (
                    <div className="text-xs text-rose-400 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{inputError}</span>
                    </div>
                  )}

                  {parsedGold > 0 && (
                    <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs flex items-center justify-between">
                      <div>
                        <span className="text-slate-400 block text-[11px]">К оплате в банке:</span>
                        <strong className="text-white font-mono text-sm">
                          {paymentAmountCalc.toLocaleString('ru-RU')} {currencyLabel}
                        </strong>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-400 block text-[11px]">Получите на баланс:</span>
                        <strong className="text-amber-400 font-mono text-sm">
                          +{totalGoldCalc.toLocaleString('ru-RU')} Gold
                        </strong>
                      </div>
                    </div>
                  )}

                  <button
                    disabled={parsedGold < config.minPurchaseGold || isSubmitting}
                    onClick={() => handleCreateOrder(parsedGold)}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-40 text-black font-black text-sm flex items-center justify-center gap-2 transition cursor-pointer shadow-lg shadow-amber-500/20 active:scale-98"
                  >
                    <span>Перейти к оплате</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Preset Fast Packages */}
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2 px-1">
                    Или выберите готовый пакет:
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {PRESET_AMOUNTS.map(({ base, label }) => {
                      const priceAmt = currency === 'UZS'
                        ? Math.round(base * config.exchangeRate * 135)
                        : Math.round(base * config.exchangeRate);
                      return (
                        <div
                          key={base}
                          onClick={() => handleCreateOrder(base)}
                          className="p-3 rounded-xl bg-[#131b2b] hover:bg-[#182338] border border-slate-800 hover:border-amber-500/50 transition cursor-pointer group flex flex-col justify-between"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-mono font-bold text-white">
                              {label}
                            </span>
                          </div>
                          <div className="mt-2 text-right">
                            <span className="text-[10px] text-slate-400 block">
                              +{base.toLocaleString('ru-RU')} Gold
                            </span>
                            <strong className="text-amber-400 font-mono text-xs">
                              {priceAmt.toLocaleString('ru-RU')} {currencyLabel}
                            </strong>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Active Payment Details Preview Banner */}
                <div className="p-3 rounded-xl bg-[#0d131f] border border-slate-800/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] text-slate-400 block">Карты для оплаты (Humo & Visa):</span>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-white font-mono text-xs">
                        <span className="text-amber-300 font-bold">Humo: {effectiveCardHumo}</span>
                        <span className="hidden sm:inline text-slate-600">|</span>
                        <span className="text-sky-300 font-bold">Visa: {effectiveCardVisa}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: PAYMENT REQUISITES & INSTRUCTIONS */}
            {step === 'payment' && currentOrder && (
              <div className="space-y-4">
                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400 block">
                      Номер вашего заказа:
                    </span>
                    <strong className="text-sm font-mono text-white">{currentOrder.id}</strong>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">Сумма к переводу:</span>
                    <strong className="text-base font-mono text-emerald-400 font-black">
                      {(currentOrder.paymentAmount || currentOrder.paymentAmountRub).toLocaleString('ru-RU')} {currentOrder.currency === 'UZS' ? 'сум' : '₽'}
                    </strong>
                  </div>
                </div>

                {/* Recipient Details Card */}
                <div className="p-4 rounded-2xl bg-[#131a28] border border-slate-700/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-amber-400" />
                      <span>Выберите карту для перевода (Humo или Visa):</span>
                    </div>
                  </div>

                  {/* Card 1: HUMO */}
                  <div className="p-3 rounded-xl bg-slate-900 border border-amber-500/30 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] font-black uppercase px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          HUMO
                        </span>
                        <span className="text-[10px] text-slate-400 truncate">Узбекистан (UZS / Humo)</span>
                      </div>
                      <strong className="text-sm font-mono text-white tracking-wider block">
                        {effectiveCardHumo}
                      </strong>
                    </div>
                    <button
                      onClick={() => handleCopy(effectiveCardHumo.replace(/\s/g, ''), 'card_humo')}
                      className="px-2.5 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-bold transition flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      {copiedField === 'card_humo' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedField === 'card_humo' ? 'Скопировано!' : 'Копировать Humo'}</span>
                    </button>
                  </div>

                  {/* Card 2: VISA */}
                  <div className="p-3 rounded-xl bg-slate-900 border border-sky-500/30 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] font-black uppercase px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                          VISA
                        </span>
                        <span className="text-[10px] text-slate-400 truncate">Международная / СНГ</span>
                      </div>
                      <strong className="text-sm font-mono text-white tracking-wider block">
                        {effectiveCardVisa}
                      </strong>
                    </div>
                    <button
                      onClick={() => handleCopy(effectiveCardVisa.replace(/\s/g, ''), 'card_visa')}
                      className="px-2.5 py-1.5 rounded-lg bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 text-sky-300 text-xs font-bold transition flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      {copiedField === 'card_visa' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedField === 'card_visa' ? 'Скопировано!' : 'Копировать Visa'}</span>
                    </button>
                  </div>

                  {/* Recipient Holder and ID */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Получатель:</span>
                      <strong className="text-slate-200">{effectiveHolder}</strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 block">ID / СБП получателя:</span>
                        <strong className="font-mono text-slate-200">{effectivePhone}</strong>
                      </div>
                      <button
                        onClick={() => handleCopy(effectivePhone, 'phone')}
                        className="p-1 rounded bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
                        title="Копировать ID"
                      >
                        {copiedField === 'phone' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-blue-950/20 border border-blue-500/30 text-xs text-blue-200 space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-white">
                    <span>📌</span>
                    <span>Инструкция по оплате:</span>
                  </div>
                  <p>1. Переведите точную сумму <b>{(currentOrder.paymentAmount || currentOrder.paymentAmountRub).toLocaleString('ru-RU')} {currentOrder.currency === 'UZS' ? 'сум' : '₽'}</b> на указанную карту.</p>
                  <p>2. Сохраните чек/квитанцию перевода (скриншот или изображение).</p>
                  <p>3. Нажмите кнопку ниже и прикрепите чек для мгновенной проверки администратором.</p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setStep('select')}
                    className="py-2.5 px-4 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-bold transition cursor-pointer"
                  >
                    Назад
                  </button>
                  <button
                    onClick={() => setStep('receipt')}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-black text-sm flex items-center justify-center gap-2 transition cursor-pointer shadow-lg shadow-emerald-500/20 active:scale-98"
                  >
                    <span>Я оплатил, загрузить чек</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: UPLOAD RECEIPT */}
            {step === 'receipt' && currentOrder && (
              <div className="space-y-4">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Заказ: <b className="text-white font-mono">{currentOrder.id}</b></span>
                  <span className="text-slate-400">Сумма: <b className="text-amber-400 font-mono">{(currentOrder.paymentAmount || currentOrder.paymentAmountRub).toLocaleString('ru-RU')} {currentOrder.currency === 'UZS' ? 'сум' : '₽'}</b></span>
                </div>

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="p-6 rounded-2xl border-2 border-dashed border-slate-700 hover:border-amber-500/60 bg-[#121826] hover:bg-[#161f30] text-center cursor-pointer transition flex flex-col items-center justify-center gap-2"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={handleFileChange}
                  />

                  {receiptBase64 ? (
                    <div className="space-y-2 w-full">
                      <img
                        src={receiptBase64}
                        alt="Чек"
                        className="max-h-48 mx-auto rounded-xl border border-emerald-500/40 object-contain shadow-md"
                      />
                      <span className="text-xs text-emerald-400 font-bold block">
                        ✓ Чек выбран: {receiptFileName} (нажмите, чтобы изменить)
                      </span>
                    </div>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
                        <Upload className="w-6 h-6" />
                      </div>
                      <span className="text-sm font-bold text-white block">
                        Нажмите, чтобы выбрать скриншот или фото чека
                      </span>
                      <span className="text-xs text-slate-400">
                        Поддерживаются форматы JPG, PNG, WEBP (до 5 МБ)
                      </span>
                    </>
                  )}
                </div>

                {receiptError && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{receiptError}</span>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => setStep('payment')}
                    className="py-2.5 px-4 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-bold transition cursor-pointer"
                  >
                    Назад
                  </button>
                  <button
                    disabled={!receiptBase64 || isSubmitting}
                    onClick={handleSubmitReceipt}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-40 text-black font-black text-sm flex items-center justify-center gap-2 transition cursor-pointer shadow-lg shadow-amber-500/20 active:scale-98"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isSubmitting ? 'Отправка...' : 'Отправить чек на проверку'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: ORDER STATUS TRACKER */}
            {step === 'status' && currentOrder && (
              <div className="space-y-4 text-center py-2 animate-fade-in">
                {currentOrder.status === 'PENDING_REVIEW' && (
                  <div className="p-6 rounded-3xl bg-blue-950/30 border border-blue-500/40 space-y-3">
                    <div className="w-14 h-14 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center mx-auto border border-blue-500/40 animate-pulse">
                      <Clock className="w-7 h-7" />
                    </div>
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 font-mono inline-block">
                      PENDING_REVIEW • В ОБРАБОТКЕ
                    </span>
                    <h4 className="text-lg font-black text-white">Чек передан администратору</h4>
                    <p className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto">
                      Уведомление с вашим чеком отправлено в Telegram-бот администратора (<b>@{config.botUsername}</b>).
                      После подтверждения поступления средств в банковском приложении Gold зачислится автоматически!
                    </p>
                    <div className="pt-2 text-[11px] text-slate-400 font-mono flex items-center justify-center gap-2">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
                      <span>Авто-проверка статуса каждые 2.5 секунды...</span>
                    </div>
                  </div>
                )}

                {currentOrder.status === 'APPROVED' && (
                  <div className="p-6 rounded-3xl bg-emerald-950/40 border border-emerald-500/50 space-y-3 animate-fade-in shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                    <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono inline-block">
                      APPROVED • ОПЛАТА ПОДТВЕРЖДЕНА
                    </span>
                    <h4 className="text-xl font-black text-white">Платеж успешно зачислен!</h4>
                    <p className="text-2xl font-black font-mono text-amber-400">
                      +{currentOrder.totalGold.toLocaleString('ru-RU')} Gold
                    </p>
                    <p className="text-xs text-emerald-300">
                      Баланс вашего аккаунта обновлён. Приятной игры в GameVia!
                    </p>
                    <button
                      onClick={onClose}
                      className="mt-3 px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs uppercase cursor-pointer transition shadow-md"
                    >
                      Отлично, закрыть окно
                    </button>
                  </div>
                )}

                {currentOrder.status === 'REJECTED' && (
                  <div className="p-6 rounded-3xl bg-rose-950/40 border border-rose-500/50 space-y-3 animate-fade-in">
                    <div className="w-14 h-14 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/40">
                      <AlertCircle className="w-8 h-8" />
                    </div>
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 font-mono inline-block">
                      REJECTED • ОТКЛОНЕНО
                    </span>
                    <h4 className="text-lg font-black text-white">Платёж не подтверждён</h4>
                    <p className="text-xs text-rose-200">
                      {currentOrder.rejectionReason || 'Администратор не обнаружил поступления указанной суммы в банке.'}
                    </p>
                    <button
                      onClick={() => setStep('select')}
                      className="mt-2 px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs cursor-pointer transition"
                    >
                      Попробовать снова
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ORDERS HISTORY */}
        {activeTab === 'history' && (
          <div className="overflow-y-auto mt-4 space-y-2 pr-1 scrollbar-thin">
            {isLoadingHistory ? (
              <div className="py-12 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                <span>Загрузка истории заказов...</span>
              </div>
            ) : historyOrders.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500">
                <span>У вас пока нет заказов на покупку Gold.</span>
              </div>
            ) : (
              historyOrders.map((ord) => {
                const isApp = ord.status === 'APPROVED';
                const isRej = ord.status === 'REJECTED';
                const isRev = ord.status === 'PENDING_REVIEW';
                return (
                  <div
                    key={ord.id}
                    onClick={() => {
                      setCurrentOrder(ord);
                      setActiveTab('purchase');
                      setStep(ord.status === 'PENDING_PAYMENT' ? 'payment' : 'status');
                    }}
                    className="p-3 rounded-xl bg-slate-900/70 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 transition cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-white">{ord.id}</span>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded font-mono ${
                            isApp
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : isRej
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : isRev
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          {ord.status}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 mt-0.5 block">
                        {new Date(ord.createdAt).toLocaleString('ru-RU')}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="font-mono font-bold text-xs text-amber-400 block">
                        +{ord.totalGold.toLocaleString('ru-RU')} Gold
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {(ord.paymentAmount || ord.paymentAmountRub).toLocaleString('ru-RU')} {ord.currency === 'UZS' ? 'сум' : '₽'}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Security badge footer */}
        <div className="mt-auto pt-3 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Верификация через Telegram-бота @{config.botUsername}</span>
          </div>
          <button
            onClick={() => loadHistory()}
            className="hover:text-slate-300 flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Обновить</span>
          </button>
        </div>
      </div>
    </div>
  );
};
