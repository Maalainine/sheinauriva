'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useTranslations } from '@/hooks/useTranslations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  IconAlertCircle,
  IconLoader2,
  IconEye,
  IconEyeOff,
  IconLock,
  IconMail,
  IconUser,
  IconUserPlus,
  IconCheck
} from '@tabler/icons-react';
import { cn } from '@/lib/utils';

type RegisterError = {
  message: string;
  details?: string;
};

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export default function ClientRegisterPage() {
  const router = useRouter();
  const { t } = useTranslations();

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Error state
  const [errorState, setErrorState] = useState<RegisterError | null>(null);
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  // Handle form input changes
  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear field error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Validate form fields
  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    let isValid = true;

    // Name validation
    if (!formData.name.trim()) {
      errors.name = t('auth.register.validation.nameRequired');
      isValid = false;
    } else if (formData.name.trim().length < 2) {
      errors.name = t('auth.register.validation.nameMinLength');
      isValid = false;
    }

    // Email validation
    if (!formData.email.trim()) {
      errors.email = t('auth.register.validation.emailRequired');
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = t('auth.register.validation.emailInvalid');
      isValid = false;
    }

    // Password validation
    if (!formData.password) {
      errors.password = t('auth.register.validation.passwordRequired');
      isValid = false;
    } else if (formData.password.length < 8) {
      errors.password = t('auth.register.validation.passwordMinLength');
      isValid = false;
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      errors.password = t('auth.register.validation.passwordStrength');
      isValid = false;
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      errors.confirmPassword = t('auth.register.validation.confirmPasswordRequired');
      isValid = false;
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = t('auth.register.validation.passwordsDoNotMatch');
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
      // Call registration API
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // Registration successful
      setIsSuccess(true);

      // Auto-login after successful registration
      setTimeout(async () => {
        const result = await signIn('client-credentials', {
          redirect: false,
          email: formData.email.trim(),
          password: formData.password,
        });

        if (result?.url) {
          router.push('/account');
        } else {
          router.push('/login');
        }
      }, 2000);

    } catch (error) {
      console.error('Registration error:', error);
      setErrorState({
        message: error instanceof Error ? error.message : t('auth.register.errors.unexpectedError'),
        details: t('auth.register.errors.tryAgainLater')
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Show success state
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center shadow-lg">
          <CardHeader>
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <IconCheck className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-700">{t('auth.register.success.title')}</CardTitle>
            <CardDescription>{t('auth.register.success.message')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center">
              <IconLoader2 className="h-5 w-5 animate-spin mr-2" />
              {t('auth.register.success.redirecting')}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">{t('auth.register.welcome')}</h1>
          <p className="text-muted-foreground">{t('auth.register.subtitle')}</p>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <IconUserPlus className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">{t('auth.register.title')}</CardTitle>
            <CardDescription>
              {t('auth.register.createAccount')}
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
              {/* Name Field */}
              <div className="space-y-2">
                <Label htmlFor="name">{t('auth.register.fields.name')}</Label>
                <div className="relative">
                  <IconUser className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    placeholder={t('auth.register.placeholders.name')}
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    disabled={isLoading}
                    className={cn(
                      'pl-10',
                      formErrors.name && 'border-destructive focus-visible:ring-destructive'
                    )}
                    autoComplete="name"
                  />
                </div>
                {formErrors.name && (
                  <p className="text-sm text-destructive">{formErrors.name}</p>
                )}
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email">{t('auth.register.fields.email')}</Label>
                <div className="relative">
                  <IconMail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder={t('auth.register.placeholders.email')}
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    disabled={isLoading}
                    className={cn(
                      'pl-10',
                      formErrors.email && 'border-destructive focus-visible:ring-destructive'
                    )}
                    autoComplete="email"
                  />
                </div>
                {formErrors.email && (
                  <p className="text-sm text-destructive">{formErrors.email}</p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password">{t('auth.register.fields.password')}</Label>
                <div className="relative">
                  <IconLock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder={t('auth.register.placeholders.password')}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    disabled={isLoading}
                    className={cn(
                      'pl-10 pr-10',
                      formErrors.password && 'border-destructive focus-visible:ring-destructive'
                    )}
                    autoComplete="new-password"
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

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{t('auth.register.fields.confirmPassword')}</Label>
                <div className="relative">
                  <IconLock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder={t('auth.register.placeholders.confirmPassword')}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    disabled={isLoading}
                    className={cn(
                      'pl-10 pr-10',
                      formErrors.confirmPassword && 'border-destructive focus-visible:ring-destructive'
                    )}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <IconEyeOff className="h-4 w-4" />
                    ) : (
                      <IconEye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {formErrors.confirmPassword && (
                  <p className="text-sm text-destructive">{formErrors.confirmPassword}</p>
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
                    {t('auth.register.creating')}
                  </>
                ) : (
                  t('auth.register.createAccount')
                )}
              </Button>
            </form>
          </CardContent>

          <div className="p-6 pt-0">
            <div className="text-center text-sm text-muted-foreground">
              {t('auth.register.hasAccount')}{' '}
              <Link
                href="/login"
                className="text-primary hover:underline font-medium"
              >
                {t('auth.register.signIn')}
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
