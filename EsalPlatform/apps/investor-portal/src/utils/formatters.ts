// Utility functions for formatting data in the investor portal

export const formatCurrency = (amount: string | number): string => {
  const numAmount =
    typeof amount === "string"
      ? parseFloat(amount.replace(/[^0-9.-]+/g, ""))
      : amount;

  if (isNaN(numAmount)) return amount.toString();

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numAmount);
};

export const formatCompactCurrency = (amount: string | number): string => {
  const numAmount =
    typeof amount === "string"
      ? parseFloat(amount.replace(/[^0-9.-]+/g, ""))
      : amount;

  if (isNaN(numAmount)) return amount.toString();

  if (numAmount >= 1000000000) {
    return `$${(numAmount / 1000000000).toFixed(1)}B`;
  } else if (numAmount >= 1000000) {
    return `$${(numAmount / 1000000).toFixed(1)}M`;
  } else if (numAmount >= 1000) {
    return `$${(numAmount / 1000).toFixed(1)}K`;
  }

  return formatCurrency(numAmount);
};

export const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  } catch {
    return dateString;
  }
};

export const formatRelativeDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;

    return `${Math.floor(diffInDays / 365)} years ago`;
  } catch {
    return dateString;
  }
};

export const formatPercentage = (value: string | number): string => {
  const numValue =
    typeof value === "string"
      ? parseFloat(value.replace(/[^0-9.-]+/g, ""))
      : value;

  if (isNaN(numValue)) return value.toString();

  return `${numValue.toFixed(1)}%`;
};

export const getMatchScoreColor = (score: number): string => {
  if (score >= 90) return "text-green-600";
  if (score >= 80) return "text-yellow-600";
  if (score >= 70) return "text-orange-600";
  return "text-gray-600";
};

export const getStatusColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case "growing":
      return "bg-green-100 text-green-800";
    case "stable":
      return "bg-yellow-100 text-yellow-800";
    case "declining":
      return "bg-red-100 text-red-800";
    case "exited":
      return "bg-blue-100 text-blue-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};
