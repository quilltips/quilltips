
import { useState } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { ArrowRight, Info, Wallet } from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PaymentSetupChoiceProps {
  onContinue: () => void;
  onSkip: () => void;
}

export const PaymentSetupChoice = ({ onContinue, onSkip }: PaymentSetupChoiceProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSetupPayments = async () => {
    setIsLoading(true);
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

      // Open Stripe in a new tab for account setup
      window.open(data.url, '_blank');
      
      // Show feedback and continue the flow
      toast({
        title: "Stripe Opened",
        description: "Stripe setup has opened in a new tab. Return here when you're done.",
      });
      
      onContinue();
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

  return (
    <Card className="p-6 max-w-md mx-auto">
      <div className="space-y-6">
        <div className="space-y-2 text-center">
          <h2 className="text-2xl font-medium">Connect a bank account</h2>
          <p className="">
            Set up Stripe to receive tips from your readers
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
            className="w-full justify-center "
            size="lg"
            disabled={isLoading}
          >
            <Wallet className="mr-2 h-4 w-4" />
            Set up payments now (opens Stripe in new tab)
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 ">
                or
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={onSkip}
            className="w-full justify-center"
            size="lg"
          >
            Skip for now
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>

          <p className="text-sm text-center ">
            You can always set up payments later from your dashboard
          </p>
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
              To get set up, Stripe needs to collect some basic information from you. Clicking "Set up payments now" above will redirect 
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
  );
};
