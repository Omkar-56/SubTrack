import { subscriptionService } from '../services/subscriptionService.js';
import { reminderService } from '../services/reminderService.js';
import { geminiService } from '../services/geminiService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const subscriptionController = {
  list: asyncHandler(async (req, res) => {
    const subscriptions = await subscriptionService.list(req.user.id);
    res.json({ subscriptions });
  }),

  create: asyncHandler(async (req, res) => {
    const subscription = await subscriptionService.create(req.user.id, req.body);
    res.status(201).json({ subscription });
  }),

  parseReceipt: asyncHandler(async (req, res) => {
    const { text, fileBase64, mimeType } = req.body;
    const defaultCurrency = req.user.baseCurrency || 'USD';

    // 1. Ask Gemini to extract structured subscriptions
    const extracted = await geminiService.parseReceiptOrDoc({
      text,
      fileBase64,
      mimeType,
      defaultCurrency,
    });

    // 2. Automatically create each subscription in the user's account
    const createdSubscriptions = [];
    for (const item of extracted) {
      const created = await subscriptionService.create(req.user.id, item);
      createdSubscriptions.push(created);
    }

    res.json({
      success: true,
      extractedCount: extracted.length,
      subscriptions: createdSubscriptions,
    });
  }),

  get: asyncHandler(async (req, res) => {
    const subscription = await subscriptionService.get(req.user.id, req.params.id);
    res.json({ subscription });
  }),

  update: asyncHandler(async (req, res) => {
    const subscription = await subscriptionService.update(req.user.id, req.params.id, req.body);
    res.json({ subscription });
  }),

  convertTrial: asyncHandler(async (req, res) => {
    const subscription = await subscriptionService.convertTrial(req.user.id, req.params.id, req.body?.nextRenewalDate);
    res.json({ subscription });
  }),

  advanceCycle: asyncHandler(async (req, res) => {
    const subscription = await subscriptionService.advanceCycle(req.user.id, req.params.id);
    res.json({ subscription });
  }),

  confirmPayment: asyncHandler(async (req, res) => {
    const result = await subscriptionService.confirmPayment(req.user.id, req.params.id, req.body);
    res.json(result);
  }),

  payments: asyncHandler(async (req, res) => {
    const payments = await subscriptionService.getPayments(req.user.id, req.params.id);
    res.json({ payments });
  }),

  allPayments: asyncHandler(async (req, res) => {
    const limit = Number(req.query.limit) || 50;
    const payments = await subscriptionService.getAllPayments(req.user.id, limit);
    res.json({ payments });
  }),

  priceHistory: asyncHandler(async (req, res) => {
    const history = await subscriptionService.priceHistory(req.user.id, req.params.id);
    res.json({ history });
  }),

  reminders: asyncHandler(async (req, res) => {
    const reminders = await reminderService.getUpcomingReminders(req.user.id);
    res.json({ reminders });
  }),

  dismissReminder: asyncHandler(async (req, res) => {
    await reminderService.dismiss(req.user.id, req.params.id);
    res.json({ success: true });
  }),

  triggerReminder: asyncHandler(async (req, res) => {
    const reminder = await reminderService.triggerImmediateReminder(req.user.id, req.params.id);
    res.json({ success: true, reminder });
  }),

  remove: asyncHandler(async (req, res) => {
    await subscriptionService.delete(req.user.id, req.params.id);
    res.status(204).end();
  }),
};
