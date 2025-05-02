
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserType } from "@/types";

const UserTypeSelection = () => {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState<UserType | null>(null);

  const handleContinue = () => {
    if (selectedType) {
      // Store the selected user type in localStorage to use during registration
      localStorage.setItem("runhub_user_type", selectedType);
      navigate("/auth/register");
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold mb-2">Sign in as</h1>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card 
          className={`p-6 cursor-pointer text-center hover:shadow-md transition-shadow ${
            selectedType === 'run_club' ? 'ring-2 ring-primary-500 bg-primary-50' : ''
          }`}
          onClick={() => setSelectedType('run_club')}
        >
          <div className="mx-auto mb-4 w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
            <svg className="h-8 w-8 text-primary-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 18C15.3137 18 18 15.3137 18 12C18 8.68629 15.3137 6 12 6C8.68629 6 6 8.68629 6 12C6 15.3137 8.68629 18 12 18Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 2V4M12 20V22M4.93 4.93L6.34 6.34M17.66 17.66L19.07 19.07M2 12H4M20 12H22M4.93 19.07L6.34 17.66M17.66 6.34L19.07 4.93" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h3 className="text-xl font-semibold">Run Club</h3>
          <p className="text-sm text-gray-500 mt-2">
            Access your run club dashboard and manage opportunities
          </p>
        </Card>

        <Card 
          className={`p-6 cursor-pointer text-center hover:shadow-md transition-shadow ${
            selectedType === 'brand' ? 'ring-2 ring-primary-500 bg-primary-50' : ''
          }`}
          onClick={() => setSelectedType('brand')}
        >
          <div className="mx-auto mb-4 w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
            <svg className="h-8 w-8 text-primary-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="7" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 3L16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M8 3L8 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 11L22 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h3 className="text-xl font-semibold">Brand</h3>
          <p className="text-sm text-gray-500 mt-2">
            Access your brand dashboard and manage campaigns
          </p>
        </Card>
      </div>

      <Button
        className="w-full"
        disabled={!selectedType}
        onClick={handleContinue}
      >
        Continue
      </Button>

      <div className="mt-4 text-center">
        <Button variant="link" onClick={() => navigate("/")}>
          Back to home
        </Button>
      </div>
    </div>
  );
};

export default UserTypeSelection;
