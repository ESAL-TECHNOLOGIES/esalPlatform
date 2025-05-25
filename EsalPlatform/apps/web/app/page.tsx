import Link from "next/link";
import Image from "next/image";
import { Button } from "@repo/ui/button";
import { Card, CardContent } from "@repo/ui/card";

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-background to-muted py-20 md:py-32">
        <div className="container max-w-screen-xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between">
          <div className="mb-10 md:mb-0 md:w-1/2">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              Connect. Collaborate.{" "}
              <span className="text-primary">Create Impact.</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-lg">
              The ESAL Platform connects organizations with volunteers,
              resources, and each other to maximize social impact through
              AI-powered matchmaking.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" asChild>
                <Link href="/matchmaking">Find Your Match</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/dashboard">View Dashboard</Link>
              </Button>
            </div>
          </div>
          <div className="md:w-1/2 flex justify-center">
            <div className="relative w-full max-w-md aspect-video bg-gradient-to-br from-primary/20 to-primary/40 rounded-xl shadow-xl">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-3xl font-bold">ESAL Platform</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container max-w-screen-xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our platform uses advanced AI technology to create meaningful
              connections between organizations and individuals.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-none shadow-md">
              <CardContent className="pt-6">
                <div className="rounded-full bg-primary/10 p-3 w-12 h-12 flex items-center justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-primary"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Create Your Profile</h3>
                <p className="text-muted-foreground">
                  Sign up and build your profile with your skills, interests,
                  and availability.
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-md">
              <CardContent className="pt-6">
                <div className="rounded-full bg-primary/10 p-3 w-12 h-12 flex items-center justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-primary"
                  >
                    <path d="M21.2 8.4c.5.38.8.97.8 1.6v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2h3.9a2 2 0 0 0 1.69-.9L14.2 2a.6.6 0 0 1 .8 0l4.2 5.1a.6.6 0 0 0 2 1.3Z"></path>
                    <path d="M5 10a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-3Z"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">AI-Powered Matching</h3>
                <p className="text-muted-foreground">
                  Our advanced AI analyzes your profile to find the perfect
                  organizations and programs.
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-md">
              <CardContent className="pt-6">
                <div className="rounded-full bg-primary/10 p-3 w-12 h-12 flex items-center justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-primary"
                  >
                    <path d="M12 22v-5"></path>
                    <path d="M9 8V2"></path>
                    <path d="M15 8V2"></path>
                    <path d="M18 8v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8Z"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Make an Impact</h3>
                <p className="text-muted-foreground">
                  Connect with organizations, join programs, and start making a
                  difference right away.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-muted py-16">
        <div className="container max-w-screen-xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Make a Difference?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of individuals and organizations already creating
            impact through the ESAL Platform.
          </p>
          <Button size="lg" asChild>
            <Link href="/auth/register">Get Started Today</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
