import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, User, LogOut, LayoutDashboard, Briefcase, MessageCircle, FileText, Users, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/contexts/AuthContext";
import NotificationsDropdown from "@/components/notifications/NotificationsDropdown";
import ChatIndicator from "@/components/chat/ChatIndicator";

export const NavBar = () => {
  const { user, userType, logout } = useAuth();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b" style={{ backgroundColor: '#021fdf' }}>
      <div className="container flex h-16 items-center">
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden text-[#f0f0f0] hover:bg-[#f0f0f0]/20 hover:text-[#f0f0f0]">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="pr-0">
            <MobileNav closeSheet={() => setIsSheetOpen(false)} />
          </SheetContent>
        </Sheet>
        
        <div className="flex-1" />

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <NotificationsDropdown />
              <ChatIndicator />
              <Link to="/profile">
                <Button variant="ghost" size="icon" className="text-[#f0f0f0] hover:bg-[#f0f0f0]/20 hover:text-[#f0f0f0]">
                  <User className="h-5 w-5" />
                </Button>
              </Link>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleLogout}
                title="Sign out"
                className="text-[#f0f0f0] hover:bg-[#f0f0f0]/20 hover:text-[#f0f0f0]"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </>
          ) : (
            <Link to="/auth/login">
              <Button className="bg-[#f0f0f0] text-[#021fdf] hover:bg-[#f0f0f0]/90 hover:text-[#021fdf]">Login</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

const MobileNav = ({ closeSheet }: { closeSheet: () => void }) => {
  const { user, userType, logout } = useAuth();
  const navigate = useNavigate();
  
  const handleSignOut = async () => {
    try {
      await logout();
      closeSheet();
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Generate navigation links based on user type (same logic as desktop sidebar)
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
    <div className="grid gap-4 py-8">
      {user ? (
        <>
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="flex items-center gap-3 text-base font-medium transition-colors py-3 px-2 rounded-md hover:bg-accent text-foreground"
              onClick={closeSheet}
            >
              {link.icon}
              {link.label}
            </Link>
          ))}
          
          <Button 
            variant="ghost" 
            className="justify-start px-2 py-3 h-auto text-base font-medium text-destructive hover:bg-destructive/10"
            onClick={handleSignOut}
          >
            <LogOut className="h-5 w-5 mr-3" />
            Sign out
          </Button>
        </>
      ) : (
        <>
          <Link
            to="/auth/login"
            className="text-base font-medium transition-colors py-3 px-2 rounded-md hover:bg-accent text-foreground"
            onClick={closeSheet}
          >
            Login
          </Link>
          
          <Link
            to="/auth/register"
            className="text-base font-medium transition-colors py-3 px-2 rounded-md hover:bg-accent text-foreground"
            onClick={closeSheet}
          >
            Register
          </Link>
        </>
      )}
    </div>
  );
};

export default NavBar;
