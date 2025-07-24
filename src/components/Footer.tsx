
import { Link } from "react-router-dom";
import { Instagram, Twitter, Mail, Linkedin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const Footer = () => {
  const [email, setEmail] = useState("");
  const { toast } = useToast();

  const subscribeMutation = useMutation({
    mutationFn: async (email: string) => {
      const { data, error } = await supabase
        .from('newsletter_subscribers')
        .insert([{ email, source: 'footer' }])
        .select()
        .single();
      
      if (error) {
        if (error.code === '23505') {
          // Update existing subscriber to active
          const { error: updateError } = await supabase
            .from('newsletter_subscribers')
            .update({ is_active: true, unsubscribed_at: null })
            .eq('email', email);
          
          if (updateError) throw updateError;
          return { email };
        }
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      setEmail("");
      toast({
        title: "Successfully subscribed!",
        description: "You'll receive our latest updates and insights.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Subscription failed",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    subscribeMutation.mutate(email);
  };

  return (
    <footer className="bg-[#19363c]">
      {/* Newsletter Signup - Left side */}
      <div className="container mx-auto px-4 py-20">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex flex-col items-start gap-2">
            <span className="text-sm text-white">Sign up for our newsletter!</span>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-white" />
              <form onSubmit={handleSubmit} className="flex items-center gap-2">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-48 h-8 text-sm"
                  disabled={subscribeMutation.isPending}
                />
                <Button 
                  type="submit" 
                  size="sm"
                  disabled={subscribeMutation.isPending}
                  className="h-8 px-3 text-xs bg-[#FFD166] text-gray-900 hover:bg-[#ffd166]"
                >
                  {subscribeMutation.isPending ? "..." : "Subscribe"}
                </Button>
              </form>
            </div>
          </div>

          {/* Main Footer Content */}
          <div className="flex-1">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              {/* Left-aligned navigation links in 3 columns, 2 rows */}
              <div className="grid grid-cols-3 gap-x-6 gap-y-2 text-sm">
                <Link to="/about" className="text-white hover:text-gray-300 transition-colors">
                  About
                </Link>
                <Link to="/how-it-works" className="text-white hover:text-gray-300 transition-colors">
                  How It Works
                </Link>
                <Link to="/pricing" className="text-white hover:text-gray-300 transition-colors">
                  Pricing
                </Link>
                <Link to="/blog" className="text-white hover:text-gray-300 transition-colors">
                  Blog
                </Link>
                <Link to="/contact" className="text-white hover:text-gray-300 transition-colors">
                  Contact
                </Link>
                <Link to="/faq" className="text-white hover:text-gray-300 transition-colors">
                  FAQ
                </Link>
              </div>

              {/* Right-aligned social links and copyright */}
              <div className="flex flex-col items-start md:items-end gap-4">
                {/* Social Links */}
                <div className="flex items-center gap-4">
                  <a
                    href="https://twitter.com/quilltips"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white hover:text-gray-300 transition-colors"
                  >
                    <Twitter className="h-5 w-5" />
                  </a>
                  <a
                    href="https://linkedin.com/company/quilltips"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white hover:text-gray-300 transition-colors"
                  >
                    <Linkedin className="h-5 w-5" />
                  </a>
                  <a 
                    href="https://instagram.com/quilltips" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-white hover:text-gray-300 transition-colors"
                    aria-label="Follow us on Instagram"
                  >
                    <Instagram className="h-5 w-5" />
                  </a>
                  <a 
                    href="https://tiktok.com/@quilltips" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-white hover:text-gray-300 transition-colors"
                    aria-label="Follow us on TikTok"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                    </svg>
                  </a>
                </div>

                {/* Legal Links and Copyright */}
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4 text-sm">
                  <Link to="/terms" className="text-white hover:text-gray-300 transition-colors">
                    Terms of Service
                  </Link>
                  <Link to="/privacy" className="text-white hover:text-gray-300 transition-colors">
                    Privacy Policy
                  </Link>
                  <span className="text-white">
                    © {new Date().getFullYear()} Quilltips LLC
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
