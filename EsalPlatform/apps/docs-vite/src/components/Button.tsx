import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline";
  appName?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className = "",
  variant = "primary",
  appName,
  ...props
}) => {
  // Basic styles for the button
  const baseClasses = "px-4 py-2 rounded-md font-medium transition-colors";

  // Variant-specific styles
  const variantClasses = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300",
    outline: "border border-gray-300 bg-transparent hover:bg-gray-100",
  };

  // Combine all classes
  const buttonClasses = `${baseClasses} ${variantClasses[variant]} ${className}`;

  // Handle the click event
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Show alert if appName is provided
    if (appName) {
      alert(`Hello from ${appName}!`);
    }

    // Call the original onClick handler if provided
    if (props.onClick) {
      props.onClick(e);
    }
  };

  return (
    <button className={buttonClasses} onClick={handleClick} {...props}>
      {children}
    </button>
  );
};
