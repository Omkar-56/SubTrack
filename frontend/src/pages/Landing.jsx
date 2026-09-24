import { Link } from 'react-router-dom';
import BrandLogo from '../components/BrandLogo';

const FEATURES = [
  {
    icon: '🛡️',
    title: 'Free-Trial Expiry Sentinel',
    desc: 'Never get hit by surprise trial conversions. Set exact cancellation deadlines, countdown alerts, and cancel with direct links before paying.',
  },
  {
    icon: '🔔',
    title: 'Smart Renewal Reminders',
    desc: 'Proactive alerts before bills hit your card. Confirm payments in 1-click to advance billing cycles and log transaction history.',
  },
  {
    icon: '💱',
    title: 'Real-Time Currency Normalization',
    desc: 'Pay in USD, EUR, INR, GBP, or JPY. SubTrack uses live European Central Bank exchange rates to show your true global spend.',
  },
  {
    icon: '📊',
    title: 'Visual Category Breakdown',
    desc: 'Interactive Donut chart and progress metrics reveal exactly where your budget flows between AI, Cloud, Streaming, and Apps.',
  },
  {
    icon: '✂️',
    title: '1-Click Direct Cancellation Guides',
    desc: 'Stop wasting time digging through obscure settings. Get direct links and step-by-step instructions to cancel any provider.',
  },
  {
    icon: '📉',
    title: 'Waste & Savings Meter',
    desc: 'Track monthly and annual money saved from cancelled or paused subscriptions. Watch your financial leaks close in real time.',
  },
];

const SAMPLE_COMPANIES = [
  'Netflix', 'ChatGPT', 'Spotify', 'GitHub', 'Disney+', 'Figma', 'Notion', 'Apple', 'Adobe', 'Slack', 'YouTube', 'Discord'
];

export default function Landing() {
  return (
    <div className="w-full space-y-24 pb-16">
      {/*
        Hero Section:
        Seamless background #F5FCF8 matching hero-final3.png so the illustration on the right blends perfectly.
      */}
      <section className="relative w-full bg-[#f5f8f6] overflow-hidden border-b border-line/60">
        <div className="relative mx-auto max-w-[1440px] w-full px-6 sm:px-10 lg:px-14 py-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-10 lg:gap-8">
            {/* Left Side: Headline, Subtitle, CTA & Trust Points */}
            <div className="lg:col-span-5 space-y-6 text-left z-10">
              {/* Main Headline */}
              <h1 className="font-display text-4xl sm:text-5xl lg:text-[52px] font-bold tracking-tight text-ink leading-[1.12]">
                Track subscriptions. <br />
                <span className="text-ledger">Stay in control.</span>
              </h1>

              {/* Subtitle */}
              <p className="max-w-md text-base sm:text-lg text-ink/75 leading-relaxed">
                The intentional, high-clarity subscription ledger. Track recurring services,
                get alerted before trial expiry & due dates, and cancel unwanted bills with 1-click direct guides.
              </p>

              {/* CTA Button */}
              <div className="pt-1 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center gap-2 rounded-md bg-ledger px-6 py-3.5 text-sm font-semibold text-white shadow-md hover:bg-ledger-dark transition-all transform hover:-translate-y-0.5 cursor-pointer"
                >
                  <span>Get Started Free</span>
                  <span>→</span>
                </Link>
              </div>

              {/* Trust points */}
              <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-ink/70 font-medium">
                <span className="flex items-center gap-1.5">
                  <svg className="h-4 w-4 text-ledger" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  No credit card required
                </span>
                <span className="flex items-center gap-1.5">
                  <svg className="h-4 w-4 text-ledger" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Free forever
                </span>
                <span className="flex items-center gap-1.5">
                  <svg className="h-4 w-4 text-ledger" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                  Live currency conversion
                </span>
              </div>

              {/* Editorial Footer Tagline */}
              <div className="pt-4 border-t border-line/60">
                <p className="font-display text-[11px] font-bold tracking-widest uppercase text-ink/50">
                  Know what you pay for. Keep what you love.
                </p>
                <div className="mt-1 h-0.5 w-8 bg-ledger/60" />
              </div>
            </div>

            {/* Right Side: hero-final3 image blending seamlessly into background */}
            <div className="lg:col-span-7 flex justify-center lg:justify-end items-center">
              <div className="relative w-full max-w-[680px] lg:max-w-none">
                <img
                  src="/hero-final5.png"
                  alt="SubTrack dashboard preview with active subscriptions and spend analytics"
                  className="w-full h-auto object-contain select-none pointer-events-none drop-shadow-sm"
                  loading="eager"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Container for Below-Hero Sections */}
      <div className="mx-auto max-w-6xl px-6 sm:px-8 space-y-24">
        {/* Brand Compatibility Strip */}
        <section className="text-center">
          <p className="font-display text-xs font-semibold uppercase tracking-wider text-ink/40">
            Works seamlessly with all your favorite tools and platforms
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 sm:gap-6 opacity-85">
            {SAMPLE_COMPANIES.map((name) => (
              <div key={name} className="flex items-center gap-2 rounded-full border border-line bg-white px-3.5 py-1.5 shadow-2xs">
                <BrandLogo name={name} category="software" size="sm" />
                <span className="text-xs font-medium text-ink">{name}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Feature Grid */}
        <section>
          <div className="text-center">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink">
              Engineered for complete subscription clarity
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-sm text-ink/60">
              Everything you need to audit, organize, and stop unintended recurring leakage.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, idx) => (
              <div
                key={idx}
                className="rounded-md border border-line bg-white p-6 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-ledger-light text-xl">
                    {f.icon}
                  </div>
                  <h3 className="mt-4 font-display text-base font-semibold text-ink">{f.title}</h3>
                  <p className="mt-2 text-xs sm:text-sm text-ink/65 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Call to Action Footer Card */}
        <section className="rounded-lg border border-line bg-ink text-white p-8 sm:p-12 text-center shadow-lg relative overflow-hidden">
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white">
              Ready to stop recurring subscription leaks?
            </h2>
            <p className="text-sm sm:text-base text-white/70">
              Set up your personal ledger in less than 2 minutes. Free and straightforward.
            </p>
            <div className="pt-4 flex flex-wrap justify-center gap-4">
              <Link
                to="/register"
                className="rounded-sm bg-ledger px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-ledger-dark transition-all transform hover:-translate-y-0.5"
              >
                Get Started for Free →
              </Link>
            </div>
          </div>
        </section>

        {/* Minimal Footer */}
        <footer className="border-t border-line pt-8 pb-4 text-center text-xs text-ink/40">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="inline-block w-2 h-2 rounded-full bg-ledger"></span>
            <span className="font-display font-semibold text-ink/70">SubTrack</span>
            <span>· Subscription Intelligence & Ledger</span>
          </div>
          <p>© {new Date().getFullYear()} SubTrack. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}
