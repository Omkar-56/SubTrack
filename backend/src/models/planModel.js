import { query } from '../config/db.js';
import { userModel } from './userModel.js';
import { subscriptionModel } from './subscriptionModel.js';
import { PLANS, PLAN_IDS, PLAN_STATUS, getPlanConfig, isProOrLifetime } from '../config/plans.js';

const PLAN_SUB_COLUMNS = `
  id,
  user_id AS "userId",
  plan,
  billing_cycle AS "billingCycle",
  status,
  amount,
  currency,
  payment_provider AS "paymentProvider",
  provider_customer_id AS "providerCustomerId",
  provider_subscription_id AS "providerSubscriptionId",
  provider_payment_id AS "providerPaymentId",
  current_period_start AS "currentPeriodStart",
  current_period_end AS "currentPeriodEnd",
  trial_ends_at AS "trialEndsAt",
  cancel_at_period_end AS "cancelAtPeriodEnd",
  cancelled_at AS "cancelledAt",
  created_at AS "createdAt",
  updated_at AS "updatedAt"
`;

export const planModel = {
  /**
   * Create a new subscription or lifetime purchase order, and update the user record.
   */
  async createSubscription({
    userId,
    plan,
    billingCycle = null,
    status = PLAN_STATUS.ACTIVE,
    amount = 0,
    currency = 'USD',
    paymentProvider = 'manual',
    providerCustomerId = null,
    providerSubscriptionId = null,
    providerPaymentId = null,
    currentPeriodStart = new Date(),
    currentPeriodEnd = null,
    trialEndsAt = null,
  }) {
    // 1. Insert order record into user_plan_subscriptions
    const { rows } = await query(
      `INSERT INTO user_plan_subscriptions (
        user_id, plan, billing_cycle, status, amount, currency,
        payment_provider, provider_customer_id, provider_subscription_id, provider_payment_id,
        current_period_start, current_period_end, trial_ends_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING ${PLAN_SUB_COLUMNS}`,
      [
        userId,
        plan,
        billingCycle,
        status,
        amount,
        currency,
        paymentProvider,
        providerCustomerId,
        providerSubscriptionId,
        providerPaymentId,
        currentPeriodStart,
        currentPeriodEnd,
        trialEndsAt,
      ]
    );

    const createdOrder = rows[0];

    // 2. Synchronize user table plan details
    await userModel.updatePlan(userId, {
      plan,
      planStatus: status,
      billingCycle,
      currentPeriodStart,
      currentPeriodEnd,
      trialEndsAt,
      cancelAtPeriodEnd: false,
      customerId: providerCustomerId,
      subscriptionExternalId: providerSubscriptionId,
    });

    return createdOrder;
  },

  /**
   * Get comprehensive plan state, limits, and usage for a user.
   */
  async getUserPlanDetails(userId) {
    const user = await userModel.findById(userId);
    if (!user) return null;

    const quota = await userModel.getAiScanQuota(userId);
    const activeSubsCount = await subscriptionModel.countActiveForUser(userId);
    const planConfig = getPlanConfig(user.plan);
    const isPro = isProOrLifetime(user);

    // Fetch the latest active subscription record if any
    const { rows: subRows } = await query(
      `SELECT ${PLAN_SUB_COLUMNS}
       FROM user_plan_subscriptions
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 1`,
      [userId]
    );

    const latestSubscription = subRows[0] || null;

    return {
      plan: user.plan || PLAN_IDS.STARTER,
      planName: planConfig.name,
      planBadge: planConfig.badge,
      planStatus: user.planStatus || PLAN_STATUS.ACTIVE,
      billingCycle: user.billingCycle || null,
      isPro,
      currentPeriodStart: user.currentPeriodStart,
      currentPeriodEnd: user.currentPeriodEnd,
      trialEndsAt: user.trialEndsAt,
      cancelAtPeriodEnd: Boolean(user.cancelAtPeriodEnd),
      usage: {
        activeSubscriptions: {
          current: activeSubsCount,
          limit: planConfig.limits.maxActiveSubscriptions,
          canAddMore: isPro || activeSubsCount < planConfig.limits.maxActiveSubscriptions,
        },
        aiScans: {
          used: quota?.aiScansUsed || 0,
          limit: planConfig.limits.monthlyAiScans,
          remaining: isPro ? 'unlimited' : Math.max(0, planConfig.limits.monthlyAiScans - (quota?.aiScansUsed || 0)),
          resetsAt: quota?.aiScansResetAt || null,
        },
      },
      entitlements: planConfig.limits,
      latestSubscription,
    };
  },

  /**
   * Cancel user plan subscription at period end or immediately.
   */
  async cancelSubscription(userId, { immediately = false } = {}) {
    if (immediately) {
      await userModel.updatePlan(userId, {
        plan: PLAN_IDS.STARTER,
        planStatus: PLAN_STATUS.ACTIVE,
        billingCycle: null,
        currentPeriodEnd: null,
        trialEndsAt: null,
        cancelAtPeriodEnd: false,
      });

      await query(
        `UPDATE user_plan_subscriptions
         SET status = $2, cancelled_at = now(), updated_at = now()
         WHERE user_id = $1 AND status IN ('active', 'trialing')`,
        [userId, PLAN_STATUS.CANCELLED]
      );
    } else {
      await query(
        `UPDATE users
         SET cancel_at_period_end = TRUE
         WHERE id = $1`,
        [userId]
      );

      await query(
        `UPDATE user_plan_subscriptions
         SET cancel_at_period_end = TRUE, updated_at = now()
         WHERE user_id = $1 AND status IN ('active', 'trialing')`,
        [userId]
      );
    }

    return this.getUserPlanDetails(userId);
  },

  /**
   * Get purchase and subscription invoice history.
   */
  async getSubscriptionHistory(userId) {
    const { rows } = await query(
      `SELECT ${PLAN_SUB_COLUMNS}
       FROM user_plan_subscriptions
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );
    return rows;
  },
};
