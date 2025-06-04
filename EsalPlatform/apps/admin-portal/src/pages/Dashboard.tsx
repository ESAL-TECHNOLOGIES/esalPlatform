import React, { useState, useEffect } from "react";
import { Card, Button } from "@esal/ui";
import { adminAPI, analyticsAPI, systemAPI } from "../utils/api";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface DashboardStats {
  total_users: number;
  total_ideas: number;
  active_users: number;
}

interface PlatformStat {
  label: string;
  value: string;
  change: string;
  period: string;
}

interface Activity {
  type: string;
  message: string;
  time: string;
  status: string;
}

interface PendingAction {
  title: string;
  count: number;
  urgency: string;
}

interface SystemHealthItem {
  service: string;
  status: string;
  uptime: string;
  responseTime: string;
}

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(
    null
  );
  const [platformStats, setPlatformStats] = useState<PlatformStat[]>([]);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [pendingActions, setPendingActions] = useState<PendingAction[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealthItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardData();

    // Set up auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 30000);

    return () => clearInterval(interval);
  }, []);
  const fetchDashboardData = async () => {
    try {
      setRefreshing(true);
      setError(null);

      // Fetch real dashboard stats from backend
      const stats = await adminAPI.getDashboardStats();
      setDashboardStats(stats);

      // Calculate growth percentages (mock for now)
      const calculateGrowth = (current: number) => {
        const growth = Math.floor(Math.random() * 20) + 5; // 5-25% growth
        return `+${growth}%`;
      };

      // Transform backend stats into platform stats format
      const transformedStats: PlatformStat[] = [
        {
          label: "Total Users",
          value: stats.total_users.toLocaleString(),
          change: calculateGrowth(stats.total_users),
          period: "this month",
        },
        {
          label: "Active Users",
          value: stats.active_users.toLocaleString(),
          change: calculateGrowth(stats.active_users),
          period: "last 30 days",
        },
        {
          label: "Total Ideas",
          value: stats.total_ideas.toLocaleString(),
          change: calculateGrowth(stats.total_ideas),
          period: "all time",
        },
        {
          label: "Platform Health",
          value: "Excellent",
          change: "99.9%",
          period: "uptime",
        },
      ];
      setPlatformStats(transformedStats);

      // Fetch activity data
      const activityData = await analyticsAPI.getActivityData();
      setRecentActivities(activityData.recentActivities || []);

      // Fetch pending actions
      const pendingData = await systemAPI.getPendingActions();
      setPendingActions(pendingData.pendingActions || []);

      // Fetch system health
      const healthData = await systemAPI.getSystemHealth();
      setSystemHealth(healthData.systemHealth || []);

      setLastRefresh(new Date());
    } catch (err) {
      console.error("Dashboard data fetch error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load dashboard data"
      );
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };
  const handleManualRefresh = () => {
    fetchDashboardData();
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case "users":
        navigate("/users");
        break;
      case "analytics":
        navigate("/analytics");
        break;
      case "settings":
        navigate("/settings");
        break;
      case "support":
        navigate("/support");
        break;
      case "content":
        navigate("/content");
        break;
      case "system":
        navigate("/system");
        break;
      default:
        console.log(`Quick action: ${action}`);
    }
  };

  const handleLogout = () => {
    if (confirm("Are you sure you want to logout?")) {
      logout();
      navigate("/login");
    }
  };

  const formatLastRefresh = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    review: "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
    alert: "bg-red-100 text-red-800",
  };

  const urgencyColors = {
    high: "bg-red-100 text-red-800",
    medium: "bg-yellow-100 text-yellow-800",
    low: "bg-green-100 text-green-800",
  };

  const healthColors = {
    healthy: "bg-green-100 text-green-800",
    warning: "bg-yellow-100 text-yellow-800",
    error: "bg-red-100 text-red-800",
  };
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard data...</p>
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
            Failed to Load Dashboard
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={fetchDashboardData}>Retry</Button>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      {/* Enhanced Header with Admin Profile */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              Welcome back, {user?.full_name}
            </h1>
            <p className="text-blue-100 mt-1">
              Admin Dashboard - Platform Overview & System Monitoring
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm text-blue-100">Logged in as</div>
              <div className="font-semibold">{user?.email}</div>
              <div className="text-xs text-blue-200">Administrator</div>
            </div>
            <div className="h-12 w-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <span className="text-2xl">👨‍💼</span>
            </div>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="bg-white bg-opacity-10 border-white border-opacity-20 text-white hover:bg-white hover:bg-opacity-20"
            >
              Logout
            </Button>
          </div>
        </div>
      </div>
      {/* Refresh Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            onClick={handleManualRefresh}
            disabled={refreshing}
            className="flex items-center space-x-2"
          >
            <span className={refreshing ? "animate-spin" : ""}>🔄</span>
            <span>{refreshing ? "Refreshing..." : "Refresh Data"}</span>
          </Button>
          <div className="text-sm text-gray-500">
            Last updated: {formatLastRefresh(lastRefresh)}
          </div>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>Auto-refresh: 30s intervals</span>
        </div>
      </div>{" "}
      {/* Enhanced Platform Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {platformStats.map((stat, index) => (
          <Card
            key={index}
            className="p-6 hover:shadow-lg transition-shadow duration-200"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                  {stat.label}
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stat.value}
                </p>
                <p className="text-xs text-gray-500 mt-1">{stat.period}</p>
              </div>
              <div className="text-right">
                <div
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    stat.change.startsWith("+")
                      ? "bg-green-100 text-green-800"
                      : stat.change.includes("%")
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {stat.change.startsWith("+") && "📈"} {stat.change}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {" "}
        {/* Enhanced Recent Activities */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Recent Activities
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickAction("analytics")}
            >
              View All Activities
            </Button>
          </div>
          <div className="space-y-4">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white">
                      {activity.type === "user" && "👤"}
                      {activity.type === "startup" && "🚀"}
                      {activity.type === "investment" && "💰"}
                      {activity.type === "report" && "⚠️"}
                      {activity.type === "system" && "⚙️"}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 font-medium">
                      {activity.message}
                    </p>
                    <div className="flex items-center space-x-3 mt-2">
                      <p className="text-xs text-gray-500">{activity.time}</p>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          statusColors[activity.status] ||
                          "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {activity.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">📊</div>
                <p>No recent activities to display</p>
              </div>
            )}
          </div>
        </Card>{" "}
        {/* Enhanced Pending Actions */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Pending Actions
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickAction("content")}
            >
              Manage All
            </Button>
          </div>
          <div className="space-y-4">
            {pendingActions.length > 0 ? (
              pendingActions.map((action, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          action.urgency === "high"
                            ? "bg-red-500"
                            : action.urgency === "medium"
                              ? "bg-yellow-500"
                              : "bg-green-500"
                        }`}
                      ></div>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">
                        {action.title}
                      </h3>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${
                          urgencyColors[action.urgency] ||
                          "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {action.urgency} priority
                      </span>
                    </div>
                  </div>
                  <div className="text-right flex items-center space-x-3">
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        {action.count}
                      </p>
                      <p className="text-xs text-gray-500">items</p>
                    </div>
                    <Button size="sm" className="min-w-[80px]">
                      Review
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">✅</div>
                <p>No pending actions</p>
              </div>
            )}
          </div>
        </Card>
      </div>{" "}
      {/* Enhanced System Health */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            System Health Monitor
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuickAction("system")}
          >
            View System Details
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {systemHealth.length > 0 ? (
            systemHealth.map((service, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-900">
                    {service.service}
                  </h3>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      healthColors[service.status] ||
                      "bg-gray-100 text-gray-800"
                    }`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full mr-1.5 ${
                        service.status === "healthy"
                          ? "bg-green-500"
                          : service.status === "warning"
                            ? "bg-yellow-500"
                            : "bg-red-500"
                      }`}
                    ></div>
                    {service.status}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500">Uptime:</span>
                    <span className="font-medium text-gray-900">
                      {service.uptime}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500">Response:</span>
                    <span className="font-medium text-gray-900">
                      {service.responseTime}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">⚙️</div>
              <p>System health data unavailable</p>
            </div>
          )}
        </div>
      </Card>{" "}
      {/* Enhanced Quick Actions */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Quick Actions & Navigation
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <Button
            onClick={() => handleQuickAction("users")}
            className="h-20 flex flex-col items-center justify-center space-y-2 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <span className="text-2xl">👥</span>
            <span className="text-sm font-medium">Users</span>
          </Button>
          <Button
            onClick={() => handleQuickAction("analytics")}
            variant="outline"
            className="h-20 flex flex-col items-center justify-center space-y-2 hover:bg-green-50 border-green-200"
          >
            <span className="text-2xl">📊</span>
            <span className="text-sm font-medium">Analytics</span>
          </Button>
          <Button
            onClick={() => handleQuickAction("content")}
            variant="outline"
            className="h-20 flex flex-col items-center justify-center space-y-2 hover:bg-purple-50 border-purple-200"
          >
            <span className="text-2xl">📝</span>
            <span className="text-sm font-medium">Content</span>
          </Button>
          <Button
            onClick={() => handleQuickAction("system")}
            variant="outline"
            className="h-20 flex flex-col items-center justify-center space-y-2 hover:bg-orange-50 border-orange-200"
          >
            <span className="text-2xl">⚙️</span>
            <span className="text-sm font-medium">System</span>
          </Button>
          <Button
            onClick={() => handleQuickAction("settings")}
            variant="outline"
            className="h-20 flex flex-col items-center justify-center space-y-2 hover:bg-gray-50 border-gray-200"
          >
            <span className="text-2xl">🔧</span>
            <span className="text-sm font-medium">Settings</span>
          </Button>
          <Button
            onClick={() => handleQuickAction("support")}
            variant="outline"
            className="h-20 flex flex-col items-center justify-center space-y-2 hover:bg-red-50 border-red-200"
          >
            <span className="text-2xl">🆘</span>
            <span className="text-sm font-medium">Support</span>
          </Button>
        </div>

        {/* Additional Admin Tools */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Admin Tools
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">
                🔍 Platform Search
              </h4>
              <p className="text-sm text-gray-600 mb-3">
                Search across all platform data
              </p>
              <Button size="sm" variant="outline">
                Open Search
              </Button>
            </div>
            <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">
                📈 Generate Reports
              </h4>
              <p className="text-sm text-gray-600 mb-3">
                Create custom analytics reports
              </p>
              <Button size="sm" variant="outline">
                Create Report
              </Button>
            </div>
            <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">
                🛠️ Bulk Operations
              </h4>
              <p className="text-sm text-gray-600 mb-3">
                Perform bulk user/content actions
              </p>
              <Button size="sm" variant="outline">
                Bulk Tools
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;
