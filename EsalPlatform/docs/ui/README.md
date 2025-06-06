# ESAL Platform UI Documentation

The ESAL Platform features a modern, responsive user interface built with React, TypeScript, and Tailwind CSS. The UI is designed to provide an excellent user experience across all devices and portals.

## 🎨 Design System

### Color Palette
```css
/* Primary Colors */
--primary-50: #eff6ff;
--primary-100: #dbeafe; 
--primary-500: #3b82f6;
--primary-600: #2563eb;
--primary-700: #1d4ed8;

/* Secondary Colors */
--green-50: #f0fdf4;
--green-500: #22c55e;
--green-600: #16a34a;

/* Neutral Colors */
--gray-50: #f9fafb;
--gray-100: #f3f4f6;
--gray-500: #6b7280;
--gray-800: #1f2937;
--gray-900: #111827;

/* Status Colors */
--red-500: #ef4444;    /* Error */
--yellow-500: #eab308; /* Warning */
--emerald-500: #10b981; /* Success */
--blue-500: #3b82f6;   /* Info */
```

### Typography
```css
/* Font Families */
--font-sans: 'Inter', system-ui, sans-serif;
--font-mono: 'JetBrains Mono', monospace;

/* Font Sizes */
--text-xs: 0.75rem;     /* 12px */
--text-sm: 0.875rem;    /* 14px */
--text-base: 1rem;      /* 16px */
--text-lg: 1.125rem;    /* 18px */
--text-xl: 1.25rem;     /* 20px */
--text-2xl: 1.5rem;     /* 24px */
--text-3xl: 1.875rem;   /* 30px */
--text-4xl: 2.25rem;    /* 36px */
```

### Spacing Scale
```css
/* Spacing (using Tailwind scale) */
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-4: 1rem;      /* 16px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
```

## 🏗️ Component Architecture

### Core Components

#### Button Component
```typescript
// components/ui/Button.tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading,
  disabled,
  children,
  onClick
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors';
  
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50',
    ghost: 'text-gray-700 hover:bg-gray-100'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]}`}
      disabled={disabled || isLoading}
      onClick={onClick}
    >
      {isLoading && <Spinner className="mr-2" />}
      {children}
    </button>
  );
};
```

#### Card Component
```typescript
// components/ui/Card.tsx
interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  padding = 'md',
  shadow = 'md'
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg'
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${paddingClasses[padding]} ${shadowClasses[shadow]} ${className}`}>
      {children}
    </div>
  );
};
```

#### Input Component
```typescript
// components/ui/Input.tsx
interface InputProps {
  label?: string;
  type?: 'text' | 'email' | 'password' | 'number';
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  disabled,
  required
}) => {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        className={`
          w-full px-3 py-2 border rounded-lg text-sm
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          ${error ? 'border-red-300' : 'border-gray-300'}
          ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
        `}
      />
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};
```

### Layout Components

#### Header Component
```typescript
// components/layout/Header.tsx
interface HeaderProps {
  title: string;
  user?: User;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ title, user, onLogout }) => {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Logo className="h-8 w-8" />
          <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
        </div>
        
        {user && (
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              Welcome, {user.full_name}
            </div>
            <UserMenu user={user} onLogout={onLogout} />
          </div>
        )}
      </div>
    </header>
  );
};
```

#### Sidebar Component
```typescript
// components/layout/Sidebar.tsx
interface SidebarProps {
  items: SidebarItem[];
  activeItem?: string;
  onItemClick?: (item: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ items, activeItem, onItemClick }) => {
  return (
    <aside className="w-64 bg-gray-50 border-r border-gray-200 h-full">
      <nav className="p-4 space-y-2">
        {items.map((item) => (
          <SidebarItem
            key={item.id}
            item={item}
            isActive={activeItem === item.id}
            onClick={() => onItemClick?.(item.id)}
          />
        ))}
      </nav>
    </aside>
  );
};
```

## 📱 Portal-Specific UI

### Landing Page
- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS
- **Features**: Hero section, feature showcase, testimonials
- **Responsive**: Mobile-first design

```typescript
// Landing page structure
export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <TestimonialsSection />
      <CTASection />
    </>
  );
}
```

### Innovator Portal
- **Framework**: React + Vite
- **Key Components**: IdeaForm, ProgressTracker, InvestorMatches
- **Layout**: Dashboard with sidebar navigation

