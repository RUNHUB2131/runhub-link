
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, UserType } from "../types";

interface AuthContextType {
  user: User | null;
  userType: UserType | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, userType: UserType) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userType, setUserType] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const storedUser = localStorage.getItem("runhub_user");
    const storedUserType = localStorage.getItem("runhub_user_type") as UserType | null;
    
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setUserType(storedUserType);
    }
    
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // In a real app, this would communicate with Supabase
      // For now we'll mock the authentication
      const mockUser = {
        id: "mock-id-" + Math.random().toString(36).substring(2, 9),
        email,
        user_type: localStorage.getItem("runhub_user_type") as UserType || null,
      };

      // Store user in local storage
      localStorage.setItem("runhub_user", JSON.stringify(mockUser));
      
      setUser(mockUser);
      setUserType(mockUser.user_type || null);
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, userType: UserType) => {
    setIsLoading(true);
    try {
      // In a real app, this would communicate with Supabase
      // For now we'll mock the registration
      const mockUser = {
        id: "mock-id-" + Math.random().toString(36).substring(2, 9),
        email,
        user_type: userType,
      };

      // Store user and user type in local storage
      localStorage.setItem("runhub_user", JSON.stringify(mockUser));
      localStorage.setItem("runhub_user_type", userType);
      
      setUser(mockUser);
      setUserType(userType);
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      // Remove user from local storage
      localStorage.removeItem("runhub_user");
      
      setUser(null);
      setUserType(null);
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, userType, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
