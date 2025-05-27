import React from "react";
import type { LayoutProps } from "../types";

export const Layout: React.FC<LayoutProps> = ({
  children,
  sidebar,
  navbar,
}) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {navbar}
      <div className="flex">
        {sidebar}
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
};
