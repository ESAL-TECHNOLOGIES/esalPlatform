import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, Button } from "@esal/ui";
import { API_ENDPOINTS, apiRequest } from "../utils/api";

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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Browse Startups</h1>
        <p className="text-gray-600">
          Discover innovative startups looking for investment
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <input
                type="text"
                placeholder="Search startups..."
                value={filters.search}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, search: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Industry
              </label>
              <select
                value={filters.industry}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, industry: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stage
              </label>
              <select
                value={filters.stage}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, stage: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              <Button onClick={fetchStartups} className="w-full">
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Startups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStartups.map((startup) => (
          <Card key={startup.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="mb-4">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {startup.title}
                </h3>
                <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    {startup.industry}
                  </span>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    {startup.stage}
                  </span>
                </div>
                <p className="text-gray-700 text-sm line-clamp-3">
                  {startup.description}
                </p>
              </div>

              {startup.ai_score && (
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">AI Score</span>
                    <span
                      className={`font-bold ${
                        startup.ai_score >= 0.8
                          ? "text-green-600"
                          : startup.ai_score >= 0.6
                            ? "text-yellow-600"
                            : "text-gray-600"
                      }`}
                    >
                      {Math.round(startup.ai_score * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div
                      className={`h-2 rounded-full ${
                        startup.ai_score >= 0.8
                          ? "bg-green-500"
                          : startup.ai_score >= 0.6
                            ? "bg-yellow-500"
                            : "bg-gray-400"
                      }`}
                      style={{ width: `${startup.ai_score * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                <span>👁️ {startup.views_count} views</span>
                <span>💡 {startup.interests_count} interests</span>
              </div>

              <div className="flex space-x-2">
                <Button
                  size="sm"
                  onClick={() => viewStartupDetails(startup.id)}
                  variant="outline"
                  className="flex-1"
                >
                  View Details
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleExpressInterest(startup.id)}
                  className="flex-1"
                >
                  Express Interest
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredStartups.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            No startups found
          </h3>
          <p className="text-gray-600">
            Try adjusting your filters or check back later for new
            opportunities.
          </p>
        </div>
      )}

      {/* Startup Details Modal */}
      {detailsModal.isOpen && detailsModal.startup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {detailsModal.startup.title}
                  </h2>
                  <div className="flex items-center space-x-2">
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                      {detailsModal.startup.industry}
                    </span>
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                      {detailsModal.startup.stage}
                    </span>
                  </div>
                </div>
                <Button
                  onClick={() =>
                    setDetailsModal({ startup: null, isOpen: false })
                  }
                  variant="outline"
                  size="sm"
                >
                  ✕
                </Button>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Description
                  </h3>
                  <p className="text-gray-700">
                    {detailsModal.startup.description}
                  </p>
                </div>

                {detailsModal.startup.problem && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Problem
                    </h3>
                    <p className="text-gray-700">
                      {detailsModal.startup.problem}
                    </p>
                  </div>
                )}

                {detailsModal.startup.solution && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Solution
                    </h3>
                    <p className="text-gray-700">
                      {detailsModal.startup.solution}
                    </p>
                  </div>
                )}

                {detailsModal.startup.target_market && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Target Market
                    </h3>
                    <p className="text-gray-700">
                      {detailsModal.startup.target_market}
                    </p>
                  </div>
                )}

                <div className="flex justify-between items-center pt-6 border-t">
                  <div className="text-sm text-gray-600">
                    <div>Views: {detailsModal.startup.views_count}</div>
                    <div>Interests: {detailsModal.startup.interests_count}</div>
                  </div>
                  <Button
                    onClick={() =>
                      handleExpressInterest(detailsModal.startup!.id)
                    }
                  >
                    Express Interest
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
