import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [needsRole, setNeedsRole] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'donor' | 'receiver'>('receiver');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    handleCallback();
  }, []);

  const handleCallback = async () => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) throw sessionError;
      
      if (session?.user) {
        // Check if profile exists
        const { data: profile, error: profileError } = await (supabase as any)
          .from('profiles')
          .select('role')
          .eq('user_id', session.user.id)
          .maybeSingle();

        if (profileError && profileError.code !== 'PGRST116') {
          throw profileError;
        }

        if (!profile) {
          // New Google user - needs to select role
          setNeedsRole(true);
        } else {
          // Existing user - redirect to dashboard
          toast.success('Welcome back!');
          navigate(profile.role === 'donor' ? '/donor-dashboard' : '/receiver-dashboard');
        }
      } else {
        navigate('/auth');
      }
    } catch (error: any) {
      console.error('Auth callback error:', error);
      toast.error(error.message || 'Authentication failed');
      navigate('/auth');
    }
  };

  const handleRoleSelection = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('No user found');

      const { error } = await (supabase as any)
        .from('profiles')
        .insert({
          user_id: user.id,
          full_name: user.user_metadata.full_name || user.email?.split('@')[0] || 'User',
          email: user.email || '',
          role: selectedRole
        });

      if (error) throw error;

      toast.success('Account created successfully!');
      navigate(selectedRole === 'donor' ? '/donor-dashboard' : '/receiver-dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create profile');
      setLoading(false);
    }
  };

  if (!needsRole) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Completing sign in...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Dialog open={needsRole} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Welcome to Food2Plate!</DialogTitle>
            <DialogDescription>
              Please select how you'd like to use Food2Plate
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Label>I want to</Label>
            <RadioGroup value={selectedRole} onValueChange={(value) => setSelectedRole(value as 'donor' | 'receiver')}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="donor" id="donor" />
                <Label htmlFor="donor" className="font-normal cursor-pointer">
                  Donate surplus food
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="receiver" id="receiver" />
                <Label htmlFor="receiver" className="font-normal cursor-pointer">
                  Receive food donations
                </Label>
              </div>
            </RadioGroup>
          </div>
          <Button onClick={handleRoleSelection} disabled={loading} className="w-full">
            {loading ? 'Creating Profile...' : 'Continue'}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
