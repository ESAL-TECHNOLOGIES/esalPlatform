export interface Startup {
  id: string
  name: string
  description: string
  industry: string
  stage: 'idea' | 'mvp' | 'growth' | 'scale'
  fundingGoal: number
  currentFunding: number
  pitchDeck?: string
  metrics?: {
    revenue?: number
    users?: number
    growth?: number
  }
}

export interface Investor {
  id: string
  name: string
  type: 'angel' | 'vc' | 'corporate' | 'government'
  focusIndustries: string[]
  investmentRange: {
    min: number
    max: number
  }
  portfolio?: string[]
}

export interface AIMatchResult {
  startupId: string
  investorId: string
  score: number
  confidence: number
  reasons: string[]
  recommendations: string[]
}

export interface PitchAnalysis {
  score: number
  strengths: string[]
  weaknesses: string[]
  suggestions: string[]
  marketAnalysis: {
    size: number
    growth: number
    competition: string[]
  }
  financialAnalysis: {
    viability: number
    projection: string[]
    risks: string[]
  }
}

export interface InvestorScore {
  startupId: string
  score: number
  breakdown: {
    market: number
    team: number
    product: number
    traction: number
    financials: number
  }
  riskAssessment: 'low' | 'medium' | 'high'
  recommendations: string[]
}

export interface AIInsight {
  type: 'trend' | 'opportunity' | 'risk' | 'recommendation'
  title: string
  description: string
  confidence: number
  actionable: boolean
  impact: 'low' | 'medium' | 'high'
}
