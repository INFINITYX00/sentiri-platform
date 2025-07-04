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
  resendConfirmation: (email: string) => Promise<{ error: any }>;
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
      console.log('🔍 Fetching profile for user:', userId);
      
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle(); // Use maybeSingle instead of single to avoid errors when no profile exists

      if (profileError) {
        console.error('❌ Profile fetch error:', profileError);
        if (profileError.code === 'PGRST116') {
          console.log('👤 No profile found, user needs to complete setup');
          return;
        }
        throw profileError;
      }

      if (!profileData) {
        console.log('👤 No profile data returned - user needs setup');
        setProfile(null);
        setCompany(null);
        return;
      }

      console.log('✅ Profile fetched:', profileData);
      setProfile(profileData);

      // Fetch company data
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .select('*')
        .eq('id', profileData.company_id)
        .maybeSingle(); // Use maybeSingle here too

      if (companyError) {
        console.error('❌ Company fetch error:', companyError);
        throw companyError;
      }

      if (!companyData) {
        console.error('❌ No company data found for company_id:', profileData.company_id);
        setCompany(null);
        return;
      }

      console.log('✅ Company fetched:', companyData);
      setCompany(companyData);
    } catch (error) {
      console.error('❌ Error fetching profile/company:', error);
      setProfile(null);
      setCompany(null);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  useEffect(() => {
    // Handle URL fragments for auth errors
    const handleAuthError = () => {
      const urlParams = new URLSearchParams(window.location.hash.substring(1));
      const error = urlParams.get('error');
      const errorDescription = urlParams.get('error_description');
      
      if (error) {
        let message = 'Authentication error occurred';
        if (error === 'access_denied' && errorDescription?.includes('expired')) {
          message = 'Email verification link has expired. Please request a new one.';
        }
        toast({
          title: "Authentication Error",
          description: message,
          variant: "destructive"
        });
        // Clean up the URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    };

    handleAuthError();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔐 Auth state changed:', event, session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Check if this is a new user who needs profile setup
          const pendingSignup = localStorage.getItem('pendingSignup');
          if (pendingSignup && event === 'SIGNED_IN') {
            try {
              const signupData = JSON.parse(pendingSignup);
              if (signupData.userId === session.user.id) {
                console.log('👤 Completing profile setup for new user');
                await createCompanyAndProfile(
                  session.user.id,
                  signupData.email,
                  signupData.companyName,
                  signupData.firstName,
                  signupData.lastName
                );
                localStorage.removeItem('pendingSignup');
              }
            } catch (error) {
              console.error('❌ Error completing signup:', error);
            }
          }
          
          // Always try to fetch profile after auth
          setTimeout(() => {
            fetchProfile(session.user.id);
          }, 100);
        } else {
          setProfile(null);
          setCompany(null);
        }
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('🔐 Initial session check:', session?.user?.id);
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const createCompanyAndProfile = async (userId: string, email: string, companyName: string, firstName?: string, lastName?: string) => {
    try {
      console.log('🏢 Creating company and profile for user:', userId);
      
      const companySlug = companyName.toLowerCase().replace(/[^a-z0-9]/g, '-');
      
      // Create company first
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
        console.error('❌ Company creation error:', companyError);
        throw new Error(`Failed to create company: ${companyError.message}`);
      }

      console.log('✅ Company created:', companyData);

      // Create profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .insert([{
          user_id: userId,
          company_id: companyData.id,
          email: email,
          first_name: firstName,
          last_name: lastName,
          role: 'admin'
        }])
        .select()
        .single();

      if (profileError) {
        console.error('❌ Profile creation error:', profileError);
        throw new Error(`Failed to create profile: ${profileError.message}`);
      }

      console.log('✅ Profile created:', profileData);

      // Update state immediately
      setProfile(profileData);
      setCompany(companyData);
      
      toast({
        title: "Account created successfully",
        description: "Welcome to your manufacturing dashboard!",
      });

      return { profile: profileData, company: companyData };

    } catch (error) {
      console.error('❌ Error creating company/profile:', error);
      toast({
        title: "Setup Error",
        description: error instanceof Error ? error.message : "Failed to complete account setup",
        variant: "destructive"
      });
      throw error;
    }
  };

  const resendConfirmation = async (email: string) => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (error) {
        console.error('Resend confirmation error:', error);
        toast({
          title: "Failed to resend confirmation",
          description: error.message,
          variant: "destructive"
        });
        return { error };
      }

      toast({
        title: "Confirmation email sent",
        description: "Please check your email for a new confirmation link.",
      });

      return { error: null };
    } catch (error) {
      console.error('Resend confirmation error:', error);
      return { error };
    }
  };

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
        console.error('❌ Signup error:', error);
        toast({
          title: "Sign up failed",
          description: error.message,
          variant: "destructive"
        });
        return { error };
      }

      if (data.user) {
        // Always store signup data for completion after email confirmation
        localStorage.setItem('pendingSignup', JSON.stringify({
          userId: data.user.id,
          email,
          firstName,
          lastName,
          companyName
        }));
        
        if (data.user.email_confirmed_at) {
          // Email already confirmed, create company and profile immediately
          console.log('📧 Email already confirmed, creating profile immediately');
          await createCompanyAndProfile(data.user.id, email, companyName, firstName, lastName);
        } else {
          // Email needs confirmation
          toast({
            title: "Please verify your email",
            description: "We've sent you a confirmation link. Check your email and click the link to complete your registration.",
          });
        }
        
        return { error: null };
      }

      return { error: new Error('No user data returned') };

    } catch (error) {
      console.error('❌ Signup error:', error);
      toast({
        title: "Sign up failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('❌ Signin error:', error);
        
        let errorMessage = error.message;
        if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Please check your email and click the confirmation link before signing in.';
        } else if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Invalid email or password. Please check your credentials and try again.';
        }
        
        toast({
          title: "Sign in failed",
          description: errorMessage,
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
      console.error('❌ Signin error:', error);
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
      localStorage.removeItem('pendingSignup');
      toast({
        title: "Signed out successfully",
      });
    } catch (error) {
      console.error('❌ Signout error:', error);
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
    refreshProfile,
    resendConfirmation
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
