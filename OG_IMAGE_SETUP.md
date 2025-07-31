# OG Image Setup for Blog Posts

This document explains how the Open Graph (OG) image system works for blog posts on Quilltips.

## How It Works

The OG image system uses a priority-based approach to generate the best possible image for social media sharing:

### Priority Order:
1. **Custom Social Image** (`social_image_url`) - Highest priority
2. **Featured Image** (`featured_image_url`) - Second priority  
3. **Generated OG Image** - Dynamic HTML generator
4. **Default OG Image** - Fallback static image

## Components

### 1. Static HTML Generator (`/public/og-image-generator.html`)
- **Purpose**: Generates dynamic OG images using URL parameters
- **URL Format**: `https://quilltips.co/og-image-generator.html?title=...&excerpt=...&author=...&image=...`
- **Advantages**: 
  - No server-side processing required
  - Fast and reliable
  - Works with any CDN
  - Easy to customize

### 2. Supabase Edge Function (`generate-blog-og-image`)
- **Purpose**: Server-side OG image generation
- **URL**: `https://qrawynczvedffcvnympn.supabase.co/functions/v1/generate-blog-og-image?slug=...`
- **Advantages**:
  - Can fetch real-time data from database
  - More dynamic content
  - Better for complex layouts

### 3. Utility Function (`src/lib/og-image.ts`)
- **Purpose**: Centralized logic for generating OG image URLs
- **Usage**: `generateOGImageUrl(postData)`
- **Handles**: URL validation, fallbacks, and parameter encoding

## Testing

### Test the Static Generator:
```
https://quilltips.co/og-image-generator.html?title=Test%20Blog%20Post&excerpt=This%20is%20a%20test%20excerpt&author=John%20Doe
```

### Test the Edge Function:
```
https://qrawynczvedffcvnympn.supabase.co/functions/v1/generate-blog-og-image?slug=your-blog-slug
```

### Test Social Media Preview:
Use these tools to test how your OG images appear:
- [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- [Twitter Card Validator](https://cards-dev.twitter.com/validator)
- [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/)

## Troubleshooting

### Common Issues:

1. **OG Image Not Showing**
   - Check if the image URL is accessible
   - Verify the image dimensions (1200x630px recommended)
   - Clear social media cache using their debug tools

2. **Edge Function Not Working**
   - Check Supabase function logs
   - Verify the function is deployed: `supabase functions deploy generate-blog-og-image`
   - Test with a valid blog slug

3. **Static Generator Not Working**
   - Check if the HTML file is accessible
   - Verify URL parameters are properly encoded
   - Check browser console for JavaScript errors

### Debugging Steps:

1. **Check the generated URL** in the blog post page source
2. **Test the URL directly** in a browser
3. **Use social media debug tools** to see what they see
4. **Check network tab** for any failed requests

## Customization

### Modifying the Static Generator:
Edit `/public/og-image-generator.html` to change:
- Colors and styling
- Layout and typography
- Branding elements
- Image positioning

### Modifying the Edge Function:
Edit `supabase/functions/generate-blog-og-image/index.ts` to change:
- Database queries
- HTML generation
- Error handling
- Caching behavior

## Best Practices

1. **Always provide fallbacks** - Never rely on a single image source
2. **Use proper dimensions** - 1200x630px for optimal social media display
3. **Include alt text** - For accessibility and SEO
4. **Test regularly** - Social media platforms change their requirements
5. **Cache appropriately** - Use cache headers to improve performance

## File Locations

- Static Generator: `/public/og-image-generator.html`
- Edge Function: `/supabase/functions/generate-blog-og-image/index.ts`
- Utility Function: `/src/lib/og-image.ts`
- Blog Post Component: `/src/pages/BlogPostPage.tsx`
- Default OG Image: `/public/og-image.png` 