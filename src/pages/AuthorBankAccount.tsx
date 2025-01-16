import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Wallet } from "lucide-react";

const AuthorBankAccount = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasStripeAccount, setHasStripeAccount] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate("/author/login");
          return;
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('stripe_account_id')
          .eq('id', session.user.id)
          .single();

        if (profile?.stripe_account_id) {
          setHasStripeAccount(true);
          navigate('/author/dashboard');
        }
      } catch (error) {
        console.error("Auth check error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  const connectBankAccount = async () => {
    setIsConnecting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session found');

      const { data, error } = await supabase.functions.invoke('create-connect-account', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error("Function error:", error);
        throw error;
      }

      if (!data?.url) {
        if (data?.error === 'Platform profile setup required') {
          throw new Error(data.details || 'Platform setup required');
        }
        throw new Error('No URL returned from Stripe');
      }

      // Save the Stripe account ID
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ stripe_account_id: data.accountId })
        .eq('id', session.user.id);

      if (updateError) throw updateError;

      // Redirect to Stripe Connect onboarding
      window.location.href = data.url;
    } catch (error: any) {
      console.error("Error connecting bank account:", error);
      toast({
        title: "Connection Error",
        description: error.message || "Failed to connect bank account",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const skipForNow = () => {
    navigate('/author/dashboard');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <main className="container mx-auto px-4 pt-24 pb-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="container mx-auto px-4 pt-24 pb-12">
        <Card className="p-6 max-w-md mx-auto">
          <div className="space-y-6">
            <div className="space-y-2 text-center">
              <h2 className="text-2xl font-semibold">Connect Your Bank Account</h2>
              <p className="text-muted-foreground">
                Set up your payment details to start receiving tips from your readers
              </p>
            </div>

            <div className="space-y-4">
              <Button
                className="w-full"
                onClick={connectBankAccount}
                disabled={isConnecting}
              >
                {isConnecting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Wallet className="mr-2 h-4 w-4" />
                )}
                Connect Bank Account
              </Button>

              <Button
                variant="outline"
                className="w-full"
                onClick={skipForNow}
              >
                Skip for now
              </Button>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default AuthorBankAccount;