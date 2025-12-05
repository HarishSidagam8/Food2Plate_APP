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
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    handleCallback();
  }, []);

  const handleCallback = async () => {
    try {
      // Wait for auth session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) throw sessionError;
      
      if (!session?.user) {
        navigate('/auth');
        return;
      }

      setUserId(session.user.id);
      
      // Wait a moment for the database trigger to create the profile
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if profile exists with retries
      let profile = null;
      for (let attempt = 0; attempt < 5; attempt++) {
        const { data, error } = await supabase
          .from('profiles')
          .select('role, full_name')
          .eq('user_id', session.user.id)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          console.error('Profile fetch error:', error);
          throw error;
        }

        if (data) {
          profile = data;
          break;
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 800));
      }

      if (!profile) {
        // Profile wasn't created - manual insert needed
        console.log('No profile found, showing role selection');
        setNeedsRole(true);
      } else if (!profile.role) {
        // Profile exists but no role set
        setNeedsRole(true);
      } else {
        // Profile exists with role - redirect to dashboard
        toast.success(`Welcome back, ${profile.full_name || 'User'}!`);
        navigate(profile.role === 'donor' ? '/donor-dashboard' : '/receiver-dashboard');
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
      if (!userId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('No user found');
        setUserId(user.id);
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingProfile) {
        // Update existing profile
        const { error } = await supabase
          .from('profiles')
          .update({ 
            role: selectedRole,
            full_name: user.user_metadata.full_name || user.email?.split('@')[0] || 'User'
          })
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        // Insert new profile
        const { error } = await supabase
          .from('profiles')
          .insert({
            user_id: user.id,
            full_name: user.user_metadata.full_name || user.email?.split('@')[0] || 'User',
            email: user.email || '',
            role: selectedRole
          });

        if (error) throw error;
      }

      toast.success('Profile setup complete!');
      navigate(selectedRole === 'donor' ? '/donor-dashboard' : '/receiver-dashboard');
    } catch (error: any) {
      console.error('Role selection error:', error);
      toast.error(error.message || 'Failed to setup profile');
      setLoading(false);
    }
  };

  if (!needsRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Completing sign in...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-green-50 to-blue-50">
      <Dialog open={needsRole} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Welcome to Food2Plate! 🍽️</DialogTitle>
            <DialogDescription>
              Please select how you'd like to use Food2Plate
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Label>I want to</Label>
            <RadioGroup value={selectedRole} onValueChange={(value) => setSelectedRole(value as 'donor' | 'receiver')}>
              <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-gray-50 cursor-pointer">
                <RadioGroupItem value="donor" id="donor" />
                <Label htmlFor="donor" className="font-normal cursor-pointer flex-1">
                  <div className="font-medium">Donate surplus food</div>
                  <div className="text-sm text-gray-500">Share food with those in need</div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-gray-50 cursor-pointer">
                <RadioGroupItem value="receiver" id="receiver" />
                <Label htmlFor="receiver" className="font-normal cursor-pointer flex-1">
                  <div className="font-medium">Receive food donations</div>
                  <div className="text-sm text-gray-500">Find available food near you</div>
                </Label>
              </div>
            </RadioGroup>
          </div>
          <Button onClick={handleRoleSelection} disabled={loading} className="w-full">
            {loading ? 'Setting up your profile...' : 'Continue'}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
