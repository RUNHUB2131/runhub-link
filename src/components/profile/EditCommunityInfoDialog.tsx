
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RunClubProfile } from "@/types";
import { CommunityDataForm } from "./community/CommunityDataForm";

interface EditCommunityInfoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: Partial<RunClubProfile>;
  onSave: (data: Partial<RunClubProfile>) => Promise<void>;
}

export function EditCommunityInfoDialog({
  open,
  onOpenChange,
  profile,
  onSave,
}: EditCommunityInfoDialogProps) {
  const handleSave = async ({
    member_count,
    average_group_size,
    core_demographic,
    runTypes,
    eventExperience,
  }: {
    member_count: number;
    average_group_size: string;
    core_demographic: string;
    runTypes: string[];
    eventExperience: string[];
  }) => {
    const demographics = profile.community_data?.demographics || {};
    
    await onSave({
      member_count,
      community_data: {
        run_types: runTypes,
        demographics: {
          ...demographics,
          average_group_size,
          core_demographic,
          event_experience: eventExperience,
        },
      },
    });
    
    onOpenChange(false);
  };

  const { formComponents, handleSubmit, isLoading } = CommunityDataForm({
    profile,
    onSaveData: handleSave,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Edit Community Information</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {formComponents}
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} variant="outline">
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
