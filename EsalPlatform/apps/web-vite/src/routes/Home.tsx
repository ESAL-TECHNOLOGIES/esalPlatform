import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
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
              <Link
                to="/matchmaking"
                className="px-4 py-2 text-center bg-primary text-white rounded hover:bg-primary/90"
              >
                Find Your Match
              </Link>
              <Link
                to="/dashboard"
                className="px-4 py-2 text-center border border-input rounded hover:bg-accent hover:text-accent-foreground"
              >
                View Dashboard
              </Link>
            </div>
          </div>
          <div className="md:w-1/2 flex justify-center">
            <div className="relative w-full h-[400px] bg-muted/50 rounded-lg">
              {/* Placeholder for hero image */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl text-muted-foreground">
                  Platform Illustration
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24">
        <div className="container max-w-screen-xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Empowering Social Impact
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Our platform offers powerful tools to connect, collaborate, and
              create meaningful change.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 mb-6 rounded-full bg-primary/10 flex items-center justify-center">
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
                >
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </div>
              <h3 className="text-xl font-medium mb-3">Community Building</h3>
              <p className="text-muted-foreground">
                Connect with like-minded organizations and individuals committed
                to positive social change.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 mb-6 rounded-full bg-primary/10 flex items-center justify-center">
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
                >
                  <path d="M12 2v20"></path>
                  <path d="M2 5h20"></path>
                  <path d="M2 19h20"></path>
                  <path d="M5 12H2"></path>
                  <path d="M22 12h-3"></path>
                  <path d="M12 5V2"></path>
                  <path d="M12 22v-3"></path>
                </svg>
              </div>
              <h3 className="text-xl font-medium mb-3">Resource Sharing</h3>
              <p className="text-muted-foreground">
                Efficiently share and discover resources across organizations to
                maximize collective impact.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 mb-6 rounded-full bg-primary/10 flex items-center justify-center">
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
                >
                  <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"></polyline>
                  <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-medium mb-3">AI Matchmaking</h3>
              <p className="text-muted-foreground">
                Our intelligent algorithms match organizations, volunteers, and
                resources for optimal collaboration.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container max-w-screen-xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Make a Difference?
          </h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto opacity-90">
            Join the ESAL Platform today and connect with a network dedicated to
            creating positive change.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/auth/register"
              className="px-6 py-3 bg-white text-primary rounded-md hover:bg-white/90"
            >
              Sign Up
            </Link>
            <Link
              to="/auth/login"
              className="px-6 py-3 bg-transparent border border-white rounded-md hover:bg-white/10"
            >
              Log In
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
