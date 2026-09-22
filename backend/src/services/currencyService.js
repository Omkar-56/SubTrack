let cachedRates = {};
let lastFetchedAt = 0;
// Short cache (1 hour) to keep rates fresh and reflect real-world exchange fluctuations
const CACHE_TTL_MS = 1000 * 60 * 60 * 1; 

export const SUPPORTED_CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
  { code: 'SGD', symbol: 'SG$', name: 'Singapore Dollar' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
  { code: 'SEK', symbol: 'kr', name: 'Swedish Krona' },
  { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'MXN', symbol: 'MX$', name: 'Mexican Peso' },
  { code: 'AED', symbol: 'AED', name: 'UAE Dirham' },
];

/**
 * Fetches real-time exchange rates with USD as the base.
 * Uses primary open exchange API (open.er-api.com) and falls back to ECB-backed frankfurter.app.
 */
async function fetchLiveRates() {
  const now = Date.now();
  if (now - lastFetchedAt < CACHE_TTL_MS && Object.keys(cachedRates).length > 0) {
    return cachedRates;
  }

  // 1. Primary Live API: ExchangeRate-API (Free, unauthenticated, daily/hourly updates)
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/USD', { signal: AbortSignal.timeout(6000) });
    if (res.ok) {
      const data = await res.json();
      if (data && data.rates && Object.keys(data.rates).length > 10) {
        cachedRates = { ...data.rates, USD: 1.0 };
        lastFetchedAt = now;
        console.log(`[CurrencyService] Updated live rates via ExchangeRate-API. INR: ${cachedRates.INR}, EUR: ${cachedRates.EUR}`);
        return cachedRates;
      }
    }
  } catch (err) {
    console.warn('[CurrencyService] Primary rates API error, trying secondary source:', err.message);
  }

  // 2. Secondary Live API: Frankfurter (Free, open-source ECB live rates)
  try {
    const res = await fetch('https://api.frankfurter.app/latest?from=USD', { signal: AbortSignal.timeout(6000) });
    if (res.ok) {
      const data = await res.json();
      if (data && data.rates) {
        cachedRates = { ...data.rates, USD: 1.0 };
        lastFetchedAt = now;
        console.log(`[CurrencyService] Updated live rates via Frankfurter API. INR: ${cachedRates.INR}, EUR: ${cachedRates.EUR}`);
        return cachedRates;
      }
    }
  } catch (err) {
    console.warn('[CurrencyService] Secondary rates API error:', err.message);
  }

  // Return existing cache or 1.0 mapping if internet is completely unreachable
  if (Object.keys(cachedRates).length === 0) {
    return { USD: 1.0, EUR: 0.87, GBP: 0.74, INR: 95.8, CAD: 1.36, AUD: 1.52, JPY: 155.0 };
  }

  return cachedRates;
}

export const currencyService = {
  async getRates() {
    return fetchLiveRates();
  },

  async convert(amount, from = 'USD', to = 'USD') {
    const num = Number(amount) || 0;
    const f = (from || 'USD').toUpperCase();
    const t = (to || 'USD').toUpperCase();
    if (f === t) return num;

    const rates = await fetchLiveRates();
    const rateFrom = rates[f] || (f === 'USD' ? 1 : 1);
    const rateTo = rates[t] || (t === 'USD' ? 1 : 1);

    // Convert from -> USD base -> target currency
    const amountInUSD = num / rateFrom;
    const converted = amountInUSD * rateTo;
    return Number(converted.toFixed(2));
  },

  getSupportedCurrencies() {
    return SUPPORTED_CURRENCIES;
  },
};
