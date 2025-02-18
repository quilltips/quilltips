
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAuthorAccess = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session && location.pathname === '/') {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
          
        if (profile?.role === 'author') {
          navigate('/author/dashboard');
        }
      }
    };

    checkAuthorAccess();
  }, [navigate, location.pathname]);

  return <>{children}</>;
};
