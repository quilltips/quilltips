import { Card, CardContent } from "../ui/card";
import { TipAmountSelector } from "../tip/TipAmountSelector";
import { TipMessageForm } from "../tip/TipMessageForm";
import { PaymentForm } from "../tip/PaymentForm";
import { Link } from "react-router-dom";

interface QRCodeTipFormProps {
  name: string;
  message: string;
  email: string;
  amount: string;
  customAmount: string;
  isPrivate?: boolean;
  isLoading: boolean;
  authorFirstName: string;
  stripeSetupComplete?: boolean;
  hasStripeAccount?: boolean;
  isQRCodePaid?: boolean;
  onNameChange: (value: string) => void;
  onMessageChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onAmountChange: (value: string) => void;
  onCustomAmountChange: (value: string) => void;
  onPrivateChange?: (value: boolean) => void;
  onSubmit: (e: React.FormEvent) => Promise<void> | void;
  onCancel: () => void;
}

export const QRCodeTipForm = ({
  name,
  message,
  email,
  amount,
  customAmount,
  isPrivate = false,
  isLoading,
  authorFirstName,
  stripeSetupComplete = true,
  hasStripeAccount = true,
  isQRCodePaid = true,
  onNameChange,
  onMessageChange,
  onEmailChange,
  onAmountChange,
  onCustomAmountChange,
  onPrivateChange,
  onSubmit,
  onCancel
}: QRCodeTipFormProps) => {
  return (
    <Card className="mt-8">
      <CardContent className="pt-6">
        <h2 className="text-2xl font-bold text-left mb-6">
          Send {authorFirstName} a tip!
        </h2>
        
        {!stripeSetupComplete || !hasStripeAccount || !isQRCodePaid ? (
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg border border-border text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Tipping is not available at this time as the author is still setting up their payment processing.
              </p>
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-sm bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-8">
          <TipMessageForm
            name={name}
            message={message}
            email={email}
            isPrivate={isPrivate}
            authorFirstName={authorFirstName}
            onNameChange={onNameChange}
            onMessageChange={onMessageChange}
            onEmailChange={onEmailChange}
            onPrivateChange={onPrivateChange}
          />

          <TipAmountSelector
            amount={amount}
            customAmount={customAmount}
            onAmountChange={onAmountChange}
            onCustomAmountChange={onCustomAmountChange}
          />

          <PaymentForm
            isLoading={isLoading}
            amount={amount}
            customAmount={customAmount}
            onSubmit={onSubmit}
            onCancel={onCancel}
          />

            <p className="text-xs text-gray-500 text-center">
              By tipping, you agree to our{" "}
              <Link 
                to="/terms" 
                className="hover:underline"
              >
                Terms of Service
              </Link>
              .
            </p>
          </form>
        )}
      </CardContent>
    </Card>
  );
};
