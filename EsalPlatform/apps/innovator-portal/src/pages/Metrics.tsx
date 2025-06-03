import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@esal/ui";
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

      const response = await fetch(
        "http://localhost:8000/api/v1/ideas/analytics",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

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

      const response = await fetch(
        "http://localhost:8000/api/v1/ideas/metrics",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

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
    return metricsData.map((idea) => ({
      name:
        idea.title.length > 20
          ? idea.title.substring(0, 20) + "..."
          : idea.title,
      views: idea.views,
      interests: idea.interests,
      score: idea.ai_score || 0,
    }));
  };
  const formatPerformanceData = () => {
    // Only use real backend data, show N/A change if we don't have trend data
    return [
      {
        metric: "Total Views",
        value: performanceData.totalViews.toLocaleString(),
        change: "N/A", // Backend should provide trend data
        changeType: "neutral" as "neutral" | "positive" | "negative",
      },
      {
        metric: "Investor Interest",
        value: performanceData.totalInterests.toString(),
        change: "N/A", // Backend should provide trend data
        changeType: "neutral" as "neutral" | "positive" | "negative",
      },
      {
        metric: "Total Ideas",
        value: performanceData.totalIdeas.toString(),
        change: "N/A", // Backend should provide trend data
        changeType: "neutral" as "neutral" | "positive" | "negative",
      },
      {
        metric: "Average Score",
        value: performanceData.avgScore.toFixed(1),
        change: "N/A", // Backend should provide trend data
        changeType: "neutral" as "neutral" | "positive" | "negative",
      },
    ];
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
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Analytics & Metrics
          </h1>
          <p className="text-gray-600">
            Track the performance of your startup ideas and investor engagement.
          </p>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Analytics & Metrics
        </h1>
        <p className="text-gray-600">
          Track the performance of your startup ideas and investor engagement.
        </p>
      </div>{" "}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="text-red-600 text-sm">
              ❌ Error loading data: {error}
            </div>
          </div>
        </div>
      )}
      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {formatPerformanceData().map((item, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {item.metric}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {item.value}
                  </p>
                </div>{" "}
                <div
                  className={`text-sm font-medium ${
                    item.changeType === "positive"
                      ? "text-green-600"
                      : item.changeType === "negative"
                        ? "text-red-600"
                        : "text-gray-500"
                  }`}
                >
                  {item.change}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {" "}
        <Card>
          <CardHeader>
            <CardTitle>Views Over Time</CardTitle>
          </CardHeader>{" "}
          <CardContent>
            <div className="h-64">
              {getTimeSeriesData().length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={getTimeSeriesData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="views"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6 }}
                      name="Views"
                    />
                    <Line
                      type="monotone"
                      dataKey="interests"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6 }}
                      name="Interests"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <div className="text-4xl mb-2">📊</div>
                    <div>No analytics data available</div>
                    <div className="text-sm mt-1">
                      Create ideas to see trends
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>{" "}
        <Card>
          <CardHeader>
            <CardTitle>Investor Interest by Industry</CardTitle>
          </CardHeader>{" "}
          <CardContent>
            <div className="h-64">
              {getIndustryData().length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={getIndustryData()}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="interests"
                      label={({ industry, percent }) =>
                        `${industry} ${(percent * 100).toFixed(0)}%`
                      }
                      labelLine={false}
                    >
                      {getIndustryData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                      }}
                      formatter={(value, name) => [`${value} interests`, name]}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <div className="text-4xl mb-2">🏭</div>
                    <div>No industry data available</div>
                    <div className="text-sm mt-1">
                      Add categories to your ideas
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>{" "}
      </div>
      {/* Performance Comparison Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Ideas Performance Comparison</CardTitle>
        </CardHeader>{" "}
        <CardContent>
          <div className="h-80">
            {getPerformanceComparisonData().length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={getPerformanceComparisonData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    height={60}
                    fontSize={12}
                    stroke="#666"
                  />
                  <YAxis fontSize={12} stroke="#666" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                  <Legend />
                  <Bar
                    dataKey="views"
                    fill="#3b82f6"
                    name="Views"
                    radius={[2, 2, 0, 0]}
                  />
                  <Bar
                    dataKey="interests"
                    fill="#10b981"
                    name="Interests"
                    radius={[2, 2, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <div className="text-4xl mb-2">📈</div>
                  <div>No ideas to compare</div>
                  <div className="text-sm mt-1">
                    Create your first idea to see performance data
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      {/* Individual Idea Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Individual Idea Performance</CardTitle>
        </CardHeader>{" "}
        <CardContent>
          <div className="overflow-x-auto">
            {metricsData.length > 0 ? (
              <table className="w-full table-auto">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">
                      Idea Title
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">
                      Views
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">
                      Interests
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">
                      AI Score
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {metricsData.map((idea, index) => {
                    const statusInfo = getStatusDisplay(idea.status);
                    return (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="font-medium text-gray-900">
                            {idea.title}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {idea.views}
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {idea.interests}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            <span
                              className={`font-medium ${
                                (idea.ai_score || 0) >= 8
                                  ? "text-green-600"
                                  : (idea.ai_score || 0) >= 7
                                    ? "text-yellow-600"
                                    : "text-red-600"
                              }`}
                            >
                              {idea.ai_score ? `${idea.ai_score}/10` : "N/A"}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${statusInfo.className}`}
                          >
                            {statusInfo.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <div className="text-4xl mb-4">💡</div>
                <div className="text-lg font-medium mb-2">No ideas yet</div>
                <div className="text-sm">
                  Create your first startup idea to see detailed metrics
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      {/* Dynamic Recommendations */}
      {backendAnalytics && (
        <Card>
          <CardHeader>
            <CardTitle>Improvement Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {" "}
              {generateRecommendations(backendAnalytics, metricsData).length >
              0 ? (
                generateRecommendations(backendAnalytics, metricsData).map(
                  (rec, index) => (
                    <div
                      key={index}
                      className={`flex items-start space-x-3 p-4 rounded-lg ${
                        rec.type === "success"
                          ? "bg-green-50"
                          : rec.type === "warning"
                            ? "bg-yellow-50"
                            : "bg-red-50"
                      }`}
                    >
                      <div
                        className={`text-xl ${
                          rec.type === "success"
                            ? "text-green-600"
                            : rec.type === "warning"
                              ? "text-yellow-600"
                              : "text-red-600"
                        }`}
                      >
                        {rec.icon}
                      </div>
                      <div>
                        <h4
                          className={`font-medium ${
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
                          className={`text-sm ${
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
                <div className="text-center text-gray-500 py-8">
                  No recommendations available. Create more ideas to get
                  insights.
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
    icon: string;
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
      icon: "💡",
      title: "Low Conversion Rate",
      message:
        "You have views but no investor interests. Consider improving your pitch content.",
    });
  }

  if (backendAnalytics.overview.avg_ai_score < 7) {
    recommendations.push({
      type: "error",
      icon: "⚠️",
      title: "AI Score Needs Improvement",
      message: `Your average AI score is ${backendAnalytics.overview.avg_ai_score.toFixed(1)}. Add more market validation data.`,
    });
  }

  if (
    backendAnalytics.overview.total_ideas > 0 &&
    backendAnalytics.overview.avg_ai_score >= 8
  ) {
    recommendations.push({
      type: "success",
      icon: "📈",
      title: "Strong Performance",
      message:
        "Your ideas are performing well. Consider reaching out to interested investors.",
    });
  }

  return recommendations;
};

export default Metrics;
