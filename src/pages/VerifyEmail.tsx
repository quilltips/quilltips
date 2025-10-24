import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { OTPVerificationForm } from "@/components/auth/OTPVerificationForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const VerifyEmail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>("");
  const [isResending, setIsResending] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Get email from location state or try to get from current user
    const emailFromState = location.state?.email;
    if (emailFromState) {
      setEmail(emailFromState);
    } else {
      // Try to get email from current user session
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user?.email) {
          setEmail(user.email);
        }
      });
    }
  }, [location.state]);

  const handleResendCode = async () => {
    if (!email) return;
    
    setIsResending(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-verification-code', {
        body: {
          email,
          type: 'signup'
        }
      });

      if (error) throw error;

      if (!data?.success) {
        throw new Error(data?.error || "Failed to send verification code");
      }

      toast({
        title: "Verification code sent!",
        description: "Please check your email for the 6-digit verification code.",
      });
    } catch (err: any) {
      console.error("Resend error:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to send verification code",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  const handleVerified = () => {
    toast({
      title: "Email verified!",
      description: "Your email has been successfully verified. You can now access your account.",
    });
    navigate("/author/dashboard");
  };

  const handleBack = () => {
    navigate("/author/login");
  };

  if (!email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Email Verification Required</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              We couldn't determine your email address. Please log in again.
            </p>
            <Button onClick={handleBack} className="w-full">
              Back to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="p-1"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <CardTitle>Verify Your Email</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-6">
            We've sent a 6-digit verification code to <strong>{email}</strong>. 
            Please enter the code below to verify your email address.
          </p>
          
          <OTPVerificationForm
            email={email}
            onVerified={handleVerified}
            onBack={handleBack}
          />
          
          <div className="mt-4 text-center">
            <Button
              variant="outline"
              onClick={handleResendCode}
              disabled={isResending}
              className="w-full"
            >
              {isResending ? "Sending..." : "Resend Code"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
