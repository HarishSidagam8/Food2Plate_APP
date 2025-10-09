import { useState, useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { FoodCard } from '@/components/FoodCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Star, MapIcon, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FoodMap } from '@/components/FoodMap';
import { ProfileForm } from '@/components/ProfileForm';
import { FoodQualityAnalyzer, type AnalysisResult } from '@/components/FoodQualityAnalyzer';

export default function ReceiverDashboard() {
  const { profile, loading } = useAuth();
  const navigate = useNavigate();
  const [availableFood, setAvailableFood] = useState<any[]>([]);
  const [reservations, setReservations] = useState<any[]>([]);
  const [showRatingDialog, setShowRatingDialog] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<any>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');

  useEffect(() => {
    if (!loading && (!profile || profile.role !== 'receiver')) {
      navigate('/auth');
    }
  }, [profile, loading, navigate]);

  useEffect(() => {
    if (profile) {
      fetchAvailableFood();
      fetchReservations();
    }
  }, [profile]);

  const fetchAvailableFood = async () => {
    // Expire old posts first
    await (supabase as any).rpc('expire_old_posts');
    
    const { data: posts, error } = await (supabase as any)
      .from('food_posts')
      .select('*')
      .eq('status', 'available')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to load available food');
      return;
    }

    // Fetch public donor profiles using secure RPC function
    const postsWithDonors = await Promise.all(
      (posts || []).map(async (post) => {
        const { data: donorProfile } = await (supabase as any)
          .rpc('get_donor_public_profile', { donor_profile_id: post.donor_id });
        
        return {
          ...post,
          donor: donorProfile?.[0] || null
        };
      })
    );

    setAvailableFood(postsWithDonors);
  };

  const fetchReservations = async () => {
    if (!profile) return;

    const { data: reservations, error } = await (supabase as any)
      .from('reservations')
      .select('*, food_posts (*)')
      .eq('receiver_id', profile.id)
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to load reservations');
      return;
    }

    // Fetch public donor profiles for each food post using secure RPC function
    const reservationsWithDonors = await Promise.all(
      (reservations || []).map(async (reservation) => {
        const { data: donorProfile } = await (supabase as any)
          .rpc('get_donor_public_profile', { donor_profile_id: reservation.food_posts.donor_id });
        
        return {
          ...reservation,
          food_posts: {
            ...reservation.food_posts,
            donor: donorProfile?.[0] || null
          }
        };
      })
    );

    setReservations(reservationsWithDonors);
  };

  const handleReserve = async (foodPostId: string, analysis?: AnalysisResult | null) => {
    if (!profile) return;

    const foodPost = availableFood.find(f => f.id === foodPostId);
    const foodName = foodPost?.food_type || 'Food';
    const notes = analysis
      ? `AI Quality: ${analysis.quality} (${analysis.confidence}%); Shelf-life: ${analysis.shelfLifeHours}h; ${analysis.reasoning}`
      : null;
    const { error } = await (supabase as any).from('reservations').insert({
      food_post_id: foodPostId,
      receiver_id: profile.id,
      status: 'pending',
      notes
    });

    if (error) {
      if (error.code === '23505') {
        toast.error('You have already reserved this food');
      } else {
        toast.error('Failed to reserve food');
      }
    } else {
      const { error: updateError } = await (supabase as any)
        .from('food_posts')
        .update({ status: 'reserved' })
        .eq('id', foodPostId);

      if (updateError) {
        toast.error('Failed to update post status');
      } else {
        toast.success(`${foodName} reserved successfully! 🎉`, {
          description: 'Check your reservations to see pickup details.',
          duration: 5000,
        });
        fetchAvailableFood();
        fetchReservations();
      }
    }
  };

  const handleRateClick = (reservation: any) => {
    setSelectedReservation(reservation);
    setShowRatingDialog(true);
  };

  const handleSubmitRating = async () => {
    if (!selectedReservation || !profile || rating === 0) return;

    console.log('Submitting rating:', {
      reservation_id: selectedReservation.id,
      donor_id: selectedReservation.food_posts.donor_id,
      receiver_id: profile.id,
      rating
    });

    const { data, error } = await (supabase as any).from('ratings').insert({
      reservation_id: selectedReservation.id,
      donor_id: selectedReservation.food_posts.donor_id,
      receiver_id: profile.id,
      rating,
      comment
    }).select();

    if (error) {
      if (error.code === '23505') {
        toast.error('You have already rated this donation');
      } else {
        toast.error('Failed to submit rating');
        console.error('Rating error:', error);
      }
    } else {
      console.log('Rating inserted successfully:', data);
      toast.success(`Rating submitted! ⭐ ${rating}/5`, {
        description: 'Thank you for your feedback! The donor\'s rating will be updated.',
        duration: 5000,
      });
      setShowRatingDialog(false);
      setRating(0);
      setComment('');
      setSelectedReservation(null);
      fetchReservations();
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
          <h1 className="text-4xl font-bold mb-2">Receiver Dashboard</h1>
          <p className="text-muted-foreground">Find and reserve food donations</p>
        </div>

        <Tabs defaultValue="available" className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger value="available">Available Food</TabsTrigger>
            <TabsTrigger value="reservations">My Reservations</TabsTrigger>
            <TabsTrigger value="profile">
              <User className="h-4 w-4 mr-2" />
              Profile
            </TabsTrigger>
          </TabsList>

          <TabsContent value="available">
            <div className="flex justify-end mb-4 gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                onClick={() => setViewMode('grid')}
              >
                Grid View
              </Button>
              <Button
                variant={viewMode === 'map' ? 'default' : 'outline'}
                onClick={() => setViewMode('map')}
              >
                <MapIcon className="h-4 w-4 mr-2" />
                Map View
              </Button>
            </div>

            {availableFood.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">No available food at the moment. Check back soon!</p>
                </CardContent>
              </Card>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableFood.map((food) => (
                  <FoodCard
                    key={food.id}
                    {...food}
                    actionType="reserve"
                    onReserve={handleReserve}
                  />
                ))}
              </div>
            ) : (
              <FoodMap 
                foodPosts={availableFood} 
                onReserve={handleReserve}
              />
            )}
          </TabsContent>

          <TabsContent value="reservations">
            {reservations.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">You haven't made any reservations yet.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reservations.map((reservation: any) => (
                  <div key={reservation.id} className="space-y-2">
                    <FoodCard
                      {...reservation.food_posts}
                      donor={reservation.food_posts?.donor}
                      showActions={false}
                    />
                    <Button
                      onClick={() => handleRateClick(reservation)}
                      variant="outline"
                      className="w-full"
                    >
                      <Star className="h-4 w-4 mr-2" />
                      Rate Donor
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="profile">
            <ProfileForm />
          </TabsContent>
        </Tabs>

        <Dialog open={showRatingDialog} onOpenChange={setShowRatingDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Rate Your Experience</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Rating</Label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-8 w-8 cursor-pointer transition-colors ${
                        star <= rating
                          ? 'fill-primary text-primary'
                          : 'text-muted-foreground'
                      }`}
                      onClick={() => setRating(star)}
                    />
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="comment">Comment (optional)</Label>
                <Textarea
                  id="comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your experience..."
                  rows={3}
                />
              </div>
              <Button onClick={handleSubmitRating} className="w-full" disabled={rating === 0}>
                Submit Rating
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
