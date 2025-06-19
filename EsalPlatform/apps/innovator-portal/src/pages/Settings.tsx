import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, Button } from "@esal/ui";

// API configuration
const API_BASE_URL =
  (import.meta as any).env?.VITE_API_URL || "${API_BASE_URL}";

interface NotificationSettings {
  email_notifications: boolean;
  idea_comments: boolean;
  idea_interests: boolean;
  platform_updates: boolean;
  marketing_emails: boolean;
  weekly_digest: boolean;
}

interface PrivacySettings {
  profile_visibility: "public" | "private" | "registered";
  show_contact_info: boolean;
  allow_messages: boolean;
  show_ideas: boolean;
  data_sharing: boolean;
}

interface SecuritySettings {
  two_factor_enabled: boolean;
  session_timeout: number;
  login_notifications: boolean;
}

interface Settings {
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  security: SecuritySettings;
  theme: string;
  language: string;
  timezone: string;
}

interface SecurityInfo {
  two_factor_enabled: boolean;
  last_password_change: string | null;
  account_created: string;
  login_notifications: boolean;
  active_sessions_count: number;
}

interface SessionInfo {
  device: string;
  browser: string;
  ip_address: string;
  location: string;
  last_active: string;
  is_current: boolean;
}

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("notifications");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [securityInfo, setSecurityInfo] = useState<SecurityInfo | null>(null);
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [settings, setSettings] = useState<Settings>({
    notifications: {
      email_notifications: true,
      idea_comments: true,
      idea_interests: true,
      platform_updates: true,
      marketing_emails: false,
      weekly_digest: true,
    },
    privacy: {
      profile_visibility: "public",
      show_contact_info: true,
      allow_messages: true,
      show_ideas: true,
      data_sharing: false,
    },
    security: {
      two_factor_enabled: false,
      session_timeout: 30,
      login_notifications: true,
    },
    theme: "light",
    language: "en",
    timezone: "UTC",
  });
  const [isSaving, setIsSaving] = useState(false);
  useEffect(() => {
    fetchSettings();
    if (activeTab === "security") {
      fetchSecurityInfo();
      fetchSessions();
    }
  }, [activeTab]);
  const fetchSettings = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("Authentication required");
      } // Fetch general settings
      const settingsResponse = await fetch(
        `${API_BASE_URL}/api/v1/users/settings`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      ); // Fetch notification settings
      const notificationsResponse = await fetch(
        `${API_BASE_URL}/api/v1/users/notifications`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!settingsResponse.ok || !notificationsResponse.ok) {
        // If settings don't exist, use defaults
        console.log("Using default settings");
      } else {
        const settingsData = await settingsResponse.json();
        const notificationsData = await notificationsResponse.json();

        // Merge settings with fetched data
        setSettings((prev) => ({
          ...prev,
          ...settingsData,
          notifications: {
            ...prev.notifications,
            ...notificationsData,
          },
        }));
      }
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

  const fetchSecurityInfo = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) return;

      const response = await fetch(
        "${API_BASE_URL}/api/v1/users/security-info",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSecurityInfo(data);
      }
    } catch (err) {
      console.error("Error fetching security info:", err);
    }
  };

  const fetchSessions = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) return;

      const response = await fetch("${API_BASE_URL}/api/v1/users/sessions", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSessions(data.sessions || []);
      }
    } catch (err) {
      console.error("Error fetching sessions:", err);
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

  const handleSecurityChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const isCheckbox = e.target.type === "checkbox";

    setSettings((prev) => ({
      ...prev,
      security: {
        ...prev.security,
        [name]: isCheckbox ? (e.target as HTMLInputElement).checked : value,
      },
    }));
  };

  const handlePasswordFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleSaveNotifications = async () => {
    setIsSaving(true);
    setError(null);
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("Authentication required");
      }

      console.log(
        "Sending notifications request with token:",
        token ? "Token present" : "No token"
      );
      console.log("Notification settings being sent:", settings.notifications);

      const response = await fetch(
        "${API_BASE_URL}/api/v1/users/notifications",
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(settings.notifications),
        }
      );

      console.log("Response status:", response.status);
      console.log("Response headers:", response.headers);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error response:", errorData);
        throw new Error(
          errorData.detail || "Failed to save notification settings"
        );
      }

      const result = await response.json();
      console.log("Success response:", result);

      setSuccessMessage("Notification settings saved successfully!");

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred saving notification settings"
      );
      console.error("Error saving notification settings:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePrivacy = async () => {
    setIsSaving(true);
    setError(null);

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("Authentication required");
      }

      // Save privacy settings as part of the general settings
      const updatedSettings = {
        ...settings,
        privacy: settings.privacy,
      };

      const response = await fetch("${API_BASE_URL}/api/v1/users/settings", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedSettings),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to save privacy settings");
      }

      setSuccessMessage("Privacy settings saved successfully!");

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred saving privacy settings"
      );
      console.error("Error saving privacy settings:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    setError(null);

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch("${API_BASE_URL}/api/v1/users/settings", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to save settings");
      }

      const updatedSettings = await response.json();
      setSettings(updatedSettings.settings || updatedSettings);
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
    setError(null);
    setSuccessMessage(null);

    // Validate form
    if (
      !passwordForm.current_password ||
      !passwordForm.new_password ||
      !passwordForm.confirm_password
    ) {
      setError("All password fields are required");
      return;
    }

    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setError("New password and confirmation do not match");
      return;
    }

    if (passwordForm.new_password.length < 8) {
      setError("New password must be at least 8 characters long");
      return;
    }

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(
        "${API_BASE_URL}/api/v1/users/change-password",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            current_password: passwordForm.current_password,
            new_password: passwordForm.new_password,
            confirm_password: passwordForm.confirm_password,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to change password");
      }

      setSuccessMessage("Password changed successfully!");
      setPasswordForm({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred changing password"
      );
    }
  };

  const handleEnable2FA = async () => {
    try {
      const password = prompt(
        "Please enter your current password to enable 2FA:"
      );
      if (!password) return;

      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch("${API_BASE_URL}/api/v1/users/enable-2fa", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to enable 2FA");
      }

      const data = await response.json();
      alert(
        `2FA enabled successfully!\n\nSecret: ${data.secret}\n\nBackup codes: ${data.backup_codes.join(", ")}\n\nPlease save these backup codes in a safe place.`
      );

      // Refresh security info
      fetchSecurityInfo();
      setSuccessMessage("Two-factor authentication enabled successfully!");

      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An error occurred enabling 2FA"
      );
    }
  };

  const handleDisable2FA = async () => {
    if (
      !window.confirm(
        "Are you sure you want to disable two-factor authentication?"
      )
    ) {
      return;
    }

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch("${API_BASE_URL}/api/v1/users/disable-2fa", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to disable 2FA");
      }

      // Refresh security info
      fetchSecurityInfo();
      setSuccessMessage("Two-factor authentication disabled successfully!");

      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An error occurred disabling 2FA"
      );
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(
        `${API_BASE_URL}/api/v1/users/sessions/${sessionId}`,
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
        throw new Error(errorData.detail || "Failed to revoke session");
      }

      // Refresh sessions
      fetchSessions();
      setSuccessMessage("Session revoked successfully!");

      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred revoking session"
      );
    }
  };

  const handleExportData = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch("${API_BASE_URL}/api/v1/users/export", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to export data");
      }

      // Create download link
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `esal_data_export_${new Date().toISOString().split("T")[0]}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setSuccessMessage("Data export downloaded successfully!");

      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An error occurred exporting data"
      );
    }
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
          "${API_BASE_URL}/api/v1/users/delete-account",
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
      <div className="space-y-4 sm:space-y-6 p-4 sm:p-6 lg:p-8">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">Settings</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">Loading your settings...</p>
        </div>
        <div className="flex items-center justify-center h-32 sm:h-48 lg:h-64">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6 lg:p-8">
      <div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">
          Manage your account settings and preferences
        </p>
      </div>      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3 sm:p-4">
          <div className="flex">
            <div className="text-red-600 text-sm">❌ Error: {error}</div>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-md p-3 sm:p-4">
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

      <div className="flex space-x-1 sm:space-x-2 border-b overflow-x-auto scrollbar-hide">
        <button
          onClick={() => setActiveTab("notifications")}
          className={`py-2 px-3 sm:px-4 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
            activeTab === "notifications"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          Notifications
        </button>
        <button
          onClick={() => setActiveTab("privacy")}
          className={`py-2 px-3 sm:px-4 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
            activeTab === "privacy"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          Privacy
        </button>{" "}
        <button
          onClick={() => setActiveTab("security")}
          className={`py-2 px-3 sm:px-4 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
            activeTab === "security"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          Security
        </button>
        <button
          onClick={() => setActiveTab("preferences")}
          className={`py-2 px-3 sm:px-4 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
            activeTab === "preferences"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          Preferences
        </button>
        <button
          onClick={() => setActiveTab("danger")}
          className={`py-2 px-3 sm:px-4 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
            activeTab === "danger"
              ? "border-red-500 text-red-600"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          Danger Zone
        </button>
      </div>

      <div className="mt-4 sm:mt-6">        {activeTab === "notifications" && (
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl">Notification Settings</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-4 sm:space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 text-sm sm:text-base">
                      Email Notifications
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">
                      Receive email notifications for important updates
                    </p>
                  </div>
                  <div className="flex-shrink-0">
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
                </div>

                <div className="border-t pt-4 sm:pt-6 space-y-4 sm:space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 text-sm sm:text-base">
                        Comment Notifications
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-500 mt-1">
                        Receive notifications when someone comments on your
                        ideas
                      </p>
                    </div>
                    <div className="flex-shrink-0">
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
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 text-sm sm:text-base">
                        Interest Notifications
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-500 mt-1">
                        Receive notifications when someone shows interest in
                        your ideas
                      </p>
                    </div>
                    <div className="flex-shrink-0">
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
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 text-sm sm:text-base">
                        Platform Updates
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-500 mt-1">
                        Receive notifications about platform updates and new
                        features
                      </p>
                    </div>
                    <div className="flex-shrink-0">
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
                  </div>{" "}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 text-sm sm:text-base">
                        Marketing Emails
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-500 mt-1">
                        Receive marketing and promotional emails about our
                        services
                      </p>
                    </div>
                    <div className="flex-shrink-0">
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
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 text-sm sm:text-base">
                        Weekly Digest
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-500 mt-1">
                        Receive a weekly summary of platform activity and new
                        ideas
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          name="weekly_digest"
                          className="sr-only peer"
                          checked={settings.notifications.weekly_digest}
                          onChange={handleNotificationChange}
                          disabled={!settings.notifications.email_notifications}
                        />
                        <div
                          className={`w-11 h-6 ${settings.notifications.email_notifications ? "bg-gray-200" : "bg-gray-100"} peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600`}
                        ></div>{" "}
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t">
                <Button onClick={handleSaveNotifications} disabled={isSaving} className="w-full sm:w-auto">
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    "Save Notification Settings"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}        {activeTab === "privacy" && (
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl">Privacy Settings</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Profile Visibility
                  </label>
                  <select
                    name="profile_visibility"
                    value={settings.privacy.profile_visibility}
                    onChange={handlePrivacyChange}
                    className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="public">Public - Visible to everyone</option>
                    <option value="registered">
                      Registered Users - Only visible to platform members
                    </option>
                    <option value="private">
                      Private - Only visible to you
                    </option>
                  </select>
                  <p className="mt-2 text-xs sm:text-sm text-gray-500">
                    Control who can see your profile information
                  </p>
                </div>

                <div className="border-t pt-4 sm:pt-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 mb-4 sm:mb-6">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 text-sm sm:text-base">
                        Show Contact Information
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-500 mt-1">
                        Allow others to see your contact information
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          name="show_contact_info"
                          className="sr-only peer"                        checked={settings.privacy.show_contact_info}
                        onChange={handlePrivacyChange}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 mb-4 sm:mb-6">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 text-sm sm:text-base">
                        Allow Direct Messages
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-500 mt-1">
                        Allow other users to send you direct messages
                      </p>
                    </div>
                    <div className="flex-shrink-0">
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
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 mb-4 sm:mb-6">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 text-sm sm:text-base">
                        Show My Ideas
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-500 mt-1">
                        Make your startup ideas visible in your public profile
                      </p>
                    </div>
                    <div className="flex-shrink-0">
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
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 text-sm sm:text-base">
                        Allow Data Sharing
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-500 mt-1">
                        Allow anonymized data sharing for platform improvement
                        and research
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          name="data_sharing"
                          className="sr-only peer"
                          checked={settings.privacy.data_sharing}
                          onChange={handlePrivacyChange}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t">
                <Button onClick={handleSavePrivacy} disabled={isSaving} className="w-full sm:w-auto">
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    "Save Privacy Settings"
                  )}                </Button>
              </div>
              </div>
            </CardContent>
          </Card>
        )}
        {activeTab === "security" && (
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl">Security Settings</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base">
                    Change Password
                  </h3>
                  <form className="space-y-3 sm:space-y-4" onSubmit={handleChangePassword}>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                        Current Password
                      </label>
                      <input
                        type="password"
                        name="current_password"
                        value={passwordForm.current_password}
                        onChange={handlePasswordFormChange}
                        className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter your current password"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                        New Password
                      </label>
                      <input
                        type="password"
                        name="new_password"
                        value={passwordForm.new_password}
                        onChange={handlePasswordFormChange}
                        className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter new password"
                        required
                        minLength={8}
                      />
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        name="confirm_password"
                        value={passwordForm.confirm_password}
                        onChange={handlePasswordFormChange}
                        className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Confirm new password"
                        required
                        minLength={8}
                      />
                    </div>

                    <Button type="submit" className="w-full sm:w-auto">Change Password</Button>
                  </form>
                </div>
                <div className="border-t pt-4 sm:pt-6">
                  <h3 className="font-medium text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base">
                    Two-Factor Authentication
                  </h3>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm text-gray-700 mb-1">
                        {securityInfo?.two_factor_enabled
                          ? "Two-factor authentication is enabled"
                          : "Enable two-factor authentication for enhanced security"}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-500">
                        {securityInfo?.two_factor_enabled
                          ? "Your account is protected with an additional security layer"
                          : "Protect your account with an additional security layer"}
                      </p>
                    </div>
                    <div className="flex-shrink-0 w-full sm:w-auto">
                      {securityInfo?.two_factor_enabled ? (
                        <Button
                          variant="outline"
                          className="w-full sm:w-auto border-red-300 text-red-600 hover:bg-red-50"
                          onClick={handleDisable2FA}
                        >
                          Disable 2FA
                        </Button>
                      ) : (
                        <Button variant="outline" className="w-full sm:w-auto" onClick={handleEnable2FA}>
                          Enable 2FA
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
                <div className="border-t pt-4 sm:pt-6">
                  <h3 className="font-medium text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base">
                    Session Management
                  </h3>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-700 mb-3 sm:mb-4">
                      You're currently logged in on these devices:
                    </p>
                    <div className="space-y-2 sm:space-y-3">
                      {sessions.length > 0 ? (
                        sessions.map((session, index) => (
                          <div
                            key={index}
                            className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 bg-gray-50 rounded-md space-y-2 sm:space-y-0"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm sm:text-base">
                                {session.is_current
                                  ? "Current Device"
                                  : session.device}
                              </p>
                              <p className="text-xs sm:text-sm text-gray-600 break-words">
                                {session.browser} • IP: {session.ip_address}
                                {session.location && ` • ${session.location}`}
                                {!session.is_current &&
                                  ` • Last active: ${new Date(session.last_active).toLocaleDateString()}`}
                              </p>
                            </div>
                            {!session.is_current && (
                              <div className="flex-shrink-0 w-full sm:w-auto">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full sm:w-auto"
                                  onClick={() =>
                                    handleRevokeSession(index.toString())
                                  }
                                >
                                  Log Out
                                </Button>
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                          <div>
                            <p className="font-medium text-sm sm:text-base">Current Device</p>
                            <p className="text-xs sm:text-sm text-gray-600">
                              No session information available
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="border-t pt-4 sm:pt-6">
                  <h3 className="font-medium text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base">
                    Security Preferences
                  </h3>
                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                        Session Timeout (minutes)
                      </label>
                      <select
                        name="session_timeout"
                        value={settings.security.session_timeout}
                        onChange={handleSecurityChange}
                        className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value={15}>15 minutes</option>
                        <option value={30}>30 minutes</option>
                        <option value={60}>1 hour</option>
                        <option value={120}>2 hours</option>
                        <option value={240}>4 hours</option>
                        <option value={480}>8 hours</option>
                      </select>
                      <p className="mt-2 text-xs sm:text-sm text-gray-500">
                        Automatically log out after this period of inactivity
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 text-sm sm:text-base">
                          Login Notifications
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-500 mt-1">
                          Receive notifications when someone logs into your
                          account
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            name="login_notifications"
                            className="sr-only peer"
                            checked={settings.security.login_notifications}
                            onChange={handleSecurityChange}                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t">
                <Button onClick={handleSaveSettings} disabled={isSaving} className="w-full sm:w-auto">
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>            </CardContent>
          </Card>
        )}
        {activeTab === "preferences" && (
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl">Preferences</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                    Theme
                  </label>
                  <select
                    name="theme"
                    value={settings.theme}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        theme: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="auto">Auto (System)</option>
                  </select>
                  <p className="mt-2 text-xs sm:text-sm text-gray-500">
                    Choose your preferred color theme
                  </p>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                    Language
                  </label>
                  <select
                    name="language"
                    value={settings.language}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        language: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="en">English</option>
                    <option value="ar">العربية (Arabic)</option>
                    <option value="fr">Français</option>
                    <option value="es">Español</option>
                  </select>
                  <p className="mt-2 text-xs sm:text-sm text-gray-500">
                    Select your preferred language
                  </p>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                    Timezone
                  </label>
                  <select
                    name="timezone"
                    value={settings.timezone}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        timezone: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Chicago">Central Time</option>
                    <option value="America/Denver">Mountain Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                    <option value="Europe/London">London</option>
                    <option value="Europe/Paris">Paris</option>
                    <option value="Asia/Dubai">Dubai</option>
                    <option value="Asia/Riyadh">Riyadh</option>
                    <option value="Asia/Tokyo">Tokyo</option>
                  </select>
                  <p className="mt-2 text-xs sm:text-sm text-gray-500">
                    Set your timezone for accurate timestamps
                  </p>
                </div>
              </div>

              <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t">
                <Button onClick={handleSaveSettings} disabled={isSaving} className="w-full sm:w-auto">
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>            </CardContent>
          </Card>
        )}
        {activeTab === "danger" && (
          <Card className="border-red-200">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle>
                <div className="text-red-600 text-lg sm:text-xl">Danger Zone</div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2 text-sm sm:text-base">
                    Export Your Data
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">
                    Download all your personal data and startup ideas in a
                    portable format
                  </p>
                  <Button variant="outline" onClick={handleExportData} className="w-full sm:w-auto">
                    Export My Data
                  </Button>
                </div>
                <div className="border-t pt-4 sm:pt-6">
                  <h3 className="font-medium text-red-600 mb-2 text-sm sm:text-base">
                    Delete Account
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">
                    Permanently delete your account and all associated data.
                    This action cannot be undone.
                  </p>
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto border-red-300 text-red-600 hover:bg-red-50"
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
