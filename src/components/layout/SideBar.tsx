
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { LayoutDashboard, User, Search, FileText, MessageSquare } from "lucide-react";

export const SideBar = () => {
  const { userType } = useAuth();
  const location = useLocation();

  const navItems = [
    { 
      path: "/dashboard", 
      label: "Dashboard", 
      icon: <LayoutDashboard className="h-5 w-5" /> 
    },
    { 
      path: "/profile", 
      label: "My Profile", 
      icon: <User className="h-5 w-5" /> 
    },
    { 
      path: "/opportunities", 
      label: userType === 'run_club' ? "Browse Opportunities" : "Manage Opportunities", 
      icon: <Search className="h-5 w-5" /> 
    },
    { 
      path: "/applications", 
      label: userType === 'run_club' ? "My Applications" : "Review Applications", 
      icon: <FileText className="h-5 w-5" /> 
    },
    { 
      path: "/messages", 
      label: "Messages", 
      icon: <MessageSquare className="h-5 w-5" /> 
    },
  ];

  return (
    <aside className="w-64 bg-gray-50 border-r border-gray-200 h-full">
      <nav className="p-4">
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
    </aside>
  );
};
