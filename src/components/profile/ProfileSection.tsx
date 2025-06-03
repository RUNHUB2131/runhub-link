import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Edit } from "lucide-react";

interface ProfileSectionProps {
  title: string;
  subtitle: string;
  onEdit?: () => void;
  children: React.ReactNode;
}

export const ProfileSection = ({
  title,
  subtitle,
  onEdit,
  children,
}: ProfileSectionProps) => {
  return (
    <Card className="mb-6 sm:mb-8 relative">
      <div className="p-4 sm:p-6">
        {onEdit && (
          <Button
            variant="outline"
            size="sm"
            className="absolute top-4 right-4 h-8 w-8 sm:h-9 sm:w-9 p-0 shrink-0"
            onClick={onEdit}
          >
            <Edit className="h-4 w-4" />
            <span className="sr-only">Edit</span>
          </Button>
        )}
        
        <div className="pr-12 sm:pr-14">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold">{title}</h2>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">{subtitle}</p>
        </div>
        
        <div className="mt-4 sm:mt-6">{children}</div>
      </div>
    </Card>
  );
};
