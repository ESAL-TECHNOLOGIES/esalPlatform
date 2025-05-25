import * as React from "react";
import { cn } from "../lib/utils";

/**
 * Card component props
 */
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

/**
 * Card component
 *
 * A container to group related content and actions
 */
const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-lg border border-slate-200 bg-white text-slate-950 shadow-sm",
        className
      )}
      {...props}
    />
  )
);
Card.displayName = "Card";

/**
 * CardHeader component props
 */
export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

/**
 * CardHeader component
 *
 * A header section for the Card component
 */
const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex flex-col space-y-1.5 p-6", className)}
      {...props}
    />
  )
);
CardHeader.displayName = "CardHeader";

/**
 * CardTitle component props
 */
export interface CardTitleProps
  extends React.HTMLAttributes<HTMLHeadingElement> {}

/**
 * CardTitle component
 *
 * A title for the Card component
 */
const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn(
        "text-2xl font-semibold leading-none tracking-tight",
        className
      )}
      {...props}
    />
  )
);
CardTitle.displayName = "CardTitle";

/**
 * CardDescription component props
 */
export interface CardDescriptionProps
  extends React.HTMLAttributes<HTMLParagraphElement> {}

/**
 * CardDescription component
 *
 * A description for the Card component
 */
const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  CardDescriptionProps
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn("text-sm text-slate-500", className)} {...props} />
));
CardDescription.displayName = "CardDescription";

/**
 * CardContent component props
 */
export interface CardContentProps
  extends React.HTMLAttributes<HTMLDivElement> {}

/**
 * CardContent component
 *
 * A content container for the Card component
 */
const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
  )
);
CardContent.displayName = "CardContent";

/**
 * CardFooter component props
 */
export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

/**
 * CardFooter component
 *
 * A footer section for the Card component
 */
const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex items-center p-6 pt-0", className)}
      {...props}
    />
  )
);
CardFooter.displayName = "CardFooter";

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
};
