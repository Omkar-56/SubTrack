import { PLANS, PLAN_IDS, PLAN_STATUS } from '../config/plans.js';
import { planModel } from '../models/planModel.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';

export const planController = {
  // Public catalog of available plans
  getCatalog: asyncHandler(async (req, res) => {
    res.json({ plans: PLANS });
  }),

  // Current authenticated user's plan, limits, and usage
  getMyPlan: asyncHandler(async (req, res) => {
    const details = await planModel.getUserPlanDetails(req.user.id);
    if (!details) {
      throw new ApiError(404, 'User not found');
    }
    res.json(details);
  }),

  // Subscribe / change user plan
  subscribe: asyncHandler(async (req, res) => {
    const { plan, billingCycle, paymentProvider, amount, currency, providerSubscriptionId } = req.body;
    if (!plan || !PLANS[plan]) {
      throw new ApiError(400, 'Invalid plan specified');
    }

    // Set expiration based on billingCycle
    let currentPeriodEnd = null;
    let trialEndsAt = null;
    const now = new Date();

    if (plan === PLAN_IDS.PRO) {
      if (billingCycle === 'yearly') {
        const d = new Date(now);
        d.setFullYear(d.getFullYear() + 1);
        currentPeriodEnd = d;
      } else {
        const d = new Date(now);
        d.setMonth(d.getMonth() + 1);
        currentPeriodEnd = d;
      }
    }

    const order = await planModel.createSubscription({
      userId: req.user.id,
      plan,
      billingCycle: plan === PLAN_IDS.LIFETIME ? 'lifetime' : (billingCycle || 'monthly'),
      status: PLAN_STATUS.ACTIVE,
      amount: amount || 0,
      currency: currency || 'USD',
      paymentProvider: paymentProvider || 'manual',
      providerSubscriptionId: providerSubscriptionId || null,
      currentPeriodStart: now,
      currentPeriodEnd,
      trialEndsAt,
    });

    const updatedPlanDetails = await planModel.getUserPlanDetails(req.user.id);
    res.status(201).json({ order, plan: updatedPlanDetails });
  }),

  // Cancel subscription
  cancel: asyncHandler(async (req, res) => {
    const { immediately } = req.body;
    const result = await planModel.cancelSubscription(req.user.id, { immediately: Boolean(immediately) });
    res.json({ success: true, plan: result });
  }),

  // Invoices & transaction history
  getInvoices: asyncHandler(async (req, res) => {
    const history = await planModel.getSubscriptionHistory(req.user.id);
    res.json({ invoices: history });
  }),
};
