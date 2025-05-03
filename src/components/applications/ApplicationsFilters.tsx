
import { TabsList, TabsTrigger } from "@/components/ui/tabs";

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
      <TabsTrigger value="all">All ({totalCount})</TabsTrigger>
      <TabsTrigger value="pending">Pending ({pendingCount})</TabsTrigger>
      <TabsTrigger value="accepted">Accepted ({acceptedCount})</TabsTrigger>
      <TabsTrigger value="rejected">Rejected ({rejectedCount})</TabsTrigger>
    </TabsList>
  );
};

export default ApplicationsFilters;
