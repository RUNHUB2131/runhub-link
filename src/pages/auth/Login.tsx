import { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  
  const redirectTo = searchParams.get('redirect') || '/dashboard';
  const prefilledEmail = searchParams.get('email') || '';
  const isVerified = searchParams.get('verified') === 'true';

  useEffect(() => {
    if (prefilledEmail) {
      setEmail(prefilledEmail);
    }
    
    if (isVerified && prefilledEmail) {
      toast({
        title: "Email verified",
        description: "Your email has been verified through the secure link. Please enter your password to complete sign in.",
      });
    }
  }, [prefilledEmail, isVerified, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await login(email, password);
      toast({
        title: "Login successful",
        description: "Welcome back to RUNHUB LINK!",
      });
      navigate(redirectTo);
    } catch (error) {
      console.error(error);
      // Error is handled in AuthContext
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 sm:px-0">
      <div className="text-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Log in</h1>
        {isVerified ? (
          <div className="flex items-center justify-center mb-2">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            <p className="text-sm text-green-600">Email verified securely</p>
          </div>
        ) : null}
        <p className="text-gray-500 text-sm sm:text-base">
          {isVerified ? "Please enter your password to complete sign in" : "Welcome back! Please enter your details"}
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="h-11"
            readOnly={isVerified}
          />
          {isVerified && (
            <p className="text-xs text-green-600">This email was verified through your secure link</p>
          )}
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link to="/auth/forgot-password" className="text-xs sm:text-sm text-primary-500 hover:underline">
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="h-11"
            autoFocus={isVerified}
          />
        </div>
        
        <Button 
          type="submit" 
          className="w-full h-11" 
          disabled={isLoading}
        >
          {isLoading ? "Logging in..." : "Log in"}
        </Button>
      </form>
      
      <div className="mt-6 text-center">
        <p className="text-gray-500 text-sm sm:text-base">
          Don't have an account?{" "}
          <Link to="/auth/user-type" className="text-primary-500 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
