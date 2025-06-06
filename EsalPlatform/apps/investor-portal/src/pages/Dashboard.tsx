import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, Button } from "@esal/ui";
import {
  formatCompactCurrency,
  formatDate,
  formatPercentage,
  getStatusColor,
} from "../utils/formatters";
import { API_ENDPOINTS, apiRequest } from "../utils/api";

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
  };

  // Transform API data for display with enhanced visuals
  const getPortfolioStats = () => {
    if (!dashboardData || !portfolio) {
      return [];
    }
    return [
      {
        label: "Total Investments",
        value: formatCompactCurrency(portfolio.total_invested),
        icon: "💰",
        description: "Total capital deployed",
        detail: `Current value: ${formatCompactCurrency(portfolio.current_value)}`,
        trend: "+12%",
        color: "from-blue-500 to-blue-600",
        changeType: "positive" as const,
      },
      {
        label: "Active Companies",
        value: dashboardData.stats.portfolio_companies.toString(),
        icon: "🏢",
        description: "Portfolio companies",
        detail: `${portfolio.portfolio.filter((p) => p.status === "Growing").length} growing`,
        trend: "+3",
        color: "from-green-500 to-green-600",
        changeType: "positive" as const,
      },
      {
        label: "Active Deals",
        value: dashboardData.stats.active_deals.toString(),
        icon: "🤝",
        description: "Ongoing negotiations",
        detail: `${dashboardData.stats.successful_exits} successful exits`,
        trend: "+5",
        color: "from-purple-500 to-purple-600",
        changeType: "positive" as const,
      },
      {
        label: "ROI Average",
        value: formatPercentage(dashboardData.stats.roi_average),
        icon: "📈",
        description: "Return on investment",
        detail: `${dashboardData.stats.sectors_invested.length} sectors`,
        trend: "+8%",
        color: "from-orange-500 to-orange-600",
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
          <h1 className="text-3xl font-bold">
            Investor Dashboard
          </h1>
          <p className="text-green-100 mt-2">Loading your investment portfolio...</p>
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
        <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-xl p-6 text-white">
          <h1 className="text-3xl font-bold">
            Investor Dashboard
          </h1>
          <p className="text-red-200">Error: {error}</p>
        </div>
        <Card>
          <CardContent className="text-center py-8">
            <div className="text-4xl mb-4">⚠️</div>
            <p className="text-gray-600 mb-4">Failed to load dashboard data</p>
            <Button onClick={handleRefresh} className="bg-blue-600 hover:bg-blue-700">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Enhanced Header with Gradient Background */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-xl p-6 sm:p-8 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold">
              Investor Dashboard
            </h1>
            <p className="text-green-100 mt-2 text-lg">
              Welcome back! Here's your investment portfolio overview
            </p>
            <p className="text-sm text-green-200 mt-2">
              Last updated: {lastRefresh.toLocaleTimeString()}
            </p>
          </div>
          
          {/* Dashboard Tabs */}
          <div className="flex bg-white/20 rounded-lg p-1 backdrop-blur-sm">
            {["overview", "portfolio", "opportunities"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  activeTab === tab
                    ? "bg-white text-green-600 shadow-sm"
                    : "text-white/80 hover:text-white hover:bg-white/10"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
          
          <Button 
            onClick={handleRefresh} 
            variant="outline" 
            disabled={isLoading}
            className="bg-white/20 border-white/30 text-white hover:bg-white/30 backdrop-blur-sm"
          >
            {isLoading ? "Refreshing..." : "🔄 Refresh Data"}
          </Button>
        </div>
      </div>

      {/* Enhanced Portfolio Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {portfolioStats.map((stat, index) => (
          <Card
            key={index}
            className="relative overflow-hidden hover:shadow-lg transition-all duration-300 group"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-5 group-hover:opacity-10 transition-opacity`}></div>
            <CardContent className="pt-6 pb-6 px-6 relative">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{stat.icon}</div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      {stat.label}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {stat.description}
                    </p>
                  </div>
                </div>
                <div className={`text-sm font-semibold px-2 py-1 rounded-full ${
                  stat.changeType === "positive"
                    ? "text-green-700 bg-green-100"
                    : "text-red-700 bg-red-100"
                }`}>
                  {stat.trend}
                </div>
              </div>
              {stat.detail && (
                <div className="text-xs text-gray-500 mt-3 pt-3 border-t border-gray-100">
                  {stat.detail}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8">
        {/* Enhanced Recent Opportunities */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
                  <span>🎯</span>
                  <span>Recent Opportunities</span>
                </CardTitle>
                <p className="text-sm text-gray-500 mt-1">Top AI-matched startup opportunities</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
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
                    className="flex items-center justify-between p-4 border rounded-xl hover:bg-gray-50 transition-colors group"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-gray-900">
                          {match.company}
                        </h3>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                          {match.stage}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                        <span className="flex items-center space-x-1">
                          <span>🏭</span>
                          <span>{match.industry}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <span>💰</span>
                          <span>{match.funding}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <span>📊</span>
                          <span>{match.valuation}</span>
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 line-clamp-2">
                        {match.description}
                      </div>
                    </div>
                    <div className="flex items-center ml-4">
                      <Button size="sm" className="shrink-0 group-hover:bg-blue-700 transition-colors">
                        Review
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <div className="text-4xl mb-4">🔍</div>
                <div className="text-lg font-medium">No opportunities available</div>
                <div className="text-sm mt-2">Check back later for new startup matches</div>
              </div>
            )}
            <div className="mt-6">
              <Button variant="outline" className="w-full">
                View All Matches ({opportunities.length})
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Portfolio Companies */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
                  <span>🏢</span>
                  <span>Portfolio Activity</span>
                </CardTitle>
                <p className="text-sm text-gray-500 mt-1">Recent updates from your portfolio companies</p>
              </div>
              {portfolio && (
                <div className="flex items-center space-x-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
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
                    className="flex items-center justify-between p-4 border rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-1">
                        <h3 className="font-semibold text-gray-900">
                          {company.company}
                        </h3>
                        <span
                          className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(company.status)}`}
                        >
                          {company.status}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 mb-1">
                        🏭 {company.industry}
                      </div>
                      <div className="text-xs text-gray-500">
                        📅 Invested: {formatDate(company.investment_date)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-gray-900 mb-1">
                        {formatCompactCurrency(company.investment_amount)}
                      </div>
                      <div className="text-xs text-gray-500">
                        Current: {formatCompactCurrency(company.current_valuation)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <div className="text-4xl mb-4">🏢</div>
                <div className="text-lg font-medium">No portfolio companies yet</div>
                <div className="text-sm mt-2">Start investing to build your portfolio</div>
              </div>
            )}
            <div className="mt-6">
              <Button variant="outline" className="w-full">
                View Full Portfolio
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Quick Actions */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="border-b border-gray-100">
          <div>
            <CardTitle className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
              <span>⚡</span>
              <span>Quick Actions</span>
            </CardTitle>
            <p className="text-sm text-gray-500 mt-1">Streamline your investment workflow</p>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button className="h-20 flex flex-col items-center justify-center space-y-2 bg-blue-600 hover:bg-blue-700">
              <span className="text-2xl">🔍</span>
              <span className="text-sm font-medium">Find Startups</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2 hover:bg-gray-50">
              <span className="text-2xl">⚙️</span>
              <span className="text-sm font-medium">Preferences</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2 hover:bg-gray-50">
              <span className="text-2xl">📊</span>
              <span className="text-sm font-medium">Analytics</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2 hover:bg-gray-50">
              <span className="text-2xl">📅</span>
              <span className="text-sm font-medium">Meetings</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Investment Insights */}
      {dashboardData && (
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="border-b border-gray-100">
            <div>
              <CardTitle className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
                <span>💡</span>
                <span>Investment Insights</span>
              </CardTitle>
              <p className="text-sm text-gray-500 mt-1">Key metrics and performance indicators</p>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {dashboardData.stats.sectors_invested.length}
                </div>
                <div className="text-sm font-semibold text-blue-900 mb-2">Sectors Invested</div>
                <div className="text-xs text-blue-700">
                  {dashboardData.stats.sectors_invested.slice(0, 3).join(", ")}
                  {dashboardData.stats.sectors_invested.length > 3 && "..."}
