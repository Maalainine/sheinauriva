'use client';

import { useEffect, useState } from "react";
import { useTranslations } from "@/hooks/useTranslations";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  IconMapPin,
  IconPlus,
  IconEdit,
  IconTrash,
  IconCheck,
  IconAlertCircle,
  IconLoader2,
  IconHome,
  IconBuilding
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";

interface Address {
  id: number;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

interface FormErrors {
  address1?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export default function AddressesPage() {
  const { t } = useTranslations();

  // State
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [form, setForm] = useState({
    address1: '',
    address2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Morocco',
    isDefault: false,
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  // Operations state
  const [deletingIds, setDeletingIds] = useState<Set<number>>(new Set());
  const [settingDefaultIds, setSettingDefaultIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const response = await fetch('/api/account/addresses');
      if (!response.ok) {
        throw new Error('Failed to fetch addresses');
      }
      const data = await response.json();
      setAddresses(data);
    } catch (error) {
      console.error('Failed to fetch addresses:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    const errors: FormErrors = {};
    let isValid = true;

    if (!form.address1.trim()) {
      errors.address1 = t('account.addresses.validation.address1Required');
      isValid = false;
    }

    if (!form.city.trim()) {
      errors.city = t('account.addresses.validation.cityRequired');
      isValid = false;
    }

    if (!form.state.trim()) {
      errors.state = t('account.addresses.validation.stateRequired');
      isValid = false;
    }

    if (!form.postalCode.trim()) {
      errors.postalCode = t('account.addresses.validation.postalCodeRequired');
      isValid = false;
    }

    if (!form.country.trim()) {
      errors.country = t('account.addresses.validation.countryRequired');
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const resetForm = () => {
    setForm({
      address1: '',
      address2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'Morocco',
      isDefault: false,
    });
    setFormErrors({});
    setEditingAddress(null);
  };

  const openAddDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEditDialog = (address: Address) => {
    setForm({
      address1: address.address1,
      address2: address.address2 || '',
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
      isDefault: address.isDefault,
    });
    setEditingAddress(address);
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const url = editingAddress
        ? `/api/account/addresses/${editingAddress.id}`
        : '/api/account/addresses';

      const method = editingAddress ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address1: form.address1.trim(),
          address2: form.address2.trim() || null,
          city: form.city.trim(),
          state: form.state.trim(),
          postalCode: form.postalCode.trim(),
          country: form.country.trim(),
          isDefault: form.isDefault,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to save address');
      }

      setDialogOpen(false);
      resetForm();
      await fetchAddresses();

    } catch (error) {
      console.error('Address save error:', error);
      setError(error instanceof Error ? error.message : 'Failed to save address');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (addressId: number) => {
    if (!confirm(t('account.addresses.deleteConfirm'))) {
      return;
    }

    setDeletingIds(prev => new Set(prev).add(addressId));

    try {
      const response = await fetch(`/api/account/addresses/${addressId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete address');
      }

      await fetchAddresses();

    } catch (error) {
      console.error('Address delete error:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete address');
    } finally {
      setDeletingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(addressId);
        return newSet;
      });
    }
  };

  const handleSetDefault = async (addressId: number) => {
    setSettingDefaultIds(prev => new Set(prev).add(addressId));

    try {
      const response = await fetch(`/api/account/addresses/${addressId}/default`, {
        method: 'PUT',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to set default address');
      }

      await fetchAddresses();

    } catch (error) {
      console.error('Set default address error:', error);
      setError(error instanceof Error ? error.message : 'Failed to set default address');
    } finally {
      setSettingDefaultIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(addressId);
        return newSet;
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-48 mb-2"></div>
          <div className="h-4 bg-muted rounded w-64"></div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                  <div className="h-8 bg-muted rounded w-full"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {t("account.addresses.title")}
          </h1>
          <p className="text-muted-foreground">
            {t("account.addresses.subtitle")}
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAddDialog}>
              <IconPlus className="h-4 w-4 mr-2" />
              {t("account.addresses.addNew")}
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-lg">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>
                  {editingAddress
                    ? t("account.addresses.editAddress")
                    : t("account.addresses.addNew")
                  }
                </DialogTitle>
                <DialogDescription>
                  {t("account.addresses.fillDetails")}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="address1">{t("account.addresses.address1")}</Label>
                  <Input
                    id="address1"
                    value={form.address1}
                    onChange={(e) => {
                      setForm(prev => ({ ...prev, address1: e.target.value }));
                      if (formErrors.address1) {
                        setFormErrors(prev => ({ ...prev, address1: undefined }));
                      }
                    }}
                    className={cn(formErrors.address1 && 'border-destructive')}
                    disabled={isSubmitting}
                    placeholder={t("account.addresses.address1Placeholder")}
                  />
                  {formErrors.address1 && (
                    <p className="text-sm text-destructive">{formErrors.address1}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address2">{t("account.addresses.address2")}</Label>
                  <Input
                    id="address2"
                    value={form.address2}
                    onChange={(e) => setForm(prev => ({ ...prev, address2: e.target.value }))}
                    disabled={isSubmitting}
                    placeholder={t("account.addresses.address2Placeholder")}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">{t("account.addresses.city")}</Label>
                    <Input
                      id="city"
                      value={form.city}
                      onChange={(e) => {
                        setForm(prev => ({ ...prev, city: e.target.value }));
                        if (formErrors.city) {
                          setFormErrors(prev => ({ ...prev, city: undefined }));
                        }
                      }}
                      className={cn(formErrors.city && 'border-destructive')}
                      disabled={isSubmitting}
                    />
                    {formErrors.city && (
                      <p className="text-sm text-destructive">{formErrors.city}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state">{t("account.addresses.state")}</Label>
                    <Input
                      id="state"
                      value={form.state}
                      onChange={(e) => {
                        setForm(prev => ({ ...prev, state: e.target.value }));
                        if (formErrors.state) {
                          setFormErrors(prev => ({ ...prev, state: undefined }));
                        }
                      }}
                      className={cn(formErrors.state && 'border-destructive')}
                      disabled={isSubmitting}
                    />
                    {formErrors.state && (
                      <p className="text-sm text-destructive">{formErrors.state}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">{t("account.addresses.postalCode")}</Label>
                    <Input
                      id="postalCode"
                      value={form.postalCode}
                      onChange={(e) => {
                        setForm(prev => ({ ...prev, postalCode: e.target.value }));
                        if (formErrors.postalCode) {
                          setFormErrors(prev => ({ ...prev, postalCode: undefined }));
                        }
                      }}
                      className={cn(formErrors.postalCode && 'border-destructive')}
                      disabled={isSubmitting}
                    />
                    {formErrors.postalCode && (
                      <p className="text-sm text-destructive">{formErrors.postalCode}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="country">{t("account.addresses.country")}</Label>
                    <Input
                      id="country"
                      value={form.country}
                      onChange={(e) => {
                        setForm(prev => ({ ...prev, country: e.target.value }));
                        if (formErrors.country) {
                          setFormErrors(prev => ({ ...prev, country: undefined }));
                        }
                      }}
                      className={cn(formErrors.country && 'border-destructive')}
                      disabled={isSubmitting}
                    />
                    {formErrors.country && (
                      <p className="text-sm text-destructive">{formErrors.country}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isDefault"
                    checked={form.isDefault}
                    onCheckedChange={(checked) =>
                      setForm(prev => ({ ...prev, isDefault: checked as boolean }))
                    }
                    disabled={isSubmitting}
                  />
                  <Label htmlFor="isDefault" className="text-sm font-normal">
                    {t("account.addresses.setAsDefault")}
                  </Label>
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                  disabled={isSubmitting}
                >
                  {t("common.cancel")}
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <IconLoader2 className="h-4 w-4 mr-2 animate-spin" />
                      {editingAddress ? t("common.updating") : t("common.saving")}
                    </>
                  ) : (
                    editingAddress ? t("common.update") : t("common.save")
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <Alert variant="destructive">
          <IconAlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Addresses Grid */}
      {addresses.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <IconMapPin className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">{t("account.addresses.noAddresses")}</h3>
            <p className="text-muted-foreground mb-6">{t("account.addresses.noAddressesDesc")}</p>
            <Button onClick={openAddDialog}>
              <IconPlus className="h-4 w-4 mr-2" />
              {t("account.addresses.addFirst")}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {addresses.map((address) => (
            <Card key={address.id} className="relative">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <IconHome className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <CardTitle className="text-lg">
                        {t("account.addresses.address")} #{address.id}
                      </CardTitle>
                      {address.isDefault && (
                        <Badge variant="default" className="mt-1">
                          {t("account.addresses.default")}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(address)}
                    >
                      <IconEdit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(address.id)}
                      disabled={deletingIds.has(address.id)}
                    >
                      {deletingIds.has(address.id) ? (
                        <IconLoader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <IconTrash className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-2">
                <div className="text-sm">
                  <div className="font-medium">{address.address1}</div>
                  {address.address2 && (
                    <div className="text-muted-foreground">{address.address2}</div>
                  )}
                  <div className="text-muted-foreground">
                    {address.city}, {address.state} {address.postalCode}
                  </div>
                  <div className="text-muted-foreground">{address.country}</div>
                </div>

                {!address.isDefault && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSetDefault(address.id)}
                    disabled={settingDefaultIds.has(address.id)}
                    className="w-full mt-4"
                  >
                    {settingDefaultIds.has(address.id) ? (
                      <>
                        <IconLoader2 className="h-4 w-4 mr-2 animate-spin" />
                        {t("common.updating")}
                      </>
                    ) : (
                      <>
                        <IconCheck className="h-4 w-4 mr-2" />
                        {t("account.addresses.makeDefault")}
                      </>
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
