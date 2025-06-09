// filepath: d:\esalPlatform\EsalPlatform\apps\innovator-portal\src\pages\Dashboard_fixed.tsx
import React, { useState, useEffect } from "react";
import { Card, CardContent, Button } from "@esal/ui";
import { API_BASE_URL } from "../config/api";
import {
  Lightbulb,
  Eye,
  Heart,
  Calendar,
  TrendingUp,
  TrendingDown,
  Sparkles,
  Bot,
  BarChart3,
  Target,
  Rocket,
  CheckCircle,
  Building,
  MapPin,
  Zap,
  User,
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
  icon: React.ReactNode;
  gradient: string;
  trend?: { value: string; isUp: boolean };
}> = ({ title, value, icon, gradient, trend }) => (
  <Card
    className={`relative overflow-hidden border-0 ${gradient} text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105`}
  >
    <CardContent className="p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-white/80 text-xs sm:text-sm font-medium truncate">
            {title}
          </p>
          <p className="text-2xl sm:text-3xl font-bold mt-1 sm:mt-2">{value}</p>{" "}
          {trend && (
            <div
              className={`flex items-center mt-1 sm:mt-2 text-xs sm:text-sm ${trend.isUp ? "text-green-200" : "text-red-200"}`}
            >
              {trend.isUp ? (
                <TrendingUp className="w-3 h-3 mr-1" />
              ) : (
                <TrendingDown className="w-3 h-3 mr-1" />
              )}
              <span className="truncate">{trend.value}</span>
            </div>
          )}
        </div>
        <div className="text-3xl sm:text-4xl opacity-80 flex-shrink-0">
          {icon}
        </div>
      </div>
      <div className="absolute -right-4 -bottom-4 text-4xl sm:text-6xl opacity-10">
        {icon}
      </div>
    </CardContent>
  </Card>
);

