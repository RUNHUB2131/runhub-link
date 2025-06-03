import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageContainerProps {
  children: ReactNode;
  className?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "4xl" | "full";
}

export const PageContainer = ({ 
  children, 
  className,
  maxWidth = "full" 
}: PageContainerProps) => {
  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md", 
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "4xl": "max-w-4xl",
    full: "max-w-none"
  };

  return (
    <div className={cn(
      "p-4 sm:p-6",
      maxWidth !== "full" && "mx-auto",
      maxWidthClasses[maxWidth],
      className
    )}>
      {children}
    </div>
  );
}; 