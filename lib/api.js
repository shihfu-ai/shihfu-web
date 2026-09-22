// lib/api.js
// Central API client - all calls to api.shihfu.com go through here

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.shihfu.com';

function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('shihfu_token');
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  let res;
  try {
    res = await fetch(`${BASE_URL}/api/v1${path}`, { ...options, headers });
  } catch {
    throw new Error('Could not reach the server. Check your internet connection and try again.');
  }

  // A proxy/cold-start error page is HTML, not JSON
  let data;
  try { data = await res.json(); }
  catch { throw new Error(res.ok ? 'Unexpected response from the server' : `The server is unavailable right now (${res.status}). Please try again in a moment.`); }

  // An expired or revoked login: send them back to sign in rather than
  // leaving every button failing with a vague error. (Not for the login
  // call itself, where 401 just means a wrong password.)
  if (res.status === 401 && token && typeof window !== 'undefined' && !path.startsWith('/auth/login')) {
    localStorage.removeItem('shihfu_token');
    localStorage.removeItem('shihfu_staff');
    window.location.href = '/login';
    throw new Error('Your session has expired. Please sign in again.');
  }

  if (!res.ok) {
    throw new Error(data.message || `Request failed: ${res.status}`);
  }

  return data;
}

export const api = {
  // Auth
  register: (body) => request('/auth/register', {
    method: 'POST', body: JSON.stringify(body),
  }),
  login: (body) => request('/auth/login', {
    method: 'POST', body: JSON.stringify(body),
  }),
  forgotPassword: (email) => request('/auth/forgot-password', {
    method: 'POST', body: JSON.stringify({ email }),
  }),
  resetPassword: (body) => request('/auth/reset-password', {
    method: 'POST', body: JSON.stringify(body),
  }),
  me: () => request('/auth/me'),
  updateMe: (body) => request('/auth/me', { method: 'PATCH', body: JSON.stringify(body) }),
  changePassword: (body) => request('/auth/change-password', {
    method: 'POST', body: JSON.stringify(body),
  }),

  // Customers
  getCustomers: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/customers?${q}`);
  },
  createCustomer: (body) => request('/customers', {
    method: 'POST', body: JSON.stringify(body),
  }),
  getCustomer: (id) => request(`/customers/${id}`),
  updateCustomer: (id, body) => request(`/customers/${id}`, {
    method: 'PATCH', body: JSON.stringify(body),
  }),
  deleteCustomer: (id) => request(`/customers/${id}`, {
    method: 'DELETE',
  }),

  // Service events
  getServiceEvents: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/service-events?${q}`);
  },
  createServiceEvent: (body) => request('/service-events', {
    method: 'POST', body: JSON.stringify(body),
  }),

  // Reminders
  getReminders: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/reminders?${q}`);
  },
  getReminderSummary: () => request('/reminders/summary'),
  sendReminder: (id) => request(`/reminders/${id}/send`, { method: 'POST' }),
  sendAllOverdue: () => request('/reminders/send-overdue', { method: 'POST' }),
  skipReminder: (id) => request(`/reminders/${id}/skip`, { method: 'PATCH' }),

  // Analytics
  getDashboard: () => request('/analytics/dashboard'),
  getRetention: () => request('/analytics/retention'),
  getRevenue:   () => request('/analytics/revenue'),

  // Campaigns (bulk festival/promo messages)
  getCampaigns: () => request('/campaigns'),
  createCampaign: (body) => request('/campaigns', {
    method: 'POST', body: JSON.stringify(body),
  }),
  cancelCampaign: (id) => request(`/campaigns/${id}/cancel`, { method: 'PATCH' }),

  // Quick check-in form (public form + the business's shareable link)
  getChannelStatus: () => request('/business/channel-status'),
  getCheckinLink: () => request('/business/checkin-link'),
  regenerateCheckinLink: () => request('/business/checkin-link/regenerate', { method: 'POST' }),
  getPublicCheckin: (token) => request(`/public/checkin/${token}`),
  submitPublicCheckin: (token, body) => request(`/public/checkin/${token}`, {
    method: 'POST', body: JSON.stringify(body),
  }),

  // Email connection (Connect Gmail so email sends from the business's own mailbox)
  getEmailConnectionStatus: () => request('/email-auth/google/status'),
  getGoogleConnectUrl: () => request('/email-auth/google/connect-url'),
  disconnectGoogleEmail: () => request('/email-auth/google/disconnect', { method: 'DELETE' }),
};

export function saveAuth(token, staff) {
  localStorage.setItem('shihfu_token', token);
  localStorage.setItem('shihfu_staff', JSON.stringify(staff));
}

export function clearAuth() {
  localStorage.removeItem('shihfu_token');
  localStorage.removeItem('shihfu_staff');
}

export function getStaff() {
  if (typeof window === 'undefined') return null;
  try {
    const s = localStorage.getItem('shihfu_staff');
    return s ? JSON.parse(s) : null;
  } catch { return null; }
}

export function isLoggedIn() {
  return !!getToken();
}