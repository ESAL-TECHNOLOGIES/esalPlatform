import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Loader2, Zap, Brain, Sparkles } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatbotProps {
  apiUrl?: string;
}

const PlatformChatbot: React.FC<ChatbotProps> = ({ 
  apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000" 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hi! I'm the ESAL Platform assistant. I can help you understand how our platform works, including our AI matchmaking system, portal features, and how to get started. What would you like to know?",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateBotResponse = async (userMessage: string): Promise<string> => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Knowledge base about ESAL Platform
    const responses = {
      // Platform overview
      'what is esal platform': `ESAL Platform is a comprehensive entrepreneurship and innovation platform that connects innovators, investors, and entrepreneurship hubs in a unified ecosystem. 

🚀 **Key Features:**
• **Multi-Portal System**: Specialized interfaces for Innovators, Investors, Hubs, and Admins
• **AI-Powered Matching**: Advanced algorithms to connect startups with the right investors
• **Idea Development Tools**: AI-assisted pitch generation and improvement
• **Analytics & Insights**: Comprehensive tracking and performance metrics

ESAL stands for "Entidades Sin Ánimo de Lucro" (Non-profit Organizations) and serves the entire entrepreneurship ecosystem.`,

      // AI Matchmaking
      'ai matchmaking': `Our AI Matchmaking system uses Google Gemini AI to intelligently connect investors with startups:

🤖 **How It Works:**
• **Smart Analysis**: AI analyzes startup profiles including industry, stage, funding needs, and market potential
• **Investor Preferences**: Matches based on investment criteria, risk tolerance, and portfolio preferences  
• **Scoring Algorithm**: Provides match scores (0-100%) with detailed explanations
• **Real-time Processing**: Fast analysis of hundreds of startups in seconds

📊 **Matching Factors:**
• Industry alignment (30%)
• Development stage (25%) 
• Market opportunity (20%)
• Risk-return profile (15%)
• Geographic preferences (10%)

The AI provides fallback scoring when needed and explains why specific matches are recommended!`,

      'how does ai work': `Our AI system is powered by Google Gemini and provides several key services:

🧠 **AI Capabilities:**
• **Idea Generation**: Creates detailed startup ideas based on your interests and skills
• **Pitch Optimization**: Improves existing business ideas and pitches
• **Idea Evaluation**: Scores and provides feedback on startup concepts (0-10 scale)
• **Strategic Recommendations**: Offers personalized business development advice
• **Investor Matching**: Connects startups with compatible investors

⚡ **AI Features:**
• Natural language processing for better understanding
• Real-time analysis and feedback
• Confidence scoring for transparency
• Fallback systems for reliability
• Continuous learning from interactions`,

      // Platform portals
      'portals': `ESAL Platform has specialized portals for different user types:

🎯 **Innovator Portal** (Port 3001)
• Submit and manage startup ideas
• AI-powered idea generation and improvement
• Analytics and performance tracking
• Progress visualization

💰 **Investor Portal** (Port 3002)  
• Browse curated investment opportunities
• AI-powered startup matching
• Portfolio management tools
• Due diligence resources

🏢 **Hub Portal** (Port 3003)
• Manage startup cohorts and programs
• Event planning and coordination
• Member management system
• Resource allocation tools

🛠️ **Admin Portal** (Port 3004)
• Platform-wide management
• User administration
• Analytics and reporting
• System configuration

🌐 **Landing Page** (Port 3000)
• Public information and onboarding
• Portal selection and access
• Platform overview`,

      // Getting started
      'get started': `Here's how to get started with ESAL Platform:

1️⃣ **Choose Your Role:**
• **Innovator**: Submit ideas, get AI feedback, connect with investors
• **Investor**: Browse opportunities, use AI matching, manage portfolio  
• **Hub Manager**: Manage programs, coordinate events, track member progress
• **Admin**: Oversee platform operations and user management

2️⃣ **Access Your Portal:**
• Visit the main landing page
• Click "Join as [Your Role]"
• Complete registration
• Start exploring features

3️⃣ **Key First Steps:**
• **Innovators**: Submit your first idea, try AI generation
• **Investors**: Set preferences, run AI matching
• **Hubs**: Add programs, import member data
• **Admins**: Review system status, configure settings

Need help with anything specific? Just ask!`,

      // Technical details
      'technology': `ESAL Platform is built with modern, scalable technologies:

🏗️ **Architecture:**
• **Frontend**: React 18 + TypeScript + Vite for fast development
• **Backend**: FastAPI (Python) for high-performance APIs
• **Database**: Supabase (PostgreSQL) with real-time features
• **AI**: Google Gemini AI for intelligent features
• **Styling**: Tailwind CSS for modern, responsive design

🛡️ **Security:**
• JWT-based authentication
• Role-based access control
• Supabase integration for user management
• Input validation and SQL injection protection

⚡ **Performance:**
• Code splitting and lazy loading
• Optimized bundle sizes
• CDN distribution ready
• Real-time updates via WebSocket`,

      // Default responses
      'default': `I'm here to help you learn about the ESAL Platform! You can ask me about:

💡 **Platform Features:**
• What is ESAL Platform and how it works
• AI matchmaking and how it connects investors with startups
• Different portals (Innovator, Investor, Hub, Admin)
• Getting started and registration process

🤖 **AI Capabilities:**
• How our AI generates and improves startup ideas
• AI-powered investor matching algorithm
• Scoring and evaluation systems
• Technology stack and architecture

📚 **General Information:**
• Platform benefits and success stories
• Technical specifications
• Support and documentation

What would you like to know more about?`
    };

    // Check for specific topics
    if (lowerMessage.includes('what is esal') || lowerMessage.includes('esal platform')) {
      return responses['what is esal platform'];
    }
    if (lowerMessage.includes('ai match') || lowerMessage.includes('matchmaking')) {
      return responses['ai matchmaking'];
    }
    if (lowerMessage.includes('ai work') || lowerMessage.includes('how does ai')) {
      return responses['how does ai work'];
    }
    if (lowerMessage.includes('portal') || lowerMessage.includes('interface')) {
      return responses['portals'];
    }
    if (lowerMessage.includes('get started') || lowerMessage.includes('how to start') || lowerMessage.includes('begin')) {
      return responses['get started'];
    }
    if (lowerMessage.includes('technology') || lowerMessage.includes('tech stack') || lowerMessage.includes('architecture')) {
      return responses['technology'];
    }

    // Specific feature questions
    if (lowerMessage.includes('innovator')) {
      return `The **Innovator Portal** is designed for entrepreneurs and startup founders:

🚀 **Key Features:**
• **Idea Submission**: Upload and manage your startup concepts
• **AI Assistance**: Generate new ideas or improve existing ones using Gemini AI
• **Pitch Development**: Get AI feedback and scoring (0-10 scale)
• **Analytics Dashboard**: Track views, investor interest, and performance metrics
• **Progress Tracking**: Monitor your startup development journey

💡 **AI Tools for Innovators:**
• Idea generation based on your skills and interests
• Idea evaluation with detailed feedback
• Fine-tuning suggestions for specific aspects
• Strategic recommendations for growth

Ready to submit your first startup idea? Access the Innovator Portal to get started!`;
    }

    if (lowerMessage.includes('investor')) {
      return `The **Investor Portal** helps investors discover and evaluate opportunities:

💰 **Core Features:**
• **Smart Discovery**: Browse startups with advanced filtering
• **AI Matching**: Get personalized startup recommendations based on your preferences
• **Portfolio Management**: Track investments and performance
• **Due Diligence**: Access detailed startup information and analytics

🎯 **AI Matching Process:**
1. Set your investment preferences (industries, stages, funding range, risk tolerance)
2. AI analyzes all available startups against your criteria
3. Receive ranked matches with explanations and confidence scores
4. Express interest in promising opportunities

The AI considers industry alignment, development stage, market opportunity, and risk profile to find your perfect matches!`;
    }

    if (lowerMessage.includes('hub')) {
      return `The **Hub Portal** serves entrepreneurship hubs, accelerators, and incubators:

🏢 **Management Tools:**
• **Cohort Management**: Organize and track startup batches
• **Member Coordination**: Manage entrepreneurs, mentors, and staff
• **Event Planning**: Schedule and coordinate programs and events
• **Resource Allocation**: Track capacity and resource usage
• **Progress Monitoring**: Analyze startup development and success rates

📊 **Analytics Features:**
• Hub performance metrics
• Member engagement tracking
• Program effectiveness analysis
• Success rate monitoring

Perfect for accelerators, incubators, and innovation hubs looking to streamline operations!`;
    }

    if (lowerMessage.includes('admin')) {
      return `The **Admin Portal** provides comprehensive platform management:

🛠️ **Administrative Control:**
• **User Management**: Manage all platform users and roles
• **Portal Control**: Start, stop, and monitor all platform services
• **Analytics Dashboard**: Platform-wide usage and performance metrics
• **Content Moderation**: Review and approve user submissions
• **System Configuration**: Platform settings and feature toggles

📈 **Monitoring & Insights:**
• Real-time system health checks
• User engagement analytics
• Performance optimization tools
• Security audit logs

Designed for platform administrators who need complete oversight and control!`;
    }

    // Funding and business model questions
    if (lowerMessage.includes('funding') || lowerMessage.includes('investment') || lowerMessage.includes('money')) {
      return `ESAL Platform facilitates connections between startups seeking funding and investors:

💸 **For Startups:**
• Specify funding needs and stage in your profile
• Get matched with investors interested in your industry and stage
• Showcase traction, team, and market opportunity
• Receive feedback and interest from potential investors

🎯 **For Investors:**
• Set investment criteria (amount, stage, industry, risk tolerance)
• Use AI matching to find startups that fit your portfolio
• Filter by funding requirements and development stage
• Track opportunities and manage deal flow

The AI considers funding alignment as a key matching factor, ensuring startups are paired with investors who can meet their capital needs!`;
    }

    // Success and benefits
    if (lowerMessage.includes('benefit') || lowerMessage.includes('success') || lowerMessage.includes('why use')) {
      return `Here are the key benefits of using ESAL Platform:

🚀 **For Innovators:**
• AI-powered idea development and improvement
• Access to relevant investors through smart matching
• Professional pitch development tools
• Analytics to track progress and interest

💰 **For Investors:**
• Curated, high-quality startup opportunities
• AI-driven matching saves time and improves deal flow
• Comprehensive startup analytics and due diligence data
• Portfolio management and tracking tools

🏢 **For Hubs:**
• Streamlined program and cohort management
• Better tracking of member progress and outcomes
• Event coordination and resource optimization
• Data-driven insights for program improvement

🌟 **Platform-Wide Benefits:**
• Reduced friction in the entrepreneurship ecosystem
• Better quality matches between stakeholders
• AI assistance for better decision-making
• Centralized platform for all innovation activities`;
    }

    // Help and support
    if (lowerMessage.includes('help') || lowerMessage.includes('support') || lowerMessage.includes('problem')) {
      return `I'm here to help! Here are ways to get support:

🤖 **Chat with Me:**
Ask about platform features, AI capabilities, getting started, or any general questions

📚 **Documentation:**
• Comprehensive guides for each portal
• API documentation for developers
• Architecture and technical details
• Deployment and setup instructions

🚀 **Getting Started:**
• Choose your role and access the appropriate portal
• Follow the onboarding process
• Start with basic features and explore advanced tools
• Use AI assistance for guidance

❓ **Common Questions:**
• "How does AI matchmaking work?"
• "What portal should I use?"
• "How do I submit my startup idea?"
• "How do I find investors?"

What specific help do you need?`;
    }

    // Try Gemini AI for more complex questions
    try {
      const response = await fetch(`${apiUrl}/api/v1/chat/platform-assistant`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          context: 'platform_assistance'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.response || responses['default'];
      }
    } catch (error) {
      console.log('AI service unavailable, using fallback responses');
    }

    return responses['default'];
  };
  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const messageToSend = inputValue;
    setInputValue('');
    setIsLoading(true);

    try {
      const botResponse = await generateBotResponse(messageToSend);
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: botResponse,
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm sorry, I'm having trouble right now. Please try asking about ESAL Platform features, AI matchmaking, or how to get started!",
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickAction = (message: string) => {
    if (isLoading) return;
    setInputValue(message);
    // Auto-send the message after a short delay to show it was clicked
    setTimeout(() => {
      if (!isLoading) {
        handleSendMessage();
      }
    }, 100);
  };

  const formatMessage = (content: string) => {
    // Convert markdown-like formatting to HTML
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/•/g, '•')
      .replace(/\n/g, '<br />');
  };
  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white p-3 sm:p-4 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 z-50 group"
          aria-label="Open chat assistant"
        >
          <div className="relative">
            <Bot size={20} className="sm:w-6 sm:h-6" />
            <Sparkles size={12} className="absolute -top-1 -right-1 text-yellow-300 animate-pulse" />
          </div>
          <div className="absolute -top-12 right-0 bg-gray-800 text-white px-3 py-1 rounded-lg text-xs sm:text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none">
            Ask about ESAL Platform
          </div>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-[calc(100vw-2rem)] max-w-sm sm:w-96 h-[70vh] sm:h-[500px] bg-white rounded-lg shadow-2xl border border-gray-200 z-50 flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-3 sm:p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Bot size={18} className="sm:w-5 sm:h-5" />
                <Zap size={10} className="absolute -bottom-1 -right-1 text-yellow-300" />
              </div>
              <div>
                <span className="font-semibold text-sm sm:text-base">ESAL Assistant</span>
                <div className="flex items-center space-x-1 text-xs opacity-90">
                  <Brain size={12} />
                  <span>AI-Powered</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/20 p-1 rounded transition-colors"
              aria-label="Close chat"
            >
              <X size={18} className="sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-[80%] p-2 sm:p-3 rounded-lg ${
                    message.isUser
                      ? 'bg-blue-600 text-white rounded-br-sm'
                      : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                  }`}
                >
                  <div className="flex items-start space-x-2">
                    {!message.isUser && (
                      <div className="flex-shrink-0 mt-0.5">
                        <div className="relative">
                          <Bot size={14} className="sm:w-4 sm:h-4 text-purple-600" />
                          <Sparkles size={8} className="absolute -top-1 -right-1 text-blue-500" />
                        </div>
                      </div>
                    )}
                    <div 
                      className="text-xs sm:text-sm leading-relaxed flex-1"
                      dangerouslySetInnerHTML={{ 
                        __html: formatMessage(message.content) 
                      }}
                    />
                    {message.isUser && (
                      <div className="flex-shrink-0 mt-0.5">
                        <User size={14} className="sm:w-4 sm:h-4" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-800 p-2 sm:p-3 rounded-lg rounded-bl-sm">
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <Bot size={14} className="sm:w-4 sm:h-4 text-purple-600" />
                      <Brain size={8} className="absolute -top-1 -right-1 text-blue-500 animate-pulse" />
                    </div>
                    <Loader2 size={14} className="sm:w-4 sm:h-4 animate-spin text-purple-600" />
                    <span className="text-xs sm:text-sm text-gray-600">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 sm:p-4 border-t border-gray-200">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about ESAL Platform..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-xs sm:text-sm"
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-2 rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex-shrink-0"
                aria-label="Send message"
              >
                <Send size={14} className="sm:w-4 sm:h-4" />
              </button>
            </div>
              {/* Quick action buttons for mobile */}
            <div className="mt-2 sm:mt-3 flex flex-wrap gap-1 sm:gap-2">
              <button
                onClick={() => handleQuickAction("What is ESAL Platform?")}
                className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200 transition-colors"
                disabled={isLoading}
              >
                What is ESAL?
              </button>
              <button
                onClick={() => handleQuickAction("How does AI matchmaking work?")}
                className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
                disabled={isLoading}
              >
                AI Matching
              </button>
              <button
                onClick={() => handleQuickAction("How to get started?")}
                className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors"
                disabled={isLoading}
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PlatformChatbot;
