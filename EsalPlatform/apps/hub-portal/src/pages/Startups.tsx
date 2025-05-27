import React, { useState } from 'react'
import { Card, Button } from '@esal/ui'

const Startups = () => {
  const [filter, setFilter] = useState('all')
  const [view, setView] = useState('grid')

  const startups = [
    {
      id: 1,
      name: 'TechFlow Solutions',
      stage: 'Series A',
      industry: 'FinTech',
      founded: '2022',
      team: 8,
      revenue: '$250K',
      status: 'active',
      description: 'AI-powered financial analytics platform for SMEs',
      founder: 'Alex Chen',
      progress: 75,
      nextMilestone: 'Q1 Revenue Target'
    },
    {
      id: 2,
      name: 'GreenTech Innovations',
      stage: 'Seed',
      industry: 'CleanTech',
      founded: '2023',
      team: 5,
      revenue: '$50K',
      status: 'active',
      description: 'Sustainable energy solutions for urban environments',
      founder: 'Maria Rodriguez',
      progress: 60,
      nextMilestone: 'Prototype Testing'
    },
    {
      id: 3,
      name: 'HealthFirst AI',
      stage: 'Pre-Seed',
      industry: 'HealthTech',
      founded: '2023',
      team: 3,
      revenue: '$10K',
      status: 'incubating',
      description: 'AI-powered diagnostic tools for healthcare providers',
      founder: 'Dr. James Wilson',
      progress: 30,
      nextMilestone: 'FDA Approval Process'
    },
    {
      id: 4,
      name: 'EduLearn Platform',
      stage: 'Series A',
      industry: 'EdTech',
      founded: '2021',
      team: 12,
      revenue: '$500K',
      status: 'graduated',
      description: 'Personalized learning platform for K-12 students',
      founder: 'Sarah Kim',
      progress: 90,
      nextMilestone: 'International Expansion'
    },
  ]

  const filteredStartups = startups.filter(startup => {
    if (filter === 'all') return true
    return startup.status === filter
  })

  const statusColors = {
    active: 'bg-green-100 text-green-800',
    incubating: 'bg-blue-100 text-blue-800',
    graduated: 'bg-purple-100 text-purple-800'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Portfolio Startups</h1>
          <p className="text-gray-600">Manage and track your incubated startups</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">Export Report</Button>
          <Button>Add Startup</Button>
        </div>
      </div>

      {/* Filters and View Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex space-x-2">
          {['all', 'active', 'incubating', 'graduated'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize ${
                filter === status
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setView('grid')}
            className={`p-2 rounded ${view === 'grid' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
          >
            ⊞
          </button>
          <button
            onClick={() => setView('list')}
            className={`p-2 rounded ${view === 'list' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
          >
            ☰
          </button>
        </div>
      </div>

      {/* Startups Grid/List */}
      {view === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStartups.map((startup) => (
            <Card key={startup.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{startup.name}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[startup.status]}`}>
                  {startup.status}
                </span>
              </div>
              
              <p className="text-gray-600 text-sm mb-4">{startup.description}</p>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Stage:</span>
                  <span className="font-medium">{startup.stage}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Industry:</span>
                  <span className="font-medium">{startup.industry}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Team Size:</span>
                  <span className="font-medium">{startup.team} members</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Revenue:</span>
                  <span className="font-medium">{startup.revenue}</span>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-500">Progress</span>
                  <span className="font-medium">{startup.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${startup.progress}%` }}
                  ></div>
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm text-gray-600 mb-2">Next Milestone:</p>
                <p className="text-sm font-medium">{startup.nextMilestone}</p>
              </div>

              <div className="mt-4 flex space-x-2">
                <Button size="sm" className="flex-1">View Details</Button>
                <Button variant="outline" size="sm">Schedule Check-in</Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Startup
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Industry
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Team
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Revenue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStartups.map((startup) => (
                  <tr key={startup.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{startup.name}</div>
                        <div className="text-sm text-gray-500">{startup.founder}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {startup.stage}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {startup.industry}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {startup.team}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {startup.revenue}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[startup.status]}`}>
                        {startup.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <Button size="sm">View</Button>
                      <Button variant="outline" size="sm">Edit</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}

export default Startups
