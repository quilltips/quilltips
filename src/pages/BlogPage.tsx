import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Meta } from "@/components/Meta";
import { Link } from "react-router-dom";
import { Calendar, Eye, ArrowRight, Tag, TrendingUp } from "lucide-react";
import { format } from "date-fns";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featured_image_url: string | null;
  published_at: string;
  view_count: number;
  read_time_minutes: number | null;
  author: {
    name: string;
    avatar_url: string | null;
  };
  categories: {
    name: string;
    slug: string;
  }[];
}

export default function BlogPage() {
  // Fetch published blog posts
  const { data: posts, isLoading: loadingPosts } = useQuery({
    queryKey: ['blog-posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select(`
          id,
          title,
          slug,
          excerpt,
          featured_image_url,
          published_at,
          view_count,
          read_time_minutes,
          author:public_profiles!blog_posts_author_id_fkey(name, avatar_url),
          categories:blog_post_categories(
            category:blog_categories(name, slug)
          )
        `)
        .eq('status', 'published')
        .order('published_at', { ascending: false });

      if (error) throw error;
      
      // Transform the data to flatten the categories
      return (data as any[]).map(post => ({
        ...post,
        categories: post.categories?.map((c: any) => c.category) || []
      })) as BlogPost[];
    },
  });

  if (loadingPosts) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <>
      <Meta
        title="Blog - Quilltips"
        description="Discover insights, tips, and stories from the publishing world. Learn about writing, publishing, and author success strategies."
        keywords={["blog", "writing tips", "publishing", "author success", "writing advice"]}
      />
      
      <div className="min-h-screen">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="text-center mb-16">
              <h1 className="text-5xl md:text-6xl font-playfair font-bold text-[#19363C]">
                Quilltips Blog
              </h1>
            </div>

            {/* Blog Posts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
              {posts?.map((post) => (
                <Card key={post.id} className="group hover:shadow-2xl transition-all duration-300 border-0 bg-white overflow-hidden">
                  {post.featured_image_url && (
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={post.featured_image_url}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                  )}
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-2 mb-3">
                      {post.categories.map((category) => (
                        <Badge key={category.slug} variant="secondary" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                          <Tag className="h-3 w-3 mr-1" />
                          {category.name}
                        </Badge>
                      ))}
                    </div>
                    <CardTitle className="text-xl md:text-2xl group-hover:text-[#19363C] transition-colors leading-tight">
                      <Link to={`/blog/${post.slug}`} className="hover:underline">
                        {post.title}
                      </Link>
                    </CardTitle>
                    <CardDescription className="line-clamp-3 text-gray-600 text-base leading-relaxed">
                      {post.excerpt}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-6">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {format(new Date(post.published_at), 'MMM d, yyyy')}
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          {post.view_count.toLocaleString()} views
                        </div>
                        {post.read_time_minutes && (
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-4 w-4" />
                            {post.read_time_minutes} min read
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 ring-2 ring-gray-100">
                          <AvatarImage src={post.author.avatar_url || undefined} />
                          <AvatarFallback className="bg-[#19363C] text-white font-semibold">
                            {post.author.name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{post.author.name}</p>
                          <p className="text-xs text-gray-500">Author</p>
                        </div>
                      </div>
                      <Link to={`/blog/${post.slug}`}>
                        <Button variant="ghost" size="sm" className="group text-[#19363C] hover:text-[#0f2529] hover:bg-blue-50">
                          Read More
                          <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Empty State */}
            {posts?.length === 0 && (
              <div className="text-center py-16">
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">No posts yet</h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  We're working on creating amazing content for you. Check back soon!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
} 