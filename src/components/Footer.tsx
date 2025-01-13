import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="mt-auto py-8 bg-background border-t">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <Link to="/" className="flex items-center gap-2">
            <img 
              src="/lovable-uploads/8718ff3b-2170-4226-b088-575917507a51.png" 
              alt="Quilltips Logo" 
              className="h-6 w-auto"
            />
            <span className="text-xl font-semibold">quilltips</span>
          </Link>
          
          <nav className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
            <Link to="/about" className="hover:text-foreground transition-colors">
              About
            </Link>
            <Link to="/faq" className="hover:text-foreground transition-colors">
              FAQ
            </Link>
            <Link to="/contact" className="hover:text-foreground transition-colors">
              Contact
            </Link>
          </nav>
        </div>
        
        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Quilltips. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};