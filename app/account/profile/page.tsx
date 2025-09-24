'use client';

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "@/hooks/useTranslations";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  IconUser,
  IconMail,
  IconLock,
  IconCheck,
  IconAlertCircle,
  IconLoader2,
  IconEye,
  IconEyeOff
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";

interface ProfileData {
  name: string;
  email: string;
  totalSpent: number;
  ordersCount: number;
  lastLogin?: string;
  createdAt: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const { t } = useTranslations();

  // Profile data
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Profile form
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
  });
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Password form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Errors
  const [profileErrors, setProfileErrors] = useState<FormErrors>({});
  const [passwordErrors, setPasswordErrors] = useState<FormErrors>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/account/profile');
        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }
        const data = await response.json();
        setProfile(data);
        setProfileForm({
          name: data.name || '',
          email: data.email || '',
        });
      } catch (error) {
        console.error('Failed to fetch profile:', error);
        setError(error instanceof Error ? error.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };

    if (session?.user) {
      fetchProfile();
    }
  }, [session]);

  const validateProfileForm = () => {
    const errors: FormErrors = {};
    let isValid = true;

    if (!profileForm.name.trim()) {
      errors.name = t('auth.register.validation.nameRequired');
      isValid = false;
    } else if (profileForm.name.trim().length < 2) {
      errors.name = t('auth.register.validation.nameMinLength');
      isValid = false;
    }

    if (!profileForm.email.trim()) {
      errors.email = t('auth.register.validation.emailRequired');
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileForm.email)) {
      errors.email = t('auth.register.validation.emailInvalid');
      isValid = false;
    }

    setProfileErrors(errors);
    return isValid;
  };

  const validatePasswordForm = () => {
    const errors: FormErrors = {};
    let isValid = true;

    if (!passwordForm.currentPassword) {
      errors.currentPassword = t('account.profile.validation.currentPasswordRequired');
      isValid = false;
    }

    if (!passwordForm.newPassword) {
      errors.newPassword = t('auth.register.validation.passwordRequired');
      isValid = false;
    } else if (passwordForm.newPassword.length < 8) {
      errors.newPassword = t('auth.register.validation.passwordMinLength');
      isValid = false;
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(passwordForm.newPassword)) {
      errors.newPassword = t('auth.register.validation.passwordStrength');
      isValid = false;
    }

    if (!passwordForm.confirmPassword) {
      errors.confirmPassword = t('auth.register.validation.confirmPasswordRequired');
      isValid = false;
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = t('auth.register.validation.passwordsDoNotMatch');
      isValid = false;
    }

    setPasswordErrors(errors);
    return isValid;
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateProfileForm()) {
      return;
    }

    setIsUpdatingProfile(true);
    setProfileSuccess(false);
    setError(null);

    try {
      const response = await fetch('/api/account/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: profileForm.name.trim(),
          email: profileForm.email.trim(),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to update profile');
      }

      // Update the session with new data
      await update({
        name: profileForm.name.trim(),
        email: profileForm.email.trim(),
      });

      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 5000);

    } catch (error) {
      console.error('Profile update error:', error);
      setError(error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePasswordForm()) {
      return;
    }

    setIsUpdatingPassword(true);
    setPasswordSuccess(false);
    setError(null);

    try {
      const response = await fetch('/api/account/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to change password');
      }

      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setPasswordSuccess(true);
      setTimeout(() => setPasswordSuccess(false), 5000);

    } catch (error) {
      console.error('Password change error:', error);
      setError(error instanceof Error ? error.message : 'Failed to change password');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-48 mb-2"></div>
          <div className="h-4 bg-muted rounded w-64"></div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-muted rounded w-32"></div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="h-4 bg-muted rounded w-full"></div>
              <div className="h-10 bg-muted rounded w-full"></div>
              <div className="h-10 bg-muted rounded w-full"></div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          {t("account.profile.title")}
        </h1>
        <p className="text-muted-foreground">
          {t("account.profile.subtitle")}
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <IconAlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Profile Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconUser className="h-5 w-5" />
              {t("account.profile.personalInfo")}
            </CardTitle>
            <CardDescription>
              {t("account.profile.personalInfoDesc")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {profileSuccess && (
              <Alert className="mb-4">
                <IconCheck className="h-4 w-4" />
                <AlertDescription>{t("account.profile.updateSuccess")}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t("auth.register.fields.name")}</Label>
                <Input
                  id="name"
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => {
                    setProfileForm(prev => ({ ...prev, name: e.target.value }));
                    if (profileErrors.name) {
                      setProfileErrors(prev => ({ ...prev, name: undefined }));
                    }
                  }}
                  className={cn(profileErrors.name && 'border-destructive')}
                  disabled={isUpdatingProfile}
                />
                {profileErrors.name && (
                  <p className="text-sm text-destructive">{profileErrors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">{t("auth.register.fields.email")}</Label>
                <Input
                  id="email"
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => {
                    setProfileForm(prev => ({ ...prev, email: e.target.value }));
                    if (profileErrors.email) {
                      setProfileErrors(prev => ({ ...prev, email: undefined }));
                    }
                  }}
                  className={cn(profileErrors.email && 'border-destructive')}
                  disabled={isUpdatingProfile}
                />
                {profileErrors.email && (
                  <p className="text-sm text-destructive">{profileErrors.email}</p>
                )}
              </div>

              <Button type="submit" disabled={isUpdatingProfile} className="w-full">
                {isUpdatingProfile ? (
                  <>
                    <IconLoader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t("account.profile.updating")}
                  </>
                ) : (
                  t("account.profile.updateProfile")
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Account Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>{t("account.profile.accountStats")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("account.dashboard.stats.totalOrders")}</span>
              <span className="font-medium">{profile?.ordersCount || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("account.dashboard.stats.totalSpent")}</span>
              <span className="font-medium">{profile?.totalSpent || 0} MAD</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("account.profile.memberSince")}</span>
              <span className="font-medium">
                {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : '-'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("account.profile.lastLogin")}</span>
              <span className="font-medium">
                {profile?.lastLogin ? new Date(profile.lastLogin).toLocaleDateString() : '-'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Password Change */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconLock className="h-5 w-5" />
            {t("account.profile.changePassword")}
          </CardTitle>
          <CardDescription>
            {t("account.profile.changePasswordDesc")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {passwordSuccess && (
            <Alert className="mb-4">
              <IconCheck className="h-4 w-4" />
              <AlertDescription>{t("account.profile.passwordChangeSuccess")}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">{t("account.profile.currentPassword")}</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showPasswords.current ? 'text' : 'password'}
                    value={passwordForm.currentPassword}
                    onChange={(e) => {
                      setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }));
                      if (passwordErrors.currentPassword) {
                        setPasswordErrors(prev => ({ ...prev, currentPassword: undefined }));
                      }
                    }}
                    className={cn(passwordErrors.currentPassword && 'border-destructive')}
                    disabled={isUpdatingPassword}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                  >
                    {showPasswords.current ? (
                      <IconEyeOff className="h-4 w-4" />
                    ) : (
                      <IconEye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {passwordErrors.currentPassword && (
                  <p className="text-sm text-destructive">{passwordErrors.currentPassword}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">{t("account.profile.newPassword")}</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPasswords.new ? 'text' : 'password'}
                    value={passwordForm.newPassword}
                    onChange={(e) => {
                      setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }));
                      if (passwordErrors.newPassword) {
                        setPasswordErrors(prev => ({ ...prev, newPassword: undefined }));
                      }
                    }}
                    className={cn(passwordErrors.newPassword && 'border-destructive')}
                    disabled={isUpdatingPassword}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                  >
                    {showPasswords.new ? (
                      <IconEyeOff className="h-4 w-4" />
                    ) : (
                      <IconEye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {passwordErrors.newPassword && (
                  <p className="text-sm text-destructive">{passwordErrors.newPassword}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{t("auth.register.fields.confirmPassword")}</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showPasswords.confirm ? 'text' : 'password'}
                    value={passwordForm.confirmPassword}
                    onChange={(e) => {
                      setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }));
                      if (passwordErrors.confirmPassword) {
                        setPasswordErrors(prev => ({ ...prev, confirmPassword: undefined }));
                      }
                    }}
                    className={cn(passwordErrors.confirmPassword && 'border-destructive')}
                    disabled={isUpdatingPassword}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                  >
                    {showPasswords.confirm ? (
                      <IconEyeOff className="h-4 w-4" />
                    ) : (
                      <IconEye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {passwordErrors.confirmPassword && (
                  <p className="text-sm text-destructive">{passwordErrors.confirmPassword}</p>
                )}
              </div>
            </div>

            <Button type="submit" disabled={isUpdatingPassword}>
              {isUpdatingPassword ? (
                <>
                  <IconLoader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t("account.profile.changingPassword")}
                </>
              ) : (
                t("account.profile.changePassword")
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
