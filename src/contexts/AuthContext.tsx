
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Profile {
  id: string;
  user_id: string;
  company_id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: string;
  avatar_url?: string;
}

interface Company {
  id: string;
  name: string;
  slug: string;
  email: string;
  subscription_status: string;
  subscription_tier: string;
  trial_ends_at?: string;
  max_materials: number;
  max_projects: number;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  company: Company | null;
  loading: boolean;
  signUp: (email: string, password: string, companyName: string, firstName?: string, lastName?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchProfile = async (userId: string) => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (profileError || !profileData) {
        console.error('Profile fetch error:', profileError);
        return;
      }

      setProfile(profileData);

      // Fetch company data
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .select('*')
        .eq('id', profileData.company_id)
        .single();

      if (companyError || !companyData) {
        console.error('Company fetch error:', companyError);
        return;
      }

      setCompany(companyData);
    } catch (error) {
      console.error('Error fetching profile/company:', error);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setTimeout(() => {
            fetchProfile(session.user.id);
          }, 0);
        } else {
          setProfile(null);
          setCompany(null);
        }
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, companyName: string, firstName?: string, lastName?: string) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl
        }
      });

      if (error) {
        console.error('Signup error:', error);
        toast({
          title: "Sign up failed",
          description: error.message,
          variant: "destructive"
        });
        return { error };
      }

      if (data.user && !data.user.email_confirmed_at) {
        // User needs to confirm email first
        toast({
          title: "Check your email",
          description: "We've sent you a confirmation link. Please check your email and click the link to activate your account.",
        });
        
        // We'll create the company and profile after email confirmation
        // Store the signup data temporarily (in a real app, you might want to use a more secure method)
        localStorage.setItem('pendingSignup', JSON.stringify({
          userId: data.user.id,
          email,
          firstName,
          lastName,
          companyName
        }));
        
        return { error: null };
      }

      // If email is already confirmed (shouldn't happen in normal flow)
      await createCompanyAndProfile(data.user.id, email, companyName, firstName, lastName);
      return { error: null };

    } catch (error) {
      console.error('Signup error:', error);
      toast({
        title: "Sign up failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
      return { error };
    }
  };

  const createCompanyAndProfile = async (userId: string, email: string, companyName: string, firstName?: string, lastName?: string) => {
    try {
      // Use the service role or admin privileges to create company
      const companySlug = companyName.toLowerCase().replace(/[^a-z0-9]/g, '-');
      
      // Create company using the service role
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .insert([{
          name: companyName,
          slug: companySlug,
          email: email,
          subscription_status: 'trial',
          subscription_tier: 'basic'
        }])
        .select()
        .single();

      if (companyError) {
        console.error('Company creation error:', companyError);
        throw new Error('Failed to create company');
      }

      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{
          user_id: userId,
          company_id: companyData.id,
          email: email,
          first_name: firstName,
          last_name: lastName,
          role: 'admin'
        }]);

      if (profileError) {
        console.error('Profile creation error:', profileError);
        throw new Error('Failed to create profile');
      }

      // Clear pending signup data
      localStorage.removeItem('pendingSignup');
      
      toast({
        title: "Account created successfully",
        description: "Welcome to your manufacturing dashboard!",
      });

    } catch (error) {
      console.error('Error creating company/profile:', error);
      throw error;
    }
  };

  // Check for pending signup completion when user confirms email
  useEffect(() => {
    const handleEmailConfirmation = async () => {
      if (user && user.email_confirmed_at) {
        const pendingSignup = localStorage.getItem('pendingSignup');
        if (pendingSignup) {
          try {
            const signupData = JSON.parse(pendingSignup);
            if (signupData.userId === user.id) {
              await createCompanyAndProfile(
                user.id,
                signupData.email,
                signupData.companyName,
                signupData.firstName,
                signupData.lastName
              );
            }
          } catch (error) {
            console.error('Error completing signup:', error);
            toast({
              title: "Setup incomplete",
              description: "There was an issue setting up your account. Please contact support.",
              variant: "destructive"
            });
          }
        }
      }
    };

    handleEmailConfirmation();
  }, [user]);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('Signin error:', error);
        toast({
          title: "Sign in failed",
          description: error.message,
          variant: "destructive"
        });
        return { error };
      }

      toast({
        title: "Welcome back!",
        description: "You have been signed in successfully.",
      });

      return { error: null };
    } catch (error) {
      console.error('Signin error:', error);
      toast({
        title: "Sign in failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
      return { error };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setProfile(null);
      setCompany(null);
      toast({
        title: "Signed out successfully",
      });
    } catch (error) {
      console.error('Signout error:', error);
    }
  };

  const value = {
    user,
    session,
    profile,
    company,
    loading,
    signUp,
    signIn,
    signOut,
    refreshProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
