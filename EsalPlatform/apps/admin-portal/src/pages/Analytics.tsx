import React, { useState } from 'react'
import { Card, Button } from '@esal/ui'

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('30d')

  const kpiData = [
    { label: 'Total Revenue', value: '$45,230', change: '+12%', trend: 'up' },
    { label: 'User Growth', value: '1,247', change: '+15%', trend: 'up' },
    { label: 'Active Startups', value: '89', change: '+8%', trend: 'up' },
    { label: 'Investment Volume', value: '$12.5M', change: '+23%', trend: 'up' },
    { label: 'Platform Usage', value: '85%', change: '+5%', trend: 'up' },
    { label: 'Support Tickets', value: '23', change: '-18%', trend: 'down' },
  ]

  const userMetrics = [
    { role: 'Innovators', count: 456, percentage: 36.6, change: '+12%' },
    { role: 'Investors', count: 234, percentage: 18.8, change: '+18%' },
    { role: 'Hubs', count: 67, percentage: 5.4, change: '+8%' },
    { role: 'Admins', count: 12, percentage: 1.0, change: '0%' },
  ]

  const engagementData = [
    { metric: 'Daily Active Users', value: '892', change: '+7%' },
    { metric: 'Weekly Active Users', value: '1,156', change: '+12%' },
    { metric: 'Monthly Active Users', value: '1,247', change: '+15%' },
    { metric: 'Average Session Duration', value: '24m 32s', change: '+8%' },
    { metric: 'Page Views per Session', value: '8.4', change: '+5%' },
    { metric: 'Bounce Rate', value: '23%', change: '-3%' },
  ]

  const revenueBreakdown = [
    { source: 'Subscription Fees', amount: '$28,500', percentage: 63 },
    { source: 'Transaction Fees', amount: '$12,300', percentage: 27 },
    { source: 'Premium Features', amount: '$4,430', percentage: 10 },
  ]

  const topPerformers = [
    { type: 'startup', name: 'TechFlow Solutions', metric: 'Most Viewed', value: '2,340 views' },
    { type: 'investor', name: 'Venture Capital LLC', metric: 'Most Active', value: '45 connections' },
    { type: 'hub', name: 'Innovation Hub NYC', metric: 'Most Startups', value: '23 startups' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">Platform performance and user insights</p>
        </div>
        <div className="flex space-x-3">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <Button variant="outline">Export Report</Button>
          <Button>Schedule Report</Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {kpiData.map((kpi, index) => (
          <Card key={index} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{kpi.label}</p>
                <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
              </div>
              <div className="text-right">
                <span className={`text-sm font-medium ${
                  kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {kpi.change}
                </span>
                <div className="text-lg">
                  {kpi.trend === 'up' ? '📈' : '📉'}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Distribution */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">User Distribution</h2>
          <div className="space-y-4">
            {userMetrics.map((metric, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-blue-500 rounded" style={{
                    backgroundColor: ['#3B82F6', '#8B5CF6', '#F97316', '#6B7280'][index]
                  }}></div>
                  <span className="text-sm font-medium text-gray-900">{metric.role}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${metric.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-12">{metric.count}</span>
                  <span className="text-sm text-green-600 w-12">{metric.change}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Engagement Metrics */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Engagement Metrics</h2>
          <div className="grid grid-cols-1 gap-4">
            {engagementData.map((engagement, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-900">{engagement.metric}</span>
                <div className="text-right">
                  <div className="text-sm font-bold text-gray-900">{engagement.value}</div>
                  <div className="text-xs text-green-600">{engagement.change}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Breakdown */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenue Breakdown</h2>
          <div className="space-y-4">
            {revenueBreakdown.map((revenue, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">{revenue.source}</span>
                  <span className="text-sm font-bold text-gray-900">{revenue.amount}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${revenue.percentage}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500">{revenue.percentage}% of total revenue</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Top Performers */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Performers</h2>
          <div className="space-y-4">
            {topPerformers.map((performer, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">
                      {performer.type === 'startup' && '🚀'}
                      {performer.type === 'investor' && '💰'}
                      {performer.type === 'hub' && '🏢'}
                    </span>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{performer.name}</div>
                      <div className="text-xs text-gray-500">{performer.metric}</div>
                    </div>
                  </div>
                </div>
                <div className="text-sm font-bold text-gray-900">{performer.value}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Chart Placeholder */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Platform Growth Over Time</h2>
        <div className="bg-gray-50 rounded-lg p-12 text-center">
          <div className="text-4xl mb-4">📊</div>
          <p className="text-gray-600">Interactive charts coming soon</p>
          <p className="text-sm text-gray-500 mt-2">
            Integration with charting libraries like Chart.js or D3.js
          </p>
        </div>
      </Card>

      {/* Quick Insights */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Insights</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="text-lg mb-2">🎯</div>
            <h3 className="font-medium text-gray-900">Peak Usage Hours</h3>
            <p className="text-sm text-gray-600">Most active between 9 AM - 11 AM EST</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="text-lg mb-2">📱</div>
            <h3 className="font-medium text-gray-900">Mobile Usage</h3>
            <p className="text-sm text-gray-600">67% of users access via mobile devices</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <div className="text-lg mb-2">🌍</div>
            <h3 className="font-medium text-gray-900">Geographic Distribution</h3>
            <p className="text-sm text-gray-600">Top regions: US (45%), EU (32%), Asia (23%)</p>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default Analytics
