import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { ArrowRight, Info, Wallet } from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";

interface PaymentSetupChoiceProps {
  onContinue: () => void;
  onSkip: () => void;
}

export const PaymentSetupChoice = ({ onContinue, onSkip }: PaymentSetupChoiceProps) => {
  return (
    <Card className="p-6 max-w-md mx-auto">
      <div className="space-y-6">
        <div className="space-y-2 text-center">
          <h2 className="text-2xl font-medium">Connect a bank account</h2>
          <p className="text-muted-foreground">
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
            onClick={onContinue}
            className="w-full justify-center hover-lift"
            size="lg"
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
            onClick={onSkip}
            className="w-full justify-center"
            size="lg"
          >
            Skip for now
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>

          <p className="text-sm text-center text-muted-foreground">
            You can always set up payments later from your dashboard
          </p>
        </div>
      </div>
    </Card>
  );
};