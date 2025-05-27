
import { useState } from "react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { ArrowRight, Wallet, Info, Loader2 } from "lucide-react";
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

      // Open Stripe in a new tab for onboarding
      window.open(data.url, '_blank');
      
      // Show feedback and navigate to dashboard
      toast({
        title: "Stripe Opened",
        description: "Stripe setup has opened in a new tab. Return here when you're done.",
      });
      
      navigate('/author/dashboard');
      onComplete();
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
      <div className="space-y-6">
        <h2 className="text-3xl font-semibold text-[#2D3748]">Connect a payment option</h2>
        <p className="">
          Connect your bank account to start receiving tips from your readers
        </p>
      </div>

      
      <div className="space-y-4">
        <Button
          onClick={handleSetupPayments}
          disabled={isLoading}
          className="w-full bg-[#FFD166] hover:bg-[#FFD166]/90 text-[#2D3748]"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              <span>Opening Stripe...</span>
            </>
          ) : (
            <>
              <Wallet className="mr-2 h-4 w-4" />
              <span>Set up payments now (opens in new tab)</span>
            </>
          )}
        </Button>

        <Alert className="border-transparent">
        
        <AlertDescription>
          You'll need to provide some basic information to verify your identity and connect your bank account. This typically takes 5-10 minutes.
        </AlertDescription>
      </Alert>

      
        <Button
          variant="outline"
          onClick={handleSkip}
          className="w-full border-transparent underline hover:bg-transparent hover:shadow-none"
        >
          Skip for now
          
        </Button>

        <p className="text-sm text-center ">
          You'll need to add a payment option later to get paid
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
