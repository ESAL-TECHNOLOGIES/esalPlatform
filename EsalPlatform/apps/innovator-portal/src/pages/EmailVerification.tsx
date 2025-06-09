import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button, Card, CardHeader, CardTitle, CardContent } from "@esal/ui";
import { API_BASE_URL } from "../config/api";

interface EmailVerificationProps {
  email?: string;
  userId?: string;
}

const EmailVerification: React.FC<EmailVerificationProps> = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // Get data from navigation state or props
  const email = location.state?.email || "";
  const userId = location.state?.userId || "";
  const showResendOnly = location.state?.showResendOnly || false;

  const [verificationCode, setVerificationCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);

  // Countdown timer for resend button
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);
  // Redirect if no email provided, but allow showResendOnly mode without userId
  useEffect(() => {
    if (!email || (!userId && !showResendOnly)) {
      navigate("/signup");
    }
  }, [email, userId, showResendOnly, navigate]);
  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    if (!verificationCode.match(/^\d{6}$/)) {
      setError("Please enter a valid 6-digit code");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/verify-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          user_id: userId,
          code: verificationCode,
          email: email, // Send email if userId not available
        }),
      });

      if (response.ok) {
        const data = await response.json();

        // Store token in localStorage
        localStorage.setItem("access_token", data.access_token);
        if (data.refresh_token) {
          localStorage.setItem("refresh_token", data.refresh_token);
        }

        setSuccess(
          data.message || "Email verified successfully! Redirecting..."
        );

        // Redirect to dashboard after success
        setTimeout(() => {
          navigate("/");
        }, 2000);
      } else {
        const errorData = await response.json();
        setError(errorData.detail || "Verification failed");
      }
    } catch (err) {
      setError("Network error. Please try again.");
      console.error("Verification error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsResending(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/auth/resend-verification`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            email: email,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSuccess("Verification code sent! Please check your email.");
        setTimeLeft(60); // 60 second cooldown
      } else {
        const errorData = await response.json();
        setError(errorData.detail || "Failed to resend code");
      }
    } catch (err) {
      setError("Network error. Please try again.");
      console.error("Resend error:", err);
    } finally {
      setIsResending(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6); // Only digits, max 6
    setVerificationCode(value);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        {" "}
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">
            Verify Your Email
          </CardTitle>
          {showResendOnly ? (
            <div>
              <p className="text-gray-600 mt-2">
                Your account needs email verification before you can log in.
              </p>
              <p className="text-gray-600">
                We'll send a new 6-digit verification code to
              </p>
              <p className="text-blue-600 font-semibold">{email}</p>
            </div>
          ) : (
            <div>
              <p className="text-gray-600 mt-2">
                We've sent a 6-digit verification code to
              </p>
              <p className="text-blue-600 font-semibold">{email}</p>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleVerificationSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md">
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-md">
                {success}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Verification Code
              </label>
              <input
                type="text"
                value={verificationCode}
                onChange={handleInputChange}
                placeholder="Enter 6-digit code"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center text-2xl font-mono tracking-widest"
                maxLength={6}
                required
                autoComplete="one-time-code"
              />
              <p className="text-xs text-gray-500 mt-1">
                The code will expire in 10 minutes
              </p>
            </div>

            <Button
              type="submit"
              disabled={isLoading || verificationCode.length !== 6}
              className="w-full"
            >
              {isLoading ? "Verifying..." : "Verify Email"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 mb-3">
              Didn't receive the code?
            </p>

            <Button
              type="button"
              variant="outline"
              onClick={handleResendCode}
              disabled={isResending || timeLeft > 0}
              className="w-full"
            >
              {isResending
                ? "Sending..."
                : timeLeft > 0
                  ? `Resend code in ${formatTime(timeLeft)}`
                  : "Resend Code"}
            </Button>
          </div>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => navigate("/signup")}
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              Back to Sign Up
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailVerification;
