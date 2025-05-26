import { apiUrl } from "./supabase";
import { supabase } from "./supabase";

/**
 * Base API client for making requests to the backend
 */
export const api = {
  /**
   * Get the authorization headers including the Supabase JWT if available
   */
  async getHeaders(): Promise<HeadersInit> {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    // Add Supabase auth token if available
    const { data } = await supabase.auth.getSession();
    if (data?.session?.access_token) {
      headers["Authorization"] = `Bearer ${data.session.access_token}`;
    }

    return headers;
  },

  /**
   * Make a GET request to the API
   */
  async get<T>(path: string): Promise<T> {
    const headers = await this.getHeaders();

    try {
      console.log(`API Request: GET ${apiUrl}${path}`);
      const response = await fetch(`${apiUrl}${path}`, {
        headers,
        credentials: "include",
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API Error (${response.status}): ${errorText}`);
        throw new Error(`API Error: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error("API Request Failed:", error);
      throw error;
    }
  },

  /**
   * Make a POST request to the API
   */
  async post<T>(path: string, data: any): Promise<T> {
    const headers = await this.getHeaders();

    try {
      console.log(`API Request: POST ${apiUrl}${path}`, data);
      const response = await fetch(`${apiUrl}${path}`, {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API Error (${response.status}): ${errorText}`);
        throw new Error(`API Error: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error("API Request Failed:", error);
      throw error;
    }
  },

  /**
   * Make a PUT request to the API
   */
  async put<T>(path: string, data: any): Promise<T> {
    const headers = await this.getHeaders();

    try {
      console.log(`API Request: PUT ${apiUrl}${path}`, data);
      const response = await fetch(`${apiUrl}${path}`, {
        method: "PUT",
        headers,
        credentials: "include",
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API Error (${response.status}): ${errorText}`);
        throw new Error(`API Error: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error("API Request Failed:", error);
      throw error;
    }
  },

  /**
   * Make a DELETE request to the API
   */
  async delete<T>(path: string): Promise<T> {
    const headers = await this.getHeaders();

    try {
      console.log(`API Request: DELETE ${apiUrl}${path}`);
      const response = await fetch(`${apiUrl}${path}`, {
        method: "DELETE",
        headers,
        credentials: "include",
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API Error (${response.status}): ${errorText}`);
        throw new Error(`API Error: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error("API Request Failed:", error);
      throw error;
    }
  },

  /**
   * Check if the API is available
   */
  async health(): Promise<{ status: string }> {
    try {
      return await this.get<{ status: string }>("/health");
    } catch (error) {
      console.error("API Health Check Failed:", error);
      return { status: "error" };
    }
  },
};
