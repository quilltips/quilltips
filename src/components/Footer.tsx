
import { Link } from "react-router-dom";
import { Instagram, Twitter } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center space-y-6">
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <img 
                src="/lovable-uploads/qt_logo_text.png" 
                alt="Quilltips Logo" 
                className="h-6 w-auto"
              />
            </Link>
          </div>
          
          <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2 text-sm">
            <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
              Home
            </Link>
            <Link to="/about" className="text-muted-foreground hover:text-foreground transition-colors">
              About
            </Link>
            <Link to="/how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">
              How It Works
            </Link>
            <Link to="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </Link>
            <Link to="/faq" className="text-muted-foreground hover:text-foreground transition-colors">
              FAQ
            </Link>
            <Link to="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
              Contact
            </Link>
            <Link to="/stripe-help" className="text-muted-foreground hover:text-foreground transition-colors">
              Stripe Help
            </Link>
            <Link to="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
              Terms
            </Link>
            <Link to="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
              Privacy
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <a 
              href="https://instagram.com/quilltips" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Follow us on Instagram"
            >
              <Instagram className="h-5 w-5" />
            </a>
            <a 
              href="https://tiktok.com/@quilltips" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Follow us on TikTok"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
              </svg>
            </a>
            <a 
              href="https://twitter.com/quilltips" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Follow us on X/Twitter"
            >
              <Twitter className="h-5 w-5" />
            </a>
          </div>

          <span className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Quilltips LLC
          </span>
        </div>
      </div>
    </footer>
  );
};
