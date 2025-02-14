
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "./ui/alert";

export const AuthorLoginForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showResetForm, setShowResetForm] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      // First, clear any existing session
      await supabase.auth.signOut();

      // Attempt to sign in
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        // Handle specific error cases
        if (signInError.message.includes('Invalid login credentials')) {
          throw new Error("Invalid email or password");
        }
        throw signInError;
      }

      if (!data?.user) {
        throw new Error("No user data returned");
      }

      // Get a fresh session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("Session error:", sessionError);
        throw new Error("Failed to establish session");
      }

      if (!sessionData.session) {
        throw new Error("No valid session established");
      }

      // Check if profile exists
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error("Profile fetch error:", profileError);
        throw profileError;
      }

      // Create profile if it doesn't exist
      if (!profile) {
        const { error: createError } = await supabase
          .from('profiles')
          .insert([{
            id: data.user.id,
            name: email,
            role: 'author'
          }]);

        if (createError) throw createError;
      }

      toast({
        title: "Welcome back!",
        description: "You've successfully logged in.",
      });

      navigate("/author/dashboard");
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "An error occurred during login");
      toast({
        title: "Error",
        description: err.message || "An error occurred during login",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsResetting(true);
    setError(null);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        resetEmail,
        {
          redirectTo: `${window.location.origin}/author/reset-password`,
        }
      );

      if (resetError) throw resetError;

      toast({
        title: "Password Reset Email Sent",
        description: "Check your email for the password reset link.",
      });
      setResetEmail("");
    } catch (err: any) {
      console.error("Reset password error:", err);
      setError(err.message || "An error occurred while requesting password reset");
      toast({
        title: "Error",
        description: err.message || "An error occurred while requesting password reset",
        variant: "destructive",
      });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <Card className="auth-card max-w-md mx-auto animate-enter">
      {!showResetForm ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-[#2D3748]">Author Login</h2>
            <p className="text-muted-foreground">
              Welcome back! Sign in to manage your profile and tips
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                disabled={isLoading}
                className="hover-lift bg-white/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                disabled={isLoading}
                className="hover-lift bg-white/50"
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-[#FEC6A1] hover:bg-[#FEC6A1]/90 text-[#2D3748]"
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>

          <div className="space-y-2 text-center">
            <button
              type="button"
              onClick={() => setShowResetForm(true)}
              className="text-sm text-muted-foreground hover:text-[#2D3748]"
            >
              Forgot password?
            </button>
            
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link 
                  to="/author/register" 
                  className="text-[#2D3748] hover:underline font-medium"
                >
                  Register as Author
                </Link>
              </p>
            </div>
          </div>
        </form>
      ) : (
        <div className="space-y-6">
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
                onChange={(e) => setResetEmail(e.target.value)}
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
              onClick={() => setShowResetForm(false)}
              className="text-sm text-muted-foreground hover:text-[#2D3748] w-full text-center"
            >
              Back to login
            </button>
          </form>
        </div>
      )}
    </Card>
  );
};
