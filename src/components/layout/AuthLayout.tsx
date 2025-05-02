
import { Outlet, Link } from "react-router-dom";

export const AuthLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center py-12">
        <div className="mb-8">
          <Link to="/" className="runhub-logo text-3xl">RUNHUB</Link>
        </div>
        <Outlet />
      </div>
    </div>
  );
};
