import React, { useState } from "react";
import { Button } from "@esal/ui";

interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  message: string;
}

const LandingPage: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Contact form state
  const [contactForm, setContactForm] = useState<ContactFormData>({
    firstName: "",
    lastName: "",
    email: "",
    role: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [formErrors, setFormErrors] = useState<Partial<ContactFormData>>({});

  const handleJoinAs = (role: string) => {
    // Redirect to appropriate portal's auth/signup flow
    const portals = {
      innovator: "http://localhost:3001/login",
      investor: "http://localhost:3002/login",
      hub: "http://localhost:3003/login",
    };

    const url = portals[role as keyof typeof portals];
    if (url) {
      window.location.href = url;
    }
  };
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setMobileMenuOpen(false);
  };

  // Contact form handlers
  const validateForm = (): boolean => {
    const errors: Partial<ContactFormData> = {};

    if (!contactForm.firstName.trim()) {
      errors.firstName = "First name is required";
    }

    if (!contactForm.lastName.trim()) {
      errors.lastName = "Last name is required";
    }

    if (!contactForm.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(contactForm.email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!contactForm.role || contactForm.role === "Select your role") {
      errors.role = "Please select your role";
    }

    if (!contactForm.message.trim()) {
      errors.message = "Message is required";
    } else if (contactForm.message.trim().length < 10) {
      errors.message = "Message must be at least 10 characters long";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setContactForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear specific field error when user starts typing
    if (formErrors[name as keyof ContactFormData]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage(null);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
      const response = await fetch(`${apiUrl}/api/v1/contact/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(contactForm),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to send message");
      }

      setSubmitMessage({
        type: "success",
        text: "Thank you for your message! We'll get back to you soon.",
      });

      // Reset form on success
      setContactForm({
        firstName: "",
        lastName: "",
        email: "",
        role: "",
        message: "",
      });
      setFormErrors({});
    } catch (error) {
      console.error("Contact form submission error:", error);
      setSubmitMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Failed to send message. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      {" "}
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-lg shadow-lg z-50 border-b border-gradient-to-r from-purple-200/50 via-blue-200/50 to-indigo-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {" "}
            <div className="flex items-center group">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 rounded-lg flex items-center justify-center mr-2 sm:mr-3 shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300">
                <span className="text-white font-bold text-sm sm:text-lg">
                  E
                </span>
              </div>
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent group-hover:from-purple-500 group-hover:via-blue-500 group-hover:to-indigo-500 transition-all duration-300">
                ESAL Platform
              </h1>
            </div>{" "}
            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              <button
                onClick={() => scrollToSection("features")}
                className="relative text-gray-700 hover:bg-gradient-to-r hover:from-purple-600 hover:to-blue-600 hover:bg-clip-text hover:text-transparent transition-all duration-300 font-medium px-3 py-2 rounded-lg hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 hover:shadow-md"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection("how-it-works")}
                className="relative text-gray-700 hover:bg-gradient-to-r hover:from-blue-600 hover:to-indigo-600 hover:bg-clip-text hover:text-transparent transition-all duration-300 font-medium px-3 py-2 rounded-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:shadow-md"
              >
                How It Works
              </button>
              <button
                onClick={() => scrollToSection("contact")}
                className="relative text-gray-700 hover:bg-gradient-to-r hover:from-purple-600 hover:via-pink-600 hover:to-violet-600 hover:bg-clip-text hover:text-transparent transition-all duration-300 font-medium px-3 py-2 rounded-lg hover:bg-gradient-to-r hover:from-purple-50 hover:to-violet-50 hover:shadow-md"
              >
                Contact
              </button>
            </nav>
            {/* Mobile menu button */}
            <div className="md:hidden">
              {" "}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-gray-600 hover:text-purple-600 p-2 rounded-lg hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 transition-all duration-300"
                aria-label="Toggle mobile menu"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {mobileMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>{" "}
          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gradient-to-r from-purple-200/50 via-blue-200/50 to-indigo-200/50 bg-white/90 backdrop-blur-sm">
              <div className="flex flex-col space-y-3">
                <button
                  onClick={() => scrollToSection("features")}
                  className="text-gray-700 hover:bg-gradient-to-r hover:from-purple-600 hover:to-blue-600 hover:bg-clip-text hover:text-transparent transition-all duration-300 font-medium text-left py-3 px-4 rounded-lg hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 hover:shadow-md"
                >
                  Features
                </button>
                <button
                  onClick={() => scrollToSection("how-it-works")}
                  className="text-gray-700 hover:bg-gradient-to-r hover:from-blue-600 hover:to-indigo-600 hover:bg-clip-text hover:text-transparent transition-all duration-300 font-medium text-left py-3 px-4 rounded-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:shadow-md"
                >
                  How It Works
                </button>
                <button
                  onClick={() => scrollToSection("contact")}
                  className="text-gray-700 hover:bg-gradient-to-r hover:from-purple-600 hover:via-pink-600 hover:to-violet-600 hover:bg-clip-text hover:text-transparent transition-all duration-300 font-medium text-left py-3 px-4 rounded-lg hover:bg-gradient-to-r hover:from-purple-50 hover:to-violet-50 hover:shadow-md"
                >
                  Contact
                </button>
              </div>
            </div>
          )}
        </div>
      </header>{" "}
      <main>
        {" "}
        {/* Hero Section */}
        <section className="pt-20 sm:pt-24 pb-12 sm:pb-16 bg-gradient-to-br from-purple-100 via-blue-50 to-indigo-100 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-blue-600/10 to-indigo-600/10"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="max-w-4xl mx-auto">
                {" "}
                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight px-2">
                  Connecting Innovation
                  <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    {" "}
                    Ecosystem
                  </span>
                </h2>
                <p className="mt-4 sm:mt-6 text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed px-4">
                  Join the premier platform connecting startups, investors, and
                  innovation hubs. Build the future together with AI-powered
                  matching and comprehensive support.
                </p>
                <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
                  <Button
                    onClick={() => scrollToSection("join-section")}
                    size="lg"
                    className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg"
                  >
                    Get Started Now
                  </Button>
                  <Button
                    onClick={() => scrollToSection("how-it-works")}
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg"
                  >
                    Learn More
                  </Button>
                </div>
              </div>
              {/* Stats Section */}
              <div className="mt-12 sm:mt-16 lg:mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 max-w-4xl mx-auto px-4">
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-blue-600">
                    500+
                  </div>
                  <div className="text-gray-600 mt-1 text-sm sm:text-base">
                    Startups
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-green-600">
                    200+
                  </div>
                  <div className="text-gray-600 mt-1 text-sm sm:text-base">
                    Investors
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-purple-600">
                    50+
                  </div>
                  <div className="text-gray-600 mt-1 text-sm sm:text-base">
                    Innovation Hubs
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-orange-600">
                    $50M+
                  </div>
                  <div className="text-gray-600 mt-1 text-sm sm:text-base">
                    Funding Raised
                  </div>
                </div>
              </div>{" "}
            </div>
          </div>
        </section>{" "}
        {/* How It Works Section */}
        <section
          id="how-it-works"
          className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 sm:mb-16">
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 px-4">
                How It Works
              </h3>
              <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto px-4">
                Our platform simplifies the innovation ecosystem by connecting
                the right people at the right time
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
              {" "}
              {/* Step 1 */}
              <div className="text-center px-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-purple-200 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg">
                  <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    1
                  </span>
                </div>
                <h4 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">
                  Join Your Role
                </h4>
                <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                  Sign up as an Innovator with startup ideas, an Investor
                  looking for opportunities, or a Hub/Accelerator supporting the
                  ecosystem.
                </p>
              </div>
              {/* Step 2 */}
              <div className="text-center px-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-blue-200 to-indigo-200 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg">
                  <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    2
                  </span>
                </div>
                <h4 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">
                  AI-Powered Matching
                </h4>
                <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                  Our advanced AI analyzes your profile, preferences, and goals
                  to find the perfect matches in the innovation ecosystem.
                </p>
              </div>
              {/* Step 3 */}
              <div className="text-center px-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-indigo-200 to-purple-200 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg">
                  <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    3
                  </span>
                </div>
                <h4 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">
                  Connect & Grow
                </h4>
                <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                  Start meaningful conversations, build relationships, and grow
                  your startup or investment portfolio with our comprehensive
                  tools.
                </p>
              </div>
            </div>

            {/* Process Flow */}
            <div className="mt-12 sm:mt-16 bg-white rounded-2xl p-6 sm:p-8 shadow-lg mx-4 sm:mx-0">
              <h4 className="text-xl sm:text-2xl font-bold text-center text-gray-900 mb-6 sm:mb-8">
                The Complete Journey
              </h4>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-4 sm:gap-8 items-center">
                <div className="text-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                    <svg
                      className="w-5 h-5 sm:w-6 sm:h-6 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                    </svg>
                  </div>
                  <p className="text-xs sm:text-sm font-medium text-gray-900">
                    Create Profile
                  </p>
                </div>

                <div className="hidden md:block text-center">
                  <svg
                    className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 mx-auto"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>

                <div className="text-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                    <svg
                      className="w-5 h-5 sm:w-6 sm:h-6 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                    </svg>
                  </div>
                  <p className="text-xs sm:text-sm font-medium text-gray-900">
                    AI Matching
                  </p>
                </div>

                <div className="hidden md:block text-center">
                  <svg
                    className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 mx-auto"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>

                <div className="text-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                    <svg
                      className="w-5 h-5 sm:w-6 sm:h-6 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                    </svg>
                  </div>
                  <p className="text-xs sm:text-sm font-medium text-gray-900">
                    Success
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>{" "}
        {/* CTA Section */}
        <section
          id="join-section"
          className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 sm:mb-16">
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 px-4">
                Choose Your{" "}
                <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Path
                </span>
              </h3>
              <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto px-4">
                Join the innovation ecosystem that's right for you. Each path
                offers unique tools, connections, and opportunities tailored to
                your goals.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
              {/* Innovator Card */}
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl p-6 sm:p-8 text-center border border-purple-200 hover:shadow-2xl hover:scale-105 transition-all duration-300 group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-100/30 to-blue-100/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <svg
                      className="w-8 h-8 sm:w-10 sm:h-10 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                      />
                    </svg>
                  </div>
                  <h4 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-blue-600 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                    Innovator
                  </h4>
                  <p className="text-gray-600 mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base">
                    Turn your ideas into reality. Get AI-powered guidance,
                    connect with investors, and access comprehensive startup
                    resources.
                  </p>
                  <div className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
                    <div className="flex items-center justify-center text-xs sm:text-sm text-gray-600">
                      <svg
                        className="w-3 h-3 sm:w-4 sm:h-4 text-purple-500 mr-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      AI-powered investor matching
                    </div>
                    <div className="flex items-center justify-center text-xs sm:text-sm text-gray-600">
                      <svg
                        className="w-3 h-3 sm:w-4 sm:h-4 text-purple-500 mr-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Pitch deck builder & templates
                    </div>
                    <div className="flex items-center justify-center text-xs sm:text-sm text-gray-600">
                      <svg
                        className="w-3 h-3 sm:w-4 sm:h-4 text-purple-500 mr-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Community support & mentorship
                    </div>
                  </div>
                  <Button
                    onClick={() => handleJoinAs("innovator")}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-2 sm:py-3 px-4 sm:px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-sm sm:text-base"
                  >
                    Join as Innovator
                  </Button>
                </div>
              </div>{" "}
              {/* Investor Card */}
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl p-6 sm:p-8 text-center border border-blue-200 hover:shadow-2xl hover:scale-105 transition-all duration-300 group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-100/30 to-indigo-100/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <svg
                      className="w-8 h-8 sm:w-10 sm:h-10 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h4 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-indigo-600 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                    Investor
                  </h4>
                  <p className="text-gray-600 mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base">
                    Discover vetted startups, use AI matching to find perfect
                    opportunities, and manage your investment portfolio with
                    precision.
                  </p>
                  <div className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
                    <div className="flex items-center justify-center text-xs sm:text-sm text-gray-600">
                      <svg
                        className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500 mr-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      AI-curated startup deal flow
                    </div>
                    <div className="flex items-center justify-center text-xs sm:text-sm text-gray-600">
                      <svg
                        className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500 mr-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Advanced due diligence tools
                    </div>
                    <div className="flex items-center justify-center text-xs sm:text-sm text-gray-600">
                      <svg
                        className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500 mr-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Portfolio management dashboard
                    </div>
                  </div>
                  <Button
                    onClick={() => handleJoinAs("investor")}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-2 sm:py-3 px-4 sm:px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-sm sm:text-base"
                  >
                    Join as Investor
                  </Button>
                </div>
              </div>
              {/* Hub Card */}
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl p-6 sm:p-8 text-center border border-indigo-200 hover:shadow-2xl hover:scale-105 transition-all duration-300 group relative overflow-hidden md:col-span-2 lg:col-span-1">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-100/30 to-purple-100/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <svg
                      className="w-8 h-8 sm:w-10 sm:h-10 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                  </div>
                  <h4 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 group-hover:bg-gradient-to-r group-hover:from-indigo-600 group-hover:to-purple-600 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                    Hub/Accelerator
                  </h4>
                  <p className="text-gray-600 mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base">
                    Manage your startup ecosystem, organize impactful events,
                    and facilitate meaningful connections between innovators and
                    investors.
                  </p>
                  <div className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
                    <div className="flex items-center justify-center text-xs sm:text-sm text-gray-600">
                      <svg
                        className="w-3 h-3 sm:w-4 sm:h-4 text-indigo-500 mr-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Multi-cohort management
                    </div>
                    <div className="flex items-center justify-center text-xs sm:text-sm text-gray-600">
                      <svg
                        className="w-3 h-3 sm:w-4 sm:h-4 text-indigo-500 mr-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Event & demo day organization
                    </div>
                    <div className="flex items-center justify-center text-xs sm:text-sm text-gray-600">
                      <svg
                        className="w-3 h-3 sm:w-4 sm:h-4 text-indigo-500 mr-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Investor network facilitation
                    </div>
                  </div>
                  <Button
                    onClick={() => handleJoinAs("hub")}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-2 sm:py-3 px-4 sm:px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-sm sm:text-base"
                  >
                    Join as Hub
                  </Button>
                </div>
              </div>
            </div>

            {/* Call to Action */}
            <div className="mt-16 text-center">
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl p-8 max-w-4xl mx-auto border border-blue-200">
                <h4 className="text-2xl font-bold text-gray-900 mb-4">
                  Ready to{" "}
                  <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Get Started?
                  </span>
                </h4>
                <p className="text-gray-600 mb-6 text-lg">
                  Join thousands of innovators, investors, and hubs already
                  transforming the future of innovation.
                </p>{" "}
                <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
                  <Button
                    onClick={() => scrollToSection("contact")}
                    className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 hover:from-purple-700 hover:via-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Start Free Trial
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>{" "}
        {/* Features Section */}
        <section
          id="features"
          className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 sm:mb-16">
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 px-4">
                Platform{" "}
                <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Features
                </span>
              </h3>
              <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto px-4">
                Discover the powerful tools and capabilities that make our
                platform the premier choice for innovation ecosystems
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {" "}
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg p-6 sm:p-8 text-center border border-purple-200 hover:shadow-xl transition-all duration-300 group">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                  <svg
                    className="w-6 h-6 sm:w-8 sm:h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-blue-600 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                  AI-Powered Matching
                </h4>
                <p className="text-gray-600 text-sm sm:text-base">
                  Smart algorithms connect the right people at the right time
                  for optimal outcomes
                </p>
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg p-6 sm:p-8 text-center border border-blue-200 hover:shadow-xl transition-all duration-300 group">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                  <svg
                    className="w-6 h-6 sm:w-8 sm:h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-indigo-600 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                  Vetted Opportunities
                </h4>
                <p className="text-gray-600 text-sm sm:text-base">
                  Quality-assured startups and investment opportunities with
                  thorough validation
                </p>
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg p-6 sm:p-8 text-center border border-indigo-200 hover:shadow-xl transition-all duration-300 group">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                  <svg
                    className="w-6 h-6 sm:w-8 sm:h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 group-hover:bg-gradient-to-r group-hover:from-indigo-600 group-hover:to-purple-600 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                  Community Network
                </h4>
                <p className="text-gray-600 text-sm sm:text-base">
                  Join a thriving ecosystem of innovation with global reach and
                  local impact
                </p>
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg p-6 sm:p-8 text-center border border-violet-200 hover:shadow-xl transition-all duration-300 group">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-violet-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                  <svg
                    className="w-6 h-6 sm:w-8 sm:h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 group-hover:bg-gradient-to-r group-hover:from-violet-600 group-hover:to-pink-600 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                  Analytics & Insights
                </h4>
                <p className="text-gray-600 text-sm sm:text-base">
                  Data-driven decisions for better outcomes with comprehensive
                  reporting
                </p>
              </div>
            </div>
          </div>
        </section>{" "}
        {/* Contact Section */}
        <section
          id="contact"
          className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 sm:mb-16">
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 px-4">
                Get in{" "}
                <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Touch
                </span>
              </h3>
              <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto px-4">
                Ready to transform your innovation journey? We're here to help
                you get started with our comprehensive platform.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 max-w-6xl mx-auto">
              {" "}
              {/* Contact Form */}
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl p-6 sm:p-8 border border-purple-200">
                <h4 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
                  Send us a{" "}
                  <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    message
                  </span>
                </h4>{" "}
                <form
                  onSubmit={handleSubmit}
                  className="space-y-4 sm:space-y-6"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={contactForm.firstName}
                        onChange={handleInputChange}
                        className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-sm sm:text-base ${
                          formErrors.firstName
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        placeholder="John"
                        disabled={isSubmitting}
                      />
                      {formErrors.firstName && (
                        <p className="text-red-500 text-xs mt-1">
                          {formErrors.firstName}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={contactForm.lastName}
                        onChange={handleInputChange}
                        className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-sm sm:text-base ${
                          formErrors.lastName
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        placeholder="Doe"
                        disabled={isSubmitting}
                      />
                      {formErrors.lastName && (
                        <p className="text-red-500 text-xs mt-1">
                          {formErrors.lastName}
                        </p>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={contactForm.email}
                      onChange={handleInputChange}
                      className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-sm sm:text-base ${
                        formErrors.email ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="john@example.com"
                      disabled={isSubmitting}
                    />
                    {formErrors.email && (
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors.email}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Role
                    </label>
                    <select
                      name="role"
                      value={contactForm.role}
                      onChange={handleInputChange}
                      className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 text-sm sm:text-base ${
                        formErrors.role ? "border-red-500" : "border-gray-300"
                      }`}
                      aria-label="Select your role"
                      disabled={isSubmitting}
                    >
                      <option value="">Select your role</option>
                      <option value="Innovator/Entrepreneur">
                        Innovator/Entrepreneur
                      </option>
                      <option value="Investor">Investor</option>
                      <option value="Innovation Hub/Accelerator">
                        Innovation Hub/Accelerator
                      </option>
                      <option value="Other">Other</option>
                    </select>
                    {formErrors.role && (
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors.role}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message
                    </label>
                    <textarea
                      rows={4}
                      name="message"
                      value={contactForm.message}
                      onChange={handleInputChange}
                      className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-sm sm:text-base ${
                        formErrors.message
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="Tell us about your needs..."
                      disabled={isSubmitting}
                    />
                    {formErrors.message && (
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors.message}
                      </p>
                    )}
                  </div>
                  {/* Submit Message Display */}
                  {submitMessage && (
                    <div
                      className={`p-4 rounded-lg text-sm ${
                        submitMessage.type === "success"
                          ? "bg-green-50 text-green-700 border border-green-200"
                          : "bg-red-50 text-red-700 border border-red-200"
                      }`}
                    >
                      {submitMessage.text}
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 hover:from-purple-700 hover:via-blue-700 hover:to-indigo-700 text-white font-semibold py-3 sm:py-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center">
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Sending...
                      </span>
                    ) : (
                      "Send Message"
                    )}
                  </Button>
                </form>
              </div>
              {/* Contact Information */}
              <div className="space-y-8">
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-blue-200">
                  <h4 className="text-2xl font-bold text-gray-900 mb-6">
                    Contact{" "}
                    <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      Information
                    </span>
                  </h4>
                  <div className="space-y-6">
                    <div className="flex items-start">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center mr-4">
                        <svg
                          className="w-6 h-6 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                      </div>{" "}
                      <div>
                        <h5 className="font-semibold text-gray-900">Email</h5>
                        <p className="text-gray-600">
                          esalventuresltd@gmail.com
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mr-4">
                        <svg
                          className="w-6 h-6 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                          />
                        </svg>
                      </div>{" "}
                      <div>
                        <h5 className="font-semibold text-gray-900">Phone</h5>
                        <p className="text-gray-600">+254719156232</p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center mr-4">
                        <svg
                          className="w-6 h-6 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                      </div>{" "}
                      <div>
                        <h5 className="font-semibold text-gray-900">Office</h5>
                        <p className="text-gray-600">Nairobi, Kenya</p>
                      </div>
                    </div>
                  </div>
                </div>
                {/* FAQ Section */}
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-indigo-200">
                  <h4 className="text-xl font-bold text-gray-900 mb-6">
                    Frequently Asked{" "}
                    <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      Questions
                    </span>
                  </h4>
                  <div className="space-y-6">
                    <div className="border-l-4 border-purple-500 pl-4">
                      <h5 className="font-semibold text-gray-900 mb-2">
                        How does the AI matching work?
                      </h5>
                      <p className="text-gray-600 text-sm">
                        Our AI analyzes your profile, preferences, and goals to
                        find the most compatible matches in the ecosystem.
                      </p>
                    </div>
                    <div className="border-l-4 border-blue-500 pl-4">
                      <h5 className="font-semibold text-gray-900 mb-2">
                        Is there a free trial?
                      </h5>
                      <p className="text-gray-600 text-sm">
                        Yes! Our Starter plan is completely free, and
                        Professional plans come with a 14-day free trial.
                      </p>
                    </div>
                    <div className="border-l-4 border-indigo-500 pl-4">
                      <h5 className="font-semibold text-gray-900 mb-2">
                        How secure is my data?
                      </h5>
                      <p className="text-gray-600 text-sm">
                        We use enterprise-grade security and encryption to
                        protect all user data and communications.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>{" "}
      {/* Footer */}
      <footer className="bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 text-white py-8 sm:py-12 mt-16 sm:mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
              ESAL Platform
            </h3>
            <p className="text-gray-300 mb-6 sm:mb-8 text-sm sm:text-base">
              Connecting Innovation Ecosystem
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <a
                href="#"
                className="text-gray-300 hover:text-blue-300 transition-colors text-sm sm:text-base"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="text-gray-300 hover:text-purple-300 transition-colors text-sm sm:text-base"
              >
                Terms of Service
              </a>
              <a
                href="#"
                className="text-gray-300 hover:text-indigo-300 transition-colors text-sm sm:text-base"
              >
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
