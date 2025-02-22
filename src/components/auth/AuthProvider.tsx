
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

// Helper function to fetch profile with timeout
const fetchProfileWithTimeout = async (userId: string, timeoutMs: number = 5000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .maybeSingle()
      .abortSignal(controller.signal);

    clearTimeout(timeoutId);

    if (profileError) {
      console.error('Profile fetch error:', profileError);
      throw profileError;
    }

    return profile;
  } catch (error) {
    clearTimeout(timeoutId);
    if ((error as Error).name === 'AbortError') {
      throw new Error('Profile fetch timed out');
    }
    throw error;
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
            const profile = await fetchProfileWithTimeout(session.user.id);
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
            toast({
              title: "Authentication Required",
              description: "Please log in to access this page.",
            });
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        toast({
          title: "Authentication Error",
          description: "There was a problem checking your session. Please try logging in again.",
          variant: "destructive"
        });
      } finally {
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
          const profile = await fetchProfileWithTimeout(session.user.id);
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
