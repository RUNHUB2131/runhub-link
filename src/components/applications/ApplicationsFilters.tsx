
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";

interface ApplicationsFiltersProps {
  totalCount: number;
  pendingCount: number;
  acceptedCount: number;
  rejectedCount: number;
}

const ApplicationsFilters = ({
  totalCount,
  pendingCount,
  acceptedCount,
  rejectedCount
}: ApplicationsFiltersProps) => {
  return (
    <TabsList className="mb-6">
      <TabsTrigger value="all" className="relative">
        All ({totalCount})
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500"
          layoutId="activeTab"
          transition={{ type: "spring", duration: 0.6 }}
        />
      </TabsTrigger>
      <TabsTrigger value="pending" className="relative">
        Pending ({pendingCount})
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500"
          layoutId="activeTab"
          transition={{ type: "spring", duration: 0.6 }}
        />
      </TabsTrigger>
      <TabsTrigger value="accepted" className="relative">
        Accepted ({acceptedCount})
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500"
          layoutId="activeTab"
          transition={{ type: "spring", duration: 0.6 }}
        />
      </TabsTrigger>
      <TabsTrigger value="rejected" className="relative">
        Rejected ({rejectedCount})
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500"
          layoutId="activeTab"
          transition={{ type: "spring", duration: 0.6 }}
        />
      </TabsTrigger>
    </TabsList>
  );
};

export default ApplicationsFilters;
