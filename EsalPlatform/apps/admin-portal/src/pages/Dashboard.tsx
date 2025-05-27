import React from 'react'
import { Card, Button } from '@esal/ui'

const Dashboard = () => {
  const platformStats = [
    { label: 'Total Users', value: '1,247', change: '+15%', period: 'vs last month' },
    { label: 'Active Startups', value: '89', change: '+8%', period: 'vs last month' },
    { label: 'Total Investments', value: '$12.5M', change: '+23%', period: 'vs last month' },
    { label: 'Platform Revenue', value: '$45,230', change: '+12%', period: 'vs last month' },
  ]

  const recentActivities = [
    { type: 'user', message: 'New user registration: Alex Chen (Innovator)', time: '2 minutes ago', status: 'pending' },
    { type: 'startup', message: 'TechFlow Solutions submitted for review', time: '15 minutes ago', status: 'review' },
    { type: 'investment', message: 'Investment match: GreenTech & Sequoia', time: '1 hour ago', status: 'completed' },
    { type: 'report', message: 'Suspicious activity detected in user: investor_123', time: '2 hours ago', status: 'alert' },
    { type: 'system', message: 'System backup completed successfully', time: '4 hours ago', status: 'completed' },
  ]

  const pendingActions = [
    { title: 'User Verification Requests', count: 12, urgency: 'high' },
    { title: 'Startup Applications', count: 8, urgency: 'medium' },
    { title: 'Content Moderation', count: 5, urgency: 'low' },
    { title: 'Support Tickets', count: 23, urgency: 'medium' },
  ]

  const systemHealth = [
    { service: 'API Server', status: 'healthy', uptime: '99.9%', responseTime: '120ms' },
    { service: 'Database', status: 'healthy', uptime: '99.8%', responseTime: '45ms' },
    { service: 'File Storage', status: 'warning', uptime: '98.5%', responseTime: '200ms' },
    { service: 'Email Service', status: 'healthy', uptime: '100%', responseTime: '80ms' },
  ]

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    review: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    alert: 'bg-red-100 text-red-800'
  }

  const urgencyColors = {
    high: 'bg-red-100 text-red-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-green-100 text-green-800'
  }

  const healthColors = {
    healthy: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600">Platform overview and system monitoring</p>
      </div>

      {/* Platform Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {platformStats.map((stat, index) => (
          <Card key={index} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.period}</p>
              </div>
              <div className="text-right">
                <span className="text-sm text-green-600 font-medium">{stat.change}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activities</h2>
            <Button variant="outline" size="sm">View All</Button>
          </div>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    {activity.type === 'user' && '👤'}
                    {activity.type === 'startup' && '🚀'}
                    {activity.type === 'investment' && '💰'}
                    {activity.type === 'report' && '⚠️'}
                    {activity.type === 'system' && '⚙️'}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">{activity.message}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <p className="text-xs text-gray-500">{activity.time}</p>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[activity.status]}`}>
                      {activity.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Pending Actions */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Pending Actions</h2>
            <Button variant="outline" size="sm">Manage All</Button>
          </div>
          <div className="space-y-4">
            {pendingActions.map((action, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">{action.title}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${urgencyColors[action.urgency]}`}>
                    {action.urgency} priority
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">{action.count}</p>
                  <Button size="sm">Review</Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* System Health */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">System Health</h2>
          <Button variant="outline" size="sm">View Details</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {systemHealth.map((service, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-900">{service.service}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${healthColors[service.status]}`}>
                  {service.status}
                </span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Uptime:</span>
                  <span className="font-medium">{service.uptime}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Response:</span>
                  <span className="font-medium">{service.responseTime}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Quick Actions */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Button className="h-16 flex flex-col items-center justify-center space-y-2">
            <span className="text-lg">👥</span>
            <span>Manage Users</span>
          </Button>
          <Button variant="outline" className="h-16 flex flex-col items-center justify-center space-y-2">
            <span className="text-lg">📊</span>
            <span>Generate Report</span>
          </Button>
          <Button variant="outline" className="h-16 flex flex-col items-center justify-center space-y-2">
            <span className="text-lg">🔧</span>
            <span>System Settings</span>
          </Button>
          <Button variant="outline" className="h-16 flex flex-col items-center justify-center space-y-2">
            <span className="text-lg">📞</span>
            <span>Support Center</span>
          </Button>
        </div>
      </Card>
    </div>
  )
}

export default Dashboard
