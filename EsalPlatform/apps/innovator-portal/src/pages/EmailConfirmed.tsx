import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle, XCircle, AlertCircle, ArrowRight } from "lucide-react";

const EmailConfirmed: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<
    "loading" | "success" | "error" | "already_confirmed"
  >("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const confirmEmail = async () => {
      const token = searchParams.get("token");
      const error = searchParams.get("error");
      const errorDescription = searchParams.get("error_description");

      // Check for error parameters (from Supabase redirect)
      if (error) {
        if (
          error === "access_denied" &&
          errorDescription?.includes("already_confirmed")
        ) {
          setStatus("already_confirmed");
          setMessage(
            "Your email has already been confirmed. You can now log in to your account."
          );
        } else {
          setStatus("error");
          setMessage(
            errorDescription || "An error occurred during email confirmation."
          );
        }
        return;
      }

      // Check for success parameters
      if (searchParams.get("type") === "signup") {
        setStatus("success");
        setMessage(
          "Your email has been confirmed successfully! You can now log in to your account."
        );
        return;
      }

      // If we have a token, try to confirm via API
      if (token) {
        try {
          const response = await fetch(`/api/v1/auth/confirm?token=${token}`, {
            method: "GET",
          });

          if (response.ok) {
            setStatus("success");
            setMessage(
              "Your email has been confirmed successfully! You can now log in to your account."
            );
          } else {
            const errorData = await response.json().catch(() => ({}));
            setStatus("error");
            setMessage(
              errorData.detail ||
                "Failed to confirm email. The link may be expired or invalid."
            );
          }
        } catch (error) {
          setStatus("error");
          setMessage(
            "An error occurred while confirming your email. Please try again."
          );
        }
      } else {
        setStatus("error");
        setMessage("No confirmation token provided.");
      }
    };

    confirmEmail();
  }, [searchParams]);

  const getIcon = () => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-16 w-16 text-green-500" />;
      case "already_confirmed":
        return <AlertCircle className="h-16 w-16 text-yellow-500" />;
      case "error":
        return <XCircle className="h-16 w-16 text-red-500" />;
      default:
        return (
          <div className="h-16 w-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        );
    }
  };

  const getTitle = () => {
    switch (status) {
      case "success":
        return "Email Confirmed!";
      case "already_confirmed":
        return "Already Confirmed";
      case "error":
        return "Confirmation Failed";
      default:
        return "Confirming Email...";
    }
  };

  const getButtonText = () => {
    switch (status) {
      case "success":
      case "already_confirmed":
        return "Go to Login";
      case "error":
        return "Back to Signup";
      default:
        return "Please wait...";
    }
  };

  const getButtonLink = () => {
    switch (status) {
      case "success":
      case "already_confirmed":
        return "/login";
      case "error":
        return "/signup";
      default:
        return "#";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6 flex justify-center">{getIcon()}</div>

        <h1 className="text-2xl font-bold text-gray-900 mb-4">{getTitle()}</h1>

        <p className="text-gray-600 mb-8">{message}</p>

        {status !== "loading" && (
          <Link
            to={getButtonLink()}
            className="inline-flex items-center justify-center w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition duration-200 group"
          >
            {getButtonText()}
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        )}

        {status === "error" && (
          <div className="mt-4 text-sm text-gray-500">
            Need help? Contact support at{" "}
            <a
              href="mailto:support@esalplatform.com"
              className="text-blue-600 hover:underline"
            >
              support@esalplatform.com
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailConfirmed;
