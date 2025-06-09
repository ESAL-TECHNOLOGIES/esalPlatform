import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, Button } from "@esal/ui";
import { checkAndConsumeUsage, requireFeature } from "../utils/subscription";
import { API_BASE_URL } from "../config/api";
import {
  Zap,
  Target,
  Settings,
  Scale,
  Lightbulb,
  Wrench,
  Save,
  Rocket,
  Edit3,
  Brain,
  DollarSign,
  Trophy,
  BarChart3,
  Cog,
  TrendingUp,
  Bot,
  Search,
  Users,
  Briefcase,
  Megaphone,
  Trash2,
  Clock,
  Copy,
  Dumbbell,
  AlertTriangle,
  CheckCircle,
  Edit2,
} from "lucide-react";

interface Idea {
  id: string;
  title: string;
  description: string;
  problem?: string;
  solution?: string;
  target_market?: string;
  ai_score?: number;
  category?: string;
  status?: string;
  visibility?: string;
}

interface AIResponse {
  response_text: string;
  suggestions?: string[];
  confidence_score?: number;
  generated_at: string;
  metadata?: {
    saved_to_database?: boolean;
    saved_idea_id?: string;
    [key: string]: any;
  };
}

interface AIJudgment {
  overall_score: number;
  strengths: string[];
  weaknesses: string[];
  improvement_suggestions: string[];
  market_viability: number;
  technical_feasibility: number;
  business_potential: number;
  generated_at: string;
}

