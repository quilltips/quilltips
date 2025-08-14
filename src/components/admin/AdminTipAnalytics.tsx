
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { DollarSign, Calendar, User, Book } from "lucide-react";
import { format } from "date-fns";

interface Tip {
  id: string;
  amount: number;
  message: string;
  reader_name: string;
  reader_email: string;
  book_title: string;
  status: string;
  created_at: string;
  author: {
    name: string;
  };
}

export const AdminTipAnalytics = () => {
  const { data: recentTips, isLoading } = useQuery({
    queryKey: ['admin-recent-tips'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tips')
        .select(`
          id,
          amount,
          message,
          reader_name,
          reader_email,
          book_title,
          status,
          created_at,
          author:public_profiles!tips_author_public_profiles_fkey(name)
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data as Tip[];
    },
    refetchInterval: 30000,
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'complete':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'failed':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Recent Tips
          </CardTitle>
          <CardDescription>
            Latest tip transactions across the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentTips?.map((tip) => (
              <Card key={tip.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-lg">
                        {formatCurrency(tip.amount)}
                      </span>
                      <Badge variant={getStatusBadgeColor(tip.status)}>
                        {tip.status}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {tip.reader_name || 'Anonymous'}
                      </div>
                      <div className="flex items-center gap-1">
                        <Book className="h-3 w-3" />
                        {tip.book_title}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(tip.created_at), 'MMM d, HH:mm')}
                      </div>
                    </div>

                    <div className="text-sm">
                      <span className="text-gray-500">To:</span>{' '}
                      <span className="font-medium">{tip.author?.name || 'Unknown Author'}</span>
                    </div>

                    {tip.message && (
                      <div className="bg-gray-50 p-3 rounded-md max-w-md">
                        <p className="text-sm italic">"{tip.message}"</p>
                      </div>
                    )}

                    {tip.reader_email && (
                      <div className="text-xs text-gray-500">
                        Contact: {tip.reader_email}
                      </div>
                    )}
                  </div>

                  <div className="text-xs text-gray-400">
                    ID: {tip.id.slice(0, 8)}...
                  </div>
                </div>
              </Card>
            ))}

            {recentTips?.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No recent tips found.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
