import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@esal/ui";
import { API_BASE_URL } from "../config/api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import {
  Eye,
  Heart,
  Lightbulb,
  Bot,
  TrendingUp,
  BarChart3,
  Factory,
  Target,
  AlertTriangle,
} from "lucide-react";

interface MetricsData {
  id: string;
  title: string;
  views: number;
  interests: number;
  ai_score: number | null;
  status: string;
  created_at: string;
}

interface PerformanceMetrics {
  totalViews: number;
  totalInterests: number;
  totalIdeas: number;
  avgScore: number;
  icon?: React.ReactNode;
  description?: string;
  trend?: string;
  color?: string;
}

interface AnalyticsData {
  date: string;
  views: number;
  interests: number;
  ideas_created: number;
}

interface BackendAnalyticsResponse {
  overview: {
    total_ideas: number;
    active_ideas: number;
    draft_ideas: number;
    total_views: number;
    total_interests: number;
    avg_ai_score: number;
  };
  performance_trends: {
    views_last_30_days: number[];
    interests_last_30_days: number[];
  };
  top_performing: {
    most_viewed: {
      id: string;
      title: string;
      views: number;
    };
    most_interested: {
      id: string;
      title: string;
      interests: number;
    };
    highest_score: {
      id: string;
      title: string;
      ai_score: number;
    };
  };
  categories: {
    [key: string]: number;
  };
}

interface IndustryData {
  industry: string;
  interests: number;
  color: string;
}