const AIGenerator: React.FC = () => {
  // Active tab state
  const [activeTab, setActiveTab] = useState<
    "generate" | "finetune" | "judge" | "recommendations"
  >("generate");
  // Form states for different tabs
  const [generateForm, setGenerateForm] = useState({
    interests: "",
    skills: "",
    industry: "",
    problem_area: "",
    target_market: "",
    save_to_database: true,
  });

  const [finetuneForm, setFinetuneForm] = useState({
    idea_id: "",
    current_content: "",
    improvement_focus: "problem_statement",
    additional_context: "",
  });

  const [judgeForm, setJudgeForm] = useState({
    idea_id: "",
    title: "",
    problem: "",
    solution: "",
    target_market: "",
  });

  const [recommendationsForm, setRecommendationsForm] = useState({
    focus_area: "general",
  });

  // Response states
  const [aiResponse, setAiResponse] = useState<AIResponse | null>(null);
  const [aiJudgment, setAiJudgment] = useState<AIJudgment | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // User ideas for dropdowns
  const [userIdeas, setUserIdeas] = useState<Idea[]>([]); // Fetch user ideas for dropdowns
  const fetchUserIdeas = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) return;
      const response = await fetch(
        `${API_BASE_URL}/api/v1/innovator/view-ideas`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const ideas = await response.json();
        setUserIdeas(ideas);
      }
    } catch (err) {
      console.error("Error fetching user ideas:", err);
    }
  };

  useEffect(() => {
    fetchUserIdeas();
  }, []);

  // Generic form change handler
  const handleFormChange = (
    formType: "generate" | "finetune" | "judge" | "recommendations",
    field: string,
    value: string
  ) => {
    switch (formType) {
      case "generate":
        setGenerateForm((prev) => ({ ...prev, [field]: value }));
        break;
      case "finetune":
        setFinetuneForm((prev) => ({ ...prev, [field]: value }));
        break;
      case "judge":
        setJudgeForm((prev) => ({ ...prev, [field]: value }));
        break;
      case "recommendations":
        setRecommendationsForm((prev) => ({ ...prev, [field]: value }));
        break;
    }
  };

  // Handle idea selection for finetune and judge tabs
  const handleIdeaSelection = (
    ideaId: string,
    formType: "finetune" | "judge"
  ) => {
    const selectedIdea = userIdeas.find((idea) => idea.id === ideaId);
    if (selectedIdea) {
      if (formType === "finetune") {
        setFinetuneForm((prev) => ({
          ...prev,
          idea_id: ideaId,
          current_content: selectedIdea.description || "",
        }));
      } else {
        setJudgeForm((prev) => ({
          ...prev,
          idea_id: ideaId,
          title: selectedIdea.title,
          problem: selectedIdea.problem || "",
          solution: selectedIdea.solution || "",
          target_market: selectedIdea.target_market || "",
        }));
      }
    }
  };
  // API call handlers
  const handleGenerateIdea = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check subscription limits before proceeding
    if (
      !checkAndConsumeUsage("ideas_per_month", () => {
        setError(
          "You've reached your monthly limit for idea generation. Please upgrade your subscription."
        );
      })
    ) {
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("Authentication required");
      }
      const response = await fetch(
        `${API_BASE_URL}/api/v1/innovator/ai/generate-idea`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(generateForm),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to generate idea");
      }

      const result = await response.json();
      setAiResponse(result);
      setSuccessMessage("AI has generated a new startup idea for you!");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while generating the idea"
      );
    } finally {
      setIsLoading(false);
    }
  };
  const handleFineTuneIdea = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if premium features are available for advanced AI operations
    if (
      !requireFeature("ai_matching", () => {
        setError(
          "Fine-tuning requires a premium subscription. Please upgrade to access advanced AI features."
        );
      })
    ) {
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("Authentication required");
      }
      const response = await fetch(
        `${API_BASE_URL}/api/v1/innovator/ai/fine-tune`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(finetuneForm),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to fine-tune idea");
      }

      const result = await response.json();
      setAiResponse(result);
      setSuccessMessage("AI has provided suggestions to improve your idea!");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while fine-tuning the idea"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleJudgeIdea = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("Authentication required");
      }
      const response = await fetch(
        `${API_BASE_URL}/api/v1/innovator/ai/judge-idea`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(judgeForm),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to judge idea");
      }

      const result = await response.json();
      setAiJudgment(result);
      setSuccessMessage(
        "AI has evaluated your idea and provided detailed feedback!"
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while judging the idea"
      );
    } finally {
      setIsLoading(false);
    }
  };
  const handleGetRecommendations = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("Authentication required");
      }

      // Prepare the request with user ideas
      const requestData = {
        user_id: "", // This will be set by the backend from the token
        current_ideas: userIdeas
          .map((idea) => `${idea.title}: ${idea.description || ""}`)
          .filter((ideaText) => ideaText.length > 10),
        focus_area: recommendationsForm.focus_area,
      };
      const response = await fetch(
        `${API_BASE_URL}/api/v1/innovator/ai/recommendations`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to get recommendations");
      }

      const result = await response.json();
      setAiResponse(result);
      setSuccessMessage(
        "AI has generated personalized recommendations based on your idea portfolio!"
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while getting recommendations"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const clearResults = () => {
    setAiResponse(null);
    setAiJudgment(null);
    setSuccessMessage(null);
    setError(null);
  };

  // Handle manual save of AI-generated idea
  const handleSaveIdeaManually = async () => {
    if (!aiResponse || !aiResponse.response_text) {
      setError("No AI-generated idea to save");
      return;
    }

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("Authentication required");
      }

      // Parse the AI response to extract meaningful parts for idea creation
      const aiText = aiResponse.response_text;

      // Try to extract title from the AI response (look for bold text or first line)
      const titleMatch =
        aiText.match(/\*\*(.*?)\*\*/) || aiText.match(/^([^\n]+)/);
      const extractedTitle = titleMatch
        ? titleMatch[1].replace(/[*#]/g, "").trim()
        : "AI Generated Startup Idea";

      // Create structured idea from AI response
      const ideaData = {
        title: extractedTitle.substring(0, 100), // Limit title length
        description: aiText,
        problem: `Based on interests: ${generateForm.interests}${generateForm.problem_area ? `. Problem focus: ${generateForm.problem_area}` : ""}`,
        solution: "AI-generated solution - please review and refine this idea",
        target_market: generateForm.target_market || "To be determined",
        category: generateForm.industry || "Technology",
        tags: [generateForm.industry, "AI-Generated"].filter(Boolean),
      };
      const response = await fetch(
        `${API_BASE_URL}/api/v1/innovator/submit-idea`,
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
      const savedIdea = await response.json();

      // Update the AI response metadata to indicate it's been saved
      setAiResponse((prev) => ({
        ...prev!,
        metadata: {
          ...prev?.metadata,
          saved_to_database: true,
          saved_idea_id: savedIdea.id,
        },
      }));

      setSuccessMessage("Idea saved successfully to your portfolio!");

      // Refresh user ideas list
      fetchUserIdeas();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while saving the idea"
      );
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        {/* Enhanced Header with Gradient */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 rounded-2xl p-6 sm:p-8 lg:p-10 text-white">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                {" "}
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <Bot className="w-6 h-6" />
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
                  AI Innovation Hub
                </h1>
              </div>
              <p className="text-blue-100 text-lg sm:text-xl mb-4 max-w-3xl">
                Unleash the power of artificial intelligence to generate,
                refine, and evaluate your startup ideas. Transform your
                entrepreneurial vision into reality with AI-powered insights.
              </p>
              <div className="flex flex-wrap gap-3">
                {" "}
                <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-sm">
                  <Brain className="w-4 h-4" />
                  <span>Smart Generation</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-sm">
                  <Zap className="w-4 h-4" />
                  <span>Real-time Analysis</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-sm">
                  <Target className="w-4 h-4" />
                  <span>Personalized Insights</span>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-3 lg:min-w-[200px]">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                <div className="text-2xl font-bold">{userIdeas.length}</div>
                <div className="text-blue-100 text-sm">Your Ideas</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                <div className="text-2xl font-bold">∞</div>
                <div className="text-blue-100 text-sm">AI Powered</div>
              </div>
            </div>
          </div>
        </div>
        {/* Error and Success Messages */}
        {error && (
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
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        {successMessage && (
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
                <p className="text-sm text-green-700">{successMessage}</p>
              </div>
            </div>
          </div>
        )}{" "}
        {/* Enhanced Tab Navigation - Mobile Responsive */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <nav className="grid grid-cols-2 md:grid-cols-4 gap-0">
            {" "}
            {[
              {
                id: "generate",
                name: "Generate Ideas",
                shortName: "Generate",
                icon: <Brain className="w-5 h-5" />,
                color: "blue",
                description: "Create new startup ideas",
              },
              {
                id: "finetune",
                name: "Fine-tune Ideas",
                shortName: "Fine-tune",
                icon: <Settings className="w-5 h-5" />,
                color: "green",
                description: "Improve existing ideas",
              },
              {
                id: "judge",
                name: "Judge Your Ideas",
                shortName: "Judge",
                icon: <Scale className="w-5 h-5" />,
                color: "purple",
                description: "Get AI evaluation & scoring",
              },
              {
                id: "recommendations",
                name: "Get Recommendations",
                shortName: "Insights",
                icon: <Lightbulb className="w-5 h-5" />,
                color: "orange",
                description: "Strategic portfolio insights",
              },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as typeof activeTab);
                  clearResults();
                }}
                className={`p-3 sm:p-4 md:p-6 border-b-3 transition-all duration-200 hover:bg-gray-50 ${
                  activeTab === tab.id
                    ? `border-${tab.color}-500 bg-${tab.color}-50 text-${tab.color}-700`
                    : "border-transparent text-gray-600 hover:text-gray-800"
                }`}
              >
                {" "}
                <div className="flex flex-col items-center text-center gap-2">
                  <div
                    className={`text-xl sm:text-2xl md:text-3xl transition-transform duration-200 ${
                      activeTab === tab.id ? "scale-110" : "hover:scale-105"
                    }`}
                  >
                    {tab.icon}
                  </div>
                  <div>
                    <div
                      className={`text-xs sm:text-sm md:text-base font-medium ${
                        activeTab === tab.id ? "text-current" : "text-gray-700"
                      }`}
                    >
                      <span className="hidden sm:inline">{tab.name}</span>
                      <span className="sm:hidden">{tab.shortName}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1 hidden md:block">
                      {tab.description}
                    </div>{" "}
                  </div>
                </div>
              </button>
            ))}
          </nav>
        </div>
        {/* Enhanced Content Area - Mobile Responsive */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Input Form - Takes 2 columns on XL screens, mobile responsive */}{" "}
          <div className="xl:col-span-2 order-2 xl:order-1">
            <Card className="shadow-lg border-0 bg-white rounded-2xl overflow-hidden">
              <div
                className={`${
                  activeTab === "generate"
                    ? "bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200"
                    : activeTab === "finetune"
                      ? "bg-gradient-to-r from-green-50 to-green-100 border-green-200"
                      : activeTab === "judge"
                        ? "bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200"
                        : "bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200"
                } border-b px-6 py-4`}
              >
                <CardHeader>
                  <div className="flex items-center gap-3 text-xl">
                    <CardTitle>
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${
                          activeTab === "generate"
                            ? "bg-blue-200 text-blue-700"
                            : activeTab === "finetune"
                              ? "bg-green-200 text-green-700"
                              : activeTab === "judge"
                                ? "bg-purple-200 text-purple-700"
                                : "bg-orange-200 text-orange-700"
                        }`}
                      >
                        {activeTab === "generate" && (
                          <Brain className="w-5 h-5" />
                        )}
                        {activeTab === "finetune" && (
                          <Settings className="w-5 h-5" />
                        )}
                        {activeTab === "judge" && <Scale className="w-5 h-5" />}
                        {activeTab === "recommendations" && (
                          <Lightbulb className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        {activeTab === "generate" && "Generate New Ideas"}
                        {activeTab === "finetune" && "Fine-tune Existing Ideas"}
                        {activeTab === "judge" && "Judge Your Ideas"}
                        {activeTab === "recommendations" &&
                          "Get Personalized Recommendations"}
                      </div>
                    </CardTitle>
                  </div>
                </CardHeader>{" "}
              </div>
              <CardContent className="p-6 lg:p-8">
                {/* Generate Tab */}
                {activeTab === "generate" && (
                  <form onSubmit={handleGenerateIdea} className="space-y-6">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                      <div className="flex items-start gap-4">
                        {" "}
                        <div className="w-12 h-12 bg-blue-200 rounded-xl flex items-center justify-center">
                          <Brain className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-bold text-blue-900 text-lg mb-2">
                            AI Idea Generator
                          </h4>
                          <p className="text-blue-800 text-sm leading-relaxed">
                            Provide your interests, skills, and preferences
                            below. Our AI will analyze this information and
                            generate personalized startup ideas tailored
                            specifically for you.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-2">
                          Your Interests *
                          <span className="font-normal text-xs text-gray-600 ml-2">
                            (Be specific for better results)
                          </span>
                        </label>
                        <textarea
                          value={generateForm.interests}
                          onChange={(e) =>
                            handleFormChange(
                              "generate",
                              "interests",
                              e.target.value
                            )
                          }
                          required
                          rows={4}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                          placeholder="e.g., sustainable technology, renewable energy, AI automation, fintech, healthtech, edtech"
                        />{" "}
                        <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                          <Lightbulb className="w-4 h-4" />
                          What topics, industries, or areas are you passionate
                          about?
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-2">
                          Your Skills & Expertise *
                          <span className="font-normal text-xs text-gray-600 ml-2">
                            (Include both technical and soft skills)
                          </span>
                        </label>
                        <textarea
                          value={generateForm.skills}
                          onChange={(e) =>
                            handleFormChange(
                              "generate",
                              "skills",
                              e.target.value
                            )
                          }
                          required
                          rows={4}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                          placeholder="e.g., software development (Python, React), digital marketing, data analysis, UI/UX design, project management"
                        />{" "}
                        <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                          <Wrench className="w-4 h-4" />
                          What are you good at? Include programming languages,
                          tools, and experience.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-800 mb-2">
                            Preferred Industry
                          </label>{" "}
                          <select
                            value={generateForm.industry}
                            onChange={(e) =>
                              handleFormChange(
                                "generate",
                                "industry",
                                e.target.value
                              )
                            }
                            aria-label="Preferred Industry"
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                          >
                            <option value="">Any Industry</option>
                            <option value="technology">
                              Technology & Software
                            </option>
                            <option value="healthcare">
                              Healthcare & Biotech
                            </option>
                            <option value="finance">Finance & Fintech</option>
                            <option value="education">
                              Education & Edtech
                            </option>
                            <option value="retail">Retail & E-commerce</option>
                            <option value="energy">Energy & Cleantech</option>
                            <option value="entertainment">
                              Entertainment & Media
                            </option>
                            <option value="transportation">
                              Transportation & Mobility
                            </option>
                            <option value="agriculture">
                              Agriculture & Food
                            </option>
                            <option value="real-estate">
                              Real Estate & Proptech
                            </option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-800 mb-2">
                            Preferred Target Market
                          </label>{" "}
                          <select
                            value={generateForm.target_market}
                            onChange={(e) =>
                              handleFormChange(
                                "generate",
                                "target_market",
                                e.target.value
                              )
                            }
                            aria-label="Preferred Target Market"
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                          >
                            <option value="">Any Market</option>
                            <option value="small businesses">
                              Small Businesses (SMB)
                            </option>
                            <option value="enterprise">
                              Enterprise / Large Companies
                            </option>
                            <option value="consumers">Consumers / B2C</option>
                            <option value="students">
                              Students & Educators
                            </option>
                            <option value="developers">
                              Developers & Technical Users
                            </option>
                            <option value="seniors">Seniors (55+)</option>
                            <option value="millennials">
                              Millennials (25-40)
                            </option>
                            <option value="gen-z">Gen Z (18-25)</option>
                            <option value="startups">
                              Startups & Entrepreneurs
                            </option>
                            <option value="nonprofits">
                              Nonprofits & NGOs
                            </option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-2">
                          Problem Areas You Care About
                          <span className="font-normal text-xs text-gray-600 ml-2">
                            (What problems do you want to solve?)
                          </span>
                        </label>
                        <textarea
                          value={generateForm.problem_area}
                          onChange={(e) =>
                            handleFormChange(
                              "generate",
                              "problem_area",
                              e.target.value
                            )
                          }
                          rows={4}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                          placeholder="e.g., climate change, digital divide, mental health, productivity, remote work challenges, data privacy"
                        />{" "}
                        <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                          <Target className="w-4 h-4" />
                          What societal, business, or technical problems do you
                          want to address?
                        </p>
                      </div>

                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
                        <div className="flex items-start space-x-3">
                          <input
                            type="checkbox"
                            id="save_to_database"
                            checked={generateForm.save_to_database}
                            onChange={(e) =>
                              setGenerateForm((prev) => ({
                                ...prev,
                                save_to_database: e.target.checked,
                              }))
                            }
                            className="mt-1 h-5 w-5 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                          />
                          <label htmlFor="save_to_database" className="flex-1">
                            {" "}
                            <div className="flex items-center gap-2 text-green-800 font-semibold mb-1">
                              <Save className="w-4 h-4" />
                              <span>
                                Save generated idea to my ideas portfolio
                              </span>
                            </div>
                            <div className="text-xs text-green-700">
                              Recommended: This will add the AI-generated idea
                              to your ideas list for future reference
                            </div>
                          </label>
                        </div>
                      </div>

                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
                      >
                        {" "}
                        {isLoading ? (
                          <div className="flex items-center justify-center gap-3">
                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                            <span className="flex items-center gap-2">
                              <Brain className="w-4 h-4" />
                              Generating Ideas...
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-2">
                            <Rocket className="w-5 h-5" />
                            <span>Generate New Startup Ideas</span>
                          </div>
                        )}
                      </Button>

                      <div className="text-center">
                        <div className="text-xs text-gray-500 bg-gray-50 px-4 py-2 rounded-lg inline-block">
                          Our AI will analyze your profile and generate 1-3
                          personalized startup ideas
                        </div>{" "}
                      </div>
                    </div>
                  </form>
                )}

                {/* Fine-tune Tab */}
                {activeTab === "finetune" && (
                  <form onSubmit={handleFineTuneIdea} className="space-y-6">
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
                      <div className="flex items-start gap-4">
                        {" "}
                        <div className="w-12 h-12 bg-green-200 rounded-xl flex items-center justify-center text-2xl">
                          <Settings className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-green-800 mb-2 text-lg">
                            AI Idea Fine-tuning
                          </h4>
                          <p className="text-sm text-green-700 leading-relaxed">
                            Select an existing idea and choose which aspect you
                            want to improve. Our AI will provide specific,
                            actionable recommendations to strengthen your
                            concept.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-2">
                          Select Idea to Fine-tune *
                          <span className="font-normal text-xs text-gray-600 ml-2">
                            ({userIdeas.length} ideas available)
                          </span>
                        </label>{" "}
                        <select
                          value={finetuneForm.idea_id}
                          onChange={(e) =>
                            handleIdeaSelection(e.target.value, "finetune")
                          }
                          required
                          aria-label="Select Idea to Fine-tune"
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white"
                        >
                          <option value="">Choose an idea to improve...</option>
                          {userIdeas.map((idea) => (
                            <option key={idea.id} value={idea.id}>
                              {idea.title}
                              {idea.ai_score &&
                                ` (AI Score: ${idea.ai_score}/10)`}
                            </option>
                          ))}
                        </select>{" "}
                        <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                          <Lightbulb className="w-4 h-4" />
                          {userIdeas.length === 0
                            ? "No ideas found. Create an idea first to use fine-tuning."
                            : `Select from your ${userIdeas.length} existing ideas to improve`}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-2">
                          Current Content
                          <span className="font-normal text-xs text-gray-600 ml-2">
                            (Auto-filled from selected idea)
                          </span>{" "}
                        </label>
                        <textarea
                          value={finetuneForm.current_content}
                          onChange={(e) =>
                            handleFormChange(
                              "finetune",
                              "current_content",
                              e.target.value
                            )
                          }
                          rows={5}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 resize-none"
                          placeholder="Select an idea above to see its description here. You can also edit this content before fine-tuning..."
                        />{" "}
                        <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                          <Edit3 className="w-4 h-4" />
                          Edit the content if needed - AI will use this as the
                          base for improvements
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-2">
                          Improvement Focus Area *
                          <span className="font-normal text-xs text-gray-600 ml-2">
                            (What specific aspect needs improvement?)
                          </span>
                        </label>{" "}
                        <select
                          value={finetuneForm.improvement_focus}
                          onChange={(e) =>
                            handleFormChange(
                              "finetune",
                              "improvement_focus",
                              e.target.value
                            )
                          }
                          aria-label="Improvement Focus Area"
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white"
                        >
                          {" "}
                          <option value="problem_statement">
                            Problem Statement - Define the problem more clearly
                          </option>
                          <option value="solution_design">
                            Solution Design - Improve the proposed solution
                          </option>
                          <option value="target_market">
                            Target Market - Refine market identification
                          </option>{" "}
                          <option value="business_model">
                            Business Model - Strengthen revenue strategy
                          </option>
                          <option value="competitive_advantage">
                            Competitive Advantage - Identify unique strengths
                          </option>
                          <option value="market_analysis">
                            Market Analysis - Deep dive into market opportunity
                          </option>
                          <option value="technical_feasibility">
                            Technical Feasibility - Assess implementation
                            challenges
                          </option>
                          <option value="financial_projections">
                            Financial Projections - Improve financial planning
                          </option>
                          <option value="go_to_market">
                            Go-to-Market Strategy - Plan market entry
                          </option>
                        </select>
                        <p className="text-xs text-gray-500 mt-1">
                          Choose the area where you want the most improvement
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Additional Context & Specific Requests
                          <span className="text-xs text-gray-500 ml-1">
                            (Optional but recommended)
                          </span>
                        </label>
                        <textarea
                          value={finetuneForm.additional_context}
                          onChange={(e) =>
                            handleFormChange(
                              "finetune",
                              "additional_context",
                              e.target.value
                            )
                          }
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Provide specific guidance for AI improvements, e.g.:
• Focus on B2B enterprise customers
• Include sustainability aspects
• Consider mobile-first approach
• Address privacy concerns
• Include international expansion plans"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          More specific context leads to better, more targeted
                          AI recommendations
                        </p>
                      </div>
                      {/* Improvement Focus Guidelines */}
                      {finetuneForm.improvement_focus && (
                        <div className="bg-blue-50 p-4 rounded-lg">
                          {" "}
                          <h5 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                            <Lightbulb className="w-4 h-4" />
                            What AI will help you improve:
                          </h5>
                          <div className="text-sm text-blue-700">
                            {finetuneForm.improvement_focus ===
                              "problem_statement" && (
                              <ul className="list-disc list-inside space-y-1">
                                <li>
                                  Clarify the core problem and pain points
                                </li>
                                <li>Quantify the problem's impact and scope</li>
                                <li>Identify specific user frustrations</li>
                                <li>Validate problem-market fit evidence</li>
                              </ul>
                            )}
                            {finetuneForm.improvement_focus ===
                              "solution_design" && (
                              <ul className="list-disc list-inside space-y-1">
                                <li>Refine the core solution approach</li>
                                <li>
                                  Suggest technical implementation options
                                </li>
                                <li>Identify key features and functionality</li>
                                <li>Address potential solution limitations</li>
                              </ul>
                            )}
                            {finetuneForm.improvement_focus ===
                              "target_market" && (
                              <ul className="list-disc list-inside space-y-1">
                                <li>Define specific customer segments</li>
                                <li>Identify early adopters and champions</li>
                                <li>Analyze market size and accessibility</li>
                                <li>Suggest market entry strategies</li>
                              </ul>
                            )}
                            {finetuneForm.improvement_focus ===
                              "business_model" && (
                              <ul className="list-disc list-inside space-y-1">
                                <li>Explore revenue model options</li>
                                <li>Analyze pricing strategies</li>
                                <li>Identify key partnerships and channels</li>
                                <li>Assess scalability potential</li>
                              </ul>
                            )}
                            {finetuneForm.improvement_focus ===
                              "competitive_advantage" && (
                              <ul className="list-disc list-inside space-y-1">
                                <li>Identify unique value propositions</li>
                                <li>Analyze competitive landscape</li>
                                <li>Suggest differentiation strategies</li>
                                <li>Highlight sustainable advantages</li>
                              </ul>
                            )}
                            {finetuneForm.improvement_focus ===
                              "market_analysis" && (
                              <ul className="list-disc list-inside space-y-1">
                                <li>Deep dive into market trends</li>
                                <li>Identify growth opportunities</li>
                                <li>Analyze market timing and readiness</li>
                                <li>Assess regulatory and external factors</li>
                              </ul>
                            )}
                            {finetuneForm.improvement_focus ===
                              "technical_feasibility" && (
                              <ul className="list-disc list-inside space-y-1">
                                <li>
                                  Assess technical implementation challenges
                                </li>
                                <li>Suggest technology stack options</li>
                                <li>Identify development milestones</li>
                                <li>Address scalability and performance</li>
                              </ul>
                            )}
                            {finetuneForm.improvement_focus ===
                              "financial_projections" && (
                              <ul className="list-disc list-inside space-y-1">
                                <li>Improve revenue forecasting</li>
                                <li>
                                  Analyze cost structure and unit economics
                                </li>
                                <li>Suggest funding requirements</li>
                                <li>Identify key financial metrics</li>
                              </ul>
                            )}{" "}
                            {finetuneForm.improvement_focus ===
                              "go_to_market" && (
                              <ul className="list-disc list-inside space-y-1">
                                <li>Develop launch strategy and timeline</li>
                                <li>Identify marketing channels and tactics</li>
                                <li>Plan customer acquisition approach</li>
                                <li>Suggest partnership opportunities</li>
                              </ul>
                            )}
                          </div>
                        </div>
                      )}
                      <Button
                        type="submit"
                        disabled={isLoading || !finetuneForm.idea_id}
                        className="w-full bg-green-600 hover:bg-green-700"
                      >
                        {" "}
                        {isLoading ? (
                          <div className="flex items-center justify-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <Settings className="w-4 h-4" />
                            Analyzing & Fine-tuning...
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-2">
                            <Rocket className="w-4 h-4" />
                            Get AI Improvement Recommendations
                          </div>
                        )}
                      </Button>{" "}
                      <div className="text-xs text-gray-500 text-center">
                        AI will analyze your idea and provide specific,
                        actionable improvements for the selected focus area
                      </div>
                    </div>
                  </form>
                )}

                {/* Judge Tab */}
                {activeTab === "judge" && (
                  <form onSubmit={handleJudgeIdea} className="space-y-6">
                    <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-6 rounded-xl border border-purple-200">
                      <div className="flex items-start gap-4">
                        {" "}
                        <div className="w-12 h-12 bg-purple-200 rounded-xl flex items-center justify-center text-2xl">
                          <Scale className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-purple-800 mb-2 text-lg">
                            AI Idea Evaluation & Scoring
                          </h4>
                          <p className="text-sm text-purple-700 leading-relaxed">
                            Get comprehensive AI analysis of your idea including
                            market viability, technical feasibility, and
                            business potential with detailed scoring.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-2">
                          Select Idea to Judge *
                          <span className="font-normal text-xs text-gray-600 ml-2">
                            ({userIdeas.length} ideas available)
                          </span>
                        </label>{" "}
                        <select
                          value={judgeForm.idea_id}
                          onChange={(e) =>
                            handleIdeaSelection(e.target.value, "judge")
                          }
                          required
                          aria-label="Select Idea to Judge"
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white"
                        >
                          <option value="">
                            Choose an idea to evaluate...
                          </option>
                          {userIdeas.map((idea) => (
                            <option key={idea.id} value={idea.id}>
                              {idea.title}
                            </option>
                          ))}
                        </select>{" "}
                        <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                          <Target className="w-4 h-4" />
                          Select an idea to receive comprehensive AI evaluation
                          and scoring
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-800 mb-2">
                            Title
                            <span className="font-normal text-xs text-gray-600 ml-2">
                              (Auto-filled)
                            </span>
                          </label>
                          <input
                            type="text"
                            value={judgeForm.title}
                            onChange={(e) =>
                              handleFormChange("judge", "title", e.target.value)
                            }
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-gray-50"
                            readOnly
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-800 mb-2">
                            Problem Statement
                            <span className="font-normal text-xs text-gray-600 ml-2">
                              (Editable)
                            </span>
                          </label>
                          <textarea
                            value={judgeForm.problem}
                            onChange={(e) =>
                              handleFormChange(
                                "judge",
                                "problem",
                                e.target.value
                              )
                            }
                            rows={3}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 resize-none"
                            placeholder="Describe the problem your idea solves..."
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-800 mb-2">
                            Solution
                            <span className="font-normal text-xs text-gray-600 ml-2">
                              (Editable)
                            </span>
                          </label>
                          <textarea
                            value={judgeForm.solution}
                            onChange={(e) =>
                              handleFormChange(
                                "judge",
                                "solution",
                                e.target.value
                              )
                            }
                            rows={3}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 resize-none"
                            placeholder="Describe your solution approach..."
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-2">
                          Target Market
                          <span className="font-normal text-xs text-gray-600 ml-2">
                            (Editable)
                          </span>
                        </label>
                        <input
                          type="text"
                          value={judgeForm.target_market}
                          onChange={(e) =>
                            handleFormChange(
                              "judge",
                              "target_market",
                              e.target.value
                            )
                          }
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                          placeholder="Who is your target audience?"
                        />{" "}
                      </div>
                    </div>
                    <Button
                      type="submit"
                      disabled={isLoading || !judgeForm.idea_id}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {" "}
                      {isLoading ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <Brain className="w-4 h-4" />
                          Evaluating Idea...
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <Scale className="w-4 h-4" />
                          Judge Idea
                        </div>
                      )}
                    </Button>{" "}
                    <div className="text-xs text-gray-500 text-center">
                      AI will provide comprehensive evaluation including market
                      viability, technical feasibility, and business potential
                      with detailed scoring
                    </div>
                  </form>
                )}

                {/* Recommendations Tab */}
                {activeTab === "recommendations" && (
                  <form
                    onSubmit={handleGetRecommendations}
                    className="space-y-6"
                  >
                    <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-6 rounded-xl border border-orange-200">
                      <div className="flex items-start gap-4">
                        {" "}
                        <div className="w-12 h-12 bg-orange-200 rounded-xl flex items-center justify-center">
                          <Lightbulb className="w-6 h-6 text-orange-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-orange-800 mb-2 text-lg">
                            AI Strategy Recommendations
                          </h4>
                          <p className="text-sm text-orange-700 leading-relaxed">
                            Get personalized strategic recommendations based on
                            your entire ideas portfolio. AI will analyze
                            patterns, identify opportunities, and suggest next
                            steps for growth.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                        {" "}
                        <h5 className="font-semibold text-blue-800 mb-4 flex items-center gap-2">
                          <BarChart3 className="w-5 h-5" />
                          Portfolio Overview
                        </h5>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center py-2 border-b border-blue-200">
                            <span className="text-sm text-blue-700">
                              Total Ideas:
                            </span>
                            <span className="font-semibold text-blue-900 text-lg">
                              {userIdeas.length}
                            </span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-blue-200">
                            <span className="text-sm text-blue-700">
                              Categories:
                            </span>
                            <span className="font-semibold text-blue-900 text-lg">
                              {new Set(
                                userIdeas
                                  .map((idea) => idea.category)
                                  .filter(Boolean)
                              ).size || 0}
                            </span>
                          </div>
                          <div className="flex justify-between items-center py-2">
                            <span className="text-sm text-blue-700">
                              Avg AI Score:
                            </span>
                            <span className="font-semibold text-blue-900 text-lg">
                              {userIdeas.length > 0
                                ? (
                                    userIdeas.reduce(
                                      (sum, idea) => sum + (idea.ai_score || 0),
                                      0
                                    ) / userIdeas.length
                                  ).toFixed(1)
                                : "N/A"}
                              /10
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
                        {" "}
                        <h5 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
                          <Search className="w-4 h-4" />
                          Recent Activity
                        </h5>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div className="flex justify-between">
                            <span>Latest Idea:</span>
                            <span className="font-medium text-right max-w-32 truncate">
                              {userIdeas.length > 0
                                ? userIdeas[userIdeas.length - 1].title
                                : "None"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Draft Ideas:</span>
                            <span className="font-medium">
                              {
                                userIdeas.filter(
                                  (idea) => idea.status === "draft"
                                ).length
                              }
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Public Ideas:</span>
                            <span className="font-medium">
                              {
                                userIdeas.filter(
                                  (idea) => idea.visibility === "public"
                                ).length
                              }
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>{" "}
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">
                        Recommendation Focus Area *
                        <span className="font-normal text-xs text-gray-600 ml-2">
                          (What area needs the most attention?)
                        </span>
                      </label>{" "}
                      <select
                        value={recommendationsForm.focus_area}
                        onChange={(e) =>
                          handleFormChange(
                            "recommendations",
                            "focus_area",
                            e.target.value
                          )
                        }
                        required
                        aria-label="Recommendation Focus Area"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 bg-white"
                      >
                        <option value="general">
                          {" "}
                          <Target className="w-4 h-4 mr-2" />
                          General Strategy - Overall portfolio improvement
                        </option>
                        <option value="market_analysis">
                          {" "}
                          <BarChart3 className="w-4 h-4 mr-2" />
                          Market Analysis - Market opportunities & sizing
                        </option>
                        <option value="competition">
                          {" "}
                          <Trophy className="w-4 h-4 mr-2" />
                          Competitive Landscape - Competitor analysis &
                          positioning
                        </option>
                        <option value="funding">
                          {" "}
                          <DollarSign className="w-4 h-4 mr-2" />
                          Funding Strategy - Investment readiness & sources
                        </option>
                        <option value="team_building">
                          {" "}
                          <Users className="w-4 h-4 mr-2" />
                          Team Building - Hiring & partnership strategies
                        </option>{" "}
                        <option value="product_development">
                          <Cog className="w-4 h-4 inline mr-2" />
                          Product Development - Technical roadmap & MVP
                        </option>
                        <option value="marketing_strategy">
                          {" "}
                          <Megaphone className="w-4 h-4 mr-2" />
                          Marketing Strategy - Customer acquisition & branding
                        </option>
                        <option value="business_model">
                          {" "}
                          <Briefcase className="w-4 h-4 mr-2" />
                          Business Model - Revenue streams & scalability
                        </option>{" "}
                        <option value="risk_management">
                          <AlertTriangle className="w-4 h-4 inline mr-2" />
                          Risk Management - Challenges & mitigation strategies
                        </option>
                        <option value="scaling">
                          {" "}
                          <TrendingUp className="w-4 h-4 mr-2" />
                          Growth & Scaling - Expansion and growth strategies
                        </option>
                      </select>
                    </div>
                    {/* Focus Area Guidelines */}
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h5 className="font-medium text-blue-800 mb-2">
                        <Lightbulb className="w-4 h-4 mr-2" />
                        What you'll get based on your focus:
                      </h5>
                      <div className="text-sm text-blue-700">
                        {recommendationsForm.focus_area === "general" && (
                          <ul className="list-disc list-inside space-y-1">
                            <li>Portfolio-wide pattern analysis and themes</li>
                            <li>Cross-idea synergies and opportunities</li>
                            <li>Strategic priorities for next 3-6 months</li>
                            <li>Skill development recommendations</li>
                            <li>Networking and partnership suggestions</li>
                          </ul>
                        )}
                        {recommendationsForm.focus_area ===
                          "market_analysis" && (
                          <ul className="list-disc list-inside space-y-1">
                            <li>Market size and opportunity assessment</li>
                            <li>Customer segment identification</li>
                            <li>Market entry strategies</li>
                            <li>Trends and timing analysis</li>
                            <li>Geographic expansion opportunities</li>
                          </ul>
                        )}
                        {recommendationsForm.focus_area === "competition" && (
                          <ul className="list-disc list-inside space-y-1">
                            <li>Competitive landscape mapping</li>
                            <li>Differentiation opportunities</li>
                            <li>White space identification</li>
                            <li>Competitive advantage development</li>
                            <li>Market positioning strategies</li>
                          </ul>
                        )}
                        {recommendationsForm.focus_area === "funding" && (
                          <ul className="list-disc list-inside space-y-1">
                            <li>Investment readiness assessment</li>
                            <li>Funding stage and amount recommendations</li>
                            <li>Investor type and criteria matching</li>
                            <li>Pitch deck optimization suggestions</li>
                            <li>Alternative funding sources</li>
                          </ul>
                        )}
                        {recommendationsForm.focus_area === "team_building" && (
                          <ul className="list-disc list-inside space-y-1">
                            <li>Key roles and hiring priorities</li>
                            <li>Co-founder compatibility analysis</li>
                            <li>Advisory board recommendations</li>
                            <li>Equity and compensation strategies</li>
                            <li>Team culture and management tips</li>
                          </ul>
                        )}
                        {recommendationsForm.focus_area ===
                          "product_development" && (
                          <ul className="list-disc list-inside space-y-1">
                            <li>MVP definition and feature prioritization</li>
                            <li>Technical architecture recommendations</li>
                            <li>Development timeline and milestones</li>
                            <li>Technology stack suggestions</li>
                            <li>Quality assurance and testing strategies</li>
                          </ul>
                        )}
                        {recommendationsForm.focus_area ===
                          "marketing_strategy" && (
                          <ul className="list-disc list-inside space-y-1">
                            <li>Target audience definition and personas</li>
                            <li>Marketing channel recommendations</li>
                            <li>Content strategy and messaging</li>
                            <li>Brand positioning and identity</li>
                            <li>Customer acquisition cost optimization</li>
                          </ul>
                        )}
                        {recommendationsForm.focus_area ===
                          "business_model" && (
                          <ul className="list-disc list-inside space-y-1">
                            <li>Revenue model optimization</li>
                            <li>Pricing strategy development</li>
                            <li>Cost structure analysis</li>
                            <li>Partnership and distribution channels</li>
                            <li>Scalability and unit economics</li>
                          </ul>
                        )}
                        {recommendationsForm.focus_area ===
                          "risk_management" && (
                          <ul className="list-disc list-inside space-y-1">
                            <li>Risk identification and assessment</li>
                            <li>Mitigation strategies and contingency plans</li>
                            <li>Market and regulatory risk analysis</li>
                            <li>Technical and operational risk management</li>
                            <li>Financial risk and cash flow planning</li>
                          </ul>
                        )}
                        {recommendationsForm.focus_area === "scaling" && (
                          <ul className="list-disc list-inside space-y-1">
                            <li>Growth strategy and expansion planning</li>
                            <li>Scalability bottlenecks identification</li>
                            <li>International expansion opportunities</li>
                            <li>Operational efficiency improvements</li>
                            <li>Exit strategy considerations</li>
                          </ul>
                        )}
                      </div>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <div className="flex items-start space-x-2">
                        <Lightbulb className="w-4 h-4 text-yellow-600" />
                        <div className="text-sm text-yellow-800">
                          <p className="font-medium mb-1">
                            Smart Portfolio Analysis:
                          </p>
                          <p>
                            AI will analyze your {userIdeas.length} idea
                            {userIdeas.length !== 1 ? "s" : ""} to identify
                            patterns, gaps, and opportunities. The more detailed
                            your ideas, the better the recommendations!
                            {userIdeas.length === 0 && (
                              <span className="block mt-2 text-red-600 font-medium flex items-center gap-1">
                                <AlertTriangle className="w-4 h-4" />
                                You need at least one idea to get
                                recommendations. Create an idea first!
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                    <Button
                      type="submit"
                      disabled={isLoading || userIdeas.length === 0}
                      className="w-full bg-purple-600 hover:bg-purple-700"
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          <Brain className="w-4 h-4 mr-2" />
                          Analyzing Portfolio...
                        </>
                      ) : (
                        <>
                          <Target className="w-4 h-4 mr-2" />
                          Get Strategic Recommendations
                        </>
                      )}
                    </Button>
                    <div className="text-xs text-gray-500 text-center">
                      AI will provide personalized strategic recommendations
                      based on your
                      {userIdeas.length} idea{userIdeas.length !== 1 ? "s" : ""}{" "}
                      and selected focus area
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
          {/* Enhanced Results Panel - Takes 1 column on XL screens, mobile responsive */}
          <div className="xl:col-span-1 order-1 xl:order-2">
            <Card className="shadow-lg border-0 bg-white rounded-2xl overflow-hidden h-fit sticky top-4">
              {" "}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 px-6 py-4">
                <CardHeader>
                  <div className="flex items-center gap-3 text-xl">
                    <div className="w-10 h-10 bg-gray-200 text-gray-700 rounded-xl flex items-center justify-center text-xl">
                      <Bot className="w-5 h-5" />
                    </div>
                    <div className="font-semibold text-gray-800">
                      AI Results
                    </div>
                    {(aiResponse || aiJudgment) && (
                      <div className="ml-auto">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={clearResults}
                          className="text-xs px-3 py-1"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Clear
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
              </div>
              <CardContent className="p-6">
                {!aiResponse && !aiJudgment && !isLoading && (
                  <div className="text-center py-12">
                    <div className="mb-6">
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Bot className="w-8 h-8" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        Ready to Assist
                      </h3>
                      <p className="text-gray-600 text-sm max-w-xs mx-auto">
                        Choose an AI feature and submit the form to see
                        intelligent insights and suggestions!
                      </p>
                    </div>

                    {/* Feature highlights */}
                    <div className="grid grid-cols-1 gap-3 mt-6">
                      <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg text-left">
                        <Brain className="w-5 h-5" />
                        <div className="text-sm">
                          <div className="font-medium text-blue-800">
                            Generate Ideas
                          </div>
                          <div className="text-blue-600">
                            AI creates personalized startup concepts
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg text-left">
                        <Wrench className="w-5 h-5" />
                        <div className="text-sm">
                          <div className="font-medium text-green-800">
                            Fine-tune
                          </div>
                          <div className="text-green-600">
                            Improve specific aspects of your ideas
                          </div>
                        </div>
                      </div>{" "}
                      <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg text-left">
                        <Scale className="w-5 h-5 text-purple-600" />
                        <div className="text-sm">
                          <div className="font-medium text-purple-800">
                            Judge
                          </div>
                          <div className="text-purple-600">
                            Get detailed AI evaluation scores
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {isLoading && (
                  <div className="text-center py-12">
                    <div className="mb-6">
                      <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        AI Processing
                      </h3>
                      <p className="text-gray-600 text-sm">
                        Our AI is analyzing your request and generating
                        personalized insights...
                      </p>
                    </div>

                    {/* Processing steps animation */}
                    <div className="space-y-2 text-left max-w-xs mx-auto">
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                        <span>Analyzing your input...</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-300"></div>
                        <span>Generating insights...</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <div className="w-2 h-2 bg-blue-300 rounded-full animate-pulse delay-500"></div>
                        <span>Preparing recommendations...</span>
                      </div>
                    </div>
                  </div>
                )}
                {/* AI Response Display */}
                {aiResponse && (
                  <div className="space-y-4">
                    {activeTab === "generate" && (
                      <div className="bg-gradient-to-r from-blue-50 to-green-50 p-6 rounded-lg border border-blue-200">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                            <Brain className="w-4 h-4 mr-2" />
                            AI-Generated Startup Idea
                          </h3>
                          {aiResponse.metadata?.saved_to_database && (
                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                              <Save className="w-4 h-4 mr-2" />
                              Saved to Portfolio
                            </span>
                          )}
                        </div>

                        <div className="prose prose-sm max-w-none">
                          <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                            {aiResponse.response_text}
                          </div>
                        </div>

                        <div className="mt-4 flex items-center justify-between">
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            {aiResponse.confidence_score && (
                              <span className="flex items-center gap-1">
                                <BarChart3 className="w-4 h-4 mr-2" />
                                Confidence:{" "}
                                {Math.round(aiResponse.confidence_score * 100)}%
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4 mr-2" />
                              Generated:{" "}
                              {new Date(
                                aiResponse.generated_at
                              ).toLocaleString()}
                            </span>
                          </div>

                          {!aiResponse.metadata?.saved_to_database && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSaveIdeaManually()}
                              className="text-xs"
                            >
                              <Save className="w-4 h-4 mr-2" />
                              Save to Portfolio
                            </Button>
                          )}
                        </div>
                      </div>
                    )}{" "}
                    {activeTab !== "generate" && (
                      <div className="space-y-4">
                        {/* Fine-tune specific display */}
                        {activeTab === "finetune" && (
                          <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg border border-green-200">
                            <div className="flex items-center justify-between mb-4">
                              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                                <Wrench className="w-4 h-4 mr-2" />
                                AI Fine-tuning Recommendations
                              </h3>
                              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                Focus:{" "}
                                {finetuneForm.improvement_focus
                                  .replace(/_/g, " ")
                                  .replace(/\b\w/g, (l) => l.toUpperCase())}
                              </span>
                            </div>

                            <div className="prose prose-sm max-w-none">
                              <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                                {aiResponse.response_text}
                              </div>
                            </div>

                            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="bg-white p-3 rounded border">
                                <div className="text-xs font-medium text-gray-600 mb-1">
                                  IMPROVEMENT CONFIDENCE
                                </div>
                                <div className="flex items-center gap-2">
                                  {" "}
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    {/* eslint-disable-next-line react/forbid-dom-props */}
                                    <div
                                      className="bg-green-600 h-2 rounded-full"
                                      style={{
                                        width: `${(aiResponse.confidence_score || 0.8) * 100}%`,
                                      }}
                                    ></div>
                                  </div>
                                  <span className="text-sm font-medium text-green-600">
                                    {Math.round(
                                      (aiResponse.confidence_score || 0.8) * 100
                                    )}
                                    %
                                  </span>
                                </div>
                              </div>
                              <div className="bg-white p-3 rounded border">
                                <div className="text-xs font-medium text-gray-600 mb-1">
                                  ANALYSIS DATE
                                </div>
                                <div className="text-sm text-gray-700">
                                  {new Date(
                                    aiResponse.generated_at
                                  ).toLocaleDateString()}{" "}
                                  at{" "}
                                  {new Date(
                                    aiResponse.generated_at
                                  ).toLocaleTimeString()}
                                </div>
                              </div>
                            </div>

                            {/* Action buttons for fine-tune results */}
                            <div className="mt-4 flex flex-wrap gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  // Copy the improvement recommendations to clipboard
                                  navigator.clipboard.writeText(
                                    aiResponse.response_text
                                  );
                                  setSuccessMessage(
                                    "Recommendations copied to clipboard!"
                                  );
                                }}
                                className="text-xs"
                              >
                                <Copy className="w-4 h-4 mr-2" />
                                Copy Recommendations
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  // Switch to judge tab to evaluate the improved idea
                                  setActiveTab("judge");
                                  clearResults();
                                }}
                                className="text-xs"
                              >
                                <Scale className="w-4 h-4 inline mr-1" />
                                Judge Improved Idea
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  // Navigate to My Ideas to edit the original idea
                                  window.open("/my-ideas", "_blank");
                                }}
                                className="text-xs"
                              >
                                <Edit2 className="w-4 h-4 inline mr-1" />
                                Edit Original Idea
                              </Button>
                            </div>
                          </div>
                        )}{" "}
                        {/* Recommendations specific display */}
                        {activeTab === "recommendations" && (
                          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 rounded-lg border border-purple-200">
                            <div className="flex items-center justify-between mb-4">
                              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                                <Target className="w-4 h-4 mr-2" />
                                AI Strategic Recommendations
                              </h3>
                              <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                                Focus:{" "}
                                {recommendationsForm.focus_area
                                  .replace(/_/g, " ")
                                  .replace(/\b\w/g, (l) => l.toUpperCase())}
                              </span>
                            </div>

                            <div className="prose prose-sm max-w-none">
                              <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                                {aiResponse.response_text}
                              </div>
                            </div>

                            {/* Action Items */}
                            {aiResponse.suggestions &&
                              aiResponse.suggestions.length > 0 && (
                                <div className="mt-6 bg-white p-4 rounded border">
                                  {" "}
                                  <h5 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                    Priority Action Items
                                  </h5>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    {aiResponse.suggestions
                                      .slice(0, 6)
                                      .map((suggestion, index) => (
                                        <div
                                          key={index}
                                          className="flex items-start space-x-2 text-sm"
                                        >
                                          <span className="text-purple-600 font-bold text-xs mt-0.5">
                                            {index + 1}.
                                          </span>
                                          <span className="text-gray-700">
                                            {suggestion}
                                          </span>
                                        </div>
                                      ))}
                                  </div>
                                </div>
                              )}

                            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="bg-white p-3 rounded border text-center">
                                <div className="text-xs font-medium text-gray-600 mb-1">
                                  STRATEGY CONFIDENCE
                                </div>
                                <div className="flex items-center justify-center gap-2">
                                  {" "}
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    {/* eslint-disable-next-line react/forbid-dom-props */}
                                    <div
                                      className="bg-purple-600 h-2 rounded-full"
                                      style={{
                                        width: `${(aiResponse.confidence_score || 0.85) * 100}%`,
                                      }}
                                    ></div>
                                  </div>
                                  <span className="text-sm font-medium text-purple-600">
                                    {Math.round(
                                      (aiResponse.confidence_score || 0.85) *
                                        100
                                    )}
                                    %
                                  </span>
                                </div>
                              </div>

                              <div className="bg-white p-3 rounded border text-center">
                                <div className="text-xs font-medium text-gray-600 mb-1">
                                  IDEAS ANALYZED
                                </div>
                                <div className="text-lg font-bold text-purple-600">
                                  {userIdeas.length}
                                </div>
                              </div>

                              <div className="bg-white p-3 rounded border text-center">
                                <div className="text-xs font-medium text-gray-600 mb-1">
                                  RECOMMENDATIONS
                                </div>
                                <div className="text-lg font-bold text-purple-600">
                                  {aiResponse.suggestions?.length || 3}+
                                </div>
                              </div>
                            </div>

                            <div className="mt-4 flex flex-wrap gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  navigator.clipboard.writeText(
                                    aiResponse.response_text
                                  );
                                  setSuccessMessage(
                                    "Recommendations copied to clipboard!"
                                  );
                                }}
                                className="text-xs"
                              >
                                <Copy className="w-4 h-4 mr-2" />
                                Copy Recommendations
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  // Switch to generate tab for new ideas based on recommendations
                                  setActiveTab("generate");
                                  clearResults();
                                }}
                                className="text-xs"
                              >
                                <Lightbulb className="w-4 h-4 mr-2" />
                                Generate New Ideas
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  // Switch to fine-tune tab to improve existing ideas
                                  setActiveTab("finetune");
                                  clearResults();
                                }}
                                className="text-xs"
                              >
                                <Wrench className="w-4 h-4 mr-2" />
                                Fine-tune Ideas
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  // Open metrics page in new tab
                                  window.open("/metrics", "_blank");
                                }}
                                className="text-xs"
                              >
                                <BarChart3 className="w-4 h-4 mr-2" />
                                View Metrics
                              </Button>
                            </div>
                          </div>
                        )}
                        {/* Generic display for other tabs */}
                        {activeTab !== "finetune" &&
                          activeTab !== "recommendations" && (
                            <div className="bg-gray-50 p-4 rounded-lg">
                              <h3 className="font-semibold text-gray-800 mb-2">
                                AI Response
                              </h3>
                              <div className="whitespace-pre-wrap text-sm text-gray-700">
                                {aiResponse.response_text}
                              </div>
                              {aiResponse.confidence_score && (
                                <div className="mt-3 text-xs text-gray-500">
                                  Confidence:{" "}
                                  {Math.round(
                                    aiResponse.confidence_score * 100
                                  )}
                                  %
                                </div>
                              )}
                            </div>
                          )}
                      </div>
                    )}
                    {aiResponse.suggestions &&
                      aiResponse.suggestions.length > 0 && (
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-blue-800 mb-2">
                            <Lightbulb className="w-4 h-4 mr-2" />
                            Additional Insights
                          </h4>
                          <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
                            {aiResponse.suggestions.map((suggestion, index) => (
                              <li key={index}>{suggestion}</li>
                            ))}
                          </ul>
                        </div>
                      )}{" "}
                    {activeTab === "generate" && (
                      <div className="bg-yellow-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-yellow-800 mb-2">
                          <Target className="w-4 h-4 mr-2" />
                          Next Steps
                        </h4>
                        <ul className="list-disc list-inside text-sm text-yellow-700 space-y-1">
                          <li>
                            Review the generated idea and assess market fit
                          </li>
                          <li>
                            Use the "Judge Ideas" tab to get AI evaluation and
                            scoring
                          </li>
                          <li>
                            Use "Fine-tune Ideas" to improve specific aspects
                          </li>
                          <li>Research competitors and validate the problem</li>
                          <li>Create a simple prototype or MVP plan</li>
                        </ul>
                      </div>
                    )}
                    {activeTab === "recommendations" && (
                      <div className="bg-indigo-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-indigo-800 mb-2">
                          <Rocket className="w-4 h-4 mr-2" />
                          Implementation Roadmap
                        </h4>
                        <ul className="list-disc list-inside text-sm text-indigo-700 space-y-1">
                          <li>
                            Prioritize the top 3 recommendations for immediate
                            action
                          </li>
                          <li>
                            Set specific deadlines and milestones for each
                            recommendation
                          </li>
                          <li>
                            Use the suggested focus areas to guide your next
                            steps
                          </li>
                          <li>
                            Re-run recommendations monthly to track progress
                          </li>
                          <li>Document your progress and measure the impact</li>
                        </ul>
                      </div>
                    )}
                    {activeTab === "finetune" && (
                      <div className="bg-green-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-green-800 mb-2">
                          <Wrench className="w-4 h-4 mr-2" />
                          Implementation Tips
                        </h4>
                        <ul className="list-disc list-inside text-sm text-green-700 space-y-1">
                          <li>Apply the improvements to your original idea</li>
                          <li>
                            Test the improved concept with potential customers
                          </li>
                          <li>
                            Use "Judge Ideas" to score the improved version
                          </li>
                          <li>
                            Consider multiple improvement cycles for best
                            results
                          </li>
                          <li>
                            Document changes and track improvement metrics
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* AI Judgment Display */}
                {aiJudgment && (
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-gray-800 mb-3">
                        AI Evaluation Score
                      </h3>
                      <div className="text-center">
                        <div className="text-4xl font-bold text-blue-600 mb-2">
                          {aiJudgment.overall_score}/10
                        </div>
                        <div className="text-sm text-gray-600">
                          Overall Score
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 mt-4 text-center">
                        <div>
                          <div className="text-lg font-semibold text-green-600">
                            {aiJudgment.market_viability}/10
                          </div>
                          <div className="text-xs text-gray-600">Market</div>
                        </div>
                        <div>
                          <div className="text-lg font-semibold text-blue-600">
                            {aiJudgment.technical_feasibility}/10
                          </div>
                          <div className="text-xs text-gray-600">Technical</div>
                        </div>
                        <div>
                          <div className="text-lg font-semibold text-purple-600">
                            {aiJudgment.business_potential}/10
                          </div>
                          <div className="text-xs text-gray-600">Business</div>
                        </div>
                      </div>
                    </div>

                    {aiJudgment.strengths.length > 0 && (
                      <div className="bg-green-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-green-800 mb-2">
                          <Dumbbell className="w-4 h-4 mr-2" />
                          Strengths
                        </h4>
                        <ul className="list-disc list-inside text-sm text-green-700 space-y-1">
                          {aiJudgment.strengths.map((strength, index) => (
                            <li key={index}>{strength}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {aiJudgment.weaknesses.length > 0 && (
                      <div className="bg-red-50 p-4 rounded-lg">
                        {" "}
                        <h4 className="font-semibold text-red-800 mb-2">
                          <AlertTriangle className="w-4 h-4 inline mr-2" />
                          Areas for Improvement
                        </h4>
                        <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                          {aiJudgment.weaknesses.map((weakness, index) => (
                            <li key={index}>{weakness}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {aiJudgment.improvement_suggestions.length > 0 && (
                      <div className="bg-yellow-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-yellow-800 mb-2">
                          <Lightbulb className="w-4 h-4 mr-2" />
                          Improvement Suggestions
                        </h4>
                        <ul className="list-disc list-inside text-sm text-yellow-700 space-y-1">
                          {aiJudgment.improvement_suggestions.map(
                            (suggestion, index) => (
                              <li key={index}>{suggestion}</li>
                            )
                          )}{" "}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>{" "}
        {/* Enhanced Tips Section */}
        <Card className="shadow-lg border-0 bg-white rounded-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-200 px-6 py-4">
            <CardHeader>
              <div className="flex items-center gap-3 text-xl">
                <CardTitle>
                  <div className="w-10 h-10 bg-indigo-200 text-indigo-700 rounded-xl flex items-center justify-center text-xl">
                    <Lightbulb className="w-4 h-4" />
                  </div>
                  <div>AI Interaction Tips & Best Practices</div>
                </CardTitle>
              </div>
            </CardHeader>
          </div>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-blue-200 text-blue-700 rounded-lg flex items-center justify-center text-xl">
                    <Brain className="w-4 h-4" />
                  </div>
                  <h4 className="font-semibold text-blue-800">Generate</h4>
                </div>
                <p className="text-sm text-blue-700 leading-relaxed">
                  Be specific about your interests and skills for more targeted
                  idea generation. Include details about your experience and
                  preferred markets.
                </p>
              </div>

              <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-green-200 text-green-700 rounded-lg flex items-center justify-center text-xl">
                    <Wrench className="w-4 h-4" />
                  </div>
                  <h4 className="font-semibold text-green-800">Fine-tune</h4>
                </div>
                <p className="text-sm text-green-700 leading-relaxed">
                  Provide clear context about what aspects you want to improve.
                  The more specific your improvement focus, the better the
                  recommendations.
                </p>
              </div>

              <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
                <div className="flex items-center gap-3 mb-3">
                  {" "}
                  <div className="w-10 h-10 bg-purple-200 text-purple-700 rounded-lg flex items-center justify-center text-xl">
                    <Scale className="w-6 h-6" />
                  </div>
                  <h4 className="font-semibold text-purple-800">Judge</h4>
                </div>
                <p className="text-sm text-purple-700 leading-relaxed">
                  Ensure your idea details are complete for accurate evaluation.
                  Fill in all fields for comprehensive AI analysis and scoring.
                </p>
              </div>

              <div className="bg-orange-50 p-4 rounded-xl border border-orange-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-orange-200 text-orange-700 rounded-lg flex items-center justify-center text-xl">
                    <Target className="w-4 h-4" />
                  </div>
                  <h4 className="font-semibold text-orange-800">
                    Recommendations
                  </h4>
                </div>
                <p className="text-sm text-orange-700 leading-relaxed">
                  Review different focus areas to get comprehensive insights.
                  Run recommendations regularly to track your progress and
                  growth.
                </p>
              </div>
            </div>

            {/* Additional tips */}
            <div className="mt-6 bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-xl border border-gray-200">
              <h5 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Target className="w-4 h-4" />
                Pro Tips for Better AI Results
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                <div className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>
                    Use specific industry terminology and technical details
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>Mention your target market size and demographics</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>
                    Include your budget constraints and resource availability
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>
                    Regular AI interactions improve recommendation quality
                  </span>
                </div>
              </div>{" "}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AIGenerator;
