import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import Stripe from 'https://esm.sh/stripe@14.21.0';
import { corsHeaders } from './config.ts';

export const createStripeConnectAccount = async (
  stripe: Stripe,
  userId: string,
  userEmail: string,
  supabaseClient: any,
  origin: string
) => {
  console.log('Creating new Stripe Connect account');
  const account = await stripe.accounts.create({
    type: 'express',
    email: userEmail,
    metadata: {
      supabaseUserId: userId,
    },
  });

  // Update profile with new account ID
  const { error: updateError } = await supabaseClient
    .from('profiles')
    .update({ 
      stripe_account_id: account.id,
      stripe_setup_complete: false
    })
    .eq('id', userId);

  if (updateError) {
    console.error('Error updating profile:', updateError);
    throw updateError;
  }

  // Create initial account link for setup
  const accountLink = await stripe.accountLinks.create({
    account: account.id,
    refresh_url: `${origin}/author/settings?refresh=true`,
    return_url: `${origin}/author/settings?setup=complete`,
    type: 'account_onboarding',
  });

  return {
    url: accountLink.url,
    status: 'new_account',
    accountId: account.id
  };
};

export const handleExistingAccount = async (
  stripe: Stripe,
  accountId: string,
  origin: string
) => {
  console.log('Checking existing Stripe account:', accountId);
  const account = await stripe.accounts.retrieve(accountId);
  
  // If account exists but setup is not complete, generate a new account link
  if (!account.details_submitted || !account.payouts_enabled) {
    console.log('Account exists but setup incomplete');
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${origin}/author/settings?refresh=true`,
      return_url: `${origin}/author/settings?setup=complete`,
      type: 'account_onboarding',
    });

    return {
      url: accountLink.url,
      status: 'incomplete_setup'
    };
  }
  
  console.log('Account status:', {
    details_submitted: account.details_submitted,
    payouts_enabled: account.payouts_enabled,
    requirements: account.requirements
  });

  // Generate account link for existing account updates
  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${origin}/author/settings?refresh=true`,
    return_url: `${origin}/author/settings?setup=complete`,
    type: 'account_onboarding',
  });

  return {
    url: accountLink.url,
    status: 'update_existing',
    accountId: accountId
  };
};
