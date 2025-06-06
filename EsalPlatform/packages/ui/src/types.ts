export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

export interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export interface NavbarProps {
  title: string;
  user?: {
    name: string;
    role: string;
    avatar_url?: string;
  };
  onLogout?: () => void;
  onMobileMenuToggle?: () => void;
  isMobileMenuOpen?: boolean;
}

export interface SidebarProps {
  items: SidebarItem[];
  currentPath: string;
  user?: {
    name: string;
    email: string;
    role: string;
    avatar_url?: string;
  };
  stats?: {
    ideas?: number;
    views?: number;
  };
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export interface SidebarItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
}

export interface LayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  navbar?: React.ReactNode;
}
