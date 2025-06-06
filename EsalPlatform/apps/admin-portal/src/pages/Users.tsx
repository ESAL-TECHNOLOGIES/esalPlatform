import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Button } from "@esal/ui";
import { adminAPI } from "../utils/api";
import { useAuth } from "../contexts/AuthContext";
import { useToast, ToastContainer } from "../components/Toast";
import UserDetailsModal from "../components/UserDetailsModal";
import CreateEditUserModal from "../components/CreateEditUserModal";
import BulkActionsModal from "../components/BulkActionsModal";

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

interface UserStats {
  total: number;
  active: number;
  pending: number;
  innovators: number;
  investors: number;
  hubs: number;
  admins: number;
}

const Users = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { toasts, addToast, removeToast, success, error, warning, info } =
    useToast();
  const [selectedTab, setSelectedTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [showBulkActionModal, setShowBulkActionModal] = useState(false);
  const [sortField, setSortField] = useState<keyof User>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  const [userStats, setUserStats] = useState<UserStats>({
    total: 0,
    active: 0,
    pending: 0,
    innovators: 0,
    investors: 0,
    hubs: 0,
    admins: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [bulkAction, setBulkAction] = useState<string>("");
  useEffect(() => {
    fetchUsers();
  }, []);

  // Transform backend data to match frontend expectations
  const transformUserData = (backendUser: any): User => {
    return {
      ...backendUser,
      name: backendUser.full_name || backendUser.email.split("@")[0],
      status: backendUser.is_blocked
        ? "blocked"
        : backendUser.is_active
          ? "active"
          : "pending",
      joinDate: new Date(backendUser.created_at).toLocaleDateString(),
      lastLogin: "Never", // Default value - can be updated when backend provides this data
      company: "N/A", // Default value - can be updated when backend provides this data
      verified: backendUser.is_active && !backendUser.is_blocked,
      activityScore: Math.floor(Math.random() * 100), // Placeholder - can be updated when backend provides this data
    };
  };
  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setLoadingError(null);

      // Fetch users from backend
      const usersData = await adminAPI.getUsers();

      // Transform backend data to match frontend interface
      const transformedUsers = usersData.users.map(transformUserData);
      setUsers(transformedUsers);

      // Fetch real user statistics from database instead of calculating manually
      const statsData = await adminAPI.getUserStats();
      const stats: UserStats = {
        total: statsData.total,
        active: statsData.active,
        pending: statsData.pending,
        innovators: statsData.by_role?.innovator || 0,
        investors: statsData.by_role?.investor || 0,
        hubs: statsData.by_role?.hub || 0,
        admins: statsData.by_role?.admin || 0,
      };
      setUserStats(stats);
    } catch (err) {
      console.error("Users fetch error:", err);

      // Handle authentication errors
      if (err instanceof Error && err.message.includes("401")) {
        console.log("Authentication expired, redirecting to login...");
        logout(); // Clear stored tokens
        navigate("/login", { replace: true });
        return;
      }

      setLoadingError(
        err instanceof Error ? err.message : "Failed to load users"
      );
    } finally {
      setIsLoading(false);
    }
  };
  const handleUserAction = async (userId: string, action: string) => {
    try {
      await adminAPI.updateUserStatus(userId, { action });
      await fetchUsers(); // Refresh data
    } catch (err) {
      console.error("User action error:", err);
      // Could add toast notification here
    }
  };
  // Enhanced status action handler with confirmation messages and toast notifications
  const handleStatusAction = async (user: User, action: string) => {
    const actionMap = {
      activate: {
        title: "Activate User",
        message: `Are you sure you want to activate ${user.name}? They will be able to access the platform.`,
        confirmText: "Activate",
        successMessage: `User ${user.name} has been activated successfully!`,
        apiAction: { is_active: true, is_blocked: false },
      },
      inactivate: {
        title: "Inactivate User",
        message: `Are you sure you want to inactivate ${user.name}? They will lose access to the platform.`,
        confirmText: "Inactivate",
        successMessage: `User ${user.name} has been inactivated successfully!`,
        apiAction: { is_active: false },
      },
      block: {
        title: "Block User",
        message: `Are you sure you want to block ${user.name}? This will immediately revoke their access and they cannot log in.`,
        confirmText: "Block",
        successMessage: `User ${user.name} has been blocked successfully!`,
        apiAction: { is_blocked: true },
      },
      unblock: {
        title: "Unblock User",
        message: `Are you sure you want to unblock ${user.name}? They will regain access to the platform.`,
        confirmText: "Unblock",
        successMessage: `User ${user.name} has been unblocked successfully!`,
        apiAction: { is_blocked: false, is_active: true },
      },
      reject: {
        title: "Reject User",
        message: `Are you sure you want to reject ${user.name}'s registration? This cannot be easily undone.`,
        confirmText: "Reject",
        successMessage: `User ${user.name} has been rejected!`,
        apiAction: { is_active: false, is_blocked: true },
      },
    };

    const actionConfig = actionMap[action];
    if (!actionConfig) return;

    // Show confirmation dialog
    const confirmed = window.confirm(
      `${actionConfig.title}\n\n${actionConfig.message}\n\nClick OK to ${actionConfig.confirmText.toLowerCase()} or Cancel to abort.`
    );

    if (!confirmed) return;

    try {
      // Show loading state
      info(`${actionConfig.confirmText}ing user ${user.name}...`, 1000);

      // Make API call
      await adminAPI.updateUserStatus(user.id, actionConfig.apiAction);

      // Show success notification
      success(actionConfig.successMessage);

      // Refresh user list
      await fetchUsers();
    } catch (err) {
      console.error(`${actionConfig.title} error:`, err);
      error(
        `Failed to ${actionConfig.confirmText.toLowerCase()} user. Please try again.`
      );
    }
  };
  const handleBulkAction = async (action: string, userIds: string[]) => {
    try {
      // Implement bulk actions
      for (const userId of userIds) {
        if (action === "activate") {
          await adminAPI.updateUserStatus(userId, { is_active: true });
        } else if (action === "deactivate") {
          await adminAPI.updateUserStatus(userId, { is_active: false });
        } else if (action === "block") {
          await adminAPI.updateUserStatus(userId, { is_blocked: true });
        } else if (action === "unblock") {
          await adminAPI.updateUserStatus(userId, { is_blocked: false });
        } else if (action === "delete") {
          await adminAPI.deleteUser(userId);
        } else if (action === "export") {
          // Export selected users
          const selectedUsersData = users.filter((user) =>
            userIds.includes(user.id)
          );
          await exportUsersData(selectedUsersData);
          return;
        }
      }

      setSelectedUsers([]);
      setShowBulkActionModal(false);
      await fetchUsers();
    } catch (err) {
      console.error("Bulk action error:", err);
      throw err;
    }
  };

  const handleSort = (field: keyof User) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };
  const handleSelectUser = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map((user) => user.id));
    }
  };

  const viewUserDetails = (user: User) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const editUser = (user: User) => {
    setSelectedUser(user);
    setShowCreateUserModal(true);
  };
  const exportUsers = async () => {
    try {
      await exportUsersData(filteredUsers);
    } catch (err) {
      console.error("Export error:", err);
    }
  };
  const exportUsersData = async (usersToExport: User[]) => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "Name,Email,Role,Status,Company,Join Date,Last Login\n" +
      usersToExport
        .map(
          (user) =>
            `${user.name || ""},${user.email},${user.role},${user.status || ""},${user.company || ""},${user.joinDate || ""},${user.lastLogin || ""}`
        )
        .join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `users_export_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const handleSaveUser = async (userData: Partial<User>) => {
    try {
      if (userData.id) {
        // Update existing user
        await adminAPI.updateUser(userData.id, userData);
      } else {
        // Create new user
        await adminAPI.createUser(userData);
      }
      await fetchUsers();
      setShowCreateUserModal(false);
      setSelectedUser(null);
    } catch (err) {
      console.error("Save user error:", err);
      throw err;
    }
  };
  const filteredUsers = users.filter((user) => {
    const matchesTab =
      selectedTab === "all" ||
      user.role === selectedTab ||
      user.status === selectedTab;
    const matchesSearch =
      (user.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.company || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  // Sort users
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];

    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  // Paginate users
  const startIndex = (currentPage - 1) * usersPerPage;
  const endIndex = startIndex + usersPerPage;
  const paginatedUsers = sortedUsers.slice(startIndex, endIndex);
  const totalPages = Math.ceil(sortedUsers.length / usersPerPage);

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
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  if (loadingError) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="text-red-600 text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Failed to Load Users
          </h2>
          <p className="text-gray-600 mb-4">{loadingError}</p>
          <Button onClick={fetchUsers}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">Manage platform users and permissions</p>
        </div>{" "}
        <div className="flex space-x-3">
          <Button variant="outline" onClick={exportUsers}>
            Export Users
          </Button>
          <Button onClick={() => setShowCreateUserModal(true)}>Add User</Button>
        </div>
      </div>
      {/* User Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {[
          {
            label: "Total",
            value: userStats.total,
            color: "bg-blue-100 text-blue-800",
          },
          {
            label: "Active",
            value: userStats.active,
            color: "bg-green-100 text-green-800",
          },
          {
            label: "Pending",
            value: userStats.pending,
            color: "bg-yellow-100 text-yellow-800",
          },
          {
            label: "Innovators",
            value: userStats.innovators,
            color: "bg-blue-100 text-blue-800",
          },
          {
            label: "Investors",
            value: userStats.investors,
            color: "bg-purple-100 text-purple-800",
          },
          {
            label: "Hubs",
            value: userStats.hubs,
            color: "bg-orange-100 text-orange-800",
          },
          {
            label: "Admins",
            value: userStats.admins,
            color: "bg-gray-100 text-gray-800",
          },
        ].map((stat, index) => (
          <Card key={index} className="p-4 text-center">
            <div
              className={`inline-block px-2 py-1 rounded-full text-xs font-medium mb-2 ${stat.color}`}
            >
              {stat.label}
            </div>
            <div className="text-xl font-bold text-gray-900">{stat.value}</div>
          </Card>
        ))}
      </div>{" "}
      {/* Search and Filters */}
      <Card className="p-6">
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex space-x-2">
              {["all", "innovator", "investor", "hub", "admin", "pending"].map(
                (tab) => (
                  <button
                    key={tab}
                    onClick={() => setSelectedTab(tab)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium capitalize ${
                      selectedTab === tab
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {tab}
                  </button>
                )
              )}
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-400">🔍</span>
              </div>
            </div>
          </div>

          {/* Bulk Actions Bar */}
          {selectedUsers.length > 0 && (
            <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-blue-900">
                  {selectedUsers.length} user
                  {selectedUsers.length !== 1 ? "s" : ""} selected
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedUsers([])}
                  className="text-blue-600 border-blue-300"
                >
                  Clear Selection
                </Button>
              </div>
              <Button
                size="sm"
                onClick={() => setShowBulkActionModal(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Bulk Actions
              </Button>
            </div>
          )}
        </div>
      </Card>{" "}
      {/* Users Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {" "}
                  <input
                    type="checkbox"
                    checked={
                      selectedUsers.length === paginatedUsers.length &&
                      paginatedUsers.length > 0
                    }
                    onChange={handleSelectAll}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    aria-label="Select all users"
                  />
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("name")}
                >
                  <div className="flex items-center space-x-1">
                    <span>User</span>
                    <span className="text-gray-400">
                      {sortField === "name"
                        ? sortDirection === "asc"
                          ? "↑"
                          : "↓"
                        : "↕"}
                    </span>
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("role")}
                >
                  <div className="flex items-center space-x-1">
                    <span>Role</span>
                    <span className="text-gray-400">
                      {sortField === "role"
                        ? sortDirection === "asc"
                          ? "↑"
                          : "↓"
                        : "↕"}
                    </span>
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("status")}
                >
                  <div className="flex items-center space-x-1">
                    <span>Status</span>
                    <span className="text-gray-400">
                      {sortField === "status"
                        ? sortDirection === "asc"
                          ? "↑"
                          : "↓"
                        : "↕"}
                    </span>
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("company")}
                >
                  <div className="flex items-center space-x-1">
                    <span>Company</span>
                    <span className="text-gray-400">
                      {sortField === "company"
                        ? sortDirection === "asc"
                          ? "↑"
                          : "↓"
                        : "↕"}
                    </span>
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("joinDate")}
                >
                  <div className="flex items-center space-x-1">
                    <span>Join Date</span>
                    <span className="text-gray-400">
                      {sortField === "joinDate"
                        ? sortDirection === "asc"
                          ? "↑"
                          : "↓"
                        : "↕"}
                    </span>
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Activity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {" "}
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => handleSelectUser(user.id)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      aria-label={`Select user ${user.name}`}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-700">
                            {user.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center">
                          <div className="text-sm font-medium text-gray-900">
                            {user.name}
                          </div>
                          {user.verified && (
                            <span className="ml-2 text-blue-500">✓</span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${roleColors[user.role]}`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[user.status]}`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.company}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.joinDate}
                  </td>{" "}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                        <div
                          className={`bg-blue-600 h-2 rounded-full transition-all duration-300 ${
                            user.activityScore > 75
                              ? "w-3/4"
                              : user.activityScore > 50
                                ? "w-1/2"
                                : user.activityScore > 25
                                  ? "w-1/4"
                                  : "w-1/12"
                          }`}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-900">
                        {user.activityScore}%
                      </span>
                    </div>
                  </td>{" "}
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <Button size="sm" onClick={() => viewUserDetails(user)}>
                        👁️ View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => editUser(user)}
                      >
                        ✏️ Edit
                      </Button>

                      {/* Status-based Action Buttons */}
                      {user.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => handleStatusAction(user, "activate")}
                          >
                            ✅ Activate
                          </Button>
                          <Button
                            size="sm"
                            className="bg-red-600 hover:bg-red-700 text-white"
                            onClick={() => handleStatusAction(user, "reject")}
                          >
                            ❌ Reject
                          </Button>
                        </>
                      )}

                      {user.status === "active" && (
                        <>
                          <Button
                            size="sm"
                            className="bg-yellow-600 hover:bg-yellow-700 text-white"
                            onClick={() =>
                              handleStatusAction(user, "inactivate")
                            }
                          >
                            ⏸️ Inactivate
                          </Button>
                          <Button
                            size="sm"
                            className="bg-red-600 hover:bg-red-700 text-white"
                            onClick={() => handleStatusAction(user, "block")}
                          >
                            🚫 Block
                          </Button>
                        </>
                      )}

                      {user.status === "blocked" && (
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => handleStatusAction(user, "unblock")}
                        >
                          🔓 Unblock
                        </Button>
                      )}
                      {(user.status === "inactive" ||
                        user.status === "pending") && (
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => handleStatusAction(user, "activate")}
                        >
                          ✅ Activate
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {startIndex + 1} to{" "}
                {Math.min(endIndex, sortedUsers.length)} of {sortedUsers.length}{" "}
                users
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "primary" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className="min-w-[40px]"
                    >
                      {page}
                    </Button>
                  )
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>
      {/* Modals */}{" "}
      <UserDetailsModal
        isOpen={showUserModal}
        onClose={() => {
          setShowUserModal(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
        onEdit={(user) => {
          setShowUserModal(false);
          editUser(user);
        }}
        onBlock={async (userId) => {
          const user = users.find((u) => u.id === userId);
          if (user) {
            await handleUserAction(
              userId,
              user.is_blocked ? "unblock" : "block"
            );
          }
          setShowUserModal(false);
          setSelectedUser(null);
        }}
        onActivate={async (userId) => {
          await handleUserAction(userId, "activate");
          setShowUserModal(false);
          setSelectedUser(null);
        }}
      />
      <CreateEditUserModal
        isOpen={showCreateUserModal}
        onClose={() => {
          setShowCreateUserModal(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
        onSave={handleSaveUser}
      />{" "}
      <BulkActionsModal
        isOpen={showBulkActionModal}
        onClose={() => setShowBulkActionModal(false)}
        selectedUsers={users.filter((user) => selectedUsers.includes(user.id))}
        onBulkAction={handleBulkAction}
      />
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
};

export default Users;
