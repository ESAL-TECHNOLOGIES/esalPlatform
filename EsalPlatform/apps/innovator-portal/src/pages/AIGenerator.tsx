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

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    // Simulate AI generation delay
    setTimeout(() => {
      const sampleIdea = `Based on your interests in ${formData.interests} and skills in ${formData.skills}, here's a potential startup idea:

**EcoSmart Solutions Platform**

**Problem:** Small businesses struggle to implement sustainable practices due to lack of knowledge and high implementation costs.

**Solution:** A comprehensive platform that provides:
- AI-powered sustainability assessment
- Customized eco-friendly recommendations
- Cost-benefit analysis for green initiatives
- Marketplace for sustainable suppliers
- Progress tracking and reporting tools

**Target Market:** Small to medium businesses (10-500 employees) looking to improve their environmental impact while reducing operational costs.

**Revenue Model:** 
- Monthly SaaS subscriptions ($99-$999/month)
- Commission from supplier marketplace (3-5%)
- Premium consulting services

**Key Features:**
- Carbon footprint calculator
- Waste reduction planner
- Energy efficiency optimizer
- Sustainable supply chain connector
- Compliance tracking dashboard

**Next Steps:**
1. Validate the problem with 50+ SMB owners
2. Build MVP with core assessment tools
3. Partner with 10-15 sustainable suppliers
4. Launch pilot program with 25 businesses

This idea combines technology with environmental impact, addressing a growing market need while creating multiple revenue streams.`;

      setGeneratedIdea(sampleIdea);
      setIsGenerating(false);
    }, 2000);
  };

  const handleSaveIdea = () => {
    // Placeholder save logic
    alert("Idea saved to your drafts!");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          AI Startup Idea Generator
        </h1>
        <p className="text-gray-600">
          Let AI help you discover innovative startup opportunities based on
          your interests and skills.
        </p>
      </div>

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
                </div>

                <div className="flex space-x-2">
                  <Button onClick={handleSaveIdea} size="sm">
                    Save Idea
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleGenerate}>
                    Generate Another
                  </Button>
                  <Button variant="secondary" size="sm">
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
