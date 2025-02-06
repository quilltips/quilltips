
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
    // Handle refresh flow
    if (searchParams.get('refresh') === 'true' && stripeAccountId) {
      handleRefresh();
    }
  }, [searchParams, stripeAccountId]);

  const handleStripeError = (error: any) => {
    console.error('Stripe error:', error);
    let errorMessage = 'Failed to connect bank account. Please try again.';

    if (error.code === 'account_invalid') {
      errorMessage = 'Your Stripe account needs to be reconnected. Click again to set up a new connection.';
    } else if (error.type === 'stripe_error') {
      errorMessage = error.message || 'There was an issue with the Stripe connection.';
    }

    toast({
      title: "Connection Error",
      description: errorMessage,
      variant: "destructive",
    });
  };

  const handleRefresh = async () => {
    setIsConnecting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session found');

      console.log('Refreshing Stripe Connect account setup');
      const { data, error } = await supabase.functions.invoke('create-connect-account', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('Stripe Connect refresh error:', error);
        throw error;
      }

      if (data.error) {
        console.error('Stripe error response:', data);
        handleStripeError(data);
        return;
      }

      if (!data?.url) {
        console.error('No URL returned from Stripe:', data);
        throw new Error('Failed to get Stripe onboarding URL');
      }

      console.log('Redirecting to Stripe onboarding:', data.url);
      window.location.href = data.url;
    } catch (error: any) {
      console.error("Error refreshing onboarding:", error);
      handleStripeError(error);
    } finally {
      setIsConnecting(false);
    }
  };

  const connectBankAccount = async () => {
    setIsConnecting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session found');

      console.log('Initiating Stripe Connect account setup');
      const { data, error } = await supabase.functions.invoke('create-connect-account', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('Stripe Connect setup error:', error);
        throw error;
      }

      if (data.error) {
        console.error('Stripe error response:', data);
        handleStripeError(data);
        return;
      }

      if (!data?.url) {
        console.error('No URL returned from Stripe:', data);
        throw new Error('Failed to get Stripe onboarding URL');
      }

      console.log('Redirecting to Stripe onboarding:', data.url);
      window.location.href = data.url;
    } catch (error: any) {
      console.error("Error connecting bank account:", error);
      handleStripeError(error);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      onClick={stripeAccountId ? handleRefresh : connectBankAccount}
      disabled={isConnecting}
    >
      {isConnecting ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Wallet className="mr-2 h-4 w-4" />
      )}
      {stripeAccountId ? "Continue Account Setup" : "Connect Bank Account"}
    </Button>
  );
};
