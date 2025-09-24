'use client';

import { signIn, getSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslations } from '@/hooks/useTranslations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  IconAlertCircle,
  IconLoader2,
  IconEye,
  IconEyeOff,
  IconLock,
  IconMail,
  IconUser
} from '@tabler/icons-react';
import { cn } from '@/lib/utils';

type LoginError = {
  type: 'credentials' | 'network' | 'server' | 'validation' | 'unknown';
  message: string;
  details?: string;
};

export default function ClientLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslations();
  const callbackUrl = searchParams?.get('callbackUrl') || '/account';
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
        message: t('auth.login.errors.invalidCredentials'),
        details: t('auth.login.errors.checkCredentials')
      },
      'SessionRequired': {
        type: 'credentials',
        message: t('auth.login.errors.sessionExpired'),
        details: t('auth.login.errors.loginAgain')
      },
      'Configuration': {
        type: 'server',
        message: t('auth.login.errors.serverConfig'),
        details: t('auth.login.errors.serverConfigDetails')
      },
      'AccessDenied': {
        type: 'credentials',
        message: t('auth.login.errors.accessDenied'),
        details: t('auth.login.errors.noPermission')
      },
      'default': {
        type: 'unknown',
        message: t('auth.login.errors.authError'),
        details: t('auth.login.errors.unknownError')
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
      errors.email = t('auth.login.validation.emailRequired');
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = t('auth.login.validation.emailInvalid');
      isValid = false;
    }

    // Password validation
    if (!password) {
      errors.password = t('auth.login.validation.passwordRequired');
      isValid = false;
    } else if (password.length < 6) {
      errors.password = t('auth.login.validation.passwordMinLength');
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

    setIsLoading(true);

    try {
      const result = await signIn('client-credentials', {
        redirect: false,
        email: email.trim(),
        password,
        callbackUrl: callbackUrl || '/account',
      });

      if (result?.error) {
        handleAuthError(result.error);
      } else if (result?.url) {
        // Check if the user was successfully authenticated
        const session = await getSession();
        if (session?.user?.role === 'CLIENT') {
          window.location.href = result.url;
        } else {
          setErrorState({
            type: 'credentials',
            message: t('auth.login.errors.clientAccessOnly'),
            details: t('auth.login.errors.registerFirst')
          });
        }
      } else {
        window.location.href = '/account';
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrorState({
        type: 'unknown',
        message: t('auth.login.errors.unexpectedError'),
        details: error instanceof Error ? error.message : t('auth.login.errors.tryAgainLater')
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">{t('auth.login.welcome')}</h1>
          <p className="text-muted-foreground">{t('auth.login.subtitle')}</p>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <IconUser className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">{t('auth.login.title')}</CardTitle>
            <CardDescription>
              {t('auth.login.enterCredentials')}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {errorState && (
              <Alert variant="destructive">
                <IconAlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {errorState.message}
                  {errorState.details && (
                    <div className="mt-1 text-sm">{errorState.details}</div>
                  )}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email">{t('auth.login.fields.email')}</Label>
                <div className="relative">
                  <IconMail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder={t('auth.login.placeholders.email')}
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
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
                  <p className="text-sm text-destructive">{formErrors.email}</p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password">{t('auth.login.fields.password')}</Label>
                  <Link
                    href="/forgot-password"
                    className="text-sm text-primary hover:underline"
                  >
                    {t('auth.login.forgotPassword')}
                  </Link>
                </div>
                <div className="relative">
                  <IconLock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder={t('auth.login.placeholders.password')}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
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
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <IconEyeOff className="h-4 w-4" />
                    ) : (
                      <IconEye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {formErrors.password && (
                  <p className="text-sm text-destructive">{formErrors.password}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('auth.login.signingIn')}
                  </>
                ) : (
                  t('auth.login.signIn')
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            <div className="text-center text-sm text-muted-foreground">
              {t('auth.login.noAccount')}{' '}
              <Link
                href="/register"
                className="text-primary hover:underline font-medium"
              >
                {t('auth.login.signUp')}
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
