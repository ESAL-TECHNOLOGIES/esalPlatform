import React, { useState, useEffect } from "react";
import { Card, Button } from "@esal/ui";
import { analyticsAPI } from "../utils/api";

interface KPIData {
  label: string;
  value: string;
  change: string;
  trend: "up" | "down";
}

interface UserMetric {
  role: string;
  count: number;
  percentage: number;
  change: string;
}

interface EngagementData {
  metric: string;
  value: string;
  change: string;
}

interface RevenueBreakdown {
  source: string;
  amount: string;
  percentage: number;
}

interface TopPerformer {
  type: string;
  name: string;
  metric: string;
  value: string;
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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch analytics data from backend
      const analyticsResponse = await analyticsAPI.getAnalytics(timeRange);

      // Transform backend data to component format
      setKpiData(analyticsResponse.kpiData || []);
      setUserMetrics(analyticsResponse.userMetrics || []);
      setEngagementData(analyticsResponse.engagementData || []);
      setRevenueBreakdown(analyticsResponse.revenueBreakdown || []);
      setTopPerformers(analyticsResponse.topPerformers || []);
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Analytics Dashboard
          </h1>
          <p className="text-gray-600">
            Platform performance and user insights
          </p>
        </div>
        <div className="flex space-x-3">
          {" "}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            title="Select time range for analytics"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <Button variant="outline">Export Report</Button>
          <Button>Schedule Report</Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {kpiData.map((kpi, index) => (
          <Card key={index} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{kpi.label}</p>
                <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
              </div>
              <div className="text-right">
                <span
                  className={`text-sm font-medium ${
                    kpi.trend === "up" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {kpi.change}
                </span>
                <div className="text-lg">
                  {kpi.trend === "up" ? "📈" : "📉"}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Distribution */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            User Distribution
          </h2>
          <div className="space-y-4">
            {userMetrics.map((metric, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-4 h-4 bg-blue-500 rounded"
                    style={{
                      backgroundColor: [
                        "#3B82F6",
                        "#8B5CF6",
                        "#F97316",
                        "#6B7280",
                      ][index],
                    }}
                  ></div>
                  <span className="text-sm font-medium text-gray-900">
                    {metric.role}
                  </span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${metric.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-12">
                    {metric.count}
                  </span>
                  <span className="text-sm text-green-600 w-12">
                    {metric.change}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Engagement Metrics */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Engagement Metrics
          </h2>
          <div className="grid grid-cols-1 gap-4">
            {engagementData.map((engagement, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <span className="text-sm font-medium text-gray-900">
                  {engagement.metric}
                </span>
                <div className="text-right">
                  <div className="text-sm font-bold text-gray-900">
                    {engagement.value}
                  </div>
                  <div className="text-xs text-green-600">
                    {engagement.change}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Breakdown */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Revenue Breakdown
          </h2>
          <div className="space-y-4">
            {revenueBreakdown.map((revenue, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">
                    {revenue.source}
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    {revenue.amount}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${revenue.percentage}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500">
                  {revenue.percentage}% of total revenue
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Top Performers */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Top Performers
          </h2>
          <div className="space-y-4">
            {topPerformers.map((performer, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">
                      {performer.type === "startup" && "🚀"}
                      {performer.type === "investor" && "💰"}
                      {performer.type === "hub" && "🏢"}
                    </span>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {performer.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {performer.metric}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-sm font-bold text-gray-900">
                  {performer.value}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Chart Placeholder */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Platform Growth Over Time
        </h2>
        <div className="bg-gray-50 rounded-lg p-12 text-center">
          <div className="text-4xl mb-4">📊</div>
          <p className="text-gray-600">Interactive charts coming soon</p>
          <p className="text-sm text-gray-500 mt-2">
            Integration with charting libraries like Chart.js or D3.js
          </p>
        </div>
      </Card>

      {/* Quick Insights */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Quick Insights
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
        </div>
      </Card>
    </div>
  );
};

export default Analytics;
