import React, { useState, useEffect } from "react";
import { Card, Button } from "@esal/ui";
import { settingsAPI } from "../utils/api";
import {
  Settings as SettingsIcon,
  Database,
  RefreshCw,
  Wrench,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Info,
  Save,
} from "lucide-react";

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

      // Try to fetch settings from API, but handle 501 errors gracefully
      try {
        const settingsData = await settingsAPI.getSystemSettings();

        // If we get here, the API is implemented, transform the data
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
        ];

        setPlatformSettings(transformedGeneral);
        setEmailSettings(transformedNotifications);
        setSecuritySettings(transformedSecurity);
      } catch (systemSettingsError: any) {
        if (
          systemSettingsError.message?.includes("501") ||
          systemSettingsError.message?.includes("not yet implemented")
        ) {
          // Settings API not implemented, show empty state
          setPlatformSettings([]);
          setEmailSettings([]);
          setSecuritySettings([]);
        } else {
          throw systemSettingsError;
        }
      }

      // Try to fetch integration settings
      try {
        const integrationSettings = await settingsAPI.getIntegrationSettings();
        const transformedIntegrations: Setting[] = Object.entries(
          integrationSettings
        ).map(([key, value]) => ({
          key,
          label: key
            .replace(/_/g, " ")
            .replace(/\b\w/g, (l) => l.toUpperCase()),
          value: value as string | boolean | number,
          type: typeof value as "text" | "boolean" | "number",
        }));
        setIntegrationSettings(transformedIntegrations);
      } catch (integrationError: any) {
        if (
          integrationError.message?.includes("501") ||
          integrationError.message?.includes("not yet implemented")
        ) {
          // Integration settings API not implemented, show empty state
          setIntegrationSettings([]);
        } else {
          console.error("Integration settings error:", integrationError);
        }
      }

      // Try to fetch system logs
      try {
        const systemLogsData = await settingsAPI.getSystemLogs();
        setSystemLogs(systemLogsData.logs || []);
      } catch (logsError: any) {
        if (
          logsError.message?.includes("501") ||
          logsError.message?.includes("not yet implemented")
        ) {
          // System logs API not implemented, show empty state
          setSystemLogs([]);
        } else {
          console.error("System logs error:", logsError);
        }
      }
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
      <div className="flex items-center justify-center min-h-96 p-4 sm:p-6 lg:p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-sm sm:text-base text-gray-600">
            Loading settings...
          </p>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-96 p-4 sm:p-6 lg:p-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" />
            </div>
          </div>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
            Failed to Load Settings
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mb-4">{error}</p>
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
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
            Platform Settings
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Configure platform settings and integrations
          </p>
        </div>
        <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-3">
          <Button
            variant="outline"
            className="w-full sm:w-auto text-xs sm:text-sm"
          >
            <span className="hidden sm:inline">Export Configuration</span>
            <span className="sm:hidden">Export Config</span>
          </Button>
          <Button className="w-full sm:w-auto text-xs sm:text-sm">
            Save Changes
          </Button>
        </div>{" "}
      </div>
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-4 sm:space-x-8 overflow-x-auto">
          {[
            {
              id: "platform",
              label: "Platform Settings",
              shortLabel: "Platform",
            },
            { id: "email", label: "Email Configuration", shortLabel: "Email" },
            {
              id: "security",
              label: "Security Settings",
              shortLabel: "Security",
            },
            {
              id: "integrations",
              label: "Integrations",
              shortLabel: "Integrations",
            },
            { id: "logs", label: "System Logs", shortLabel: "Logs" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-xs sm:text-sm ${
                selectedTab === tab.id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.shortLabel}</span>
            </button>
          ))}
        </nav>
      </div>{" "}
      {/* Settings Content */}
      {selectedTab === "platform" && (
        <Card className="p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6">
            Platform Configuration
          </h2>
          {platformSettings.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {platformSettings.map((setting) => (
                <div key={setting.key}>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700">
                    {setting.label}
                  </label>
                  {renderSettingField(setting)}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-12 h-12 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <SettingsIcon className="w-6 h-6 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Platform Settings Not Available
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                The platform settings feature requires backend implementation.
                Please implement a settings management system to configure
                platform options.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4 text-left">
                <h4 className="text-sm font-medium text-blue-900 mb-2">
                  Implementation Required:
                </h4>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>• Create a settings database table</li>
                  <li>• Implement settings CRUD operations</li>
                  <li>• Add validation and default values</li>
                  <li>• Configure settings persistence</li>
                </ul>
              </div>
            </div>
          )}
        </Card>
      )}{" "}
      {selectedTab === "email" && (
        <Card className="p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6">
            Email Configuration
          </h2>
          {emailSettings.length > 0 ? (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {emailSettings.map((setting) => (
                  <div key={setting.key}>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700">
                      {setting.label}
                    </label>
                    {renderSettingField(setting)}
                  </div>
                ))}
              </div>
              <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-blue-50 rounded-lg">
                <div className="flex flex-col space-y-2 sm:flex-row sm:items-start sm:space-y-0 sm:space-x-2">
                  <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium text-blue-900">
                      Email Confirmation Disabled
                    </h3>
                    <p className="text-xs sm:text-sm text-blue-700 mt-1">
                      The platform no longer requires email confirmation for
                      user registration.
                      <br />
                      <strong>Registration Flow:</strong> Users can sign up and
                      immediately access the platform.
                      <br />
                      <strong>Benefits:</strong> Simplified user experience,
                      faster onboarding, reduced friction.
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <div className="w-12 h-12 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <SettingsIcon className="w-6 h-6 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Email Settings Not Available
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                The email notification settings feature requires backend
                implementation. Please implement a settings management system to
                configure email preferences.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4 text-left">
                <h4 className="text-sm font-medium text-blue-900 mb-2">
                  Implementation Required:
                </h4>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>• Create notification settings database table</li>
                  <li>• Implement email preference management</li>
                  <li>• Add notification system integration</li>
                  <li>• Configure SMTP settings management</li>
                </ul>
              </div>
            </div>
          )}
        </Card>
      )}{" "}
      {selectedTab === "security" && (
        <Card className="p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6">
            Security Configuration
          </h2>
          {securitySettings.length > 0 ? (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {securitySettings.map((setting) => (
                  <div key={setting.key}>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700">
                      {setting.label}
                    </label>
                    {renderSettingField(setting)}
                  </div>
                ))}
              </div>
              <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-yellow-50 rounded-lg">
                <div className="flex flex-col space-y-2 sm:flex-row sm:items-start sm:space-y-0 sm:space-x-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium text-yellow-900">
                      Security Recommendations
                    </h3>
                    <ul className="text-xs sm:text-sm text-yellow-700 mt-1 list-disc list-inside space-y-1">
                      <li>Enable 2FA for all admin accounts</li>
                      <li>Regularly rotate API keys and passwords</li>
                      <li>Monitor suspicious login activities</li>
                    </ul>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <div className="w-12 h-12 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <SettingsIcon className="w-6 h-6 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Security Settings Not Available
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                The security settings feature requires backend implementation.
                Please implement a settings management system to configure
                security options.
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 text-left">
                <h4 className="text-sm font-medium text-yellow-900 mb-2">
                  Implementation Required:
                </h4>
                <ul className="text-xs text-yellow-700 space-y-1">
                  <li>• Create security settings database table</li>
                  <li>• Implement session management settings</li>
                  <li>• Add 2FA configuration options</li>
                  <li>• Configure IP whitelisting system</li>
                </ul>
              </div>
            </div>
          )}
        </Card>
      )}{" "}
      {selectedTab === "integrations" && (
        <Card className="p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6">
            Third-party Integrations
          </h2>
          {integrationSettings.length > 0 ? (
            <>
              {" "}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {integrationSettings.map((setting) => (
                  <div key={setting.key}>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700">
                      {setting.label}
                    </label>
                    {renderSettingField(setting)}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <div className="w-12 h-12 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <SettingsIcon className="w-6 h-6 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Integration Settings Not Available
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                The integration settings feature requires backend
                implementation. Please implement a settings management system to
                configure third-party integrations.
              </p>
              <div className="bg-purple-50 border border-purple-200 rounded-md p-4 text-left">
                <h4 className="text-sm font-medium text-purple-900 mb-2">
                  Implementation Required:
                </h4>
                <ul className="text-xs text-purple-700 space-y-1">
                  <li>• Create integration settings database table</li>
                  <li>• Implement API key management system</li>
                  <li>• Add service connection testing</li>
                  <li>• Configure integration status monitoring</li>
                </ul>
              </div>
            </div>
          )}
        </Card>
      )}{" "}
      {selectedTab === "logs" && (
        <Card className="p-4 sm:p-6">
          <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 mb-4 sm:mb-6">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">
              System Logs
            </h2>
            <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
              <Button
                variant="outline"
                size="sm"
                className="text-xs sm:text-sm"
                disabled={systemLogs.length === 0}
              >
                <span className="hidden sm:inline">Download Logs</span>
                <span className="sm:hidden">Download</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs sm:text-sm"
                disabled={systemLogs.length === 0}
              >
                <span className="hidden sm:inline">Clear Logs</span>
                <span className="sm:hidden">Clear</span>
              </Button>
            </div>
          </div>
          {systemLogs.length > 0 ? (
            <>
              <div className="space-y-2">
                {systemLogs.map((log, index) => (
                  <div
                    key={index}
                    className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4 p-3 bg-gray-50 rounded-lg text-xs sm:text-sm"
                  >
                    <span className="text-gray-500 font-mono text-xs order-2 sm:order-1">
                      {log.timestamp}
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium w-fit order-1 sm:order-2 ${logLevelColors[log.level]}`}
                    >
                      {log.level}
                    </span>
                    <span className="text-gray-600 order-3">
                      [{log.module}]
                    </span>
                    <span className="text-gray-900 flex-1 order-4">
                      {log.message}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-center">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs sm:text-sm"
                >
                  Load More Logs
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <div className="w-12 h-12 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <SettingsIcon className="w-6 h-6 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                System Logs Not Available
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                The system logging feature requires backend implementation.
                Please implement a logging system to track system activities and
                events.
              </p>
              <div className="bg-gray-50 border border-gray-200 rounded-md p-4 text-left">
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                  Implementation Required:
                </h4>
                <ul className="text-xs text-gray-700 space-y-1">
                  <li>• Create system logs database table</li>
                  <li>• Implement logging service integration</li>
                  <li>• Add log level filtering and search</li>
                  <li>• Configure log retention policies</li>
                </ul>
              </div>
            </div>
          )}
        </Card>
      )}{" "}
      {/* Backup & Maintenance */}
      <Card className="p-4 sm:p-6">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
          Backup & Maintenance
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <Button
            variant="outline"
            className="h-14 sm:h-16 flex flex-col items-center justify-center space-y-1 sm:space-y-2"
          >
            <Database className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-xs sm:text-sm">Create Backup</span>
          </Button>
          <Button
            variant="outline"
            className="h-14 sm:h-16 flex flex-col items-center justify-center space-y-1 sm:space-y-2"
          >
            <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-xs sm:text-sm">Restore Data</span>
          </Button>
          <Button
            variant="outline"
            className="h-14 sm:h-16 flex flex-col items-center justify-center space-y-1 sm:space-y-2"
          >
            <Wrench className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-xs sm:text-sm">
              <span className="hidden sm:inline">Maintenance Mode</span>
              <span className="sm:hidden">Maintenance</span>
            </span>
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Settings;
