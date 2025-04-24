import { useState } from "react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { ArrowRight, Wallet, Info } from "lucide-react";
import { Alert, AlertDescription } from "../ui/alert";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface RegistrationStepStripeProps {
  onComplete: () => void;
}

export const RegistrationStepStripe = ({ onComplete }: RegistrationStepStripeProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSetupPayments = async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session found');

      console.log('Starting Stripe Connect onboarding process');
      const { data, error } = await supabase.functions.invoke('create-connect-account', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      if (data.error) {
        console.error('Stripe error:', data.error);
        toast({
          title: "Connection Error",
          description: data.error,
          variant: "destructive",
        });
        return;
      }

      if (!data?.url) {
        throw new Error('Failed to get Stripe onboarding URL');
      }

      // Send email notification about Stripe setup in progress
      try {
        await supabase.functions.invoke('send-email-notification', {
          body: {
            type: 'stripe_setup_incomplete',
            userId: session.user.id
          }
        });
        console.log("Stripe setup in progress email sent");
      } catch (emailError) {
        console.error("Error sending Stripe setup in progress email:", emailError);
        // Continue with Stripe flow even if email fails
      }

      // Redirect to Stripe for onboarding
      window.location.href = data.url;
      // Remove the onComplete call here - we'll handle the return in the dashboard
    } catch (error: any) {
      console.error("Error connecting to Stripe:", error);
      toast({
        title: "Connection Error",
        description: error.message || "Failed to connect bank account",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    navigate('/author/dashboard');
    onComplete();
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-[#2D3748]">Set Up Payments</h2>
        <p className="text-muted-foreground">
          Connect your bank account to start receiving tips from your readers
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
          onClick={handleSetupPayments}
          disabled={isLoading}
          className="w-full bg-[#FFD166] hover:bg-[#FFD166]/90 text-[#2D3748]"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              <span>Connecting to Stripe...</span>
            </>
          ) : (
            <>
              <Wallet className="mr-2 h-4 w-4" />
              <span>Set up payments now</span>
            </>
          )}
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              or
            </span>
          </div>
        </div>

        <Button
          variant="outline"
          onClick={handleSkip}
          className="w-full"
        >
          Skip for now
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>

        <p className="text-sm text-center text-muted-foreground">
          You can always set up payments later from your dashboard
        </p>
      </div>

      {/* Stripe explanation section */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="text-lg font-medium text-[#19363C] mb-3">How payments work with Quilltips</h3>
        <div className="space-y-3 text-sm text-gray-600">
          <p>
            Quilltips uses Stripe as its payments partner. Authors who create accounts with Quilltips use 
            Stripe to enable their QR codes to pay out to their bank account.
          </p>
          <p>
            To get set up, Stripe needs to collect some basic information from you. Clicking "set up payments now" above will redirect 
            you to the Stripe Connect onboarding flow, which should take less than 5 minutes to complete. 
            You will be asked to link a bank account and verify your identity.
          </p>
          <p>
            If you have any questions, don't hesitate to reach out to Quilltips. Once your account is set up, 
            you will be able to receive tips from your readers!
          </p>
          <p>
            *Please note that before submitting your completed information, Stripe will verify your identity. If you see incomplete tasks at this point, you will need to complete them before Stripe approves your account.
          </p>
        </div>
      </div>
    </div>
  );
};
