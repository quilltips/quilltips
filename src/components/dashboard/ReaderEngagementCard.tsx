import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { Loader2, Users, Mail, BookOpen } from "lucide-react";

interface ReaderEngagementCardProps {
  authorId: string;
}

export const ReaderEngagementCard = ({ authorId }: ReaderEngagementCardProps) => {
  const { data, isLoading } = useQuery({
    queryKey: ['author-reader-engagement', authorId],
    queryFn: async () => {
      // Fetch ARC signups
      const { data: arcSignups, error: arcError } = await supabase
        .from('arc_signups')
        .select('created_at')
        .eq('author_id', authorId)
        .order('created_at', { ascending: false });
      
      if (arcError) throw arcError;

      // Fetch Beta Reader signups
      const { data: betaSignups, error: betaError } = await supabase
        .from('beta_reader_signups')
        .select('created_at')
        .eq('author_id', authorId)
        .order('created_at', { ascending: false });
      
      if (betaError) throw betaError;

      // Fetch Newsletter signups
      const { data: newsletterSignups, error: newsletterError } = await supabase
        .from('author_newsletter_signups')
        .select('created_at')
        .eq('author_id', authorId)
        .order('created_at', { ascending: false });
      
      if (newsletterError) throw newsletterError;

      // Calculate totals and most recent signup
      const totalARC = arcSignups.length;
      const totalBeta = betaSignups.length;
      const totalNewsletter = newsletterSignups.length;
      const totalSignups = totalARC + totalBeta + totalNewsletter;

      // Find most recent signup across all types
      const allSignups = [
        ...arcSignups.map(s => ({ ...s, type: 'ARC' })),
        ...betaSignups.map(s => ({ ...s, type: 'Beta' })),
        ...newsletterSignups.map(s => ({ ...s, type: 'Newsletter' }))
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      const lastSignupDate = allSignups.length > 0 ? allSignups[0].created_at : null;

      return {
        totalARC,
        totalBeta,
        totalNewsletter,
        totalSignups,
        lastSignupDate
      };
    }
  });

  if (isLoading) {
    return (
      <Card className="overflow-hidden h-full">
        <CardContent className="p-6 flex justify-center items-center h-full">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden h-full">
      <CardContent className="p-6 bg-[#FFD166] text-[#19363C] h-full">
        <div className="space-y-6">
          <h2 className="text-2xl font-playfair">Reader Engagement</h2>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <div className="text-2xl font-bold">
                {data?.totalSignups || '0'}
              </div>
              <div className="text-xs opacity-80">
                Total signups
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="flex flex-col text-sm">
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-3 w-3" />
                    <span className="font-semibold">{data?.totalARC || '0'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    <span className="font-semibold">{data?.totalBeta || '0'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    <span className="font-semibold">{data?.totalNewsletter || '0'}</span>
                  </div>
                </div>
              </div>
              <div className="text-xs opacity-80">
                ARC / Beta / Newsletter
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="text-2xl font-bold">
                {data?.lastSignupDate ? (
                  formatDistanceToNow(new Date(data.lastSignupDate), { addSuffix: true })
                ) : (
                  'No signups yet'
                )}
              </div>
              <div className="text-xs opacity-80">
                Last signup
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};