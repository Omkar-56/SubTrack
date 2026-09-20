import { subscriptionService } from '../services/subscriptionService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const dashboardController = {
  summary: asyncHandler(async (req, res) => {
    const days = Number(req.query.withinDays) || 14;
    const summary = await subscriptionService.dashboard(req.user.id, { upcomingWithinDays: days });
    res.json(summary);
  }),

  forecast: asyncHandler(async (req, res) => {
    const months = Number(req.query.months) || 12;
    const forecast = await subscriptionService.forecast(req.user.id, months);
    res.json(forecast);
  }),
};
