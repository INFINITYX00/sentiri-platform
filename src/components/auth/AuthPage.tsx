
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Factory, RefreshCw, Github } from 'lucide-react';
import { cn } from '@/lib/utils';

const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("flex w-full flex-col space-y-2", className)}>
      {children}
    </div>
  );
};

const BottomGradient = () => {
  return (
    <>
      <span className="absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
      <span className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
    </>
  );
};

const StyledInput = ({ className, ...props }: React.ComponentProps<typeof Input>) => {
  return (
    <Input
      className={cn(
        "shadow-input flex h-10 w-full rounded-md border-none bg-gray-50 px-3 py-2 text-sm text-black transition duration-400 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-neutral-400 focus-visible:ring-[2px] focus-visible:ring-neutral-400 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-800 dark:text-white dark:shadow-[0px_0px_1px_1px_#404040] dark:focus-visible:ring-neutral-600",
        className
      )}
      {...props}
    />
  );
};

const StyledLabel = ({ className, ...props }: React.ComponentProps<typeof Label>) => {
  return (
    <Label
      className={cn(
        "text-sm font-medium text-black dark:text-white leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        className
      )}
      {...props}
    />
  );
};

export function AuthPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [showResendConfirmation, setShowResendConfirmation] = useState(false);
  const { signIn, signUp, resendConfirmation } = useAuth();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { error } = await signIn(email, password);
      if (error && error.message.includes('Email not confirmed')) {
        setShowResendConfirmation(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !companyName) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { error } = await signUp(email, password, companyName, firstName, lastName);
      if (!error) {
        setShowResendConfirmation(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    if (!email) return;
    
    setIsLoading(true);
    try {
      await resendConfirmation(email);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Factory className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Manufacturing Hub</h1>
          <p className="text-gray-600 mt-2">Digital Product Passport Platform for Manufacturers</p>
        </div>

        {showResendConfirmation && (
          <div className="shadow-input mx-auto w-full max-w-md rounded-2xl bg-white p-8 dark:bg-black mb-6">
            <div className="text-center space-y-4">
              <p className="text-sm text-neutral-600 dark:text-neutral-300">
                Need to verify your email? Click below to resend the confirmation link.
              </p>
              <button
                onClick={handleResendConfirmation}
                disabled={isLoading || !email}
                className="group/btn relative block h-10 w-full rounded-md bg-gradient-to-br from-black to-neutral-600 font-medium text-white shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:bg-zinc-800 dark:from-zinc-900 dark:to-zinc-900 dark:shadow-[0px_1px_0px_0px_#27272a_inset,0px_-1px_0px_0px_#27272a_inset] disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin inline" />
                    Sending...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 inline" />
                    Resend Confirmation Email
                  </>
                )}
                <BottomGradient />
              </button>
            </div>
          </div>
        )}

        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="signin">
            <div className="shadow-input mx-auto w-full max-w-md rounded-2xl bg-white p-8 dark:bg-black">
              <h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-200">
                Welcome Back
              </h2>
              <p className="mt-2 max-w-sm text-sm text-neutral-600 dark:text-neutral-300">
                Sign in to your manufacturing account
              </p>

              <form className="my-8" onSubmit={handleSignIn}>
                <LabelInputContainer className="mb-4">
                  <StyledLabel htmlFor="signin-email">Email Address</StyledLabel>
                  <StyledInput
                    id="signin-email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </LabelInputContainer>

                <LabelInputContainer className="mb-8">
                  <StyledLabel htmlFor="signin-password">Password</StyledLabel>
                  <StyledInput
                    id="signin-password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </LabelInputContainer>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="group/btn relative block h-10 w-full rounded-md bg-gradient-to-br from-black to-neutral-600 font-medium text-white shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:bg-zinc-800 dark:from-zinc-900 dark:to-zinc-900 dark:shadow-[0px_1px_0px_0px_#27272a_inset,0px_-1px_0px_0px_#27272a_inset] disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin inline" />
                      Signing In...
                    </>
                  ) : (
                    'Sign In →'
                  )}
                  <BottomGradient />
                </button>
              </form>
            </div>
          </TabsContent>

          <TabsContent value="signup">
            <div className="shadow-input mx-auto w-full max-w-md rounded-2xl bg-white p-8 dark:bg-black">
              <h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-200">
                Start Your Free Trial
              </h2>
              <p className="mt-2 max-w-sm text-sm text-neutral-600 dark:text-neutral-300">
                Create your company account and get 14 days free
              </p>

              <form className="my-8" onSubmit={handleSignUp}>
                <div className="mb-4 flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2">
                  <LabelInputContainer>
                    <StyledLabel htmlFor="firstName">First name</StyledLabel>
                    <StyledInput
                      id="firstName"
                      placeholder="John"
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      disabled={isLoading}
                    />
                  </LabelInputContainer>
                  <LabelInputContainer>
                    <StyledLabel htmlFor="lastName">Last name</StyledLabel>
                    <StyledInput
                      id="lastName"
                      placeholder="Doe"
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      disabled={isLoading}
                    />
                  </LabelInputContainer>
                </div>

                <LabelInputContainer className="mb-4">
                  <StyledLabel htmlFor="companyName">Company Name</StyledLabel>
                  <StyledInput
                    id="companyName"
                    placeholder="Your Manufacturing Company"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </LabelInputContainer>

                <LabelInputContainer className="mb-4">
                  <StyledLabel htmlFor="signup-email">Email Address</StyledLabel>
                  <StyledInput
                    id="signup-email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </LabelInputContainer>

                <LabelInputContainer className="mb-8">
                  <StyledLabel htmlFor="signup-password">Password</StyledLabel>
                  <StyledInput
                    id="signup-password"
                    type="password"
                    placeholder="Create a strong password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    disabled={isLoading}
                  />
                </LabelInputContainer>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="group/btn relative block h-10 w-full rounded-md bg-gradient-to-br from-black to-neutral-600 font-medium text-white shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:bg-zinc-800 dark:from-zinc-900 dark:to-zinc-900 dark:shadow-[0px_1px_0px_0px_#27272a_inset,0px_-1px_0px_0px_#27272a_inset] disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin inline" />
                      Creating Account...
                    </>
                  ) : (
                    'Start Free Trial →'
                  )}
                  <BottomGradient />
                </button>

                <p className="text-xs text-neutral-500 text-center mt-4">
                  14-day free trial • No credit card required
                </p>
              </form>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
