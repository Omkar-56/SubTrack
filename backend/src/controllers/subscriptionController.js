import { subscriptionService } from '../services/subscriptionService.js';
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

  advanceCycle: asyncHandler(async (req, res) => {
    const subscription = await subscriptionService.advanceCycle(req.user.id, req.params.id);
    res.json({ subscription });
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
