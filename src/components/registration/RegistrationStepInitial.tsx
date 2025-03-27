
import { useState } from "react";
import { InitialRegistrationFields } from "../InitialRegistrationFields";
import { Alert, AlertDescription } from "../ui/alert";
import { supabase } from "@/integrations/supabase/client";

interface RegistrationStepInitialProps {
  isLoading: boolean;
  onNext: (email: string, password: string) => void;
}

export const RegistrationStepInitial = ({
  isLoading,
  onNext,
}: RegistrationStepInitialProps) => {
  const [error, setError] = useState<string | null>(null);
  const [checkingEmail, setCheckingEmail] = useState(false);

  const handleNext = async (email: string, password: string) => {
    setError(null);
    setCheckingEmail(true);
    
    try {
      // Check if the email is already registered
      const { data, error: checkError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false,
        }
      });
      
      // If we can send an OTP or user exists, the email is already registered
      if (data.session || data.user) {
        setError("An account with this email already exists. Would you like to log in instead?");
        setCheckingEmail(false);
        return;
      }
      
      // If error is "User not found", then email is available
      if (checkError && checkError.message.includes("User not found")) {
        onNext(email, password);
      } else {
        // Any other error means we should be cautious
        setError("Unable to verify email availability. Please try again later.");
      }
    } catch (err: any) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setCheckingEmail(false);
    }
  };

  return (
    <>
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <InitialRegistrationFields 
        isLoading={isLoading || checkingEmail} 
        onNext={handleNext} 
      />
    </>
  );
};
