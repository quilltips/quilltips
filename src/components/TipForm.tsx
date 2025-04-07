
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
  authorName?: string;
}

export const TipForm = ({ authorId, authorName, bookTitle, qrCodeId }: TipFormProps) => {
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
    isPrivate,
    setIsPrivate,
    isLoading,
    handleSubmit,
    authorFirstName
  } = useTipForm({ authorId, authorName, bookTitle, qrCodeId });

  return (
    <Card className="w-full max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="p-6 space-y-6">
        <h2 className="text-2xl font-bold text-center">
          Send {authorFirstName} a tip!
        </h2>
        
        <TipMessageForm
          name={name}
          message={message}
          email={email}
          isPrivate={isPrivate}
          onNameChange={setName}
          onMessageChange={setMessage}
          onEmailChange={setEmail}
          onPrivateChange={setIsPrivate}
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
      </div>
    </Card>
  );
};
