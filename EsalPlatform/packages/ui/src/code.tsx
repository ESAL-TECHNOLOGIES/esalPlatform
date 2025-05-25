import * as React from "react";

interface CodeProps {
  children: React.ReactNode;
  className?: string;
}

export function Code({ children, className = "" }: CodeProps) {
  return (
    <code className={`font-mono bg-gray-100 px-1 py-0.5 rounded ${className}`}>
      {children}
    </code>
  );
}
