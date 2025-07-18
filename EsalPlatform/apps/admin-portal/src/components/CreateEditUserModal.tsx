import React, { useState, useEffect } from "react";
import { Button } from "@esal/ui";

interface User {
  id: string; // Backend uses string IDs
  email: string;
  full_name?: string;
  role: string;
  is_active: boolean;
  is_blocked: boolean;
  created_at: string;

  // Computed fields for UI compatibility
  name?: string; // Derived from full_name || email
  status?: string; // Derived from is_active/is_blocked
  joinDate?: string; // Derived from created_at
  lastLogin?: string; // Default or from future field
  company?: string; // Default or from future field
  verified?: boolean; // Default or from future field
  activityScore?: number; // Default or computed
  profile?: {
    bio?: string;
    website?: string;
    location?: string;
    phone?: string;
  };
}

interface CreateEditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: User | null;
  onSave: (userData: Partial<User>) => Promise<void>;
}

const CreateEditUserModal: React.FC<CreateEditUserModalProps> = ({
  isOpen,
  onClose,
  user,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "innovator",
    company: "",
    full_name: "",
    bio: "",
    website: "",
    location: "",
    phone: "",
    is_active: true,
    verified: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditMode = !!user;
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        role: user.role || "innovator",
        company: user.company || "",
        full_name: user.full_name || "",
        bio: user.profile?.bio || "",
        website: user.profile?.website || "",
        location: user.profile?.location || "",
        phone: user.profile?.phone || "",
        is_active: user.is_active ?? true,
        verified: user.verified || false,
      });
    } else {
      // Reset form for new user
      setFormData({
        name: "",
        email: "",
        role: "innovator",
        company: "",
        full_name: "",
        bio: "",
        website: "",
        location: "",
        phone: "",
        is_active: true,
        verified: false,
      });
    }
    setErrors({});
  }, [user, isOpen]);
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Name validation (required)
    if (!formData.name.trim()) {
      newErrors.name = "Display name is required";
    } else if (formData.name.length < 2) {
      newErrors.name = "Display name must be at least 2 characters";
    }

    // Email validation (required and format)
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Full name validation (optional but if provided, should be valid)
    if (formData.full_name && formData.full_name.length < 2) {
      newErrors.full_name = "Full name must be at least 2 characters";
    }

    // Company validation (optional - removed required validation since not all users need company)
    if (formData.company && formData.company.length < 2) {
      newErrors.company = "Company name must be at least 2 characters";
    }

    // Website validation (optional but if provided, should be valid URL)
    if (formData.website && !/^https?:\/\/.+\..+/.test(formData.website)) {
      newErrors.website =
        "Please enter a valid website URL (http:// or https://)";
    }

    // Phone validation (optional but if provided, should be valid)
    if (formData.phone && !/^[\+]?[0-9\s\-\(\)]{10,}$/.test(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number";
    }

    // Bio validation (optional but reasonable length)
    if (formData.bio && formData.bio.length > 500) {
      newErrors.bio = "Bio must be less than 500 characters";
    }

    // Role validation (must be valid option)
    const validRoles = ["innovator", "investor", "hub", "admin"];
    if (!validRoles.includes(formData.role)) {
      newErrors.role = "Please select a valid role";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      // Prepare data for backend API
      const userData: Partial<User> = {
        // Core user fields (match backend schema)
        email: formData.email.trim(),
        full_name: formData.full_name.trim() || formData.name.trim(),
        role: formData.role,
        is_active: formData.is_active,

        // Frontend compatibility fields
        name: formData.name.trim(),
        company: formData.company.trim(),
        verified: formData.verified,
        profile: {
          bio: formData.bio.trim(),
          website: formData.website.trim(),
          location: formData.location.trim(),
          phone: formData.phone.trim(),
        },
      };

      // Only include ID for edit mode
      if (isEditMode && user) {
        userData.id = user.id;
      }

      await onSave(userData);
      onClose();
    } catch (error) {
      console.error("Error saving user:", error);
      // Show more specific error messages
      if (error instanceof Error) {
        if (error.message.includes("already exists")) {
          setErrors({ email: "A user with this email already exists" });
        } else if (error.message.includes("Invalid")) {
          setErrors({
            submit: "Invalid data provided. Please check your inputs.",
          });
        } else {
          setErrors({ submit: error.message });
        }
      } else {
        setErrors({ submit: "Failed to save user. Please try again." });
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {isEditMode ? "Edit User" : "Create New User"}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-600 text-sm">{errors.submit}</p>
            </div>
          )}

          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Display Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.name ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="Enter display name"
                />
                {errors.name && (
                  <p className="text-red-600 text-sm mt-1">{errors.name}</p>
                )}
              </div>{" "}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) =>
                    setFormData({ ...formData, full_name: e.target.value })
                  }
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.full_name ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="Enter full legal name"
                />
                {errors.full_name && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.full_name}
                  </p>
                )}
                <p className="text-gray-500 text-xs mt-1">
                  This will be used for official documents and communications
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.email ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="Enter email address"
                  disabled={isEditMode} // Email shouldn't be editable in edit mode
                />
                {errors.email && (
                  <p className="text-red-600 text-sm mt-1">{errors.email}</p>
                )}
              </div>{" "}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role *
                </label>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  aria-label="Select user role"
                >
                  <option value="innovator">Innovator</option>
                  <option value="investor">Investor</option>
                  <option value="hub">Hub</option>
                  <option value="admin">Admin</option>
                </select>
              </div>{" "}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company/Organization
                </label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) =>
                    setFormData({ ...formData, company: e.target.value })
                  }
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.company ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="Enter company or organization name"
                />
                {errors.company && (
                  <p className="text-red-600 text-sm mt-1">{errors.company}</p>
                )}
                <p className="text-gray-500 text-xs mt-1">
                  Optional - User's affiliated company or organization
                </p>
              </div>
            </div>
          </div>

          {/* Profile Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Profile Information
            </h3>
            <div className="space-y-4">
              {" "}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bio
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData({ ...formData, bio: e.target.value })
                  }
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.bio ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="Enter user bio (optional)"
                  maxLength={500}
                />
                {errors.bio && (
                  <p className="text-red-600 text-sm mt-1">{errors.bio}</p>
                )}
                <p className="text-gray-500 text-xs mt-1">
                  {formData.bio.length}/500 characters
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Website
                  </label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) =>
                      setFormData({ ...formData, website: e.target.value })
                    }
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.website ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="https://example.com"
                  />
                  {errors.website && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.website}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter location"
                  />
                </div>{" "}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.phone ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="Enter phone number (optional)"
                  />
                  {errors.phone && (
                    <p className="text-red-600 text-sm mt-1">{errors.phone}</p>
                  )}
                  <p className="text-gray-500 text-xs mt-1">
                    Include country code if international
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Account Settings */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Account Settings
            </h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) =>
                    setFormData({ ...formData, is_active: e.target.checked })
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="is_active"
                  className="ml-2 block text-sm text-gray-900"
                >
                  Active account
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="verified"
                  checked={formData.verified}
                  onChange={(e) =>
                    setFormData({ ...formData, verified: e.target.checked })
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="verified"
                  className="ml-2 block text-sm text-gray-900"
                >
                  Verified account
                </label>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="min-w-[100px]"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </div>
              ) : isEditMode ? (
                "Update User"
              ) : (
                "Create User"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEditUserModal;
