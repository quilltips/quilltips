
import { useEffect, createContext, useContext, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import type { User } from '@supabase/supabase-js';

// Auth context type
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

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthor, setIsAuthor] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    let initialized = false;

    const handleSession = async (user: User | null) => {
      setUser(user);

      if (user) {
        const profile = await fetchProfile(user.id);
        const userIsAuthor = profile?.role === 'author';
        setIsAuthor(userIsAuthor);

        const isProtectedRoute = location.pathname.startsWith('/author');
        const isAuthRoute = ['/author/login', '/author/register'].includes(location.pathname);

        if (isProtectedRoute && !isAuthRoute && !userIsAuthor) {
          navigate('/author/login');
          toast({
            title: "Unauthorized",
            description: "You must be an author to access this page.",
            variant: "destructive",
          });
        }
      } else {
        setIsAuthor(false);
        const isProtected = location.pathname.startsWith('/author') &&
          !['/author/login', '/author/register'].includes(location.pathname);

        if (isProtected) {
          navigate('/author/login');
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
