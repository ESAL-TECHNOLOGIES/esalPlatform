import axios from 'axios'
import { AIMatchResult, PitchAnalysis, InvestorScore, AIInsight, Startup, Investor } from './types'

const AI_API_URL = typeof window !== 'undefined' && (window as any).__VITE_AI_API_URL__ || 'http://localhost:8000/api/v1/ai'

const aiClient = axios.create({
  baseURL: AI_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth token to requests
aiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('esal_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const aiApi = {
  // Matchmaking
  getMatches: async (startupId: string): Promise<AIMatchResult[]> => {
    const response = await aiClient.get(`/matches/startup/${startupId}`)
    return response.data
  },

  getInvestorMatches: async (investorId: string): Promise<AIMatchResult[]> => {
    const response = await aiClient.get(`/matches/investor/${investorId}`)
    return response.data
  },

  // Pitch Analysis
  analyzePitch: async (pitchData: FormData): Promise<PitchAnalysis> => {
    const response = await aiClient.post('/pitch/analyze', pitchData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  analyzePitchText: async (text: string): Promise<PitchAnalysis> => {
    const response = await aiClient.post('/pitch/analyze-text', { text })
    return response.data
  },

  // Investor Scoring
  scoreStartup: async (startupId: string): Promise<InvestorScore> => {
    const response = await aiClient.get(`/score/startup/${startupId}`)
    return response.data
  },

  batchScoreStartups: async (startupIds: string[]): Promise<InvestorScore[]> => {
    const response = await aiClient.post('/score/batch', { startupIds })
    return response.data
  },

  // Insights and Analytics
  getMarketInsights: async (industry?: string): Promise<AIInsight[]> => {
    const params = industry ? { industry } : {}
    const response = await aiClient.get('/insights/market', { params })
    return response.data
  },

  getStartupInsights: async (startupId: string): Promise<AIInsight[]> => {
    const response = await aiClient.get(`/insights/startup/${startupId}`)
    return response.data
  },

  getInvestorInsights: async (investorId: string): Promise<AIInsight[]> => {
    const response = await aiClient.get(`/insights/investor/${investorId}`)
    return response.data
  },

  // Recommendations
  getInvestmentRecommendations: async (investorId: string, limit = 10): Promise<Startup[]> => {
    const response = await aiClient.get(`/recommendations/investments/${investorId}`, {
      params: { limit }
    })
    return response.data
  },

  getInvestorRecommendations: async (startupId: string, limit = 10): Promise<Investor[]> => {
    const response = await aiClient.get(`/recommendations/investors/${startupId}`, {
      params: { limit }
    })
    return response.data
  },

  // Training and Feedback
  provideFeedback: async (matchId: string, feedback: 'positive' | 'negative', notes?: string): Promise<void> => {
    await aiClient.post('/feedback', {
      matchId,
      feedback,
      notes
    })
  },

  reportInaccuracy: async (analysisId: string, type: 'pitch' | 'score' | 'match', details: string): Promise<void> => {
    await aiClient.post('/report', {
      analysisId,
      type,
      details
    })
  }
}

export default aiClient
