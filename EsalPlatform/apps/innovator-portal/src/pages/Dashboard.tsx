// filepath: d:\esalPlatform\EsalPlatform\apps\innovator-portal\src\pages\Dashboard_fixed.tsx
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, Button } from "@esal/ui";
import { API_BASE_URL } from "../config/api";
import {
  Lightbulb,
  Rocket,
  Eye,
  Heart,
  Calendar,
  Sparkles,
  Bot,
  BarChart3,
  Target,
  Zap,
  User,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Building,
  MapPin,
} from "lucide-react";

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

// Enhanced Components
const StatCard: React.FC<{
  title: string;
  value: string | number;
  icon: string;
  gradient: string;
  trend?: { value: string; isUp: boolean };
}> = ({ title, value, icon, gradient, trend }) => (
  <Card
    className={`relative overflow-hidden border-0 ${gradient} text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105`}
  >
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/80 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
          {trend && (
            <div
              className={`flex items-center mt-2 text-sm ${trend.isUp ? "text-green-200" : "text-red-200"}`}
            >
              <span className="mr-1">{trend.isUp ? "↗️" : "↘️"}</span>
              <span>{trend.value}</span>
            </div>
          )}
        </div>
        <div className="text-4xl opacity-80">{icon}</div>
      </div>
      <div className="absolute -right-4 -bottom-4 text-6xl opacity-10">
        {icon}
      </div>
    </CardContent>
  </Card>
);

const QuickActionCard: React.FC<{
  title: string;
  description: string;
  icon: string;
  action: () => void;
  variant?: "primary" | "secondary" | "accent";
}> = ({ title, description, icon, action, variant = "primary" }) => {
  const variantStyles = {
    primary:
      "bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700",
    secondary:
      "bg-gradient-to-br from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700",
    accent:
      "bg-gradient-to-br from-orange-500 to-pink-600 hover:from-orange-600 hover:to-pink-700",
  };

  return (
    <Card
      className={`cursor-pointer border-0 text-white ${variantStyles[variant]} shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105`}
      onClick={action}
    >
      <CardContent className="p-6 text-center">
        <div className="text-4xl mb-4">{icon}</div>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-white/80 text-sm">{description}</p>
      </CardContent>
    </Card>
  );
};

