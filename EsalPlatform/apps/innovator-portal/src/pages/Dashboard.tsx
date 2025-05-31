import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, Button } from "@esal/ui";

interface RecentIdea {
  id: number;
  title: string;
  description: string;
  category?: string;
  tags?: string[];
  status: string;
  visibility?: string;
  view_count?: number;
  interest_count?: number;
  created_at: string;
  updated_at: string;
}

interface DashboardStats {
  total_ideas: number;
  active_ideas: number;
  total_views: number;
  total_interests: number;
}

interface UserProfile {
  id: string;
  email: string;
  username?: string;
  full_name?: string;
  role: string;
  is_active: boolean;
  is_blocked: boolean;
  created_at: string;
}

interface ExtendedProfile {
  id: string;
  username?: string;
  full_name?: string;
  bio?: string;
  avatar_url?: string;
  company?: string;
  position?: string;
  location?: string;
  skills?: string[];
  interests?: string[];
  total_ideas: number;
  total_views: number;
  total_interests: number;
  created_at: string;
  updated_at: string;
}

const Dashboard: React.FC = () => {
  const [recentIdeas, setRecentIdeas] = useState<RecentIdea[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    total_ideas: 0,
    active_ideas: 0,
    total_views: 0,
    total_interests: 0,
  });
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [extendedProfile, setExtendedProfile] =
    useState<ExtendedProfile | null>(null);
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
        const dashboardData = await dashboardResponse.json(); // Set user profile
        setUserProfile(dashboardData.user);

        // Set extended profile if available
        if (dashboardData.profile) {
          setExtendedProfile(dashboardData.profile);
        }

        // Set recent ideas
        setRecentIdeas(dashboardData.recent_ideas || []);

        // Set stats
        setStats(dashboardData.stats);
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
      value: stats.total_ideas.toString(),
      icon: "💡",
    },
    {
      label: "Active Ideas",
      value: stats.active_ideas.toString(),
      icon: "✅",
    },
    {
      label: "Total Views",
      value:
        stats.total_views >= 1000
          ? `${(stats.total_views / 1000).toFixed(1)}k`
          : stats.total_views.toString(),
      icon: "👀",
    },
    {
      label: "Investor Interest",
      value: stats.total_interests.toString(),
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
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-gray-500 text-sm">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">
            Welcome back! Here's what's happening with your startup ideas.
          </p>
        </div>
        <Card>
          <CardContent className="p-8">
            <div className="text-center">
              <div className="text-6xl mb-4">⚠️</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Unable to Load Dashboard
              </h3>
              <p className="text-gray-600 mb-6">{error}</p>
              <Button onClick={fetchDashboardData}>Try Again</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>{" "}
        <p className="text-gray-600">
          Welcome back
          {extendedProfile?.full_name
            ? `, ${extendedProfile.full_name}`
            : userProfile?.full_name
              ? `, ${userProfile.full_name}`
              : ""}
          ! Here's what's happening with your startup ideas.
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
          <Card
            key={index}
            className="text-center hover:shadow-lg transition-shadow"
          >
            <CardContent className="p-6">
              <div className="text-4xl mb-3">{stat.icon}</div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
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
        </CardHeader>{" "}
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              className="w-full h-14 flex items-center justify-center space-x-2"
              onClick={() => (window.location.href = "/upload")}
            >
              <span className="text-lg">📤</span>
              <span>Upload New Idea</span>
            </Button>
            <Button
              variant="secondary"
              className="w-full h-14 flex items-center justify-center space-x-2"
              onClick={() => (window.location.href = "/ai-generator")}
            >
              <span className="text-lg">🤖</span>
              <span>Generate with AI</span>
            </Button>
            <Button
              variant="outline"
              className="w-full h-14 flex items-center justify-center space-x-2"
              onClick={() => (window.location.href = "/metrics")}
            >
              <span className="text-lg">📊</span>
              <span>View Analytics</span>
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
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 hover:shadow-md transition-all cursor-pointer"
                    onClick={() => (window.location.href = `/ideas/${idea.id}`)}
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-lg hover:text-blue-600 transition-colors">
                        {idea.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Created {formatDate(idea.created_at)}
                      </p>
                      <div className="mt-3 flex items-center space-x-6 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <span>👀</span>
                          <span className="font-medium">
                            {idea.view_count || 0}
                          </span>
                          <span>views</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span>🤝</span>
                          <span className="font-medium">
                            {idea.interest_count || 0}
                          </span>
                          <span>interests</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span
                        className={`px-3 py-1 text-xs font-medium rounded-full ${statusInfo.className}`}
                      >
                        {statusInfo.label}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.location.href = `/ideas/${idea.id}`;
                        }}
                      >
                        View →
                      </Button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 text-gray-500">
                <div className="text-6xl mb-4">💡</div>
                <p className="text-xl font-medium mb-2">
                  Ready to Share Your Ideas?
                </p>
                <p className="text-sm mb-6 max-w-md mx-auto">
                  Your innovative startup ideas could be the next big thing.
                  Start by uploading your first idea and connecting with
                  potential investors.
                </p>
                <div className="space-y-3">
                  <Button
                    className="px-6 py-3"
                    onClick={() => (window.location.href = "/upload")}
                  >
                    🚀 Upload Your First Idea
                  </Button>
                  <div className="text-xs text-gray-400">
                    or{" "}
                    <button
                      className="text-blue-600 hover:underline"
                      onClick={() => (window.location.href = "/ai-generator")}
                    >
                      generate ideas with AI
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>{" "}
      {/* Enhanced Profile Information */}
      {extendedProfile && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Profile Summary</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => (window.location.href = "/profile")}
              >
                Edit Profile
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start space-x-4">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {extendedProfile.avatar_url ? (
                    <img
                      src={extendedProfile.avatar_url}
                      alt="Profile Avatar"
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  ) : (
                    (
                      extendedProfile.full_name ||
                      extendedProfile.username ||
                      "A"
                    )
                      .charAt(0)
                      .toUpperCase()
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {extendedProfile.full_name ||
                      extendedProfile.username ||
                      "Anonymous User"}
                  </h3>
                  {extendedProfile.bio && (
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                      {extendedProfile.bio}
                    </p>
                  )}
                  {extendedProfile.company && (
                    <div className="mt-3 flex items-center text-sm text-gray-500">
                      <span className="mr-1">🏢</span>
                      <span className="font-medium">
                        {extendedProfile.position || "Professional"}
                      </span>
                      {extendedProfile.position && " at "}
                      <span className="font-medium">
                        {extendedProfile.company}
                      </span>
                    </div>
                  )}
                  {extendedProfile.location && (
                    <div className="text-sm text-gray-500 mt-1">
                      📍 {extendedProfile.location}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                {extendedProfile.skills &&
                  extendedProfile.skills.length > 0 && (
                    <div>
                      <span className="text-sm font-medium text-gray-700">
                        Skills:
                      </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {extendedProfile.skills
                          .slice(0, 5)
                          .map((skill, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
                            >
                              {skill}
                            </span>
                          ))}
                        {extendedProfile.skills.length > 5 && (
                          <span className="text-xs text-gray-500">
                            +{extendedProfile.skills.length - 5} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                {extendedProfile.interests &&
                  extendedProfile.interests.length > 0 && (
                    <div>
                      <span className="text-sm font-medium text-gray-700">
                        Interests:
                      </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {extendedProfile.interests
                          .slice(0, 5)
                          .map((interest, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full"
                            >
                              {interest}
                            </span>
                          ))}
                        {extendedProfile.interests.length > 5 && (
                          <span className="text-xs text-gray-500">
                            +{extendedProfile.interests.length - 5} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                <div className="pt-2 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => (window.location.href = "/profile")}
                  >
                    Edit Profile
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
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
      {/* Tips and Getting Started (show for users with no ideas) */}
      {stats.total_ideas === 0 && (
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardHeader>
            <CardTitle>
              <div className="text-blue-800">
                🚀 Welcome to Your Innovation Journey!
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">
                  Get Started in 3 Easy Steps:
                </h4>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      1
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">
                        Upload Your First Idea
                      </p>
                      <p className="text-sm text-gray-600">
                        Share your startup concept with detailed description and
                        target market
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      2
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">
                        Get AI-Powered Insights
                      </p>
                      <p className="text-sm text-gray-600">
                        Use our AI generator to refine ideas and discover new
                        opportunities
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      3
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">
                        Connect with Investors
                      </p>
                      <p className="text-sm text-gray-600">
                        Showcase your ideas to potential investors and partners
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">
                  💡 Pro Tips for Success:
                </h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center space-x-2">
                    <span className="text-green-500">✓</span>
                    <span>Be specific about the problem your idea solves</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="text-green-500">✓</span>
                    <span>
                      Include market research and target audience details
                    </span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="text-green-500">✓</span>
                    <span>
                      Add supporting documents like business plans or prototypes
                    </span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="text-green-500">✓</span>
                    <span>
                      Update your profile to build credibility with investors
                    </span>
                  </li>
                </ul>
                <div className="mt-4 space-x-3">
                  <Button
                    size="sm"
                    onClick={() => (window.location.href = "/upload")}
                  >
                    Start Now
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => (window.location.href = "/ai-generator")}
                  >
                    Try AI Generator
                  </Button>
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
