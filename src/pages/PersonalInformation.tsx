import { useAuth } from "@/contexts/AuthContext";
import BrandPersonalInformation from "./BrandPersonalInformation";
import RunClubPersonalInformation from "./RunClubPersonalInformation";

const PersonalInformation = () => {
  const { userType } = useAuth();

  if (userType === 'brand') {
    return <BrandPersonalInformation />;
  } else {
    return <RunClubPersonalInformation />;
  }
};

export default PersonalInformation; 