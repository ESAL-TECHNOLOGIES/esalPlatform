import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  avatar_url?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (token: string, refreshToken?: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);  const fetchUserInfo = async (token: string): Promise<User | null> => {
    try {
      // First get basic user info
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
      const authResponse = await fetch(`${apiUrl}/api/v1/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!authResponse.ok) {
        // Token might be invalid
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        return null;
      }

      const authData = await authResponse.json();      // Then get full profile data including avatar
      try {
        const profileResponse = await fetch(
          `${apiUrl}/api/v1/investor/profile`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          // Merge auth data with profile data
          return {
            ...authData,
            ...profileData.profile,
            // Ensure we keep the auth data as primary
            id: authData.id,
            email: authData.email,
            role: authData.role,
          };
        }
      } catch (profileError) {
        console.error("Failed to fetch profile data:", profileError);
        // Fall back to basic auth data
      }

      return authData;
    } catch (error) {
      console.error("Failed to fetch user info:", error);
      return null;
    }
  };

  const login = async (token: string, refreshToken?: string): Promise<void> => {
    localStorage.setItem("access_token", token);
    if (refreshToken) {
      localStorage.setItem("refresh_token", refreshToken);
    }

    const userData = await fetchUserInfo(token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setUser(null);
  };

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("access_token");

      if (token) {
        const userData = await fetchUserInfo(token);
        setUser(userData);
      }

      setIsLoading(false);
    };

    initAuth();
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
