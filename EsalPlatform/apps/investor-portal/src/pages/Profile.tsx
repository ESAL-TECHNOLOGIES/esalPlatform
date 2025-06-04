import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, Button } from "@esal/ui";

interface InvestorProfile {
  id: string;
  email: string;
  username?: string;
  full_name?: string;
  role: string;
  bio?: string;
  location?: string;
  company?: string;
  position?: string;
  investment_focus?: string[];
  investment_range_min?: number;
  investment_range_max?: number;
  website_url?: string;
  linkedin_url?: string;
  twitter_url?: string;
  phone?: string;
  avatar_url?: string;
  experience_years?: number;
  total_investments?: number;
  portfolio_size?: number;
  is_active: boolean;
  is_blocked: boolean;
  created_at: string;
  updated_at: string;
}

// Modal component for editing profile
const Modal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>{" "}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-colors"
              aria-label="Close modal"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
        <div className="px-6 py-4">{children}</div>
      </div>
    </div>
  );
};

// Profile Card component with circular avatar
const ProfileCard: React.FC<{
  profile: InvestorProfile;
  onEdit: () => void;
}> = ({ profile, onEdit }) => {
  const getInitials = (name?: string) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusColor = () => {
    if (profile.is_blocked) return "bg-red-100 text-red-800 border-red-200";
    if (!profile.is_active)
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    return "bg-green-100 text-green-800 border-green-200";
  };

  const getStatusText = () => {
    if (profile.is_blocked) return "Blocked";
    if (!profile.is_active) return "Inactive";
    return "Active";
  };

  const formatDate = (dateString: string): string => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  return (
    <Card className="overflow-hidden">
      {/* Cover/Background with emerald/teal theming */}
      <div className="h-32 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 relative">
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        <Button
          onClick={onEdit}
          variant="secondary"
          size="sm"
          className="absolute top-4 right-4 bg-white bg-opacity-90 hover:bg-opacity-100"
        >
          ✏️ Edit
        </Button>
      </div>

      <CardContent className="relative px-6 pb-6">
        {/* Avatar - circular like in innovator portal */}
        <div className="flex items-end -mt-16 mb-4">
          <div className="relative">
            <div className="w-24 h-24 rounded-full border-4 border-white bg-white shadow-lg flex items-center justify-center overflow-hidden">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.full_name || "Profile"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                  <span className="text-white text-xl font-bold">
                    {getInitials(profile.full_name || profile.email)}
                  </span>
                </div>
              )}
            </div>
            {/* Status indicator */}
            <div
              className={`absolute bottom-1 right-1 w-6 h-6 rounded-full border-2 border-white ${
                profile.is_active && !profile.is_blocked
                  ? "bg-green-400"
                  : "bg-gray-400"
              }`}
            ></div>
          </div>

          {/* Status badge */}
          <div className="ml-4 mb-2">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor()}`}
            >
              {getStatusText()}
            </span>
          </div>
        </div>

        {/* Profile Info */}
        <div className="space-y-4">
          {/* Name and Title */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {profile.full_name || "No name provided"}
            </h2>
            <p className="text-gray-600 font-medium capitalize">
              {profile.role} Investor
            </p>
            <p className="text-gray-500 text-sm">{profile.email}</p>
          </div>

          {/* Bio */}
          {profile.bio && (
            <div>
              <p className="text-gray-700 leading-relaxed">{profile.bio}</p>
            </div>
          )}

          {/* Location */}
          {profile.location && (
            <div className="flex items-center text-gray-600">
              <span className="mr-2">📍</span>
              <span>{profile.location}</span>
            </div>
          )}

          {/* Company */}
          {profile.company && (
            <div className="flex items-center text-gray-600">
              <span className="mr-2">🏢</span>
              <span>
                {profile.company} {profile.position && `• ${profile.position}`}
              </span>
            </div>
          )}

          {/* Investment Focus */}
          {profile.investment_focus && profile.investment_focus.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Investment Focus
              </h4>
              <div className="flex flex-wrap gap-2">
                {profile.investment_focus.slice(0, 5).map((focus, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 text-xs bg-emerald-100 text-emerald-800 rounded-full"
                  >
                    {focus}
                  </span>
                ))}
                {profile.investment_focus.length > 5 && (
                  <span className="text-xs text-gray-500">
                    +{profile.investment_focus.length - 5} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Investment Range */}
          {(profile.investment_range_min || profile.investment_range_max) && (
            <div className="flex items-center text-gray-600">
              <span className="mr-2">💰</span>
              <span>
                Investment Range: $
                {profile.investment_range_min?.toLocaleString() || "0"} - $
                {profile.investment_range_max?.toLocaleString() || "unlimited"}
              </span>
            </div>
          )}

          {/* Portfolio Stats */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-lg font-bold text-emerald-600">
                {profile.total_investments || 0}
              </div>
              <div className="text-sm text-gray-600">Investments</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-emerald-600">
                {profile.portfolio_size || 0}
              </div>
              <div className="text-sm text-gray-600">Portfolio Size</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-emerald-600">
                {profile.experience_years || 0}
              </div>
              <div className="text-sm text-gray-600">Years Experience</div>
            </div>
          </div>

          {/* Social Links */}
          {(profile.website_url ||
            profile.linkedin_url ||
            profile.twitter_url) && (
            <div className="flex space-x-4 pt-4 border-t">
              {profile.website_url && (
                <a
                  href={profile.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-600 hover:text-emerald-700"
                >
                  🌐 Website
                </a>
              )}
              {profile.linkedin_url && (
                <a
                  href={profile.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-600 hover:text-emerald-700"
                >
                  💼 LinkedIn
                </a>
              )}
              {profile.twitter_url && (
                <a
                  href={profile.twitter_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-600 hover:text-emerald-700"
                >
                  🐦 Twitter
                </a>
              )}
            </div>
          )}

          {/* Member Since */}
          <div className="pt-4 border-t">
            <p className="text-sm text-gray-500">
              Member since {formatDate(profile.created_at)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const Profile: React.FC = () => {
  const [profile, setProfile] = useState<InvestorProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<InvestorProfile>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);
  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) return;

      const response = await fetch(
        "http://localhost:8000/api/v1/investor/profile",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (response.ok) {
        const profileData = await response.json();
        setProfile(profileData.profile);
        setFormData(profileData.profile);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setIsLoading(false);
    }
  };
  const handleUpdateProfile = async () => {
    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(
        "http://localhost:8000/api/v1/investor/profile",
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to update profile");
      }

      const updatedProfile = await response.json();
      setProfile(updatedProfile.profile);
      setIsEditModalOpen(false);
      setSuccessMessage("Profile updated successfully!");

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (error) {
      console.error("Error updating profile:", error);
      setError(
        error instanceof Error ? error.message : "Failed to update profile"
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading profile...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Profile not found</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {" "}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-600">
          Manage your investor profile and preferences.
        </p>
      </div>
      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <span className="text-green-600 mr-2">✅</span>
            <span className="text-green-700 text-sm font-medium">
              {successMessage}
            </span>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-2">
          <ProfileCard
            profile={profile}
            onEdit={() => setIsEditModalOpen(true)}
          />
        </div>

        {/* Quick Stats & Actions */}
        <div className="space-y-6">
          {/* Account Status */}
          <Card>
            <CardHeader>
              <CardTitle>Account Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {profile.is_blocked && (
                  <div className="p-4 bg-red-50 rounded-lg">
                    <p className="text-sm text-red-700">
                      ⚠️ Your account has been blocked. Please contact support.
                    </p>
                  </div>
                )}
                {!profile.is_active && (
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <p className="text-sm text-yellow-700">
                      ⚠️ Your account is inactive. Please contact support.
                    </p>
                  </div>
                )}
                {profile.is_active && !profile.is_blocked && (
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-700">
                      ✅ Your account is active and ready for investing.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button
                  className="w-full"
                  onClick={() => (window.location.href = "/matching")}
                >
                  Update Investment Preferences
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => (window.location.href = "/startups")}
                >
                  Browse Startups
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setIsEditModalOpen(true)}
                >
                  Edit Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      {/* Edit Profile Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Profile"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>{" "}
            <input
              type="text"
              value={formData.full_name || ""}
              onChange={(e) =>
                setFormData({ ...formData, full_name: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bio
            </label>
            <textarea
              value={formData.bio || ""}
              onChange={(e) =>
                setFormData({ ...formData, bio: e.target.value })
              }
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Tell us about your investment philosophy and interests..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>{" "}
            <input
              type="text"
              value={formData.location || ""}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Enter your location"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company
            </label>{" "}
            <input
              type="text"
              value={formData.company || ""}
              onChange={(e) =>
                setFormData({ ...formData, company: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Enter your company name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Position
            </label>{" "}
            <input
              type="text"
              value={formData.position || ""}
              onChange={(e) =>
                setFormData({ ...formData, position: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Enter your position/title"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Min Investment
              </label>{" "}
              <input
                type="number"
                value={formData.investment_range_min || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    investment_range_min: parseInt(e.target.value),
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Min amount"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Investment
              </label>{" "}
              <input
                type="number"
                value={formData.investment_range_max || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    investment_range_max: parseInt(e.target.value),
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Max amount"
              />
            </div>{" "}
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <span className="text-red-600 mr-2">⚠️</span>
                <span className="text-red-700 text-sm font-medium">
                  {error}
                </span>
              </div>
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            {" "}
            <Button
              onClick={handleUpdateProfile}
              disabled={isSaving}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsEditModalOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Profile;
