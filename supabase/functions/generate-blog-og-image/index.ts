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

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Fetch blog post data
    const { data: post, error } = await supabase
      .from('blog_posts')
      .select(`
        title, 
        featured_image_url, 
        excerpt,
        author:profiles!blog_posts_author_id_fkey(name)
      `)
      .eq('slug', slug)
      .eq('status', 'published')
      .single()

    if (error || !post) {
      console.error('Blog post not found:', error)
      return new Response('Blog post not found', { status: 404 })
    }

    // Generate HTML for the og:image
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              margin: 0;
              padding: 0;
              width: 1200px;
              height: 630px;
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
              background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
              display: flex;
              align-items: center;
              justify-content: center;
              position: relative;
              overflow: hidden;
            }
            .container {
              width: 100%;
              height: 100%;
              display: flex;
              position: relative;
              background: white;
              box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
            }
            .content {
              flex: 1;
              padding: 80px;
              display: flex;
              flex-direction: column;
              justify-content: center;
              background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
              position: relative;
              z-index: 2;
            }
            .title {
              font-size: 48px;
              font-weight: bold;
              color: #19363C;
              line-height: 1.2;
              margin-bottom: 24px;
              max-height: 300px;
              overflow: hidden;
              display: -webkit-box;
              -webkit-line-clamp: 4;
              -webkit-box-orient: vertical;
            }
            .excerpt {
              font-size: 24px;
              color: #64748b;
              line-height: 1.4;
              margin-bottom: 40px;
              max-height: 140px;
              overflow: hidden;
              display: -webkit-box;
              -webkit-line-clamp: 3;
              -webkit-box-orient: vertical;
            }
            .branding {
              display: flex;
              align-items: center;
              gap: 16px;
              margin-top: auto;
            }
            .logo {
              width: 48px;
              height: 48px;
              background: #19363C;
              border-radius: 12px;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-weight: bold;
              font-size: 24px;
            }
            .site-name {
              font-size: 32px;
              font-weight: bold;
              color: #19363C;
            }
            .image-section {
              width: 500px;
              height: 100%;
              position: relative;
              overflow: hidden;
            }
            .featured-image {
              width: 100%;
              height: 100%;
              object-fit: cover;
              opacity: 0.95;
            }
            .image-overlay {
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background: linear-gradient(135deg, rgba(25, 54, 60, 0.1) 0%, rgba(255, 209, 102, 0.1) 100%);
            }
            .accent-dot {
              position: absolute;
              width: 120px;
              height: 120px;
              background: #FFD166;
              border-radius: 50%;
              top: -60px;
              right: -60px;
              opacity: 0.6;
              z-index: 1;
            }
            .author-info {
              font-size: 18px;
              color: #64748b;
              margin-bottom: 20px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="content">
              <div class="accent-dot"></div>
              <h1 class="title">${post.title}</h1>
              ${post.excerpt ? `<p class="excerpt">${post.excerpt}</p>` : ''}
              ${post.author?.name ? `<p class="author-info">By ${post.author.name}</p>` : ''}
              <div class="branding">
                <div class="logo">Q</div>
                <div class="site-name">Quilltips</div>
              </div>
            </div>
            ${post.featured_image_url ? `
              <div class="image-section">
                <img src="${post.featured_image_url}" alt="" class="featured-image" />
                <div class="image-overlay"></div>
              </div>
            ` : ''}
          </div>
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
    console.error('Error generating og image:', error)
    return new Response('Internal server error', { status: 500 })
  }
})