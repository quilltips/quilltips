import { CardElement } from "@stripe/react-stripe-js";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Loader2 } from "lucide-react";

interface PaymentFormProps {
  isLoading: boolean;
  amount: string;
  customAmount: string;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  stripe: any;
}

export const PaymentForm = ({
  isLoading,
  amount,
  customAmount,
  onSubmit,
  stripe,
}: PaymentFormProps) => {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label className="text-2xl font-semibold text-[#1A2B3B]">Card Details</Label>
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

      <Button 
        type="submit" 
        className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 rounded-lg transition-colors"
        disabled={isLoading || !stripe || (amount === 'custom' && !customAmount)}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          `Support $${amount === 'custom' ? customAmount || '0' : amount}`
        )}
      </Button>
    </form>
  );
};