
import { useCallback, useMemo } from "react";
import { NavLink } from "react-router-dom";
import { 
  Home, 
  User, 
  Briefcase, 
  PlusCircle, 
  LayoutDashboard, 
  MessageCircle,
  FileText,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

export function SideBar() {
  const { userType } = useAuth();

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
    <div className="hidden border-r bg-background md:block">
      <div className="flex h-full flex-col gap-2 p-4">
        <Button variant="ghost" className="mb-2 w-full justify-start" asChild>
          <NavLink to="/">
            <Home className="mr-2 h-5 w-5" />
            <span className="font-semibold">RunClubConnect</span>
          </NavLink>
        </Button>
        <div className="space-y-1">
          {navLinks.map((link) =>
            renderNavLink(link.to, link.icon, link.label)
          )}
        </div>
      </div>
    </div>
  );
}
