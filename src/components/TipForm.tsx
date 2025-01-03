import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import { useToast } from "@/hooks/use-toast";

interface TipFormProps {
  authorName: string;
  bookTitle?: string;
}

export const TipForm = ({ authorName, bookTitle }: TipFormProps) => {
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
  };

  return (
    <Card className="glass-card p-6 max-w-2xl mx-auto mt-6 animate-enter">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-2">Support {authorName}</h3>
          {bookTitle && (
            <p className="text-muted-foreground text-sm">
              Book: {bookTitle}
            </p>
          )}
        </div>

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