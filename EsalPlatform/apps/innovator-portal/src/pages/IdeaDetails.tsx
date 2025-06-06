import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent, Button } from "@esal/ui";
import {
  FileText,
  Image,
  BarChart3,
  FileEdit,
  Folder,
  AlertTriangle,
} from "lucide-react";

interface IdeaDetail {
  id: string;
  title: string;
  description: string;
  industry: string;
  stage: string;
  target_market: string;
  funding_needed?: string;
  problem?: string;
  solution?: string;
  team_size?: number;
  status: string;
  ai_score?: number;
  created_at: string;
  updated_at: string;
  views_count: number;
  interests_count: number;
  user_id: string;
  author_name?: string;
  comments: Comment[];
  files: FileAttachment[];
  similar_ideas: SimilarIdea[];
}

interface Comment {
  id: string;
  text: string;
  user_id: string;
  author_name: string;
  created_at: string;
}

interface FileAttachment {
  id: string;
  filename: string;
  file_type: string;
  file_size: number;
  upload_date: string;
  download_url: string;
}

interface SimilarIdea {
  id: string;
  title: string;
  industry: string;
  similarity_score: number;
}

const IdeaDetails: React.FC = () => {
  const { ideaId } = useParams<{ ideaId: string }>();
  const navigate = useNavigate();
  const [idea, setIdea] = useState<IdeaDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchIdeaDetails();
  }, [ideaId]);

  const fetchIdeaDetails = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(
        `http://localhost:8000/api/v1/ideas/${ideaId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to fetch idea details");
      }

      const ideaData = await response.json();
      setIdea(ideaData);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred fetching idea details"
      );
      console.error("Error fetching idea details:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingComment(true);
    setCommentError(null);

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(
        `http://localhost:8000/api/v1/ideas/${ideaId}/comment`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: newComment,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to add comment");
      }

      const commentData = await response.json();

      // Update local state with the new comment
      setIdea((prevIdea) => {
        if (!prevIdea) return null;

        return {
          ...prevIdea,
          comments: [...prevIdea.comments, commentData],
        };
      });

      // Clear the comment form
      setNewComment("");
      setSuccessMessage("Comment added successfully!");

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      setCommentError(
        err instanceof Error
          ? err.message
          : "An error occurred adding your comment"
      );
      console.error("Error adding comment:", err);
    } finally {
      setIsSubmittingComment(false);
    }
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (fileList && fileList.length > 0) {
      const file = fileList[0];

      // File size validation - 3MB limit
      const maxSizeInBytes = 3 * 1024 * 1024; // 3MB
      if (file.size > maxSizeInBytes) {
        setUploadError(
          `File "${file.name}" exceeds the 3MB size limit (${(file.size / 1024 / 1024).toFixed(2)} MB). Please choose a smaller file.`
        );

        // Clear the file input
        e.target.value = "";
        return;
      }

      // Clear any previous error
      setUploadError(null);
      setSelectedFile(file);
    }
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setIsUploadingFile(true);
    setUploadError(null);

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("Authentication required");
      }

      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch(
        `http://localhost:8000/api/v1/ideas/${ideaId}/upload-file`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to upload file");
      }

      const fileData = await response.json();

      // Update local state with the new file
      setIdea((prevIdea) => {
        if (!prevIdea) return null;

        return {
          ...prevIdea,
          files: [...prevIdea.files, fileData],
        };
      });

      // Clear the file input
      setSelectedFile(null);

      setSuccessMessage("File uploaded successfully!");

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      setUploadError(
        err instanceof Error
          ? err.message
          : "An error occurred uploading your file"
      );
      console.error("Error uploading file:", err);
    } finally {
      setIsUploadingFile(false);
    }
  };

  const handleDeleteIdea = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete this idea? This action cannot be undone."
      )
    ) {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          throw new Error("Authentication required");
        }

        const response = await fetch(
          `http://localhost:8000/api/v1/ideas/${ideaId}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || "Failed to delete idea");
        }

        navigate("/my-ideas");
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "An error occurred deleting the idea"
        );
        console.error("Error deleting idea:", err);
      }
    }
  };

  const formatDate = (dateString: string): string => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  const formatFileSize = (sizeInBytes: number): string => {
    if (sizeInBytes < 1024) {
      return `${sizeInBytes} B`;
    } else if (sizeInBytes < 1024 * 1024) {
      return `${(sizeInBytes / 1024).toFixed(2)} KB`;
    } else if (sizeInBytes < 1024 * 1024 * 1024) {
      return `${(sizeInBytes / (1024 * 1024)).toFixed(2)} MB`;
    } else {
      return `${(sizeInBytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
    }
  };

  const getStatusDisplay = (
    status: string
  ): { label: string; className: string } => {
    switch (status) {
      case "draft":
        return { label: "Draft", className: "bg-gray-100 text-gray-800" };
      case "active":
        return { label: "Active", className: "bg-green-100 text-green-800" };
      case "pending":
        return {
          label: "Pending Review",
          className: "bg-yellow-100 text-yellow-800",
        };
      case "rejected":
        return { label: "Rejected", className: "bg-red-100 text-red-800" };
      default:
        return { label: status, className: "bg-gray-100 text-gray-800" };
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Idea Details</h1>
          <p className="text-gray-600">Loading idea information...</p>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Idea Details</h1>
          <p className="text-gray-600">
            There was a problem loading this idea.
          </p>
        </div>
        <Card>
          <CardContent>
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="flex items-center text-red-600 text-sm">
                  <AlertTriangle className="w-4 h-4 mr-1" />
                  Error: {error}
                </div>
              </div>
            </div>
            <div className="mt-4 text-center">
              <Button onClick={() => navigate("/my-ideas")}>
                Back to My Ideas
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!idea) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Idea Details</h1>
          <p className="text-gray-600">Idea not found.</p>
        </div>
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-lg mb-4">
              The requested idea could not be found.
            </p>
            <Button onClick={() => navigate("/my-ideas")}>
              Back to My Ideas
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusInfo = getStatusDisplay(idea.status);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{idea.title}</h1>
          <p className="text-gray-600">
            Created on {formatDate(idea.created_at)} • Last updated{" "}
            {formatDate(idea.updated_at)}
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={() => navigate(`/ideas/${idea.id}/edit`)}
            variant="secondary"
          >
            Edit Idea
          </Button>
          <Button
            onClick={handleDeleteIdea}
            variant="outline"
            className="border-red-300 text-red-600 hover:bg-red-50"
          >
            Delete Idea
          </Button>
        </div>
      </div>

      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex">
            <div className="text-green-400">
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">{successMessage}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Idea Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Idea Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">
                    Description
                  </h3>
                  <p className="text-gray-800 whitespace-pre-line">
                    {idea.description}
                  </p>
                </div>

                {idea.problem && (
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-2">
                      Problem
                    </h3>
                    <p className="text-gray-800 whitespace-pre-line">
                      {idea.problem}
                    </p>
                  </div>
                )}

                {idea.solution && (
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-2">
                      Solution
                    </h3>
                    <p className="text-gray-800 whitespace-pre-line">
                      {idea.solution}
                    </p>
                  </div>
                )}

                {idea.target_market && (
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-2">
                      Target Market
                    </h3>
                    <p className="text-gray-800">{idea.target_market}</p>
                  </div>
                )}

                <div className="border-t pt-4 mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div>
                    <span className="text-sm text-gray-500">Industry</span>
                    <p className="font-medium">{idea.industry}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Stage</span>
                    <p className="font-medium capitalize">{idea.stage}</p>
                  </div>
                  {idea.team_size !== undefined && (
                    <div>
                      <span className="text-sm text-gray-500">Team Size</span>
                      <p className="font-medium">{idea.team_size} people</p>
                    </div>
                  )}
                  {idea.funding_needed && (
                    <div>
                      <span className="text-sm text-gray-500">
                        Funding Needed
                      </span>
                      <p className="font-medium">{idea.funding_needed}</p>
                    </div>
                  )}
                  {idea.ai_score !== undefined && idea.ai_score !== null && (
                    <div>
                      <span className="text-sm text-gray-500">AI Score</span>
                      <p className="font-medium">
                        {idea.ai_score.toFixed(1)} / 10
                      </p>
                    </div>
                  )}
                  <div>
                    <span className="text-sm text-gray-500">Status</span>
                    <p>
                      <span
                        className={`inline-block px-2 py-1 text-xs rounded-full ${statusInfo.className}`}
                      >
                        {statusInfo.label}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Files & Attachments */}
          <Card>
            <CardHeader>
              <CardTitle>Files & Attachments</CardTitle>
            </CardHeader>
            <CardContent>
              {idea.files.length > 0 ? (
                <div className="space-y-3">
                  {idea.files.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between py-2 px-4 border rounded-lg"
                    >
                      <div className="flex items-center">                        <div className="mr-3 text-lg">
                          {file.file_type.includes("pdf") ? (
                            <FileText className="w-5 h-5 text-red-500" />
                          ) : file.file_type.includes("image") ? (
                            <Image className="w-5 h-5 text-green-500" />
                          ) : file.file_type.includes("spreadsheet") ? (
                            <BarChart3 className="w-5 h-5 text-blue-500" />
                          ) : file.file_type.includes("word") ? (
                            <FileEdit className="w-5 h-5 text-blue-600" />
                          ) : (
                            <Folder className="w-5 h-5 text-gray-500" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{file.filename}</p>
                          <p className="text-sm text-gray-500">
                            {formatFileSize(file.file_size)} •{" "}
                            {formatDate(file.upload_date)}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(file.download_url, "_blank")}
                      >
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-6 text-gray-500">
                  No files attached to this idea yet.
                </p>
              )}

              <div className="mt-6">
                <h3 className="font-medium text-gray-800 mb-3">
                  Upload New File
                </h3>{" "}
                <form onSubmit={handleFileUpload} className="space-y-4">
                  {" "}
                  <div>
                    <label
                      htmlFor="file-upload"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Upload File
                    </label>
                    <input
                      id="file-upload"
                      type="file"
                      onChange={handleFileChange}
                      accept=".pdf,.ppt,.pptx,.doc,.docx,.xls,.xlsx,.csv,.txt,.jpg,.jpeg,.png"
                      className="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-md file:border-0
                        file:text-sm file:font-medium
                        file:bg-blue-50 file:text-blue-700
                        hover:file:bg-blue-100"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Supported formats: PDF, PPT, DOC, Excel, CSV, TXT, Images
                      (Max 3MB)
                    </p>
                  </div>
                  {uploadError && (
                    <div className="text-red-600 text-sm">
                      Error: {uploadError}
                    </div>
                  )}
                  <Button
                    type="submit"
                    disabled={!selectedFile || isUploadingFile}
                  >
                    {isUploadingFile ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Uploading...
                      </>
                    ) : (
                      "Upload File"
                    )}
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>

          {/* Comments Section */}
          <Card>
            <CardHeader>
              <CardTitle>Comments & Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {idea.comments.length > 0 ? (
                  <div className="space-y-4">
                    {idea.comments.map((comment) => (
                      <div
                        key={comment.id}
                        className="bg-gray-50 p-4 rounded-lg"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="font-medium">
                            {comment.author_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatDate(comment.created_at)}
                          </div>
                        </div>
                        <p className="text-gray-800">{comment.text}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-6 text-gray-500">
                    No comments yet. Be the first to leave feedback!
                  </p>
                )}

                <div className="mt-6 border-t pt-6">
                  <h3 className="font-medium text-gray-800 mb-3">
                    Add a Comment
                  </h3>
                  <form onSubmit={handleCommentSubmit} className="space-y-4">
                    <div>
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Share your thoughts, questions, or suggestions..."
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    {commentError && (
                      <div className="text-red-600 text-sm">
                        Error: {commentError}
                      </div>
                    )}

                    <Button type="submit" disabled={isSubmittingComment}>
                      {isSubmittingComment ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Posting...
                        </>
                      ) : (
                        "Post Comment"
                      )}
                    </Button>
                  </form>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Idea Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600">
                    {idea.views_count}
                  </div>
                  <div className="text-sm text-gray-600">Views</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-3xl font-bold text-green-600">
                    {idea.interests_count}
                  </div>
                  <div className="text-sm text-gray-600">Interests</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Similar Ideas */}
          {idea.similar_ideas.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Similar Ideas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {idea.similar_ideas.map((similarIdea) => (
                    <div
                      key={similarIdea.id}
                      className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer"
                      onClick={() => navigate(`/ideas/${similarIdea.id}`)}
                    >
                      <p className="font-medium">{similarIdea.title}</p>
                      <div className="flex justify-between items-center mt-2 text-sm">
                        <span className="text-gray-500">
                          {similarIdea.industry}
                        </span>
                        <span className="text-blue-600">
                          {Math.round(similarIdea.similarity_score * 100)}%
                          similar
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Author Info */}
          {idea.author_name && (
            <Card>
              <CardHeader>
                <CardTitle>Author</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <div className="bg-blue-100 h-12 w-12 rounded-full flex items-center justify-center text-blue-600 font-medium text-lg mr-4">
                    {idea.author_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-medium">{idea.author_name}</div>
                    <div className="text-sm text-gray-500">Innovator</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default IdeaDetails;
