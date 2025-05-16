import { useState, useEffect } from "react";
import { Opportunity } from "@/types";
import BrandProfileDialog from "./BrandProfileDialog";

interface OpportunityBrandInfoProps {
  opportunity: Opportunity;
}

const OpportunityBrandInfo = ({ opportunity }: OpportunityBrandInfoProps) => {
  const [showBrandProfile, setShowBrandProfile] = useState(false);
  
  useEffect(() => {
    console.log("\n=== OpportunityBrandInfo Component ===");
    console.log("Full opportunity object:", opportunity);
    console.log("Brand ID:", opportunity.brand_id);
    console.log("Brand data:", opportunity.brand);
    console.log("Company name:", opportunity.brand?.company_name);
    console.log("Logo URL:", opportunity.brand?.logo_url);
  }, [opportunity]);
  
  if (!opportunity.brand_id) {
    console.log("No brand_id provided to OpportunityBrandInfo");
    return <div className="text-sm text-gray-500">Loading brand info...</div>;
  }
  
  return (
    <>
      <div className="flex items-center mt-2">
        {opportunity.brand?.logo_url ? (
          <div className="w-6 h-6 rounded overflow-hidden mr-2 bg-gray-100">
            <img 
              src={opportunity.brand.logo_url} 
              alt={opportunity.brand.company_name || "Brand logo"}
              className="w-full h-full object-contain"
              onError={(e) => {
                console.log("Failed to load brand logo for:", opportunity.brand?.company_name);
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        ) : (
          <div className="w-6 h-6 rounded bg-primary/10 text-primary flex items-center justify-center mr-2">
            {(opportunity.brand?.company_name?.[0] || "B").toUpperCase()}
          </div>
        )}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            setShowBrandProfile(true);
          }}
          className="text-sm font-medium text-gray-600 hover:text-primary hover:underline"
        >
          {opportunity.brand?.company_name || "Unknown Brand"}
        </button>
      </div>
      
      <BrandProfileDialog 
        brandId={opportunity.brand_id} 
        isOpen={showBrandProfile} 
        onOpenChange={setShowBrandProfile} 
      />
    </>
  );
};

export default OpportunityBrandInfo;
