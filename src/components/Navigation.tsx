import { Link } from "react-router-dom";
import { Search, LogIn } from "lucide-react";
import { Button } from "./ui/button";

export const Navigation = () => {
  return (
    <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-sm border-b border-border z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="text-xl font-semibold hover:opacity-80 transition-opacity">
          QuillTips
        </Link>
        
        <div className="flex items-center gap-4">
          <Link to="/search" className="hover-lift">
            <Button variant="ghost" size="icon">
              <Search className="h-5 w-5" />
            </Button>
          </Link>
          <Link to="/author/login">
            <Button variant="ghost" size="icon">
              <LogIn className="h-5 w-5" />
            </Button>
          </Link>
          <Link to="/author/register">
            <Button variant="outline" className="hover-lift">
              Register as Author
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};