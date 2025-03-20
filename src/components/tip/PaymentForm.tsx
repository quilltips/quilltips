
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";

interface PaymentFormProps {
  isLoading: boolean;
  amount: string;
  customAmount: string;
  onSubmit: (e: React.FormEvent) => Promise<void> | void;
}

export const PaymentForm = ({
  isLoading,
  amount,
  customAmount,
  onSubmit,
}: PaymentFormProps) => {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <Button 
        type="submit" 
        className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 rounded-lg transition-colors"
        disabled={isLoading || (amount === 'custom' && !customAmount)}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          'Next'
        )}
      </Button>
    </form>
  );
};
