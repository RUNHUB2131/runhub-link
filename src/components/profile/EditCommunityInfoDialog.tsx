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
  const { formComponents, handleSubmit, isLoading, clearDraft } = CommunityDataForm({
    profile,
    open,
    onSaveData: async (data) => {
      const communityData = {
        run_types: data.runTypes,
        demographics: {
          average_group_size: data.average_group_size,
          core_demographic: data.core_demographic,
          average_pace: data.average_pace,
          event_experience: data.eventExperience,
        },
      };
      
      // Include member_count at the top level of the profile object
      await onSave({
        member_count: data.member_count,
        community_data: communityData,
      });
      
      // Clear sessionStorage immediately to prevent race condition
      sessionStorage.removeItem('dialog_runclub-community-info');
      // Close the dialog immediately after successful save, before any re-renders
      onOpenChange(false);
    },
  });

  const handleCancel = () => {
    // Clear the draft when user explicitly cancels
    clearDraft();
    // Clear sessionStorage immediately to prevent race condition
    sessionStorage.removeItem('dialog_runclub-community-info');
    onOpenChange(false);
  };

  const handleClickOutside = () => {
    // Clear the draft when user clicks outside (implicit cancel)
    clearDraft();
    // Clear sessionStorage immediately to prevent race condition
    sessionStorage.removeItem('dialog_runclub-community-info');
    onOpenChange(false);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // Dialog is being closed - clear the draft (same as cancel)
      clearDraft();
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent 
        className="sm:max-w-[550px]"
        onInteractOutside={(e) => {
          // Allow pointer events (clicks) to close dialog and discard changes
          // but prevent focus events (tab switching) from closing
          if (e.type === 'focusout') {
            e.preventDefault();
          } else {
            // This is a pointer event (click outside) - close and discard
            handleClickOutside();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle>Edit Community Information</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {formComponents}
        </div>
        <DialogFooter>
          <Button onClick={handleCancel} variant="outline">
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
