import React, { useState, useEffect } from "react";
import type { LayoutProps } from "../types";

export const Layout: React.FC<LayoutProps> = ({
  children,
  sidebar,
  navbar,
}) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Close mobile sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.getElementById("mobile-sidebar");
      const hamburger = document.getElementById("hamburger-button");

      if (
        isMobileSidebarOpen &&
        sidebar &&
        !sidebar.contains(event.target as Node) &&
        hamburger &&
        !hamburger.contains(event.target as Node)
      ) {
        setIsMobileSidebarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMobileSidebarOpen]);

  // Close mobile sidebar on window resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        // lg breakpoint
        setIsMobileSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Enhanced navbar with hamburger menu control
  const enhancedNavbar = React.cloneElement(navbar as React.ReactElement, {
    onMobileMenuToggle: () => setIsMobileSidebarOpen(!isMobileSidebarOpen),
    isMobileMenuOpen: isMobileSidebarOpen,
  });

  // Enhanced sidebar with mobile state
  const enhancedSidebar = React.cloneElement(sidebar as React.ReactElement, {
    isMobileOpen: isMobileSidebarOpen,
    onMobileClose: () => setIsMobileSidebarOpen(false),
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {enhancedNavbar}
      <div className="flex">
        {/* Desktop Sidebar - hidden on mobile */}
        <div className="hidden lg:block">{enhancedSidebar}</div>

        {/* Mobile Sidebar Overlay */}
        {isMobileSidebarOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
              onClick={() => setIsMobileSidebarOpen(false)}
            />

            {/* Mobile Sidebar */}
            <div
              id="mobile-sidebar"
              className="fixed inset-y-0 left-0 z-50 lg:hidden"
            >
              {enhancedSidebar}
            </div>
          </>
        )}

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-8 transition-all duration-300">
          {children}
        </main>
      </div>
    </div>
  );
};
