
import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { OptimizedImage } from "@/components/ui/optimized-image";

const TipSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const [authorName, setAuthorName] = useState<string | null>(null);
  const [readerName, setReaderName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Get parameters from URL
  const authorId = searchParams.get("authorId");
  const readerEmail = searchParams.get("email");
  const amount = searchParams.get("amount");
  
  useEffect(() => {
    const fetchDetails = async () => {
      if (!authorId || !readerEmail) return;
      
      try {
        // Fetch author details
        const { data: authorData, error: authorError } = await supabase.rpc(
          'get_public_profile_by_id',
          { profile_id: authorId }
        );
        
        // Fetch reader name from email
        const { data: readerData, error: readerError } = await supabase
          .from('profiles')
          .select('name')
          .eq('email', readerEmail)
          .single();
        
        if (authorError) throw authorError;
        
        if (authorData && authorData.length > 0) {
          setAuthorName(authorData[0].name || 'the author');
        }
        
        if (readerData) {
          setReaderName(readerData.name?.split(' ')[0] || 'Reader');
        }
      } catch (error) {
        console.error("Error fetching details:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDetails();
  }, [authorId, readerEmail]);
  
  return (
    
      <div className="container max-w-2xl mx-auto px-4 pt-16 pb-20 text-center">
        <div className="bg-transparent rounded-xl shadow-none p-8 md:p-12">
          <div className="flex justify-center mb-5">
            <div className="rounded-full p-3">
              <CheckCircle className="h-12 w-12 text-[#FFD166]" />
            </div>
          </div>
          
          <h1 className="text-3xl font-bold mb-4 ">
       
            Amazing tip{readerName ? `, ${readerName}` : ''}!
          </h1>
          
          <p className="text-lg mb-8 ">
            {isLoading ? (
              "Thanks for tipping! The author will be excited to see your tip in their inbox!"
            ) : (
              `Thanks for tipping! ${authorName || "The author"} will be excited to see your tip in their inbox!`
            )}
          </p>
          
          {authorId && (
            <Button 
              asChild 
              className="bg-[#FFD166] hover:bg-[#19363C]/90 text-[#333333] px-7 py-3 h-auto  font-medium rounded-full"
            >
              <Link to={`/profile/${authorId}`}>
                Return to Author Profile
              </Link>
            </Button>
          )}
        </div>
      </div>
  
  );
};

export default TipSuccessPage;
