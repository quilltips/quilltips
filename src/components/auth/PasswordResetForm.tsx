
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PasswordResetFormProps {
  onBackToLogin: () => void;
}

export const PasswordResetForm = ({ onBackToLogin }: PasswordResetFormProps) => {
  const [isResetting, setIsResetting] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsResetting(true);
    setError(null);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        resetEmail,
        {
          redirectTo: `${window.location.origin}/author/reset-password`
        }
      );

      if (resetError) throw resetError;

      toast({
        title: "Password Reset Email Sent",
        description: "Check your email for the password reset link."
      });

      setResetEmail("");
      onBackToLogin();
    } catch (err: any) {
      console.error("Reset password error:", err);
      setError(err.message || "An error occurred while requesting password reset");
      toast({
        title: "Error",
        description: err.message || "An error occurred while requesting password reset",
        variant: "destructive"
      });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-[#2D3748]">Reset Password</h2>
        <p className="text-muted-foreground">
          Enter your email to receive a password reset link
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleResetPassword} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="resetEmail">Email</Label>
          <Input
            id="resetEmail"
            type="email"
            value={resetEmail}
            onChange={e => setResetEmail(e.target.value)}
            required
            disabled={isResetting}
            className="hover-lift bg-white/50"
            placeholder="Enter your email"
          />
        </div>

        <Button
          type="submit"
          className="w-full bg-[#FEC6A1] hover:bg-[#FEC6A1]/90 text-[#2D3748]"
          disabled={isResetting}
        >
          {isResetting ? "Sending Reset Link..." : "Send Reset Link"}
        </Button>

        <button
          type="button"
          onClick={onBackToLogin}
          className="text-sm text-muted-foreground hover:text-[#2D3748] w-full text-center"
        >
          Back to login
        </button>
      </form>
    </div>
  );
};
