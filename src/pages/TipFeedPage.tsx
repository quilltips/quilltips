
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { TipHistory } from "@/components/TipHistory";

const TipFeedPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Fetch author profile
  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['author-profile', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .eq('role', 'author')
        .maybeSingle();

      if (profileError) throw profileError;
      if (!profileData) throw new Error('Profile not found');

      return profileData;
    },
    enabled: !!user,
    retry: false,
    meta: {
      errorHandler: (error: Error) => {
        console.error("Tip Feed page error:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to load profile",
          variant: "destructive"
        });
        navigate("/author/login");
      }
    }
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 pt-24">
          <LoadingSpinner />
        </div>
      </Layout>
    );
  }

  if (error || !profile) return null;

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-playfair font-medium text-[#2D3748]">Tip Feed</h1>
            </div>

            <div className="bg-white border border-black rounded-xl p-6 shadow-sm">
              <TipHistory 
                authorId={profile.id} 
                isDashboard={false} 
                customTitle="Your Tip Activity"
              />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TipFeedPage;
