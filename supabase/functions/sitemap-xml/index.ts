import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BlogPost {
  slug: string;
  updated_at: string;
}

interface Author {
  slug: string;
  updated_at: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch all published blog posts
    const { data: blogPosts, error: blogError } = await supabase
      .from('blog_posts')
      .select('slug, updated_at')
      .eq('status', 'published')
      .order('updated_at', { ascending: false });

    if (blogError) {
      console.error('Error fetching blog posts:', blogError);
    }

    // Fetch all author profiles with public slugs
    const { data: authors, error: authorsError } = await supabase
      .from('public_profiles')
      .select('slug, updated_at')
      .not('slug', 'is', null)
      .order('updated_at', { ascending: false });

    if (authorsError) {
      console.error('Error fetching authors:', authorsError);
    }

    // Static pages with priority and change frequency
    const staticPages = [
      { loc: 'https://quilltips.co/', priority: '1.0', changefreq: 'weekly' },
      { loc: 'https://quilltips.co/about', priority: '0.8', changefreq: 'monthly' },
      { loc: 'https://quilltips.co/how-it-works', priority: '0.9', changefreq: 'monthly' },
      { loc: 'https://quilltips.co/pricing', priority: '0.8', changefreq: 'monthly' },
      { loc: 'https://quilltips.co/faq', priority: '0.7', changefreq: 'monthly' },
      { loc: 'https://quilltips.co/contact', priority: '0.6', changefreq: 'monthly' },
      { loc: 'https://quilltips.co/terms', priority: '0.3', changefreq: 'yearly' },
      { loc: 'https://quilltips.co/privacy', priority: '0.3', changefreq: 'yearly' },
      { loc: 'https://quilltips.co/author/register', priority: '0.7', changefreq: 'monthly' },
      { loc: 'https://quilltips.co/author/login', priority: '0.5', changefreq: 'monthly' },
      { loc: 'https://quilltips.co/blog', priority: '0.9', changefreq: 'weekly' },
    ];

    // Build XML sitemap
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">`;

    // Add static pages
    staticPages.forEach(page => {
      xml += `
  <url>
    <loc>${page.loc}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
    });

    // Add blog posts
    if (blogPosts && blogPosts.length > 0) {
      blogPosts.forEach((post: BlogPost) => {
        const lastmod = new Date(post.updated_at).toISOString().split('T')[0];
        xml += `
  <url>
    <loc>https://quilltips.co/blog/${post.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`;
      });
    }

    // Add author profiles
    if (authors && authors.length > 0) {
      authors.forEach((author: Author) => {
        const lastmod = new Date(author.updated_at).toISOString().split('T')[0];
        xml += `
  <url>
    <loc>https://quilltips.co/${author.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
      });
    }

    xml += `
</urlset>`;

    // Return XML with proper headers
    return new Response(xml, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
        'X-Robots-Tag': 'all',
      },
    });
  } catch (error) {
    console.error('Error generating sitemap:', error);
    
    // Return minimal fallback sitemap
    const fallbackXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://quilltips.co/</loc></url>
  <url><loc>https://quilltips.co/about</loc></url>
  <url><loc>https://quilltips.co/blog</loc></url>
</urlset>`;

    return new Response(fallbackXml, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/xml; charset=utf-8',
      },
      status: 200,
    });
  }
});
