import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, Button } from "@esal/ui";
import { 
  Lightbulb, 
  Eye, 
  Calendar, 
  CheckCircle, 
  Sparkles, 
  Wrench, 
  Clock, 
  Rocket, 
  FileText, 
  Edit,
  Trash2,
  Handshake,
  Search,
  Target,
  Factory,
  TrendingUp,
  Folder,
  Users,
  Globe,
  Lock,
  Edit2,
  PenTool,
  AlignLeft,
  XCircle,
  Save
} from "lucide-react";
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

const MyIdeasUpgraded: React.FC = () => {
  const navigate = useNavigate();
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [searchTerm, setSearchTerm] = useState<string>("");

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

  // Bulk selection state
  const [selectedIdeas, setSelectedIdeas] = useState<Set<string>>(new Set());
  const [isBulkMode, setIsBulkMode] = useState(false);

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
        setSelectedIdeas((prev) => {
          const newSet = new Set(prev);
          newSet.delete(ideaId);
          return newSet;
        });

        // Show success message with toast-like notification
        showNotification("Idea deleted successfully!", "success");
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

  // Bulk delete functionality
  const handleBulkDelete = async () => {
    if (selectedIdeas.size === 0) return;

    if (
      window.confirm(
        `Are you sure you want to delete ${selectedIdeas.size} selected ideas? This action cannot be undone.`
      )
    ) {
      for (const ideaId of selectedIdeas) {
        await handleDeleteIdea(ideaId);
      }
      setSelectedIdeas(new Set());
      setIsBulkMode(false);
    }
  };

  // Create idea form validation
  const validateCreateForm = (isComplete = true) => {
    const errors: Record<string, string> = {};

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

  const handleCreateSubmit = async (isDraft = false) => {
    setIsCreating(true);
    setCreateError(null);
    setCreateSuccessMessage(null);

    if (!validateCreateForm(!isDraft)) {
      setIsCreating(false);
      return;
    }

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("Authentication required");
      }

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
      }

      // Refresh ideas list
      await fetchIdeas();

      // Close modal
      setEditingIdea(null);
      showNotification("Idea updated successfully!", "success");
    } catch (err) {
      setUpdateError(
        err instanceof Error
          ? err.message
          : "An error occurred while updating the idea"
      );
    } finally {
      setIsUpdating(false);
    }
  };
  // Enhanced notification system
  const showNotification = (message: string, notificationType: "success" | "error") => {
    // This would ideally use a toast notification library
    // For now, we'll use a simple alert
    alert(message);
  };

  // Filter and sort ideas with search
  const filteredAndSortedIdeas = React.useMemo(() => {
    let filtered = ideas;

    // Apply filter
    if (filter !== "all") {
      filtered = filtered.filter((idea) => idea.status === filter);
    }

    // Apply search
    if (searchTerm) {
      filtered = filtered.filter(
        (idea) =>
          idea.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          idea.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          idea.industry?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          idea.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          idea.tags?.some((tag) =>
            tag.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
    }

    // Apply sort
    filtered.sort((a, b) => {
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
        case "alphabetical":
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    return filtered;
  }, [ideas, filter, sortBy, searchTerm]);

  const getStatusDisplay = (status: string) => {
    const statusMap = {
      active: { label: "Active", className: "bg-green-100 text-green-800" },
      draft: { label: "Draft", className: "bg-yellow-100 text-yellow-800" },
      pending: {
        label: "Pending Review",
        className: "bg-orange-100 text-orange-800",
      },
      published: { label: "Published", className: "bg-blue-100 text-blue-800" },
      rejected: { label: "Rejected", className: "bg-red-100 text-red-800" },
    };
    return (
      statusMap[status as keyof typeof statusMap] || {
        label: status,
        className: "bg-gray-100 text-gray-800",
      }
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800)
      return `${Math.floor(diffInSeconds / 86400)}d ago`;

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusCounts = () => {
    return {
      all: ideas.length,
      active: ideas.filter((idea) => idea.status === "active").length,
      draft: ideas.filter((idea) => idea.status === "draft").length,
      pending: ideas.filter((idea) => idea.status === "pending").length,
      published: ideas.filter((idea) => idea.status === "published").length,
    };
  };

  const statusCounts = getStatusCounts();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-20 bg-gray-200 rounded"></div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">        <div className="text-center py-12">
          <div className="flex justify-center mb-4">
            <XCircle className="w-16 h-16 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Oops! Something went wrong
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button
            onClick={fetchIdeas}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
              <Lightbulb className="w-8 h-8 mr-3 text-blue-600" />
              My Ideas Dashboard
            </h1>
            <p className="text-gray-600">
              Manage, track, and showcase your innovative ideas to potential
              investors
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => setIsCreateModalOpen(true)}              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-6 py-3 font-medium"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Create New Idea
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsBulkMode(!isBulkMode)}              className="px-6 py-3"
            >
              {isBulkMode ? "Exit Bulk Mode" : (
                <>
                  <Wrench className="w-4 h-4 mr-2" />
                  Bulk Actions
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mt-6">          {[
            {
              label: "Total Ideas",
              value: statusCounts.all,
              color: "bg-blue-500",
              icon: <Lightbulb className="w-4 h-4" />,
            },
            {
              label: "Active",
              value: statusCounts.active,
              color: "bg-green-500",
              icon: <CheckCircle className="w-4 h-4" />,
            },
            {
              label: "Drafts",
              value: statusCounts.draft,
              color: "bg-yellow-500",
              icon: <FileText className="w-4 h-4" />,
            },
            {
              label: "Pending",
              value: statusCounts.pending,
              color: "bg-orange-500",
              icon: <Clock className="w-4 h-4" />,
            },
            {
              label: "Published",
              value: statusCounts.published,
              color: "bg-purple-500",
              icon: <Rocket className="w-4 h-4" />,
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-lg p-4 text-center shadow-sm"
            >              <div
                className={`inline-flex items-center justify-center w-8 h-8 ${stat.color} text-white rounded-full text-sm mb-2`}
              >
                {stat.icon}
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {stat.value}
              </div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Enhanced Search and Filters */}
      <Card className="shadow-lg">
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>              <input
                type="text"
                placeholder="Search ideas by title, description, industry, category, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                title="Search ideas"
                aria-label="Search ideas by title, description, industry, category, or tags"
              />{searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  title="Clear search"
                  aria-label="Clear search"
                >
                  <svg
                    className="h-5 w-5 text-gray-400 hover:text-gray-600"
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
              )}
            </div>

            {/* Filters and Actions */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              {/* Status Filters */}
              <div className="flex flex-wrap gap-2">
                {[
                  {
                    key: "all",
                    label: `All (${statusCounts.all})`,
                    color: "bg-blue-600",
                  },
                  {
                    key: "active",
                    label: `Active (${statusCounts.active})`,
                    color: "bg-green-600",
                  },
                  {
                    key: "draft",
                    label: `Drafts (${statusCounts.draft})`,
                    color: "bg-yellow-600",
                  },
                  {
                    key: "pending",
                    label: `Pending (${statusCounts.pending})`,
                    color: "bg-orange-600",
                  },
                  {
                    key: "published",
                    label: `Published (${statusCounts.published})`,
                    color: "bg-purple-600",
                  },
                ].map((filterOption) => (
                  <Button
                    key={filterOption.key}
                    variant={
                      filter === filterOption.key ? "primary" : "outline"
                    }
                    size="sm"
                    onClick={() => setFilter(filterOption.key)}
                    className={
                      filter === filterOption.key
                        ? `${filterOption.color} text-white`
                        : "hover:bg-gray-50"
                    }
                  >
                    {filterOption.label}
                  </Button>
                ))}
              </div>

              {/* Sort and Bulk Actions */}
              <div className="flex items-center gap-3">
                {isBulkMode && selectedIdeas.size > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                      {selectedIdeas.size} selected
                    </span>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleBulkDelete}                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Selected
                    </Button>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">
                    Sort by:
                  </span>                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    title="Sort ideas by"
                    aria-label="Sort ideas by"
                  >
                    <option value="newest">
                      <Calendar className="w-4 h-4 inline mr-2" />
                      Newest First
                    </option>
                    <option value="oldest">
                      <Calendar className="w-4 h-4 inline mr-2" />
                      Oldest First
                    </option>
                    <option value="most-viewed">
                      <Eye className="w-4 h-4 inline mr-2" />
                      Most Viewed
                    </option>
                    <option value="most-interest">
                      <Handshake className="w-4 h-4 inline mr-2" />
                      Most Interest
                    </option>
                    <option value="alphabetical">
                      <AlignLeft className="w-4 h-4 inline mr-2" />
                      A-Z
                    </option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ideas List */}
      {filteredAndSortedIdeas.length === 0 ? (
        <Card className="border-gray-200 shadow-sm">
          <CardContent className="text-center py-20">            <div className="max-w-md mx-auto">
              <div className="text-center mb-6">
                {searchTerm ? (
                  <Search className="w-20 h-20 mx-auto text-gray-400" />
                ) : filter === "all" ? (
                  <Rocket className="w-20 h-20 mx-auto text-gray-400" />
                ) : filter === "active" ? (
                  <CheckCircle className="w-20 h-20 mx-auto text-gray-400" />
                ) : filter === "draft" ? (
                  <FileText className="w-20 h-20 mx-auto text-gray-400" />
                ) : (
                  <Clock className="w-20 h-20 mx-auto text-gray-400" />
                )}
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">
                {searchTerm
                  ? `No ideas found for "${searchTerm}"`
                  : filter === "all"
                    ? "Ready to upload your first idea?"
                    : `No ${filter} ideas found`}
              </h3>
              <p className="text-gray-600 mb-8 leading-relaxed">
                {searchTerm
                  ? "Try adjusting your search terms or check the spelling."
                  : filter === "all"
                    ? "Every great startup begins with a single idea. Upload your first startup concept to get started."
                    : `You don't have any ideas with the "${filter}" status. Try a different filter or upload a new idea.`}
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                {searchTerm ? (
                  <Button
                    variant="outline"
                    onClick={() => setSearchTerm("")}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    Clear Search
                  </Button>
                ) : (                  <Button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 px-6 py-3 text-base font-medium transition-colors"
                  >
                    <Target className="w-5 h-5 mr-2" />
                    Create Your First Idea
                  </Button>
                )}
              </div>
              {filter !== "all" && !searchTerm && (
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
          {filteredAndSortedIdeas.map((idea) => {
            const statusInfo = getStatusDisplay(idea.status);
            const isSelected = selectedIdeas.has(idea.id);

            return (
              <Card
                key={idea.id}
                className={`hover:shadow-lg transition-all duration-200 border-gray-200 group ${
                  isSelected ? "ring-2 ring-blue-500 bg-blue-50" : ""
                }`}
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
                            : idea.status === "published"
                              ? "bg-purple-500"
                              : "bg-gray-400"
                    }`}
                  ></div>

                  <div className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                      <div className="flex-1 space-y-4">
                        {/* Title, Status, and Bulk Select */}
                        <div className="flex items-start gap-3">
                          {isBulkMode && (
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                const newSelected = new Set(selectedIdeas);
                                if (e.target.checked) {
                                  newSelected.add(idea.id);
                                } else {
                                  newSelected.delete(idea.id);
                                }
                                setSelectedIdeas(newSelected);
                              }}
                              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                          )}
                          <div className="flex-1">
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
                          </div>
                        </div>

                        {/* Enhanced Metadata */}
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
                          </div>                          <div className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            <span>{idea.views_count} views</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Handshake className="w-4 h-4" />
                            <span>{idea.interests_count} interests</span>
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-gray-700 leading-relaxed line-clamp-3">
                          {idea.description}
                        </p>

                        {/* Enhanced Tags and Categories */}
                        <div className="flex flex-wrap items-center gap-3 text-sm">                          {idea.industry && (
                            <div className="flex items-center text-gray-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                              <Factory className="w-4 h-4 mr-2" />
                              {idea.industry}
                            </div>
                          )}
                          {idea.stage && (
                            <div className="flex items-center text-gray-600 bg-green-50 px-3 py-1 rounded-full border border-green-200">
                              <TrendingUp className="w-4 h-4 mr-2" />
                              {idea.stage}
                            </div>
                          )}
                          {idea.category && (
                            <div className="flex items-center text-gray-600 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
                              <Folder className="w-4 h-4 mr-2" />
                              {idea.category}
                            </div>
                          )}
                          {idea.tags && idea.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {idea.tags.slice(0, 3).map((tag, index) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800"
                                >
                                  #{tag}
                                </span>
                              ))}
                              {idea.tags.length > 3 && (
                                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600">
                                  +{idea.tags.length - 3} more
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Enhanced Actions */}
                      <div className="flex flex-col gap-2 min-w-[120px]">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/ideas/${idea.id}`)}
                          className="w-full"                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditIdea(idea)}
                          className="w-full"                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteIdea(idea.id)}
                          className="w-full"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Enhanced Edit Modal */}
      {editingIdea && (        <Modal
          isOpen={true}
          onClose={() => setEditingIdea(null)}
          title={
            <div className="flex items-center gap-2">
              <Edit2 className="w-5 h-5" />
              Edit Idea
            </div>
          }
          size="lg"
        >
          <div className="space-y-6">
            {updateError && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
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
                  <div className="ml-3">
                    <p className="text-sm font-medium text-red-800">
                      {updateError}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleUpdateIdea(editingIdea.id);
              }}
              className="space-y-4"
            >
              <div>
                <label
                  htmlFor="edit-title"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Title *
                </label>
                <input
                  type="text"
                  id="edit-title"
                  value={editFormData.title}
                  onChange={(e) =>
                    setEditFormData((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="edit-description"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Description *
                </label>
                <textarea
                  id="edit-description"
                  rows={4}
                  value={editFormData.description}
                  onChange={(e) =>
                    setEditFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="edit-industry"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Industry
                  </label>
                  <input
                    type="text"
                    id="edit-industry"
                    value={editFormData.industry}
                    onChange={(e) =>
                      setEditFormData((prev) => ({
                        ...prev,
                        industry: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="edit-stage"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Stage
                  </label>
                  <select
                    id="edit-stage"
                    value={editFormData.stage}
                    onChange={(e) =>
                      setEditFormData((prev) => ({
                        ...prev,
                        stage: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select stage</option>
                    <option value="idea">Idea</option>
                    <option value="prototype">Prototype</option>
                    <option value="mvp">MVP</option>
                    <option value="growth">Growth</option>
                    <option value="scale">Scale</option>
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="edit-tags"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Tags
                </label>
                <input
                  type="text"
                  id="edit-tags"
                  value={editFormData.tags}
                  onChange={(e) =>
                    setEditFormData((prev) => ({
                      ...prev,
                      tags: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter tags separated by commas"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingIdea(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isUpdating}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isUpdating ? "Updating..." : "Update Idea"}
                </Button>
              </div>
            </form>
          </div>
        </Modal>
      )}

      {/* Enhanced Create Modal */}      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title={
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Create New Idea
          </div>
        }
        size="xl"
      >
        <div className="space-y-6">
          {createError && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
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
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800">
                    {createError}
                  </p>
                </div>
              </div>
            </div>
          )}

          {createSuccessMessage && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-green-400"
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
                  <p className="text-sm font-medium text-green-800">
                    {createSuccessMessage}
                  </p>
                </div>
              </div>
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleCreateSubmit(false);
            }}
            className="space-y-6"
          >
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
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  createValidationErrors.title
                    ? "border-red-300"
                    : "border-gray-300"
                }`}
                placeholder="Enter a compelling title for your idea"
              />
              {createValidationErrors.title && (
                <p className="mt-1 text-sm text-red-600">
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
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  createValidationErrors.description
                    ? "border-red-300"
                    : "border-gray-300"
                }`}
                placeholder="Describe your idea in detail..."
              />
              {createValidationErrors.description && (
                <p className="mt-1 text-sm text-red-600">
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
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    createValidationErrors.category
                      ? "border-red-300"
                      : "border-gray-300"
                  }`}
                >
                  <option value="">Select a category</option>
                  <option value="Technology">Technology</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Finance">Finance</option>
                  <option value="Education">Education</option>
                  <option value="Environment">Environment</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Food">Food & Beverage</option>
                  <option value="Other">Other</option>
                </select>
                {createValidationErrors.category && (
                  <p className="mt-1 text-sm text-red-600">
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
                  onChange={handleCreateInputChange}                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="private">
                    <Lock className="w-4 h-4 inline mr-2" />
                    Private (Only me)
                  </option>
                  <option value="public">
                    <Globe className="w-4 h-4 inline mr-2" />
                    Public (Visible to investors)
                  </option>
                  <option value="limited">
                    <Users className="w-4 h-4 inline mr-2" />
                    Limited (Selected viewers)
                  </option>
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
                onChange={handleCreateInputChange}                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="draft">
                  <PenTool className="w-4 h-4 inline mr-2" />
                  Draft (Work in progress)
                </option>
                <option value="active">
                  <CheckCircle className="w-4 h-4 inline mr-2" />
                  Active (Ready for review)
                </option>
                <option value="published">
                  <Rocket className="w-4 h-4 inline mr-2" />
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
              </label>
              <input
                type="file"
                id="create-documents"
                name="documents"
                onChange={handleCreateFileChange}
                accept=".pdf,.ppt,.pptx,.doc,.docx,.xls,.xlsx,.csv,.txt,.jpg,.jpeg,.png"
                multiple
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
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
                  <ul className="text-sm text-gray-600 space-y-1">
                    {createFormData.documents.map((file, index) => (
                      <li
                        key={index}
                        className="flex items-center space-x-2 bg-gray-50 p-2 rounded"
                      >
                        <span>📄</span>
                        <span className="flex-1">{file.name}</span>
                        <span className="text-gray-400">
                          ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateModalOpen(false)}
                disabled={isCreating}
              >
                Cancel
              </Button>              <Button
                type="button"
                variant="outline"
                onClick={() => handleCreateSubmit(true)}
                disabled={isCreating}
              >
                {isCreating ? "Saving..." : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save as Draft
                  </>
                )}
              </Button>              <Button
                type="submit"
                disabled={isCreating}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {isCreating ? "Creating..." : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Create Idea
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
};

export default MyIdeasUpgraded;
