import React from "react";
import { Card, CardContent, Button } from "@esal/ui";

interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  role: string;
  bio?: string;
  location?: string;
  expertise?: string[];
  website?: string;
  linkedin?: string;
  twitter?: string;
  avatar_url?: string;
  is_active: boolean;
  is_blocked: boolean;
  created_at: string;
  updated_at: string;
}

interface ProfileCardProps {
  profile: UserProfile;
  onEdit?: () => void;
  showEditButton?: boolean;
  ideasCount?: number;
  viewsCount?: number;
  interestsCount?: number;
}

const ProfileCard: React.FC<ProfileCardProps> = ({
  profile,
  onEdit,
  showEditButton = true,
  ideasCount = 0,
  viewsCount = 0,
  interestsCount = 0,
}) => {
  const getInitials = (name?: string) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusColor = () => {
    if (profile.is_blocked) return "bg-red-100 text-red-800 border-red-200";
    if (!profile.is_active)
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    return "bg-green-100 text-green-800 border-green-200";
  };

  const getStatusText = () => {
    if (profile.is_blocked) return "Blocked";
    if (!profile.is_active) return "Inactive";
    return "Active";
  };

  const formatDate = (dateString: string): string => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  return (
    <Card className="overflow-hidden">
      {/* Cover/Background */}
      <div className="h-32 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 relative">
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        {showEditButton && onEdit && (
          <Button
            onClick={onEdit}
            variant="secondary"
            size="sm"
            className="absolute top-4 right-4 bg-white bg-opacity-90 hover:bg-opacity-100"
          >
            ✏️ Edit
          </Button>
        )}
      </div>

      <CardContent className="relative px-6 pb-6">
        {/* Avatar */}
        <div className="flex items-end -mt-16 mb-4">
          <div className="relative">
            <div className="w-24 h-24 rounded-full border-4 border-white bg-white shadow-lg flex items-center justify-center overflow-hidden">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.full_name || "Profile"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                  <span className="text-white text-xl font-bold">
                    {getInitials(profile.full_name || profile.email)}
                  </span>
                </div>
              )}
            </div>
            {/* Status indicator */}
            <div
              className={`absolute bottom-1 right-1 w-6 h-6 rounded-full border-2 border-white ${
                profile.is_active && !profile.is_blocked
                  ? "bg-green-400"
                  : "bg-gray-400"
              }`}
            ></div>
          </div>

          {/* Status badge */}
          <div className="ml-4 mb-2">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor()}`}
            >
              {getStatusText()}
            </span>
          </div>
        </div>

        {/* Profile Info */}
        <div className="space-y-4">
          {/* Name and Title */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {profile.full_name || "No name provided"}
            </h2>
            <p className="text-gray-600 font-medium capitalize">
              {profile.role} Innovator
            </p>
            <p className="text-gray-500 text-sm">{profile.email}</p>
          </div>

          {/* Bio */}
          {profile.bio && (
            <div>
              <p className="text-gray-700 leading-relaxed">{profile.bio}</p>
            </div>
          )}

          {/* Location */}
          {profile.location && (
            <div className="flex items-center text-gray-600">
              <span className="mr-2">📍</span>
              <span>{profile.location}</span>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 py-4 border-t border-gray-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {ideasCount}
              </div>
              <div className="text-xs text-gray-500">Ideas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {viewsCount}
              </div>
              <div className="text-xs text-gray-500">Total Views</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {interestsCount}
              </div>
              <div className="text-xs text-gray-500">Interests</div>
            </div>
          </div>

          {/* Expertise Tags */}
          {profile.expertise && profile.expertise.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">
                Areas of Expertise
              </h4>
              <div className="flex flex-wrap gap-2">
                {profile.expertise.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Social Links */}
          {(profile.website || profile.linkedin || profile.twitter) && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">
                Connect
              </h4>
              <div className="flex flex-wrap gap-3">
                {profile.website && (
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-3 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm transition-colors"
                  >
                    <span className="mr-2">🌐</span>
                    Website
                  </a>
                )}
                {profile.linkedin && (
                  <a
                    href={profile.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-3 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm transition-colors"
                  >
                    <span className="mr-2">💼</span>
                    LinkedIn
                  </a>
                )}
                {profile.twitter && (
                  <a
                    href={profile.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-3 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 text-sm transition-colors"
                  >
                    <span className="mr-2">🐦</span>
                    Twitter
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Member Since */}
          <div className="pt-4 border-t border-gray-200">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Member since {formatDate(profile.created_at)}</span>
              <span>Updated {formatDate(profile.updated_at)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileCard;
