import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, BookOpen, Users, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface SignupDataSectionProps {
  authorId: string;
}

export const SignupDataSection = ({ authorId }: SignupDataSectionProps) => {
  const { toast } = useToast();

  // Fetch ARC signups
  const { data: arcSignups, isLoading: arcLoading } = useQuery({
    queryKey: ['arc-signups', authorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('arc_signups')
        .select('*')
        .eq('author_id', authorId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch Beta Reader signups
  const { data: betaSignups, isLoading: betaLoading } = useQuery({
    queryKey: ['beta-signups', authorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('beta_reader_signups')
        .select('*')
        .eq('author_id', authorId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch Newsletter signups
  const { data: newsletterSignups, isLoading: newsletterLoading } = useQuery({
    queryKey: ['newsletter-signups', authorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('author_newsletter_signups')
        .select('*')
        .eq('author_id', authorId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  const downloadCSV = (data: any[], filename: string, headers: string[]) => {
    try {
      const csvContent = [
        headers.join(','),
        ...data.map(item => 
          headers.map(header => {
            const key = header.toLowerCase().replace(/\s+/g, '_');
            let value = item[key] || '';
            
            // Format date fields
            if (key.includes('date') || key === 'created_at') {
              value = new Date(value).toLocaleDateString();
            }
            
            // Escape commas and quotes
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
              value = `"${value.replace(/"/g, '""')}"`;
            }
            
            return value;
          }).join(',')
        )
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Download Started",
        description: `${filename} data is being downloaded.`,
      });
    } catch (error: any) {
      toast({
        title: "Download Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const isLoading = arcLoading || betaLoading || newsletterLoading;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-playfair font-medium">Reader Signups</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ARC Signups */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              ARC Readers
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => downloadCSV(
                arcSignups || [], 
                'arc_signups',
                ['Reader Name', 'Reader Email', 'Reader Location', 'Message', 'Status', 'Created At']
              )}
              disabled={!arcSignups?.length}
            >
              <Download className="h-3 w-3" />
            </Button>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-2xl font-bold">{arcSignups?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Total signups</p>
            
            {arcSignups && arcSignups.length > 0 && (
              <div className="mt-3 space-y-1">
                {arcSignups.slice(0, 2).map((signup, idx) => (
                  <div key={idx} className="text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{signup.reader_name}</span>
                      <Badge variant="outline" className="text-xs">
                        {signup.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Beta Reader Signups */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Beta Readers
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => downloadCSV(
                betaSignups || [], 
                'beta_reader_signups',
                ['Reader Name', 'Reader Email', 'Reading Experience', 'Favorite Genres', 'Message', 'Status', 'Created At']
              )}
              disabled={!betaSignups?.length}
            >
              <Download className="h-3 w-3" />
            </Button>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-2xl font-bold">{betaSignups?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Total signups</p>
            
            {betaSignups && betaSignups.length > 0 && (
              <div className="mt-3 space-y-1">
                {betaSignups.slice(0, 2).map((signup, idx) => (
                  <div key={idx} className="text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{signup.reader_name}</span>
                      <Badge variant="outline" className="text-xs">
                        {signup.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Newsletter Signups */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Newsletter
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => downloadCSV(
                newsletterSignups || [], 
                'newsletter_signups',
                ['Subscriber Name', 'Subscriber Email', 'Is Active', 'Created At', 'Unsubscribed At']
              )}
              disabled={!newsletterSignups?.length}
            >
              <Download className="h-3 w-3" />
            </Button>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-2xl font-bold">{newsletterSignups?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Total subscribers</p>
            
            {newsletterSignups && newsletterSignups.length > 0 && (
              <div className="mt-3 space-y-1">
                {newsletterSignups.slice(0, 2).map((signup, idx) => (
                  <div key={idx} className="text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{signup.subscriber_name || 'Anonymous'}</span>
                      <Badge variant={signup.is_active ? "default" : "secondary"} className="text-xs">
                        {signup.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};