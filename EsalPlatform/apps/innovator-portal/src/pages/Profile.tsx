import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, Button } from "@esal/ui";
import { Lightbulb, Eye, Heart, AlertTriangle, RefreshCw, HelpCircle, User, Edit2, Link, Save, BarChart3, CheckCircle, XCircle, Zap, Lock, Mail, Camera, Package } from "lucide-react";
import ProfileCard from "../components/ProfileCard";
import { API_BASE_URL } from "../config/api";

interface UserProfile {
  id: string;
  email: string;
  username?: string;
  full_name?: string;
  role: string;
  bio?: string;
  location?: string;
  company?: string;
  position?: string;
  skills?: string[];
  interests?: string[];
  website_url?: string;
  linkedin_url?: string;
  twitter_url?: string;
  github_url?: string;
  phone?: string;
  avatar_url?: string;
  experience_years?: number;
  education?: string;
  total_ideas: number;
  total_views: number;
  total_interests: number;
  is_active: boolean;
  is_blocked: boolean;
  created_at: string;
  updated_at: string;
}

interface ProfileStats {
  total_ideas: number;
  total_views: number;
  total_interests: number;
}

// Enhanced Modal component for profile management features
const Modal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title: React.ReactNode;
  children: React.ReactNode;
}> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
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

// Enhanced Toggle Switch component
const Toggle: React.FC<{
  checked: boolean;
  onChange: () => void;
  label: string;
}> = ({ checked, onChange, label }) => {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-gray-700">{label}</span>{" "}
      <button
        type="button"
        onClick={onChange}
        className={`${
          checked ? "bg-blue-600" : "bg-gray-200"
        } relative inline-flex items-center h-6 rounded-full w-11 transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 hover:shadow-md`}
        aria-label={`Toggle ${label}`}
      >
        <span className="sr-only">Toggle {label}</span>
        <span
          className={`${
            checked ? "translate-x-6" : "translate-x-1"
          } inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-200 ease-in-out shadow-sm`}
        />
      </button>
    </div>
  );
};

