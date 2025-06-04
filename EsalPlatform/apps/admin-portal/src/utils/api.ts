/**
 * API utilities for Admin Portal
 * Connects to the ESAL Platform backend API
 */

const API_BASE_URL = "http://localhost:8000/api/v1";

// Helper function to get auth token from localStorage
const getAuthToken = (): string | null => {
  return localStorage.getItem("access_token");
};

// Helper function to create headers with auth
const createHeaders = (): HeadersInit => {
  const token = getAuthToken();
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Helper function to handle API responses
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API Error: ${response.status} - ${error}`);
  }
  return response.json();
};

// Authentication API endpoints
export const authAPI = {
  // Admin login
  login: async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/login-json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Login failed");
    }

    const data = await response.json();

    // Verify admin role
    if (data.user?.role !== "admin") {
      throw new Error("Access denied. Admin privileges required.");
    }

    return data;
  },

  // Verify current token and get user info
  verifyToken: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: "GET",
      headers: createHeaders(),
    });

    if (!response.ok) {
      throw new Error("Token verification failed");
    }

    const userData = await response.json();

    // Verify admin role
    if (userData.role !== "admin") {
      throw new Error("Admin privileges required");
    }

    return userData;
  },

  // Logout (invalidate token on server if implemented)
  logout: async () => {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        headers: createHeaders(),
      });
    } catch (error) {
      // Logout endpoint might not be implemented, that's okay
      console.log("Server logout not available:", error);
    }
  },
};

// Admin API Endpoints
export const adminAPI = {
  // Authentication endpoints
  login: async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/login-json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Login failed");
    }

    const data = await response.json();

    // Verify admin role
    if (data.user?.role !== "admin") {
      throw new Error("Access denied. Admin privileges required.");
    }

    return data;
  },

  // Verify admin access
  verifyAdminAccess: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/dashboard`, {
      method: "GET",
      headers: createHeaders(),
    });

    if (!response.ok) {
      throw new Error("Admin access verification failed");
    }

    return true;
  },

  // Dashboard endpoints
  getDashboardStats: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/dashboard`, {
      method: "GET",
      headers: createHeaders(),
    });
    return handleResponse(response);
  },

  // User management endpoints
  getAllUsers: async (role?: string, skip = 0, limit = 100) => {
    const params = new URLSearchParams({
      skip: skip.toString(),
      limit: limit.toString(),
      ...(role && { role }),
    });

    const response = await fetch(`${API_BASE_URL}/admin/users?${params}`, {
      method: "GET",
      headers: createHeaders(),
    });
    return handleResponse(response);
  },

  getUsersByRole: async (role: string) => {
    const response = await fetch(
      `${API_BASE_URL}/admin/users/by-role/${role}`,
      {
        method: "GET",
        headers: createHeaders(),
      }
    );
    return handleResponse(response);
  },
  blockUser: async (userId: string, reason: string) => {
    const response = await fetch(`${API_BASE_URL}/admin/block-user/${userId}`, {
      method: "POST",
      headers: createHeaders(),
      body: JSON.stringify({ reason }),
    });
    return handleResponse(response);
  },

  // Update user status (active/inactive/blocked)
  updateUserStatus: async (userId: string, statusData: any) => {
    const response = await fetch(
      `${API_BASE_URL}/admin/users/${userId}/status`,
      {
        method: "PUT",
        headers: createHeaders(),
        body: JSON.stringify(statusData),
      }
    );
    return handleResponse(response);
  },

  // Get user statistics
  getUserStats: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/users/stats`, {
      method: "GET",
      headers: createHeaders(),
    });
    return handleResponse(response);
  },

  // Alias for compatibility with frontend code
  getUsers: async (role?: string, skip = 0, limit = 100) => {
    return adminAPI.getAllUsers(role, skip, limit);
  },

  // Auth endpoints for user info
  getCurrentUser: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: "GET",
      headers: createHeaders(),
    });
    return handleResponse(response);
  },
};

