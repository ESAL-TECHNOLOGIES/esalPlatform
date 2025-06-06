import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent, Button } from '@esal/ui'

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");

  const hubStats = [
    { 
      label: 'Active Startups', 
      value: '24', 
      change: '+12%',
      icon: '🚀',
      description: 'Startups in the hub',
      color: 'from-blue-500 to-blue-600',
      changeType: 'positive' as const
    },
    { 
      label: 'Portfolio Value', 
      value: '$2.4M', 
      change: '+18%',
      icon: '💰',
      description: 'Total ecosystem value',
      color: 'from-green-500 to-green-600',
      changeType: 'positive' as const
    },
    { 
      label: 'Upcoming Events', 
      value: '7', 
      change: '+3',
      icon: '📅',
      description: 'Events this month',
      color: 'from-purple-500 to-purple-600',
      changeType: 'positive' as const
    },
    { 
      label: 'New Applications', 
      value: '15', 
      change: '+5',
      icon: '📝',
      description: 'Pending applications',
      color: 'from-orange-500 to-orange-600',
      changeType: 'positive' as const
    },
  ]

  const recentActivities = [
    { 
      type: 'startup', 
      message: 'TechFlow submitted their Q4 report', 
      time: '2 hours ago',
      priority: 'high',
      icon: '🚀'
    },
    { 
      type: 'event', 
      message: 'Pitch Day 2024 registration opened', 
      time: '4 hours ago',
      priority: 'medium',
      icon: '📅'
    },
    { 
      type: 'member', 
      message: 'Sarah Johnson joined as mentor', 
      time: '1 day ago',
      priority: 'low',
      icon: '👤'
    },
    { 
      type: 'funding', 
      message: 'GreenTech secured $500K Series A', 
      time: '2 days ago',
      priority: 'high',
      icon: '💰'
    },
  ]

  const upcomingEvents = [
    { 
      name: 'Weekly Startup Check-in', 
      date: 'Today, 3:00 PM', 
      attendees: 12,
      type: 'meeting',
      status: 'confirmed'
    },
    { 
      name: 'Investor Pitch Night', 
      date: 'Tomorrow, 6:00 PM', 
      attendees: 25,
      type: 'pitch',
      status: 'confirmed'
    },
    { 
      name: 'Mentorship Program Launch', 
      date: 'Friday, 10:00 AM', 
      attendees: 18,
      type: 'program',
      status: 'planning'
    },
    { 
      name: 'Demo Day Preparation', 
      date: 'Next Week', 
      attendees: 8,
      type: 'workshop',
      status: 'planning'
    },
  ]

  const getEventTypeIcon = (type: string) => {
    const icons = {
      meeting: '🤝',
      pitch: '🎯',
      program: '🎓',
      workshop: '🛠️'
    };
    return icons[type as keyof typeof icons] || '📅';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      confirmed: 'bg-green-100 text-green-800',
      planning: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-blue-100 text-blue-800'
    };
    return colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Enhanced Header with Gradient Background */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 sm:p-8 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold">
              Hub Dashboard
            </h1>
            <p className="text-indigo-100 mt-2 text-lg">
              Welcome back! Here's what's happening at your innovation hub
            </p>
            <p className="text-sm text-indigo-200 mt-2">
              Last updated: {new Date().toLocaleTimeString()}
            </p>
          </div>
          
          {/* Dashboard Tabs */}
          <div className="flex bg-white/20 rounded-lg p-1 backdrop-blur-sm">
            {["overview", "startups", "events"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  activeTab === tab
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-white/80 hover:text-white hover:bg-white/10"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Enhanced Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {hubStats.map((stat, index) => (
          <Card key={index} className="relative overflow-hidden hover:shadow-lg transition-all duration-300 group">
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-5 group-hover:opacity-10 transition-opacity`}></div>
            <CardContent className="p-6 relative">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{stat.icon}</div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      {stat.label}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {stat.description}
                    </p>
                  </div>
                </div>
                <div className={`text-sm font-semibold px-2 py-1 rounded-full ${
                  stat.changeType === "positive"
                    ? "text-green-700 bg-green-100"
                    : "text-red-700 bg-red-100"
                }`}>
                  {stat.change}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8">        {/* Enhanced Recent Activities */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <div className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
                  <span>⚡</span>
                  <span>Recent Activities</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">Latest updates from your innovation hub</p>
              </div>
              <Button variant="outline" size="sm" className="hover:bg-gray-50">
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start space-x-4 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
                      <span className="text-lg">{activity.icon}</span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(activity.priority)}`}>
                        {activity.priority}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Upcoming Events */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
                  <span>📅</span>
                  <span>Upcoming Events</span>
                </CardTitle>
                <p className="text-sm text-gray-500 mt-1">Scheduled activities and meetings</p>
              </div>
              <Button variant="outline" size="sm" className="hover:bg-gray-50">
                Manage Events
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {upcomingEvents.map((event, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:from-gray-100 hover:to-gray-200 transition-all">
                  <div className="flex items-center space-x-4">
                    <div className="text-2xl">{getEventTypeIcon(event.type)}</div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">{event.name}</h3>
                      <p className="text-xs text-gray-600 mt-1">{event.date}</p>
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full mt-1 ${getStatusColor(event.status)}`}>
                        {event.status}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">{event.attendees}</p>
                    <p className="text-xs text-gray-500">attendees</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Quick Actions */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="border-b border-gray-100">
          <div>
            <CardTitle className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
              <span>🎯</span>
              <span>Quick Actions</span>
            </CardTitle>
            <p className="text-sm text-gray-500 mt-1">Streamline your hub management workflow</p>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="h-20 flex flex-col items-center justify-center space-y-2 bg-indigo-600 hover:bg-indigo-700 transition-colors">
              <span className="text-2xl">📝</span>
              <span className="text-sm font-medium">Review Applications</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2 hover:bg-gray-50 transition-colors">
              <span className="text-2xl">📊</span>
              <span className="text-sm font-medium">Generate Reports</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2 hover:bg-gray-50 transition-colors">
              <span className="text-2xl">🎯</span>
              <span className="text-sm font-medium">Schedule Meetings</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Hub Analytics */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="border-b border-gray-100">
          <div>
            <CardTitle className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
              <span>📈</span>
              <span>Hub Analytics</span>
            </CardTitle>
            <p className="text-sm text-gray-500 mt-1">Performance metrics and key insights</p>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                85%
              </div>
              <div className="text-sm font-semibold text-blue-900 mb-2">Success Rate</div>
              <div className="text-xs text-blue-700">
                Startups reaching next funding round
              </div>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
              <div className="text-3xl font-bold text-green-600 mb-2">
                $12.5M
              </div>
              <div className="text-sm font-semibold text-green-900 mb-2">Funds Raised</div>
              <div className="text-xs text-green-700">
                Total capital raised by startups
              </div>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                42
              </div>
              <div className="text-sm font-semibold text-purple-900 mb-2">Mentors Active</div>
              <div className="text-xs text-purple-700">
                Expert mentors guiding startups
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hub Performance Trends */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="border-b border-gray-100">
          <div>
            <CardTitle className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
              <span>📊</span>
              <span>Performance Trends</span>
            </CardTitle>
            <p className="text-sm text-gray-500 mt-1">Monthly growth and engagement metrics</p>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-4 border rounded-xl hover:bg-gray-50 transition-colors">
              <div className="text-2xl font-bold text-gray-900 mb-1">+32%</div>
              <div className="text-sm text-gray-600 mb-1">Application Growth</div>
              <div className="text-xs text-green-600 font-medium">↗ Month over month</div>
            </div>
            <div className="text-center p-4 border rounded-xl hover:bg-gray-50 transition-colors">
              <div className="text-2xl font-bold text-gray-900 mb-1">94%</div>
              <div className="text-sm text-gray-600 mb-1">Event Attendance</div>
              <div className="text-xs text-green-600 font-medium">↗ Above target</div>
            </div>
            <div className="text-center p-4 border rounded-xl hover:bg-gray-50 transition-colors">
              <div className="text-2xl font-bold text-gray-900 mb-1">4.8</div>
              <div className="text-sm text-gray-600 mb-1">Satisfaction Score</div>
              <div className="text-xs text-green-600 font-medium">↗ Excellent rating</div>
            </div>
            <div className="text-center p-4 border rounded-xl hover:bg-gray-50 transition-colors">
              <div className="text-2xl font-bold text-gray-900 mb-1">78%</div>
              <div className="text-sm text-gray-600 mb-1">Startup Retention</div>
              <div className="text-xs text-green-600 font-medium">↗ Strong engagement</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Dashboard
