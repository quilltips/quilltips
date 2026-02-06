
import { Link, useNavigate } from "react-router-dom";
import { Menu, User, ChevronDown, Search, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { GuestMenu } from "./navigation/GuestMenu";
import { SearchBar } from "./navigation/SearchBar";
import { useAuth } from "./auth/AuthProvider";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import logoUrl from "@/assets/Logo_Nav_Text.svg";
import { useQuery } from "@tanstack/react-query";
import { getAuthorUrl } from "@/lib/url-utils";

export const Navigation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAboutExpanded, setIsAboutExpanded] = useState(false);
  const { user, isAuthor } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fetch the user's profile to get their actual slug
  const { data: userProfile } = useQuery({
    queryKey: ['user-profile-nav', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('id, slug')
        .eq('id', user.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

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
        <DropdownMenuItem onClick={() => navigate('/author/book-qr-codes?tab=all')}>
          Book QR codes
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/author/data')}>
          Data
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/author/settings')}>
          Settings
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate(getAuthorUrl({ id: user!.id, slug: userProfile?.slug }))}>
          Public profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleLogout} disabled={isLoading}>
          {isLoading ? "Logging out..." : "Log out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>;

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    setIsAboutExpanded(false);
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
    <div className="flex flex-col space-y-4 flex-1 overflow-y-auto">
      {/* Home Section - Always visible */}
      <div className="border-b border-gray-200 pb-4">
        <div className="flex flex-col space-y-1">
          <Link 
            to="/" 
            className="px-4 py-2 hover:bg-accent/10 rounded-md"
            onClick={closeMobileMenu}
          >
            Home
          </Link>
        </div>
      </div>

      {/* Login Section - Only for guests */}
      {!user && (
        <div className="border-b border-gray-200 pb-4">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 px-4">
            Account
          </h3>
          <div className="flex flex-col space-y-1">
            <MobileGuestMenu />
          </div>
        </div>
      )}

      {/* Search Section - Always visible */}
      <div className="border-b border-gray-200 pb-4">
        <div className="flex flex-col space-y-1">
          <Link 
            to="/search" 
            className="px-4 py-2 hover:bg-accent/10 rounded-md"
            onClick={closeMobileMenu}
          >
            Search
          </Link>
        </div>
      </div>

      {/* About Section - Collapsible */}
      <div className="border-b border-gray-200 pb-4">
        <button
          onClick={() => setIsAboutExpanded(!isAboutExpanded)}
          className="w-full px-4 py-2 text-left hover:bg-accent/10 rounded-md flex items-center justify-between"
        >
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            About
          </h3>
          <ChevronRight 
            className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${
              isAboutExpanded ? 'rotate-90' : ''
            }`} 
          />
        </button>
        {isAboutExpanded && (
          <div className="flex flex-col space-y-1 mt-2">
            <Link 
              to="/about" 
              className="px-4 py-2 hover:bg-accent/10 rounded-md"
              onClick={closeMobileMenu}
            >
              About Quilltips
            </Link>
            <Link 
              to="/how-it-works" 
              className="px-4 py-2 hover:bg-accent/10 rounded-md"
              onClick={closeMobileMenu}
            >
              How It Works
            </Link>
            <Link 
              to="/faq" 
              className="px-4 py-2 hover:bg-accent/10 rounded-md"
              onClick={closeMobileMenu}
            >
              FAQs
            </Link>
          </div>
        )}
      </div>

      {/* Pricing Section */}
      <div className="border-b border-gray-200 pb-4">
        <div className="flex flex-col space-y-1">
          <Link 
            to="/pricing" 
            className="px-4 py-2 hover:bg-accent/10 rounded-md"
            onClick={closeMobileMenu}
          >
            Pricing
          </Link>
        </div>
      </div>

      {/* Blog Section */}
      <div className="border-b border-gray-200 pb-4">
        <div className="flex flex-col space-y-1">
          <Link 
            to="/blog" 
            className="px-4 py-2 hover:bg-accent/10 rounded-md"
            onClick={closeMobileMenu}
          >
            Blog
          </Link>
        </div>
      </div>

      {/* Account Section - Only for logged in users */}
      {user && (
        <div className="border-b border-gray-200 pb-4 mb-0">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 px-4">
            Account
          </h3>
          <div className="flex flex-col space-y-1">
            <Link 
              to="/author/dashboard" 
              className="px-4 py-2 hover:bg-accent/10 rounded-md"
              onClick={closeMobileMenu}
            >
              Dashboard
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
              to={getAuthorUrl({ id: user!.id, slug: userProfile?.slug })} 
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
          </div>
        </div>
      )}
    </div>
  );

  return (
    <nav className="fixed top-0 w-full bg-background z-50 border-b border-gray-100">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        {/* Left side: Logo and main navigation */}
        <div className="flex items-center gap-8">
          <Link 
            to={isAuthor ? "/author/dashboard" : "/"} 
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <img src={logoUrl} alt="Quilltips Logo" className="h-8 w-auto" />
          </Link>
          
          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            {/* About Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-[#19363C] transition-colors px-0">
                  About
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48 bg-white">
                <DropdownMenuItem onClick={() => navigate('/about')}>
                  About
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/how-it-works')}>
                  How It Works
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/faq')}>
                  FAQs
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* Pricing Link */}
            <Link 
              to="/pricing" 
              className="text-sm font-medium text-gray-700 hover:text-[#19363C] transition-colors"
            >
              Pricing
            </Link>
            
            {/* Blog Link */}
            <Link 
              to="/blog" 
              className="text-sm font-medium text-gray-700 hover:text-[#19363C] transition-colors"
            >
              Blog
            </Link>
          </div>
        </div>
        
        {/* Right side: Search and user actions */}
        <div className="flex items-center gap-4">
          <div className="hidden md:block">
            <SearchBar />
          </div>
          {user ? (
            <div className="hidden md:block">
              <UserDropdownMenu />
            </div>
          ) : (
            <div className="hidden md:block">
              <GuestMenu />
            </div>
          )}
        </div>

        {/* Mobile menu button */}
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
              <div className="flex flex-col h-full pt-8 pb-4">
                {/* Navigation Menu */}
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
