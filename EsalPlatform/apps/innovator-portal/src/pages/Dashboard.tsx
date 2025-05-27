import React from "react";
import { Card, CardHeader, CardTitle, CardContent, Button } from "@esal/ui";

const Dashboard: React.FC = () => {
  const recentIdeas = [
    {
      id: 1,
      title: "AI-Powered Healthcare App",
      status: "Under Review",
      submittedAt: "2024-01-15",
    },
    {
      id: 2,
      title: "Sustainable Energy Solution",
      status: "Approved",
      submittedAt: "2024-01-10",
    },
    {
      id: 3,
      title: "EdTech Platform",
      status: "Needs Revision",
      submittedAt: "2024-01-08",
    },
  ];

  const stats = [
    { label: "Ideas Submitted", value: "12" },
    { label: "Approved Ideas", value: "8" },
    { label: "Investor Matches", value: "3" },
    { label: "Total Views", value: "1.2k" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">
          Welcome back! Here's what's happening with your startup ideas.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="text-center">
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {stat.value}
              </div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="w-full">Upload New Idea</Button>
            <Button variant="secondary" className="w-full">
              Generate with AI
            </Button>
            <Button variant="outline" className="w-full">
              View Analytics
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Ideas */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Ideas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentIdeas.map((idea) => (
              <div
                key={idea.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div>
                  <h3 className="font-medium text-gray-900">{idea.title}</h3>
                  <p className="text-sm text-gray-600">
                    Submitted on {idea.submittedAt}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      idea.status === "Approved"
                        ? "bg-green-100 text-green-800"
                        : idea.status === "Under Review"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                    }`}
                  >
                    {idea.status}
                  </span>
                  <Button size="sm" variant="outline">
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
