import type { IncomingMessage, ServerResponse } from 'http';
import { telegramBot } from '../src/server/telegram';

interface VercelReq extends IncomingMessage {
  body: any;
  query: Record<string, string>;
  method?: string;
}

interface VercelRes extends ServerResponse {
  status: (statusCode: number) => VercelRes;
  json: (data: any) => VercelRes;
  send: (data: any) => VercelRes;
  setHeader: (name: string, value: string) => this;
}

/**
 * Vercel Serverless Function: Telegram Webhook Handler
 * Route: /api/webhook
 * Method: POST (from Telegram API) & GET (health check / info)
 */
export default async function handler(req: VercelReq, res: VercelRes) {
  // Allow health-check / status via GET
  if (req.method === 'GET') {
    try {
      const info = await telegramBot.getWebhookInfo();
      return res.status(200).json({
        ok: true,
        message: 'GameVia Telegram Webhook is active and listening for POST updates!',
        webhookInfo: info,
      });
    } catch (err: any) {
      return res.status(200).json({
        ok: true,
        message: 'GameVia Telegram Webhook endpoint ready for POST updates',
        error: err?.message,
      });
    }
  }

  // Telegram exclusively sends updates as POST requests
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, GET');
    return res.status(405).json({
      ok: false,
      error: 'Method Not Allowed. Telegram Webhook requires HTTP POST.',
    });
  }

  try {
    let update = req.body;

    // Parse body if it arrived as a raw string or buffer
    if (typeof update === 'string') {
      try {
        update = JSON.parse(update);
      } catch (parseErr) {
        console.error('[Vercel Webhook] JSON parse error:', parseErr);
        return res.status(400).json({ ok: false, error: 'Invalid JSON body' });
      }
    }

    if (!update || typeof update !== 'object') {
      return res.status(400).json({ ok: false, error: 'Empty update payload' });
    }

    // Process update through the bot's business logic
    // (chat commands, admin authorization, order approvals, skin withdrawals, etc.)
    await telegramBot.handleUpdate(update);

    // Telegram Bot API requires HTTP 200 OK to acknowledge receipt
    return res.status(200).json({ ok: true });
  } catch (err: any) {
    console.error('[Vercel Webhook] Error processing update:', err);
    // Returning 200 OK prevents Telegram from spamming retries on application bugs
    return res.status(200).json({ ok: false, error: err?.message || 'Handled with error' });
  }
}
