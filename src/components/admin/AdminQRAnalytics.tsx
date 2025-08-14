
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { QrCode, Calendar, User, DollarSign } from "lucide-react";
import { format } from "date-fns";

interface QRCode {
  id: string;
  book_title: string;
  qr_code_status: string;
  is_paid: boolean;
  total_tips: number;
  total_amount: number;
  created_at: string;
  author: {
    name: string;
  };
}

export const AdminQRAnalytics = () => {
  const { data: qrCodes, isLoading } = useQuery({
    queryKey: ['admin-qr-codes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('qr_codes')
        .select(`
          id,
          book_title,
          qr_code_status,
          is_paid,
          total_tips,
          total_amount,
          created_at,
          author:public_profiles!qr_codes_author_public_profiles_fkey(name)
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data as QRCode[];
    },
    refetchInterval: 30000,
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount || 0);
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'inactive':
        return 'outline';
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
            <QrCode className="h-5 w-5" />
            QR Code Analytics
          </CardTitle>
          <CardDescription>
            QR code creation and performance metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {qrCodes?.map((qr) => (
              <Card key={qr.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{qr.book_title}</h3>
                      <Badge variant={getStatusBadgeColor(qr.qr_code_status)}>
                        {qr.qr_code_status}
                      </Badge>
                      {qr.is_paid && (
                        <Badge variant="default">Paid</Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {qr.author?.name || 'Unknown Author'}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Created {format(new Date(qr.created_at), 'MMM d, yyyy')}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        <span className="font-medium">
                          {formatCurrency(qr.total_amount)}
                        </span>
                        <span className="text-gray-500">
                          ({qr.total_tips || 0} tips)
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-gray-400">
                    ID: {qr.id.slice(0, 8)}...
                  </div>
                </div>
              </Card>
            ))}

            {qrCodes?.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No QR codes found.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
