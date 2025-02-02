import { useState } from "react";
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

interface TipFormProps {
  authorId: string;
  onSuccess?: () => void;
  bookTitle?: string;
  qrCodeId?: string;
}

export const TipForm = ({ authorId, onSuccess, bookTitle, qrCodeId }: TipFormProps) => {
  const [amount, setAmount] = useState("5");
  const [message, setMessage] = useState("");
  const [isMonthly, setIsMonthly] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const predefinedAmounts = ["1", "3", "5"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('create-tip-checkout', {
        body: {
          amount: Number(amount),
          authorId,
          message,
          bookTitle,
          qrCodeId,
          isMonthly
        },
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

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

      if (!data.url) {
        throw new Error('No checkout URL received from server');
      }

      window.location.href = data.url;
    } catch (error: any) {
      console.error('Error creating checkout session:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to process tip",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="flex items-center justify-center gap-4">
          <span className="text-2xl">☕️</span>
          <span className="text-xl font-medium">×</span>
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
                  className="flex h-12 w-12 items-center justify-center rounded-full border-2 peer-data-[state=checked]:bg-secondary peer-data-[state=checked]:border-secondary peer-data-[state=checked]:text-secondary-foreground hover:border-secondary cursor-pointer transition-colors"
                >
                  {value}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <Input
          type="text"
          placeholder="Name or @yoursocial"
          className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-secondary"
        />

        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Say something nice..."
          className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-secondary resize-none"
          rows={3}
        />

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
          className="w-full bg-secondary hover:bg-secondary-dark text-secondary-foreground font-semibold py-3 rounded-lg transition-colors"
          disabled={isLoading}
        >
          {isLoading ? "Processing..." : `Support $${amount}`}
        </Button>
      </form>
    </Card>
  );
};