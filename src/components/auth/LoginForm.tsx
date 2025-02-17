
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface LoginFormProps {
  onResetPassword: () => void;
}

export const LoginForm = ({ onResetPassword }: LoginFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (signInError) {
        if (signInError.message.includes('Invalid login credentials')) {
          throw new Error("Invalid email or password");
        }
        throw signInError;
      }

      if (!signInData?.user) {
        throw new Error("No user data returned");
      }

      // Get the profile to check if they are an author
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', signInData.user.id)
        .single();

      if (profileError) {
        throw new Error("Failed to load user profile");
      }

      if (profile?.role !== 'author') {
        throw new Error("This login is only for authors");
      }

      toast({
        title: "Welcome back!",
        description: "You've successfully logged in."
      });

      // Reset loading state before navigation to prevent UI freeze
      setIsLoading(false);
      navigate("/author/dashboard");
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "An error occurred during login");
      toast({
        title: "Error",
        description: err.message || "An error occurred during login",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-6">
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
        disabled={isLoading}
        className="w-full text-[#2D3748] bg-[#ffd166]"
      >
        {isLoading ? "Signing in..." : "Sign In"}
      </Button>

      <div className="space-y-2 text-center">
        <button
          type="button"
          onClick={onResetPassword}
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
  );
};
