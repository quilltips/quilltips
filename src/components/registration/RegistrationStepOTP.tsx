
import { OTPVerificationForm } from "../auth/OTPVerificationForm";

interface RegistrationStepOTPProps {
  email: string;
  onVerified: () => void;
  onBack: () => void;
}

export const RegistrationStepOTP = ({ email, onVerified, onBack }: RegistrationStepOTPProps) => {
  return <OTPVerificationForm email={email} onVerified={onVerified} onBack={onBack} />;
};
