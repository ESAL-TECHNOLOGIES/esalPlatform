import React from "react";
import { Button } from "@esal/ui";

interface User {
  id: string; // Backend uses string IDs
  email: string;
  full_name?: string;
  role: string;
  is_active: boolean;
  is_blocked: boolean;
  created_at: string;

  // Computed fields for UI compatibility
  name?: string; // Derived from full_name || email
  status?: string; // Derived from is_active/is_blocked
  joinDate?: string; // Derived from created_at
  lastLogin?: string; // Default or from future field
  company?: string; // Default or from future field
  verified?: boolean; // Default or from future field
  activityScore?: number; // Default or computed
  profile?: {
    bio?: string;
    website?: string;
    location?: string;
    phone?: string;
  };
}

interface UserDetailsModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (user: User) => void;
  onBlock: (userId: string) => void; // Changed from number to string
  onActivate: (userId: string) => void; // Changed from number to string
}

const UserDetailsModal: React.FC<UserDetailsModalProps> = ({
  user,
  isOpen,
  onClose,
  onEdit,
  onBlock,
  onActivate,
}) => {
  if (!isOpen || !user) return null;

  const statusColors = {
    active: "bg-green-100 text-green-800",
    pending: "bg-yellow-100 text-yellow-800",
    suspended: "bg-red-100 text-red-800",
    inactive: "bg-gray-100 text-gray-800",
  };

  const roleColors = {
    innovator: "bg-blue-100 text-blue-800",
    investor: "bg-purple-100 text-purple-800",
    hub: "bg-orange-100 text-orange-800",
    admin: "bg-gray-100 text-gray-800",
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity">
          <div
            className="absolute inset-0 bg-gray-500 opacity-75"
            onClick={onClose}
          ></div>
        </div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0 h-16 w-16">
                  <div className="h-16 w-16 rounded-full bg-gray-300 flex items-center justify-center">
                    {" "}
                    <span className="text-xl font-medium text-gray-700">
                      {(user.full_name || user.name || user.email.split("@")[0])
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                  </div>
                </div>
                <div>
                  {" "}
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-medium text-gray-900">
                      {user.full_name || user.name || user.email.split("@")[0]}
                    </h3>
                    {user.verified && (
                      <span className="text-blue-500 text-lg">✓</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{user.email}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${roleColors[user.role]}`}
                    >
                      {user.role}
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[user.status || "pending"]}`}
                    >
                      {user.status || "pending"}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <span className="sr-only">Close</span>
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
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

            {/* Content */}
            <div className="mt-6 space-y-6">
              {/* Basic Information */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">
                  Basic Information
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500">
                      Company
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {user.company || "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500">
                      Join Date
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {user.joinDate || "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500">
                      Last Login
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {user.lastLogin || "Never"}
                    </p>
                  </div>{" "}
                  <div>
                    <label className="block text-xs font-medium text-gray-500">
                      Activity Score
                    </label>
                    <div className="mt-1 flex items-center">
                      {" "}
                      <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                        <div
                          className={`bg-blue-600 h-2 rounded-full transition-all duration-300 ${
                            (user.activityScore || 0) > 75
                              ? "w-3/4"
                              : (user.activityScore || 0) > 50
                                ? "w-1/2"
                                : (user.activityScore || 0) > 25
                                  ? "w-1/4"
                                  : "w-1/12"
                          }`}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-900">
                        {user.activityScore || 0}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Profile Information */}
              {user.profile && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">
                    Profile Information
                  </h4>
                  <div className="space-y-3">
                    {user.profile.bio && (
                      <div>
                        <label className="block text-xs font-medium text-gray-500">
                          Bio
                        </label>
                        <p className="mt-1 text-sm text-gray-900">
                          {user.profile.bio}
                        </p>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                      {user.profile.website && (
                        <div>
                          <label className="block text-xs font-medium text-gray-500">
                            Website
                          </label>
                          <a
                            href={user.profile.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-1 text-sm text-blue-600 hover:text-blue-800"
                          >
                            {user.profile.website}
                          </a>
                        </div>
                      )}
                      {user.profile.location && (
                        <div>
                          <label className="block text-xs font-medium text-gray-500">
                            Location
                          </label>
                          <p className="mt-1 text-sm text-gray-900">
                            {user.profile.location}
                          </p>
                        </div>
                      )}
                      {user.profile.phone && (
                        <div>
                          <label className="block text-xs font-medium text-gray-500">
                            Phone
                          </label>
                          <p className="mt-1 text-sm text-gray-900">
                            {user.profile.phone}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Account Status */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">
                  Account Status
                </h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500">
                      Active
                    </label>
                    <p className="mt-1 text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.is_active
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {user.is_active ? "Yes" : "No"}
                      </span>
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500">
                      Blocked
                    </label>
                    <p className="mt-1 text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.is_blocked
                            ? "bg-red-100 text-red-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {user.is_blocked ? "Yes" : "No"}
                      </span>
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500">
                      Verified
                    </label>
                    <p className="mt-1 text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.verified
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {user.verified ? "Yes" : "No"}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <div className="flex space-x-2">
              <Button
                onClick={() => onEdit(user)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Edit User
              </Button>
              {user.is_blocked ? (
                <Button
                  onClick={() => onActivate(user.id)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Unblock
                </Button>
              ) : (
                <Button
                  onClick={() => onBlock(user.id)}
                  variant="outline"
                  className="text-red-600 border-red-600 hover:bg-red-50"
                >
                  Block User
                </Button>
              )}
              <Button onClick={onClose} variant="outline">
                Close
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetailsModal;
