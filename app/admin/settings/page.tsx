"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  IconSettings,
  IconDeviceFloppy,
  IconRefresh,
  IconAlertTriangle,
  IconCheck,
  IconMail,
  IconTruck,
  IconCurrencyDollar,
  IconShield,
} from "@tabler/icons-react";

// Types
interface SiteSettings {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  supportEmail: string;
  currency: string;
  taxRate: number;
  freeShippingThreshold: number;
  defaultShippingCost: number;
  enableNotifications: boolean;
  enableEmailNotifications: boolean;
  enableOrderTracking: boolean;
  maintenanceMode: boolean;
  enableGuestCheckout: boolean;
  maxOrderItems: number;
  orderExpirationDays: number;
}

interface NotificationSettings {
  adminNewOrder: boolean;
  adminLowStock: boolean;
  adminOrderStatusChange: boolean;
  customerOrderConfirmation: boolean;
  customerOrderStatusUpdate: boolean;
  customerShippingUpdate: boolean;
}

const defaultSettings: SiteSettings = {
  siteName: "JustOriginale Store",
  siteDescription: "Premium fashion and lifestyle products",
  contactEmail: "contact@JustOriginale.com",
  supportEmail: "support@JustOriginale.com",
  currency: "MAD",
  taxRate: 20,
  freeShippingThreshold: 500,
  defaultShippingCost: 30,
  enableNotifications: true,
  enableEmailNotifications: true,
  enableOrderTracking: true,
  maintenanceMode: false,
  enableGuestCheckout: true,
  maxOrderItems: 50,
  orderExpirationDays: 30,
};

