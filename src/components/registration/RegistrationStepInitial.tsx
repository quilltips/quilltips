
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
      // Using a different approach to check if the email exists
      // First, attempt to sign in with a dummy password to see if the account exists
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: "dummy-password-for-check" // We don't care if this fails due to wrong password
      });

      // If we get a specific error message about invalid credentials, the email exists
      if (signInError && signInError.message.includes("Invalid login credentials")) {
        setError("An account with this email already exists. Would you like to log in instead?");
        setCheckingEmail(false);
        return;
      }
      
      // If we don't get an error about invalid credentials, check if it's some other error
      // like "Email not confirmed" which would also indicate the email exists
      if (signInError && !signInError.message.includes("Invalid login credentials")) {
        if (signInError.message.includes("Email not confirmed")) {
          setError("An account with this email already exists but hasn't been confirmed. Please check your email.");
          setCheckingEmail(false);
          return;
        }
      }
      
      // If we reach here, the email is likely available for registration
      onNext(email, password);
      
    } catch (err: any) {
      console.error("Email check error:", err);
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
