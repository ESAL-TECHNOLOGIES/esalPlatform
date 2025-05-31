import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, Button } from "@esal/ui";

interface UploadFormData {
  title: string;
  description: string;
  category: string;
  tags: string;
  status: string;
  visibility: string;
  documents: File[];
}

const Upload: React.FC = () => {
  const [formData, setFormData] = useState<UploadFormData>({
    title: "",
    description: "",
    category: "",
    tags: "",
    status: "draft",
    visibility: "private",
    documents: [],
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  // Form validation function
  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.title.trim()) {
      errors.title = "Title is required";
    } else if (formData.title.length < 5) {
      errors.title = "Title must be at least 5 characters long";
    }

    if (!formData.description.trim()) {
      errors.description = "Description is required";
    } else if (formData.description.length < 50) {
      errors.description = "Description must be at least 50 characters long";
    }

    if (!formData.category) {
      errors.category = "Please select a category";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData((prev) => ({ ...prev, documents: files }));
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    if (!validateForm()) {
      setIsLoading(false);
      return;
    }
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("Authentication required");
      }

      // Create idea data structure matching backend schema
      const ideaData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        tags: formData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0),
        status: formData.status,
        visibility: formData.visibility,
      };

      const response = await fetch(
        "http://localhost:8000/api/v1/innovator/submit-idea",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(ideaData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to upload idea");
      }

      const ideaResult = await response.json();

      // Upload files if any
      if (formData.documents.length > 0) {
        for (const file of formData.documents) {
          const fileFormData = new FormData();
          fileFormData.append("file", file);
          fileFormData.append("idea_id", ideaResult.id.toString());
          fileFormData.append("description", `Document for ${formData.title}`);

          const fileResponse = await fetch(
            "http://localhost:8000/api/v1/innovator/upload-file",
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
              },
              body: fileFormData,
            }
          );

          if (!fileResponse.ok) {
            console.warn(`Failed to upload file: ${file.name}`);
          }
        }
      }

      setSuccessMessage(
        "Idea uploaded successfully! You can now track its progress in your dashboard."
      );

      // Reset form
      setFormData({
        title: "",
        description: "",
        category: "",
        tags: "",
        status: "draft",
        visibility: "private",
        documents: [],
      });

      // Reset file input
      const fileInput = document.getElementById(
        "documents"
      ) as HTMLInputElement;
      if (fileInput) {
        fileInput.value = "";
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while uploading your idea"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    if (!validateForm()) {
      setIsLoading(false);
      return;
    }
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("Authentication required");
      }

      // Create idea data structure for draft
      const draftData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        tags: formData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0),
        status: "draft",
        visibility: "private",
      };

      const response = await fetch(
        "http://localhost:8000/api/v1/innovator/submit-idea",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(draftData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to save draft");
      }

      setSuccessMessage(
        "Draft saved successfully! You can continue editing it later."
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while saving draft"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {" "}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Upload Startup Idea
        </h1>
        <p className="text-gray-600">
          Share your innovative idea with potential investors and partners.
        </p>
      </div>
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="text-red-400">
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
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
      <Card>
        <CardHeader>
          <CardTitle>Startup Details</CardTitle>
        </CardHeader>{" "}
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Idea Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your startup idea title"
              />
              {validationErrors.title && (
                <p className="text-xs text-red-600 mt-1">
                  {validationErrors.title}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                required
                rows={4}
                value={formData.description}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe your idea in detail - the problem it solves, your solution, target market, etc."
              />
              {validationErrors.description && (
                <p className="text-xs text-red-600 mt-1">
                  {validationErrors.description}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="category"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Category *
                </label>
                <select
                  id="category"
                  name="category"
                  required
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Category</option>
                  <option value="Technology">Technology</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Finance">Finance</option>
                  <option value="Education">Education</option>
                  <option value="Retail">Retail</option>
                  <option value="Energy">Energy</option>
                  <option value="Environment">Environment</option>
                  <option value="Transportation">Transportation</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Food & Beverage">Food & Beverage</option>
                  <option value="Real Estate">Real Estate</option>
                  <option value="Agriculture">Agriculture</option>
                  <option value="Manufacturing">Manufacturing</option>
                  <option value="Other">Other</option>
                </select>
                {validationErrors.category && (
                  <p className="text-xs text-red-600 mt-1">
                    {validationErrors.category}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="visibility"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Visibility *
                </label>
                <select
                  id="visibility"
                  name="visibility"
                  required
                  value={formData.visibility}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="private">Private (Only me)</option>
                  <option value="public">Public (Visible to investors)</option>
                  <option value="limited">Limited (Selected viewers)</option>
                </select>
              </div>
            </div>

            <div>
              <label
                htmlFor="tags"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Tags
              </label>
              <input
                type="text"
                id="tags"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter tags separated by commas (e.g., AI, Machine Learning, SaaS)"
              />
              <p className="text-xs text-gray-500 mt-1">
                Add relevant keywords to help investors find your idea
              </p>
            </div>

            <div>
              <label
                htmlFor="status"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="draft">Draft (Work in progress)</option>
                <option value="active">Active (Ready for review)</option>
                <option value="published">
                  Published (Visible to investors)
                </option>
              </select>
            </div>

            <div>
              <label
                htmlFor="documents"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Upload Supporting Documents
                <span className="text-sm text-gray-500 ml-2">(Optional)</span>
              </label>
              <input
                type="file"
                id="documents"
                name="documents"
                onChange={handleFileChange}
                accept=".pdf,.ppt,.pptx,.doc,.docx,.jpg,.jpeg,.png"
                multiple
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Upload pitch decks, business plans, prototypes, or other
                relevant documents. Accepted formats: PDF, PPT, DOC, Images. Max
                10MB per file.
              </p>
              {formData.documents.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm font-medium text-gray-700">
                    Selected files:
                  </p>
                  <ul className="text-sm text-gray-600">
                    {formData.documents.map((file, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <span>📄</span>
                        <span>{file.name}</span>
                        <span className="text-gray-400">
                          ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div className="flex space-x-4">
              <Button type="submit" className="flex-1" disabled={isLoading}>
                {isLoading ? "Submitting..." : "Submit Idea"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={handleSaveDraft}
                disabled={isLoading}
              >
                {isLoading ? "Saving..." : "Save as Draft"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Upload;
