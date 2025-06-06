import React, { useState } from "react";
import { Button } from "@esal/ui";

interface User {
  id: string;  // Backend uses string IDs
  email: string;
  full_name?: string;
  role: string;
  is_active: boolean;
  is_blocked: boolean;
  created_at: string;
  
  // Computed fields for UI compatibility
  name?: string;  // Derived from full_name || email
  status?: string;  // Derived from is_active/is_blocked
  joinDate?: string;  // Derived from created_at
  lastLogin?: string;  // Default or from future field
  company?: string;  // Default or from future field
  verified?: boolean;  // Default or from future field
  activityScore?: number;  // Default or computed
  profile?: {
    bio?: string;
    website?: string;
    location?: string;
    phone?: string;
  };
}

type BulkActionType = "activate" | "deactivate" | "block" | "unblock" | "delete" | "export";

interface BulkActionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedUsers: User[];
  onBulkAction: (action: BulkActionType, userIds: string[]) => Promise<void>;  // Changed from number[] to string[]
}

const BulkActionsModal: React.FC<BulkActionsModalProps> = ({
  isOpen,
  onClose,
  selectedUsers,
  onBulkAction,
}) => {
  const [selectedAction, setSelectedAction] = useState<BulkActionType | "">("");
  const [isLoading, setIsLoading] = useState(false);
  const [confirmationText, setConfirmationText] = useState("");

  const actionConfigs = {
    activate: {
      title: "Activate Users",
      description: "Activate the selected users to allow them to access the platform.",
      confirmText: "ACTIVATE",
      buttonText: "Activate Users",
      buttonClass: "bg-green-600 hover:bg-green-700",
      icon: "✓",
      requiresConfirmation: false,
    },
    deactivate: {
      title: "Deactivate Users",
      description: "Deactivate the selected users to prevent them from accessing the platform.",
      confirmText: "DEACTIVATE",
      buttonText: "Deactivate Users",
      buttonClass: "bg-yellow-600 hover:bg-yellow-700",
      icon: "⏸",
      requiresConfirmation: true,
    },
    block: {
      title: "Block Users",
      description: "Block the selected users permanently. This action can be reversed later.",
      confirmText: "BLOCK",
      buttonText: "Block Users",
      buttonClass: "bg-red-600 hover:bg-red-700",
      icon: "🚫",
      requiresConfirmation: true,
    },
    unblock: {
      title: "Unblock Users",
      description: "Unblock the selected users to restore their access.",
      confirmText: "UNBLOCK",
      buttonText: "Unblock Users",
      buttonClass: "bg-blue-600 hover:bg-blue-700",
      icon: "🔓",
      requiresConfirmation: false,
    },
    delete: {
      title: "Delete Users",
      description: "Permanently delete the selected users. This action cannot be undone!",
      confirmText: "DELETE",
      buttonText: "Delete Users",
      buttonClass: "bg-red-800 hover:bg-red-900",
      icon: "🗑",
      requiresConfirmation: true,
    },
    export: {
      title: "Export Users",
      description: "Export the selected users data to a CSV file.",
      confirmText: "EXPORT",
      buttonText: "Export Users",
      buttonClass: "bg-gray-600 hover:bg-gray-700",
      icon: "📥",
      requiresConfirmation: false,
    },
  };

  const getAvailableActions = (): BulkActionType[] => {
    const actions: BulkActionType[] = ["export"];
    
    const activeUsers = selectedUsers.filter(user => user.is_active !== false);
    const inactiveUsers = selectedUsers.filter(user => user.is_active === false);
    const blockedUsers = selectedUsers.filter(user => user.is_blocked === true);
    const unblockedUsers = selectedUsers.filter(user => user.is_blocked !== true);

    if (activeUsers.length > 0) actions.push("deactivate");
    if (inactiveUsers.length > 0) actions.push("activate");
    if (unblockedUsers.length > 0) actions.push("block");
    if (blockedUsers.length > 0) actions.push("unblock");
    
    actions.push("delete");

    return actions;
  };

  const handleActionSelect = (action: BulkActionType) => {
    setSelectedAction(action);
    setConfirmationText("");
  };

  const handleConfirm = async () => {
    if (!selectedAction) return;

    const config = actionConfigs[selectedAction];
    if (config.requiresConfirmation && confirmationText !== config.confirmText) {
      return;
    }

    setIsLoading(true);
    try {
      const userIds = selectedUsers.map(user => user.id);
      await onBulkAction(selectedAction, userIds);
      onClose();
    } catch (error) {
      console.error("Bulk action failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setSelectedAction("");
    setConfirmationText("");
    setIsLoading(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!isOpen) return null;

  const availableActions = getAvailableActions();
  const config = selectedAction ? actionConfigs[selectedAction] : null;
  const canConfirm = selectedAction && 
    (!config?.requiresConfirmation || confirmationText === config.confirmText);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Bulk Actions
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
              disabled={isLoading}
            >
              ×
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {selectedUsers.length} user{selectedUsers.length !== 1 ? 's' : ''} selected
          </p>
        </div>

        <div className="p-6">
          {!selectedAction ? (
            /* Action Selection */
            <div className="space-y-3">
              <p className="text-sm text-gray-600 mb-4">
                Choose an action to perform on the selected users:
              </p>
              
              <div className="space-y-2">
                {availableActions.map((action) => {
                  const actionConfig = actionConfigs[action];
                  return (
                    <button
                      key={action}
                      onClick={() => handleActionSelect(action)}
                      className="w-full flex items-center space-x-3 p-3 border border-gray-200 rounded-md hover:bg-gray-50 text-left transition-colors"
                    >
                      <span className="text-lg">{actionConfig.icon}</span>
                      <div>
                        <div className="font-medium text-gray-900">
                          {actionConfig.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          {actionConfig.description}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Action Confirmation */
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{config!.icon}</span>
                <div>
                  <h3 className="font-medium text-gray-900">{config!.title}</h3>
                  <p className="text-sm text-gray-600">{config!.description}</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-md p-3">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Selected Users ({selectedUsers.length}):
                </p>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {selectedUsers.map((user) => (
                    <div key={user.id} className="text-sm text-gray-600">
                      {user.full_name || user.name || user.email.split('@')[0]} ({user.email})
                    </div>
                  ))}
                </div>
              </div>

              {config!.requiresConfirmation && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type "{config!.confirmText}" to confirm:
                  </label>
                  <input
                    type="text"
                    value={confirmationText}
                    onChange={(e) => setConfirmationText(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={config!.confirmText}
                    disabled={isLoading}
                  />
                </div>
              )}

              <div className="flex space-x-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setSelectedAction("")}
                  disabled={isLoading}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={handleConfirm}
                  disabled={!canConfirm || isLoading}
                  className={`flex-1 text-white ${config!.buttonClass}`}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Processing...</span>
                    </div>
                  ) : (
                    config!.buttonText
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkActionsModal;
