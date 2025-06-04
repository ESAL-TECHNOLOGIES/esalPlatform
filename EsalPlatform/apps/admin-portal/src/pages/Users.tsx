import React, { useState, useEffect } from "react";
import { Card, Button } from "@esal/ui";
import { adminAPI } from "../utils/api";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  joinDate: string;
  lastLogin: string;
  company: string;
  verified: boolean;
  activityScore: number;
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
  const [selectedTab, setSelectedTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);
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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch users from backend
      const usersData = await adminAPI.getUsers();
      setUsers(usersData.users);

      // Calculate stats from real data
      const stats: UserStats = {
        total: usersData.users.length,
        active: usersData.users.filter((u) => u.status === "active").length,
        pending: usersData.users.filter((u) => u.status === "pending").length,
        innovators: usersData.users.filter((u) => u.role === "innovator")
          .length,
        investors: usersData.users.filter((u) => u.role === "investor").length,
        hubs: usersData.users.filter((u) => u.role === "hub").length,
        admins: usersData.users.filter((u) => u.role === "admin").length,
      };
      setUserStats(stats);
    } catch (err) {
      console.error("Users fetch error:", err);
      setError(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserAction = async (userId: number, action: string) => {
    try {
      await adminAPI.updateUserStatus(userId, action);
      await fetchUsers(); // Refresh data
    } catch (err) {
      console.error("User action error:", err);
      // Could add toast notification here
    }
  };
  const filteredUsers = users.filter((user) => {
    const matchesTab =
      selectedTab === "all" ||
      user.role === selectedTab ||
      user.status === selectedTab;
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.company.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

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

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="text-red-600 text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Failed to Load Users
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
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
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">Export Users</Button>
          <Button>Add User</Button>
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
      </div>

      {/* Search and Filters */}
      <Card className="p-6">
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
      </Card>

      {/* Users Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Join Date
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
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
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
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${user.activityScore}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-900">
                        {user.activityScore}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <Button size="sm">View</Button>
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>{" "}
                    {user.status === "pending" && (
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => handleUserAction(user.id, "approve")}
                      >
                        Approve
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Bulk Actions */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Bulk Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            variant="outline"
            className="h-16 flex flex-col items-center justify-center space-y-2"
          >
            <span className="text-lg">✉️</span>
            <span>Send Notification</span>
          </Button>
          <Button
            variant="outline"
            className="h-16 flex flex-col items-center justify-center space-y-2"
          >
            <span className="text-lg">📊</span>
            <span>Export Report</span>
          </Button>
          <Button
            variant="outline"
            className="h-16 flex flex-col items-center justify-center space-y-2"
          >
            <span className="text-lg">⚠️</span>
            <span>Moderate Content</span>
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Users;
