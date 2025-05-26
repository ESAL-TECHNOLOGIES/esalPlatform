import { useState, useEffect } from 'react'
import { Card, Button, Progress } from '@esal/ui'
import { useAuth } from '@esal/auth'
import { MatchSuggestor, PitchAnalyzer } from '@esal/ai-client'
import { Link } from 'react-router-dom'
import { 
  TrendingUp, 
  Users, 
  FileText, 
  Target,
  Eye,
  MessageSquare,
  Calendar,
  Award
} from 'lucide-react'

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    profileCompletion: 75,
    pitchViews: 124,
    investorMatches: 8,
    messagesReceived: 3,
    upcomingMeetings: 2
  })

  const quickActions = [
    {
      title: 'Complete Profile',
      description: 'Add missing information to improve your visibility',
      icon: Users,
      href: '/profile',
      color: 'bg-blue-500'
    },
    {
      title: 'Upload Pitch Deck',
      description: 'Get AI-powered feedback on your presentation',
      icon: FileText,
      href: '/pitch-deck',
      color: 'bg-green-500'
    },
    {
      title: 'View Matches',
      description: 'See investors interested in your startup',
      icon: Target,
      href: '/matches',
      color: 'bg-purple-500'
    },
    {
      title: 'Analytics',
      description: 'Track your progress and performance',
      icon: TrendingUp,
      href: '/analytics',
      color: 'bg-orange-500'
    }
  ]

  const recentActivity = [
    {
      type: 'match',
      message: 'New investor match: TechVentures Capital',
      time: '2 hours ago',
      icon: Target
    },
    {
      type: 'view',
      message: 'Your pitch deck was viewed by 3 investors',
      time: '5 hours ago',
      icon: Eye
    },
    {
      type: 'message',
      message: 'Message from Sarah Johnson at Innovation Fund',
      time: '1 day ago',
      icon: MessageSquare
    },
    {
      type: 'meeting',
      message: 'Upcoming meeting with Global Ventures tomorrow',
      time: '2 days ago',
      icon: Calendar
    }
  ]

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Welcome back, {user?.name?.split(' ')[0]}! 👋
        </h1>
        <p className="text-muted-foreground mt-2">
          Here's what's happening with your startup journey today.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Eye className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Pitch Views</p>
              <p className="text-2xl font-bold">{stats.pitchViews}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Target className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Investor Matches</p>
              <p className="text-2xl font-bold">{stats.investorMatches}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <MessageSquare className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">New Messages</p>
              <p className="text-2xl font-bold">{stats.messagesReceived}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Calendar className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Upcoming Meetings</p>
              <p className="text-2xl font-bold">{stats.upcomingMeetings}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Profile Completion */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">Profile Completion</h3>
            <p className="text-sm text-muted-foreground">
              Complete your profile to increase visibility to investors
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-primary">{stats.profileCompletion}%</p>
            <p className="text-xs text-muted-foreground">Almost there!</p>
          </div>
        </div>
        <Progress value={stats.profileCompletion} className="mb-4" />
        <div className="flex flex-wrap gap-2">
          {stats.profileCompletion < 100 && (
            <>
              <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                Add company description
              </span>
              <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                Upload team photos
              </span>
            </>
          )}
        </div>
      </Card>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              {quickActions.map((action, index) => {
                const Icon = action.icon
                return (
                  <Link
                    key={index}
                    to={action.href}
                    className="flex items-center p-3 rounded-lg border border-border hover:bg-muted transition-colors"
                  >
                    <div className={`p-2 rounded-lg ${action.color}`}>
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                    <div className="ml-3 flex-1">
                      <p className="text-sm font-medium">{action.title}</p>
                      <p className="text-xs text-muted-foreground">{action.description}</p>
                    </div>
                  </Link>
                )
              })}
            </div>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Recent Activity</h3>
              <Button variant="outline" size="sm">
                View All
              </Button>
            </div>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => {
                const Icon = activity.icon
                return (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="p-2 bg-muted rounded-full">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">{activity.message}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        </div>
      </div>

      {/* AI-Powered Insights */}
      <div className="grid lg:grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-semibold mb-4">Top Investor Matches</h3>
          <MatchSuggestor
            entityId={user?.id || ''}
            entityType="startup"
            onMatchSelect={(match) => {
              console.log('Selected match:', match)
              // Navigate to match details
            }}
          />
        </div>

        <div>
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Award className="h-5 w-5 mr-2 text-yellow-500" />
              Achievement Badges
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 border border-border rounded-lg">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <p className="text-sm font-medium">Pitch Master</p>
                <p className="text-xs text-muted-foreground">Uploaded first pitch deck</p>
              </div>
              <div className="text-center p-4 border border-border rounded-lg opacity-50">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Users className="h-6 w-6 text-gray-400" />
                </div>
                <p className="text-sm font-medium">Network Builder</p>
                <p className="text-xs text-muted-foreground">Connect with 10 investors</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