```typescript
// Innovator dashboard layout
export const InnovatorDashboard = () => {
  return (
    <DashboardLayout>
      <StatsCards />
      <IdeaSubmissionCard />
      <RecentMatches />
      <ProgressTimeline />
    </DashboardLayout>
  );
};
```

### Investor Portal
- **Framework**: React + Vite
- **Key Components**: DealFlow, Portfolio, StartupDetails
- **Layout**: Card-based grid layout

```typescript
// Investor dashboard layout
export const InvestorDashboard = () => {
  return (
    <DashboardLayout>
      <PortfolioStats />
      <RecentOpportunities />
      <PortfolioCompanies />
      <QuickActions />
    </DashboardLayout>
  );
};
```

### Hub Portal
- **Framework**: React + Vite
- **Key Components**: BatchManager, MentorNetwork, Analytics
- **Layout**: Tab-based interface

### Admin Portal
- **Framework**: React + Vite
- **Key Components**: UserManagement, SystemStats, ContentModeration
- **Layout**: Full-screen admin interface

## 🎯 Responsive Design

### Breakpoints
```css
/* Tailwind CSS Breakpoints */
sm: 640px   /* Small devices */
md: 768px   /* Medium devices (tablets) */
lg: 1024px  /* Large devices (desktops) */
xl: 1280px  /* Extra large devices */
2xl: 1536px /* 2X large devices */
```

### Mobile-First Approach
```typescript
// Example responsive component
const ResponsiveCard = () => {
  return (
    <div className="
      w-full p-4 
      sm:w-1/2 sm:p-6 
      md:w-1/3 
      lg:w-1/4 lg:p-8
    ">
      <Card>Content here</Card>
    </div>
  );
};
```

### Mobile Navigation
```typescript
// Mobile-friendly navigation
const MobileNav = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        className="md:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        <MenuIcon />
      </button>
      
      {isOpen && (
        <div className="fixed inset-0 bg-white z-50 md:hidden">
          <MobileMenu onClose={() => setIsOpen(false)} />
        </div>
      )}
    </>
  );
};
```

## 🎭 State Management

### React Context for Global State
```typescript
// contexts/AppContext.tsx
interface AppState {
  user: User | null;
  theme: 'light' | 'dark';
  notifications: Notification[];
}

const AppContext = createContext<AppState | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>({
    user: null,
    theme: 'light',
    notifications: []
  });

  return (
    <AppContext.Provider value={state}>
      {children}
    </AppContext.Provider>
  );
};
```

### Local State with Custom Hooks
```typescript
// hooks/useForm.ts
export const useForm = <T>(initialValues: T) => {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<T>>({});

  const setValue = (field: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (validationRules: ValidationRules<T>) => {
    const newErrors: Partial<T> = {};
    // Validation logic here
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return { values, errors, setValue, validate };
};
```

## 🔧 Performance Optimization

### Code Splitting
```typescript
// Lazy loading portal components
const InnovatorPortal = lazy(() => import('./portals/InnovatorPortal'));
const InvestorPortal = lazy(() => import('./portals/InvestorPortal'));

// Route-based splitting
const AppRouter = () => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/innovator/*" element={<InnovatorPortal />} />
        <Route path="/investor/*" element={<InvestorPortal />} />
      </Routes>
    </Suspense>
  );
};
```

### Image Optimization
```typescript
// Optimized image component
const OptimizedImage: React.FC<{
  src: string;
  alt: string;
  width?: number;
  height?: number;
}> = ({ src, alt, width, height }) => {
  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      loading="lazy"
      className="object-cover"
    />
  );
};
```

### Virtual Scrolling for Large Lists
```typescript
// Virtual scrolling for large datasets
import { FixedSizeList as List } from 'react-window';

const VirtualizedList = ({ items }: { items: any[] }) => {
  const Row = ({ index, style }: { index: number; style: any }) => (
    <div style={style}>
      <ListItem item={items[index]} />
    </div>
  );

  return (
    <List
      height={600}
      itemCount={items.length}
      itemSize={80}
      width="100%"
    >
      {Row}
    </List>
  );
};
```

## 🎨 Animation & Interactions

