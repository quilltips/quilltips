import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Loader2, Wallet } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSearchParams } from "react-router-dom";

interface BankAccountConnectProps {
  profileId: string;
  stripeAccountId?: string | null;
}

export const BankAccountConnect = ({ profileId, stripeAccountId }: BankAccountConnectProps) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Handle completion flow
    if (searchParams.get('setup') === 'complete') {
      toast({
        title: "Account Setup",
        description: "Your Stripe account setup has been updated successfully.",
      });
      
      // Send email notification about Stripe setup completion
      try {
        supabase.functions.invoke('send-email-notification', {
          body: {
            type: 'stripe_setup_complete',
            userId: profileId
          }
        });
        console.log("Stripe setup complete email notification sent");
      } catch (emailError) {
        console.error("Error sending Stripe setup complete email:", emailError);
      }
    }
    // Handle refresh flow
    else if (searchParams.get('refresh') === 'true' && stripeAccountId) {
      handleConnect();
    }
  }, [searchParams, stripeAccountId, profileId]);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session found');

      console.log('Connecting to Stripe Connect account for user ID:', profileId);
      const { data, error } = await supabase.functions.invoke('create-connect-account', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      if (data.error) {
        console.error('Stripe error:', data.error);
        toast({
          title: "Connection Error",
          description: data.error,
          variant: "destructive",
        });
        return;
      }

      if (!data?.url) {
        throw new Error('Failed to get Stripe onboarding URL');
      }

      // Send email notification about Stripe setup in progress
      try {
        await supabase.functions.invoke('send-email-notification', {
          body: {
            type: 'stripe_setup_incomplete',
            userId: profileId
          }
        });
        console.log("Stripe setup in progress email sent");
      } catch (emailError) {
        console.error("Error sending Stripe setup in progress email:", emailError);
        // Continue with Stripe flow even if email fails
      }

      // Redirect to Stripe for onboarding or dashboard
      window.location.href = data.url;
    } catch (error: any) {
      console.error("Error connecting to Stripe:", error);
      toast({
        title: "Connection Error",
        description: error.message || "Failed to connect bank account",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleConnect}
      disabled={isConnecting}
      className="w-full sm:w-auto flex items-center gap-2"
    >
      {isConnecting ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Wallet className="mr-2 h-4 w-4" />
      )}
      {stripeAccountId ? "Manage Payment Settings" : "Connect Bank Account"}
      {stripeAccountId && <span className="text-xs text-muted-foreground">(Opens Stripe)</span>}
    </Button>
  );
};