const IdeaCard: React.FC<{ idea: RecentIdea; onView: () => void }> = ({
  idea,
  onView,
}) => {
  const getStatusColor = (status: string) => {
    const colors = {
      featured: "bg-gradient-to-r from-green-500 to-emerald-500",
      active: "bg-gradient-to-r from-blue-500 to-cyan-500",
      under_review: "bg-gradient-to-r from-yellow-500 to-amber-500",
      draft: "bg-gradient-to-r from-gray-500 to-slate-500",
      rejected: "bg-gradient-to-r from-red-500 to-rose-500",
    };
    return (
      colors[status as keyof typeof colors] ||
      "bg-gradient-to-r from-gray-500 to-slate-500"
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <Card className="group cursor-pointer border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-white/90 backdrop-blur-sm">
      <CardContent className="p-6" onClick={onView}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-200 line-clamp-1">
              {idea.title}
            </h3>
            <p className="text-gray-600 text-sm mt-2 line-clamp-2">
              {idea.description}
            </p>
          </div>
          <div
            className={`px-3 py-1 rounded-full text-white text-xs font-medium ${getStatusColor(idea.status)}`}
          >
            {idea.status.replace("_", " ").toUpperCase()}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <span>👁️</span>
              <span className="font-medium">{idea.view_count || 0}</span>
            </div>
            <div className="flex items-center space-x-1">
              <span>💝</span>
              <span className="font-medium">{idea.interest_count || 0}</span>
            </div>
            <div className="flex items-center space-x-1">
              <span>📅</span>
              <span>{formatDate(idea.created_at)}</span>
            </div>
          </div>
          <Button
            size="sm"
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 border-0"
            onClick={(e) => {
              e.stopPropagation();
              onView();
            }}
          >
            View Details →
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const DashboardModern: React.FC = () => {
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
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    fetchDashboardData();
    const timer = setInterval(() => setCurrentTime(new Date()), 60000); // Update every minute
    return () => clearInterval(timer);
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

      const dashboardResponse = await fetch(
        `${API_BASE_URL}/api/v1/innovator/dashboard`,
        {
          method: "GET",
          headers,
        }
      );

      if (dashboardResponse.ok) {
        const dashboardData = await dashboardResponse.json();
        setUserProfile(dashboardData.user);
        if (dashboardData.profile) {
          setExtendedProfile(dashboardData.profile);
        }
        setRecentIdeas(dashboardData.recent_ideas || []);
        setStats(dashboardData.stats);
      } else {
        throw new Error("Failed to fetch dashboard data");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const getUserName = () => {
    return (
      extendedProfile?.full_name ||
      userProfile?.full_name ||
      extendedProfile?.username ||
      userProfile?.username ||
      "Innovator"
    );
  };

  const formatStatsData = () => [
    {
      title: "Total Ideas",
      value: stats.total_ideas,
      icon: "💡",
      gradient: "bg-gradient-to-br from-blue-500 to-blue-600",
      trend: { value: "+12% this month", isUp: true },
    },
    {
      title: "Active Ideas",
      value: stats.active_ideas,
      icon: "🚀",
      gradient: "bg-gradient-to-br from-green-500 to-green-600",
      trend: { value: "+5% this week", isUp: true },
    },
    {
      title: "Total Views",
      value:
        stats.total_views >= 1000
          ? `${(stats.total_views / 1000).toFixed(1)}k`
          : stats.total_views.toString(),
      icon: "👁️",
      gradient: "bg-gradient-to-br from-purple-500 to-purple-600",
      trend: { value: "+23% this month", isUp: true },
    },
    {
      title: "Investor Interest",
      value: stats.total_interests,
      icon: "💝",
      gradient: "bg-gradient-to-br from-pink-500 to-pink-600",
      trend: { value: "+8% this week", isUp: true },
    },
  ];

  const quickActions = [
    {
      title: "Create New Idea",
      description: "Share your innovative startup concept",
      icon: "✨",
      action: () => (window.location.href = "/my-ideas?create=true"),
      variant: "primary" as const,
    },
    {
      title: "AI Generator",
      description: "Generate ideas with artificial intelligence",
      icon: "🤖",
      action: () => (window.location.href = "/ai-generator"),
      variant: "secondary" as const,
    },
    {
      title: "Analytics",
      description: "View detailed performance metrics",
      icon: "📊",
      action: () => (window.location.href = "/metrics"),
      variant: "accent" as const,
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
              <p className="text-gray-600 text-lg">Loading your dashboard...</p>
              <p className="text-gray-400 text-sm mt-2">
                Preparing your innovation workspace
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-6 py-8">
          <Card className="max-w-md mx-auto mt-20 border-0 shadow-xl">
            <CardContent className="p-8 text-center">
              <div className="text-6xl mb-4">⚠️</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Unable to Load Dashboard
              </h3>
              <p className="text-gray-600 mb-6">{error}</p>
              <Button
                onClick={fetchDashboardData}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 border-0"
              >
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Header Section */}
        <div className="text-center md:text-left">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 text-sm font-medium mb-4">
            <span className="mr-2">🌟</span>
            {getGreeting()}, ready to innovate?
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Welcome back, {getUserName()}!
          </h1>
          <p className="text-gray-600 text-lg">
            Here's your innovation dashboard - where great ideas come to life.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {formatStatsData().map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <span className="mr-3">⚡</span>
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quickActions.map((action, index) => (
              <QuickActionCard key={index} {...action} />
            ))}
          </div>
        </div>

        {/* Recent Ideas */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <span className="mr-3">💡</span>
              Recent Ideas
            </h2>
            <Button
              variant="outline"
              onClick={() => (window.location.href = "/my-ideas")}
              className="bg-white/80 border-gray-200 hover:bg-white hover:shadow-md"
            >
              View All Ideas →
            </Button>
          </div>

          {recentIdeas.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recentIdeas.slice(0, 4).map((idea) => (
                <IdeaCard
                  key={idea.id}
                  idea={idea}
                  onView={() => (window.location.href = `/ideas/${idea.id}`)}
                />
              ))}
            </div>
          ) : (
            <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-purple-50">
              <CardContent className="p-12 text-center">
                <div className="text-6xl mb-6">🚀</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Ready to Launch Your First Idea?
                </h3>
                <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                  Transform your innovative concepts into reality. Start by
                  creating your first startup idea and connecting with potential
                  investors who share your vision.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    onClick={() =>
                      (window.location.href = "/my-ideas?create=true")
                    }
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 border-0 px-8 py-3"
                  >
                    <span className="mr-2">✨</span>
                    Create Your First Idea
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => (window.location.href = "/ai-generator")}
                    className="bg-white/80 border-gray-200 hover:bg-white hover:shadow-md px-8 py-3"
                  >
                    <span className="mr-2">🤖</span>
                    Try AI Generator
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Profile Summary (Enhanced) */}
        {extendedProfile && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="mr-3">👤</span>
              Profile Overview
            </h2>
            <Card className="border-0 shadow-lg bg-gradient-to-r from-white to-blue-50/30">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-8">
                  <div className="flex-shrink-0">
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                      {extendedProfile.avatar_url ? (
                        <img
                          src={extendedProfile.avatar_url}
                          alt="Profile Avatar"
                          className="w-24 h-24 rounded-full object-cover"
                        />
                      ) : (
                        getUserName().charAt(0).toUpperCase()
                      )}
                    </div>
                  </div>

                  <div className="flex-1 space-y-4">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">
                        {getUserName()}
                      </h3>
                      {extendedProfile.bio && (
                        <p className="text-gray-600 mt-2">
                          {extendedProfile.bio}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {extendedProfile.company && (
                        <div className="flex items-center text-gray-600">
                          <span className="mr-2">🏢</span>
                          <span>
                            {extendedProfile.position} at{" "}
                            {extendedProfile.company}
                          </span>
                        </div>
                      )}
                      {extendedProfile.location && (
                        <div className="flex items-center text-gray-600">
                          <span className="mr-2">📍</span>
                          <span>{extendedProfile.location}</span>
                        </div>
                      )}
                    </div>

                    {extendedProfile.skills &&
                      extendedProfile.skills.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-2">
                            Skills & Expertise:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {extendedProfile.skills
                              .slice(0, 8)
                              .map((skill, index) => (
                                <span
                                  key={index}
                                  className="px-3 py-1 text-xs bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 rounded-full font-medium"
                                >
                                  {skill}
                                </span>
                              ))}
                            {extendedProfile.skills.length > 8 && (
                              <span className="px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                                +{extendedProfile.skills.length - 8} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                  </div>

                  <div className="flex-shrink-0">
                    <Button
                      onClick={() => (window.location.href = "/profile")}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 border-0"
                    >
                      Edit Profile
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Success Tips for New Users */}
        {stats.total_ideas === 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="mr-3">🎯</span>
              Your Innovation Journey
            </h2>
            <Card className="border-0 shadow-lg bg-gradient-to-r from-emerald-50 to-teal-50">
              <CardContent className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-6">
                      🚀 Get Started in 3 Steps
                    </h3>
                    <div className="space-y-4">
                      {[
                        {
                          step: 1,
                          title: "Create Your First Idea",
                          description:
                            "Share your startup concept with detailed description and market analysis",
                        },
                        {
                          step: 2,
                          title: "Leverage AI Insights",
                          description:
                            "Use our AI tools to refine and enhance your innovative concepts",
                        },
                        {
                          step: 3,
                          title: "Connect with Investors",
                          description:
                            "Showcase your ideas to potential investors and build valuable partnerships",
                        },
                      ].map((item) => (
                        <div
                          key={item.step}
                          className="flex items-start space-x-4"
                        >
                          <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                            {item.step}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">
                              {item.title}
                            </p>
                            <p className="text-gray-600 text-sm mt-1">
                              {item.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-6">
                      💡 Pro Tips for Success
                    </h3>
                    <div className="space-y-3">
                      {[
                        "Be specific about the problem your idea solves",
                        "Include comprehensive market research and analysis",
                        "Add supporting documents and prototypes",
                        "Keep your profile updated and professional",
                        "Engage actively with the investor community",
                      ].map((tip, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-3"
                        >
                          <span className="text-emerald-500 font-bold">✓</span>
                          <span className="text-gray-700 text-sm">{tip}</span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 space-y-3">
                      <Button
                        onClick={() =>
                          (window.location.href = "/my-ideas?create=true")
                        }
                        className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 border-0"
                      >
                        <span className="mr-2">🚀</span>
                        Start Your Journey
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => (window.location.href = "/ai-generator")}
                        className="w-full bg-white/80 border-gray-200 hover:bg-white hover:shadow-md"
                      >
                        <span className="mr-2">🤖</span>
                        Explore AI Tools
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardModern;
