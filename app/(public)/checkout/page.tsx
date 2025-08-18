"use client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Loader2,
  CheckCircle2,
  Package,
  Truck,
  CheckCircle,
  Clock,
} from "lucide-react";
import {
  TypographyH1,
  TypographyP,
  TypographyH2,
  TypographyH3,
} from "@/components/ui/typography";
import StepIndicator from "@/components/common/StepIndicator";
import { useCart, CartItem } from "@/context/CartContext";
import { Skeleton } from "@/components/ui/skeleton";
import EmptyState from "@/components/common/EmptyState";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { COUNTRIES, getCitiesByCountry, DEFAULT_CITY } from "@/lib/locations";

const steps = ["Information", "Confirmation"];

// Form validation schema
const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }), // contactName
  phone: z.string().min(6, { message: "Please enter a valid phone number" }), // contactPhone
  email: z.string().email({ message: "Please enter a valid email" }).optional().or(z.literal('')), // optional email
  address: z.string().min(5, { message: "Please enter a valid address" }), // shippingLine1
  country: z.string().min(2, { message: "Please select a country" }), // shippingCountry
  city: z.string().min(1, { message: "Please select a city" }), // shippingCity
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function CheckoutPage() {
  const [step, setStep] = useState(1); // 1: Information, 2: Confirmation
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { cart, clearCart } = useCart?.() || { cart: [], clearCart: () => {} };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '+212',
      address: '',
      country: 'MA', // Default to Morocco
      city: '',
      notes: '',
    },
  });

  // Watch country and city values
  const selectedCountry = form.watch("country") || 'MA';
  const selectedCity = form.watch("city") || '';
  
  // Get cities for the selected country
  const cities = getCitiesByCountry(selectedCountry);
  
  // Update city field when country changes
  const handleCountryChange = (value: string) => {
    form.setValue('country', value);
    form.setValue('city', ''); // Reset city when country changes
  };

  // Calculate totals
  const subtotal = cart.reduce(
    (sum: number, item: CartItem) => sum + Number(item.price) * item.quantity,
    0
  );
  
  // Get shipping price for selected city
  const selectedCityData = cities.find(city => city.name === selectedCity);
  const shipping = cart.length > 0 ? (selectedCityData?.shippingPrice || 0) : 0;
  const total = subtotal + shipping;

  const onSubmit = async (data: FormValues) => {
    // Define toastId at the function scope
    let loadingToastId: string | number | undefined;

    try {
      setIsSubmitting(true);

      // Show loading toast
      // Get country name from code
      const countryName = COUNTRIES.find(c => c.code === data.country)?.name || 'Morocco';
      
      // Prepare order data
      const orderData = {
        customer: {
          name: data.name,
          email: data.email || '',
          phone: data.phone,
          // Include full address with city and country
          address: `${data.address}, ${data.city}, ${countryName}`,
          // Include city and country separately for the API
          city: data.city ? `${data.city}, ${countryName}` : '',
          country: countryName,
          zipCode: '', // not collected in form, so default to empty string
          notes: data.notes || '',
        },
        items: cart.map((item) => ({
          productId: typeof item.id === 'number' ? item.id : Number(item.id),
          variantId: item.variantId 
            ? (typeof item.variantId === 'number' ? item.variantId : Number(item.variantId))
            : undefined,
          quantity: item.quantity,
          price: parseFloat(item.price.toString()),
        })),
        subtotal,
        shipping,
        total,
        paymentMethod: 'cod', // or set from a form field if you support more methods
      };

      // Log the payload we're about to send
      console.log('Sending order data:', orderData);

      const response = await fetch("/api/public/order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create order");
      }

      // Show success message
      toast.success("Order received! We'll contact you shortly to confirm.", {
        id: loadingToastId,
        duration: 5000,
      });

      // Move to confirmation step
      setStep(2);

      // Clear cart after successful order
      clearCart();

      // Format order details for WhatsApp
      const orderItems = cart.map(item => 
        `- ${item.quantity}x ${item.name}${item.variantId ? ` (${item.variantId})` : ''} - ${Number(item.price).toFixed(2)} MAD`
      ).join('\n');
      
      const orderTotal = (subtotal + shipping).toFixed(2);
      
      // Format internal team notification
      const messageBody = `📦 *NEW ORDER #${result.orderId}*\n` +
        `⏰ ${new Date().toLocaleString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}\n\n` +
        `👤 *CUSTOMER*\n` +
        `${data.name} | ${data.phone}\n` +
        `${data.address}, ${orderData.customer.city}\n\n` +
        `🛒 *ITEMS (${cart.reduce((sum, item) => sum + item.quantity, 0)})*\n` +
        `${cart.map(item => `• ${item.quantity}x ${item.name} (${Number(item.price).toFixed(2)} MAD)`).join('\n')}\n\n` +
        `💰 *TOTAL: ${orderTotal} MAD*\n` +
        `   Subtotal: ${subtotal.toFixed(2)} MAD\n` +
        `   Shipping: ${shipping.toFixed(2)} MAD\n\n` +
        (data.notes ? `📝 *NOTES*\n${data.notes}\n\n` : '') +
        `✅ *ACTION REQUIRED*\n` +
        `1. Confirm order with customer\n` +
        `2. Prepare items for shipping\n` +
        `3. Update order status in system`;

      // Send order notification via WhatsApp API
      try {
        const response = await fetch('/api/public/whatsapp', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: 'whatsapp:+212697353770',  // Your WhatsApp number in E.164 format with 'whatsapp:' prefix
            body: messageBody
          })
        });
        
        if (!response.ok) {
          const error = await response.json();
          console.error('Failed to send WhatsApp notification:', error);
        }
      } catch (error) {
        console.error('Error sending WhatsApp notification:', error);
      }
      
      // Show success message
      toast.success('Order received! We will contact you shortly.', {
        duration: 5000,
      });
    } catch (error) {
      console.error("Error submitting order:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to place order. Please try again.",
        {
          id: loadingToastId,
          duration: 5000,
        }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cart === undefined) {
    return (
      <div className="max-w-4xl mx-auto py-10 px-4">
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  if (cart.length === 0 && step === 1) {
    return (
      <div className="max-w-4xl mx-auto py-10 px-4">
        <EmptyState message="Your cart is empty." />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6 sm:py-10 px-4">
      {/* Stepper UI */}
      <div className="mb-8">
        <StepIndicator steps={steps} current={step} />
      </div>

      {step === 1 ? (
        <div className="grid gap-8 lg:grid-cols-[1fr_0.8fr] h-fit">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">
                    Delivery Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Your full name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="your@email.com"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                                +212
                              </span>
                              <Input
                                className="pl-14"
                                placeholder="612345678"
                                {...field}
                                onChange={(e) => {
                                  // Only allow numbers and limit to 9 digits after +212
                                  const value = e.target.value
                                    .replace(/\D/g, "")
                                    .slice(0, 9);
                                  field.onChange(`+212${value}`);
                                }}
                                value={field.value?.replace("+212", "") || ""}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Country</FormLabel>
                          <Select
                            onValueChange={(value) => {
                              handleCountryChange(value);
                              field.onChange(value);
                            }}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select your country" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {COUNTRIES.map((country) => (
                                <SelectItem key={country.code} value={country.code}>
                                  {country.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                            disabled={!selectedCountry}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={
                                  selectedCountry 
                                    ? "Select your city" 
                                    : "Please select a country first"
                                } />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {cities.map((city) => (
                                <SelectItem key={city.name} value={city.name}>
                                  {city.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Full Address</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Street, Building, Apartment"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Order Notes (Optional)</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Special instructions for delivery"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-6">
                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending Order...
                      </>
                    ) : (
                      <>
                        <Package className="mr-2 h-4 w-4" />
                        Send Order
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </Form>

          {/* Order Summary */}
          <Card className="h-full flex flex-col w-full max-w-md">
            <CardHeader className="pb-4 border-b">
              <CardTitle className="text-lg">Order Summary</CardTitle>
            </CardHeader>
            
            <CardContent className="flex-1 p-0">
              {cart === undefined ? (
                <div className="p-6">
                  <Skeleton className="h-24 w-full rounded" />
                </div>
              ) : cart.length === 0 ? (
                <div className="p-6 text-center">
                  <TypographyP className="text-muted-foreground">
                    No items in cart.
                  </TypographyP>
                </div>
              ) : (
                <div className="divide-y">
                  <div className="p-6 space-y-6">
                    {cart.map((item: CartItem) => (
                      <div
                        key={`${item.id}-${item.variantId}`}
                        className="flex justify-between items-start gap-8"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{item.name}</p>
                          {item.variantId && (
                            <p className="text-sm text-muted-foreground">
                              Variant: {item.variantId}
                            </p>
                          )}
                          <p className="text-sm text-muted-foreground">
                            Qty: {item.quantity}
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          <span className="font-medium whitespace-nowrap">
                            {(Number(item.price) * item.quantity).toFixed(2)} MAD
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
            
            <CardFooter className="flex flex-col gap-4 pt-4 border-t">
              <div className="w-full space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">
                    {subtotal.toFixed(2)} MAD
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {selectedCity 
                      ? `Shipping to ${selectedCity}` 
                      : 'Select a city to calculate shipping'}
                  </span>
                  <span className="font-medium">
                    {shipping > 0 ? `${shipping.toFixed(2)} MAD` : '—'}
                  </span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between text-base font-medium">
                  <span>Total</span>
                  <span className="whitespace-nowrap">
                    {total.toFixed(2)} MAD
                  </span>
                </div>
              </div>
            </CardFooter>
          </Card>
        </div>
      ) : (
        // Confirmation Step
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <CardTitle>Order Confirmed!</CardTitle>
            <TypographyP className="text-muted-foreground">
              We've received your order and will contact you shortly to confirm
              the details.
            </TypographyP>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Status:</span>
                <span className="text-yellow-600 font-medium">
                  Pending Confirmation
                </span>
              </div>
              <div className="pl-6 text-sm text-muted-foreground">
                Our team will call you within 24 hours to confirm your order and
                delivery details.
              </div>
            </div>

            <div className="space-y-4">
              <TypographyH3 className="text-lg">What's Next?</TypographyH3>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-100">
                    <Package className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">Order Confirmation</h4>
                    <p className="text-sm text-muted-foreground">
                      Our team will verify your order details and contact you.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-100">
                    <Truck className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">Shipping</h4>
                    <p className="text-sm text-muted-foreground">
                      Once confirmed, we'll prepare and ship your order.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Link href="/products" className="w-full">
              <Button
                variant="outline"
                className="w-full"
              >
                <Package className="mr-2 h-4 w-4" />
                Continue Shopping
              </Button>
            </Link>
            <p className="text-sm text-muted-foreground text-center">
              Need help? Contact us at support@sheinauriva.com
            </p>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}