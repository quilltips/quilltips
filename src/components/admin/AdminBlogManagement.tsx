import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { BlogEditor } from "@/components/admin/BlogEditor";
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Mail, 
  Users, 
  FileText, 
  Calendar,
  ExternalLink,
  Tag,
  AlertTriangle
} from "lucide-react";
import { format } from "date-fns";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  status: string;
  published_at: string | null;
  created_at: string;
  view_count: number;
  featured_image_url: string | null;
  author: {
    name: string;
    avatar_url: string | null;
  };
  categories: {
    name: string;
    slug: string;
  }[];
}

interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

interface NewsletterSubscriber {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  subscribed_at: string;
  is_active: boolean;
  source: string;
}

export const AdminBlogManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("posts");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch blog posts
  const { data: posts, isLoading: loadingPosts } = useQuery({
    queryKey: ['admin-blog-posts', searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('blog_posts')
        .select(`
          id,
          title,
          slug,
          excerpt,
          status,
          published_at,
          created_at,
          view_count,
          featured_image_url,
          author:profiles!blog_posts_author_id_fkey(name, avatar_url),
          categories:blog_post_categories(
            category:blog_categories(name, slug)
          )
        `)
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,excerpt.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      // Transform the data to flatten the categories
      return (data as any[]).map(post => ({
        ...post,
        categories: post.categories?.map((c: any) => c.category) || []
      })) as BlogPost[];
    },
  });

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ['admin-blog-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_categories')
        .select('*')
        .order('name');
      if (error) throw error;
      return data as BlogCategory[];
    },
  });

  // Fetch newsletter subscribers
  const { data: subscribers } = useQuery({
    queryKey: ['admin-newsletter-subscribers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('newsletter_subscribers')
        .select('*')
        .order('subscribed_at', { ascending: false });
      if (error) throw error;
      return data as NewsletterSubscriber[];
    },
  });

  // Fetch blog stats
  const { data: blogStats } = useQuery({
    queryKey: ['admin-blog-stats'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_blog_stats');
      if (error) throw error;
      return data as {
        total_posts: number;
        published_posts: number;
        total_views: number;
        views_this_month: number;
        total_subscribers: number;
      };
    },
  });

  // Fetch full post data for editing
  const { data: editingPostData } = useQuery({
    queryKey: ['blog-post-edit', editingPost?.id],
    queryFn: async () => {
      if (!editingPost?.id) return null;
      
      const { data, error } = await supabase
        .from('blog_posts')
        .select(`
          id,
          title,
          slug,
          excerpt,
          content,
          status,
          author_id,
          featured_image_url,
          meta_title,
          meta_description,
          meta_keywords,
          categories:blog_post_categories(category_id)
        `)
        .eq('id', editingPost.id)
        .single();

      if (error) throw error;
      
      return {
        ...data,
        category_ids: data.categories?.map((c: any) => c.category_id) || []
      };
    },
    enabled: !!editingPost?.id,
  });

  // Create/Update post mutation
  const savePostMutation = useMutation({
    mutationFn: async (postData: any) => {
      const { category_ids, ...postFields } = postData;
      
      // Generate slug if not provided - use client-side generation instead of RPC
      if (!postFields.slug) {
        const baseSlug = postFields.title
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
          .replace(/\s+/g, '-') // Replace spaces with hyphens
          .replace(/-+/g, '-') // Replace multiple hyphens with single
          .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
          .substring(0, 50); // Limit length to prevent issues
        
        // Add timestamp to ensure uniqueness
        postFields.slug = `${baseSlug}-${Date.now()}`;
      } else {
        // Ensure existing slug is also sanitized
        postFields.slug = postFields.slug
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9-]/g, '') // Only allow lowercase letters, numbers, and hyphens
          .replace(/-+/g, '-') // Replace multiple hyphens with single
          .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
      }

      // Set published_at if status is published and not already set
      if (postFields.status === 'published' && !postFields.published_at) {
        postFields.published_at = new Date().toISOString();
      }

      // Ensure category_ids is a proper array
      const categoryIdsArray = Array.isArray(category_ids) ? category_ids : [];

      // Convert meta_keywords from string to array if needed
      let metaKeywordsArray = [];
      if (postFields.meta_keywords) {
        if (typeof postFields.meta_keywords === 'string') {
          // Split by comma and trim whitespace
          metaKeywordsArray = postFields.meta_keywords
            .split(',')
            .map(keyword => keyword.trim())
            .filter(keyword => keyword.length > 0);
        } else if (Array.isArray(postFields.meta_keywords)) {
          metaKeywordsArray = postFields.meta_keywords;
        }
      }
      
      // Update the postFields with the correct meta_keywords format
      postFields.meta_keywords = metaKeywordsArray;

      // Sanitize other fields to prevent null/undefined issues
      postFields.title = postFields.title || '';
      postFields.content = postFields.content || '';
      postFields.excerpt = postFields.excerpt || null;
      postFields.featured_image_url = postFields.featured_image_url || null;
      postFields.meta_title = postFields.meta_title || null;
      postFields.meta_description = postFields.meta_description || null;
      postFields.canonical_url = postFields.canonical_url || null;
      postFields.social_image_url = postFields.social_image_url || null;
      postFields.social_title = postFields.social_title || null;
      postFields.social_description = postFields.social_description || null;

      // Ensure author_id is set for new posts
      if (!postFields.author_id) {
        // Get the current user's profile ID
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', user.id)
            .single();
          if (profile) {
            postFields.author_id = profile.id;
          } else {
            throw new Error('User profile not found');
          }
        } else {
          throw new Error('User not authenticated');
        }
      }

      console.log('Saving post with data:', {
        ...postFields,
        category_ids: categoryIdsArray
      });
      console.log('Meta keywords array:', metaKeywordsArray);
      console.log('Category IDs array:', categoryIdsArray);
      console.log('Slug:', postFields.slug);
      console.log('Author ID:', postFields.author_id);

      let result;
      if (postData.id) {
        // Update existing post
        const { data, error } = await supabase
          .from('blog_posts')
          .update(postFields)
          .eq('id', postData.id)
          .select()
          .single();
        if (error) throw error;
        result = data;
      } else {
        // Create new post - remove id field to let database generate it
        const { id, ...postFieldsWithoutId } = postFields;
        const { data, error } = await supabase
          .from('blog_posts')
          .insert([postFieldsWithoutId])
          .select()
          .single();
        if (error) throw error;
        result = data;
      }

      // Handle categories - only if we have category IDs
      if (categoryIdsArray.length > 0) {
        // Remove existing categories
        await supabase
          .from('blog_post_categories')
          .delete()
          .eq('post_id', result.id);

        // Add new categories
        const categoryInserts = categoryIdsArray.map((categoryId: string) => ({
          post_id: result.id,
          category_id: categoryId
        }));
        
        console.log('Inserting categories:', categoryInserts);
        
        const { error: categoryError } = await supabase
          .from('blog_post_categories')
          .insert(categoryInserts);
          
        if (categoryError) {
          console.error('Category insert error:', categoryError);
          throw categoryError;
        }
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blog-posts'] });
      queryClient.invalidateQueries({ queryKey: ['admin-blog-stats'] });
      setIsCreateDialogOpen(false);
      setIsEditDialogOpen(false);
      setEditingPost(null);
      toast({
        title: "Success",
        description: "Blog post saved successfully.",
      });
    },
    onError: (error: any) => {
      console.error('Save post error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save blog post. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete post mutation
  const deletePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      // Delete categories first
      await supabase
        .from('blog_post_categories')
        .delete()
        .eq('post_id', postId);

      // Delete the post
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', postId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blog-posts'] });
      queryClient.invalidateQueries({ queryKey: ['admin-blog-stats'] });
      toast({
        title: "Success",
        description: "Blog post deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete newsletter subscriber mutation
  const deleteSubscriberMutation = useMutation({
    mutationFn: async (subscriberId: string) => {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .delete()
        .eq('id', subscriberId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-newsletter-subscribers'] });
      queryClient.invalidateQueries({ queryKey: ['admin-blog-stats'] });
      toast({
        title: "Success",
        description: "Newsletter subscriber deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete subscriber.",
        variant: "destructive",
      });
    },
  });

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'default';
      case 'draft':
        return 'secondary';
      case 'archived':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const handleEditPost = (post: BlogPost) => {
    setEditingPost(post);
    setIsEditDialogOpen(true);
  };

  const handleCreatePost = () => {
    setEditingPost(null);
    setIsCreateDialogOpen(true);
  };

  const handleSavePost = (postData: any) => {
    savePostMutation.mutate(postData);
  };

  const handleDeletePost = (postId: string) => {
    if (window.confirm('Are you sure you want to delete this blog post? This action cannot be undone.')) {
      deletePostMutation.mutate(postId);
    }
  };

  const handleDeleteSubscriber = (subscriberId: string, email: string) => {
    if (window.confirm(`Are you sure you want to delete the subscriber "${email}"? This action cannot be undone.`)) {
      deleteSubscriberMutation.mutate(subscriberId);
    }
  };

  if (loadingPosts) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{blogStats?.total_posts || 0}</div>
            <p className="text-xs text-muted-foreground">
              {blogStats?.published_posts || 0} published
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{blogStats?.total_views || 0}</div>
            <p className="text-xs text-muted-foreground">
              {blogStats?.views_this_month || 0} this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Newsletter Subscribers</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{blogStats?.total_subscribers || 0}</div>
            <p className="text-xs text-muted-foreground">
              Active subscribers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Available categories
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="posts" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Posts
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex items-center gap-2">
            <Tag className="h-4 w-4" />
            Categories
          </TabsTrigger>
          <TabsTrigger value="subscribers" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Newsletter
          </TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Blog Posts
                  </CardTitle>
                  <CardDescription>
                    Manage your blog posts and content
                  </CardDescription>
                </div>
                <Button onClick={handleCreatePost} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  New Post
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 mb-4">
                <Search className="h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search posts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>

              <div className="space-y-4">
                {posts?.map((post) => (
                  <div key={post.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-4 flex-1">
                      {post.featured_image_url && (
                        <img
                          src={post.featured_image_url}
                          alt={post.title}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="font-medium text-lg">{post.title}</h3>
                        <p className="text-sm text-gray-500 line-clamp-2">{post.excerpt}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant={getStatusBadgeColor(post.status)}>
                            {post.status}
                          </Badge>
                          <span className="text-xs text-gray-400">
                            {format(new Date(post.created_at), 'MMM d, yyyy')}
                          </span>
                          <span className="text-xs text-gray-400">
                            {post.view_count} views
                          </span>
                          {post.categories.length > 0 && (
                            <div className="flex gap-1">
                              {post.categories.slice(0, 2).map((category) => (
                                <Badge key={category.slug} variant="outline" className="text-xs">
                                  {category.name}
                                </Badge>
                              ))}
                              {post.categories.length > 2 && (
                                <span className="text-xs text-gray-400">
                                  +{post.categories.length - 2} more
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEditPost(post)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => window.open(`/blog/${post.slug}`, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDeletePost(post.id)}
                        disabled={deletePostMutation.isPending}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Blog Categories
              </CardTitle>
              <CardDescription>
                Manage blog post categories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categories?.map((category) => (
                  <div key={category.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{category.name}</h3>
                      <p className="text-sm text-gray-500">{category.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscribers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Newsletter Subscribers
              </CardTitle>
              <CardDescription>
                Manage your newsletter subscriber list
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {subscribers?.map((subscriber) => (
                  <div key={subscriber.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{subscriber.email}</h3>
                      <p className="text-sm text-gray-500">
                        {subscriber.first_name} {subscriber.last_name}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={subscriber.is_active ? "default" : "secondary"}>
                          {subscriber.is_active ? "Active" : "Inactive"}
                        </Badge>
                        <span className="text-xs text-gray-400">
                          {format(new Date(subscriber.subscribed_at), 'MMM d, yyyy')}
                        </span>
                        <span className="text-xs text-gray-400">
                          via {subscriber.source}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeleteSubscriber(subscriber.id, subscriber.email)}
                        disabled={deleteSubscriberMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Post Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Blog Post</DialogTitle>
            <DialogDescription>
              Add a new blog post to your site with rich content editing
            </DialogDescription>
          </DialogHeader>
          <BlogEditor
            onSave={handleSavePost}
            onCancel={() => setIsCreateDialogOpen(false)}
            isSaving={savePostMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Post Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Blog Post</DialogTitle>
            <DialogDescription>
              Update your blog post content and settings
            </DialogDescription>
          </DialogHeader>
          {editingPostData && (
            <BlogEditor
              initialData={{
                id: editingPostData.id,
                title: editingPostData.title,
                excerpt: editingPostData.excerpt || "",
                content: editingPostData.content || "",
                status: editingPostData.status,
                author_id: editingPostData.author_id,
                featured_image_url: editingPostData.featured_image_url,
                meta_title: editingPostData.meta_title || "",
                meta_description: editingPostData.meta_description || "",
                meta_keywords: Array.isArray(editingPostData.meta_keywords) 
                  ? editingPostData.meta_keywords.join(', ')
                  : editingPostData.meta_keywords || "",
                category_ids: editingPostData.category_ids
              }}
              onSave={handleSavePost}
              onCancel={() => setIsEditDialogOpen(false)}
              isSaving={savePostMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}; 