
import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Alert, AlertDescription } from "../ui/alert";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "../ui/input-otp";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface OTPVerificationFormProps {
  email: string;
  onVerified: () => void;
  onBack: () => void;
}

export const OTPVerificationForm = ({ email, onVerified, onBack }: OTPVerificationFormProps) => {
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendCountdown, setResendCountdown] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      setError("Please enter the complete 6-digit code");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log("Verifying OTP code:", otp);
      
      // Call our custom verification function
      const { data, error: verifyError } = await supabase.functions.invoke('verify-code', {
        body: {
          email,
          code: otp
        }
      });

      if (verifyError) {
        console.error("OTP verification error:", verifyError);
        setError(verifyError.message || "Failed to verify code. Please try again.");
        return;
      }

      if (!data?.success) {
        setError(data?.error || "Invalid verification code. Please try again.");
        return;
      }

      toast({
        title: "Email verified!",
        description: "Your email has been successfully verified.",
      });

      onVerified();
    } catch (err: any) {
      console.error("Verification error:", err);
      setError(err.message || "An error occurred during verification");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setIsResending(true);
    setError(null);

    try {
      console.log("Resending verification code to:", email);
      
      // Call our custom send verification code function
      const { data, error: resendError } = await supabase.functions.invoke('send-verification-code', {
        body: {
          email,
          type: 'signup'
        }
      });

      if (resendError) {
        console.error("Resend error:", resendError);
        setError(resendError.message || "Failed to resend verification code");
        return;
      }

      if (!data?.success) {
        setError(data?.error || "Failed to resend verification code");
        return;
      }

      toast({
        title: "Code sent!",
        description: "A new verification code has been sent to your email.",
      });

      setResendCountdown(60); // 60 second cooldown
      setOtp(""); // Clear the current OTP input
    } catch (err: any) {
      console.error("Resend error:", err);
      setError(err.message || "Failed to resend verification code");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-semibold text-[#2D3748]">Verify your email</h2>
        <p className="text-gray-600">
          We've sent a 6-digit code to <span className="font-medium">{email}</span>
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        <div className="flex justify-center">
          <InputOTP
            value={otp}
            onChange={setOtp}
            maxLength={6}
            disabled={isLoading}
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>

        <Button
          onClick={handleVerifyOTP}
          disabled={isLoading || otp.length !== 6}
          className="w-full bg-[#FFD166] hover:bg-[#FFD166]/90 text-[#2D3748]"
        >
          {isLoading ? "Verifying..." : "Verify Email"}
        </Button>

        <div className="text-center space-y-2">
          <p className="text-sm text-gray-600">
            Didn't receive the code?
          </p>
          <Button
            variant="ghost"
            onClick={handleResendOTP}
            disabled={isResending || resendCountdown > 0}
            className="text-[#2D3748] hover:underline"
          >
            {resendCountdown > 0 
              ? `Resend in ${resendCountdown}s` 
              : isResending 
                ? "Sending..." 
                : "Resend code"
            }
          </Button>
        </div>

        <Button
          variant="ghost"
          onClick={onBack}
          className="w-full text-gray-600 hover:text-[#2D3748]"
        >
          Back to registration
        </Button>
      </div>
    </div>
  );
};
