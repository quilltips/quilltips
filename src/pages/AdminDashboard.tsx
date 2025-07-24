
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/auth/AuthProvider";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { AdminOverview } from "@/components/admin/AdminOverview";
import { AdminUserManagement } from "@/components/admin/AdminUserManagement";
import { AdminTipAnalytics } from "@/components/admin/AdminTipAnalytics";
import { AdminQRAnalytics } from "@/components/admin/AdminQRAnalytics";
import { AdminActivityLog } from "@/components/admin/AdminActivityLog";
import { AdminBlogManagement } from "@/components/admin/AdminBlogManagement";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Users, DollarSign, QrCode, Activity, FileText } from "lucide-react";

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Check if user is admin
  const { data: isAdmin, isLoading: checkingAdmin } = useQuery({
    queryKey: ['is-admin', user?.id],
    queryFn: async () => {
      if (!user) return false;
      
      const { data, error } = await supabase.rpc('is_admin', { user_id: user.id });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (!checkingAdmin && !isAdmin) {
      navigate('/');
    }
  }, [isAdmin, checkingAdmin, navigate]);

  if (checkingAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <Shield className="h-8 w-8 text-[#19363C]" />
            <div>
              <h1 className="text-3xl font-playfair font-bold text-[#19363C]">
                Admin Dashboard
              </h1>
              <p className="text-gray-600">Monitor and manage Quilltips platform</p>
            </div>
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-6 bg-white border">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Users</span>
              </TabsTrigger>
              <TabsTrigger value="tips" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                <span className="hidden sm:inline">Tips</span>
              </TabsTrigger>
              <TabsTrigger value="qr-codes" className="flex items-center gap-2">
                <QrCode className="h-4 w-4" />
                <span className="hidden sm:inline">QR Codes</span>
              </TabsTrigger>
              <TabsTrigger value="blog" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Blog</span>
              </TabsTrigger>
              <TabsTrigger value="activity" className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                <span className="hidden sm:inline">Activity</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <AdminOverview />
            </TabsContent>

            <TabsContent value="users">
              <AdminUserManagement />
            </TabsContent>

            <TabsContent value="tips">
              <AdminTipAnalytics />
            </TabsContent>

            <TabsContent value="qr-codes">
              <AdminQRAnalytics />
            </TabsContent>

            <TabsContent value="blog">
              <AdminBlogManagement />
            </TabsContent>
            <TabsContent value="activity">
              <AdminActivityLog />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
