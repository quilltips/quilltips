
import { Link, useNavigate } from "react-router-dom";
import { Menu, Search } from "lucide-react";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSession } from '@supabase/auth-helpers-react';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { UserMenu } from "./navigation/UserMenu";
import { GuestMenu } from "./navigation/GuestMenu";
import { SearchBar } from "./navigation/SearchBar";

export const Navigation = () => {
  const [isAuthor, setIsAuthor] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const session = useSession();
  const navigate = useNavigate();
  const { toast } = useToast();

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

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      checkAuthStatus();
      
      if (event === 'SIGNED_IN') {
        toast({
          title: "Welcome back!",
          description: "You have successfully logged in.",
        });
      }
    });

    return () => subscription.unsubscribe();
  }, [session, toast]);

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

  const NavLinks = () => (
    <div className="flex items-center gap-4">
      <SearchBar />
      {session ? (
        <UserMenu 
          isAuthor={isAuthor}
          userId={userId}
          onLogout={handleLogout}
          isLoading={isLoading}
        />
      ) : (
        <GuestMenu />
      )}
    </div>
  );

  return (
    <nav className="fixed top-0 w-full bg-background z-50 border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link 
            to={isAuthor ? "/author/dashboard" : "/"} 
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <img 
              src="/lovable-uploads/8718ff3b-2170-4226-b088-575917507a51.png" 
              alt="Quilltips Logo" 
              className="h-5 w-auto"
            />
            <span className="text-lg font-medium">quilltips</span>
          </Link>
        </div>
        
        <div className="hidden md:block">
          <NavLinks />
        </div>

        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="hover:bg-accent/10">
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
