
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { fetchRunClubApplications } from "@/services/applicationService";
import MyApplicationsList from "@/components/applications/MyApplicationsList";
import { Application } from "@/types";

interface ApplicationWithOpportunity extends Application {
  opportunities?: {
    id: string;
    title: string;
    description: string;
    brand_id: string;
    reward: string;
    deadline: string | null;
    created_at: string;
    brand?: {
      company_name: string;
      logo_url?: string;
    } | null;
  };
}

const MyApplications = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<ApplicationWithOpportunity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadApplications = async () => {
      if (!user?.id) return;
      
      try {
        setIsLoading(true);
        const data = await fetchRunClubApplications(user.id);
        setApplications(data || []);
      } catch (error) {
        console.error("Error loading applications:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadApplications();
  }, [user?.id]);

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">My Applications</h1>
        <p className="text-gray-600">Track the status of your applications to brand opportunities</p>
      </div>

      <MyApplicationsList 
        applications={applications} 
        isLoading={isLoading} 
      />
    </div>
  );
};

export default MyApplications;
