import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Mail, CheckCircle } from "lucide-react";

interface NewsletterSignupProps {
  variant?: "default" | "compact";
  title?: string;
  description?: string;
  className?: string;
  source?: string;
}

export const NewsletterSignup = ({ 
  variant = "default", 
  title = "Stay Updated",
  description = "Get the latest writing tips, publishing insights, and author success stories delivered to your inbox.",
  className = "",
  source = "blog"
}: NewsletterSignupProps) => {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { toast } = useToast();

  const subscribeMutation = useMutation({
    mutationFn: async (subscriberData: {
      email: string;
      first_name?: string;
      last_name?: string;
      source: string;
    }) => {
      const { data, error } = await supabase
        .from('newsletter_subscribers')
        .insert([subscriberData])
        .select()
        .single();
      
      if (error) {
        // If it's a duplicate email error, we'll handle it gracefully
        if (error.code === '23505') {
          // Update existing subscriber to active
          const { error: updateError } = await supabase
            .from('newsletter_subscribers')
            .update({ 
              is_active: true, 
              unsubscribed_at: null,
              first_name: subscriberData.first_name,
              last_name: subscriberData.last_name
            })
            .eq('email', subscriberData.email);
          
          if (updateError) throw updateError;
          return { email: subscriberData.email };
        }
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      setIsSubscribed(true);
      setEmail("");
      setFirstName("");
      setLastName("");
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

    subscribeMutation.mutate({
      email,
      first_name: firstName || undefined,
      last_name: lastName || undefined,
      source: source,
    });
  };

  if (isSubscribed) {
    return (
      <Card className={`bg-green-50 border-green-200 ${className}`}>
        <CardContent className="pt-6">
          <div className="text-center">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-green-800 mb-2">
              Welcome to the Quilltips Newsletter!
            </h3>
            <p className="text-green-700">
              You're all set to receive our latest insights and tips.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (variant === "compact") {
    return (
      <Card className={`bg-gradient-to-r from-[#19363C] to-[#2a4a52] text-white ${className}`}>
        <CardContent className="pt-6">
          <div className="text-center">
            <Mail className="h-8 w-8 mx-auto mb-3" />
            <h3 className="text-lg font-semibold mb-2">{title}</h3>
            <p className="text-sm text-gray-200 mb-4">{description}</p>
            <form onSubmit={handleSubmit} className="flex gap-2 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 bg-white text-gray-900"
              />
              <Button 
                type="submit" 
                disabled={subscribeMutation.isPending}
                className="bg-[#FFD166] text-gray-900 hover:bg-[#ffd166]"
              >
                {subscribeMutation.isPending ? "Subscribing..." : "Subscribe"}
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`bg-gradient-to-br from-[#19363C] to-[#2a4a52] text-white ${className}`}>
      <CardHeader className="text-center">
        <Mail className="h-12 w-12 mx-auto mb-4 text-[#FFD166]" />
        <CardTitle className="text-2xl">{title}</CardTitle>
        <CardDescription className="text-gray-200">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              type="text"
              placeholder="First name (optional)"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="bg-white text-gray-900"
            />
            <Input
              type="text"
              placeholder="Last name (optional)"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="bg-white text-gray-900"
            />
          </div>
          <Input
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="bg-white text-gray-900"
          />
          <Button 
            type="submit" 
            disabled={subscribeMutation.isPending}
            className="w-full bg-[#FFD166] text-gray-900 hover:bg-[#ffd166] font-semibold"
          >
            {subscribeMutation.isPending ? "Subscribing..." : "Subscribe to Newsletter"}
          </Button>
          <p className="text-xs text-gray-300 text-center">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}; 