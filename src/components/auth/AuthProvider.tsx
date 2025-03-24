
import { useEffect, createContext, useContext, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import type { User } from '@supabase/supabase-js';

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isAuthor: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthor: false,
});

export const useAuth = () => useContext(AuthContext);

// Improved profile fetch function without the timeout that was causing issues
const fetchProfile = async (userId: string) => {
  console.log(`Fetching profile for user: ${userId}`);
  
  try {
    console.log("Sending request to Supabase...");
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .maybeSingle();

    if (profileError) {
      console.error("Profile fetch error:", profileError);
      return null;
    }

    console.log("Profile fetched successfully:", profile);
    return profile;
  } catch (error) {
    console.error("Profile fetch failed:", error);
    return null;
  }
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthor, setIsAuthor] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('Initializing auth...');
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          console.log('Session found:', session.user.id);
          setUser(session.user);
          
          try {
            const profile = await fetchProfile(session.user.id);
            const userIsAuthor = profile?.role === 'author';
            setIsAuthor(userIsAuthor);

            // Handle protected route access
            const isProtectedRoute = location.pathname.startsWith('/author');
            const isAuthRoute = location.pathname === '/author/login' || location.pathname === '/author/register';

            if (isProtectedRoute && !isAuthRoute && !userIsAuthor) {
              console.log('Unauthorized access attempt, redirecting to login...');
              navigate('/author/login');
              toast({
                title: "Unauthorized Access",
                description: "You must be an author to access this page.",
                variant: "destructive"
              });
            }
          } catch (profileError) {
            console.error('Profile fetch error:', profileError);
            toast({
              title: "Profile Error",
              description: "Could not load user profile. Please try again.",
              variant: "destructive"
            });
          }
        } else {
          console.log('No session found');
          setUser(null);
          setIsAuthor(false);

          // Redirect from protected routes when not authenticated
          if (location.pathname.startsWith('/author') && 
              location.pathname !== '/author/login' && 
              location.pathname !== '/author/register') {
            console.log('Unauthenticated access attempt, redirecting to login...');
            navigate('/author/login');
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        console.log("Finalizing auth setup: setting isLoading to false");
        setIsLoading(false);
      }
    };

    // Initialize auth state
    initializeAuth();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user);
        
        try {
          const profile = await fetchProfile(session.user.id);
          setIsAuthor(profile?.role === 'author');
          
          // Redirect authors to dashboard after login
          if (profile?.role === 'author' && location.pathname === '/') {
            navigate('/author/dashboard');
          }
        } catch (error) {
          console.error('Profile fetch error on auth state change:', error);
          toast({
            title: "Profile Error",
            description: "Could not load user profile. Please try again.",
            variant: "destructive"
          });
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setIsAuthor(false);
        navigate('/');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, location.pathname, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthor }}>
      {children}
    </AuthContext.Provider>
  );
};
