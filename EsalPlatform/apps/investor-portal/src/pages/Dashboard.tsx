import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, Button } from "@esal/ui";
import {
  formatCompactCurrency,
  formatDate,
  formatPercentage,
  getStatusColor,
} from "../utils/formatters";
import { API_ENDPOINTS, apiRequest } from "../utils/api";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Building2,
  Handshake,
  BarChart3,
  Target,
  Search,
  Settings,
  Calendar,
  Lightbulb,
  PieChart,
  Users,
  Eye,
  RefreshCw,
  Activity,
  Briefcase,
  Globe,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Zap,
  Award,
  Trophy,
  Rocket,
  Sparkles,
} from "lucide-react";

// TypeScript interfaces for API data
interface DashboardStats {
  portfolio_companies: number;
  total_investments: string;
  active_deals: number;
  successful_exits: number;
  roi_average: string;
  sectors_invested: string[];
}

interface InvestorDashboardData {
  message: string;
  stats: DashboardStats;
}

interface Opportunity {
  id: number;
  startup_name: string;
  stage: string;
  seeking: string;
  valuation: string;
  industry: string;
  pitch_summary: string;
}

interface PortfolioCompany {
  id: number;
  company: string;
  investment_amount: string;
  investment_date: string;
  current_valuation: string;
  status: string;
  industry: string;
}

interface PortfolioData {
  portfolio: PortfolioCompany[];
  total_invested: string;
  current_value: string;
}

