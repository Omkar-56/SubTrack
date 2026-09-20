import { subscriptionModel } from '../models/subscriptionModel.js';
import { priceHistoryModel } from '../models/priceHistoryModel.js';
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

function addCycle(date, cycle) {
  const d = new Date(date);
  if (cycle === 'weekly') {
    d.setDate(d.getDate() + 7);
  } else {
    const monthsToAdd = { monthly: 1, quarterly: 3, yearly: 12 }[cycle];
    d.setMonth(d.getMonth() + monthsToAdd);
  }
  return d;
}

function monthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function monthLabel(date) {
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
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
    const existing = await subscriptionModel.findById(userId, id);
    if (!existing) throw new ApiError(404, 'Subscription not found');

    const updated = await subscriptionModel.update(userId, id, data);

    if (Number(existing.amount) !== Number(data.amount)) {
      await priceHistoryModel.record(id, existing.amount, data.amount);
    }

    return updated;
  },

  async priceHistory(userId, id) {
    await this.get(userId, id); // ensures ownership, throws 404 otherwise
    return priceHistoryModel.findForSubscription(userId, id);
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

    const recentPriceIncreases = await priceHistoryModel.findRecentIncreasesForUser(userId, 30);

    return {
      totalMonthly: Number(totalMonthly.toFixed(2)),
      totalYearly: Number(totalYearly.toFixed(2)),
      activeCount: active.length,
      totalCount: all.length,
      upcomingRenewals,
      categoryBreakdown,
      recentPriceIncreases,
    };
  },

  async forecast(userId, months = 12) {
    const all = await subscriptionModel.findAllForUser(userId);
    const active = all.filter((s) => s.status === 'active');

    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const windowEnd = new Date(start);
    windowEnd.setMonth(windowEnd.getMonth() + months);

    const buckets = new Map();
    for (let i = 0; i < months; i++) {
      const d = new Date(start);
      d.setMonth(d.getMonth() + i);
      buckets.set(monthKey(d), { month: monthKey(d), label: monthLabel(d), total: 0, charges: [] });
    }

    for (const s of active) {
      let occurrence = new Date(s.nextRenewalDate);
      // safety cap so a bad weekly cycle can't loop indefinitely
      let guard = 0;
      while (occurrence < windowEnd && guard < 500) {
        if (occurrence >= start) {
          const key = monthKey(occurrence);
          const bucket = buckets.get(key);
          if (bucket) {
            bucket.total += Number(s.amount);
            bucket.charges.push({ name: s.name, amount: Number(s.amount), date: occurrence.toISOString().slice(0, 10) });
          }
        }
        occurrence = addCycle(occurrence, s.billingCycle);
        guard += 1;
      }
    }

    const monthsOut = Array.from(buckets.values()).map((b) => ({
      ...b,
      total: Number(b.total.toFixed(2)),
    }));

    return { months: monthsOut };
  },
};
