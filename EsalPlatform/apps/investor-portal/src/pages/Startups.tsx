import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button } from '@esal/ui';

const Startups: React.FC = () => {
  const [filters, setFilters] = useState({
    industry: '',
    stage: '',
    funding: '',
    location: ''
  });

  const startups = [
    {
      id: 1,
      name: 'AI Healthcare Solutions',
      tagline: 'Revolutionizing patient care with AI-powered diagnostics',
      industry: 'Healthcare',
      stage: 'Series A',
      funding: '$500K',
      location: 'San Francisco, CA',
      team: 12,
      description: 'Our platform uses machine learning to provide faster and more accurate medical diagnoses, reducing healthcare costs by 30%.',
      metrics: {
        revenue: '$2.1M ARR',
        growth: '+150% YoY',
        customers: '45 hospitals'
      },
      founders: [
        { name: 'Dr. Emily Chen', role: 'CEO', background: 'Former Google Health' },
        { name: 'Michael Rodriguez', role: 'CTO', background: 'Ex-Apple Engineer' }
      ]
    },
    {
      id: 2,
      name: 'GreenTech Energy',
      tagline: 'Sustainable energy solutions for smart cities',
      industry: 'Energy',
      stage: 'Seed',
      funding: '$1.2M',
      location: 'Austin, TX',
      team: 8,
      description: 'Developing next-generation solar panel technology with 40% higher efficiency than current market leaders.',
      metrics: {
        revenue: '$850K ARR',
        growth: '+200% YoY',
        customers: '12 municipalities'
      },
      founders: [
        { name: 'David Park', role: 'CEO', background: 'Ex-Tesla Energy' },
        { name: 'Lisa Wang', role: 'CTO', background: 'MIT PhD Materials Science' }
      ]
    },
    {
      id: 3,
      name: 'EduPlatform Pro',
      tagline: 'Personalized learning experiences powered by AI',
      industry: 'Education',
      stage: 'Pre-Seed',
      funding: '$300K',
      location: 'Boston, MA',
      team: 5,
      description: 'AI-driven educational platform that adapts to individual learning styles, improving student outcomes by 60%.',
      metrics: {
        revenue: '$120K ARR',
        growth: '+300% YoY',
        customers: '150 schools'
      },
      founders: [
        { name: 'Sarah Thompson', role: 'CEO', background: 'Former Coursera PM' },
        { name: 'Alex Kumar', role: 'CTO', background: 'Stanford CS PhD' }
      ]
    }
  ];

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Browse Startups</h1>
        <p className="text-gray-600">Discover vetted startup opportunities that match your investment criteria.</p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
              <select
                value={filters.industry}
                onChange={(e) => handleFilterChange('industry', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Industries</option>
                <option value="healthcare">Healthcare</option>
                <option value="energy">Energy</option>
                <option value="education">Education</option>
                <option value="fintech">FinTech</option>
                <option value="retail">Retail</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stage</label>
              <select
                value={filters.stage}
                onChange={(e) => handleFilterChange('stage', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Stages</option>
                <option value="pre-seed">Pre-Seed</option>
                <option value="seed">Seed</option>
                <option value="series-a">Series A</option>
                <option value="series-b">Series B</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Funding Range</label>
              <select
                value={filters.funding}
                onChange={(e) => handleFilterChange('funding', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Any Amount</option>
                <option value="0-500k">$0 - $500K</option>
                <option value="500k-1m">$500K - $1M</option>
                <option value="1m-5m">$1M - $5M</option>
                <option value="5m+">$5M+</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <select
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
      </Card>

      {/* Startup List */}
      <div className="space-y-6">
        {startups.map((startup) => (
          <Card key={startup.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900">{startup.name}</h3>
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
                    <div className="text-lg font-bold text-blue-600">{startup.funding}</div>
                    <div className="text-sm text-gray-500">Seeking</div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-700">{startup.description}</p>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-4 py-4 bg-gray-50 rounded-lg px-4">
                  <div className="text-center">
                    <div className="font-semibold text-gray-900">{startup.metrics.revenue}</div>
                    <div className="text-sm text-gray-600">Revenue</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-green-600">{startup.metrics.growth}</div>
                    <div className="text-sm text-gray-600">Growth</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-gray-900">{startup.metrics.customers}</div>
                    <div className="text-sm text-gray-600">Customers</div>
                  </div>
                </div>

                {/* Founders */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Founding Team</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {startup.founders.map((founder, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-medium">{founder.name.charAt(0)}</span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{founder.name}</div>
                          <div className="text-sm text-gray-600">{founder.role} • {founder.background}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-3 pt-4 border-t">
                  <Button className="flex-1">
                    Express Interest
                  </Button>
                  <Button variant="secondary" className="flex-1">
                    Request Info
                  </Button>
                  <Button variant="outline">
                    Save
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
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
