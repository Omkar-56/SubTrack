export const PLAN_IDS = {
  STARTER: 'starter',
  PRO: 'pro',
  LIFETIME: 'lifetime',
};

export const PLAN_STATUS = {
  ACTIVE: 'active',
  TRIALING: 'trialing',
  PAST_DUE: 'past_due',
  CANCELLED: 'cancelled',
  EXPIRED: 'expired',
};

export const PLANS = {
  [PLAN_IDS.STARTER]: {
    id: PLAN_IDS.STARTER,
    name: 'Starter',
    badge: 'Forever Free',
    pricing: {
      USD: { monthly: 0, yearly: 0, lifetime: 0 },
      INR: { monthly: 0, yearly: 0, lifetime: 0 },
    },
    limits: {
      maxActiveSubscriptions: 5,
      monthlyAiScans: 2,
      standardEmailAlertsDays: 2,
      customReminders: false,
      urgentTrialAlerts: false,
      forecastAndTrends: false,
      exports: false,
      multiCurrency: true,
    },
  },
  [PLAN_IDS.PRO]: {
    id: PLAN_IDS.PRO,
    name: 'Pro Ledger',
    badge: 'Most Popular',
    pricing: {
      USD: { monthly: 3.99, yearly: 29.99 },
      INR: { monthly: 249, yearly: 1799 },
    },
    limits: {
      maxActiveSubscriptions: Infinity,
      monthlyAiScans: Infinity,
      standardEmailAlertsDays: null, // allows custom
      customReminders: true,
      urgentTrialAlerts: true,
      forecastAndTrends: true,
      exports: true,
      multiCurrency: true,
    },
  },
  [PLAN_IDS.LIFETIME]: {
    id: PLAN_IDS.LIFETIME,
    name: 'Founder Lifetime',
    badge: 'Limited Edition',
    pricing: {
      USD: { lifetime: 69 },
      INR: { lifetime: 3999 },
    },
    limits: {
      maxActiveSubscriptions: Infinity,
      monthlyAiScans: Infinity,
      standardEmailAlertsDays: null,
      customReminders: true,
      urgentTrialAlerts: true,
      forecastAndTrends: true,
      exports: true,
      multiCurrency: true,
    },
  },
};

/**
 * Get plan configuration and limits for a given plan ID.
 */
export function getPlanConfig(planId = PLAN_IDS.STARTER) {
  return PLANS[planId] || PLANS[PLAN_IDS.STARTER];
}

/**
 * Check if user has an active Pro or Lifetime plan.
 */
export function isProOrLifetime(user) {
  if (!user) return false;
  const plan = user.plan || PLAN_IDS.STARTER;
  const status = user.planStatus || PLAN_STATUS.ACTIVE;

  if (plan === PLAN_IDS.LIFETIME) return true;
  if (plan === PLAN_IDS.PRO && (status === PLAN_STATUS.ACTIVE || status === PLAN_STATUS.TRIALING)) {
    // If period end has passed, verify validity
    if (user.currentPeriodEnd) {
      const periodEnd = new Date(user.currentPeriodEnd);
      if (periodEnd.getTime() < Date.now()) {
        return false;
      }
    }
    return true;
  }
  return false;
}

/**
 * Check if user is entitled to a specific feature.
 */
export function hasFeatureAccess(user, featureName) {
  const isPro = isProOrLifetime(user);
  if (isPro) return true;

  const starterLimits = PLANS[PLAN_IDS.STARTER].limits;
  return Boolean(starterLimits[featureName]);
}
