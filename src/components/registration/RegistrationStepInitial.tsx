import { InitialRegistrationFields } from "../InitialRegistrationFields";

interface RegistrationStepInitialProps {
  isLoading: boolean;
  onNext: (email: string, password: string) => void;
}

export const RegistrationStepInitial = ({
  isLoading,
  onNext,
}: RegistrationStepInitialProps) => {
  return <InitialRegistrationFields isLoading={isLoading} onNext={onNext} />;
};