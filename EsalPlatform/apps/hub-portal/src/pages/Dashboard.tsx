import React from 'react'
import { Card, Button } from '@esal/ui'

const Dashboard = () => {
  const hubStats = [
    { label: 'Active Startups', value: '24', change: '+12%' },
    { label: 'Portfolio Value', value: '$2.4M', change: '+18%' },
    { label: 'Upcoming Events', value: '7', change: '+3' },
    { label: 'New Applications', value: '15', change: '+5' },
  ]

  const recentActivities = [
    { type: 'startup', message: 'TechFlow submitted their Q4 report', time: '2 hours ago' },
    { type: 'event', message: 'Pitch Day 2024 registration opened', time: '4 hours ago' },
    { type: 'member', message: 'Sarah Johnson joined as mentor', time: '1 day ago' },
    { type: 'funding', message: 'GreenTech secured $500K Series A', time: '2 days ago' },
  ]

  const upcomingEvents = [
    { name: 'Weekly Startup Check-in', date: 'Today, 3:00 PM', attendees: 12 },
    { name: 'Investor Pitch Night', date: 'Tomorrow, 6:00 PM', attendees: 25 },
    { name: 'Mentorship Program Launch', date: 'Friday, 10:00 AM', attendees: 18 },
    { name: 'Demo Day Preparation', date: 'Next Week', attendees: 8 },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Hub Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening at your innovation hub.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {hubStats.map((stat, index) => (
          <Card key={index} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <span className="text-sm text-green-600 font-medium">{stat.change}</span>
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
                    {activity.type === 'startup' && '🚀'}
                    {activity.type === 'event' && '📅'}
                    {activity.type === 'member' && '👤'}
                    {activity.type === 'funding' && '💰'}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">{activity.message}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Upcoming Events */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Upcoming Events</h2>
            <Button variant="outline" size="sm">Manage Events</Button>
          </div>
          <div className="space-y-4">
            {upcomingEvents.map((event, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">{event.name}</h3>
                  <p className="text-xs text-gray-500">{event.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{event.attendees}</p>
                  <p className="text-xs text-gray-500">attendees</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button className="h-16 flex flex-col items-center justify-center space-y-2">
            <span className="text-lg">📝</span>
            <span>Review Applications</span>
          </Button>
          <Button variant="outline" className="h-16 flex flex-col items-center justify-center space-y-2">
            <span className="text-lg">📊</span>
            <span>Generate Reports</span>
          </Button>
          <Button variant="outline" className="h-16 flex flex-col items-center justify-center space-y-2">
            <span className="text-lg">🎯</span>
            <span>Schedule Meetings</span>
          </Button>
        </div>
      </Card>
    </div>
  )
}

export default Dashboard
