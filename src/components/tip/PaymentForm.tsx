
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";

interface PaymentFormProps {
  isLoading: boolean;
  amount: string;
  customAmount: string;
  onSubmit: (e: React.FormEvent) => Promise<void> | void;
  onCancel?: () => void;
}

export const PaymentForm = ({
  isLoading,
  amount,
  customAmount,
  onSubmit,
  onCancel,
}: PaymentFormProps) => {
  return (
    <div className="flex flex-row-reverse justify-between items-center gap-4 mt-6">
      <Button 
        type="submit" 
        className="bg-[#FFD166] hover:bg-[#FFD166]/90 text-[#333333] py-3 px-7 rounded-full transition-colors"
        disabled={isLoading || (amount === 'custom' && !customAmount)}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          'Send Tip'
        )}
      </Button>
      
      {onCancel && (
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          className="border-gray-300 text-gray-700 rounded-full"
        >
          Cancel
        </Button>
      )}
    </div>
  );
};
