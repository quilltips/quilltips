import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import { useToast } from "@/hooks/use-toast";

interface TipFormProps {
  authorId: string;
  onSuccess?: () => void;
  bookTitle?: string;
}

export const TipForm = ({ authorId, onSuccess, bookTitle }: TipFormProps) => {
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here we'll integrate payment processing later
    toast({
      title: "Thank you for your support!",
      description: "Your message and tip have been sent to the author.",
    });
    onSuccess?.();
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

        <Button type="submit" className="w-full hover-lift">
          Send Tip & Message
        </Button>
      </form>
    </Card>
  );
};