
import { Card, CardContent } from "../ui/card";
import { TipAmountSelector } from "../tip/TipAmountSelector";
import { TipMessageForm } from "../tip/TipMessageForm";
import { PaymentForm } from "../tip/PaymentForm";

interface QRCodeTipFormProps {
  name: string;
  message: string;
  amount: string;
  customAmount: string;
  isLoading: boolean;
  onNameChange: (value: string) => void;
  onMessageChange: (value: string) => void; 
  onAmountChange: (value: string) => void;
  onCustomAmountChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => Promise<void> | void;
}

export const QRCodeTipForm = ({
  name,
  message,
  amount,
  customAmount,
  isLoading,
  onNameChange,
  onMessageChange,
  onAmountChange,
  onCustomAmountChange,
  onSubmit
}: QRCodeTipFormProps) => {
  return (
    <Card className="mt-8">
      <CardContent className="pt-6">
        <form onSubmit={onSubmit} className="space-y-8">
          <TipAmountSelector
            amount={amount}
            customAmount={customAmount}
            onAmountChange={onAmountChange}
            onCustomAmountChange={onCustomAmountChange}
          />

          <TipMessageForm
            name={name}
            message={message}
            onNameChange={onNameChange}
            onMessageChange={onMessageChange}
          />

          <PaymentForm
            isLoading={isLoading}
            amount={amount}
            customAmount={customAmount}
            onSubmit={onSubmit}
          />
        </form>
      </CardContent>
    </Card>
  );
};
