import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, Button } from "@esal/ui";

const Schedule: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const upcomingMeetings: any[] = [];

  const meetingRequests: any[] = [];

  const availableSlots = [
    "9:00 AM",
    "10:00 AM",
    "11:00 AM",
    "1:00 PM",
    "2:00 PM",
    "3:00 PM",
    "4:00 PM",
  ];

  const handleAcceptRequest = (requestId: number) => {
    alert(`Meeting request ${requestId} accepted and scheduled!`);
  };

  const handleDeclineRequest = (requestId: number) => {
    alert(`Meeting request ${requestId} declined.`);
  };

  const handleReschedule = (meetingId: number) => {
    alert(`Rescheduling meeting ${meetingId}...`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Schedule & Meetings
        </h1>
        <p className="text-gray-600">
          Manage your startup meetings and investor calls.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar/Schedule */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upcoming Meetings */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Meetings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingMeetings.map((meeting) => (
                  <div
                    key={meeting.id}
                    className="border rounded-lg p-4 hover:bg-gray-50"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">
                          {meeting.startup}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {meeting.type}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {meeting.description}
                        </p>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                          <span>📅 {meeting.date}</span>
                          <span>🕒 {meeting.time}</span>
                          <span>⏱️ {meeting.duration}</span>
                          <span>📍 {meeting.location}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            meeting.status === "confirmed"
                              ? "bg-green-100 text-green-800"
                              : meeting.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {meeting.status}
                        </span>
                        <div className="flex space-x-1">
                          <Button size="sm" variant="outline">
                            Join
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleReschedule(meeting.id)}
                          >
                            Reschedule
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Meeting Requests */}
          <Card>
            <CardHeader>
              <CardTitle>Pending Meeting Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {meetingRequests.map((request) => (
                  <div
                    key={request.id}
                    className="border rounded-lg p-4 bg-blue-50"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">
                          {request.startup}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {request.type}
                        </p>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                          <span>📅 {request.requestedDate}</span>
                          <span>🕒 {request.requestedTime}</span>
                        </div>
                        <p className="text-sm text-gray-700 mt-2 p-3 bg-white rounded border-l-4 border-blue-400">
                          "{request.message}"
                        </p>
                      </div>
                      <div className="flex flex-col space-y-2 ml-4">
                        <Button
                          size="sm"
                          onClick={() => handleAcceptRequest(request.id)}
                        >
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeclineRequest(request.id)}
                        >
                          Decline
                        </Button>
                        <Button size="sm" variant="ghost">
                          Propose Alternative
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Availability & Quick Actions */}
        <div className="space-y-6">
          {/* Set Availability */}
          <Card>
            <CardHeader>
              <CardTitle>Set Availability</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Available Time Slots
                  </label>
                  <div className="space-y-2">
                    {availableSlots.map((slot) => (
                      <label key={slot} className="flex items-center">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          {slot}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <Button className="w-full">Update Availability</Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Meeting Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              {" "}
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">0</div>
                  <div className="text-sm text-gray-600">
                    Meetings This Month
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">0</div>
                  <div className="text-sm text-gray-600">
                    Successful Pitches
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">0</div>
                  <div className="text-sm text-gray-600">Investments Made</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button variant="outline" className="w-full">
                  Schedule New Meeting
                </Button>
                <Button variant="outline" className="w-full">
                  View Calendar
                </Button>
                <Button variant="outline" className="w-full">
                  Export Schedule
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Schedule;
