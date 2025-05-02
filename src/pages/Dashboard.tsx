
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";

const Dashboard = () => {
  const { userType } = useAuth();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to your {userType === 'run_club' ? 'Run Club' : 'Brand'} dashboard
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Complete Your Profile</CardTitle>
            <CardDescription>Add more details to your profile to increase visibility</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="bg-primary-500 h-2 rounded-full" style={{ width: "35%" }}></div>
            </div>
            <p className="text-sm mt-2">35% complete</p>
          </CardContent>
        </Card>

        {userType === 'run_club' ? (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Open Opportunities</CardTitle>
                <CardDescription>Find sponsorship opportunities for your club</CardDescription>
              </CardHeader>
              <CardContent className="text-3xl font-bold">12</CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Pending Applications</CardTitle>
                <CardDescription>Track your open applications</CardDescription>
              </CardHeader>
              <CardContent className="text-3xl font-bold">3</CardContent>
            </Card>
          </>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Active Campaigns</CardTitle>
                <CardDescription>Your currently active sponsorship opportunities</CardDescription>
              </CardHeader>
              <CardContent className="text-3xl font-bold">2</CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>New Applications</CardTitle>
                <CardDescription>Applications waiting for your review</CardDescription>
              </CardHeader>
              <CardContent className="text-3xl font-bold">8</CardContent>
            </Card>
          </>
        )}
      </div>

      <h2 className="text-2xl font-bold mt-12">Recent Activity</h2>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <p className="font-medium">
              {userType === 'run_club' ? 'New opportunity posted by Nike' : 'The Morning Runners applied to your opportunity'}
            </p>
            <p className="text-sm text-gray-500">2 hours ago</p>
          </div>
          <Button>View</Button>
        </div>
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <p className="font-medium">
              {userType === 'run_club' ? 'Your application was viewed by Asics' : 'Your opportunity "Summer Campaign" received 5 new applications'}
            </p>
            <p className="text-sm text-gray-500">Yesterday</p>
          </div>
          <Button>View</Button>
        </div>
        <div className="p-4 flex items-center justify-between">
          <div>
            <p className="font-medium">
              {userType === 'run_club' ? 'Profile view from Brooks' : 'City Runners viewed your brand profile'}
            </p>
            <p className="text-sm text-gray-500">2 days ago</p>
          </div>
          <Button>View</Button>
        </div>
      </div>
    </div>
  );
};

const Button = ({ children, ...props }) => (
  <button 
    className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-md text-sm transition-colors"
    {...props}
  >
    {children}
  </button>
);

export default Dashboard;
