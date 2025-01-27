import { Link } from "react-router-dom";
import { Menu } from "lucide-react";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSession } from '@supabase/auth-helpers-react';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SearchBar } from "./navigation/SearchBar";
import { UserMenu } from "./navigation/UserMenu";
import { GuestMenu } from "./navigation/GuestMenu";

export const Navigation = () => {
  const [isAuthor, setIsAuthor] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const session = useSession();
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
    <>
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
    </>
  );

  return (
    <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-sm border-b border-border z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
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