'use client';

import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Loader2, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

// Type for different error states
type LoginError = {
  type: 'credentials' | 'network' | 'server' | 'validation' | 'unknown';
  message: string;
  details?: string;
};

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get('callbackUrl') || '/admin/dashboard';
  const errorParam = searchParams?.get('error');
  
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Error state
  const [errorState, setErrorState] = useState<LoginError | null>(null);
  const [formErrors, setFormErrors] = useState<{email?: string; password?: string}>({});
  
  // Check for error in URL params on initial load
  useEffect(() => {
    if (errorParam) {
      handleAuthError(errorParam);
    }
  }, [errorParam]);
  
  // Handle different types of authentication errors
  const handleAuthError = (errorCode: string) => {
    const errorMap: Record<string, LoginError> = {
      'CredentialsSignin': {
        type: 'credentials',
        message: 'Invalid email or password',
        details: 'Please check your credentials and try again.'
      },
      'SessionRequired': {
        type: 'credentials',
        message: 'Session expired',
        details: 'Please log in again to continue.'
      },
      'Configuration': {
        type: 'server',
        message: 'Server configuration error',
        details: 'There was an issue with the server configuration.'
      },
      'AccessDenied': {
        type: 'credentials',
        message: 'Access denied',
        details: 'You do not have permission to access this page.'
      },
      'default': {
        type: 'unknown',
        message: 'Authentication error',
        details: 'An unknown error occurred during authentication.'
      }
    };
    
    setErrorState(errorMap[errorCode] || errorMap['default']);
  };

  // Validate form fields
  const validateForm = () => {
    const errors: {email?: string; password?: string} = {};
    let isValid = true;
    
    // Email validation
    if (!email.trim()) {
      errors.email = 'Email is required';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Please enter a valid email address';
      isValid = false;
    }
    
    // Password validation
    if (!password) {
      errors.password = 'Password is required';
      isValid = false;
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
      isValid = false;
    }
    
    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset previous states
    setErrorState(null);
    
    // Validate form
    if (!validateForm()) {
      return;
    }

    // Log login attempt
    console.log('\n--- Login Attempt ---');
    console.log('Email:', email);
    console.log('Callback URL:', callbackUrl);
    
    setIsLoading(true);

    try {
      console.log('\n[1/3] Calling signIn with credentials...');
      const result = await signIn('credentials', {
        redirect: false,
        email: email.trim(),
        password,
        callbackUrl: callbackUrl || '/admin/dashboard',
      });

      // Log the raw response for debugging
      console.log('\n[2/3] SignIn result received:');
      console.log('Status:', result?.error ? 'Error' : 'Success');
      console.log('Error:', result?.error || 'None');
      console.log('URL:', result?.url || 'None');
      console.log('Status:', result?.status);
      console.log('OK:', result?.ok);
      console.log('Full result:', JSON.stringify(result, null, 2));

      if (result?.error) {
        // Handle specific error cases
        console.error('\n[ERROR] Authentication failed:', result.error);
        handleAuthError(result.error);
        
        // Log additional debug info
        if (result.error.includes('ECONNREFUSED')) {
          console.error('Database connection refused. Check if the database is running.');
        } else if (result.error.includes('P1001')) {
          console.error('Cannot connect to database. Check your database credentials.');
        }
      } else if (result?.url) {
        console.log('\n[3/3] Login successful, redirecting to:', result.url);
        // Store login state in session storage to detect redirect loop
        sessionStorage.setItem('login_redirect', 'in_progress');
        // Force a full page reload to ensure session is properly set
        window.location.href = result.url;
        return; // Prevent further execution
      } else {
        // This should theoretically never happen, but just in case
        console.log('\n[WARNING] No redirect URL provided, using default');
        sessionStorage.setItem('login_redirect', 'in_progress');
        window.location.href = '/admin/dashboard';
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrorState({
        type: 'unknown',
        message: 'An unexpected error occurred',
        details: error instanceof Error ? error.message : 'Please try again later.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Render error alert if there's an error
  const renderErrorAlert = () => {
    if (!errorState) return null;
    
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-5 w-5" />
        <div className="ml-2">
          <AlertTitle className="font-medium">{errorState.message}</AlertTitle>
          {errorState.details && (
            <AlertDescription className="mt-1 text-sm">
              {errorState.details}
            </AlertDescription>
          )}
          {errorState.type === 'network' && (
            <Button 
              variant="link" 
              className="h-auto p-0 text-sm font-normal text-destructive underline"
              onClick={() => window.location.reload()}
            >
              Try again
            </Button>
          )}
        </div>
      </Alert>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-600">Sign in to your admin account</p>
        </div>
        
        <Card className="overflow-hidden shadow-lg p-0">
          <div className="bg-primary p-6 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-full mb-4">
              <Lock className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-white">Admin Login</CardTitle>
            <CardDescription className="text-white/90 mt-1">
              Enter your credentials to continue
            </CardDescription>
          </div>
          
          <CardContent className="pt-8 pb-6 px-8">
            {renderErrorAlert()}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y 4">
                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email Address
                  </Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        // Clear error when user starts typing
                        if (formErrors.email) {
                          setFormErrors(prev => ({ ...prev, email: undefined }));
                        }
                      }}
                      disabled={isLoading}
                      className={cn(
                        'pl-10',
                        formErrors.email && 'border-destructive focus-visible:ring-destructive'
                      )}
                      autoComplete="email"
                      autoFocus
                    />
                  </div>
                  {formErrors.email && (
                    <p className="text-sm text-destructive mt-1">{formErrors.email}</p>
                  )}
                </div>
                
                {/* Password Field */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                      Password
                    </Label>
                    <Link 
                      href="/forgot-password" 
                      className="text-sm font-medium text-primary hover:underline"
                      tabIndex={-1} // Prevent tab focus on forgot password link
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        // Clear error when user starts typing
                        if (formErrors.password) {
                          setFormErrors(prev => ({ ...prev, password: undefined }));
                        }
                      }}
                      disabled={isLoading}
                      className={cn(
                        'pl-10 pr-10',
                        formErrors.password && 'border-destructive focus-visible:ring-destructive'
                      )}
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1} // Prevent tab focus on show/hide button
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {formErrors.password && (
                    <p className="text-sm text-destructive mt-1">{formErrors.password}</p>
                  )}
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full h-11 text-base font-medium"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>
          </CardContent>
          
          <CardFooter className="bg-gray-50 px-8 py-4 border-t">
            <p className="text-center text-sm text-gray-600 w-full">
              Having trouble?{' '}
              <Link 
                href="mailto:support@sheinauriva.com" 
                className="font-medium text-primary hover:underline"
              >
                Contact support
              </Link>
            </p>
          </CardFooter>
        </Card>
        
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} SheinAuriva. All rights reserved.</p>
        </div>
      </div>
    </div>
    )
}
