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
  
  // Use static blog OG image as fallback
  return 'https://quilltips.co/lovable-uploads/054843a4-9e8d-4b48-939e-5eb61ba32330.png';
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
  return 'https://quilltips.co/lovable-uploads/054843a4-9e8d-4b48-939e-5eb61ba32330.png';
}