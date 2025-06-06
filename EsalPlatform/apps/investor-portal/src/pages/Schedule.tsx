import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, Button } from "@esal/ui";
import {
  Calendar,
  Clock,
  Video,
  MapPin,
  Users,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Plus,
  Bell,
  Settings,
  AlertCircle,
  CalendarDays,
} from "lucide-react";

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
      {/* Header Section */}
      <div className="bg-gradient-to-r from-green-600 to-teal-700 rounded-xl p-8 text-white">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-white/20 rounded-lg">
            <CalendarDays className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Schedule & Meetings</h1>
            <p className="text-green-100">
              Manage your startup meetings and investor calls
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-6 text-sm">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4" />
            <span>{upcomingMeetings.length} Upcoming</span>
          </div>
          <div className="flex items-center space-x-2">
            <Bell className="h-4 w-4" />
            <span>{meetingRequests.length} Requests</span>
          </div>
          <div className="flex items-center space-x-2">
            <Video className="h-4 w-4" />
            <span>Virtual Ready</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar/Schedule */}
        <div className="lg:col-span-2 space-y-6">
          {" "}
          {/* Upcoming Meetings */}
          <Card className="border-0 shadow-lg">
            {" "}
            <CardHeader>
              <CardTitle>
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <span>Upcoming Meetings</span>
                </div>
              </CardTitle>
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
                        </p>{" "}
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>{meeting.date}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{meeting.time}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{meeting.duration}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-4 w-4" />
                            <span>{meeting.location}</span>
                          </div>
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
                        </span>{" "}
                        <div className="flex space-x-1">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex items-center space-x-1"
                          >
                            <Video className="h-4 w-4" />
                            <span>Join</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleReschedule(meeting.id)}
                            className="flex items-center space-x-1"
                          >
                            <RefreshCw className="h-4 w-4" />
                            <span>Reschedule</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          {/* Meeting Requests */}{" "}
          <Card className="border-0 shadow-lg">
            {" "}
            <CardHeader>
              <CardTitle>
                <div className="flex items-center space-x-2">
                  <Bell className="h-5 w-5 text-amber-600" />
                  <span>Pending Meeting Requests</span>
                </div>
              </CardTitle>
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
                        </p>{" "}
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>{request.requestedDate}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{request.requestedTime}</span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-700 mt-2 p-3 bg-white rounded border-l-4 border-blue-400">
                          "{request.message}"
                        </p>
                      </div>
                      <div className="flex flex-col space-y-2 ml-4">
                        {" "}
                        <Button
                          size="sm"
                          onClick={() => handleAcceptRequest(request.id)}
                          className="flex items-center space-x-1"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Accept</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeclineRequest(request.id)}
                          className="flex items-center space-x-1"
                        >
                          <XCircle className="h-4 w-4" />
                          <span>Decline</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="flex items-center space-x-1"
                        >
                          <AlertCircle className="h-4 w-4" />
                          <span>Propose Alternative</span>
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
          {/* Set Availability */}{" "}
          <Card className="border-0 shadow-lg">
            {" "}
            <CardHeader>
              <CardTitle>
                <div className="flex items-center space-x-2">
                  <Settings className="h-5 w-5 text-purple-600" />
                  <span>Set Availability</span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>{" "}
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="Select date for availability"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Available Time Slots
                  </label>
                  <div className="space-y-2">
                    {availableSlots.map((slot) => (
                      <label key={slot} className="flex items-center">
                        {" "}
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          aria-label={`Available at ${slot}`}
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          {slot}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <Button className="w-full flex items-center justify-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>Update Availability</span>
                </Button>
              </div>
            </CardContent>
          </Card>
          {/* Quick Stats */}{" "}
          <Card className="border-0 shadow-lg">
            {" "}
            <CardHeader>
              <CardTitle>
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-green-600" />
                  <span>Meeting Statistics</span>
                </div>
              </CardTitle>
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
          {/* Quick Actions */}{" "}
          <Card className="border-0 shadow-lg">
            {" "}
            <CardHeader>
              <CardTitle>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="h-5 w-5 text-blue-600" />
                  <span>Quick Actions</span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {" "}
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full flex items-center justify-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Schedule New Meeting</span>
                </Button>
                <Button
                  variant="outline"
                  className="w-full flex items-center justify-center space-x-2"
                >
                  <Calendar className="h-4 w-4" />
                  <span>View Calendar</span>
                </Button>
                <Button
                  variant="outline"
                  className="w-full flex items-center justify-center space-x-2"
                >
                  <Settings className="h-4 w-4" />
                  <span>Export Schedule</span>
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
