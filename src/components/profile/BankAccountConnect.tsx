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

  const handleRefresh = async () => {
    setIsConnecting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session found');

      const { data, error } = await supabase.functions.invoke('create-connect-account', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;
      if (!data?.url) throw new Error('No URL returned from Stripe');

      window.location.href = data.url;
    } catch (error: any) {
      console.error("Error refreshing onboarding:", error);
      toast({
        title: "Refresh Error",
        description: error.message || "Failed to refresh onboarding",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const connectBankAccount = async () => {
    setIsConnecting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session found');

      const { data, error } = await supabase.functions.invoke('create-connect-account', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error("Function error:", error);
        throw error;
      }

      if (!data?.url) {
        if (data?.error === 'Platform profile setup required') {
          throw new Error(data.details || 'Platform setup required');
        }
        throw new Error('No URL returned from Stripe');
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ stripe_account_id: data.accountId })
        .eq('id', profileId);

      if (updateError) throw updateError;

      window.location.href = data.url;
    } catch (error: any) {
      console.error("Error connecting bank account:", error);
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