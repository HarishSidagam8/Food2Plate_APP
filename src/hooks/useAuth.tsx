import { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

type Profile = {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  role: "donor" | "receiver";
  phone?: string;
  address?: string;
  rating: number;
  total_ratings: number;
};

type AuthContextType = {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // ✅ Single unified session loader
  useEffect(() => {
    const loadSession = async () => {
      setLoading(true);
      const { data } = await supabase.auth.getSession();
      const currentSession = data.session;
      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      if (currentSession?.user) {
        const { data: profileData } = await (supabase as any)
          .from("profiles")
          .select("*")
          .eq("user_id", currentSession.user.id)
          .maybeSingle();
        setProfile(profileData);
      } else {
        setProfile(null);
      }
      setLoading(false);
    };

    // 🔄 Listen for any auth state changes (sign-in, sign-out)
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          const { data: profileData } = await (supabase as any)
            .from("profiles")
            .select("*")
            .eq("user_id", session.user.id)
            .maybeSingle();
          setProfile(profileData);

          // Redirect to correct dashboard only once
          if (event === "SIGNED_IN") {
            if (profileData?.role === "donor") navigate("/donor-dashboard");
            else if (profileData?.role === "receiver")
              navigate("/receiver-dashboard");
          }
        } else {
          setProfile(null);
          if (event === "SIGNED_OUT") navigate("/auth");
        }
      }
    );

    loadSession();

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [navigate]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    navigate("/auth");
  };

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, signOut }}>
      {/* ✅ Block render until session is restored */}
      {loading ? (
        <div className="flex items-center justify-center h-screen text-lg font-semibold">
          Loading your account...
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
