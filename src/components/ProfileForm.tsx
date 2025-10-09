import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { User, Building2 } from 'lucide-react';

export const ProfileForm = () => {
  const { profile } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    address: '',
    is_restaurant: false,
    restaurant_name: '',
    restaurant_description: '',
    profile_image_url: ''
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        address: profile.address || '',
        is_restaurant: (profile as any).is_restaurant || false,
        restaurant_name: (profile as any).restaurant_name || '',
        restaurant_description: (profile as any).restaurant_description || '',
        profile_image_url: (profile as any).profile_image_url || ''
      });
    }
  }, [profile]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.id}/profile.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('food-images')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('food-images')
        .getPublicUrl(fileName);

      setFormData({ ...formData, profile_image_url: publicUrl });
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

    const { error } = await (supabase as any)
      .from('profiles')
      .update({
        full_name: formData.full_name,
        phone: formData.phone,
        address: formData.address,
        is_restaurant: formData.is_restaurant,
        restaurant_name: formData.is_restaurant ? formData.restaurant_name : null,
        restaurant_description: formData.is_restaurant ? formData.restaurant_description : null,
        profile_image_url: formData.profile_image_url || null
      })
      .eq('user_id', profile.user_id);

    if (error) {
      toast.error('Failed to update profile');
      console.error('Profile update error:', error);
    } else {
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Information
            </CardTitle>
            <CardDescription>
              {profile?.role === 'donor' 
                ? 'Manage your donor profile and restaurant details' 
                : 'Manage your receiver profile'}
            </CardDescription>
          </div>
          {!isEditing && (
            <Button onClick={() => setIsEditing(true)} variant="outline">
              Edit Profile
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="profile_image">Profile Image</Label>
            <div className="flex items-center gap-4">
              {formData.profile_image_url && (
                <img 
                  src={formData.profile_image_url} 
                  alt="Profile" 
                  className="h-20 w-20 rounded-full object-cover"
                />
              )}
              <Input
                id="profile_image"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading || !isEditing}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name</Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              disabled={!isEditing}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              disabled
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+1234567890"
              disabled={!isEditing}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Full address"
              disabled={!isEditing}
              required
            />
          </div>

          {profile?.role === 'donor' && (
            <>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    <Label htmlFor="is_restaurant">I am a restaurant owner</Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Enable this if you're donating from a restaurant
                  </p>
                </div>
                <Switch
                  id="is_restaurant"
                  checked={formData.is_restaurant}
                  onCheckedChange={(checked) => 
                    setFormData({ ...formData, is_restaurant: checked })
                  }
                  disabled={!isEditing}
                />
              </div>

              {formData.is_restaurant && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="restaurant_name">Restaurant Name</Label>
                    <Input
                      id="restaurant_name"
                      value={formData.restaurant_name}
                      onChange={(e) => setFormData({ ...formData, restaurant_name: e.target.value })}
                      placeholder="Your restaurant's name"
                      disabled={!isEditing}
                      required={formData.is_restaurant}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="restaurant_description">Restaurant Description</Label>
                    <Textarea
                      id="restaurant_description"
                      value={formData.restaurant_description}
                      onChange={(e) => setFormData({ ...formData, restaurant_description: e.target.value })}
                      placeholder="Brief description of your restaurant"
                      disabled={!isEditing}
                      rows={3}
                    />
                  </div>
                </>
              )}
            </>
          )}

          {isEditing && (
            <div className="flex gap-2">
              <Button 
                type="button" 
                variant="outline" 
                className="flex-1"
                onClick={() => {
                  setIsEditing(false);
                  // Reset form to original profile data
                  if (profile) {
                    setFormData({
                      full_name: profile.full_name || '',
                      email: profile.email || '',
                      phone: profile.phone || '',
                      address: profile.address || '',
                      is_restaurant: (profile as any).is_restaurant || false,
                      restaurant_name: (profile as any).restaurant_name || '',
                      restaurant_description: (profile as any).restaurant_description || '',
                      profile_image_url: (profile as any).profile_image_url || ''
                    });
                  }
                }}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={uploading}>
                Save Changes
              </Button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
};
