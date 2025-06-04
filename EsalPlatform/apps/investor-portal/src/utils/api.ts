// API configuration for the investor portal

export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000";

export const API_ENDPOINTS = {
  INVESTOR: {
    DASHBOARD: `${API_BASE_URL}/api/v1/investor/dashboard`,
    OPPORTUNITIES: `${API_BASE_URL}/api/v1/investor/opportunities`,
    PORTFOLIO: `${API_BASE_URL}/api/v1/investor/portfolio`,
    PROFILE: `${API_BASE_URL}/api/v1/investor/profile`,
    AI_MATCHING: `${API_BASE_URL}/api/v1/investor/ai-matching`,
    BROWSE_STARTUPS: `${API_BASE_URL}/api/v1/investor/browse-startups`,
    STARTUP_DETAILS: `${API_BASE_URL}/api/v1/investor/startup-details`,
    EXPRESS_INTEREST: `${API_BASE_URL}/api/v1/investor/express-interest`,
    CONNECTION_REQUESTS: `${API_BASE_URL}/api/v1/investor/connection-requests`,
    // Preferences endpoints
    PREFERENCES: `${API_BASE_URL}/api/v1/investor/preferences`,
    PREFERENCES_ALL: `${API_BASE_URL}/api/v1/investor/preferences/all`,
    MATCHING_HISTORY: `${API_BASE_URL}/api/v1/investor/matching-history`,
    INVESTOR_STATS: `${API_BASE_URL}/api/v1/investor/stats`,
  },
  AUTH: {
    LOGIN: `${API_BASE_URL}/api/v1/auth/login`,
    REGISTER: `${API_BASE_URL}/api/v1/auth/register`,
    REFRESH: `${API_BASE_URL}/api/v1/auth/refresh`,
  },
};

export const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem("access_token");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const apiRequest = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  const defaultOptions: RequestInit = {
    headers: getAuthHeaders(),
    ...options,
  };

  const response = await fetch(url, defaultOptions);

  if (response.status === 401) {
    // Handle unauthorized - redirect to login
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_data");
    window.location.href = "/login";
    throw new Error("Unauthorized");
  }

  return response;
};
