
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface ApplicationsEmptyStateProps {
  message?: string;
}

const ApplicationsEmptyState = ({ 
  message = "You haven't applied to any opportunities yet" 
}: ApplicationsEmptyStateProps) => (
  <motion.div 
    className="text-center py-12 border border-dashed border-gray-300 rounded-lg"
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.3 }}
  >
    <h3 className="text-lg font-medium mb-2">No applications found</h3>
    <p className="text-gray-500 mb-4">{message}</p>
    <Button onClick={() => window.location.href = "/opportunities"}>
      Browse Opportunities
    </Button>
  </motion.div>
);

export default ApplicationsEmptyState;
