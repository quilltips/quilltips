
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

// Define types to match the ReaderInfo interface in ReaderStats component
interface ReaderInfo {
  name: string;
  email: string;
  value: number;
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

      // Fetch tips with reader information
      const { data: tips, error: tipsError } = await supabase
        .from('tips')
        .select('*, reader_name, reader_email')
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
        .filter(book => book.tipCount > 0) // ✅ Only include tipped books
        .sort((a, b) => b.tipCount - a.tipCount)
        .slice(0, 5);
      
      // Get reader information
      const readerMap: Record<string, ReaderInfo> = {};
      
      tips.forEach(tip => {
        const readerKey = tip.reader_email || tip.reader_name || 'anonymous';
        
        if (!readerMap[readerKey]) {
          readerMap[readerKey] = {
            name: tip.reader_name || 'Anonymous',
            email: tip.reader_email || '',
            value: 1
          };
        } else {
          readerMap[readerKey].value += 1;
        }
      });
      
      const readerInfo: ReaderInfo[] = Object.values(readerMap)
        .sort((a, b) => b.value - a.value)
        .slice(0, 10);
      
      return {
        totalBooks,
        totalTips,
        totalAmount,
        averageTip,
        topBooks,
        readerInfo,
        qrCodes,
        tips
      };
    }
  });
  
  const handleDownload = () => {
    try {
      if (!data) return;
      
      // Create CSV content for tips with reader information
      const tipsCsvContent = [
        ['Date', 'Book', 'Amount', 'Message', 'Reader', 'Email'].join(','),
        ...(data.tips || []).map(tip => [
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
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-end">
        <Button
          onClick={handleDownload}
          className="group flex items-center gap-2 text-sm font-medium text-[#333333] hover:underline bg-transparent hover:bg-transparent border-none shadow-none p-0 hover:shadow-none"
        >
          Download All Data
          <div className="bg-[#FFD166] hover:bg-[#ffd166] rounded-lg p-1">
            <Download className="h-4 w-4 text-white " />
          </div>
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
          readerInfo={data?.readerInfo || []}
          onDownload={handleDownload}
        />
      </div>
    </div>
  );
};
