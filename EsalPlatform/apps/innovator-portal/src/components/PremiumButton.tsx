import React from "react";
import { Crown, Lock } from "lucide-react";
import { useSubscriptionGuard } from "../hooks/useSubscriptionGuard";

interface PremiumButtonProps {
  feature?: string;
  requiredPlan?: "basic" | "advanced";
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  showUpgradeTooltip?: boolean;
}

const PremiumButton: React.FC<PremiumButtonProps> = ({
  feature,
  requiredPlan,
  onClick,
  children,
  className = "",
  disabled = false,
  showUpgradeTooltip = true,
}) => {
  const { hasAccess, canUseFeature, usageInfo, navigateToUpgrade } =
    useSubscriptionGuard({
      feature,
      requiredPlan,
    });

  const isDisabled = disabled || !hasAccess || (feature && !canUseFeature);

  const handleClick = () => {
    if (!hasAccess) {
      navigateToUpgrade();
      return;
    }

    if (feature && !canUseFeature) {
      navigateToUpgrade();
      return;
    }

    onClick();
  };

  const getTooltipText = () => {
    if (!hasAccess) {
      return requiredPlan === "advanced"
        ? "Requires Advanced plan"
        : "Requires paid subscription";
    }

    if (feature && !canUseFeature) {
      return `Usage limit reached (${usageInfo?.limit || 0}/month)`;
    }

    return "";
  };

  const tooltipText = getTooltipText();

  return (
    <div className="relative group">
      <button
        onClick={handleClick}
        disabled={disabled}
        className={`
          ${className}
          ${isDisabled ? "relative overflow-hidden" : ""}
          ${!hasAccess || (feature && !canUseFeature) ? "cursor-pointer" : ""}
        `}
      >
        {/* Premium overlay when access is restricted */}
        {!hasAccess && (
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 flex items-center justify-center backdrop-blur-sm rounded">
            <Crown className="h-4 w-4 text-purple-600" />
          </div>
        )}

        {/* Usage limit overlay */}
        {hasAccess && feature && !canUseFeature && (
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-600/20 to-orange-600/20 flex items-center justify-center backdrop-blur-sm rounded">
            <Lock className="h-4 w-4 text-yellow-600" />
          </div>
        )}

        {children}
      </button>

      {/* Tooltip */}
      {showUpgradeTooltip && tooltipText && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          <div className="bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
            {tooltipText}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PremiumButton;
