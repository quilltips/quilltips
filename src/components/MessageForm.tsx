import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface MessageFormProps {
  authorId: string;
  authorName?: string;
  bookTitle?: string;
  qrCodeId?: string;
  onCancel?: () => void;
  onSuccess?: () => void;
}

export const MessageForm = ({ 
  authorId, 
  authorName,
  bookTitle,
  qrCodeId,
  onCancel,
  onSuccess
}: MessageFormProps) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const authorFirstName = authorName?.split(' ')[0] || 'the author';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !message) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsLoading(true);

    try {
      // Call edge function to send message notification
      const { error } = await supabase.functions.invoke('send-message-to-author', {
        body: {
          authorId,
          authorName,
          readerName: name || 'Anonymous',
          readerEmail: email,
          message,
          bookTitle,
          qrCodeId
        }
      });

      if (error) throw error;

      toast.success("Your message has been sent to the author!");
      setName("");
      setEmail("");
      setMessage("");
      onSuccess?.();
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-background rounded-xl shadow-lg overflow-hidden">
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <h2 className="text-2xl font-bold text-left">
          Send {authorFirstName} a message
        </h2>

        <div className="space-y-2">
          <Label htmlFor="name" className="text-lg font-medium">
            Name (optional)
          </Label>
          <Input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-lg font-medium">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="message" className="text-lg font-medium">
            Message
          </Label>
          <Textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={`Tell ${authorFirstName} what you thought about the book!`}
            className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary resize-none"
            rows={4}
            required
          />
        </div>

        <div className="flex flex-row-reverse justify-between items-center gap-4 mt-6">
          <Button 
            type="submit" 
            className="bg-primary text-primary-foreground hover:bg-primary/90 py-3 px-7 rounded-full transition-colors"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              'Send Message'
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
      </form>
    </Card>
  );
};
