import React from "react";
import { Card, CardContent, Button } from "@esal/ui";
import { Edit2, MapPin, Globe, Briefcase, Twitter, Calendar, RefreshCw } from "lucide-react";

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
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
      {/* Enhanced Cover/Background with Gradient */}
      <div className="h-32 sm:h-40 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 relative">
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-white/10"></div>
        {showEditButton && onEdit && (          <Button
            onClick={onEdit}
            variant="secondary"
            size="sm"
            className="absolute top-4 right-4 bg-white/90 hover:bg-white backdrop-blur-sm text-gray-700 hover:text-gray-900 border border-white/20 shadow-lg transition-all duration-200"
          >
            <Edit2 className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline">Edit</span>
          </Button>
        )}
      </div>

      <CardContent className="relative px-4 sm:px-6 pb-4 sm:pb-6">
        {/* Enhanced Avatar Section */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between -mt-16 sm:-mt-16 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-end">
            <div className="relative mx-auto sm:mx-0 mb-4 sm:mb-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-white bg-white shadow-xl flex items-center justify-center overflow-hidden">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.full_name || "Profile"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                    <span className="text-white text-lg sm:text-xl font-bold">
                      {getInitials(profile.full_name || profile.email)}
                    </span>
                  </div>
                )}
              </div>
              {/* Enhanced Status indicator */}
              <div
                className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-3 border-white shadow-lg ${
                  profile.is_active && !profile.is_blocked
                    ? "bg-green-400"
                    : "bg-gray-400"
                }`}
              >
                <div className="w-full h-full rounded-full bg-current opacity-20"></div>
              </div>
            </div>

            {/* Status badge - Better positioned for mobile */}
            <div className="sm:ml-4 sm:mb-2 text-center sm:text-left">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border shadow-sm ${getStatusColor()}`}
              >
                <span className="w-2 h-2 rounded-full bg-current mr-2 opacity-60"></span>
                {getStatusText()}
              </span>
            </div>
          </div>
        </div>

        {/* Enhanced Profile Info */}
        <div className="space-y-4 sm:space-y-6">
          {/* Name and Title - Better mobile layout */}
          <div className="text-center sm:text-left">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
              {profile.full_name || "No name provided"}
            </h2>
            <p className="text-gray-600 font-medium capitalize text-sm sm:text-base">
              {profile.role} Innovator
            </p>
            <p className="text-gray-500 text-xs sm:text-sm mt-1">{profile.email}</p>
          </div>

          {/* Bio - Better spacing */}
          {profile.bio && (
            <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
              <p className="text-gray-700 leading-relaxed text-sm sm:text-base">{profile.bio}</p>
            </div>
          )}          {/* Location - Enhanced design */}
          {profile.location && (
            <div className="flex items-center justify-center sm:justify-start text-gray-600 bg-blue-50 rounded-lg p-3">
              <MapPin className="w-4 h-4 mr-2 text-blue-600" />
              <span className="text-sm sm:text-base font-medium">{profile.location}</span>
            </div>
          )}

          {/* Enhanced Stats with Better Mobile Layout */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4 py-4 border-t border-gray-200">
            <div className="text-center bg-blue-50 rounded-lg p-3 hover:bg-blue-100 transition-colors">
              <div className="text-lg sm:text-2xl font-bold text-blue-600 mb-1">
                {ideasCount}
              </div>
              <div className="text-xs text-gray-500 font-medium">Ideas</div>
            </div>
            <div className="text-center bg-green-50 rounded-lg p-3 hover:bg-green-100 transition-colors">
              <div className="text-lg sm:text-2xl font-bold text-green-600 mb-1">
                {viewsCount}
              </div>
              <div className="text-xs text-gray-500 font-medium">Views</div>
            </div>
            <div className="text-center bg-purple-50 rounded-lg p-3 hover:bg-purple-100 transition-colors">
              <div className="text-lg sm:text-2xl font-bold text-purple-600 mb-1">
                {interestsCount}
              </div>
              <div className="text-xs text-gray-500 font-medium">Interests</div>
            </div>
          </div>

          {/* Enhanced Expertise Tags */}
          {profile.expertise && profile.expertise.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3 text-center sm:text-left">
                Areas of Expertise
              </h4>
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                {profile.expertise.slice(0, 6).map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200 hover:border-blue-300 transition-colors"
                  >
                    {skill}
                  </span>
                ))}
                {profile.expertise.length > 6 && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                    +{profile.expertise.length - 6} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Enhanced Social Links */}
          {(profile.website || profile.linkedin || profile.twitter) && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3 text-center sm:text-left">
                Connect
              </h4>
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start">                {profile.website && (
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-3 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm transition-all duration-200 hover:shadow-sm border border-gray-200"
                  >
                    <Globe className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Website</span>
                  </a>
                )}                {profile.linkedin && (
                  <a
                    href={profile.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-3 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm transition-all duration-200 hover:shadow-sm border border-blue-200"
                  >
                    <Briefcase className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">LinkedIn</span>
                  </a>
                )}                {profile.twitter && (
                  <a
                    href={profile.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-3 py-2 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 text-sm transition-all duration-200 hover:shadow-sm border border-sky-200"
                  >
                    <Twitter className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Twitter</span>
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Enhanced Member Since Section */}
          <div className="pt-4 border-t border-gray-200 bg-gray-50 rounded-lg p-3 sm:p-4">            <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0 text-xs sm:text-sm text-gray-500">
              <span className="flex items-center">
                <Calendar className="w-3 h-3 mr-1" />
                Member since {formatDate(profile.created_at)}
              </span>
              <span className="flex items-center">
                <RefreshCw className="w-3 h-3 mr-1" />
                Updated {formatDate(profile.updated_at)}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileCard;
