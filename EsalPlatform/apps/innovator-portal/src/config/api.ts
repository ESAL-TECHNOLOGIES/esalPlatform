// API configuration for the innovator portal
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
  
  // Innovator endpoints
  INNOVATOR: {
    VIEW_IDEAS: buildApiUrl('/innovator/view-ideas'),
    SUBMIT_IDEA: buildApiUrl('/innovator/submit-idea'),
    DELETE_IDEA: (id: number) => buildApiUrl(`/innovator/delete-idea/${id}`),
    AI_GENERATE: buildApiUrl('/innovator/ai/generate-idea'),
    AI_FINE_TUNE: buildApiUrl('/innovator/ai/fine-tune'),
    AI_JUDGE: buildApiUrl('/innovator/ai/judge-idea'),
    AI_RECOMMENDATIONS: buildApiUrl('/innovator/ai/recommendations'),
  },
  
  // User endpoints
  USER: {
    SETTINGS: buildApiUrl('/users/settings'),
    NOTIFICATIONS: buildApiUrl('/users/notifications'),
    SECURITY_INFO: buildApiUrl('/users/security-info'),
    SESSIONS: buildApiUrl('/users/sessions'),
    CHANGE_PASSWORD: buildApiUrl('/users/change-password'),
  },
};

export default {
  API_BASE_URL,
  API_V1_URL,
  buildApiUrl,
  API_ENDPOINTS,
};
