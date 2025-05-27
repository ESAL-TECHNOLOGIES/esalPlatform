import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@esal/ui";

const Metrics: React.FC = () => {
  const performanceData = [
    {
      metric: "Total Views",
      value: "1,234",
      change: "+12%",
      changeType: "positive",
    },
    {
      metric: "Investor Interest",
      value: "43",
      change: "+8%",
      changeType: "positive",
    },
    {
      metric: "Pitch Downloads",
      value: "89",
      change: "+15%",
      changeType: "positive",
    },
    {
      metric: "Follow-ups",
      value: "12",
      change: "-3%",
      changeType: "negative",
    },
  ];

  const ideaMetrics = [
    {
      title: "AI-Powered Healthcare App",
      views: 456,
      interests: 12,
      score: 8.5,
      status: "Active",
    },
    {
      title: "Sustainable Energy Solution",
      views: 342,
      interests: 8,
      score: 9.1,
      status: "Featured",
    },
    {
      title: "EdTech Platform",
      views: 234,
      interests: 5,
      score: 7.3,
      status: "Under Review",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Analytics & Metrics
        </h1>
        <p className="text-gray-600">
          Track the performance of your startup ideas and investor engagement.
        </p>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {performanceData.map((item, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {item.metric}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {item.value}
                  </p>
                </div>
                <div
                  className={`text-sm font-medium ${
                    item.changeType === "positive"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {item.change}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Views Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center text-gray-500">
                <div className="text-4xl mb-2">📊</div>
                <p>Chart visualization would go here</p>
                <p className="text-sm">
                  Showing views trend over the last 30 days
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Investor Interest by Industry</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center text-gray-500">
                <div className="text-4xl mb-2">🥧</div>
                <p>Pie chart would go here</p>
                <p className="text-sm">
                  Breakdown of interest by industry sectors
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Individual Idea Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Individual Idea Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">
                    Idea Title
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">
                    Views
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">
                    Interests
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">
                    Score
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {ideaMetrics.map((idea, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">
                        {idea.title}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{idea.views}</td>
                    <td className="py-3 px-4 text-gray-600">
                      {idea.interests}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <span
                          className={`font-medium ${
                            idea.score >= 8
                              ? "text-green-600"
                              : idea.score >= 7
                                ? "text-yellow-600"
                                : "text-red-600"
                          }`}
                        >
                          {idea.score}/10
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          idea.status === "Featured"
                            ? "bg-green-100 text-green-800"
                            : idea.status === "Active"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {idea.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Improvement Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
              <div className="text-blue-600 text-xl">💡</div>
              <div>
                <h4 className="font-medium text-blue-900">
                  Optimize Your Pitch Deck
                </h4>
                <p className="text-sm text-blue-700">
                  Your healthcare app idea has high views but low conversion.
                  Consider adding more market validation data.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg">
              <div className="text-green-600 text-xl">📈</div>
              <div>
                <h4 className="font-medium text-green-900">
                  Strong Performance
                </h4>
                <p className="text-sm text-green-700">
                  Your sustainable energy solution is trending well. Consider
                  reaching out to interested investors.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-4 bg-yellow-50 rounded-lg">
              <div className="text-yellow-600 text-xl">⚠️</div>
              <div>
                <h4 className="font-medium text-yellow-900">Needs Attention</h4>
                <p className="text-sm text-yellow-700">
                  Your EdTech platform needs more detail. Add competitor
                  analysis and revenue projections.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Metrics;
