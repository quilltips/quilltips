import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname;
    
    // Extract slug from /blog/legacy-redirect/{slug}
    const match = path.match(/^\/blog\/legacy-redirect\/(.+)$/);
    if (!match) {
      return new Response('Invalid path', { status: 400 });
    }
    
    const slug = match[1];
    
    // Check if this is an old timestamp-based slug
    const timestampPattern = /-\d{13}$/; // Ends with timestamp (13 digits)
    
    if (!timestampPattern.test(slug)) {
      return new Response('Not a legacy URL', { status: 400 });
    }
    
    // Extract the clean slug by removing the timestamp
    const cleanSlug = slug.replace(timestampPattern, '');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Check if a blog post exists with the clean slug
    const { data: post, error } = await supabase
      .from('blog_posts')
      .select('slug, status')
      .eq('slug', cleanSlug)
      .eq('status', 'published')
      .single();
    
    if (error || !post) {
      return new Response('Blog post not found', { status: 404 });
    }
    
    // Redirect to the clean URL
    return new Response(null, {
      status: 301,
      headers: {
        ...corsHeaders,
        'Location': `https://quilltips.co/blog/${cleanSlug}`,
      },
    });
    
  } catch (error) {
    console.error('Error handling blog redirect:', error);
    return new Response('Internal server error', { 
      status: 500,
      headers: corsHeaders 
    });
  }
});
