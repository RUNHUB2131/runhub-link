
import { useEffect } from "react";
import { RunClubProfileForm } from "@/components/profile/RunClubProfileForm";
import { BrandProfileForm } from "@/components/profile/BrandProfileForm";
import { useAuth } from "@/contexts/AuthContext";

const Profile = () => {
  const { userType } = useAuth();

  useEffect(() => {
    // Here we would fetch any existing profile data
    // This is where you'd integrate with Supabase
  }, []);

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold mb-2">My Profile</h1>
        <p className="text-muted-foreground">
          {userType === 'run_club' 
            ? 'Tell brands about your run club' 
            : 'Tell running clubs about your brand'}
        </p>
      </div>

      {userType === 'run_club' ? (
        <RunClubProfileForm />
      ) : (
        <BrandProfileForm />
      )}
    </div>
  );
};

export default Profile;
