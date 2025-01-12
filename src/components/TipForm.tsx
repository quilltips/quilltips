import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface TipFormProps {
  authorId: string;
  onSuccess?: () => void;
  bookTitle?: string;
}

export const TipForm = ({ authorId, onSuccess, bookTitle }: TipFormProps) => {
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

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
        },
      });

      if (error) throw error;

      // Redirect to Stripe Checkout
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
    <Card className="glass-card p-6 max-w-2xl mx-auto mt-6 animate-enter">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Tip Amount ($)
          </label>
          <Input
            type="number"
            min="1"
            step="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            className="hover-lift"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">
            Message (optional)
          </label>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write a message to the author..."
            className="hover-lift"
            rows={4}
          />
        </div>

        <Button 
          type="submit" 
          className="w-full hover-lift"
          disabled={isLoading}
        >
          {isLoading ? "Processing..." : "Send Tip & Message"}
        </Button>
      </form>
    </Card>
  );
};