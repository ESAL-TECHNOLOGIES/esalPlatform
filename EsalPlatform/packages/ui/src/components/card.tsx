import React from "react";
import { cn } from "../utils";
import type { CardProps } from "../types";

export const Card: React.FC<CardProps> = ({ children, className }) => {
  return (
    <div className={cn("rounded-lg border bg-white p-6 shadow-sm", className)}>
      {children}
    </div>
  );
};

export const CardHeader: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return <div className="pb-4">{children}</div>;
};

export const CardTitle: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return <h3 className="text-lg font-semibold text-gray-900">{children}</h3>;
};

export const CardContent: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  return <div className={cn("", className)}>{children}</div>;
};
