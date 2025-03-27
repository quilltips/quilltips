
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
      // A more reliable way to check if an email exists is to use the admin APIs
      // Since we don't have access to those in the client, we'll just proceed with the registration
      // The actual signup in the next step will properly handle duplicate emails
      
      // Clear any previous errors and proceed to the next step
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
