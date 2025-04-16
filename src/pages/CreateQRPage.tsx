
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { CreateQRCode } from "@/components/CreateQRCode";
import { useToast } from "@/hooks/use-toast";
import { Layout } from "@/components/Layout";
import { HowQRCodesWork } from "@/components/qr/HowQRCodesWork";

const CreateQRPage = () => {
  const [profile, setProfile] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError) throw authError;
        
        if (!user) {
          console.log("No authenticated user found");
          navigate("/author/login");
          return;
        }

        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (profileError) throw profileError;
        
        if (!profileData) {
          throw new Error("Profile not found");
        }

        setProfile(profileData);
      } catch (error: any) {
        console.error("Auth error:", error);
        toast({
          title: "Error",
          description: error?.message || "Failed to load profile",
          variant: "destructive",
        });
        navigate("/author/login");
      }
    };

    checkAuth();
  }, [navigate, toast]);

  if (!profile) {
    return (
      <Layout>
        <div className="container mx-auto px-4 pt-24 pb-12">
          <div className="text-center">Loading...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <main className="container mx-auto px-4 pt-24 pb-12">
        <h1 className="text-3xl text-center font-bold mb-6 text-[#19363C]">Create a new Quilltips Jar</h1>
        <div className="max-w-2xl mx-auto">
         
         <div className="mt-6">
          <CreateQRCode authorId={profile.id} />
          </div> 
          
          {/* Add How QR Codes Work section */}
          <HowQRCodesWork />
        </div>
      </main>
    </Layout>
  );
};

export default CreateQRPage;
