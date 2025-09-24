import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { validatePassword } from '@/utils/validation';
import { PasswordSecurity } from '@/utils/security';

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

export function PasswordResetConfirmPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});
  const [passwordStrength, setPasswordStrength] = useState<{ score: number; feedback: string[]; isStrong: boolean } | null>(null);
  const { updatePassword } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    const errors: Record<string, string[]> = {};
    
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      errors.newPassword = passwordValidation.errors;
    }
    
    if (newPassword !== confirmPassword) {
      errors.confirmPassword = ['Passwords do not match'];
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNewPasswordChange = (value: string) => {
    setNewPassword(value);
    if (value) {
      const strength = PasswordSecurity.checkStrength(value);
      setPasswordStrength(strength);
    } else {
      setPasswordStrength(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    try {
      const { error } = await updatePassword(newPassword);
      if (!error) {
        navigate('/auth', { replace: true });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Password strength indicator component
  const PasswordStrengthIndicator = () => {
    if (!passwordStrength) return null;
    
    const getColor = (score: number) => {
      if (score <= 2) return 'bg-red-500';
      if (score <= 3) return 'bg-yellow-500';
      if (score <= 4) return 'bg-blue-500';
      return 'bg-green-500';
    };
    
    const getText = (score: number) => {
      if (score <= 2) return 'Weak';
      if (score <= 3) return 'Fair';
      if (score <= 4) return 'Good';
      return 'Strong';
    };
    
    return (
      <div className="mt-2 space-y-2">
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all ${getColor(passwordStrength.score)}`}
              style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
            />
          </div>
          <span className={`text-xs font-medium ${passwordStrength.score <= 2 ? 'text-red-600' : passwordStrength.score <= 3 ? 'text-yellow-600' : passwordStrength.score <= 4 ? 'text-blue-600' : 'text-green-600'}`}>
            {getText(passwordStrength.score)}
          </span>
        </div>
        {passwordStrength.feedback.length > 0 && (
          <div className="text-xs text-gray-600 space-y-1">
            {passwordStrength.feedback.map((feedback, index) => (
              <div key={index} className="flex items-center gap-1">
                <AlertTriangle className="h-3 w-3 text-yellow-500" />
                {feedback}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <img 
              src="/auth-logo.png" 
              alt="Sentiri"
              className="h-24"
            />
          </div>
        </div>

        <div className="shadow-input mx-auto w-full max-w-md rounded-2xl bg-white p-8 dark:bg-black">
          <div className="space-y-4">
            <div className="text-center">
              <h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-200">
                Set New Password
              </h2>
              <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">
                Enter your new password below.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <LabelInputContainer>
                <StyledLabel htmlFor="new-password">New Password</StyledLabel>
                <div className="relative">
                  <StyledInput
                    id="new-password"
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => handleNewPasswordChange(e.target.value)}
                    required
                    disabled={isLoading}
                    className={validationErrors.newPassword ? 'border-red-500 pr-10' : 'pr-10'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    disabled={isLoading}
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {validationErrors.newPassword && (
                  <div className="text-xs text-red-500 mt-1">
                    {validationErrors.newPassword.map((error, index) => (
                      <div key={index}>{error}</div>
                    ))}
                  </div>
                )}
                <PasswordStrengthIndicator />
              </LabelInputContainer>

              <LabelInputContainer>
                <StyledLabel htmlFor="confirm-password">Confirm Password</StyledLabel>
                <div className="relative">
                  <StyledInput
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className={validationErrors.confirmPassword ? 'border-red-500 pr-10' : 'pr-10'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {validationErrors.confirmPassword && (
                  <div className="text-xs text-red-500 mt-1">
                    {validationErrors.confirmPassword.map((error, index) => (
                      <div key={index}>{error}</div>
                    ))}
                  </div>
                )}
              </LabelInputContainer>

              <div className="flex gap-2">
                <Link to="/auth" className="flex-1">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-10"
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                </Link>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 h-10"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update Password'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}