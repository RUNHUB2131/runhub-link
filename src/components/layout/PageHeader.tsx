import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: ReactNode;
  className?: string;
}

export const PageHeader = ({ 
  title, 
  description, 
  children,
  className 
}: PageHeaderProps) => {
  return (
    <div className={cn("mb-6 sm:mb-8", className)}>
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">{title}</h1>
          {description && (
            <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">{description}</p>
          )}
        </div>
        {children && (
          <div className="flex-shrink-0 w-full sm:w-auto">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}; 