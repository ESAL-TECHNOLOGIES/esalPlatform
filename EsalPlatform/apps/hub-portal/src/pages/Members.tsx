import React, { useState } from 'react'
import { Card, Button } from '@esal/ui'

const Members = () => {
  const [selectedTab, setSelectedTab] = useState('entrepreneurs')

  const entrepreneurs = [
    {
      id: 1,
      name: 'Alex Chen',
      email: 'alex@techflow.com',
      company: 'TechFlow Solutions',
      stage: 'Series A',
      joinDate: '2022-03-15',
      status: 'active',
      progress: 75,
      nextCheckIn: '2024-01-20'
    },
    {
      id: 2,
      name: 'Maria Rodriguez',
      email: 'maria@greentech.com',
      company: 'GreenTech Innovations',
      stage: 'Seed',
      joinDate: '2023-01-10',
      status: 'active',
      progress: 60,
      nextCheckIn: '2024-01-18'
    },
    {
      id: 3,
      name: 'Dr. James Wilson',
      email: 'james@healthfirst.ai',
      company: 'HealthFirst AI',
      stage: 'Pre-Seed',
      joinDate: '2023-09-05',
      status: 'incubating',
      progress: 30,
      nextCheckIn: '2024-01-22'
    },
  ]

  const mentors = [
    {
      id: 1,
      name: 'Sarah Johnson',
      email: 'sarah.johnson@gmail.com',
      expertise: 'Product Strategy',
      experience: '15 years',
      companies: ['Google', 'Airbnb'],
      mentees: 3,
      availability: 'Available',
      rating: 4.9
    },
    {
      id: 2,
      name: 'Michael Brown',
      email: 'mike.brown@venture.com',
      expertise: 'Fundraising',
      experience: '12 years',
      companies: ['Sequoia Capital', 'Y Combinator'],
      mentees: 5,
      availability: 'Busy',
      rating: 4.8
    },
    {
      id: 3,
      name: 'Lisa Park',
      email: 'lisa@techcorp.com',
      expertise: 'Tech Leadership',
      experience: '10 years',
      companies: ['Microsoft', 'Tesla'],
      mentees: 2,
      availability: 'Available',
      rating: 4.7
    },
  ]

  const staff = [
    {
      id: 1,
      name: 'David Kim',
      role: 'Program Director',
      email: 'david@hub.com',
      department: 'Operations',
      joinDate: '2020-01-15',
      responsibilities: ['Program Management', 'Startup Relations']
    },
    {
      id: 2,
      name: 'Emma Watson',
      role: 'Community Manager',
      email: 'emma@hub.com',
      department: 'Community',
      joinDate: '2021-06-10',
      responsibilities: ['Events', 'Member Engagement']
    },
    {
      id: 3,
      name: 'Robert Chen',
      role: 'Technical Advisor',
      email: 'robert@hub.com',
      department: 'Advisory',
      joinDate: '2019-09-01',
      responsibilities: ['Technical Reviews', 'Mentorship']
    },
  ]

  const statusColors = {
    active: 'bg-green-100 text-green-800',
    incubating: 'bg-blue-100 text-blue-800',
    graduated: 'bg-purple-100 text-purple-800'
  }

  const availabilityColors = {
    'Available': 'bg-green-100 text-green-800',
    'Busy': 'bg-red-100 text-red-800',
    'Limited': 'bg-yellow-100 text-yellow-800'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Community Members</h1>
          <p className="text-gray-600">Manage entrepreneurs, mentors, and staff</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">Export Directory</Button>
          <Button>Invite Member</Button>
        </div>
      </div>

      {/* Member Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Active Entrepreneurs', value: entrepreneurs.filter(e => e.status === 'active').length, icon: '🚀' },
          { label: 'Available Mentors', value: mentors.filter(m => m.availability === 'Available').length, icon: '👨‍🏫' },
          { label: 'Staff Members', value: staff.length, icon: '👥' },
          { label: 'Total Community', value: entrepreneurs.length + mentors.length + staff.length, icon: '🌟' },
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
            { id: 'entrepreneurs', label: 'Entrepreneurs', count: entrepreneurs.length },
            { id: 'mentors', label: 'Mentors', count: mentors.length },
            { id: 'staff', label: 'Staff', count: staff.length },
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

      {/* Members Content */}
      {selectedTab === 'entrepreneurs' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {entrepreneurs.map((entrepreneur) => (
            <Card key={entrepreneur.id} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{entrepreneur.name}</h3>
                  <p className="text-sm text-gray-500">{entrepreneur.email}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[entrepreneur.status]}`}>
                  {entrepreneur.status}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Company:</span>
                  <span className="font-medium">{entrepreneur.company}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Stage:</span>
                  <span className="font-medium">{entrepreneur.stage}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Joined:</span>
                  <span className="font-medium">{entrepreneur.joinDate}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Next Check-in:</span>
                  <span className="font-medium">{entrepreneur.nextCheckIn}</span>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-500">Progress</span>
                  <span className="font-medium">{entrepreneur.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${entrepreneur.progress}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button size="sm">View Profile</Button>
                <Button variant="outline" size="sm">Schedule Check-in</Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {selectedTab === 'mentors' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {mentors.map((mentor) => (
            <Card key={mentor.id} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{mentor.name}</h3>
                  <p className="text-sm text-gray-500">{mentor.email}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${availabilityColors[mentor.availability]}`}>
                  {mentor.availability}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Expertise:</span>
                  <span className="font-medium">{mentor.expertise}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Experience:</span>
                  <span className="font-medium">{mentor.experience}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Previous:</span>
                  <span className="font-medium">{mentor.companies.join(', ')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Current Mentees:</span>
                  <span className="font-medium">{mentor.mentees}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Rating:</span>
                  <span className="font-medium">{mentor.rating}/5.0 ⭐</span>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button size="sm">View Profile</Button>
                <Button variant="outline" size="sm">Match with Startup</Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {selectedTab === 'staff' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {staff.map((member) => (
            <Card key={member.id} className="p-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{member.name}</h3>
                <p className="text-sm text-gray-500">{member.email}</p>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Role:</span>
                  <span className="font-medium">{member.role}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Department:</span>
                  <span className="font-medium">{member.department}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Joined:</span>
                  <span className="font-medium">{member.joinDate}</span>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-2">Responsibilities:</p>
                <div className="flex flex-wrap gap-1">
                  {member.responsibilities.map((resp, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                      {resp}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex space-x-2">
                <Button size="sm">View Profile</Button>
                <Button variant="outline" size="sm">Send Message</Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default Members