### Framer Motion Animations
```typescript
// Smooth page transitions
import { motion, AnimatePresence } from 'framer-motion';

const PageTransition = ({ children }: { children: React.ReactNode }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
};

// Card hover animations
const AnimatedCard = ({ children }: { children: React.ReactNode }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300 }}
      className="card"
    >
      {children}
    </motion.div>
  );
};
```

### Loading States
```typescript
// Skeleton loading components
const SkeletonCard = () => {
  return (
    <div className="animate-pulse">
      <div className="h-4 bg-gray-200 rounded mb-2"></div>
      <div className="h-3 bg-gray-200 rounded mb-2"></div>
      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
    </div>
  );
};

// Loading spinner
const LoadingSpinner = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  return (
    <div className={`animate-spin rounded-full border-2 border-blue-600 border-t-transparent ${sizes[size]}`} />
  );
};
```

## 🌙 Dark Mode Support

### Theme Provider
```typescript
// contexts/ThemeContext.tsx
const ThemeContext = createContext<{
  theme: 'light' | 'dark';
  toggleTheme: () => void;
} | null>(null);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  useEffect(() => {
    document.documentElement.className = theme;
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
```

### Dark Mode Classes
```css
/* Dark mode styles */
.dark {
  --bg-primary: #1f2937;
  --bg-secondary: #374151;
  --text-primary: #f9fafb;
  --text-secondary: #d1d5db;
}

/* Component with dark mode support */
.card {
  @apply bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100;
}
```

## 📱 Accessibility

### ARIA Labels and Roles
```typescript
// Accessible button
const AccessibleButton = ({ children, onClick, ariaLabel }: {
  children: React.ReactNode;
  onClick: () => void;
  ariaLabel?: string;
}) => {
  return (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      className="focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      {children}
    </button>
  );
};

// Accessible form
const AccessibleForm = () => {
  return (
    <form role="form" aria-labelledby="form-title">
      <h2 id="form-title">Contact Form</h2>
      <Input 
        label="Email"
        type="email"
        required
        aria-describedby="email-help"
      />
      <div id="email-help" className="text-sm text-gray-600">
        We'll never share your email address.
      </div>
    </form>
  );
};
```

### Keyboard Navigation
```typescript
// Keyboard-navigable component
const KeyboardNavigable = () => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      // Handle activation
    }
    if (e.key === 'Escape') {
      // Handle close/cancel
    }
  };

  return (
    <div
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className="focus:outline-none focus:ring-2"
    >
      Content here
    </div>
  );
};
```

## 🧪 UI Testing

### Component Testing with Testing Library
```typescript
// Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button Component', () => {
  test('renders button with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });

  test('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('shows loading state', () => {
    render(<Button isLoading>Loading</Button>);
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });
});
```

### Visual Regression Testing
```typescript
// Storybook stories for visual testing
export default {
  title: 'Components/Button',
  component: Button,
};

export const Primary = () => <Button variant="primary">Primary Button</Button>;
export const Secondary = () => <Button variant="secondary">Secondary Button</Button>;
export const Loading = () => <Button isLoading>Loading Button</Button>;
```

## 📋 Development Guidelines

### File Structure
```
src/
├── components/
│   ├── ui/           # Reusable UI components
│   ├── layout/       # Layout components
│   └── forms/        # Form components
├── pages/            # Page components
├── hooks/            # Custom React hooks
├── contexts/         # React contexts
├── utils/            # Utility functions
├── types/            # TypeScript types
└── styles/           # Global styles
```

### Naming Conventions
- **Components**: PascalCase (e.g., `UserProfile`)
- **Files**: PascalCase for components, camelCase for utils
- **CSS Classes**: kebab-case or Tailwind utility classes
- **Props**: camelCase

### Code Style
```typescript
// Good: Clear prop interface
interface ButtonProps {
  variant: 'primary' | 'secondary';
  size: 'sm' | 'md' | 'lg';
  onClick: () => void;
  children: React.ReactNode;
}

// Good: Destructured props with defaults
const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary',
  size = 'md',
  onClick,
  children 
}) => {
  // Component logic
};

// Good: Meaningful class names
const buttonClasses = `
  btn 
  btn-${variant} 
  btn-${size}
  ${disabled ? 'btn-disabled' : ''}
`;
```

---

*For specific component documentation, refer to the Storybook instance at `http://localhost:6006` (when running)*
