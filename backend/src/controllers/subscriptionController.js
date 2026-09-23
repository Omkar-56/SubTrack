import { subscriptionService } from '../services/subscriptionService.js';
import { reminderService } from '../services/reminderService.js';
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

  reminders: asyncHandler(async (req, res) => {
    const reminders = await reminderService.getPendingReminders(req.user.id);
    res.json({ reminders });
  }),

  dismissReminder: asyncHandler(async (req, res) => {
    await reminderService.dismissReminder(req.user.id, req.params.id);
    res.json({ success: true });
  }),

  triggerReminder: asyncHandler(async (req, res) => {
    const reminder = await reminderService.triggerManualReminder(req.user.id, req.params.id);
    res.json({ reminder });
  }),

  remove: asyncHandler(async (req, res) => {
    await subscriptionService.remove(req.user.id, req.params.id);
    res.status(204).send();
  }),

  priceHistory: asyncHandler(async (req, res) => {
    const history = await subscriptionService.priceHistory(req.user.id, req.params.id);
    res.json({ history });
  }),
};
