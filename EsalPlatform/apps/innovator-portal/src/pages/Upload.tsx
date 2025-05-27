import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, Button } from "@esal/ui";

const Upload: React.FC = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    industry: "",
    stage: "",
    fundingNeeded: "",
    teamSize: "",
    document: null as File | null,
  });

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, document: file }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder submit logic
    console.log("Submitting idea:", formData);
    alert("Idea submitted successfully!");
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Upload Startup Idea
        </h1>
        <p className="text-gray-600">
          Share your innovative idea with potential investors and partners.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Startup Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
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
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your startup name or title"
              />
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
                placeholder="Describe your startup idea, problem it solves, and target market"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="industry"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Industry *
                </label>
                <select
                  id="industry"
                  name="industry"
                  required
                  value={formData.industry}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Industry</option>
                  <option value="technology">Technology</option>
                  <option value="healthcare">Healthcare</option>
                  <option value="finance">Finance</option>
                  <option value="education">Education</option>
                  <option value="retail">Retail</option>
                  <option value="energy">Energy</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="stage"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Current Stage *
                </label>
                <select
                  id="stage"
                  name="stage"
                  required
                  value={formData.stage}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Stage</option>
                  <option value="idea">Idea Stage</option>
                  <option value="prototype">Prototype</option>
                  <option value="mvp">MVP</option>
                  <option value="early-revenue">Early Revenue</option>
                  <option value="growth">Growth Stage</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="fundingNeeded"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Funding Needed
                </label>
                <input
                  type="text"
                  id="fundingNeeded"
                  name="fundingNeeded"
                  value={formData.fundingNeeded}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., $100,000"
                />
              </div>

              <div>
                <label
                  htmlFor="teamSize"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Team Size
                </label>
                <input
                  type="number"
                  id="teamSize"
                  name="teamSize"
                  value={formData.teamSize}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Number of team members"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="document"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Upload Pitch Deck or Business Plan
              </label>
              <input
                type="file"
                id="document"
                name="document"
                onChange={handleFileChange}
                accept=".pdf,.ppt,.pptx,.doc,.docx"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Supported formats: PDF, PPT, PPTX, DOC, DOCX (Max 10MB)
              </p>
            </div>

            <div className="flex space-x-4">
              <Button type="submit" className="flex-1">
                Submit Idea
              </Button>
              <Button type="button" variant="outline" className="flex-1">
                Save as Draft
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Upload;
