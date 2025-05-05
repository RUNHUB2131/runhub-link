
import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, User, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/contexts/AuthContext";
import NotificationsDropdown from "@/components/notifications/NotificationsDropdown";
import ChatIndicator from "@/components/chat/ChatIndicator";

const NavBar = () => {
  const { user, userType, signOut } = useAuth();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

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
        
        <div className="flex items-center space-x-4">
          <Link to="/" className="font-semibold">
            RunClubConnect
          </Link>
        </div>

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
  const { user, userType, signOut } = useAuth();
  
  const handleSignOut = () => {
    signOut();
    closeSheet();
  };
  
  return (
    <div className="grid gap-2 py-6">
      <Link
        to="/"
        className="text-sm font-medium transition-colors"
        onClick={closeSheet}
      >
        Home
      </Link>
      
      {user ? (
        <>
          <Link
            to="/dashboard"
            className="text-sm font-medium transition-colors"
            onClick={closeSheet}
          >
            Dashboard
          </Link>
          
          <Link
            to="/profile"
            className="text-sm font-medium transition-colors"
            onClick={closeSheet}
          >
            Profile
          </Link>
          
          <Link
            to="/opportunities"
            className="text-sm font-medium transition-colors"
            onClick={closeSheet}
          >
            Opportunities
          </Link>
          
          <Link
            to="/applications"
            className="text-sm font-medium transition-colors"
            onClick={closeSheet}
          >
            My Applications
          </Link>
          
          <Link
            to="/chat"
            className="text-sm font-medium transition-colors"
            onClick={closeSheet}
          >
            Chats
          </Link>
          
          <Button 
            variant="ghost" 
            className="justify-start px-2"
            onClick={handleSignOut}
          >
            Log out
          </Button>
        </>
      ) : (
        <>
          <Link
            to="/auth/login"
            className="text-sm font-medium transition-colors"
            onClick={closeSheet}
          >
            Login
          </Link>
          
          <Link
            to="/auth/register"
            className="text-sm font-medium transition-colors"
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
