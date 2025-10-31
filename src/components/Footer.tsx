
import { Link } from "react-router-dom";
import { Instagram, Twitter, Mail, Linkedin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import logoUrl from "@/assets/Logo_Nav_Text.svg";

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
      <div className="container mx-auto px-4 md:px-8">
        {/* Top Section: Newsletter and Links */}
        <div className="py-12 md:py-16">
          {/* Newsletter Section */}
          <div className="mb-12 md:mb-10">
            <div className="max-w-2xl">
              <h2 className="text-base md:text-lg font-medium text-white mb-3 md:mb-4">
                Sign up for our newsletter
              </h2>
              <form onSubmit={handleSubmit} className="flex flex-col md:flex-row items-start md:items-center gap-3">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full md:w-64 h-10 text-sm bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:bg-white/20"
                  disabled={subscribeMutation.isPending}
                />
                <Button 
                  type="submit" 
                  disabled={subscribeMutation.isPending}
                  className="h-10 px-6 text-sm bg-[#FFD166] text-gray-900 hover:bg-[#ffd166] font-medium"
                >
                  {subscribeMutation.isPending ? "..." : "Subscribe"}
                </Button>
              </form>
            </div>
          </div>

          {/* Navigation and Social Links */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12">
            {/* Navigation Links */}
            <div>
              <h3 className="text-sm md:text-base font-medium text-white mb-4 md:mb-5">Navigate</h3>
              <nav className="flex flex-col gap-2 md:gap-3">
                <Link 
                  to="/about" 
                  className="text-sm md:text-base text-white/80 hover:text-white transition-colors"
                >
                  About
                </Link>
                <Link 
                  to="/how-it-works" 
                  className="text-sm md:text-base text-white/80 hover:text-white transition-colors"
                >
                  How It Works
                </Link>
                <Link 
                  to="/pricing" 
                  className="text-sm md:text-base text-white/80 hover:text-white transition-colors"
                >
                  Pricing
                </Link>
                <Link 
                  to="/blog" 
                  className="text-sm md:text-base text-white/80 hover:text-white transition-colors"
                >
                  Blog
                </Link>
                <Link 
                  to="/contact" 
                  className="text-sm md:text-base text-white/80 hover:text-white transition-colors"
                >
                  Contact
                </Link>
                <Link 
                  to="/faq" 
                  className="text-sm md:text-base text-white/80 hover:text-white transition-colors"
                >
                  FAQ
                </Link>
                <a 
                  href="/sitemap.xml" 
                  className="text-sm md:text-base text-white/80 hover:text-white transition-colors"
                >
                  Sitemap
                </a>
              </nav>
            </div>

            {/* Social and Legal */}
            <div>
              <h3 className="text-sm md:text-base font-medium text-white mb-4 md:mb-5">Connect</h3>
              <div className="flex flex-col gap-5 md:gap-6">
                {/* Social Links */}
                <div className="flex items-center gap-4">
                  <a
                    href="https://twitter.com/quilltips"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/80 hover:text-white transition-colors"
                    aria-label="Follow us on Twitter"
                  >
                    <Twitter className="h-5 w-5 md:h-5 md:w-5" />
                  </a>
                  <a
                    href="https://linkedin.com/company/quilltips"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/80 hover:text-white transition-colors"
                    aria-label="Follow us on LinkedIn"
                  >
                    <Linkedin className="h-5 w-5 md:h-5 md:w-5" />
                  </a>
                  <a 
                    href="https://instagram.com/quilltips" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-white/80 hover:text-white transition-colors"
                    aria-label="Follow us on Instagram"
                  >
                    <Instagram className="h-5 w-5 md:h-5 md:w-5" />
                  </a>
                  <a 
                    href="https://tiktok.com/@quilltips" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-white/80 hover:text-white transition-colors"
                    aria-label="Follow us on TikTok"
                  >
                    <svg className="h-5 w-5 md:h-5 md:w-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                    </svg>
                  </a>
                </div>

                {/* Legal Links */}
                <div className="flex flex-col gap-2">
                  <Link 
                    to="/terms" 
                    className="text-xs md:text-sm text-white/60 hover:text-white/80 transition-colors"
                  >
                    Terms of Service
                  </Link>
                  <Link 
                    to="/privacy" 
                    className="text-xs md:text-sm text-white/60 hover:text-white/80 transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section: Logo and Copyright */}
        <div className="border-t border-white/10 pt-8 md:pt-10 pb-8 md:pb-10">
          <div className="flex flex-col items-center gap-4 md:gap-6">
            {/* Logo */}
            <div className="block w-full max-w-[200px] md:max-w-[240px]">
              <img 
                src={logoUrl} 
                alt="Quilltips" 
                className="w-full h-auto object-contain filter brightness-0 invert"
              />
            </div>
            
            {/* Copyright */}
            <p className="text-xs md:text-sm text-white/60">
              © {new Date().getFullYear()} Quilltips LLC
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
