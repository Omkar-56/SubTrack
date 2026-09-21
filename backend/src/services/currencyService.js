const FALLBACK_RATES_USD = {
  USD: 1.0,
  EUR: 0.92,
  GBP: 0.79,
  INR: 83.5,
  CAD: 1.36,
  AUD: 1.52,
  JPY: 155.0,
  CHF: 0.90,
  SGD: 1.35,
  BRL: 5.40,
  SEK: 10.5,
  NZD: 1.64,
  CNY: 7.25,
  MXN: 18.2,
};

let cachedRates = { ...FALLBACK_RATES_USD };
let lastFetchedAt = 0;
const CACHE_TTL_MS = 1000 * 60 * 60 * 12; // 12 hours

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
];

async function fetchLiveRates() {
  const now = Date.now();
  if (now - lastFetchedAt < CACHE_TTL_MS && Object.keys(cachedRates).length > 5) {
    return cachedRates;
  }

  try {
    const res = await fetch('https://open.er-api.com/v6/latest/USD');
    if (res.ok) {
      const data = await res.json();
      if (data && data.rates) {
        cachedRates = { ...FALLBACK_RATES_USD, ...data.rates };
        lastFetchedAt = now;
      }
    }
  } catch (err) {
    console.warn('Could not fetch live currency rates, using cached/fallback rates:', err.message);
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
    const rateFrom = rates[f] || FALLBACK_RATES_USD[f] || 1;
    const rateTo = rates[t] || FALLBACK_RATES_USD[t] || 1;

    // Convert from -> USD -> to
    const amountInUSD = num / rateFrom;
    const converted = amountInUSD * rateTo;
    return Number(converted.toFixed(2));
  },

  getSupportedCurrencies() {
    return SUPPORTED_CURRENCIES;
  },
};
