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

  const createPublicProfile = async (userId: string, profileData: any) => {
    try {
      const { name, bio, avatar_url, social_links } = profileData;
      
      const { error: insertError } = await supabase
        .from('public_profiles')
        .insert({
          id: userId,
          name: name || '',
          bio: bio || '',
          avatar_url: avatar_url || '',
          social_links: social_links || []
        });
        
      if (insertError) {
        console.error("Error creating public profile:", insertError);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("Unexpected error creating public profile:", error);
      return false;
    }
  };

  const handleDetailsSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const bio = formData.get("bio") as string;
    
    let socialLinks = [];
    try {
      const socialLinksString = formData.get("socialLinks") as string;
      if (socialLinksString && socialLinksString.trim()) {
        const parsed = JSON.parse(socialLinksString);
        if (Array.isArray(parsed)) {
          socialLinks = parsed;
        } else {
          console.warn("Social links is not an array, defaulting to empty array");
        }
      }
    } catch (err) {
      console.error("Error parsing social links:", err);
    }

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

      if (!data.user) {
        throw new Error("Failed to create user account");
      }

      await new Promise(resolve => setTimeout(resolve, 500));
      
      let avatarUrl = null;
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const filePath = `${data.user.id}-${Date.now()}.${fileExt}`;

        const { error: uploadError, data: uploadData } = await supabase.storage
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
            
          avatarUrl = publicUrl;

          const { error: updateError } = await supabase
            .from('profiles')
            .update({ avatar_url: publicUrl })
            .eq('id', data.user.id);

          if (updateError) {
            console.error("Profile update error:", updateError);
          }
        }
      }

      const profileData = {
        name,
        bio,
        avatar_url: avatarUrl,
        social_links: socialLinks
      };
      
      const publicProfileSuccess = await createPublicProfile(data.user.id, profileData);
      
      if (!publicProfileSuccess) {
        console.warn("Public profile creation failed, but user was created successfully");
        toast({
          title: "Registration Partially Complete",
          description: "Your account was created but there was an issue setting up your public profile. Some features may be limited.",
          variant: "default",
        });
      }

      console.log("Registration successful:", data);
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
