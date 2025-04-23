
import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex flex-col items-start">
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity mb-2">
              <img 
                src="/lovable-uploads/qt_logo_text.png" 
                alt="Quilltips Logo" 
                className="h-6 w-auto"
              />
            </Link>
            <span className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Quilltips LLC
            </span>
          </div>
          
          <div className="grid grid-cols-3 gap-x-8 gap-y-2">
            <div className="space-y-2">
              <Link to="/" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Home
              </Link>
              <Link to="/about" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                About
              </Link>
              <Link to="/faq" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                FAQ
              </Link>
            </div>
            <div className="space-y-2">
              <Link to="/how-it-works" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                How It Works
              </Link>
              <Link to="/pricing" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Pricing
              </Link>
              <Link to="/stripe-help" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Stripe Help
              </Link>
              <Link to="/contact" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Contact
              </Link>
            </div>
            <div className="space-y-2">
              <Link to="/terms" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Terms
              </Link>
              <Link to="/privacy" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Privacy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
