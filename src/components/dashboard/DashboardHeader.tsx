
import { UserType } from "@/types";

interface DashboardHeaderProps {
  userType: UserType | undefined;
}

export const DashboardHeader = ({ userType }: DashboardHeaderProps) => {
  return (
    <div className="pb-6 border-b border-gray-200 mb-8">
      <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
      <p className="text-muted-foreground">
        Welcome to your {userType === 'run_club' ? 'Run Club' : 'Brand'} dashboard
      </p>
    </div>
  );
};