const QuickActionCard: React.FC<{
  title: string;
  description: string;
  icon: React.ReactNode;
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
    <div
      className={`cursor-pointer border-0 text-white ${variantStyles[variant]} shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 rounded-lg`}
      onClick={action}
    >
      <div className="p-4 sm:p-6 text-center">
        <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">{icon}</div>
        <h3 className="text-base sm:text-lg font-semibold mb-2">{title}</h3>
        <p className="text-white/80 text-xs sm:text-sm">{description}</p>
      </div>
    </div>
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
      <div className="p-4 sm:p-6 cursor-pointer" onClick={onView}>
        <div className="flex flex-col sm:flex-row items-start justify-between mb-4 gap-3 sm:gap-0">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-200 line-clamp-1">
              {idea.title}
            </h3>
            <p className="text-gray-600 text-sm mt-2 line-clamp-2">
              {idea.description}
            </p>
          </div>
          <div
            className={`px-3 py-1 rounded-full text-white text-xs font-medium flex-shrink-0 ${getStatusColor(idea.status)}`}
          >
            {idea.status.replace("_", " ").toUpperCase()}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
          {" "}
          <div className="flex items-center space-x-3 sm:space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <Eye className="w-4 h-4" />
              <span className="font-medium">{idea.view_count || 0}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Heart className="w-4 h-4" />
              <span className="font-medium">{idea.interest_count || 0}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">
                {formatDate(idea.created_at)}
              </span>
              <span className="sm:hidden">
                {formatDate(idea.created_at).replace(/,.*/, "")}
              </span>
            </div>
          </div>
          <Button
            size="sm"
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 border-0 w-full sm:w-auto"
            onClick={(e) => {
              e.stopPropagation();
              onView();
            }}
          >
            View Details →
          </Button>
        </div>
      </div>
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
      icon: <Lightbulb className="w-6 h-6" />,
      gradient: "bg-gradient-to-br from-blue-500 to-blue-600",
      trend: { value: "+12% this month", isUp: true },
    },
    {
      title: "Active Ideas",
      value: stats.active_ideas,
      icon: <Rocket className="w-6 h-6" />,
      gradient: "bg-gradient-to-br from-green-500 to-green-600",
      trend: { value: "+5% this week", isUp: true },
    },
    {
      title: "Total Views",
      value:
        stats.total_views >= 1000
          ? `${(stats.total_views / 1000).toFixed(1)}k`
          : stats.total_views.toString(),
      icon: <Eye className="w-6 h-6" />,
      gradient: "bg-gradient-to-br from-purple-500 to-purple-600",
      trend: { value: "+23% this month", isUp: true },
    },
    {
      title: "Investor Interest",
      value: stats.total_interests,
      icon: <Heart className="w-6 h-6" />,
      gradient: "bg-gradient-to-br from-pink-500 to-pink-600",
      trend: { value: "+8% this week", isUp: true },
    },
  ];
  const quickActions = [
    {
      title: "Create New Idea",
      description: "Share your innovative startup concept",
      icon: <Sparkles className="w-6 h-6" />,
      action: () => (window.location.href = "/my-ideas?create=true"),
      variant: "primary" as const,
    },
    {
      title: "AI Generator",
      description: "Generate ideas with artificial intelligence",
      icon: <Bot className="w-6 h-6" />,
      action: () => (window.location.href = "/ai-generator"),
      variant: "secondary" as const,
    },
    {
      title: "Analytics",
      description: "View detailed performance metrics",
      icon: <BarChart3 className="w-6 h-6" />,
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
          {" "}
          <Card className="max-w-md mx-auto mt-20 border-0 shadow-xl">
            <CardContent className="p-8 text-center">
              <div className="text-red-500 mb-4 flex justify-center">
                <svg
                  className="w-16 h-16"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
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
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Header Section */}
        <div className="text-center md:text-left">
          {" "}
          <div className="inline-flex items-center px-3 sm:px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 text-xs sm:text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4 mr-2" />
            <span className="truncate">
              {getGreeting()}, ready to innovate?
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Welcome back, {getUserName()}!
          </h1>
          <p className="text-gray-600 text-base sm:text-lg">
            Here's your innovation dashboard - where great ideas come to life.
          </p>
        </div>
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {formatStatsData().map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>{" "}
        {/* Quick Actions */}
        <div>
          {" "}
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center">
            <Zap className="w-6 h-6 mr-2 sm:mr-3" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {quickActions.map((action, index) => (
              <QuickActionCard key={index} {...action} />
            ))}
          </div>
        </div>{" "}
        {/* Recent Ideas */}
        <div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3 sm:gap-0">
            {" "}
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center">
              <Lightbulb className="w-6 h-6 mr-2 sm:mr-3" />
              Recent Ideas
            </h2>
            <Button
              variant="outline"
              onClick={() => (window.location.href = "/my-ideas")}
              className="bg-white/80 border-gray-200 hover:bg-white hover:shadow-md w-full sm:w-auto"
            >
              View All Ideas →
            </Button>
          </div>

          {recentIdeas.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
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
              <CardContent className="p-6 sm:p-8 lg:p-12 text-center">
                <div className="text-blue-500 mb-4 sm:mb-6 flex justify-center">
                  <Rocket className="w-16 h-16 sm:w-24 sm:h-24" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
                  Ready to Launch Your First Idea?
                </h3>
                <p className="text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto text-sm sm:text-base">
                  Transform your innovative concepts into reality. Start by
                  creating your first startup idea and connecting with potential
                  investors who share your vision.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                  <Button
                    onClick={() =>
                      (window.location.href = "/my-ideas?create=true")
                    }
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 border-0 px-6 sm:px-8 py-2 sm:py-3 w-full sm:w-auto"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Create Your First Idea
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => (window.location.href = "/ai-generator")}
                    className="bg-white/80 border-gray-200 hover:bg-white hover:shadow-md px-6 sm:px-8 py-2 sm:py-3 w-full sm:w-auto"
                  >
                    <Bot className="w-4 h-4 mr-2" />
                    Try AI Generator
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>{" "}
        {/* Profile Summary (Enhanced) */}
        {extendedProfile && (
          <div>
            {" "}
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center">
              <User className="w-5 h-5 mr-2 sm:mr-3" />
              Profile Overview
            </h2>
            <Card className="border-0 shadow-lg bg-gradient-to-r from-white to-blue-50/30">
              <CardContent className="p-4 sm:p-6 lg:p-8">
                <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-4 sm:space-y-6 lg:space-y-0 lg:space-x-8">
                  <div className="flex-shrink-0 self-center lg:self-auto">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl sm:text-3xl font-bold shadow-lg">
                      {extendedProfile.avatar_url ? (
                        <img
                          src={extendedProfile.avatar_url}
                          alt="Profile Avatar"
                          className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover"
                        />
                      ) : (
                        getUserName().charAt(0).toUpperCase()
                      )}
                    </div>
                  </div>

                  <div className="flex-1 space-y-3 sm:space-y-4 text-center lg:text-left">
                    <div>
                      <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                        {getUserName()}
                      </h3>
                      {extendedProfile.bio && (
                        <p className="text-gray-600 mt-2 text-sm sm:text-base">
                          {extendedProfile.bio}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      {extendedProfile.company && (
                        <div className="flex items-center justify-center lg:justify-start text-gray-600 text-sm sm:text-base">
                          <Building className="w-4 h-4 mr-2" />
                          <span className="truncate">
                            {extendedProfile.position} at{" "}
                            {extendedProfile.company}
                          </span>
                        </div>
                      )}
                      {extendedProfile.location && (
                        <div className="flex items-center justify-center lg:justify-start text-gray-600 text-sm sm:text-base">
                          <MapPin className="w-4 h-4 mr-2" />
                          <span className="truncate">
                            {extendedProfile.location}
                          </span>
                        </div>
                      )}
                    </div>

                    {extendedProfile.skills &&
                      extendedProfile.skills.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-2">
                            Skills & Expertise:
                          </p>
                          <div className="flex flex-wrap justify-center lg:justify-start gap-2">
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

                  <div className="flex-shrink-0 w-full lg:w-auto">
                    <Button
                      onClick={() => (window.location.href = "/profile")}
                      className="w-full lg:w-auto bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 border-0"
                    >
                      Edit Profile
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}{" "}
        {/* Success Tips for New Users */}
        {stats.total_ideas === 0 && (
          <div>
            {" "}
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center">
              <Target className="w-6 h-6 mr-2 sm:mr-3" />
              Your Innovation Journey
            </h2>
            <Card className="border-0 shadow-lg bg-gradient-to-r from-emerald-50 to-teal-50">
              <CardContent className="p-4 sm:p-6 lg:p-8">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8">
                  <div>
                    {" "}
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">
                      <div className="flex items-center">
                        <Rocket className="w-5 h-5 mr-2" />
                        Get Started in 3 Steps
                      </div>
                    </h3>
                    <div className="space-y-3 sm:space-y-4">
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
                          className="flex items-start space-x-3 sm:space-x-4"
                        >
                          <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full flex items-center justify-center text-xs sm:text-sm font-bold">
                            {item.step}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 text-sm sm:text-base">
                              {item.title}
                            </p>
                            <p className="text-gray-600 text-xs sm:text-sm mt-1">
                              {item.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    {" "}
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">
                      <div className="flex items-center">
                        <Lightbulb className="w-5 h-5 mr-2" />
                        Pro Tips for Success
                      </div>
                    </h3>
                    <div className="space-y-2 sm:space-y-3">
                      {[
                        "Be specific about the problem your idea solves",
                        "Include comprehensive market research and analysis",
                        "Add supporting documents and prototypes",
                        "Keep your profile updated and professional",
                        "Engage actively with the investor community",
                      ].map((tip, index) => (
                        <div key={index} className="flex items-start space-x-3">
                          <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700 text-xs sm:text-sm">
                            {tip}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 sm:mt-6 space-y-3">
                      {" "}
                      <Button
                        onClick={() =>
                          (window.location.href = "/my-ideas?create=true")
                        }
                        className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 border-0"
                      >
                        <Rocket className="w-4 h-4 mr-2" />
                        Start Your Journey
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => (window.location.href = "/ai-generator")}
                        className="w-full bg-white/80 border-gray-200 hover:bg-white hover:shadow-md"
                      >
                        <Bot className="w-4 h-4 mr-2" />
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
