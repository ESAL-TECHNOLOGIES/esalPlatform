"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar, AvatarImage, AvatarFallback } from "@repo/ui/avatar";
import { Button } from "@repo/ui/button";
import { useAuth } from "../lib/auth-context";

export function Navigation() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/dashboard", label: "Dashboard" },
    { href: "/organizations", label: "Organizations" },
    { href: "/programs", label: "Programs" },
    { href: "/matchmaking", label: "Matchmaking" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center">
        <div className="mr-4 flex items-center">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold">ESAL Platform</span>
          </Link>
        </div>
        <nav className="hidden md:flex flex-1 items-center space-x-6 text-sm font-medium">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`transition-colors hover:text-foreground/80 ${
                pathname === link.href
                  ? "text-foreground"
                  : "text-foreground/60"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center justify-end space-x-4">
          {user ? (
            <div className="flex items-center gap-4">
              <div className="hidden md:block text-sm text-muted-foreground">
                {user.email}
              </div>
              <Avatar>
                <AvatarImage
                  src={user.user_metadata?.avatar_url}
                  alt={user.email || "User"}
                />
                <AvatarFallback>
                  {user.email?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <Button variant="outline" size="sm" onClick={() => signOut()}>
                Sign Out
              </Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href="/auth/login">Sign In</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/auth/register">Sign Up</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
