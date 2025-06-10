/**
 * Enhanced API Client with unified error handling and automatic token refresh
 */

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  success: boolean;
}

class ApiClient {
  private baseURL =
    (import.meta as any).env?.VITE_API_URL || "http://localhost:8000/api/v1";

  private async getAuthHeaders(): Promise<Record<string, string>> {
    const token = localStorage.getItem("access_token");
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    try {
      if (response.status === 401) {
        // Unauthorized - clear tokens and redirect to login
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        window.location.href = "/login";
        return { success: false, error: "Authentication required" };
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error:
            errorData.detail || `Request failed with status ${response.status}`,
        };
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Network error occurred",
      };
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: "GET",
      headers: await this.getAuthHeaders(),
    });
    return this.handleResponse<T>(response);
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: "POST",
      headers: await this.getAuthHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });
    return this.handleResponse<T>(response);
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: "PUT",
      headers: await this.getAuthHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });
    return this.handleResponse<T>(response);
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: "DELETE",
      headers: await this.getAuthHeaders(),
    });
    return this.handleResponse<T>(response);
  }

  async uploadFile<T>(
    endpoint: string,
    formData: FormData
  ): Promise<ApiResponse<T>> {
    const token = localStorage.getItem("access_token");
    const headers: Record<string, string> = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: "POST",
      headers,
      body: formData,
    });
    return this.handleResponse<T>(response);
  }
}

export const apiClient = new ApiClient();

// Convenience functions for common operations
export const ideaAPI = {
  getAll: () => apiClient.get("/innovator/view-ideas"),
  create: (data: any) => apiClient.post("/innovator/submit-idea", data),
  update: (id: string, data: any) =>
    apiClient.put(`/innovator/update-idea/${id}`, data),
  delete: (id: string) => apiClient.delete(`/innovator/delete-idea/${id}`),
  uploadFile: (formData: FormData) =>
    apiClient.uploadFile("/innovator/upload-file", formData),
};

export const dashboardAPI = {
  getData: () => apiClient.get("/innovator/dashboard"),
};

export const profileAPI = {
  get: () => apiClient.get("/innovator/profile"),
  update: (data: any) => apiClient.put("/innovator/profile", data),
  uploadAvatar: (formData: FormData) =>
    apiClient.uploadFile("/innovator/profile/avatar", formData),
};

export const aiAPI = {
  generateIdea: (data: any) =>
    apiClient.post("/innovator/ai/generate-idea", data),
  fineTune: (data: any) => apiClient.post("/innovator/ai/fine-tune", data),
  judge: (data: any) => apiClient.post("/innovator/ai/judge-idea", data),
  recommendations: (data: any) =>
    apiClient.post("/innovator/ai/recommendations", data),
};
