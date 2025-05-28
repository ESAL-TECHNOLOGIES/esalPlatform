import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, Button } from "@esal/ui";

interface RecentIdea {
  id: string;
  title: string;
  status: string;
  created_at: string;
  views_count: number;
  interests_count: number;
}

interface DashboardStats {
  totalIdeas: number;
  approvedIdeas: number;
  totalViews: number;
  totalInterests: number;
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  is_approved: boolean;
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

      // Fetch user profile
      const profileResponse = await fetch("http://localhost:8000/api/v1/me", {
        method: "GET",
        headers,
      });

      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        setUserProfile(profileData);
      }

      // Fetch recent ideas
      const ideasResponse = await fetch(
        "http://localhost:8000/api/v1/ideas/my-ideas?page=1&per_page=5",
        {
          method: "GET",
          headers,
        }
      );

      if (ideasResponse.ok) {
        const ideasData = await ideasResponse.json();
        setRecentIdeas(ideasData.ideas || []);

        // Calculate stats from ideas data
        const totalIdeas = ideasData.total || 0;
        const approvedIdeas =
          ideasData.ideas?.filter(
            (idea: RecentIdea) =>
              idea.status === "featured" || idea.status === "active"
          ).length || 0;
        const totalViews =
          ideasData.ideas?.reduce(
            (sum: number, idea: RecentIdea) => sum + idea.views_count,
            0
          ) || 0;
        const totalInterests =
          ideasData.ideas?.reduce(
            (sum: number, idea: RecentIdea) => sum + idea.interests_count,
            0
          ) || 0;

        setStats({
          totalIdeas,
          approvedIdeas,
          totalViews,
          totalInterests,
        });
      } else {
        throw new Error("Failed to fetch dashboard data");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");

      // Fallback to mock data
      const mockIdeas: RecentIdea[] = [
        {
          id: "1",
          title: "AI-Powered Healthcare App",
          status: "under_review",
          created_at: "2024-01-15T10:00:00Z",
          views_count: 456,
          interests_count: 12,
        },
        {
          id: "2",
          title: "Sustainable Energy Solution",
          status: "active",
          created_at: "2024-01-10T10:00:00Z",
          views_count: 342,
          interests_count: 8,
        },
        {
          id: "3",
          title: "EdTech Platform",
          status: "draft",
          created_at: "2024-01-08T10:00:00Z",
          views_count: 234,
          interests_count: 5,
        },
      ];
      setRecentIdeas(mockIdeas);
      setStats({
        totalIdeas: 12,
        approvedIdeas: 8,
        totalViews: 1032,
        totalInterests: 25,
      });
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
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">
          Welcome back{userProfile?.name ? `, ${userProfile.name}` : ""}! Here's
          what's happening with your startup ideas.
        </p>
      </div>

      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex">
            <div className="text-yellow-600 text-sm">
              ⚠️ Using demo data: {error}
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
                      </p>
                      <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                        <span>👀 {idea.views_count} views</span>
                        <span>🤝 {idea.interests_count} interests</span>
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
      </Card>

      {/* User Status & Profile */}
      {userProfile && (
        <Card>
          <CardHeader>
            <CardTitle>Profile Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{userProfile.name}</p>
                <p className="text-sm text-gray-600">{userProfile.email}</p>
                <p className="text-sm text-gray-500 capitalize">
                  Role: {userProfile.role}
                </p>
              </div>
              <div className="text-right">
                <span
                  className={`px-3 py-1 text-sm rounded-full ${
                    userProfile.is_approved
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {userProfile.is_approved ? "Approved" : "Pending Approval"}
                </span>
              </div>
            </div>
            {!userProfile.is_approved && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">
                  Your account is pending approval. Once approved, you'll have
                  full access to all platform features.
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
