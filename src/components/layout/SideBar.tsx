
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { LayoutDashboard, User, Search, MessageSquare, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export const SideBar = () => {
  const { userType, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Define nav items based on user type
  const commonNavItems = [
    { 
      path: "/dashboard", 
      label: "Dashboard", 
      icon: <LayoutDashboard className="h-5 w-5" /> 
    },
    { 
      path: "/profile", 
      label: "My Profile", 
      icon: <User className="h-5 w-5" /> 
    }
  ];

  const brandNavItems = [
    { 
      path: "/opportunities", 
      label: "Manage Opportunities", 
      icon: <Search className="h-5 w-5" /> 
    }
  ];

  const runClubNavItems = [
    { 
      path: "/opportunities", 
      label: "Browse Opportunities", 
      icon: <Search className="h-5 w-5" /> 
    },
    { 
      path: "/applications", 
      label: "My Applications", 
      icon: <MessageSquare className="h-5 w-5" /> 
    }
  ];

  const navItems = [
    ...commonNavItems,
    ...(userType === 'brand' ? brandNavItems : runClubNavItems),
    { 
      path: "/messages", 
      label: "Messages", 
      icon: <MessageSquare className="h-5 w-5" /> 
    }
  ];

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/auth/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <aside className="w-64 bg-gray-50 border-r border-gray-200 h-full flex flex-col">
      <nav className="p-4 flex-1">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link 
                to={item.path} 
                className={cn(
                  "sidebar-item",
                  location.pathname === item.path && "active"
                )}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Sign Out Button */}
      <div className="p-4 border-t border-gray-200">
        <Button 
          variant="ghost" 
          className="w-full justify-start text-red-500 hover:text-red-700 hover:bg-red-50"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5 mr-2" />
          Sign Out
        </Button>
      </div>
    </aside>
  );
};
