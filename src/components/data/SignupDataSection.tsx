import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface SignupDataSectionProps {
  authorId: string;
}

export const SignupDataSection = ({ authorId }: SignupDataSectionProps) => {
  const { toast } = useToast();

  // Fetch profile settings to check if signup features are enabled
  const { data: profileSettings, isLoading: profileLoading } = useQuery({
    queryKey: ['profile-settings', authorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('arc_signup_enabled, beta_reader_enabled, newsletter_enabled, book_club_enabled')
        .eq('id', authorId)
        .single();
      
      if (error) throw error;
      return data;
    }
  });

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
    },
    enabled: !!profileSettings?.arc_signup_enabled
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
    },
    enabled: !!profileSettings?.beta_reader_enabled
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
    },
    enabled: !!profileSettings?.newsletter_enabled
  });

  // Fetch Book Club invites - always fetch to show existing data even if disabled at profile level
  const { data: bookClubSignups, isLoading: bookClubLoading } = useQuery({
    queryKey: ['book-club-signups', authorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('book_club_invites')
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

  const isLoading = arcLoading || betaLoading || newsletterLoading || bookClubLoading || profileLoading;

  // Show the section if signup features are enabled OR if there's existing data
  const hasAnySignupEnabled = profileSettings?.arc_signup_enabled || 
                              profileSettings?.beta_reader_enabled || 
                              profileSettings?.newsletter_enabled ||
                              profileSettings?.book_club_enabled;
                              
  const hasExistingData = (arcSignups && arcSignups.length > 0) ||
                          (betaSignups && betaSignups.length > 0) ||
                          (newsletterSignups && newsletterSignups.length > 0) ||
                          (bookClubSignups && bookClubSignups.length > 0);

  if (!hasAnySignupEnabled && !hasExistingData) {
    return null;
  }

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

      <Card>
        <CardContent className="p-6">
          <Tabs defaultValue="arc" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="arc">
                ARC ({arcSignups?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="beta">
                Beta ({betaSignups?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="newsletter">
                General ({newsletterSignups?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="bookclub">
                Book Club ({bookClubSignups?.length || 0})
              </TabsTrigger>
            </TabsList>

            {/* ARC Readers Tab */}
            <TabsContent value="arc" className="mt-6">
              <div className="flex justify-between items-center mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadCSV(
                    arcSignups || [], 
                    'arc_signups',
                    ['Reader Name', 'Reader Email', 'Reader Location', 'Message', 'Created At']
                  )}
                  disabled={!arcSignups?.length}
                  className="ml-auto"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download CSV
                </Button>
              </div>
              
              {arcSignups && arcSignups.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {arcSignups.map((signup, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{signup.reader_name}</TableCell>
                        <TableCell>{signup.reader_email}</TableCell>
                        <TableCell>{signup.reader_location || '-'}</TableCell>
                        <TableCell className="max-w-xs truncate">{signup.message || '-'}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(signup.created_at), { addSuffix: true })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-muted-foreground py-8">No ARC signups yet</p>
              )}
            </TabsContent>

            {/* Beta Readers Tab */}
            <TabsContent value="beta" className="mt-6">
              <div className="flex justify-between items-center mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadCSV(
                    betaSignups || [], 
                    'beta_reader_signups',
                    ['Reader Name', 'Reader Email', 'Reading Experience', 'Favorite Genres', 'Message', 'Created At']
                  )}
                  disabled={!betaSignups?.length}
                  className="ml-auto"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download CSV
                </Button>
              </div>
              
              {betaSignups && betaSignups.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Experience</TableHead>
                      <TableHead>Genres</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {betaSignups.map((signup, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{signup.reader_name}</TableCell>
                        <TableCell>{signup.reader_email}</TableCell>
                        <TableCell className="max-w-xs truncate">{signup.reading_experience || '-'}</TableCell>
                        <TableCell className="max-w-xs truncate">{signup.favorite_genres || '-'}</TableCell>
                        <TableCell className="max-w-xs truncate">{signup.message || '-'}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(signup.created_at), { addSuffix: true })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-muted-foreground py-8">No beta reader signups yet</p>
              )}
            </TabsContent>

            {/* Newsletter Tab */}
            <TabsContent value="newsletter" className="mt-6">
              <div className="flex justify-between items-center mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadCSV(
                    newsletterSignups || [], 
                    'newsletter_signups',
                    ['Subscriber Name', 'Subscriber Email', 'Is Active', 'Created At', 'Unsubscribed At']
                  )}
                  disabled={!newsletterSignups?.length}
                  className="ml-auto"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download CSV
                </Button>
              </div>
              
              {newsletterSignups && newsletterSignups.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Subscribed</TableHead>
                      <TableHead>Unsubscribed</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {newsletterSignups.map((signup, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{signup.subscriber_name || 'Anonymous'}</TableCell>
                        <TableCell>{signup.subscriber_email}</TableCell>
                        <TableCell>
                          <Badge variant={signup.is_active ? "default" : "secondary"}>
                            {signup.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(signup.created_at), { addSuffix: true })}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {signup.unsubscribed_at 
                            ? formatDistanceToNow(new Date(signup.unsubscribed_at), { addSuffix: true })
                            : '-'
                          }
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-muted-foreground py-8">No newsletter subscribers yet</p>
              )}
            </TabsContent>

            {/* Book Club Tab */}
            <TabsContent value="bookclub" className="mt-6">
              <div className="flex justify-between items-center mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadCSV(
                    bookClubSignups || [], 
                    'book_club_invites',
                    ['Reader Name', 'Reader Email', 'Event Type', 'Event Date', 'Event Location', 'Message', 'Created At']
                  )}
                  disabled={!bookClubSignups?.length}
                  className="ml-auto"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download CSV
                </Button>
              </div>
              
              {bookClubSignups && bookClubSignups.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Event Type</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead>Submitted</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookClubSignups.map((signup, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{signup.reader_name}</TableCell>
                        <TableCell>{signup.reader_email}</TableCell>
                        <TableCell className="capitalize">{signup.event_type?.replace('_', ' ') || '-'}</TableCell>
                        <TableCell>
                          {signup.event_date 
                            ? new Date(signup.event_date).toLocaleDateString()
                            : '-'
                          }
                        </TableCell>
                        <TableCell className="max-w-xs truncate">{signup.event_location || '-'}</TableCell>
                        <TableCell className="max-w-xs truncate">{signup.message || '-'}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(signup.created_at), { addSuffix: true })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-muted-foreground py-8">No book club invites yet</p>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};