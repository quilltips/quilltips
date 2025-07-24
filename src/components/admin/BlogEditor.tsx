import { useState, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Quote, 
  Heading1, 
  Heading2, 
  Heading3,
  Link as LinkIcon,
  Image as ImageIcon,
  Undo,
  Redo,
  Upload,
  X
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Author {
  id: string;
  name: string;
  avatar_url: string | null;
  bio: string | null;
}

interface BlogCategory {
  id: string;
  name: string;
  slug: string;
}

interface BlogEditorProps {
  initialData?: {
    id?: string;
    title: string;
    excerpt: string;
    content: string;
    status: string;
    author_id: string;
    featured_image_url: string | null;
    meta_title: string;
    meta_description: string;
    meta_keywords: string;
    category_ids: string[];
  };
  onSave: (data: any) => void;
  onCancel: () => void;
  isSaving: boolean;
}

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="border-b p-2 flex flex-wrap gap-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={editor.isActive('bold') ? 'bg-gray-200' : ''}
      >
        <Bold className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={editor.isActive('italic') ? 'bg-gray-200' : ''}
      >
        <Italic className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={editor.isActive('heading', { level: 1 }) ? 'bg-gray-200' : ''}
      >
        <Heading1 className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={editor.isActive('heading', { level: 2 }) ? 'bg-gray-200' : ''}
      >
        <Heading2 className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={editor.isActive('heading', { level: 3 }) ? 'bg-gray-200' : ''}
      >
        <Heading3 className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={editor.isActive('bulletList') ? 'bg-gray-200' : ''}
      >
        <List className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={editor.isActive('orderedList') ? 'bg-gray-200' : ''}
      >
        <ListOrdered className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={editor.isActive('blockquote') ? 'bg-gray-200' : ''}
      >
        <Quote className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          const url = window.prompt('Enter URL');
          if (url) {
            editor.chain().focus().setLink({ href: url }).run();
          }
        }}
        className={editor.isActive('link') ? 'bg-gray-200' : ''}
      >
        <LinkIcon className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          const url = window.prompt('Enter image URL');
          if (url) {
            editor.chain().focus().setImage({ src: url }).run();
          }
        }}
      >
        <ImageIcon className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().undo().run()}
      >
        <Undo className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().redo().run()}
      >
        <Redo className="h-4 w-4" />
      </Button>
    </div>
  );
};

