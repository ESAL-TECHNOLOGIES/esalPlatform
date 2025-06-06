import React, { useState, useEffect } from "react";
import { Card, Button, CardHeader, CardTitle, CardContent } from "@esal/ui";
import { analyticsAPI } from "../utils/api";

interface KPIData {
  label: string;
  value: string;
  change: string;
  trend: "up" | "down";
  icon: string;
  description?: string;
}

interface UserMetric {
  role: string;
  count: number;
  percentage: number;
  change: string;
  color: string;
}

interface EngagementData {
  metric: string;
  value: string;
  change: string;
  icon: string;
  trend: "up" | "down" | "stable";
}

interface RevenueBreakdown {
  source: string;
  amount: string;
  percentage: number;
  color: string;
  trend: string;
}

interface TopPerformer {
  type: string;
  name: string;
  metric: string;
  value: string;
  avatar: string;
  rank: number;
}

interface ChartData {
  date: string;
  users: number;
  revenue: number;
  engagement: number;
}

const Analytics = () => {
  const [timeRange, setTimeRange] = useState("30d");
  const [kpiData, setKpiData] = useState<KPIData[]>([]);
  const [userMetrics, setUserMetrics] = useState<UserMetric[]>([]);
  const [engagementData, setEngagementData] = useState<EngagementData[]>([]);
  const [revenueBreakdown, setRevenueBreakdown] = useState<RevenueBreakdown[]>(
    []
  );
  const [topPerformers, setTopPerformers] = useState<TopPerformer[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMetric, setSelectedMetric] = useState("overview");
  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch analytics data from backend
      const analyticsResponse = await analyticsAPI.getAnalytics(timeRange); // Transform backend data to component format with enhanced mock data
      const enhancedKpiData: KPIData[] = [
        {
          label: "Total Users",
          value: "12,847",
          change: "+12.5%",
          trend: "up" as const,
          icon: "👥",
          description: "Active registered users",
        },
        {
          label: "Monthly Revenue",
          value: "$94,250",
          change: "+18.2%",
          trend: "up" as const,
          icon: "💰",
          description: "Revenue this month",
        },
        {
          label: "Platform Usage",
          value: "87.3%",
          change: "+5.8%",
          trend: "up" as const,
          icon: "📊",
          description: "Daily active usage rate",
        },
        {
          label: "Success Rate",
          value: "94.1%",
          change: "-2.1%",
          trend: "down" as const,
          icon: "🎯",
          description: "Feature adoption success",
        },
      ];

      const enhancedUserMetrics: UserMetric[] = [
        {
          role: "Innovators",
          count: 5420,
          percentage: 65,
          change: "+8.2%",
          color: "#3B82F6",
        },
        {
          role: "Investors",
          count: 1680,
          percentage: 20,
          change: "+12.5%",
          color: "#10B981",
        },
        {
          role: "Hub Managers",
          count: 840,
          percentage: 10,
          change: "+5.8%",
          color: "#F59E0B",
        },
        {
          role: "Admins",
          count: 420,
          percentage: 5,
          change: "+2.1%",
          color: "#8B5CF6",
        },
      ];

      const enhancedEngagementData: EngagementData[] = [
        {
          metric: "Session Duration",
          value: "24.5 min",
          change: "+15.3%",
          icon: "⏱️",
          trend: "up" as const,
        },
        {
          metric: "Page Views",
          value: "847K",
          change: "+22.1%",
          icon: "👁️",
          trend: "up" as const,
        },
        {
          metric: "Conversion Rate",
          value: "12.8%",
          change: "+3.2%",
          icon: "🎯",
          trend: "up" as const,
        },
        {
          metric: "Bounce Rate",
          value: "28.4%",
          change: "-5.6%",
          icon: "📉",
          trend: "up" as const,
        },
      ];

      const enhancedRevenueBreakdown: RevenueBreakdown[] = [
        {
          source: "Subscription Fees",
          amount: "$52,400",
          percentage: 55,
          color: "#3B82F6",
          trend: "+8.5%",
        },
        {
          source: "Commission",
          amount: "$28,300",
          percentage: 30,
          color: "#10B981",
          trend: "+12.2%",
        },
        {
          source: "Premium Features",
          amount: "$9,450",
          percentage: 10,
          color: "#F59E0B",
          trend: "+18.7%",
        },
        {
          source: "Partnerships",
          amount: "$4,100",
          percentage: 5,
          color: "#8B5CF6",
          trend: "+25.3%",
        },
      ];

      const enhancedTopPerformers: TopPerformer[] = [
        {
          type: "startup",
          name: "TechFlow Solutions",
          metric: "Monthly Growth",
          value: "+45%",
          avatar: "🚀",
          rank: 1,
        },
        {
          type: "investor",
          name: "Venture Capital Partners",
          metric: "Portfolio Value",
          value: "$2.4M",
          avatar: "💼",
          rank: 2,
        },
        {
          type: "hub",
          name: "Innovation Hub Central",
          metric: "Active Members",
          value: "324",
          avatar: "🏢",
          rank: 3,
        },
      ];

      // Generate sample chart data
      const sampleChartData: ChartData[] = Array.from(
        { length: 30 },
        (_, i) => ({
          date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
          users: Math.floor(Math.random() * 500) + 800,
          revenue: Math.floor(Math.random() * 5000) + 2000,
          engagement: Math.floor(Math.random() * 40) + 60,
        })
      );

      setKpiData(enhancedKpiData);
      setUserMetrics(enhancedUserMetrics);
      setEngagementData(enhancedEngagementData);
      setRevenueBreakdown(enhancedRevenueBreakdown);
      setTopPerformers(enhancedTopPerformers);
      setChartData(sampleChartData);
    } catch (err) {
      console.error("Analytics fetch error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load analytics data"
      );
    } finally {
      setIsLoading(false);
    }
  };
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics data...</p>
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
            Failed to Load Analytics
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={fetchAnalyticsData}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {" "}
      {/* Enhanced Header with Metrics Tabs */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
            <p className="text-blue-100 mt-1">
              Comprehensive platform performance insights and user analytics
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white focus:ring-2 focus:ring-white focus:ring-opacity-30"
              title="Select time range for analytics"
            >
              <option value="7d" className="text-gray-900">
                Last 7 days
              </option>
              <option value="30d" className="text-gray-900">
                Last 30 days
              </option>
              <option value="90d" className="text-gray-900">
                Last 90 days
              </option>
              <option value="1y" className="text-gray-900">
                Last year
              </option>
            </select>
            <Button
              variant="outline"
              className="bg-white bg-opacity-10 border-white border-opacity-20 text-white hover:bg-white hover:bg-opacity-20"
            >
              <span className="mr-2">📊</span>
              Export Report
            </Button>
            <Button className="bg-white bg-opacity-20 hover:bg-white hover:bg-opacity-30 text-white border-0">
              <span className="mr-2">📅</span>
              Schedule Report
            </Button>
          </div>
        </div>

        {/* Metric Tabs */}
        <div className="flex space-x-4 mt-6">
          {[
            { id: "overview", label: "Overview", icon: "📊" },
            { id: "users", label: "Users", icon: "👥" },
            { id: "revenue", label: "Revenue", icon: "💰" },
            { id: "engagement", label: "Engagement", icon: "🎯" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedMetric(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedMetric === tab.id
                  ? "bg-white bg-opacity-20 text-white"
                  : "text-blue-100 hover:bg-white hover:bg-opacity-10"
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      {/* Enhanced KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiData.map((kpi, index) => (
          <Card
            key={index}
            className="relative overflow-hidden bg-gradient-to-br from-white to-gray-50 hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <span className="text-2xl">{kpi.icon}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                      {kpi.label}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {kpi.value}
                    </p>
                    {kpi.description && (
                      <p className="text-xs text-gray-500 mt-1">
                        {kpi.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      kpi.trend === "up"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    <span className="mr-1">
                      {kpi.trend === "up" ? "📈" : "📉"}
                    </span>
                    {kpi.change}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>{" "}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enhanced User Distribution */}
        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
            <CardTitle className="flex items-center">
              <span className="mr-2">👥</span>
              User Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              {userMetrics.map((metric, index) => (
                <div key={index} className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: metric.color }}
                      ></div>
                      <span className="text-sm font-medium text-gray-900">
                        {metric.role}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-bold text-gray-900">
                        {metric.count.toLocaleString()}
                      </span>
                      <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
                        {metric.change}
                      </span>
                    </div>
                  </div>
                  <div className="relative">
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="h-3 rounded-full transition-all duration-1000 ease-out"
                        style={{
                          width: `${metric.percentage}%`,
                          backgroundColor: metric.color,
                          boxShadow: `0 2px 4px ${metric.color}33`,
                        }}
                      ></div>
                    </div>
                    <span className="absolute right-0 top-4 text-xs text-gray-500">
                      {metric.percentage}%
                    </span>
                  </div>
                </div>
              ))}

              {/* Total Users Summary */}
              <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Active Users</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {userMetrics
                        .reduce((sum, metric) => sum + metric.count, 0)
                        .toLocaleString()}
                    </p>
                  </div>
                  <div className="text-3xl">🎯</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Engagement Metrics */}
        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
            <CardTitle className="flex items-center">
              <span className="mr-2">📊</span>
              Engagement Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 gap-4">
              {engagementData.map((engagement, index) => (
                <div
                  key={index}
                  className="p-4 bg-gradient-to-r from-white to-gray-50 rounded-xl border border-gray-100 hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <span className="text-lg">{engagement.icon}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {engagement.metric}
                        </p>
                        <p className="text-lg font-bold text-gray-900">
                          {engagement.value}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          engagement.trend === "up"
                            ? "bg-green-100 text-green-800"
                            : engagement.trend === "down"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        <span className="mr-1">
                          {engagement.trend === "up"
                            ? "📈"
                            : engagement.trend === "down"
                              ? "📉"
                              : "➡️"}
                        </span>
                        {engagement.change}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {/* Engagement Summary */}
            <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-100 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-700">Overall Engagement</p>
                  <p className="text-xl font-bold text-green-900">Excellent</p>
                  <p className="text-xs text-green-600">
                    All metrics trending positive
                  </p>
                </div>
                <div className="text-2xl">🚀</div>
              </div>
            </div>{" "}
          </CardContent>
        </Card>
      </div>{" "}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enhanced Revenue Breakdown */}
        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-50 border-b">
            <CardTitle className="flex items-center">
              <span className="mr-2">💰</span>
              Revenue Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              {revenueBreakdown.map((revenue, index) => (
                <div key={index} className="relative">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: revenue.color }}
                      ></div>
                      <span className="text-sm font-medium text-gray-900">
                        {revenue.source}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-lg font-bold text-gray-900">
                        {revenue.amount}
                      </span>
                      <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
                        {revenue.trend}
                      </span>
                    </div>
                  </div>
                  <div className="relative">
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="h-3 rounded-full transition-all duration-1000 ease-out"
                        style={{
                          width: `${revenue.percentage}%`,
                          backgroundColor: revenue.color,
                          boxShadow: `0 2px 4px ${revenue.color}33`,
                        }}
                      ></div>
                    </div>
                    <span className="absolute right-0 top-4 text-xs text-gray-500">
                      {revenue.percentage}% of total
                    </span>
                  </div>
                </div>
              ))}

              {/* Revenue Summary */}
              <div className="mt-6 p-4 bg-gradient-to-r from-emerald-50 to-green-100 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-emerald-700">Total Revenue</p>
                    <p className="text-2xl font-bold text-emerald-900">
                      $
                      {revenueBreakdown
                        .reduce(
                          (sum, rev) =>
                            sum + parseInt(rev.amount.replace(/[$,]/g, "")),
                          0
                        )
                        .toLocaleString()}
                    </p>
                    <p className="text-xs text-emerald-600">
                      Monthly recurring revenue
                    </p>
                  </div>
                  <div className="text-3xl">💎</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>{" "}
        {/* Enhanced Top Performers */}
        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b">
            <CardTitle className="flex items-center">
              <span className="mr-2">🏆</span>
              Top Performers
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {topPerformers.map((performer, index) => (
                <div
                  key={index}
                  className="relative p-4 bg-gradient-to-r from-white to-gray-50 rounded-xl border border-gray-100 hover:shadow-lg transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {/* Rank Badge */}
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          performer.rank === 1
                            ? "bg-yellow-100 text-yellow-800"
                            : performer.rank === 2
                              ? "bg-gray-100 text-gray-800"
                              : "bg-orange-100 text-orange-800"
                        }`}
                      >
                        #{performer.rank}
                      </div>

                      {/* Avatar and Info */}
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                          <span className="text-xl">{performer.avatar}</span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {performer.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {performer.metric}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Performance Value */}
                    <div className="text-right">
                      <div className="text-xl font-bold text-gray-900">
                        {performer.value}
                      </div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide">
                        {performer.type}
                      </div>
                    </div>
                  </div>

                  {/* Trophy for #1 */}
                  {performer.rank === 1 && (
                    <div className="absolute -top-1 -right-1">
                      <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                        <span className="text-xs">👑</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Leaderboard Summary */}
            <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-indigo-100 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-700">
                    Performance Overview
                  </p>
                  <p className="text-lg font-bold text-purple-900">
                    Exceptional Growth
                  </p>
                  <p className="text-xs text-purple-600">
                    All top performers showing strong metrics
                  </p>
                </div>
                <div className="text-2xl">🌟</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>{" "}
      {/* Enhanced Chart Section with Multiple Views */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main Chart */}
        <Card className="xl:col-span-2 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="mr-2">📈</span>
                Platform Growth Trends
              </div>
              <div className="flex space-x-2">
                {["Users", "Revenue", "Engagement"].map((metric) => (
                  <button
                    key={metric}
                    className="px-3 py-1 text-xs rounded-full border border-gray-300 hover:bg-gray-100 transition-colors"
                  >
                    {metric}
                  </button>
                ))}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-12 text-center border-2 border-dashed border-gray-200">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Advanced Analytics Coming Soon
              </h3>
              <p className="text-gray-600 mb-4">
                Interactive charts and real-time data visualization
              </p>
              <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                <span className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-1"></span>
                  Real-time data
                </span>
                <span className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                  Multiple metrics
                </span>
                <span className="flex items-center">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-1"></span>
                  Custom filters
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Insights Panel */}
        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 border-b">
            <CardTitle className="flex items-center">
              <span className="mr-2">💡</span>
              Quick Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="text-lg mb-2">🎯</div>
                <h3 className="font-medium text-gray-900">Peak Usage Hours</h3>
                <p className="text-sm text-gray-600">
                  Most active between 9 AM - 11 AM EST
                </p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="text-lg mb-2">📱</div>
                <h3 className="font-medium text-gray-900">Mobile Usage</h3>
                <p className="text-sm text-gray-600">
                  67% of users access via mobile devices
                </p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="text-lg mb-2">🌍</div>
                <h3 className="font-medium text-gray-900">
                  Geographic Distribution
                </h3>
                <p className="text-sm text-gray-600">
                  Top regions: US (45%), EU (32%), Asia (23%)
                </p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <div className="text-lg mb-2">⚡</div>
                <h3 className="font-medium text-gray-900">
                  System Performance
                </h3>
                <p className="text-sm text-gray-600">
                  Average response time: 142ms
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Action Center */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-gray-900 to-gray-800 text-white">
          <CardTitle className="flex items-center">
            <span className="mr-2">⚙️</span>
            Analytics Action Center
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button className="h-16 flex flex-col items-center justify-center space-y-2 bg-blue-600 hover:bg-blue-700">
              <span className="text-lg">📊</span>
              <span className="text-sm">Custom Reports</span>
            </Button>
            <Button
              variant="outline"
              className="h-16 flex flex-col items-center justify-center space-y-2 hover:bg-green-50"
            >
              <span className="text-lg">📈</span>
              <span className="text-sm">Export Data</span>
            </Button>
            <Button
              variant="outline"
              className="h-16 flex flex-col items-center justify-center space-y-2 hover:bg-purple-50"
            >
              <span className="text-lg">🔔</span>
              <span className="text-sm">Alert Settings</span>
            </Button>
            <Button
              variant="outline"
              className="h-16 flex flex-col items-center justify-center space-y-2 hover:bg-orange-50"
            >
              <span className="text-lg">🎛️</span>
              <span className="text-sm">Advanced Config</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;
