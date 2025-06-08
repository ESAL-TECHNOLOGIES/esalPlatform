import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Button } from "@esal/ui";
import { adminAPI } from "../utils/api";
import { useAuth } from "../contexts/AuthContext";
import { useToast, ToastContainer } from "../components/Toast";
import UserDetailsModal from "../components/UserDetailsModal";
import CreateEditUserModal from "../components/CreateEditUserModal";
import BulkActionsModal from "../components/BulkActionsModal";
import {
  AlertTriangle,
  RefreshCw,
  Download,
  UserPlus,
  Search,
  Settings,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  X,
  Pause,
  Ban,
  Unlock,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Shield,
  Users as UsersIcon,
  Building,
  Calendar,
  Activity,
} from "lucide-react";

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
  const [advancedFilters, setAdvancedFilters] = useState({
    status: "all", // all, active, inactive, blocked, pending
    dateRange: "all", // all, today, week, month, year
    verificationStatus: "all", // all, verified, unverified
    activityLevel: "all", // all, high, medium, low
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
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
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  useEffect(() => {
    fetchUsers();
  }, []);

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchUsers();
      setLastRefresh(new Date());
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh]);

  // Real-time status updates
  const refreshUserData = async () => {
    try {
      info("Refreshing user data...", 1000);
      await fetchUsers();
      setLastRefresh(new Date());
      success("User data refreshed!");
    } catch (err) {
      error("Failed to refresh user data");
    }
  };

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

      // Fetch all users from backend (set a high limit to get all users)
      const usersData = await adminAPI.getUsers(undefined, 0, 10000);

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
  const handleCreateUser = async (userData: Partial<User>) => {
    try {
      info("Creating new user...", 1000);
      await adminAPI.createUser(userData);
      success("User created successfully!");
      await fetchUsers();
    } catch (err) {
      console.error("Create user error:", err);
      error("Failed to create user. Please try again.");
      throw err;
    }
  };

  const handleUpdateUser = async (userData: Partial<User>) => {
    try {
      if (!userData.id) {
        throw new Error("User ID is required for update");
      }
      info(`Updating user ${userData.name}...`, 1000);
      await adminAPI.updateUser(userData.id, userData);
      success("User updated successfully!");
      await fetchUsers();
    } catch (err) {
      console.error("Update user error:", err);
      error("Failed to update user. Please try again.");
      throw err;
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    const confirmed = window.confirm(
      `Delete User\n\nAre you sure you want to delete ${userName}? This action cannot be undone.\n\nClick OK to delete or Cancel to abort.`
    );

    if (!confirmed) return;

    try {
      info(`Deleting user ${userName}...`, 1000);
      await adminAPI.deleteUser(userId);
      success(`User ${userName} has been deleted successfully!`);
      await fetchUsers();
    } catch (err) {
      console.error("Delete user error:", err);
      error("Failed to delete user. Please try again.");
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
    const currentPageUsers = paginatedUsers.map((user) => user.id);
    const allCurrentPageSelected = currentPageUsers.every((id) =>
      selectedUsers.includes(id)
    );

    if (allCurrentPageSelected) {
      // Deselect all users on current page
      setSelectedUsers((prev) =>
        prev.filter((id) => !currentPageUsers.includes(id))
      );
    } else {
      // Select all users on current page (add to existing selection)
      setSelectedUsers((prev) => [...new Set([...prev, ...currentPageUsers])]);
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

  const clearAllFilters = () => {
    setSelectedTab("all");
    setSearchQuery("");
    setAdvancedFilters({
      status: "all",
      dateRange: "all",
      verificationStatus: "all",
      activityLevel: "all",
    });
    setCurrentPage(1);
  };

  const updateAdvancedFilter = (
    key: keyof typeof advancedFilters,
    value: string
  ) => {
    setAdvancedFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
    setCurrentPage(1); // Reset to first page when filtering
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (selectedTab !== "all") count++;
    if (searchQuery) count++;
    if (advancedFilters.status !== "all") count++;
    if (advancedFilters.dateRange !== "all") count++;
    if (advancedFilters.verificationStatus !== "all") count++;
    if (advancedFilters.activityLevel !== "all") count++;
    return count;
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
      if (selectedUser && selectedUser.id) {
        // Update existing user
        await handleUpdateUser(userData);
      } else {
        // Create new user
        await handleCreateUser(userData);
      }
      setShowCreateUserModal(false);
      setSelectedUser(null);
    } catch (err) {
      console.error("Save user error:", err);
      throw err;
    }
  };
  const filteredUsers = users.filter((user) => {
    // Tab-based filtering (role and basic status)
    const matchesTab =
      selectedTab === "all" ||
      user.role === selectedTab ||
      user.status === selectedTab;

    // Text search across multiple fields
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      searchQuery === "" ||
      (user.name || "").toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      (user.full_name || "").toLowerCase().includes(searchLower) ||
      (user.company || "").toLowerCase().includes(searchLower) ||
      (user.profile?.bio || "").toLowerCase().includes(searchLower) ||
      (user.profile?.location || "").toLowerCase().includes(searchLower) ||
      user.role.toLowerCase().includes(searchLower);

    // Advanced status filtering
    const matchesStatus =
      advancedFilters.status === "all" ||
      (advancedFilters.status === "active" &&
        user.is_active &&
        !user.is_blocked) ||
      (advancedFilters.status === "inactive" && !user.is_active) ||
      (advancedFilters.status === "blocked" && user.is_blocked) ||
      (advancedFilters.status === "pending" &&
        !user.is_active &&
        !user.is_blocked);

    // Date range filtering
    const matchesDateRange = (() => {
      if (advancedFilters.dateRange === "all") return true;

      const userDate = new Date(user.created_at);
      const now = new Date();

      switch (advancedFilters.dateRange) {
        case "today":
          return userDate.toDateString() === now.toDateString();
        case "week":
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return userDate >= weekAgo;
        case "month":
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          return userDate >= monthAgo;
        case "year":
          const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          return userDate >= yearAgo;
        default:
          return true;
      }
    })();

    // Verification status filtering
    const matchesVerification =
      advancedFilters.verificationStatus === "all" ||
      (advancedFilters.verificationStatus === "verified" && user.verified) ||
      (advancedFilters.verificationStatus === "unverified" && !user.verified);

    // Activity level filtering (based on activity score)
    const matchesActivity = (() => {
      if (advancedFilters.activityLevel === "all") return true;

      const score = user.activityScore || 0;
      switch (advancedFilters.activityLevel) {
        case "high":
          return score >= 70;
        case "medium":
          return score >= 30 && score < 70;
        case "low":
          return score < 30;
        default:
          return true;
      }
    })();

    return (
      matchesTab &&
      matchesSearch &&
      matchesStatus &&
      matchesDateRange &&
      matchesVerification &&
      matchesActivity
    );
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
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </div>
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
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            User Management
          </h1>
          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mt-1 space-y-2 sm:space-y-0">
            <p className="text-sm sm:text-base text-gray-600">
              Manage platform users and permissions ({users.length} users
              loaded)
            </p>
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500">
              <span className="hidden sm:inline">
                Last updated: {lastRefresh.toLocaleTimeString()}
              </span>
              <button
                onClick={refreshUserData}
                className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 font-medium transition-colors"
                disabled={isLoading}
              >
                <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Refresh</span>
              </button>
              <label className="flex items-center space-x-1">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-xs">Auto-refresh</span>
              </label>
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
          <Button
            variant="outline"
            onClick={exportUsers}
            className="flex items-center justify-center space-x-2 w-full sm:w-auto"
            size="sm"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export Users</span>
            <span className="sm:hidden">Export</span>
          </Button>
          <Button
            onClick={() => setShowCreateUserModal(true)}
            className="flex items-center justify-center space-x-2 w-full sm:w-auto"
            size="sm"
          >
            <UserPlus className="w-4 h-4" />
            <span className="hidden sm:inline">Add User</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>
      </div>{" "}
      {/* User Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4">
        {[
          {
            label: "Total",
            value: userStats.total,
            color: "bg-blue-100 text-blue-800",
            icon: UsersIcon,
            bgGradient: "from-blue-500 to-blue-600",
          },
          {
            label: "Active",
            value: userStats.active,
            color: "bg-green-100 text-green-800",
            icon: CheckCircle,
            bgGradient: "from-green-500 to-green-600",
          },
          {
            label: "Pending",
            value: userStats.pending,
            color: "bg-yellow-100 text-yellow-800",
            icon: Calendar,
            bgGradient: "from-yellow-500 to-yellow-600",
          },
          {
            label: "Innovators",
            value: userStats.innovators,
            color: "bg-blue-100 text-blue-800",
            icon: Activity,
            bgGradient: "from-blue-500 to-blue-600",
          },
          {
            label: "Investors",
            value: userStats.investors,
            color: "bg-purple-100 text-purple-800",
            icon: Building,
            bgGradient: "from-purple-500 to-purple-600",
          },
          {
            label: "Hubs",
            value: userStats.hubs,
            color: "bg-orange-100 text-orange-800",
            icon: Building,
            bgGradient: "from-orange-500 to-orange-600",
          },
          {
            label: "Admins",
            value: userStats.admins,
            color: "bg-gray-100 text-gray-800",
            icon: Shield,
            bgGradient: "from-gray-500 to-gray-600",
          },
        ].map((stat, index) => (
          <Card
            key={index}
            className="p-3 sm:p-4 text-center hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-center mb-2 sm:mb-3">
              <div
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r ${stat.bgGradient} flex items-center justify-center`}
              >
                <stat.icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
            </div>
            <div className="text-xs sm:text-sm font-medium text-gray-600 mb-1">
              {stat.label}
            </div>
            <div className="text-lg sm:text-xl font-bold text-gray-900">
              {stat.value}
            </div>
          </Card>
        ))}
      </div>{" "}
      {/* Search and Filters */}
      <Card className="p-4 sm:p-6">
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
            {/* Tab Navigation - Mobile Responsive */}
            <div className="flex flex-wrap gap-2">
              {["all", "innovator", "investor", "hub", "admin", "pending"].map(
                (tab) => (
                  <button
                    key={tab}
                    onClick={() => setSelectedTab(tab)}
                    className={`px-3 py-2 sm:px-4 rounded-lg text-xs sm:text-sm font-medium capitalize whitespace-nowrap ${
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

            {/* Search and Filter Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="relative flex-1 sm:flex-initial">
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="w-4 h-4 text-gray-400" />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className={`flex items-center space-x-2 ${showAdvancedFilters ? "bg-blue-50 text-blue-700" : ""}`}
                >
                  <Settings className="w-4 h-4" />
                  <span className="hidden sm:inline">Filters</span>
                  <span className="sm:hidden">Filter</span>
                  {getActiveFiltersCount() > 0 && (
                    <span>({getActiveFiltersCount()})</span>
                  )}
                </Button>
                {getActiveFiltersCount() > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearAllFilters}
                    className="text-red-600 hover:text-red-700 whitespace-nowrap"
                  >
                    <span className="hidden sm:inline">Clear All</span>
                    <span className="sm:hidden">Clear</span>
                  </Button>
                )}
              </div>
            </div>
          </div>{" "}
          {/* Advanced Filters Panel */}
          {showAdvancedFilters && (
            <div className="border-t pt-4 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={advancedFilters.status}
                    onChange={(e) =>
                      updateAdvancedFilter("status", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    aria-label="Filter by user status"
                  >
                    <option value="all">All Statuses</option>
                    <option value="active">Active Only</option>
                    <option value="inactive">Inactive Only</option>
                    <option value="blocked">Blocked Only</option>
                    <option value="pending">Pending Only</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Join Date
                  </label>
                  <select
                    value={advancedFilters.dateRange}
                    onChange={(e) =>
                      updateAdvancedFilter("dateRange", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    aria-label="Filter by join date range"
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">Last Week</option>
                    <option value="month">Last Month</option>
                    <option value="year">Last Year</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Verification
                  </label>
                  <select
                    value={advancedFilters.verificationStatus}
                    onChange={(e) =>
                      updateAdvancedFilter("verificationStatus", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    aria-label="Filter by verification status"
                  >
                    <option value="all">All Users</option>
                    <option value="verified">Verified Only</option>
                    <option value="unverified">Unverified Only</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Activity Level
                  </label>
                  <select
                    value={advancedFilters.activityLevel}
                    onChange={(e) =>
                      updateAdvancedFilter("activityLevel", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    aria-label="Filter by activity level"
                  >
                    <option value="all">All Levels</option>
                    <option value="high">High Activity (70%+)</option>
                    <option value="medium">Medium Activity (30-70%)</option>
                    <option value="low">Low Activity (&lt;30%)</option>
                  </select>
                </div>
              </div>

              <div className="mt-4 text-xs sm:text-sm text-gray-500">
                Showing {filteredUsers.length} of {users.length} users
                {getActiveFiltersCount() > 0 &&
                  ` with ${getActiveFiltersCount()} filter${getActiveFiltersCount() !== 1 ? "s" : ""} applied`}
              </div>
            </div>
          )}{" "}
          {/* Bulk Actions Bar */}
          {selectedUsers.length > 0 && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 space-y-3 sm:space-y-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 space-y-2 sm:space-y-0">
                <span className="text-sm font-medium text-blue-900">
                  {selectedUsers.length} user
                  {selectedUsers.length !== 1 ? "s" : ""} selected
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedUsers([])}
                  className="text-blue-600 border-blue-300 w-full sm:w-auto"
                >
                  Clear Selection
                </Button>
              </div>
              <Button
                size="sm"
                onClick={() => setShowBulkActionModal(true)}
                className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
              >
                Bulk Actions
              </Button>
            </div>
          )}
        </div>
      </Card>{" "}
      {/* Users Table */}
      <Card className="overflow-hidden">
        {/* Mobile View - Card Layout */}
        <div className="block sm:hidden">
          <div className="p-4 space-y-4">
            {paginatedUsers.map((user) => (
              <div
                key={user.id}
                className="border border-gray-200 rounded-lg p-4 space-y-3"
              >
                {/* User Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    {" "}
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => handleSelectUser(user.id)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      aria-label={`Select user ${user.name || user.email}`}
                    />
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-700">
                          {user.name
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("") || "?"}
                        </span>
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {user.name}
                        </div>
                        {user.verified && (
                          <div className="ml-2 w-4 h-4 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <CheckCircle className="w-3 h-3 text-blue-600" />
                          </div>
                        )}
                      </div>
                      <div className="text-sm text-gray-500 truncate">
                        {user.email}
                      </div>
                    </div>
                  </div>
                </div>

                {/* User Details */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-500">Role:</span>
                    <span
                      className={`ml-1 px-2 py-1 rounded-full text-xs font-medium ${roleColors[user.role]}`}
                    >
                      {user.role}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Status:</span>
                    <span
                      className={`ml-1 px-2 py-1 rounded-full text-xs font-medium ${statusColors[user.status]}`}
                    >
                      {user.status}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Activity:</span>
                    <span className="ml-1 text-gray-900">
                      {user.activityScore}%
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Joined:</span>
                    <span className="ml-1 text-gray-900">{user.joinDate}</span>
                  </div>
                </div>

                {/* Mobile Actions */}
                <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
                  <Button
                    size="sm"
                    onClick={() => viewUserDetails(user)}
                    className="flex items-center space-x-1"
                  >
                    <Eye className="w-3 h-3" />
                    <span>View</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => editUser(user)}
                    className="flex items-center space-x-1"
                  >
                    <Edit className="w-3 h-3" />
                    <span>Edit</span>
                  </Button>

                  {/* Status-specific mobile actions */}
                  {user.status === "pending" && (
                    <Button
                      size="sm"
                      className="flex items-center space-x-1 bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => handleStatusAction(user, "activate")}
                    >
                      <CheckCircle className="w-3 h-3" />
                      <span>Activate</span>
                    </Button>
                  )}
                  {user.status === "active" && (
                    <Button
                      size="sm"
                      className="flex items-center space-x-1 bg-red-600 hover:bg-red-700 text-white"
                      onClick={() => handleStatusAction(user, "block")}
                    >
                      <Ban className="w-3 h-3" />
                      <span>Block</span>
                    </Button>
                  )}
                  {user.status === "blocked" && (
                    <Button
                      size="sm"
                      className="flex items-center space-x-1 bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => handleStatusAction(user, "unblock")}
                    >
                      <Unlock className="w-3 h-3" />
                      <span>Unblock</span>
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Desktop View - Table Layout */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {" "}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={
                      paginatedUsers.length > 0 &&
                      paginatedUsers.every((user) =>
                        selectedUsers.includes(user.id)
                      )
                    }
                    onChange={handleSelectAll}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    aria-label="Select all users on this page"
                  />
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("name")}
                >
                  <div className="flex items-center space-x-1">
                    {" "}
                    <span>User</span>
                    <span className="text-gray-400">
                      {sortField === "name" ? (
                        sortDirection === "asc" ? (
                          <ArrowUp className="w-3 h-3" />
                        ) : (
                          <ArrowDown className="w-3 h-3" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3 h-3" />
                      )}
                    </span>
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("role")}
                >
                  <div className="flex items-center space-x-1">
                    {" "}
                    <span>Role</span>
                    <span className="text-gray-400">
                      {sortField === "role" ? (
                        sortDirection === "asc" ? (
                          <ArrowUp className="w-3 h-3" />
                        ) : (
                          <ArrowDown className="w-3 h-3" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3 h-3" />
                      )}
                    </span>
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("status")}
                >
                  <div className="flex items-center space-x-1">
                    {" "}
                    <span>Status</span>
                    <span className="text-gray-400">
                      {sortField === "status" ? (
                        sortDirection === "asc" ? (
                          <ArrowUp className="w-3 h-3" />
                        ) : (
                          <ArrowDown className="w-3 h-3" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3 h-3" />
                      )}
                    </span>
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("company")}
                >
                  <div className="flex items-center space-x-1">
                    {" "}
                    <span>Company</span>
                    <span className="text-gray-400">
                      {sortField === "company" ? (
                        sortDirection === "asc" ? (
                          <ArrowUp className="w-3 h-3" />
                        ) : (
                          <ArrowDown className="w-3 h-3" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3 h-3" />
                      )}
                    </span>
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("joinDate")}
                >
                  <div className="flex items-center space-x-1">
                    {" "}
                    <span>Join Date</span>
                    <span className="text-gray-400">
                      {sortField === "joinDate" ? (
                        sortDirection === "asc" ? (
                          <ArrowUp className="w-3 h-3" />
                        ) : (
                          <ArrowDown className="w-3 h-3" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3 h-3" />
                      )}
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
                  {" "}
                  <td className="px-6 py-4 whitespace-nowrap">
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
                        {" "}
                        <div className="flex items-center">
                          <div className="text-sm font-medium text-gray-900">
                            {user.name}
                          </div>
                          {user.verified && (
                            <div className="ml-2 w-4 h-4 bg-blue-100 rounded-full flex items-center justify-center">
                              <CheckCircle className="w-3 h-3 text-blue-600" />
                            </div>
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
                  </td>{" "}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.joinDate}
                  </td>
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
                      </span>{" "}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {" "}
                    <div className="flex items-center space-x-2">
                      {" "}
                      <Button
                        size="sm"
                        onClick={() => viewUserDetails(user)}
                        className="flex items-center space-x-1"
                      >
                        <Eye className="w-3 h-3" />
                        <span>View</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => editUser(user)}
                        className="flex items-center space-x-1"
                      >
                        <Edit className="w-3 h-3" />
                        <span>Edit</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center space-x-1 text-red-600 border-red-300 hover:bg-red-50"
                        onClick={() =>
                          handleDeleteUser(user.id, user.name || user.email)
                        }
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete</span>
                      </Button>
                      {/* Status-based Action Buttons */}
                      {user.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            className="flex items-center space-x-1 bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => handleStatusAction(user, "activate")}
                          >
                            <CheckCircle className="w-3 h-3" />
                            <span>Activate</span>
                          </Button>
                          <Button
                            size="sm"
                            className="flex items-center space-x-1 bg-red-600 hover:bg-red-700 text-white"
                            onClick={() => handleStatusAction(user, "reject")}
                          >
                            <X className="w-3 h-3" />
                            <span>Reject</span>
                          </Button>
                        </>
                      )}
                      {user.status === "active" && (
                        <>
                          <Button
                            size="sm"
                            className="flex items-center space-x-1 bg-yellow-600 hover:bg-yellow-700 text-white"
                            onClick={() =>
                              handleStatusAction(user, "inactivate")
                            }
                          >
                            <Pause className="w-3 h-3" />
                            <span>Inactivate</span>
                          </Button>
                          <Button
                            size="sm"
                            className="flex items-center space-x-1 bg-red-600 hover:bg-red-700 text-white"
                            onClick={() => handleStatusAction(user, "block")}
                          >
                            <Ban className="w-3 h-3" />
                            <span>Block</span>
                          </Button>
                        </>
                      )}
                      {user.status === "blocked" && (
                        <Button
                          size="sm"
                          className="flex items-center space-x-1 bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => handleStatusAction(user, "unblock")}
                        >
                          <Unlock className="w-3 h-3" />
                          <span>Unblock</span>
                        </Button>
                      )}
                      {(user.status === "inactive" ||
                        user.status === "pending") && (
                        <Button
                          size="sm"
                          className="flex items-center space-x-1 bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => handleStatusAction(user, "activate")}
                        >
                          <CheckCircle className="w-3 h-3" />
                          <span>Activate</span>
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>{" "}
        {/* Pagination - Mobile Responsive */}
        {totalPages > 1 && (
          <div className="px-4 sm:px-6 py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
              <div className="text-xs sm:text-sm text-gray-700 text-center sm:text-left">
                Showing {startIndex + 1} to{" "}
                {Math.min(endIndex, sortedUsers.length)} of {sortedUsers.length}{" "}
                users
              </div>

              {/* Responsive Pagination Controls */}
              <div className="flex items-center justify-center space-x-1 sm:space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="flex items-center space-x-1"
                >
                  <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Previous</span>
                  <span className="sm:hidden">Prev</span>
                </Button>

                {/* Show fewer page numbers on mobile */}
                <div className="flex space-x-1">
                  {totalPages <= 5 ? (
                    // Show all pages if 5 or fewer
                    Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <Button
                          key={page}
                          variant={currentPage === page ? "primary" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className="min-w-[32px] sm:min-w-[40px] px-2 sm:px-3"
                        >
                          {page}
                        </Button>
                      )
                    )
                  ) : (
                    // Show condensed pagination for many pages
                    <>
                      {currentPage > 3 && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(1)}
                            className="min-w-[32px] sm:min-w-[40px] px-2 sm:px-3"
                          >
                            1
                          </Button>
                          {currentPage > 4 && (
                            <span className="flex items-center px-2 text-gray-500">
                              ...
                            </span>
                          )}
                        </>
                      )}

                      {/* Show current page and adjacent pages */}
                      {Array.from(
                        { length: Math.min(3, totalPages) },
                        (_, i) => {
                          const page =
                            Math.max(
                              1,
                              Math.min(totalPages - 2, currentPage - 1)
                            ) + i;
                          return page;
                        }
                      ).map((page) => (
                        <Button
                          key={page}
                          variant={currentPage === page ? "primary" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className="min-w-[32px] sm:min-w-[40px] px-2 sm:px-3"
                        >
                          {page}
                        </Button>
                      ))}

                      {currentPage < totalPages - 2 && (
                        <>
                          {currentPage < totalPages - 3 && (
                            <span className="flex items-center px-2 text-gray-500">
                              ...
                            </span>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(totalPages)}
                            className="min-w-[32px] sm:min-w-[40px] px-2 sm:px-3"
                          >
                            {totalPages}
                          </Button>
                        </>
                      )}
                    </>
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="flex items-center space-x-1"
                >
                  <span className="hidden sm:inline">Next</span>
                  <span className="sm:hidden">Next</span>
                  <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
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
            await handleStatusAction(
              user,
              user.is_blocked ? "unblock" : "block"
            );
          }
          setShowUserModal(false);
          setSelectedUser(null);
        }}
        onActivate={async (userId) => {
          const user = users.find((u) => u.id === userId);
          if (user) {
            await handleStatusAction(user, "activate");
          }
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
