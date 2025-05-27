import React, { useState } from 'react'
import { Card, Button } from '@esal/ui'

const Events = () => {
  const [selectedTab, setSelectedTab] = useState('upcoming')

  const upcomingEvents = [
    {
      id: 1,
      title: 'Weekly Startup Check-in',
      date: '2024-01-15',
      time: '15:00',
      type: 'meeting',
      attendees: 12,
      location: 'Conference Room A',
      description: 'Weekly progress review with all active startups',
      organizer: 'Hub Team'
    },
    {
      id: 2,
      title: 'Investor Pitch Night',
      date: '2024-01-16',
      time: '18:00',
      type: 'pitch',
      attendees: 25,
      location: 'Main Auditorium',
      description: 'Monthly pitch event connecting startups with investors',
      organizer: 'Sarah Kim'
    },
    {
      id: 3,
      title: 'Mentorship Program Launch',
      date: '2024-01-18',
      time: '10:00',
      type: 'workshop',
      attendees: 18,
      location: 'Innovation Lab',
      description: 'Kickoff event for our new mentorship program',
      organizer: 'Hub Team'
    },
  ]

  const pastEvents = [
    {
      id: 4,
      title: 'Demo Day 2023',
      date: '2023-12-15',
      time: '14:00',
      type: 'demo',
      attendees: 150,
      location: 'Main Hall',
      description: 'Annual demo day showcasing portfolio companies',
      organizer: 'Hub Team',
      feedback: 4.8,
      recordings: true
    },
    {
      id: 5,
      title: 'FinTech Workshop Series',
      date: '2023-12-10',
      time: '16:00',
      type: 'workshop',
      attendees: 35,
      location: 'Workshop Room B',
      description: 'Technical workshop on fintech regulations',
      organizer: 'Alex Chen',
      feedback: 4.6,
      recordings: true
    },
  ]

  const eventTypes = {
    meeting: { color: 'bg-blue-100 text-blue-800', icon: '👥' },
    pitch: { color: 'bg-green-100 text-green-800', icon: '🎯' },
    workshop: { color: 'bg-purple-100 text-purple-800', icon: '🛠️' },
    demo: { color: 'bg-orange-100 text-orange-800', icon: '🚀' },
  }

  const EventCard = ({ event, isPast = false }) => (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{eventTypes[event.type]?.icon}</span>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
            <p className="text-sm text-gray-500">{event.organizer}</p>
          </div>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${eventTypes[event.type]?.color}`}>
          {event.type}
        </span>
      </div>

      <p className="text-gray-600 mb-4">{event.description}</p>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-500">Date & Time</p>
          <p className="font-medium">{event.date} at {event.time}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Location</p>
          <p className="font-medium">{event.location}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Attendees</p>
          <p className="font-medium">{event.attendees} people</p>
        </div>
        {isPast && event.feedback && (
          <div>
            <p className="text-sm text-gray-500">Feedback Score</p>
            <p className="font-medium">{event.feedback}/5.0 ⭐</p>
          </div>
        )}
      </div>

      <div className="flex space-x-2">
        {isPast ? (
          <>
            <Button size="sm" variant="outline">View Summary</Button>
            {event.recordings && (
              <Button size="sm" variant="outline">Watch Recording</Button>
            )}
          </>
        ) : (
          <>
            <Button size="sm">Edit Event</Button>
            <Button size="sm" variant="outline">View Details</Button>
            <Button size="sm" variant="outline">Manage RSVPs</Button>
          </>
        )}
      </div>
    </Card>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Event Management</h1>
          <p className="text-gray-600">Organize and manage hub events and activities</p>
        </div>
        <Button>Create New Event</Button>
      </div>

      {/* Event Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Events This Month', value: '12', icon: '📅' },
          { label: 'Total Attendees', value: '284', icon: '👥' },
          { label: 'Avg. Rating', value: '4.7', icon: '⭐' },
          { label: 'Upcoming Events', value: '7', icon: '🔜' },
        ].map((stat, index) => (
          <Card key={index} className="p-6 text-center">
            <div className="text-2xl mb-2">{stat.icon}</div>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-sm text-gray-600">{stat.label}</div>
          </Card>
        ))}
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'upcoming', label: 'Upcoming Events', count: upcomingEvents.length },
            { id: 'past', label: 'Past Events', count: pastEvents.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                selectedTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </nav>
      </div>

      {/* Events List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {selectedTab === 'upcoming' 
          ? upcomingEvents.map(event => (
              <EventCard key={event.id} event={event} isPast={false} />
            ))
          : pastEvents.map(event => (
              <EventCard key={event.id} event={event} isPast={true} />
            ))
        }
      </div>

      {/* Calendar Widget */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Event Calendar</h2>
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <div className="text-4xl mb-4">📅</div>
          <p className="text-gray-600">Calendar view coming soon</p>
          <p className="text-sm text-gray-500 mt-2">
            Integrate with your preferred calendar application
          </p>
        </div>
      </Card>

      {/* Quick Actions */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button className="h-16 flex flex-col items-center justify-center space-y-2">
            <span className="text-lg">📝</span>
            <span>Schedule Pitch Night</span>
          </Button>
          <Button variant="outline" className="h-16 flex flex-col items-center justify-center space-y-2">
            <span className="text-lg">👥</span>
            <span>Book Meeting Room</span>
          </Button>
          <Button variant="outline" className="h-16 flex flex-col items-center justify-center space-y-2">
            <span className="text-lg">📊</span>
            <span>Generate Event Report</span>
          </Button>
        </div>
      </Card>
    </div>
  )
}

export default Events
