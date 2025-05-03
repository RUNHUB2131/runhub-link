
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import NotificationsDropdown from "@/components/notifications/NotificationsDropdown";

export const NavBar = () => {
  const { user, logout } = useAuth();

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="runhub-logo">RUNHUB</Link>

        {user ? (
          <div className="flex items-center gap-4">
            <NotificationsDropdown />
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
