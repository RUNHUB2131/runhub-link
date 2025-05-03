
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";

import { AppLayout } from "./components/layout/AppLayout";
import { AuthLayout } from "./components/layout/AuthLayout";
import { ProtectedRoute } from "./components/layout/ProtectedRoute";

import Index from "./pages/Index";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import UserTypeSelection from "./pages/auth/UserTypeSelection";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

// Opportunity routes
import Opportunities from "./pages/opportunities/Opportunities";
import AddOpportunity from "./pages/opportunities/AddOpportunity";
import EditOpportunity from "./pages/opportunities/EditOpportunity";
import OpportunityDetails from "./pages/opportunities/OpportunityDetails";
import OpportunityApplications from "./pages/opportunities/OpportunityApplications";

// Application routes
import MyApplications from "./pages/applications/MyApplications";

// Create the query client as a constant instead of inside the component
const queryClient = new QueryClient();

function App() {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              
              {/* Auth routes */}
              <Route element={<AuthLayout />}>
                <Route path="/auth/login" element={<Login />} />
                <Route path="/auth/register" element={<Register />} />
                <Route path="/auth/user-type" element={<UserTypeSelection />} />
              </Route>
              
              {/* Protected routes */}
              <Route element={<ProtectedRoute />}>
                <Route element={<AppLayout />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/profile" element={<Profile />} />
                  
                  {/* Opportunities routes */}
                  <Route path="/opportunities" element={<Opportunities />} />
                  <Route path="/opportunities/add" element={<AddOpportunity />} />
                  <Route path="/opportunities/edit/:id" element={<EditOpportunity />} />
                  <Route path="/opportunities/:id" element={<OpportunityDetails />} />
                  <Route path="/opportunities/applications/:id" element={<OpportunityApplications />} />
                  
                  {/* Applications routes */}
                  <Route path="/applications" element={<MyApplications />} />
                  <Route path="/messages" element={<h1 className="text-3xl font-bold">Messages</h1>} />
                </Route>
              </Route>
              
              {/* Catch-all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}

export default App;
