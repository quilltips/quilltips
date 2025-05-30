
import { BankAccountConnect } from "../profile/BankAccountConnect";
import { EmailTestButton } from "../profile/EmailTestButton";

interface PaymentTabProps {
  profile: {
    id: string;
    stripe_account_id?: string | null;
  };
}

export const PaymentTab = ({ profile }: PaymentTabProps) => {
  return (
    <div className="space-y-4 pt-8">
      <BankAccountConnect
        profileId={profile.id}
        stripeAccountId={profile.stripe_account_id ?? null}
      />

   

      <div className="pt-8 border-t border-gray-100">
        <h3 className="text-base font-medium mb-4">Troubleshooting</h3>
        <EmailTestButton profileId={profile.id} />
      </div>
    </div>
  );
};
