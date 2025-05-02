
import { Link } from "react-router-dom";
import { Bell, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

export const NavBar = () => {
  const { user, logout } = useAuth();

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="runhub-logo">RUNHUB</Link>

        {user ? (
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="rounded-full relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500"></span>
            </Button>
            
            <Button variant="ghost" size="icon" className="rounded-full">
              <User className="h-5 w-5" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <Link to="/auth/login">
              <Button variant="ghost">Log in</Button>
            </Link>
            <Link to="/auth/register">
              <Button>Sign up</Button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};
