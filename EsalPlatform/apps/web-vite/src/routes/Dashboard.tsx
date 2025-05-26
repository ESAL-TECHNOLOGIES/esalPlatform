import React from "react";
import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="container max-w-screen-xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.email?.split("@")[0] || "User"}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="p-6 border rounded-lg bg-card">
          <h2 className="text-xl font-semibold mb-4">Your Organizations</h2>
          <p className="text-muted-foreground mb-4">
            You haven't created any organizations yet.
          </p>
          <a
            href="/organizations/new"
            className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
          >
            Create Organization
          </a>
        </div>

        <div className="p-6 border rounded-lg bg-card">
          <h2 className="text-xl font-semibold mb-4">Your Programs</h2>
          <p className="text-muted-foreground mb-4">
            You haven't created any programs yet.
          </p>
          <a
            href="/programs/new"
            className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
          >
            Create Program
          </a>
        </div>

        <div className="p-6 border rounded-lg bg-card">
          <h2 className="text-xl font-semibold mb-4">Recent Matches</h2>
          <p className="text-muted-foreground mb-4">No recent matches found.</p>
          <a
            href="/matchmaking"
            className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
          >
            Find Matches
          </a>
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Recent Activity</h2>
        <div className="border rounded-lg overflow-hidden">
          <div className="p-6 text-center text-muted-foreground">
            No recent activity to display.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
