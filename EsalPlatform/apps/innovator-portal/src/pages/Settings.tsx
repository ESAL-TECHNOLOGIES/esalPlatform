import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, Button } from "@esal/ui";

interface NotificationSettings {
  email_notifications: boolean;
  idea_comments: boolean;
  idea_interests: boolean;
  platform_updates: boolean;
  marketing_emails: boolean;
}

interface PrivacySettings {
  profile_visibility: "public" | "private" | "registered";
  show_contact_info: boolean;
  allow_messages: boolean;
  show_ideas: boolean;
}

interface Settings {
  notifications: NotificationSettings;
  privacy: PrivacySettings;
}

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("notifications");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [settings, setSettings] = useState<Settings>({
    notifications: {
      email_notifications: true,
      idea_comments: true,
      idea_interests: true,
      platform_updates: true,
      marketing_emails: false,
    },
    privacy: {
      profile_visibility: "public",
      show_contact_info: true,
      allow_messages: true,
      show_ideas: true,
    },
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(
        "http://localhost:8000/api/v1/users/settings",
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
        throw new Error(errorData.detail || "Failed to fetch settings");
      }

      const settingsData = await response.json();
      setSettings(settingsData);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred fetching settings"
      );
      console.error("Error fetching settings:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setSettings((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [name]: checked,
      },
    }));
  };

  const handlePrivacyChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const isCheckbox = e.target.type === "checkbox";

    setSettings((prev) => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [name]: isCheckbox ? (e.target as HTMLInputElement).checked : value,
      },
    }));
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    setError(null);

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(
        "http://localhost:8000/api/v1/users/settings",
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(settings),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to save settings");
      }

      const updatedSettings = await response.json();
      setSettings(updatedSettings);
      setSuccessMessage("Settings saved successfully!");

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An error occurred saving settings"
      );
      console.error("Error saving settings:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    // This would be implemented with an API call to change the password
    alert("Password change functionality would be implemented here");
  };

  const handleDeleteAccount = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete your account? This action cannot be undone."
      )
    ) {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          throw new Error("Authentication required");
        }

        const response = await fetch(
          "http://localhost:8000/api/v1/users/delete-account",
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || "Failed to delete account");
        }

        // Clear token and redirect to login page
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        window.location.href = "/login";
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "An error occurred deleting your account"
        );
        console.error("Error deleting account:", err);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">Loading your settings...</p>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">
          Manage your account settings and preferences
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="text-red-600 text-sm">❌ Error: {error}</div>
          </div>
        </div>
      )}

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

      <div className="flex space-x-2 border-b">
        <button
          onClick={() => setActiveTab("notifications")}
          className={`py-2 px-4 border-b-2 font-medium text-sm ${
            activeTab === "notifications"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          Notifications
        </button>
        <button
          onClick={() => setActiveTab("privacy")}
          className={`py-2 px-4 border-b-2 font-medium text-sm ${
            activeTab === "privacy"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          Privacy
        </button>
        <button
          onClick={() => setActiveTab("security")}
          className={`py-2 px-4 border-b-2 font-medium text-sm ${
            activeTab === "security"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          Security
        </button>
        <button
          onClick={() => setActiveTab("danger")}
          className={`py-2 px-4 border-b-2 font-medium text-sm ${
            activeTab === "danger"
              ? "border-red-500 text-red-600"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          Danger Zone
        </button>
      </div>

      <div className="mt-6">
        {activeTab === "notifications" && (
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">
                      Email Notifications
                    </h3>
                    <p className="text-sm text-gray-500">
                      Receive email notifications for important updates
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="email_notifications"
                      className="sr-only peer"
                      checked={settings.notifications.email_notifications}
                      onChange={handleNotificationChange}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="border-t pt-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        Comment Notifications
                      </h3>
                      <p className="text-sm text-gray-500">
                        Receive notifications when someone comments on your
                        ideas
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="idea_comments"
                        className="sr-only peer"
                        checked={settings.notifications.idea_comments}
                        onChange={handleNotificationChange}
                        disabled={!settings.notifications.email_notifications}
                      />
                      <div
                        className={`w-11 h-6 ${settings.notifications.email_notifications ? "bg-gray-200" : "bg-gray-100"} peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600`}
                      ></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        Interest Notifications
                      </h3>
                      <p className="text-sm text-gray-500">
                        Receive notifications when someone shows interest in
                        your ideas
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="idea_interests"
                        className="sr-only peer"
                        checked={settings.notifications.idea_interests}
                        onChange={handleNotificationChange}
                        disabled={!settings.notifications.email_notifications}
                      />
                      <div
                        className={`w-11 h-6 ${settings.notifications.email_notifications ? "bg-gray-200" : "bg-gray-100"} peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600`}
                      ></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        Platform Updates
                      </h3>
                      <p className="text-sm text-gray-500">
                        Receive notifications about platform updates and new
                        features
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="platform_updates"
                        className="sr-only peer"
                        checked={settings.notifications.platform_updates}
                        onChange={handleNotificationChange}
                        disabled={!settings.notifications.email_notifications}
                      />
                      <div
                        className={`w-11 h-6 ${settings.notifications.email_notifications ? "bg-gray-200" : "bg-gray-100"} peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600`}
                      ></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        Marketing Emails
                      </h3>
                      <p className="text-sm text-gray-500">
                        Receive marketing and promotional emails about our
                        services
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="marketing_emails"
                        className="sr-only peer"
                        checked={settings.notifications.marketing_emails}
                        onChange={handleNotificationChange}
                        disabled={!settings.notifications.email_notifications}
                      />
                      <div
                        className={`w-11 h-6 ${settings.notifications.email_notifications ? "bg-gray-200" : "bg-gray-100"} peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600`}
                      ></div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t">
                <Button onClick={handleSaveSettings} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        {activeTab === "privacy" && (
          <Card>
            <CardHeader>
              <CardTitle>Privacy Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Profile Visibility
                  </label>
                  <select
                    name="profile_visibility"
                    value={settings.privacy.profile_visibility}
                    onChange={handlePrivacyChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="public">Public - Visible to everyone</option>
                    <option value="registered">
                      Registered Users - Only visible to platform members
                    </option>
                    <option value="private">
                      Private - Only visible to you
                    </option>
                  </select>
                  <p className="mt-1 text-sm text-gray-500">
                    Control who can see your profile information
                  </p>
                </div>

                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        Show Contact Information
                      </h3>
                      <p className="text-sm text-gray-500">
                        Allow others to see your contact information
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="show_contact_info"
                        className="sr-only peer"
                        checked={settings.privacy.show_contact_info}
                        onChange={handlePrivacyChange}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        Allow Direct Messages
                      </h3>
                      <p className="text-sm text-gray-500">
                        Allow other users to send you direct messages
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="allow_messages"
                        className="sr-only peer"
                        checked={settings.privacy.allow_messages}
                        onChange={handlePrivacyChange}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        Show My Ideas
                      </h3>
                      <p className="text-sm text-gray-500">
                        Make your startup ideas visible in your public profile
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="show_ideas"
                        className="sr-only peer"
                        checked={settings.privacy.show_ideas}
                        onChange={handlePrivacyChange}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t">
                <Button onClick={handleSaveSettings} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        {activeTab === "security" && (
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-4">
                    Change Password
                  </h3>
                  <form className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Current Password
                      </label>
                      <input
                        type="password"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter your current password"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        New Password
                      </label>
                      <input
                        type="password"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter new password"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Confirm new password"
                      />
                    </div>

                    <Button type="button" onClick={handleChangePassword}>
                      Change Password
                    </Button>
                  </form>
                </div>

                <div className="border-t pt-6">
                  <h3 className="font-medium text-gray-900 mb-4">
                    Two-Factor Authentication
                  </h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-700 mb-1">
                        Enable two-factor authentication for enhanced security
                      </p>
                      <p className="text-sm text-gray-500">
                        Protect your account with an additional security layer
                      </p>
                    </div>
                    <Button variant="outline">Enable 2FA</Button>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="font-medium text-gray-900 mb-4">
                    Session Management
                  </h3>
                  <div>
                    <p className="text-sm text-gray-700 mb-4">
                      You're currently logged in on these devices:
                    </p>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                        <div>
                          <p className="font-medium">Current Device</p>
                          <p className="text-sm text-gray-600">
                            Windows • Chrome • IP: 192.168.1.1
                          </p>
                        </div>
                      </div>

                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                        <div>
                          <p className="font-medium">Mobile Device</p>
                          <p className="text-sm text-gray-600">
                            iOS • Safari • Last active: 2 days ago
                          </p>
                        </div>
                        <Button variant="outline" size="sm">
                          Log Out
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}{" "}
        {activeTab === "danger" && (
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle>
                <div className="text-red-600">Danger Zone</div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">
                    Export Your Data
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Download all your personal data and startup ideas in a
                    portable format
                  </p>
                  <Button variant="outline">Export My Data</Button>
                </div>

                <div className="border-t pt-6">
                  <h3 className="font-medium text-red-600 mb-2">
                    Delete Account
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Permanently delete your account and all associated data.
                    This action cannot be undone.
                  </p>
                  <Button
                    variant="outline"
                    className="border-red-300 text-red-600 hover:bg-red-50"
                    onClick={handleDeleteAccount}
                  >
                    Delete My Account
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Settings;
