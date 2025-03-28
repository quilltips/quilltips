
import { Link, useNavigate } from "react-router-dom";
import { Menu, User, ChevronDown } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { GuestMenu } from "./navigation/GuestMenu";
import { SearchBar } from "./navigation/SearchBar";
import { useAuth } from "./auth/AuthProvider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Navigation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { user, isAuthor } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    setIsLoading(true);
    try {
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

  const UserDropdownMenu = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-1 text-sm font-medium">
          <User className="h-4 w-4" />
          <span className="hidden md:block">Account</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 bg-white">
        <DropdownMenuItem onClick={() => navigate('/author/dashboard')}>
          Dashboard
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/author/tip-feed')}>
          Tip feed
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/author/book-qr-codes')}>
          Book QR codes
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/author/data')}>
          Data
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/author/settings')}>
          Settings
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate(`/author/profile/${user?.id}`)}>
          Public profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleLogout} disabled={isLoading}>
          {isLoading ? "Logging out..." : "Log out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const NavLinks = () => (
    <div className="flex items-center gap-4">
      <SearchBar />
      {user ? (
        <UserDropdownMenu />
      ) : (
        <GuestMenu />
      )}
    </div>
  );

  return (
    <nav className="fixed top-0 w-full bg-background z-50">
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
