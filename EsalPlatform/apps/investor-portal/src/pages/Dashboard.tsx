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
  }; // Transform API data for display
  const getPortfolioStats = () => {
    if (!dashboardData || !portfolio) {
      return [];
    }
    return [
      {
        label: "Total Investments",
        value: formatCompactCurrency(portfolio.total_invested),
        icon: "💰",
        detail: `Current value: ${formatCompactCurrency(portfolio.current_value)}`,
      },
      {
        label: "Active Companies",
        value: dashboardData.stats.portfolio_companies.toString(),
        icon: "🏢",
        detail: `${portfolio.portfolio.filter((p) => p.status === "Growing").length} growing`,
      },
      {
        label: "Active Deals",
        value: dashboardData.stats.active_deals.toString(),
        icon: "🤝",
        detail: `${dashboardData.stats.successful_exits} successful exits`,
      },
      {
        label: "ROI Average",
        value: formatPercentage(dashboardData.stats.roi_average),
        icon: "📈",
        detail: `${dashboardData.stats.sectors_invested.length} sectors`,
      },
    ] as Array<{ label: string; value: string; icon: string; detail?: string }>;
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
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Investor Dashboard
          </h1>
          <p className="text-gray-600">Loading your investment portfolio...</p>
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
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Investor Dashboard
          </h1>
          <p className="text-red-600">Error: {error}</p>
        </div>
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-600 mb-4">Failed to load dashboard data</p>
            <Button onClick={handleRefresh}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Investor Dashboard
          </h1>
          <p className="text-gray-600">
            Welcome back! Here's your investment portfolio overview.
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </p>
        </div>
        <Button onClick={handleRefresh} variant="outline" disabled={isLoading}>
          {isLoading ? "Refreshing..." : "Refresh Data"}
        </Button>
      </div>

      {/* Portfolio Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {portfolioStats.map((stat, index) => (
          <Card
            key={index}
            className="text-center hover:shadow-md transition-shadow"
          >
            <CardContent className="pt-6">
              <div className="text-3xl mb-2">{stat.icon}</div>
              <div className="text-2xl font-bold text-blue-600">
                {stat.value}
              </div>
              <div className="text-sm text-gray-600 mb-1">{stat.label}</div>
              {stat.detail && (
                <div className="text-xs text-gray-500">{stat.detail}</div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {" "}
        {/* Recent Opportunities */}{" "}
        <Card>
          <CardHeader>
            <CardTitle>
              <div className="flex items-center justify-between">
                Recent Opportunities
                <span className="text-sm font-normal text-gray-500">
                  {opportunities.length} total
                </span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentMatches.length > 0 ? (
              <div className="space-y-4">
                {recentMatches.map((match) => (
                  <div
                    key={match.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {" "}
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">
                        {match.company}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                        <span>{match.industry}</span>
                        <span>•</span>
                        <span>{match.stage}</span>
                        <span>•</span>
                        <span>{match.funding}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {match.description}
                      </div>
                    </div>{" "}
                    <div className="flex items-center ml-4">
                      <Button size="sm" className="shrink-0">
                        Review
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No opportunities available
              </div>
            )}
            <div className="mt-4">
              <Button variant="outline" className="w-full">
                View All Matches ({opportunities.length})
              </Button>
            </div>
          </CardContent>
        </Card>
        {/* Portfolio Companies */}{" "}
        <Card>
          <CardHeader>
            <CardTitle>
              <div className="flex items-center justify-between">
                Recent Portfolio Activity
                {portfolio && (
                  <span className="text-sm font-normal text-gray-500">
                    {portfolio.portfolio.length} companies
                  </span>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {portfolio && portfolio.portfolio.length > 0 ? (
              <div className="space-y-4">
                {portfolio.portfolio.slice(0, 3).map((company) => (
                  <div
                    key={company.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      {" "}
                      <h3 className="font-medium text-gray-900">
                        {company.company}
                      </h3>
                      <div className="text-sm text-gray-600">
                        {company.industry}
                      </div>
                      <div className="text-xs text-gray-500">
                        Invested: {formatDate(company.investment_date)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCompactCurrency(company.investment_amount)}
                      </div>
                      <div
                        className={`text-xs px-2 py-1 rounded-full ${getStatusColor(company.status)}`}
                      >
                        {company.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No portfolio companies yet
              </div>
            )}
            <div className="mt-4">
              <Button variant="outline" className="w-full">
                View Full Portfolio
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button className="w-full">🔍 Find New Startups</Button>
            <Button variant="secondary" className="w-full">
              ⚙️ Update Preferences
            </Button>
            <Button variant="outline" className="w-full">
              📊 Portfolio Analytics
            </Button>
            <Button variant="ghost" className="w-full">
              📅 Schedule Meeting
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Dashboard Insights */}
      {dashboardData && (
        <Card>
          <CardHeader>
            <CardTitle>Investment Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {dashboardData.stats.sectors_invested.length}
                </div>
                <div className="text-sm text-gray-600">Sectors Invested</div>
                <div className="text-xs text-gray-500 mt-1">
                  {dashboardData.stats.sectors_invested.join(", ")}
                </div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {dashboardData.stats.successful_exits}
                </div>
                <div className="text-sm text-gray-600">Successful Exits</div>
                <div className="text-xs text-gray-500 mt-1">
                  Portfolio companies exited
                </div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {dashboardData.stats.roi_average}
                </div>
                <div className="text-sm text-gray-600">Average ROI</div>
                <div className="text-xs text-gray-500 mt-1">
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
