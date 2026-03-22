// lib/api.js
// Central API client — all calls to api.shihfu.com go through here

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

  const res = await fetch(`${BASE_URL}/api/v1${path}`, {
    ...options,
    headers,
  });

  const data = await res.json();

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
  me: () => request('/auth/me'),

  // Customers
  getCustomers: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/customers?${q}`);
  },
  createCustomer: (body) => request('/customers', {
    method: 'POST', body: JSON.stringify(body),
  }),
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