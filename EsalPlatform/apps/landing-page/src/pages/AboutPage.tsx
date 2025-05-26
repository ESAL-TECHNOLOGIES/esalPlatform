import { Button, Card } from '@esal/ui'
import { Link } from 'react-router-dom'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link to="/" className="text-2xl font-bold text-primary">ESAL Platform</Link>
            <div className="flex space-x-4">
              <Link to="/contact">
                <Button variant="outline">Contact</Button>
              </Link>
              <Link to="/login">
                <Button>Login</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">About ESAL Platform</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-xl text-muted-foreground mb-8">
              ESAL Platform is a comprehensive ecosystem that connects innovative startups with strategic investors, 
              powered by advanced AI technology and supported by a network of accelerators and innovation hubs.
            </p>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <Card className="p-6">
                <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
                <p className="text-muted-foreground">
                  To democratize access to funding and investment opportunities by creating an intelligent, 
                  transparent, and efficient platform that matches the right innovations with the right investors.
                </p>
              </Card>
              
              <Card className="p-6">
                <h3 className="text-2xl font-bold mb-4">Our Vision</h3>
                <p className="text-muted-foreground">
                  To become the global leader in AI-powered startup-investor matching, fostering innovation 
                  and accelerating the growth of transformative technologies.
                </p>
              </Card>
            </div>

            <h2 className="text-3xl font-bold mb-6">How It Works</h2>
            
            <div className="space-y-8 mb-12">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold">1</div>
                <div>
                  <h4 className="text-xl font-semibold mb-2">Innovators Join & Showcase</h4>
                  <p className="text-muted-foreground">
                    Startups create profiles, upload pitch decks, and receive AI-powered feedback to optimize their presentations.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold">2</div>
                <div>
                  <h4 className="text-xl font-semibold mb-2">AI-Powered Matching</h4>
                  <p className="text-muted-foreground">
                    Our advanced algorithms analyze startup profiles, market data, and investor preferences to suggest optimal matches.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold">3</div>
                <div>
                  <h4 className="text-xl font-semibold mb-2">Investors Discover & Evaluate</h4>
                  <p className="text-muted-foreground">
                    Verified investors access curated startup profiles with AI-generated scores and comprehensive analytics.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold">4</div>
                <div>
                  <h4 className="text-xl font-semibold mb-2">Hubs Facilitate Growth</h4>
                  <p className="text-muted-foreground">
                    Accelerators and innovation hubs manage their portfolios and facilitate connections between their startups and investors.
                  </p>
                </div>
              </div>
            </div>

            <h2 className="text-3xl font-bold mb-6">Key Features</h2>
            
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <Card className="p-6">
                <h4 className="text-lg font-semibold mb-2">AI Pitch Analysis</h4>
                <p className="text-muted-foreground text-sm">
                  Advanced AI reviews pitch decks and provides actionable feedback for improvement.
                </p>
              </Card>
              
              <Card className="p-6">
                <h4 className="text-lg font-semibold mb-2">Smart Matching</h4>
                <p className="text-muted-foreground text-sm">
                  Machine learning algorithms match startups with investors based on multiple criteria.
                </p>
              </Card>
              
              <Card className="p-6">
                <h4 className="text-lg font-semibold mb-2">Investment Scoring</h4>
                <p className="text-muted-foreground text-sm">
                  AI-powered scoring system helps investors evaluate opportunities quickly and accurately.
                </p>
              </Card>
            </div>

            <div className="text-center">
              <h3 className="text-2xl font-bold mb-4">Ready to Get Started?</h3>
              <p className="text-muted-foreground mb-6">
                Join thousands of innovators and investors already using ESAL Platform to drive growth and innovation.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/innovator">
                  <Button size="lg">Start as Innovator</Button>
                </Link>
                <Link to="/investor">
                  <Button variant="outline" size="lg">Request Investor Access</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
