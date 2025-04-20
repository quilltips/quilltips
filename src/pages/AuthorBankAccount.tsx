
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Wallet, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const AuthorBankAccount = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasStripeAccount, setHasStripeAccount] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

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
          .select('stripe_account_id, stripe_setup_complete')
          .eq('id', session.user.id)
          .single();

        if (profile?.stripe_setup_complete) {
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

  useEffect(() => {
    // Handle completion flow
    if (searchParams.get('setup') === 'complete') {
      toast({
        title: "Account Setup Complete",
        description: "Your Stripe account has been connected successfully.",
      });
      navigate('/author/dashboard');
    }
  }, [searchParams, navigate, toast]);

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

      if (error) throw error;

      if (data.error) {
        if (data.error === 'Platform profile setup required') {
          throw new Error(data.details || 'Platform setup required');
        }
        throw new Error('No URL returned from Stripe');
      }

      // Send email notification about Stripe setup being initiated
      try {
        await supabase.functions.invoke('send-email-notification', {
          body: {
            type: 'stripe_setup_incomplete',
            userId: session.user.id
          }
        });
        console.log("Stripe setup initiated email sent");
      } catch (emailError) {
        console.error("Error sending Stripe setup email:", emailError);
        // Continue with Stripe setup flow even if email fails
      }

      // Direct redirect to Stripe Connect onboarding without going through dashboard first
      window.location.href = data.url;
    } catch (error: any) {
      console.error("Error connecting bank account:", error);
      toast({
        title: "Connection Error",
        description: error.message || "Failed to connect bank account",
        variant: "destructive",
      });
      setIsConnecting(false);
    }
  };

  const skipForNow = () => {
    navigate('/author/dashboard');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
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
      <main className="container mx-auto px-4 pt-24 pb-12">
        <Card className="p-6 max-w-md mx-auto">
          <div className="space-y-6">
            <div className="space-y-2 text-center">
              <h2 className="text-2xl font-semibold">Connect Your Bank Account</h2>
              <p className="text-muted-foreground">
                Set up your payment details to start receiving tips from your readers
              </p>
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                You'll need to provide some basic information to verify your identity and connect your bank account. This typically takes 5-10 minutes.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <Button
                className="w-full bg-[#FFD166] hover:bg-[#FFD166]/90 text-[#2D3748] font-medium"
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
                className="w-full hover:bg-[#FFD166]/10 hover:text-[#2D3748] hover:border-[#FFD166]"
                onClick={skipForNow}
              >
                Skip for now
              </Button>
            </div>
            
            {/* Stripe explanation section */}
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-lg font-medium text-[#19363C] mb-3">How payments work with Quilltips</h3>
              <div className="space-y-3 text-sm text-gray-600">
                <p>
                  Quilltips uses Stripe as its payments partner. Authors who create accounts with Quilltips use 
                  Stripe to enable their QR codes to pay out to their bank account.
                </p>
                <p>
                  To get set up, Stripe needs to collect some basic information from you. This page will redirect 
                  you to the Stripe onboarding flow, which should take less than 5 minutes to complete. 
                  You will be asked to link a bank account.
                </p>
                <p>
                  If you have any questions, don't hesitate to reach out to Quilltips. Once your account is set up, 
                  you will be able to receive tips from your readers!
                </p>
              </div>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default AuthorBankAccount;
