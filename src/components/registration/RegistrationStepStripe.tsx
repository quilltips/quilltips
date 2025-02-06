import { EmbeddedStripeConnect } from "../stripe/EmbeddedStripeConnect";

interface RegistrationStepStripeProps {
  onComplete: () => void;
}

export const RegistrationStepStripe = ({ onComplete }: RegistrationStepStripeProps) => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-[#2D3748]">Set Up Payments</h2>
        <p className="text-muted-foreground">
          Complete your Stripe Connect onboarding to start receiving tips
        </p>
      </div>
      <EmbeddedStripeConnect onComplete={onComplete} />
    </div>
  );
};