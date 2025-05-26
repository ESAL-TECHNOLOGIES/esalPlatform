import { useState } from 'react'
import { PitchAnalyzer } from '@esal/ai-client'
import { Button, Card, CardContent, CardHeader, CardTitle, Badge, Progress, Tabs, TabsContent, TabsList, TabsTrigger } from '@esal/ui'
import { Upload, Download, Eye, Edit, Trash2, Plus, FileText, Video, BarChart3 } from 'lucide-react'

interface PitchDeck {
  id: string
  name: string
  type: 'pdf' | 'ppt' | 'video'
  size: string
  uploadDate: string
  status: 'draft' | 'analyzing' | 'ready' | 'needs_review'
  score?: number
  views: number
}

export default function PitchDeck() {
  const [pitchDecks, setPitchDecks] = useState<PitchDeck[]>([
    {
      id: '1',
      name: 'Series A Pitch Deck v3.pdf',
      type: 'pdf',
      size: '2.4 MB',
      uploadDate: '2024-01-15',
      status: 'ready',
      score: 85,
      views: 23
    },
    {
      id: '2',
      name: 'Demo Presentation.pptx',
      type: 'ppt',
      size: '5.1 MB',
      uploadDate: '2024-01-10',
      status: 'needs_review',
      score: 72,
      views: 12
    },
    {
      id: '3',
      name: 'Product Demo Video.mp4',
      type: 'video',
      size: '45.2 MB',
      uploadDate: '2024-01-08',
      status: 'analyzing',
      views: 5
    }
  ])

  const [selectedDeck, setSelectedDeck] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'bg-green-500'
      case 'analyzing': return 'bg-yellow-500'
      case 'needs_review': return 'bg-orange-500'
      case 'draft': return 'bg-gray-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ready': return 'Ready'
      case 'analyzing': return 'Analyzing'
      case 'needs_review': return 'Needs Review'
      case 'draft': return 'Draft'
      default: return 'Unknown'
    }
  }

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf': return <FileText className="w-5 h-5" />
      case 'ppt': return <FileText className="w-5 h-5" />
      case 'video': return <Video className="w-5 h-5" />
      default: return <FileText className="w-5 h-5" />
    }
  }

  const handleAnalyze = async (deckId: string) => {
    setIsAnalyzing(true)
    setSelectedDeck(deckId)
    // Simulate analysis
    setTimeout(() => {
      setIsAnalyzing(false)
      setPitchDecks(prev => 
        prev.map(deck => 
          deck.id === deckId 
            ? { ...deck, status: 'ready' as const, score: Math.floor(Math.random() * 30) + 70 }
            : deck
        )
      )
    }, 3000)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Pitch Deck Management</h1>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Upload New Deck
        </Button>
      </div>

      <Tabs defaultValue="decks" className="space-y-6">
        <TabsList>
          <TabsTrigger value="decks">My Pitch Decks</TabsTrigger>
          <TabsTrigger value="analyzer">AI Analyzer</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="decks" className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{pitchDecks.length}</div>
                <p className="text-sm text-gray-600">Total Decks</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">
                  {pitchDecks.reduce((sum, deck) => sum + deck.views, 0)}
                </div>
                <p className="text-sm text-gray-600">Total Views</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">
                  {Math.round(pitchDecks.filter(d => d.score).reduce((sum, deck) => sum + (deck.score || 0), 0) / pitchDecks.filter(d => d.score).length) || 0}
                </div>
                <p className="text-sm text-gray-600">Avg. Score</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">
                  {pitchDecks.filter(d => d.status === 'ready').length}
                </div>
                <p className="text-sm text-gray-600">Ready for Sharing</p>
              </CardContent>
            </Card>
          </div>

          {/* Pitch Decks List */}
          <div className="space-y-4">
            {pitchDecks.map((deck) => (
              <Card key={deck.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      {getFileIcon(deck.type)}
                    </div>
                    <div>
                      <h3 className="font-semibold">{deck.name}</h3>
                      <p className="text-sm text-gray-600">
                        {deck.size} • Uploaded {new Date(deck.uploadDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <Badge variant="outline" className={`${getStatusColor(deck.status)} text-white`}>
                      {getStatusText(deck.status)}
                    </Badge>
                    
                    {deck.score && (
                      <div className="text-center">
                        <div className="text-2xl font-bold">{deck.score}</div>
                        <div className="text-xs text-gray-600">AI Score</div>
                      </div>
                    )}

                    <div className="text-center">
                      <div className="text-lg font-semibold">{deck.views}</div>
                      <div className="text-xs text-gray-600">Views</div>
                    </div>

                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {deck.status === 'needs_review' && deck.score && (
                  <div className="mt-4 p-4 bg-orange-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-orange-800">Improvement Suggestions Available</p>
                        <p className="text-sm text-orange-600">
                          AI analysis complete. Score: {deck.score}/100
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        View Feedback
                      </Button>
                    </div>
                  </div>
                )}

                {deck.status === 'analyzing' && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Analyzing content...</span>
                      <span className="text-sm text-gray-600">75%</span>
                    </div>
                    <Progress value={75} className="w-full" />
                  </div>
                )}
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analyzer" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                AI Pitch Analyzer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PitchAnalyzer />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {['Seed Round Template', 'Series A Template', 'Product Demo Template', 'Investor Update Template'].map((template, index) => (
              <Card key={index} className="p-6">
                <div className="space-y-4">
                  <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-8 h-8 text-gray-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{template}</h3>
                    <p className="text-sm text-gray-600">
                      Professional template optimized for {template.toLowerCase().includes('seed') ? 'early-stage' : 'growth-stage'} startups
                    </p>
                  </div>
                  <Button className="w-full" variant="outline">
                    Use Template
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
