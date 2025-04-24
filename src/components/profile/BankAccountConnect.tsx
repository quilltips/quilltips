
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
      
      // Update in database is now handled by webhooks
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
      
      // Redirect directly to Stripe for onboarding or dashboard
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
    <div className="space-y-3">
      <Button
        type="button"
        variant="outline"
        onClick={handleConnect}
        disabled={isConnecting}
        className="w-full sm:w-auto flex items-center gap-2"
      >
        {isConnecting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Connecting to Stripe...</span>
          </>
        ) : (
          <>
            <Wallet className="h-4 w-4" />
            <span>
              {stripeAccountId ? "Manage Payment Settings" : "Connect Bank Account"}
              {stripeAccountId && <span className="text-xs text-muted-foreground ml-1">(Opens Stripe)</span>}
            </span>
          </>
        )}
      </Button>
    </div>
  );
};
