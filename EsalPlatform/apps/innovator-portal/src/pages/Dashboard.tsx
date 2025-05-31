import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, Button } from "@esal/ui";

interface RecentIdea {
  id: number;
  title: string;
  problem: string;
  solution: string;
  target_market: string;
  user_id: string;
  ai_pitch?: string;
  status: string;
  created_at: string;
  updated_at: string;
  views_count?: number;
  interests_count?: number;
}

interface DashboardStats {
  totalIdeas: number;
  approvedIdeas: number;
  totalViews: number;
  totalInterests: number;
}

interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  role: string;
  is_active: boolean;
  is_blocked: boolean;
  created_at: string;
}

const Dashboard: React.FC = () => {
  const [recentIdeas, setRecentIdeas] = useState<RecentIdea[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalIdeas: 0,
    approvedIdeas: 0,
    totalViews: 0,
    totalInterests: 0,
  });
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);
  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("Authentication required");
      }

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      // Fetch dashboard data (includes user profile, ideas, and stats)
      const dashboardResponse = await fetch(
        "http://localhost:8000/api/v1/innovator/dashboard",
        {
          method: "GET",
          headers,
        }
      );

      if (dashboardResponse.ok) {
        const dashboardData = await dashboardResponse.json();

        // Set user profile
        setUserProfile(dashboardData.user);

        // Set recent ideas
        setRecentIdeas(dashboardData.recent_ideas || []);

        // Set stats
        setStats({
          totalIdeas: dashboardData.stats.total_ideas,
          approvedIdeas: dashboardData.stats.active_ideas,
          totalViews: dashboardData.stats.total_views,
          totalInterests: dashboardData.stats.total_interests,
        });
      } else {
        throw new Error("Failed to fetch dashboard data");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      // Don't set fallback data - show proper error state instead
    } finally {
      setIsLoading(false);
    }
  };

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatStatsData = () => [
    {
      label: "Ideas Submitted",
      value: stats.totalIdeas.toString(),
      icon: "💡",
    },
    {
      label: "Active Ideas",
      value: stats.approvedIdeas.toString(),
      icon: "✅",
    },
    {
      label: "Total Views",
      value:
        stats.totalViews >= 1000
          ? `${(stats.totalViews / 1000).toFixed(1)}k`
          : stats.totalViews.toString(),
      icon: "👀",
    },
    {
      label: "Investor Interest",
      value: stats.totalInterests.toString(),
      icon: "🤝",
    },
  ];
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">
            Welcome back! Here's what's happening with your startup ideas.
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
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>{" "}
        <p className="text-gray-600">
          Welcome back
          {userProfile?.full_name ? `, ${userProfile.full_name}` : ""}! Here's
          what's happening with your startup ideas.
        </p>
      </div>{" "}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="text-red-600 text-sm">
              ❌ Error loading dashboard data: {error}
            </div>
          </div>
        </div>
      )}
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {formatStatsData().map((stat, index) => (
          <Card key={index} className="text-center">
            <CardContent className="p-4">
              <div className="text-3xl mb-2">{stat.icon}</div>
              <div className="text-2xl font-bold text-blue-600">
                {stat.value}
              </div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>
      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              className="w-full"
              onClick={() => (window.location.href = "/upload")}
            >
              Upload New Idea
            </Button>
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => (window.location.href = "/ai-generator")}
            >
              Generate with AI
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => (window.location.href = "/metrics")}
            >
              View Analytics
            </Button>
          </div>
        </CardContent>
      </Card>
      {/* Recent Ideas */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Ideas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentIdeas.length > 0 ? (
              recentIdeas.map((idea) => {
                const statusInfo = getStatusDisplay(idea.status);
                return (
                  <div
                    key={idea.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">
                        {idea.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Submitted on {formatDate(idea.created_at)}
                      </p>{" "}
                      <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                        <span>👀 {idea.views_count || 0} views</span>
                        <span>🤝 {idea.interests_count || 0} interests</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${statusInfo.className}`}
                      >
                        {statusInfo.label}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          (window.location.href = `/ideas/${idea.id}`)
                        }
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-4">🚀</div>
                <p className="text-lg font-medium">No ideas yet!</p>
                <p className="text-sm mb-4">
                  Start by uploading your first startup idea
                </p>
                <Button onClick={() => (window.location.href = "/upload")}>
                  Upload Your First Idea
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>{" "}
      {/* User Status & Profile */}
      {userProfile && (
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Info */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">
                  Account Details
                </h3>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm text-gray-500">Name:</span>
                    <p className="font-medium">
                      {userProfile.full_name || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Email:</span>
                    <p className="font-medium">{userProfile.email}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Role:</span>
                    <p className="font-medium capitalize">{userProfile.role}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Member since:</span>
                    <p className="font-medium">
                      {formatDate(userProfile.created_at)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Status Info */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">
                  Account Status
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Status:</span>
                    <span
                      className={`px-3 py-1 text-sm rounded-full ${
                        userProfile.is_active && !userProfile.is_blocked
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {userProfile.is_active && !userProfile.is_blocked
                        ? "Active"
                        : "Inactive"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Account ID:</span>
                    <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                      {userProfile.id.substring(0, 8)}...
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Status Messages */}
            {userProfile.is_blocked && (
              <div className="mt-4 p-4 bg-red-50 rounded-lg">
                <p className="text-sm text-red-700">
                  ⚠️ Your account has been blocked. Please contact support for
                  assistance.
                </p>
              </div>
            )}
            {!userProfile.is_active && (
              <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
                <p className="text-sm text-yellow-700">
                  ⚠️ Your account is inactive. Please contact support to
                  reactivate your account.
                </p>
              </div>
            )}
            {userProfile.is_active && !userProfile.is_blocked && (
              <div className="mt-4 p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-green-700">
                  ✅ Your account is active and you have full access to all
                  platform features.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;
