import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface PitchViewDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  pitch: string;
  clubName: string;
}

export function PitchViewDialog({
  isOpen,
  onOpenChange,
  pitch,
  clubName
}: PitchViewDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{clubName}'s Pitch</DialogTitle>
          <DialogDescription>
            Why {clubName} believes they're perfect for this opportunity
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm whitespace-pre-wrap">{pitch || "No pitch provided."}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 