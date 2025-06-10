import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent, Button } from "@esal/ui";
import {
  User,
  Edit3,
  X,
  MapPin,
  Building2,
  DollarSign,
  Target,
  BarChart3,
  Calendar,
  Globe,
  Linkedin,
  Twitter,
  TrendingUp,
  Award,
  Briefcase,
  Mail,
  Phone,
  CheckCircle2,
  AlertCircle,
  XCircle,
} from "lucide-react";

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
              <X className="w-5 h-5" />
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

  const getStatusIcon = () => {
    if (profile.is_blocked) return <XCircle className="h-4 w-4" />;
    if (!profile.is_active) return <AlertCircle className="h-4 w-4" />;
    return <CheckCircle2 className="h-4 w-4" />;
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
    <Card className="overflow-hidden shadow-xl border-0">
      {/* Cover/Background with emerald/teal theming */}
      <div className="h-32 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 relative">
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        <Button
          onClick={onEdit}
          variant="secondary"
          size="sm"
          className="absolute top-4 right-4 bg-white bg-opacity-90 hover:bg-opacity-100 flex items-center space-x-2 shadow-lg"
        >
          <Edit3 className="h-4 w-4" />
          <span>Edit</span>
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
                <div className="w-full h-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
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
          </div>{" "}
          {/* Status badge */}
          <div className="ml-4 mb-2">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border space-x-1 ${getStatusColor()}`}
            >
              {getStatusIcon()}
              <span>{getStatusText()}</span>
            </span>
          </div>
        </div>

        {/* Profile Info */}
        <div className="space-y-4">
          {" "}
          {/* Name and Title */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {profile.full_name || "No name provided"}
            </h2>
            <div className="flex items-center space-x-2 mt-1">
              <Briefcase className="h-4 w-4 text-blue-600" />
              <p className="text-gray-600 font-medium capitalize">
                {profile.role} Investor
              </p>
            </div>
            <div className="flex items-center space-x-2 mt-1">
              <Mail className="h-4 w-4 text-gray-400" />
              <p className="text-gray-500 text-sm">{profile.email}</p>
            </div>
          </div>{" "}
          {/* Bio */}
          {profile.bio && (
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <User className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">About</span>
              </div>
              <p className="text-gray-700 leading-relaxed">{profile.bio}</p>
            </div>
          )}
          {/* Location */}
          {profile.location && (
            <div className="flex items-center text-gray-600 space-x-2">
              <MapPin className="h-4 w-4 text-blue-600" />
              <span>{profile.location}</span>
            </div>
          )}
          {/* Company */}
          {profile.company && (
            <div className="flex items-center text-gray-600 space-x-2">
              <Building2 className="h-4 w-4 text-blue-600" />
              <span>
                {profile.company} {profile.position && `• ${profile.position}`}
              </span>
            </div>
          )}
          {/* Phone */}
          {profile.phone && (
            <div className="flex items-center text-gray-600 space-x-2">
              <Phone className="h-4 w-4 text-blue-600" />
              <span>{profile.phone}</span>
            </div>
          )}{" "}
          {/* Investment Focus */}
          {profile.investment_focus && profile.investment_focus.length > 0 && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Target className="h-4 w-4 text-blue-600" />
                <h4 className="text-sm font-medium text-gray-700">
                  Investment Focus
                </h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.investment_focus.slice(0, 5).map((focus, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded-full font-medium"
                  >
                    {focus}
                  </span>
                ))}
                {profile.investment_focus.length > 5 && (
                  <span className="text-xs text-gray-500 px-2 py-1">
                    +{profile.investment_focus.length - 5} more
                  </span>
                )}
              </div>
            </div>
          )}
          {/* Investment Range */}
          {(profile.investment_range_min || profile.investment_range_max) && (
            <div className="flex items-center text-gray-600 space-x-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span>
                Investment Range: $
                {profile.investment_range_min?.toLocaleString() || "0"} - $
                {profile.investment_range_max?.toLocaleString() || "unlimited"}
              </span>
            </div>
          )}{" "}
          {/* Portfolio Stats */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div className="text-center p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
              <div className="flex items-center justify-center mb-1">
                <BarChart3 className="h-4 w-4 text-blue-600" />
              </div>
              <div className="text-lg font-bold text-blue-600">
                {profile.total_investments || 0}
              </div>
              <div className="text-sm text-gray-600">Investments</div>
            </div>
            <div className="text-center p-3 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
              <div className="flex items-center justify-center mb-1">
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
              <div className="text-lg font-bold text-green-600">
                {profile.portfolio_size || 0}
              </div>
              <div className="text-sm text-gray-600">Portfolio Size</div>
            </div>
            <div className="text-center p-3 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg">
              <div className="flex items-center justify-center mb-1">
                <Award className="h-4 w-4 text-purple-600" />
              </div>
              <div className="text-lg font-bold text-purple-600">
                {profile.experience_years || 0}
              </div>
              <div className="text-sm text-gray-600">Years Experience</div>
            </div>
          </div>{" "}
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
                  className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors bg-blue-50 px-3 py-2 rounded-lg"
                >
                  <Globe className="h-4 w-4" />
                  <span>Website</span>
                </a>
              )}
              {profile.linkedin_url && (
                <a
                  href={profile.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors bg-blue-50 px-3 py-2 rounded-lg"
                >
                  <Linkedin className="h-4 w-4" />
                  <span>LinkedIn</span>
                </a>
              )}
              {profile.twitter_url && (
                <a
                  href={profile.twitter_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors bg-blue-50 px-3 py-2 rounded-lg"
                >
                  <Twitter className="h-4 w-4" />
                  <span>Twitter</span>
                </a>
              )}
            </div>
          )}
          {/* Member Since */}
          <div className="pt-4 border-t">
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Calendar className="h-4 w-4" />
              <span>Member since {formatDate(profile.created_at)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const Profile: React.FC = () => {
  const navigate = useNavigate();
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
      const token = localStorage.getItem("access_token");      if (!token) return;

      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
      const response = await fetch(
        `${apiUrl}/api/v1/investor/profile`,
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
      if (!token) {        throw new Error("Authentication required");
      }

      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
      const response = await fetch(
        `${apiUrl}/api/v1/investor/profile`,
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
      </div>{" "}
      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle2 size={16} className="text-green-600 mr-2 stroke-2" />
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
                {" "}
                {profile.is_blocked && (
                  <div className="p-4 bg-red-50 rounded-lg">
                    <p className="text-sm text-red-700 flex items-center">
                      <AlertCircle size={16} className="mr-2 stroke-2" />
                      Your account has been blocked. Please contact support.
                    </p>
                  </div>
                )}
                {!profile.is_active && (
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <p className="text-sm text-yellow-700 flex items-center">
                      <AlertCircle size={16} className="mr-2 stroke-2" />
                      Your account is inactive. Please contact support.
                    </p>
                  </div>
                )}
                {profile.is_active && !profile.is_blocked && (
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-700 flex items-center">
                      <CheckCircle2 size={16} className="mr-2 stroke-2" />
                      Your account is active and ready for investing.
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
              <div className="space-y-3">                <Button
                  className="w-full"
                  onClick={() => navigate("/matching")}
                >
                  Update Investment Preferences
                </Button>                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate("/startups")}
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
          </div>{" "}
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle size={16} className="text-red-600 mr-2 stroke-2" />
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
