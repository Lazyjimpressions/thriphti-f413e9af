import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getAllArticles } from "@/integrations/supabase/queries";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Pencil, Trash2, Plus, ExternalLink } from "lucide-react";
import type { Database } from '@/integrations/supabase/types';

type Article = Database['public']['Tables']['articles']['Row'];
type ArticleInsert = Database['public']['Tables']['articles']['Insert'];

export default function AdminArticles() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [formData, setFormData] = useState<{
    title: string;
    slug: string;
    excerpt: string;
    body: string;
    image: string;
    author: string;
    category: string;
    tags: string[];
    city: string;
    source_url: string;
  }>({
    title: '',
    slug: '',
    excerpt: '',
    body: '',
    image: '',
    author: '',
    category: '',
    tags: [],
    city: 'Dallas',
    source_url: ''
  });

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const data = await getAllArticles();
      setArticles(data);
    } catch (error) {
      console.error('Error fetching articles:', error);
      toast({
        title: "Error",
        description: "Failed to fetch articles",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleFormChange = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Auto-generate slug when title changes
    if (field === 'title' && value) {
      setFormData(prev => ({
        ...prev,
        slug: generateSlug(value)
      }));
    }
  };

  const handleTagsChange = (tagsString: string) => {
    const tags = tagsString.split(',').map(tag => tag.trim()).filter(tag => tag);
    setFormData(prev => ({
      ...prev,
      tags
    }));
  };

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      excerpt: '',
      body: '',
      image: '',
      author: '',
      category: '',
      tags: [],
      city: 'Dallas',
      source_url: ''
    });
    setEditingArticle(null);
  };

  const handleCreate = async () => {
    if (!formData.title || !formData.slug) {
      toast({
        title: "Error",
        description: "Title and slug are required",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('articles')
        .insert(formData)
        .select()
        .single();

      if (error) throw error;

      setArticles(prev => [data, ...prev]);
      setShowCreateDialog(false);
      resetForm();
      toast({
        title: "Success",
        description: "Article created successfully"
      });
    } catch (error: any) {
      console.error('Error creating article:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create article",
        variant: "destructive"
      });
    }
  };

  const handleUpdate = async () => {
    if (!editingArticle) return;

    try {
      const { data, error } = await supabase
        .from('articles')
        .update(formData)
        .eq('id', editingArticle.id)
        .select()
        .single();

      if (error) throw error;

      setArticles(prev => prev.map(article => 
        article.id === editingArticle.id ? data : article
      ));
      setEditingArticle(null);
      resetForm();
      toast({
        title: "Success",
        description: "Article updated successfully"
      });
    } catch (error: any) {
      console.error('Error updating article:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update article",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this article?')) return;

    try {
      const { error } = await supabase
        .from('articles')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setArticles(prev => prev.filter(article => article.id !== id));
      toast({
        title: "Success",
        description: "Article deleted successfully"
      });
    } catch (error: any) {
      console.error('Error deleting article:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete article",
        variant: "destructive"
      });
    }
  };

  const startEdit = (article: Article) => {
    setEditingArticle(article);
    setFormData({
      title: article.title || '',
      slug: article.slug || '',
      excerpt: article.excerpt || '',
      body: article.body || '',
      image: article.image || '',
      author: article.author || '',
      category: article.category || '',
      tags: article.tags || [],
      city: article.city || 'Dallas',
      source_url: article.source_url || ''
    });
  };

  const ArticleForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => handleFormChange('title', e.target.value)}
            placeholder="Article title"
            required
          />
        </div>
        <div>
          <Label htmlFor="slug">Slug *</Label>
          <Input
            id="slug"
            value={formData.slug}
            onChange={(e) => handleFormChange('slug', e.target.value)}
            placeholder="article-slug"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="author">Author</Label>
          <Input
            id="author"
            value={formData.author}
            onChange={(e) => handleFormChange('author', e.target.value)}
            placeholder="Author name"
          />
        </div>
        <div>
          <Label htmlFor="category">Category</Label>
          <Select value={formData.category} onValueChange={(value) => handleFormChange('category', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Guide">Guide</SelectItem>
              <SelectItem value="Tips & Tricks">Tips & Tricks</SelectItem>
              <SelectItem value="Store Features">Store Features</SelectItem>
              <SelectItem value="Neighborhood Spotlights">Neighborhood Spotlights</SelectItem>
              <SelectItem value="Events & Markets">Events & Markets</SelectItem>
              <SelectItem value="News">News</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="excerpt">Excerpt</Label>
        <Textarea
          id="excerpt"
          value={formData.excerpt}
          onChange={(e) => handleFormChange('excerpt', e.target.value)}
          placeholder="Brief description of the article"
          rows={2}
        />
      </div>

      <div>
        <Label htmlFor="body">Content</Label>
        <Textarea
          id="body"
          value={formData.body}
          onChange={(e) => handleFormChange('body', e.target.value)}
          placeholder="Article content (Markdown supported)"
          rows={10}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="image">Image URL</Label>
          <Input
            id="image"
            value={formData.image}
            onChange={(e) => handleFormChange('image', e.target.value)}
            placeholder="https://example.com/image.jpg"
          />
        </div>
        <div>
          <Label htmlFor="source_url">Source URL</Label>
          <Input
            id="source_url"
            value={formData.source_url}
            onChange={(e) => handleFormChange('source_url', e.target.value)}
            placeholder="https://source.com/article"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="tags">Tags (comma-separated)</Label>
        <Input
          id="tags"
          value={formData.tags.join(', ')}
          onChange={(e) => handleTagsChange(e.target.value)}
          placeholder="thrifting, dallas, vintage"
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={() => {
          setShowCreateDialog(false);
          setEditingArticle(null);
          resetForm();
        }}>
          Cancel
        </Button>
        <Button onClick={editingArticle ? handleUpdate : handleCreate}>
          {editingArticle ? 'Update' : 'Create'} Article
        </Button>
      </div>
    </div>
  );

  if (loading) {
    return <div>Loading articles...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Articles</h2>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Article
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Article</DialogTitle>
            </DialogHeader>
            <ArticleForm />
          </DialogContent>
        </Dialog>
      </div>

      {editingArticle && (
        <Card>
          <CardHeader>
            <CardTitle>Edit Article: {editingArticle.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <ArticleForm />
          </CardContent>
        </Card>
      )}

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Published</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {articles.map((article) => (
              <TableRow key={article.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{article.title}</div>
                    <div className="text-sm text-gray-500">{article.slug}</div>
                  </div>
                </TableCell>
                <TableCell>{article.author}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{article.category}</Badge>
                </TableCell>
                <TableCell>
                  {new Date(article.published_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    {article.source_url && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(article.source_url!, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => startEdit(article)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(article.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {articles.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No articles found. Create your first article to get started.
        </div>
      )}
    </div>
  );
}
