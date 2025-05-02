
import { Skeleton } from "@/components/ui/skeleton";

const OpportunitiesLoading = () => {
  return (
    <div className="space-y-6">
      {[1, 2].map((i) => (
        <div key={i} className="border rounded-lg p-6">
          <div className="flex flex-col space-y-4">
            <div className="flex justify-between">
              <div>
                <Skeleton className="h-6 w-24 mb-2" />
                <Skeleton className="h-8 w-48" />
              </div>
              <Skeleton className="h-10 w-24" />
            </div>
            <Skeleton className="h-4 w-3/4" />
            <div className="flex items-center gap-4">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default OpportunitiesLoading;
