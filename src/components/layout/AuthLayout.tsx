import { Outlet, Link } from "react-router-dom";

export const AuthLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center py-6 px-4 sm:py-12">
        <div className="mb-6 sm:mb-8">
          <Link to="/" className="runhub-logo text-2xl sm:text-3xl">RUNHUB</Link>
        </div>
        <Outlet />
      </div>
    </div>
  );
};