const Metrics: React.FC = () => {
  const [metricsData, setMetricsData] = useState<MetricsData[]>([]);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>([]);
  const [backendAnalytics, setBackendAnalytics] =
    useState<BackendAnalyticsResponse | null>(null);
  const [performanceData, setPerformanceData] = useState<PerformanceMetrics>({
    totalViews: 0,
    totalInterests: 0,
    totalIdeas: 0,
    avgScore: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedMetric, setSelectedMetric] = useState("views");
  // Enhanced mock data for demonstration
  const enhancedPerformanceData = [
    {
      metric: "Total Views",
      value: performanceData.totalViews?.toLocaleString() || "0",
      icon: <Eye className="w-5 h-5" />,
      description: "Views across all ideas",
      trend: "+12%",
      color: "from-blue-500 to-blue-600",
      changeType: "positive" as const,
    },
    {
      metric: "Total Interests",
      value: performanceData.totalInterests?.toLocaleString() || "0",
      icon: <Heart className="w-5 h-5" />,
      description: "Investor interests generated",
      trend: "+8%",
      color: "from-red-500 to-red-600",
      changeType: "positive" as const,
    },
    {
      metric: "Total Ideas",
      value: performanceData.totalIdeas?.toLocaleString() || "0",
      icon: <Lightbulb className="w-5 h-5" />,
      description: "Ideas created",
      trend: "+3",
      color: "from-yellow-500 to-yellow-600",
      changeType: "positive" as const,
    },
    {
      metric: "Average AI Score",
      value: performanceData.avgScore?.toFixed(1) || "0.0",
      icon: <Bot className="w-5 h-5" />,
      description: "AI evaluation score",
      trend: performanceData.avgScore >= 7 ? "+0.5" : "-0.2",
      color: "from-purple-500 to-purple-600",
      changeType: performanceData.avgScore >= 7 ? "positive" : "negative",
    },
  ];

  useEffect(() => {
    fetchMetricsData();
    fetchAnalyticsData();
  }, []);
  const fetchAnalyticsData = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("Authentication required");
      }
      const response = await fetch(`${API_BASE_URL}/api/v1/ideas/analytics`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch analytics data");
      }

      const data: BackendAnalyticsResponse = await response.json();
      setBackendAnalytics(data);
      // Transform backend performance trends into analytics data for charts
      const transformedAnalytics = generateIdeasCreatedData(data);
      setAnalyticsData(transformedAnalytics);

      // Update performance data from backend response
      setPerformanceData({
        totalViews: data.overview.total_views,
        totalInterests: data.overview.total_interests,
        totalIdeas: data.overview.total_ideas,
        avgScore: data.overview.avg_ai_score,
      });
    } catch (err) {
      console.error("Analytics fetch failed:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load analytics data"
      );
      // No fallback - use only real backend data
    }
  };
  const generateIdeasCreatedData = (
    backendData: BackendAnalyticsResponse
  ): AnalyticsData[] => {
    const transformedAnalytics: AnalyticsData[] = [];
    const currentDate = new Date();

    for (let i = 29; i >= 0; i--) {
      const date = new Date(currentDate);
      date.setDate(date.getDate() - i);
      const dayIndex = 29 - i;

      transformedAnalytics.push({
        date: date.toISOString().split("T")[0],
        views: backendData.performance_trends.views_last_30_days[dayIndex] || 0,
        interests:
          backendData.performance_trends.interests_last_30_days[dayIndex] || 0,
        ideas_created: 0, // Backend should provide this data in future
      });
    }

    return transformedAnalytics;
  };

  const fetchMetricsData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("Authentication required");
      }
      const response = await fetch(`${API_BASE_URL}/api/v1/ideas/metrics`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch metrics data");
      }

      const data: MetricsData[] = await response.json();
      setMetricsData(data);

      // Calculate aggregate performance metrics
      const totalViews = data.reduce((sum, item) => sum + item.views, 0);
      const totalInterests = data.reduce(
        (sum, item) => sum + item.interests,
        0
      );
      const totalIdeas = data.length;
      const avgScore =
        data.length > 0
          ? data.reduce((sum, item) => sum + (item.ai_score || 0), 0) /
            data.length
          : 0;

      setPerformanceData({
        totalViews,
        totalInterests,
        totalIdeas,
        avgScore: Math.round(avgScore * 10) / 10,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load metrics data"
      );
      // No fallback to mock data - metrics will show empty/loading state
    } finally {
      setIsLoading(false);
    }
  };
  const getTimeSeriesData = () => {
    if (!Array.isArray(analyticsData)) {
      return [];
    }
    return analyticsData.map((item) => ({
      date: new Date(item.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      views: item.views,
      interests: item.interests,
    }));
  };
  const getIndustryData = (): IndustryData[] => {
    // Only use backend categories data
    if (backendAnalytics && backendAnalytics.categories) {
      const colors = [
        "#8884d8",
        "#82ca9d",
        "#ffc658",
        "#ff7c7c",
        "#8dd1e1",
        "#d084d8",
        "#ffa658",
      ];
      return Object.entries(backendAnalytics.categories).map(
        ([category, count], index) => ({
          industry: category.charAt(0).toUpperCase() + category.slice(1),
          interests: count,
          color: colors[index % colors.length],
        })
      );
    }

    // Return empty array if no backend data available
    return [];
  };
  const getPerformanceComparisonData = () => {
    return metricsData.slice(0, 10).map((idea) => ({
      name:
        idea.title.length > 20
          ? idea.title.substring(0, 20) + "..."
          : idea.title,
      views: idea.views,
      interests: idea.interests,
      score: idea.ai_score || 0,
    }));
  };

  const getStatusDisplay = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      featured: {
        label: "Featured",
        className: "bg-green-100 text-green-800",
      },
      active: {
        label: "Active",
        className: "bg-blue-100 text-blue-800",
      },
      under_review: {
        label: "Under Review",
        className: "bg-yellow-100 text-yellow-800",
      },
      draft: {
        label: "Draft",
        className: "bg-gray-100 text-gray-800",
      },
      rejected: {
        label: "Rejected",
        className: "bg-red-100 text-red-800",
      },
    };

    return (
      statusMap[status] || {
        label: status,
        className: "bg-gray-100 text-gray-800",
      }
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
          <h1 className="text-3xl font-bold">Analytics & Metrics</h1>
          <p className="text-blue-100 mt-2">
            Loading your startup ideas performance data...
          </p>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8 p-4 sm:p-6 lg:p-0">
      {/* Enhanced Header with Gradient Background - Mobile Responsive */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-4 sm:p-6 lg:p-8 text-white">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight">
              Analytics & Metrics
            </h1>
            <p className="text-blue-100 mt-2 text-sm sm:text-base lg:text-lg">
              Track the performance of your startup ideas and investor
              engagement
            </p>
          </div>

          {/* Mobile Responsive Metric Tabs */}
          <div className="flex bg-white/20 rounded-lg p-1 backdrop-blur-sm overflow-x-auto scrollbar-hide">
            <div className="flex space-x-1 min-w-max">
              {["overview", "performance", "trends"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-2 sm:px-4 rounded-md text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                    activeTab === tab
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-white/80 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>{" "}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 sm:p-4">
          <div className="flex items-start space-x-2 sm:space-x-3">
            <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="text-red-700 text-sm sm:text-base">
              <strong>Error loading data:</strong> {error}
            </div>
          </div>
        </div>
      )}
      {/* Enhanced Mobile Responsive KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {enhancedPerformanceData.map((item, index) => (
          <Card
            key={index}
            className="relative overflow-hidden hover:shadow-lg transition-all duration-300 group"
          >
            <div
              className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-5 group-hover:opacity-10 transition-opacity`}
            ></div>
            <CardContent className="p-4 sm:p-6 relative">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                  <div className="text-xl sm:text-2xl flex-shrink-0">
                    {item.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1 truncate">
                      {item.metric}
                    </p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">
                      {item.value}
                    </p>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                      {item.description}
                    </p>
                  </div>
                </div>
                <div
                  className={`text-xs sm:text-sm font-semibold px-2 py-1 rounded-full whitespace-nowrap ml-2 ${
                    item.changeType === "positive"
                      ? "text-green-700 bg-green-100"
                      : "text-red-700 bg-red-100"
                  }`}
                >
                  {item.trend}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>{" "}
      {/* Enhanced Mobile Responsive Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
        {/* Enhanced Views Over Time Chart */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="border-b border-gray-100 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
              <div className="min-w-0 flex-1">
                <CardTitle className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
                  Performance Trends
                </CardTitle>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  Views and interests over the last 30 days
                </p>
              </div>
              <div className="flex items-center space-x-2 flex-shrink-0">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Trending
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 lg:p-6">
            <div className="h-64 sm:h-72 lg:h-80">
              {getTimeSeriesData().length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={getTimeSeriesData()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="date"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                      stroke="#666"
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                      stroke="#666"
                      width={40}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "none",
                        borderRadius: "12px",
                        boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
                        fontSize: "12px",
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: "12px" }} />
                    <Line
                      type="monotone"
                      dataKey="views"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={{ fill: "#3b82f6", strokeWidth: 1, r: 3 }}
                      activeDot={{ r: 5, stroke: "#3b82f6", strokeWidth: 2 }}
                      name="Views"
                    />
                    <Line
                      type="monotone"
                      dataKey="interests"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={{ fill: "#10b981", strokeWidth: 1, r: 3 }}
                      activeDot={{ r: 5, stroke: "#10b981", strokeWidth: 2 }}
                      name="Interests"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center px-4">
                    <div className="mb-3 sm:mb-4">
                      <BarChart3 className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-gray-400" />
                    </div>
                    <div className="text-base sm:text-lg font-medium">
                      No analytics data available
                    </div>
                    <div className="text-xs sm:text-sm mt-1 sm:mt-2 text-gray-400">
                      Create ideas to see trends
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Industry Distribution Chart */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="border-b border-gray-100 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
              <div className="min-w-0 flex-1">
                <CardTitle className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
                  Industry Distribution
                </CardTitle>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  Investor interest by industry category
                </p>
              </div>
              <div className="flex items-center space-x-2 flex-shrink-0">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                  <Factory className="w-3 h-3 mr-1" />
                  Categories
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 lg:p-6">
            <div className="h-64 sm:h-72 lg:h-80">
              {getIndustryData().length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={getIndustryData()}
                      cx="50%"
                      cy="50%"
                      outerRadius="70%"
                      fill="#8884d8"
                      dataKey="interests"
                      label={({ industry, percent }) =>
                        `${industry} ${(percent * 100).toFixed(0)}%`
                      }
                      labelLine={false}
                      fontSize={10}
                    >
                      {getIndustryData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "none",
                        borderRadius: "12px",
                        boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
                        fontSize: "12px",
                      }}
                      formatter={(value, name) => [`${value} interests`, name]}
                    />
                    <Legend wrapperStyle={{ fontSize: "12px" }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center px-4">
                    <div className="mb-3 sm:mb-4">
                      <Factory className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-gray-400" />
                    </div>
                    <div className="text-base sm:text-lg font-medium">
                      No industry data available
                    </div>
                    <div className="text-xs sm:text-sm mt-1 sm:mt-2 text-gray-400">
                      Add categories to your ideas
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>{" "}
      {/* Enhanced Mobile Responsive Performance Comparison Chart */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="border-b border-gray-100 p-4 sm:p-6">
          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="min-w-0">
              <CardTitle className="text-lg sm:text-xl font-semibold text-gray-900">
                Ideas Performance Comparison
              </CardTitle>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Compare views and interests across your top performing ideas
              </p>
            </div>
            <div className="flex items-center justify-start sm:justify-end">
              <select
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                aria-label="Select metric to display"
              >
                <option value="views">Views</option>
                <option value="interests">Interests</option>
                <option value="both">Both Metrics</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 lg:p-6">
          <div className="h-72 sm:h-80 lg:h-96">
            {getPerformanceComparisonData().length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={getPerformanceComparisonData()}
                  margin={{
                    bottom: 40,
                    left: 10,
                    right: 10,
                    top: 10,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    height={60}
                    fontSize={10}
                    stroke="#666"
                    interval={0}
                  />
                  <YAxis fontSize={10} stroke="#666" width={40} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "none",
                      borderRadius: "12px",
                      boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
                      fontSize: "12px",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "12px" }} />
                  {(selectedMetric === "views" ||
                    selectedMetric === "both") && (
                    <Bar
                      dataKey="views"
                      fill="#3b82f6"
                      name="Views"
                      radius={[2, 2, 0, 0]}
                    />
                  )}
                  {(selectedMetric === "interests" ||
                    selectedMetric === "both") && (
                    <Bar
                      dataKey="interests"
                      fill="#10b981"
                      name="Interests"
                      radius={[2, 2, 0, 0]}
                    />
                  )}
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center px-4">
                  <div className="mb-3 sm:mb-4">
                    <TrendingUp className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-gray-400" />
                  </div>
                  <div className="text-base sm:text-lg font-medium">
                    No ideas to compare
                  </div>
                  <div className="text-xs sm:text-sm mt-1 sm:mt-2 text-gray-400">
                    Create your first idea to see performance data
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>{" "}
      {/* Enhanced Mobile Responsive Individual Idea Performance Table */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="border-b border-gray-100 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="min-w-0 flex-1">
              <CardTitle className="text-lg sm:text-xl font-semibold text-gray-900">
                Individual Idea Performance
              </CardTitle>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Detailed metrics for each of your startup ideas
              </p>
            </div>
            <div className="flex items-center space-x-2 flex-shrink-0">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                {metricsData.length} Ideas
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {metricsData.length > 0 ? (
            <>
              {/* Desktop Table View - Hidden on Mobile */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-4 px-6 font-semibold text-gray-900 text-sm">
                        Idea Title
                      </th>
                      <th className="text-center py-4 px-6 font-semibold text-gray-900 text-sm">
                        Views
                      </th>
                      <th className="text-center py-4 px-6 font-semibold text-gray-900 text-sm">
                        Interests
                      </th>
                      <th className="text-center py-4 px-6 font-semibold text-gray-900 text-sm">
                        AI Score
                      </th>
                      <th className="text-center py-4 px-6 font-semibold text-gray-900 text-sm">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {metricsData.map((idea, index) => {
                      const statusInfo = getStatusDisplay(idea.status);
                      return (
                        <tr
                          key={index}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="py-4 px-6">
                            <div className="font-medium text-gray-900 max-w-xs">
                              {idea.title}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              Created{" "}
                              {new Date(idea.created_at).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="py-4 px-6 text-center">
                            <div className="flex items-center justify-center space-x-1">
                              <Eye className="w-4 h-4 text-gray-400" />
                              <span className="font-medium text-gray-900">
                                {idea.views}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-center">
                            <div className="flex items-center justify-center space-x-1">
                              <Heart className="w-4 h-4 text-gray-400" />
                              <span className="font-medium text-gray-900">
                                {idea.interests}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-center">
                            <div className="flex items-center justify-center">
                              {idea.ai_score ? (
                                <div className="flex items-center space-x-2">
                                  <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                                      idea.ai_score >= 8
                                        ? "bg-green-500"
                                        : idea.ai_score >= 7
                                          ? "bg-yellow-500"
                                          : idea.ai_score >= 5
                                            ? "bg-orange-500"
                                            : "bg-red-500"
                                    }`}
                                  >
                                    {idea.ai_score}
                                  </div>
                                  <span className="text-xs text-gray-500">
                                    /10
                                  </span>
                                </div>
                              ) : (
                                <span className="text-gray-400 text-sm">
                                  N/A
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-6 text-center">
                            <span
                              className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full ${statusInfo.className}`}
                            >
                              {statusInfo.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View - Visible on Mobile Only */}
              <div className="md:hidden divide-y divide-gray-200">
                {metricsData.map((idea, index) => {
                  const statusInfo = getStatusDisplay(idea.status);
                  return (
                    <div
                      key={index}
                      className="p-4 hover:bg-gray-50 transition-colors"
                    >
                      {/* Idea Title and Date */}
                      <div className="mb-3">
                        <h3 className="font-medium text-gray-900 text-sm leading-tight mb-1">
                          {idea.title}
                        </h3>
                        <p className="text-xs text-gray-500">
                          Created{" "}
                          {new Date(idea.created_at).toLocaleDateString()}
                        </p>
                      </div>

                      {/* Metrics Grid */}
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        {/* Views */}
                        <div className="flex items-center space-x-2">
                          <Eye className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs text-gray-500">Views</p>
                            <p className="font-medium text-gray-900 text-sm">
                              {idea.views}
                            </p>
                          </div>
                        </div>

                        {/* Interests */}
                        <div className="flex items-center space-x-2">
                          <Heart className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs text-gray-500">Interests</p>
                            <p className="font-medium text-gray-900 text-sm">
                              {idea.interests}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Status and AI Score */}
                      <div className="flex items-center justify-between">
                        <span
                          className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${statusInfo.className}`}
                        >
                          {statusInfo.label}
                        </span>

                        {/* AI Score */}
                        <div className="flex items-center space-x-2">
                          {idea.ai_score ? (
                            <>
                              <div
                                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                                  idea.ai_score >= 8
                                    ? "bg-green-500"
                                    : idea.ai_score >= 7
                                      ? "bg-yellow-500"
                                      : idea.ai_score >= 5
                                        ? "bg-orange-500"
                                        : "bg-red-500"
                                }`}
                              >
                                {idea.ai_score}
                              </div>
                              <span className="text-xs text-gray-500">/10</span>
                            </>
                          ) : (
                            <span className="text-gray-400 text-xs">
                              No AI Score
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="text-center py-12 sm:py-16 px-4 sm:px-6">
              <div className="mb-4 sm:mb-6">
                <Lightbulb className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-gray-400" />
              </div>
              <div className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                No ideas yet
              </div>
              <div className="text-sm sm:text-base text-gray-500 mb-4 sm:mb-6">
                Create your first startup idea to see detailed metrics and
                analytics
              </div>
              <button className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base">
                Create Your First Idea
              </button>
            </div>
          )}
        </CardContent>
      </Card>{" "}
      {/* Enhanced Mobile Responsive Dynamic Recommendations */}
      {backendAnalytics && (
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="border-b border-gray-100 p-4 sm:p-6">
            <div>
              <CardTitle className="text-lg sm:text-xl font-semibold text-gray-900">
                Improvement Recommendations
              </CardTitle>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                AI-powered insights to optimize your idea performance
              </p>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="space-y-3 sm:space-y-4">
              {generateRecommendations(backendAnalytics, metricsData).length >
              0 ? (
                generateRecommendations(backendAnalytics, metricsData).map(
                  (rec, index) => (
                    <div
                      key={index}
                      className={`flex items-start space-x-3 sm:space-x-4 p-3 sm:p-4 rounded-xl border-l-4 ${
                        rec.type === "success"
                          ? "bg-green-50 border-green-400"
                          : rec.type === "warning"
                            ? "bg-yellow-50 border-yellow-400"
                            : "bg-red-50 border-red-400"
                      }`}
                    >
                      <div
                        className={`text-xl sm:text-2xl flex-shrink-0 ${
                          rec.type === "success"
                            ? "text-green-600"
                            : rec.type === "warning"
                              ? "text-yellow-600"
                              : "text-red-600"
                        }`}
                      >
                        {rec.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4
                          className={`font-semibold text-sm sm:text-base ${
                            rec.type === "success"
                              ? "text-green-900"
                              : rec.type === "warning"
                                ? "text-yellow-900"
                                : "text-red-900"
                          }`}
                        >
                          {rec.title}
                        </h4>
                        <p
                          className={`text-xs sm:text-sm mt-1 leading-relaxed ${
                            rec.type === "success"
                              ? "text-green-700"
                              : rec.type === "warning"
                                ? "text-yellow-700"
                                : "text-red-700"
                          }`}
                        >
                          {rec.message}
                        </p>
                      </div>
                    </div>
                  )
                )
              ) : (
                <div className="text-center text-gray-500 py-8 sm:py-12 px-4">
                  <div className="mb-3 sm:mb-4">
                    <Bot className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-gray-400" />
                  </div>
                  <div className="text-base sm:text-lg font-medium">
                    No recommendations available
                  </div>
                  <div className="text-xs sm:text-sm mt-1 sm:mt-2">
                    Create more ideas to get AI-powered insights
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const generateRecommendations = (
  backendAnalytics: BackendAnalyticsResponse | null,
  metricsData: MetricsData[]
) => {
  if (!backendAnalytics || !metricsData.length) {
    return [];
  }
  const recommendations: Array<{
    type: "success" | "warning" | "error";
    icon: React.ReactNode;
    title: string;
    message: string;
  }> = [];

  // Generate recommendations based on actual data
  if (
    backendAnalytics.overview.total_views > 0 &&
    backendAnalytics.overview.total_interests === 0
  ) {
    recommendations.push({
      type: "warning",
      icon: <Lightbulb className="w-5 h-5" />,
      title: "Low Conversion Rate",
      message:
        "You have views but no investor interests. Consider improving your pitch content and value proposition.",
    });
  }

  if (backendAnalytics.overview.avg_ai_score < 7) {
    recommendations.push({
      type: "error",
      icon: <TrendingUp className="w-5 h-5" />,
      title: "AI Score Needs Improvement",
      message: `Your average AI score is ${backendAnalytics.overview.avg_ai_score.toFixed(1)}. Add more market validation data and strengthen your business model.`,
    });
  }

  if (
    backendAnalytics.overview.total_ideas > 0 &&
    backendAnalytics.overview.avg_ai_score >= 8
  ) {
    recommendations.push({
      type: "success",
      icon: <TrendingUp className="w-5 h-5" />,
      title: "Strong Performance",
      message:
        "Your ideas are performing exceptionally well. Consider reaching out to interested investors and scaling your best concepts.",
    });
  }

  if (
    backendAnalytics.overview.total_views > 100 &&
    backendAnalytics.overview.total_interests /
      backendAnalytics.overview.total_views >
      0.1
  ) {
    recommendations.push({
      type: "success",
      icon: <Target className="w-5 h-5" />,
      title: "High Engagement Rate",
      message:
        "Your ideas are generating strong investor interest. Focus on nurturing these relationships and preparing for meetings.",
    });
  }

  return recommendations;
};

export default Metrics;
