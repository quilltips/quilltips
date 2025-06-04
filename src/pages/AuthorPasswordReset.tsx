
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Eye, EyeOff } from "lucide-react";

const AuthorPasswordReset = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);

  useEffect(() => {
    const validateSession = async () => {
      try {
        // Check if we have a valid recovery session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        console.log("Current session:", session);
        console.log("Session error:", error);

        if (error) {
          setError("Invalid or expired reset link. Please request a new password reset.");
          setIsValidating(false);
          return;
        }

        // Check if this is a recovery session (password reset)
        if (session?.user && session.user.recovery_sent_at) {
          setIsValidSession(true);
          console.log("Valid recovery session found");
        } else {
          // Check URL fragments for tokens (Supabase auth uses URL fragments)
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');
          const type = hashParams.get('type');

          if (accessToken && type === 'recovery') {
            // Set the session using the tokens from URL
            const { error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken || ''
            });

            if (sessionError) {
              setError("Invalid or expired reset link. Please request a new password reset.");
            } else {
              setIsValidSession(true);
              console.log("Session set from URL tokens");
            }
          } else {
            setError("Invalid reset link. Please request a new password reset.");
          }
        }
      } catch (err: any) {
        console.error("Session validation error:", err);
        setError("Failed to validate reset token. Please try again.");
      } finally {
        setIsValidating(false);
      }
    };

    validateSession();
  }, []);

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Validate passwords
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Password Updated",
        description: "Your password has been successfully updated. You can now log in with your new password.",
      });

      // Sign out the user and redirect to login
      await supabase.auth.signOut();
      navigate("/author/login");
    } catch (err: any) {
      console.error("Password reset error:", err);
      setError(err.message || "Failed to update password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isValidating) {
    return (
      <div className="container mx-auto px-4 pt-24">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isValidSession) {
    return (
      <div className="container mx-auto px-4 pt-24 pb-12 max-w-lg">
        <Card className="auth-card mx-auto animate-enter">
          <div className="p-6 space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-[#2D3748]">Invalid Reset Link</h2>
              <p className="text-gray-600">
                This password reset link is invalid or has expired.
              </p>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button 
              onClick={() => navigate("/author/login")} 
              className="w-full bg-[#FFD166] hover:bg-[#FFD166]/90 text-[#2D3748]"
            >
              Back to Login
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 pt-24 pb-12 max-w-lg">
      <Card className="auth-card mx-auto animate-enter">
        <form onSubmit={handlePasswordReset} className="space-y-6 p-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-[#2D3748]">Reset Your Password</h2>
            <p className="text-gray-600">
              Enter your new password below.
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="bg-white/50 pr-10"
                  placeholder="Enter new password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="bg-white/50 pr-10"
                  placeholder="Confirm new password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#FFD166] hover:bg-[#FFD166]/90 text-[#2D3748]"
          >
            {isLoading ? "Updating Password..." : "Update Password"}
          </Button>

          <div className="text-center">
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate("/author/login")}
              className="text-sm text-gray-600 hover:text-[#2D3748]"
            >
              Back to Login
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default AuthorPasswordReset;
