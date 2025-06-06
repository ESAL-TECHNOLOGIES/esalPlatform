import React from "react";
import { Link } from "react-router-dom";
import { useSubscription } from "../contexts/SubscriptionContext";

interface PremiumFeatureWrapperProps {
  feature: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showUpgradePrompt?: boolean;
  upgradeMessage?: string;
}

const PremiumFeatureWrapper: React.FC<PremiumFeatureWrapperProps> = ({
  feature,
  children,
  fallback,
  showUpgradePrompt = true,
  upgradeMessage,
}) => {
  const { checkFeatureAccess, subscription } = useSubscription();

  const hasAccess = checkFeatureAccess(feature);

  if (hasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (!showUpgradePrompt) {
    return null;
  }

  const defaultMessage =
    upgradeMessage ||
    `This feature requires a ${
      subscription?.plan.name.toLowerCase() === "free" ? "paid" : "higher tier"
    } subscription.`;

  return (
    <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
      <div className="max-w-md mx-auto">
        <div className="mb-4">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Premium Feature
        </h3>
        <p className="text-gray-600 mb-4">{defaultMessage}</p>
        <Link
          to="/subscription"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Upgrade Subscription
        </Link>
      </div>
    </div>
  );
};

export default PremiumFeatureWrapper;
