
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useAuthorLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showResetForm, setShowResetForm] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      // First, clear any existing session
      await supabase.auth.signOut();

      // Attempt to sign in with new credentials
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (signInError) {
        // Handle specific error cases
        if (signInError.message.includes('Invalid login credentials')) {
          throw new Error("Invalid email or password");
        }
        throw signInError;
      }

      if (!signInData?.user) {
        throw new Error("No user data returned");
      }

      // Check if email is verified
      if (!signInData.user.email_confirmed_at) {
        console.log("User email not verified, sending verification code");
        
        // Send verification code
        await supabase.functions.invoke('send-verification-code', {
          body: { email, type: 'login' }
        });
        
        // Sign them out
        await supabase.auth.signOut();
        
        // Redirect to verification page
        navigate('/author/verify-email', { 
          state: { email, fromLogin: true }
        });
        
        toast({
          title: "Email Verification Required",
          description: "Please verify your email to continue. We've sent you a new code."
        });
        
        return;
      }

      // Get the current session to verify it's valid
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.error("Session error:", sessionError);
        throw new Error("Failed to establish session");
      }

      if (!session) {
        throw new Error("No valid session established");
      }

      // Check if profile exists
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', signInData.user.id)
        .single();

      if (profileError) {
        console.error("Profile fetch error:", profileError);
        // Only throw if it's not a "no rows returned" error
        if (profileError.code !== 'PGRST116') {
          throw profileError;
        }
      }

      // Create profile if it doesn't exist
      if (!profile) {
        const { error: createError } = await supabase
          .from('profiles')
          .insert([{
            id: signInData.user.id,
            name: email.split('@')[0], // Use email username as initial name
            role: 'author'
          }]);

        if (createError) {
          console.error("Profile creation error:", createError);
          throw createError;
        }
      }

      toast({
        title: "Welcome back!",
        description: "You've successfully logged in."
      });

      // Navigate to dashboard after successful login
      navigate("/author/dashboard");
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "An error occurred during login");
      toast({
        title: "Error",
        description: err.message || "An error occurred during login",
        variant: "destructive"
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
      // Use our custom password reset edge function
      const { data, error } = await supabase.functions.invoke('send-password-reset', {
        body: { email: resetEmail }
      });

      if (error) throw error;

      toast({
        title: "Password Reset Email Sent",
        description: "If an account with that email exists, a password reset link has been sent."
      });

      setResetEmail("");
      setShowResetForm(false);
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

  return {
    isLoading,
    isResetting,
    resetEmail,
    setResetEmail,
    error,
    showResetForm,
    setShowResetForm,
    handleLogin,
    handleResetPassword
  };
};
