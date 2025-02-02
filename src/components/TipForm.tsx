import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Checkbox } from "./ui/checkbox";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, useStripe, useElements, CardElement } from "@stripe/stripe-js";
import { Loader2 } from "lucide-react";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

interface TipFormProps {
  authorId: string;
  onSuccess?: () => void;
  bookTitle?: string;
  qrCodeId?: string;
}

const TipFormContent = ({ authorId, onSuccess, bookTitle, qrCodeId }: TipFormProps) => {
  const [amount, setAmount] = useState("5");
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [isMonthly, setIsMonthly] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();

  const predefinedAmounts = ["1", "3", "5"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('create-tip-checkout', {
        body: {
          amount: Number(amount),
          authorId,
          message,
          name,
          bookTitle,
          qrCodeId,
          isMonthly
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
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="space-y-2">
          <Label className="text-lg font-semibold text-primary">Choose Amount</Label>
          <RadioGroup 
            value={amount}
            onValueChange={setAmount}
            className="flex gap-3"
          >
            {predefinedAmounts.map((value) => (
              <div key={value} className="flex items-center space-x-2">
                <RadioGroupItem
                  value={value}
                  id={`amount-${value}`}
                  className="peer sr-only"
                />
                <Label
                  htmlFor={`amount-${value}`}
                  className="flex h-12 w-12 items-center justify-center rounded-full border-2 peer-data-[state=checked]:bg-primary peer-data-[state=checked]:border-primary peer-data-[state=checked]:text-white hover:border-primary cursor-pointer transition-colors"
                >
                  ${value}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label htmlFor="name" className="text-lg font-semibold text-primary">Your Name</Label>
          <Input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name or @yoursocial (optional)"
            className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="message" className="text-lg font-semibold text-primary">Message</Label>
          <Textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Say something nice... (optional)"
            className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary resize-none"
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-lg font-semibold text-primary">Card Details</Label>
          <div className="p-4 border rounded-lg bg-background">
            <CardElement 
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#424770',
                    '::placeholder': {
                      color: '#aab7c4',
                    },
                  },
                  invalid: {
                    color: '#9e2146',
                  },
                },
              }}
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="monthly"
            checked={isMonthly}
            onCheckedChange={(checked) => setIsMonthly(checked as boolean)}
          />
          <label
            htmlFor="monthly"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Make this monthly
          </label>
        </div>

        <Button 
          type="submit" 
          className="w-full bg-primary hover:bg-primary-light text-white font-semibold py-3 rounded-lg transition-colors"
          disabled={isLoading || !stripe}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            `Support $${amount}`
          )}
        </Button>
      </form>
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