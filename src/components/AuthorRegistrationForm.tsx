import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";
import { AuthorRegistrationFields } from "./AuthorRegistrationFields";
import { InitialRegistrationFields } from "./InitialRegistrationFields";
import { Alert, AlertDescription } from "./ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { EmbeddedStripeConnect } from "./stripe/EmbeddedStripeConnect";
import { PaymentSetupChoice } from "./PaymentSetupChoice";

type RegistrationStep = "initial" | "details" | "payment-choice" | "stripe-onboarding";

export const AuthorRegistrationForm = () => {
  const [currentStep, setCurrentStep] = useState<RegistrationStep>("initial");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registrationData, setRegistrationData] = useState<{
    email?: string;
    password?: string;
  }>({});
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleInitialSubmit = async (email: string, password: string) => {
    setRegistrationData({ email, password });
    setCurrentStep("details");
  };

  const handleDetailsSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const bio = formData.get("bio") as string;
    const socialLinks = JSON.parse(formData.get("socialLinks") as string || "[]");

    try {
      console.log("Starting registration process...");
      const { error: signUpError, data } = await supabase.auth.signUp({
        email: registrationData.email!,
        password: registrationData.password!,
        options: {
          data: {
            name,
            bio,
            role: "author",
            social_links: socialLinks
          }
        }
      });

      if (signUpError) {
        console.error("Signup error:", signUpError);
        
        if (signUpError.message === "User already registered") {
          throw new Error("This email is already registered. Please try logging in instead.");
        }
        
        throw signUpError;
      }

      console.log("Registration successful:", data);
      setCurrentStep("payment-choice");
      
      toast({
        title: "Registration successful!",
        description: "Please choose whether to set up payments now or later.",
      });
    } catch (err: any) {
      console.error("Registration error:", err);
      setError(err.message || "An error occurred during registration");
      
      toast({
        title: "Registration Failed",
        description: err.message === "User already registered" 
          ? "This email is already registered. Please try logging in instead."
          : err.message || "An error occurred during registration",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOnboardingComplete = () => {
    toast({
      title: "Onboarding Complete",
      description: "Your Stripe Connect account has been set up successfully.",
    });
    navigate("/author/dashboard");
  };

  const handleSkipOnboarding = () => {
    toast({
      title: "Setup Skipped",
      description: "You can set up payments later from your dashboard.",
    });
    navigate("/author/dashboard");
  };

  return (
    <Card className="auth-card max-w-md mx-auto animate-enter">
      {currentStep === "initial" && (
        <InitialRegistrationFields
          isLoading={isLoading}
          onNext={handleInitialSubmit}
        />
      )}

      {currentStep === "details" && (
        <form onSubmit={handleDetailsSubmit} className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-[#2D3748]">Complete your profile</h2>
            <p className="text-muted-foreground">
              Tell readers about yourself
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <AuthorRegistrationFields isLoading={isLoading} />

          <Button
            type="submit"
            className="w-full bg-[#FEC6A1] hover:bg-[#FEC6A1]/90 text-[#2D3748]"
            disabled={isLoading}
          >
            {isLoading ? "Creating account..." : "Continue"}
          </Button>
        </form>
      )}

      {currentStep === "payment-choice" && (
        <PaymentSetupChoice
          onContinue={() => setCurrentStep("stripe-onboarding")}
          onSkip={handleSkipOnboarding}
        />
      )}

      {currentStep === "stripe-onboarding" && (
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-[#2D3748]">Set Up Payments</h2>
          <p className="text-muted-foreground">
            Complete your Stripe Connect onboarding to start receiving tips
          </p>
          <EmbeddedStripeConnect onComplete={handleOnboardingComplete} />
        </div>
      )}
    </Card>
  );
};