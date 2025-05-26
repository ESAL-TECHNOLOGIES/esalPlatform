import { Button, Card, Avatar } from '@esal/ui'
import { Link } from 'react-router-dom'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-primary">ESAL Platform</h1>
            </div>
            <div className="hidden md:flex space-x-8">
              <Link to="/about" className="text-foreground/80 hover:text-foreground transition-colors">
                About
              </Link>
              <Link to="/contact" className="text-foreground/80 hover:text-foreground transition-colors">
                Contact
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/login">
                <Button variant="outline">Login</Button>
              </Link>
              <Link to="/innovator">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground mb-6">
              Connect Innovation with Investment
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              ESAL Platform bridges the gap between innovative startups and strategic investors, 
              powered by AI-driven matchmaking and comprehensive support from accelerators and hubs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/innovator">
                <Button size="lg" className="w-full sm:w-auto">
                  For Innovators
                </Button>
              </Link>
              <Link to="/investor">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  For Investors
                </Button>
              </Link>
              <Link to="/hub">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                  For Hubs & Accelerators
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Three Portals, One Ecosystem
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Each user type gets a tailored experience designed for their specific needs and goals.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Innovator Portal */}
            <Card className="p-8 text-center hover:shadow-lg transition-all duration-300">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4">Innovator Portal</h3>
              <p className="text-muted-foreground mb-6">
                Showcase your startup, get AI-powered pitch analysis, and connect with the right investors.
              </p>
              <ul className="text-sm text-muted-foreground space-y-2 mb-8">
                <li>• Public access - no approval needed</li>
                <li>• AI pitch optimization</li>
                <li>• Investor matching</li>
                <li>• Progress tracking</li>
              </ul>
              <Link to="/innovator">
                <Button className="w-full">Explore Portal</Button>
              </Link>
            </Card>

            {/* Investor Portal */}
            <Card className="p-8 text-center hover:shadow-lg transition-all duration-300">
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4">Investor Portal</h3>
              <p className="text-muted-foreground mb-6">
                Discover vetted startups, AI-driven scoring, and comprehensive investment analytics.
              </p>
              <ul className="text-sm text-muted-foreground space-y-2 mb-8">
                <li>• Backend approval required</li>
                <li>• AI startup scoring</li>
                <li>• Advanced filters</li>
                <li>• Investment tracking</li>
              </ul>
              <Link to="/investor">
                <Button variant="outline" className="w-full">Request Access</Button>
              </Link>
            </Card>

            {/* Hub Portal */}
            <Card className="p-8 text-center hover:shadow-lg transition-all duration-300">
              <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4">Hub & Accelerator Portal</h3>
              <p className="text-muted-foreground mb-6">
                Manage your portfolio, track progress, and facilitate connections between your startups and investors.
              </p>
              <ul className="text-sm text-muted-foreground space-y-2 mb-8">
                <li>• Backend approval required</li>
                <li>• Portfolio management</li>
                <li>• Startup mentoring tools</li>
                <li>• Network facilitation</li>
              </ul>
              <Link to="/hub">
                <Button variant="secondary" className="w-full">Request Access</Button>
              </Link>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">ESAL Platform</h3>
              <p className="text-muted-foreground text-sm">
                Connecting innovation with investment through AI-powered matching and comprehensive ecosystem support.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-4">For Innovators</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/innovator" className="hover:text-foreground transition-colors">Get Started</Link></li>
                <li><Link to="/about" className="hover:text-foreground transition-colors">How it Works</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-4">For Investors</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/investor" className="hover:text-foreground transition-colors">Request Access</Link></li>
                <li><Link to="/contact" className="hover:text-foreground transition-colors">Contact Sales</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/about" className="hover:text-foreground transition-colors">About</Link></li>
                <li><Link to="/contact" className="hover:text-foreground transition-colors">Contact</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-12 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 ESAL Platform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
