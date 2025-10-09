import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Leaf, Users, Heart, TrendingUp, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import logo from '@/assets/food2plate-logo.png';

const Index = () => {
  const { user, profile } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/10 py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <img src={logo} alt="Food2Plate Logo" className="h-24 w-24 animate-pulse" />
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Food2Plate
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Connect surplus food with those who need it. Reduce waste, feed communities, and save the planet—one meal at a time.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link to={user && profile ? (profile.role === 'donor' ? '/donor-dashboard' : '/receiver-dashboard') : '/auth'}>
                <Button size="lg" className="text-lg px-8">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/impact">
                <Button size="lg" variant="outline" className="text-lg px-8">
                  View Impact
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-card/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-muted-foreground">Simple steps to make a big difference</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="text-center hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/50">
              <CardHeader>
                <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Leaf className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>Donors Post Food</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Have surplus food? Create a post with details about what's available, quantity, and pickup location.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-all duration-300 border-2 hover:border-accent/50">
              <CardHeader>
                <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-accent/10 flex items-center justify-center">
                  <Users className="h-8 w-8 text-accent" />
                </div>
                <CardTitle>Receivers Browse</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Need food? Browse available donations in your area and reserve what you need instantly.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/50">
              <CardHeader>
                <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Heart className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>Make Impact</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Every connection reduces waste and helps someone in need. Track your collective impact on our dashboard.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Why It Matters</h2>
              <p className="text-xl text-muted-foreground">The impact of food waste on our planet</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-6 bg-destructive/10 rounded-lg border border-destructive/20">
                <div className="text-4xl font-bold text-destructive mb-2">1/3</div>
                <p className="text-muted-foreground">of all food produced globally is wasted</p>
              </div>
              <div className="text-center p-6 bg-primary/10 rounded-lg border border-primary/20">
                <div className="text-4xl font-bold text-primary mb-2">8%</div>
                <p className="text-muted-foreground">of global greenhouse gas emissions come from food waste</p>
              </div>
              <div className="text-center p-6 bg-accent/10 rounded-lg border border-accent/20">
                <div className="text-4xl font-bold text-accent mb-2">828M</div>
                <p className="text-muted-foreground">people face hunger worldwide</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-accent">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center text-primary-foreground">
            <h2 className="text-4xl font-bold mb-6">Join the Movement Today</h2>
            <p className="text-xl mb-8 opacity-90">
              Whether you want to donate surplus food or receive donations, Food2Plate makes it simple to make a difference.
            </p>
            <Link to="/auth">
              <Button size="lg" variant="secondary" className="text-lg px-8">
                Sign Up Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2025 Food2Plate. Together we reduce waste and feed communities.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
