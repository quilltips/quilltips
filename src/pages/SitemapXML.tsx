import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface BlogPost {
  slug: string;
  updated_at: string;
}

const SitemapXML = () => {
  const [xmlContent, setXmlContent] = useState<string>('');

  useEffect(() => {
    const generateSitemap = async () => {
      try {
        // Fetch all published blog posts
        const { data: blogPosts } = await supabase
          .from('blog_posts')
          .select('slug, updated_at')
          .eq('status', 'published')
          .order('updated_at', { ascending: false });

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

        let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

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

        xml += `
</urlset>`;

        setXmlContent(xml);
      } catch (error) {
        console.error('Error generating sitemap:', error);
        // Fallback to basic sitemap
        setXmlContent(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://quilltips.co/</loc></url>
  <url><loc>https://quilltips.co/about</loc></url>
  <url><loc>https://quilltips.co/blog</loc></url>
</urlset>`);
      }
    };

    generateSitemap();
  }, []);

  useEffect(() => {
    // Set content type to XML via meta tag
    const metaContentType = document.querySelector('meta[http-equiv="content-type"]');
    if (metaContentType) {
      metaContentType.setAttribute('content', 'application/xml; charset=utf-8');
    } else {
      const meta = document.createElement('meta');
      meta.setAttribute('http-equiv', 'content-type');
      meta.setAttribute('content', 'application/xml; charset=utf-8');
      document.head.appendChild(meta);
    }
  }, []);

  return (
    <div 
      dangerouslySetInnerHTML={{ __html: xmlContent }}
      style={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}
    />
  );
};

export default SitemapXML;