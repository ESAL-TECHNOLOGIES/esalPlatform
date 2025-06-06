import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, Button } from "@esal/ui";
import { API_ENDPOINTS } from "../utils/api";
import {
  Target,
  Settings,
  Zap,
  TrendingUp,
  Building2,
  Clock,
  BarChart3,
  Search,
} from "lucide-react";

interface MatchHighlight {
  reason: string;
  score: number;
}

interface StartupMatch {
  startup_id: string;
  startup_title: string;
  match_score: number;
  highlights: MatchHighlight[];
  industry?: string;
  stage?: string;
  description?: string;
  funding_needed?: string;
  target_market?: string;
}

interface MatchingStatistics {
  total_startups_analyzed: number;
  high_quality_matches: number;
  average_score: number;
  processing_time_seconds: number;
  ai_confidence: number;
}

interface AIMatchingResponse {
  matches: StartupMatch[];
  total_matches: number;
  matching_statistics: MatchingStatistics;
}

interface SavedPreferences {
  id: number;
  preferences_name: string;
  is_default: boolean;
  created_at: string;
  industries: string[];
  stages: string[];
  min_funding_amount: string | null;
  max_funding_amount: string | null;
  risk_tolerance: string;
}

const Matching: React.FC = () => {
  const [preferences, setPreferences] = useState({
    industries: [] as string[],
    stages: [] as string[],
    minFunding: "",
    maxFunding: "",
    riskTolerance: "medium",
  });
  const [matches, setMatches] = useState<StartupMatch[]>([]);
  const [statistics, setStatistics] = useState<MatchingStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedPreferences, setSavedPreferences] = useState<SavedPreferences[]>(
    []
  );
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [newPreferencesName, setNewPreferencesName] = useState("");

  const industryOptions = [
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
  ];
  const stageOptions = [
    "Pre-Seed",
    "Seed",
    "Series A",
    "Series B",
    "Series C+",
  ];

  const handleIndustryToggle = (industry: string) => {
    setPreferences((prev) => ({
      ...prev,
      industries: prev.industries.includes(industry)
        ? prev.industries.filter((i) => i !== industry)
        : [...prev.industries, industry],
    }));
  };
  const handleStageToggle = (stage: string) => {
    setPreferences((prev) => ({
      ...prev,
      stages: prev.stages.includes(stage)
        ? prev.stages.filter((s) => s !== stage)
        : [...prev.stages, stage],
    }));
  };

  // Load saved preferences on component mount
  useEffect(() => {
    loadSavedPreferences();
    loadDefaultPreferences();
  }, []);
  const loadSavedPreferences = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) return;

      const response = await fetch(API_ENDPOINTS.INVESTOR.PREFERENCES_ALL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSavedPreferences(data.preferences_list || []);
      }
    } catch (error) {
      console.error("Error loading saved preferences:", error);
    }
  };
  const loadDefaultPreferences = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) return;

      const response = await fetch(API_ENDPOINTS.INVESTOR.PREFERENCES, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.preferences) {
          setPreferences({
            industries: data.preferences.industries || [],
            stages: data.preferences.stages || [],
            minFunding: data.preferences.min_funding_amount?.toString() || "",
            maxFunding: data.preferences.max_funding_amount?.toString() || "",
            riskTolerance: data.preferences.risk_tolerance || "medium",
          });
        }
      }
    } catch (error) {
      console.error("Error loading default preferences:", error);
    }
  };

  const runMatching = async () => {
    if (preferences.industries.length === 0) {
      setError("Please select at least one industry of interest");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("Authentication token not found");
      }

      // Convert funding strings to numbers
      const minFunding = preferences.minFunding
        ? parseFloat(preferences.minFunding.replace(/[,$]/g, ""))
        : undefined;
      const maxFunding = preferences.maxFunding
        ? parseFloat(preferences.maxFunding.replace(/[,$]/g, ""))
        : undefined;
      const matchingRequest = {
        preferences: {
          industries: preferences.industries,
          stages: preferences.stages,
          min_funding_amount: minFunding,
          max_funding_amount: maxFunding,
          risk_tolerance: preferences.riskTolerance,
          investment_timeline: "6_months", // Default value
        },
        top_k: 10,
        min_score: 0.6,
      };

      const response = await fetch(API_ENDPOINTS.INVESTOR.AI_MATCHING, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(matchingRequest),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to fetch matches");
      }

      const data: AIMatchingResponse = await response.json();
      setMatches(data.matches);
      setStatistics(data.matching_statistics);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while fetching matches"
      );
      console.error("Matching error:", err);
    } finally {
      setIsLoading(false);
    }
  };
  const fetchSavedPreferences = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("Authentication token not found");
      }
      const response = await fetch(API_ENDPOINTS.INVESTOR.PREFERENCES_ALL, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.detail || "Failed to fetch saved preferences"
        );
      }
      const data = await response.json();
      setSavedPreferences(data.preferences_list || []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while fetching saved preferences"
      );
      console.error("Fetch saved preferences error:", err);
    }
  };

  const handleSavePreferences = async () => {
    if (!newPreferencesName) {
      setError("Please enter a name for your preferences");
      return;
    }

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("Authentication token not found");
      }

      const payload = {
        preferences_name: newPreferencesName,
        industries: preferences.industries,
        stages: preferences.stages,
        min_funding_amount: preferences.minFunding,
        max_funding_amount: preferences.maxFunding,
        risk_tolerance: preferences.riskTolerance,
      };
      const response = await fetch(API_ENDPOINTS.INVESTOR.PREFERENCES, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to save preferences");
      }

      setNewPreferencesName("");
      setShowSaveDialog(false);
      fetchSavedPreferences();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while saving preferences"
      );
      console.error("Save preferences error:", err);
    }
  };

  const handleDeletePreferences = async (id: number) => {
    if (
      !window.confirm("Are you sure you want to delete this saved preference?")
    ) {
      return;
    }

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("Authentication token not found");
      }
      const response = await fetch(
        `${API_ENDPOINTS.INVESTOR.PREFERENCES}/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to delete preferences");
      }

      fetchSavedPreferences();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while deleting preferences"
      );
      console.error("Delete preferences error:", err);
    }
  };
  const handleApplySavedPreferences = (prefs: SavedPreferences) => {
    setPreferences({
      industries: prefs.industries,
      stages: prefs.stages,
      minFunding: prefs.min_funding_amount || "",
      maxFunding: prefs.max_funding_amount || "",
      riskTolerance: prefs.risk_tolerance,
    });
  };

  useEffect(() => {
    fetchSavedPreferences();
  }, []);
  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-xl p-8 text-white">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-white/20 rounded-lg">
            <Target className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">AI-Powered Matching</h1>
            <p className="text-indigo-100">
              Configure your investment preferences and let our AI find the
              perfect startup matches
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-6 text-sm">
          <div className="flex items-center space-x-2">
            <Zap className="h-4 w-4" />
            <span>Smart AI Algorithm</span>
          </div>
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Real-time Scoring</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4" />
            <span>Instant Results</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Preferences Panel */}
        <div className="lg:col-span-1">
          <Card className="border-0 shadow-lg">
            {" "}
            <CardHeader>
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 -m-6 mb-0">
                <CardTitle>
                  <div className="flex items-center space-x-2">
                    <Settings className="h-5 w-5 text-blue-600" />
                    <span>Investment Preferences</span>
                  </div>
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              {/* Industries */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center space-x-2">
                  <Building2 className="h-4 w-4 text-blue-600" />
                  <span>Industries of Interest</span>
                </label>
                <div className="space-y-2">
                  {industryOptions.map((industry) => (
                    <label
                      key={industry}
                      className="flex items-center group hover:bg-gray-50 p-2 rounded-lg transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={preferences.industries.includes(industry)}
                        onChange={() => handleIndustryToggle(industry)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-3 text-sm text-gray-700 group-hover:text-gray-900">
                        {industry}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              {/* Funding Stages */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span>Funding Stages</span>
                </label>
                <div className="space-y-2">
                  {stageOptions.map((stage) => (
                    <label
                      key={stage}
                      className="flex items-center group hover:bg-gray-50 p-2 rounded-lg transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={preferences.stages.includes(stage)}
                        onChange={() => handleStageToggle(stage)}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        {stage}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              {/* Funding Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Investment Range
                </label>{" "}
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    title="Minimum Investment Amount"
                    placeholder="Min ($)"
                    value={preferences.minFunding}
                    onChange={(e) =>
                      setPreferences((prev) => ({
                        ...prev,
                        minFunding: e.target.value,
                      }))
                    }
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    title="Maximum Investment Amount"
                    placeholder="Max ($)"
                    value={preferences.maxFunding}
                    onChange={(e) =>
                      setPreferences((prev) => ({
                        ...prev,
                        maxFunding: e.target.value,
                      }))
                    }
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>{" "}
              </div>
              {/* Risk Tolerance */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Risk Tolerance
                </label>{" "}
                <select
                  title="Risk Tolerance"
                  value={preferences.riskTolerance}
                  onChange={(e) =>
                    setPreferences((prev) => ({
                      ...prev,
                      riskTolerance: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="conservative">Conservative</option>
                  <option value="medium">Medium</option>
                  <option value="aggressive">Aggressive</option>
                </select>
              </div>{" "}
              <Button
                onClick={runMatching}
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? "Finding Matches..." : "Update Matches"}
              </Button>
              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}
              {/* Save Preferences */}
              <div>
                <Button
                  onClick={() => setShowSaveDialog(true)}
                  className="w-full"
                  variant="outline"
                >
                  Save Preferences
                </Button>

                {/* Save Preferences Dialog */}
                {showSaveDialog && (
                  <div className="fixed inset-0 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Save Preferences
                      </h3>
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Name your preferences
                        </label>{" "}
                        <input
                          type="text"
                          title="Preferences Name"
                          placeholder="Enter a name for your preferences"
                          value={newPreferencesName}
                          onChange={(e) =>
                            setNewPreferencesName(e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button
                          onClick={() => setShowSaveDialog(false)}
                          variant="outline"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleSavePreferences}
                          disabled={isLoading}
                        >
                          {isLoading ? "Saving..." : "Save Preferences"}
                        </Button>
                      </div>
                      {error && (
                        <div className="mt-4 text-sm text-red-600">{error}</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              {/* Saved Preferences List */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Saved Preferences
                </label>
                <div className="space-y-2">
                  {savedPreferences.map((pref) => (
                    <div
                      key={pref.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-md border"
                    >
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">
                          {pref.preferences_name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {pref.is_default ? "Default" : "Custom"} •{" "}
                          {new Date(pref.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => handleApplySavedPreferences(pref)}
                        >
                          Apply
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeletePreferences(pref.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Matches Results */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Your Top Matches</CardTitle>
            </CardHeader>{" "}
            <CardContent>
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">
                    Finding your perfect startup matches...
                  </p>
                </div>
              ) : matches.length === 0 ? (
                <div className="text-center py-12">
                  <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Search size={32} className="stroke-2 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No matches yet
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Configure your investment preferences and click "Update
                    Matches" to find startups that align with your interests.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {matches.map((match) => (
                    <div
                      key={match.startup_id}
                      className="border rounded-lg p-6 hover:bg-gray-50"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900">
                            {match.startup_title}
                          </h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                            {match.industry && <span>{match.industry}</span>}
                            {match.stage && (
                              <>
                                <span>•</span>
                                <span>{match.stage}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="text-center">
                          <div
                            className={`text-2xl font-bold ${
                              match.match_score >= 0.9
                                ? "text-green-600"
                                : match.match_score >= 0.8
                                  ? "text-yellow-600"
                                  : "text-gray-600"
                            }`}
                          >
                            {Math.round(match.match_score * 100)}%
                          </div>
                          <div className="text-xs text-gray-500">
                            Match Score
                          </div>
                        </div>
                      </div>

                      {match.description && (
                        <p className="text-gray-700 mb-4">
                          {match.description}
                        </p>
                      )}

                      <div className="mb-4">
                        <h4 className="font-medium text-gray-900 mb-2">
                          Why this matches your preferences:
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {match.highlights.map((highlight, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                            >
                              {highlight.reason} (
                              {Math.round(highlight.score * 100)}%)
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-6 text-sm text-gray-600">
                          {match.funding_needed && (
                            <span>
                              <strong>Seeking:</strong> {match.funding_needed}
                            </span>
                          )}
                          {match.target_market && (
                            <span>
                              <strong>Market:</strong> {match.target_market}
                            </span>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm">Express Interest</Button>
                          <Button size="sm" variant="outline">
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Matching Insights */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Matching Insights</CardTitle>
            </CardHeader>{" "}
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {statistics?.total_startups_analyzed || 0}
                  </div>
                  <div className="text-sm text-gray-600">
                    Total Startups Analyzed
                  </div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {statistics?.high_quality_matches || 0}
                  </div>
                  <div className="text-sm text-gray-600">
                    High-Quality Matches (&gt;80%)
                  </div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {statistics
                      ? Math.round(statistics.average_score * 100)
                      : 0}
                    %
                  </div>
                  <div className="text-sm text-gray-600">
                    Average Match Score
                  </div>
                </div>
              </div>

              {statistics && (
                <div className="mt-4 text-center text-sm text-gray-600">
                  <p>
                    AI Confidence: {Math.round(statistics.ai_confidence * 100)}%
                    • Processing time:{" "}
                    {statistics.processing_time_seconds.toFixed(1)}s
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Matching;
