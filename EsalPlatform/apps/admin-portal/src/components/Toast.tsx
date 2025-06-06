import React, { useState, useEffect } from "react";

interface ToastProps {
  message: string;
  type: "success" | "error" | "warning" | "info";
  duration?: number;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type,
  duration = 3000,
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Allow fade out animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const typeStyles = {
    success: "bg-green-500 text-white",
    error: "bg-red-500 text-white",
    warning: "bg-yellow-500 text-black",
    info: "bg-blue-500 text-white",
  };

  const typeIcons = {
    success: "✅",
    error: "❌",
    warning: "⚠️",
    info: "ℹ️",
  };

  return (
    <div
      className={`fixed top-4 right-4 z-50 transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        className={`
        ${typeStyles[type]} 
        px-6 py-4 rounded-lg shadow-lg max-w-sm flex items-center space-x-3
      `}
      >
        <span className="text-lg">{typeIcons[type]}</span>
        <span className="font-medium">{message}</span>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }}
          className="ml-auto text-xl hover:opacity-75"
        >
          ×
        </button>
      </div>
    </div>
  );
};

// Toast Container Component
interface ToastContainerProps {
  toasts: Array<{
    id: string;
    message: string;
    type: "success" | "error" | "warning" | "info";
    duration?: number;
  }>;
  onRemove: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  onRemove,
}) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => onRemove(toast.id)}
        />
      ))}
    </div>
  );
};

// Hook for managing toasts
export const useToast = () => {
  const [toasts, setToasts] = useState<
    Array<{
      id: string;
      message: string;
      type: "success" | "error" | "warning" | "info";
      duration?: number;
    }>
  >([]);

  const addToast = (
    message: string,
    type: "success" | "error" | "warning" | "info" = "info",
    duration = 3000
  ) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type, duration }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return {
    toasts,
    addToast,
    removeToast,
    success: (message: string, duration?: number) =>
      addToast(message, "success", duration),
    error: (message: string, duration?: number) =>
      addToast(message, "error", duration),
    warning: (message: string, duration?: number) =>
      addToast(message, "warning", duration),
    info: (message: string, duration?: number) =>
      addToast(message, "info", duration),
  };
};
