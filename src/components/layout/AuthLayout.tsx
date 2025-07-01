import { Outlet, Link } from "react-router-dom";

export const AuthLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center py-6 px-4 sm:py-12">
        <div className="mb-6 sm:mb-8">
          <Link to="/" className="runhub-logo">
            <img 
              src="/RUNHUB Blue (1).png" 
              alt="RUNHUB" 
              className="h-8 w-auto"
            />
          </Link>
        </div>
        <Outlet />
      </div>
    </div>
  );
};