const defaultNotifications: NotificationSettings = {
  adminNewOrder: true,
  adminLowStock: true,
  adminOrderStatusChange: false,
  customerOrderConfirmation: true,
  customerOrderStatusUpdate: true,
  customerShippingUpdate: true,
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [notifications, setNotifications] =
    useState<NotificationSettings>(defaultNotifications);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Load settings on component mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError(null);

      // In a real implementation, you would fetch from an API
      // For now, we'll use localStorage or default values
      const savedSettings = localStorage.getItem("adminSettings");
      const savedNotifications = localStorage.getItem("adminNotifications");

      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }

      if (savedNotifications) {
        setNotifications(JSON.parse(savedNotifications));
      }
    } catch (err) {
      setError("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      // In a real implementation, you would save to an API
      // For now, we'll use localStorage
      localStorage.setItem("adminSettings", JSON.stringify(settings));
      localStorage.setItem("adminNotifications", JSON.stringify(notifications));

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setSuccess("Settings saved successfully!");

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <IconSettings className="h-8 w-8" />
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <IconSettings className="h-8 w-8" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground">
              Manage your store configuration and preferences
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadSettings} disabled={loading}>
            <IconRefresh className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={saveSettings} disabled={saving}>
            {saving ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <IconDeviceFloppy className="mr-2 h-4 w-4" />
            )}
            Save Changes
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <Alert variant="destructive">
          <IconAlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <IconCheck className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconSettings className="h-5 w-5" />
              General Settings
            </CardTitle>
            <CardDescription>
              Basic site configuration and information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="siteName">Site Name</Label>
              <Input
                id="siteName"
                value={settings.siteName}
                onChange={(e) =>
                  setSettings({ ...settings, siteName: e.target.value })
                }
                placeholder="Your store name"
              />
            </div>

            <div>
              <Label htmlFor="siteDescription">Site Description</Label>
              <Textarea
                id="siteDescription"
                value={settings.siteDescription}
                onChange={(e) =>
                  setSettings({ ...settings, siteDescription: e.target.value })
                }
                placeholder="Describe your store"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="contactEmail">Contact Email</Label>
              <Input
                id="contactEmail"
                type="email"
                value={settings.contactEmail}
                onChange={(e) =>
                  setSettings({ ...settings, contactEmail: e.target.value })
                }
                placeholder="contact@yourstore.com"
              />
            </div>

            <div>
              <Label htmlFor="supportEmail">Support Email</Label>
              <Input
                id="supportEmail"
                type="email"
                value={settings.supportEmail}
                onChange={(e) =>
                  setSettings({ ...settings, supportEmail: e.target.value })
                }
                placeholder="support@yourstore.com"
              />
            </div>
          </CardContent>
        </Card>

        {/* Commerce Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconCurrencyDollar className="h-5 w-5" />
              Commerce Settings
            </CardTitle>
            <CardDescription>
              Pricing, shipping, and order configuration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="currency">Currency</Label>
              <Select
                value={settings.currency}
                onValueChange={(value) =>
                  setSettings({ ...settings, currency: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MAD">MAD - Moroccan Dirham</SelectItem>
                  <SelectItem value="USD">USD - US Dollar</SelectItem>
                  <SelectItem value="EUR">EUR - Euro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="taxRate">Tax Rate (%)</Label>
              <Input
                id="taxRate"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={settings.taxRate}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    taxRate: parseFloat(e.target.value) || 0,
                  })
                }
              />
            </div>

            <div>
              <Label htmlFor="freeShippingThreshold">
                Free Shipping Threshold
              </Label>
              <Input
                id="freeShippingThreshold"
                type="number"
                min="0"
                step="10"
                value={settings.freeShippingThreshold}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    freeShippingThreshold: parseFloat(e.target.value) || 0,
                  })
                }
              />
            </div>

            <div>
              <Label htmlFor="defaultShippingCost">Default Shipping Cost</Label>
              <Input
                id="defaultShippingCost"
                type="number"
                min="0"
                step="1"
                value={settings.defaultShippingCost}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    defaultShippingCost: parseFloat(e.target.value) || 0,
                  })
                }
              />
            </div>

            <div>
              <Label htmlFor="maxOrderItems">Max Items Per Order</Label>
              <Input
                id="maxOrderItems"
                type="number"
                min="1"
                max="1000"
                value={settings.maxOrderItems}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    maxOrderItems: parseInt(e.target.value) || 1,
                  })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Feature Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconShield className="h-5 w-5" />
              Feature Settings
            </CardTitle>
            <CardDescription>Enable or disable store features</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="enableNotifications">
                  Enable Notifications
                </Label>
                <p className="text-sm text-muted-foreground">
                  Allow system notifications
                </p>
              </div>
              <Switch
                id="enableNotifications"
                checked={settings.enableNotifications}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, enableNotifications: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="enableEmailNotifications">
                  Email Notifications
                </Label>
                <p className="text-sm text-muted-foreground">
                  Send email notifications to users
                </p>
              </div>
              <Switch
                id="enableEmailNotifications"
                checked={settings.enableEmailNotifications}
                onCheckedChange={(checked) =>
                  setSettings({
                    ...settings,
                    enableEmailNotifications: checked,
                  })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="enableOrderTracking">Order Tracking</Label>
                <p className="text-sm text-muted-foreground">
                  Enable order tracking functionality
                </p>
              </div>
              <Switch
                id="enableOrderTracking"
                checked={settings.enableOrderTracking}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, enableOrderTracking: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="enableGuestCheckout">Guest Checkout</Label>
                <p className="text-sm text-muted-foreground">
                  Allow non-registered users to place orders
                </p>
              </div>
              <Switch
                id="enableGuestCheckout"
                checked={settings.enableGuestCheckout}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, enableGuestCheckout: checked })
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Temporarily disable the public store
                </p>
              </div>
              <Switch
                id="maintenanceMode"
                checked={settings.maintenanceMode}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, maintenanceMode: checked })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconMail className="h-5 w-5" />
              Notification Preferences
            </CardTitle>
            <CardDescription>
              Configure when and how to receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-3">Admin Notifications</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>New Order Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when new orders are placed
                    </p>
                  </div>
                  <Switch
                    checked={notifications.adminNewOrder}
                    onCheckedChange={(checked) =>
                      setNotifications({
                        ...notifications,
                        adminNewOrder: checked,
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Low Stock Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when products are running low
                    </p>
                  </div>
                  <Switch
                    checked={notifications.adminLowStock}
                    onCheckedChange={(checked) =>
                      setNotifications({
                        ...notifications,
                        adminLowStock: checked,
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Order Status Changes</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when order statuses change
                    </p>
                  </div>
                  <Switch
                    checked={notifications.adminOrderStatusChange}
                    onCheckedChange={(checked) =>
                      setNotifications({
                        ...notifications,
                        adminOrderStatusChange: checked,
                      })
                    }
                  />
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="font-medium mb-3">Customer Notifications</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Order Confirmation</Label>
                    <p className="text-sm text-muted-foreground">
                      Send confirmation emails to customers
                    </p>
                  </div>
                  <Switch
                    checked={notifications.customerOrderConfirmation}
                    onCheckedChange={(checked) =>
                      setNotifications({
                        ...notifications,
                        customerOrderConfirmation: checked,
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Status Updates</Label>
                    <p className="text-sm text-muted-foreground">
                      Send emails when order status changes
                    </p>
                  </div>
                  <Switch
                    checked={notifications.customerOrderStatusUpdate}
                    onCheckedChange={(checked) =>
                      setNotifications({
                        ...notifications,
                        customerOrderStatusUpdate: checked,
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Shipping Updates</Label>
                    <p className="text-sm text-muted-foreground">
                      Send tracking information to customers
                    </p>
                  </div>
                  <Switch
                    checked={notifications.customerShippingUpdate}
                    onCheckedChange={(checked) =>
                      setNotifications({
                        ...notifications,
                        customerShippingUpdate: checked,
                      })
                    }
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
