// Lightweight Authenticated API Client for ThermoGuard
import { getCurrentUser } from './authService';

const DEFAULT_API_BASE_URL = 'http://localhost:5000/api';

export const getApiBaseUrl = () => {
  return import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL;
};

/**
 * Perform authenticated fetch request to ThermoGuard backend
 */
export async function apiRequest(endpoint, options = {}) {
  const baseUrl = getApiBaseUrl().replace(/\/$/, '');
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${baseUrl}${cleanEndpoint}`;

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  // Attach token from stored session if available
  const user = getCurrentUser();
  if (user && user.token) {
    headers['Authorization'] = `Bearer ${user.token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const contentType = response.headers.get('content-type');
    let data;
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      const errorMessage = data?.message || data?.error || `HTTP error ${response.status}: ${response.statusText}`;
      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    // Graceful error logging for network or offline mode
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      console.warn(`[ThermoGuard API] Backend offline or unavailable at ${url}`);
      throw new Error(`Unable to connect to ThermoGuard backend server at ${baseUrl}. Ensure backend is running.`);
    }
    throw err;
  }
}

export const apiClient = {
  get: (endpoint, options = {}) => apiRequest(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, body, options = {}) =>
    apiRequest(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),
  put: (endpoint, body, options = {}) =>
    apiRequest(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    }),
  delete: (endpoint, options = {}) => apiRequest(endpoint, { ...options, method: 'DELETE' }),
};

export default apiClient;
