import { Outlet } from "react-router-dom";
import NavBar from "./NavBar";
import { SideBar } from "./SideBar";
import { useAuth } from "@/contexts/AuthContext";

export const AppLayout = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <div className="flex flex-1">
        {user && <SideBar />}
        <main className={`flex-1 bg-gray-50 overflow-y-auto ${user ? 'md:ml-64' : ''}`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};
