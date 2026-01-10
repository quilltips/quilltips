
import { useEffect, createContext, useContext, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import type { User } from '@supabase/supabase-js';

// Auth context type
type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isAuthor: boolean;
  isAdmin: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthor: false,
  isAdmin: false,
});

export const useAuth = () => useContext(AuthContext);

// Profile fetch helper
const fetchProfile = async (userId: string) => {
  try {
    console.log(`Fetching profile for user: ${userId}`);
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      console.error("Profile fetch error:", error);
      return null;
    }

    return profile;
  } catch (err) {
    console.error("Profile fetch failed:", err);
    return null;
  }
};

// Check if a route requires authentication
const isProtectedRoute = (pathname: string): boolean => {
  // Admin routes require admin access
  if (pathname.startsWith('/admin')) {
    return true;
  }
  
  // Specific protected author routes that require authentication
  const protectedAuthorRoutes = [
    '/author/dashboard',
    '/author/settings',
    '/author/book-qr-codes',
    '/author/create-qr',
    '/author/data',
    '/author/bank-account',
    '/author/book/',     // /author/book/:bookSlug (QR code details for authors)
    '/author/qr/',       // /author/qr/:id (legacy UUID route)
    '/author/tip-feed',  // Tip feed page
    '/author/profile/',  // Author's own profile management
  ];
  
  // Check if the route is a protected author route
  if (pathname.startsWith('/author/')) {
    return protectedAuthorRoutes.some(route => pathname.startsWith(route));
  }
  
  return false;
};

const isAdminRoute = (pathname: string): boolean => {
  return pathname.startsWith('/admin');
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthor, setIsAuthor] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    let initialized = false;

    const handleSession = async (user: User | null) => {
      setUser(user);

      if (user) {
        // Check if user's email is verified
        const isEmailVerified = user.email_confirmed_at !== null;
        
        if (!isEmailVerified) {
          // User is not verified, redirect to verification page
          console.log("User email not verified, redirecting to verification");
          setUser(null);
          setIsAuthor(false);
          setIsAdmin(false);
          
          // Check if we're already on a verification page to avoid redirect loops
          if (!location.pathname.includes('/verify-email')) {
            navigate('/author/verify-email', { 
              state: { email: user.email },
              replace: true 
            });
          }
          setIsLoading(false);
          return;
        }

        const profile = await fetchProfile(user.id);
        const userIsAuthor = profile?.role === 'author';
        const userIsAdmin = profile?.role === 'admin';
        setIsAuthor(userIsAuthor);
        setIsAdmin(userIsAdmin);

        const needsAuth = isProtectedRoute(location.pathname);
        const needsAdmin = isAdminRoute(location.pathname);

        if (needsAdmin && !userIsAdmin) {
          navigate('/');
          toast({
            title: "Unauthorized",
            description: "You must be an admin to access this page.",
            variant: "destructive",
          });
        } else if (needsAuth && !userIsAuthor && !userIsAdmin) {
          navigate('/author/login');
          toast({
            title: "Unauthorized",
            description: "You must be an author to access this page.",
            variant: "destructive",
          });
        }
      } else {
        setIsAuthor(false);
        setIsAdmin(false);
        const needsAuth = isProtectedRoute(location.pathname);

        if (needsAuth) {
          if (isAdminRoute(location.pathname)) {
            navigate('/');
          } else {
            navigate('/author/login');
          }
        }
      }

      setIsLoading(false);
    };

    // Initial check
    supabase.auth.getUser().then(({ data, error }) => {
      if (!initialized) {
        handleSession(data.user ?? null);
        initialized = true;
      }
    });

    // Listen to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("🔄 Auth event:", event, session?.user?.id);
      handleSession(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [navigate, location.pathname, toast]);

  // Only show loading spinner for protected routes that require authentication
  if (isLoading && isProtectedRoute(location.pathname)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthor, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};
