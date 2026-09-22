const BASE_URL = '/api';

function getToken() {
  return localStorage.getItem('subtrack_token');
}

async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return null;

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = new Error(data.error || 'Request failed');
    error.details = data.details;
    error.status = res.status;
    throw error;
  }
  return data;
}

export const api = {
  register: (payload) => request('/auth/register', { method: 'POST', body: payload, auth: false }),
  login: (payload) => request('/auth/login', { method: 'POST', body: payload, auth: false }),
  me: () => request('/auth/me'),
  updateCurrency: (currency) => request('/auth/currency', { method: 'PUT', body: { currency } }),

  listSubscriptions: () => request('/subscriptions'),
  createSubscription: (payload) => request('/subscriptions', { method: 'POST', body: payload }),
  updateSubscription: (id, payload) => request(`/subscriptions/${id}`, { method: 'PUT', body: payload }),
  advanceSubscription: (id) => request(`/subscriptions/${id}/advance`, { method: 'POST' }),
  confirmPayment: (id, payload = {}) => request(`/subscriptions/${id}/confirm-payment`, { method: 'POST', body: payload }),
  deleteSubscription: (id) => request(`/subscriptions/${id}`, { method: 'DELETE' }),
  priceHistory: (id) => request(`/subscriptions/${id}/price-history`),
  getPayments: (id) => request(`/subscriptions/${id}/payments`),
  getAllPayments: (limit = 50) => request(`/subscriptions/payments/recent?limit=${limit}`),

  getReminders: () => request('/subscriptions/reminders'),
  dismissReminder: (id) => request(`/subscriptions/reminders/${id}/dismiss`, { method: 'POST' }),
  triggerReminder: (id) => request(`/subscriptions/${id}/remind`, { method: 'POST' }),

  dashboardSummary: (withinDays = 14, currency = '') =>
    request(`/dashboard/summary?withinDays=${withinDays}${currency ? `&currency=${currency}` : ''}`),
  dashboardForecast: (months = 12, currency = '') =>
    request(`/dashboard/forecast?months=${months}${currency ? `&currency=${currency}` : ''}`),
  dashboardTrend: (months = 12, currency = '') =>
    request(`/dashboard/trend?months=${months}${currency ? `&currency=${currency}` : ''}`),
};
