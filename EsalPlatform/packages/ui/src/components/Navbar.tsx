import React, { useState } from "react";
import { Clock, User, Settings, LogOut } from "lucide-react";
import type { NavbarProps } from "../types";

export const Navbar: React.FC<NavbarProps> = ({
  title,
  user,
  onLogout,
  onMobileMenuToggle,
  isMobileMenuOpen,
}) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

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
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 px-4 sm:px-6 py-3 sm:py-4 shadow-sm sticky top-0 z-40">
      <div className="flex items-center justify-between">
        {/* Left Section - Hamburger Menu + Logo/Title */}
        <div className="flex items-center space-x-3">
          {/* Hamburger Menu Button - Only visible on mobile/tablet */}
          {onMobileMenuToggle && (
            <button
              id="hamburger-button"
              onClick={onMobileMenuToggle}
              className="lg:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Toggle navigation menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          )}

          {/* Logo and Title */}
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white text-lg sm:text-xl font-bold">E</span>
          </div>
          <div className="hidden sm:block">
            <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              {title}
            </h1>
            <p className="text-xs text-gray-500 font-medium">
              Innovation Platform
            </p>
          </div>
          <div className="sm:hidden">
            <h1 className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent truncate">
              {title.split(" ")[0]}
            </h1>
          </div>
        </div>{" "}
        {/* Center Section - Time Display (Hidden on Mobile) */}
        <div className="hidden lg:flex items-center space-x-2 bg-gradient-to-r from-blue-50 to-purple-50 px-4 py-2 rounded-full">
          <Clock size={16} className="text-blue-500 stroke-2" />
          <span className="text-sm font-medium text-gray-700">
            {getCurrentTime()}
          </span>
        </div>
        {/* Right Section - User Menu */}
        {user && (
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center space-x-2 sm:space-x-3 hover:bg-gray-50 rounded-xl px-2 py-2 transition-all duration-200 group"
            >
              {/* Avatar */}
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg ring-2 ring-white group-hover:scale-105 transition-transform">
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.name}
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-white text-sm sm:text-base font-bold">
                    {getInitials(user.name)}
                  </span>
                )}
              </div>

              {/* User Info - Hidden on Mobile */}
              <div className="hidden sm:block text-left">
                <p className="text-sm font-semibold text-gray-900 truncate max-w-32">
                  {user.name}
                </p>
                <p className="text-xs text-gray-500 capitalize">{user.role}</p>
              </div>

              {/* Dropdown Arrow */}
              <div className="hidden sm:block">
                <svg
                  className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isUserMenuOpen ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </button>

            {/* Dropdown Menu */}
            {isUserMenuOpen && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setIsUserMenuOpen(false)}
                />

                {/* Menu Content */}
                <div className="absolute right-0 mt-2 w-64 sm:w-72 bg-white rounded-xl shadow-2xl border border-gray-100 z-20 overflow-hidden">
                  {/* User Header */}
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-md">
                        {user.avatar_url ? (
                          <img
                            src={user.avatar_url}
                            alt={user.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-white text-base font-bold">
                            {getInitials(user.name)}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {user.name}
                        </p>
                        <p className="text-xs text-gray-600 capitalize">
                          {user.role} Account
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-2">
                    {" "}
                    <button
                      onClick={() => {
                        window.location.href = "/profile";
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <User size={16} className="mr-3 text-blue-500 stroke-2" />
                      <span className="font-medium">View Profile</span>
                    </button>
                    <button
                      onClick={() => {
                        window.location.href = "/settings";
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Settings
                        size={16}
                        className="mr-3 text-gray-500 stroke-2"
                      />
                      <span className="font-medium">Settings</span>
                    </button>{" "}
                    {/* Time Display for Mobile */}
                    <div className="lg:hidden px-4 py-3 border-t border-gray-100">
                      <div className="flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-50 to-purple-50 px-3 py-2 rounded-lg">
                        <Clock size={16} className="text-blue-500 stroke-2" />
                        <span className="text-sm font-medium text-gray-700">
                          {getCurrentTime()}
                        </span>
                      </div>
                    </div>{" "}
                    {/* Logout */}
                    {onLogout && (
                      <div className="border-t border-gray-100 pt-2">
                        <button
                          onClick={() => {
                            onLogout();
                            setIsUserMenuOpen(false);
                          }}
                          className="w-full flex items-center px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut size={16} className="mr-3 stroke-2" />
                          <span className="font-medium">Sign Out</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};
