import React, { useState, useEffect } from "react";
import { Card, Button } from "@esal/ui";
import { contentAPI } from "../utils/api";

interface ModerationItem {
  id: number;
  type: string;
  content: string;
  author: string;
  company: string;
  reportReason: string;
  reportedBy: string;
  timestamp: string;
  status: string;
}

interface ContentTemplate {
  id: number;
  name: string;
  type: string;
  category: string;
  lastUpdated: string;
  status: string;
  usage: string;
}

interface Announcement {
  id: number;
  title: string;
  type: string;
  audience: string;
  status: string;
  scheduledDate: string;
  createdBy: string;
}

const Content = () => {
  const [selectedTab, setSelectedTab] = useState("moderation");
  const [moderationQueue, setModerationQueue] = useState<ModerationItem[]>([]);
  const [contentTemplates, setContentTemplates] = useState<ContentTemplate[]>(
    []
  );
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchContentData();
  }, [selectedTab]);

  const fetchContentData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (selectedTab === "moderation") {
        const moderationData = await contentAPI.getModerationQueue();
        setModerationQueue(moderationData.items || []);
      } else if (selectedTab === "templates") {
        const templatesData = await contentAPI.getContentTemplates();
        setContentTemplates(templatesData.templates || []);
      } else if (selectedTab === "announcements") {
        const announcementsData = await contentAPI.getAnnouncements();
        setAnnouncements(announcementsData.announcements || []);
      }
    } catch (err) {
      console.error("Content fetch error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load content data"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleModerationAction = async (itemId: number, action: string) => {
    try {
      await contentAPI.updateModerationStatus(itemId, action);
      await fetchContentData(); // Refresh data
    } catch (err) {
      console.error("Moderation action error:", err);
      // Could add toast notification here
    }
  };

  const handleAnnouncementAction = async (
    announcementId: number,
    action: string
  ) => {
    try {
      if (action === "publish") {
        await contentAPI.publishAnnouncement(announcementId);
      } else if (action === "delete") {
        await contentAPI.deleteAnnouncement(announcementId);
      }
      await fetchContentData(); // Refresh data
    } catch (err) {
      console.error("Announcement action error:", err);
      // Could add toast notification here
    }
  };

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    reviewed: "bg-green-100 text-green-800",
    approved: "bg-blue-100 text-blue-800",
    rejected: "bg-red-100 text-red-800",
    active: "bg-green-100 text-green-800",
    inactive: "bg-gray-100 text-gray-800",
    draft: "bg-gray-100 text-gray-800",
    published: "bg-green-100 text-green-800",
    scheduled: "bg-blue-100 text-blue-800",
  };

  const typeColors = {
    startup_description: "bg-blue-100 text-blue-800",
    user_profile: "bg-purple-100 text-purple-800",
    comment: "bg-orange-100 text-orange-800",
    email: "bg-green-100 text-green-800",
    legal: "bg-red-100 text-red-800",
    guide: "bg-blue-100 text-blue-800",
    maintenance: "bg-yellow-100 text-yellow-800",
    feature: "bg-blue-100 text-blue-800",
    event: "bg-purple-100 text-purple-800",
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Content Management
            </h1>
            <p className="text-gray-600">
              Manage platform content, moderation, and communications
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Content Management
            </h1>
            <p className="text-gray-600">
              Manage platform content, moderation, and communications
            </p>
          </div>
        </div>
        <Card className="p-6">
          <div className="text-center">
            <div className="text-red-600 mb-2">⚠️</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Error Loading Content
            </h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => fetchContentData()}>Try Again</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Content Management
          </h1>
          <p className="text-gray-600">
            Manage platform content, moderation, and communications
          </p>
        </div>
        <Button>Create Content</Button>
      </div>

      {/* Content Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          {
            label: "Pending Moderation",
            value: moderationQueue.filter((item) => item.status === "pending")
              .length,
            icon: "⚠️",
          },
          {
            label: "Active Templates",
            value: contentTemplates.filter((t) => t.status === "active").length,
            icon: "📄",
          },
          {
            label: "Scheduled Posts",
            value: announcements.filter((a) => a.status === "scheduled").length,
            icon: "📅",
          },
          {
            label: "Total Content",
            value: contentTemplates.length + announcements.length,
            icon: "📚",
          },
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
            {
              id: "moderation",
              label: "Content Moderation",
              count: moderationQueue.filter((item) => item.status === "pending")
                .length,
            },
            {
              id: "templates",
              label: "Content Templates",
              count: contentTemplates.length,
            },
            {
              id: "announcements",
              label: "Announcements",
              count: announcements.length,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                selectedTab === tab.id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </nav>
      </div>

      {/* Content Based on Selected Tab */}
      {selectedTab === "moderation" && (
        <div className="space-y-4">
          {moderationQueue.length === 0 ? (
            <Card className="p-6">
              <div className="text-center text-gray-500">
                <div className="text-4xl mb-2">✅</div>
                <p>No items pending moderation</p>
              </div>
            </Card>
          ) : (
            moderationQueue.map((item) => (
              <Card key={item.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${typeColors[item.type] || "bg-gray-100 text-gray-800"}`}
                    >
                      {item.type.replace("_", " ")}
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[item.status] || "bg-gray-100 text-gray-800"}`}
                    >
                      {item.status}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {item.timestamp}
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">
                      Reported Content
                    </h3>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-800">{item.content}</p>
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                      <span className="font-medium">Author:</span> {item.author}{" "}
                      ({item.company})
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">
                      Report Details
                    </h3>
                    <div className="space-y-2">
                      <div className="text-sm">
                        <span className="text-gray-500">Reason:</span>
                        <span className="ml-2 text-gray-900">
                          {item.reportReason}
                        </span>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-500">Reported by:</span>
                        <span className="ml-2 text-gray-900">
                          {item.reportedBy}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {item.status === "pending" && (
                  <div className="mt-4 flex space-x-2">
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => handleModerationAction(item.id, "approve")}
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      className="bg-red-600 hover:bg-red-700"
                      onClick={() => handleModerationAction(item.id, "reject")}
                    >
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        handleModerationAction(item.id, "request_changes")
                      }
                    >
                      Request Changes
                    </Button>
                    <Button size="sm" variant="outline">
                      View Full Context
                    </Button>
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      )}

      {selectedTab === "templates" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {contentTemplates.length === 0 ? (
            <Card className="p-6 lg:col-span-2">
              <div className="text-center text-gray-500">
                <div className="text-4xl mb-2">📄</div>
                <p>No content templates found</p>
              </div>
            </Card>
          ) : (
            contentTemplates.map((template) => (
              <Card key={template.id} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {template.name}
                    </h3>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${typeColors[template.type] || "bg-gray-100 text-gray-800"}`}
                    >
                      {template.type}
                    </span>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[template.status] || "bg-gray-100 text-gray-800"}`}
                  >
                    {template.status}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Category:</span>
                    <span className="font-medium capitalize">
                      {template.category}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Last Updated:</span>
                    <span className="font-medium">{template.lastUpdated}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Usage:</span>
                    <span className="font-medium">{template.usage}</span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button size="sm">Edit</Button>
                  <Button variant="outline" size="sm">
                    Preview
                  </Button>
                  <Button variant="outline" size="sm">
                    Duplicate
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {selectedTab === "announcements" && (
        <div className="space-y-4">
          {announcements.length === 0 ? (
            <Card className="p-6">
              <div className="text-center text-gray-500">
                <div className="text-4xl mb-2">📢</div>
                <p>No announcements found</p>
              </div>
            </Card>
          ) : (
            announcements.map((announcement) => (
              <Card key={announcement.id} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {announcement.title}
                    </h3>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${typeColors[announcement.type] || "bg-gray-100 text-gray-800"}`}
                    >
                      {announcement.type}
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[announcement.status] || "bg-gray-100 text-gray-800"}`}
                    >
                      {announcement.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {announcement.scheduledDate}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <span className="text-sm text-gray-500">
                      Target Audience:
                    </span>
                    <div className="font-medium capitalize">
                      {announcement.audience}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Created By:</span>
                    <div className="font-medium">{announcement.createdBy}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">
                      Scheduled Date:
                    </span>
                    <div className="font-medium">
                      {announcement.scheduledDate}
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button size="sm">Edit</Button>
                  <Button variant="outline" size="sm">
                    Preview
                  </Button>
                  {announcement.status === "draft" && (
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() =>
                        handleAnnouncementAction(announcement.id, "publish")
                      }
                    >
                      Publish
                    </Button>
                  )}
                  {announcement.status === "scheduled" && (
                    <Button size="sm" variant="outline">
                      Reschedule
                    </Button>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Quick Actions */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Button className="h-16 flex flex-col items-center justify-center space-y-2">
            <span className="text-lg">📝</span>
            <span>Create Template</span>
          </Button>
          <Button
            variant="outline"
            className="h-16 flex flex-col items-center justify-center space-y-2"
          >
            <span className="text-lg">📢</span>
            <span>Send Announcement</span>
          </Button>
          <Button
            variant="outline"
            className="h-16 flex flex-col items-center justify-center space-y-2"
          >
            <span className="text-lg">🔍</span>
            <span>Review Queue</span>
          </Button>
          <Button
            variant="outline"
            className="h-16 flex flex-col items-center justify-center space-y-2"
          >
            <span className="text-lg">📊</span>
            <span>Content Analytics</span>
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Content;
