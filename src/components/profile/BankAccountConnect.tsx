
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
        description: "Your Stripe account setup has been completed successfully.",
      });
    }
    // Handle refresh flow
    else if (searchParams.get('refresh') === 'true' && stripeAccountId) {
      handleRefresh();
    }
  }, [searchParams, stripeAccountId]);

  const handleStripeError = (error: any) => {
    console.error('Stripe error:', error);
    let errorMessage = 'Failed to connect bank account. Please try again.';
    let variant: 'default' | 'destructive' = 'destructive';

    if (error.error === 'platform_setup_required') {
      errorMessage = 'Platform setup is required. Please contact support for assistance.';
    } else if (error.error === 'account_invalid') {
      errorMessage = 'Your previous account setup was incomplete. Please try connecting again.';
      variant = 'default';
    } else if (error.type === 'stripe_error') {
      errorMessage = error.message || 'There was an issue with the Stripe connection.';
    }

    toast({
      title: "Connection Status",
      description: errorMessage,
      variant: variant,
    });

    // If account was invalid and needs retry, clear the stored account ID
    if (error.error === 'account_invalid' && error.shouldRetry) {
      handleRefresh();
    }
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

      if (error) throw error;

      if (data.error) {
        handleStripeError(data);
        return;
      }

      if (!data?.url) {
        throw new Error('Failed to get Stripe onboarding URL');
      }

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

      if (error) throw error;

      if (data.error) {
        handleStripeError(data);
        return;
      }

      if (!data?.url) {
        throw new Error('Failed to get Stripe onboarding URL');
      }

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
      className="w-full sm:w-auto"
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
