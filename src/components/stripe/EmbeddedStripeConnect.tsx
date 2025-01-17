import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface EmbeddedStripeConnectProps {
  onComplete?: () => void;
}

export const EmbeddedStripeConnect = ({ onComplete }: EmbeddedStripeConnectProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const initializeStripeConnect = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          throw new Error('No session found');
        }

        // Call the edge function to create a Connect account
        const { data, error } = await supabase.functions.invoke('create-connect-account', {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (error) throw error;
        if (!data?.accountId) throw new Error('No account ID returned');

        // Save the account ID to the user's profile
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ stripe_account_id: data.accountId })
          .eq('id', session.user.id);

        if (updateError) throw updateError;

        // Redirect to Stripe Connect onboarding
        window.location.href = data.url;
      } catch (error: any) {
        console.error('Error initializing Stripe Connect:', error);
        toast({
          title: 'Error',
          description: error.message || 'Failed to initialize Stripe Connect',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    initializeStripeConnect();
  }, [onComplete, toast]);

  return (
    <div className="w-full min-h-[500px] relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      )}
    </div>
  );
};