import { planModel } from '../models/planModel.js';
import { userModel } from '../models/userModel.js';
import { isProOrLifetime, getPlanConfig } from '../config/plans.js';
import { ApiError } from '../utils/ApiError.js';

export async function checkSubscriptionLimit(req, res, next) {
  try {
    const details = await planModel.getUserPlanDetails(req.user.id);
    if (!details.usage.activeSubscriptions.canAddMore) {
      return next(
        new ApiError(
          403,
          `You have reached the limit of ${details.usage.activeSubscriptions.limit} active subscriptions on the ${details.planName} plan. Please upgrade to Pro for unlimited tracking.`
        )
      );
    }
    next();
  } catch (err) {
    next(err);
  }
}

export async function checkAiScanLimit(req, res, next) {
  try {
    const quota = await userModel.getAiScanQuota(req.user.id);
    const user = await userModel.findById(req.user.id);
    const planConfig = getPlanConfig(user.plan);
    const isPro = isProOrLifetime(user);

    if (!isPro && quota.aiScansUsed >= planConfig.limits.monthlyAiScans) {
      return next(
        new ApiError(
          403,
          `You have used your ${planConfig.limits.monthlyAiScans} free AI scans for this month. Upgrade to Pro for unlimited receipt parsing.`
        )
      );
    }
    next();
  } catch (err) {
    next(err);
  }
}

export function requireProFeature(featureName) {
  return async (req, res, next) => {
    try {
      const user = await userModel.findById(req.user.id);
      const isPro = isProOrLifetime(user);
      if (!isPro) {
        return next(
          new ApiError(
            403,
            `This feature (${featureName}) is available exclusively on the SubTrack Pro plan.`
          )
        );
      }
      next();
    } catch (err) {
      next(err);
    }
  };
}
