
import { useAuth } from "@/contexts/AuthContext";
import BrowseOpportunities from "./BrowseOpportunities";
import ManageOpportunities from "./ManageOpportunities";
import MyApplications from "./MyApplications";
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocation, useNavigate } from "react-router-dom";

const Opportunities = () => {
  const { userType } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get the initial tab from URL params or localStorage
  const getInitialTab = () => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    
    if (tabParam === 'applications') {
      return 'applications';
    }
    
    const storedTab = localStorage.getItem("opportunities-active-tab");
    if (storedTab === "applications") {
      return 'applications';
    }
    
    return userType === "brand" ? "manage" : "browse";
  };
  
  const [activeTab, setActiveTab] = useState<string>(getInitialTab());
  
  // Listen for localStorage changes (from sidebar navigation)
  useEffect(() => {
    const handleStorageChange = () => {
      const storedTab = localStorage.getItem("opportunities-active-tab");
      if (storedTab) {
        setActiveTab(storedTab);
        localStorage.removeItem("opportunities-active-tab");
      }
    };
    
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);
  
  // Update URL when tab changes
  useEffect(() => {
    if (userType === "run_club") {
      const params = new URLSearchParams(location.search);
      if (activeTab === "applications") {
        params.set('tab', 'applications');
      } else {
        params.delete('tab');
      }
      
      const newSearch = params.toString();
      const newPath = `${location.pathname}${newSearch ? `?${newSearch}` : ''}`;
      
      if (location.search !== (newSearch ? `?${newSearch}` : '')) {
        navigate(newPath, { replace: true });
      }
    }
  }, [activeTab, location.search, location.pathname, navigate, userType]);
  
  if (userType === "brand") {
    return <ManageOpportunities />;
  }
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };
  
  return (
    <div className="space-y-6">
      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full"
      >
        <TabsList className="mb-6">
          <TabsTrigger value="browse">Browse Opportunities</TabsTrigger>
          <TabsTrigger value="applications">My Applications</TabsTrigger>
        </TabsList>
        <TabsContent value="browse">
          <BrowseOpportunities />
        </TabsContent>
        <TabsContent value="applications">
          <MyApplications />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Opportunities;
