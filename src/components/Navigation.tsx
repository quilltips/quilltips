import { Link, useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const Navigation = () => {
  const [isAuthor, setIsAuthor] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuthStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        
        setIsAuthor(profile?.role === 'author');
      }
    };

    checkAuthStatus();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkAuthStatus();
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to log out. Please try again.",
      });
    } else {
      toast({
        title: "Success",
        description: "You have been logged out.",
      });
      navigate('/');
    }
  };

  return (
    <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-sm border-b border-border z-50">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <Link 
          to={isAuthor ? "/author/dashboard" : "/"} 
          className="text-xl font-semibold hover:opacity-80 transition-opacity"
        >
          quilltips
        </Link>
        
        <div className="flex items-center gap-4 px-2">
          <Link to="/search" className="hover-lift">
            <Button variant="ghost" size="icon">
              <Search className="h-5 w-5" />
            </Button>
          </Link>
          {isAuthenticated ? (
            <Button 
              variant="ghost" 
              onClick={handleLogout}
              className="hover-lift"
            >
              Log out
            </Button>
          ) : (
            <>
              <Link to="/author/login">
                <Button variant="ghost" className="hover-lift">
                  Log in
                </Button>
              </Link>
              <Link to="/author/register">
                <Button variant="outline" className="hover-lift">
                  Register as Author
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};