import { useState, useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Leaf, Users, Award, TrendingUp, Trophy, Sparkles } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { ImpactCertificate } from '@/components/ImpactCertificate';

type LeaderboardEntry = {
  id: string;
  full_name: string;
  green_points: number;
  badge_level: string;
  total_food_saved_kg: number;
  total_co2_saved_kg: number;
  profile_image_url?: string;
};

type UserReward = {
  green_points: number;
  badge_level: string;
  total_food_saved_kg: number;
  total_co2_saved_kg: number;
};

const badgeColors = {
  Bronze: 'bg-orange-500',
  Silver: 'bg-gray-400',
  Gold: 'bg-yellow-500',
  Platinum: 'bg-purple-500',
};

const badgeThresholds = {
  Bronze: { min: 0, max: 99 },
  Silver: { min: 100, max: 299 },
  Gold: { min: 300, max: 699 },
  Platinum: { min: 700, max: Infinity },
};

export default function Impact() {
  const { profile } = useAuth();
  const [stats, setStats] = useState({
    totalDonations: 0,
    totalReservations: 0,
    co2Saved: 0,
    mealsProvided: 0,
    activeUsers: 0
  });
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userReward, setUserReward] = useState<UserReward | null>(null);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);

  useEffect(() => {
    fetchStats();
    fetchLeaderboard();
    if (profile?.id) {
      fetchUserReward();
    }
  }, [profile?.id]);

  const fetchStats = async () => {
    try {
      const { data: posts } = await (supabase as any)
        .from('food_posts')
        .select('*');

      const { data: reservations } = await (supabase as any)
        .from('reservations')
        .select('*');

      const { data: profiles } = await (supabase as any)
        .from('profiles')
        .select('id');

      const totalDonations = posts?.length || 0;
      const totalReservations = reservations?.length || 0;
      const mealsProvided = totalReservations * 3;
      const co2Saved = mealsProvided * 2.5;
      const activeUsers = profiles?.length || 0;

      setStats({
        totalDonations,
        totalReservations,
        co2Saved: Math.round(co2Saved),
        mealsProvided,
        activeUsers
      });

      // Generate mock monthly data for charts
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
      const mockData = months.map((month, idx) => ({
        month,
        co2Saved: Math.round(co2Saved * (0.1 + idx * 0.15)),
        foodSaved: Math.round(mealsProvided * (0.1 + idx * 0.15))
      }));
      setMonthlyData(mockData);
    } catch (error) {
      toast.error('Failed to load impact statistics');
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const { data } = await (supabase as any)
        .from('rewards')
        .select(`
          *,
          profiles!rewards_profile_id_fkey (
            full_name,
            profile_image_url
          )
        `)
        .order('green_points', { ascending: false })
        .limit(10);

      const formattedData = data?.map((entry: any) => ({
        id: entry.id,
        full_name: entry.profiles.full_name,
        green_points: entry.green_points,
        badge_level: entry.badge_level,
        total_food_saved_kg: entry.total_food_saved_kg,
        total_co2_saved_kg: entry.total_co2_saved_kg,
        profile_image_url: entry.profiles.profile_image_url,
      })) || [];

      setLeaderboard(formattedData);
    } catch (error) {
      toast.error('Failed to load leaderboard');
    }
  };

  const fetchUserReward = async () => {
    if (!profile?.id) return;

    try {
      const { data } = await (supabase as any)
        .from('rewards')
        .select('*')
        .eq('profile_id', profile.id)
        .maybeSingle();

      if (data) {
        setUserReward({
          green_points: data.green_points,
          badge_level: data.badge_level,
          total_food_saved_kg: data.total_food_saved_kg,
          total_co2_saved_kg: data.total_co2_saved_kg,
        });
      }
    } catch (error) {
      console.error('Failed to load user rewards:', error);
    }
  };

  const getProgressToNextBadge = (reward: UserReward) => {
    const points = reward.green_points;
    
    if (points < 100) return (points / 100) * 100;
    if (points < 300) return ((points - 100) / 200) * 100;
    if (points < 700) return ((points - 300) / 400) * 100;
    return 100;
  };

  const getNextBadge = (reward: UserReward) => {
    const points = reward.green_points;
    
    if (points < 100) return 'Silver';
    if (points < 300) return 'Gold';
    if (points < 700) return 'Platinum';
    return 'Max Level';
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Community Impact</h1>
          <p className="text-muted-foreground">Together we're making a real difference</p>
        </div>

        {userReward && (
          <>
            <Card className="mb-8 border-2 border-primary/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl">Your Impact Journey</CardTitle>
                    <CardDescription>Track your contribution to the community</CardDescription>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={`text-lg px-4 py-2 ${badgeColors[userReward.badge_level as keyof typeof badgeColors]} text-white`}
                  >
                    {userReward.badge_level}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-primary/5 rounded-lg">
                    <Award className="h-8 w-8 text-primary mx-auto mb-2" />
                    <div className="text-3xl font-bold text-primary">{userReward.green_points}</div>
                    <div className="text-sm text-muted-foreground">Green Points</div>
                  </div>
                  <div className="text-center p-4 bg-accent/10 rounded-lg">
                    <Leaf className="h-8 w-8 text-accent mx-auto mb-2" />
                    <div className="text-3xl font-bold text-accent">{userReward.total_food_saved_kg.toFixed(1)} kg</div>
                    <div className="text-sm text-muted-foreground">Food Saved</div>
                  </div>
                  <div className="text-center p-4 bg-secondary rounded-lg">
                    <TrendingUp className="h-8 w-8 text-primary mx-auto mb-2" />
                    <div className="text-3xl font-bold text-primary">{userReward.total_co2_saved_kg.toFixed(1)} kg</div>
                    <div className="text-sm text-muted-foreground">CO₂ Saved</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Progress to {getNextBadge(userReward)}</span>
                    <span className="text-muted-foreground">
                      {userReward.green_points} / {
                        userReward.badge_level === 'Bronze' ? 100 :
                        userReward.badge_level === 'Silver' ? 300 :
                        userReward.badge_level === 'Gold' ? 700 : 700
                      } points
                    </span>
                  </div>
                  <Progress value={getProgressToNextBadge(userReward)} className="h-3" />
                </div>
              </CardContent>
            </Card>

            <div className="mb-8">
              <ImpactCertificate
                userName={profile?.full_name || 'Food2Plate User'}
                greenPoints={userReward.green_points}
                foodSavedKg={userReward.total_food_saved_kg}
                co2SavedKg={userReward.total_co2_saved_kg}
                badgeLevel={userReward.badge_level}
              />
            </div>
          </>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Impact Overview</CardTitle>
              <CardDescription>Community statistics at a glance</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Donations', value: stats.totalDonations, fill: 'hsl(var(--primary))' },
                      { name: 'Reservations', value: stats.activeUsers, fill: 'hsl(var(--accent))' }
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={100}
                    dataKey="value"
                  >
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Environmental Impact</CardTitle>
              <CardDescription>CO₂ savings over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="co2Saved" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    name="CO₂ Saved (kg)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Donations</CardTitle>
              <Leaf className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalDonations}</div>
              <p className="text-xs text-muted-foreground">Food posts shared</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Meals Provided</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.mealsProvided}</div>
              <p className="text-xs text-muted-foreground">Approximate servings</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">CO₂ Saved</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.co2Saved.toFixed(1)} kg</div>
              <p className="text-xs text-muted-foreground">Environmental impact</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeUsers}</div>
              <p className="text-xs text-muted-foreground">Community members</p>
            </CardContent>
          </Card>
        </div>

        {/* Leaderboard */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              <CardTitle>Community Leaderboard</CardTitle>
            </div>
            <CardDescription>Top 10 contributors making the biggest impact</CardDescription>
          </CardHeader>
          <CardContent>
            {leaderboard.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No contributors yet</p>
            ) : (
              <div className="space-y-3">
                {leaderboard.map((entry, index) => (
                  <div
                    key={entry.id}
                    className={`flex items-center justify-between p-4 rounded-lg transition-colors ${
                      index < 3 ? 'bg-primary/10 border border-primary/20' : 'bg-secondary/50 hover:bg-secondary/70'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`text-2xl font-bold ${index === 0 ? 'text-yellow-500' : index === 1 ? 'text-gray-400' : index === 2 ? 'text-orange-500' : 'text-muted-foreground'}`}>
                        #{index + 1}
                      </div>
                      <div>
                        <div className="font-semibold flex items-center gap-2">
                          {entry.full_name}
                          <Badge className={`${badgeColors[entry.badge_level as keyof typeof badgeColors]} text-white text-xs`}>
                            {entry.badge_level}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {entry.green_points} points · {entry.total_food_saved_kg.toFixed(1)} kg saved · {entry.total_co2_saved_kg.toFixed(1)} kg CO₂
                        </div>
                      </div>
                    </div>
                    {index === 0 && <Trophy className="h-8 w-8 text-yellow-500" />}
                    {index === 1 && <Trophy className="h-7 w-7 text-gray-400" />}
                    {index === 2 && <Trophy className="h-6 w-6 text-orange-500" />}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
