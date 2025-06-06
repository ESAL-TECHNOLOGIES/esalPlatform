# Portal-Specific UI Documentation

This document provides detailed UI guidelines and component documentation for each portal in the ESAL Platform.

## Table of Contents

- [Overview](#overview)
- [Hub Portal](#hub-portal)
- [Innovator Portal](#innovator-portal)
- [Investor Portal](#investor-portal)
- [Admin Portal](#admin-portal)
- [Landing Page](#landing-page)
- [Shared Components](#shared-components)
- [Portal Theming](#portal-theming)
- [Responsive Design](#responsive-design)

## Overview

Each portal in the ESAL Platform is designed with specific user needs and workflows in mind. While sharing common design principles and components, each portal has unique features and layouts optimized for its target audience.

### Design Principles

- **User-Centric Design**: Each portal optimized for specific user workflows
- **Consistency**: Shared design system across all portals
- **Accessibility**: WCAG 2.1 AA compliance
- **Performance**: Fast loading and responsive interactions
- **Mobile-First**: Responsive design for all screen sizes

## Hub Portal

The Hub Portal serves as the main dashboard and central hub for all users.

### Key Features

- **Universal Dashboard**: Works for all user types
- **Role-Based Content**: Dynamic content based on user role
- **Quick Actions**: Fast access to common tasks
- **Activity Feed**: Recent platform activity
- **Navigation Hub**: Gateway to specialized portals

### Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│ Header (Navigation + User Menu)                        │
├─────────────────────────────────────────────────────────┤
│ ┌─────────────┐ ┌─────────────────────────────────────┐ │
│ │  Sidebar    │ │         Main Content                │ │
│ │             │ │                                     │ │
│ │ - Dashboard │ │ ┌─────────────┐ ┌─────────────────┐ │ │
│ │ - Ideas     │ │ │ Quick Stats │ │ Recent Activity │ │ │
│ │ - Invest    │ │ └─────────────┘ └─────────────────┘ │ │
│ │ - Events    │ │                                     │ │
│ │ - Profile   │ │ ┌─────────────────────────────────┐ │ │
│ │             │ │ │        Main Content Area        │ │ │
│ │             │ │ │                                 │ │ │
│ │             │ │ └─────────────────────────────────┘ │ │
│ └─────────────┘ └─────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### Components

#### Dashboard Cards
```typescript
interface DashboardCard {
  title: string;
  value: string | number;
  trend?: 'up' | 'down' | 'neutral';
  icon: IconComponent;
  color: 'primary' | 'secondary' | 'success' | 'warning';
}

// Usage
<DashboardCard
  title="Active Ideas"
  value={42}
  trend="up"
  icon={IdeaIcon}
  color="primary"
/>
```

#### Activity Feed
```typescript
interface ActivityItem {
  id: string;
  type: 'idea_created' | 'investment_made' | 'event_registered';
  user: User;
  timestamp: Date;
  details: Record<string, any>;
}

// Component shows recent platform activity
<ActivityFeed items={recentActivity} />
```

#### Quick Actions
```typescript
interface QuickAction {
  label: string;
  icon: IconComponent;
  action: () => void;
  color: string;
  disabled?: boolean;
}

// Role-based quick actions
<QuickActions actions={getRoleBasedActions(userRole)} />
```

### Navigation

- **Sidebar Navigation**: Persistent navigation for main sections
- **Breadcrumbs**: Show current location in hierarchy
- **Quick Links**: Fast access to common tasks
- **Search**: Global search across platform content

## Innovator Portal

Specialized interface for innovators to manage their ideas and funding.

### Key Features

- **Idea Management**: Create, edit, and track ideas
- **Funding Progress**: Monitor investment status
- **Investor Communication**: Connect with potential investors
- **Resource Library**: Access to innovation resources
- **Analytics**: Track idea performance metrics

### Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│ Header (Innovator Branding + Notifications)            │
├─────────────────────────────────────────────────────────┤
│ ┌─────────────┐ ┌─────────────────────────────────────┐ │
│ │ Quick Menu  │ │         Idea Workspace              │ │
│ │             │ │                                     │ │
│ │ - My Ideas  │ │ ┌─────────────┐ ┌─────────────────┐ │ │
│ │ - Funding   │ │ │ Idea Status │ │ Funding Status  │ │ │
│ │ - Messages  │ │ └─────────────┘ └─────────────────┘ │ │
│ │ - Resources │ │                                     │ │ │
│ │ - Analytics │ │ ┌─────────────────────────────────┐ │ │
│ │             │ │ │      Idea Details/Editor        │ │ │
│ │             │ │ │                                 │ │ │
│ │             │ │ └─────────────────────────────────┘ │ │
│ └─────────────┘ └─────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### Specialized Components

#### Idea Card
```typescript
interface IdeaCardProps {
  idea: Idea;
  showActions?: boolean;
  variant: 'list' | 'grid' | 'detailed';
}

// Displays idea with funding progress, stage, and actions
<IdeaCard 
  idea={userIdea} 
  variant="detailed" 
  showActions={true}
/>
```

#### Funding Progress
```typescript
interface FundingProgressProps {
  current: number;
  goal: number;
  currency: string;
  investorCount: number;
}

// Visual funding progress with milestone indicators
<FundingProgress 
  current={25000} 
  goal={100000} 
  currency="USD"
  investorCount={12}
/>
```

#### Stage Tracker
```typescript
interface StageTrackerProps {
  stages: IdeaStage[];
  currentStage: string;
  onStageChange?: (stage: string) => void;
}

// Visual representation of idea development stages
<StageTracker 
  stages={ideaStages} 
  currentStage="development"
  onStageChange={handleStageChange}
/>
```

### Workflow Features

- **Idea Builder**: Step-by-step idea creation wizard
- **Pitch Deck Upload**: Support for presentation materials
- **Financial Projections**: Tools for creating funding proposals
- **Investor Matching**: Suggestions based on idea category
- **Progress Tracking**: Visual milestone and goal tracking

## Investor Portal

Designed for investors to discover, evaluate, and fund innovative ideas.

### Key Features

- **Idea Discovery**: Browse and search investment opportunities
- **Due Diligence**: Detailed idea analysis and documentation
- **Portfolio Management**: Track current investments
- **Communication Tools**: Connect with innovators
- **Investment Analytics**: Performance tracking and insights

### Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│ Header (Investor Branding + Portfolio Summary)         │
├─────────────────────────────────────────────────────────┤
│ ┌─────────────┐ ┌─────────────────────────────────────┐ │
│ │ Filters &   │ │      Investment Opportunities       │ │
│ │ Categories  │ │                                     │ │
│ │             │ │ ┌─────────┐ ┌─────────┐ ┌─────────┐ │ │
│ │ - Stage     │ │ │ Idea 1  │ │ Idea 2  │ │ Idea 3  │ │ │
│ │ - Industry  │ │ │ $50K    │ │ $25K    │ │ $75K    │ │ │
│ │ - Funding   │ │ └─────────┘ └─────────┘ └─────────┘ │ │
│ │ - Location  │ │                                     │ │ │
│ │ - Risk      │ │ ┌─────────┐ ┌─────────┐ ┌─────────┐ │ │
│ │             │ │ │ Idea 4  │ │ Idea 5  │ │ Idea 6  │ │ │
│ │ Portfolio   │ │ │ $30K    │ │ $60K    │ │ $40K    │ │ │
│ │ - Active    │ │ └─────────┘ └─────────┘ └─────────┘ │ │
│ │ - Pending   │ │                                     │ │ │
│ └─────────────┘ └─────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### Specialized Components

#### Investment Card
```typescript
interface InvestmentCardProps {
  idea: Idea;
  fundingGoal: number;
  currentFunding: number;
  riskLevel: 'low' | 'medium' | 'high';
  expectedROI: number;
}

// Displays investment opportunity with key metrics
<InvestmentCard 
  idea={opportunity}
  fundingGoal={100000}
  currentFunding={45000}
  riskLevel="medium"
  expectedROI={15}
/>
```

#### Portfolio Summary
```typescript
interface PortfolioSummaryProps {
  totalInvested: number;
  activeInvestments: number;
  portfolioValue: number;
  averageROI: number;
}

// Overview of investor's portfolio performance
<PortfolioSummary 
  totalInvested={250000}
  activeInvestments={8}
  portfolioValue={285000}
  averageROI={12.5}
/>
```

#### Due Diligence Panel
```typescript
interface DueDiligenceProps {
  idea: Idea;
  documents: Document[];
  financials: FinancialData;
  teamInfo: TeamMember[];
}

// Comprehensive idea analysis interface
<DueDiligencePanel 
  idea={selectedIdea}
  documents={relatedDocs}
  financials={financialProjections}
  teamInfo={innovatorTeam}
/>
```

### Investment Features

- **Advanced Filtering**: Multi-criteria opportunity filtering
- **Risk Assessment**: Automated risk scoring and analysis
- **Investment Calculator**: ROI projections and scenarios
- **Document Vault**: Secure access to due diligence materials
- **Communication Center**: Direct messaging with innovators

## Admin Portal

Administrative interface for platform management and oversight.

### Key Features

- **User Management**: Manage platform users and permissions
- **Content Moderation**: Review and approve ideas and content
- **Analytics Dashboard**: Platform usage and performance metrics
- **System Configuration**: Manage platform settings and features
- **Financial Oversight**: Monitor transactions and payments

### Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│ Header (Admin Controls + System Status)                │
├─────────────────────────────────────────────────────────┤
│ ┌─────────────┐ ┌─────────────────────────────────────┐ │
│ │ Admin Menu  │ │        Management Interface         │ │
│ │             │ │                                     │ │
│ │ - Users     │ │ ┌─────────────┐ ┌─────────────────┐ │ │
│ │ - Ideas     │ │ │ System      │ │ Recent Actions  │ │ │
│ │ - Payments  │ │ │ Overview    │ │                 │ │ │
│ │ - Reports   │ │ └─────────────┘ └─────────────────┘ │ │
│ │ - Settings  │ │                                     │ │ │
│ │ - Logs      │ │ ┌─────────────────────────────────┐ │ │
│ │             │ │ │      Data Tables/Forms          │ │ │
│ │ System      │ │ │                                 │ │ │
│ │ - Health    │ │ └─────────────────────────────────┘ │ │
│ │ - Backup    │ │                                     │ │ │
│ └─────────────┘ └─────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### Specialized Components

#### Admin Data Table
```typescript
interface AdminTableProps<T> {
  data: T[];
  columns: ColumnDefinition<T>[];
  actions: TableAction<T>[];
  filters?: FilterDefinition[];
  pagination?: boolean;
}

// Flexible data table for managing platform entities
<AdminTable 
  data={users}
  columns={userColumns}
  actions={userActions}
  filters={userFilters}
  pagination={true}
/>
```

#### System Health Monitor
```typescript
interface HealthMetrics {
  apiStatus: 'healthy' | 'degraded' | 'down';
  databaseStatus: 'healthy' | 'slow' | 'down';
  cacheStatus: 'healthy' | 'degraded' | 'down';
  activeUsers: number;
  errorRate: number;
}

// Real-time system health monitoring
<SystemHealthMonitor metrics={currentMetrics} />
```

#### Audit Log Viewer
```typescript
interface AuditLogProps {
  logs: AuditLogEntry[];
  filters: LogFilter[];
  onExport: () => void;
}

// View and filter platform audit logs
<AuditLogViewer 
  logs={auditLogs}
  filters={logFilters}
  onExport={exportLogs}
/>
```

### Administrative Features

- **Bulk Operations**: Mass user management and content moderation
- **Advanced Analytics**: Custom reports and data visualization
- **System Monitoring**: Real-time performance and health metrics
- **Backup Management**: Data backup and restore capabilities
- **Security Center**: Security monitoring and threat detection

## Landing Page

Public-facing marketing website to introduce the platform.

### Key Features

- **Hero Section**: Compelling value proposition
- **Feature Showcase**: Platform capabilities and benefits
- **Success Stories**: Case studies and testimonials
- **Call-to-Action**: Clear registration and onboarding
- **SEO Optimization**: Search engine visibility

### Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│ Header (Logo + Navigation + CTA)                       │
├─────────────────────────────────────────────────────────┤
│                     Hero Section                       │
│               (Value Proposition)                      │
├─────────────────────────────────────────────────────────┤
│                  Features Section                      │
│           (Platform Capabilities)                      │
├─────────────────────────────────────────────────────────┤
│                  How It Works                          │
│            (Process Explanation)                       │
├─────────────────────────────────────────────────────────┤
│               Success Stories                          │
│            (Testimonials & Cases)                      │
├─────────────────────────────────────────────────────────┤
│                 Call to Action                         │
│              (Registration Form)                       │
├─────────────────────────────────────────────────────────┤
│ Footer (Links + Contact + Legal)                       │
└─────────────────────────────────────────────────────────┘
```

### Marketing Components

#### Hero Banner
```typescript
interface HeroBannerProps {
  headline: string;
  subheading: string;
  ctaText: string;
  ctaAction: () => void;
  backgroundImage?: string;
}

// Eye-catching hero section with clear value proposition
<HeroBanner 
  headline="Transform Your Ideas Into Reality"
  subheading="Connect with investors and bring innovation to life"
  ctaText="Get Started"
  ctaAction={handleSignup}
/>
```

#### Feature Grid
```typescript
interface FeatureItem {
  icon: IconComponent;
  title: string;
  description: string;
  link?: string;
}

// Showcase platform features and benefits
<FeatureGrid features={platformFeatures} />
```

#### Testimonial Carousel
```typescript
interface Testimonial {
  quote: string;
  author: string;
  role: string;
  company?: string;
  avatar?: string;
}

// Social proof through user testimonials
<TestimonialCarousel testimonials={userTestimonials} />
```

## Shared Components

Common components used across all portals for consistency.

### Navigation Components

#### Header
```typescript
interface HeaderProps {
  variant: 'landing' | 'portal';
  user?: User;
  showSearch?: boolean;
  notifications?: Notification[];
}

// Consistent header across all portals
<Header 
  variant="portal"
  user={currentUser}
  showSearch={true}
  notifications={userNotifications}
/>
```

#### Sidebar
```typescript
interface SidebarProps {
  items: NavigationItem[];
  collapsed?: boolean;
  onToggle?: () => void;
  variant: 'hub' | 'innovator' | 'investor' | 'admin';
}

// Portal-specific navigation sidebar
<Sidebar 
  items={portalNavigation}
  collapsed={sidebarCollapsed}
  onToggle={toggleSidebar}
  variant="innovator"
/>
```

### Form Components

#### Form Builder
```typescript
interface FormField {
  name: string;
  type: 'text' | 'email' | 'password' | 'select' | 'textarea' | 'file';
  label: string;
  validation?: ValidationRule[];
  options?: SelectOption[];
}

// Dynamic form generation
<FormBuilder 
  fields={ideaFormFields}
  onSubmit={handleIdeaSubmit}
  initialValues={existingIdea}
/>
```

### Data Display Components

#### Data Table
```typescript
interface DataTableProps<T> {
  data: T[];
  columns: ColumnConfig<T>[];
  sortable?: boolean;
  filterable?: boolean;
  pagination?: PaginationConfig;
}

// Flexible data display table
<DataTable 
  data={ideas}
  columns={ideaColumns}
  sortable={true}
  pagination={{ pageSize: 10 }}
/>
```

#### Chart Components
```typescript
// Various chart types for data visualization
<LineChart data={fundingTrends} />
<BarChart data={categoryBreakdown} />
<PieChart data={portfolioDistribution} />
<AreaChart data={userGrowth} />
```

## Portal Theming

Each portal has a distinct visual identity while maintaining brand consistency.

### Color Schemes

```css
/* Hub Portal - Neutral and Professional */
--hub-primary: #3B82F6;      /* Blue */
--hub-secondary: #64748B;     /* Slate */
--hub-accent: #10B981;        /* Emerald */

/* Innovator Portal - Creative and Energetic */
--innovator-primary: #8B5CF6; /* Purple */
--innovator-secondary: #06B6D4; /* Cyan */
--innovator-accent: #F59E0B;   /* Amber */

/* Investor Portal - Trust and Stability */
--investor-primary: #059669;   /* Green */
--investor-secondary: #374151; /* Gray */
--investor-accent: #DC2626;    /* Red */

/* Admin Portal - Authority and Control */
--admin-primary: #DC2626;      /* Red */
--admin-secondary: #4B5563;    /* Gray */
--admin-accent: #7C3AED;       /* Violet */

/* Landing Page - Brand and Marketing */
--landing-primary: #1D4ED8;    /* Blue */
--landing-secondary: #059669;  /* Green */
--landing-accent: #F59E0B;     /* Amber */
```

### Typography

```css
/* Consistent typography scale */
--font-family-sans: 'Inter', system-ui, sans-serif;
--font-family-mono: 'JetBrains Mono', monospace;

/* Font sizes */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */
```

### Spacing and Layout

```css
/* Consistent spacing scale */
--space-1: 0.25rem;    /* 4px */
--space-2: 0.5rem;     /* 8px */
--space-3: 0.75rem;    /* 12px */
--space-4: 1rem;       /* 16px */
--space-6: 1.5rem;     /* 24px */
--space-8: 2rem;       /* 32px */
--space-12: 3rem;      /* 48px */
--space-16: 4rem;      /* 64px */

/* Layout dimensions */
--sidebar-width: 16rem;      /* 256px */
--header-height: 4rem;       /* 64px */
--content-max-width: 80rem;  /* 1280px */
```

## Responsive Design

All portals follow a mobile-first responsive design approach.

### Breakpoints

```css
/* Tailwind CSS breakpoints */
--breakpoint-sm: 640px;   /* Small devices */
--breakpoint-md: 768px;   /* Medium devices */
--breakpoint-lg: 1024px;  /* Large devices */
--breakpoint-xl: 1280px;  /* Extra large devices */
--breakpoint-2xl: 1536px; /* 2X large devices */
```

### Responsive Patterns

#### Navigation Adaptation
```typescript
// Responsive navigation pattern
const Navigation = () => {
  const [isMobile, setIsMobile] = useState(false);
  
  return (
    <>
      {isMobile ? (
        <MobileMenu items={navigationItems} />
      ) : (
        <DesktopSidebar items={navigationItems} />
      )}
    </>
  );
};
```

#### Grid Layouts
```css
/* Responsive grid patterns */
.dashboard-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: 1fr;
}

@media (min-width: 768px) {
  .dashboard-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .dashboard-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

#### Component Scaling
```typescript
// Responsive component sizing
const ResponsiveCard = ({ children }: { children: ReactNode }) => (
  <div className="
    p-4 md:p-6 lg:p-8 
    text-sm md:text-base lg:text-lg
    rounded-lg md:rounded-xl
    shadow-md md:shadow-lg
  ">
    {children}
  </div>
);
```

### Mobile Optimization

- **Touch-Friendly**: Minimum 44px touch targets
- **Gesture Support**: Swipe navigation and interactions
- **Performance**: Optimized for mobile network conditions
- **Progressive Enhancement**: Core functionality works without JavaScript

---

This portal-specific UI documentation provides detailed guidance for implementing consistent, user-friendly interfaces across all ESAL Platform portals. For implementation details, refer to the component source code and design system documentation.

*This portal UI guide is part of the ESAL Platform documentation.*
