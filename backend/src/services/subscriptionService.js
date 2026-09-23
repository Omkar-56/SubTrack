import { subscriptionModel } from '../models/subscriptionModel.js';
import { priceHistoryModel } from '../models/priceHistoryModel.js';
import { paymentModel } from '../models/paymentModel.js';
import { reminderModel } from '../models/reminderModel.js';
import { userModel } from '../models/userModel.js';
import { currencyService } from './currencyService.js';
import { ApiError } from '../utils/ApiError.js';

const CYCLE_TO_MONTHS = {
  weekly: 12 / 52,
  monthly: 1,
  quarterly: 3,
  yearly: 12,
};

export function parseDateParts(dateInput) {
  if (dateInput instanceof Date) {
    return new Date(dateInput.getFullYear(), dateInput.getMonth(), dateInput.getDate());
  }
  const str = String(dateInput).slice(0, 10);
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function formatDateString(d) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function addCycle(dateInput, cycle) {
  const d = parseDateParts(dateInput);
  if (cycle === 'weekly') {
    d.setDate(d.getDate() + 7);
    return d;
  }
  const monthsToAdd = { monthly: 1, quarterly: 3, yearly: 12 }[cycle] || 1;
  const originalDay = d.getDate();
  d.setMonth(d.getMonth() + monthsToAdd);
  if (d.getDate() < originalDay) {
    d.setDate(0);
  }
  return d;
}

export function getNextActiveRenewalDate(renewalDateInput, cycle, today = new Date()) {
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  let current = parseDateParts(renewalDateInput);

  let guard = 0;
  while (current < todayStart && guard < 500) {
    current = addCycle(current, cycle);
    guard += 1;
  }
  return formatDateString(current);
}

async function syncOverdueSubscriptions(userId, subscriptions) {
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  for (const sub of subscriptions) {
    if (sub.status === 'active' && !sub.isFreeTrial) {
      const subDate = parseDateParts(sub.nextRenewalDate);
      if (subDate < todayStart) {
        const nextDateStr = getNextActiveRenewalDate(sub.nextRenewalDate, sub.billingCycle, today);
        if (nextDateStr !== formatDateString(subDate)) {
          await subscriptionModel.updateRenewalDate(userId, sub.id, nextDateStr).catch(() => {});
          sub.nextRenewalDate = nextDateStr;
        }
      }
    }
  }
  return subscriptions;
}

function monthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function monthLabel(date) {
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

function amountAsOf(subscription, changes, at) {
  if (!changes || changes.length === 0) return Number(subscription.amount);

  let amount = null;
  for (const change of changes) {
    if (new Date(change.changedAt) <= at) {
      amount = Number(change.newAmount);
    } else {
      if (amount === null) amount = Number(change.oldAmount);
      break;
    }
  }
  return amount === null ? Number(subscription.amount) : amount;
}

async function resolveUserBaseCurrency(userId, overrideCurrency) {
  if (overrideCurrency && overrideCurrency.length === 3) {
    return overrideCurrency.toUpperCase();
  }
  const user = await userModel.findById(userId);
  return user?.baseCurrency || 'USD';
}

export const subscriptionService = {
  async list(userId) {
    const subs = await subscriptionModel.findAllForUser(userId);
    return syncOverdueSubscriptions(userId, subs);
  },

  async create(userId, data) {
    return subscriptionModel.create(userId, data);
  },

  async get(userId, id) {
    const sub = await subscriptionModel.findById(userId, id);
    if (!sub) throw new ApiError(404, 'Subscription not found');

    if (sub.status === 'active' && !sub.isFreeTrial) {
      const today = new Date();
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      if (parseDateParts(sub.nextRenewalDate) < todayStart) {
        const nextDateStr = getNextActiveRenewalDate(sub.nextRenewalDate, sub.billingCycle, today);
        await subscriptionModel.updateRenewalDate(userId, sub.id, nextDateStr).catch(() => {});
        sub.nextRenewalDate = nextDateStr;
      }
    }

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

  async convertTrial(userId, id, customRenewalDate = null) {
    const sub = await this.get(userId, id);
    if (!sub) throw new ApiError(404, 'Subscription not found');

    const baseDate = sub.trialEndDate || sub.nextRenewalDate;
    const nextDate = customRenewalDate || formatDateString(addCycle(baseDate, sub.billingCycle));
    
    const updated = await subscriptionModel.convertTrialToActive(userId, id, nextDate);
    
    // Mark pending trial reminders as dismissed/paid
    await reminderModel.markPaidForSubscription(userId, id);

    return updated;
  },

  async advanceCycle(userId, id) {
    const sub = await this.get(userId, id);
    const nextDate = addCycle(sub.nextRenewalDate, sub.billingCycle);
    const nextDateStr = formatDateString(nextDate);
    return subscriptionModel.updateRenewalDate(userId, id, nextDateStr);
  },

  async confirmPayment(userId, id, paymentData = {}) {
    const sub = await this.get(userId, id);
    const amount = Number(paymentData.amount) || Number(sub.amount);
    const currency = paymentData.currency || sub.currency;
    const paidDate = paymentData.paidDate || formatDateString(new Date());
    const notes = paymentData.notes || `Payment confirmed for ${sub.billingCycle} cycle`;

    // 1. Record payment history
    const payment = await paymentModel.create({
      userId,
      subscriptionId: sub.id,
      amount,
      currency,
      paidDate,
      billingCycle: sub.billingCycle,
      notes,
    });

    // 2. Advance renewal date to the next cycle
    const nextDate = addCycle(sub.nextRenewalDate, sub.billingCycle);
    const nextDateStr = formatDateString(nextDate);
    const updatedSub = await subscriptionModel.updateRenewalDate(userId, id, nextDateStr);

    // 3. Mark any pending reminders as paid
    await reminderModel.markPaidForSubscription(userId, id);

    return {
      subscription: updatedSub,
      payment,
    };
  },

  async getPayments(userId, id) {
    await this.get(userId, id);
    return paymentModel.findBySubscriptionId(userId, id);
  },

  async getAllPayments(userId, limit = 50) {
    return paymentModel.findRecentForUser(userId, limit);
  },

  async priceHistory(userId, id) {
    await this.get(userId, id);
    return priceHistoryModel.findForSubscription(userId, id);
  },

  async remove(userId, id) {
    const removed = await subscriptionModel.remove(userId, id);
    if (!removed) throw new ApiError(404, 'Subscription not found');
  },

  async dashboard(userId, { upcomingWithinDays = 14, currency = null } = {}) {
    const baseCurrency = await resolveUserBaseCurrency(userId, currency);
    const rawSubs = await subscriptionModel.findAllForUser(userId);
    const all = await syncOverdueSubscriptions(userId, rawSubs);
    const active = all.filter((s) => s.status === 'active');
    const paused = all.filter((s) => s.status === 'paused');
    const cancelled = all.filter((s) => s.status === 'cancelled');

    let totalMonthly = 0;
    const byCategory = {};

    for (const s of active) {
      const converted = await currencyService.convert(s.amount, s.currency, baseCurrency);
      const months = CYCLE_TO_MONTHS[s.billingCycle] || 1;
      const normalizedMonthly = converted / months;

      totalMonthly += normalizedMonthly;

      if (!byCategory[s.category]) {
        byCategory[s.category] = {
          category: s.category,
          monthlySpend: 0,
          count: 0,
          subscriptions: [],
        };
      }

      byCategory[s.category].monthlySpend += normalizedMonthly;
      byCategory[s.category].count += 1;
      byCategory[s.category].subscriptions.push({
        name: s.name,
        amount: converted,
        nativeAmount: Number(s.amount),
        currency: s.currency,
      });

      s.convertedAmount = converted;
      s.convertedMonthly = Number(normalizedMonthly.toFixed(2));
      s.baseCurrency = baseCurrency;
    }

    // Monthly Savings calculation (from Cancelled + Paused subscriptions)
    let monthlySavingsFromCancelled = 0;
    let monthlySavingsFromPaused = 0;

    for (const s of cancelled) {
      const converted = await currencyService.convert(s.amount, s.currency, baseCurrency);
      const months = CYCLE_TO_MONTHS[s.billingCycle] || 1;
      monthlySavingsFromCancelled += converted / months;
    }

    for (const s of paused) {
      const converted = await currencyService.convert(s.amount, s.currency, baseCurrency);
      const months = CYCLE_TO_MONTHS[s.billingCycle] || 1;
      monthlySavingsFromPaused += converted / months;
    }

    const totalMonthlySaved = monthlySavingsFromCancelled + monthlySavingsFromPaused;
    const totalYearlySaved = totalMonthlySaved * 12;

    const totalYearly = totalMonthly * 12;

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const cutoff = new Date(todayStart.getTime() + (upcomingWithinDays + 1) * 24 * 60 * 60 * 1000);

    const upcomingRenewals = active
      .filter((s) => {
        const d = parseDateParts(s.nextRenewalDate);
        return d >= todayStart && d <= cutoff;
      })
      .sort((a, b) => parseDateParts(a.nextRenewalDate) - parseDateParts(b.nextRenewalDate));

    // Active Free Trials with Sentinel metadata
    const activeTrials = [];
    for (const s of active.filter((item) => item.isFreeTrial)) {
      const deadline = s.cancellationDeadline || s.trialEndDate || s.nextRenewalDate;
      const d = parseDateParts(deadline);
      const daysLeft = Math.round((d.getTime() - todayStart.getTime()) / (24 * 60 * 60 * 1000));
      const convertedPostTrial = await currencyService.convert(
        s.postTrialAmount || s.amount,
        s.postTrialCurrency || s.currency,
        baseCurrency
      );

      activeTrials.push({
        ...s,
        effectiveDeadline: deadline,
        daysLeft,
        convertedPostTrialAmount: convertedPostTrial,
      });
    }

    activeTrials.sort((a, b) => a.daysLeft - b.daysLeft);

    const categoryBreakdown = Object.values(byCategory)
      .map((item) => ({
        category: item.category,
        monthlySpend: Number(item.monthlySpend.toFixed(2)),
        yearlySpend: Number((item.monthlySpend * 12).toFixed(2)),
        count: item.count,
        percentage: totalMonthly > 0 ? Number(((item.monthlySpend / totalMonthly) * 100).toFixed(1)) : 0,
        topSubscriptions: item.subscriptions.slice(0, 3),
      }))
      .sort((a, b) => b.monthlySpend - a.monthlySpend);

    const recentPriceIncreases = await priceHistoryModel.findRecentIncreasesForUser(userId, 30);

    for (const p of recentPriceIncreases) {
      p.convertedOld = await currencyService.convert(p.oldAmount, p.currency, baseCurrency);
      p.convertedNew = await currencyService.convert(p.newAmount, p.currency, baseCurrency);
      p.baseCurrency = baseCurrency;
    }

    // Pending Reminders
    const pendingReminders = await reminderModel.findPendingForUser(userId);

    return {
      baseCurrency,
      supportedCurrencies: currencyService.getSupportedCurrencies(),
      totalMonthly: Number(totalMonthly.toFixed(2)),
      totalYearly: Number(totalYearly.toFixed(2)),
      activeCount: active.length,
      pausedCount: paused.length,
      cancelledCount: cancelled.length,
      totalCount: all.length,
      trialsCount: activeTrials.length,
      activeTrials,
      savings: {
        monthlySaved: Number(totalMonthlySaved.toFixed(2)),
        yearlySaved: Number(totalYearlySaved.toFixed(2)),
        cancelledMonthly: Number(monthlySavingsFromCancelled.toFixed(2)),
        pausedMonthly: Number(monthlySavingsFromPaused.toFixed(2)),
        cancelledCount: cancelled.length,
        pausedCount: paused.length,
      },
      upcomingRenewals,
      categoryBreakdown,
      recentPriceIncreases,
      pendingReminders,
    };
  },

  async forecast(userId, months = 12, currency = null) {
    const baseCurrency = await resolveUserBaseCurrency(userId, currency);
    const rawSubs = await subscriptionModel.findAllForUser(userId);
    const all = await syncOverdueSubscriptions(userId, rawSubs);
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
      let occurrence = parseDateParts(s.nextRenewalDate);
      const chargeAmount = s.isFreeTrial && s.postTrialAmount !== null ? s.postTrialAmount : s.amount;
      const chargeCurrency = s.isFreeTrial && s.postTrialCurrency ? s.postTrialCurrency : s.currency;
      const convertedAmount = await currencyService.convert(chargeAmount, chargeCurrency, baseCurrency);

      let guard = 0;
      while (occurrence < windowEnd && guard < 500) {
        if (occurrence >= start) {
          const key = monthKey(occurrence);
          const bucket = buckets.get(key);
          if (bucket) {
            bucket.total += convertedAmount;
            bucket.charges.push({
              name: s.name,
              amount: convertedAmount,
              nativeAmount: Number(chargeAmount),
              nativeCurrency: chargeCurrency,
              date: formatDateString(occurrence),
            });
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

    return {
      baseCurrency,
      months: monthsOut,
    };
  },

  async trend(userId, months = 12, currency = null) {
    const baseCurrency = await resolveUserBaseCurrency(userId, currency);
    const rawSubs = await subscriptionModel.findAllForUser(userId);
    const all = await syncOverdueSubscriptions(userId, rawSubs);
    const active = all.filter((s) => s.status === 'active');
    const priceHistories = await priceHistoryModel.findAllForUser(userId);

    const historyBySub = new Map();
    for (const p of priceHistories) {
      if (!historyBySub.has(p.subscriptionId)) {
        historyBySub.set(p.subscriptionId, []);
      }
      historyBySub.get(p.subscriptionId).push(p);
    }

    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const result = [];

    for (let i = months - 1; i >= 0; i--) {
      const targetMonthDate = new Date(currentMonthStart);
      targetMonthDate.setMonth(targetMonthDate.getMonth() - i);

      const targetMonthEnd = new Date(targetMonthDate.getFullYear(), targetMonthDate.getMonth() + 1, 0, 23, 59, 59);

      let monthlySum = 0;

      for (const s of active) {
        const createdAt = new Date(s.createdAt);
        if (createdAt > targetMonthEnd) continue;

        const changes = historyBySub.get(s.id) || [];
        const rawAmount = amountAsOf(s, changes, targetMonthEnd);
        const converted = await currencyService.convert(rawAmount, s.currency, baseCurrency);

        const mFactor = CYCLE_TO_MONTHS[s.billingCycle] || 1;
        monthlySum += converted / mFactor;
      }

      result.push({
        month: monthKey(targetMonthDate),
        label: monthLabel(targetMonthDate),
        spend: Number(monthlySum.toFixed(2)),
      });
    }

    return {
      baseCurrency,
      trend: result,
    };
  },
};
