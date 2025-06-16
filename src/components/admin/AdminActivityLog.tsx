
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Activity, Calendar } from "lucide-react";
import { format } from "date-fns";

interface ActivityLog {
  id: string;
  action: string;
  details: any;
  created_at: string;
  admin: {
    name: string;
  };
}

export const AdminActivityLog = () => {
  const { data: activityLogs, isLoading } = useQuery({
    queryKey: ['admin-activity-log'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_activity_log')
        .select(`
          id,
          action,
          details,
          created_at,
          admin:profiles!admin_activity_log_admin_id_fkey(name)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as ActivityLog[];
    },
    refetchInterval: 10000, // Refresh every 10 seconds for real-time activity
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Admin Activity Log
          </CardTitle>
          <CardDescription>
            Track all administrative actions on the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activityLogs?.map((log) => (
              <Card key={log.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="font-medium">{log.action}</div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(log.created_at), 'MMM d, yyyy HH:mm:ss')}
                      <span>by {log.admin?.name || 'Unknown Admin'}</span>
                    </div>
                    {log.details && (
                      <div className="text-xs text-gray-500 mt-2">
                        <pre className="whitespace-pre-wrap">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-gray-400">
                    {log.id.slice(0, 8)}...
                  </div>
                </div>
              </Card>
            ))}

            {activityLogs?.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No admin activity logged yet.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
