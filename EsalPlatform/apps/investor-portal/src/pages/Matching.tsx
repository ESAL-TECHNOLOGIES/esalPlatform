import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button } from '@esal/ui';

const Matching: React.FC = () => {
  const [preferences, setPreferences] = useState({
    industries: [] as string[],
    stages: [] as string[],
    minFunding: '',
    maxFunding: '',
    geography: [] as string[],
    riskTolerance: 'medium'
  });

  const [matches] = useState([
    {
      id: 1,
      startup: 'QuantumAI Labs',
      matchScore: 96,
      industry: 'AI/ML',
      stage: 'Series A',
      funding: '$2M',
      highlights: ['AI expertise match', 'Growth stage preference', 'Geographic alignment'],
      description: 'Developing quantum-enhanced machine learning algorithms for financial modeling.',
      team: 15,
      traction: 'Used by 3 major banks'
    },
    {
      id: 2,
      startup: 'BioSynth Solutions',
      matchScore: 89,
      industry: 'Biotech',
      stage: 'Seed',
      funding: '$800K',
      highlights: ['Healthcare focus match', 'Seed stage preference', 'Strong IP portfolio'],
      description: 'Synthetic biology platform for sustainable pharmaceutical manufacturing.',
      team: 8,
      traction: '2 patents filed, FDA conversations initiated'
    },
    {
      id: 3,
      startup: 'CleanWave Energy',
      matchScore: 84,
      industry: 'CleanTech',
      stage: 'Series A',
      funding: '$1.5M',
      highlights: ['ESG alignment', 'Revenue model fit', 'Experienced team'],
      description: 'Next-generation wave energy conversion technology for coastal communities.',
      team: 12,
      traction: '3 pilot installations, $400K revenue'
    }
  ]);

  const industryOptions = [
    'AI/ML', 'Biotech', 'CleanTech', 'FinTech', 'HealthTech', 
    'EdTech', 'PropTech', 'RetailTech', 'AgriTech', 'SpaceTech'
  ];

  const stageOptions = [
    'Pre-Seed', 'Seed', 'Series A', 'Series B', 'Series C+'
  ];

  const geographyOptions = [
    'North America', 'Europe', 'Asia-Pacific', 'Latin America', 'Middle East & Africa'
  ];

  const handleIndustryToggle = (industry: string) => {
    setPreferences(prev => ({
      ...prev,
      industries: prev.industries.includes(industry)
        ? prev.industries.filter(i => i !== industry)
        : [...prev.industries, industry]
    }));
  };

  const handleStageToggle = (stage: string) => {
    setPreferences(prev => ({
      ...prev,
      stages: prev.stages.includes(stage)
        ? prev.stages.filter(s => s !== stage)
        : [...prev.stages, stage]
    }));
  };

  const handleGeographyToggle = (geo: string) => {
    setPreferences(prev => ({
      ...prev,
      geography: prev.geography.includes(geo)
        ? prev.geography.filter(g => g !== geo)
        : [...prev.geography, geo]
    }));
  };

  const runMatching = () => {
    // Simulate AI matching algorithm
    alert('Running AI matching algorithm with your updated preferences...');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">AI-Powered Matching</h1>
        <p className="text-gray-600">Configure your investment preferences and let our AI find the perfect startup matches.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Preferences Panel */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Investment Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Industries */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Industries of Interest</label>
                <div className="space-y-2">
                  {industryOptions.map((industry) => (
                    <label key={industry} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={preferences.industries.includes(industry)}
                        onChange={() => handleIndustryToggle(industry)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{industry}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Funding Stages */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Funding Stages</label>
                <div className="space-y-2">
                  {stageOptions.map((stage) => (
                    <label key={stage} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={preferences.stages.includes(stage)}
                        onChange={() => handleStageToggle(stage)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{stage}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Funding Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Investment Range</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Min ($)"
                    value={preferences.minFunding}
                    onChange={(e) => setPreferences(prev => ({ ...prev, minFunding: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Max ($)"
                    value={preferences.maxFunding}
                    onChange={(e) => setPreferences(prev => ({ ...prev, maxFunding: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Geography */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Geographic Preferences</label>
                <div className="space-y-2">
                  {geographyOptions.map((geo) => (
                    <label key={geo} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={preferences.geography.includes(geo)}
                        onChange={() => handleGeographyToggle(geo)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{geo}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Risk Tolerance */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Risk Tolerance</label>
                <select
                  value={preferences.riskTolerance}
                  onChange={(e) => setPreferences(prev => ({ ...prev, riskTolerance: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="conservative">Conservative</option>
                  <option value="medium">Medium</option>
                  <option value="aggressive">Aggressive</option>
                </select>
              </div>

              <Button onClick={runMatching} className="w-full">
                Update Matches
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Matches Results */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Your Top Matches</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {matches.map((match) => (
                  <div key={match.id} className="border rounded-lg p-6 hover:bg-gray-50">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900">{match.startup}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                          <span>{match.industry}</span>
                          <span>•</span>
                          <span>{match.stage}</span>
                          <span>•</span>
                          <span>{match.team} team members</span>
                        </div>
                      </div>
                      <div className="text-center">
                        <div className={`text-2xl font-bold ${
                          match.matchScore >= 90 ? 'text-green-600' :
                          match.matchScore >= 80 ? 'text-yellow-600' : 'text-gray-600'
                        }`}>
                          {match.matchScore}%
                        </div>
                        <div className="text-xs text-gray-500">Match Score</div>
                      </div>
                    </div>

                    <p className="text-gray-700 mb-4">{match.description}</p>

                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">Why this matches your preferences:</h4>
                      <div className="flex flex-wrap gap-2">
                        {match.highlights.map((highlight, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                          >
                            {highlight}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-6 text-sm text-gray-600">
                        <span><strong>Seeking:</strong> {match.funding}</span>
                        <span><strong>Traction:</strong> {match.traction}</span>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm">
                          Express Interest
                        </Button>
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Matching Insights */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Matching Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">47</div>
                  <div className="text-sm text-gray-600">Total Matches Found</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">12</div>
                  <div className="text-sm text-gray-600">High-Quality Matches (&gt;85%)</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">3</div>
                  <div className="text-sm text-gray-600">Perfect Matches (&gt;95%)</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Matching;
