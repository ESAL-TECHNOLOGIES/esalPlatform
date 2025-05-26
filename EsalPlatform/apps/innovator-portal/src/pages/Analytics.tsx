import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Tabs, TabsContent, TabsList, TabsTrigger } from '@esal/ui'
import { BarChart3, TrendingUp, Users, Eye, Download, Calendar, MapPin, DollarSign, Activity } from 'lucide-react'

export default function Analytics() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d')

  const stats = {
    profileViews: { value: 1247, change: 12, trend: 'up' },
    pitchViews: { value: 342, change: -5, trend: 'down' },
    matches: { value: 23, change: 8, trend: 'up' },
    connections: { value: 7, change: 3, trend: 'up' },
    responseRate: { value: 68, change: 15, trend: 'up' },
    avgEngagement: { value: 4.2, change: 0.3, trend: 'up' }
  }

  const topViewers = [
    { name: 'Sarah Chen', company: 'TechVentures Capital', views: 12, lastViewed: '2024-01-15' },
    { name: 'Michael Rodriguez', company: 'Innovation Partners', views: 8, lastViewed: '2024-01-14' },
    { name: 'TechStars Boston', company: 'TechStars', views: 6, lastViewed: '2024-01-13' },
    { name: 'Jennifer Wu', company: 'Seed Capital', views: 5, lastViewed: '2024-01-12' },
    { name: 'David Park', company: 'Growth Ventures', views: 4, lastViewed: '2024-01-11' }
  ]

  const pitchAnalytics = [
    { name: 'Series A Pitch Deck v3.pdf', views: 156, downloads: 23, shares: 8, score: 85 },
    { name: 'Demo Presentation.pptx', views: 98, downloads: 12, shares: 3, score: 72 },
    { name: 'Product Demo Video.mp4', views: 88, downloads: 15, shares: 5, score: 78 }
  ]

  const industryBreakdown = [
    { industry: 'Technology/SaaS', percentage: 45, count: 12 },
    { industry: 'FinTech', percentage: 25, count: 7 },
    { industry: 'HealthTech', percentage: 15, count: 4 },
    { industry: 'E-commerce', percentage: 10, count: 3 },
    { industry: 'Other', percentage: 5, count: 1 }
  ]

  const getTrendIcon = (trend: string) => {
    return trend === 'up' ? 
      <TrendingUp className="w-4 h-4 text-green-500" /> : 
      <Activity className="w-4 h-4 text-red-500" />
  }

  const getTrendColor = (trend: string) => {
    return trend === 'up' ? 'text-green-600' : 'text-red-600'
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Analytics</h1>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <div className="flex space-x-1">
            {['7d', '30d', '90d', '1y'].map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeRange(range as any)}
              >
                {range}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="pitch-deck">Pitch Deck Analytics</TabsTrigger>
          <TabsTrigger value="audience">Audience Insights</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Profile Views</p>
                    <p className="text-3xl font-bold">{stats.profileViews.value.toLocaleString()}</p>
                  </div>
                  <Eye className="w-8 h-8 text-blue-500" />
                </div>
                <div className="flex items-center mt-2">
                  {getTrendIcon(stats.profileViews.trend)}
                  <span className={`text-sm ml-1 ${getTrendColor(stats.profileViews.trend)}`}>
                    {stats.profileViews.change > 0 ? '+' : ''}{stats.profileViews.change}% from last period
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pitch Deck Views</p>
                    <p className="text-3xl font-bold">{stats.pitchViews.value}</p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-green-500" />
                </div>
                <div className="flex items-center mt-2">
                  {getTrendIcon(stats.pitchViews.trend)}
                  <span className={`text-sm ml-1 ${getTrendColor(stats.pitchViews.trend)}`}>
                    {stats.pitchViews.change > 0 ? '+' : ''}{stats.pitchViews.change}% from last period
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">New Matches</p>
                    <p className="text-3xl font-bold">{stats.matches.value}</p>
                  </div>
                  <Users className="w-8 h-8 text-purple-500" />
                </div>
                <div className="flex items-center mt-2">
                  {getTrendIcon(stats.matches.trend)}
                  <span className={`text-sm ml-1 ${getTrendColor(stats.matches.trend)}`}>
                    {stats.matches.change > 0 ? '+' : ''}{stats.matches.change}% from last period
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Connections Made</p>
                    <p className="text-3xl font-bold">{stats.connections.value}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-orange-500" />
                </div>
                <div className="flex items-center mt-2">
                  {getTrendIcon(stats.connections.trend)}
                  <span className={`text-sm ml-1 ${getTrendColor(stats.connections.trend)}`}>
                    {stats.connections.change > 0 ? '+' : ''}{stats.connections.change}% from last period
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Response Rate</p>
                    <p className="text-3xl font-bold">{stats.responseRate.value}%</p>
                  </div>
                  <Activity className="w-8 h-8 text-cyan-500" />
                </div>
                <div className="flex items-center mt-2">
                  {getTrendIcon(stats.responseRate.trend)}
                  <span className={`text-sm ml-1 ${getTrendColor(stats.responseRate.trend)}`}>
                    {stats.responseRate.change > 0 ? '+' : ''}{stats.responseRate.change}% from last period
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg. Engagement</p>
                    <p className="text-3xl font-bold">{stats.avgEngagement.value}/5</p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-indigo-500" />
                </div>
                <div className="flex items-center mt-2">
                  {getTrendIcon(stats.avgEngagement.trend)}
                  <span className={`text-sm ml-1 ${getTrendColor(stats.avgEngagement.trend)}`}>
                    {stats.avgEngagement.change > 0 ? '+' : ''}{stats.avgEngagement.change} from last period
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chart Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Views Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Chart visualization would be here</p>
                  <p className="text-sm text-gray-400">Integration with charting library needed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pitch-deck" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pitch Deck Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pitchAnalytics.map((pitch, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-semibold">{pitch.name}</h3>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Eye className="w-4 h-4 mr-1" />
                          {pitch.views} views
                        </div>
                        <div className="flex items-center">
                          <Download className="w-4 h-4 mr-1" />
                          {pitch.downloads} downloads
                        </div>
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          {pitch.shares} shares
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{pitch.score}</div>
                      <div className="text-sm text-gray-600">AI Score</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audience" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Viewers */}
            <Card>
              <CardHeader>
                <CardTitle>Top Profile Viewers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topViewers.map((viewer, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h3 className="font-semibold">{viewer.name}</h3>
                        <p className="text-sm text-gray-600">{viewer.company}</p>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{viewer.views} views</div>
                        <div className="text-sm text-gray-600">
                          Last: {new Date(viewer.lastViewed).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Industry Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Viewer Industry Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {industryBreakdown.map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{item.industry}</span>
                        <span>{item.percentage}% ({item.count})</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${item.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Geographic Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Geographic Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Map visualization would be here</p>
                  <p className="text-sm text-gray-400">Integration with mapping library needed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Engagement Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Average Time on Profile</span>
                  <span className="font-semibold">3m 24s</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Bounce Rate</span>
                  <span className="font-semibold">32%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Return Visitors</span>
                  <span className="font-semibold">18%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Contact Rate</span>
                  <span className="font-semibold">12%</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Peak Activity Times</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Monday - Friday</span>
                    <Badge>9AM - 6PM</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Peak Day</span>
                    <Badge>Wednesday</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Peak Hour</span>
                    <Badge>2PM - 3PM</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Time Zone</span>
                    <Badge>EST (most viewers)</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Engagement Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Activity className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Timeline visualization would be here</p>
                  <p className="text-sm text-gray-400">Shows engagement patterns over time</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
