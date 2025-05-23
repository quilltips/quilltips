
import { Link, useNavigate } from "react-router-dom";
import { Menu, User, ChevronDown } from "lucide-react";
import { Button } from "./ui/button";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { GuestMenu } from "./navigation/GuestMenu";
import { SearchBar } from "./navigation/SearchBar";
import { MobileSearchSheet } from "./navigation/MobileSearchSheet";
import { useAuth } from "./auth/AuthProvider";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export const Navigation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isAuthor } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    return () => setIsMobileMenuOpen(false);
  }, []);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast({
        title: "Success",
        description: "You have been logged out."
      });
      navigate('/');
    } catch (error: any) {
      console.error("Logout error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to log out. Please try again."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const UserDropdownMenu = () => <DropdownMenu>
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
        <DropdownMenuItem onClick={() => navigate('/author/book-qr-codes?tab=all')}>
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
    </DropdownMenu>;

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // Single Guest Log In Button for mobile menu (used in MobileMenu below, not both places)
  const MobileGuestMenu = () => (
    <Link 
      to="/author/login" 
      className="px-4 py-2 hover:bg-accent/10 rounded-md"
      onClick={closeMobileMenu}
    >
      Login
    </Link>
  );

  // Pass this callback to child for after navigation (ex: from mobile search, or mobile nav links)
  const handleMobileNavigate = () => {
    closeMobileMenu();
  };

  // Refined, only one Log in button ensured for unauthenticated users
  const MobileMenu = () => (
    <div className="flex flex-col space-y-4">
      {user ? (
        <>
          <Link 
            to="/author/dashboard" 
            className="px-4 py-2 hover:bg-accent/10 rounded-md"
            onClick={closeMobileMenu}
          >
            Dashboard
          </Link>
          <Link 
            to="/author/tip-feed" 
            className="px-4 py-2 hover:bg-accent/10 rounded-md"
            onClick={closeMobileMenu}
          >
            Tip feed
          </Link>
          <Link 
            to="/author/book-qr-codes?tab=all" 
            className="px-4 py-2 hover:bg-accent/10 rounded-md"
            onClick={closeMobileMenu}
          >
            Book QR codes
          </Link>
          <Link 
            to="/author/data" 
            className="px-4 py-2 hover:bg-accent/10 rounded-md"
            onClick={closeMobileMenu}
          >
            Data
          </Link>
          <Link 
            to="/author/settings" 
            className="px-4 py-2 hover:bg-accent/10 rounded-md"
            onClick={closeMobileMenu}
          >
            Settings
          </Link>
          <Link 
            to={`/author/profile/${user?.id}`} 
            className="px-4 py-2 hover:bg-accent/10 rounded-md"
            onClick={closeMobileMenu}
          >
            Public profile
          </Link>
          <button
            onClick={() => {
              closeMobileMenu();
              handleLogout();
            }}
            disabled={isLoading}
            className="px-4 py-2 text-left hover:bg-accent/10 rounded-md text-red-500"
          >
            {isLoading ? "Logging out..." : "Log out"}
          </button>
        </>
      ) : (
        <MobileGuestMenu />
      )}
    </div>
  );

  const NavLinks = () => (
    <div className="flex items-center gap-4">
      <div className="hidden md:block">
        <SearchBar />
      </div>
      <div className="md:hidden">
        {/* Pass handleMobileNavigate so search sheet can close the mobile sheet after navigation */}
        <MobileSearchSheet onNavigate={handleMobileNavigate} />
      </div>
      {user ? (
        <div className="hidden md:block">
          <UserDropdownMenu />
        </div>
      ) : (
        // Only show GuestMenu on desktop (since mobile nav already covers unauth flow)
        <div className="hidden md:block">
          <GuestMenu />
        </div>
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
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <img src="/lovable-uploads/qt_logo_text.png" alt="Quilltips Logo" className="h-7 w-auto" />
          </Link>
        </div>
        
        <div className="hidden md:block">
          <NavLinks />
        </div>

        <div className="md:hidden">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="hover:bg-accent/10 p-3">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[80vw] sm:w-[385px]">
              <SheetTitle className="sr-only">Mobile Menu</SheetTitle>
              <SheetDescription className="sr-only">
                Use this panel to navigate to different parts of the site.
              </SheetDescription>
              <div className="flex flex-col gap-4 pt-8">
                {/* NavLinks includes mobile search bar with onNavigate to control closing sheet */}
                <NavLinks />
                {/* Only one "Log in" via this menu for unauth */}
                <MobileMenu />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};

// File is getting long – consider splitting components for maintainability!
