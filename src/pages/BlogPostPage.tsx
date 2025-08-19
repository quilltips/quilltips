import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { NewsletterSignup } from "@/components/blog/NewsletterSignup";
import { Meta } from "@/components/Meta";
import { generateOGImageUrl } from "@/lib/og-image";
import { Link, useParams, useNavigate } from "react-router-dom";
import { 
  Calendar, 
  Eye, 
  Clock, 
  ArrowLeft, 
  Share2, 
  Facebook, 
  Twitter, 
  Linkedin,
  Copy,
  BookOpen,
  Tag
} from "lucide-react";
import { format } from "date-fns";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  featured_image_url: string | null;
  published_at: string;
  view_count: number;
  read_time_minutes: number | null;
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string[] | null;
  social_title: string | null;
  social_description: string | null;
  social_image_url: string | null;
  author: {
    name: string;
    avatar_url: string | null;
    bio: string | null;
  };
  categories: {
    name: string;
    slug: string;
  }[];
}

interface RelatedPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  published_at: string;
  featured_image_url: string | null;
  author: {
    name: string;
  };
}

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fetch blog post
  const { data: post, isLoading, error } = useQuery({
    queryKey: ['blog-post', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select(`
          id,
          title,
          slug,
          excerpt,
          content,
          featured_image_url,
          published_at,
          view_count,
          read_time_minutes,
          meta_title,
          meta_description,
          meta_keywords,
          social_title,
          social_description,
          social_image_url,
          author:public_profiles!blog_posts_author_public_profiles_fkey(name, avatar_url, bio),
          categories:blog_post_categories(
            category:blog_categories(name, slug)
          )
        `)
        .eq('slug', slug)
        .eq('status', 'published')
        .single();

      if (error) throw error;
      
      // Transform the data to flatten the categories
      return {
        ...data,
        categories: data.categories?.map((c: any) => c.category) || []
      } as BlogPost;
    },
    enabled: !!slug,
  });

  // Track view
  const trackViewMutation = useMutation({
    mutationFn: async (postId: string) => {
      // Increment view count
      await supabase.rpc('increment_blog_view', { post_id: postId });
      
      // Track analytics
      await supabase.from('blog_analytics').insert([{
        post_id: postId,
        visitor_ip: 'tracked-server-side', // You might want to get this from headers
        user_agent: navigator.userAgent,
        referrer: document.referrer,
      }]);
    },
  });

  // Fetch related posts
  const { data: relatedPosts, isLoading: loadingRelated } = useQuery({
    queryKey: ['related-posts', post?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select(`
          id,
          title,
          slug,
          excerpt,
          published_at,
          featured_image_url,
          author:public_profiles!blog_posts_author_public_profiles_fkey(name)
        `)
        .eq('status', 'published')
        .neq('id', post!.id)
        .order('published_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      return data as RelatedPost[];
    },
    enabled: !!post?.id,
  });

  // Track view when post loads
  useEffect(() => {
    if (post?.id) {
      trackViewMutation.mutate(post.id);
    }
  }, [post?.id]);

  // Handle 404
  useEffect(() => {
    if (error && 'code' in error && error.code === 'PGRST116') {
      navigate('/blog', { replace: true });
    }
  }, [error, navigate]);

  const handleShare = async (platform: string) => {
    const url = window.location.href;
    const title = post?.title || '';
    const description = post?.excerpt || '';

    let shareUrl = '';
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
      case 'copy':
        await navigator.clipboard.writeText(url);
        toast({
          title: "Link copied!",
          description: "The blog post URL has been copied to your clipboard.",
        });
        return;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Post not found</h1>
          <p className="text-gray-600 mb-4">The blog post you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/blog')}>
            Back to Blog
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Meta
        title={post.meta_title || post.title}
        description={post.meta_description || post.excerpt || "Read this blog post on Quilltips"}
        keywords={post.meta_keywords || ["blog", "writing", "publishing"]}
        image={generateOGImageUrl(post)}
        url={`https://quilltips.co/blog/${post.slug}`}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        {/* Back to Blog */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/blog')}
            className="mb-8 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Blog
          </Button>
        </div>

        <article className="container mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <header className="mb-12">
              {/* Categories */}
              <div className="flex items-center gap-2 mb-6">
                {post.categories.map((category) => (
                  <Link key={category.slug} to={`/blog?category=${category.slug}`}>
                    <Badge variant="secondary" className="hover:bg-gray-200 transition-colors cursor-pointer">
                      <Tag className="h-3 w-3 mr-1" />
                      {category.name}
                    </Badge>
                  </Link>
                ))}
              </div>

              {/* Title */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-playfair font-bold text-[#19363C] mb-8 leading-tight">
                {post.title}
              </h1>

              {/* Excerpt */}
              {post.excerpt && (
                <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed font-light">
                  {post.excerpt}
                </p>
              )}

              {/* Meta Info */}
              <div className="flex items-center justify-between flex-wrap gap-6 mb-8 p-6 bg-white rounded-xl shadow-sm border">
                <div className="flex items-center gap-6 text-sm text-gray-600">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 ring-2 ring-gray-100">
                      <AvatarImage src={post.author.avatar_url || undefined} />
                      <AvatarFallback className="bg-[#19363C] text-white font-semibold">
                        {post.author.name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-gray-900">{post.author.name}</p>
                      <p className="text-xs text-gray-500">Author</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">{format(new Date(post.published_at), 'MMMM d, yyyy')}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">{post.view_count.toLocaleString()} views</span>
                  </div>
                  {post.read_time_minutes && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">{post.read_time_minutes} min read</span>
                    </div>
                  )}
                </div>

                {/* Share Buttons */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500 font-medium">Share:</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleShare('twitter')}
                    className="text-gray-500 hover:text-blue-400 transition-colors"
                  >
                    <Twitter className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleShare('facebook')}
                    className="text-gray-500 hover:text-blue-600 transition-colors"
                  >
                    <Facebook className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleShare('linkedin')}
                    className="text-gray-500 hover:text-blue-700 transition-colors"
                  >
                    <Linkedin className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleShare('copy')}
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </header>

            {/* Featured Image */}
            {post.featured_image_url && (
              <div className="mb-12">
                <img
                  src={post.featured_image_url}
                  alt={post.title}
                  className="w-full h-auto rounded-2xl shadow-xl"
                />
              </div>
            )}

            {/* Content */}
            <div className="prose prose-lg md:prose-xl max-w-none mb-16">
              <div 
                className="text-gray-800 leading-relaxed prose-headings:text-[#19363C] prose-headings:font-playfair prose-headings:font-bold prose-h1:text-4xl prose-h2:text-3xl prose-h3:text-2xl prose-p:text-lg prose-p:leading-relaxed prose-a:text-blue-600 prose-a:no-underline prose-a:border-b prose-a:border-blue-200 prose-a:hover:border-blue-400 prose-a:transition-colors prose-blockquote:border-l-4 prose-blockquote:border-[#19363C] prose-blockquote:bg-gray-50 prose-blockquote:pl-6 prose-blockquote:py-2 prose-blockquote:rounded-r-lg prose-img:rounded-lg prose-img:shadow-md"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            </div>

            {/* Author Bio */}
            {post.author.bio && (
              <Card className="mb-16 border-0 shadow-lg bg-gradient-to-r from-gray-50 to-white">
                <CardContent className="pt-8 pb-8">
                  <div className="flex items-start gap-6">
                    <Avatar className="h-20 w-20 ring-4 ring-white shadow-lg">
                      <AvatarImage src={post.author.avatar_url || undefined} />
                      <AvatarFallback className="text-xl bg-[#19363C] text-white font-semibold">
                        {post.author.name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="text-2xl font-playfair font-bold text-[#19363C] mb-3">
                        About {post.author.name}
                      </h3>
                      <p className="text-gray-700 leading-relaxed text-lg">{post.author.bio}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Newsletter Signup */}
            <div className="mb-16">
              <NewsletterSignup 
                variant="compact"
                title="Enjoyed this post?"
                description="Subscribe to get more writing tips and publishing insights delivered to your inbox."
              />
            </div>

            {/* Related Posts */}
            <div className="border-t border-gray-200 pt-12">
              <div className="flex items-center gap-3 mb-8">
                <BookOpen className="h-6 w-6 text-[#19363C]" />
                <h2 className="text-3xl font-playfair font-bold text-[#19363C]">
                  Related Posts
                </h2>
              </div>
              
              {loadingRelated ? (
                <div className="flex justify-center py-12">
                  <LoadingSpinner />
                </div>
              ) : relatedPosts && relatedPosts.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {relatedPosts.map((relatedPost) => (
                    <Card key={relatedPost.id} className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-white overflow-hidden">
                      <Link to={`/blog/${relatedPost.slug}`} className="block">
                        {relatedPost.featured_image_url && (
                          <div className="aspect-video overflow-hidden">
                            <img
                              src={relatedPost.featured_image_url}
                              alt={relatedPost.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        )}
                        <CardContent className="p-6">
                          <h3 className="text-xl font-playfair font-bold text-[#19363C] mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                            {relatedPost.title}
                          </h3>
                          {relatedPost.excerpt && (
                            <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                              {relatedPost.excerpt}
                            </p>
                          )}
                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <span className="font-medium">{relatedPost.author.name}</span>
                            <span>{format(new Date(relatedPost.published_at), 'MMM d, yyyy')}</span>
                          </div>
                        </CardContent>
                      </Link>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 text-center">
                  <BookOpen className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">More Great Content Coming Soon!</h3>
                  <p className="text-gray-600 mb-6">
                    We're working on bringing you more insightful posts about writing, publishing, and author success.
                  </p>
                  <Button onClick={() => navigate('/blog')} className="bg-[#19363C] hover:bg-[#0f2529]">
                    Browse All Posts
                  </Button>
                </div>
              )}
            </div>
          </div>
        </article>
      </div>
    </>
  );
}; 