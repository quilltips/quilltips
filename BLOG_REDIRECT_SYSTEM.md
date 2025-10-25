# Blog Redirect System

## Overview

This system handles redirects from old timestamp-based blog URLs to new clean URLs, ensuring that existing links (like those shared on social media) don't break.

## Problem

**Old URLs (with timestamps):**
- `https://quilltips.co/blog/5-ways-to-build-community-as-an-indie-author-1759860493233`

**New URLs (clean):**
- `https://quilltips.co/blog/5-ways-to-build-community-as-an-indie-author`

## Solution

### 1. Client-Side Redirect (Primary)

The `BlogPostPage` component now includes redirect logic that:

1. **Detects timestamp-based URLs**: Uses regex pattern `/-\d{13}$/` to identify URLs ending with 13-digit timestamps
2. **Extracts clean slug**: Removes the timestamp portion to get the clean slug
3. **Validates existence**: Checks if a blog post exists with the clean slug
4. **Redirects**: Uses `navigate()` with `replace: true` to redirect to the clean URL

### 2. Server-Side Redirect (Backup)

A Supabase Edge Function at `/blog-redirect` provides server-side redirects:

- **URL**: `https://quilltips.co/blog/legacy-redirect/{old-slug}`
- **Response**: 301 redirect to clean URL
- **Fallback**: 404 if clean slug doesn't exist

## Implementation Details

### Client-Side Logic

```typescript
// In BlogPostPage.tsx
useEffect(() => {
  const handleLegacyRedirect = async () => {
    if (!slug) return;

    const timestampPattern = /-\d{13}$/;
    
    if (timestampPattern.test(slug)) {
      const cleanSlug = slug.replace(timestampPattern, '');
      
      // Check if clean slug exists
      const { data: post } = await supabase
        .from('blog_posts')
        .select('slug, status')
        .eq('slug', cleanSlug)
        .eq('status', 'published')
        .single();
      
      if (post) {
        navigate(`/blog/${cleanSlug}`, { replace: true });
      }
    }
  };

  handleLegacyRedirect();
}, [slug, navigate]);
```

### Server-Side Logic

```typescript
// In supabase/functions/blog-redirect/index.ts
const timestampPattern = /-\d{13}$/;
if (timestampPattern.test(slug)) {
  const cleanSlug = slug.replace(timestampPattern, '');
  
  // Validate and redirect
  const { data: post } = await supabase
    .from('blog_posts')
    .select('slug, status')
    .eq('slug', cleanSlug)
    .eq('status', 'published')
    .single();
  
  if (post) {
    return new Response(null, {
      status: 301,
      headers: { 'Location': `https://quilltips.co/blog/${cleanSlug}` }
    });
  }
}
```

## Benefits

1. **SEO-Friendly**: 301 redirects preserve link equity
2. **User Experience**: No broken links from social media shares
3. **Automatic**: Works for all existing timestamp-based URLs
4. **Future-Proof**: Handles any new timestamp-based URLs automatically

## Testing

### Test Cases

1. **Valid redirect**: 
   - Input: `/blog/5-ways-to-build-community-as-an-indie-author-1759860493233`
   - Expected: Redirect to `/blog/5-ways-to-build-community-as-an-indie-author`

2. **Invalid redirect**:
   - Input: `/blog/nonexistent-post-1759860493233`
   - Expected: Show 404 or redirect to blog listing

3. **Clean URL**:
   - Input: `/blog/5-ways-to-build-community-as-an-indie-author`
   - Expected: Normal blog post display

### Manual Testing

1. Visit an old timestamp-based URL
2. Verify it redirects to the clean URL
3. Check browser history (should replace, not add new entry)
4. Verify the clean URL loads correctly

## Maintenance

### Adding New Redirects

The system automatically handles any new timestamp-based URLs without additional configuration.

### Monitoring

- Check server logs for redirect patterns
- Monitor 404 errors for failed redirects
- Track redirect success rates

## Edge Cases

1. **Multiple timestamps**: Only removes the last 13-digit sequence
2. **Invalid timestamps**: Non-13-digit numbers are ignored
3. **Missing clean slug**: Falls back to 404 or blog listing
4. **Unpublished posts**: Clean slug must be published to redirect

## Future Enhancements

1. **Analytics**: Track redirect usage
2. **Caching**: Cache redirect mappings for performance
3. **Bulk redirects**: Handle multiple legacy URLs at once
4. **Custom patterns**: Support for other legacy URL formats
