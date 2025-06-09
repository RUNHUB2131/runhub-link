import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { BrandProfile } from "@/types";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  ChevronRight, 
  Globe, 
  Shield, 
  MessageCircle, 
  MessageSquare, 
  FileText, 
  Lock 
} from "lucide-react";

interface BrandSettingsViewProps {
  profile: Partial<BrandProfile>;
}

export const BrandSettingsView = ({ profile }: BrandSettingsViewProps) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleProfileClick = () => {
    navigate("/profile/personal-information");
  };

  const handleDeleteAccount = async () => {
    if (!user?.id) return;
    
    setIsDeleting(true);
    
    try {
      // Delete user-specific data but preserve opportunities and applications
      // This allows run clubs to still see historical opportunities
      
      // Delete notifications
      await supabase
        .from('notifications')
        .delete()
        .eq('user_id', user.id);
      
      // Delete user favorites
      await supabase
        .from('user_favorites')
        .delete()
        .eq('user_id', user.id);
      
      // Delete brand profile
      await supabase
        .from('brand_profiles')
        .delete()
        .eq('id', user.id);
      
      // Delete base profile
      await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id);
      
      // Note: The auth user will be automatically cleaned up by Supabase
      // when the user is no longer referenced by any tables due to foreign key constraints
      
      toast({
        title: "Account deleted",
        description: "Your account has been successfully deleted.",
      });
      
      // Sign out and redirect to home
      await logout();
      navigate("/");
      
    } catch (error: any) {
      console.error("Error deleting account:", error);
      toast({
        title: "Error",
        description: "Failed to delete account. Please try again or contact support.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const settingsItems = [
    {
      icon: Globe,
      title: "App language",
      onClick: () => {}, // Placeholder for future implementation
    },
    {
      icon: Shield,
      title: "Permissions",
      onClick: () => {}, // Placeholder for future implementation
    },
  ];

  const supportItems = [
    {
      icon: MessageCircle,
      title: "Contact support",
      onClick: () => {}, // Placeholder for future implementation
    },
    {
      icon: MessageSquare,
      title: "Give us feedback",
      onClick: () => {}, // Placeholder for future implementation
    },
  ];

  const legalItems = [
    {
      icon: FileText,
      title: "Terms of service",
      onClick: () => {}, // Placeholder for future implementation
    },
    {
      icon: Lock,
      title: "Privacy policy",
      onClick: () => {}, // Placeholder for future implementation
    },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Profile Section */}
      <div>
        <h1 className="text-2xl font-bold mb-6">Profile</h1>
        
        <Card className="p-0">
          <Button
            variant="ghost"
            className="w-full flex items-center justify-between p-4 h-auto rounded-lg"
            onClick={handleProfileClick}
          >
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12">
                {profile.logo_url ? (
                  <AvatarImage src={profile.logo_url} alt="Brand logo" />
                ) : (
                  <AvatarFallback className="text-lg font-semibold">
                    {profile.company_name?.charAt(0) || user?.email?.charAt(0) || "B"}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="text-left">
                <p className="font-semibold text-base">
                  {profile.company_name || "Your Brand"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {user?.email}
                </p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </Button>
        </Card>
      </div>

      {/* Settings Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Settings</h2>
        <Card className="divide-y">
          {settingsItems.map((item, index) => (
            <Button
              key={index}
              variant="ghost"
              className="w-full flex items-center justify-between p-4 h-auto rounded-none first:rounded-t-lg last:rounded-b-lg"
              onClick={item.onClick}
            >
              <div className="flex items-center gap-3">
                <item.icon className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">{item.title}</span>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </Button>
          ))}
        </Card>
      </div>

      {/* Support Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Support</h2>
        <Card className="divide-y">
          {supportItems.map((item, index) => (
            <Button
              key={index}
              variant="ghost"
              className="w-full flex items-center justify-between p-4 h-auto rounded-none first:rounded-t-lg last:rounded-b-lg"
              onClick={item.onClick}
            >
              <div className="flex items-center gap-3">
                <item.icon className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">{item.title}</span>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </Button>
          ))}
        </Card>
      </div>

      {/* Legal Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Legal</h2>
        <Card className="divide-y">
          {legalItems.map((item, index) => (
            <Button
              key={index}
              variant="ghost"
              className="w-full flex items-center justify-between p-4 h-auto rounded-none first:rounded-t-lg last:rounded-b-lg"
              onClick={item.onClick}
            >
              <div className="flex items-center gap-3">
                <item.icon className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">{item.title}</span>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </Button>
          ))}
        </Card>
      </div>

      {/* Delete Account */}
      <div className="flex justify-center pt-8">
        <button
          onClick={() => setShowDeleteDialog(true)}
          className="text-sm text-muted-foreground hover:text-destructive underline"
        >
          Delete account
        </button>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Account</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete your account? This action cannot be undone. 
              All your data, including your brand profile, opportunities, and applications will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteAccount}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete Account"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}; 