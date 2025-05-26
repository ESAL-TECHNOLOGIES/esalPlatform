import { useState } from 'react'
import { Card, Button, Progress } from '@esal/ui'
import { aiApi } from '../api'
import { PitchAnalysis } from '../types'

interface PitchAnalyzerProps {
  onAnalysisComplete?: (analysis: PitchAnalysis) => void
}

export function PitchAnalyzer({ onAnalysisComplete }: PitchAnalyzerProps) {
  const [analysis, setAnalysis] = useState<PitchAnalysis | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    try {
      setIsAnalyzing(true)
      setError(null)
      
      const result = await aiApi.analyzePitch(formData)
      setAnalysis(result)
      onAnalysisComplete?.(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleTextAnalysis = async (text: string) => {
    if (!text.trim()) return

    try {
      setIsAnalyzing(true)
      setError(null)
      
      const result = await aiApi.analyzePitchText(text)
      setAnalysis(result)
      onAnalysisComplete?.(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed')
    } finally {
      setIsAnalyzing(false)
    }
  }

  if (isAnalyzing) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <h3 className="text-lg font-medium mb-2">Analyzing Your Pitch</h3>
          <p className="text-muted-foreground mb-4">
            Our AI is reviewing your pitch deck and generating insights...
          </p>
          <Progress value={65} className="w-full" />
          <p className="text-sm text-muted-foreground mt-2">This usually takes 30-60 seconds</p>
        </div>
      </Card>
    )
  }

  if (!analysis) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">AI Pitch Analysis</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Upload Pitch Deck</label>
            <input
              type="file"
              accept=".pdf,.ppt,.pptx"
              onChange={handleFileUpload}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Supported formats: PDF, PowerPoint (Max 10MB)
            </p>
          </div>
          
          <div className="text-center text-muted-foreground">
            <span>or</span>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Paste Pitch Text</label>
            <textarea
              className="w-full min-h-32 p-3 border border-border rounded-md"
              placeholder="Paste your pitch description here for quick analysis..."
              onBlur={(e) => e.target.value && handleTextAnalysis(e.target.value)}
            />
          </div>
        </div>
        
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Pitch Analysis Results</h3>
          <Button variant="outline" size="sm" onClick={() => setAnalysis(null)}>
            Analyze Another
          </Button>
        </div>
        
        <div className="flex items-center space-x-4 mb-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">{analysis.score}/100</div>
            <div className="text-sm text-muted-foreground">Overall Score</div>
          </div>
          <Progress value={analysis.score} className="flex-1" />
        </div>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h4 className="font-semibold text-green-600 mb-3 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Strengths
          </h4>
          <ul className="space-y-2">
            {analysis.strengths.map((strength, index) => (
              <li key={index} className="text-sm flex items-start">
                <span className="text-green-500 mr-2">•</span>
                {strength}
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-6">
          <h4 className="font-semibold text-yellow-600 mb-3 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            Areas for Improvement
          </h4>
          <ul className="space-y-2">
            {analysis.weaknesses.map((weakness, index) => (
              <li key={index} className="text-sm flex items-start">
                <span className="text-yellow-500 mr-2">•</span>
                {weakness}
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card className="p-6">
        <h4 className="font-semibold text-blue-600 mb-3 flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          AI Suggestions
        </h4>
        <ul className="space-y-2">
          {analysis.suggestions.map((suggestion, index) => (
            <li key={index} className="text-sm flex items-start">
              <span className="text-blue-500 mr-2">→</span>
              {suggestion}
            </li>
          ))}
        </ul>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h4 className="font-semibold mb-3">Market Analysis</h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm">Market Size:</span>
              <span className="text-sm font-medium">${analysis.marketAnalysis.size.toLocaleString()}M</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Growth Rate:</span>
              <span className="text-sm font-medium">{analysis.marketAnalysis.growth}%</span>
            </div>
            <div>
              <span className="text-sm">Key Competitors:</span>
              <div className="mt-1">
                {analysis.marketAnalysis.competition.map((competitor, index) => (
                  <span key={index} className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded mr-1 mb-1">
                    {competitor}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h4 className="font-semibold mb-3">Financial Analysis</h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm">Viability Score:</span>
              <span className="text-sm font-medium">{analysis.financialAnalysis.viability}/100</span>
            </div>
            <div>
              <span className="text-sm">Key Risks:</span>
              <ul className="mt-1 space-y-1">
                {analysis.financialAnalysis.risks.slice(0, 3).map((risk, index) => (
                  <li key={index} className="text-xs text-muted-foreground">• {risk}</li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default PitchAnalyzer
