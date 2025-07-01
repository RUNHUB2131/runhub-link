import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, UserType } from "../types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Session } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  userType: UserType | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, userType: UserType, extraData?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userType, setUserType] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);

  // Set up authentication state listener
  useEffect(() => {
    // First, set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state changed:", event, session);
        setSession(session);
        
        if (session?.user) {
          const userData: User = {
            id: session.user.id,
            email: session.user.email || '',
            user_type: session.user.user_metadata?.user_type as UserType || null
          };
          
          setUser(userData);
          setUserType(userData.user_type || null);
          
          // If user_type is not in metadata, try fetching from profiles
          if (!userData.user_type) {
            setTimeout(() => {
              fetchUserProfile(session.user.id);
            }, 0);
          }
        } else {
          setUser(null);
          setUserType(null);
        }
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      
      if (session?.user) {
        const userData: User = {
          id: session.user.id,
          email: session.user.email || '',
          user_type: session.user.user_metadata?.user_type as UserType || null
        };
        
        setUser(userData);
        setUserType(userData.user_type || null);
        
        // If user_type is not in metadata, try fetching from profiles
        if (!userData.user_type) {
          fetchUserProfile(session.user.id);
        }
      }
      
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('id', userId)
        .maybeSingle();
      
      if (error) {
        console.error("Error fetching user profile:", error);
        return;
      }
      
      if (data && data.user_type) {
        setUserType(data.user_type as UserType);
        
        // Update local user object
        setUser(prev => 
          prev ? { ...prev, user_type: data.user_type as UserType } : null
        );
      }
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: error.message || "An error occurred during login",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, userType: UserType, extraData?: string) => {
    setIsLoading(true);
    try {
      const metadata: { user_type: UserType; company_name?: string; club_name?: string } = {
        user_type: userType
      };
      
      if (userType === 'brand' && extraData) {
        metadata.company_name = extraData;
      } else if (userType === 'run_club' && extraData) {
        metadata.club_name = extraData;
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
          emailRedirectTo: `${window.location.origin}/auth/confirm`
        }
      });
      
      if (error) throw error;
      
      // The database trigger function will automatically create the profile records
      // including the brand_profiles with company_name from metadata
      
    } catch (error: any) {
      console.error("Registration error:", error);
      toast({
        title: "Registration failed",
        description: error.message || "An error occurred during registration",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      // We need to set the session to null first to prevent the "Auth session missing!" error
      setUser(null);
      setUserType(null);
      setSession(null);
      
      // Then sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
    } catch (error: any) {
      console.error("Logout error:", error);
      toast({
        title: "Logout failed",
        description: error.message || "An error occurred during logout",
        variant: "destructive",
      });
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
