
import { corsHeaders } from './config';

export const handlePlatformSetupError = (error: any) => {
  return new Response(
    JSON.stringify({
      error: 'platform_setup_required',
      message: 'The platform needs to complete Stripe Connect setup. Please contact support.',
      details: error.message
    }),
    { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400
    }
  );
};

export const handleInvalidAccountError = async (supabaseClient: any, userId: string) => {
  console.log('Invalid account, will create new one on next attempt');
  await supabaseClient
    .from('profiles')
    .update({ 
      stripe_account_id: null,
      stripe_setup_complete: false
    })
    .eq('id', userId);
    
  return new Response(
    JSON.stringify({
      error: 'account_invalid',
      message: 'Your previous account setup was incomplete. Please try connecting again.',
      shouldRetry: true
    }),
    { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400
    }
  );
};

export const handleGenericError = (error: any) => {
  console.error('Error in create-connect-account:', error);
  return new Response(
    JSON.stringify({ 
      error: error.message,
      type: error.type || 'unknown_error',
      details: error.stack
    }),
    { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    }
  );
};