export const BlogEditor = ({ initialData, onSave, onCancel, isSaving }: BlogEditorProps) => {
  const [title, setTitle] = useState(initialData?.title || "");
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || "");
  const [status, setStatus] = useState(initialData?.status || "draft");
  const [authorId, setAuthorId] = useState(initialData?.author_id || "");
  const [featuredImageUrl, setFeaturedImageUrl] = useState(initialData?.featured_image_url || "");
  const [metaTitle, setMetaTitle] = useState(initialData?.meta_title || "");
  const [metaDescription, setMetaDescription] = useState(initialData?.meta_description || "");
  const [metaKeywords, setMetaKeywords] = useState(initialData?.meta_keywords || "");
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialData?.category_ids || []);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const { toast } = useToast();

  // Fetch authors
  const { data: authors } = useQuery({
    queryKey: ['blog-authors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, avatar_url, bio')
        .order('name');
      if (error) throw error;
      return data as Author[];
    },
  });

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ['blog-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_categories')
        .select('*')
        .order('name');
      if (error) throw error;
      return data as BlogCategory[];
    },
  });

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        link: false, // Disable the default link extension to avoid duplicates
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 hover:text-blue-800 underline',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg',
        },
      }),
    ],
    content: initialData?.content || "",
  });

  // Auto-generate meta title and description
  useEffect(() => {
    if (!metaTitle && title) {
      setMetaTitle(title);
    }
    if (!metaDescription && excerpt) {
      setMetaDescription(excerpt);
    }
  }, [title, excerpt, metaTitle, metaDescription]);

  const handleImageUpload = async (file: File) => {
    if (!file) return;

    setIsUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `blog-images/${fileName}`;

      // Use the same bucket as other uploads in the app
      const bucketName = 'covers'; // This matches the existing BookCoverUpload

      console.log(`Uploading to bucket: ${bucketName}, path: ${filePath}`);
      
      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      const { data } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);
      
      const publicUrl = data.publicUrl;
      console.log('Upload successful, URL:', publicUrl);

      setFeaturedImageUrl(publicUrl);
      toast({
        title: "Image uploaded successfully",
        description: "The featured image has been uploaded.",
      });
    } catch (error: any) {
      console.error('Image upload error:', error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSave = () => {
    if (!title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for your blog post.",
        variant: "destructive",
      });
      return;
    }

    if (!authorId) {
      toast({
        title: "Author required",
        description: "Please select an author for your blog post.",
        variant: "destructive",
      });
      return;
    }

    const postData = {
      id: initialData?.id,
      title: title.trim(),
      excerpt: excerpt.trim(),
      content: editor?.getHTML() || "",
      status,
      author_id: authorId,
      featured_image_url: featuredImageUrl || null,
      meta_title: metaTitle.trim(),
      meta_description: metaDescription.trim(),
      meta_keywords: metaKeywords.trim(),
      category_ids: selectedCategories,
    };

    console.log('BlogEditor sending data:', postData);
    console.log('Selected categories:', selectedCategories);
    console.log('Category IDs type:', typeof selectedCategories);
    console.log('Category IDs is array:', Array.isArray(selectedCategories));

    onSave(postData);
  };

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev => {
      const newCategories = prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId];
      
      console.log('Updated categories:', newCategories);
      return newCategories;
    });
  };

  const selectedAuthor = authors?.find(a => a.id === authorId);

  return (
    <div className="space-y-6">
      <Tabs defaultValue="content" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter blog post title..."
                />
              </div>
              
              <div>
                <Label htmlFor="excerpt">Excerpt</Label>
                <Textarea
                  id="excerpt"
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="Brief description of the post..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="author">Author *</Label>
                <Select value={authorId} onValueChange={setAuthorId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an author" />
                  </SelectTrigger>
                  <SelectContent>
                    {authors?.map((author) => (
                      <SelectItem key={author.id} value={author.id}>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={author.avatar_url || undefined} />
                            <AvatarFallback>{author.name?.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span>{author.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedAuthor && (
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={selectedAuthor.avatar_url || undefined} />
                        <AvatarFallback>{selectedAuthor.name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{selectedAuthor.name}</p>
                        {selectedAuthor.bio && (
                          <p className="text-sm text-gray-600">{selectedAuthor.bio}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Featured Image */}
          <Card>
            <CardHeader>
              <CardTitle>Featured Image</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {featuredImageUrl && (
                <div className="relative">
                  <img
                    src={featuredImageUrl}
                    alt="Featured"
                    className="w-full max-w-md h-auto rounded-lg"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFeaturedImageUrl("")}
                    className="absolute top-2 right-2"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
              
              <div>
                <Label htmlFor="image-upload">Upload Image</Label>
                <div className="mt-2">
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file);
                    }}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById('image-upload')?.click()}
                    disabled={isUploadingImage}
                    className="flex items-center gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    {isUploadingImage ? "Uploading..." : "Upload Image"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Content Editor */}
          <Card>
            <CardHeader>
              <CardTitle>Content</CardTitle>
            </CardHeader>
            <CardContent>
              <MenuBar editor={editor} />
              <div className="border rounded-b-lg">
                <EditorContent 
                  editor={editor} 
                  className="prose prose-lg max-w-none p-4 min-h-[400px] focus:outline-none"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seo" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>SEO Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="meta-title">Meta Title</Label>
                <Input
                  id="meta-title"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  placeholder="SEO title for search engines..."
                />
                <p className="text-sm text-gray-500 mt-1">
                  {metaTitle.length}/60 characters
                </p>
              </div>
              
              <div>
                <Label htmlFor="meta-description">Meta Description</Label>
                <Textarea
                  id="meta-description"
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  placeholder="Brief description for search results..."
                  rows={3}
                />
                <p className="text-sm text-gray-500 mt-1">
                  {metaDescription.length}/160 characters
                </p>
              </div>
              
              <div>
                <Label htmlFor="meta-keywords">Meta Keywords</Label>
                <Input
                  id="meta-keywords"
                  value={metaKeywords}
                  onChange={(e) => setMetaKeywords(e.target.value)}
                  placeholder="keyword1, keyword2, keyword3..."
                />
                <p className="text-sm text-gray-500 mt-1">
                  Separate keywords with commas
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Post Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Categories</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {categories?.map((category) => (
                    <Badge
                      key={category.id}
                      variant={selectedCategories.includes(category.id) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleCategory(category.id)}
                    >
                      {category.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Post Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-lg max-w-none">
                <h1>{title || "Untitled Post"}</h1>
                {excerpt && <p className="text-xl text-gray-600">{excerpt}</p>}
                {featuredImageUrl && (
                  <img src={featuredImageUrl} alt="Featured" className="w-full h-auto rounded-lg" />
                )}
                <div dangerouslySetInnerHTML={{ __html: editor?.getHTML() || "" }} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Post"}
        </Button>
      </div>
    </div>
  );
}; 