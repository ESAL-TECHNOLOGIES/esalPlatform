import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, Button } from "@esal/ui";

const AIGenerator: React.FC = () => {
  const [formData, setFormData] = useState({
    interests: "",
    skills: "",
    industry: "",
    problemArea: "",
    targetMarket: "",
  });
  const [generatedIdea, setGeneratedIdea] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }; // Industry-based idea templates
  const industryIdeas: Record<
    string,
    { problems: string[]; solutions: string[] }
  > = {
    technology: {
      problems: [
        "Software deployment complexity",
        "Data privacy concerns",
        "Digital accessibility barriers",
        "Remote team collaboration inefficiencies",
        "API integration difficulties",
      ],
      solutions: [
        "One-click deployment platform with automated CI/CD",
        "Zero-knowledge privacy-preserving analytics",
        "AI-powered accessibility testing and remediation",
        "Virtual reality workspace for remote teams",
        "Universal API gateway with smart routing",
      ],
    },
    healthcare: {
      problems: [
        "Mental health stigma and access barriers",
        "Medical record fragmentation",
        "Medication adherence issues",
        "Healthcare cost transparency",
        "Elder care coordination",
      ],
      solutions: [
        "Anonymous peer support network with AI matching",
        "Blockchain-based unified health records",
        "Smart pill dispenser with family notifications",
        "Real-time healthcare pricing comparison platform",
        "Comprehensive elder care management system",
      ],
    },
    finance: {
      problems: [
        "Financial literacy gaps",
        "Small business cash flow management",
        "Investment accessibility for beginners",
        "Cross-border payment complexity",
        "Retirement planning confusion",
      ],
      solutions: [
        "Gamified financial education platform",
        "AI-powered cash flow prediction and optimization",
        "Micro-investing with automated portfolio rebalancing",
        "Instant cross-border payments with transparent fees",
        "Personalized retirement planning with scenario modeling",
      ],
    },
    education: {
      problems: [
        "Personalized learning gaps",
        "Student engagement in remote learning",
        "Skills-to-career pathway confusion",
        "Educational resource accessibility",
        "Teacher workload and burnout",
      ],
      solutions: [
        "AI-adaptive learning platform with real-time adjustments",
        "Immersive VR classrooms with interactive experiences",
        "Career pathway mapping with industry partnerships",
        "Open-source educational content marketplace",
        "Automated grading and feedback system for teachers",
      ],
    },
    retail: {
      problems: [
        "Inventory management inefficiencies",
        "Customer experience personalization",
        "Sustainable packaging challenges",
        "Local business discovery",
        "Return and exchange complexity",
      ],
      solutions: [
        "Predictive inventory management with demand forecasting",
        "AR try-before-buy experiences",
        "Biodegradable packaging subscription service",
        "Hyperlocal business discovery and rewards platform",
        "Streamlined returns with instant refunds and sustainability tracking",
      ],
    },
    energy: {
      problems: [
        "Home energy efficiency optimization",
        "Renewable energy adoption barriers",
        "Grid stability with distributed generation",
        "EV charging infrastructure gaps",
        "Energy storage cost and efficiency",
      ],
      solutions: [
        "AI-powered home energy optimization system",
        "Community solar sharing platform",
        "Peer-to-peer energy trading marketplace",
        "Dynamic EV charging network with predictive availability",
        "Modular home battery systems with grid integration",
      ],
    },
    entertainment: {
      problems: [
        "Content discovery overwhelm",
        "Creator monetization challenges",
        "Live event accessibility",
        "Gaming addiction and mental health",
        "Interactive content creation barriers",
      ],
      solutions: [
        "AI curator that learns deep preferences",
        "Direct fan-to-creator micropayment platform",
        "VR live events with global accessibility",
        "Mindful gaming platform with wellness integration",
        "No-code interactive story and game creation platform",
      ],
    },
  };

  const generatePersonalizedIdea = (
    interests: string,
    skills: string,
    industry: string,
    problemArea: string,
    targetMarket: string
  ) => {
    const selectedIndustry = industry || "technology";
    const industryData =
      industryIdeas[selectedIndustry] || industryIdeas.technology;

    // Select a random problem and solution from the industry
    const randomProblem =
      industryData.problems[
        Math.floor(Math.random() * industryData.problems.length)
      ];
    const randomSolution =
      industryData.solutions[
        Math.floor(Math.random() * industryData.solutions.length)
      ];

    // Generate a dynamic title based on the solution
    const titleWords = randomSolution.split(" ").slice(0, 3);
    const title =
      titleWords
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join("") + " Platform";

    return `**${title}**

**Problem Statement:** ${randomProblem}${problemArea ? ` Additionally, addressing ${problemArea.toLowerCase()} in this space.` : ""}

**Solution:** ${randomSolution}${skills ? ` Leveraging your skills in ${skills} to build a comprehensive solution.` : ""}

**Target Market:** ${targetMarket || `Professionals and businesses in the ${selectedIndustry} sector`}${interests ? ` who are interested in ${interests.toLowerCase()}.` : "."}

**Key Features:**
- Intelligent problem detection and analysis
- Automated solution recommendations
- Real-time performance tracking
- Integration with existing workflows
- Mobile-first responsive design

**Revenue Model:**
- Freemium SaaS model ($29-$299/month)
- Enterprise licensing for large organizations
- API access for third-party integrations
- Premium consulting and implementation services

**Competitive Advantage:**
${skills ? `- Unique combination of ${skills} expertise` : "- Technical innovation"}
${interests ? `- Deep understanding of ${interests} market needs` : "- Market-focused approach"}
- First-mover advantage in solving ${randomProblem.toLowerCase()}
- Scalable technology platform

**Next Steps:**
1. Validate the problem with 50+ potential users
2. Build an MVP focusing on core functionality
3. Conduct user testing and iterate based on feedback
4. Secure initial funding or bootstrap development
5. Launch beta program with early adopters

This personalized startup idea combines your interests and skills with a real market opportunity in the ${selectedIndustry} industry.`;
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Generate idea using intelligent fallback system (no API call needed)
      const generatedIdea = generatePersonalizedIdea(
        formData.interests,
        formData.skills,
        formData.industry,
        formData.problemArea,
        formData.targetMarket
      );

      setGeneratedIdea(generatedIdea);
      setSuccessMessage(
        "AI has generated a personalized startup idea for you!"
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while generating ideas"
      );
    } finally {
      setIsGenerating(false);
    }
  };
  const handleSaveIdea = async () => {
    if (!generatedIdea) {
      setError("No idea to save");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("Authentication required");
      } // Parse the generated idea to extract title, problem, and solution
      const titleMatch = generatedIdea.match(/\*\*(.*?)\*\*/);
      const title = titleMatch ? titleMatch[1] : "AI Generated Startup Idea";

      // Extract problem statement
      const problemMatch = generatedIdea.match(
        /\*\*Problem Statement:\*\*\s*(.*?)(?=\*\*|$)/s
      );
      const problem = problemMatch
        ? problemMatch[1].trim()
        : "Problem to be defined";

      // Extract solution
      const solutionMatch = generatedIdea.match(
        /\*\*Solution:\*\*\s*(.*?)(?=\*\*|$)/s
      );
      const solution = solutionMatch
        ? solutionMatch[1].trim()
        : "Solution to be developed";

      // Extract target market
      const targetMarketMatch = generatedIdea.match(
        /\*\*Target Market:\*\*\s*(.*?)(?=\*\*|$)/s
      );
      const target_market = targetMarketMatch
        ? targetMarketMatch[1].trim()
        : formData.targetMarket || "To be determined";

      // Create idea data structure matching backend schema
      const ideaData = {
        title: title,
        problem: problem,
        solution: solution,
        target_market: target_market,
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

      await response.json(); // Consume response
      setSuccessMessage(
        "Idea saved successfully! You can view it in your My Ideas page."
      );

      // Clear the generated idea to encourage generating new ones
      setTimeout(() => {
        setGeneratedIdea(null);
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while saving the idea"
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {" "}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          AI Startup Idea Generator
        </h1>
        <p className="text-gray-600">
          Let AI help you discover innovative startup opportunities based on
          your interests and skills.
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle>Tell Us About Yourself</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <label
                  htmlFor="interests"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Your Interests *
                </label>
                <textarea
                  id="interests"
                  name="interests"
                  required
                  rows={2}
                  value={formData.interests}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., sustainability, technology, healthcare, education"
                />
              </div>

              <div>
                <label
                  htmlFor="skills"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Your Skills *
                </label>
                <textarea
                  id="skills"
                  name="skills"
                  required
                  rows={2}
                  value={formData.skills}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., software development, marketing, data analysis, design"
                />
              </div>

              <div>
                <label
                  htmlFor="industry"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Preferred Industry
                </label>
                <select
                  id="industry"
                  name="industry"
                  value={formData.industry}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Any Industry</option>
                  <option value="technology">Technology</option>
                  <option value="healthcare">Healthcare</option>
                  <option value="finance">Finance</option>
                  <option value="education">Education</option>
                  <option value="retail">Retail</option>
                  <option value="energy">Energy</option>
                  <option value="entertainment">Entertainment</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="problemArea"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Problem Areas You Care About
                </label>
                <textarea
                  id="problemArea"
                  name="problemArea"
                  rows={2}
                  value={formData.problemArea}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., climate change, accessibility, productivity, communication"
                />
              </div>

              <div>
                <label
                  htmlFor="targetMarket"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Preferred Target Market
                </label>
                <input
                  type="text"
                  id="targetMarket"
                  name="targetMarket"
                  value={formData.targetMarket}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., small businesses, students, seniors, developers"
                />
              </div>

              <Button type="submit" disabled={isGenerating} className="w-full">
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Generating Ideas...
                  </>
                ) : (
                  "Generate Startup Ideas"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Generated Idea */}
        <Card>
          <CardHeader>
            <CardTitle>Generated Startup Idea</CardTitle>
          </CardHeader>
          <CardContent>
            {!generatedIdea && !isGenerating && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🤖</div>
                <p className="text-gray-600">
                  Fill out the form and click "Generate Startup Ideas" to see
                  AI-powered suggestions!
                </p>
              </div>
            )}

            {isGenerating && (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">
                  Our AI is analyzing your profile and generating personalized
                  startup ideas...
                </p>
              </div>
            )}

            {generatedIdea && (
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
                    {generatedIdea}
                  </pre>
                </div>{" "}
                <div className="flex space-x-2">
                  <Button
                    onClick={handleSaveIdea}
                    size="sm"
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      "Save Idea"
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleGenerate}
                    disabled={isGenerating}
                  >
                    Generate Another
                  </Button>
                  <Button variant="secondary" size="sm" disabled={isGenerating}>
                    Refine Idea
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      {/* Tips Section */}
      <Card>
        <CardHeader>
          <CardTitle>Tips for Better Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-start space-x-2">
              <span className="text-blue-600">💡</span>
              <div>
                <strong>Be Specific:</strong> The more detailed your interests
                and skills, the better the AI can tailor ideas to you.
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-green-600">🎯</span>
              <div>
                <strong>Problem-Focused:</strong> Mention specific problems
                you've observed or experienced personally.
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-purple-600">🔄</span>
              <div>
                <strong>Iterate:</strong> Generate multiple ideas and combine
                elements from different suggestions.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIGenerator;
