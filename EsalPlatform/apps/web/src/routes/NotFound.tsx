import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] px-4 text-center">
      <h1 className="text-6xl font-bold">404</h1>
      <h2 className="text-2xl font-medium mt-4">Page Not Found</h2>
      <p className="text-muted-foreground mt-2 mb-8">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link
        to="/"
        className="px-6 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
      >
        Return Home
      </Link>
    </div>
  );
};

export default NotFound;
