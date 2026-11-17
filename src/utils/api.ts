import { GoldOrder, GoldWithdrawal, PublicConfig } from '../server/types';
import { auth } from '../firebase';

export async function fetchPublicConfig(): Promise<PublicConfig> {
  const res = await fetch('/api/config/public');
  if (!res.ok) throw new Error('Ошибка загрузки конфигурации');
  return res.json();
}

export async function updateRecipientConfig(params: {
  cardNumber: string;
  cardHolder: string;
  bankName?: string;
  sbpPhone?: string;
  cardNumberVisa?: string;
  bankNameVisa?: string;
}): Promise<{ success: boolean; recipient: PublicConfig['recipient'] }> {
  const res = await fetch('/api/config/recipient', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Ошибка обновления реквизитов');
  return data;
}

export async function createGoldOrder(params: {
  userId: string;
  username: string;
  userEmail?: string;
  goldAmount?: number;
  currency?: 'RUB' | 'UZS';
  orderType?: 'GOLD' | 'VIP_PASS';
  productType?: 'vip_standard' | 'vip_bundle_10' | 'level_boost' | 'standard' | 'bundle' | 'level';
  title?: string;
}): Promise<GoldOrder> {
  const res = await fetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Ошибка создания заказа');
  return data;
}

export async function uploadOrderReceipt(orderId: string, receiptBase64: string): Promise<GoldOrder> {
  const res = await fetch(`/api/orders/${orderId}/receipt`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ receiptBase64 }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Ошибка отправки чека');
  return data;
}

export async function fetchUserOrders(userId: string): Promise<GoldOrder[]> {
  const res = await fetch(`/api/orders?userId=${encodeURIComponent(userId)}`);
  if (!res.ok) return [];
  return res.json();
}

export async function fetchOrder(orderId: string): Promise<GoldOrder | null> {
  const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}`);
  if (!res.ok) return null;
  return res.json();
}

export async function createWithdrawal(params: {
  userId: string;
  username: string;
  userEmail?: string;
  goldAmount: number;
  payoutMethod: 'standoff2' | 'pubg' | 'card_sbp' | 'crypto';
  payoutTarget: string;
  skinName?: string;
  skinPattern?: string;
  marketPrice?: string;
  screenshotUrl?: string;
  playerAvatarUrl?: string;
  currency?: 'RUB' | 'UZS';
}): Promise<GoldWithdrawal> {
  const res = await fetch('/api/withdrawals', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Ошибка создания заявки на вывод');
  return data;
}

export async function buyVipPass(params: {
  userId: string;
  username: string;
  userEmail?: string;
  productType?: 'vip_standard' | 'vip_bundle_10' | 'level_boost';
  priceGold?: number;
  title?: string;
}): Promise<{ success: boolean; newBalance: number; isPremium: boolean; priceGold: number; message: string }> {
  const res = await fetch('/api/pass/buy-vip', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Ошибка покупки пропуска');
  return data;
}

export async function fetchUserWithdrawals(userId: string): Promise<GoldWithdrawal[]> {
  const res = await fetch(`/api/withdrawals?userId=${encodeURIComponent(userId)}`);
  if (!res.ok) return [];
  return res.json();
}

export async function fetchUserBalance(userId: string): Promise<{ balance: number; ledger: any[] }> {
  const res = await fetch(`/api/user/balance?userId=${encodeURIComponent(userId)}&t=${Date.now()}`);
  if (!res.ok) throw new Error('Ошибка получения баланса');
  return res.json();
}

export async function syncUserBalanceWithServer(userId: string, balance: number): Promise<number> {
  try {
    const res = await fetch('/api/user/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, balance }),
    });
    if (res.ok) {
      const data = await res.json();
      return data.balance;
    }
  } catch (err) {
    console.error('Failed to sync balance with server:', err);
  }
  return balance;
}

export async function updateUserBalanceOnServer(
  userId: string,
  balance: number,
  delta?: number,
  description?: string,
  type?: string
): Promise<number> {
  try {
    const res = await fetch('/api/user/balance/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, balance, delta, description, type }),
    });
    if (res.ok) {
      const data = await res.json();
      return data.balance;
    }
  } catch (err) {
    console.warn('Failed to update balance on server:', err);
  }
  return balance;
}

export async function fetchUserAccountState(userId: string): Promise<{
  balance: number;
  inventory: any[];
  usedCodes: string[];
  passState?: any;
} | null> {
  try {
    const res = await fetch(`/api/user/account-state?userId=${encodeURIComponent(userId)}&t=${Date.now()}`);
    if (res.ok) {
      return res.json();
    }
  } catch (err) {
    console.warn('Failed to fetch account state:', err);
  }
  return null;
}

export async function saveUserAccountState(
  userId: string,
  state: { balance?: number; inventory?: any[]; usedCodes?: string[]; passState?: any }
): Promise<boolean> {
  try {
    const res = await fetch('/api/user/account-state', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, ...state }),
    });
    return res.ok;
  } catch (err) {
    console.warn('Failed to save account state:', err);
    return false;
  }
}

export async function fetchPromoUsage(): Promise<Record<string, number>> {
  try {
    const res = await fetch(`/api/promo/usage?t=${Date.now()}`);
    if (res.ok) return res.json();
  } catch (err) {
    console.warn('Failed to fetch promo usage:', err);
  }
  return {};
}

export async function activatePromoCodeOnServer(
  userId: string,
  code: string,
  maxLimit = 20
): Promise<{ success: boolean; error?: string; count?: number; max?: number }> {
  try {
    const res = await fetch('/api/promo/activate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, code, maxLimit }),
    });
    return res.json();
  } catch (err) {
    console.warn('Failed to activate promo on server, using local fallback:', err);
    return { success: true };
  }
}

export async function fetchAdminStats() {
  const user = auth.currentUser;
  if (!user) return null;
  const token = await user.getIdToken();
  try {
    const res = await fetch('/api/admin/stats', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) return res.json();
  } catch (err) {
    console.error('Failed to fetch admin stats:', err);
  }
  return null;
}
