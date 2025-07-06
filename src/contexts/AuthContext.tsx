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
  isCreatingProfile: boolean;
  signUp: (email: string, password: string, companyName: string, firstName?: string, lastName?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  resendConfirmation: (email: string) => Promise<{ error: any }>;
  createProfileNow: () => Promise<void>;
  createCompanyAndProfile: (userId: string, email: string, companyName: string, firstName?: string, lastName?: string) => Promise<{ profile: Profile; company: Company }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);
  const [isFetchingProfile, setIsFetchingProfile] = useState(false);
  const [hasAttemptedProfileCreation, setHasAttemptedProfileCreation] = useState(false);
  
  // Load completed signup users from localStorage
  const [completedSignupUsers, setCompletedSignupUsers] = useState<Set<string>>(() => {
    const stored = localStorage.getItem('completedSignupUsers');
    return stored ? new Set(JSON.parse(stored)) : new Set();
  });
  
  const { toast } = useToast();

  // Add timeout to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        console.warn('⚠️ Loading timeout reached, forcing loading to false');
        setLoading(false);
      }
    }, 10000); // 10 second timeout

    return () => clearTimeout(timeout);
  }, [loading]);

  const fetchProfile = async (userId: string) => {
    // Prevent multiple simultaneous profile fetches
    if (isFetchingProfile) {
      console.log('🔄 Profile fetch already in progress, skipping...');
      return;
    }

    setIsFetchingProfile(true);
    
    try {
      console.log('🔍 Fetching profile for user:', userId);
      
      // Debug: Check if user exists and has profile
      console.log('🔧 Debug: User ID exists:', !!userId);
      
      // First, try to get profile count to see if user has a profile
      const { count: profileCount, error: countError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);
      
      if (countError) {
        console.error('❌ Profile count error:', countError);
        console.error('🔧 This might be an RLS policy issue');
      } else {
        console.log('🔧 Debug: Profile count:', profileCount);
      }
      
      // Try to fetch profile data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (profileError) {
        console.error('❌ Profile fetch error:', profileError);
        console.error('❌ Error code:', profileError.code);
        console.error('❌ Error message:', profileError.message);
        
        if (profileError.code === 'PGRST116') {
          console.log('👤 No profile found, user needs to complete setup');
          setProfile(null);
          setCompany(null);
          return;
        }
        
        // If it's a permission error, try a different approach
        if (profileError.code === '42501') {
          console.error('❌ Permission denied - RLS policy issue');
          console.error('🔧 Trying to bypass RLS by checking if user has any data...');
          
          // Try to create a minimal profile for existing user
          console.log('🔧 User likely has data but RLS is blocking access');
          console.log('🔧 Setting up fallback profile creation...');
          
          // Don't set profile to null, let the ProtectedRoute handle this
          return;
        }
        
        // Don't throw error, just set profile to null
        console.error('❌ Profile fetch failed, setting profile to null');
        setProfile(null);
        setCompany(null);
        return;
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
      console.log('🏢 Attempting to fetch company with ID:', profileData.company_id);
      
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .select('*')
        .eq('id', profileData.company_id)
        .maybeSingle();

      if (companyError) {
        console.error('❌ Company fetch error:', companyError);
        console.error('❌ Error code:', companyError.code);
        console.error('❌ Error message:', companyError.message);
        console.error('❌ Error details:', companyError.details);
        
        // Try to debug the issue
        if (companyError.code === '42501') {
          console.error('❌ Permission denied - RLS policy issue');
          console.error('🔧 User ID:', userId);
          console.error('🔧 Profile company_id:', profileData.company_id);
          console.error('🔧 Company fetch blocked by RLS, but profile exists');
        }
        
        // Don't throw error, just set company to null
        console.error('❌ Company fetch failed, setting company to null');
        setCompany(null);
        return;
      }

      if (!companyData) {
        console.error('❌ No company data found for company_id:', profileData.company_id);
        console.error('🔧 This might be a data integrity issue or RLS policy problem');
        setCompany(null);
        return;
      }

      console.log('✅ Company fetched:', companyData);
      setCompany(companyData);
    } catch (error) {
      console.error('❌ Unexpected error fetching profile/company:', error);
      setProfile(null);
      setCompany(null);
    } finally {
      setIsFetchingProfile(false);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  const createProfileNow = async () => {
    if (!user) {
      console.log('❌ No user to create profile for');
      return;
    }

    // Prevent multiple simultaneous profile creation attempts
    if (isCreatingProfile) {
      console.log('🔄 Profile creation already in progress, skipping...');
      return;
    }

    setIsCreatingProfile(true);

    try {
      console.log('🔧 Attempting to find existing profile for user:', user.id);
      
      // First, try to find existing company by email
      const companySlug = user.email?.split('@')[0] || 'my';
      const possibleSlugs = [
        `${companySlug}-company`,
        companySlug,
        `${companySlug}-co`,
        `${companySlug}-ltd`
      ];

      console.log('🔍 Searching for existing company with possible slugs:', possibleSlugs);
      
      // Try to find existing company
      let existingCompany = null;
      for (const slug of possibleSlugs) {
        try {
          const { data: company, error } = await supabase
            .from('companies')
            .select('*')
            .eq('slug', slug)
            .maybeSingle();
          
          if (!error && company) {
            console.log('✅ Found existing company:', company);
            existingCompany = company;
            break;
          }
        } catch (e) {
          console.log(`🔍 No company found with slug: ${slug}`);
        }
      }

      // Also try to find company by email as fallback
      if (!existingCompany) {
        try {
          const { data: company, error } = await supabase
            .from('companies')
            .select('*')
            .eq('email', user.email)
            .maybeSingle();
          
          if (!error && company) {
            console.log('✅ Found existing company by email:', company);
            existingCompany = company;
          }
        } catch (e) {
          console.log('🔍 No company found by email');
        }
      }

      // If we found an existing company, try to find or create profile
      if (existingCompany) {
        console.log('🏢 Found existing company, checking for profile...');
        
        // Try to find existing profile
        const { data: existingProfile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (!profileError && existingProfile) {
          console.log('✅ Found existing profile:', existingProfile);
          setProfile(existingProfile);
          setCompany(existingCompany);
          toast({
            title: "Welcome back!",
            description: "Your account has been loaded successfully.",
          });
          return;
        }

        // Create profile for existing company
        console.log('👤 Creating profile for existing company...');
        const profileData = {
          user_id: user.id,
          company_id: existingCompany.id,
          email: user.email,
          first_name: user.user_metadata?.first_name || '',
          last_name: user.user_metadata?.last_name || '',
          role: 'admin'
        };

        const { data: newProfile, error: newProfileError } = await supabase
          .from('profiles')
          .insert([profileData])
          .select()
          .single();

        if (newProfileError) {
          console.error('❌ Error creating profile for existing company:', newProfileError);
          throw newProfileError;
        }

        console.log('✅ Profile created for existing company:', newProfile);
        setProfile(newProfile);
        setCompany(existingCompany);
        
        toast({
          title: "Account linked successfully",
          description: "Your account has been linked to your existing company.",
        });
        return;
      }

      // If no existing company found, create new one
      console.log('🏢 No existing company found, creating new one...');
      
      // Check if there's pending signup data
      const pendingSignup = localStorage.getItem('pendingSignup');
      let signupData = null;
      
      if (pendingSignup) {
        try {
          signupData = JSON.parse(pendingSignup);
          console.log('📦 Found pending signup data:', signupData);
        } catch (e) {
          console.log('❌ Invalid pending signup data');
        }
      }

      // If no pending data, create with basic info
      if (!signupData) {
        signupData = {
          email: user.email,
          companyName: `${user.email?.split('@')[0] || 'My'} Company`,
          firstName: user.user_metadata?.first_name || '',
          lastName: user.user_metadata?.last_name || ''
        };
        console.log('🔧 Using fallback signup data:', signupData);
      }

      // Create new company and profile
      await createCompanyAndProfile(
        user.id,
        signupData.email,
        signupData.companyName,
        signupData.firstName,
        signupData.lastName
      );

      localStorage.removeItem('pendingSignup');
      
    } catch (error) {
      console.error('❌ Error creating profile:', error);
      // Don't show error toast for automatic profile creation - let it retry silently
      // Only show error if it's a manual setup attempt
    } finally {
      setIsCreatingProfile(false);
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

    let isInitialized = false;

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔐 Auth state changed:', event, session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Check if this is a new user who needs profile setup
          const pendingSignup = localStorage.getItem('pendingSignup');
          if (pendingSignup && event === 'SIGNED_IN' && !isCreatingProfile && !completedSignupUsers.has(session.user.id) && !loading) {
            try {
              const signupData = JSON.parse(pendingSignup);
              if (signupData.userId === session.user.id && user) {
                // Before creating profile, check if one already exists
                console.log('🔍 Checking if profile already exists before creating...');
                const { data: existingProfile } = await supabase
                  .from('profiles')
                  .select('*')
                  .eq('user_id', session.user.id)
                  .single();
                
                if (existingProfile) {
                  console.log('✅ Profile already exists, skipping creation and cleaning up signup data');
                  localStorage.removeItem('pendingSignup');
                  // Add to completed users to prevent future attempts
                  const newCompletedUsers = new Set(completedSignupUsers).add(session.user.id);
                  setCompletedSignupUsers(newCompletedUsers);
                  localStorage.setItem('completedSignupUsers', JSON.stringify([...newCompletedUsers]));
                  return;
                }
                
                console.log('👤 Completing profile setup for new user');
                const newCompletedUsers = new Set(completedSignupUsers).add(session.user.id);
                setCompletedSignupUsers(newCompletedUsers);
                localStorage.setItem('completedSignupUsers', JSON.stringify([...newCompletedUsers]));
                setIsCreatingProfile(true);
                
                // Try to create company and profile
                try {
                  await createCompanyAndProfile(
                    session.user.id,
                    signupData.email,
                    signupData.companyName,
                    signupData.firstName,
                    signupData.lastName
                  );
                } catch (error) {
                  // If creation fails, try to find existing data
                  console.log('🔄 Company/profile creation failed, checking for existing data...');
                  await createProfileNow();
                }
                
                localStorage.removeItem('pendingSignup');
                setIsCreatingProfile(false);
              }
            } catch (error) {
              console.error('❌ Error completing signup:', error);
              setIsCreatingProfile(false);
            }
          }
          
          // Only fetch profile if not already initialized and not creating profile
          if (!isInitialized && !isCreatingProfile) {
            console.log('🔍 Initial profile fetch for authenticated user');
            // Add a small delay to ensure any pending signup operations complete first
            setTimeout(async () => {
              await fetchProfile(session.user.id);
              if (!isInitialized) {
                isInitialized = true;
              }
            }, 500);
          }
          
          // Auto-create profile if user exists but no profile and not already creating
          if (session?.user && !profile && !isCreatingProfile && !isFetchingProfile && !loading) {
            console.log('🔄 Auto-creating profile for authenticated user without profile');
            // Use a shorter delay for better responsiveness
            setTimeout(async () => {
              if (!profile && !isCreatingProfile) {
                try {
                  await createProfileNow();
                } catch (error) {
                  console.error('❌ Auto-profile creation failed:', error);
                  // Try again after a delay if it fails
                  setTimeout(async () => {
                    if (!profile && !isCreatingProfile) {
                      console.log('🔄 Retrying profile creation...');
                      try {
                        await createProfileNow();
                      } catch (retryError) {
                        console.error('❌ Profile creation retry failed:', retryError);
                      }
                    }
                  }, 2000);
                }
              }
            }, 500);
          }
        } else {
          setProfile(null);
          setCompany(null);
        }
        
        // Only set loading to false once and only if not creating profile
        if (!isInitialized && !isCreatingProfile) {
          setLoading(false);
          isInitialized = true;
        }
        
        // Emergency fallback: if we've been loading for too long, force stop
        if (loading && !isCreatingProfile) {
          setTimeout(() => {
            if (loading) {
              console.warn('⚠️ Loading timeout in auth state change, forcing loading to false');
              setLoading(false);
            }
          }, 5000);
        }
      }
    );

    // Check for existing session (only run once)
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('🔐 Initial session check:', session?.user?.id);
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user && !isInitialized) {
        console.log('🔍 Initial profile fetch from session check');
        fetchProfile(session.user.id).then(() => {
          if (!isInitialized) {
            setLoading(false);
            isInitialized = true;
          }
        });
      } else if (!isInitialized) {
        setLoading(false);
        isInitialized = true;
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const createCompanyAndProfile = async (userId: string, email: string, companyName: string, firstName?: string, lastName?: string) => {
    try {
      // Check if we're in the process of signing out
      if (!session) {
        console.log('🔄 Session is null, skipping company/profile creation (likely signing out)');
        return null;
      }
      
      console.log('🏢 Creating company and profile for user:', userId);
      console.log('🏢 Company name:', companyName);
      console.log('🏢 Email:', email);
      
      const companySlug = companyName.toLowerCase().replace(/[^a-z0-9]/g, '-');
      console.log('🏢 Company slug:', companySlug);
      
      // Create company first - include all required fields
      const companyInsertData = {
        name: companyName,
        slug: companySlug,
        email: email,
        subscription_status: 'trial',
        subscription_tier: 'basic',
        max_materials: 100,
        max_projects: 10
      };
      
      console.log('🏢 Inserting company with data:', companyInsertData);
      
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .insert([companyInsertData])
        .select()
        .single();

      if (companyError) {
        console.error('❌ Company creation error:', companyError);
        console.error('❌ Error code:', companyError.code);
        console.error('❌ Error message:', companyError.message);
        console.error('❌ Error details:', companyError.details);
        // Try to get more details about the error
        if (companyError.code === '42501') {
          console.error('❌ Permission denied - RLS policy issue');
        }
        throw new Error(`Failed to create company: ${companyError.message}`);
      }

      console.log('✅ Company created:', companyData);

      // Create profile - include all required fields
      const profileInsertData = {
        user_id: userId,
        company_id: companyData.id,
        email: email,
        first_name: firstName,
        last_name: lastName,
        role: 'admin'
      };
      
      console.log('👤 Inserting profile with data:', profileInsertData);
      
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .insert([profileInsertData])
        .select()
        .single();

      if (profileError) {
        console.error('❌ Profile creation error:', profileError);
        console.error('❌ Error code:', profileError.code);
        console.error('❌ Error message:', profileError.message);
        console.error('❌ Error details:', profileError.details);
        // Try to get more details about the error
        if (profileError.code === '42501') {
          console.error('❌ Permission denied - RLS policy issue');
        }
        throw new Error(`Failed to create profile: ${profileError.message}`);
      }

      console.log('✅ Profile created:', profileData);

      // Update state immediately
      setProfile(profileData);
      setCompany(companyData);
      
      // Force a small delay to ensure state updates are processed
      await new Promise(resolve => setTimeout(resolve, 100));
      
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
      console.log('🔄 Starting sign out process...');
      
      // Cancel any ongoing profile creation
      setIsCreatingProfile(false);
      setHasAttemptedProfileCreation(false);
      
      // Clear all state
      setUser(null);
      setSession(null);
      setProfile(null);
      setCompany(null);
      setLoading(false);
      
      // Clear localStorage
      localStorage.removeItem('pendingSignup');
      localStorage.removeItem('completedSignupUsers');
      
      // Sign out from Supabase
      await supabase.auth.signOut();
      
      console.log('✅ Sign out completed successfully');
      toast({
        title: "Signed out successfully",
      });
    } catch (error) {
      console.error('❌ Signout error:', error);
      // Even if there's an error, clear the state
      setUser(null);
      setSession(null);
      setProfile(null);
      setCompany(null);
      setLoading(false);
    }
  };

  const value = {
    user,
    session,
    profile,
    company,
    loading,
    isCreatingProfile,
    signUp,
    signIn,
    signOut,
    refreshProfile,
    resendConfirmation,
    createProfileNow,
    createCompanyAndProfile
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
