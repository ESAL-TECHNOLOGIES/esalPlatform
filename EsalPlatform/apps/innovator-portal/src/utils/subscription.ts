// Utility functions for subscription management and feature access
export interface SubscriptionLimits {
  ideas_per_month: number;
  ai_matching: boolean;
  premium_features: boolean;
}

// Mock subscription data - replace with actual subscription logic
const mockSubscription: SubscriptionLimits = {
  ideas_per_month: 10,
  ai_matching: true,
  premium_features: true,
};

let currentUsage = {
  ideas_this_month: 0,
};

export const checkAndConsumeUsage = (
  limitType: keyof SubscriptionLimits,
  onLimitReached: () => void
): boolean => {
  switch (limitType) {
    case "ideas_per_month":
      if (currentUsage.ideas_this_month >= mockSubscription.ideas_per_month) {
        onLimitReached();
        return false;
      }
      currentUsage.ideas_this_month += 1;
      return true;
    default:
      return true;
  }
};

export const requireFeature = (
  feature: keyof SubscriptionLimits,
  onFeatureRequired: () => void
): boolean => {
  if (!mockSubscription[feature]) {
    onFeatureRequired();
    return false;
  }
  return true;
};

export const getSubscriptionLimits = (): SubscriptionLimits => {
  return mockSubscription;
};

export const getCurrentUsage = () => {
  return currentUsage;
};
