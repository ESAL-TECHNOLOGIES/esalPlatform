import React from "react";
import { cn } from "../utils";
import type { SidebarProps } from "../types";

export const Sidebar: React.FC<SidebarProps> = ({ items, currentPath }) => {
  return (
    <div className="w-64 bg-gray-50 border-r border-gray-200 h-full">
      <nav className="mt-8 px-4">
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                className={cn(
                  "flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors",
                  currentPath === item.href
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                {item.icon && <span className="mr-3">{item.icon}</span>}
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};
