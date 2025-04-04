import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthorLoginForm } from "@/components/AuthorLoginForm";
import { Layout } from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
const AuthorLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    toast
  } = useToast();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        console.log('Checking login page auth status...');
        const {
          data: {
            session
          }
        } = await supabase.auth.getSession();
        if (session?.user) {
          const {
            data: profile
          } = await supabase.from('profiles').select('role').eq('id', session.user.id).maybeSingle();
          if (profile?.role === 'author') {
            console.log('Author already logged in, redirecting to dashboard...');
            navigate("/author/dashboard");
            return;
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
        toast({
          title: "Error",
          description: "Failed to check authentication status.",
          variant: "destructive"
        });
      } finally {
        setIsCheckingAuth(false);
      }
    };
    checkAuthStatus();
  }, [navigate, toast]);
  if (isCheckingAuth) {
    return <Layout>
        <div className="container mx-auto px-4 pt-24">
          <LoadingSpinner />
        </div>
      </Layout>;
  }
  return <Layout>
      <div className="container mx-auto px-4 pt-24 pb-12 max-w-lg py-[37px]">
        <AuthorLoginForm />
      </div>
    </Layout>;
};
export default AuthorLogin;