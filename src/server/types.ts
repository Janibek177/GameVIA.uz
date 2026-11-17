export type OrderStatus =
  | 'PENDING_PAYMENT'
  | 'PENDING_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELLED';

export type WithdrawalStatus =
  | 'PENDING_REVIEW'
  | 'APPROVED'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'REJECTED'
  | 'CANCELLED';

export interface GoldOrder {
  id: string; // e.g. ORD-17915-4921
  userId: string;
  username: string;
  userEmail?: string;
  goldAmount: number; // in Gold / Acoin
  bonusGold: number;
  totalGold: number;
  rate: number; // 1 Gold = X RUB (default 1.0 or custom)
  paymentAmountRub: number;
  paymentAmount?: number;
  currency: string; // 'RUB' or 'UZS'
  recipientCard: string;
  recipientName: string;
  recipientBank: string;
  sbpPhone?: string;
  receiptUrl?: string; // base64 or stored url
  orderType?: 'GOLD' | 'VIP_PASS';
  productType?: 'vip_standard' | 'vip_bundle_10' | 'level_boost' | 'standard' | 'bundle' | 'level';
  title?: string;
  status: OrderStatus;
  createdAt: number;
  reviewedAt?: number;
  adminId?: string | number;
  adminUsername?: string;
  rejectionReason?: string;
  telegramMessageId?: number;
  telegramChatId?: number | string;
}

export interface GoldWithdrawal {
  id: string; // e.g. WDR-17915-8312
  userId: string;
  username: string;
  userEmail?: string;
  goldAmount: number; // in Gold (payout amount)
  totalDeduction?: number; // Total Gold deducted from balance (including 50% commission, 1.5x)
  rate: number; // e.g. 1 Gold = 1.0 SO2 Gold or 0.9 PUBG UC or 0.95 RUB
  payoutAmount: string; // e.g. "1 500 G" or "1 350 ₽"
  feeAmount: number; // Gold fee
  payoutMethod: 'standoff2' | 'pubg' | 'card_sbp' | 'crypto';
  payoutMethodLabel: string;
  payoutTarget: string; // Player ID or Card/Phone number
  skinName?: string; // Skin name listed on market (e.g. "G22 | Frost Wyrm")
  skinPattern?: string; // Specific pattern ID (e.g. "421") for unique lookup
  marketPrice?: string; // Total listing price with game commission (e.g. "625.00 G")
  screenshotUrl?: string; // Optional screenshot of market listing
  playerAvatarUrl?: string; // Player in-game avatar image
  currency?: string; // 'RUB' or 'UZS'
  status: WithdrawalStatus;
  createdAt: number;
  reviewedAt?: number;
  completedAt?: number;
  adminId?: string | number;
  adminUsername?: string;
  rejectionReason?: string;
  telegramMessageId?: number;
  telegramChatId?: number | string;
}

export interface LedgerEntry {
  id: string;
  userId: string;
  type: 'DEPOSIT_CREDIT' | 'WITHDRAW_RESERVE' | 'WITHDRAW_REFUND' | 'WITHDRAW_COMMIT' | 'GAME_WIN' | 'GAME_BET' | 'VIP_PASS_PURCHASE';
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  referenceId: string; // orderId or withdrawalId or passId
  description: string;
  timestamp: number;
}

export interface AuditLog {
  id: string;
  action: 'ORDER_APPROVED' | 'ORDER_REJECTED' | 'WITHDRAWAL_APPROVED' | 'WITHDRAWAL_COMPLETED' | 'WITHDRAWAL_REJECTED' | 'VIP_PASS_PURCHASED';
  adminId: string | number;
  adminUsername?: string;
  targetId: string;
  details: Record<string, any>;
  timestamp: number;
}

export type UserRole = 'OWNER' | 'ADMIN' | 'USER';

export interface AdminPermissions {
  canBanUsers: boolean;
  canManageBalance: boolean;
  canEditOdds: boolean;
  canManageAdmins: boolean; // Only OWNER can do this
  canViewLogs: boolean;
}

export interface AdminUserRecord {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  permissions: AdminPermissions;
  addedAt: number;
  addedBy: string;
}

export interface UserActionEntry {
  id: string;
  type: 'LOGIN' | 'OPEN_CASE' | 'UPGRADE' | 'CONTRACT' | 'DEPOSIT' | 'WITHDRAW' | 'BALANCE_CHANGE' | 'BAN' | 'UNBAN';
  description: string;
  timestamp: number;
  details?: Record<string, any>;
}

export interface StoredUserAccount {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  balance: number;
  registeredAt: number;
  lastLoginAt: number;
  isBanned: boolean;
  banReason?: string;
  bannedAt?: number;
  bannedBy?: string;
  stats: {
    casesOpened: number;
    totalSpentGold: number;
    totalWonGold: number;
    ordersCount: number;
    withdrawalsCount: number;
  };
  actionsHistory: UserActionEntry[];
}

export interface AdminAuditLog {
  id: string;
  adminEmail: string;
  adminUid: string;
  action: 'BAN_USER' | 'UNBAN_USER' | 'UPDATE_BALANCE' | 'UPDATE_ODDS' | 'ADD_ADMIN' | 'REMOVE_ADMIN' | 'UPDATE_PERMISSIONS' | 'SETTINGS_CHANGED';
  targetId: string;
  targetEmail?: string;
  details: string;
  timestamp: number;
}

export interface CaseOddsItemOverride {
  skinId: string;
  name: string;
  rarity: string;
  price: number;
  weight: number;
  probabilityPct: number;
}

export interface CaseOddsOverride {
  caseId: string;
  caseName: string;
  items: CaseOddsItemOverride[];
  updatedAt: number;
  updatedBy: string;
}

export interface PublicConfig {
  exchangeRate: number; // RUB per Gold
  minPurchaseGold: number;
  maxPurchaseGold: number;
  minWithdrawGold: number;
  maxWithdrawGold: number;
  recipient: {
    cardNumber: string; // Humo: 9860 1701 1354 8268
    cardHolder: string; // Musallam Abidov
    bankName: string; // Humo
    sbpPhone?: string; // 200205068
    cardNumberVisa?: string; // Visa: 4023 0605 0973 3761
    bankNameVisa?: string; // Visa
  };
  botUsername: string;
}

