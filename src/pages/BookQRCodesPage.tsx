
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { QrCode, Plus } from "lucide-react";
import { QRCodesList } from "@/components/qr/QRCodesList";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreateQRCode } from "@/components/CreateQRCode";
import { HowQRCodesWork } from "@/components/qr/HowQRCodesWork";
import { Link } from "react-router-dom";

const BookQRCodesPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabParam === 'new' ? 'new' : 'all');
  
  // Update active tab when URL parameter changes
  useEffect(() => {
    if (tabParam === 'new') {
      setActiveTab('new');
    } else if (tabParam === 'all') {
      setActiveTab('all');
    }
  }, [tabParam]);
  
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
        console.error("QR Codes page error:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to load profile",
          variant: "destructive"
        });
        navigate("/author/login");
      }
    }
  });

  // Handle tab change and update URL
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    navigate(`/author/book-qr-codes?tab=${value}`, { replace: true });
  };
  
  // Check if Stripe account is complete
  const hasStripeAccount = !!profile?.stripe_account_id;
  const stripeSetupComplete = !!profile?.stripe_setup_complete;

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
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <h1 className="text-3xl font-playfair font-medium ">Quilltips Jars</h1>
            <Button 
              onClick={() => handleTabChange('new')} 
              className="bg-[#FFD166] hover:bg-[#FFD166]/90  font-medium md:hidden"
            >
              <Plus className="h-4 w-4 mr-2" />
              New QR Code
            </Button>
          </div>

          <Tabs value={activeTab} onValueChange={handleTabChange} className="mb-8">
            <TabsList className="border-b w-full justify-start rounded-none bg-transparent p-0 h-auto">
              <TabsTrigger 
                value="all" 
                className="rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-[#2D3748] data-[state=active]:font-medium bg-transparent"
              >
                All Quilltips Jars
              </TabsTrigger>
              <TabsTrigger 
                value="new" 
                className="rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-[#2D3748] data-[state=active]:text-[#2D3748] data-[state=active]:font-medium bg-transparent"
              >
                New Quilltips Jar
              </TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="mt-6">
              <QRCodesList 
                authorId={profile.id}
                stripeSetupComplete={stripeSetupComplete}
                hasStripeAccount={hasStripeAccount}
              />
            </TabsContent>
            <TabsContent value="new" className="mt-6">
              <div className="max-w-2xl mx-auto">
                <div className="text-center mb-8 mt-10">
                  <QrCode className="h-14 w-14 mx-auto mb-6 text-[#19363c]" />
                  <h3 className="text-3xl font-bold mb-2">Create a new Quilltips Jar</h3>
                  <p className="">
                    Set up your virtual tip jar for an upcoming book.
                  </p>
                </div>
                
                <CreateQRCode authorId={profile.id} />
                <div className="w-full text-center">
                  <p className="mt-4">
                      <Link 
                        to="/how-it-works" 
                        target="_blank"
                        className="text-[#333333] underline  transition-colors"
                      >
                        Learn more about how Quilltips Jars work
                      </Link>
                    </p>
                </div>
               
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default BookQRCodesPage;
