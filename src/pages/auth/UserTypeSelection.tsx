import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Footprints, Building } from "lucide-react";
import { UserType } from "@/types";

const UserTypeSelection = () => {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState<UserType | null>(null);
  const [showComingSoon, setShowComingSoon] = useState(false);

  const handleContinue = () => {
    if (selectedType === 'content_producer') {
      setShowComingSoon(true);
      return;
    }
    
    if (selectedType) {
      // Store the selected user type in localStorage to use during registration
      localStorage.setItem("runhub_user_type", selectedType);
      navigate("/auth/register");
    }
  };

  if (showComingSoon) {
    return (
      <div className="w-full max-w-md mx-auto px-4 sm:px-0">
        <div className="text-center">
          <div className="mx-auto mb-6 w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center">
            <span className="text-4xl">🚀</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-4">Coming Soon!</h1>
          <p className="text-gray-600 mb-6">
            Content Producer access is launching soon! Create content and collaborate with run clubs and brands on the platform.
          </p>
          <Button
            onClick={() => setShowComingSoon(false)}
            variant="outline"
            className="mb-4"
          >
            Back to Selection
          </Button>
          <div>
            <Button variant="link" onClick={() => navigate("/")} className="text-sm sm:text-base">
              Back to home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto px-4 sm:px-0">
      <div className="text-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Sign in as</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
        <Card 
          className={`p-4 sm:p-6 cursor-pointer text-center hover:shadow-md transition-shadow ${
            selectedType === 'run_club' ? 'ring-2 ring-primary-500 bg-primary-50' : ''
          }`}
          onClick={() => setSelectedType('run_club')}
        >
          <div className="mx-auto mb-3 sm:mb-4 w-12 h-12 sm:w-16 sm:h-16 bg-primary-100 rounded-full flex items-center justify-center">
            <Footprints className="h-6 w-6 sm:h-8 sm:w-8 text-primary-500" />
          </div>
          <h3 className="text-lg sm:text-xl font-semibold">Run Club</h3>
          <p className="text-xs sm:text-sm text-gray-500 mt-2">
            Access your run club dashboard and manage opportunities
          </p>
        </Card>

        <Card 
          className={`p-4 sm:p-6 cursor-pointer text-center hover:shadow-md transition-shadow ${
            selectedType === 'brand' ? 'ring-2 ring-primary-500 bg-primary-50' : ''
          }`}
          onClick={() => setSelectedType('brand')}
        >
          <div className="mx-auto mb-3 sm:mb-4 w-12 h-12 sm:w-16 sm:h-16 bg-primary-100 rounded-full flex items-center justify-center">
            <Building className="h-6 w-6 sm:h-8 sm:w-8 text-primary-500" />
          </div>
          <h3 className="text-lg sm:text-xl font-semibold">Brand</h3>
          <p className="text-xs sm:text-sm text-gray-500 mt-2">
            Access your brand dashboard and manage campaigns
          </p>
        </Card>

        <Card 
          className={`p-4 sm:p-6 cursor-pointer text-center hover:shadow-md transition-shadow ${
            selectedType === 'content_producer' ? 'ring-2 ring-primary-500 bg-primary-50' : ''
          }`}
          onClick={() => setSelectedType('content_producer')}
        >
          <div className="mx-auto mb-3 sm:mb-4 w-12 h-12 sm:w-16 sm:h-16 bg-primary-100 rounded-full flex items-center justify-center">
            <svg className="h-6 w-6 sm:h-8 sm:w-8 text-primary-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M23 7L16 12L23 17V7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <rect x="1" y="5" width="15" height="14" rx="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h3 className="text-lg sm:text-xl font-semibold">Content Producer</h3>
          <p className="text-xs sm:text-sm text-gray-500 mt-2">
            Create amazing content with top brands
          </p>
        </Card>
      </div>

      <Button
        className="w-full h-11"
        disabled={!selectedType}
        onClick={handleContinue}
      >
        Continue
      </Button>

      <div className="mt-4 text-center">
        <Button variant="link" onClick={() => navigate("/")} className="text-sm sm:text-base">
          Back to home
        </Button>
      </div>
    </div>
  );
};

export default UserTypeSelection;
