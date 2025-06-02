
import { useState } from "react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { ArrowRight, Wallet, Info, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "../ui/alert";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

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

  const [showExplanation, setShowExplanation] = useState(false);



  return (
   <div className="w-full">
   <div className="space-y-10">

      <div className="space-y-4 w-full">
        <h2 className="text-4xl font-semibold text-[#333333]">Connect a payment option</h2>
        <p className="pt-2">
        Connect your bank account with Stripe to start receiving tips
        </p>
      </div>
      
      <div className="space-y-6 pt-4">
        <div className="flex flex-col items-center text-left gap-2 w-full">
          <Button
            onClick={handleSetupPayments}
            disabled={isLoading}
            variant="default"
            className="px-10 bg-[#FFD166] hover:bg-[#FFD166]/90 text-[#333333]"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span>Opening Stripe...</span>
              </>
            ) : (
              <>
                <Wallet className="mr-2 h-4 w-4" />
                <span>Set up payments (opens Stripe in new tab)</span>
              </>
            )}
         </Button>
        
          <div className="max-w-md">
              <Alert className="border-transparent">
              
              <AlertDescription>
                You'll need to provide some basic information to verify your identity and connect your bank account. This typically takes 5-10 minutes.
              </AlertDescription>
            </Alert>
           </div>
       </div>
    
        <div>
        <Button
          variant="outline"
          onClick={handleSkip}
          className="w-full border-transparent underline hover:bg-transparent hover:shadow-none"
        >
          Skip for now
        </Button>

        <p className="text-sm text-center italic">
          You'll need to add a payment option later to get paid.    
        </p>
      </div>
      </div>
    </div>
    </div>
  );
};