// Analytics API endpoints
export const analyticsAPI = {
  // Platform analytics
  getPlatformAnalytics: async (timeRange = "30d") => {
    const response = await fetch(
      `${API_BASE_URL}/admin/analytics?time_range=${timeRange}`,
      {
        method: "GET",
        headers: createHeaders(),
      }
    );
    return handleResponse(response);
  },

  // Alias for compatibility - dashboard uses this method name
  getAnalytics: async (timeRange = "30d") => {
    return analyticsAPI.getPlatformAnalytics(timeRange);
  },

  // Get activity data
  getActivityData: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/activity`, {
      method: "GET",
      headers: createHeaders(),
    });
    return handleResponse(response);
  },
};

// System health API
export const systemAPI = {
  getSystemHealth: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/system/health`, {
      method: "GET",
      headers: createHeaders(),
    });
    return handleResponse(response);
  },

  getPendingActions: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/system/actions`, {
      method: "GET",
      headers: createHeaders(),
    });
    return handleResponse(response);
  },
};

// Content management API
export const contentAPI = {
  // Content statistics
  getContentStats: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/content/stats`, {
      method: "GET",
      headers: createHeaders(),
    });
    return handleResponse(response);
  },

  // Moderation queue management
  getModerationQueue: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/content/moderation`, {
      method: "GET",
      headers: createHeaders(),
    });
    return handleResponse(response);
  },

  updateModerationStatus: async (itemId: number, action: string) => {
    const response = await fetch(
      `${API_BASE_URL}/admin/content/moderation/${itemId}`,
      {
        method: "PUT",
        headers: createHeaders(),
        body: JSON.stringify({ action }),
      }
    );
    return handleResponse(response);
  },

  // Content templates management
  getContentTemplates: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/content/templates`, {
      method: "GET",
      headers: createHeaders(),
    });
    return handleResponse(response);
  },

  createContentTemplate: async (template: any) => {
    const response = await fetch(`${API_BASE_URL}/admin/content/templates`, {
      method: "POST",
      headers: createHeaders(),
      body: JSON.stringify(template),
    });
    return handleResponse(response);
  },

  updateContentTemplate: async (templateId: number, template: any) => {
    const response = await fetch(
      `${API_BASE_URL}/admin/content/templates/${templateId}`,
      {
        method: "PUT",
        headers: createHeaders(),
        body: JSON.stringify(template),
      }
    );
    return handleResponse(response);
  },

  deleteContentTemplate: async (templateId: number) => {
    const response = await fetch(
      `${API_BASE_URL}/admin/content/templates/${templateId}`,
      {
        method: "DELETE",
        headers: createHeaders(),
      }
    );
    return handleResponse(response);
  },

  // Announcements management
  getAnnouncements: async () => {
    const response = await fetch(
      `${API_BASE_URL}/admin/content/announcements`,
      {
        method: "GET",
        headers: createHeaders(),
      }
    );
    return handleResponse(response);
  },

  createAnnouncement: async (announcement: any) => {
    const response = await fetch(
      `${API_BASE_URL}/admin/content/announcements`,
      {
        method: "POST",
        headers: createHeaders(),
        body: JSON.stringify(announcement),
      }
    );
    return handleResponse(response);
  },

  updateAnnouncement: async (announcementId: number, announcement: any) => {
    const response = await fetch(
      `${API_BASE_URL}/admin/content/announcements/${announcementId}`,
      {
        method: "PUT",
        headers: createHeaders(),
        body: JSON.stringify(announcement),
      }
    );
    return handleResponse(response);
  },

  deleteAnnouncement: async (announcementId: number) => {
    const response = await fetch(
      `${API_BASE_URL}/admin/content/announcements/${announcementId}`,
      {
        method: "DELETE",
        headers: createHeaders(),
      }
    );
    return handleResponse(response);
  },

  publishAnnouncement: async (announcementId: number) => {
    const response = await fetch(
      `${API_BASE_URL}/admin/content/announcements/${announcementId}/publish`,
      {
        method: "POST",
        headers: createHeaders(),
      }
    );
    return handleResponse(response);
  },
};

// Settings API
export const settingsAPI = {
  // System settings endpoints
  getSystemSettings: async () => {
    return {
      general: {
        platform_name: "ESAL Platform",
        maintenance_mode: false,
        registration_enabled: true,
        max_file_size: "10MB",
      },
      security: {
        session_timeout: 30,
        password_requirements: "Strong",
        two_factor_enabled: true,
        ip_whitelist_enabled: false,
      },
      notifications: {
        email_notifications: true,
        sms_notifications: false,
        push_notifications: true,
      },
    };
  },

  updateSystemSettings: async (settings: any) => {
    // This would update system settings
    return { success: true, message: "Settings updated successfully" };
  },
};

export default {
  authAPI,
  adminAPI,
  analyticsAPI,
  systemAPI,
  contentAPI,
  settingsAPI,
};
