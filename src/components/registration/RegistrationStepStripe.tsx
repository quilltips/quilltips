
import { Button } from "../ui/button";
import { ArrowRight, Wallet, Info } from "lucide-react";
import { Alert, AlertDescription } from "../ui/alert";

interface RegistrationStepStripeProps {
  onComplete: () => void;
}

export const RegistrationStepStripe = ({ onComplete }: RegistrationStepStripeProps) => {
  const handleSetupStripe = async () => {
    // Navigate to the stripe onboarding page
    window.location.href = '/author/bank-account';
  };

  const handleSkip = () => {
    // Skip stripe setup and complete registration
    onComplete();
  };

  return (
    <div className="space-y-6 p-6">
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
          onClick={handleSetupStripe}
          className="w-full bg-[#FFD166] hover:bg-[#FFD166]/90 text-[#2D3748]"
        >
          <Wallet className="mr-2 h-4 w-4" />
          Set up payments now
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
          className="w-full hover:bg-[#FFD166]/10 hover:text-[#2D3748] hover:border-[#FFD166]"
        >
          Skip for now
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>

        <p className="text-sm text-center text-muted-foreground">
          You can always set up payments later from your dashboard
        </p>
      </div>
    </div>
  );
};
