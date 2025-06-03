import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, Button } from "@esal/ui";

interface Idea {
  id: string;
  title: string;
  description: string;
  problem?: string;
  solution?: string;
  target_market?: string;
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
        "http://localhost:8000/api/v1/innovator/view-ideas",
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
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(
        "http://localhost:8000/api/v1/innovator/ai/generate-idea",
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
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(
        "http://localhost:8000/api/v1/innovator/ai/fine-tune",
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
        "http://localhost:8000/api/v1/innovator/ai/judge-idea",
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

      const response = await fetch(
        "http://localhost:8000/api/v1/innovator/ai/recommendations",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(recommendationsForm),
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

      setSuccessMessage("💾 Idea saved successfully to your portfolio!");

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
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          AI-Powered Innovation Hub
        </h1>
        <p className="text-gray-600 mt-2">
          Get comprehensive AI assistance for your startup ideas - from
          generation to evaluation and optimization.
        </p>
      </div>

      {/* Error and Success Messages */}
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

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: "generate", name: "Generate Ideas", icon: "🧠" },
            { id: "finetune", name: "Fine-tune Ideas", icon: "🔧" },
            { id: "judge", name: "Judge Your Ideas", icon: "⚖️" },
            { id: "recommendations", name: "Get Recommendations", icon: "💡" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as typeof activeTab);
                clearResults();
              }}
              className={`${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
            >
              <span>{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle>
              {activeTab === "generate" && "Generate New Ideas"}
              {activeTab === "finetune" && "Fine-tune Existing Ideas"}
              {activeTab === "judge" && "Judge Your Ideas"}
              {activeTab === "recommendations" &&
                "Get Personalized Recommendations"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Generate Tab */}
            {activeTab === "generate" && (
              <form onSubmit={handleGenerateIdea} className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                  <h4 className="font-semibold text-blue-800 mb-2">
                    🧠 AI Idea Generator
                  </h4>
                  <p className="text-sm text-blue-700">
                    Provide your interests, skills, and preferences below. Our
                    AI will analyze this information and generate personalized
                    startup ideas tailored specifically for you.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Your Interests *
                    <span className="text-xs text-gray-500 ml-1">
                      (Be specific for better results)
                    </span>
                  </label>
                  <textarea
                    value={generateForm.interests}
                    onChange={(e) =>
                      handleFormChange("generate", "interests", e.target.value)
                    }
                    required
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., sustainable technology, renewable energy, AI automation, fintech, healthtech, edtech"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    What topics, industries, or areas are you passionate about?
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Your Skills & Expertise *
                    <span className="text-xs text-gray-500 ml-1">
                      (Include both technical and soft skills)
                    </span>
                  </label>
                  <textarea
                    value={generateForm.skills}
                    onChange={(e) =>
                      handleFormChange("generate", "skills", e.target.value)
                    }
                    required
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., software development (Python, React), digital marketing, data analysis, UI/UX design, project management"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    What are you good at? Include programming languages, tools,
                    and experience.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Preferred Industry
                    </label>
                    <select
                      value={generateForm.industry}
                      onChange={(e) =>
                        handleFormChange("generate", "industry", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Any Industry</option>
                      <option value="technology">Technology & Software</option>
                      <option value="healthcare">Healthcare & Biotech</option>
                      <option value="finance">Finance & Fintech</option>
                      <option value="education">Education & Edtech</option>
                      <option value="retail">Retail & E-commerce</option>
                      <option value="energy">Energy & Cleantech</option>
                      <option value="entertainment">
                        Entertainment & Media
                      </option>
                      <option value="transportation">
                        Transportation & Mobility
                      </option>
                      <option value="agriculture">Agriculture & Food</option>
                      <option value="real-estate">
                        Real Estate & Proptech
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Preferred Target Market
                    </label>
                    <select
                      value={generateForm.target_market}
                      onChange={(e) =>
                        handleFormChange(
                          "generate",
                          "target_market",
                          e.target.value
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Any Market</option>
                      <option value="small businesses">
                        Small Businesses (SMB)
                      </option>
                      <option value="enterprise">
                        Enterprise / Large Companies
                      </option>
                      <option value="consumers">Consumers / B2C</option>
                      <option value="students">Students & Educators</option>
                      <option value="developers">
                        Developers & Technical Users
                      </option>
                      <option value="seniors">Seniors (55+)</option>
                      <option value="millennials">Millennials (25-40)</option>
                      <option value="gen-z">Gen Z (18-25)</option>
                      <option value="startups">Startups & Entrepreneurs</option>
                      <option value="nonprofits">Nonprofits & NGOs</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Problem Areas You Care About
                    <span className="text-xs text-gray-500 ml-1">
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
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., climate change, digital divide, mental health, productivity, remote work challenges, data privacy"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    What societal, business, or technical problems do you want
                    to address?
                  </p>
                </div>

                <div className="flex items-center space-x-2 bg-green-50 p-3 rounded-lg">
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
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="save_to_database"
                    className="text-sm text-green-700"
                  >
                    💾{" "}
                    <strong>Save generated idea to my ideas portfolio</strong>
                    <span className="block text-xs text-green-600">
                      Recommended: This will add the AI-generated idea to your
                      ideas list for future reference
                    </span>
                  </label>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      🧠 Generating Ideas...
                    </>
                  ) : (
                    <>🚀 Generate New Startup Ideas</>
                  )}
                </Button>

                <div className="text-xs text-gray-500 text-center">
                  Our AI will analyze your profile and generate 1-3 personalized
                  startup ideas
                </div>
              </form>
            )}

            {/* Fine-tune Tab */}
            {activeTab === "finetune" && (
              <form onSubmit={handleFineTuneIdea} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Idea to Fine-tune *
                  </label>
                  <select
                    value={finetuneForm.idea_id}
                    onChange={(e) =>
                      handleIdeaSelection(e.target.value, "finetune")
                    }
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Choose an idea...</option>
                    {userIdeas.map((idea) => (
                      <option key={idea.id} value={idea.id}>
                        {idea.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Content
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
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Current idea description will appear here..."
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Improvement Focus
                  </label>
                  <select
                    value={finetuneForm.improvement_focus}
                    onChange={(e) =>
                      handleFormChange(
                        "finetune",
                        "improvement_focus",
                        e.target.value
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="problem_statement">Problem Statement</option>
                    <option value="solution_design">Solution Design</option>
                    <option value="target_market">Target Market</option>
                    <option value="business_model">Business Model</option>
                    <option value="competitive_advantage">
                      Competitive Advantage
                    </option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Additional Context
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
                    placeholder="Any specific guidance or areas you want to focus on..."
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isLoading || !finetuneForm.idea_id}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Fine-tuning...
                    </>
                  ) : (
                    "Fine-tune Idea"
                  )}
                </Button>
              </form>
            )}

            {/* Judge Tab */}
            {activeTab === "judge" && (
              <form onSubmit={handleJudgeIdea} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Idea to Judge *
                  </label>
                  <select
                    value={judgeForm.idea_id}
                    onChange={(e) =>
                      handleIdeaSelection(e.target.value, "judge")
                    }
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Choose an idea...</option>
                    {userIdeas.map((idea) => (
                      <option key={idea.id} value={idea.id}>
                        {idea.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={judgeForm.title}
                    onChange={(e) =>
                      handleFormChange("judge", "title", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Problem Statement
                  </label>
                  <textarea
                    value={judgeForm.problem}
                    onChange={(e) =>
                      handleFormChange("judge", "problem", e.target.value)
                    }
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Solution
                  </label>
                  <textarea
                    value={judgeForm.solution}
                    onChange={(e) =>
                      handleFormChange("judge", "solution", e.target.value)
                    }
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Target Market
                  </label>
                  <input
                    type="text"
                    value={judgeForm.target_market}
                    onChange={(e) =>
                      handleFormChange("judge", "target_market", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isLoading || !judgeForm.idea_id}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Judging...
                    </>
                  ) : (
                    "Judge Idea"
                  )}
                </Button>
              </form>
            )}

            {/* Recommendations Tab */}
            {activeTab === "recommendations" && (
              <form onSubmit={handleGetRecommendations} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Focus Area
                  </label>
                  <select
                    value={recommendationsForm.focus_area}
                    onChange={(e) =>
                      handleFormChange(
                        "recommendations",
                        "focus_area",
                        e.target.value
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="general">General Recommendations</option>
                    <option value="market_analysis">Market Analysis</option>
                    <option value="competition">Competitive Landscape</option>
                    <option value="funding">Funding Opportunities</option>
                    <option value="team_building">Team Building</option>
                    <option value="product_development">
                      Product Development
                    </option>
                    <option value="marketing_strategy">
                      Marketing Strategy
                    </option>
                  </select>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-700">
                    💡 <strong>Portfolio Analysis:</strong> AI will analyze your
                    current ideas portfolio ({userIdeas.length} ideas) to
                    provide personalized recommendations for improvement and
                    growth.
                  </p>
                </div>
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Analyzing Portfolio...
                    </>
                  ) : (
                    "Get Recommendations"
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Results Panel */}
        <Card>
          <CardHeader>
            <CardTitle>AI Results</CardTitle>
          </CardHeader>
          <CardContent>
            {!aiResponse && !aiJudgment && !isLoading && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🤖</div>
                <p className="text-gray-600">
                  Choose an AI feature and submit the form to see intelligent
                  insights and suggestions!
                </p>
              </div>
            )}

            {isLoading && (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">
                  AI is analyzing your request and generating personalized
                  insights...
                </p>
              </div>
            )}
            {/* AI Response Display */}
            {aiResponse && (
              <div className="space-y-4">
                {activeTab === "generate" && (
                  <div className="bg-gradient-to-r from-blue-50 to-green-50 p-6 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                        🧠 AI-Generated Startup Idea
                      </h3>
                      {aiResponse.metadata?.saved_to_database && (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                          💾 Saved to Portfolio
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
                            📊 Confidence:{" "}
                            {Math.round(aiResponse.confidence_score * 100)}%
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          🕒 Generated:{" "}
                          {new Date(aiResponse.generated_at).toLocaleString()}
                        </span>
                      </div>

                      {!aiResponse.metadata?.saved_to_database && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSaveIdeaManually()}
                          className="text-xs"
                        >
                          💾 Save to Portfolio
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                {activeTab !== "generate" && (
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
                        {Math.round(aiResponse.confidence_score * 100)}%
                      </div>
                    )}
                  </div>
                )}

                {aiResponse.suggestions &&
                  aiResponse.suggestions.length > 0 && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-800 mb-2">
                        💡 Additional Insights
                      </h4>
                      <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
                        {aiResponse.suggestions.map((suggestion, index) => (
                          <li key={index}>{suggestion}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                {activeTab === "generate" && (
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-yellow-800 mb-2">
                      🎯 Next Steps
                    </h4>
                    <ul className="list-disc list-inside text-sm text-yellow-700 space-y-1">
                      <li>Review the generated idea and assess market fit</li>
                      <li>
                        Use the "Judge Ideas" tab to get AI evaluation and
                        scoring
                      </li>
                      <li>Use "Fine-tune Ideas" to improve specific aspects</li>
                      <li>Research competitors and validate the problem</li>
                      <li>Create a simple prototype or MVP plan</li>
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
                    <div className="text-sm text-gray-600">Overall Score</div>
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
                      💪 Strengths
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
                    <h4 className="font-semibold text-red-800 mb-2">
                      ⚠️ Areas for Improvement
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
                      💡 Improvement Suggestions
                    </h4>
                    <ul className="list-disc list-inside text-sm text-yellow-700 space-y-1">
                      {aiJudgment.improvement_suggestions.map(
                        (suggestion, index) => (
                          <li key={index}>{suggestion}</li>
                        )
                      )}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tips Section */}
      <Card>
        <CardHeader>
          <CardTitle>AI Interaction Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div className="flex items-start space-x-2">
              <span className="text-blue-600">🧠</span>
              <div>
                <strong>Generate:</strong> Be specific about your interests and
                skills for more targeted idea generation.
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-green-600">🔧</span>
              <div>
                <strong>Fine-tune:</strong> Provide clear context about what
                aspects you want to improve.
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-purple-600">⚖️</span>
              <div>
                <strong>Judge:</strong> Ensure your idea details are complete
                for accurate evaluation.
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-orange-600">💡</span>
              <div>
                <strong>Recommendations:</strong> Review different focus areas
                to get comprehensive insights.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIGenerator;
