import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "./ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { RegistrationStepInitial } from "./registration/RegistrationStepInitial";
import { RegistrationStepDetails } from "./registration/RegistrationStepDetails";
import { RegistrationStepStripe } from "./registration/RegistrationStepStripe";

type RegistrationStep = "initial" | "details" | "stripe-onboarding";

export const AuthorRegistrationForm = () => {
  const [currentStep, setCurrentStep] = useState<RegistrationStep>("initial");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registrationData, setRegistrationData] = useState<{
    email?: string;
    password?: string;
  }>({});
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
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

      if (signUpError) throw signUpError;

      if (avatarFile && data.user) {
        const fileExt = avatarFile.name.split('.').pop();
        const filePath = `${data.user.id}-${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, avatarFile);

        if (uploadError) {
          console.error("Avatar upload error:", uploadError);
          toast({
            title: "Avatar Upload Failed",
            description: "Your account was created but we couldn't upload your profile picture. You can try again later.",
            variant: "destructive",
          });
        } else {
          const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath);

          await supabase
            .from('profiles')
            .update({ avatar_url: publicUrl })
            .eq('id', data.user.id);
        }
      }

      setCurrentStep("stripe-onboarding");
      
      toast({
        title: "Registration successful!",
        description: "Let's set up your payment details to start receiving tips.",
      });
    } catch (err: any) {
      console.error("Registration error:", err);
      setError(err.message || "An error occurred during registration");
      
      toast({
        title: "Registration Failed",
        description: err.message || "An error occurred during registration",
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

  return (
    <Card className="auth-card max-w-md mx-auto animate-enter">
      {currentStep === "initial" && (
        <RegistrationStepInitial
          isLoading={isLoading}
          onNext={handleInitialSubmit}
        />
      )}

      {currentStep === "details" && (
        <RegistrationStepDetails
          isLoading={isLoading}
          error={error}
          onAvatarSelected={(file) => setAvatarFile(file)}
          onSubmit={handleDetailsSubmit}
        />
      )}

      {currentStep === "stripe-onboarding" && (
        <RegistrationStepStripe onComplete={handleOnboardingComplete} />
      )}
    </Card>
  );
};
