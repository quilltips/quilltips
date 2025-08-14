
import { Card } from "./ui/card";
import { TipAmountSelector } from "./tip/TipAmountSelector";
import { TipMessageForm } from "./tip/TipMessageForm";
import { PaymentForm } from "./tip/PaymentForm";
import { useTipForm } from "@/hooks/use-tip-form";
import { Link } from "react-router-dom";

interface TipFormProps {
  authorId: string;
  onSuccess?: () => void;
  bookTitle?: string;
  qrCodeId?: string;
  authorName?: string;
  stripeSetupComplete?: boolean;
  hasStripeAccount?: boolean;
}

export const TipForm = ({ 
  authorId, 
  authorName, 
  bookTitle, 
  qrCodeId,
  stripeSetupComplete = false,
  hasStripeAccount = false
}: TipFormProps) => {
  const {
    amount,
    setAmount,
    customAmount,
    setCustomAmount,
    message,
    setMessage,
    name,
    setName,
    email,
    setEmail,
    isLoading,
    handleSubmit,
    authorFirstName
  } = useTipForm({ authorId, authorName, bookTitle, qrCodeId });

  const stripeOnboardingComplete = hasStripeAccount && stripeSetupComplete;

  if (!stripeOnboardingComplete) {
    return (
      <Card className="w-full max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 text-center space-y-4">
          <h2 className="text-2xl font-bold text-[#19363C]">
            Tipping Not Available
          </h2>
          <p className="text-[#718096]">
            {authorName?.split(' ')[0] || 'This author'} is still setting up their payment processing. 
            Check back soon to send tips!
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="p-6 space-y-6">
        <h2 className="text-2xl font-bold text-left">
          Send {authorFirstName} a tip!
        </h2>
        
        <TipMessageForm
          name={name}
          message={message}
          email={email}
          authorFirstName={authorFirstName}
          onNameChange={setName}
          onMessageChange={setMessage}
          onEmailChange={setEmail}
        />

        <TipAmountSelector
          amount={amount}
          customAmount={customAmount}
          onAmountChange={setAmount}
          onCustomAmountChange={setCustomAmount}
        />

        <PaymentForm
          isLoading={isLoading}
          amount={amount}
          customAmount={customAmount}
          onSubmit={handleSubmit}
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
      </div>
    </Card>
  );
};
