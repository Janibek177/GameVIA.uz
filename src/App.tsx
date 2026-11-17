import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { sound } from './utils/audio';
import { CASES } from './data/cases';
import { ALL_SKINS } from './data/skins';
import { CaseDefinition, InventoryItem, Skin, DropEvent } from './types';
import { Navbar, NavTabType } from './components/Navbar';
import { LiveDropsBar } from './components/LiveDropsBar';
import { CaseCard } from './components/CaseCard';
import { CaseOpenerModal } from './components/CaseOpenerModal';
import { CrashGame } from './components/CrashGame';
import { MinesGame } from './components/MinesGame';
import { TowerGame } from './components/TowerGame';
import { StairsGame } from './components/StairsGame';
import { UpgradeGame } from './components/UpgradeGame';
import { ContractGame } from './components/ContractGame';
import { InventoryView } from './components/InventoryView';
import { MathAnalyzer } from './components/MathAnalyzer';
import { KnowledgeBase } from './components/KnowledgeBase';
import { PromoModal } from './components/PromoModal';
import { TopUpModal } from './components/TopUpModal';
import { WithdrawModal } from './components/WithdrawModal';
import { AuthModal, UserProfile } from './components/AuthModal';
import { GamePassModal } from './components/GamePassModal';
import { HistoryModal } from './components/HistoryModal';
import { SupportModal } from './components/SupportModal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { Language, t } from './utils/i18n';
import {
  fetchUserBalance,
  syncUserBalanceWithServer,
  updateUserBalanceOnServer,
  fetchUserAccountState,
  saveUserAccountState,
} from './utils/api';
import { auth, onAuthStateChanged, signOut } from './firebase';
import { Flame, Rocket, Zap, Layers, Sparkles, HelpCircle, BarChart3, Package, ArrowRight, Gift, Trophy, ShieldCheck, Users, Crown, Lock, LogIn, Youtube, Send } from 'lucide-react';

