
import { Card } from "./ui/card";
import { TipAmountSelector } from "./tip/TipAmountSelector";
import { TipMessageForm } from "./tip/TipMessageForm";
import { PaymentForm } from "./tip/PaymentForm";
import { useTipForm } from "@/hooks/use-tip-form";

interface TipFormProps {
  authorId: string;
  onSuccess?: () => void;
  bookTitle?: string;
  qrCodeId?: string;
}

export const TipForm = ({ authorId, bookTitle, qrCodeId }: TipFormProps) => {
  const {
    amount,
    setAmount,
    customAmount,
    setCustomAmount,
    message,
    setMessage,
    name,
    setName,
    isLoading,
    handleSubmit
  } = useTipForm({ authorId, bookTitle, qrCodeId });

  return (
    <Card className="w-full max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="p-6 space-y-6">
        <TipAmountSelector
          amount={amount}
          customAmount={customAmount}
          onAmountChange={setAmount}
          onCustomAmountChange={setCustomAmount}
        />

        <TipMessageForm
          name={name}
          message={message}
          onNameChange={setName}
          onMessageChange={setMessage}
        />

        <PaymentForm
          isLoading={isLoading}
          amount={amount}
          customAmount={customAmount}
          onSubmit={handleSubmit}
        />
      </div>
    </Card>
  );
};
