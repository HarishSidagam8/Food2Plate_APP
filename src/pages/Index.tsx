import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Leaf, Users, Heart, TrendingUp, ArrowRight, MapPin, Clock, CheckCircle, Globe, Sparkles } from 'lucide-react';
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
        <div className="absolute inset-0 bg-grid-white/10 bg-[size:20px_20px]" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-6 animate-fade-in">
              <div className="relative">
                <img src={logo} alt="Food2Plate Logo" className="h-24 w-24 animate-scale-in" />
                <div className="absolute -inset-2 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full blur-xl animate-pulse" />
              </div>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-fade-in [animation-delay:200ms]">
              Food2Plate
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-4 max-w-2xl mx-auto animate-fade-in [animation-delay:400ms]">
              Connect surplus food with those who need it. Reduce waste, feed communities, and save the planet—one meal at a time.
            </p>
            <div className="flex items-center justify-center gap-6 mb-8 text-sm text-muted-foreground animate-fade-in [animation-delay:600ms]">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span>100% Free</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-primary" />
                <span>Community Driven</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span>Real-Time Updates</span>
              </div>
            </div>
            <div className="flex gap-4 justify-center flex-wrap animate-fade-in [animation-delay:800ms]">
              <Link to={user && profile ? (profile.role === 'donor' ? '/donor-dashboard' : '/receiver-dashboard') : '/auth'}>
                <Button size="lg" className="text-lg px-8 hover-scale">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/impact">
                <Button size="lg" variant="outline" className="text-lg px-8 hover-scale">
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
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-muted-foreground">Simple steps to make a big difference</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="text-center hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/50 animate-fade-in [animation-delay:100ms] hover-scale">
              <CardHeader>
                <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center transition-transform duration-300 hover:scale-110">
                  <Leaf className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl">1. Donors Post Food</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-muted-foreground">
                  Restaurants, cafes, households, and businesses can donate surplus food instead of throwing it away.
                </p>
                <div className="space-y-2 text-sm text-left">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Set pickup location & time</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Clock className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Specify food quality & expiry</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>AI-powered quality verification</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-all duration-300 border-2 hover:border-accent/50 animate-fade-in [animation-delay:200ms] hover-scale">
              <CardHeader>
                <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-accent/10 flex items-center justify-center transition-transform duration-300 hover:scale-110">
                  <Users className="h-8 w-8 text-accent" />
                </div>
                <CardTitle className="text-xl">2. Receivers Browse</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-muted-foreground">
                  Individuals, charities, and community kitchens can browse and claim available food donations nearby.
                </p>
                <div className="space-y-2 text-sm text-left">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                    <span>Find food near you with maps</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Clock className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                    <span>Real-time availability updates</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                    <span>Reserve instantly with one click</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/50 animate-fade-in [animation-delay:300ms] hover-scale">
              <CardHeader>
                <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center transition-transform duration-300 hover:scale-110">
                  <Heart className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl">3. Make Impact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-muted-foreground">
                  Every successful connection creates positive change for people and the planet.
                </p>
                <div className="space-y-2 text-sm text-left">
                  <div className="flex items-start gap-2">
                    <TrendingUp className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Track your environmental impact</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Heart className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>See lives helped & meals saved</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Sparkles className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Earn impact certificates</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12 animate-fade-in">
              <h2 className="text-4xl font-bold mb-4">Why It Matters</h2>
              <p className="text-xl text-muted-foreground">The global food waste crisis needs immediate action</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <div className="text-center p-8 bg-destructive/10 rounded-lg border border-destructive/20 hover:shadow-lg transition-all duration-300 hover-scale animate-fade-in [animation-delay:100ms]">
                <div className="text-5xl font-bold text-destructive mb-3">1/3</div>
                <p className="text-muted-foreground font-medium">of all food produced globally is wasted annually</p>
                <p className="text-sm text-muted-foreground mt-2">That's 1.3 billion tons per year</p>
              </div>
              <div className="text-center p-8 bg-primary/10 rounded-lg border border-primary/20 hover:shadow-lg transition-all duration-300 hover-scale animate-fade-in [animation-delay:200ms]">
                <div className="text-5xl font-bold text-primary mb-3">8-10%</div>
                <p className="text-muted-foreground font-medium">of global greenhouse gas emissions come from food waste</p>
                <p className="text-sm text-muted-foreground mt-2">More than aviation industry</p>
              </div>
              <div className="text-center p-8 bg-accent/10 rounded-lg border border-accent/20 hover:shadow-lg transition-all duration-300 hover-scale animate-fade-in [animation-delay:300ms]">
                <div className="text-5xl font-bold text-accent mb-3">828M</div>
                <p className="text-muted-foreground font-medium">people face hunger worldwide daily</p>
                <p className="text-sm text-muted-foreground mt-2">Yet enough food exists for all</p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 rounded-xl p-8 border border-primary/10 animate-fade-in [animation-delay:400ms]">
              <h3 className="text-2xl font-bold text-center mb-6">Our Solution: Food2Plate</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Leaf className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Environmental Impact</h4>
                    <p className="text-sm text-muted-foreground">Reduce methane emissions and carbon footprint by redistributing food before it becomes waste</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                    <Users className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Social Impact</h4>
                    <p className="text-sm text-muted-foreground">Feed communities, support food security, and build stronger neighborhoods through sharing</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Economic Impact</h4>
                    <p className="text-sm text-muted-foreground">Save money for businesses and individuals while creating value from surplus</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                    <Globe className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Community Building</h4>
                    <p className="text-sm text-muted-foreground">Connect neighbors, build trust, and create a culture of generosity and care</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 bg-gradient-to-r from-primary to-accent overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/5 bg-[size:20px_20px]" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center text-primary-foreground animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Join the Movement Today</h2>
            <p className="text-xl mb-8 opacity-90">
              Whether you want to donate surplus food or receive donations, Food2Plate makes it simple to make a difference.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <div className="flex items-center gap-2 text-sm justify-center">
                <CheckCircle className="h-5 w-5" />
                <span>No Hidden Fees</span>
              </div>
              <div className="flex items-center gap-2 text-sm justify-center">
                <CheckCircle className="h-5 w-5" />
                <span>Instant Verification</span>
              </div>
              <div className="flex items-center gap-2 text-sm justify-center">
                <CheckCircle className="h-5 w-5" />
                <span>Track Your Impact</span>
              </div>
            </div>
            <Link to="/auth">
              <Button size="lg" variant="secondary" className="text-lg px-10 hover-scale shadow-xl">
                Sign Up Now - It's Free
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
