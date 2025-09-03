
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "./ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { RegistrationStepInitial } from "./registration/RegistrationStepInitial";
import { RegistrationStepOTP } from "./registration/RegistrationStepOTP";
import { RegistrationStepDetails } from "./registration/RegistrationStepDetails";
import { RegistrationStepStripe } from "./registration/RegistrationStepStripe";
import { useEffect } from "react";

type RegistrationStep = "initial" | "otp-verification" | "details" | "stripe-onboarding";

export const AuthorRegistrationForm = () => {
  const [currentStep, setCurrentStep] = useState<RegistrationStep>("initial");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registrationData, setRegistrationData] = useState<{
    email?: string;
    password?: string;
    prefillName?: string;
    prefillBio?: string;
    prefillSocialLinks?: { url: string; label: string }[];
    prefillAvatarDataUrl?: string;
  }>({});
  // Load prefill data from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem('qt_registration_prefill');
      if (raw) {
        const parsed = JSON.parse(raw);
        setRegistrationData((prev) => ({
          ...prev,
          prefillName: parsed?.name || undefined,
          prefillBio: parsed?.bio || undefined,
          prefillSocialLinks: parsed?.socialLinks || undefined,
          prefillAvatarDataUrl: parsed?.avatarDataUrl || undefined,
        }));
        // Clear prefill after loading to avoid stale data later
        localStorage.removeItem('qt_registration_prefill');
      }
    } catch (_) {}
  }, []);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleInitialSubmit = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log("Starting custom signup process...");
      
      // First, create the user account without email confirmation
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            role: "author"
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

      console.log("User account created, sending verification code...");
      
      // Send custom verification code
      const { data, error: emailError } = await supabase.functions.invoke('send-verification-code', {
        body: {
          email,
          type: 'signup'
        }
      });

      if (emailError) {
        console.error("Email sending error:", emailError);
        throw new Error("Account created but failed to send verification email. Please try again.");
      }

      if (!data?.success) {
        throw new Error(data?.error || "Failed to send verification email");
      }

      console.log("Verification code sent successfully");
      setRegistrationData({ email, password });
      setCurrentStep("otp-verification");
      
      toast({
        title: "Verification code sent!",
        description: "Please check your email for the 6-digit verification code.",
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

  const handleOTPVerified = () => {
    console.log("OTP verified successfully, proceeding to profile setup");
    setCurrentStep("details");
  };

  const handleBackToInitial = () => {
    setCurrentStep("initial");
    setRegistrationData({});
    setError(null);
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
      console.log("Starting profile setup...");
      
      // Get the current authenticated user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error("User not authenticated. Please try the verification process again.");
      }

      console.log("User authenticated, updating profile...");

      // Update the user's profile in the profiles table
      const { error: profileUpdateError } = await supabase
        .from('profiles')
        .update({
          name,
          bio,
          social_links: socialLinks
        })
        .eq('id', user.id);

      if (profileUpdateError) {
        console.error("Profile update error:", profileUpdateError);
        throw profileUpdateError;
      }

      await new Promise(resolve => setTimeout(resolve, 500));
      
      let avatarUrl = null;
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const filePath = `${user.id}-${Date.now()}.${fileExt}`;

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
            .eq('id', user.id);

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
      
      const publicProfileSuccess = await createPublicProfile(user.id, profileData);
      
      if (!publicProfileSuccess) {
        console.warn("Public profile creation failed, but user was created successfully");
        toast({
          title: "Profile Setup Partially Complete",
          description: "Your account was created but there was an issue setting up your public profile. Some features may be limited.",
          variant: "default",
        });
      }

      console.log("Profile setup successful");
      
      // Send account_setup_complete email notification
      try {
        await supabase.functions.invoke('send-email-notification', {
          body: {
            type: 'account_setup_complete',
            userId: user.id
          }
        });
        console.log("Registration welcome email sent");
      } catch (emailError) {
        console.error("Error sending welcome email:", emailError);
        // Continue with registration flow even if email fails
      }
      
      setCurrentStep("stripe-onboarding");
      
      toast({
        title: "Profile created successfully!",
        description: "Let's set up your payment details to start receiving tips.",
      });
    } catch (err: any) {
      console.error("Profile setup error:", err);
      setError(err.message || "An error occurred during profile setup");
      
      toast({
        title: "Profile Setup Failed",
        description: err.message || "An error occurred during profile setup",
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
    <Card className="auth-card mx-auto animate-enter flex items-center justify-center">
      <div className="w-full flex justify-center">
     
        {currentStep === "initial" && (
           <div className="w-full max-w-sm mx-auto">
              <RegistrationStepInitial
                isLoading={isLoading}
                onNext={handleInitialSubmit}
              />
          </div>
        )}

        {currentStep === "otp-verification" && (
          <div className="w-full max-w-md mx-auto">
            <RegistrationStepOTP
              email={registrationData.email!}
              onVerified={handleOTPVerified}
              onBack={handleBackToInitial}
            />
          </div>
        )}

        {currentStep === "details" && (
          <div className="w-full max-w-md mx-auto">
            <RegistrationStepDetails
              isLoading={isLoading}
              error={error}
              onAvatarSelected={(file) => setAvatarFile(file)}
              onSubmit={handleDetailsSubmit}
              initialName={registrationData.prefillName}
              initialBio={registrationData.prefillBio}
              initialSocialLinks={registrationData.prefillSocialLinks}
              initialAvatarPreview={registrationData.prefillAvatarDataUrl}
            />
          </div>
        )}
       
        {currentStep === "stripe-onboarding" && (
          <div className="w-full max-w-3xl mx-auto">
            <RegistrationStepStripe onComplete={handleOnboardingComplete} />
          </div>
        )}
      </div>
    </Card>
  );
};
