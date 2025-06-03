import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, User, LogOut } from "lucide-react";
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
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center">
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
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
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </Link>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleLogout}
                title="Sign out"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </>
          ) : (
            <Link to="/auth/login">
              <Button>Login</Button>
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
  
  return (
    <div className="grid gap-4 py-8">
      {user ? (
        <>
          <Link
            to="/dashboard"
            className="text-base font-medium transition-colors py-3 px-2 rounded-md hover:bg-accent"
            onClick={closeSheet}
          >
            Dashboard
          </Link>
          
          <Link
            to="/profile"
            className="text-base font-medium transition-colors py-3 px-2 rounded-md hover:bg-accent"
            onClick={closeSheet}
          >
            Profile
          </Link>
          
          <Link
            to="/opportunities"
            className="text-base font-medium transition-colors py-3 px-2 rounded-md hover:bg-accent"
            onClick={closeSheet}
          >
            Opportunities
          </Link>
          
          <Link
            to="/applications"
            className="text-base font-medium transition-colors py-3 px-2 rounded-md hover:bg-accent"
            onClick={closeSheet}
          >
            My Applications
          </Link>
          
          <Link
            to="/chat"
            className="text-base font-medium transition-colors py-3 px-2 rounded-md hover:bg-accent"
            onClick={closeSheet}
          >
            Chats
          </Link>
          
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
            className="text-base font-medium transition-colors py-3 px-2 rounded-md hover:bg-accent"
            onClick={closeSheet}
          >
            Login
          </Link>
          
          <Link
            to="/auth/register"
            className="text-base font-medium transition-colors py-3 px-2 rounded-md hover:bg-accent"
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
