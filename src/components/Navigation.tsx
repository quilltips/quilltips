import { Link, useNavigate, useLocation } from "react-router-dom";
import { Search, Menu, ArrowLeft, Settings, User } from "lucide-react";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSession } from '@supabase/auth-helpers-react';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export const Navigation = () => {
  const [isAuthor, setIsAuthor] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const session = useSession();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const showBackButton = session && location.pathname !== '/author/dashboard';

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        if (session?.user) {
          setUserId(session.user.id);
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();
          
          if (error) throw error;
          setIsAuthor(profile?.role === 'author');
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
      }
    };

    checkAuthStatus();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkAuthStatus();
    });

    return () => subscription.unsubscribe();
  }, [session]);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      const { error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;

      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      toast({
        title: "Success",
        description: "You have been logged out.",
      });
      
      navigate('/');
    } catch (error: any) {
      console.error("Logout error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to log out. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const NavLinks = () => (
    <>
      <Link to="/search" className="hover-lift">
        <Button variant="ghost" size="icon">
          <Search className="h-5 w-5" />
        </Button>
      </Link>
      {session ? (
        <>
          {isAuthor && (
            <>
              <Link to="/author/dashboard" className="hover-lift hidden md:block">
                <Button variant="ghost">Dashboard</Button>
              </Link>
              <Link to={`/author/profile/${userId}`} className="hover-lift hidden md:block">
                <Button variant="ghost">
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </Button>
              </Link>
              <Link to="/author/bank-account" className="hover-lift hidden md:block">
                <Button variant="ghost">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </Link>
            </>
          )}
          <Button 
            variant="ghost" 
            onClick={handleLogout}
            disabled={isLoading}
            className="hover-lift"
          >
            {isLoading ? "Logging out..." : "Log out"}
          </Button>
        </>
      ) : (
        <>
          <Link to="/author/login">
            <Button variant="ghost" className="hover-lift w-full md:w-auto justify-start md:justify-center">
              Log in
            </Button>
          </Link>
          <Link to="/author/register">
            <Button variant="outline" className="hover-lift w-full md:w-auto justify-start md:justify-center">
              Register as Author
            </Button>
          </Link>
        </>
      )}
    </>
  );

  return (
    <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-sm border-b border-border z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {showBackButton && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className="mr-2 hover-lift"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <Link 
            to={isAuthor ? "/author/dashboard" : "/"} 
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <img 
              src="/lovable-uploads/8718ff3b-2170-4226-b088-575917507a51.png" 
              alt="Quilltips Logo" 
              className="h-6 w-auto"
            />
            <span className="text-xl font-semibold">quilltips</span>
          </Link>
        </div>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-4">
          <NavLinks />
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[80vw] sm:w-[385px]">
              <div className="flex flex-col gap-4 pt-8">
                <NavLinks />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};