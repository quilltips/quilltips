/**
 * Generate OG image URL for blog posts with proper fallbacks
 */
export function generateOGImageUrl(post: {
  title: string;
  excerpt?: string | null;
  author?: { name: string } | null;
  featured_image_url?: string | null;
  social_image_url?: string | null;
}) {
  // Priority order for OG image:
  // 1. Custom social image URL
  // 2. Featured image URL
  // 3. Static blog OG image (default)
  
  if (post.social_image_url) {
    return post.social_image_url.startsWith('http') 
      ? post.social_image_url 
      : `https://quilltips.co${post.social_image_url}`;
  }
  
  if (post.featured_image_url) {
    return post.featured_image_url.startsWith('http') 
      ? post.featured_image_url 
      : `https://quilltips.co${post.featured_image_url}`;
  }
  
  // Generate dynamic OG image using the generator
  const params = new URLSearchParams({
    title: post.title,
    excerpt: post.excerpt || '',
    author: post.author?.name || 'Quilltips',
    date: new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  });
  
  return `https://quilltips.co/og-image-generator.html?${params.toString()}`;
}

/**
 * Get default OG image URL
 */
export function getDefaultOGImageUrl() {
  return 'https://quilltips.co/og-image.png';
}

/**
 * Get blog OG image URL
 */
export function getBlogOGImageUrl() {
  return 'https://quilltips.co/lovable-uploads/qt-blog-image.png';
} 