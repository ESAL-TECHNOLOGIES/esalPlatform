import { apiUrl } from "./supabase";

/**
 * Base API client for making requests to the backend
 */
export const api = {
  /**
   * Make a GET request to the API
   */
  async get<T>(path: string): Promise<T> {
    const response = await fetch(`${apiUrl}${path}`);
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    return response.json();
  },

  /**
   * Make a POST request to the API
   */
  async post<T>(path: string, data: any): Promise<T> {
    const response = await fetch(`${apiUrl}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
  },

  /**
   * Make a PUT request to the API
   */
  async put<T>(path: string, data: any): Promise<T> {
    const response = await fetch(`${apiUrl}${path}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
  },

  /**
   * Make a DELETE request to the API
   */
  async delete<T>(path: string): Promise<T> {
    const response = await fetch(`${apiUrl}${path}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
  },
};
