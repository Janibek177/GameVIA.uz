import { storage } from './storage';
import { GoldOrder, GoldWithdrawal } from './types';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8602393404:AAFqoBXz5cF_MxikIVFmcwZBxpoUlFK_x2M';
const API_BASE = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

class TelegramService {
  private isPolling = false;
  private pollOffset = 0;
  private pollAbortController: AbortController | null = null;

  constructor() {
    if (TELEGRAM_BOT_TOKEN && !process.env.VERCEL) {
      this.initRuntimeMode();
    } else {
      console.log('[Telegram Bot] Initialized in Serverless Webhook mode.');
    }
  }

  private async initRuntimeMode() {
    try {
      const info: any = await this.getWebhookInfo();
      const activeUrl = info?.result?.url || '';
      if (!activeUrl) {
        console.log('[Telegram Bot] No active Webhook URL found. Starting Long Polling...');
        this.startPolling();
      } else {
        console.log(`[Telegram Bot] Active Webhook detected (${activeUrl}). Polling skipped.`);
      }
    } catch (err) {
      console.warn('[Telegram Bot] Could not check webhook info, starting polling fallback:', err);
      this.startPolling();
    }
  }

  public startPolling() {
    if (this.isPolling || !TELEGRAM_BOT_TOKEN) return;
    this.isPolling = true;
    console.log('[Telegram Bot] Long polling worker started for @GamviaBot.');
    this.pollLoop();
  }

  public stopPolling() {
    this.isPolling = false;
    if (this.pollAbortController) {
      this.pollAbortController.abort();
      this.pollAbortController = null;
    }
  }

  private async pollLoop() {
    const allowedUpdates = encodeURIComponent(JSON.stringify(['message', 'callback_query']));
    while (this.isPolling) {
      try {
        this.pollAbortController = new AbortController();
        const res = await fetch(
          `${API_BASE}/getUpdates?offset=${this.pollOffset}&timeout=20&allowed_updates=${allowedUpdates}`,
          { signal: this.pollAbortController.signal }
        );

        if (res.status === 409) {
          console.warn('[Telegram Bot] 409 Conflict from getUpdates (webhook or another poller active). Stopping local polling.');
          this.stopPolling();
          return;
        }

        if (!res.ok) {
          await new Promise((r) => setTimeout(r, 3000));
          continue;
        }

        const data: any = await res.json();
        if (data.ok && Array.isArray(data.result)) {
          for (const update of data.result) {
            this.pollOffset = update.update_id + 1;
            await this.handleUpdate(update);
          }
        }
      } catch (err: any) {
        if (err?.name !== 'AbortError') {
          await new Promise((r) => setTimeout(r, 3000));
        }
      }
    }
  }

  /**
   * Set webhook URL on Telegram API
   */
  public async setWebhook(webhookUrl: string) {
    try {
      const res = await fetch(`${API_BASE}/setWebhook?url=${encodeURIComponent(webhookUrl)}`);
      const data = await res.json();
      console.log('[Telegram Bot] setWebhook response:', data);
      if (data?.ok) {
        this.stopPolling();
      }
      return data;
    } catch (err) {
      console.error('[Telegram Bot] setWebhook error:', err);
      throw err;
    }
  }

  /**
   * Check current Telegram Webhook status
   */
  public async getWebhookInfo() {
    try {
      const res = await fetch(`${API_BASE}/getWebhookInfo`);
      return await res.json();
    } catch (err) {
      console.error('[Telegram Bot] getWebhookInfo error:', err);
      throw err;
    }
  }

