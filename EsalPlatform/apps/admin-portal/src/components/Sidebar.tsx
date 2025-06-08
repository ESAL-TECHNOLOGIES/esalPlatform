import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  Home,
  Users,
  BarChart3,
  FileText,
  Monitor,
  Settings,
  UserCheck,
  LogOut,
  Activity,
  CheckCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  description?: string;
}

interface SidebarProps {
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

const navItems: NavItem[] = [
  {
    path: "/dashboard",
    label: "Dashboard",
    icon: <Home className="w-5 h-5" />,
    description: "Overview & Analytics",
  },
  {
    path: "/users",
    label: "User Management",
    icon: <Users className="w-5 h-5" />,
    description: "Manage platform users",
  },
  {
    path: "/analytics",
    label: "Analytics",
    icon: <BarChart3 className="w-5 h-5" />,
    description: "Platform insights",
  },
  {
    path: "/content",
    label: "Content Moderation",
    icon: <FileText className="w-5 h-5" />,
    description: "Review content",
  },
  {
    path: "/system",
    label: "System Health",
    icon: <Monitor className="w-5 h-5" />,
    description: "Monitor platform",
  },
  {
    path: "/settings",
    label: "Settings",
    icon: <Settings className="w-5 h-5" />,
    description: "Admin configuration",
  },
];

export const Sidebar: React.FC<SidebarProps> = ({
  isMobileOpen = false,
  onMobileClose,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const handleNavigation = (path: string) => {
    navigate(path);
    // Close mobile sidebar when navigating
    if (onMobileClose) {
      onMobileClose();
    }
  };

  const handleLogout = () => {
    if (confirm("Are you sure you want to logout?")) {
      logout();
      navigate("/login");
    }
  };
  return (
    <div className="w-64 bg-white shadow-lg h-screen flex flex-col">
      {/* Mobile Close Button */}
      {isMobileOpen && onMobileClose && (
        <div className="flex justify-end p-4 lg:hidden">
          <button
            onClick={onMobileClose}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Admin Profile Section */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white">
            <UserCheck className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 truncate">
              {user?.full_name || "Admin User"}
            </h3>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-1">
              Administrator
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">
          Admin Panel
        </div>

        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => handleNavigation(item.path)}
              className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-left transition-colors duration-200 ${
                isActive
                  ? "bg-blue-50 border-r-2 border-blue-500 text-blue-700"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium">{item.label}</div>
                {item.description && (
                  <div className="text-xs text-gray-500">
                    {item.description}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </nav>

      {/* Platform Status */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-700">
            Platform Status
          </span>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-green-600 font-medium">Online</span>
          </div>
        </div>
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="text-center p-2 bg-gray-50 rounded">
            <div className="text-xs text-gray-500">Active Users</div>
            <div className="text-sm font-semibold text-gray-900">Live</div>
          </div>
          <div className="text-center p-2 bg-gray-50 rounded">
            <div className="text-xs text-gray-500">System</div>
            <div className="text-sm font-semibold text-green-600">Healthy</div>
          </div>
        </div>{" "}
        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};
