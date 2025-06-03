/**
 * Custom hook for managing API calls with loading states and error handling
 */
import { useState, useCallback } from "react";
import { apiClient, ApiResponse } from "../utils/apiClient";

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  success: boolean;
}

interface UseApiReturn<T> extends UseApiState<T> {
  execute: (...args: any[]) => Promise<T | null>;
  reset: () => void;
  setData: (data: T | null) => void;
}

export function useApi<T = any>(
  apiFunction: (...args: any[]) => Promise<ApiResponse<T>>
): UseApiReturn<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
    success: false,
  });

  const execute = useCallback(
    async (...args: any[]): Promise<T | null> => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const response = await apiFunction(...args);

        if (response.success) {
          setState({
            data: response.data || null,
            loading: false,
            error: null,
            success: true,
          });
          return response.data || null;
        } else {
          setState({
            data: null,
            loading: false,
            error: response.error || "Unknown error occurred",
            success: false,
          });
          return null;
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Network error occurred";
        setState({
          data: null,
          loading: false,
          error: errorMessage,
          success: false,
        });
        return null;
      }
    },
    [apiFunction]
  );

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      success: false,
    });
  }, []);

  const setData = useCallback((data: T | null) => {
    setState((prev) => ({ ...prev, data }));
  }, []);

  return {
    ...state,
    execute,
    reset,
    setData,
  };
}

// Specialized hooks for common operations
export function useIdeas() {
  return useApi(apiClient.get);
}

export function useCreateIdea() {
  return useApi(apiClient.post);
}

export function useUpdateIdea() {
  return useApi(apiClient.put);
}

export function useDeleteIdea() {
  return useApi(apiClient.delete);
}

export function useDashboard() {
  return useApi(apiClient.get);
}

export function useProfile() {
  return useApi(apiClient.get);
}

export function useFileUpload() {
  return useApi(apiClient.uploadFile);
}
