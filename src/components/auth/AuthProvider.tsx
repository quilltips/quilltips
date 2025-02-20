
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      try {
        console.log('Checking auth state...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth check error:', error);
          toast({
            title: "Authentication Error",
            description: "There was an error checking your session. Please try logging in again.",
            variant: "destructive"
          });
          return;
        }

        console.log('Auth session state:', session ? 'Authenticated' : 'Not authenticated');
        
        // If user is on root and authenticated as author, redirect to dashboard
        if (session && location.pathname === '/') {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .maybeSingle();
            
          if (profileError) {
            console.error('Profile fetch error:', profileError);
            return;
          }

          console.log('User role:', profile?.role);
          
          if (profile?.role === 'author') {
            console.log('Redirecting author to dashboard...');
            navigate('/author/dashboard');
          }
        }
        
        // If user tries to access protected routes without auth
        const isProtectedRoute = location.pathname.startsWith('/author');
        const isAuthRoute = location.pathname === '/author/login' || location.pathname === '/author/register';
        
        if (isProtectedRoute && !isAuthRoute && !session) {
          console.log('Unauthorized access attempt, redirecting to login...');
          navigate('/author/login', { state: { from: location.pathname } });
          toast({
            title: "Authentication Required",
            description: "Please log in to access this page.",
          });
        }
      } catch (error) {
        console.error('Auth check error:', error);
      }
    };

    const authListener = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      checkAuthAndRedirect();
    });

    // Initial check
    checkAuthAndRedirect();

    return () => {
      authListener.data.subscription.unsubscribe();
    };
  }, [navigate, location.pathname, toast]);

  return <>{children}</>;
};
