import React from "react";
import type { NavbarProps } from "../types";

export const Navbar: React.FC<NavbarProps> = ({ title, user, onLogout }) => {
  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
        </div>

        {user && (
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-700">
              <span className="font-medium">{user.name}</span>
              <span className="ml-2 text-gray-500">({user.role})</span>
            </div>
            {onLogout && (
              <button
                onClick={onLogout}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Logout
              </button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};
