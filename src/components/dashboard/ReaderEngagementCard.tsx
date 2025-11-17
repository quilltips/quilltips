import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Users, Mail, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ReaderEngagementCardProps {
  authorId: string;
}

export const ReaderEngagementCard = ({ authorId }: ReaderEngagementCardProps) => {
  const navigate = useNavigate();

  // Check if any signup features are enabled
  const { data: profileSettings, isLoading: profileLoading } = useQuery({
    queryKey: ['profile-settings', authorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('arc_signup_enabled, beta_reader_enabled, newsletter_enabled')
        .eq('id', authorId)
        .single();
      
      if (error) throw error;
      return data;
    }
  });
  
  const { data, isLoading } = useQuery({
    queryKey: ['author-reader-engagement', authorId],
    queryFn: async () => {
      // Fetch ARC signups
      const { data: arcSignups, error: arcError } = await supabase
        .from('arc_signups')
        .select('created_at')
        .eq('author_id', authorId);
      
      if (arcError) throw arcError;

      // Fetch Beta Reader signups
      const { data: betaSignups, error: betaError } = await supabase
        .from('beta_reader_signups')
        .select('created_at')
        .eq('author_id', authorId);
      
      if (betaError) throw betaError;

      // Fetch Newsletter signups
      const { data: newsletterSignups, error: newsletterError } = await supabase
        .from('author_newsletter_signups')
        .select('created_at')
        .eq('author_id', authorId);
      
      if (newsletterError) throw newsletterError;

      // Calculate totals
      const totalARC = arcSignups.length;
      const totalBeta = betaSignups.length;
      const totalNewsletter = newsletterSignups.length;
      const totalSignups = totalARC + totalBeta + totalNewsletter;

      return {
        totalARC,
        totalBeta,
        totalNewsletter,
        totalSignups
      };
    },
    enabled: !!(profileSettings?.arc_signup_enabled || profileSettings?.beta_reader_enabled || profileSettings?.newsletter_enabled)
  });

  // Show the card if signup features are enabled OR if there's existing data
  const hasAnySignupEnabled = profileSettings?.arc_signup_enabled || 
                              profileSettings?.beta_reader_enabled || 
                              profileSettings?.newsletter_enabled;
                              
  const hasExistingData = data && (data.totalARC > 0 || data.totalBeta > 0 || data.totalNewsletter > 0);

  if (!hasAnySignupEnabled && !hasExistingData) {
    return null;
  }

  if (isLoading || profileLoading) {
    return (
      <Card className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow">
        <CardContent className="p-4 flex justify-center items-center">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  const handleClick = () => {
    navigate('/author/data');
  };

  return (
    <Card 
      className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
      onClick={handleClick}
    >
      <CardContent className="p-3 sm:p-4 md:p-6 bg-[#FFD166] text-[#19363C]">
        <div className="flex items-center justify-between gap-3 sm:gap-4 md:gap-6">
          <div className="flex-shrink-0">
            <h2 className="text-base sm:text-lg md:text-xl font-playfair font-medium">Reader Engagement</h2>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-1 justify-end">
            <div className="text-center">
              <div className="text-xl sm:text-2xl md:text-3xl font-bold">{data?.totalSignups || '0'}</div>
              <div className="text-[10px] sm:text-xs opacity-80 whitespace-nowrap">Total signups</div>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
              <div className="flex items-center gap-1">
                <BookOpen className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="font-semibold">{data?.totalARC || '0'}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="font-semibold">{data?.totalBeta || '0'}</span>
              </div>
              <div className="flex items-center gap-1">
                <Mail className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="font-semibold">{data?.totalNewsletter || '0'}</span>
              </div>
            </div>
            
            <div className="text-[10px] sm:text-xs opacity-80 whitespace-nowrap hidden sm:block">ARC / Beta / Newsletter</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};