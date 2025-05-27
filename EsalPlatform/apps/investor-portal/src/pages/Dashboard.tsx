import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button } from '@esal/ui';

const Dashboard: React.FC = () => {
  const portfolioStats = [
    { label: 'Total Investments', value: '$2.5M' },
    { label: 'Active Startups', value: '12' },
    { label: 'Pending Reviews', value: '8' },
    { label: 'ROI Average', value: '15.3%' },
  ];

  const recentMatches = [
    { 
      id: 1, 
      company: 'AI Healthcare Solutions', 
      industry: 'Healthcare', 
      funding: '$500K',
      match: 94,
      stage: 'Series A'
    },
    { 
      id: 2, 
      company: 'GreenTech Energy', 
      industry: 'Energy', 
      funding: '$1.2M',
      match: 87,
      stage: 'Seed'
    },
    { 
      id: 3, 
      company: 'EduPlatform Pro', 
      industry: 'Education', 
      funding: '$300K',
      match: 82,
      stage: 'Pre-Seed'
    },
  ];

  const upcomingMeetings = [
    { 
      company: 'AI Healthcare Solutions', 
      time: '2:00 PM Today', 
      type: 'Initial Pitch' 
    },
    { 
      company: 'FinTech Innovations', 
      time: '10:00 AM Tomorrow', 
      type: 'Due Diligence' 
    },
    { 
      company: 'Sustainable Solutions', 
      time: '3:30 PM Friday', 
      type: 'Follow-up' 
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Investor Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's your investment portfolio overview.</p>
      </div>

      {/* Portfolio Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {portfolioStats.map((stat, index) => (
          <Card key={index} className="text-center">
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent AI Matches */}
        <Card>
          <CardHeader>
            <CardTitle>Top AI Matches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentMatches.map((match) => (
                <div key={match.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{match.company}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>{match.industry}</span>
                      <span>•</span>
                      <span>{match.stage}</span>
                      <span>•</span>
                      <span>{match.funding}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <div className={`text-lg font-bold ${
                        match.match >= 90 ? 'text-green-600' :
                        match.match >= 80 ? 'text-yellow-600' : 'text-gray-600'
                      }`}>
                        {match.match}%
                      </div>
                      <div className="text-xs text-gray-500">Match</div>
                    </div>
                    <Button size="sm">
                      Review
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Button variant="outline" className="w-full">
                View All Matches
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Meetings */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Meetings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingMeetings.map((meeting, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">{meeting.company}</h3>
                    <div className="text-sm text-gray-600">{meeting.type}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">{meeting.time}</div>
                    <Button size="sm" variant="outline" className="mt-1">
                      Join
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Button variant="outline" className="w-full">
                View Calendar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button className="w-full">
              Find New Startups
            </Button>
            <Button variant="secondary" className="w-full">
              Update Preferences
            </Button>
            <Button variant="outline" className="w-full">
              Portfolio Analytics
            </Button>
            <Button variant="ghost" className="w-full">
              Schedule Meeting
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
