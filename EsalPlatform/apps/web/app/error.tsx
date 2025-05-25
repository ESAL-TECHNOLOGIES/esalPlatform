"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@repo/ui/button";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <div className="space-y-6 max-w-md">
        <div className="flex justify-center">
          <div className="relative h-32 w-32 text-red-500">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">
          Something went wrong!
        </h1>
        <p className="text-muted-foreground">
          We apologize for the inconvenience. An error has occurred while
          processing your request.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={() => reset()}>Try again</Button>
          <Button variant="outline" asChild>
            <Link href="/">Return to home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
