
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
      // First, check if the user already exists in the profiles table
      // Using unknown type with explicit destructuring to avoid deep type inference
      const result: unknown = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .limit(1);
      
      // Safely access data property
      const data = (result as { data: any[] | null }).data;
      
      // If we found any profiles with this email, it's already taken
      if (data && data.length > 0) {
        setError("An account with this email already exists. Would you like to log in instead?");
        setCheckingEmail(false);
        return;
      }

      // Double-check with auth API (some users might exist in auth but not have profiles yet)
      const { error: signUpCheckError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin
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
