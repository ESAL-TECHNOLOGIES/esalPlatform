import { useState } from 'react'
import { MatchSuggestor } from '@esal/ai-client'
import { Button, Card, CardContent, CardHeader, CardTitle, Badge, Avatar, AvatarFallback, AvatarImage, Tabs, TabsContent, TabsList, TabsTrigger } from '@esal/ui'
import { Heart, X, MessageCircle, Calendar, MapPin, DollarSign, Users, TrendingUp, Star, Filter } from 'lucide-react'

interface Match {
  id: string
  name: string
  company: string
  type: 'investor' | 'accelerator' | 'mentor'
  location: string
  industry: string[]
  stage: string[]
  matchScore: number
  status: 'pending' | 'interested' | 'not_interested' | 'connected'
  lastActivity: string
  description: string
  portfolio?: string[]
  checkSize?: string
  avatar?: string
}

export default function Matches() {
  const [matches, setMatches] = useState<Match[]>([
    {
      id: '1',
      name: 'Sarah Chen',
      company: 'TechVentures Capital',
      type: 'investor',
      location: 'San Francisco, CA',
      industry: ['Technology', 'SaaS', 'AI'],
      stage: ['Seed', 'Series A'],
      matchScore: 92,
      status: 'pending',
      lastActivity: '2024-01-15',
      description: 'Focused on early-stage B2B SaaS companies with strong product-market fit.',
      checkSize: '$100K - $2M',
      avatar: '/placeholder-avatar.jpg'
    },
    {
      id: '2',
      name: 'TechStars Boston',
      company: 'TechStars',
      type: 'accelerator',
      location: 'Boston, MA',
      industry: ['Technology', 'FinTech', 'HealthTech'],
      stage: ['Pre-seed', 'Seed'],
      matchScore: 88,
      status: 'interested',
      lastActivity: '2024-01-12',
      description: 'Leading startup accelerator program with 3-month intensive mentorship.',
      portfolio: ['Uber', 'Airbnb', 'SendGrid'],
      avatar: '/placeholder-avatar.jpg'
    },
    {
      id: '3',
      name: 'Michael Rodriguez',
      company: 'Innovation Partners',
      type: 'investor',
      location: 'New York, NY',
      industry: ['FinTech', 'Enterprise Software'],
      stage: ['Series A', 'Series B'],
      matchScore: 85,
      status: 'connected',
      lastActivity: '2024-01-10',
      description: 'Growth-stage investor with expertise in scaling B2B companies.',
      checkSize: '$2M - $10M',
      avatar: '/placeholder-avatar.jpg'
    }
  ])

  const [filter, setFilter] = useState<'all' | 'investor' | 'accelerator' | 'mentor'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'interested' | 'connected'>('all')

  const filteredMatches = matches.filter(match => {
    if (filter !== 'all' && match.type !== filter) return false
    if (statusFilter !== 'all' && match.status !== statusFilter) return false
    return true
  })

  const handleLike = (matchId: string) => {
    setMatches(prev => 
      prev.map(match => 
        match.id === matchId 
          ? { ...match, status: 'interested' as const }
          : match
      )
    )
  }

  const handlePass = (matchId: string) => {
    setMatches(prev => 
      prev.map(match => 
        match.id === matchId 
          ? { ...match, status: 'not_interested' as const }
          : match
      )
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-500'
      case 'interested': return 'bg-blue-500'
      case 'pending': return 'bg-yellow-500'
      case 'not_interested': return 'bg-gray-500'
      default: return 'bg-gray-500'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'investor': return <DollarSign className="w-4 h-4" />
      case 'accelerator': return <TrendingUp className="w-4 h-4" />
      case 'mentor': return <Users className="w-4 h-4" />
      default: return <Users className="w-4 h-4" />
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Matches</h1>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
          <Button>
            Find More Matches
          </Button>
        </div>
      </div>

      <Tabs defaultValue="discover" className="space-y-6">
        <TabsList>
          <TabsTrigger value="discover">Discover</TabsTrigger>
          <TabsTrigger value="interested">Interested ({matches.filter(m => m.status === 'interested').length})</TabsTrigger>
          <TabsTrigger value="connected">Connected ({matches.filter(m => m.status === 'connected').length})</TabsTrigger>
          <TabsTrigger value="ai-suggestions">AI Suggestions</TabsTrigger>
        </TabsList>

        <TabsContent value="discover" className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{matches.length}</div>
                <p className="text-sm text-gray-600">Total Matches</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">
                  {Math.round(matches.reduce((sum, match) => sum + match.matchScore, 0) / matches.length)}%
                </div>
                <p className="text-sm text-gray-600">Avg. Match Score</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">
                  {matches.filter(m => m.status === 'interested').length}
                </div>
                <p className="text-sm text-gray-600">Mutual Interest</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">
                  {matches.filter(m => m.status === 'connected').length}
                </div>
                <p className="text-sm text-gray-600">Connections</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            <Button 
              variant={filter === 'all' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setFilter('all')}
            >
              All Types
            </Button>
            <Button 
              variant={filter === 'investor' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setFilter('investor')}
            >
              Investors
            </Button>
            <Button 
              variant={filter === 'accelerator' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setFilter('accelerator')}
            >
              Accelerators
            </Button>
            <Button 
              variant={filter === 'mentor' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setFilter('mentor')}
            >
              Mentors
            </Button>
          </div>

          {/* Matches Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMatches.map((match) => (
              <Card key={match.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={match.avatar} />
                        <AvatarFallback>{match.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">{match.name}</h3>
                        <p className="text-sm text-gray-600">{match.company}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-semibold">{match.matchScore}%</span>
                    </div>
                  </div>

                  {/* Type and Location */}
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="flex items-center space-x-1">
                      {getTypeIcon(match.type)}
                      <span className="capitalize">{match.type}</span>
                    </Badge>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-3 h-3 mr-1" />
                      {match.location}
                    </div>
                  </div>

                  {/* Industries */}
                  <div className="flex flex-wrap gap-1">
                    {match.industry.slice(0, 3).map((industry, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {industry}
                      </Badge>
                    ))}
                    {match.industry.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{match.industry.length - 3} more
                      </Badge>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {match.description}
                  </p>

                  {/* Investment Details */}
                  {match.checkSize && (
                    <div className="flex items-center text-sm text-gray-600">
                      <DollarSign className="w-4 h-4 mr-1" />
                      Check Size: {match.checkSize}
                    </div>
                  )}

                  {/* Portfolio */}
                  {match.portfolio && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-1">Portfolio:</p>
                      <div className="flex flex-wrap gap-1">
                        {match.portfolio.slice(0, 3).map((company, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {company}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Status */}
                  <div className="flex items-center justify-between">
                    <Badge className={`${getStatusColor(match.status)} text-white`}>
                      {match.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      Last active: {new Date(match.lastActivity).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Actions */}
                  {match.status === 'pending' && (
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handlePass(match.id)}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Pass
                      </Button>
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleLike(match.id)}
                      >
                        <Heart className="w-4 h-4 mr-2" />
                        Interested
                      </Button>
                    </div>
                  )}

                  {match.status === 'connected' && (
                    <Button variant="outline" size="sm" className="w-full">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Send Message
                    </Button>
                  )}

                  {match.status === 'interested' && (
                    <Button size="sm" className="w-full">
                      <Calendar className="w-4 h-4 mr-2" />
                      Schedule Meeting
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="interested" className="space-y-6">
          <div className="space-y-4">
            {matches.filter(m => m.status === 'interested').map((match) => (
              <Card key={match.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarImage src={match.avatar} />
                      <AvatarFallback>{match.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{match.name}</h3>
                      <p className="text-sm text-gray-600">{match.company}</p>
                      <p className="text-xs text-gray-500">Showed interest on {new Date(match.lastActivity).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Message
                    </Button>
                    <Button>
                      <Calendar className="w-4 h-4 mr-2" />
                      Schedule Call
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="connected" className="space-y-6">
          <div className="space-y-4">
            {matches.filter(m => m.status === 'connected').map((match) => (
              <Card key={match.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarImage src={match.avatar} />
                      <AvatarFallback>{match.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{match.name}</h3>
                      <p className="text-sm text-gray-600">{match.company}</p>
                      <p className="text-xs text-gray-500">Connected since {new Date(match.lastActivity).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline">
                      View Profile
                    </Button>
                    <Button>
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Message
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="ai-suggestions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>AI-Powered Match Suggestions</CardTitle>
            </CardHeader>
            <CardContent>
              <MatchSuggestor />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
