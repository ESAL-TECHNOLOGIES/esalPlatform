import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, Button } from "@esal/ui";
import {
  Building2,
  Filter,
  TrendingUp,
  DollarSign,
  MapPin,
  Search,
  Rocket,
  Target,
  BarChart3,
  Globe,
} from "lucide-react";

const Startups: React.FC = () => {
  const [filters, setFilters] = useState({
    industry: "",
    stage: "",
    funding: "",
    location: "",
  });
  const startups: any[] = [];

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };
  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-700 rounded-xl p-8 text-white">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-white/20 rounded-lg">
            <Rocket className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Browse Startups</h1>
            <p className="text-purple-100">
              Discover vetted startup opportunities that match your investment
              criteria
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-6 text-sm">
          <div className="flex items-center space-x-2">
            <Target className="h-4 w-4" />
            <span>Curated Opportunities</span>
          </div>
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Performance Tracking</span>
          </div>
          <div className="flex items-center space-x-2">
            <Globe className="h-4 w-4" />
            <span>Global Reach</span>
          </div>
        </div>
      </div>
      {/* Filters */}
      <Card className="border-0 shadow-lg">
        {" "}
        <CardHeader>
          <CardTitle>
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-purple-600" />
              <span>Filters</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-1">
                <Building2 className="h-4 w-4 text-purple-600" />
                <span>Industry</span>
              </label>{" "}
              <select
                value={filters.industry}
                onChange={(e) => handleFilterChange("industry", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                aria-label="Select industry"
              >
                <option value="">All Industries</option>
                <option value="healthcare">Healthcare</option>
                <option value="energy">Energy</option>
                <option value="education">Education</option>
                <option value="fintech">FinTech</option>
                <option value="retail">Retail</option>
              </select>
            </div>{" "}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-1">
                <TrendingUp className="h-4 w-4 text-purple-600" />
                <span>Stage</span>
              </label>{" "}
              <select
                value={filters.stage}
                onChange={(e) => handleFilterChange("stage", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                aria-label="Select stage"
              >
                <option value="">All Stages</option>
                <option value="pre-seed">Pre-Seed</option>
                <option value="seed">Seed</option>
                <option value="series-a">Series A</option>
                <option value="series-b">Series B</option>
              </select>
            </div>{" "}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-1">
                <DollarSign className="h-4 w-4 text-purple-600" />
                <span>Funding Range</span>
              </label>
              <select
                value={filters.funding}
                onChange={(e) => handleFilterChange("funding", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                aria-label="Select funding range"
              >
                <option value="">Any Amount</option>
                <option value="0-500k">$0 - $500K</option>
                <option value="500k-1m">$500K - $1M</option>
                <option value="1m-5m">$1M - $5M</option>
                <option value="5m+">$5M+</option>
              </select>
            </div>{" "}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-1">
                <MapPin className="h-4 w-4 text-purple-600" />
                <span>Location</span>
              </label>
              <select
                value={filters.location}
                onChange={(e) => handleFilterChange("location", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                aria-label="Select location"
              >
                <option value="">Any Location</option>
                <option value="sf">San Francisco Bay Area</option>
                <option value="nyc">New York City</option>
                <option value="boston">Boston</option>
                <option value="austin">Austin</option>
                <option value="remote">Remote</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>{" "}
      {/* Startup List */}
      <div className="space-y-6">
        {startups.length === 0 ? (
          <Card className="border-0 shadow-lg">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Startups Found
              </h3>
              <p className="text-gray-600 mb-6">
                We couldn't find any startups matching your current filters. Try
                adjusting your criteria or browse all available opportunities.
              </p>
              <div className="flex justify-center space-x-3">
                <Button
                  variant="outline"
                  onClick={() =>
                    setFilters({
                      industry: "",
                      stage: "",
                      funding: "",
                      location: "",
                    })
                  }
                  className="flex items-center space-x-2"
                >
                  <Filter className="h-4 w-4" />
                  <span>Clear Filters</span>
                </Button>
                <Button className="flex items-center space-x-2">
                  <Rocket className="h-4 w-4" />
                  <span>Browse All</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          startups.map((startup) => (
            <Card
              key={startup.id}
              className="hover:shadow-lg transition-shadow"
            >
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900">
                        {startup.name}
                      </h3>
                      <p className="text-gray-600 mt-1">{startup.tagline}</p>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                        <span>{startup.industry}</span>
                        <span>•</span>
                        <span>{startup.stage}</span>
                        <span>•</span>
                        <span>{startup.location}</span>
                        <span>•</span>
                        <span>{startup.team} employees</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-blue-600">
                        {startup.funding}
                      </div>
                      <div className="text-sm text-gray-500">Seeking</div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-700">{startup.description}</p>

                  {/* Metrics */}
                  <div className="grid grid-cols-3 gap-4 py-4 bg-gray-50 rounded-lg px-4">
                    <div className="text-center">
                      <div className="font-semibold text-gray-900">
                        {startup.metrics.revenue}
                      </div>
                      <div className="text-sm text-gray-600">Revenue</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-green-600">
                        {startup.metrics.growth}
                      </div>
                      <div className="text-sm text-gray-600">Growth</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-gray-900">
                        {startup.metrics.customers}
                      </div>
                      <div className="text-sm text-gray-600">Customers</div>
                    </div>
                  </div>

                  {/* Founders */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      Founding Team
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {startup.founders?.map((founder: any, index: number) => (
                        <div
                          key={index}
                          className="flex items-center space-x-3"
                        >
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-medium">
                              {founder.name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {founder.name}
                            </div>
                            <div className="text-sm text-gray-600">
                              {founder.role} • {founder.background}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-3 pt-4 border-t">
                    <Button className="flex-1">Express Interest</Button>
                    <Button variant="secondary" className="flex-1">
                      Request Info
                    </Button>
                    <Button variant="outline">Save</Button>
                  </div>
                </div>
              </CardContent>{" "}
            </Card>
          ))
        )}
      </div>
      {/* Load More */}
      <div className="text-center">
        <Button variant="outline" size="lg">
          Load More Startups
        </Button>
      </div>
    </div>
  );
};

export default Startups;
