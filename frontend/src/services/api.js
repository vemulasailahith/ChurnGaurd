import axios from 'axios';
import { supabase } from './supabase';

const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/+$/, '');

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor: Attach Supabase access token ─────────
api.interceptors.request.use(
  async (config) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`;
      }
    } catch {
      // Fallback silently if session retrieval fails
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ── Response interceptor ─────────────────────────────────────
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const isPredict = error.config?.url?.includes('/predict');
    if (!error.response) {
      const msg = isPredict
        ? 'Prediction service is currently unavailable. Please check that the backend is running.'
        : 'Cannot reach the backend. Please ensure the FastAPI server is running on ' + BASE_URL;
      return Promise.reject({
        type: 'NETWORK_ERROR',
        message: msg,
      });
    }
    const { status, data } = error.response;
    if (status === 401) {
      return Promise.reject({
        type: 'AUTH_REQUIRED',
        status: 401,
        message: data?.detail || 'Authentication required or session expired. Please log in again.',
      });
    }
    if (status === 403) {
      return Promise.reject({
        type: 'FORBIDDEN',
        status: 403,
        message: data?.detail || 'Access denied: Not an authorized company member.',
      });
    }
    if (status === 422) {
      return Promise.reject({
        type: 'VALIDATION_ERROR',
        message: 'Invalid input data. Please verify customer fields.',
        detail: data?.detail,
      });
    }
    if (status === 503) {
      return Promise.reject({
        type: 'MODEL_UNAVAILABLE',
        message: 'Prediction service is currently unavailable. Please check that the backend is running.',
      });
    }
    const fallbackMsg = isPredict
      ? 'Prediction service is currently unavailable. Please check that the backend is running.'
      : 'Unable to load data. Please try again.';
    return Promise.reject({
      type: 'SERVER_ERROR',
      message: data?.detail || fallbackMsg,
    });
  },
);

// ── API Methods ──────────────────────────────────────────────

export const healthCheck = () => api.get('/api/health');

export const predictChurn = (customerData) => api.post('/api/predict/churn', customerData);

export const getAnalyticsOverview = () => api.get('/api/analytics/overview');
export const getChurnByContract   = () => api.get('/api/analytics/churn-by-contract');
export const getChurnByTenure     = () => api.get('/api/analytics/churn-by-tenure');
export const getChurnByInternet   = () => api.get('/api/analytics/churn-by-internet');
export const getChurnByPayment    = () => api.get('/api/analytics/churn-by-payment');
export const getChurnBySenior     = () => api.get('/api/analytics/churn-by-senior');
export const getChurnByPartner    = () => api.get('/api/analytics/churn-by-partner');
export const getChargesDistribution = () => api.get('/api/analytics/charges-distribution');

export const getSegments          = () => api.get('/api/segments');
export const getModelPerformance  = () => api.get('/api/model-performance');

export default api;
