import React, { useState, useEffect } from "react";
import { Card, Button } from "@esal/ui";
import { adminAPI, analyticsAPI, systemAPI } from "../utils/api";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Users,
  UserCheck,
  BarChart3,
  FileText,
  Settings,
  HeadphonesIcon,
  AlertTriangle,
  RefreshCw,
  User,
  Rocket,
  DollarSign,
  Shield,
  Cog,
  Activity,
  CheckCircle,
  Clock,
  Monitor,
  Search,
  TrendingUp,
  Wrench,
} from "lucide-react";

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
      setError(null); // Fetch real dashboard stats from backend
      const stats = await adminAPI.getDashboardStats();
      setDashboardStats(stats);

      // Transform backend stats into platform stats format
      const transformedStats: PlatformStat[] = [
        {
          label: "Total Users",
          value: stats.total_users.toLocaleString(),
          change: "N/A", // Would need historical data for real calculation
          period: "all time",
        },
        {
          label: "Active Users",
          value: stats.active_users.toLocaleString(),
          change: "N/A", // Would need historical data for real calculation
          period: "currently active",
        },
        {
          label: "Total Ideas",
          value: stats.total_ideas.toLocaleString(),
          change: "N/A", // Would need historical data for real calculation
          period: "all time",
        },
        {
          label: "Platform Health",
          value: "Operational",
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
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </div>
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
      {" "}
      {/* Enhanced Header with Admin Profile */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-4 sm:p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">
              Welcome back, {user?.full_name}
            </h1>
            <p className="text-blue-100 mt-1 text-sm sm:text-base">
              Admin Dashboard - Platform Overview & System Monitoring
            </p>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="hidden md:block text-right">
              <div className="text-sm text-blue-100">Logged in as</div>
              <div className="font-semibold text-sm lg:text-base">
                {user?.email}
              </div>
              <div className="text-xs text-blue-200">Administrator</div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 sm:h-12 sm:w-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <UserCheck className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <Button
                variant="outline"
                onClick={handleLogout}
                size="sm"
                className="bg-white bg-opacity-10 border-white border-opacity-20 text-white hover:bg-white hover:bg-opacity-20"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>{" "}
      {/* Refresh Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
          <Button
            onClick={handleManualRefresh}
            disabled={refreshing}
            size="sm"
            className="flex items-center justify-center space-x-2 w-full sm:w-auto"
          >
            <RefreshCw
              className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
            />
            <span>{refreshing ? "Refreshing..." : "Refresh Data"}</span>
          </Button>
          <div className="text-sm text-gray-500 text-center sm:text-left">
            Last updated: {formatLastRefresh(lastRefresh)}
          </div>
        </div>
        <div className="flex items-center justify-center sm:justify-end space-x-2 text-sm text-gray-500">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>Auto-refresh: 30s intervals</span>
        </div>
      </div>{" "}
      {/* Enhanced Platform Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {platformStats.map((stat, index) => (
          <Card
            key={index}
            className="p-4 sm:p-6 hover:shadow-lg transition-shadow duration-200"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wide truncate">
                  {stat.label}
                </p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">
                  {stat.value}
                </p>
                <p className="text-xs text-gray-500 mt-1 truncate">
                  {stat.period}
                </p>
              </div>
              <div className="text-right flex-shrink-0 ml-2">
                <div
                  className={`inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs font-medium gap-1 ${
                    stat.change.startsWith("+")
                      ? "bg-green-100 text-green-800"
                      : stat.change.includes("%")
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {stat.change.startsWith("+") && (
                    <TrendingUp className="w-3 h-3" />
                  )}
                  <span className="truncate">{stat.change}</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>{" "}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        {" "}
        {/* Enhanced Recent Activities */}
        <Card className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-3 sm:space-y-0">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              Recent Activities
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickAction("analytics")}
              className="w-full sm:w-auto"
            >
              View All Activities
            </Button>
          </div>
          <div className="space-y-3 sm:space-y-4">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-3 sm:space-x-4 p-2 sm:p-3 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white">
                      {activity.type === "user" && (
                        <User className="w-4 h-4 sm:w-5 sm:h-5" />
                      )}
                      {activity.type === "startup" && (
                        <Rocket className="w-4 h-4 sm:w-5 sm:h-5" />
                      )}
                      {activity.type === "investment" && (
                        <DollarSign className="w-4 h-4 sm:w-5 sm:h-5" />
                      )}
                      {activity.type === "report" && (
                        <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
                      )}
                      {activity.type === "system" && (
                        <Cog className="w-4 h-4 sm:w-5 sm:h-5" />
                      )}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 font-medium">
                      {activity.message}
                    </p>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 mt-2 space-y-1 sm:space-y-0">
                      <p className="text-xs text-gray-500">{activity.time}</p>
                      <span
                        className={`inline-flex px-2 py-1 rounded-full text-xs font-medium w-fit ${
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
              <div className="text-center py-6 sm:py-8 text-gray-500">
                <div className="flex justify-center mb-2">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-full flex items-center justify-center">
                    <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
                  </div>
                </div>
                <p className="text-sm">No recent activities to display</p>
              </div>
            )}
          </div>
        </Card>{" "}
        {/* Enhanced Pending Actions */}
        <Card className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-3 sm:space-y-0">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              Pending Actions
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickAction("content")}
              className="w-full sm:w-auto"
            >
              Manage All
            </Button>
          </div>
          <div className="space-y-3 sm:space-y-4">
            {pendingActions.length > 0 ? (
              pendingActions.map((action, index) => (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg hover:shadow-md transition-shadow space-y-3 sm:space-y-0"
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
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-semibold text-gray-900 truncate">
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
                  <div className="flex items-center justify-between sm:justify-end space-x-3 sm:text-right">
                    <div className="text-center sm:text-right">
                      <p className="text-xl sm:text-2xl font-bold text-gray-900">
                        {action.count}
                      </p>
                      <p className="text-xs text-gray-500">items</p>
                    </div>
                    <Button size="sm" className="min-w-[80px] flex-shrink-0">
                      Review
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 sm:py-8 text-gray-500">
                <div className="flex justify-center mb-2">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />
                  </div>
                </div>
                <p className="text-sm">No pending actions</p>
              </div>
            )}
          </div>
        </Card>
      </div>{" "}
      {/* Enhanced System Health & Information */}
      <Card className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-3 sm:space-y-0">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Monitor className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              System Health & Information
            </h2>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuickAction("system")}
            className="w-full sm:w-auto"
          >
            View System Details
          </Button>
        </div>

        {/* System Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <Clock className="w-4 h-4 text-white" />
              </div>
              <div className="ml-3 min-w-0 flex-1">
                <p className="text-sm font-medium text-blue-900 truncate">
                  System Uptime
                </p>
                <p className="text-lg font-bold text-blue-700">99.9%</p>
                <p className="text-xs text-blue-600">Last 30 days</p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <Activity className="w-4 h-4 text-white" />
              </div>
              <div className="ml-3 min-w-0 flex-1">
                <p className="text-sm font-medium text-green-900 truncate">
                  API Health
                </p>
                <p className="text-lg font-bold text-green-700">Excellent</p>
                <p className="text-xs text-green-600">
                  All endpoints responsive
                </p>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 sm:p-4 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                <Monitor className="w-4 h-4 text-white" />
              </div>
              <div className="ml-3 min-w-0 flex-1">
                <p className="text-sm font-medium text-purple-900 truncate">
                  Database
                </p>
                <p className="text-lg font-bold text-purple-700">Healthy</p>
                <p className="text-xs text-purple-600">Response time: 45ms</p>
              </div>
            </div>
          </div>
        </div>

        {/* Service Health Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {systemHealth.length > 0 ? (
            systemHealth.map((service, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-900 truncate pr-2">
                    {service.service}
                  </h3>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${
                      healthColors[service.status] ||
                      "bg-gray-100 text-gray-800"
                    }`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full mr-1 ${
                        service.status === "healthy"
                          ? "bg-green-500 animate-pulse"
                          : service.status === "warning"
                            ? "bg-yellow-500"
                            : "bg-red-500 animate-pulse"
                      }`}
                    ></div>
                    <span className="hidden sm:inline">{service.status}</span>
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
            <div className="col-span-full text-center py-6 sm:py-8 text-gray-500">
              <div className="flex justify-center mb-2">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-full flex items-center justify-center">
                  <Cog className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
                </div>
              </div>
              <p className="text-sm">System health data unavailable</p>
            </div>
          )}
        </div>
      </Card>{" "}
      {/* Enhanced Quick Actions */}
      <Card className="p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">
          Quick Actions & Navigation
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          <Button
            onClick={() => handleQuickAction("users")}
            className="h-16 sm:h-20 flex flex-col items-center justify-center space-y-1 sm:space-y-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm"
          >
            <Users className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="font-medium">Users</span>
          </Button>
          <Button
            onClick={() => handleQuickAction("analytics")}
            variant="outline"
            className="h-16 sm:h-20 flex flex-col items-center justify-center space-y-1 sm:space-y-2 hover:bg-green-50 border-green-200 text-xs sm:text-sm"
          >
            <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="font-medium">Analytics</span>
          </Button>
          <Button
            onClick={() => handleQuickAction("content")}
            variant="outline"
            className="h-16 sm:h-20 flex flex-col items-center justify-center space-y-1 sm:space-y-2 hover:bg-purple-50 border-purple-200 text-xs sm:text-sm"
          >
            <FileText className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="font-medium">Content</span>
          </Button>
          <Button
            onClick={() => handleQuickAction("system")}
            variant="outline"
            className="h-16 sm:h-20 flex flex-col items-center justify-center space-y-1 sm:space-y-2 hover:bg-orange-50 border-orange-200 text-xs sm:text-sm"
          >
            <Monitor className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="font-medium">System</span>
          </Button>
          <Button
            onClick={() => handleQuickAction("settings")}
            variant="outline"
            className="h-16 sm:h-20 flex flex-col items-center justify-center space-y-1 sm:space-y-2 hover:bg-gray-50 border-gray-200 text-xs sm:text-sm"
          >
            <Settings className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="font-medium">Settings</span>
          </Button>
          <Button
            onClick={() => handleQuickAction("support")}
            variant="outline"
            className="h-16 sm:h-20 flex flex-col items-center justify-center space-y-1 sm:space-y-2 hover:bg-red-50 border-red-200 text-xs sm:text-sm"
          >
            <HeadphonesIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="font-medium">Support</span>
          </Button>
        </div>

        {/* Additional Admin Tools */}
        <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
            Admin Tools
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <div className="p-3 sm:p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Search className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                <h4 className="font-semibold text-gray-900 text-sm sm:text-base">
                  Platform Search
                </h4>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 mb-3">
                Search across all platform data
              </p>
              <Button size="sm" variant="outline" className="w-full sm:w-auto">
                Open Search
              </Button>
            </div>
            <div className="p-3 sm:p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                <h4 className="font-semibold text-gray-900 text-sm sm:text-base">
                  Generate Reports
                </h4>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 mb-3">
                Create custom analytics reports
              </p>
              <Button size="sm" variant="outline" className="w-full sm:w-auto">
                Create Report
              </Button>
            </div>
            <div className="p-3 sm:p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg sm:col-span-2 lg:col-span-1">
              <div className="flex items-center space-x-2 mb-2">
                <Wrench className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                <h4 className="font-semibold text-gray-900 text-sm sm:text-base">
                  Bulk Operations
                </h4>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 mb-3">
                Perform bulk user/content actions
              </p>
              <Button size="sm" variant="outline" className="w-full sm:w-auto">
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
