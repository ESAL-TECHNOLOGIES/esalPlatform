import React, { useState } from "react";
import { Lightbulb } from "lucide-react";
import { cn } from "../utils";
import type { SidebarProps } from "../types";

export const Sidebar: React.FC<SidebarProps> = ({
  items,
  currentPath,
  user: propUser,
  stats,
  isMobileOpen,
  onMobileClose,
  onNavigate, // Add navigation callback prop
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  // Use provided user data or fallback to localStorage/defaults
  const getUserData = () => {
    if (propUser) return propUser;

    // Try to get user data from localStorage or context
    try {
      const userData = localStorage.getItem("user_data");
      if (userData) {
        const parsed = JSON.parse(userData);
        return {
          name: parsed.full_name || parsed.name || "User",
          email: parsed.email || null,
          role: parsed.role || "Innovator",
          avatar_url: parsed.avatar_url,
        };
      }
    } catch (error) {
      console.error("Error parsing user data:", error);
    }

    return {
      name: "User",
      email: null,
      role: "Innovator",
      avatar_url: null,
    };
  };

  const user = getUserData();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  return (
    <div
      className={cn(
        "bg-white/95 backdrop-blur-lg border-r border-gray-200/50 h-screen flex flex-col shadow-xl transition-all duration-300",
        // Desktop sizing
        "lg:static lg:translate-x-0",
        isCollapsed ? "lg:w-16" : "lg:w-64",
        // Mobile sizing and positioning
        "w-64 fixed inset-y-0 left-0 z-50",
        isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}
    >
      {/* Mobile Close Button */}
      {onMobileClose && (
        <div className="lg:hidden flex justify-end p-2 border-b border-gray-200/50">
          <button
            onClick={onMobileClose}
            className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            aria-label="Close navigation menu"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      )}
      {/* Header with User Profile */}
      <div className="p-4 border-b border-gray-200/50 bg-gradient-to-r from-blue-50/50 to-purple-50/50">
        <div className="flex items-center justify-between mb-4">
          <div
            className={cn(
              "flex items-center space-x-3 transition-all duration-300",
              isCollapsed && "justify-center"
            )}
          >
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-lg">
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.name}
                    className="w-full h-full rounded-xl object-cover"
                  />
                ) : (
                  getInitials(user.name)
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-gray-900 truncate">
                  {user.name}
                </h3>
                {user.email && (
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                )}
                <div className="flex items-center mt-1">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700">
                    {user.role}
                  </span>
                </div>
              </div>
            )}
          </div>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg hover:bg-gray-100/80 transition-colors duration-200 hidden lg:block"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <svg
              className={cn(
                "w-4 h-4 text-gray-500 transition-transform duration-300",
                isCollapsed && "rotate-180"
              )}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
              />
            </svg>
          </button>
        </div>{" "}
        {/* Time and Status Indicator */}
        {!isCollapsed && (
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Online</span>
            </div>
            <span>{getCurrentTime()}</span>
          </div>
        )}
      </div>{" "}
      {/* Navigation Menu */}
      <nav className="flex-1 px-3 py-6 space-y-1">
        {!isCollapsed && (
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4 px-3">
            Navigation
          </div>
        )}{" "}        {items.map((item) => {
          const isActive = currentPath === item.href;
          return (
            <div key={item.href} className="relative">
              {" "}              <button
                onClick={() => {
                  onNavigate?.(item.href);
                  // Close mobile menu when navigation link is clicked
                  if (onMobileClose && window.innerWidth < 1024) {
                    onMobileClose();
                  }
                }}
                className={cn(
                  "group relative flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-300 hover:scale-105 w-full text-left",
                  isActive
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25"
                    : "text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 hover:shadow-md"
                )}
                title={isCollapsed ? item.label : ""}
              >
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-blue-400 to-purple-500 rounded-r-full"></div>
                )}
                {/* Icon */}
                <div
                  className={cn(
                    "flex items-center justify-center transition-all duration-300",
                    isCollapsed ? "w-6 h-6" : "w-6 h-6 mr-3"
                  )}
                >
                  {item.icon && (
                    <span
                      className={cn(
                        "text-lg transition-all duration-300",
                        isActive ? "scale-110" : "group-hover:scale-105"
                      )}
                    >
                      {item.icon}
                    </span>
                  )}
                </div>
                {/* Label */}
                {!isCollapsed && (
                  <span className="flex-1 truncate">{item.label}</span>
                )}
                {/* Hover effect for collapsed state */}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 whitespace-nowrap">
                    {item.label}
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 rotate-45"></div>
                  </div>
                )}{" "}
                {/* Ripple effect on active */}
                {isActive && (
                  <div className="absolute inset-0 rounded-xl bg-white/20 opacity-75"></div>
                )}
              </button>
            </div>
          );
        })}
      </nav>
      {/* Footer Section */}
      <div className="p-4 border-t border-gray-200/50 bg-gradient-to-r from-gray-50/50 to-blue-50/50">
        {!isCollapsed ? (
          <div className="space-y-3">
            {" "}
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-2">
              <div className="text-center p-2 bg-white/80 rounded-lg shadow-sm border border-gray-100">
                <div className="text-xs text-gray-500">Ideas</div>
                <div className="text-sm font-semibold text-gray-900">
                  {stats?.ideas ?? "-"}
                </div>
              </div>
              <div className="text-center p-2 bg-white/80 rounded-lg shadow-sm border border-gray-100">
                <div className="text-xs text-gray-500">Views</div>
                <div className="text-sm font-semibold text-blue-600">
                  {stats?.views ?? "-"}
                </div>
              </div>
            </div>{" "}
            {/* Innovation Tip */}
            <div className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
              <div className="flex items-start space-x-2">
                <Lightbulb
                  size={18}
                  className="text-yellow-500 stroke-2 mt-0.5"
                />
                <div>
                  <p className="text-xs font-medium text-gray-800">Daily Tip</p>
                  <p className="text-xs text-gray-600 mt-1">
                    Document your ideas immediately - inspiration strikes when
                    you least expect it!
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
              <Lightbulb size={14} className="text-yellow-500 stroke-2" />
            </div>
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          </div>
        )}
      </div>
    </div>
  );
};
