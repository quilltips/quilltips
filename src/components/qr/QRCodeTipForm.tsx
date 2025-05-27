
import { Card, CardContent } from "../ui/card";
import { TipAmountSelector } from "../tip/TipAmountSelector";
import { TipMessageForm } from "../tip/TipMessageForm";
import { PaymentForm } from "../tip/PaymentForm";

interface QRCodeTipFormProps {
  name: string;
  message: string;
  email: string;
  amount: string;
  customAmount: string;
  isLoading: boolean;
  authorFirstName: string;
  onNameChange: (value: string) => void;
  onMessageChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onAmountChange: (value: string) => void;
  onCustomAmountChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => Promise<void> | void;
  onCancel: () => void;
}

export const QRCodeTipForm = ({
  name,
  message,
  email,
  amount,
  customAmount,
  isLoading,
  authorFirstName,
  onNameChange,
  onMessageChange,
  onEmailChange,
  onAmountChange,
  onCustomAmountChange,
  onSubmit,
  onCancel
}: QRCodeTipFormProps) => {
  return (
    <Card className="mt-8">
      <CardContent className="pt-6">
        <h2 className="text-2xl font-bold text-left mb-6">
          Send {authorFirstName} a tip!
        </h2>
        <form onSubmit={onSubmit} className="space-y-8">
          <TipMessageForm
            name={name}
            message={message}
            email={email}
            authorFirstName={authorFirstName}
            onNameChange={onNameChange}
            onMessageChange={onMessageChange}
            onEmailChange={onEmailChange}
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
        </form>
      </CardContent>
    </Card>
  );
};
