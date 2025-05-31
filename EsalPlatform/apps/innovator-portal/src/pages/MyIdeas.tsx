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
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Ideas</h1>
          <p className="text-gray-600">
            Manage all your startup ideas in one place
          </p>
        </div>
        <div className="flex space-x-3">
          <Button onClick={openCreateModal} className="flex items-center">
            <span className="mr-1">+</span> Add Idea
          </Button>
          <Button
            variant="secondary"
            onClick={openAIModal}
            className="flex items-center"
          >
            <span className="mr-1">🤖</span> Generate with AI
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="text-red-600 text-sm">❌ Error: {error}</div>
          </div>
        </div>
      )}

      {/* Filters and Sorting */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              <Button
                variant={filter === "all" ? "primary" : "outline"}
                size="sm"
                onClick={() => setFilter("all")}
              >
                All
              </Button>
              <Button
                variant={filter === "active" ? "primary" : "outline"}
                size="sm"
                onClick={() => setFilter("active")}
              >
                Active
              </Button>
              <Button
                variant={filter === "draft" ? "primary" : "outline"}
                size="sm"
                onClick={() => setFilter("draft")}
              >
                Drafts
              </Button>
              <Button
                variant={filter === "pending" ? "primary" : "outline"}
                size="sm"
                onClick={() => setFilter("pending")}
              >
                Pending Review
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Sort by:</span>{" "}
              <select
                title="Sort ideas"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="most-viewed">Most Viewed</option>
                <option value="most-interest">Most Interest</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ideas List */}
      {sortedIdeas.length === 0 ? (
        <Card>
          <CardContent className="text-center py-16">
            <div className="text-5xl mb-4">🚀</div>
            <h3 className="text-xl font-medium text-gray-800 mb-2">
              No ideas found
            </h3>
            <p className="text-gray-600 mb-6">
              {filter === "all"
                ? "You haven't created any ideas yet. Let's get started!"
                : `You don't have any ideas with the "${filter}" status.`}
            </p>
            <div className="flex justify-center space-x-3">
              <Button onClick={openCreateModal}>Create Your First Idea</Button>
              <Button variant="secondary" onClick={openAIModal}>
                Generate with AI
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {sortedIdeas.map((idea) => {
            const statusInfo = getStatusDisplay(idea.status);
            return (
              <Card key={idea.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3
                          className="font-bold text-lg text-gray-900 cursor-pointer hover:text-blue-600"
                          onClick={() => navigate(`/ideas/${idea.id}`)}
                        >
                          {idea.title}
                        </h3>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${statusInfo.className}`}
                        >
                          {statusInfo.label}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mb-3">
                        Created on {formatDate(idea.created_at)} • Updated{" "}
                        {formatDate(idea.updated_at)}
                      </p>
                      <p className="text-gray-700 line-clamp-2 mb-4">
                        {idea.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                        {idea.industry && (
                          <div className="flex items-center text-gray-600">
                            <span className="mr-1">🏭</span> {idea.industry}
                          </div>
                        )}
                        {idea.stage && (
                          <div className="flex items-center text-gray-600">
                            <span className="mr-1">📈</span> {idea.stage}
                          </div>
                        )}
                        <div className="flex items-center text-gray-600">
                          <span className="mr-1">👁️</span> {idea.views_count}{" "}
                          views
                        </div>
                        <div className="flex items-center text-gray-600">
                          <span className="mr-1">🤝</span>{" "}
                          {idea.interests_count} interests
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap md:flex-nowrap gap-2 self-start">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => navigate(`/ideas/${idea.id}`)}
                      >
                        View Details
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditModal(idea)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-red-300 text-red-600 hover:bg-red-50"
                        onClick={() => handleDeleteIdea(idea.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create New Idea Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={closeAllModals}
        title="Create New Idea"
        size="lg"
      >
        <form onSubmit={handleCreateIdea} className="space-y-4">
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-1"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your startup name or title"
            />
          </div>{" "}
          <div>
            <label
              htmlFor="problem"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Problem Statement *
            </label>
            <textarea
              id="problem"
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
              htmlFor="solution"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Solution *
            </label>
            <textarea
              id="solution"
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
              htmlFor="target_market"
              className="block text-sm font-medium text-gray-700 mb-1"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Who is your target audience?"
            />
          </div>
          <div className="flex space-x-3 pt-4">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? "Creating..." : "Create Idea"}
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

      {/* AI Generation Modal */}
      <Modal
        isOpen={showAIModal}
        onClose={closeAllModals}
        title="Generate Ideas with AI"
        size="lg"
      >
        {!generatedIdea ? (
          <form onSubmit={handleGenerateAI} className="space-y-4">
            <div>
              <label
                htmlFor="interests"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Your Interests *
              </label>
              <input
                type="text"
                id="interests"
                name="interests"
                required
                value={aiForm.interests}
                onChange={handleAIFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., sustainability, technology, social impact"
              />
            </div>

            <div>
              <label
                htmlFor="skills"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Your Skills *
              </label>
              <input
                type="text"
                id="skills"
                name="skills"
                required
                value={aiForm.skills}
                onChange={handleAIFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., programming, marketing, design, business development"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="industry"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Preferred Industry
                </label>{" "}
                <select
                  id="industry"
                  title="Select preferred industry for AI generation"
                  name="industry"
                  value={aiForm.industry}
                  onChange={handleAIFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Any Industry</option>
                  <option value="Technology">Technology</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Finance">Finance</option>
                  <option value="Education">Education</option>
                  <option value="E-commerce">E-commerce</option>
                  <option value="SaaS">SaaS</option>
                  <option value="Mobile Apps">Mobile Apps</option>
                  <option value="AI/ML">AI/ML</option>
                  <option value="IoT">IoT</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="targetMarket"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Target Market
                </label>
                <input
                  type="text"
                  id="targetMarket"
                  name="targetMarket"
                  value={aiForm.targetMarket}
                  onChange={handleAIFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., small businesses, students, developers"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="problemArea"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Problem Area
              </label>
              <textarea
                id="problemArea"
                name="problemArea"
                rows={3}
                value={aiForm.problemArea}
                onChange={handleAIFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe a problem area you'd like to address (optional)"
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <Button
                type="submit"
                disabled={isGeneratingAI}
                className="flex-1"
              >
                {isGeneratingAI ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Generating...
                  </>
                ) : (
                  "Generate Ideas"
                )}
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
