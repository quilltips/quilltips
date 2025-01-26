import { Link, useNavigate, useLocation } from "react-router-dom";
import { Search, Menu, ArrowLeft, Settings, User } from "lucide-react";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSession } from '@supabase/auth-helpers-react';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "./ui/input";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { AuthorPublicProfileView } from "./AuthorPublicProfile";
import { Book } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export const Navigation = () => {
  const [isAuthor, setIsAuthor] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const session = useSession();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const showBackButton = session && location.pathname !== '/author/dashboard';

  const { data: searchResults } = useQuery({
    queryKey: ['search', query],
    queryFn: async () => {
      if (!query.trim()) return { authors: [], books: [] };
      
      const { data: authors, error: authorsError } = await supabase
        .from('profiles')
        .select('*')
        .ilike('name', `%${query}%`)
        .eq('role', 'author')
        .order('name')
        .limit(5);

      if (authorsError) throw authorsError;

      const { data: books, error: booksError } = await supabase
        .from('qr_codes')
        .select(`
          *,
          author:profiles(*)
        `)
        .ilike('book_title', `%${query}%`)
        .order('book_title')
        .limit(5);

      if (booksError) throw booksError;

      return {
        authors: authors || [],
        books: books || []
      };
    },
    enabled: query.length > 0
  });

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

  const handleSearchClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSearchOpen(true);
  };

  const NavLinks = () => (
    <>
      <div className="relative w-64">
        <Popover open={isSearchOpen} onOpenChange={setIsSearchOpen}>
          <PopoverTrigger asChild>
            <div className="relative" onClick={handleSearchClick}>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                placeholder="Search authors or books..."
                className="pl-10 hover-lift w-full"
              />
            </div>
          </PopoverTrigger>
          {query && searchResults && (
            <PopoverContent 
              className="w-[400px] p-0" 
              align="start"
              onClick={(e) => e.stopPropagation()}
            >
              <Card className="divide-y">
                {searchResults.authors.map((author) => (
                  <Link 
                    key={author.id} 
                    to={`/author/profile/${author.id}`} 
                    className="block p-4 hover:bg-accent"
                    onClick={() => {
                      setQuery("");
                      setIsSearchOpen(false);
                    }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <User className="h-4 w-4" />
                      <Badge variant="secondary">Author</Badge>
                    </div>
                    <AuthorPublicProfileView
                      name={author.name || 'Anonymous Author'}
                      bio={author.bio || 'No bio available'}
                      imageUrl="/placeholder.svg"
                      authorId={author.id}
                    />
                  </Link>
                ))}
                {searchResults.books.map((book) => (
                  <Link 
                    key={book.id} 
                    to={`/author/profile/${book.author.id}`} 
                    className="block p-4 hover:bg-accent"
                    onClick={() => {
                      setQuery("");
                      setIsSearchOpen(false);
                    }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Book className="h-4 w-4" />
                      <Badge variant="secondary">Book</Badge>
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-semibold">{book.book_title}</h3>
                      <p className="text-sm text-muted-foreground">
                        By {book.author.name || 'Anonymous Author'}
                      </p>
                    </div>
                  </Link>
                ))}
                {(!searchResults.authors.length && !searchResults.books.length) && (
                  <div className="p-4 text-center text-muted-foreground">
                    No results found for "{query}"
                  </div>
                )}
              </Card>
            </PopoverContent>
          )}
        </Popover>
      </div>
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