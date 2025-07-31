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
  // 3. Generated OG image from static HTML generator
  // 4. Default OG image
  
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
  
  // Use the static HTML generator for dynamic OG image
  const params = new URLSearchParams({
    title: post.title,
    ...(post.excerpt && { excerpt: post.excerpt }),
    ...(post.author?.name && { author: post.author.name }),
    ...(post.featured_image_url && { image: post.featured_image_url })
  });
  
  return `https://quilltips.co/og-image-generator.html?${params.toString()}`;
}

/**
 * Get default OG image URL
 */
export function getDefaultOGImageUrl() {
  return 'https://quilltips.co/og-image.png';
} 