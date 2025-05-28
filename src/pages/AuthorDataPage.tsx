
import { useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { AuthorDataDashboard } from "@/components/data/AuthorDataDashboard";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

const AuthorDataPage = () => {
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
        console.error("Dashboard error:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to load profile",
          variant: "destructive"
        });
        navigate("/author/login");
      }
    }
  });

  const handleDownload = async () => {
    try {
      if (!profile) return;
      
      // Fetch data for download
      const { data: qrCodes, error: qrError } = await supabase
        .from('qr_codes')
        .select('id, book_title, total_tips, total_amount')
        .eq('author_id', profile.id);
      
      if (qrError) throw qrError;

      const { data: tips, error: tipsError } = await supabase
        .from('tips')
        .select('*, reader_name, reader_email')
        .eq('author_id', profile.id);
      
      if (tipsError) throw tipsError;
      
      // Create CSV content for tips with reader information
      const tipsCsvContent = [
        ['Date', 'Book', 'Amount', 'Message', 'Reader', 'Email'].join(','),
        ...(tips || []).map(tip => [
          new Date(tip.created_at).toLocaleDateString(),
          `"${(tip.book_title || 'Unknown').replace(/"/g, '""')}"`,
          tip.amount,
          `"${(tip.message || '').replace(/"/g, '""')}"`,
          `"${(tip.reader_name || 'Anonymous').replace(/"/g, '""')}"`,
          `"${(tip.reader_email || '').replace(/"/g, '""')}"`
        ].join(','))
      ].join('\n');

      // Create and download the file
      const blob = new Blob([tipsCsvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `quilltips_data_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Download Started",
        description: "Your tip data is being downloaded.",
      });
    } catch (error: any) {
      toast({
        title: "Download Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 pt-24">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !profile) return null;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl font-playfair font-medium text-[#2D3748]">Quilltips Data Dashboard</h1>
              <p className="text-[#4A5568] text-lg">Learn more about your readers</p>
            </div>
            
            <Button
              onClick={handleDownload}
              className="group flex items-center gap-2 text-sm font-medium text-[#333333] hover:underline bg-transparent hover:bg-transparent border-none shadow-none p-0 hover:shadow-none"
            >
              Download All Data
              <div className="bg-[#FFD166] hover:bg-[#ffd166] rounded-lg p-1">
                <Download className="h-4 w-4 text-white" />
              </div>
            </Button>
          </div>

          <AuthorDataDashboard authorId={profile.id} hideDownloadButton={true} />
        </div>
      </div>
    </div>
  );
};

export default AuthorDataPage;
