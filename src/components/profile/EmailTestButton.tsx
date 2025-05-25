
import { useState } from "react";
import { Button } from "../ui/button";
import { Loader2, Mail, UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface EmailTestButtonProps {
  profileId: string;
}

export const EmailTestButton = ({ profileId }: EmailTestButtonProps) => {
  const [isSending, setIsSending] = useState(false);
  const [isCreatedSending, setIsCreatedSending] = useState(false);
  const { toast } = useToast();

  const handleSendTestEmail = async () => {
    setIsSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-email-notification', {
        body: {
          type: 'test_email',
          userId: profileId,
          data: {
            timestamp: new Date().toISOString()
          }
        }
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Test Email Sent",
        description: "If your email is configured correctly, you should receive an email shortly.",
      });
      console.log("Test email response:", data);
    } catch (error: any) {
      console.error("Error sending test email:", error);
      toast({
        title: "Error Sending Test Email",
        description: error.message || "Failed to send test email. Please check the console for details.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleSendAccountCreatedEmail = async () => {
    setIsCreatedSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('account-created-listener', {
        body: {
          userId: profileId
        }
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Account Created Email Sent",
        description: "If your email is configured correctly, you should receive a welcome email shortly.",
      });
      console.log("Account created email response:", data);
    } catch (error: any) {
      console.error("Error sending account created email:", error);
      toast({
        title: "Error Sending Welcome Email",
        description: error.message || "Failed to send welcome email. Please check the console for details.",
        variant: "destructive",
      });
    } finally {
      setIsCreatedSending(false);
    }
  };

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex flex-col sm:flex-row gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={handleSendTestEmail}
          disabled={isSending}
          className="w-full sm:w-auto"
        >
          {isSending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Mail className="mr-2 h-4 w-4" />
          )}
          Send Test Email
        </Button>
        
        <Button
          type="button"
          variant="outline"
          onClick={handleSendAccountCreatedEmail}
          disabled={isCreatedSending}
          className="w-full sm:w-auto"
        >
          {isCreatedSending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <UserPlus className="mr-2 h-4 w-4" />
          )}
          Test Welcome Email
        </Button>
      </div>
      <p className="text-xs ">
        This will send test emails to your registered email address to verify the email notification system.
      </p>
    </div>
  );
};
