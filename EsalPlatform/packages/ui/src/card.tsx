import * as React from "react";

interface CardProps {
  title: string;
  children: React.ReactNode;
  href: string;
  className?: string;
}

export function Card({ title, children, href, className = "" }: CardProps) {
  return (
    <a
      href={href}
      className={`block max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 ${className}`}
    >
      <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900">{title}</h5>
      <p className="font-normal text-gray-700">{children}</p>
    </a>
  );
}
