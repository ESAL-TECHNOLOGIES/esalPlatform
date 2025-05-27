import React, { useState } from 'react'
import { Card, Button } from '@esal/ui'

const Content = () => {
  const [selectedTab, setSelectedTab] = useState('moderation')

  const moderationQueue = [
    {
      id: 1,
      type: 'startup_description',
      content: 'Revolutionary AI-powered blockchain solution for healthcare...',
      author: 'Alex Chen',
      company: 'TechFlow Solutions',
      reportReason: 'Potentially misleading claims',
      reportedBy: 'investor_user_123',
      timestamp: '2024-01-20 14:30',
      status: 'pending'
    },
    {
      id: 2,
      type: 'user_profile',
      content: 'Experienced investor with $50M+ in successful exits...',
      author: 'John Investor',
      company: 'Capital Ventures',
      reportReason: 'Unverified credentials',
      reportedBy: 'startup_user_456',
      timestamp: '2024-01-20 10:15',
      status: 'pending'
    },
    {
      id: 3,
      type: 'comment',
      content: 'This startup idea is completely unrealistic and waste of time...',
      author: 'CriticalInvestor',
      company: 'N/A',
      reportReason: 'Harassment/Inappropriate language',
      reportedBy: 'innovator_789',
      timestamp: '2024-01-19 16:45',
      status: 'reviewed'
    },
  ]

  const contentTemplates = [
    {
      id: 1,
      name: 'Welcome Email',
      type: 'email',
      category: 'onboarding',
      lastUpdated: '2024-01-15',
      status: 'active',
      usage: 'All new users'
    },
    {
      id: 2,
      name: 'Terms of Service',
      type: 'legal',
      category: 'legal',
      lastUpdated: '2024-01-10',
      status: 'active',
      usage: 'Registration process'
    },
    {
      id: 3,
      name: 'Privacy Policy',
      type: 'legal',
      category: 'legal',
      lastUpdated: '2024-01-10',
      status: 'active',
      usage: 'All users'
    },
    {
      id: 4,
      name: 'Investment Guidelines',
      type: 'guide',
      category: 'help',
      lastUpdated: '2024-01-08',
      status: 'active',
      usage: 'Investor portal'
    },
  ]

  const announcements = [
    {
      id: 1,
      title: 'Platform Maintenance Scheduled',
      type: 'maintenance',
      audience: 'all',
      status: 'draft',
      scheduledDate: '2024-01-25',
      createdBy: 'Admin Team'
    },
    {
      id: 2,
      title: 'New Matching Algorithm Release',
      type: 'feature',
      audience: 'investors',
      status: 'published',
      scheduledDate: '2024-01-20',
      createdBy: 'Product Team'
    },
    {
      id: 3,
      title: 'Q1 Demo Day Registration Open',
      type: 'event',
      audience: 'innovators',
      status: 'scheduled',
      scheduledDate: '2024-01-22',
      createdBy: 'Events Team'
    },
  ]

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    reviewed: 'bg-green-100 text-green-800',
    approved: 'bg-blue-100 text-blue-800',
    rejected: 'bg-red-100 text-red-800',
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    draft: 'bg-gray-100 text-gray-800',
    published: 'bg-green-100 text-green-800',
    scheduled: 'bg-blue-100 text-blue-800'
  }

  const typeColors = {
    startup_description: 'bg-blue-100 text-blue-800',
    user_profile: 'bg-purple-100 text-purple-800',
    comment: 'bg-orange-100 text-orange-800',
    email: 'bg-green-100 text-green-800',
    legal: 'bg-red-100 text-red-800',
    guide: 'bg-blue-100 text-blue-800',
    maintenance: 'bg-yellow-100 text-yellow-800',
    feature: 'bg-blue-100 text-blue-800',
    event: 'bg-purple-100 text-purple-800'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Content Management</h1>
          <p className="text-gray-600">Manage platform content, moderation, and communications</p>
        </div>
        <Button>Create Content</Button>
      </div>

      {/* Content Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Pending Moderation', value: moderationQueue.filter(item => item.status === 'pending').length, icon: '⚠️' },
          { label: 'Active Templates', value: contentTemplates.filter(t => t.status === 'active').length, icon: '📄' },
          { label: 'Scheduled Posts', value: announcements.filter(a => a.status === 'scheduled').length, icon: '📅' },
          { label: 'Total Content', value: contentTemplates.length + announcements.length, icon: '📚' },
        ].map((stat, index) => (
          <Card key={index} className="p-6 text-center">
            <div className="text-2xl mb-2">{stat.icon}</div>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-sm text-gray-600">{stat.label}</div>
          </Card>
        ))}
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'moderation', label: 'Content Moderation', count: moderationQueue.filter(item => item.status === 'pending').length },
            { id: 'templates', label: 'Content Templates', count: contentTemplates.length },
            { id: 'announcements', label: 'Announcements', count: announcements.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                selectedTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </nav>
      </div>

      {/* Content Based on Selected Tab */}
      {selectedTab === 'moderation' && (
        <div className="space-y-4">
          {moderationQueue.map((item) => (
            <Card key={item.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeColors[item.type]}`}>
                    {item.type.replace('_', ' ')}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[item.status]}`}>
                    {item.status}
                  </span>
                </div>
                <span className="text-sm text-gray-500">{item.timestamp}</span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Reported Content</h3>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-800">{item.content}</p>
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    <span className="font-medium">Author:</span> {item.author} ({item.company})
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Report Details</h3>
                  <div className="space-y-2">
                    <div className="text-sm">
                      <span className="text-gray-500">Reason:</span>
                      <span className="ml-2 text-gray-900">{item.reportReason}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-500">Reported by:</span>
                      <span className="ml-2 text-gray-900">{item.reportedBy}</span>
                    </div>
                  </div>
                </div>
              </div>

              {item.status === 'pending' && (
                <div className="mt-4 flex space-x-2">
                  <Button size="sm" className="bg-green-600 hover:bg-green-700">Approve</Button>
                  <Button size="sm" className="bg-red-600 hover:bg-red-700">Reject</Button>
                  <Button size="sm" variant="outline">Request Changes</Button>
                  <Button size="sm" variant="outline">View Full Context</Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {selectedTab === 'templates' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {contentTemplates.map((template) => (
            <Card key={template.id} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeColors[template.type]}`}>
                    {template.type}
                  </span>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[template.status]}`}>
                  {template.status}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Category:</span>
                  <span className="font-medium capitalize">{template.category}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Last Updated:</span>
                  <span className="font-medium">{template.lastUpdated}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Usage:</span>
                  <span className="font-medium">{template.usage}</span>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button size="sm">Edit</Button>
                <Button variant="outline" size="sm">Preview</Button>
                <Button variant="outline" size="sm">Duplicate</Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {selectedTab === 'announcements' && (
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <Card key={announcement.id} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <h3 className="text-lg font-semibold text-gray-900">{announcement.title}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeColors[announcement.type]}`}>
                    {announcement.type}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[announcement.status]}`}>
                    {announcement.status}
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  {announcement.scheduledDate}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <span className="text-sm text-gray-500">Target Audience:</span>
                  <div className="font-medium capitalize">{announcement.audience}</div>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Created By:</span>
                  <div className="font-medium">{announcement.createdBy}</div>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Scheduled Date:</span>
                  <div className="font-medium">{announcement.scheduledDate}</div>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button size="sm">Edit</Button>
                <Button variant="outline" size="sm">Preview</Button>
                {announcement.status === 'draft' && (
                  <Button size="sm" className="bg-green-600 hover:bg-green-700">Publish</Button>
                )}
                {announcement.status === 'scheduled' && (
                  <Button size="sm" variant="outline">Reschedule</Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Button className="h-16 flex flex-col items-center justify-center space-y-2">
            <span className="text-lg">📝</span>
            <span>Create Template</span>
          </Button>
          <Button variant="outline" className="h-16 flex flex-col items-center justify-center space-y-2">
            <span className="text-lg">📢</span>
            <span>Send Announcement</span>
          </Button>
          <Button variant="outline" className="h-16 flex flex-col items-center justify-center space-y-2">
            <span className="text-lg">🔍</span>
            <span>Review Queue</span>
          </Button>
          <Button variant="outline" className="h-16 flex flex-col items-center justify-center space-y-2">
            <span className="text-lg">📊</span>
            <span>Content Analytics</span>
          </Button>
        </div>
      </Card>
    </div>
  )
}

export default Content
