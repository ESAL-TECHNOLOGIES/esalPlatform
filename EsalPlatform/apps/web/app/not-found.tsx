import Link from "next/link";
import { Button } from "@repo/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <div className="space-y-6 max-w-md">
        <div className="flex justify-center">
          <div className="relative h-32 w-32 text-muted-foreground">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M8 15h8" />
              <path d="M9 9h.01" />
              <path d="M15 9h.01" />
            </svg>
          </div>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Page Not Found</h1>
        <p className="text-muted-foreground">
          We couldn't find the page you're looking for. The page may have been
          moved, deleted, or never existed.
        </p>
        <Button asChild>
          <Link href="/">Return to home</Link>
        </Button>
      </div>
    </div>
  );
}
