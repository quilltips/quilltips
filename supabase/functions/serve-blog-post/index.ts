import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const slug = url.searchParams.get('slug')
    
    if (!slug) {
      return new Response('Missing slug parameter', { status: 400 })
    }

    // Create Supabase client with service role key for public access
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Fetch blog post data
    const { data: post, error } = await supabase
      .from('blog_posts')
      .select(`
        id,
        title,
        slug,
        excerpt,
        content,
        featured_image_url,
        published_at,
        meta_title,
        meta_description,
        author:profiles!blog_posts_author_id_fkey(name)
      `)
      .eq('slug', slug)
      .eq('status', 'published')
      .single()

    if (error || !post) {
      console.error('Blog post not found:', error)
      return new Response('Blog post not found', { status: 404 })
    }

    // Generate OG image URL using server-side edge function
    const ogImageUrl = `https://qrawynczvedffcvnympn.supabase.co/functions/v1/generate-blog-og-image?slug=${slug}`

    // Generate HTML with proper meta tags
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${post.meta_title || post.title} - Quilltips</title>
        
        <link rel="icon" href="/favicon.ico" type="image/x-icon">
        
        <meta name="description" content="${post.meta_description || post.excerpt || "Read this blog post on Quilltips"}" />
        <meta name="author" content="Quilltips" />
        
        <!-- Open Graph / Facebook -->
        <meta property="og:type" content="article" />
        <meta property="og:url" content="https://quilltips.co/blog/${post.slug}" />
        <meta property="og:title" content="${post.meta_title || post.title}" />
        <meta property="og:description" content="${post.meta_description || post.excerpt || "Read this blog post on Quilltips"}" />
        <meta property="og:image" content="${ogImageUrl}" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="${post.title}" />
        <meta property="article:published_time" content="${post.published_at}" />
        <meta property="article:author" content="${post.author?.name || 'Quilltips'}" />
        
        <!-- Twitter -->
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://quilltips.co/blog/${post.slug}" />
        <meta name="twitter:title" content="${post.meta_title || post.title}" />
        <meta name="twitter:description" content="${post.meta_description || post.excerpt || "Read this blog post on Quilltips"}" />
        <meta name="twitter:image" content="${ogImageUrl}" />
        
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
        
        <style>
          body {
            margin: 0;
            padding: 0;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            min-height: 100vh;
          }
          .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem;
          }
          .header {
            text-align: center;
            margin-bottom: 3rem;
          }
          .title {
            font-family: 'Playfair Display', serif;
            font-size: 3rem;
            font-weight: bold;
            color: #19363C;
            margin-bottom: 1rem;
            line-height: 1.2;
          }
          .excerpt {
            font-size: 1.25rem;
            color: #64748b;
            margin-bottom: 2rem;
            line-height: 1.6;
          }
          .meta {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 2rem;
            margin-bottom: 3rem;
            padding: 1rem;
            background: white;
            border-radius: 0.5rem;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          }
          .author {
            font-weight: 600;
            color: #19363C;
          }
          .date {
            color: #64748b;
          }
          .content {
            background: white;
            padding: 2rem;
            border-radius: 0.5rem;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            line-height: 1.7;
          }
          .cta {
            text-align: center;
            margin-top: 3rem;
            padding: 2rem;
            background: #19363C;
            color: white;
            border-radius: 0.5rem;
          }
          .cta h2 {
            margin-bottom: 1rem;
          }
          .cta a {
            color: #FFD166;
            text-decoration: none;
            font-weight: 600;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 class="title">${post.title}</h1>
            ${post.excerpt ? `<p class="excerpt">${post.excerpt}</p>` : ''}
            <div class="meta">
              ${post.author?.name ? `<span class="author">By ${post.author.name}</span>` : ''}
              <span class="date">${new Date(post.published_at).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</span>
            </div>
          </div>
          
          <div class="content">
            ${post.content}
          </div>
          
          <div class="cta">
            <h2>Ready to grow your author business?</h2>
            <p>Join thousands of authors who are connecting with readers and monetizing their work with Quilltips.</p>
            <a href="https://quilltips.co">Get Started Today →</a>
          </div>
        </div>
        
        <script>
          // Only redirect for human users, not social media crawlers
          const userAgent = navigator.userAgent || '';
          const isCrawler = /bot|crawler|spider|linkedinbot|facebookexternalhit|twitterbot|pinterest/i.test(userAgent);
          
          if (!isCrawler) {
            setTimeout(() => {
              window.location.href = '/blog/${post.slug}';
            }, 100);
          }
        </script>
      </body>
      </html>
    `

    return new Response(html, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/html',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    })

  } catch (error) {
    console.error('Error serving blog post:', error)
    return new Response('Internal server error', { status: 500 })
  }
}) 