const Dashboard: React.FC = () => {
  // State management
  const [dashboardData, setDashboardData] =
    useState<InvestorDashboardData | null>(null);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch data from API endpoints
  useEffect(() => {
    fetchDashboardData();

    // Set up auto-refresh every 5 minutes
    const interval = setInterval(
      () => {
        fetchDashboardData();
      },
      5 * 60 * 1000
    );

    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch dashboard stats
      const dashboardResponse = await apiRequest(
        API_ENDPOINTS.INVESTOR.DASHBOARD
      );

      if (!dashboardResponse.ok) {
        throw new Error("Failed to fetch dashboard data");
      }

      const dashboard = await dashboardResponse.json();
      setDashboardData(dashboard);

      // Fetch opportunities (top AI matches)
      const opportunitiesResponse = await apiRequest(
        API_ENDPOINTS.INVESTOR.OPPORTUNITIES
      );

      if (opportunitiesResponse.ok) {
        const opportunitiesData = await opportunitiesResponse.json();
        setOpportunities(opportunitiesData.opportunities || []);
      }

      // Fetch portfolio data
      const portfolioResponse = await apiRequest(
        API_ENDPOINTS.INVESTOR.PORTFOLIO
      );

      if (portfolioResponse.ok) {
        const portfolioData = await portfolioResponse.json();
        setPortfolio(portfolioData);
      }

      setLastRefresh(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }; // Transform API data for display with enhanced visuals
  const getPortfolioStats = () => {
    if (!dashboardData || !portfolio) {
      return [];
    }
    return [
      {
        label: "Total Investments",
        value: formatCompactCurrency(portfolio.total_invested),
        icon: DollarSign,
        description: "Total capital deployed",
        detail: `Current value: ${formatCompactCurrency(portfolio.current_value)}`,
        trend: "+12%",
        trendUp: true,
        color: "from-emerald-500 to-emerald-600",
        bgColor: "from-emerald-50 to-emerald-100",
        iconColor: "text-emerald-600",
        changeType: "positive" as const,
      },
      {
        label: "Active Companies",
        value: dashboardData.stats.portfolio_companies.toString(),
        icon: Building2,
        description: "Portfolio companies",
        detail: `${portfolio.portfolio.filter((p) => p.status === "Growing").length} growing`,
        trend: "+3",
        trendUp: true,
        color: "from-blue-500 to-blue-600",
        bgColor: "from-blue-50 to-blue-100",
        iconColor: "text-blue-600",
        changeType: "positive" as const,
      },
      {
        label: "Active Deals",
        value: dashboardData.stats.active_deals.toString(),
        icon: Handshake,
        description: "Ongoing negotiations",
        detail: `${dashboardData.stats.successful_exits} successful exits`,
        trend: "+5",
        trendUp: true,
        color: "from-purple-500 to-purple-600",
        bgColor: "from-purple-50 to-purple-100",
        iconColor: "text-purple-600",
        changeType: "positive" as const,
      },
      {
        label: "ROI Average",
        value: formatPercentage(dashboardData.stats.roi_average),
        icon: BarChart3,
        description: "Return on investment",
        detail: `${dashboardData.stats.sectors_invested.length} sectors`,
        trend: "+8%",
        trendUp: true,
        color: "from-orange-500 to-orange-600",
        bgColor: "from-orange-50 to-orange-100",
        iconColor: "text-orange-600",
        changeType: "positive" as const,
      },
    ];
  };

  const getRecentMatches = () => {
    return opportunities.slice(0, 3).map((opp) => ({
      id: opp.id,
      company: opp.startup_name,
      industry: opp.industry,
      funding: opp.seeking,
      valuation: opp.valuation,
      stage: opp.stage,
      description: opp.pitch_summary,
    }));
  };

  // Handle manual refresh
  const handleRefresh = () => {
    fetchDashboardData();
  };

  // Get computed data
  const portfolioStats = getPortfolioStats();
  const recentMatches = getRecentMatches();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-xl p-6 text-white">
          <h1 className="text-3xl font-bold">Investor Dashboard</h1>
          <p className="text-green-100 mt-2">
            Loading your investment portfolio...
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="text-center">
              <CardContent>
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <Briefcase size={28} className="stroke-2" />
            </div>
            <h1 className="text-3xl font-bold">Investor Dashboard</h1>
          </div>
          <div className="flex items-center space-x-2 text-red-200">
            <AlertCircle size={18} className="stroke-2" />
            <span>Error: {error}</span>
          </div>
        </div>
        <Card className="border-0 shadow-md">
          <CardContent className="text-center py-8">
            <div className="p-4 bg-red-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <AlertCircle size={24} className="stroke-2 text-red-500" />
            </div>
            <p className="text-gray-600 mb-4">Failed to load dashboard data</p>
            <Button
              onClick={handleRefresh}
              className="bg-blue-600 hover:bg-blue-700 flex items-center space-x-2 mx-auto"
            >
              <RefreshCw size={16} className="stroke-2" />
              <span>Try Again</span>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {" "}
      {/* Enhanced Header with Gradient Background */}
      <div className="bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 rounded-xl p-6 sm:p-8 text-white shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Briefcase size={28} className="stroke-2" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold">
                Investor Dashboard
              </h1>
            </div>
            <p className="text-green-100 mt-2 text-lg flex items-center space-x-2">
              <Sparkles size={18} className="stroke-2" />
              <span>
                Welcome back! Here's your investment portfolio overview
              </span>
            </p>
            <div className="flex items-center space-x-2 text-sm text-green-200 mt-3">
              <Clock size={14} className="stroke-2" />
              <span>Last updated: {lastRefresh.toLocaleTimeString()}</span>
            </div>
          </div>

          {/* Dashboard Tabs */}
          <div className="flex bg-white/20 rounded-lg p-1 backdrop-blur-sm">
            {[
              { key: "overview", icon: PieChart, label: "Overview" },
              { key: "portfolio", icon: Briefcase, label: "Portfolio" },
              { key: "opportunities", icon: Target, label: "Opportunities" },
            ].map((tab) => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center space-x-2 ${
                    activeTab === tab.key
                      ? "bg-white text-green-600 shadow-sm"
                      : "text-white/80 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <TabIcon size={16} className="stroke-2" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <Button
            onClick={handleRefresh}
            variant="outline"
            disabled={isLoading}
            className="bg-white/20 border-white/30 text-white hover:bg-white/30 backdrop-blur-sm flex items-center space-x-2"
          >
            <RefreshCw
              size={16}
              className={`stroke-2 ${isLoading ? "animate-spin" : ""}`}
            />
            <span>{isLoading ? "Refreshing..." : "Refresh Data"}</span>
          </Button>
        </div>
      </div>
      {/* Enhanced Portfolio Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {portfolioStats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Card
              key={index}
              className="relative overflow-hidden hover:shadow-lg transition-all duration-300 group border-0 shadow-md"
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${stat.bgColor} group-hover:opacity-80 transition-opacity`}
              ></div>
              <CardContent className="pt-6 pb-6 px-6 relative">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <div
                      className={`p-3 rounded-xl bg-white shadow-sm ${stat.iconColor}`}
                    >
                      <IconComponent size={24} className="stroke-2" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">
                        {stat.label}
                      </p>
                      <p className="text-2xl font-bold text-gray-900 mb-1">
                        {stat.value}
                      </p>
                      <p className="text-xs text-gray-600">
                        {stat.description}
                      </p>
                    </div>
                  </div>
                  <div
                    className={`flex items-center space-x-1 text-sm font-semibold px-3 py-1 rounded-full ${
                      stat.changeType === "positive"
                        ? "text-green-700 bg-green-100 border border-green-200"
                        : "text-red-700 bg-red-100 border border-red-200"
                    }`}
                  >
                    {stat.trendUp ? (
                      <TrendingUp size={14} className="stroke-2" />
                    ) : (
                      <TrendingDown size={14} className="stroke-2" />
                    )}
                    <span>{stat.trend}</span>
                  </div>
                </div>
                {stat.detail && (
                  <div className="text-xs text-gray-600 mt-4 pt-4 border-t border-gray-200 flex items-center space-x-1">
                    <Activity size={12} className="stroke-2" />
                    <span>{stat.detail}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8">
        {" "}
        {/* Enhanced Recent Opportunities */}
        <Card className="hover:shadow-lg transition-shadow border-0 shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 -m-6 mb-0">
              <div>
                <CardTitle>
                  <div className="text-xl font-semibold text-gray-900 flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Target size={20} className="stroke-2 text-blue-600" />
                    </div>
                    <span>Recent Opportunities</span>
                  </div>
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1 ml-11">
                  Top AI-matched startup opportunities
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-800 border border-blue-200">
                  <Sparkles size={12} className="stroke-2 mr-1" />
                  {opportunities.length} Available
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {recentMatches.length > 0 ? (
              <div className="space-y-4">
                {recentMatches.map((match) => (
                  <div
                    key={match.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-blue-200 transition-all group"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-gray-900">
                          {match.company}
                        </h3>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800 border border-purple-200">
                          <Rocket size={10} className="stroke-2 mr-1" />
                          {match.stage}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                        <span className="flex items-center space-x-1">
                          <Building2
                            size={14}
                            className="stroke-2 text-gray-500"
                          />
                          <span>{match.industry}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <DollarSign
                            size={14}
                            className="stroke-2 text-gray-500"
                          />
                          <span>{match.funding}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <BarChart3
                            size={14}
                            className="stroke-2 text-gray-500"
                          />
                          <span>{match.valuation}</span>
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 line-clamp-2">
                        {match.description}
                      </div>
                    </div>
                    <div className="flex items-center ml-4">
                      <Button
                        size="sm"
                        className="shrink-0 group-hover:bg-blue-700 transition-colors flex items-center space-x-1"
                      >
                        <Eye size={14} className="stroke-2" />
                        <span>Review</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Search size={24} className="stroke-2 text-gray-400" />
                </div>
                <div className="text-lg font-medium">
                  No opportunities available
                </div>
                <div className="text-sm mt-2">
                  Check back later for new startup matches
                </div>
              </div>
            )}
            <div className="mt-6">
              <Button
                variant="outline"
                className="w-full flex items-center justify-center space-x-2 hover:bg-blue-50 hover:border-blue-200"
              >
                <ExternalLink size={16} className="stroke-2" />
                <span>View All Matches ({opportunities.length})</span>
              </Button>
            </div>
          </CardContent>
        </Card>{" "}
        {/* Enhanced Portfolio Companies */}
        <Card className="hover:shadow-lg transition-shadow border-0 shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between border-b border-gray-100 bg-gradient-to-r from-green-50 to-emerald-50 p-6 -m-6 mb-0">
              <div>
                <CardTitle>
                  <div className="text-xl font-semibold text-gray-900 flex items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Briefcase
                        size={20}
                        className="stroke-2 text-green-600"
                      />
                    </div>
                    <span>Portfolio Activity</span>
                  </div>
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1 ml-11">
                  Recent updates from your portfolio companies
                </p>
              </div>
              {portfolio && (
                <div className="flex items-center space-x-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-green-100 text-green-800 border border-green-200">
                    <Building2 size={12} className="stroke-2 mr-1" />
                    {portfolio.portfolio.length} Companies
                  </span>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {portfolio && portfolio.portfolio.length > 0 ? (
              <div className="space-y-4">
                {portfolio.portfolio.slice(0, 3).map((company) => (
                  <div
                    key={company.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-green-200 transition-all"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-1">
                        <h3 className="font-semibold text-gray-900">
                          {company.company}
                        </h3>
                        <span
                          className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(company.status)}`}
                        >
                          <CheckCircle2 size={10} className="stroke-2 mr-1" />
                          {company.status}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1 text-sm text-gray-600 mb-1">
                        <Globe size={14} className="stroke-2 text-gray-500" />
                        <span>{company.industry}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-xs text-gray-500">
                        <Calendar size={12} className="stroke-2" />
                        <span>
                          Invested: {formatDate(company.investment_date)}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-1 text-sm font-semibold text-gray-900 mb-1">
                        <DollarSign
                          size={14}
                          className="stroke-2 text-gray-600"
                        />
                        <span>
                          {formatCompactCurrency(company.investment_amount)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1 text-xs text-gray-500">
                        <TrendingUp
                          size={12}
                          className="stroke-2 text-green-500"
                        />
                        <span>
                          Current:{" "}
                          {formatCompactCurrency(company.current_valuation)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Briefcase size={24} className="stroke-2 text-gray-400" />
                </div>
                <div className="text-lg font-medium">
                  No portfolio companies yet
                </div>
                <div className="text-sm mt-2">
                  Start investing to build your portfolio
                </div>
              </div>
            )}
            <div className="mt-6">
              <Button
                variant="outline"
                className="w-full flex items-center justify-center space-x-2 hover:bg-green-50 hover:border-green-200"
              >
                <ExternalLink size={16} className="stroke-2" />
                <span>View Full Portfolio</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>{" "}
      {/* Enhanced Quick Actions */}
      <Card className="hover:shadow-lg transition-shadow border-0 shadow-md">
        <CardHeader>
          <div className="border-b border-gray-100 bg-gradient-to-r from-purple-50 to-pink-50 p-6 -m-6 mb-0">
            <CardTitle>
              <div className="text-xl font-semibold text-gray-900 flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Zap size={20} className="stroke-2 text-purple-600" />
                </div>
                <span>Quick Actions</span>
              </div>
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1 ml-11">
              Streamline your investment workflow
            </p>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button className="h-20 flex flex-col items-center justify-center space-y-2 bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all transform hover:scale-105 shadow-md">
              <Search size={24} className="stroke-2" />
              <span className="text-sm font-medium">Find Startups</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center space-y-2 hover:bg-gray-50 hover:border-gray-300 transition-all transform hover:scale-105 border-2"
            >
              <Settings size={24} className="stroke-2 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">
                Preferences
              </span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center space-y-2 hover:bg-gray-50 hover:border-gray-300 transition-all transform hover:scale-105 border-2"
            >
              <PieChart size={24} className="stroke-2 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">
                Analytics
              </span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center space-y-2 hover:bg-gray-50 hover:border-gray-300 transition-all transform hover:scale-105 border-2"
            >
              <Calendar size={24} className="stroke-2 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">
                Meetings
              </span>
            </Button>
          </div>
        </CardContent>
      </Card>{" "}
      {/* Enhanced Investment Insights */}
      {dashboardData && (
        <Card className="hover:shadow-lg transition-shadow border-0 shadow-md">
          <CardHeader>
            <div className="border-b border-gray-100 bg-gradient-to-r from-orange-50 to-yellow-50 p-6 -m-6 mb-0">
              <CardTitle>
                <div className="text-xl font-semibold text-gray-900 flex items-center space-x-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Lightbulb size={20} className="stroke-2 text-orange-600" />
                  </div>
                  <span>Investment Insights</span>
                </div>
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1 ml-11">
                Key metrics and performance indicators
              </p>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border-2 border-blue-200 hover:border-blue-300 transition-all transform hover:scale-105">
                <div className="flex items-center justify-center mb-3">
                  <div className="p-3 bg-blue-200 rounded-full">
                    <Users size={24} className="stroke-2 text-blue-700" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {dashboardData.stats.sectors_invested.length}
                </div>
                <div className="text-sm font-semibold text-blue-900 mb-2">
                  Sectors Invested
                </div>
                <div className="text-xs text-blue-700">
                  {dashboardData.stats.sectors_invested.slice(0, 3).join(", ")}
                  {dashboardData.stats.sectors_invested.length > 3 && "..."}
                </div>
              </div>

              <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border-2 border-green-200 hover:border-green-300 transition-all transform hover:scale-105">
                <div className="flex items-center justify-center mb-3">
                  <div className="p-3 bg-green-200 rounded-full">
                    <Trophy size={24} className="stroke-2 text-green-700" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {dashboardData.stats.successful_exits}
                </div>
                <div className="text-sm font-semibold text-green-900 mb-2">
                  Successful Exits
                </div>
                <div className="text-xs text-green-700">
                  Portfolio performance
                </div>
              </div>

              <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border-2 border-purple-200 hover:border-purple-300 transition-all transform hover:scale-105">
                <div className="flex items-center justify-center mb-3">
                  <div className="p-3 bg-purple-200 rounded-full">
                    <Award size={24} className="stroke-2 text-purple-700" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {formatPercentage(dashboardData.stats.roi_average)}
                </div>
                <div className="text-sm font-semibold text-purple-900 mb-2">
                  Average ROI
                </div>
                <div className="text-xs text-purple-700">
                  Return on investment
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;
