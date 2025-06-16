
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, DollarSign, QrCode, TrendingUp } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export const AdminOverview = () => {
  const { data: userStats, isLoading: loadingUserStats } = useQuery({
    queryKey: ['admin-user-stats'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_user_stats');
      if (error) throw error;
      return data;
    },
  });

  const { data: tipStats, isLoading: loadingTipStats } = useQuery({
    queryKey: ['admin-tip-stats'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_tip_stats');
      if (error) throw error;
      return data;
    },
  });

  const { data: qrStats, isLoading: loadingQRStats } = useQuery({
    queryKey: ['admin-qr-stats'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_qr_stats');
      if (error) throw error;
      return data;
    },
  });

  if (loadingUserStats || loadingTipStats || loadingQRStats) {
    return <LoadingSpinner />;
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* User Stats */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats?.total_users || 0}</div>
            <p className="text-xs text-muted-foreground">
              +{userStats?.new_signups_this_month || 0} this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Authors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats?.total_authors || 0}</div>
            <p className="text-xs text-muted-foreground">
              {userStats?.total_readers || 0} readers
            </p>
          </CardContent>
        </Card>

        {/* Tip Stats */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(tipStats?.total_revenue || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {tipStats?.total_tips || 0} tips total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Tip Amount</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(tipStats?.average_tip || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {tipStats?.tips_this_month || 0} tips this month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Signups</CardTitle>
            <CardDescription>New user registrations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Today</span>
                <span className="font-semibold">{userStats?.new_signups_today || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>This Week</span>
                <span className="font-semibold">{userStats?.new_signups_this_week || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>This Month</span>
                <span className="font-semibold">{userStats?.new_signups_this_month || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tip Activity</CardTitle>
            <CardDescription>Recent tip transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Today</span>
                <span className="font-semibold">
                  {formatCurrency(tipStats?.revenue_today || 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>This Week</span>
                <span className="font-semibold">
                  {formatCurrency(tipStats?.revenue_this_week || 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>This Month</span>
                <span className="font-semibold">
                  {formatCurrency(tipStats?.revenue_this_month || 0)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">QR Code Stats</CardTitle>
            <CardDescription>QR code creation and usage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Total QR Codes</span>
                <span className="font-semibold">{qrStats?.total_qr_codes || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Active</span>
                <span className="font-semibold">{qrStats?.active_qr_codes || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Paid</span>
                <span className="font-semibold">{qrStats?.paid_qr_codes || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