  private escapeHtml(value: any): string {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  public async handleUpdate(update: any) {
    try {
      // 1. Text Message (Commands & Chat)
      if (update.message) {
        const msg = update.message;
        const chatId = msg.chat?.id;
        const text = (msg.text || '').trim();
        const from = msg.from || {};
        if (!chatId) return;

        // A. Is user an Administrator?
        if (storage.isAdmin(chatId)) {
          if (text.startsWith('/start') || text.startsWith('/admin')) {
            storage.registerAdminChatId(chatId);
            await this.sendMessage(
              chatId,
              `👑 <b>Добро пожаловать в админ-панель GameVia!</b>\n\n` +
                `Вы авторизованы как администратор (@${from.username || from.first_name || 'Admin'}).\n\n` +
                `🛡️ <b>Защита входа активна:</b>\n` +
                `Когда любой новый пользователь нажимает Start в боте, ему блокируется доступ, а вам в ЛС приходит запрос с кнопками «✅ Разрешить» / «❌ Отклонить».\n\n` +
                `<b>Команды администратора:</b>\n` +
                `• /users — список запросов и пользователей\n` +
                `• /status — статус платформы и реквизиты\n` +
                `• /allow &lt;ID&gt; — открыть доступ пользователю по ID\n` +
                `• /ban &lt;ID&gt; — заблокировать доступ по ID\n\n` +
                `<i>Уведомления об оплатах и выводе скинов поступают сюда автоматически.</i>`,
              { parse_mode: 'HTML' }
            );
            return;
          }

          if (text.startsWith('/status')) {
            const config = storage.getPublicConfig();
            const admins = storage.getAdminChatIds();
            const users = storage.getAllBotUsers();
            const approvedCount = users.filter((u) => u.status === 'APPROVED').length;
            const pendingCount = users.filter((u) => u.status === 'PENDING').length;

            await this.sendMessage(
              chatId,
              `📊 <b>Статус платформы GameVia:</b>\n\n` +
                `• Курс Gold: 1 Gold = ${config.exchangeRate} ₽\n` +
                `• Карта для приёма: <code>${config.recipient.cardNumber}</code> (${config.recipient.bankName})\n` +
                `• Получатель: <b>${config.recipient.cardHolder}</b>\n` +
                `• Авторизованных админов: ${admins.length}\n` +
                `• Пользователей бота: ${approvedCount} одобрено, ${pendingCount} на рассмотрении\n` +
                `• Ваш Chat ID: <code>${chatId}</code>`,
              { parse_mode: 'HTML' }
            );
            return;
          }

          if (text.startsWith('/users')) {
            const users = storage.getAllBotUsers();
            if (users.length === 0) {
              await this.sendMessage(chatId, `📋 Список запросов к боту пока пуст.`, { parse_mode: 'HTML' });
              return;
            }

            let report = `📋 <b>Список пользователей бота GameVia:</b>\n\n`;
            for (const u of users) {
              const icon = u.status === 'APPROVED' ? '✅' : u.status === 'PENDING' ? '⏳' : '❌';
              const name = `@${u.username || u.firstName || 'User'}`;
              report += `${icon} <b>${name}</b> (ID: <code>${u.chatId}</code>) — ${u.status}\n`;
            }
            report += `\n<i>Используйте /allow ID или /ban ID для быстрого управления.</i>`;
            await this.sendMessage(chatId, report, { parse_mode: 'HTML' });
            return;
          }

          if (text.startsWith('/allow')) {
            const parts = text.split(/\s+/);
            const targetId = parts[1];
            if (!targetId) {
              await this.sendMessage(chatId, `⚠️ Укажите Telegram ID: <code>/allow 123456789</code>`, { parse_mode: 'HTML' });
              return;
            }
            storage.approveBotAccess(targetId, from.username || from.first_name);
            await this.sendMessage(chatId, `✅ Доступ пользователю <code>${targetId}</code> успешно РАЗРЕШЁН.`, { parse_mode: 'HTML' });
            await this.sendMessage(
              Number(targetId),
              `🎉 <b>Поздравляем! Администратор открыл вам доступ к боту GameVia!</b>\n\nТеперь вам доступны все функции бота. Напишите /start для продолжения.`,
              { parse_mode: 'HTML' }
            );
            return;
          }

          if (text.startsWith('/ban')) {
            const parts = text.split(/\s+/);
            const targetId = parts[1];
            if (!targetId) {
              await this.sendMessage(chatId, `⚠️ Укажите Telegram ID: <code>/ban 123456789</code>`, { parse_mode: 'HTML' });
              return;
            }
            storage.rejectBotAccess(targetId, from.username || from.first_name);
            await this.sendMessage(chatId, `❌ Доступ пользователю <code>${targetId}</code> ЗАБЛОКИРОВАН.`, { parse_mode: 'HTML' });
            await this.sendMessage(
              Number(targetId),
              `⛔ <b>Администратор закрыл вам доступ к боту GameVia.</b>`,
              { parse_mode: 'HTML' }
            );
            return;
          }

          return;
        }

        // B. Is user Rejected / Blocked?
        if (storage.isUserRejected(chatId)) {
          await this.sendMessage(
            chatId,
            `⛔ <b>Доступ к боту закрыт!</b>\n\n` +
              `Администратор отклонил ваш доступ к боту GameVia.\n` +
              `Если это ошибка, обратитесь в службу поддержки на сайте.`,
            { parse_mode: 'HTML' }
          );
          return;
        }

        // C. Is user Approved?
        if (storage.isUserApproved(chatId)) {
          if (text.startsWith('/start')) {
            await this.sendMessage(
              chatId,
              `🎮 <b>Добро пожаловать в официальный бот GameVia!</b>\n\n` +
                `✅ Ваш доступ подтверждён администратором.\n\n` +
                `Здесь вы получаете:\n` +
                `• Статусы ваших пополнений баланса Gold\n` +
                `• Оповещения о выводе скинов Standoff 2\n` +
                `• Ответы поддержки по вашим обращениям\n\n` +
                `📢 Наш канал: @GameV1A\n` +
                `🌐 Наш сайт: GameVia`,
              { parse_mode: 'HTML' }
            );
          } else {
            await this.sendMessage(
              chatId,
              `👋 Ваше сообщение получено. Администратор ответит вам при необходимости.`,
              { parse_mode: 'HTML' }
            );
          }
          return;
        }

        // D. NOT Approved yet (New user clicked /start or sent message) -> STRICT GATE!
        storage.requestBotAccess({
          chatId,
          username: from.username,
          firstName: from.first_name,
          lastName: from.last_name,
        });

        // 1. Tell user that access is locked and pending admin permission
        await this.sendMessage(
          chatId,
          `⏳ <b>Вход в бот заблокирован!</b>\n\n` +
            `Здравствуйте, <b>${from.first_name || 'Игрок'}</b>!\n` +
            `Бот GameVia работает в закрытом режиме с ручной авторизацией администратора.\n\n` +
            `📩 <b>Запрос на разрешение входа отправлен администратору в личные сообщения.</b>\n` +
            `Пожалуйста, ожидайте решения. Как только администратор нажмет «Разрешить доступ», бот автоматически откроется для вас!`,
          { parse_mode: 'HTML' }
        );

        // 2. Send instant alert with action buttons to Admin's PM
        await this.notifyAdminUserAccessRequest({
          chatId,
          username: from.username,
          firstName: from.first_name,
          lastName: from.last_name,
          messageText: text,
        });
      }

      // 2. Callback Queries (Inline Buttons clicks)
      if (update.callback_query) {
        await this.handleCallbackQuery(update.callback_query);
      }
    } catch (err) {
      console.error('[Telegram Bot] Error handling update:', err);
    }
  }

  private async handleCallbackQuery(cb: any) {
    const callbackId = cb.id;
    const data: string = cb.data || '';
    const from = cb.from || {};
    const message = cb.message;
    const chatId = message?.chat?.id ?? from.id;
    const messageId = message?.message_id;
    const adminName = this.escapeHtml(from.username ? `@${from.username}` : from.first_name || 'Admin');

    // Verify admin
    if (!storage.isAdmin(from.id)) {
      await this.answerCallback(callbackId, '⛔ У вас нет прав администратора GameVia', true);
      return;
    }

    // Ensure admin chat ID is saved if none registered yet
    if (from.id && storage.getAdminChatIds().length === 0) {
      storage.registerAdminChatId(Number(from.id));
    }

    // --- GATE: APPROVE / ALLOW USER TO START BOT ---
    if (data.startsWith('allow_usr:')) {
      const targetChatId = data.replace('allow_usr:', '');
      const userAccess = storage.approveBotAccess(targetChatId, from.username || from.first_name);

      await this.answerCallback(
        callbackId,
        `✅ Доступ пользователю ${targetChatId} разрешён!`,
        true
      );

      const rawDisplayName = userAccess?.username
        ? `@${userAccess.username}`
        : userAccess?.firstName
        ? `${userAccess.firstName} ${userAccess.lastName || ''}`.trim()
        : `ID: ${targetChatId}`;
      const targetDisplayName = this.escapeHtml(rawDisplayName);

      const updatedText =
        `✅ <b>ДОСТУП К БОТУ РАЗРЕШЁН!</b>\n\n` +
        `👤 Пользователь: <b>${targetDisplayName}</b>\n` +
        `🆔 Telegram ID: <code>${this.escapeHtml(targetChatId)}</code>\n` +
        `👨‍💼 Одобрил администратор: ${adminName} (${from.id})\n` +
        `🕒 Время решения: ${new Date().toLocaleTimeString('ru-RU')}\n\n` +
        `<i>Пользователь получил уведомление о том, что бот разблокирован.</i>`;

      await this.editMessageOrCaption(message, chatId, messageId, updatedText);

      // Notify the user in their private chat
      await this.sendMessage(
        Number(targetChatId),
        `🎉 <b>Поздравляем! Администратор одобрил ваш доступ к боту GameVia!</b>\n\n` +
          `Теперь вам открыты все функции бота.\n` +
          `Вы можете отслеживать свои заказы, заявки на вывод скинов и обращаться в поддержку.\n\n` +
          `Нажмите /start для начала работы!`,
        { parse_mode: 'HTML' }
      );
      return;
    }

    // --- GATE: DENY / BLOCK USER FROM BOT ---
    if (data.startsWith('deny_usr:')) {
      const targetChatId = data.replace('deny_usr:', '');
      const userAccess = storage.rejectBotAccess(targetChatId, from.username || from.first_name);

      await this.answerCallback(
        callbackId,
        `❌ Пользователю ${targetChatId} отказано в доступе.`,
        true
      );

      const rawDisplayName = userAccess?.username
        ? `@${userAccess.username}`
        : userAccess?.firstName
        ? `${userAccess.firstName} ${userAccess.lastName || ''}`.trim()
        : `ID: ${targetChatId}`;
      const targetDisplayName = this.escapeHtml(rawDisplayName);

      const updatedText =
        `❌ <b>В ДОСТУПЕ К БОТУ ОТКАЗАНО (ЗАБЛОКИРОВАН)</b>\n\n` +
        `👤 Пользователь: <b>${targetDisplayName}</b>\n` +
        `🆔 Telegram ID: <code>${this.escapeHtml(targetChatId)}</code>\n` +
        `👨‍💼 Отклонил администратор: ${adminName} (${from.id})\n` +
        `🕒 Время: ${new Date().toLocaleTimeString('ru-RU')}\n\n` +
        `<i>Пользователь заблокирован и не сможет пользоваться ботом.</i>`;

      await this.editMessageOrCaption(message, chatId, messageId, updatedText);

      // Notify the user in their private chat
      await this.sendMessage(
        Number(targetChatId),
        `⛔ <b>Администратор отклонил ваш запрос на доступ к боту GameVia.</b>\n\n` +
          `Вход в бот закрыт. Если у вас возникли вопросы, обратитесь к администрации на сайте.`,
        { parse_mode: 'HTML' }
      );
      return;
    }

    // A. Approve Order
    if (data.startsWith('app_ord:')) {
      const orderId = data.replace('app_ord:', '');
      const result = storage.approveOrder({
        orderId,
        adminId: from.id,
        adminUsername: from.username || from.first_name,
      });

      if (!result.success) {
        await this.answerCallback(callbackId, `⚠️ ${result.error}`, true);
        return;
      }

      const order = result.order!;
      const currencySymbol = order.currency === 'UZS' ? 'сум' : '₽';
      const displayAmount = (order.paymentAmount || order.paymentAmountRub).toLocaleString('ru-RU');

      if (result.alreadyProcessed) {
        await this.answerCallback(callbackId, `⚠️ Заказ ${orderId} уже был одобрен ранее.`, true);
      } else if (order.orderType === 'VIP_PASS') {
        await this.answerCallback(
          callbackId,
          `👑 VIP Pass для ${orderId} успешно активирован игроку!`,
          true
        );
      } else {
        await this.answerCallback(
          callbackId,
          `✅ Заказ ${orderId} успешно одобрен! Начислено ${order.totalGold} Gold.`,
          true
        );
      }

      const updatedText =
        order.orderType === 'VIP_PASS'
          ? `👑 <b>VIP PASS УСПЕШНО АКТИВИРОВАН!</b>\n\n` +
            `🆔 Заказ: <code>${this.escapeHtml(order.id)}</code>\n` +
            `👤 Игрок: <b>${this.escapeHtml(order.username)}</b> (ID: <code>${this.escapeHtml(order.userId)}</code>)\n` +
            `🎖 Тариф: <b>${this.escapeHtml(order.title || 'VIP Pass (Сезон 1)')}</b>\n` +
            `💵 Оплачено: <b>${displayAmount} ${currencySymbol}</b>\n` +
            `✨ Статус: <b>VIP Статус подтверждён</b>\n` +
            `👨‍💼 Одобрил: ${adminName} (${from.id})\n` +
            `🕒 Время решения: ${new Date().toLocaleTimeString('ru-RU')}`
          : `✅ <b>ОПЛАТА ОДОБРЕНА И ЗАЧИСЛЕНА!</b>\n\n` +
            `🆔 Заказ: <code>${this.escapeHtml(order.id)}</code>\n` +
            `👤 Игрок: <b>${this.escapeHtml(order.username)}</b> (ID: <code>${this.escapeHtml(order.userId)}</code>)\n` +
            `💰 Зачислено: <b>+${order.totalGold} Gold</b> (+${order.bonusGold} бонус)\n` +
            `💵 Сумма: <b>${displayAmount} ${currencySymbol}</b>\n` +
            `👨‍💼 Одобрил: ${adminName} (${from.id})\n` +
            `🕒 Время решения: ${new Date().toLocaleTimeString('ru-RU')}`;

      await this.editMessageOrCaption(message, chatId, messageId, updatedText);
      return;
    }

    // B. Reject Order
    if (data.startsWith('rej_ord:')) {
      const orderId = data.replace('rej_ord:', '');
      const result = storage.rejectOrder({
        orderId,
        adminId: from.id,
        adminUsername: from.username || from.first_name,
        reason: 'Чек не подтверждён в банке',
      });

      if (!result.success) {
        await this.answerCallback(callbackId, `⚠️ ${result.error}`, true);
        return;
      }

      const order = result.order!;
      const currencySymbol = order.currency === 'UZS' ? 'сум' : '₽';
      const displayAmount = (order.paymentAmount || order.paymentAmountRub).toLocaleString('ru-RU');

      if (result.alreadyProcessed) {
        await this.answerCallback(callbackId, `⚠️ Заказ ${orderId} уже был отклонён ранее.`, true);
      } else {
        await this.answerCallback(callbackId, `❌ Заказ ${orderId} отклонён. Gold не начислен.`, true);
      }

      const updatedText =
        `❌ <b>ОПЛАТА ОТКЛОНЕНА</b>\n\n` +
        `🆔 Заказ: <code>${this.escapeHtml(order.id)}</code>\n` +
        `👤 Игрок: <b>${this.escapeHtml(order.username)}</b> (ID: <code>${this.escapeHtml(order.userId)}</code>)\n` +
        `💵 Сумма: ${displayAmount} ${currencySymbol}\n` +
        `🚫 Причина: Чек не подтверждён в банке\n` +
        `👨‍💼 Отклонил: ${adminName}\n` +
        `🕒 Время: ${new Date().toLocaleTimeString('ru-RU')}`;

      await this.editMessageOrCaption(message, chatId, messageId, updatedText);
      return;
    }

    // C. Approve / Complete Withdrawal
    if (data.startsWith('app_wdr:')) {
      const withdrawalId = data.replace('app_wdr:', '');
      const result = storage.completeWithdrawal({
        withdrawalId,
        adminId: from.id,
        adminUsername: from.username || from.first_name,
      });

      if (!result.success) {
        await this.answerCallback(callbackId, `⚠️ ${result.error}`, true);
        return;
      }

      const w = result.withdrawal!;
      await this.answerCallback(
        callbackId,
        `✅ Выплата ${withdrawalId} подтверждена! Сумма: ${w.payoutAmount}.`,
        true
      );

      const skinDetails = w.skinPattern
        ? `\n🔫 Скин: <b>${this.escapeHtml(w.skinName || 'SO2')}</b>\n🎯 Паттерн (Pattern): <code>${this.escapeHtml(w.skinPattern)}</code>\n💰 Куплен за: <b>${this.escapeHtml(w.marketPrice || w.payoutAmount)}</b>\n`
        : '';

      const updatedText =
        `✅ <b>ВЫПЛАТА УСПЕШНО ЗАВЕРШЕНА!</b>\n\n` +
        `🆔 Заявка: <code>${this.escapeHtml(w.id)}</code>\n` +
        `👤 Игрок: <b>${this.escapeHtml(w.username)}</b> (ID: <code>${this.escapeHtml(w.userId)}</code>)\n` +
        `🪙 Списано: <b>${w.goldAmount} Gold</b>\n` +
        `💵 Выплачено: <b>${this.escapeHtml(w.payoutAmount)}</b>\n` +
        `🎯 Способ: ${this.escapeHtml(w.payoutMethodLabel)}\n` +
        `📋 Реквизиты: <code>${this.escapeHtml(w.payoutTarget)}</code>\n` +
        skinDetails +
        `👨‍💼 Подтвердил: ${adminName}\n` +
        `🕒 Время выплаты: ${new Date().toLocaleTimeString('ru-RU')}`;

      await this.editMessageOrCaption(message, chatId, messageId, updatedText);
      return;
    }

    // D. Reject Withdrawal (Refund Gold)
    if (data.startsWith('rej_wdr:')) {
      const withdrawalId = data.replace('rej_wdr:', '');
      const result = storage.rejectWithdrawal({
        withdrawalId,
        adminId: from.id,
        adminUsername: from.username || from.first_name,
        reason: 'Неверные реквизиты / отказ банка',
      });

      if (!result.success) {
        await this.answerCallback(callbackId, `⚠️ ${result.error}`, true);
        return;
      }

      const w = result.withdrawal!;
      if (result.alreadyProcessed) {
        await this.answerCallback(callbackId, `⚠️ Заявка ${withdrawalId} уже была отклонена ранее.`, true);
      } else {
        await this.answerCallback(
          callbackId,
          `❌ Заявка ${withdrawalId} отклонена. ${w.goldAmount} Gold возвращено игроку.`,
          true
        );
      }

      const skinInfo = w.skinPattern
        ? `\n🎯 Паттерн: <code>${this.escapeHtml(w.skinPattern)}</code> (${this.escapeHtml(w.skinName || 'SO2')})\n`
        : '';

      const updatedText =
        `❌ <b>ЗАЯВКА НА ВЫВОД ОТКЛОНЕНА (СРЕДСТВА ВОЗВРАЩЕНЫ)</b>\n\n` +
        `🆔 Заявка: <code>${this.escapeHtml(w.id)}</code>\n` +
        `👤 Игрок: <b>${this.escapeHtml(w.username)}</b> (ID: <code>${this.escapeHtml(w.userId)}</code>)\n` +
        `🪙 Возврат на баланс: <b>+${w.goldAmount} Gold</b>\n` +
        skinInfo +
        `🚫 Причина: Неверные реквизиты или отказ шлюза\n` +
        `👨‍💼 Администратор: ${adminName}\n` +
        `🕒 Время: ${new Date().toLocaleTimeString('ru-RU')}`;

      await this.editMessageOrCaption(message, chatId, messageId, updatedText);
      return;
    }
  }

  // --- Notification Methods ---
  public async notifyAdminUserAccessRequest(params: {
    chatId: number;
    username?: string;
    firstName?: string;
    lastName?: string;
    messageText?: string;
  }) {
    const adminChatIds = storage.getAdminChatIds();
    if (adminChatIds.length === 0) {
      console.warn('[Telegram] No admin chat IDs registered. Sending self-registration hint.');
      return;
    }

    const fullName = this.escapeHtml([params.firstName, params.lastName].filter(Boolean).join(' ') || 'Без имени');
    const userTag = params.username ? `@${this.escapeHtml(params.username)}` : 'нет юзернейма';

    const text =
      `🔔 <b>НОВЫЙ ЗАПРОС НА ДОСТУП К БОТУ GAMEVIA!</b>\n\n` +
      `Пользователь нажал кнопку <b>Start</b> и ожидает вашего разрешения на вход:\n\n` +
      `👤 <b>Имя:</b> ${fullName}\n` +
      `🔗 <b>Юзернейм:</b> ${userTag}\n` +
      `🆔 <b>Telegram ID:</b> <code>${this.escapeHtml(params.chatId)}</code>\n` +
      `💬 <b>Команда/текст:</b> <i>${this.escapeHtml(params.messageText || '/start')}</i>\n` +
      `🕒 <b>Время:</b> ${new Date().toLocaleString('ru-RU')}\n\n` +
      `<b>Разрешить пользователю войти в бот?</b>`;

    const inlineKeyboard = {
      inline_keyboard: [
        [
          { text: '✅ Разрешить доступ', callback_data: `allow_usr:${params.chatId}` },
          { text: '❌ Запретить вход', callback_data: `deny_usr:${params.chatId}` },
        ],
      ],
    };

    for (const adminId of adminChatIds) {
      // Don't send request to the user themselves if they happen to be listed in adminChatIds
      if (adminId === params.chatId) continue;
      try {
        await this.sendMessage(adminId, text, {
          parse_mode: 'HTML',
          reply_markup: inlineKeyboard,
        });
      } catch (err) {
        console.error(`[Telegram] Failed to send user access request to admin ${adminId}:`, err);
      }
    }
  }

  public async notifyReceiptUploaded(order: GoldOrder) {
    const adminChatIds = storage.getAdminChatIds();
    if (adminChatIds.length === 0) {
      console.warn('[Telegram] No admin chat IDs registered. Send /start to @GamviaBot to register as admin.');
      return;
    }

    const currencySymbol = order.currency === 'UZS' ? 'сум' : '₽';
    const displayAmount = (order.paymentAmount || order.paymentAmountRub).toLocaleString('ru-RU');
    const safeOrderId = this.escapeHtml(order.id);
    const safeUsername = this.escapeHtml(order.username);
    const safeUserId = this.escapeHtml(order.userId);
    const safeCard = this.escapeHtml(order.recipientCard);
    const safeBank = this.escapeHtml(order.recipientBank);
    const safeRecipient = this.escapeHtml(order.recipientName);

    let caption: string;
    let inlineKeyboard: any;

    if (order.orderType === 'VIP_PASS') {
      const passTitle = this.escapeHtml(order.title || '👑 GameVia VIP Pass');
      caption =
        `👑 <b>НОВАЯ ОПЛАТА VIP PASS #GAMEPASS</b>\n\n` +
        `🆔 Номер заказа: <code>${safeOrderId}</code>\n` +
        `👤 Игрок: <b>${safeUsername}</b> (ID: <code>${safeUserId}</code>)\n` +
        `🎖 Тариф: <b>${passTitle}</b>\n` +
        `💳 Сумма к оплате: <b>${displayAmount} ${currencySymbol}</b>\n` +
        `🏦 Реквизиты получателя:\n` +
        `• Карта: <code>${safeCard}</code>\n` +
        `• Банк: ${safeBank}\n` +
        `• Получатель: ${safeRecipient}\n` +
        `🕒 Время подачи: ${new Date(order.createdAt).toLocaleString('ru-RU')}\n\n` +
        `⚠️ <b>ВНИМАНИЕ АДМИНИСТРАТОРУ:</b>\n` +
        `1. Проверьте реальное поступление ${displayAmount} ${currencySymbol} в приложении банка.\n` +
        `2. Нажмите «Одобрить VIP Pass» для автоматической активации премиума у игрока!`;

      inlineKeyboard = {
        inline_keyboard: [
          [
            { text: '✅ Одобрить VIP Pass', callback_data: `app_ord:${order.id}` },
            { text: '❌ Отклонить чек', callback_data: `rej_ord:${order.id}` },
          ],
        ],
      };
    } else {
      caption =
        `📥 <b>НОВАЯ ОПЛАТА GOLD #ORD</b>\n\n` +
        `🆔 Номер заказа: <code>${safeOrderId}</code>\n` +
        `👤 Игрок: <b>${safeUsername}</b> (ID: <code>${safeUserId}</code>)\n` +
        `💰 Количество Gold: <b>${order.goldAmount} Gold</b> (+${order.bonusGold} бонус = <b>${order.totalGold} Gold</b>)\n` +
        `💳 Сумма к оплате: <b>${displayAmount} ${currencySymbol}</b>\n` +
        `🏦 Реквизиты получателя:\n` +
        `• Карта: <code>${safeCard}</code>\n` +
        `• Банк: ${safeBank}\n` +
        `• Получатель: ${safeRecipient}\n` +
        `🕒 Время подачи: ${new Date(order.createdAt).toLocaleString('ru-RU')}\n\n` +
        `⚠️ <b>ВНИМАНИЕ АДМИНИСТРАТОРУ:</b>\n` +
        `1. Откройте приложение вашего банка.\n` +
        `2. Проверьте реальное поступление ${displayAmount} ${currencySymbol}.\n` +
        `3. Нажмите кнопку «Одобрить» только после подтверждения в банке!`;

      inlineKeyboard = {
        inline_keyboard: [
          [
            { text: '✅ Одобрить и начислить Gold', callback_data: `app_ord:${order.id}` },
            { text: '❌ Отклонить чек', callback_data: `rej_ord:${order.id}` },
          ],
        ],
      };
    }

    for (const chatId of adminChatIds) {
      try {
        if (order.receiptUrl && order.receiptUrl.startsWith('data:image')) {
          // Send as photo with base64 buffer
          await this.sendPhotoBase64(chatId, order.receiptUrl, caption, inlineKeyboard);
        } else {
          await this.sendMessage(chatId, caption, {
            parse_mode: 'HTML',
            reply_markup: inlineKeyboard,
          });
        }
      } catch (err) {
        console.error(`[Telegram] Failed to notify admin ${chatId}:`, err);
      }
    }
  }

  public async notifyWithdrawalCreated(withdrawal: GoldWithdrawal) {
    const adminChatIds = storage.getAdminChatIds();
    if (adminChatIds.length === 0) {
      console.warn('[Telegram] No admin chat IDs registered. Send /start to @GamviaBot to register as admin.');
      return;
    }

    const safeSkinName = this.escapeHtml(withdrawal.skinName || 'Указан игроком');
    const safePattern = this.escapeHtml(withdrawal.skinPattern || '—');
    const safePrice = this.escapeHtml(withdrawal.marketPrice || withdrawal.payoutAmount);
    const safeTarget = this.escapeHtml(withdrawal.payoutTarget);

    let skinSection = '';
    if (withdrawal.skinPattern || withdrawal.skinName) {
      skinSection =
        `\n🛒 <b>ПАРАМЕТРЫ ВЫКУПА СКИНА В STANDOFF 2:</b>\n` +
        `🔫 Скин: <b>${safeSkinName}</b>\n` +
        `🎯 <b>НОМЕР ПАТТЕРНА (PATTERN):</b> <code>${safePattern}</code> ⚡\n` +
        `💰 <b>ВЫКУПИТЬ НА РЫНКЕ ЗА:</b> <code>${safePrice}</code>\n` +
        `👤 Игровой ID / Ник: <code>${safeTarget}</code>\n\n` +
        `📌 <b>Инструкция для администратора:</b>\n` +
        `1. Откройте рынок в Standoff 2 и найдите скин «${this.escapeHtml(withdrawal.skinName || 'SO2')}».\n` +
        `2. Найдите лот с паттерном <b>${safePattern}</b> по цене <b>${safePrice}</b>.\n` +
        `3. Купите скин и нажмите кнопку «✅ Одобрить и выплатить».\n`;
    }

    const text =
      `📤 <b>НОВАЯ ЗАЯВКА НА ВЫВОД GOLD #WDR</b>\n\n` +
      `🆔 Номер заявки: <code>${this.escapeHtml(withdrawal.id)}</code>\n` +
      `👤 Игрок: <b>${this.escapeHtml(withdrawal.username)}</b> (ID: <code>${this.escapeHtml(withdrawal.userId)}</code>)\n` +
      `🪙 Списано с баланса: <b>${withdrawal.goldAmount} Gold</b>\n` +
      `💵 Сумма к выплате: <b>${this.escapeHtml(withdrawal.payoutAmount)}</b>\n` +
      `🎯 Способ вывода: <b>${this.escapeHtml(withdrawal.payoutMethodLabel)}</b>\n` +
      `📋 Реквизиты получателя:\n` +
      `<code>${safeTarget}</code>\n` +
      skinSection +
      `🕒 Время заявки: ${new Date(withdrawal.createdAt).toLocaleString('ru-RU')}\n\n` +
      `<i>Средства игрока уже надёжно зарезервированы на сервере. После выполнения перевода / покупки лота нажмите «Одобрить и выплатить».</i>`;

    const inlineKeyboard = {
      inline_keyboard: [
        [
          { text: '✅ Одобрить и выплатить', callback_data: `app_wdr:${withdrawal.id}` },
          { text: '❌ Отклонить (возврат Gold)', callback_data: `rej_wdr:${withdrawal.id}` },
        ],
      ],
    };

    let imageToSend = withdrawal.screenshotUrl || withdrawal.playerAvatarUrl;

    for (const chatId of adminChatIds) {
      try {
        if (imageToSend && imageToSend.startsWith('data:image')) {
          await this.sendPhotoBase64(chatId, imageToSend, text, inlineKeyboard);
        } else {
          await this.sendMessage(chatId, text, {
            parse_mode: 'HTML',
            reply_markup: inlineKeyboard,
          });
        }
      } catch (err) {
        console.error(`[Telegram] Failed to notify admin ${chatId} about withdrawal:`, err);
      }
    }
  }

  public async notifyVipPassPurchased(params: {
    userId: string;
    username: string;
    priceGold: number;
    newBalance: number;
    title?: string;
  }) {
    const adminChatIds = storage.getAdminChatIds();
    if (adminChatIds.length === 0) return;

    const passTitle = this.escapeHtml(params.title || 'GameVia VIP Pass (Сезон 1 «Огненный Штурм»)');
    const text =
      `👑 <b>ПОКУПКА БОЕВОГО ПРОПУСКА #GAMEVIA</b>\n\n` +
      `👤 Игрок: <b>${this.escapeHtml(params.username)}</b> (ID: <code>${this.escapeHtml(params.userId)}</code>)\n` +
      `🔥 Товар: <b>${passTitle}</b>\n` +
      `💰 Списано с баланса: <b>${params.priceGold} Gold</b>\n` +
      `🪙 Текущий баланс игрока: <b>${params.newBalance.toLocaleString('ru-RU')} Gold</b>\n` +
      `🕒 Время: ${new Date().toLocaleString('ru-RU')}`;

    for (const chatId of adminChatIds) {
      try {
        await this.sendMessage(chatId, text, { parse_mode: 'HTML' });
      } catch (err) {
        console.error(`[Telegram] Failed to notify vip pass:`, err);
      }
    }
  }

  public async notifySupportTicket(params: {
    userId: string;
    username: string;
    contact: string;
    topic: string;
    message: string;
  }) {
    const adminChatIds = storage.getAdminChatIds();
    if (adminChatIds.length === 0) return;

    const topicLabels: Record<string, string> = {
      withdraw: 'Вывод Gold / Выкуп скина',
      deposit: 'Пополнение баланса',
      pass: 'Боевой пропуск GamePass',
      other: 'Другой вопрос',
    };

    const text =
      `💬 <b>НОВОЕ ОБРАЩЕНИЕ В ТЕХПОДДЕРЖКУ #SUPPORT</b>\n\n` +
      `👤 Игрок: <b>${this.escapeHtml(params.username)}</b> (ID: <code>${this.escapeHtml(params.userId)}</code>)\n` +
      `📞 Контакт: <code>${this.escapeHtml(params.contact)}</code>\n` +
      `📌 Тема: <b>${this.escapeHtml(topicLabels[params.topic] || params.topic)}</b>\n\n` +
      `📝Сообщение:\n<i>${this.escapeHtml(params.message)}</i>\n\n` +
      `🕒 Время обращения: ${new Date().toLocaleString('ru-RU')}`;

    for (const chatId of adminChatIds) {
      try {
        await this.sendMessage(chatId, text, { parse_mode: 'HTML' });
      } catch (err) {
        console.error(`[Telegram] Failed to notify support ticket:`, err);
      }
    }
  }

  // --- Telegram API Helpers ---
  private async sendMessage(chatId: number | string, text: string, options: any = {}) {
    const payload = {
      chat_id: chatId,
      text,
      ...options,
    };
    const res = await fetch(`${API_BASE}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      console.warn(`[Telegram] sendMessage failed for chat ${chatId}:`, errText);
    }
    return res;
  }

  private async sendPhotoBase64(chatId: number | string, dataUrl: string, caption: string, replyMarkup?: any) {
    try {
      const parts = dataUrl.split(',');
      const mime = parts[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
      const buffer = Buffer.from(parts[1], 'base64');
      const filename = `receipt_${Date.now()}.${mime.includes('png') ? 'png' : 'jpg'}`;

      // Telegram caption limit is 1024 characters
      const safeCaption = caption.length > 1020 ? caption.slice(0, 1017) + '...' : caption;

      const formData = new FormData();
      formData.append('chat_id', chatId.toString());
      formData.append('caption', safeCaption);
      formData.append('parse_mode', 'HTML');
      if (replyMarkup) {
        formData.append('reply_markup', JSON.stringify(replyMarkup));
      }
      formData.append('photo', new Blob([buffer], { type: mime }), filename);

      const res = await fetch(`${API_BASE}/sendPhoto`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        // Fallback to text message if photo fails
        const errText = await res.text();
        console.warn('[Telegram] sendPhoto failed, falling back to sendMessage:', errText);
        await this.sendMessage(chatId, `${caption}\n\n<i>[Скриншот лота/чек загружен игроком и сохранён на сервере]</i>`, {
          parse_mode: 'HTML',
          reply_markup: replyMarkup,
        });
      }
    } catch (err) {
      console.error('[Telegram] Error sending base64 photo:', err);
    }
  }

  private async answerCallback(callbackId: string, text: string, showAlert = false) {
    try {
      const res = await fetch(`${API_BASE}/answerCallbackQuery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          callback_query_id: callbackId,
          text,
          show_alert: showAlert,
        }),
      });
      if (!res.ok) {
        console.warn('[Telegram] answerCallbackQuery error:', await res.text());
      }
      return res;
    } catch (err) {
      console.error('[Telegram] answerCallbackQuery exception:', err);
    }
  }

  private async editMessageOrCaption(
    message: any,
    chatId: number | string | undefined,
    messageId: number | undefined,
    text: string
  ) {
    if (!chatId || !messageId) return;
    const isMedia = Boolean(
      typeof message?.caption === 'string' ||
        (Array.isArray(message?.photo) && message.photo.length > 0) ||
        message?.document ||
        message?.video
    );

    if (isMedia) {
      const res = await this.editCaption(chatId, messageId, text);
      if (res && !res.ok) {
        const errBody = await res.text().catch(() => '');
        if (!errBody.includes('message is not modified')) {
          console.warn('[Telegram] editMessageCaption error:', errBody);
        }
      }
      return;
    }

    const res = await this.editMessage(chatId, messageId, text);
    if (res && !res.ok) {
      const errBody = await res.text().catch(() => '');
      if (errBody.includes('there is no text in the message to edit')) {
        await this.editCaption(chatId, messageId, text);
      } else if (!errBody.includes('message is not modified')) {
        console.warn('[Telegram] editMessageText error:', errBody);
      }
    }
  }

  private async editMessage(chatId: number | string, messageId: number, text: string) {
    return fetch(`${API_BASE}/editMessageText`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        message_id: messageId,
        text,
        parse_mode: 'HTML',
      }),
    });
  }

  private async editCaption(chatId: number | string, messageId: number, caption: string) {
    const safeCaption = caption.length > 1020 ? caption.slice(0, 1017) + '...' : caption;
    return fetch(`${API_BASE}/editMessageCaption`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        message_id: messageId,
        caption: safeCaption,
        parse_mode: 'HTML',
      }),
    });
  }
}

export const telegramBot = new TelegramService();
