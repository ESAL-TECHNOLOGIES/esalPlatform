import React, { useState, useEffect } from "react";
import { Card, Button } from "@esal/ui";
import { settingsAPI } from "../utils/api";

interface Setting {
  key: string;
  label: string;
  value: string | boolean | number;
  type: "text" | "boolean" | "number";
  disabled?: boolean;
}

const Settings = () => {
  const [selectedTab, setSelectedTab] = useState("platform");
  const [platformSettings, setPlatformSettings] = useState<Setting[]>([]);
  const [emailSettings, setEmailSettings] = useState<Setting[]>([]);
  const [securitySettings, setSecuritySettings] = useState<Setting[]>([]);
  const [integrationSettings, setIntegrationSettings] = useState<Setting[]>([]);
  const [systemLogs, setSystemLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const settingsData = await settingsAPI.getSystemSettings();

      // Transform general settings to Setting array format
      const transformedGeneral: Setting[] = [
        {
          key: "platform_name",
          label: "Platform Name",
          value: settingsData.general.platform_name,
          type: "text",
        },
        {
          key: "maintenance_mode",
          label: "Maintenance Mode",
          value: settingsData.general.maintenance_mode,
          type: "boolean",
        },
        {
          key: "registration_enabled",
          label: "User Registration",
          value: settingsData.general.registration_enabled,
          type: "boolean",
        },
        {
          key: "max_file_size",
          label: "Max File Size",
          value: settingsData.general.max_file_size,
          type: "text",
        },
      ];

      // Transform security settings to Setting array format
      const transformedSecurity: Setting[] = [
        {
          key: "session_timeout",
          label: "Session Timeout (minutes)",
          value: settingsData.security.session_timeout,
          type: "number",
        },
        {
          key: "password_requirements",
          label: "Password Requirements",
          value: settingsData.security.password_requirements,
          type: "text",
        },
        {
          key: "two_factor_enabled",
          label: "Two-Factor Authentication",
          value: settingsData.security.two_factor_enabled,
          type: "boolean",
        },
        {
          key: "ip_whitelist_enabled",
          label: "IP Whitelist",
          value: settingsData.security.ip_whitelist_enabled,
          type: "boolean",
        },
      ];

      // Transform notification settings to Setting array format
      const transformedNotifications: Setting[] = [
        {
          key: "email_notifications",
          label: "Email Notifications",
          value: settingsData.notifications.email_notifications,
          type: "boolean",
        },
        {
          key: "sms_notifications",
          label: "SMS Notifications",
          value: settingsData.notifications.sms_notifications,
          type: "boolean",
        },
        {
          key: "push_notifications",
          label: "Push Notifications",
          value: settingsData.notifications.push_notifications,
          type: "boolean",
        },
      ]; // Mock integration settings (would come from API)
      const integrationDefaults: Setting[] = [
        {
          key: "aws_s3_enabled",
          label: "AWS S3 Storage",
          value: true,
          type: "boolean",
        },
        {
          key: "openai_enabled",
          label: "OpenAI Integration",
          value: true,
          type: "boolean",
        },
      ];

      setPlatformSettings(transformedGeneral);
      setEmailSettings(transformedNotifications);
      setSecuritySettings(transformedSecurity);
      setIntegrationSettings(integrationDefaults);

      // Mock system logs (would come from API)
      setSystemLogs([
        {
          timestamp: new Date().toISOString().slice(0, 19).replace("T", " "),
          level: "INFO",
          message: "Settings data loaded successfully",
          module: "Settings",
        },
      ]);
    } catch (err) {
      console.error("Settings fetch error:", err);
      setError(err instanceof Error ? err.message : "Failed to load settings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSettingUpdate = async (
    key: string,
    value: string | boolean | number
  ) => {
    try {
      await settingsAPI.updateSystemSettings({ [key]: value });
      await fetchSettings(); // Refresh data
    } catch (err) {
      console.error("Setting update error:", err);
      // Could add toast notification here
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="text-red-600 text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Failed to Load Settings
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={fetchSettings}>Retry</Button>
        </div>
      </div>
    );
  }

  const renderSettingField = (setting) => {
    const isDisabled = setting.disabled || false;
    const className = isDisabled
      ? "mt-1 block w-full border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-500"
      : "mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500";

    switch (setting.type) {
      case "boolean":
        return (
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={setting.value}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              readOnly
              disabled={isDisabled}
              title={setting.label}
              aria-label={setting.label}
            />
            <span className="text-sm text-gray-600">
              {setting.value ? "Enabled" : "Disabled"}
            </span>
          </div>
        );
      case "password":
        return (
          <input
            type="password"
            value={setting.value}
            className={className}
            readOnly
            disabled={isDisabled}
            placeholder={isDisabled ? "Managed by Supabase" : ""}
            title={setting.label}
          />
        );
      default:
        return (
          <input
            type={setting.type}
            value={setting.value}
            className={className}
            readOnly
            disabled={isDisabled}
            placeholder={isDisabled ? "Managed by Supabase" : ""}
            title={setting.label}
          />
        );
    }
  };

  const logLevelColors = {
    INFO: "bg-blue-100 text-blue-800",
    WARN: "bg-yellow-100 text-yellow-800",
    ERROR: "bg-red-100 text-red-800",
    DEBUG: "bg-gray-100 text-gray-800",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Platform Settings
          </h1>
          <p className="text-gray-600">
            Configure platform settings and integrations
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">Export Configuration</Button>
          <Button>Save Changes</Button>
        </div>
      </div>

      {/* System Status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          {
            label: "System Status",
            value: "Operational",
            icon: "✅",
            color: "text-green-600",
          },
          {
            label: "Uptime",
            value: "99.9%",
            icon: "⏰",
            color: "text-blue-600",
          },
          {
            label: "Active Users",
            value: "892",
            icon: "👥",
            color: "text-purple-600",
          },
          {
            label: "Storage Used",
            value: "67%",
            icon: "💾",
            color: "text-orange-600",
          },
        ].map((stat, index) => (
          <Card key={index} className="p-6 text-center">
            <div className="text-2xl mb-2">{stat.icon}</div>
            <div className={`text-2xl font-bold ${stat.color}`}>
              {stat.value}
            </div>
            <div className="text-sm text-gray-600">{stat.label}</div>
          </Card>
        ))}
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: "platform", label: "Platform Settings" },
            { id: "email", label: "Email Configuration" },
            { id: "security", label: "Security Settings" },
            { id: "integrations", label: "Integrations" },
            { id: "logs", label: "System Logs" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                selectedTab === tab.id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Settings Content */}
      {selectedTab === "platform" && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            Platform Configuration
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {platformSettings.map((setting) => (
              <div key={setting.key}>
                <label className="block text-sm font-medium text-gray-700">
                  {setting.label}
                </label>
                {renderSettingField(setting)}
              </div>
            ))}
          </div>
        </Card>
      )}

      {selectedTab === "email" && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            Email Configuration
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {emailSettings.map((setting) => (
              <div key={setting.key}>
                <label className="block text-sm font-medium text-gray-700">
                  {setting.label}
                </label>
                {renderSettingField(setting)}
              </div>
            ))}{" "}
          </div>
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <span className="text-blue-600">ℹ️</span>
              <div>
                <h3 className="text-sm font-medium text-blue-900">
                  Email Confirmation Disabled
                </h3>
                <p className="text-sm text-blue-700">
                  The platform no longer requires email confirmation for user
                  registration.
                  <br />
                  <strong>Registration Flow:</strong> Users can sign up and
                  immediately access the platform.
                  <br />
                  <strong>Benefits:</strong> Simplified user experience, faster
                  onboarding, reduced friction.
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {selectedTab === "security" && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            Security Configuration
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {securitySettings.map((setting) => (
              <div key={setting.key}>
                <label className="block text-sm font-medium text-gray-700">
                  {setting.label}
                </label>
                {renderSettingField(setting)}
              </div>
            ))}
          </div>
          <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <span className="text-yellow-600">⚠️</span>
              <div>
                <h3 className="text-sm font-medium text-yellow-900">
                  Security Recommendations
                </h3>
                <ul className="text-sm text-yellow-700 mt-1 list-disc list-inside">
                  <li>Enable 2FA for all admin accounts</li>
                  <li>Regularly rotate API keys and passwords</li>
                  <li>Monitor suspicious login activities</li>
                </ul>
              </div>
            </div>
          </div>
        </Card>
      )}

      {selectedTab === "integrations" && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            Third-party Integrations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {integrationSettings.map((setting) => (
              <div key={setting.key}>
                <label className="block text-sm font-medium text-gray-700">
                  {setting.label}
                </label>
                {renderSettingField(setting)}
              </div>
            ))}
          </div>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            {" "}
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium text-gray-900">Email Service</h3>
              <p className="text-sm text-gray-600 mt-1">
                SMTP integration for notifications
              </p>
              <div className="mt-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Connected
                </span>
              </div>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium text-gray-900">File Storage</h3>
              <p className="text-sm text-gray-600 mt-1">
                AWS S3 for file uploads
              </p>
              <div className="mt-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Connected
                </span>
              </div>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium text-gray-900">AI Services</h3>
              <p className="text-sm text-gray-600 mt-1">
                OpenAI for AI features
              </p>
              <div className="mt-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  Limited
                </span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {selectedTab === "logs" && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">System Logs</h2>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                Download Logs
              </Button>
              <Button variant="outline" size="sm">
                Clear Logs
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            {systemLogs.map((log, index) => (
              <div
                key={index}
                className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg text-sm"
              >
                <span className="text-gray-500 font-mono text-xs">
                  {log.timestamp}
                </span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${logLevelColors[log.level]}`}
                >
                  {log.level}
                </span>
                <span className="text-gray-600">[{log.module}]</span>
                <span className="text-gray-900 flex-1">{log.message}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 text-center">
            <Button variant="outline" size="sm">
              Load More Logs
            </Button>
          </div>
        </Card>
      )}

      {/* Backup & Maintenance */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Backup & Maintenance
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            variant="outline"
            className="h-16 flex flex-col items-center justify-center space-y-2"
          >
            <span className="text-lg">💾</span>
            <span>Create Backup</span>
          </Button>
          <Button
            variant="outline"
            className="h-16 flex flex-col items-center justify-center space-y-2"
          >
            <span className="text-lg">🔄</span>
            <span>Restore Data</span>
          </Button>
          <Button
            variant="outline"
            className="h-16 flex flex-col items-center justify-center space-y-2"
          >
            <span className="text-lg">🛠️</span>
            <span>Maintenance Mode</span>
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Settings;
