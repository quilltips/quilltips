
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthorLoginForm } from "@/components/AuthorLoginForm";
import { Layout } from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";

const AuthorLogin = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Session check error:', error);
        return;
      }
      
      if (session) {
        // Verify if the user is an author before redirecting
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
          
        if (!profileError && profile?.role === 'author') {
          navigate("/author/dashboard");
        }
      }
    };

    checkSession();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        // Verify author role before redirecting
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
          
        if (!profileError && profile?.role === 'author') {
          navigate("/author/dashboard");
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  return (
    <Layout>
      <div className="container mx-auto px-4 pt-24 pb-12 py-[75px]">
        <AuthorLoginForm />
      </div>
    </Layout>
  );
};

export default AuthorLogin;
