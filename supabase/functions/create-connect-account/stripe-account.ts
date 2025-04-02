
import { Stripe } from "npm:stripe@14.21.0";

export interface StripeAccountResponse {
  accountId: string;
  url: string;
}

export const createOrUpdateStripeAccount = async (
  stripe: Stripe,
  userId: string,
  existingAccountId?: string
): Promise<StripeAccountResponse> => {
  try {
    // If user already has a Stripe account, get the onboarding link
    if (existingAccountId) {
      console.log(`Generating account link for existing account: ${existingAccountId}`);
      
      // Update the account with metadata if not already set
      const account = await stripe.accounts.update(existingAccountId, {
        metadata: { supabaseUserId: userId },
      });
      
      console.log(`Updated metadata for Stripe account: ${account.id}`);
      
      // Create an account link for the dashboard
      const accountLink = await stripe.accountLinks.create({
        account: existingAccountId,
        refresh_url: `${Deno.env.get("APP_URL")}/author/bank-account?refresh=true`,
        return_url: `${Deno.env.get("APP_URL")}/author/bank-account?setup=complete`,
        type: "account_onboarding",
      });
      
      return {
        accountId: existingAccountId,
        url: accountLink.url,
      };
    }

    // Create a new Connect account
    const account = await stripe.accounts.create({
      type: "express",
      capabilities: {
        transfers: { requested: true },
        card_payments: { requested: true },
      },
      metadata: {
        supabaseUserId: userId,
      },
      business_type: "individual",
    });

    console.log(`Created new Stripe account: ${account.id}`);

    // Create an account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${Deno.env.get("APP_URL")}/author/bank-account?refresh=true`,
      return_url: `${Deno.env.get("APP_URL")}/author/bank-account?setup=complete`,
      type: "account_onboarding",
    });

    return {
      accountId: account.id,
      url: accountLink.url,
    };
  } catch (error) {
    console.error("Error creating or updating Stripe account:", error);
    throw error;
  }
};
