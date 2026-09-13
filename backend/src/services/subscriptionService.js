import { subscriptionModel } from '../models/subscriptionModel.js';
import { ApiError } from '../utils/ApiError.js';

const CYCLE_TO_MONTHS = {
  weekly: 12 / 52,
  monthly: 1,
  quarterly: 3,
  yearly: 12,
};

export function monthlyEquivalent(subscription) {
  const months = CYCLE_TO_MONTHS[subscription.billingCycle];
  return Number(subscription.amount) / months;
}

export const subscriptionService = {
  async list(userId) {
    return subscriptionModel.findAllForUser(userId);
  },

  async create(userId, data) {
    return subscriptionModel.create(userId, data);
  },

  async get(userId, id) {
    const sub = await subscriptionModel.findById(userId, id);
    if (!sub) throw new ApiError(404, 'Subscription not found');
    return sub;
  },

  async update(userId, id, data) {
    const updated = await subscriptionModel.update(userId, id, data);
    if (!updated) throw new ApiError(404, 'Subscription not found');
    return updated;
  },

  async remove(userId, id) {
    const removed = await subscriptionModel.remove(userId, id);
    if (!removed) throw new ApiError(404, 'Subscription not found');
  },

  async dashboard(userId, { upcomingWithinDays = 14 } = {}) {
    const all = await subscriptionModel.findAllForUser(userId);
    const active = all.filter((s) => s.status === 'active');

    const totalMonthly = active.reduce((sum, s) => sum + monthlyEquivalent(s), 0);
    const totalYearly = totalMonthly * 12;

    const now = new Date();
    const cutoff = new Date(now.getTime() + upcomingWithinDays * 24 * 60 * 60 * 1000);
    const upcomingRenewals = active
      .filter((s) => {
        const d = new Date(s.nextRenewalDate);
        return d >= now && d <= cutoff;
      })
      .sort((a, b) => new Date(a.nextRenewalDate) - new Date(b.nextRenewalDate));

    const byCategory = {};
    for (const s of active) {
      byCategory[s.category] = (byCategory[s.category] || 0) + monthlyEquivalent(s);
    }
    const categoryBreakdown = Object.entries(byCategory)
      .map(([category, monthlySpend]) => ({
        category,
        monthlySpend: Number(monthlySpend.toFixed(2)),
      }))
      .sort((a, b) => b.monthlySpend - a.monthlySpend);

    return {
      totalMonthly: Number(totalMonthly.toFixed(2)),
      totalYearly: Number(totalYearly.toFixed(2)),
      activeCount: active.length,
      totalCount: all.length,
      upcomingRenewals,
      categoryBreakdown,
    };
  },
};
