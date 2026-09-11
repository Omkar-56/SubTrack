import { z } from 'zod';

export const subscriptionSchema = z.object({
  name: z.string().min(1).max(120),
  category: z.string().min(1).max(60).default('other'),
  amount: z.number().nonnegative(),
  currency: z.string().length(3).default('USD'),
  billingCycle: z.enum(['weekly', 'monthly', 'quarterly', 'yearly']),
  nextRenewalDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected YYYY-MM-DD'),
  status: z.enum(['active', 'paused', 'cancelled']).default('active'),
  notes: z.string().max(500).optional(),
});
