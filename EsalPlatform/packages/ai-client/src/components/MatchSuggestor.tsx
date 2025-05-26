import { useState, useEffect } from 'react'
import { Card, Button } from '@esal/ui'
import { aiApi } from '../api'
import { AIMatchResult, Startup, Investor } from '../types'

interface MatchSuggestorProps {
  entityId: string
  entityType: 'startup' | 'investor'
  onMatchSelect?: (match: AIMatchResult) => void
}

export function MatchSuggestor({ entityId, entityType, onMatchSelect }: MatchSuggestorProps) {
  const [matches, setMatches] = useState<AIMatchResult[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const matchResults = entityType === 'startup'
          ? await aiApi.getMatches(entityId)
          : await aiApi.getInvestorMatches(entityId)
        
        setMatches(matchResults)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch matches')
      } finally {
        setIsLoading(false)
      }
    }

    fetchMatches()
  }, [entityId, entityType])

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2 text-muted-foreground">Finding AI-powered matches...</span>
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center text-red-500">
          <p>Error loading matches: {error}</p>
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()} 
            className="mt-2"
          >
            Retry
          </Button>
        </div>
      </Card>
    )
  }

  if (matches.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center text-muted-foreground">
          <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <h3 className="text-lg font-medium mb-2">No matches found</h3>
          <p>Our AI hasn't found any suitable matches yet. Check back later as we continuously update our recommendations.</p>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">AI-Powered Matches</h3>
      {matches.slice(0, 5).map((match) => (
        <Card key={`${match.startupId}-${match.investorId}`} className="p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="font-medium">
                Match Score: {Math.round(match.score * 100)}%
              </span>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                {Math.round(match.confidence * 100)}% confidence
              </span>
            </div>
            {onMatchSelect && (
              <Button size="sm" onClick={() => onMatchSelect(match)}>
                View Details
              </Button>
            )}
          </div>
          
          <div className="space-y-2">
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-1">Why this match?</h4>
              <ul className="text-sm space-y-1">
                {match.reasons.slice(0, 3).map((reason, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-green-500 mr-2">•</span>
                    {reason}
                  </li>
                ))}
              </ul>
            </div>
            
            {match.recommendations.length > 0 && (
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">AI Recommendations</h4>
                <ul className="text-sm space-y-1">
                  {match.recommendations.slice(0, 2).map((rec, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-500 mr-2">→</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Card>
      ))}
      
      {matches.length > 5 && (
        <Card className="p-4 text-center">
          <p className="text-muted-foreground mb-2">
            Showing top 5 matches out of {matches.length} total
          </p>
          <Button variant="outline" size="sm">
            View All Matches
          </Button>
        </Card>
      )}
    </div>
  )
}

export default MatchSuggestor