const INITIAL_INVENTORY: InventoryItem[] = [
  {
    ...ALL_SKINS[4], // Glock-18 Ястреб
    instanceId: 'init-1',
    acquiredAt: Date.now() - 3600000,
    fromCase: 'Стартовый набор',
  },
  {
    ...ALL_SKINS[2], // MAG-7
    instanceId: 'init-2',
    acquiredAt: Date.now() - 7200000,
    fromCase: 'Стартовый набор',
  },
  {
    ...ALL_SKINS[7], // Deagle Oxide
    instanceId: 'init-3',
    acquiredAt: Date.now() - 10800000,
    fromCase: 'Стартовый набор',
  },
];

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('gamevia_user') || localStorage.getItem('gameearn_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('gamevia_lang') as Language) || 'ru';
  });

  const handleLanguageChange = (l: Language) => {
    setLanguage(l);
    localStorage.setItem('gamevia_lang', l);
  };

  const [balance, setBalance] = useState<number>(() => {
    const savedUser = localStorage.getItem('gamevia_user');
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser);
        const userKey = u?.uid || u?.email;
        if (userKey) {
          const accBal = localStorage.getItem(`gamevia_acc_${userKey}_balance`);
          if (accBal !== null && !isNaN(Number(accBal))) return Number(accBal);
        }
      } catch {}
      return 0;
    }
    return 0; // Guest initial balance after logout
  });

  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    const savedUser = localStorage.getItem('gamevia_user');
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser);
        const userKey = u?.uid || u?.email;
        if (userKey) {
          const accInv = localStorage.getItem(`gamevia_acc_${userKey}_inventory`);
          if (accInv !== null) {
            const parsed = JSON.parse(accInv);
            if (Array.isArray(parsed)) return parsed;
          }
        }
      } catch {}
      return INITIAL_INVENTORY;
    }
    return []; // Guest initial inventory after logout
  });

  const [activeTab, setActiveTab] = useState<NavTabType>('cases');
  const [caseCategory, setCaseCategory] = useState<'all' | 'cheap' | 'popular' | 'premium' | 'standoff' | 'special' | 'knives'>('all');
  const [selectedCaseToOpen, setSelectedCaseToOpen] = useState<CaseDefinition | null>(null);
  const [itemForUpgrade, setItemForUpgrade] = useState<InventoryItem | null>(null);

  const [currency, setCurrency] = useState<'RUB' | 'UZS'>(() => {
    return (localStorage.getItem('gamevia_currency') as 'RUB' | 'UZS') || 'RUB';
  });

  const [liveDrops, setLiveDrops] = useState<DropEvent[]>([]);

  const handleCurrencyChange = (c: 'RUB' | 'UZS') => {
    setCurrency(c);
    localStorage.setItem('gamevia_currency', c);
  };

  const addRealDrop = (skin: Skin, caseName: string = 'GameVia') => {
    const dropName = currentUser?.name || 'Игрок GameVia';
    const newDrop: DropEvent = {
      id: `drop-real-${Date.now()}-${Math.random()}`,
      username: dropName,
      avatarSeed: currentUser?.email || 'player',
      skin,
      caseName,
      timestamp: Date.now(),
    };
    setLiveDrops((prev) => [newDrop, ...prev.slice(0, 19)]);
  };

  const [isPromoOpen, setIsPromoOpen] = useState<boolean>(false);
  const [isTopUpOpen, setIsTopUpOpen] = useState<boolean>(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState<boolean>(false);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [isPassOpen, setIsPassOpen] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [isSupportOpen, setIsSupportOpen] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [usedCodes, setUsedCodes] = useState<string[]>(() => {
    const savedUser = localStorage.getItem('gamevia_user');
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser);
        const userKey = u?.uid || u?.email;
        if (userKey) {
          const accCodes = localStorage.getItem(`gamevia_acc_${userKey}_codes`);
          if (accCodes) return JSON.parse(accCodes);
        }
      } catch {}
    }
    return [];
  });

  const [freeCaseVouchers, setFreeCaseVouchers] = useState<Record<string, number>>(() => {
    const savedUser = localStorage.getItem('gamevia_user');
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser);
        const userKey = u?.uid || u?.email;
        if (userKey) {
          const accV = localStorage.getItem(`gamevia_acc_${userKey}_vouchers`);
          if (accV) return JSON.parse(accV);
        }
      } catch {}
    }
    return {};
  });

  const [lastDailyOpenTime, setLastDailyOpenTime] = useState<number>(() => {
    const savedUser = localStorage.getItem('gamevia_user');
    const userKey = savedUser ? (JSON.parse(savedUser)?.uid || JSON.parse(savedUser)?.email) : 'guest';
    const saved = localStorage.getItem(`gamevia_acc_${userKey}_daily_open`);
    return saved ? Number(saved) : 0;
  });

  const [lastTgOpenTime, setLastTgOpenTime] = useState<number>(() => {
    const savedUser = localStorage.getItem('gamevia_user');
    const userKey = savedUser ? (JSON.parse(savedUser)?.uid || JSON.parse(savedUser)?.email) : 'guest';
    const saved = localStorage.getItem(`gamevia_acc_${userKey}_tg_open`);
    return saved ? Number(saved) : 0;
  });

  const [isTgSubscribed, setIsTgSubscribed] = useState<boolean>(() => {
    const savedUser = localStorage.getItem('gamevia_user');
    const userKey = savedUser ? (JSON.parse(savedUser)?.uid || JSON.parse(savedUser)?.email) : 'guest';
    return localStorage.getItem(`gamevia_acc_${userKey}_tg_sub`) === 'true';
  });

  const handleDailyCaseOpened = () => {
    const now = Date.now();
    setLastDailyOpenTime(now);
    const userKey = currentUser?.uid || currentUser?.email || 'guest';
    localStorage.setItem(`gamevia_acc_${userKey}_daily_open`, now.toString());
  };

  const handleTgCaseOpened = () => {
    const now = Date.now();
    setLastTgOpenTime(now);
    const userKey = currentUser?.uid || currentUser?.email || 'guest';
    localStorage.setItem(`gamevia_acc_${userKey}_tg_open`, now.toString());
  };

  const handleTgSubscribed = () => {
    setIsTgSubscribed(true);
    const userKey = currentUser?.uid || currentUser?.email || 'guest';
    localStorage.setItem(`gamevia_acc_${userKey}_tg_sub`, 'true');
  };

  const handleTgUnsubscribed = () => {
    setIsTgSubscribed(false);
    const userKey = currentUser?.uid || currentUser?.email || 'guest';
    localStorage.setItem(`gamevia_acc_${userKey}_tg_sub`, 'false');
  };

  const handleGrantCaseVoucher = (caseId: string, _caseName: string) => {
    setFreeCaseVouchers((prev) => {
      const next = { ...prev, [caseId]: (prev[caseId] || 0) + 1 };
      if (currentUser) {
        const userKey = currentUser.uid || currentUser.email;
        localStorage.setItem(`gamevia_acc_${userKey}_vouchers`, JSON.stringify(next));
      }
      return next;
    });
  };

  const handleConsumeCaseVoucher = (caseId: string) => {
    setFreeCaseVouchers((prev) => {
      const count = prev[caseId] || 0;
      let next: Record<string, number>;
      if (count <= 1) {
        next = { ...prev };
        delete next[caseId];
      } else {
        next = { ...prev, [caseId]: count - 1 };
      }
      if (currentUser) {
        const userKey = currentUser.uid || currentUser.email;
        localStorage.setItem(`gamevia_acc_${userKey}_vouchers`, JSON.stringify(next));
      }
      return next;
    });
  };

  // Track timestamp of last local balance update to prevent polling overwrites during active gameplay
  const lastLocalChangeTimeRef = useRef<number>(0);
  const knownLedgerIdsRef = useRef<Set<string>>(new Set());

  // Function to load and sync an account's state when logging in
  const loadAccountState = async (user: UserProfile) => {
    const userKey = user.uid || user.email;
    const localBalKey = `gamevia_acc_${userKey}_balance`;
    const localInvKey = `gamevia_acc_${userKey}_inventory`;
    const localCodesKey = `gamevia_acc_${userKey}_codes`;
    const localVouchersKey = `gamevia_acc_${userKey}_vouchers`;

    let userBal: number | null = null;
    let userInv: InventoryItem[] | null = null;
    let userCodes: string[] = [];

    // 1. Read local storage for this specific account
    const savedBal = localStorage.getItem(localBalKey);
    const savedInv = localStorage.getItem(localInvKey);
    const savedCodes = localStorage.getItem(localCodesKey);

    if (savedBal !== null && !isNaN(Number(savedBal))) {
      userBal = Number(savedBal);
    }
    if (savedInv) {
      try {
        const p = JSON.parse(savedInv);
        if (Array.isArray(p)) userInv = p;
      } catch {}
    }
    if (savedCodes) {
      try {
        const c = JSON.parse(savedCodes);
        if (Array.isArray(c)) userCodes = c;
      } catch {}
    }

    // 2. Fetch server state for this account
    try {
      const serverState = await fetchUserAccountState(userKey);
      if (serverState) {
        if (typeof serverState.balance === 'number' && serverState.balance >= 0) {
          userBal = serverState.balance;
        }
        if (Array.isArray(serverState.inventory) && serverState.inventory.length > 0) {
          userInv = serverState.inventory;
        }
        if (Array.isArray(serverState.usedCodes) && serverState.usedCodes.length > 0) {
          userCodes = serverState.usedCodes;
        }
        if (serverState.passState && typeof serverState.passState === 'object') {
          try {
            localStorage.setItem(`gamevia_acc_${userKey}_pass`, JSON.stringify(serverState.passState));
            if (user.email) {
              localStorage.setItem(`gamevia_acc_${user.email}_pass`, JSON.stringify(serverState.passState));
            }
            if (user.uid) {
              localStorage.setItem(`gamevia_acc_${user.uid}_pass`, JSON.stringify(serverState.passState));
            }
          } catch {}
        }
      }
    } catch (err) {
      console.warn('Failed to fetch account state from server:', err);
    }

    // 3. Defaults for new accounts
    if (userBal === null || isNaN(userBal)) {
      userBal = 0;
    }
    if (userInv === null) {
      userInv = INITIAL_INVENTORY;
    }

    const savedVouchers = localStorage.getItem(localVouchersKey);
    let userVouchers: Record<string, number> = {};
    if (savedVouchers) {
      try {
        userVouchers = JSON.parse(savedVouchers) || {};
      } catch {}
    }

    setBalance(userBal);
    setInventory(userInv);
    setUsedCodes(userCodes);
    setFreeCaseVouchers(userVouchers);

    const savedDaily = localStorage.getItem(`gamevia_acc_${userKey}_daily_open`);
    if (savedDaily && !isNaN(Number(savedDaily))) {
      setLastDailyOpenTime(Number(savedDaily));
    } else {
      setLastDailyOpenTime(0);
    }
    const savedTgOpen = localStorage.getItem(`gamevia_acc_${userKey}_tg_open`);
    if (savedTgOpen && !isNaN(Number(savedTgOpen))) {
      setLastTgOpenTime(Number(savedTgOpen));
    } else {
      setLastTgOpenTime(0);
    }
    const savedTg = localStorage.getItem(`gamevia_acc_${userKey}_tg_sub`);
    setIsTgSubscribed(savedTg === 'true');

    // Save to account storage
    localStorage.setItem(localBalKey, userBal.toString());
    localStorage.setItem(localInvKey, JSON.stringify(userInv));
    localStorage.setItem(localCodesKey, JSON.stringify(userCodes));
    // Do NOT send balance here; it was either just fetched or is authoritative on server.
    saveUserAccountState(userKey, { inventory: userInv, usedCodes });
  };

  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    localStorage.setItem('gamevia_user', JSON.stringify(user));
    loadAccountState(user);
  };

  const handleLogout = () => {
    try {
      signOut(auth);
    } catch {}
    setCurrentUser(null);
    localStorage.removeItem('gamevia_user');
    localStorage.removeItem('gameearn_user');

    // Reset view: after logout, all items, balance, and vouchers are cleared from screen
    setInventory([]);
    setBalance(0);
    setUsedCodes([]);
    setFreeCaseVouchers({});
    setLastDailyOpenTime(0);
    setLastTgOpenTime(0);
    setIsTgSubscribed(false);
  };

  // Sync Firebase Auth session automatically
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // Sync with server to get updated profile (with role)
        fetch('/api/user/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
          }),
        })
          .then((res) => res.json())
          .then((data) => {
            const userProf: UserProfile = {
              uid: firebaseUser.uid,
              name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Игрок GameVia',
              email: firebaseUser.email || `${firebaseUser.uid}@gamevia.gg`,
              avatar:
                firebaseUser.photoURL ||
                'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&h=120&q=80',
              provider: firebaseUser.providerData[0]?.providerId === 'google.com' ? 'google' : 'firebase_email',
              role: data.role,
            };
            setCurrentUser(userProf);
            localStorage.setItem('gamevia_user', JSON.stringify(userProf));
            loadAccountState(userProf);
          })
          .catch(console.error);
      }
    });
    return () => unsubscribe();
  }, []);

  // Save account inventory and usedCodes to user account storage
  useEffect(() => {
    if (currentUser) {
      const userKey = currentUser.uid || currentUser.email;
      localStorage.setItem(`gamevia_acc_${userKey}_inventory`, JSON.stringify(inventory));
      localStorage.setItem(`gamevia_acc_${userKey}_codes`, JSON.stringify(usedCodes));
      saveUserAccountState(userKey, { inventory, usedCodes });
    }
  }, [inventory, usedCodes, currentUser]);

  // Helper to persist and sync balance to server immediately
  const persistAndSyncBalance = async (newBalance: number, delta?: number, description?: string) => {
    lastLocalChangeTimeRef.current = Date.now();
    const clean = Math.max(0, Math.round(newBalance));
    if (currentUser) {
      const userKey = currentUser.uid || currentUser.email;
      localStorage.setItem(`gamevia_acc_${userKey}_balance`, clean.toString());
      saveUserAccountState(userKey, { inventory, usedCodes });
      
      const serverBalance = await updateUserBalanceOnServer(userKey, clean, delta, description);
      if (typeof serverBalance === 'number' && !isNaN(serverBalance)) {
        setBalance(serverBalance);
        localStorage.setItem(`gamevia_acc_${userKey}_balance`, serverBalance.toString());
      }
    }
  };

  // Safe deduction handler with immediate persistence and server sync
  const handleDeductBalance = (amount: number, reason?: string) => {
    const amt = Math.round(Number(amount) || 0);
    if (amt <= 0) return;
    setBalance((prev) => {
      const next = Math.max(0, prev - amt);
      persistAndSyncBalance(next, -amt, reason || `Списание (-${amt} Gold)`);
      return next;
    });
  };

  // Safe addition handler with immediate persistence and server sync
  const handleAddBalance = (amount: number, reason?: string) => {
    const amt = Math.round(Number(amount) || 0);
    if (amt <= 0) return;
    setBalance((prev) => {
      const next = prev + amt;
      persistAndSyncBalance(next, amt, reason || `Выигрыш / пополнение (+${amt} Gold)`);
      return next;
    });
  };

  const handleSellImmediately = (amount: number) => {
    const amt = Math.round(Number(amount) || 0);
    handleAddBalance(amt, `Быстрая продажа скина (+${amt} Gold)`);
  };

  const handleSellSingleItem = (instanceId: string, price: number) => {
    const amt = Math.round(Number(price) || 0);
    setInventory((prev) => {
      const updated = prev.filter((it) => it.instanceId !== instanceId);
      if (currentUser) {
        const userKey = currentUser.uid || currentUser.email;
        localStorage.setItem(`gamevia_acc_${userKey}_inventory`, JSON.stringify(updated));
        saveUserAccountState(userKey, { inventory: updated, usedCodes });
      }
      return updated;
    });
    handleAddBalance(amt, `Продажа предмета из инвентаря (+${amt} Gold)`);
  };

  const handleSellMultiple = (instanceIds: string[], totalSum: number) => {
    const amt = Math.round(Number(totalSum) || 0);
    setInventory((prev) => {
      const updated = prev.filter((it) => !instanceIds.includes(it.instanceId));
      if (currentUser) {
        const userKey = currentUser.uid || currentUser.email;
        localStorage.setItem(`gamevia_acc_${userKey}_inventory`, JSON.stringify(updated));
        saveUserAccountState(userKey, { inventory: updated, usedCodes });
      }
      return updated;
    });
    handleAddBalance(amt, `Продажа ${instanceIds.length} предметов (+${amt} Gold)`);
  };

  const handleItemWon = (item: InventoryItem) => {
    setInventory((prev) => [item, ...prev]);
    addRealDrop(item, item.fromCase || 'GameVia');
  };

  const handleBurnItem = (instanceId: string) => {
    setInventory((prev) => prev.filter((it) => it.instanceId !== instanceId));
  };

  // Sync and poll authoritative balance from backend (so Telegram bot approvals update UI live)
  useEffect(() => {
    if (!currentUser) {
      knownLedgerIdsRef.current.clear();
      return;
    }
    const uid = currentUser.uid || currentUser.email;

    // Initial population for this user session
    fetchUserBalance(uid)
      .then((data) => {
        if (data?.ledger && Array.isArray(data.ledger)) {
          data.ledger.forEach((entry: any) => knownLedgerIdsRef.current.add(entry.id));
        }
      })
      .catch(() => {});

    const interval = setInterval(async () => {
      try {
        const data = await fetchUserBalance(uid);
        if (!data) return;

        // 1. Check for incoming Telegram approvals (DEPOSIT_CREDIT or WITHDRAW_REFUND)
        let hasNewSystemEntry = false;
        if (Array.isArray(data.ledger)) {
          for (const entry of data.ledger) {
            if (!knownLedgerIdsRef.current.has(entry.id)) {
              knownLedgerIdsRef.current.add(entry.id);
              if (entry.type === 'DEPOSIT_CREDIT' || entry.type === 'WITHDRAW_REFUND') {
                hasNewSystemEntry = true;
              }
            }
          }
        }

        if (hasNewSystemEntry) {
          // Robust credit: Trust server balance and notify user
          setBalance(data.balance);
          localStorage.setItem(`gamevia_acc_${uid}_balance`, data.balance.toString());
          
          sound.playWin(true);
          confetti({
            particleCount: 150,
            spread: 100,
            origin: { y: 0.6 },
            colors: ['#f59e0b', '#10b981', '#ffffff']
          });
          return;
        }

        // 2. Poll passState from server to automatically activate VIP Pass even after closing modal or navigating
        try {
          const accountData = await fetchUserAccountState(uid);
          if (accountData?.passState && typeof accountData.passState === 'object') {
            const serverPass = accountData.passState;
            const savedLocal = localStorage.getItem(`gamevia_acc_${uid}_pass`);
            let localPass: any = null;
            if (savedLocal) {
              try { localPass = JSON.parse(savedLocal); } catch {}
            }
            if (serverPass.isPremium && (!localPass || !localPass.isPremium)) {
              localStorage.setItem(`gamevia_acc_${uid}_pass`, JSON.stringify(serverPass));
              window.dispatchEvent(new CustomEvent('gamevia_pass_activated', { detail: serverPass }));
              sound.playWin(true);
              confetti({
                particleCount: 150,
                spread: 90,
                origin: { y: 0.5 },
                colors: ['#f59e0b', '#fbbf24', '#ffffff', '#10b981'],
              });
            }
          }
        } catch {}

        // 3. If idle and not actively playing (no local change in 6 seconds), sync softly
        const isActivelyPlaying = Date.now() - lastLocalChangeTimeRef.current < 6000;
        if (!isActivelyPlaying && typeof data.balance === 'number') {
          setBalance((prev) => {
            if (prev !== data.balance) {
              localStorage.setItem(`gamevia_acc_${uid}_balance`, data.balance.toString());
              return data.balance;
            }
            return prev;
          });
        }
      } catch {}
    }, 3000);

    return () => clearInterval(interval);
  }, [currentUser]);

  const handleCraftSuccess = (craftedItem: InventoryItem, consumedIds: string[]) => {
    setInventory(prev => [
      craftedItem,
      ...prev.filter(it => !consumedIds.includes(it.instanceId)),
    ]);
  };

  const handleNavigateToUpgrade = (item: InventoryItem) => {
    setItemForUpgrade(item);
    setSelectedCaseToOpen(null);
    setActiveTab('upgrade');
  };

  const filteredCases = CASES.filter(c => {
    if (caseCategory === 'all') return true;
    return c.category === caseCategory;
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#07090e] text-slate-100 font-sans selection:bg-amber-500 selection:text-black overflow-x-clip">
      {/* Top Company Branding Bar */}
      <div className="w-full bg-[#060911] border-b border-slate-800/80 py-1 px-4 text-center select-none shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] sm:text-xs font-black uppercase tracking-widest text-slate-200 font-display">
            J&M Group Company
          </span>
        </div>
      </div>

      {/* Header Navigation */}
      {window.location.pathname === '/admin' ? (
        <AdminDashboard onClose={() => (window.location.href = '/')} />
      ) : (
        <Navbar
          balance={balance}
          inventoryCount={inventory.length}
          activeTab={activeTab}
          setActiveTab={(tab) => {
            const protectedTabs: NavTabType[] = ['crash', 'mines', 'stairs', 'tower', 'upgrade', 'contract'];
            if (protectedTabs.includes(tab) && !currentUser) {
              setIsAuthOpen(true);
              return;
            }
            setActiveTab(tab);
          }}
          onOpenPromo={() => setIsPromoOpen(true)}
          onOpenTopUp={() => {
            if (!currentUser) {
              setIsAuthOpen(true);
              return;
            }
            setIsTopUpOpen(true);
          }}
          onOpenWithdraw={() => {
            if (!currentUser) {
              setIsAuthOpen(true);
              return;
            }
            setIsWithdrawOpen(true);
          }}
          onOpenAuth={() => setIsAuthOpen(true)}
          onOpenPass={() => setIsPassOpen(true)}
          onOpenHistory={() => setIsHistoryOpen(true)}
          onOpenSupport={() => setIsSupportOpen(true)}
          currentUser={currentUser}
          isMuted={isMuted}
          setIsMuted={setIsMuted}
          currency={currency}
          onCurrencyChange={handleCurrencyChange}
          language={language}
          onLanguageChange={handleLanguageChange}
        />
      )}

      {/* Live Drops Ticker - Real Players Only */}
      <LiveDropsBar
        drops={liveDrops}
        currency={currency}
        onSelectSkin={() => {}}
      />

      {/* Platform Real-Time Stats Bar */}
      <div className="bg-[#0b0f19] border-b border-slate-800/80 px-4 py-2 text-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-6 text-slate-400 shrink-0">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{t('hero.players_online', language, 'Игроков онлайн:')} <strong className="text-white font-mono">1</strong></span>
            </div>
            <div className="flex items-center gap-1.5 hidden sm:flex">
              <Package className="w-3.5 h-3.5 text-amber-400" />
              <span>{t('hero.total_opens', language, 'Всего открытий:')} <strong className="text-white font-mono">284 912</strong></span>
            </div>
            <div className="flex items-center gap-1.5 hidden md:flex">
              <Rocket className="w-3.5 h-3.5 text-purple-400" />
              <span>{t('hero.crash_record', language, 'Краш рекорд дня:')} <strong className="text-amber-400 font-mono">42.50x</strong></span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] text-amber-400 flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5" />
              {t('hero.jackpot', language, 'Джекпот дня:')}
            </span>
            <span className="font-semibold text-white text-[11px] font-mono">
              ★ Нож-бабочка | Fade (185 000 AC)
            </span>
          </div>
        </div>
      </div>

      {/* Main App Content */}
      <main className="flex-1">
        {/* TAB 1: CASES */}
        {activeTab === 'cases' && (
          <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Hero Esports Stage Banner */}
            <div
              className="relative rounded-3xl overflow-hidden border border-amber-500/30 p-6 sm:p-10 mb-8 shadow-2xl bg-cover bg-center"
              style={{
                backgroundImage: `linear-gradient(to right, rgba(7, 9, 14, 0.95) 0%, rgba(11, 15, 25, 0.88) 55%, rgba(7, 9, 14, 0.95) 100%), url('/src/assets/images/gamevia_hero_banner.jpg')`,
              }}
            >
              <div className="relative z-10 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold mb-4 shadow-[0_0_12px_rgba(245,158,11,0.25)]">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>{t('hero.badge', language, 'GameVia · Официальный симулятор кейсов, лесенки, краша и вывода в игры')}</span>
                </div>

                <h1 className="text-3xl sm:text-5xl font-black text-white font-display uppercase tracking-wide leading-tight drop-shadow-md">
                  {t('hero.title', language, 'Открывай кейсы на')} <span className="text-amber-500">GameVia</span>
                </h1>

                <p className="text-slate-300 text-sm sm:text-base mt-3 leading-relaxed">
                  {t('hero.desc', language, '28 уникальных кейсов с реалистичными скинами оружия, детальными 3D фонами, рулеткой со звуками, режимами «Лесенка», «Башня», «Краш», Апгрейдами на скины и деньги, а также открытой математикой отдачи.')}
                </p>

                <div className="flex flex-wrap items-center gap-3 mt-6">
                  <button
                    onClick={() => {
                      if (!currentUser) {
                        setIsAuthOpen(true);
                        return;
                      }
                      const dailyCase = CASES.find(c => c.id === 'free_daily');
                      if (dailyCase) setSelectedCaseToOpen(dailyCase);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-extrabold text-sm flex items-center gap-2 transition shadow-lg shadow-emerald-500/25 cursor-pointer active:scale-95"
                  >
                    <Gift className="w-4 h-4" />
                    <span>{t('hero.daily_btn', language, 'Бесплатный ежедневный кейс')}</span>
                  </button>

                  <button
                    onClick={() => {
                      if (!currentUser) {
                        setIsAuthOpen(true);
                        return;
                      }
                      const tgCase = CASES.find(c => c.id === 'tg_subscribe_case');
                      if (tgCase) setSelectedCaseToOpen(tgCase);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-500 hover:from-sky-400 hover:to-blue-400 text-black font-extrabold text-sm flex items-center gap-2 transition shadow-lg shadow-sky-500/25 cursor-pointer active:scale-95"
                  >
                    <span>📢</span>
                    <span>{t('hero.tg_btn', language, 'Кейс за Telegram')}</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('stairs')}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-500 hover:from-red-500 hover:to-rose-400 text-white font-extrabold text-sm flex items-center gap-2 transition shadow-lg shadow-red-600/25 cursor-pointer active:scale-95"
                  >
                    <span>🪜</span>
                    <span>Лесенка</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('tower')}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-500 hover:from-cyan-500 hover:to-blue-400 text-white font-extrabold text-sm flex items-center gap-2 transition shadow-lg shadow-cyan-600/25 cursor-pointer active:scale-95"
                  >
                    <span>🏰</span>
                    <span>Башня</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('crash')}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-extrabold text-sm flex items-center gap-2 transition shadow-lg shadow-amber-500/25 cursor-pointer active:scale-95"
                  >
                    <Rocket className="w-4 h-4" />
                    <span>Краш</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('mines')}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white font-extrabold text-sm flex items-center gap-2 transition shadow-lg shadow-emerald-600/25 cursor-pointer active:scale-95"
                  >
                    <span>💣</span>
                    <span>Мины</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('upgrade')}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-500 hover:to-pink-400 text-white font-extrabold text-sm flex items-center gap-2 transition shadow-lg shadow-purple-600/25 cursor-pointer active:scale-95"
                  >
                    <Zap className="w-4 h-4" />
                    <span>Апгрейд (Скины & Баланс)</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Flagship Weapon Showcase Ribbon */}
            <div className="mb-8 p-5 rounded-2xl bg-[#0d121c] border border-slate-800/90 shadow-xl">
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Витрина ультра-дорогих сокровищ CS2: Секретные и Аркана скины
                </span>
                <span className="text-xs text-cyan-400/90 hidden sm:inline font-mono">
                  ⚡ До 1 800 000 AC · Доступны в кейсах и в Апгрейде
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {[
                  {
                    name: '⚡ AWP | Souvenir Lore',
                    price: '1 800 000 AC',
                    img: '/src/assets/images/awp_dragon_lore_skin_1791559799237.jpg',
                    color: '#06b6d4',
                  },
                  {
                    name: '⚡ ★ Керамбит | Blue Gem',
                    price: '1 250 000 AC',
                    img: '/src/assets/images/karambit_bluegem_skin_1791629924927.jpg',
                    color: '#06b6d4',
                  },
                  {
                    name: '⚡ ★ Бабочка | Emerald',
                    price: '880 000 AC',
                    img: '/src/assets/images/butterfly_emerald_skin_1791629947379.jpg',
                    color: '#06b6d4',
                  },
                  {
                    name: '⚡ AWP | Гунгнир',
                    price: '690 000 AC',
                    img: '/src/assets/images/awp_gungnir_skin_1791563171060.jpg',
                    color: '#06b6d4',
                  },
                  {
                    name: '★ AK-47 | Gold Arabesque',
                    price: '310 000 AC',
                    img: '/src/assets/images/ak47_gold_arabesque_skin_1791629973472.jpg',
                    color: '#f59e0b',
                  },
                  {
                    name: '⚡ ★ Скелетный | Crimson',
                    price: '245 000 AC',
                    img: '/src/assets/images/skeleton_knife_crimson_1791563130859.jpg',
                    color: '#06b6d4',
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="relative rounded-xl overflow-hidden border border-slate-800 hover:border-amber-500/50 transition-all bg-[#080b11] group cursor-pointer"
                    style={{ borderBottom: `3px solid ${item.color}` }}
                  >
                    <div className="h-28 w-full overflow-hidden relative">
                      <img
                        src={item.img}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#080b11] via-transparent to-black/20" />
                    </div>
                    <div className="p-2.5">
                      <div className="text-xs font-bold text-white truncate" style={{ color: item.color }}>
                        {item.name}
                      </div>
                      <div className="text-xs font-mono font-extrabold text-amber-400 mt-0.5">
                        {item.price}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Case Categories Filters */}
            <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {[
                  { id: 'all', key: 'cat.all', fallback: `Все кейсы (${CASES.length})` },
                  { id: 'knives', key: 'cat.knives', fallback: `🔪 Только Ножи (50)` },
                  { id: 'cheap', key: 'cat.cheap', fallback: '💵 Бюджетные (<150 AC)' },
                  { id: 'popular', key: 'cat.popular', fallback: '🔥 Популярные CS2' },
                  { id: 'premium', key: 'cat.premium', fallback: '👑 Премиум & Ножи' },
                  { id: 'standoff', key: 'cat.standoff', fallback: '📱 Standoff 2' },
                  { id: 'special', key: 'cat.special', fallback: '🎁 Особые' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setCaseCategory(cat.id as any)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                      caseCategory === cat.id
                        ? 'bg-amber-500 text-black shadow-md'
                        : 'bg-[#121825] text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {t(cat.key, language, cat.fallback)}
                  </button>
                ))}
              </div>

              <div className="text-xs text-slate-400">
                Кейсов в категории: <span className="font-mono text-white font-bold">{filteredCases.length}</span>
              </div>
            </div>

            {/* Cases Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredCases.map((caseDef) => (
                <CaseCard
                  key={caseDef.id}
                  caseDef={caseDef}
                  onOpen={(c) => {
                    if (!currentUser) {
                      setIsAuthOpen(true);
                      return;
                    }
                    setSelectedCaseToOpen(c);
                  }}
                  userBalance={balance}
                  hasVoucher={Boolean(freeCaseVouchers[caseDef.id])}
                  lastDailyOpenTime={lastDailyOpenTime}
                  lastTgOpenTime={lastTgOpenTime}
                  isTgSubscribed={isTgSubscribed}
                  language={language}
                />
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: CRASH */}
        {activeTab === 'crash' && (
          !currentUser ? (
            <div className="max-w-md mx-auto my-16 p-8 rounded-3xl bg-[#0f1422] border border-amber-500/30 text-center shadow-2xl animate-fade-in">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-4 border border-amber-500/40">
                <Rocket className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-black text-white uppercase tracking-wide font-display mb-2">
                {t('auth.required_title', language, 'Требуется авторизация')}
              </h2>
              <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                {t('auth.required_games', language, 'Войдите в аккаунт, чтобы играть в игры и делать ставки!')}
              </p>
              <button
                onClick={() => setIsAuthOpen(true)}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:from-amber-400 hover:to-orange-400 text-black font-extrabold text-sm uppercase tracking-wider cursor-pointer shadow-lg shadow-amber-500/25 transition active:scale-95 flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>{t('auth.login_btn', language, 'Войти в аккаунт')}</span>
              </button>
            </div>
          ) : (
            <CrashGame
              userBalance={balance}
              onDeductBalance={handleDeductBalance}
              onAddBalance={handleAddBalance}
              currentUser={currentUser}
            />
          )
        )}

        {/* TAB: MINES */}
        {activeTab === 'mines' && (
          !currentUser ? (
            <div className="max-w-md mx-auto my-16 p-8 rounded-3xl bg-[#0f1422] border border-amber-500/30 text-center shadow-2xl animate-fade-in">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4 border border-emerald-500/40">
                <Lock className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-black text-white uppercase tracking-wide font-display mb-2">
                {t('auth.required_title', language, 'Требуется авторизация')}
              </h2>
              <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                {t('auth.required_games', language, 'Войдите в аккаунт, чтобы играть в игры и делать ставки!')}
              </p>
              <button
                onClick={() => setIsAuthOpen(true)}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 hover:from-emerald-400 hover:to-teal-400 text-black font-extrabold text-sm uppercase tracking-wider cursor-pointer shadow-lg shadow-emerald-500/25 transition active:scale-95 flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>{t('auth.login_btn', language, 'Войти в аккаунт')}</span>
              </button>
            </div>
          ) : (
            <MinesGame
              userBalance={balance}
              onDeductBalance={handleDeductBalance}
              onAddBalance={handleAddBalance}
            />
          )
        )}

        {/* TAB: STAIRS (ЛЕСЕНКА) */}
        {activeTab === 'stairs' && (
          !currentUser ? (
            <div className="max-w-md mx-auto my-16 p-8 rounded-3xl bg-[#0f1422] border border-amber-500/30 text-center shadow-2xl animate-fade-in">
              <div className="w-16 h-16 rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center mx-auto mb-4 border border-red-500/40">
                <Lock className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-black text-white uppercase tracking-wide font-display mb-2">
                {t('auth.required_title', language, 'Требуется авторизация')}
              </h2>
              <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                {t('auth.required_games', language, 'Войдите в аккаунт, чтобы играть в игры и делать ставки!')}
              </p>
              <button
                onClick={() => setIsAuthOpen(true)}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-red-500 via-orange-500 to-red-500 hover:from-red-400 hover:to-orange-400 text-white font-extrabold text-sm uppercase tracking-wider cursor-pointer shadow-lg shadow-red-500/25 transition active:scale-95 flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>{t('auth.login_btn', language, 'Войти в аккаунт')}</span>
              </button>
            </div>
          ) : (
            <StairsGame
              userBalance={balance}
              onDeductBalance={handleDeductBalance}
              onAddBalance={handleAddBalance}
            />
          )
        )}

        {/* TAB: TOWER (БАШНЯ) */}
        {activeTab === 'tower' && (
          !currentUser ? (
            <div className="max-w-md mx-auto my-16 p-8 rounded-3xl bg-[#0f1422] border border-amber-500/30 text-center shadow-2xl animate-fade-in">
              <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto mb-4 border border-cyan-500/40">
                <Lock className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-black text-white uppercase tracking-wide font-display mb-2">
                {t('auth.required_title', language, 'Требуется авторизация')}
              </h2>
              <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                {t('auth.required_games', language, 'Войдите в аккаунт, чтобы играть в игры и делать ставки!')}
              </p>
              <button
                onClick={() => setIsAuthOpen(true)}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-500 hover:from-cyan-400 hover:to-blue-400 text-white font-extrabold text-sm uppercase tracking-wider cursor-pointer shadow-lg shadow-cyan-500/25 transition active:scale-95 flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>{t('auth.login_btn', language, 'Войти в аккаунт')}</span>
              </button>
            </div>
          ) : (
            <TowerGame
              userBalance={balance}
              onDeductBalance={handleDeductBalance}
              onAddBalance={handleAddBalance}
            />
          )
        )}

        {/* TAB 3: UPGRADE */}
        {activeTab === 'upgrade' && (
          !currentUser ? (
            <div className="max-w-md mx-auto my-16 p-8 rounded-3xl bg-[#0f1422] border border-amber-500/30 text-center shadow-2xl animate-fade-in">
              <div className="w-16 h-16 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center mx-auto mb-4 border border-purple-500/40">
                <Lock className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-black text-white uppercase tracking-wide font-display mb-2">
                {t('auth.required_title', language, 'Требуется авторизация')}
              </h2>
              <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                {t('auth.required_games', language, 'Войдите в аккаунт, чтобы делать апгрейды скинов и баланса!')}
              </p>
              <button
                onClick={() => setIsAuthOpen(true)}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 hover:from-purple-400 hover:to-pink-400 text-white font-extrabold text-sm uppercase tracking-wider cursor-pointer shadow-lg shadow-purple-500/25 transition active:scale-95 flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>{t('auth.login_btn', language, 'Войти в аккаунт')}</span>
              </button>
            </div>
          ) : (
            <UpgradeGame
              inventory={inventory}
              userBalance={balance}
              initialSelectedItem={itemForUpgrade}
              onWinItem={handleItemWon}
              onBurnItem={handleBurnItem}
              onDeductBalance={handleDeductBalance}
              onAddBalance={handleAddBalance}
            />
          )
        )}

        {/* TAB 4: CONTRACT */}
        {activeTab === 'contract' && (
          !currentUser ? (
            <div className="max-w-md mx-auto my-16 p-8 rounded-3xl bg-[#0f1422] border border-amber-500/30 text-center shadow-2xl animate-fade-in">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-4 border border-amber-500/40">
                <Lock className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-black text-white uppercase tracking-wide font-display mb-2">
                {t('auth.required_title', language, 'Требуется авторизация')}
              </h2>
              <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                {t('auth.required_games', language, 'Войдите в аккаунт, чтобы создавать контракты обмена!')}
              </p>
              <button
                onClick={() => setIsAuthOpen(true)}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:from-amber-400 hover:to-orange-400 text-black font-extrabold text-sm uppercase tracking-wider cursor-pointer shadow-lg shadow-amber-500/25 transition active:scale-95 flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>{t('auth.login_btn', language, 'Войти в аккаунт')}</span>
              </button>
            </div>
          ) : (
            <ContractGame
              inventory={inventory}
              onCraftSuccess={handleCraftSuccess}
            />
          )
        )}

        {/* TAB 5: INVENTORY */}
        {activeTab === 'inventory' && (
          <InventoryView
            inventory={inventory}
            onSellItem={handleSellSingleItem}
            onSellMultiple={handleSellMultiple}
            onNavigateToUpgrade={handleNavigateToUpgrade}
            language={language}
          />
        )}

        {/* TAB 6: ANALYZER */}
        {activeTab === 'analyzer' && <MathAnalyzer />}

        {/* TAB 7: ABOUT */}
        {activeTab === 'about' && <KnowledgeBase />}

        {/* TAB: PASS (When activeTab is pass, also keep background active) */}
        {activeTab === 'pass' && (
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="p-8 rounded-3xl bg-gradient-to-r from-amber-500/20 via-orange-500/10 to-transparent border border-amber-500/30 text-center space-y-4">
              <Crown className="w-12 h-12 text-amber-400 mx-auto animate-bounce" />
              <h2 className="text-2xl font-black uppercase text-white font-display">Боевой пропуск GameVia (Сезон 1)</h2>
              <p className="text-slate-300 text-sm max-w-md mx-auto">
                Открывайте кейсы, играйте в режимы и забирайте реальные награды и скины!
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setIsPassOpen(true)}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-black font-black text-sm uppercase shadow-lg hover:brightness-110 cursor-pointer"
                >
                  Открыть пропуск
                </button>
                <button
                  onClick={() => setActiveTab('cases')}
                  className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm cursor-pointer"
                >
                  К списку кейсов
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Case Opener Modal */}
      {selectedCaseToOpen && (
        <CaseOpenerModal
          caseDef={selectedCaseToOpen}
          userBalance={balance}
          onClose={() => setSelectedCaseToOpen(null)}
          onItemWon={handleItemWon}
          onDeductBalance={handleDeductBalance}
          onSellImmediately={handleSellImmediately}
          onNavigateToUpgrade={handleNavigateToUpgrade}
          freeVoucherCount={freeCaseVouchers[selectedCaseToOpen.id] || 0}
          onConsumeVoucher={handleConsumeCaseVoucher}
          onGrantCaseVoucher={handleGrantCaseVoucher}
          onApplyBonus={handleAddBalance}
          usedCodes={usedCodes}
          setUsedCodes={setUsedCodes}
          currentUser={currentUser}
          lastDailyOpenTime={lastDailyOpenTime}
          onDailyCaseOpened={handleDailyCaseOpened}
          lastTgOpenTime={lastTgOpenTime}
          onTgCaseOpened={handleTgCaseOpened}
          isTgSubscribed={isTgSubscribed}
          onTgSubscribed={handleTgSubscribed}
          onTgUnsubscribed={handleTgUnsubscribed}
          language={language}
          onOpenAuth={() => setIsAuthOpen(true)}
        />
      )}

      {/* Promo Code Modal */}
      {isPromoOpen && (
        <PromoModal
          onClose={() => setIsPromoOpen(false)}
          onApplyBonus={handleAddBalance}
          onGrantCaseVoucher={handleGrantCaseVoucher}
          usedCodes={usedCodes}
          setUsedCodes={setUsedCodes}
          currentUser={currentUser}
        />
      )}

      {/* Top Up Modal (Gold Purchase) */}
      {isTopUpOpen && (
        <TopUpModal
          onClose={() => setIsTopUpOpen(false)}
          onAddBalance={handleAddBalance}
          currentUser={currentUser}
          currency={currency}
        />
      )}

      {/* Withdraw Modal */}
      <WithdrawModal
        isOpen={isWithdrawOpen}
        onClose={() => setIsWithdrawOpen(false)}
        userBalance={balance}
        inventory={inventory}
        onDeductBalance={handleDeductBalance}
        onBurnItem={handleBurnItem}
        currentUser={currentUser}
      />

      {/* Auth Modal (Google & GameVia Login) */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        currentUser={currentUser}
        onLoginSuccess={handleLoginSuccess}
        onLogout={handleLogout}
      />

      {/* GamePass Modal */}
      <GamePassModal
        isOpen={isPassOpen}
        onClose={() => {
          setIsPassOpen(false);
          if (activeTab === 'pass') {
            setActiveTab('cases');
          }
        }}
        userBalance={balance}
        onDeductBalance={handleDeductBalance}
        onAddBalance={handleAddBalance}
        onWinItem={handleItemWon}
        onNavigateToTab={(tab) => {
          setIsPassOpen(false);
          setActiveTab(tab as NavTabType);
        }}
        onOpenTopUp={() => {
          setIsPassOpen(false);
          setIsTopUpOpen(true);
        }}
        currentUser={currentUser}
        language={language}
      />

      {/* History Modal (Transactions & Auto-Cancellation) */}
      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        currentUser={currentUser}
        onOpenWithdraw={() => setIsWithdrawOpen(true)}
        onOpenTopUp={() => setIsTopUpOpen(true)}
      />

      {/* Technical Support Modal */}
      <SupportModal
        isOpen={isSupportOpen}
        onClose={() => setIsSupportOpen(false)}
        currentUser={currentUser}
      />

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800 bg-[#06080d] py-8 px-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
            <div className="flex items-center gap-2">
              <img
                src="/assets/aistudio/image_ffaf8878.png"
                alt="GameVia"
                className="w-6 h-6 rounded-lg object-cover inline-block border border-amber-500/30"
              />
              <span className="font-black text-slate-200 font-display tracking-wider">GAMEVIA</span>
            </div>
            <span className="hidden sm:inline text-slate-700">|</span>
            <span className="font-semibold text-slate-400">
              Designed and made By J&M Group Company
            </span>
          </div>

          {/* Socials: Telegram & YouTube */}
          <div className="flex items-center gap-3">
            <a
              href="https://t.me/GameV1A"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 rounded-xl bg-[#0088cc]/15 hover:bg-[#0088cc]/25 text-[#0088cc] hover:text-white border border-[#0088cc]/30 transition flex items-center gap-2 text-xs font-bold shadow-sm"
              title="Наш официальный Telegram-канал"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Telegram (@GameV1A)</span>
            </a>

            <a
              href="https://www.youtube.com/@JMGroupCompany"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 rounded-xl bg-[#ff0000]/15 hover:bg-[#ff0000]/25 text-[#ff4444] hover:text-white border border-[#ff0000]/30 transition flex items-center gap-2 text-xs font-bold shadow-sm"
              title="Наш официальный YouTube-канал"
            >
              <Youtube className="w-3.5 h-3.5" />
              <span>YouTube (@JMGroupCompany)</span>
            </a>
          </div>

          <div className="flex items-center gap-4 text-slate-400 flex-wrap justify-center">
            <button onClick={() => setActiveTab('stairs')} className="hover:text-red-400 cursor-pointer">
              Лесенка
            </button>
            <button onClick={() => setActiveTab('tower')} className="hover:text-cyan-400 cursor-pointer">
              Башня
            </button>
            <button onClick={() => setActiveTab('crash')} className="hover:text-amber-400 cursor-pointer">
              Краш
            </button>
            <button onClick={() => setActiveTab('mines')} className="hover:text-emerald-400 cursor-pointer">
              Мины
            </button>
            <button onClick={() => setActiveTab('upgrade')} className="hover:text-purple-400 cursor-pointer">
              Апгрейд
            </button>
            <button onClick={() => setActiveTab('about')} className="hover:text-amber-400 cursor-pointer">
              FAQ
            </button>
            <button onClick={() => setActiveTab('analyzer')} className="hover:text-amber-400 cursor-pointer">
              Математика
            </button>
            <button onClick={() => setIsPromoOpen(true)} className="hover:text-amber-400 cursor-pointer">
              Промокоды
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-6 pt-4 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
          <span>Designed and made By J&M Group Company</span>
          <span>GameVia Platform • Все права защищены</span>
        </div>
      </footer>
    </div>
  );
}