const Profile: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<ProfileStats>({
    total_ideas: 0,
    total_views: 0,
    total_interests: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    username: "",
    full_name: "",
    bio: "",
    location: "",
    company: "",
    position: "",
    website_url: "",
    linkedin_url: "",
    twitter_url: "",
    github_url: "",
    phone: "",
    skills: [] as string[],
    interests: [] as string[],
    experience_years: 0,
    education: "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Modal states
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  // Notifications state
  const [notifications, setNotifications] = useState({
    emailUpdates: true,
    pushNotifications: false,
    weeklyDigest: true,
    investorInterest: true,
    systemAlerts: false,
  });
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  // Export state
  const [exportLoading, setExportLoading] = useState(false);

  // Avatar upload state
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);
  const fetchProfile = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("Authentication required");
      }      // Fetch profile data
      const profileResponse = await fetch(
        `${API_BASE_URL}/api/v1/innovator/profile`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!profileResponse.ok) {
        throw new Error("Failed to fetch profile");
      }

      const profileData = await profileResponse.json();      // Also fetch dashboard stats
      const dashboardResponse = await fetch(
        `${API_BASE_URL}/api/v1/innovator/dashboard`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      let statsData = { total_ideas: 0, total_views: 0, total_interests: 0 };
      if (dashboardResponse.ok) {
        const dashboardData = await dashboardResponse.json();
        statsData = dashboardData.stats;
      }

      // Set profile data
      const profileInfo = profileData.profile;
      setProfile(profileInfo);
      setStats(statsData);

      // Update form data with current profile values
      setFormData({
        username: profileInfo.username || "",
        full_name: profileInfo.full_name || "",
        bio: profileInfo.bio || "",
        location: profileInfo.location || "",
        company: profileInfo.company || "",
        position: profileInfo.position || "",
        website_url: profileInfo.website_url || "",
        linkedin_url: profileInfo.linkedin_url || "",
        twitter_url: profileInfo.twitter_url || "",
        github_url: profileInfo.github_url || "",
        phone: profileInfo.phone || "",
        skills: profileInfo.skills || [],
        interests: profileInfo.interests || [],
        experience_years: profileInfo.experience_years || 0,
        education: profileInfo.education || "",
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred fetching profile"
      );
      console.error("Error fetching profile:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleSkillsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const skillsString = e.target.value;
    // Split by commas and trim each item
    const skillsArray = skillsString
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
    setFormData((prev) => ({
      ...prev,
      skills: skillsArray,
    }));
  };

  const handleInterestsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const interestsString = e.target.value;
    // Split by commas and trim each item
    const interestsArray = interestsString
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
    setFormData((prev) => ({
      ...prev,
      interests: interestsArray,
    }));
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setFormError(null);

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("Authentication required");
      }      const response = await fetch(
        `${API_BASE_URL}/api/v1/innovator/profile`,
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

      const result = await response.json();
      setProfile(result.profile);
      setIsEditing(false);
      setSuccessMessage("Profile updated successfully!");

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      setFormError(
        err instanceof Error
          ? err.message
          : "An error occurred updating profile"
      );
      console.error("Error updating profile:", err);
    } finally {
      setIsSaving(false);
    }
  };

  // Change password handler
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordError("");

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("New password and confirmation do not match");
      setPasswordLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("Authentication required");
      }      const response = await fetch(
        `${API_BASE_URL}/api/v1/users/change-password`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            current_password: passwordData.currentPassword,
            new_password: passwordData.newPassword,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to change password");
      }

      // Password changed successfully
      setPasswordLoading(false);
      setShowChangePasswordModal(false);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setSuccessMessage("Password changed successfully!");

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      setPasswordError(
        err instanceof Error
          ? err.message
          : "An error occurred changing password"
      );
      console.error("Error changing password:", err);
    } finally {
      setPasswordLoading(false);
    }
  };

  // Notifications handler
  const handleNotificationsChange = async () => {
    setNotificationsLoading(true);

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("Authentication required");
      }      const response = await fetch(
        `${API_BASE_URL}/api/v1/users/notifications`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(notifications),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to update notifications");
      }

      setNotificationsLoading(false);
      setShowNotificationsModal(false);
      setSuccessMessage("Notification preferences updated successfully!");

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      console.error("Error updating notifications:", err);
    } finally {
      setNotificationsLoading(false);
    }
  };
  // Export data handler
  const handleExportData = async () => {
    setExportLoading(true);

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("Authentication required");
      }      const response = await fetch(
        `${API_BASE_URL}/api/v1/users/export`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to export data");
      }

      // Get the ZIP file as blob
      const blob = await response.blob();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      // Generate filename with timestamp
      const timestamp = new Date()
        .toISOString()
        .slice(0, 19)
        .replace(/[:-]/g, "");
      link.download = `esal_data_export_${timestamp}.zip`;

      // Trigger download
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      // Show success message
      setExportLoading(false);
      setShowExportModal(false);
      setSuccessMessage(
        "Data export completed successfully! Your ZIP file has been downloaded."
      );

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      console.error("Error exporting data:", err);
      setSuccessMessage("Failed to export data. Please try again.");
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } finally {
      setExportLoading(false);
    }
  };

  // Avatar upload handlers
  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setAvatarError("Please select an image file");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setAvatarError("File size must be less than 5MB");
        return;
      }

      setAvatarFile(file);
      setAvatarError("");

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) return;

    setAvatarUploading(true);
    setAvatarError("");

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("Authentication required");
      }

      const formData = new FormData();
      formData.append("file", avatarFile);      const response = await fetch(
        `${API_BASE_URL}/api/v1/innovator/profile/avatar`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to upload avatar");
      }

      const result = await response.json();

      // Update profile with new avatar URL
      if (profile) {
        setProfile({
          ...profile,
          avatar_url: result.avatar_url,
        });
      }

      setShowAvatarModal(false);
      setAvatarFile(null);
      setAvatarPreview(null);
      setSuccessMessage("Profile picture updated successfully!");

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      setAvatarError(
        err instanceof Error
          ? err.message
          : "An error occurred uploading avatar"
      );
      console.error("Error uploading avatar:", err);
    } finally {
      setAvatarUploading(false);
    }
  };
  // Preview avatar image before upload - This function is now replaced by handleAvatarFileChange above

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600">Loading your profile information...</p>
        </div>
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent absolute top-0 left-0"></div>
          </div>
          <div className="text-center space-y-2">
            <p className="text-lg font-medium text-gray-700">Loading Profile</p>
            <p className="text-sm text-gray-500">
              Fetching your profile data and statistics...
            </p>
          </div>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600">
            There was a problem loading your profile.
          </p>
        </div>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="text-center py-12">            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="text-red-600 w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold text-red-900 mb-2">
              Profile Load Error
            </h3>
            <p className="text-red-700 mb-6">{error}</p>            <Button
              onClick={fetchProfile}
              className="bg-red-600 hover:bg-red-700"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  if (!profile) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600">Profile not found.</p>
        </div>
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="text-center py-12">            <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
              <HelpCircle className="text-yellow-600 w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold text-yellow-900 mb-2">
              Profile Not Found
            </h3>
            <p className="text-yellow-700 mb-6">
              Unable to find your profile information. This might be a temporary
              issue.
            </p>
            <Button
              onClick={fetchProfile}
              className="bg-yellow-600 hover:bg-yellow-700"            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }  return (
    <div className="space-y-6">
      {/* Enhanced Header with Gradient Background and Tabs */}
      <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border border-blue-200 rounded-2xl p-6 sm:p-8 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
          <div className="text-center sm:text-left">
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              My Profile
            </h1>
            <p className="text-gray-600 mt-2 text-base sm:text-lg">
              Manage your personal information and preferences
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="text-center sm:text-right">
              <p className="text-sm text-gray-500">Member since</p>
              <p className="text-sm font-medium text-gray-900">
                {new Date(profile.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                })}
              </p>
            </div>            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
              <User className="text-white w-6 h-6" />
            </div>
          </div>
        </div>
        
        {/* Profile Tabs */}
        <div className="mt-8 flex flex-wrap gap-2 justify-center sm:justify-start">
          <div className="flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium border border-blue-200">
            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
            Profile Overview
          </div>
          <div className="flex items-center px-4 py-2 bg-white text-gray-600 rounded-full text-sm border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer">
            <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
            Settings
          </div>
          <div className="flex items-center px-4 py-2 bg-white text-gray-600 rounded-full text-sm border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer">
            <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
            Privacy
          </div>
        </div>
      </div>      {/* Enhanced Success Message */}
      {successMessage && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <svg
                  className="h-5 w-5 text-green-600"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-green-800">Success!</h4>
              <p className="text-sm text-green-700">{successMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Profile Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 hover:shadow-lg transition-all duration-200 cursor-pointer group">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 group-hover:text-blue-700">
                  Total Ideas
                </p>
                <p className="text-2xl sm:text-3xl font-bold text-blue-900">
                  {stats.total_ideas}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Your innovative concepts
                </p>
              </div>              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <Lightbulb className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 hover:shadow-lg transition-all duration-200 cursor-pointer group">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 group-hover:text-green-700">
                  Total Views
                </p>
                <p className="text-2xl sm:text-3xl font-bold text-green-900">
                  {stats.total_views}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  Community engagement
                </p>
              </div>              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200 transition-colors">
                <Eye className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 hover:shadow-lg transition-all duration-200 cursor-pointer group sm:col-span-2 lg:col-span-1">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600 group-hover:text-purple-700">
                  Total Interests
                </p>
                <p className="text-2xl sm:text-3xl font-bold text-purple-900">
                  {stats.total_interests}
                </p>
                <p className="text-xs text-purple-600 mt-1">
                  Investor attention
                </p>
              </div>              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-full flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Profile Card - Takes up 2 columns on xl screens */}
        <div className="xl:col-span-2">
          <ProfileCard
            profile={profile}
            onEdit={() => setIsEditing(true)}
            showEditButton={!isEditing}
            ideasCount={stats.total_ideas}
            viewsCount={stats.total_views}
            interestsCount={stats.total_interests}
          />
        </div>

        {/* Sidebar - Takes up 1 column on xl screens */}
        <div className="space-y-6">
          {/* Enhanced Edit Form */}
          {isEditing && (
            <Card className="shadow-lg border-blue-200">
              <CardHeader>
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200 -mx-6 -mt-6 px-6 pt-6 pb-4 rounded-t-lg">                  <CardTitle>
                    <div className="text-blue-900 flex items-center">
                      <Edit2 className="w-4 h-4 mr-2" />
                      Edit Profile
                    </div>
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Username
                      </label>
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                        placeholder="Choose a username"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bio
                      <span className="text-gray-500 text-xs ml-1">
                        (Tell people about yourself)
                      </span>
                    </label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none text-sm"
                      placeholder="Tell us about yourself, your background, and your innovation interests..."
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Location
                      </label>
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                        placeholder="City, Country"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Company
                      </label>
                      <input
                        type="text"
                        name="company"
                        value={formData.company}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                        placeholder="Your company or organization"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Position
                      </label>
                      <input
                        type="text"
                        name="position"
                        value={formData.position}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                        placeholder="Your job title or role"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Years of Experience
                      </label>
                      <input
                        type="number"
                        name="experience_years"
                        value={formData.experience_years}
                        onChange={handleInputChange}
                        min="0"
                        max="50"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                        placeholder="Years of experience"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Education
                    </label>
                    <input
                      type="text"
                      name="education"
                      value={formData.education}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                      placeholder="Your educational background"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Skills
                      <span className="text-gray-500 text-xs ml-1">
                        (comma separated)
                      </span>
                    </label>
                    <input
                      type="text"
                      value={formData.skills.join(", ")}
                      onChange={handleSkillsChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                      placeholder="e.g. JavaScript, React, AI, Machine Learning"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Interests
                      <span className="text-gray-500 text-xs ml-1">
                        (comma separated)
                      </span>
                    </label>
                    <input
                      type="text"
                      value={formData.interests.join(", ")}
                      onChange={handleInterestsChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                      placeholder="e.g. Healthcare, FinTech, Sustainability, IoT"
                    />
                  </div>

                  {/* Collapsible Social Links Section */}
                  <div className="border-t pt-4">
                    <details className="group">
                      <summary className="flex items-center justify-between cursor-pointer text-sm font-medium text-gray-900 mb-4 p-2 rounded-lg hover:bg-gray-50 transition-colors">                        <span className="flex items-center">
                          <Link className="w-4 h-4 mr-2" />
                          Social Links
                        </span>
                        <span className="transform group-open:rotate-180 transition-transform">
                          ▼
                        </span>
                      </summary>
                      <div className="space-y-4 pl-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Website URL
                          </label>
                          <input
                            type="url"
                            name="website_url"
                            value={formData.website_url}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                            placeholder="https://your-website.com"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            LinkedIn URL
                          </label>
                          <input
                            type="url"
                            name="linkedin_url"
                            value={formData.linkedin_url}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                            placeholder="https://linkedin.com/in/username"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Twitter URL
                          </label>
                          <input
                            type="url"
                            name="twitter_url"
                            value={formData.twitter_url}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                            placeholder="https://twitter.com/username"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            GitHub URL
                          </label>
                          <input
                            type="url"
                            name="github_url"
                            value={formData.github_url}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                            placeholder="https://github.com/username"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                            placeholder="+1 (555) 123-4567"
                          />
                        </div>
                      </div>
                    </details>
                  </div>

                  {formError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">                      <div className="flex items-center">
                        <AlertTriangle className="text-red-600 w-4 h-4 mr-2" />
                        <span className="text-red-700 text-sm font-medium">
                          Error: {formError}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col space-y-3 pt-6 border-t">
                    <Button
                      type="submit"
                      disabled={isSaving}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-base font-medium"
                    >
                      {isSaving ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Saving Changes...
                        </>
                      ) : (                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false);
                        setFormError(null);
                        // Reset form data to current profile values
                        setFormData({
                          username: profile.username || "",
                          full_name: profile.full_name || "",
                          bio: profile.bio || "",
                          location: profile.location || "",
                          company: profile.company || "",
                          position: profile.position || "",
                          website_url: profile.website_url || "",
                          linkedin_url: profile.linkedin_url || "",
                          twitter_url: profile.twitter_url || "",
                          github_url: profile.github_url || "",
                          phone: profile.phone || "",
                          skills: profile.skills || [],
                          interests: profile.interests || [],
                          experience_years: profile.experience_years || 0,
                          education: profile.education || "",
                        });
                      }}
                      className="w-full py-3 text-base"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}          {/* Enhanced Account Status */}
          <Card className="shadow-lg">
            <CardHeader>
              <div className="bg-gradient-to-r from-gray-50 to-slate-50 border-b border-gray-200 -mx-6 -mt-6 px-6 pt-6 pb-4 rounded-t-lg">
                <CardTitle>                  <div className="text-gray-900 flex items-center">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Account Status
                  </div>
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-3 sm:space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-gray-50 rounded-lg space-y-2 sm:space-y-0">
                  <span className="text-sm font-medium text-gray-700">
                    Status:
                  </span>
                  <span
                    className={`inline-flex items-center justify-center sm:justify-start px-4 py-2 text-sm font-medium rounded-full ${
                      profile.is_active && !profile.is_blocked
                        ? "bg-green-100 text-green-800 border border-green-200"
                        : "bg-red-100 text-red-800 border border-red-200"
                    }`}
                  >                    {profile.is_active && !profile.is_blocked
                      ? (<><CheckCircle className="w-4 h-4 inline mr-1" /> Active</>)
                      : (<><XCircle className="w-4 h-4 inline mr-1" /> Inactive</>)}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-gray-50 rounded-lg space-y-2 sm:space-y-0">
                  <span className="text-sm font-medium text-gray-700">
                    Account ID:
                  </span>
                  <span className="text-xs font-mono bg-white px-3 py-1 rounded border text-center sm:text-left">
                    {profile.id.substring(0, 8)}...
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-gray-50 rounded-lg space-y-2 sm:space-y-0">
                  <span className="text-sm font-medium text-gray-700">
                    Role:
                  </span>
                  <span className="text-sm font-medium text-blue-600 capitalize text-center sm:text-left">
                    {profile.role} Innovator
                  </span>
                </div>
              </div>

              {/* Enhanced Status Messages */}
              {profile.is_blocked && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">                  <div className="flex items-start">
                    <AlertTriangle className="text-red-600 w-5 h-5 mr-3 flex-shrink-0" />
                    <div>
                      <h4 className="text-red-800 font-medium mb-1">
                        Account Blocked
                      </h4>
                      <p className="text-sm text-red-700">
                        Your account has been blocked. Please contact support
                        for assistance.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              {!profile.is_active && !profile.is_blocked && (
                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">                  <div className="flex items-start">
                    <AlertTriangle className="text-yellow-600 w-5 h-5 mr-3 flex-shrink-0" />
                    <div>
                      <h4 className="text-yellow-800 font-medium mb-1">
                        Account Inactive
                      </h4>
                      <p className="text-sm text-yellow-700">
                        Your account is inactive. Please contact support to
                        reactivate your account.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              {profile.is_active && !profile.is_blocked && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">                  <div className="flex items-start">
                    <CheckCircle className="text-green-600 w-5 h-5 mr-3 flex-shrink-0" />
                    <div>
                      <h4 className="text-green-800 font-medium mb-1">
                        Account Active
                      </h4>
                      <p className="text-sm text-green-700">
                        Your account is active and you have full access to all
                        platform features.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>{/* Enhanced Quick Actions */}
          <Card className="shadow-lg">
            <CardHeader>
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-200 -mx-6 -mt-6 px-6 pt-6 pb-4 rounded-t-lg">
                <CardTitle>                  <div className="text-indigo-900 flex items-center">
                    <Zap className="w-4 h-4 mr-2" />
                    Quick Actions
                  </div>
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
                <Button
                  className="w-full text-left justify-start h-auto sm:h-14 bg-white hover:bg-red-50 border-red-200 hover:border-red-300 text-red-700 hover:text-red-800 transition-all duration-200 group p-3 sm:p-4"
                  variant="outline"
                  onClick={() => setShowChangePasswordModal(true)}
                >
                  <div className="flex items-center">                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-100 group-hover:bg-red-200 rounded-full flex items-center justify-center mr-3 flex-shrink-0 transition-colors">
                      <Lock className="text-red-600 w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-sm sm:text-base">Change Password</div>
                      <div className="text-xs text-red-600 mt-0.5">
                        Update your account security
                      </div>
                    </div>
                  </div>
                </Button>
                
                <Button
                  className="w-full text-left justify-start h-auto sm:h-14 bg-white hover:bg-blue-50 border-blue-200 hover:border-blue-300 text-blue-700 hover:text-blue-800 transition-all duration-200 group p-3 sm:p-4"
                  variant="outline"
                  onClick={() => setShowNotificationsModal(true)}
                >
                  <div className="flex items-center">                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 group-hover:bg-blue-200 rounded-full flex items-center justify-center mr-3 flex-shrink-0 transition-colors">
                      <Mail className="text-blue-600 w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-sm sm:text-base">Manage Notifications</div>
                      <div className="text-xs text-blue-600 mt-0.5">
                        Configure your preferences
                      </div>
                    </div>
                  </div>
                </Button>
                
                <Button
                  className="w-full text-left justify-start h-auto sm:h-14 bg-white hover:bg-purple-50 border-purple-200 hover:border-purple-300 text-purple-700 hover:text-purple-800 transition-all duration-200 group p-3 sm:p-4"
                  variant="outline"
                  onClick={() => setShowAvatarModal(true)}
                >
                  <div className="flex items-center">                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 group-hover:bg-purple-200 rounded-full flex items-center justify-center mr-3 flex-shrink-0 transition-colors">
                      <Camera className="text-purple-600 w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-sm sm:text-base">Update Avatar</div>
                      <div className="text-xs text-purple-600 mt-0.5">
                        Change your profile picture
                      </div>
                    </div>
                  </div>
                </Button>
                
                <Button
                  className="w-full text-left justify-start h-auto sm:h-14 bg-white hover:bg-green-50 border-green-200 hover:border-green-300 text-green-700 hover:text-green-800 transition-all duration-200 group p-3 sm:p-4"
                  variant="outline"
                  onClick={() => setShowExportModal(true)}
                >
                  <div className="flex items-center">                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 group-hover:bg-green-200 rounded-full flex items-center justify-center mr-3 flex-shrink-0 transition-colors">
                      <Package className="text-green-600 w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-sm sm:text-base">Export My Data</div>
                      <div className="text-xs text-green-600 mt-0.5">
                        Download your information
                      </div>
                    </div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>{" "}
      {/* Enhanced Change Password Modal */}
      <Modal
        isOpen={showChangePasswordModal}        onClose={() => setShowChangePasswordModal(false)}
        title={<><Lock className="w-4 h-4 mr-2" />Change Password</>}
      >
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h4 className="text-blue-800 font-medium mb-2">
              Password Requirements
            </h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• At least 8 characters long</li>
              <li>• Include uppercase and lowercase letters</li>
              <li>• Include at least one number</li>
              <li>• Include at least one special character</li>
            </ul>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Password
              </label>
              <input
                type="password"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    currentPassword: e.target.value,
                  })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                placeholder="Enter your current password"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <input
                type="password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    newPassword: e.target.value,
                  })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                placeholder="Enter a strong new password"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    confirmPassword: e.target.value,
                  })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                placeholder="Confirm your new password"
                required
              />
            </div>

            {passwordError && (              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertTriangle className="text-red-600 w-4 h-4 mr-2" />
                  <span className="text-red-700 text-sm font-medium">
                    Error: {passwordError}
                  </span>
                </div>
              </div>
            )}

            <div className="flex flex-col space-y-3 pt-4">
              <Button
                type="submit"
                disabled={passwordLoading}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-3 text-lg font-medium"
              >
                {passwordLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Changing Password...
                  </>                ) : (
                  <>
                    <Lock className="w-4 h-4 mr-2" />
                    Change Password
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowChangePasswordModal(false)}
                className="w-full py-3 text-lg"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </Modal>{" "}
      {/* Enhanced Manage Notifications Modal */}
      <Modal
        isOpen={showNotificationsModal}
        onClose={() => setShowNotificationsModal(false)}
        title={<><Mail className="w-4 h-4 mr-2" />Manage Notifications</>}
      >
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-blue-800 text-sm">
              Configure how you'd like to receive updates about your ideas,
              investor interest, and platform activity.
            </p>
          </div>

          <div className="space-y-4">
            <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Toggle
                checked={notifications.emailUpdates}
                onChange={() =>
                  setNotifications({
                    ...notifications,
                    emailUpdates: !notifications.emailUpdates,
                  })
                }
                label="Email Updates"
              />
              <p className="text-xs text-gray-500 mt-1 ml-0">
                Receive email notifications for important updates and activity
              </p>
            </div>

            <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Toggle
                checked={notifications.pushNotifications}
                onChange={() =>
                  setNotifications({
                    ...notifications,
                    pushNotifications: !notifications.pushNotifications,
                  })
                }
                label="Push Notifications"
              />
              <p className="text-xs text-gray-500 mt-1 ml-0">
                Receive instant browser notifications for real-time updates
              </p>
            </div>

            <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Toggle
                checked={notifications.weeklyDigest}
                onChange={() =>
                  setNotifications({
                    ...notifications,
                    weeklyDigest: !notifications.weeklyDigest,
                  })
                }
                label="Weekly Digest"
              />
              <p className="text-xs text-gray-500 mt-1 ml-0">
                Get a weekly summary of your ideas' performance and platform
                activity
              </p>
            </div>

            <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Toggle
                checked={notifications.investorInterest}
                onChange={() =>
                  setNotifications({
                    ...notifications,
                    investorInterest: !notifications.investorInterest,
                  })
                }
                label="Investor Interest Alerts"
              />
              <p className="text-xs text-gray-500 mt-1 ml-0">
                Get notified immediately when investors show interest in your
                ideas
              </p>
            </div>

            <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Toggle
                checked={notifications.systemAlerts}
                onChange={() =>
                  setNotifications({
                    ...notifications,
                    systemAlerts: !notifications.systemAlerts,
                  })
                }
                label="System Alerts"
              />
              <p className="text-xs text-gray-500 mt-1 ml-0">
                Receive notifications about system maintenance and important
                announcements
              </p>
            </div>
          </div>

          <div className="flex flex-col space-y-3 pt-6 border-t">
            <Button
              onClick={handleNotificationsChange}
              disabled={notificationsLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-medium"
            >
              {notificationsLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Saving Preferences...
                </>                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Preferences
                  </>
                )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowNotificationsModal(false)}
              className="w-full py-3 text-lg"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>{" "}
      {/* Enhanced Export Data Modal */}
      <Modal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        title={<><Package className="w-4 h-4 mr-2" />Export My Data</>}
      >
        <div className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="text-green-800 font-medium mb-2">
              What's included in your export:
            </h4>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Complete profile information</li>
              <li>• All your submitted ideas and descriptions</li>
              <li>• Ideas engagement analytics</li>
              <li>• Uploaded files and documents</li>
              <li>• Account activity history</li>
            </ul>
          </div>          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertTriangle className="text-blue-600 w-5 h-5 mr-3" />
              <div>
                <h4 className="text-blue-800 font-medium mb-1">
                  Export Process
                </h4>{" "}
                <p className="text-sm text-blue-700">
                  Your data will be compiled into a comprehensive ZIP file and
                  downloaded automatically to your device. The download will
                  start immediately after clicking the export button.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">            <div className="flex items-start">
              <AlertTriangle className="text-yellow-600 w-5 h-5 mr-3" />
              <div>
                <h4 className="text-yellow-800 font-medium mb-1">
                  Important Note
                </h4>{" "}
                <p className="text-sm text-yellow-700">
                  The ZIP file contains all your data in JSON format plus a
                  README file with instructions. File download URLs are included
                  for accessing your uploaded documents stored in our secure
                  cloud storage.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col space-y-3 pt-4">
            <Button
              onClick={handleExportData}
              disabled={exportLoading}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg font-medium"
            >
              {exportLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Preparing Export...
                </>                ) : (
                  <>
                    <Package className="w-4 h-4 mr-2" />
                    Export My Data
                  </>
                )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowExportModal(false)}
              className="w-full py-3 text-lg"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>{" "}
      {/* Enhanced Avatar Upload Modal */}
      <Modal
        isOpen={showAvatarModal}
        onClose={() => setShowAvatarModal(false)}
        title={<><Camera className="w-4 h-4 mr-2" />Update Avatar</>}
      >
        <div className="space-y-4">
          <div className="flex flex-col items-center">
            {avatarPreview ? (
              <div className="w-32 h-32 rounded-full overflow-hidden border border-gray-200 mb-4">
                <img
                  src={avatarPreview}
                  alt="Avatar Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-32 h-32 rounded-full bg-gray-100 border border-gray-200 mb-4 flex items-center justify-center">
                <span className="text-gray-400 text-3xl">📷</span>
              </div>
            )}
            <Button
              onClick={() => document.getElementById("avatar-upload")?.click()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-medium"
            >
              {avatarUploading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <span className="mr-2">⬆️</span>
                  Upload Avatar
                </>
              )}
            </Button>{" "}
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              onChange={handleAvatarFileChange}
              className="hidden"
              title="Upload Avatar Image"
            />
          </div>

          {avatarError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <span className="text-red-600 mr-2">⚠️</span>
                <span className="text-red-700 text-sm font-medium">
                  Error: {avatarError}
                </span>
              </div>
            </div>
          )}

          <div className="flex flex-col space-y-3 pt-4">
            <Button
              onClick={handleAvatarUpload}
              disabled={avatarUploading}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg font-medium"
            >
              {avatarUploading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Uploading Avatar...
                </>
              ) : (
                <>
                  <span className="mr-2">✅</span>
                  Save Avatar
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowAvatarModal(false)}
              className="w-full py-3 text-lg"
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
