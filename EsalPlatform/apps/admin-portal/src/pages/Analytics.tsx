import React, { useState, useEffect } from "react";
import { Card, Button, CardHeader, CardTitle, CardContent } from "@esal/ui";
import { analyticsAPI } from "../utils/api";
import {
  Users,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Activity,
  DollarSign,
  Eye,
  Clock,
  Trophy,
  Zap,
  RefreshCw,
  Download,
  Calendar,
  AlertCircle,
  FileText,
  Target,
  Sparkles,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

// Custom hook for dynamic colors
const useProgressStyles = (items: Array<{ color: string }>) => {
  useEffect(() => {
    const styleId = "dynamic-progress-styles";
    let styleElement = document.getElementById(styleId) as HTMLStyleElement;

    if (!styleElement) {
      styleElement = document.createElement("style");
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }

    const styles = items
      .map((item, index) => {
        const colorClass = `progress-color-${index}`;
        return `
        .${colorClass}-indicator {
          background-color: ${item.color};
          width: 0.75rem;
          height: 0.75rem;
          border-radius: 50%;
        }
        
        @screen sm {
          .${colorClass}-indicator {
            width: 1rem;
            height: 1rem;
          }
        }
        
        .${colorClass}-bar {
          background-color: ${item.color};
          box-shadow: 0 2px 4px ${item.color}33;
          height: 0.5rem;
          border-radius: 9999px;
          transition: all 1000ms ease-out;
        }
        
        @screen sm {
          .${colorClass}-bar {
            height: 0.75rem;
          }
        }
      `;
      })
      .join("\n");

    styleElement.textContent = styles;

    return () => {
      if (styleElement && styleElement.parentNode) {
        styleElement.parentNode.removeChild(styleElement);
      }
    };
  }, [items]);

  return items.map((_, index) => `progress-color-${index}`);
};

interface KPIData {
  label: string;
  value: string;
  change: string;
  trend: "up" | "down";
  icon: React.ComponentType<{ className?: string }>;
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
  icon: React.ComponentType<{ className?: string }>;
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

  // Generate CSS classes for dynamic colors
  const userColorClasses = useProgressStyles(userMetrics);
  const revenueColorClasses = useProgressStyles(revenueBreakdown);

  // Empty state component
  const EmptyState = ({
    icon: Icon,
    title,
    description,
  }: {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    description: string;
  }) => (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="p-4 bg-gray-100 rounded-full mb-6">
        <Icon className="w-12 h-12 text-gray-400" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-500 max-w-md leading-relaxed">{description}</p>
    </div>
  );
  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);
  const fetchAnalyticsData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch analytics data from backend
      const analyticsResponse = await analyticsAPI.getAnalytics(timeRange); // Transform backend data to component format
      if (analyticsResponse) {
        // Icon mapping for KPIs
        const getKPIIcon = (iconName: string) => {
          const iconMap: Record<
            string,
            React.ComponentType<{ className?: string }>
          > = {
            users: Users,
            revenue: DollarSign,
            activity: Activity,
            growth: TrendingUp,
            analytics: BarChart3,
            default: Sparkles,
          };
          return iconMap[iconName] || iconMap.default;
        };

        // Icon mapping for engagement metrics
        const getEngagementIcon = (iconName: string) => {
          const iconMap: Record<
            string,
            React.ComponentType<{ className?: string }>
          > = {
            users: Users,
            views: Eye,
            time: Clock,
            activity: Activity,
            engagement: Zap,
            default: Target,
          };
          return iconMap[iconName] || iconMap.default;
        };

        // Map backend data to KPI format
        const backendKpiData: KPIData[] =
          analyticsResponse.kpis?.map((kpi: any) => ({
            label: kpi.label,
            value: kpi.value,
            change: kpi.change,
            trend: kpi.trend,
            icon: getKPIIcon(kpi.icon),
            description: kpi.description,
          })) || [];

        // Map backend data to user metrics format
        const backendUserMetrics: UserMetric[] =
          analyticsResponse.userMetrics?.map((metric: any) => ({
            role: metric.role,
            count: metric.count,
            percentage: metric.percentage,
            change: metric.change,
            color: metric.color,
          })) || [];

        // Map backend data to engagement format
        const backendEngagementData: EngagementData[] =
          analyticsResponse.engagement?.map((engagement: any) => ({
            metric: engagement.metric,
            value: engagement.value,
            change: engagement.change,
            icon: getEngagementIcon(engagement.icon),
            trend: engagement.trend,
          })) || [];

        // Map backend data to revenue format
        const backendRevenueBreakdown: RevenueBreakdown[] =
          analyticsResponse.revenue?.map((revenue: any) => ({
            source: revenue.source,
            amount: revenue.amount,
            percentage: revenue.percentage,
            color: revenue.color,
            trend: revenue.trend,
          })) || [];

        // Map backend data to top performers format
        const backendTopPerformers: TopPerformer[] =
          analyticsResponse.topPerformers?.map((performer: any) => ({
            type: performer.type,
            name: performer.name,
            metric: performer.metric,
            value: performer.value,
            avatar: performer.avatar,
            rank: performer.rank,
          })) || [];

        // Map backend chart data
        const backendChartData: ChartData[] = analyticsResponse.chartData || [];

        setKpiData(backendKpiData);
        setUserMetrics(backendUserMetrics);
        setEngagementData(backendEngagementData);
        setRevenueBreakdown(backendRevenueBreakdown);
        setTopPerformers(backendTopPerformers);
        setChartData(backendChartData);
      } else {
        // No data available - set empty arrays
        setKpiData([]);
        setUserMetrics([]);
        setEngagementData([]);
        setRevenueBreakdown([]);
        setTopPerformers([]);
        setChartData([]);
      }
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
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
            <BarChart3 className="w-6 h-6 text-blue-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="mt-6 text-lg font-medium text-gray-900">
            Loading Analytics
          </p>
          <p className="text-gray-500">Fetching your platform insights...</p>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center max-w-md">
          <div className="p-4 bg-red-100 rounded-full w-fit mx-auto mb-6">
            <AlertCircle className="w-12 h-12 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Failed to Load Analytics
          </h2>
          <p className="text-gray-600 mb-6 leading-relaxed">{error}</p>
          <Button
            onClick={fetchAnalyticsData}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium inline-flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </Button>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      {/* Check if we have any data at all */}
      {kpiData.length === 0 &&
      userMetrics.length === 0 &&
      engagementData.length === 0 &&
      revenueBreakdown.length === 0 &&
      topPerformers.length === 0 &&
      chartData.length === 0 ? (
        <div className="min-h-96">
          {" "}
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 rounded-2xl p-8 text-white mb-8 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                  <BarChart3 className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold mb-2">
                    Analytics Dashboard
                  </h1>
                  <p className="text-blue-100 text-lg">
                    Comprehensive platform performance insights and user
                    analytics
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-white/30 focus:border-white/40 backdrop-blur-sm"
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
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20 px-4 py-3 rounded-xl font-medium inline-flex items-center gap-2 backdrop-blur-sm"
                >
                  <Download className="w-4 h-4" />
                  Export Report
                </Button>
                <Button className="bg-white/20 hover:bg-white/30 text-white border-0 px-4 py-3 rounded-xl font-medium inline-flex items-center gap-2 backdrop-blur-sm">
                  <Calendar className="w-4 h-4" />
                  Schedule Report
                </Button>
              </div>
            </div>
          </div>{" "}
          {/* Empty State */}
          <Card className="border-0 shadow-xl">
            <CardContent className="p-16">
              <div className="text-center">
                <div className="p-6 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full w-fit mx-auto mb-8">
                  <BarChart3 className="w-16 h-16 text-blue-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  No Analytics Data Available
                </h2>
                <p className="text-gray-600 mb-12 max-w-2xl mx-auto text-lg leading-relaxed">
                  Your analytics dashboard is ready to display insights! Data
                  will appear here as users interact with the platform and
                  generate activity.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto mb-12">
                  <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border border-blue-200 hover:shadow-lg transition-all">
                    <div className="p-3 bg-blue-600 rounded-xl w-fit mb-4">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      User Metrics
                    </h3>
                    <p className="text-sm text-gray-600">
                      Track user registration and activity
                    </p>
                  </div>
                  <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl border border-green-200 hover:shadow-lg transition-all">
                    <div className="p-3 bg-green-600 rounded-xl w-fit mb-4">
                      <DollarSign className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Revenue Data
                    </h3>
                    <p className="text-sm text-gray-600">
                      Monitor financial performance
                    </p>
                  </div>
                  <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl border border-purple-200 hover:shadow-lg transition-all">
                    <div className="p-3 bg-purple-600 rounded-xl w-fit mb-4">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Engagement
                    </h3>
                    <p className="text-sm text-gray-600">
                      Analyze user interaction patterns
                    </p>
                  </div>
                  <div className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl border border-orange-200 hover:shadow-lg transition-all">
                    <div className="p-3 bg-orange-600 rounded-xl w-fit mb-4">
                      <Trophy className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Performance
                    </h3>
                    <p className="text-sm text-gray-600">
                      Identify top performers
                    </p>
                  </div>
                </div>

                <div className="flex justify-center space-x-4">
                  <Button
                    onClick={fetchAnalyticsData}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium inline-flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Refresh Data
                  </Button>
                  <Button
                    variant="outline"
                    className="border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-3 rounded-xl font-medium inline-flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    View Documentation
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <>
          {" "}
          {/* Enhanced Header with Metrics Tabs - Mobile Responsive */}
          <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 rounded-2xl p-4 sm:p-6 lg:p-8 text-white shadow-xl">
            <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0 mb-6 lg:mb-8">
              <div className="flex items-center gap-3 lg:gap-4">
                <div className="p-2 sm:p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                  <BarChart3 className="w-6 h-6 sm:w-8 sm:h-8" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-1 lg:mb-2">
                    Analytics Dashboard
                  </h1>
                  <p className="text-blue-100 text-sm sm:text-base lg:text-lg">
                    Comprehensive platform performance insights and user
                    analytics
                  </p>
                </div>
              </div>
              <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-3 lg:space-x-4">
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="w-full sm:w-auto px-3 py-2 lg:px-4 lg:py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-white/30 focus:border-white/40 backdrop-blur-sm text-sm lg:text-base"
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
                  className="w-full sm:w-auto bg-white/10 border-white/20 text-white hover:bg-white/20 px-3 py-2 lg:px-4 lg:py-3 rounded-xl font-medium inline-flex items-center justify-center gap-2 backdrop-blur-sm text-sm lg:text-base"
                >
                  <Download className="w-3 h-3 lg:w-4 lg:h-4" />
                  <span className="hidden sm:inline">Export Report</span>
                  <span className="sm:hidden">Export</span>
                </Button>
                <Button className="w-full sm:w-auto bg-white/20 hover:bg-white/30 text-white border-0 px-3 py-2 lg:px-4 lg:py-3 rounded-xl font-medium inline-flex items-center justify-center gap-2 backdrop-blur-sm text-sm lg:text-base">
                  <Calendar className="w-3 h-3 lg:w-4 lg:h-4" />
                  <span className="hidden sm:inline">Schedule Report</span>
                  <span className="sm:hidden">Schedule</span>
                </Button>
              </div>
            </div>

            {/* Metric Tabs - Mobile Responsive */}
            <div className="flex flex-wrap gap-2 sm:space-x-2">
              {[
                { id: "overview", label: "Overview", icon: BarChart3 },
                { id: "users", label: "Users", icon: Users },
                { id: "revenue", label: "Revenue", icon: DollarSign },
                { id: "engagement", label: "Engagement", icon: Target },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedMetric(tab.id)}
                  className={`px-3 py-2 sm:px-4 sm:py-3 lg:px-6 rounded-xl text-xs sm:text-sm font-medium transition-all inline-flex items-center gap-1 sm:gap-2 ${
                    selectedMetric === tab.id
                      ? "bg-white/20 text-white backdrop-blur-sm"
                      : "text-blue-100 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <tab.icon className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.label.substring(0, 4)}</span>
                </button>
              ))}
            </div>
          </div>{" "}
          {/* Enhanced KPI Cards - Mobile Responsive */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {kpiData.length > 0 ? (
              kpiData.map((kpi, index) => (
                <Card
                  key={index}
                  className="relative overflow-hidden bg-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 group"
                >
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center space-x-3 sm:space-x-4">
                        <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg group-hover:shadow-xl transition-all">
                          <kpi.icon className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">
                            {kpi.label}
                          </p>
                          <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1">
                            {kpi.value}
                          </p>
                          {kpi.description && (
                            <p className="text-xs text-gray-500 hidden sm:block">
                              {kpi.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="self-end sm:self-auto sm:text-right">
                        <div
                          className={`inline-flex items-center px-2 py-1 sm:px-3 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold gap-1 ${
                            kpi.trend === "up"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {kpi.trend === "up" ? (
                            <ArrowUp className="w-3 h-3 sm:w-4 sm:h-4" />
                          ) : (
                            <ArrowDown className="w-3 h-3 sm:w-4 sm:h-4" />
                          )}
                          {kpi.change}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full">
                <Card className="border-0 shadow-xl">
                  <CardContent>
                    <EmptyState
                      icon={BarChart3}
                      title="No KPI Data Available"
                      description="Key performance indicators will appear here once data is collected from the platform."
                    />
                  </CardContent>
                </Card>
              </div>
            )}
          </div>{" "}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {" "}
            {/* Enhanced User Distribution - Mobile Responsive */}
            <Card className="overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 p-4 sm:p-6">
                <CardTitle className="flex items-center text-gray-800">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg mr-3">
                    <Users className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <span className="text-base sm:text-lg">
                    User Distribution
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                {userMetrics.length > 0 ? (
                  <div className="space-y-4 sm:space-y-6">
                    {userMetrics.map((metric, index) => (
                      <div key={index} className="relative">
                        {" "}
                        <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between mb-2">
                          {" "}
                          <div className="flex items-center space-x-3">
                            <div
                              className={`${userColorClasses[index]}-indicator`}
                            ></div>
                            <span className="text-sm font-medium text-gray-900">
                              {metric.role}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 sm:space-x-3 self-end sm:self-auto">
                            <span className="text-sm font-bold text-gray-900">
                              {metric.count.toLocaleString()}
                            </span>
                            <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
                              {metric.change}
                            </span>
                          </div>
                        </div>
                        <div className="relative">
                          <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3">
                            {" "}
                            <div
                              className={`${userColorClasses[index]}-bar`}
                              style={{ width: `${metric.percentage}%` }}
                            ></div>
                          </div>
                          <span className="absolute right-0 top-3 sm:top-4 text-xs text-gray-500">
                            {metric.percentage}%
                          </span>
                        </div>
                      </div>
                    ))}{" "}
                    {/* Total Users Summary */}
                    <div className="mt-4 sm:mt-6 p-4 sm:p-6 bg-gradient-to-r from-blue-50 to-indigo-100 rounded-xl border border-blue-200">
                      <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm text-blue-700 font-medium">
                            Total Active Users
                          </p>
                          <p className="text-2xl sm:text-3xl font-bold text-blue-900">
                            {userMetrics
                              .reduce((sum, metric) => sum + metric.count, 0)
                              .toLocaleString()}
                          </p>
                        </div>
                        <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl self-end sm:self-auto">
                          <Target className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <EmptyState
                    icon={Users}
                    title="No User Data Available"
                    description="User distribution metrics will be displayed here when user data is collected."
                  />
                )}
              </CardContent>
            </Card>{" "}
            {/* Enhanced Engagement Metrics - Mobile Responsive */}
            <Card className="overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100 p-4 sm:p-6">
                <CardTitle className="flex items-center text-gray-800">
                  <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg mr-3">
                    <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <span className="text-base sm:text-lg">
                    Engagement Metrics
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                {engagementData.length > 0 ? (
                  <div className="space-y-3 sm:space-y-4">
                    <div className="grid grid-cols-1 gap-3 sm:gap-4">
                      {engagementData.map((engagement, index) => (
                        <div
                          key={index}
                          className="p-3 sm:p-4 bg-gradient-to-r from-white to-gray-50 rounded-xl border border-gray-100 hover:shadow-md transition-all"
                        >
                          <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
                            {" "}
                            <div className="flex items-center space-x-3">
                              <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                                <engagement.icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {engagement.metric}
                                </p>
                                <p className="text-base sm:text-lg font-bold text-gray-900">
                                  {engagement.value}
                                </p>
                              </div>
                            </div>
                            <div className="self-end sm:self-auto sm:text-right">
                              {" "}
                              <div
                                className={`inline-flex items-center px-2 py-1 sm:px-3 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold gap-1 ${
                                  engagement.trend === "up"
                                    ? "bg-green-100 text-green-700"
                                    : engagement.trend === "down"
                                      ? "bg-red-100 text-red-700"
                                      : "bg-gray-100 text-gray-700"
                                }`}
                              >
                                {engagement.trend === "up" ? (
                                  <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
                                ) : engagement.trend === "down" ? (
                                  <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4" />
                                ) : (
                                  <ArrowDown className="w-3 h-3 sm:w-4 sm:h-4 rotate-90" />
                                )}
                                {engagement.change}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>{" "}
                    {/* Engagement Summary */}
                    <div className="mt-4 sm:mt-6 p-4 sm:p-6 bg-gradient-to-r from-green-50 to-emerald-100 rounded-xl border border-green-200">
                      <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm text-green-700 font-medium">
                            Overall Engagement
                          </p>
                          <p className="text-lg sm:text-xl font-bold text-green-900">
                            {engagementData.length > 0
                              ? "Data Available"
                              : "No Data"}
                          </p>
                          <p className="text-xs text-green-600">
                            {engagementData.length} metrics tracked
                          </p>
                        </div>
                        <div className="p-2 sm:p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl self-end sm:self-auto">
                          <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <EmptyState
                    icon={Activity}
                    title="No Engagement Data Available"
                    description="User engagement metrics will be shown here when activity data is collected."
                  />
                )}
              </CardContent>
            </Card>
          </div>{" "}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {" "}
            {/* Enhanced Revenue Breakdown - Mobile Responsive */}
            <Card className="overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-50 border-b border-emerald-100 p-4 sm:p-6">
                <CardTitle className="flex items-center text-gray-800">
                  <div className="p-2 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg mr-3">
                    <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <span className="text-base sm:text-lg">
                    Revenue Breakdown
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                {revenueBreakdown.length > 0 ? (
                  <div className="space-y-4 sm:space-y-6">
                    {revenueBreakdown.map((revenue, index) => (
                      <div key={index} className="relative">
                        {" "}
                        <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between mb-3">
                          {" "}
                          <div className="flex items-center space-x-3">
                            <div
                              className={`${revenueColorClasses[index]}-indicator`}
                            ></div>
                            <span className="text-sm font-medium text-gray-900">
                              {revenue.source}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 sm:space-x-3 self-end sm:self-auto">
                            <span className="text-base sm:text-lg font-bold text-gray-900">
                              {revenue.amount}
                            </span>
                            <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
                              {revenue.trend}
                            </span>
                          </div>
                        </div>
                        <div className="relative">
                          <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3">
                            {" "}
                            <div
                              className={`${revenueColorClasses[index]}-bar`}
                              style={{ width: `${revenue.percentage}%` }}
                            ></div>
                          </div>
                          <span className="absolute right-0 top-3 sm:top-4 text-xs text-gray-500">
                            {revenue.percentage}% of total
                          </span>
                        </div>
                      </div>
                    ))}{" "}
                    {/* Revenue Summary */}
                    <div className="mt-4 sm:mt-6 p-4 sm:p-6 bg-gradient-to-r from-emerald-50 to-green-100 rounded-xl border border-emerald-200">
                      <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm text-emerald-700 font-medium">
                            Total Revenue
                          </p>
                          <p className="text-2xl sm:text-3xl font-bold text-emerald-900">
                            $
                            {revenueBreakdown
                              .reduce(
                                (sum, rev) =>
                                  sum +
                                  parseInt(rev.amount.replace(/[$,]/g, "")),
                                0
                              )
                              .toLocaleString()}
                          </p>
                          <p className="text-xs text-emerald-600">
                            Monthly recurring revenue
                          </p>
                        </div>
                        <div className="p-2 sm:p-3 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl self-end sm:self-auto">
                          <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <EmptyState
                    icon={DollarSign}
                    title="No Revenue Data Available"
                    description="Revenue breakdown and financial metrics will be displayed here when transaction data is available."
                  />
                )}
              </CardContent>
            </Card>{" "}
            {/* Enhanced Top Performers - Mobile Responsive */}
            <Card className="overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-purple-100 p-4 sm:p-6">
                <CardTitle className="flex items-center text-gray-800">
                  <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg mr-3">
                    <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <span className="text-base sm:text-lg">Top Performers</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                {topPerformers.length > 0 ? (
                  <div className="space-y-3 sm:space-y-4">
                    {topPerformers.map((performer, index) => (
                      <div
                        key={index}
                        className="relative p-3 sm:p-4 bg-gradient-to-r from-white to-gray-50 rounded-xl border border-gray-100 hover:shadow-lg transition-all"
                      >
                        <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex items-center space-x-3 sm:space-x-4">
                            {/* Rank Badge */}
                            <div
                              className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold ${
                                performer.rank === 1
                                  ? "bg-yellow-100 text-yellow-800"
                                  : performer.rank === 2
                                    ? "bg-gray-100 text-gray-800"
                                    : "bg-orange-100 text-orange-800"
                              }`}
                            >
                              #{performer.rank}
                            </div>{" "}
                            {/* Avatar and Info */}
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center border-2 border-purple-200">
                                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                              </div>
                              <div>
                                <div className="font-medium text-gray-900 text-sm sm:text-base">
                                  {performer.name}
                                </div>
                                <div className="text-xs sm:text-sm text-gray-500">
                                  {performer.metric}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Performance Value */}
                          <div className="self-end sm:self-auto sm:text-right">
                            <div className="text-lg sm:text-xl font-bold text-gray-900">
                              {performer.value}
                            </div>
                            <div className="text-xs text-gray-500 uppercase tracking-wide">
                              {performer.type}
                            </div>
                          </div>
                        </div>{" "}
                        {/* Crown for #1 */}
                        {performer.rank === 1 && (
                          <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2">
                            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                              <Trophy className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-800" />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}{" "}
                    {/* Leaderboard Summary */}
                    <div className="mt-4 sm:mt-6 p-4 sm:p-6 bg-gradient-to-r from-purple-50 to-indigo-100 rounded-xl border border-purple-200">
                      <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm text-purple-700 font-medium">
                            Performance Overview
                          </p>
                          <p className="text-lg sm:text-xl font-bold text-purple-900">
                            {topPerformers.length} Top Performers
                          </p>
                          <p className="text-xs text-purple-600">
                            Ranked by performance metrics
                          </p>
                        </div>
                        <div className="p-2 sm:p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl self-end sm:self-auto">
                          <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <EmptyState
                    icon={Trophy}
                    title="No Top Performers Data"
                    description="Top performing users and entities will be ranked and displayed here based on platform activity."
                  />
                )}
              </CardContent>
            </Card>
          </div>{" "}
          {/* Enhanced Chart Section with Multiple Views - Mobile Responsive */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
            {/* Main Chart */}
            <Card className="xl:col-span-2 overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 p-4 sm:p-6">
                <CardTitle className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center text-gray-800">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg mr-3">
                      <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <span className="text-base sm:text-lg">
                      Platform Growth Trends
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 sm:space-x-2">
                    {["Users", "Revenue", "Engagement"].map((metric) => (
                      <button
                        key={metric}
                        className="px-2 py-1 sm:px-3 sm:py-2 text-xs font-medium rounded-lg sm:rounded-xl border border-blue-300 hover:bg-blue-100 text-blue-700 transition-all duration-200"
                      >
                        {metric}
                      </button>
                    ))}
                  </div>
                </CardTitle>
              </CardHeader>{" "}
              <CardContent className="p-4 sm:p-6">
                {chartData.length > 0 ? (
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-4 sm:p-6 lg:p-8 text-center border border-blue-200">
                    <div className="p-3 sm:p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full inline-block mb-4 sm:mb-6">
                      <BarChart3 className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-white" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-blue-700 mb-2 sm:mb-3">
                      Chart Data Available
                    </h3>
                    <p className="text-blue-600 mb-4 sm:mb-6 text-sm sm:text-base">
                      {chartData.length} data points collected for visualization
                    </p>
                    <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:items-center sm:justify-center sm:space-x-4 text-xs sm:text-sm text-blue-600">
                      <span className="flex items-center justify-center sm:justify-start">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-1"></span>
                        Users: {chartData[chartData.length - 1]?.users || "N/A"}
                      </span>
                      <span className="flex items-center justify-center sm:justify-start">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                        Revenue: $
                        {chartData[chartData.length - 1]?.revenue || "N/A"}
                      </span>
                      <span className="flex items-center justify-center sm:justify-start">
                        <span className="w-2 h-2 bg-purple-500 rounded-full mr-1"></span>
                        Engagement:{" "}
                        {chartData[chartData.length - 1]?.engagement || "N/A"}%
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 sm:p-8 lg:p-12 text-center border-2 border-dashed border-gray-200">
                    <div className="p-3 sm:p-4 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full inline-block mb-4 sm:mb-6">
                      <PieChart className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-white" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2 sm:mb-3">
                      No Chart Data Available
                    </h3>
                    <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
                      Interactive charts will appear here when data is collected
                    </p>
                    <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:items-center sm:justify-center sm:space-x-4 text-xs sm:text-sm text-gray-500">
                      <span className="flex items-center justify-center sm:justify-start">
                        <span className="w-2 h-2 bg-blue-300 rounded-full mr-1"></span>
                        Awaiting user data
                      </span>
                      <span className="flex items-center justify-center sm:justify-start">
                        <span className="w-2 h-2 bg-green-300 rounded-full mr-1"></span>
                        Awaiting revenue data
                      </span>
                      <span className="flex items-center justify-center sm:justify-start">
                        <span className="w-2 h-2 bg-purple-300 rounded-full mr-1"></span>
                        Awaiting engagement data
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>{" "}
            {/* Quick Insights Panel - Mobile Responsive */}
            <Card className="overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 border-b border-orange-100 p-4 sm:p-6">
                <CardTitle className="flex items-center text-gray-800">
                  <div className="p-2 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg mr-3">
                    <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <span className="text-base sm:text-lg">Quick Insights</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                {kpiData.length > 0 ||
                userMetrics.length > 0 ||
                engagementData.length > 0 ? (
                  <div className="space-y-3 sm:space-y-4">
                    <div className="p-4 sm:p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                      <div className="flex items-center space-x-3 mb-2 sm:mb-3">
                        <div className="p-1 sm:p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                          <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                        </div>
                        <h3 className="font-semibold text-blue-900 text-sm sm:text-base">
                          Data Collection
                        </h3>
                      </div>
                      <p className="text-xs sm:text-sm text-blue-700">
                        Analytics data is being collected and processed
                      </p>
                    </div>
                    <div className="p-4 sm:p-6 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200">
                      <div className="flex items-center space-x-3 mb-2 sm:mb-3">
                        <div className="p-1 sm:p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-lg">
                          <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                        </div>
                        <h3 className="font-semibold text-green-900 text-sm sm:text-base">
                          Real-time Updates
                        </h3>
                      </div>
                      <p className="text-xs sm:text-sm text-green-700">
                        Dashboard updates automatically with latest metrics
                      </p>
                    </div>
                    <div className="p-4 sm:p-6 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                      <div className="flex items-center space-x-3 mb-2 sm:mb-3">
                        <div className="p-1 sm:p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg">
                          <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                        </div>
                        <h3 className="font-semibold text-purple-900 text-sm sm:text-base">
                          Performance Tracking
                        </h3>
                      </div>
                      <p className="text-xs sm:text-sm text-purple-700">
                        Key metrics are monitored for trend analysis
                      </p>
                    </div>
                    <div className="p-4 sm:p-6 bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl border border-orange-200">
                      <div className="flex items-center space-x-3 mb-2 sm:mb-3">
                        <div className="p-1 sm:p-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg">
                          <Target className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                        </div>
                        <h3 className="font-semibold text-orange-900 text-sm sm:text-base">
                          Platform Health
                        </h3>
                      </div>
                      <p className="text-xs sm:text-sm text-orange-700">
                        System performance is actively monitored
                      </p>
                    </div>
                  </div>
                ) : (
                  <EmptyState
                    icon={Eye}
                    title="No Insights Available"
                    description="Quick insights and platform intelligence will appear here as data is collected."
                  />
                )}
              </CardContent>{" "}
            </Card>
          </div>{" "}
          {/* Enhanced Action Center - Mobile Responsive */}
          <Card className="overflow-hidden border-0 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white p-4 sm:p-6">
              <CardTitle className="flex items-center">
                <div className="p-2 bg-white/20 rounded-lg mr-3 backdrop-blur-sm">
                  <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <span className="text-base sm:text-lg">
                  Analytics Action Center
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 lg:p-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <Button className="h-16 sm:h-20 flex flex-col items-center justify-center space-y-2 sm:space-y-3 bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-0 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <FileText className="w-5 h-5 sm:w-6 sm:h-6" />
                  <span className="text-xs sm:text-sm font-medium">
                    Custom Reports
                  </span>
                </Button>
                <Button
                  variant="outline"
                  className="h-16 sm:h-20 flex flex-col items-center justify-center space-y-2 sm:space-y-3 border-2 border-green-200 hover:bg-green-50 hover:border-green-300 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
                >
                  <Download className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                  <span className="text-xs sm:text-sm font-medium text-green-700">
                    Export Data
                  </span>
                </Button>
                <Button
                  variant="outline"
                  className="h-16 sm:h-20 flex flex-col items-center justify-center space-y-2 sm:space-y-3 border-2 border-purple-200 hover:bg-purple-50 hover:border-purple-300 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
                >
                  <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                  <span className="text-xs sm:text-sm font-medium text-purple-700">
                    Alert Settings
                  </span>
                </Button>
                <Button
                  variant="outline"
                  className="h-16 sm:h-20 flex flex-col items-center justify-center space-y-2 sm:space-y-3 border-2 border-orange-200 hover:bg-orange-50 hover:border-orange-300 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
                >
                  <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
                  <span className="text-xs sm:text-sm font-medium text-orange-700">
                    Advanced Config
                  </span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default Analytics;
