/**
 * Payment Failed Page
 * Displayed when payment fails or is cancelled
 */

import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { XCircle, ArrowLeft, RefreshCw, HelpCircle } from "lucide-react";

const PaymentFailedPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const orderId = searchParams.get("order_id");
  const reason = searchParams.get("reason") || "unknown";

  const handleRetry = () => {
    navigate("/subscription");
  };

  const handleGoBack = () => {
    navigate("/dashboard");
  };

  const getFailureMessage = () => {
    switch (reason.toLowerCase()) {
      case "cancelled":
        return "You cancelled the payment process.";
      case "insufficient_funds":
        return "Payment failed due to insufficient funds.";
      case "invalid_card":
        return "Payment failed due to invalid card details.";
      case "network_error":
        return "Payment failed due to a network error.";
      case "timeout":
        return "Payment failed due to timeout.";
      default:
        return "Payment could not be processed at this time.";
    }
  };

  const getTroubleshootingTips = () => {
    const tips = [
      "Check that you have sufficient funds in your account",
      "Verify your card details are correct",
      "Ensure you have a stable internet connection",
      "Try using a different payment method",
      "Contact your bank if the issue persists",
    ];

    return tips;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          {/* Failed Icon */}
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
            <XCircle className="h-10 w-10 text-red-600" />
          </div>

          {/* Failed Message */}
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Payment Failed
          </h1>

          <p className="text-gray-600 mb-6">
            {getFailureMessage()} Please try again or contact support if the
            problem continues.
          </p>

          {orderId && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Order ID:</span> {orderId}
              </p>
            </div>
          )}

          {/* Troubleshooting */}
          <div className="text-left mb-8">
            <h3 className="font-medium text-gray-900 mb-3 text-center flex items-center justify-center">
              <HelpCircle className="h-4 w-4 mr-2" />
              Troubleshooting Tips
            </h3>
            <ul className="space-y-2">
              {getTroubleshootingTips().map((tip, index) => (
                <li
                  key={index}
                  className="flex items-start text-sm text-gray-600"
                >
                  <span className="inline-block w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleRetry}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </button>

            <button
              onClick={handleGoBack}
              className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-md hover:bg-gray-50 transition-colors flex items-center justify-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </button>
          </div>

          {/* Support */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 mb-2">Still having trouble?</p>
            <div className="space-y-1">
              <p className="text-xs text-gray-500">
                Email:{" "}
                <a
                  href="mailto:support@esal.co.ke"
                  className="text-blue-600 hover:text-blue-800"
                >
                  support@esal.co.ke
                </a>
              </p>
              <p className="text-xs text-gray-500">
                Phone:{" "}
                <a
                  href="tel:+254700000000"
                  className="text-blue-600 hover:text-blue-800"
                >
                  +254 700 000 000
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailedPage;
