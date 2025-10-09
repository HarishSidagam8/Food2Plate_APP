import { useState, useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { FoodCard } from '@/components/FoodCard';
import { Plus, User } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useNavigate } from 'react-router-dom';
import { ProfileForm } from '@/components/ProfileForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FoodQualityAnalyzer } from '@/components/FoodQualityAnalyzer';
import { LocationPicker } from '@/components/LocationPicker';

export default function DonorDashboard() {
  const { profile, loading } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    food_type: '',
    quantity: '',
    description: '',
    pickup_location: '',
    available_until: '',
    image_url: '',
    latitude: null as number | null,
    longitude: null as number | null
  });
  const [uploading, setUploading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [qualityAnalysis, setQualityAnalysis] = useState<any>(null);

  useEffect(() => {
    if (!loading && (!profile || profile.role !== 'donor')) {
      navigate('/auth');
    }
  }, [profile, loading, navigate]);

  useEffect(() => {
    if (profile) {
      fetchPosts();
    }
  }, [profile]);

  const fetchPosts = async () => {
    if (!profile) return;
    
    // Expire old posts first
    await (supabase as any).rpc('expire_old_posts');
    
    // Fetch fresh profile data to get updated ratings
    const { data: freshProfile } = await (supabase as any)
      .from('profiles')
      .select('rating, total_ratings')
      .eq('id', profile.id)
      .single();
    
    const { data, error } = await (supabase as any)
      .from('food_posts')
      .select('*')
      .eq('donor_id', profile.id)
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to load your posts');
    } else {
      setPosts(data || []);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    setUploading(true);
    setImageFile(file);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.id}/${Math.random()}.${fileExt}`;
      
      const { error: uploadError, data } = await supabase.storage
        .from('food-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('food-images')
        .getPublicUrl(fileName);

      setFormData({ ...formData, image_url: publicUrl });
      toast.success('Image uploaded successfully!');
    } catch (error) {
      toast.error('Failed to upload image');
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    // AI analysis is optional. If available, we'll attach it to the post.

    const { error } = await (supabase as any).from('food_posts').insert({
      donor_id: profile.id,
      food_type: formData.food_type,
      quantity: formData.quantity,
      description: formData.description,
      pickup_location: formData.pickup_location,
      available_until: formData.available_until,
      image_url: formData.image_url || null,
      status: 'available',
      latitude: formData.latitude,
      longitude: formData.longitude,
      quality_status: qualityAnalysis?.quality ?? null,
      quality_confidence: qualityAnalysis?.confidence ?? null,
      shelf_life_hours: qualityAnalysis?.shelfLifeHours ?? null,
      quality_reasoning: qualityAnalysis?.reasoning ?? null
    });

    if (error) {
      toast.error('Failed to create post');
      console.error('Post creation error:', error);
    } else {
      toast.success('Food post created! 📢', {
        description: 'Your donation is now visible to receivers.',
        duration: 5000,
      });
      setFormData({
        food_type: '',
        quantity: '',
        description: '',
        pickup_location: '',
        available_until: '',
        image_url: '',
        latitude: null,
        longitude: null
      });
      setImageFile(null);
      setQualityAnalysis(null);
      setShowForm(false);
      fetchPosts();
    }
  };

  const handleDelete = async (id: string) => {
    const post = posts.find(p => p.id === id);
    const { error } = await (supabase as any)
      .from('food_posts')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to delete post');
    } else {
      toast.success(`${post?.food_type || 'Post'} deleted`, {
        description: 'The food post has been removed.',
      });
      fetchPosts();
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Donor Dashboard</h1>
          <p className="text-muted-foreground">Manage your food donations and profile</p>
        </div>

        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger value="posts">Food Posts</TabsTrigger>
            <TabsTrigger value="profile">
              <User className="h-4 w-4 mr-2" />
              Profile
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts">
            <div className="flex justify-end mb-8">
          <Dialog open={showForm} onOpenChange={setShowForm}>
            <DialogTrigger asChild>
              <Button size="lg">
                <Plus className="h-5 w-5 mr-2" />
                Post Surplus Food
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Post Surplus Food</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="food_type">Food Type</Label>
                  <Input
                    id="food_type"
                    value={formData.food_type}
                    onChange={(e) => setFormData({ ...formData, food_type: e.target.value })}
                    placeholder="e.g., Fresh vegetables, Cooked meals"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    placeholder="e.g., 5 kg, 10 servings"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Additional details about the food"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <LocationPicker
                    onLocationSelect={(location) => {
                      setFormData({
                        ...formData,
                        pickup_location: location.address,
                        latitude: location.lat,
                        longitude: location.lng
                      });
                    }}
                    initialLocation={
                      formData.latitude && formData.longitude
                        ? { lat: formData.latitude, lng: formData.longitude }
                        : undefined
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="available_until">Available Until</Label>
                  <Input
                    id="available_until"
                    type="datetime-local"
                    value={formData.available_until}
                    onChange={(e) => setFormData({ ...formData, available_until: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="image">Food Image (Required for AI Quality Check)</Label>
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    required
                  />
                  {uploading && <p className="text-sm text-muted-foreground">Uploading...</p>}
                  {imageFile && !uploading && (
                    <p className="text-sm text-muted-foreground">✓ {imageFile.name}</p>
                  )}
                </div>
                
                {formData.image_url && (
                  <div className="space-y-2">
                    <FoodQualityAnalyzer 
                      preloadedImageUrl={formData.image_url}
                      onAnalysisComplete={setQualityAnalysis}
                    />
                    {qualityAnalysis && (
                      <p className="text-sm text-green-600">✓ Quality analysis completed</p>
                    )}
                  </div>
                )}
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={uploading}
                >
                  Post Food
                </Button>
              </form>
            </DialogContent>
          </Dialog>
            </div>

            {profile && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Your Impact</CardTitle>
              <CardDescription>Keep making a difference!</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-secondary/50 rounded-lg">
                  <div className="text-3xl font-bold text-primary">{posts.length}</div>
                  <div className="text-sm text-muted-foreground">Total Posts</div>
                </div>
                <div className="text-center p-4 bg-secondary/50 rounded-lg">
                  <div className="text-3xl font-bold text-primary">
                    {posts.filter(p => p.status === 'available').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Active Posts</div>
                </div>
                <div className="text-center p-4 bg-secondary/50 rounded-lg">
                  <div className="text-3xl font-bold text-accent">
                    {(profile.rating || 0).toFixed(1)} ⭐
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Rating ({profile.total_ratings || 0} reviews)
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
            )}

            <div>
              <h2 className="text-2xl font-bold mb-4">Your Posts</h2>
              {posts.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">No posts yet. Create your first post to get started!</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {posts.map((post) => (
                    <FoodCard
                      key={post.id}
                      {...post}
                      actionType="manage"
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="profile">
            <ProfileForm />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
