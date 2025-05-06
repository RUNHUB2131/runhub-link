
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
  const { formComponents, handleSubmit, isLoading } = CommunityDataForm({
    profile,
    onSaveData: async (data) => {
      const communityData = {
        run_types: data.runTypes,
        demographics: {
          average_group_size: data.average_group_size,
          core_demographic: data.core_demographic,
          event_experience: data.eventExperience,
        },
      };
      
      // Include member_count at the top level of the profile object
      await onSave({
        member_count: data.member_count,
        community_data: communityData,
      });
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
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
