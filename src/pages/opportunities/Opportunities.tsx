
import { useAuth } from "@/contexts/AuthContext";
import BrowseOpportunities from "./BrowseOpportunities";
import ManageOpportunities from "./ManageOpportunities";

const Opportunities = () => {
  const { userType } = useAuth();
  
  return userType === "brand" ? <ManageOpportunities /> : <BrowseOpportunities />;
};

export default Opportunities;
