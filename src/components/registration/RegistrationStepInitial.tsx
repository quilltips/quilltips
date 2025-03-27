
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
      // First, let's check if the user already exists using a more direct method
      const { data: userExists, error: checkError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .maybeSingle();
      
      // If we got a user back, the email is already registered
      if (userExists) {
        setError("An account with this email already exists. Would you like to log in instead?");
        setCheckingEmail(false);
        return;
      }

      // Alternative check using auth API
      const { error: signUpCheckError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
          // Just check, don't complete signup
          data: {
            email_check_only: true
          }
        }
      });

      // If the error contains "already registered", the email exists
      if (signUpCheckError && signUpCheckError.message.includes("already registered")) {
        setError("An account with this email already exists. Would you like to log in instead?");
        setCheckingEmail(false);
        return;
      }
      
      // If we got this far, email should be available
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
