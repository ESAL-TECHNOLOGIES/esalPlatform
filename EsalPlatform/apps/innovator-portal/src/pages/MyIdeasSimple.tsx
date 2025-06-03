import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, Button } from "@esal/ui";

interface Idea {
  id: string;
  title: string;
  description: string;
  industry: string;
  stage: string;
  status: string;
  created_at: string;
  updated_at: string;
  views_count: number;
  interests_count: number;
}

const MyIdeas: React.FC = () => {
  const navigate = useNavigate();
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");

  useEffect(() => {
    fetchIdeas();
  }, []);

  const fetchIdeas = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(
        `http://localhost:8000/api/v1/innovator/view-ideas`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to fetch ideas");
      }

      const ideasData = await response.json();
      setIdeas(ideasData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An error occurred fetching ideas"
      );
      console.error("Error fetching ideas:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteIdea = async (ideaId: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this idea? This action cannot be undone."
      )
    ) {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          throw new Error("Authentication required");
        }

        const response = await fetch(
          `http://localhost:8000/api/v1/innovator/delete-idea/${ideaId}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || "Failed to delete idea");
        }

        // Remove the deleted idea from the state
        setIdeas((prevIdeas) => prevIdeas.filter((idea) => idea.id !== ideaId));

        // Show success message
        alert("Idea deleted successfully!");
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "An error occurred deleting the idea"
        );
        console.error("Error deleting idea:", err);
      }
    }
  };

  const formatDate = (dateString: string): string => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  const getStatusDisplay = (
    status: string
  ): { label: string; className: string } => {
    switch (status) {
      case "draft":
        return { label: "Draft", className: "bg-gray-100 text-gray-800" };
      case "active":
        return { label: "Active", className: "bg-green-100 text-green-800" };
      case "pending":
        return {
          label: "Pending Review",
          className: "bg-yellow-100 text-yellow-800",
        };
      case "rejected":
        return { label: "Rejected", className: "bg-red-100 text-red-800" };
      default:
        return { label: status, className: "bg-gray-100 text-gray-800" };
    }
  };

  const filteredIdeas = ideas.filter((idea) => {
    if (filter === "all") return true;
    return idea.status === filter;
  });

  const sortedIdeas = [...filteredIdeas].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      case "oldest":
        return (
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
      case "most-viewed":
        return b.views_count - a.views_count;
      case "most-interest":
        return b.interests_count - a.interests_count;
      default:
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Ideas</h1>
          <p className="text-gray-600">Loading your startup ideas...</p>
        </div>
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <div className="text-center">
            <p className="text-gray-500 text-sm">
              Fetching your brilliant ideas...
            </p>
            <p className="text-gray-400 text-xs mt-1">This won't take long</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Ideas</h1>
          <p className="text-gray-600 mt-1">
            View and manage all your startup ideas
          </p>
          <div className="flex items-center gap-6 mt-2 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              {ideas.length} Total Ideas
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              {ideas.filter((idea) => idea.status === "active").length} Active
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
              {ideas.filter((idea) => idea.status === "draft").length} Drafts
            </span>
          </div>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => navigate("/upload")}
            className="flex items-center bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            <span className="mr-2 text-lg">+</span> Upload New Idea
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-red-800">
                Something went wrong
              </h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
              <div className="mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchIdeas}
                  className="border-red-300 text-red-700 hover:bg-red-50"
                >
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Sorting */}
      <Card className="border-gray-200 shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium text-gray-700 self-center mr-2">
                Filter:
              </span>
              <Button
                variant={filter === "all" ? "primary" : "outline"}
                size="sm"
                onClick={() => setFilter("all")}
                className={
                  filter === "all"
                    ? "bg-blue-600 text-white"
                    : "hover:bg-gray-50"
                }
              >
                All Ideas ({ideas.length})
              </Button>
              <Button
                variant={filter === "active" ? "primary" : "outline"}
                size="sm"
                onClick={() => setFilter("active")}
                className={
                  filter === "active"
                    ? "bg-green-600 text-white"
                    : "hover:bg-gray-50"
                }
              >
                Active (
                {ideas.filter((idea) => idea.status === "active").length})
              </Button>
              <Button
                variant={filter === "draft" ? "primary" : "outline"}
                size="sm"
                onClick={() => setFilter("draft")}
                className={
                  filter === "draft"
                    ? "bg-yellow-600 text-white"
                    : "hover:bg-gray-50"
                }
              >
                Drafts ({ideas.filter((idea) => idea.status === "draft").length}
                )
              </Button>
              <Button
                variant={filter === "pending" ? "primary" : "outline"}
                size="sm"
                onClick={() => setFilter("pending")}
                className={
                  filter === "pending"
                    ? "bg-orange-600 text-white"
                    : "hover:bg-gray-50"
                }
              >
                Pending (
                {ideas.filter((idea) => idea.status === "pending").length})
              </Button>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700">
                Sort by:
              </span>
              <select
                title="Sort ideas"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="newest">📅 Newest First</option>
                <option value="oldest">📅 Oldest First</option>
                <option value="most-viewed">👁️ Most Viewed</option>
                <option value="most-interest">🤝 Most Interest</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ideas List */}
      {sortedIdeas.length === 0 ? (
        <Card className="border-gray-200 shadow-sm">
          <CardContent className="text-center py-20">
            <div className="max-w-md mx-auto">
              <div className="text-8xl mb-6">
                {filter === "all"
                  ? "🚀"
                  : filter === "active"
                    ? "✅"
                    : filter === "draft"
                      ? "📝"
                      : "⏳"}
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">
                {filter === "all"
                  ? "Ready to upload your first idea?"
                  : `No ${filter} ideas found`}
              </h3>
              <p className="text-gray-600 mb-8 leading-relaxed">
                {filter === "all"
                  ? "Every great startup begins with a single idea. Upload your first startup concept to get started."
                  : `You don't have any ideas with the "${filter}" status. Try a different filter or upload a new idea.`}
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button
                  onClick={() => navigate("/upload")}
                  className="bg-blue-600 hover:bg-blue-700 px-6 py-3 text-base font-medium transition-colors"
                >
                  🎯 Upload Your First Idea
                </Button>
              </div>
              {filter !== "all" && (
                <div className="mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setFilter("all")}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    View All Ideas
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {sortedIdeas.map((idea) => {
            const statusInfo = getStatusDisplay(idea.status);
            return (
              <Card
                key={idea.id}
                className="hover:shadow-lg transition-all duration-200 border-gray-200 group"
              >
                <CardContent className="p-0">
                  {/* Status Bar */}
                  <div
                    className={`h-2 w-full ${
                      idea.status === "active"
                        ? "bg-green-500"
                        : idea.status === "draft"
                          ? "bg-yellow-500"
                          : idea.status === "pending"
                            ? "bg-orange-500"
                            : "bg-gray-400"
                    }`}
                  ></div>

                  <div className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                      <div className="flex-1 space-y-4">
                        {/* Title and Status */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                          <h3
                            className="font-bold text-xl text-gray-900 cursor-pointer hover:text-blue-600 transition-colors group-hover:text-blue-700"
                            onClick={() => navigate(`/ideas/${idea.id}`)}
                          >
                            {idea.title}
                          </h3>
                          <span
                            className={`px-3 py-1 text-xs font-medium rounded-full self-start ${statusInfo.className}`}
                          >
                            {statusInfo.label}
                          </span>
                        </div>

                        {/* Metadata */}
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <svg
                              className="w-4 h-4"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Created {formatDate(idea.created_at)}
                          </div>
                          <div className="flex items-center gap-1">
                            <svg
                              className="w-4 h-4"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Updated {formatDate(idea.updated_at)}
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-gray-700 leading-relaxed line-clamp-3">
                          {idea.description}
                        </p>

                        {/* Tags and Stats */}
                        <div className="flex flex-wrap items-center gap-6 text-sm">
                          {idea.industry && (
                            <div className="flex items-center text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                              <span className="mr-2">🏭</span> {idea.industry}
                            </div>
                          )}
                          {idea.stage && (
                            <div className="flex items-center text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                              <span className="mr-2">📈</span> {idea.stage}
                            </div>
                          )}
                          <div className="flex items-center text-gray-600">
                            <span className="mr-2">👁️</span> {idea.views_count}{" "}
                            views
                          </div>
                          <div className="flex items-center text-gray-600">
                            <span className="mr-2">🤝</span>{" "}
                            {idea.interests_count} interests
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-row lg:flex-col gap-3 self-start">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => navigate(`/ideas/${idea.id}`)}
                          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 transition-colors"
                        >
                          📊 View Details
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-red-300 text-red-600 hover:bg-red-50 px-4 py-2 transition-colors"
                          onClick={() => handleDeleteIdea(idea.id)}
                        >
                          🗑️ Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyIdeas;
