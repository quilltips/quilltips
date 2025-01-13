import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="bg-white border-t">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <img 
                src="/lovable-uploads/8718ff3b-2170-4226-b088-575917507a51.png" 
                alt="Quilltips Logo" 
                className="h-6 w-auto"
              />
              <span className="text-xl font-semibold">quilltips</span>
            </Link>
          </div>
          
          <nav className="flex flex-wrap justify-center gap-6">
            <Link to="/about" className="text-sm text-gray-600 hover:text-gray-900">
              About
            </Link>
            <Link to="/contact" className="text-sm text-gray-600 hover:text-gray-900">
              Contact
            </Link>
            <Link to="/faq" className="text-sm text-gray-600 hover:text-gray-900">
              FAQ
            </Link>
            <Link to="/terms" className="text-sm text-gray-600 hover:text-gray-900">
              Terms of Service
            </Link>
          </nav>
          
          <div className="text-sm text-gray-500">
            © {new Date().getFullYear()} Quilltips. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};