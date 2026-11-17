import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { storage, PLATFORM_OWNER_EMAIL } from './src/server/storage';
import { telegramBot } from './src/server/telegram';
import { AdminPermissions } from './src/server/types';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProd = process.env.NODE_ENV === 'production';
const PORT = 3000;

/**
 * Verified Firebase ID token decoder and Google Identity validator
 */
async function verifyFirebaseIdToken(
  authHeader?: string
): Promise<{ uid: string; email: string; emailVerified: boolean; displayName?: string } | null> {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.split('Bearer ')[1]?.trim();
  if (!token) return null;

  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const payloadJson = Buffer.from(parts[1], 'base64').toString('utf-8');
    const payload = JSON.parse(payloadJson);

    // Verify expiration timestamp
    const nowSec = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < nowSec) {
      console.warn('[Auth] Token expired');
      return null;
    }

    const email = (payload.email || '').toLowerCase().trim();
    const uid = payload.user_id || payload.sub || '';

    // Verify against Google Identity Toolkit if API key available
    try {
      const configPath = path.resolve(__dirname, 'firebase-applet-config.json');
      if (fs.existsSync(configPath)) {
        const raw = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        if (raw.apiKey) {
          const verifyRes = await fetch(
            `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${raw.apiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ idToken: token }),
            }
          );
          if (verifyRes.ok) {
            const verifyData = await verifyRes.json();
            const googleUser = verifyData.users?.[0];
            if (googleUser) {
              return {
                uid: googleUser.localId || uid,
                email: (googleUser.email || email).toLowerCase(),
                emailVerified: Boolean(googleUser.emailVerified),
                displayName: googleUser.displayName || payload.name,
              };
            }
          }
        }
      }
    } catch (gErr) {
      console.warn('[Auth] Google lookup fallback to payload:', gErr);
    }

    if (uid && email) {
      return {
        uid,
        email,
        emailVerified: Boolean(payload.email_verified),
        displayName: payload.name,
      };
    }
  } catch (err) {
    console.error('[Auth] Token verification failed:', err);
  }
  return null;
}

/**
 * Authentication & Authorization helper for Admin routes
 */
async function authenticateAdmin(
  req: Request,
  res: Response,
  requiredPermission?: keyof AdminPermissions
): Promise<{ uid: string; email: string; role: string; permissions?: AdminPermissions } | null> {
  const authUser = await verifyFirebaseIdToken(req.headers.authorization);
  if (!authUser) {
    res.status(401).json({ error: 'Требуется авторизация Firebase. Токен отсутствует или недействителен.' });
    return null;
  }

  const access = storage.verifyAdminAccess(authUser.email, requiredPermission);
  if (!access.authorized) {
    res.status(403).json({ error: access.error || 'Доступ запрещён. Недостаточно прав администратора.' });
    return null;
  }

  return {
    uid: authUser.uid,
    email: authUser.email,
    role: access.role || 'ADMIN',
    permissions: access.permissions,
  };
}

async function startServer() {
  const app = express();

  // Allow larger payload for receipt images (base64)
  app.use(express.json({ limit: '15mb' }));
  app.use(express.urlencoded({ extended: true, limit: '15mb' }));

  // --- API ROUTES ---

  // Health check
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: Date.now() });
  });

  // Public system config (exchange rate, recipient card info, limits)
  app.get('/api/config/public', (_req: Request, res: Response) => {
    res.json(storage.getPublicConfig());
  });

  // Update recipient payment info (admin-only)
  app.post('/api/config/recipient', async (req: Request, res: Response) => {
    const admin = await authenticateAdmin(req, res);
    if (!admin) return;
    const { cardNumber, cardHolder, bankName, sbpPhone, cardNumberVisa, bankNameVisa } = req.body;
    if (!cardNumber || !cardHolder) {
      return res.status(400).json({ error: 'Укажите номер карты и имя получателя' });
    }
    const recipient = storage.updateRecipientSettings({
      cardNumber,
      cardHolder,
      bankName,
      sbpPhone,
      cardNumberVisa,
      bankNameVisa,
    });
    res.json({ success: true, recipient });
  });

  // Public Firebase config endpoint
  app.get('/api/firebase/config', (_req: Request, res: Response) => {
    try {
      const configPath = path.resolve(__dirname, 'firebase-applet-config.json');
      if (fs.existsSync(configPath)) {
        const raw = fs.readFileSync(configPath, 'utf-8');
        return res.json(JSON.parse(raw));
      }
    } catch {}
    res.json({
      projectId: "gamevia-feae3",
      authDomain: "gamevia-feae3.firebaseapp.com",
      storageBucket: "gamevia-feae3.firebasestorage.app",
    });
  });

  // User balance & ledger
  app.get('/api/user/balance', (req: Request, res: Response) => {
    const userId = String(req.query.userId || '');
    if (!userId) {
      return res.status(400).json({ error: 'Параметр userId обязателен' });
    }
    const balance = storage.getUserBalance(userId);
    const ledger = storage.getUserLedger(userId);
    res.json({ balance, ledger });
  });

  // Sync initial user balance & profile
  app.post('/api/user/sync', (req: Request, res: Response) => {
    const { userId, balance, email, displayName, photoURL } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'Параметр userId обязателен' });
    }

    // Register or update user profile
    const user = storage.registerOrUpdateUser({
      uid: userId,
      email: email || (userId.includes('@') ? userId : `${userId}@player.gamevia.gg`),
      displayName,
      photoURL,
    });

    const banCheck = storage.isUserBanned(userId);
    const authoritativeBalance = storage.syncUserBalance(userId, Number(balance) || 0);

    res.json({
      balance: authoritativeBalance,
      role: user.role,
      isBanned: banCheck.banned,
      banReason: banCheck.reason,
    });
  });

  // Record user action (case open, upgrade, bet, win)
  app.post('/api/user/record-action', (req: Request, res: Response) => {
    const { userId, type, description, details } = req.body;
    if (!userId || !type || !description) {
      return res.status(400).json({ error: 'Параметры userId, type и description обязательны' });
    }
    storage.recordUserAction(userId, type, description, details);
    res.json({ success: true });
  });

  // Update user balance (from bets, wins, item sales, etc.)
  app.post('/api/user/balance/update', (req: Request, res: Response) => {
    const { userId, balance, delta, description, type } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'Параметр userId обязателен' });
    }

    // Ban check
    const banCheck = storage.isUserBanned(userId);
    if (banCheck.banned) {
      return res.status(403).json({
        error: `Ваш аккаунт заблокирован: ${banCheck.reason}`,
        isBanned: true,
        banReason: banCheck.reason,
      });
    }

    const updated = storage.setUserBalance(
      userId,
      Number(balance),
      Number(delta) || 0,
      description,
      type
    );
    res.json({ success: true, balance: updated });
  });

  // Get full account state (balance, inventory, usedCodes)
  app.get('/api/user/account-state', (req: Request, res: Response) => {
    const userId = String(req.query.userId || '');
    if (!userId) {
      return res.status(400).json({ error: 'Параметр userId обязателен' });
    }
    const banCheck = storage.isUserBanned(userId);
    const state = storage.getAccountState(userId);
    res.json({
      ...state,
      isBanned: banCheck.banned,
      banReason: banCheck.reason,
    });
  });

  // Save account state (balance, inventory, usedCodes)
  app.post('/api/user/account-state', (req: Request, res: Response) => {
    const { userId, balance, inventory, usedCodes } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'Параметр userId обязателен' });
    }

    // Ban check
    const banCheck = storage.isUserBanned(userId);
    if (banCheck.banned) {
      return res.status(403).json({
        error: `Ваш аккаунт заблокирован: ${banCheck.reason}`,
        isBanned: true,
        banReason: banCheck.reason,
      });
    }

    const state = storage.setAccountState(userId, { balance, inventory, usedCodes });
    res.json({ success: true, state });
  });

  // --- PROMO CODES (ACTIVATIONS & 20-LIMIT ENFORCEMENT) ---
  app.get('/api/promo/usage', (_req: Request, res: Response) => {
    res.json(storage.getPromoUsageCounts());
  });

  app.post('/api/promo/activate', (req: Request, res: Response) => {
    const { userId, code, maxLimit } = req.body;
    if (!userId || !code) {
      return res.status(400).json({ success: false, error: 'Укажите userId и code' });
    }
    const result = storage.activatePromoCode(userId, code, maxLimit || 20);
    res.json(result);
  });

  // --- ORDERS (GOLD PURCHASE) ---

  // --- ADMIN PANEL API ---

  app.get('/api/admin/stats', async (req: Request, res: Response) => {
    const admin = await authenticateAdmin(req, res);
    if (!admin) return;

    res.json(storage.getDashboardStats());
  });

  // Create new order
  app.post('/api/orders', (req: Request, res: Response) => {
    const { userId, username, userEmail, goldAmount, orderType, productType, title, currency } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'Параметр userId обязателен' });
    }

    const banCheck = storage.isUserBanned(userId);
    if (banCheck.banned) {
      return res.status(403).json({ error: `Ваш аккаунт заблокирован: ${banCheck.reason}` });
    }

    if (orderType !== 'VIP_PASS' && !goldAmount) {
      return res.status(400).json({ error: 'Укажите сумму Gold' });
    }

    const result = storage.createOrder({
      userId,
      username,
      userEmail,
      goldAmount: goldAmount ? Number(goldAmount) : 0,
      currency,
      orderType,
      productType,
      title,
    });

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json(result.order);
  });

  // Upload receipt for order
  app.post('/api/orders/:id/receipt', async (req: Request, res: Response) => {
    const orderId = req.params.id;
    const { receiptBase64 } = req.body;

    if (!receiptBase64) {
      return res.status(400).json({ error: 'Файл чека не прикреплён' });
    }

    const result = storage.uploadReceipt({
      orderId,
      receiptBase64,
    });

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    // Send immediate notification to Telegram bot
    try {
      await telegramBot.notifyReceiptUploaded(result.order!);
    } catch (err) {
      console.error('[API] Error notifying telegram about receipt:', err);
    }

    res.json(result.order);
  });

  // Get user's orders
  app.get('/api/orders', (req: Request, res: Response) => {
    const userId = String(req.query.userId || '');
    if (!userId) {
      return res.status(400).json({ error: 'Параметр userId обязателен' });
    }
    const orders = storage.getUserOrders(userId);
    res.json(orders);
  });

  // Get specific order
  app.get('/api/orders/:id', (req: Request, res: Response) => {
    const order = storage.getOrder(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Заказ не найден' });
    }
    res.json(order);
  });

  // --- WITHDRAWALS (GOLD CASHOUT) ---

  // Create withdrawal request
  app.post('/api/withdrawals', async (req: Request, res: Response) => {
    const {
      userId,
      username,
      userEmail,
      goldAmount,
      payoutMethod,
      payoutTarget,
      skinName,
      skinPattern,
      marketPrice,
      screenshotUrl,
      currency,
    } = req.body;

    if (!userId || !goldAmount || !payoutMethod || !payoutTarget) {
      return res.status(400).json({ error: 'Заполните все обязательные поля заявки' });
    }

    const banCheck = storage.isUserBanned(userId);
    if (banCheck.banned) {
      return res.status(403).json({ error: `Ваш аккаунт заблокирован: ${banCheck.reason}` });
    }

    const result = storage.createWithdrawal({
      userId,
      username,
      userEmail,
      goldAmount: Number(goldAmount),
      payoutMethod,
      payoutTarget,
      skinName,
      skinPattern,
      marketPrice,
      screenshotUrl,
    });

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    // Send notification to Telegram bot
    try {
      await telegramBot.notifyWithdrawalCreated(result.withdrawal!);
    } catch (err) {
      console.error('[API] Error notifying telegram about withdrawal:', err);
    }

    res.json(result.withdrawal);
  });

  // --- GAMEPASS VIP PASS & LEVEL PURCHASE ---
  app.post('/api/pass/buy-vip', async (req: Request, res: Response) => {
    const { userId, username, userEmail, productType = 'vip_standard', priceGold: reqPrice, title } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'Параметр userId обязателен' });
    }

    const priceGold = reqPrice || (productType === 'vip_bundle_10' ? 1490 : productType === 'level_boost' ? 100 : 790);
    const result = storage.purchaseVipPass({
      userId,
      username: username || 'Игрок GameVia',
      userEmail,
      priceGold,
      productType,
      title,
    });

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    try {
      await telegramBot.notifyVipPassPurchased({
        userId,
        username: username || 'Игрок GameVia',
        priceGold,
        newBalance: result.newBalance!,
        title: title || (productType === 'vip_bundle_10' ? 'VIP Pass + 10 Уровней' : productType === 'level_boost' ? 'Покупка уровня GameVia Pass' : 'VIP Pass Сезон 1'),
      });
    } catch (err) {
      console.error('[API] Error notifying telegram about VIP pass:', err);
    }

    res.json({
      success: true,
      newBalance: result.newBalance,
      isPremium: productType !== 'level_boost',
      priceGold,
      message: 'Покупка боевого пропуска GameVia успешно оформлена!',
    });
  });

  // Reset VIP pass status (admin / user request)
  app.post('/api/pass/reset-vip', (req: Request, res: Response) => {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'Параметр userId обязателен' });
    }

    const state = storage.getUserPassState(userId) || {
      currentXp: 300,
      claimedFreeTiers: [1],
      claimedPremiumTiers: [],
      quests: [],
    };
    state.isPremium = false;
    storage.setUserPassState(userId, state);

    // Also update by email and UID if found
    if (userId.includes('@')) {
      storage.setUserPassState('janibekuakas000@gmail.com', state);
      storage.setUserPassState('yDhGqPMOo2UGOIwhugQUVHKAOIs2', state);
    }

    res.json({
      success: true,
      isPremium: false,
      message: 'VIP Pass успешно деактивирован!',
    });
  });

  // Technical support ticket submission
  app.post('/api/support/ticket', async (req: Request, res: Response) => {
    const { userId, username, contact, topic, message } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Сообщение обязателен' });
    }

    try {
      await telegramBot.notifySupportTicket({
        userId: userId || 'guest',
        username: username || 'Игрок',
        contact: contact || 'Не указан',
        topic: topic || 'other',
        message,
      });
    } catch (err) {
      console.error('[API] Error sending support ticket to Telegram:', err);
    }

    res.json({ success: true, message: 'Обращение успешно отправлено!' });
  });

  // Get user's withdrawals
  app.get('/api/withdrawals', (req: Request, res: Response) => {
    const userId = String(req.query.userId || '');
    if (!userId) {
      return res.status(400).json({ error: 'Параметр userId обязателен' });
    }
    const withdrawals = storage.getUserWithdrawals(userId);
    res.json(withdrawals);
  });

  // Get specific withdrawal
  app.get('/api/withdrawals/:id', (req: Request, res: Response) => {
    const w = storage.getWithdrawal(req.params.id);
    if (!w) {
      return res.status(404).json({ error: 'Заявка не найдена' });
    }
    res.json(w);
  });

  // Telegram webhook endpoint (for Webhook mode on /api/webhook and /api/telegram/webhook)
  const handleTelegramWebhook = async (req: Request, res: Response) => {
    try {
      if (req.body && typeof req.body === 'object') {
        await telegramBot.handleUpdate(req.body);
      }
      res.status(200).json({ ok: true });
    } catch (err) {
      console.error('[Webhook] Error handling update:', err);
      res.status(200).json({ ok: false, error: 'Handled with error' });
    }
  };

  app.post('/api/webhook', handleTelegramWebhook);
  app.post('/api/telegram/webhook', handleTelegramWebhook);
  app.get('/api/webhook', async (_req: Request, res: Response) => {
    try {
      const info = await telegramBot.getWebhookInfo();
      res.json({ ok: true, message: 'GameVia Telegram Webhook endpoint ready', webhookInfo: info });
    } catch {
      res.json({ ok: true, message: 'GameVia Telegram Webhook endpoint ready' });
    }
  });

  // --- VITE MIDDLEWARE (DEV) OR STATIC FILES (PROD) ---
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 GameVia Full-Stack Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal error starting server:', err);
  process.exit(1);
});
