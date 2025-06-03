import { useCallback, useMemo } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { 
  Home, 
  User, 
  Briefcase, 
  PlusCircle, 
  LayoutDashboard, 
  MessageCircle,
  FileText,
  LogOut,
  Users
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

export function SideBar() {
  const { userType, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const renderNavLink = useCallback(
    (to: string, icon: React.ReactNode, label: string) => (
      <Button variant="ghost" className="w-full justify-start" asChild>
        <NavLink
          to={to}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-2 py-2",
              isActive && "bg-muted font-medium text-foreground"
            )
          }
        >
          {icon}
          <span>{label}</span>
        </NavLink>
      </Button>
    ),
    []
  );

  const navLinks = useMemo(() => {
    const commonLinks = [
      {
        to: "/dashboard",
        icon: <LayoutDashboard className="h-5 w-5" />,
        label: "Dashboard",
      },
      {
        to: "/opportunities",
        icon: <Briefcase className="h-5 w-5" />,
        label: "Opportunities",
      },
      {
        to: "/profile",
        icon: <User className="h-5 w-5" />,
        label: "Profile",
      },
      {
        to: "/chat",
        icon: <MessageCircle className="h-5 w-5" />,
        label: "Chats",
      },
    ];

    // Brand-specific links
    if (userType === "brand") {
      return [
        ...commonLinks,
        {
          to: "/clubs",
          icon: <Users className="h-5 w-5" />,
          label: "All Clubs",
        },
        {
          to: "/opportunities/add",
          icon: <PlusCircle className="h-5 w-5" />,
          label: "Add Opportunity",
        },
      ];
    }

    // Run club-specific links
    if (userType === "run_club") {
      return [
        ...commonLinks,
        {
          to: "/applications",
          icon: <FileText className="h-5 w-5" />,
          label: "My Applications",
        },
      ];
    }

    return commonLinks;
  }, [userType]);

  return (
    <div className="hidden w-64 border-r bg-background md:block h-screen fixed left-0 top-0">
      <div className="flex flex-col h-full">
        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-1 mt-16"> {/* Add top margin to account for navbar */}
            {navLinks.map((link) => (
              <div key={link.to}>
                {renderNavLink(link.to, link.icon, link.label)}
              </div>
            ))}
          </div>
        </div>
        
        {/* Sign out button - always at bottom */}
        <div className="p-4 border-t bg-background">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-destructive" 
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5 mr-2" />
            <span>Sign out</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
