// API configuration for the investor portal
export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
export const API_V1_URL = `${API_BASE_URL}/api/v1`;

// Helper function to build API URLs
export const buildApiUrl = (endpoint: string): string => {
  // Ensure endpoint starts with /api/v1 or starts with /
  if (!endpoint.startsWith('/')) {
    endpoint = '/' + endpoint;
  }
  if (!endpoint.startsWith('/api/v1')) {
    endpoint = '/api/v1' + endpoint;
  }
  return `${API_BASE_URL}${endpoint}`;
};

// Common API endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    REGISTER: buildApiUrl('/auth/register'),
    LOGIN: buildApiUrl('/auth/login-json'),
    VERIFY_EMAIL: buildApiUrl('/auth/verify-email'),
    RESEND_VERIFICATION: buildApiUrl('/auth/resend-verification'),
    ME: buildApiUrl('/auth/me'),
  },
  
  // Investor endpoints
  INVESTOR: {
    DASHBOARD: buildApiUrl('/investor/dashboard'),
    OPPORTUNITIES: buildApiUrl('/investor/opportunities'),
    PORTFOLIO: buildApiUrl('/investor/portfolio'),
    PROFILE: buildApiUrl('/investor/profile'),
    AI_MATCHING: buildApiUrl('/investor/ai-matching'),
    BROWSE_STARTUPS: buildApiUrl('/investor/browse-startups'),
    STARTUP_DETAILS: buildApiUrl('/investor/startup-details'),
    EXPRESS_INTEREST: buildApiUrl('/investor/express-interest'),
    CONNECTION_REQUESTS: buildApiUrl('/investor/connection-requests'),
    PREFERENCES: buildApiUrl('/investor/preferences'),
    PREFERENCES_ALL: buildApiUrl('/investor/preferences/all'),
    MATCHING_HISTORY: buildApiUrl('/investor/matching-history'),
    INVESTOR_STATS: buildApiUrl('/investor/stats'),
  },
};

export default {
  API_BASE_URL,
  API_V1_URL,
  buildApiUrl,
  API_ENDPOINTS,
};
