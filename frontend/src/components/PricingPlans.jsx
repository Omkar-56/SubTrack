import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function PricingPlans() {
  const [billingCycle, setBillingCycle] = useState('yearly'); // 'monthly' | 'yearly'
  const [currency, setCurrency] = useState('USD'); // 'USD' | 'INR'

  // Pricing Matrix
  const prices = {
    USD: {
      symbol: '$',
      monthly: { pro: '3.99', proSub: '/month' },
      yearly: { pro: '2.49', proTotal: '$29.99 billed annually', proSub: '/month' },
      lifetime: { pro: '69', proSub: 'one-time' },
    },
    INR: {
      symbol: '₹',
      monthly: { pro: '249', proSub: '/month' },
      yearly: { pro: '149', proTotal: '₹1,799 billed annually', proSub: '/month' },
      lifetime: { pro: '3,999', proSub: 'one-time' },
    },
  };

  const currentPricing = prices[currency];

  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      badge: 'Forever Free',
      badgeColor: 'bg-ink/5 text-ink/70 border border-line',
      price: '0',
      priceSub: '/forever',
      periodNote: 'No Credit Card Required',
      description: 'Essential tracking for personal subscriptions with zero hidden surprises.',
      highlight: false,
      ctaText: 'Get Started Free',
      ctaLink: '/register',
      ctaStyle: 'bg-white hover:bg-paper border border-line text-ink',
      features: [
        { text: 'Up to 5 active subscriptions', included: true },
        { text: '2 AI receipt & invoice scans / month', included: true },
        { text: 'Standard email alerts (2 days prior)', included: true },
        { text: 'Multi-currency conversion (USD, INR)', included: true },
        { text: 'Monthly spending category donut chart', included: true },
        { text: 'Free-trial urgent deadline alerts', included: false },
        { text: '12-Month predictive spend forecasting', included: false },
        { text: 'Price hike detection & history', included: false },
        { text: 'CSV & Excel data backup export', included: false },
      ],
    },
    {
      id: 'pro',
      name: 'Pro Ledger',
      badge: 'Most Popular',
      badgeColor: 'bg-ledger text-white shadow-xs',
      price: billingCycle === 'yearly' ? currentPricing.yearly.pro : currentPricing.monthly.pro,
      priceSub: billingCycle === 'yearly' ? currentPricing.yearly.proSub : currentPricing.monthly.proSub,
      periodNote: billingCycle === 'yearly' ? currentPricing.yearly.proTotal : 'Billed monthly, cancel anytime',
      description: 'Complete peace of mind. Catch every trial expiry, price spike, and hidden fee.',
      highlight: true,
      ctaText: 'Start 7-Day Free Trial',
      ctaLink: '/register',
      ctaStyle: 'bg-ledger hover:bg-ledger-dark text-white shadow-sm',
      features: [
        { text: 'Unlimited active subscriptions', included: true },
        { text: 'Unlimited AI receipt & email parsing (Gemini OCR)', included: true },
        { text: 'Urgent Trial Expiry Sentinel (never get auto-billed)', included: true },
        { text: '12-Month spend forecast & monthly trends', included: true },
        // { text: 'Silent price hike detection & change logs', included: true },
        { text: 'Custom reminder rules (1, 3, 7, 14 days)', included: true },
        { text: '1-Click verified cancellation guides', included: true },
        { text: 'Export ledger to CSV, Excel, and PDF', included: true },
      ],
    },
    {
      id: 'lifetime',
      name: 'Founder Lifetime',
      badge: 'Limited Edition',
      badgeColor: 'bg-amber-light text-amber border border-amber/30',
      price: currentPricing.lifetime.pro,
      priceSub: 'one-time',
      periodNote: 'Pay once, own SubTrack Pro forever',
      description: 'For power organizers who hate recurring software fees and want early access.',
      highlight: false,
      ctaText: 'Claim Lifetime Access',
      ctaLink: '/register',
      ctaStyle: 'bg-ink hover:bg-ink/90 text-white shadow-sm',
      features: [
        { text: 'All Pro Ledger features unlocked forever', included: true },
        { text: 'Zero recurring fees or future renewals', included: true },
        { text: 'Priority queue for AI screenshot scanning', included: true },
        { text: 'Exclusive Founder badge on profile', included: true },
        { text: 'Early access to automated bank sync (upcoming)', included: true },
        { text: 'Direct input on product roadmap & voting', included: true },
      ],
    },
  ];

  const faqs = [
    {
      q: 'Can I start for free without entering a credit card?',
      a: 'Yes! The Starter tier is completely free forever. You can track up to 5 subscriptions, run test AI scans, and receive standard renewal alerts with no payment details.',
    },
    {
      q: 'How does the AI Receipt & Invoice Parser work?',
      a: 'SubTrack uses Google Gemini vision models to automatically extract service names, billing cycles, renewal dates, and amounts directly from your payment email screenshots or PDF invoices.',
    },
    {
      q: 'What happens if I decide to cancel my Pro plan?',
      a: 'You can cancel anytime in one click. Your Pro access remains active until the end of your billing period, after which your account seamlessly switches back to the free Starter tier with all your historical data preserved.',
    },
    {
      q: 'Do you offer refunds?',
      a: 'Yes, we provide a 7-day no-questions-asked refund guarantee on all Pro and Lifetime purchases if SubTrack does not immediately save you money or simplify your subscriptions.',
    },
  ];

  return (
    <div className="w-full py-6 sm:py-8">
      {/* Header */}
      <div className="mx-auto max-w-3xl text-center space-y-4">
        <div className="rounded-sm inline-flex items-center gap-2 border border-ledger/30 bg-ledger-light px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-ledger-dark">
          <span>Simple, transparent pricing</span>
        </div>
        <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-ink">
          Stop subscription leaks. <br />
          <span className="text-ledger">Keep what matters.</span>
        </h1>
        <p className="text-base sm:text-lg text-ink/70 leading-relaxed max-w-2xl mx-auto">
          One forgotten trial or uncancelled service costs more than a year of SubTrack Pro.
          Pick a plan that puts you back in complete financial control.
        </p>
      </div>

      {/* Interactive Controls: Billing Toggle & Currency Switcher */}
      <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-5">
        {/* Monthly / Yearly Switch */}
        <div className="rounded-sm inline-flex items-center border border-line bg-white shadow-2xs">
          <button
            type="button"
            onClick={() => setBillingCycle('monthly')}
            className={`rounded-sm px-5 py-2.5 text-xs sm:text-sm font-medium transition-all ${
              billingCycle === 'monthly'
                ? 'bg-ink text-white shadow-2xs'
                : 'text-ink/70 hover:text-ink'
            }`}
          >
            Monthly billing
          </button>
          <button
            type="button"
            onClick={() => setBillingCycle('yearly')}
            className={`rounded-sm flex items-center gap-2 px-5 py-2 text-xs sm:text-sm font-medium transition-all ${
              billingCycle === 'yearly'
                ? 'bg-ink text-white shadow-2xs'
                : 'text-ink/70 hover:text-ink'
            }`}
          >
            <span>Annual billing</span>
            <span className="rounded-sm bg-ledger px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
              Save 35%
            </span>
          </button>
        </div>

        {/* Currency Switcher Pill */}
        <div className="inline-flex items-center gap-1 rounded-sm border border-line bg-white px-3 py-1.5 text-xs text-ink/70 shadow-2xs">
          <span className="text-ink/40 font-medium">Currency:</span>
          <button
            type="button"
            onClick={() => setCurrency('USD')}
            className={`px-2 py-0.5 rounded-sm font-semibold transition-colors ${
              currency === 'USD' ? 'bg-ledger-light text-ledger-dark' : 'hover:text-ink'
            }`}
          >
            USD ($)
          </button>
          <span className="text-line">|</span>
          <button
            type="button"
            onClick={() => setCurrency('INR')}
            className={`px-2 py-0.5 rounded font-semibold transition-colors ${
              currency === 'INR' ? 'bg-ledger-light text-ledger-dark' : 'hover:text-ink'
            }`}
          >
            INR (₹)
          </button>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative flex flex-col justify-between  bg-white p-7 sm:p-8 transition-all ${
              plan.highlight
                ? 'border-2 border-ledger shadow-md ring-4 ring-ledger/5 md:-translate-y-2'
                : 'border border-line shadow-2xs hover:shadow-xs'
            }`}
          >
            {/* Top Badge */}
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-display text-xl font-bold text-ink">{plan.name}</h3>
              <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ${plan.badgeColor}`}>
                {plan.badge}
              </span>
            </div>

            {/* Description */}
            {/* <p className="mt-3 text-xs sm:text-sm text-ink/65 leading-relaxed min-h-[40px]">
              {plan.description}
            </p>*/}

            {/* Price Box */}
            <div className="mt-3 border-line/60 py-5">
              <div className="flex items-baseline gap-1">
                <span className="font-display text-2xl font-medium text-ink/60">
                  {currentPricing.symbol}
                </span>
                <span className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-ink tabular">
                  {plan.price}
                </span>
                <span className="text-xs sm:text-sm text-ink/60 font-medium ml-1">
                  {plan.priceSub}
                </span>
              </div>
              {plan.periodNote && (
                <p className="mt-1.5 text-[11px] font-medium text-ledger-dark">
                  {plan.periodNote}
                </p>
              )}
            </div>

            {/* CTA Button */}
            <div className="mt-3">
              <Link
                to={plan.ctaLink}
                className={`flex w-full items-center justify-center py-3 px-4 text-center text-sm font-semibold transition-all transform hover:-translate-y-0.5 ${plan.ctaStyle}`}
              >
                {plan.ctaText}
              </Link>
            </div>

            {/* Features List */}
            <div className="mt-8 pt-6 border-t border-line/60 flex-1">
              <p className="text-[11px] font-bold uppercase tracking-wider text-ink/40 mb-3">
                {plan.id === 'lifetime' ? "What's Included:" : 'Plan Features:'}
              </p>
              <ul className="space-y-3">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm">
                    {feature.included ? (
                      <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-ledger-light text-ledger-dark text-[11px] font-bold mt-0.5">
                        ✓
                      </span>
                    ) : (
                      <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-paper text-ink/30 text-[10px] mt-0.5">
                        ✕
                      </span>
                    )}
                    <span className={feature.included ? 'text-ink/80' : 'text-ink/40 line-through'}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* Trust & Guarantee Banner */}
      {/* <div className="mt-16 mx-auto max-w-4xl rounded-lg border border-line bg-[#fbfdfc] p-6 text-center shadow-2xs">
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-12 text-xs sm:text-sm text-ink/75 font-medium">
          <span className="flex items-center gap-2">
            <span className="text-ledger text-base">🛡️</span> 7-Day Money-Back Guarantee
          </span>
          <span className="flex items-center gap-2">
            <span className="text-ledger text-base">⚡</span> 1-Click Instant Cancellation
          </span>
          <span className="flex items-center gap-2">
            <span className="text-ledger text-base">🔒</span> Bank-Level Encryption & Zero Data Selling
          </span>
        </div>
      </div>*/}

      {/* FAQ Section */}
      <div className="pt-4 mt-20 mx-auto max-w-3xl">
        <div className="text-center mb-8">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink">
            Frequently Asked <span className="text-ledger">Questions</span>
          </h2>
          {/* <p className="mt-2 text-xs sm:text-sm text-ink/60">
            Have questions about plans or billing? Here is how SubTrack works.
          </p>*/}
        </div>

        <div className="">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="border border-line bg-white py-5 px-8 shadow-2xs"
            >
              <h3 className="font-display text-sm sm:text-base font-semibold text-ink">
                {faq.q}
              </h3>
              <p className="text-xs sm:text-sm text-ink/70 leading-relaxed">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
