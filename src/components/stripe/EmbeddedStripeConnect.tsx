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

        const { data, error } = await supabase.functions.invoke('create-connect-account', {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (error) throw error;
        if (!data?.clientSecret) throw new Error('No client secret returned');

        const stripe = await loadStripe(data.publishableKey);
        if (!stripe) throw new Error('Failed to load Stripe');

        const elements = stripe.elements({
          clientSecret: data.clientSecret,
        });

        const onboardingElement = elements.create('expressOnboarding');
        onboardingElement.mount('#stripe-onboarding-element');

        onboardingElement.on('onboarding_complete', () => {
          if (onComplete) {
            onComplete();
          }
        });

        setIsLoading(false);
      } catch (error) {
        console.error('Error initializing Stripe Connect:', error);
        toast({
          title: 'Error',
          description: error.message || 'Failed to initialize Stripe Connect',
          variant: 'destructive',
        });
      }
    };

    const loadStripe = async (key: string): Promise<any> => {
      if (!window.Stripe) {
        const script = document.createElement('script');
        script.src = 'https://js.stripe.com/v3/';
        script.async = true;
        document.body.appendChild(script);
        await new Promise(resolve => script.onload = resolve);
      }
      return window.Stripe?.(key);
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
      <div id="stripe-onboarding-element" className="w-full h-full" />
    </div>
  );
};