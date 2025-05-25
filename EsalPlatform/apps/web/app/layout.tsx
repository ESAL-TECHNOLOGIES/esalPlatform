import type { Metadata } from "next";
import localFont from "next/font/local";
import Image from "next/image";
import "./globals.css";
import { AuthProvider } from "../lib/auth-context";
import { Navigation } from "../components/navigation";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "ESAL Platform",
  description: "Connect organizations with volunteers and resources",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-background text-foreground h-full flex flex-col`}
        suppressHydrationWarning
      >
        <AuthProvider>
          <Navigation />
          <main className="flex-1">{children}</main>
          <footer className="border-t py-6">
            <div className="container flex flex-col md:flex-row items-center justify-between gap-4 max-w-screen-2xl">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  © {new Date().getFullYear()} ESAL Platform. All rights
                  reserved.
                </span>
              </div>
              <nav className="flex gap-6 text-sm">
                <a
                  href="#"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Privacy Policy
                </a>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Terms of Service
                </a>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Contact Us
                </a>
              </nav>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
