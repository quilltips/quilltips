
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Book, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { BookStats } from "./BookStats";
import { TipStats } from "./TipStats";
import { TopBooks } from "./TopBooks";
import { ReaderStats } from "./ReaderStats";
import { useToast } from "@/hooks/use-toast";

interface AuthorDataDashboardProps {
  authorId: string;
}

export const AuthorDataDashboard = ({ authorId }: AuthorDataDashboardProps) => {
  const { toast } = useToast();
  
  const { data, isLoading } = useQuery({
    queryKey: ['author-data-stats', authorId],
    queryFn: async () => {
      // Fetch QR codes
      const { data: qrCodes, error: qrError } = await supabase
        .from('qr_codes')
        .select('id, book_title, total_tips, total_amount')
        .eq('author_id', authorId);
      
      if (qrError) throw qrError;

      // Fetch tips
      const { data: tips, error: tipsError } = await supabase
        .from('tips')
        .select('*, profiles!tips_reader_id_fkey(name, location)')
        .eq('author_id', authorId);
      
      if (tipsError) throw tipsError;
      
      // Calculate stats
      const totalBooks = qrCodes.length;
      const totalTips = tips.length;
      const totalAmount = tips.reduce((sum, tip) => sum + (tip.amount || 0), 0);
      const averageTip = totalTips > 0 ? totalAmount / totalTips : 0;
      
      // Get top books
      const bookTipCounts = {};
      tips.forEach(tip => {
        const bookId = tip.qr_code_id;
        if (bookId) {
          bookTipCounts[bookId] = (bookTipCounts[bookId] || 0) + 1;
        }
      });
      
      const topBooks = qrCodes
        .map(qr => ({
          ...qr,
          tipCount: bookTipCounts[qr.id] || 0
        }))
        .sort((a, b) => b.tipCount - a.tipCount)
        .slice(0, 3);
      
      // Get reader locations
      const locations = {};
      tips.forEach(tip => {
        const location = tip.profiles?.location;
        if (location) {
          locations[location] = (locations[location] || 0) + 1;
        }
      });
      
      const readerLocations = Object.entries(locations)
        .map(([name, count]: [string, number]) => ({
          name,
          value: count
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);
      
      const totalLocations = readerLocations.reduce((sum, loc) => sum + loc.value, 0);
      
      const readerLocationPercentages = readerLocations.map(loc => ({
        ...loc,
        percentage: Math.round((loc.value / totalLocations) * 100)
      }));
      
      return {
        totalBooks,
        totalTips,
        totalAmount,
        averageTip,
        topBooks,
        readerLocationPercentages,
        qrCodes,
        tips
      };
    }
  });
  
  const handleDownload = () => {
    try {
      if (!data) return;
      
      // Create CSV content for tips
      const tipsCsvContent = [
        ['Date', 'Book', 'Amount', 'Message', 'Reader'].join(','),
        ...(data.tips || []).map(tip => [
          new Date(tip.created_at).toLocaleDateString(),
          `"${(tip.book_title || 'Unknown').replace(/"/g, '""')}"`,
          tip.amount,
          `"${(tip.message || '').replace(/"/g, '""')}"`,
          `"${(tip.profiles?.name || 'Anonymous').replace(/"/g, '""')}"`
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
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-end">
        <Button 
          onClick={handleDownload}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Download
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <BookStats 
          totalBooks={data?.totalBooks || 0} 
        />
        
        <TipStats 
          totalAmount={data?.totalAmount || 0}
          averageTip={data?.averageTip || 0}
          totalTips={data?.totalTips || 0}
        />
        
        <TopBooks 
          topBooks={data?.topBooks || []}
        />
        
        <ReaderStats 
          readerLocations={data?.readerLocationPercentages || []}
        />
      </div>
    </div>
  );
};
