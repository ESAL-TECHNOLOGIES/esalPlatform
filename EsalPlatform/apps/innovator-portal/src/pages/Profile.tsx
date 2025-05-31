import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, Button } from "@esal/ui";
import ProfileCard from "../components/ProfileCard";

interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  role: string;
  bio?: string;
  location?: string;
  expertise?: string[];
  website?: string;
  linkedin?: string;
  twitter?: string;
  avatar_url?: string;
  is_active: boolean;
  is_blocked: boolean;
  created_at: string;
  updated_at: string;
}

interface ProfileStats {
  ideasCount: number;
  totalViews: number;
  totalInterests: number;
}

// Modal component for profile management features
const Modal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

// Toggle Switch component
const Toggle: React.FC<{
  checked: boolean;
  onChange: () => void;
  label: string;
}> = ({ checked, onChange, label }) => {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-700">{label}</span>
      <button
        type="button"
        onClick={onChange}
        className={`${
          checked ? "bg-blue-600" : "bg-gray-200"
        } relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
      >
        <span className="sr-only">Toggle {label}</span>
        <span
          className={`${
            checked ? "translate-x-6" : "translate-x-1"
          } inline-block w-4 h-4 transform bg-white rounded-full transition-transform`}
        />
      </button>
    </div>
  );
};

const Profile: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<ProfileStats>({
    ideasCount: 0,
    totalViews: 0,
    totalInterests: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    full_name: "",
    bio: "",
    location: "",
    website: "",
    linkedin: "",
    twitter: "",
    expertise: [] as string[],
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
      }

      // Use the dashboard endpoint which includes user profile and stats
      const response = await fetch(
        "http://localhost:8000/api/v1/innovator/dashboard",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to fetch profile");
      }

      const dashboardData = await response.json();
      setProfile(dashboardData.user);

      // Set stats from dashboard data
      setStats({
        ideasCount: dashboardData.stats.total_ideas,
        totalViews: dashboardData.stats.total_views,
        totalInterests: dashboardData.stats.total_interests,
      });
      // Initialize form data with current profile values
      setFormData({
        full_name: dashboardData.user.full_name || "",
        bio: dashboardData.user.bio || "",
        location: dashboardData.user.location || "",
        website: dashboardData.user.website || "",
        linkedin: dashboardData.user.linkedin || "",
        twitter: dashboardData.user.twitter || "",
        expertise: dashboardData.user.expertise || [],
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

  const handleExpertiseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const expertiseString = e.target.value;
    // Split by commas and trim each item
    const expertiseArray = expertiseString
      .split(",")
      .map((item) => item.trim());
    setFormData((prev) => ({
      ...prev,
      expertise: expertiseArray,
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
      }

      const response = await fetch(
        "http://localhost:8000/api/v1/users/profile",
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
      setProfile(updatedProfile);
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
      }

      const response = await fetch(
        "http://localhost:8000/api/v1/users/change-password",
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
      }

      const response = await fetch(
        "http://localhost:8000/api/v1/users/notifications",
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
      }

      const response = await fetch(
        "http://localhost:8000/api/v1/users/export",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to export data");
      }

      // Data export successful
      setExportLoading(false);
      setShowExportModal(false);
      setSuccessMessage(
        "Data export initiated. Check your email for the download link."
      );

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      console.error("Error exporting data:", err);
    } finally {
      setExportLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600">Loading your profile information...</p>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
        <Card>
          <CardContent>
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="text-red-600 text-sm">❌ Error: {error}</div>
              </div>
            </div>
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
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-lg mb-4">
              Unable to find your profile information.
            </p>
            <Button onClick={fetchProfile}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600">
            Manage your personal information and preferences
          </p>
        </div>
      </div>
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex">
            <div className="text-green-400">
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">{successMessage}</p>
            </div>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-2">
          <ProfileCard
            profile={profile}
            onEdit={() => setIsEditing(true)}
            showEditButton={!isEditing}
            ideasCount={stats.ideasCount}
            viewsCount={stats.totalViews}
            interestsCount={stats.totalInterests}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Edit Form */}
          {isEditing && (
            <Card>
              <CardHeader>
                <CardTitle>Edit Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bio
                    </label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Tell us about yourself"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Location
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="City, Country"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Expertise (comma separated)
                    </label>
                    <input
                      type="text"
                      name="expertise"
                      value={formData.expertise.join(", ")}
                      onChange={handleExpertiseChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g. AI, Healthcare, Marketing"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Website
                    </label>
                    <input
                      type="url"
                      name="website"
                      value={formData.website}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://your-website.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      LinkedIn
                    </label>
                    <input
                      type="url"
                      name="linkedin"
                      value={formData.linkedin}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://linkedin.com/in/username"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Twitter
                    </label>
                    <input
                      type="url"
                      name="twitter"
                      value={formData.twitter}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://twitter.com/username"
                    />
                  </div>

                  {formError && (
                    <div className="text-red-600 text-sm">
                      Error: {formError}
                    </div>
                  )}

                  <div className="flex flex-col space-y-2 pt-4">
                    <Button
                      type="submit"
                      disabled={isSaving}
                      className="w-full"
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
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false);
                        setFormError(null);
                        // Reset form data to current profile values
                        setFormData({
                          full_name: profile.full_name || "",
                          bio: profile.bio || "",
                          location: profile.location || "",
                          website: profile.website || "",
                          linkedin: profile.linkedin || "",
                          twitter: profile.twitter || "",
                          expertise: profile.expertise || [],
                        });
                      }}
                      className="w-full"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Account Status */}
          <Card>
            <CardHeader>
              <CardTitle>Account Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Status:</span>
                  <span
                    className={`px-3 py-1 text-sm rounded-full ${
                      profile.is_active && !profile.is_blocked
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {profile.is_active && !profile.is_blocked
                      ? "Active"
                      : "Inactive"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Account ID:</span>
                  <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                    {profile.id.substring(0, 8)}...
                  </span>
                </div>
              </div>

              {/* Status Messages */}
              {profile.is_blocked && (
                <div className="mt-4 p-4 bg-red-50 rounded-lg">
                  <p className="text-sm text-red-700">
                    ⚠️ Your account has been blocked. Please contact support for
                    assistance.
                  </p>
                </div>
              )}
              {!profile.is_active && (
                <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-yellow-700">
                    ⚠️ Your account is inactive. Please contact support to
                    reactivate your account.
                  </p>
                </div>
              )}
              {profile.is_active && !profile.is_blocked && (
                <div className="mt-4 p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-700">
                    ✅ Your account is active and you have full access to all
                    platform features.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button
                  className="w-full text-left justify-start"
                  variant="outline"
                  onClick={() => setShowChangePasswordModal(true)}
                >
                  <span className="mr-2">🔒</span> Change Password
                </Button>
                <Button
                  className="w-full text-left justify-start"
                  variant="outline"
                  onClick={() => setShowNotificationsModal(true)}
                >
                  <span className="mr-2">📧</span> Manage Notifications
                </Button>
                <Button
                  className="w-full text-left justify-start"
                  variant="outline"
                  onClick={() => setShowExportModal(true)}
                >
                  <span className="mr-2">🔄</span> Export My Data
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>{" "}
      {/* Change Password Modal */}
      <Modal
        isOpen={showChangePasswordModal}
        onClose={() => setShowChangePasswordModal(false)}
        title="Change Password"
      >
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your current password"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter a new password"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Confirm your new password"
              required
            />
          </div>

          {passwordError && (
            <div className="text-red-600 text-sm">Error: {passwordError}</div>
          )}

          <div className="flex flex-col space-y-2 pt-4">
            <Button type="submit" disabled={passwordLoading} className="w-full">
              {passwordLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Changing...
                </>
              ) : (
                "Change Password"
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowChangePasswordModal(false)}
              className="w-full"
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
      {/* Manage Notifications Modal */}
      <Modal
        isOpen={showNotificationsModal}
        onClose={() => setShowNotificationsModal(false)}
        title="Manage Notifications"
      >
        <div className="space-y-4">
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

          <div className="flex flex-col space-y-2 pt-4">
            <Button
              onClick={handleNotificationsChange}
              disabled={notificationsLoading}
              className="w-full"
            >
              {notificationsLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowNotificationsModal(false)}
              className="w-full"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
      {/* Export Data Modal */}
      <Modal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        title="Export My Data"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Your data export will include all your profile information, ideas,
            and activity. A download link will be sent to your registered email
            address.
          </p>

          <div className="flex flex-col space-y-2 pt-4">
            <Button
              onClick={handleExportData}
              disabled={exportLoading}
              className="w-full"
            >
              {exportLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Exporting...
                </>
              ) : (
                "Export My Data"
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowExportModal(false)}
              className="w-full"
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
