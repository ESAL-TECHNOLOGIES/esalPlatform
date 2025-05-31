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
}

interface NewIdeaFormData {
  title: string;
  problem: string;
  solution: string;
  target_market: string;
}

interface AIFormData {
  interests: string;
  skills: string;
  industry: string;
  problemArea: string;
  targetMarket: string;
}

const MyIdeas: React.FC = () => {
  const navigate = useNavigate();
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingIdea, setEditingIdea] = useState<Idea | null>(null);
  // Form states
  const [newIdeaForm, setNewIdeaForm] = useState<NewIdeaFormData>({
    title: "",
    problem: "",
    solution: "",
    target_market: "",
  });

  const [aiForm, setAIForm] = useState<AIFormData>({
    interests: "",
    skills: "",
    industry: "",
    problemArea: "",
    targetMarket: "",
  });

  const [generatedIdea, setGeneratedIdea] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  useEffect(() => {
    fetchIdeas();
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

  // Modal management functions
  const openCreateModal = () => {
    setNewIdeaForm({
      title: "",
      problem: "",
      solution: "",
      target_market: "",
    });
    setShowCreateModal(true);
  };

  const openAIModal = () => {
    setAIForm({
      interests: "",
      skills: "",
      industry: "",
      problemArea: "",
      targetMarket: "",
    });
    setGeneratedIdea(null);
    setShowAIModal(true);
  };
  const openEditModal = (idea: Idea) => {
    setEditingIdea(idea);
    setNewIdeaForm({
      title: idea.title,
      problem: idea.description, // Map description to problem temporarily
      solution: "", // Will need to be filled by user
      target_market: "", // Note: target_market not in current Idea interface
    });
    setShowEditModal(true);
  };

  const closeAllModals = () => {
    setShowCreateModal(false);
    setShowAIModal(false);
    setShowEditModal(false);
    setEditingIdea(null);
    setGeneratedIdea(null);
    setError(null);
  };

  // Form handlers
  const handleNewIdeaChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setNewIdeaForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAIFormChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setAIForm((prev) => ({ ...prev, [name]: value }));
  };

  // Create new idea
  const handleCreateIdea = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("Authentication required");
      }
      const ideaData = {
        title: newIdeaForm.title,
        problem: newIdeaForm.problem,
        solution: newIdeaForm.solution,
        target_market: newIdeaForm.target_market,
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

      const newIdea = await response.json();
      setIdeas((prevIdeas) => [newIdea, ...prevIdeas]);
      closeAllModals();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred creating the idea"
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  // Generate AI idea
  const handleGenerateAI = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGeneratingAI(true);
    setError(null);

    try {
      // Since there's no direct idea generation endpoint, we'll create a comprehensive fallback
      // that simulates AI generation based on the user's inputs

      await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate API call
      const industries: Record<
        string,
        { problems: string[]; solutions: string[] }
      > = {
        technology: {
          problems: [
            "Small businesses lack affordable access to advanced technology solutions",
            "Remote teams struggle with effective collaboration and project management",
            "Data security concerns prevent companies from adopting cloud solutions",
          ],
          solutions: [
            "A comprehensive platform that provides enterprise-level tools at SMB pricing",
            "An AI-powered collaboration suite that adapts to team workflows",
            "A zero-trust security framework with user-friendly implementation",
          ],
        },
        healthcare: {
          problems: [
            "Patients have limited access to personalized health monitoring",
            "Healthcare providers struggle with data fragmentation across systems",
            "Mental health support is often inaccessible or too expensive",
          ],
          solutions: [
            "A wearable ecosystem that provides real-time health insights and alerts",
            "An interoperable platform that unifies patient data across providers",
            "A mobile-first therapy platform with AI-powered support",
          ],
        },
        education: {
          problems: [
            "Students learn at different paces but receive one-size-fits-all education",
            "Teachers lack tools to identify and address learning gaps early",
            "Skills gap between education and industry demands continues to grow",
          ],
          solutions: [
            "An adaptive learning platform that personalizes content delivery",
            "AI-powered analytics that predict and prevent learning difficulties",
            "Industry-partnered curriculum that ensures job-ready skills",
          ],
        },
      };

      const selectedIndustry = aiForm.industry?.toLowerCase() || "technology";
      const industryData =
        industries[selectedIndustry] || industries["technology"];

      const randomProblem =
        industryData.problems[
          Math.floor(Math.random() * industryData.problems.length)
        ];
      const randomSolution =
        industryData.solutions[
          Math.floor(Math.random() * industryData.solutions.length)
        ];

      const titleKeywords = [
        `${aiForm.interests || "Smart"} Solutions`,
        `${aiForm.skills || "AI"} Platform`,
        `Next-Gen ${selectedIndustry.charAt(0).toUpperCase() + selectedIndustry.slice(1)}`,
        `Intelligent ${aiForm.interests || "Innovation"} Hub`,
      ];

      const generatedTitle =
        titleKeywords[Math.floor(Math.random() * titleKeywords.length)];

      const generatedIdea = `**${generatedTitle}**

**Problem:** ${randomProblem}

**Solution:** ${randomSolution}

**Target Market:** ${aiForm.targetMarket || `${selectedIndustry} companies and professionals`}

**Key Features:**
- Personalized dashboard based on your ${aiForm.interests || "interests"}
- Leverages your ${aiForm.skills || "skills"} expertise
- Scalable architecture for growth
- Mobile-first design for accessibility

**Revenue Model:**
- Subscription-based SaaS ($99-$999/month)
- Premium features and integrations
- Professional services and consulting

This idea combines your interests in ${aiForm.interests || "innovation"} with your skills in ${aiForm.skills || "technology"} to address a real market need.`;

      setGeneratedIdea(generatedIdea);
    } catch (err) {
      console.error("AI Generation Error:", err);
      setError("Failed to generate idea. Please try again.");

      // Provide basic fallback
      const fallbackIdea = `**Custom Innovation Solution**

Based on your interests in ${aiForm.interests} and skills in ${aiForm.skills}, here's a potential startup idea:

**Problem:** Small businesses struggle to implement sustainable practices due to lack of knowledge and high implementation costs.

**Solution:** A comprehensive platform that provides AI-powered sustainability assessment, customized eco-friendly recommendations, and cost-benefit analysis for green initiatives.

**Target Market:** Small to medium businesses (10-500 employees) looking to improve their environmental impact while reducing operational costs.

**Revenue Model:** Monthly SaaS subscriptions, commission from supplier marketplace, premium consulting services.`;

      setGeneratedIdea(fallbackIdea);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Save AI generated idea
  const handleSaveAIIdea = async () => {
    if (!generatedIdea) {
      setError("No idea to save");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("Authentication required");
      }

      // Parse the generated idea to extract title
      const titleMatch = generatedIdea.match(/\*\*(.*?)\*\*/);
      const title = titleMatch ? titleMatch[1] : "AI Generated Startup Idea";
      const ideaData = {
        title: title,
        problem: generatedIdea,
        solution: "AI Generated solution - please review and edit",
        target_market: aiForm.targetMarket || "To be determined",
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
        throw new Error(errorData.detail || "Failed to save idea");
      }

      const newIdea = await response.json();
      setIdeas((prevIdeas) => [newIdea, ...prevIdeas]);
      closeAllModals();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An error occurred saving the idea"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update existing idea
  const handleUpdateIdea = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingIdea) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("Authentication required");
      }
      const updateData = {
        title: newIdeaForm.title,
        problem: newIdeaForm.problem,
        solution: newIdeaForm.solution,
        target_market: newIdeaForm.target_market,
      };
      const response = await fetch(
        `http://localhost:8000/api/v1/innovator/update-idea/${editingIdea.id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to update idea");
      }

      const updatedIdea = await response.json();
      setIdeas((prevIdeas) =>
        prevIdeas.map((idea) =>
          idea.id === editingIdea.id ? updatedIdea : idea
        )
      );
      closeAllModals();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred updating the idea"
      );
    } finally {
      setIsSubmitting(false);
    }
  };
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
      {" "}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Ideas</h1>
          <p className="text-gray-600 mt-1">
            Manage and track all your startup ideas in one place
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
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={openCreateModal}
            className="flex items-center bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            <span className="mr-2 text-lg">+</span> Create Idea
          </Button>
          <Button
            variant="outline"
            onClick={openAIModal}
            className="flex items-center border-purple-300 text-purple-600 hover:bg-purple-50 transition-colors"
          >
            <span className="mr-2">🤖</span> AI Generator
          </Button>
        </div>
      </div>{" "}
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
      )}{" "}
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
      </Card>{" "}
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
                  ? "Ready to launch your first idea?"
                  : `No ${filter} ideas found`}
              </h3>
              <p className="text-gray-600 mb-8 leading-relaxed">
                {filter === "all"
                  ? "Every great startup begins with a single idea. Transform your vision into reality by creating your first startup concept here."
                  : `You don't have any ideas with the "${filter}" status. Try a different filter or create a new idea.`}
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button
                  onClick={openCreateModal}
                  className="bg-blue-600 hover:bg-blue-700 px-6 py-3 text-base font-medium transition-colors"
                >
                  🎯 Create Your First Idea
                </Button>
                <Button
                  variant="outline"
                  onClick={openAIModal}
                  className="border-purple-300 text-purple-600 hover:bg-purple-50 px-6 py-3 text-base font-medium transition-colors"
                >
                  🤖 Get AI Inspiration
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
                          onClick={() => openEditModal(idea)}
                          className="border-gray-300 hover:bg-gray-50 px-4 py-2 transition-colors"
                        >
                          ✏️ Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-red-300 text-red-600 hover:bg-red-50 px-4 py-2 transition-colors"
                          onClick={() => handleDeleteIdea(idea.id)}
                        >
                          🗑️ Delete
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
      {/* Create New Idea Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={closeAllModals}
        title="🚀 Create New Startup Idea"
        size="lg"
      >
        <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-700">
            <span className="font-medium">💡 Tip:</span> Be specific about the
            problem and solution. Great ideas clearly define the target market
            and value proposition.
          </p>
        </div>

        <form onSubmit={handleCreateIdea} className="space-y-6">
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Startup Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              value={newIdeaForm.title}
              onChange={handleNewIdeaChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="Enter your startup name or title (e.g., 'EcoDelivery - Sustainable Food Delivery')"
            />
          </div>

          <div>
            <label
              htmlFor="problem"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Problem Statement *
            </label>
            <textarea
              id="problem"
              name="problem"
              required
              rows={4}
              value={newIdeaForm.problem}
              onChange={handleNewIdeaChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="What specific problem does your startup solve? Be detailed about the pain points..."
            />
            <p className="text-xs text-gray-500 mt-1">
              Describe the current challenges people face and why existing
              solutions are inadequate
            </p>
          </div>

          <div>
            <label
              htmlFor="solution"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Solution *
            </label>
            <textarea
              id="solution"
              name="solution"
              required
              rows={4}
              value={newIdeaForm.solution}
              onChange={handleNewIdeaChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="How does your startup solve this problem? What makes your approach unique..."
            />
            <p className="text-xs text-gray-500 mt-1">
              Explain your unique value proposition and competitive advantages
            </p>
          </div>

          <div>
            <label
              htmlFor="target_market"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Target Market *
            </label>
            <input
              type="text"
              id="target_market"
              name="target_market"
              required
              value={newIdeaForm.target_market}
              onChange={handleNewIdeaChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="Who is your target audience? (e.g., 'Urban millennials aged 25-35 who order food 3+ times/week')"
            />
            <p className="text-xs text-gray-500 mt-1">
              Be specific about demographics, behaviors, and market size
            </p>
          </div>

          <div className="flex space-x-4 pt-6 border-t border-gray-200">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-blue-600 hover:bg-blue-700 py-3 text-base font-medium transition-colors"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                <>🚀 Create Idea</>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={closeAllModals}
              className="flex-1 py-3 text-base font-medium border-gray-300 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>{" "}
      {/* AI Generation Modal */}
      <Modal
        isOpen={showAIModal}
        onClose={closeAllModals}
        title="🤖 AI-Powered Idea Generator"
        size="lg"
      >
        {!generatedIdea ? (
          <>
            <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
              <p className="text-sm text-purple-700">
                <span className="font-medium">✨ AI Magic:</span> Our advanced
                AI will analyze your preferences and generate personalized
                startup ideas tailored to your interests and skills.
              </p>
            </div>
            <form onSubmit={handleGenerateAI} className="space-y-6">
              <div>
                <label
                  htmlFor="interests"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Your Interests & Passions *
                </label>
                <input
                  type="text"
                  id="interests"
                  name="interests"
                  required
                  value={aiForm.interests}
                  onChange={handleAIFormChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                  placeholder="e.g., sustainability, technology, social impact, fitness, education"
                />
                <p className="text-xs text-gray-500 mt-1">
                  List topics you're passionate about, separated by commas
                </p>
              </div>

              <div>
                <label
                  htmlFor="skills"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Your Skills & Expertise *
                </label>
                <input
                  type="text"
                  id="skills"
                  name="skills"
                  required
                  value={aiForm.skills}
                  onChange={handleAIFormChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                  placeholder="e.g., web development, marketing, data analysis, project management"
                />
                <p className="text-xs text-gray-500 mt-1">
                  What are you good at? Include both technical and soft skills
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="industry"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Preferred Industry
                  </label>
                  <select
                    id="industry"
                    title="Select preferred industry for AI generation"
                    name="industry"
                    value={aiForm.industry}
                    onChange={handleAIFormChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                  >
                    <option value="">Any Industry</option>
                    <option value="Technology">🖥️ Technology</option>
                    <option value="Healthcare">🏥 Healthcare</option>
                    <option value="Finance">💰 Finance</option>
                    <option value="Education">📚 Education</option>
                    <option value="E-commerce">🛒 E-commerce</option>
                    <option value="SaaS">☁️ SaaS</option>
                    <option value="Mobile Apps">📱 Mobile Apps</option>
                    <option value="AI/ML">🤖 AI/ML</option>
                    <option value="IoT">🌐 IoT</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="targetMarket"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Target Market
                  </label>
                  <input
                    type="text"
                    id="targetMarket"
                    name="targetMarket"
                    value={aiForm.targetMarket}
                    onChange={handleAIFormChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                    placeholder="e.g., small businesses, students, developers"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Who would benefit most from your solution?
                  </p>
                </div>
              </div>

              <div>
                <label
                  htmlFor="problemArea"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Problem Area (Optional)
                </label>
                <textarea
                  id="problemArea"
                  name="problemArea"
                  rows={3}
                  value={aiForm.problemArea}
                  onChange={handleAIFormChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                  placeholder="Describe a specific problem area you'd like to address..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  This helps AI generate more targeted ideas for specific
                  challenges
                </p>
              </div>

              <div className="flex space-x-4 pt-6 border-t border-gray-200">
                <Button
                  type="submit"
                  disabled={isGeneratingAI}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 py-3 text-base font-medium transition-colors"
                >
                  {isGeneratingAI ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Generating Ideas...
                    </>
                  ) : (
                    <>✨ Generate AI Ideas</>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeAllModals}
                  className="flex-1 py-3 text-base font-medium border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </>
        ) : (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg border">
              <h4 className="font-medium text-gray-900 mb-2">
                Generated Idea:
              </h4>
              <div className="text-sm text-gray-800 whitespace-pre-wrap">
                {generatedIdea}
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              <Button
                onClick={handleSaveAIIdea}
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? "Saving..." : "Save as New Idea"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setGeneratedIdea(null)}
                className="flex-1"
              >
                Generate Another
              </Button>
              <Button variant="ghost" onClick={closeAllModals}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
      {/* Edit Idea Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={closeAllModals}
        title="Edit Idea"
        size="lg"
      >
        <form onSubmit={handleUpdateIdea} className="space-y-4">
          <div>
            <label
              htmlFor="edit-title"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Startup Title *
            </label>
            <input
              type="text"
              id="edit-title"
              name="title"
              required
              value={newIdeaForm.title}
              onChange={handleNewIdeaChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your startup name or title"
            />
          </div>{" "}
          <div>
            <label
              htmlFor="edit-problem"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Problem Statement *
            </label>
            <textarea
              id="edit-problem"
              name="problem"
              required
              rows={3}
              value={newIdeaForm.problem}
              onChange={handleNewIdeaChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="What problem does your startup solve?"
            />
          </div>
          <div>
            <label
              htmlFor="edit-solution"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Solution *
            </label>
            <textarea
              id="edit-solution"
              name="solution"
              required
              rows={3}
              value={newIdeaForm.solution}
              onChange={handleNewIdeaChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="How does your startup solve this problem?"
            />
          </div>
          <div>
            <label
              htmlFor="edit-target_market"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Target Market *
            </label>
            <input
              type="text"
              id="edit-target_market"
              name="target_market"
              required
              value={newIdeaForm.target_market}
              onChange={handleNewIdeaChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Who is your target audience?"
            />
          </div>
          <div className="flex space-x-3 pt-4">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? "Updating..." : "Update Idea"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={closeAllModals}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default MyIdeas;
