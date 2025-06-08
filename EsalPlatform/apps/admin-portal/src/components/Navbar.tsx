import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "@esal/ui";
import { Menu, Bell, Search, UserCheck } from "lucide-react";
import { systemAPI } from "../utils/api";

interface NavbarProps {
  onMobileMenuToggle?: () => void;
  isMobileMenuOpen?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onMobileMenuToggle,
  isMobileMenuOpen = false,
}) => {
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [notificationCount, setNotificationCount] = useState(0);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(true);
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch notification count from pending actions
  useEffect(() => {
    const fetchNotificationCount = async () => {
      try {
        setIsLoadingNotifications(true);
        const pendingData = await systemAPI.getPendingActions();

        // Calculate total count from all pending actions
        const totalCount =
          pendingData.pendingActions?.reduce(
            (sum: number, action: any) => sum + (action.count || 0),
            0
          ) || 0;

        setNotificationCount(totalCount);
      } catch (error) {
        console.error("Failed to fetch notification count:", error);
        // Keep count as 0 on error, don't show error to user
        setNotificationCount(0);
      } finally {
        setIsLoadingNotifications(false);
      }
    };

    fetchNotificationCount();

    // Refresh notification count every 30 seconds
    const notificationTimer = setInterval(fetchNotificationCount, 30000);

    return () => clearInterval(notificationTimer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left Side - Mobile Menu Button + Platform Brand */}
          <div className="flex items-center space-x-4">
            {/* Mobile Hamburger Menu Button */}
            <button
              id="hamburger-button"
              onClick={onMobileMenuToggle}
              className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Toggle mobile menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Platform Brand */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">E</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  ESAL Platform
                </h1>
                <p className="text-xs text-gray-500">Admin Portal</p>
              </div>
            </div>
          </div>
          {/* Center - Current Time & Date */}
          <div className="hidden md:flex flex-col items-center">
            <div className="text-lg font-mono font-semibold text-gray-900">
              {formatTime(currentTime)}
            </div>
            <div className="text-xs text-gray-500">
              {formatDate(currentTime)}
            </div>
          </div>{" "}
          {/* Right Side - Admin Info & Quick Actions */}
          <div className="flex items-center space-x-4">
            {" "}
            {/* Notifications */}
            <Button variant="outline" size="sm" className="relative">
              <Bell className="w-4 h-4" />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                  {notificationCount > 99 ? "99+" : notificationCount}
                </span>
              )}
              {isLoadingNotifications && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-gray-400 rounded-full animate-pulse"></span>
              )}
            </Button>
            {/* Quick Search */}
            <Button variant="outline" size="sm">
              <Search className="w-4 h-4" />
            </Button>
            {/* Admin Info */}
            <div className="hidden sm:flex items-center space-x-3 pl-4 border-l border-gray-200">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">
                  {user?.full_name || "Admin"}
                </div>
                <div className="text-xs text-gray-500">Administrator</div>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white">
                <UserCheck className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
