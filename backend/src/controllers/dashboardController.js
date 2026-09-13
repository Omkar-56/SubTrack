import { subscriptionService } from '../services/subscriptionService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const dashboardController = {
  summary: asyncHandler(async (req, res) => {
    const days = Number(req.query.withinDays) || 14;
    const summary = await subscriptionService.dashboard(req.user.id, { upcomingWithinDays: days });
    res.json(summary);
  }),
};
