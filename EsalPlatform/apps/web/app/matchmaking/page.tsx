"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/tabs";
import { useAuth } from "../../lib/auth-context";
import { useApi } from "../../lib/api";

interface Organization {
  id: string;
  name: string;
  description: string;
  mission: string;
  website: string;
  logo_url: string | null;
  location: string;
}

interface Program {
  id: string;
  name: string;
  description: string;
  organization_id: string;
  organization_name: string;
  skills_required: string[];
  time_commitment: string;
  location: string;
  remote_friendly: boolean;
}

interface MatchResponse {
  matched_programs: Program[];
  matched_organizations: Organization[];
  confidence_scores: Record<string, number>;
}

export default function MatchmakingPage() {
  const { user } = useAuth();
  const [skills, setSkills] = useState<string>("");
  const [interests, setInterests] = useState<string>("");
  const [availability, setAvailability] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [matchResults, setMatchResults] = useState<MatchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"form" | "results">("form");
  const { matchmaking } = useApi();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await matchmaking.findMatches({
        skills: skills.split(",").map((skill) => skill.trim()),
        interests: interests.split(",").map((interest) => interest.trim()),
        availability,
        location,
        user_id: user?.id || null,
      });

      if (error) {
        throw new Error(error);
      }

      setMatchResults(data);
      setActiveTab("results");
    } catch (error: any) {
      console.error("Matchmaking error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container py-12">
      <h1 className="text-3xl font-bold mb-8">AI-Powered Matchmaking</h1>
      <p className="text-lg text-muted-foreground mb-8">
        Find organizations and programs that match your skills, interests, and
        availability.
      </p>

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as "form" | "results")}
        className="space-y-8"
      >
        <TabsList>
          <TabsTrigger value="form">Match Finder</TabsTrigger>
          <TabsTrigger value="results" disabled={!matchResults}>
            Results
          </TabsTrigger>
        </TabsList>

        <TabsContent value="form">
          <Card>
            <CardHeader>
              <CardTitle>Find Your Perfect Match</CardTitle>
              <CardDescription>
                Tell us about your skills, interests, and availability to get
                matched with the right opportunities.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="skills" className="text-sm font-medium">
                    Skills
                  </label>
                  <Input
                    id="skills"
                    placeholder="e.g., programming, design, writing (comma separated)"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter the skills you have that you'd like to contribute.
                  </p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="interests" className="text-sm font-medium">
                    Interests
                  </label>
                  <Input
                    id="interests"
                    placeholder="e.g., education, environment, healthcare (comma separated)"
                    value={interests}
                    onChange={(e) => setInterests(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    What causes or areas are you passionate about?
                  </p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="availability" className="text-sm font-medium">
                    Availability
                  </label>
                  <Input
                    id="availability"
                    placeholder="e.g., 5 hours per week, weekends only"
                    value={availability}
                    onChange={(e) => setAvailability(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="location" className="text-sm font-medium">
                    Location
                  </label>
                  <Input
                    id="location"
                    placeholder="e.g., New York, NY or Remote"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
              </CardContent>

              <CardFooter>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Finding matches..." : "Find Matches"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="results">
          {matchResults && (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold mb-4">Matched Programs</h2>
                {matchResults.matched_programs.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {matchResults.matched_programs.map((program) => (
                      <Card key={program.id} className="h-full flex flex-col">
                        <CardHeader>
                          <CardTitle>{program.name}</CardTitle>
                          <CardDescription>
                            {program.organization_name}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow">
                          <p className="text-sm">{program.description}</p>
                          <div className="mt-4 space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">
                                Location:
                              </span>
                              <span>
                                {program.location}{" "}
                                {program.remote_friendly
                                  ? "(Remote friendly)"
                                  : ""}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">
                                Time commitment:
                              </span>
                              <span>{program.time_commitment}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">
                                Match confidence:
                              </span>
                              <span className="font-medium">
                                {Math.round(
                                  (matchResults.confidence_scores[program.id] ||
                                    0) * 100
                                )}
                                %
                              </span>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter>
                          <Button variant="outline" className="w-full">
                            View Details
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="py-8 text-center">
                      <p className="text-muted-foreground">
                        No matching programs found. Try broadening your search
                        criteria.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">
                  Matched Organizations
                </h2>
                {matchResults.matched_organizations.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {matchResults.matched_organizations.map((org) => (
                      <Card key={org.id} className="h-full flex flex-col">
                        <CardHeader>
                          <CardTitle>{org.name}</CardTitle>
                          <CardDescription>{org.location}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow">
                          <p className="text-sm">{org.description}</p>
                          <div className="mt-4">
                            <p className="text-sm font-medium">Mission</p>
                            <p className="text-sm text-muted-foreground">
                              {org.mission}
                            </p>
                          </div>
                        </CardContent>
                        <CardFooter>
                          <Button variant="outline" className="w-full">
                            View Organization
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="py-8 text-center">
                      <p className="text-muted-foreground">
                        No matching organizations found. Try broadening your
                        search criteria.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>

              <div className="flex justify-center">
                <Button variant="outline" onClick={() => setActiveTab("form")}>
                  Modify Search
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
