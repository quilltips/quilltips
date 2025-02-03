import { useState } from "react";
import { Card } from "./ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { TipAmountSelector } from "./tip/TipAmountSelector";
import { TipMessageForm } from "./tip/TipMessageForm";
import { PaymentForm } from "./tip/PaymentForm";

interface TipFormProps {
  authorId: string;
  onSuccess?: () => void;
  bookTitle?: string;
  qrCodeId?: string;
}

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const TipFormContent = ({ authorId, onSuccess, bookTitle, qrCodeId }: TipFormProps) => {
  const [amount, setAmount] = useState("5");
  const [customAmount, setCustomAmount] = useState("");
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsLoading(true);
    const finalAmount = amount === 'custom' ? customAmount : amount;

    try {
      const { data, error } = await supabase.functions.invoke('create-tip-checkout', {
        body: {
          amount: Number(finalAmount),
          authorId,
          message,
          name,
          bookTitle,
          qrCodeId,
        },
      });

      if (error) throw error;
      if (data.error) {
        if (data.code === 'ACCOUNT_SETUP_INCOMPLETE') {
          toast({
            title: "Account Setup Required",
            description: "The author needs to complete their payment account setup before they can receive tips.",
            variant: "destructive",
          });
          navigate(`/author/${authorId}`);
          return;
        }
        throw new Error(data.error);
      }

      if (!data.clientSecret) {
        throw new Error('No payment intent received from server');
      }

      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      const { error: stripeError } = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: name || 'Anonymous',
          },
        }
      });

      if (stripeError) {
        throw stripeError;
      }

      toast({
        title: "Thank you for your support!",
        description: "Your tip has been processed successfully.",
      });

      if (onSuccess) onSuccess();
      navigate(`/author/${authorId}`);

    } catch (error: any) {
      console.error('Error processing payment:', error);
      toast({
        title: "Payment Error",
        description: error.message || "Failed to process payment",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

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
          stripe={stripe}
        />
      </div>
    </Card>
  );
};

export const TipForm = (props: TipFormProps) => {
  return (
    <Elements stripe={stripePromise}>
      <TipFormContent {...props} />
    </Elements>
  );
};