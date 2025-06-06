import React from "react";
import { TrendingUp, Zap, Star, Brain, Eye } from "lucide-react";
import { useSubscription } from "../contexts/SubscriptionContext";

interface UsageTrackerProps {
  className?: string;
  showDetails?: boolean;
}

const UsageTracker: React.FC<UsageTrackerProps> = ({
  className = "",
  showDetails = true,
}) => {
  const { subscription, checkUsageLimit } = useSubscription();

  if (!subscription) {
    return null;
  }

  const features = [
    { key: "ai_generations", label: "AI Generations", icon: Brain },
    { key: "idea_views", label: "Idea Views", icon: Eye },
    { key: "premium_features", label: "Premium Features", icon: Star },
    {
      key: "advanced_analytics",
      label: "Advanced Analytics",
      icon: TrendingUp,
    },
  ];

  const getUsageData = () => {
    return features
      .map((feature) => {
        const usage = checkUsageLimit(feature.key);
        return {
          ...feature,
          used: usage.used || 0,
          limit: usage.limit || 0,
          remaining: usage.remaining || 0,
          unlimited: usage.limit === 0,
          percentage:
            usage.limit > 0 ? Math.round((usage.used / usage.limit) * 100) : 0,
        };
      })
      .filter((f) => f.limit > 0 || f.used > 0); // Only show features with limits or usage
  };

  const usageData = getUsageData();

  if (usageData.length === 0) {
    return (
      <div
        className={`bg-green-50 border border-green-200 rounded-lg p-4 ${className}`}
      >
        <div className="flex items-center">
          <Zap className="h-5 w-5 text-green-600 mr-2" />
          <span className="text-green-800 font-medium">
            {subscription.plan.name} Plan - Unlimited Usage
          </span>
        </div>
      </div>
    );
  }
  if (!showDetails) {
    // Compact view - just show overall usage status
    const totalUsage =
      usageData.reduce((acc, item) => acc + item.percentage, 0) /
      usageData.length;
    const getStatusStyles = () => {
      if (totalUsage > 80)
        return {
          bg: "bg-red-50",
          border: "border-red-200",
          text: "text-red-800",
          icon: "text-red-600",
          subtext: "text-red-700",
        };
      if (totalUsage > 60)
        return {
          bg: "bg-yellow-50",
          border: "border-yellow-200",
          text: "text-yellow-800",
          icon: "text-yellow-600",
          subtext: "text-yellow-700",
        };
      return {
        bg: "bg-green-50",
        border: "border-green-200",
        text: "text-green-800",
        icon: "text-green-600",
        subtext: "text-green-700",
      };
    };

    const styles = getStatusStyles();

    return (
      <div
        className={`${styles.bg} ${styles.border} rounded-lg p-3 ${className}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <TrendingUp className={`h-4 w-4 ${styles.icon} mr-2`} />
            <span className={`${styles.text} font-medium text-sm`}>
              {Math.round(totalUsage)}% Usage
            </span>
          </div>
          <span className={`${styles.subtext} text-xs`}>
            {subscription.plan.name}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Usage Tracker</h3>
        <span className="text-sm text-gray-500">
          {subscription.plan.name} Plan
        </span>
      </div>

      <div className="space-y-4">
        {usageData.map((item) => {
          const Icon = item.icon;
          const isNearLimit = item.percentage > 80;
          const isAtLimit = item.percentage >= 100;

          return (
            <div key={item.key} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Icon className="h-4 w-4 text-gray-600 mr-2" />
                  <span className="text-sm font-medium text-gray-700">
                    {item.label}
                  </span>
                </div>
                <span
                  className={`text-sm ${
                    isAtLimit
                      ? "text-red-600"
                      : isNearLimit
                        ? "text-yellow-600"
                        : "text-gray-600"
                  }`}
                >
                  {item.used} / {item.limit}
                </span>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    isAtLimit
                      ? "bg-red-500"
                      : isNearLimit
                        ? "bg-yellow-500"
                        : "bg-green-500"
                  }`}
                  style={{ width: `${Math.min(item.percentage, 100)}%` }}
                />
              </div>

              {item.remaining > 0 && (
                <p className="text-xs text-gray-500">
                  {item.remaining} remaining this month
                </p>
              )}

              {isAtLimit && (
                <p className="text-xs text-red-600 font-medium">
                  Limit reached - upgrade to continue
                </p>
              )}
            </div>
          );
        })}
      </div>

      {usageData.some((item) => item.percentage > 60) && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Need more usage?</span>
            <button
              onClick={() => (window.location.href = "/subscription")}
              className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
            >
              Upgrade Plan
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsageTracker;
