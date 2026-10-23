import { Link } from 'react-router-dom';

const PRODUCT_LINKS = [
  { label: 'Overview' },
  { label: 'Features' },
  { label: 'Changelog' },
  { label: 'Roadmap' },
];

const LEGAL_LINKS = [
  { label: 'Privacy Policy', to: '/privacy-policy' },
  { label: 'Terms of Service', to: '/terms-of-service' },
];

export default function Footer() {
  return (
    <footer className="w-full bg-ledger-dark border-t border-white/10">
      {/* Main footer body */}
      <div className="mx-auto max-w-[1440px] w-full px-6 sm:px-10 lg:px-14 pt-14 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8">

          {/* Brand column */}
          <div className="lg:col-span-5 space-y-4">
            <Link to="/" className="flex items-center gap-2 sm:gap-2.5 transition-opacity hover:opacity-90">
              {/* Invert logos so they show white on the dark green bg */}
              <img
                src="/logo/logo.svg"
                alt="SubTrack"
                className="h-7 w-auto object-contain brightness-0 invert opacity-90"
              />
              <img
                src="/logo/logo-t.svg"
                alt="SubTrack"
                className="h-7 w-auto object-contain brightness-0 invert opacity-90"
              />
            </Link>
            <p className="text-sm text-white/55 leading-relaxed max-w-xs">
              The intentional, high-clarity subscription ledger. Track recurring services, get
              alerted before renewals, and keep what you love.
            </p>
          </div>

          {/* Nav columns */}
          <div className="lg:col-span-7 grid grid-cols-2 gap-8">
            {/* Product column */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-white/90 mb-5">
                Product
              </h4>
              <ul className="space-y-3">
                {PRODUCT_LINKS.map((item) => (
                  <li key={item.label}>
                    {/* Non-clickable placeholders — cursor-default + muted style */}
                    <span className="text-sm text-white/45 cursor-default select-none">
                      {item.label}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal column */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-white/90 mb-5">
                Legal
              </h4>
              <ul className="space-y-3">
                {LEGAL_LINKS.map((item) => (
                  <li key={item.label}>
                    <Link
                      to={item.to}
                      className="text-sm text-white/55 hover:text-white transition-colors duration-150"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-[1440px] w-full px-6 sm:px-10 lg:px-14 py-4">
          <p className="text-xs text-white/35">
            © {new Date().getFullYear()} SubTrack. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
