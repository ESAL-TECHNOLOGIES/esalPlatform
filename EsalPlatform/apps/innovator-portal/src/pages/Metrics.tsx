import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@esal/ui";

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

const Metrics: React.FC = () => {
  const [metricsData, setMetricsData] = useState<MetricsData[]>([]);
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
  }, []);

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
      setError(err instanceof Error ? err.message : "An error occurred");

      // Fallback to mock data
      const mockData: MetricsData[] = [
        {
          id: "1",
          title: "AI-Powered Healthcare App",
          views: 456,
          interests: 12,
          ai_score: 8.5,
          status: "active",
          created_at: new Date().toISOString(),
        },
        {
          id: "2",
          title: "Sustainable Energy Solution",
          views: 342,
          interests: 8,
          ai_score: 9.1,
          status: "featured",
          created_at: new Date().toISOString(),
        },
        {
          id: "3",
          title: "EdTech Platform",
          views: 234,
          interests: 5,
          ai_score: 7.3,
          status: "under_review",
          created_at: new Date().toISOString(),
        },
      ];

      setMetricsData(mockData);
      setPerformanceData({
        totalViews: 1032,
        totalInterests: 25,
        totalIdeas: 3,
        avgScore: 8.3,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatPerformanceData = () => [
    {
      metric: "Total Views",
      value: performanceData.totalViews.toLocaleString(),
      change: "+12%",
      changeType: "positive" as const,
    },
    {
      metric: "Investor Interest",
      value: performanceData.totalInterests.toString(),
      change: "+8%",
      changeType: "positive" as const,
    },
    {
      metric: "Total Ideas",
      value: performanceData.totalIdeas.toString(),
      change: "+15%",
      changeType: "positive" as const,
    },
    {
      metric: "Average Score",
      value: performanceData.avgScore.toFixed(1),
      change: "+5%",
      changeType: "positive" as const,
    },
  ];

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
      </div>

      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex">
            <div className="text-yellow-600 text-sm">
              ⚠️ Using demo data: {error}
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
                </div>
                <div
                  className={`text-sm font-medium ${
                    item.changeType === "positive"
                      ? "text-green-600"
                      : "text-red-600"
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
        <Card>
          <CardHeader>
            <CardTitle>Views Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center text-gray-500">
                <div className="text-4xl mb-2">📊</div>
                <p>Chart visualization would go here</p>
                <p className="text-sm">
                  Showing views trend over the last 30 days
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Investor Interest by Industry</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center text-gray-500">
                <div className="text-4xl mb-2">🥧</div>
                <p>Pie chart would go here</p>
                <p className="text-sm">
                  Breakdown of interest by industry sectors
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Individual Idea Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Individual Idea Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
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
                      <td className="py-3 px-4 text-gray-600">{idea.views}</td>
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
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Improvement Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
              <div className="text-blue-600 text-xl">💡</div>
              <div>
                <h4 className="font-medium text-blue-900">
                  Optimize Your Pitch Deck
                </h4>
                <p className="text-sm text-blue-700">
                  Your healthcare app idea has high views but low conversion.
                  Consider adding more market validation data.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg">
              <div className="text-green-600 text-xl">📈</div>
              <div>
                <h4 className="font-medium text-green-900">
                  Strong Performance
                </h4>
                <p className="text-sm text-green-700">
                  Your sustainable energy solution is trending well. Consider
                  reaching out to interested investors.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-4 bg-yellow-50 rounded-lg">
              <div className="text-yellow-600 text-xl">⚠️</div>
              <div>
                <h4 className="font-medium text-yellow-900">Needs Attention</h4>
                <p className="text-sm text-yellow-700">
                  Your EdTech platform needs more detail. Add competitor
                  analysis and revenue projections.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Metrics;
