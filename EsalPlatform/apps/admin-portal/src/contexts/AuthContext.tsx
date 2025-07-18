import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  is_blocked: boolean;
}

interface AuthContextType {
  user: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAdminRole: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  useEffect(() => {
    // Check for existing authentication on app load
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const storedUser = localStorage.getItem("admin_user");

        if (token && storedUser) {
          const userData = JSON.parse(storedUser);

          // Verify user is admin
          if (userData.role === "admin") {
            setUser(userData);
          } else {
            // Clear invalid admin session
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            localStorage.removeItem("admin_user");
          }
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        // Clear corrupted session data
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("admin_user");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);
  const login = async (email: string, password: string) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
      const response = await fetch(`${apiUrl}/api/v1/auth/login-json`, {
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

      // Store authentication data
      localStorage.setItem("access_token", data.access_token);
      if (data.refresh_token) {
        localStorage.setItem("refresh_token", data.refresh_token);
      }
      localStorage.setItem("admin_user", JSON.stringify(data.user));

      setUser(data.user);
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("admin_user");
    setUser(null);
  };

  const checkAdminRole = (): boolean => {
    return user?.role === "admin" && user?.is_active && !user?.is_blocked;
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    checkAdminRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
