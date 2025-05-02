
import { Opportunity } from "@/types";

interface OpportunityBrandInfoProps {
  opportunity: Opportunity;
}

const OpportunityBrandInfo = ({ opportunity }: OpportunityBrandInfoProps) => {
  if (!opportunity.brand) return null;
  
  return (
    <div className="flex items-center mt-2">
      {opportunity.brand.logo_url ? (
        <div className="w-6 h-6 rounded overflow-hidden mr-2 bg-gray-100">
          <img 
            src={opportunity.brand.logo_url} 
            alt={opportunity.brand.company_name || "Brand logo"}
            className="w-full h-full object-contain"
          />
        </div>
      ) : (
        <div className="w-6 h-6 rounded bg-primary/10 text-primary flex items-center justify-center mr-2">
          {(opportunity.brand.company_name?.[0] || "B").toUpperCase()}
        </div>
      )}
      <span className="text-sm font-medium text-gray-600">
        {opportunity.brand.company_name || "Unknown Brand"}
      </span>
    </div>
  );
};

export default OpportunityBrandInfo;
