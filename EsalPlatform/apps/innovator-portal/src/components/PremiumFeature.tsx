import React from "react";

interface PremiumFeatureProps {
  feature?: string;
  requiredPlan?: "basic" | "advanced";
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showUpgradePrompt?: boolean;
  className?: string;
}

const PremiumFeature: React.FC<PremiumFeatureProps> = ({
  children,
  className = "",
}) => {
  // Simplified: just render children without subscription logic
  return <div className={className}>{children}</div>;
};

export default PremiumFeature;

interface PremiumFeatureProps {
  feature?: string;
  requiredPlan?: "basic" | "advanced";
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showUpgradePrompt?: boolean;
  className?: string;
}

const PremiumFeature: React.FC<PremiumFeatureProps> = ({
  feature,
  requiredPlan,
  children,
  fallback,
  showUpgradePrompt = true,
  className = "",
}) => {
  const { hasAccess, canUseFeature, usageInfo, isFreePlan, navigateToUpgrade } =
    useSubscriptionGuard({
      feature,
      requiredPlan,
    });

  // If user doesn't have access to the feature at all
  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }

    if (!showUpgradePrompt) {
      return null;
    }

    return (
      <div
        className={`bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-dashed border-purple-200 rounded-lg p-6 text-center ${className}`}
      >
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <Crown className="h-12 w-12 text-purple-500" />
            <Lock className="h-6 w-6 text-purple-600 absolute -bottom-1 -right-1 bg-white rounded-full p-1" />
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Premium Feature
            </h3>
            <p className="text-gray-600 mb-4">
              {requiredPlan === "advanced"
                ? "This feature requires an Advanced plan subscription"
                : "This feature requires a paid subscription"}
            </p>
          </div>

          <Link
            to="/subscription"
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 transform hover:scale-105"
          >
            <Zap className="h-4 w-4 mr-2" />
            {isFreePlan() ? "Upgrade Now" : "Change Plan"}
          </Link>
        </div>
      </div>
    );
  }

  // If user has access but has reached usage limit
  if (feature && !canUseFeature) {
    if (fallback) {
      return <>{fallback}</>;
    }

    if (!showUpgradePrompt) {
      return null;
    }

    return (
      <div
        className={`bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-dashed border-yellow-200 rounded-lg p-6 text-center ${className}`}
      >
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <Zap className="h-12 w-12 text-yellow-500" />
            <Lock className="h-6 w-6 text-yellow-600 absolute -bottom-1 -right-1 bg-white rounded-full p-1" />
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Usage Limit Reached
            </h3>
            <p className="text-gray-600 mb-2">
              You've used all {usageInfo?.limit} of your monthly allowance for
              this feature.
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Upgrade to get more usage or wait until next month.
            </p>
          </div>

          <button
            onClick={navigateToUpgrade}
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-yellow-600 to-orange-600 text-white font-medium rounded-lg hover:from-yellow-700 hover:to-orange-700 transition-all duration-200 transform hover:scale-105"
          >
            <Crown className="h-4 w-4 mr-2" />
            Upgrade Plan
          </button>
        </div>
      </div>
    );
  }

  // User has access and can use the feature
  return <div className={className}>{children}</div>;
};

export default PremiumFeature;
