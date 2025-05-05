
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
    <Card className="mb-8">
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h2 className="text-3xl font-bold">{title}</h2>
            <p className="text-muted-foreground">{subtitle}</p>
          </div>
          {onEdit && (
            <Button
              variant="outline"
              className="h-12 px-8 rounded-md"
              onClick={onEdit}
            >
              Edit
            </Button>
          )}
        </div>
        <div className="mt-6">{children}</div>
      </div>
    </Card>
  );
};
