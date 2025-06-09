import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, Button } from "@esal/ui";
import { API_ENDPOINTS, apiRequest } from "../utils/api";
import {
  Search,
  Filter,
  RefreshCw,
  Eye,
  Heart,
  Building2,  TrendingUp,
  Users,
  DollarSign,
  Target,
  Lightbulb,
  X,
  Star,
  Zap,
  Award,
  BarChart3,
} from "lucide-react";

interface Startup {
  id: string;
  title: string;
  description: string;
  industry: string;
  stage: string;
  target_market: string;
  problem: string;
  solution: string;
  funding_needed: string;
  team_size: number;
  created_at: string;
  views_count: number;
  interests_count: number;
  innovator_id: string;
  ai_score?: number;
}

interface StartupDetailsModal {
  startup: Startup | null;
  isOpen: boolean;
}

const BrowseStartups: React.FC = () => {
  const [startups, setStartups] = useState<Startup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    industry: "",
    stage: "",
    search: "",
  });
  const [detailsModal, setDetailsModal] = useState<StartupDetailsModal>({
    startup: null,
    isOpen: false,
  });

  const industries = [
    "AI/ML",
    "Biotech",
    "CleanTech",
    "FinTech",
    "HealthTech",
    "EdTech",
    "PropTech",
    "RetailTech",
    "AgriTech",
    "SpaceTech",
    "Technology",
  ];

  const stages = [
    "Ideation",
    "Pre-Seed",
    "Seed",
    "Series A",
    "Series B",
    "Series C+",
  ];

  useEffect(() => {
    fetchStartups();
  }, [filters.industry, filters.stage]);

  const fetchStartups = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filters.industry) params.append("industry", filters.industry);
      if (filters.stage) params.append("stage", filters.stage);
      params.append("limit", "50");

      const url = `${API_ENDPOINTS.INVESTOR.BROWSE_STARTUPS}?${params.toString()}`;
      const response = await apiRequest(url);

      if (!response.ok) {
        throw new Error("Failed to fetch startups");
      }

      const data = await response.json();
      setStartups(data.startups || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExpressInterest = async (startupId: string) => {
    try {
      const response = await apiRequest(
        API_ENDPOINTS.INVESTOR.EXPRESS_INTEREST,
        {
          method: "POST",
          body: JSON.stringify({
            startup_id: startupId,
            message: "I'm interested in learning more about your startup.",
          }),
        }
      );

      if (response.ok) {
        alert(
          "Interest expressed successfully! The innovator will be notified."
        );
      } else {
        throw new Error("Failed to express interest");
      }
    } catch (err) {
      alert("Failed to express interest. Please try again.");
    }
  };

  const viewStartupDetails = async (startupId: string) => {
    try {
      const response = await apiRequest(
        `${API_ENDPOINTS.INVESTOR.STARTUP_DETAILS}/${startupId}`
      );

      if (response.ok) {
        const startup = await response.json();
        setDetailsModal({ startup, isOpen: true });
      } else {
        throw new Error("Failed to fetch startup details");
      }
    } catch (err) {
      alert("Failed to load startup details");
    }
  };

  const filteredStartups = startups.filter(
    (startup) =>
      startup.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      startup.description.toLowerCase().includes(filters.search.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading startups...</div>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-8 text-white">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-white/20 rounded-lg">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Browse Startups</h1>
            <p className="text-blue-100">
              Discover innovative startups looking for investment opportunities
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-6 text-sm">
          <div className="flex items-center space-x-2">
            <Target className="h-4 w-4" />
            <span>{filteredStartups.length} Startups Found</span>
          </div>
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4" />
            <span>High Growth Potential</span>
          </div>
        </div>
      </div>{" "}
      {/* Filters */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-blue-600" />
            <span>Filter & Search</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-1">
                <Search className="h-4 w-4" />
                <span>Search</span>
              </label>
              <input
                type="text"
                placeholder="Search startups..."
                value={filters.search}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, search: e.target.value }))
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-1">
                <Building2 className="h-4 w-4" />
                <span>Industry</span>
              </label>
              <select
                value={filters.industry}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, industry: e.target.value }))
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                title="Filter by industry"
              >
                <option value="">All Industries</option>
                {industries.map((industry) => (
                  <option key={industry} value={industry}>
                    {industry}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-1">
                <TrendingUp className="h-4 w-4" />
                <span>Stage</span>
              </label>
              <select
                value={filters.stage}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, stage: e.target.value }))
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                title="Filter by stage"
              >
                <option value="">All Stages</option>
                {stages.map((stage) => (
                  <option key={stage} value={stage}>
                    {stage}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <Button
                onClick={fetchStartups}
                className="w-full bg-blue-600 hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Refresh</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>{" "}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center space-x-3">
          <div className="p-2 bg-red-100 rounded-lg">
            <X className="h-4 w-4 text-red-600" />
          </div>
          <p className="text-red-700">{error}</p>
        </div>
      )}{" "}
      {/* Startups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStartups.map((startup) => (
          <Card
            key={startup.id}
            className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
          >
            <CardContent className="p-6">
              <div className="mb-4">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {startup.title}
                  </h3>
                  {startup.ai_score && startup.ai_score >= 0.8 && (
                    <div className="p-1 bg-yellow-100 rounded-full">
                      <Star className="h-4 w-4 text-yellow-600" />
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-2 text-sm mb-3">
                  <span className="bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 px-3 py-1 rounded-full font-medium flex items-center space-x-1">
                    <Building2 className="h-3 w-3" />
                    <span>{startup.industry}</span>
                  </span>
                  <span className="bg-gradient-to-r from-green-100 to-green-200 text-green-800 px-3 py-1 rounded-full font-medium flex items-center space-x-1">
                    <TrendingUp className="h-3 w-3" />
                    <span>{startup.stage}</span>
                  </span>
                </div>
                <p className="text-gray-700 text-sm line-clamp-3 leading-relaxed">
                  {startup.description}
                </p>
              </div>

              {startup.ai_score && (
                <div className="mb-4 p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-600 flex items-center space-x-1">
                      <BarChart3 className="h-4 w-4" />
                      <span>AI Investment Score</span>
                    </span>
                    <span
                      className={`font-bold flex items-center space-x-1 ${
                        startup.ai_score >= 0.8
                          ? "text-green-600"
                          : startup.ai_score >= 0.6
                            ? "text-yellow-600"
                            : "text-gray-600"
                      }`}
                    >
                      {startup.ai_score >= 0.8 && <Award className="h-4 w-4" />}
                      <span>{Math.round(startup.ai_score * 100)}%</span>
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        startup.ai_score >= 0.8
                          ? "bg-gradient-to-r from-green-400 to-green-600"
                          : startup.ai_score >= 0.6
                            ? "bg-gradient-to-r from-yellow-400 to-yellow-600"
                            : "bg-gradient-to-r from-gray-400 to-gray-500"
                      }`}
                      style={{ width: `${startup.ai_score * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between text-sm text-gray-600 mb-4 p-3 bg-gray-50 rounded-lg">
                <span className="flex items-center space-x-1">
                  <Eye className="h-4 w-4" />
                  <span>{startup.views_count} views</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Heart className="h-4 w-4" />
                  <span>{startup.interests_count} interests</span>
                </span>
              </div>

              <div className="flex space-x-2">
                <Button
                  size="sm"
                  onClick={() => viewStartupDetails(startup.id)}
                  variant="outline"
                  className="flex-1 border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 transition-colors flex items-center justify-center space-x-1"
                >
                  <Eye className="h-4 w-4" />
                  <span>View Details</span>
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleExpressInterest(startup.id)}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center justify-center space-x-1"
                >
                  <Zap className="h-4 w-4" />
                  <span>Express Interest</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>{" "}
      {filteredStartups.length === 0 && !isLoading && (
        <div className="text-center py-16">
          <div className="mx-auto max-w-md">
            <div className="p-4 bg-gray-100 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              No startups found
            </h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your filters or check back later for new
              opportunities.
            </p>
            <Button
              onClick={() =>
                setFilters({ industry: "", stage: "", search: "" })
              }
              variant="outline"
              className="flex items-center space-x-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Clear Filters</span>
            </Button>
          </div>
        </div>
      )}{" "}
      {/* Startup Details Modal */}
      {detailsModal.isOpen && detailsModal.startup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-8">
              <div className="flex items-start justify-between mb-8">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Building2 className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-gray-900">
                        {detailsModal.startup.title}
                      </h2>
                      <div className="flex items-center space-x-3 mt-2">
                        <span className="bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
                          <Building2 className="h-3 w-3" />
                          <span>{detailsModal.startup.industry}</span>
                        </span>
                        <span className="bg-gradient-to-r from-green-100 to-green-200 text-green-800 px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
                          <TrendingUp className="h-3 w-3" />
                          <span>{detailsModal.startup.stage}</span>
                        </span>
                        {detailsModal.startup.ai_score &&
                          detailsModal.startup.ai_score >= 0.8 && (
                            <span className="bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
                              <Star className="h-3 w-3" />
                              <span>High Potential</span>
                            </span>
                          )}
                      </div>
                    </div>
                  </div>
                </div>
                <Button
                  onClick={() =>
                    setDetailsModal({ startup: null, isOpen: false })
                  }
                  variant="outline"
                  size="sm"
                  className="border-gray-300 hover:bg-gray-50 p-2"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-8">
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                    <Lightbulb className="h-5 w-5 text-blue-600" />
                    <span>Description</span>
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {detailsModal.startup.description}
                  </p>
                </div>

                {detailsModal.startup.problem && (
                  <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-xl p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                      <Target className="h-5 w-5 text-red-600" />
                      <span>Problem</span>
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      {detailsModal.startup.problem}
                    </p>
                  </div>
                )}

                {detailsModal.startup.solution && (
                  <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                      <Zap className="h-5 w-5 text-green-600" />
                      <span>Solution</span>
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      {detailsModal.startup.solution}
                    </p>
                  </div>
                )}

                {detailsModal.startup.target_market && (
                  <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                      <Users className="h-5 w-5 text-purple-600" />
                      <span>Target Market</span>
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      {detailsModal.startup.target_market}
                    </p>
                  </div>
                )}

                {detailsModal.startup.funding_needed && (
                  <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-xl p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                      <DollarSign className="h-5 w-5 text-yellow-600" />
                      <span>Funding Needed</span>
                    </h3>
                    <p className="text-gray-700 leading-relaxed font-semibold">
                      {detailsModal.startup.funding_needed}
                    </p>
                  </div>
                )}

                <div className="flex justify-between items-center pt-8 border-t border-gray-200">
                  <div className="grid grid-cols-2 gap-6 text-sm">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Eye className="h-4 w-4" />
                      <span>Views: {detailsModal.startup.views_count}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Heart className="h-4 w-4" />
                      <span>
                        Interests: {detailsModal.startup.interests_count}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Users className="h-4 w-4" />
                      <span>Team Size: {detailsModal.startup.team_size}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Building2 className="h-4 w-4" />
                      <span>Stage: {detailsModal.startup.stage}</span>
                    </div>
                  </div>
                  <Button
                    onClick={() =>
                      handleExpressInterest(detailsModal.startup!.id)
                    }
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center space-x-2 px-6 py-3"
                  >
                    <Zap className="h-4 w-4" />
                    <span>Express Interest</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrowseStartups;
