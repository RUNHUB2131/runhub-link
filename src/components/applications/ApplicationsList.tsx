import { Application } from "@/types";
import ApplicationCard from "./ApplicationCard";
import { motion } from "framer-motion";

interface ApplicationWithOpportunity extends Application {
  opportunities?: {
    id: string;
    title: string;
    description: string;
    brand_id: string;
    club_incentives: string;
    submission_deadline: string;
    target_launch_date: string;
    brand?: {
      company_name: string;
      logo_url?: string;
    } | null;
  };
}

interface ApplicationsListProps {
  applications: ApplicationWithOpportunity[];
  onWithdraw?: (applicationId: string) => void;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

const ApplicationsList = ({ applications, onWithdraw }: ApplicationsListProps) => {
  return (
    <motion.div 
      className="space-y-4"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {applications.map((application) => (
        <motion.div key={application.id} variants={item}>
          <ApplicationCard 
            application={application} 
            onWithdraw={application.status === 'pending' || application.status === 'accepted' ? onWithdraw : undefined}
          />
        </motion.div>
      ))}
    </motion.div>
  );
};

export default ApplicationsList;
