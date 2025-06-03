import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, Button } from "@esal/ui";
import Modal from "../components/Modal";

interface Idea {
  id: string;
  title: string;
  description: string;
  industry: string;
  stage: string;
  status: string;
  created_at: string;
  updated_at: string;
  views_count: number;
  interests_count: number;
  target_market?: string;
  problem?: string;
  solution?: string;
  category?: string;
  tags?: string[];
}

interface EditFormData {
  title: string;
  description: string;
  industry: string;
  stage: string;
  target_market: string;
  problem: string;
  solution: string;
  category: string;
  tags: string;
}

interface CreateFormData {
  title: string;
  description: string;
  category: string;
  tags: string;
  status: string;
  visibility: string;
  documents: File[];
}

const MyIdeas: React.FC = () => {
  const navigate = useNavigate();
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");
  // Edit modal state
  const [editingIdea, setEditingIdea] = useState<Idea | null>(null);
  const [editFormData, setEditFormData] = useState<EditFormData>({
    title: "",
    description: "",
    industry: "",
    stage: "",
    target_market: "",
    problem: "",
    solution: "",
    category: "",
    tags: "",
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  // Create modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createFormData, setCreateFormData] = useState<CreateFormData>({
    title: "",
    description: "",
    category: "",
    tags: "",
    status: "draft",
    visibility: "private",
    documents: [],
  });
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccessMessage, setCreateSuccessMessage] = useState<
    string | null
  >(null);
  const [createValidationErrors, setCreateValidationErrors] = useState<
    Record<string, string>
  >({});
  useEffect(() => {
    fetchIdeas();

    // Check if we should auto-open the create modal
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("create") === "true") {
      setIsCreateModalOpen(true);
      // Remove the parameter from URL without reloading
      window.history.replaceState({}, "", "/my-ideas");
    }
  }, []);

  const fetchIdeas = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(
        `http://localhost:8000/api/v1/innovator/view-ideas`,
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
        throw new Error(errorData.detail || "Failed to fetch ideas");
      }

      const ideasData = await response.json();
      setIdeas(ideasData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An error occurred fetching ideas"
      );
      console.error("Error fetching ideas:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteIdea = async (ideaId: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this idea? This action cannot be undone."
      )
    ) {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          throw new Error("Authentication required");
        }

        const response = await fetch(
          `http://localhost:8000/api/v1/innovator/delete-idea/${ideaId}`,
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
          throw new Error(errorData.detail || "Failed to delete idea");
        }

        // Remove the deleted idea from the state
        setIdeas((prevIdeas) => prevIdeas.filter((idea) => idea.id !== ideaId));

        // Show success message
        alert("Idea deleted successfully!");
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "An error occurred deleting the idea"
        );
        console.error("Error deleting idea:", err);
      }
    }
  };
  // Create idea form validation - separate for complete vs partial validation
  const validateCreateForm = (isComplete = true) => {
    const errors: Record<string, string> = {};

    // Only validate required fields for complete submission
    if (isComplete) {
      if (!createFormData.title.trim()) {
        errors.title = "Title is required";
      } else if (createFormData.title.length < 5) {
        errors.title = "Title must be at least 5 characters long";
      }

      if (!createFormData.description.trim()) {
        errors.description = "Description is required";
      } else if (createFormData.description.length < 50) {
        errors.description = "Description must be at least 50 characters long";
      }

      if (!createFormData.category) {
        errors.category = "Please select a category";
      }
    } else {
      // For partial validation, only check if fields have minimum length when filled
      if (createFormData.title.trim() && createFormData.title.length < 5) {
        errors.title = "Title must be at least 5 characters long";
      }

      if (
        createFormData.description.trim() &&
        createFormData.description.length < 50
      ) {
        errors.description = "Description must be at least 50 characters long";
      }
    }

    setCreateValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setCreateFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleCreateFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    // File size validation - 3MB limit
    const maxSizeInBytes = 3 * 1024 * 1024; // 3MB
    const oversizedFiles = files.filter((file) => file.size > maxSizeInBytes);

    if (oversizedFiles.length > 0) {
      const oversizedFileNames = oversizedFiles
        .map(
          (file) => `${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`
        )
        .join(", ");

      setCreateError(
        `The following files exceed the 3MB size limit: ${oversizedFileNames}. Please choose smaller files.`
      );

      // Clear the file input
      e.target.value = "";
      return;
    }

    // Clear any previous error
    setCreateError(null);
    setCreateFormData((prev) => ({ ...prev, documents: files }));
  };

  // Handle independent file upload without requiring complete form
  const handleFileUploadOnly = async () => {
    if (createFormData.documents.length === 0) {
      setCreateError("Please select files to upload");
      return;
    }

    setIsCreating(true);
    setCreateError(null);
    setCreateSuccessMessage(null);

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("Authentication required");
      }

      // Create a minimal draft idea if needed for file attachment
      const hasMinimalInfo =
        createFormData.title.trim() || createFormData.description.trim();

      if (!hasMinimalInfo) {
        setCreateError(
          "Please provide at least a title or description before uploading files"
        );
        return;
      }

      // Create a draft idea with available information
      const draftIdeaData = {
        title: createFormData.title.trim() || "Untitled Idea",
        description:
          createFormData.description.trim() || "Description to be added later",
        category: createFormData.category || "Other",
        tags: createFormData.tags
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
          body: JSON.stringify(draftIdeaData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.detail || "Failed to create draft for file upload"
        );
      }

      const ideaResult = await response.json();

      // Upload files
      let uploadedCount = 0;
      for (const file of createFormData.documents) {
        const fileFormData = new FormData();
        fileFormData.append("file", file);
        fileFormData.append("idea_id", ideaResult.id.toString());
        fileFormData.append(
          "description",
          `Document for ${draftIdeaData.title}`
        );

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

        if (fileResponse.ok) {
          uploadedCount++;
        } else {
          console.warn(`Failed to upload file: ${file.name}`);
        }
      }

      setCreateSuccessMessage(
        `Files uploaded successfully! ${uploadedCount} of ${createFormData.documents.length} files uploaded. A draft idea was created to attach your files.`
      );

      // Clear only the file input, keep form data
      setCreateFormData((prev) => ({ ...prev, documents: [] }));

      // Refresh ideas list
      await fetchIdeas();
    } catch (err) {
      setCreateError(
        err instanceof Error
          ? err.message
          : "An error occurred while uploading files"
      );
    } finally {
      setIsCreating(false);
    }
  };

  // Handle partial form save without file upload
  const handlePartialFormSave = async () => {
    setIsCreating(true);
    setCreateError(null);
    setCreateSuccessMessage(null);

    // Use partial validation
    if (!validateCreateForm(false)) {
      setIsCreating(false);
      return;
    }

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("Authentication required");
      }

      // Check if there's enough data to save
      const hasData =
        createFormData.title.trim() ||
        createFormData.description.trim() ||
        createFormData.category;

      if (!hasData) {
        setCreateError(
          "Please provide at least a title, description, or category to save"
        );
        setIsCreating(false);
        return;
      }

      // Create idea data with fallbacks for missing required fields
      const ideaData = {
        title: createFormData.title.trim() || "Untitled Idea",
        description:
          createFormData.description.trim() || "Description to be added later",
        category: createFormData.category || "Other",
        tags: createFormData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0),
        status: "draft",
        visibility: createFormData.visibility,
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
        throw new Error(errorData.detail || "Failed to save partial idea");
      }

      setCreateSuccessMessage(
        "Progress saved successfully! You can continue editing your idea later."
      );

      // Refresh ideas list
      await fetchIdeas();
    } catch (err) {
      setCreateError(
        err instanceof Error
          ? err.message
          : "An error occurred while saving your progress"
      );
    } finally {
      setIsCreating(false);
    }
  };
  const handleCreateSubmit = async (isDraft = false) => {
    setIsCreating(true);
    setCreateError(null);
    setCreateSuccessMessage(null);

    // Use complete validation for full submission, partial for drafts
    if (!validateCreateForm(!isDraft)) {
      setIsCreating(false);
      return;
    }

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("Authentication required");
      }

      // Create idea data structure matching backend schema
      const ideaData = {
        title: createFormData.title,
        description: createFormData.description,
        category: createFormData.category,
        tags: createFormData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0),
        status: isDraft ? "draft" : createFormData.status,
        visibility: createFormData.visibility,
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
        throw new Error(errorData.detail || "Failed to create idea");
      }

      const ideaResult = await response.json();

      // Upload files if any
      if (createFormData.documents.length > 0) {
        for (const file of createFormData.documents) {
          const fileFormData = new FormData();
          fileFormData.append("file", file);
          fileFormData.append("idea_id", ideaResult.id.toString());
          fileFormData.append(
            "description",
            `Document for ${createFormData.title}`
          );

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

      setCreateSuccessMessage(
        isDraft
          ? "Draft saved successfully! You can continue editing it later."
          : "Idea created successfully! You can now track its progress in your dashboard."
      );

      // Reset form
      setCreateFormData({
        title: "",
        description: "",
        category: "",
        tags: "",
        status: "draft",
        visibility: "private",
        documents: [],
      });

      // Refresh ideas list
      await fetchIdeas();

      // Close modal after a delay
      setTimeout(() => {
        setIsCreateModalOpen(false);
        setCreateSuccessMessage(null);
      }, 2000);
    } catch (err) {
      setCreateError(
        err instanceof Error
          ? err.message
          : "An error occurred while creating your idea"
      );
    } finally {
      setIsCreating(false);
    }
  };
  const handleEditIdea = (idea: Idea) => {
    setEditingIdea(idea);
    setEditFormData({
      title: idea.title || "",
      description: idea.description || "",
      industry: idea.industry || "",
      stage: idea.stage || "",
      target_market: idea.target_market || "",
      problem: idea.problem || "",
      solution: idea.solution || "",
      category: idea.category || "",
      tags: idea.tags?.join(", ") || "",
    });
  };

  const handleUpdateIdea = async (ideaId: string) => {
    setIsUpdating(true);
    setUpdateError(null);

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(
        `http://localhost:8000/api/v1/innovator/update-idea/${ideaId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...editFormData,
            tags: editFormData.tags.split(",").map((tag) => tag.trim()),
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to update idea");
      } // Update the idea in the state with properly formatted data
      const updatedIdeaData = {
        ...editFormData,
        tags: editFormData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0),
      };

      setIdeas((prevIdeas) =>
        prevIdeas.map((idea) =>
          idea.id === ideaId ? { ...idea, ...updatedIdeaData } : idea
        )
      );

      // Close the edit modal
      setEditingIdea(null);
      setEditFormData({
        title: "",
        description: "",
        industry: "",
        stage: "",
        target_market: "",
        problem: "",
        solution: "",
        category: "",
        tags: "",
      });

      // Show success message
      alert("Idea updated successfully!");
    } catch (err) {
      setUpdateError(
        err instanceof Error
          ? err.message
          : "An error occurred updating the idea"
      );
      console.error("Error updating idea:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  const formatDate = (dateString: string): string => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  const getStatusDisplay = (
    status: string
  ): { label: string; className: string } => {
    switch (status) {
      case "draft":
        return { label: "Draft", className: "bg-gray-100 text-gray-800" };
      case "active":
        return { label: "Active", className: "bg-green-100 text-green-800" };
      case "pending":
        return {
          label: "Pending Review",
          className: "bg-yellow-100 text-yellow-800",
        };
      case "rejected":
        return { label: "Rejected", className: "bg-red-100 text-red-800" };
      default:
        return { label: status, className: "bg-gray-100 text-gray-800" };
    }
  };

  const filteredIdeas = ideas.filter((idea) => {
    if (filter === "all") return true;
    return idea.status === filter;
  });

  const sortedIdeas = [...filteredIdeas].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      case "oldest":
        return (
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
      case "most-viewed":
        return b.views_count - a.views_count;
      case "most-interest":
        return b.interests_count - a.interests_count;
      default:
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Ideas</h1>
          <p className="text-gray-600">Loading your startup ideas...</p>
        </div>
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <div className="text-center">
            <p className="text-gray-500 text-sm">
              Fetching your brilliant ideas...
            </p>
            <p className="text-gray-400 text-xs mt-1">This won't take long</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Ideas</h1>
          <p className="text-gray-600 mt-1">
            View and manage all your startup ideas
          </p>
          <div className="flex items-center gap-6 mt-2 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              {ideas.length} Total Ideas
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              {ideas.filter((idea) => idea.status === "active").length} Active
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
              {ideas.filter((idea) => idea.status === "draft").length} Drafts
            </span>
          </div>{" "}
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            <span className="mr-2 text-lg">+</span> Create New Idea
          </Button>
        </div>
      </div>
      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-red-800">
                Something went wrong
              </h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
              <div className="mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchIdeas}
                  className="border-red-300 text-red-700 hover:bg-red-50"
                >
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Filters and Sorting */}
      <Card className="border-gray-200 shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium text-gray-700 self-center mr-2">
                Filter:
              </span>
              <Button
                variant={filter === "all" ? "primary" : "outline"}
                size="sm"
                onClick={() => setFilter("all")}
                className={
                  filter === "all"
                    ? "bg-blue-600 text-white"
                    : "hover:bg-gray-50"
                }
              >
                All Ideas ({ideas.length})
              </Button>
              <Button
                variant={filter === "active" ? "primary" : "outline"}
                size="sm"
                onClick={() => setFilter("active")}
                className={
                  filter === "active"
                    ? "bg-green-600 text-white"
                    : "hover:bg-gray-50"
                }
              >
                Active (
                {ideas.filter((idea) => idea.status === "active").length})
              </Button>
              <Button
                variant={filter === "draft" ? "primary" : "outline"}
                size="sm"
                onClick={() => setFilter("draft")}
                className={
                  filter === "draft"
                    ? "bg-yellow-600 text-white"
                    : "hover:bg-gray-50"
                }
              >
                Drafts ({ideas.filter((idea) => idea.status === "draft").length}
                )
              </Button>
              <Button
                variant={filter === "pending" ? "primary" : "outline"}
                size="sm"
                onClick={() => setFilter("pending")}
                className={
                  filter === "pending"
                    ? "bg-orange-600 text-white"
                    : "hover:bg-gray-50"
                }
              >
                Pending (
                {ideas.filter((idea) => idea.status === "pending").length})
              </Button>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700">
                Sort by:
              </span>
              <select
                title="Sort ideas"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="newest">📅 Newest First</option>
                <option value="oldest">📅 Oldest First</option>
                <option value="most-viewed">👁️ Most Viewed</option>
                <option value="most-interest">🤝 Most Interest</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Ideas List */}
      {sortedIdeas.length === 0 ? (
        <Card className="border-gray-200 shadow-sm">
          <CardContent className="text-center py-20">
            <div className="max-w-md mx-auto">
              <div className="text-8xl mb-6">
                {filter === "all"
                  ? "🚀"
                  : filter === "active"
                    ? "✅"
                    : filter === "draft"
                      ? "📝"
                      : "⏳"}
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">
                {filter === "all"
                  ? "Ready to upload your first idea?"
                  : `No ${filter} ideas found`}
              </h3>
              <p className="text-gray-600 mb-8 leading-relaxed">
                {filter === "all"
                  ? "Every great startup begins with a single idea. Upload your first startup concept to get started."
                  : `You don't have any ideas with the "${filter}" status. Try a different filter or upload a new idea.`}
              </p>{" "}
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 px-6 py-3 text-base font-medium transition-colors"
                >
                  🎯 Create Your First Idea
                </Button>
              </div>
              {filter !== "all" && (
                <div className="mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setFilter("all")}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    View All Ideas
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {sortedIdeas.map((idea) => {
            const statusInfo = getStatusDisplay(idea.status);
            return (
              <Card
                key={idea.id}
                className="hover:shadow-lg transition-all duration-200 border-gray-200 group"
              >
                <CardContent className="p-0">
                  {/* Status Bar */}
                  <div
                    className={`h-2 w-full ${
                      idea.status === "active"
                        ? "bg-green-500"
                        : idea.status === "draft"
                          ? "bg-yellow-500"
                          : idea.status === "pending"
                            ? "bg-orange-500"
                            : "bg-gray-400"
                    }`}
                  ></div>

                  <div className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                      <div className="flex-1 space-y-4">
                        {/* Title and Status */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                          <h3
                            className="font-bold text-xl text-gray-900 cursor-pointer hover:text-blue-600 transition-colors group-hover:text-blue-700"
                            onClick={() => navigate(`/ideas/${idea.id}`)}
                          >
                            {idea.title}
                          </h3>
                          <span
                            className={`px-3 py-1 text-xs font-medium rounded-full self-start ${statusInfo.className}`}
                          >
                            {statusInfo.label}
                          </span>
                        </div>

                        {/* Metadata */}
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <svg
                              className="w-4 h-4"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Created {formatDate(idea.created_at)}
                          </div>
                          <div className="flex items-center gap-1">
                            <svg
                              className="w-4 h-4"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Updated {formatDate(idea.updated_at)}
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-gray-700 leading-relaxed line-clamp-3">
                          {idea.description}
                        </p>

                        {/* Tags and Stats */}
                        <div className="flex flex-wrap items-center gap-6 text-sm">
                          {idea.industry && (
                            <div className="flex items-center text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                              <span className="mr-2">🏭</span> {idea.industry}
                            </div>
                          )}
                          {idea.stage && (
                            <div className="flex items-center text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                              <span className="mr-2">📈</span> {idea.stage}
                            </div>
                          )}
                          <div className="flex items-center text-gray-600">
                            <span className="mr-2">👁️</span> {idea.views_count}{" "}
                            views
                          </div>
                          <div className="flex items-center text-gray-600">
                            <span className="mr-2">🤝</span>{" "}
                            {idea.interests_count} interests
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-row lg:flex-col gap-3 self-start">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => navigate(`/ideas/${idea.id}`)}
                          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 transition-colors"
                        >
                          📊 View Details
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-red-300 text-red-600 hover:bg-red-50 px-4 py-2 transition-colors"
                          onClick={() => handleDeleteIdea(idea.id)}
                        >
                          🗑️ Delete
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-blue-300 text-blue-600 hover:bg-blue-50 px-4 py-2 transition-colors"
                          onClick={() => handleEditIdea(idea)}
                        >
                          ✏️ Edit
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}{" "}
      {/* Edit Idea Modal */}
      <Modal
        isOpen={!!editingIdea}
        onClose={() => setEditingIdea(null)}
        title="Edit Idea"
        size="xl"
      >
        <div className="max-h-[70vh] overflow-y-auto">
          {/* Edit Form */}
          <div className="space-y-6 pr-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={editFormData.title}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      title: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter idea title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <input
                  type="text"
                  value={editFormData.category}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      category: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter category"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={editFormData.description}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    description: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter idea description"
                rows={4}
              ></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Industry
                </label>
                <input
                  type="text"
                  value={editFormData.industry}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      industry: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter industry"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stage
                </label>
                <input
                  type="text"
                  value={editFormData.stage}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      stage: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter stage"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Market
              </label>
              <input
                type="text"
                value={editFormData.target_market}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    target_market: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter target market"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Problem
                </label>
                <textarea
                  value={editFormData.problem}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      problem: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe the problem"
                  rows={3}
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Solution
                </label>
                <textarea
                  value={editFormData.solution}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      solution: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe the solution"
                  rows={3}
                ></textarea>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags (comma separated)
              </label>
              <input
                type="text"
                value={editFormData.tags}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, tags: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter tags separated by commas (e.g., fintech, mobile, startup)"
              />
            </div>
          </div>
        </div>

        {/* Modal Footer with Actions */}
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={() => setEditingIdea(null)}
            className="px-6"
            disabled={isUpdating}
          >
            Cancel
          </Button>{" "}
          <Button
            variant="primary"
            onClick={() => editingIdea?.id && handleUpdateIdea(editingIdea.id)}
            className="px-6"
            disabled={isUpdating || !editingIdea?.id}
          >
            {isUpdating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Updating...
              </>
            ) : (
              "Update Idea"
            )}
          </Button>
        </div>

        {/* Error Message */}
        {updateError && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{updateError}</p>
          </div>
        )}
      </Modal>
      {/* Create Idea Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Startup Idea"
        size="lg"
      >
        <div className="space-y-6">
          {createError && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="text-red-400">
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{createError}</p>
                </div>
              </div>
            </div>
          )}

          {createSuccessMessage && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <div className="flex">
                <div className="text-green-400">
                  <svg
                    className="h-5 w-5"
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
                <div className="ml-3">
                  <p className="text-sm text-green-700">
                    {createSuccessMessage}
                  </p>
                </div>
              </div>
            </div>
          )}

          <form className="space-y-6">
            <div>
              <label
                htmlFor="create-title"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Idea Title *
              </label>
              <input
                type="text"
                id="create-title"
                name="title"
                required
                value={createFormData.title}
                onChange={handleCreateInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your startup idea title"
              />
              {createValidationErrors.title && (
                <p className="text-xs text-red-600 mt-1">
                  {createValidationErrors.title}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="create-description"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Description *
              </label>
              <textarea
                id="create-description"
                name="description"
                required
                rows={4}
                value={createFormData.description}
                onChange={handleCreateInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe your idea in detail - the problem it solves, your solution, target market, etc."
              />
              {createValidationErrors.description && (
                <p className="text-xs text-red-600 mt-1">
                  {createValidationErrors.description}
                </p>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="create-category"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Category *
                </label>
                <select
                  id="create-category"
                  name="category"
                  required
                  value={createFormData.category}
                  onChange={handleCreateInputChange}
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
                {createValidationErrors.category && (
                  <p className="text-xs text-red-600 mt-1">
                    {createValidationErrors.category}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="create-visibility"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Visibility *
                </label>
                <select
                  id="create-visibility"
                  name="visibility"
                  required
                  value={createFormData.visibility}
                  onChange={handleCreateInputChange}
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
                htmlFor="create-tags"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Tags
              </label>
              <input
                type="text"
                id="create-tags"
                name="tags"
                value={createFormData.tags}
                onChange={handleCreateInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter tags separated by commas (e.g., AI, Machine Learning, SaaS)"
              />
              <p className="text-xs text-gray-500 mt-1">
                Add relevant keywords to help investors find your idea
              </p>
            </div>
            <div>
              <label
                htmlFor="create-status"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Status
              </label>
              <select
                id="create-status"
                name="status"
                value={createFormData.status}
                onChange={handleCreateInputChange}
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
                htmlFor="create-documents"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Upload Supporting Documents
                <span className="text-sm text-gray-500 ml-2">(Optional)</span>
              </label>{" "}
              <input
                type="file"
                id="create-documents"
                name="documents"
                onChange={handleCreateFileChange}
                accept=".pdf,.ppt,.pptx,.doc,.docx,.xls,.xlsx,.csv,.txt,.jpg,.jpeg,.png"
                multiple
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />{" "}
              <p className="text-xs text-gray-500 mt-1">
                Upload pitch decks, business plans, prototypes, data files, or
                other relevant documents. Accepted formats: PDF, PPT, DOC,
                Excel, CSV, TXT, Images. Max 3MB per file.
              </p>
              {createFormData.documents.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm font-medium text-gray-700">
                    Selected files:
                  </p>
                  <ul className="text-sm text-gray-600">
                    {createFormData.documents.map((file, index) => (
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
            </div>{" "}
            {/* Independent Action Buttons */}
            <div className="space-y-4">
              {/* File Upload and Form Save - Independent Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleFileUploadOnly}
                  disabled={isCreating || createFormData.documents.length === 0}
                  className="w-full"
                >
                  {isCreating
                    ? "Uploading..."
                    : `Upload Files Only (${createFormData.documents.length})`}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePartialFormSave}
                  disabled={
                    isCreating ||
                    (!createFormData.title.trim() &&
                      !createFormData.description.trim())
                  }
                  className="w-full"
                >
                  {isCreating ? "Saving..." : "Save Progress"}
                </Button>
              </div>

              {/* Divider with text */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">
                    or create complete idea
                  </span>
                </div>
              </div>

              {/* Main Creation Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button
                  type="button"
                  onClick={() => handleCreateSubmit(false)}
                  className="w-full"
                  disabled={isCreating}
                >
                  {isCreating ? "Creating..." : "Create Idea"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleCreateSubmit(true)}
                  disabled={isCreating}
                  className="w-full"
                >
                  {isCreating ? "Saving..." : "Save as Draft"}
                </Button>
              </div>

              {/* Helper Text */}
              <div className="text-xs text-gray-500 space-y-1">
                <p>
                  <strong>Upload Files Only:</strong> Upload files with minimal
                  form data (requires title or description)
                </p>
                <p>
                  <strong>Save Progress:</strong> Save your current form
                  progress without creating a complete idea
                </p>
                <p>
                  <strong>Create Idea:</strong> Create a complete idea with full
                  validation
                </p>
                <p>
                  <strong>Save as Draft:</strong> Save as draft with all current
                  data
                </p>
              </div>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
};

export default MyIdeas;
